export const EFFECTS_STORAGE_KEY = "gab-portfolio-effects";
export const EFFECTS_CHANGE_EVENT = "portfolio:effects-change";

export function effectsAllowed(preference: string | null | undefined, reduced: boolean) {
  return preference === "on" || (preference !== "off" && !reduced);
}

export function getEffectsEnabled() {
  return effectsAllowed(document.documentElement.dataset.effects, matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function setEffectsEnabled(enabled: boolean) {
  const value = enabled ? "on" : "off";
  document.documentElement.dataset.effectsPreference = value;
  document.documentElement.dataset.effects = value;
  try { localStorage.setItem(EFFECTS_STORAGE_KEY, value); } catch { /* The current document still remembers the choice. */ }
  // An explicit preview link should not override a later choice in the control.
  const url = new URL(location.href);
  if (url.searchParams.has("effects")) {
    url.searchParams.delete("effects");
    history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }
  window.dispatchEvent(new Event(EFFECTS_CHANGE_EVENT));
}

// The explicit on/off preview link opts in only this site and browser. Other
// visitors continue to follow their system preference until they choose.
export const effectsBootstrap = `(function(){try{var r=document.documentElement,m=matchMedia('(prefers-reduced-motion: reduce)'),p;try{p=localStorage.getItem('${EFFECTS_STORAGE_KEY}')}catch(e){}var q=new URLSearchParams(location.search).get('effects');if(q==='on'||q==='off'){p=q;try{localStorage.setItem('${EFFECTS_STORAGE_KEY}',p)}catch(e){}}r.dataset.effectsPreference=p==='on'||p==='off'?p:'system';var apply=function(){var v=r.dataset.effectsPreference;r.dataset.effects=v==='on'||(v!=='off'&&!m.matches)?'on':'off'};apply();m.addEventListener('change',function(){apply();dispatchEvent(new Event('${EFFECTS_CHANGE_EVENT}'))});addEventListener('storage',function(e){if(e.key!=='${EFFECTS_STORAGE_KEY}'&&e.key!==null)return;r.dataset.effectsPreference=e.newValue==='on'||e.newValue==='off'?e.newValue:'system';apply();dispatchEvent(new Event('${EFFECTS_CHANGE_EVENT}'))})}catch(e){}})()`;
