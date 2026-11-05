type Joint = readonly [number, number];

/** Two-bone inverse kinematics: keep textured joints connected to a stepping foot. */
export function virusLimbPose(hip: Joint, knee: Joint, toe: Joint, phase: number, stride: number) {
  const upper = Math.hypot(knee[0] - hip[0], knee[1] - hip[1]);
  const lower = Math.hypot(toe[0] - knee[0], toe[1] - knee[1]);
  const cycle = ((phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  // Returning feet reach forward; planted feet push backward as the body
  // advances. Linear stance speed reduces skating across the page.
  const footX = toe[0] + (cycle < Math.PI ? -1 + 2 * cycle / Math.PI : 1 - 2 * (cycle - Math.PI) / Math.PI) * stride;
  // Only the returning foot lifts; the other half of the cycle stays planted.
  const footY = toe[1] - Math.max(0, Math.sin(cycle)) * stride * 1.1;
  const dx = footX - hip[0], dy = footY - hip[1];
  const distance = Math.max(Math.abs(upper - lower) + .01, Math.min(upper + lower - .01, Math.hypot(dx, dy)));
  const cross = (knee[0] - hip[0]) * (toe[1] - hip[1]) - (knee[1] - hip[1]) * (toe[0] - hip[0]);
  const direction = Math.atan2(dy, dx);
  const bend = Math.acos(Math.max(-1, Math.min(1, (upper * upper + distance * distance - lower * lower) / (2 * upper * distance))));
  const upperAngle = direction - (cross >= 0 ? 1 : -1) * bend;
  const kneeX = hip[0] + Math.cos(upperAngle) * upper;
  const kneeY = hip[1] + Math.sin(upperAngle) * upper;
  const solvedFootX = hip[0] + Math.cos(direction) * distance;
  const solvedFootY = hip[1] + Math.sin(direction) * distance;
  const lowerAngle = Math.atan2(solvedFootY - kneeY, solvedFootX - kneeX);
  const upperTurn = upperAngle - Math.atan2(knee[1] - hip[1], knee[0] - hip[0]);
  return {
    upperTurn,
    lowerTurn: lowerAngle - Math.atan2(toe[1] - knee[1], toe[0] - knee[0]) - upperTurn,
    knee: [kneeX, kneeY], foot: [solvedFootX, solvedFootY],
  };
}

/** Self-contained for the pre-hydration engine; source art is skinned into a shared pose atlas. */
export function createVirusPainter(image: HTMLImageElement, solveLimb: typeof virusLimbPose) {
  const frames = 24, frameWidth = 160, frameHeight = 96;
  const atlas = document.createElement("canvas");
  atlas.width = frames * frameWidth;
  atlas.height = frameHeight;
  const ink = atlas.getContext("2d");
  if (!ink) throw new Error("Creature canvas unavailable");
  type Limb = { hip: Joint; knee: Joint; toe: Joint; upper: Joint[]; lower: Joint[]; phase: number; stride: number; mirror?: boolean };
  const legs: Limb[] = [
    { hip: [109,56], knee: [71,35], toe: [3,107], phase: 0, stride: 13,
      upper: [[105,63],[115,50],[81,29],[67,27],[60,37],[65,47]],
      lower: [[72,30],[80,38],[54,63],[26,87],[5,110],[-2,109],[7,91],[20,80],[37,53],[62,32]] },
    { hip: [224,67], knee: [259,39], toe: [319,107], phase: Math.PI, stride: 13,
      upper: [[218,65],[225,73],[250,53],[260,48],[267,38],[262,29],[249,30],[230,55]],
      lower: [[256,31],[270,35],[289,52],[306,79],[323,107],[319,112],[310,105],[295,88],[286,67],[264,51],[253,45]] },
    { hip: [110,77], knee: [74,67], toe: [24,141], phase: Math.PI, stride: 15,
      upper: [[106,84],[115,73],[80,60],[69,60],[62,71],[76,80]],
      lower: [[68,62],[81,65],[79,77],[62,97],[36,123],[27,145],[20,145],[23,129],[30,115],[43,87],[60,66]] },
    { hip: [227,83], knee: [260,64], toe: [292,120], phase: 0, stride: 13,
      upper: [[220,82],[228,91],[253,77],[264,72],[268,62],[261,55],[252,55]],
      lower: [[256,57],[267,62],[281,83],[291,103],[297,122],[290,125],[282,111],[276,94],[263,77],[253,68]] },
    { hip: [129,78], knee: [113,54], toe: [73,117], phase: .3, stride: 12,
      upper: [[121,87],[135,74],[119,50],[110,48],[100,55],[101,64]],
      lower: [[108,50],[122,52],[119,64],[94,89],[81,106],[76,122],[66,121],[68,107],[74,93],[86,68],[102,53]] },
    // The far inner leg uses the same articulated texture, reflected behind the shell.
    { hip: [129,78], knee: [113,54], toe: [73,117], phase: Math.PI + .3, stride: 12, mirror: true,
      upper: [[121,87],[135,74],[119,50],[110,48],[100,55],[101,64]],
      lower: [[108,50],[122,52],[119,64],[94,89],[81,106],[76,122],[66,121],[68,107],[74,93],[86,68],[102,53]] },
  ];
  const claws: Limb[] = [
    { hip: [148,81], knee: [110,103], toe: [164,146], phase: .5, stride: 11,
      upper: [[151,73],[157,84],[124,106],[114,112],[102,104],[102,95],[136,74]],
      lower: [[110,100],[124,103],[126,114],[150,121],[166,139],[172,153],[157,151],[145,135],[126,135],[113,124],[103,112]] },
    { hip: [237,95], knee: [265,109], toe: [246,143], phase: Math.PI + .5, stride: 10,
      upper: [[235,88],[247,94],[264,100],[274,110],[268,119],[257,114],[252,108],[233,102]],
      lower: [[260,106],[273,111],[277,123],[267,139],[252,149],[241,148],[244,138],[252,124],[257,113]] },
  ];
  const shell: Joint[] = [[94,27],[126,20],[120,12],[108,10],[123,9],[143,17],[130,0],[154,6],[172,23],[185,30],[183,22],[203,35],[218,48],[228,76],[230,92],[219,111],[201,103],[179,99],[151,86],[128,78],[104,61],[108,40]];

  function piece(points: Joint[]) {
    ink!.save();
    ink!.beginPath();
    points.forEach(([x, y], index) => index ? ink!.lineTo(x, y) : ink!.moveTo(x, y));
    ink!.closePath(); ink!.clip();
    ink!.drawImage(image, 0, 0, 320, 150);
    ink!.restore();
  }
  function pivot(point: Joint, turn: number) {
    ink!.translate(point[0], point[1]); ink!.rotate(turn); ink!.translate(-point[0], -point[1]);
  }
  function limb(leg: Limb, phase: number) {
    const pose = solveLimb(leg.hip, leg.knee, leg.toe, phase + leg.phase, leg.stride * 1.65);
    ink!.save();
    if (leg.mirror) { ink!.translate(330, 0); ink!.scale(-1, 1); }
    pivot(leg.hip, pose.upperTurn);
    piece(leg.upper);
    pivot(leg.knee, pose.lowerTurn);
    piece(leg.lower);
    ink!.restore();
  }
  for (let frame = 0; frame < frames; frame++) {
    const phase = frame / frames * Math.PI * 2;
    ink.save();
    // Clip each cached pose: a swinging foot cannot bleed into its neighbour.
    ink.beginPath(); ink.rect(frame * frameWidth, 0, frameWidth, frameHeight); ink.clip();
    ink.translate(frame * frameWidth, 0);
    ink.scale(frameWidth / 352, frameHeight / 211.2);
    ink.translate(16, 30 + Math.sin(phase * 2) * 3.5);
    for (const leg of legs) limb(leg, phase);
    piece(shell);
    for (const claw of claws) limb(claw, phase);
    // Small jaw contractions are independent of the larger stepping gait.
    ink.save(); pivot([197,103], Math.sin(phase) * .13);
    piece([[187,94],[201,101],[207,114],[216,129],[208,130],[197,117],[187,106]]); ink.restore();
    ink.save(); pivot([225,104], -Math.sin(phase + .4) * .13);
    piece([[220,100],[233,102],[232,116],[222,132],[217,131],[223,116]]); ink.restore();
    ink.restore();
  }
  return {
    frames,
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, travelled: number, seed: number, opacity: number) {
      const frame = Math.floor(((travelled / (size * .3) + seed * .173) % 1) * frames);
      const width = size * 1.1, height = width * frameHeight / frameWidth;
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle - .35);
      ctx.globalAlpha = opacity;
      ctx.drawImage(atlas, frame * frameWidth, 0, frameWidth, frameHeight, -width / 2, -height / 2, width, height);
      ctx.restore();
    },
  };
}
