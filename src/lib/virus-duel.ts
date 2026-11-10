/** Deterministic, self-contained choreography for the serialized canvas engine. */
export function sampleVirusDuel(elapsed: number, width: number, height: number, seed: number, timing?: { haul: number; solo: number; delivery: number }) {
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
  const random = (salt: number) => {
    let n = Math.imul(seed ^ salt * 97, 0x45d9f3b);
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  const variant = seed % 3;
  const winner = random(1) < .5 ? 0 : 1;
  const size = width < 700 ? 96 : 132;
  const floor = height - (width < 700 ? 65 : 82);
  const actual = Math.max(0, elapsed);
  const haulDuration = timing?.haul ?? 2550;
  const soloDuration = timing?.solo ?? 5000;
  const deliveryDuration = timing?.delivery ?? 1900;
  const hospitalAt = 650 + haulDuration;
  const soloAt = hospitalAt + 4150;
  const deliveryAt = soloAt + soloDuration;
  const exitAt = deliveryAt + deliveryDuration;
  const clock = actual < 650 ? actual : actual < hospitalAt ? 650 + (actual - 650) / haulDuration * 2550
    : actual < soloAt ? 3200 + actual - hospitalAt
    : actual < deliveryAt ? 7350 + (actual - soloAt) / soloDuration * 5000
    : actual < exitAt ? 12350 + (actual - deliveryAt) / deliveryDuration * 1900
    : 14250 + actual - exitAt;
  // Reuse the articulated poses while giving the journey its own pacing:
  // approach USM, hold the card, duel, haul to Contact, deliver, then leave.
  const t = clock < 650 ? clock : clock < 3200 ? 650 + (clock - 650) / 3
    : clock < 5000 ? 1499 : clock < 7350 ? clock - 3500
    : clock < 12350 ? 3850 + (clock - 7350) * 1950 / 5000
    : clock < 14250 ? 5800 : 5800 + clock - 14250;
  const enter = ease(t / 650);
  const grab = ease((t - 650) / 850);
  const fight = clamp((t - 1500) / 1600);
  const defeat = ease((t - 3100) / 750);
  const solo = clamp((t - 3850) / 1950);
  const exit = ease((t - 5800) / 700);
  const count = 2 + variant;
  const work = solo * count;
  const stroke = Math.min(count - 1, Math.floor(work));
  const cycle = Math.min(1, work - stroke);
  const duty = .58 + random(4) * .16;
  const soloProgress = (stroke + ease(cycle / duty)) / count;
  // Legs and claws keep working at a natural cadence on a long page.
  const poseCycle = timing ? Math.max(0, actual - soloAt) / (1200 + variant * 240) % 1 : cycle;
  const heave = ease(poseCycle / duty);
  const recovery = ease((poseCycle - .75) / .25);
  const haul = clamp((clock - 650) / 2550);
  const haulWork = haul * 3;
  const haulStroke = Math.min(2, Math.floor(haulWork));
  const haulProgress = (haulStroke + ease((haulWork - haulStroke) / .76)) / 3;
  const leg = clock < 7350 ? 0 : clock < 12350 ? 1 : 2;
  const fraction = leg === 0 ? .8 * haul + .2 * haulProgress : leg === 1 ? .9 * solo + .1 * soloProgress : ease((clock - 12350) / 1900);
  const progress = (leg + fraction) / 3;
  const phase = clock < 650 ? "enter" : clock < 3200 ? "haul" : clock < 5000 ? "hospital" : clock < 6600 ? "fight" : clock < 7350 ? "defeat" : clock < 12350 ? "solo" : clock < 14250 ? "delivery" : clock < 14950 ? "exit" : "done";
  const clashes = 3 + (variant === 1 ? 1 : 0);
  const beat = fight * clashes;
  const strike = Math.pow(Math.max(0, Math.sin((beat % 1) * Math.PI)), 3);
  const center = width * (.44 + random(2) * .12);
  const actors = [0, 1].map(index => {
    const side = index ? 1 : -1;
    const wins = index === winner;
    const home = width * (index ? .76 : .24);
    let x = home + side * (1 - enter) * width * .45;
    let y = floor - grab * (15 + random(index + 10) * 16);
    let angle = Math.PI / 2;
    let opacity = Math.min(1, t / 140);
    let scale = 1;
    let grip = t >= 650 ? 1 : 0;
    let travel = enter * 150 + grab * 95;
    if (phase === "haul") {
      travel += haul * 420;
      y -= Math.sin((haulWork % 1) * Math.PI) * 18;
    } else if (phase === "hospital") travel += Math.sin(clock / 260) * 3;
    if (t >= 1500 && t < 3100) {
      const approach = ease(fight / .23);
      const flank = variant === 2 ? Math.sin(fight * Math.PI * 3 + index * Math.PI) * 22 : 0;
      const contact = center + side * (size * (.58 - strike * .4) + flank);
      x = home + (contact - home) * approach;
      y = floor - 15 - Math.sin(fight * Math.PI) * (variant === 1 ? 28 : 9) - strike * (wins ? 16 : -8);
      angle = (index ? Math.PI : 0) + Math.sin(beat * Math.PI * 2 + index) * .26;
      travel += fight * (460 + variant * 100);
      grip = .28 * (1 - strike);
    } else if (t >= 3100 && t < 3850) {
      x = center + side * (size * .4 + defeat * (wins ? -size * .2 : size * .8));
      y = floor - 14 + (wins ? -Math.sin(defeat * Math.PI) * 24 : defeat * 22);
      angle = wins ? (index ? Math.PI : 0) * (1 - defeat) + Math.PI / 2 * defeat : side * defeat * 2.8;
      opacity *= wins ? 1 : 1 - ease(defeat / .75);
      scale = wins ? 1 : 1 - defeat * .55;
      travel += 500 + defeat * (wins ? 90 : 30);
      grip = wins ? defeat : 0;
    } else if (t >= 3850) {
      const settle = ease((t - 3850) / 350);
      const stride = heave - recovery;
      const sweep = variant === 0 ? Math.sin(solo * Math.PI * 2) * width * .08 : variant === 1 ? (solo - .5) * width * .34 : Math.sin(solo * Math.PI * 3) * width * .12;
      x = center + side * size * .2 * (1 - settle) + sweep * settle + side * exit * (width * .65 + size);
      y = floor - 15 - stride * (variant === 2 ? 48 : 30);
      angle = Math.PI / 2 + (variant === 1 ? -.35 : .16) * Math.sin(poseCycle * Math.PI * 2);
      opacity *= wins ? 1 - exit : 0;
      travel += 600 + solo * (variant === 1 ? 700 : 450) + exit * 160;
      if (timing) travel += Math.max(0, Math.min(actual, deliveryAt) - soloAt) * .06;
      grip = wins ? (1 - recovery * .9) * (1 - exit) : 0;
      if (phase === "delivery" || phase === "exit" || phase === "done") {
        const delivery = ease((clock - 12350) / 1900);
        x = center + (width * (variant === 1 ? .25 : .75) - center) * delivery;
        y = floor - 15 + exit * 85;
        scale *= 1 - exit * .65;
        travel += delivery * 150;
        grip = wins ? (1 - delivery * .6) * (1 - exit) : 0;
      }
    }
    return { x, y, angle, opacity, size: size * scale, travel, grip, anchorX: x, anchorY: height - 15, wins };
  });
  return { phase, progress: clamp(progress), leg, fraction, actors, winner, variant, impact: phase === "fight" ? strike : 0, defeat, center, floor, done: clock >= 14950 };
}
