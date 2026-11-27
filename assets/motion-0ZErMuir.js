import{j as C,r as h}from"./index-DBoHUy9F.js";function q(r){return r==="udhyogapay"||r==="vaakmitra"||r==="skylark"?r:"life-os"}function P({model:r,tone:o="dark",reverse:s=!1}){return C.jsx("span",{className:"scroll-field","data-model":r,"data-tone":o,"data-reverse":s,"aria-hidden":"true",style:{"--still":`url("/miniatures/${r}.webp")`,"--turn":`url("/miniatures/${r}-turn.webp")`},children:C.jsx("span",{className:"model-turntable"})})}function B(){h.useEffect(()=>{const r=document.getElementById("root");if(!r)return;const o=matchMedia("(prefers-reduced-motion: reduce)"),s=new Set,i=new Set,u=new Map;let c=0,p=!1;function m(t){const n=t.dataset.model;if(o.matches||t.dataset.loaded===n)return;let e=u.get(n);if(!e){const d=new Image;d.src="/miniatures/"+n+"-turn.webp",e=d.decode(),u.set(n,e)}e.then(()=>{p||!t.isConnected||n!==t.dataset.model||(t.dataset.loaded=n,a())}).catch(()=>{u.delete(n)})}function w(){c=0;const t=document.documentElement.clientHeight,n=Array.from(s,e=>{const d=e.querySelector(".model-turntable"),x=e.closest(".screen-rail"),g=(x||d).getBoundingClientRect(),M=x?-g.top/Math.max(1,g.height-t):(t-g.top)/(t+g.height),E=o.matches?.5:Math.min(1,Math.max(0,M));return{field:e,index:Math.round((e.dataset.reverse==="true"?1-E:E)*41)}});for(const{field:e,index:d}of n)e.dataset.frame!==String(d)&&(e.dataset.frame=String(d),e.style.setProperty("--frame-x",d%7*100/6+"%"),e.style.setProperty("--frame-y",Math.floor(d/7)*20+"%"))}function a(){!c&&!document.hidden&&(c=requestAnimationFrame(w))}const f=new IntersectionObserver(t=>{for(const n of t){const e=n.target.parentElement;n.isIntersecting?(s.add(e),m(e)):s.delete(e)}a()},{rootMargin:"180px 0px"});function v(){for(const t of i)t.isConnected||(f.unobserve(t.firstElementChild),i.delete(t),s.delete(t));for(const t of r.querySelectorAll(".scroll-field"))i.has(t)||(i.add(t),f.observe(t.firstElementChild));a()}const y=new MutationObserver(t=>{for(const n of t)if(n.type==="attributes"){const e=n.target;delete e.dataset.loaded,s.has(e)&&m(e)}t.some(n=>[...n.addedNodes,...n.removedNodes].some(e=>e instanceof Element&&(e.matches(".scroll-field")||e.querySelector(".scroll-field"))))&&v()});v(),y.observe(r,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-model"]});function k(){o.matches||a()}function b(){s.forEach(m),a()}return window.addEventListener("scroll",k,{passive:!0}),window.addEventListener("resize",a),o.addEventListener("change",b),document.addEventListener("visibilitychange",a),()=>{p=!0,cancelAnimationFrame(c),f.disconnect(),y.disconnect(),o.removeEventListener("change",b),window.removeEventListener("scroll",k),window.removeEventListener("resize",a),document.removeEventListener("visibilitychange",a)}},[])}/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),L=(...r)=>r.filter((o,s,i)=>!!o&&o.trim()!==""&&i.indexOf(o)===s).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var R={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=h.forwardRef(({color:r="currentColor",size:o=24,strokeWidth:s=2,absoluteStrokeWidth:i,className:u="",children:c,iconNode:p,...m},w)=>h.createElement("svg",{ref:w,...R,width:o,height:o,stroke:r,strokeWidth:i?Number(s)*24/Number(o):s,className:L("lucide",u),...m},[...p.map(([a,f])=>h.createElement(a,f)),...Array.isArray(c)?c:[c]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=(r,o)=>{const s=h.forwardRef(({className:i,...u},c)=>h.createElement(S,{ref:c,iconNode:o,className:L(`lucide-${A(r)}`,i),...u}));return s.displayName=`${r}`,s};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=l("ArrowDown",[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=l("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=l("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=l("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F=l("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=l("Pause",[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=l("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=l("RotateCcw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);export{$ as A,z as C,D as P,U as R,P as S,I as a,O as b,l as c,F as d,N as e,q as p,B as u};
