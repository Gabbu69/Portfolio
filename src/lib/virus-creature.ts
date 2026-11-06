type Joint = readonly [number, number];

/** Two-bone inverse kinematics: keep limb joints connected to a stepping foot. */
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

/** Cached articulated ASCII poses; no raster sprite or image request. */
export function createVirusPainter(solveLimb: typeof virusLimbPose) {
  const frames=24, frameWidth=160, frameHeight=96;
  const atlas=document.createElement("canvas");
  atlas.width=frames*frameWidth; atlas.height=frameHeight;
  const ink=atlas.getContext("2d");
  if(!ink) throw new Error("ASCII canvas unavailable");
  const legs: {hip:Joint;knee:Joint;toe:Joint;phase:number}[]=[
    {hip:[147,64],knee:[105,24],toe:[64,14],phase:0},
    {hip:[160,64],knee:[160,14],toe:[200,5],phase:Math.PI},
    {hip:[178,65],knee:[220,24],toe:[259,16],phase:.3},
    {hip:[147,86],knee:[105,126],toe:[64,139],phase:Math.PI},
    {hip:[160,86],knee:[160,139],toe:[200,146],phase:0},
    {hip:[178,85],knee:[220,126],toe:[259,138],phase:Math.PI+.3},
  ];
  function glyph(char:string,x:number,y:number,color:string) {
    ink!.strokeStyle="#071b16"; ink!.lineWidth=1.5;
    ink!.fillStyle=color; ink!.strokeText(char,x,y); ink!.fillText(char,x,y);
  }
  function bone(a:readonly number[],b:readonly number[],color:string) {
    const distance=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const steps=Math.max(2,Math.ceil(distance/12));
    const dx=b[0]-a[0],dy=b[1]-a[1];
    const char=Math.abs(dx)>Math.abs(dy)*1.8?"-":Math.abs(dy)>Math.abs(dx)*1.8?"|":dx*dy>0?"\\":"/";
    for(let i=1;i<steps;i++)glyph(char,a[0]+dx*i/steps,a[1]+dy*i/steps,color);
  }
  for(let frame=0;frame<frames;frame++) {
    const phase=frame/frames*Math.PI*2;
    ink.save(); ink.beginPath();ink.rect(frame*frameWidth,0,frameWidth,frameHeight);ink.clip();
    ink.translate(frame*frameWidth,0);ink.scale(frameWidth/352,frameHeight/211.2);ink.translate(16,30);
    ink.font="bold 15px monospace";ink.textAlign="center";ink.textBaseline="middle";
    for(const leg of legs) {
      const pose=solveLimb(leg.hip,leg.knee,leg.toe,phase+leg.phase,22);
      bone(leg.hip,pose.knee,"#62e8d4");bone(pose.knee,pose.foot,"#93ff62");
      glyph("+",pose.knee[0],pose.knee[1],"#dbffb5");
      glyph("*",pose.foot[0],pose.foot[1],"#c2a6ff");
    }
    // Breathing shell, feelers, eyes and opening claws are all characters.
    const bob=Math.sin(phase*2)*2.5;
    const rows=[".:::.:","<%#@#%>","':::'"];
    rows.forEach((row,index)=>{
      [...row].forEach((char,column)=>glyph(char,160+(column-(row.length-1)/2)*10,62+index*13+bob,index===1?"#93ff62":"#62e8d4"));
    });
    glyph("[",203,70+bob,"#dbffb5");glyph(":",215,75+bob,"#ffffff");glyph("]",227,75+bob,"#93ff62");
    for(const side of [-1,1]) {
      const opening=18+Math.sin(phase+side)*7;
      const root:[number,number]=[217,75+side*10];
      const tip:[number,number]=[249+Math.cos(phase)*4,75+side*opening];
      bone(root,tip,"#93ff62");glyph(side<0?">":"<",tip[0],tip[1],"#dbffb5");
      bone([203,75+side*6],[230,75+side*(34+Math.sin(phase)*5)],"#62e8d4");
    }
    ink.restore();
  }
  return {frames,draw(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,angle:number,travelled:number,seed:number,opacity:number){
    const frame=Math.floor(((travelled/(size*.3)+seed*.173)%1)*frames);
    const width=size*1.1,height=width*frameHeight/frameWidth;
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=opacity;
    ctx.drawImage(atlas,frame*frameWidth,0,frameWidth,frameHeight,-width/2,-height/2,width,height);
    ctx.restore();
  }};
}
