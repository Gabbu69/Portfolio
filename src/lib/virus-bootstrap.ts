import { clamp, createChoreography, sampleVirusCrawl, INTRO_LIMIT, REVEAL_SESSION_KEY } from "./virus-animation";
import { installVirusRuntime } from "./virus-runtime";
import { createVirusPainter, virusLimbPose } from "./virus-creature";

// tsx preserves function names with __name; the identity helper also keeps the
// serialized engine independent of that development-only transpiler closure.
export const virusRuntimeScript = `(function(){const __name=(fn)=>fn;(${installVirusRuntime.toString()})(${createChoreography.toString()},${clamp.toString()},${sampleVirusCrawl.toString()},(image)=>(${createVirusPainter.toString()})(image,${virusLimbPose.toString()}),${JSON.stringify({ INTRO_LIMIT, REVEAL_SESSION_KEY })})})()`;

// Runs before paint, just like the theme bootstrap. Both CSS and a timer expire
// the cover independently: hydration and the image are never required to exit.
export const virusBootstrap = `(function(){try{
var r=document.documentElement,n=performance.getEntriesByType('navigation')[0],reload=n&&n.type==='reload',p=location.pathname,allowed=r.dataset.effects?r.dataset.effects==='on':!matchMedia('(prefers-reduced-motion: reduce)').matches;
if((p!=='/'&&!(reload&&p.indexOf('/projects/')===0))||(!reload&&(location.hash||scrollY>0))||(n&&n.type==='back_forward')||document.hidden||!allowed)return;
r.dataset.virusStart=String(performance.now());r.dataset.virusIntro='pending';
var clear=function(){delete r.dataset.virusIntro;delete r.dataset.virusStart};
setTimeout(clear,${INTRO_LIMIT});
addEventListener('keydown',function(e){if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','PageDown','PageUp','Home','End',' '].indexOf(e.key)!==-1)return;clear()});
addEventListener('pagehide',clear,{once:true});
addEventListener('pageshow',function(e){if(e.persisted)clear()},{once:true});
}catch(e){}})()`;
