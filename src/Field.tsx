import {useEffect,useRef} from 'react'
export default function Field(){
 const ref=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{const c=ref.current!,ctx=c.getContext('2d');if(!ctx)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)'),tau=Math.PI*2
 // A bundle of filaments follows a closed trefoil; connected samples keep each signal path continuous.
 const curves=Array.from({length:76},(_,j)=>{const a=j/76*tau;return Array.from({length:172},(_,i)=>{const t=i/171*tau,r=1.04+.36*Math.cos(3*t)+.145*Math.cos(a+4*t);return [r*Math.cos(2*t),r*Math.sin(2*t),.56*Math.sin(3*t)+.145*Math.sin(a+4*t)]})})
 let frame=0,visible=true,time=0,last=0,px=0,py=0,w=0,h=0
 function resize(){const d=Math.min(devicePixelRatio,1.65);w=c.clientWidth;h=c.clientHeight;c.width=w*d;c.height=h*d;ctx!.setTransform(d,0,0,d,0,0);draw(0)}
 function draw(stamp:number){if(!ctx)return;if(stamp&&stamp-last<48&&!reduced.matches){frame=requestAnimationFrame(draw);return}
 if(stamp&&visible&&!reduced.matches)time+=Math.min((stamp-last)/1000,.08);last=stamp
 ctx.clearRect(0,0,w,h);const scale=Math.min(w*.285,h*.292),a=-.72+.12*Math.sin(time*.23)+px*.10,tilt=.76+py*.06
 const project=([x,y,z]:number[])=>{const u=x*Math.cos(a)-y*Math.sin(a),v=x*Math.sin(a)+y*Math.cos(a),depth=v*Math.sin(tilt)+z*Math.cos(tilt),s=scale*(1+depth*.075);return [w*.5+(u*.94+(v*Math.cos(tilt)-z*Math.sin(tilt))*.30)*s,h*.52+(-u*.30+(v*Math.cos(tilt)-z*Math.sin(tilt))*.94)*s,depth]}
 const projected=curves.map(curve=>curve.map(project))
 for(const front of [false,true]){for(let j=0;j<projected.length;j++){const row=projected[j];for(let i=1;i<row.length;i++){const [x,y,z]=row[i];if((z>0)!==front)continue;const shine=(Math.sin(i/171*tau*2.0+j*.036+time*.38)+1)*.5,light=Math.min(1,Math.max(0,(z+1.2)*.36+shine*.22));ctx.strokeStyle='hsla('+Math.round(219-light*14)+',95%,'+(27+light*59)+'%,'+(.28+light*.55)+')';ctx.lineWidth=.68+light*.46;ctx.beginPath();ctx.moveTo(row[i-1][0],row[i-1][1]);ctx.lineTo(x,y);ctx.stroke()}}}
 for(let j=0;j<7;j++){const row=projected[j*10],pos=row[Math.floor((time*9+j*23)%171)];ctx.fillStyle=j%3?'#d9eaff':'#fdb680';ctx.beginPath();ctx.arc(pos[0],pos[1],1.8,0,tau);ctx.fill()}
 if(stamp&&visible&&!reduced.matches)frame=requestAnimationFrame(draw)}
 function start(){cancelAnimationFrame(frame);if(visible&&!reduced.matches)frame=requestAnimationFrame(draw);else draw(0)}
 const obs=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start()});obs.observe(c)
 const ro=new ResizeObserver(resize);ro.observe(c);function move(e:PointerEvent){const r=c.getBoundingClientRect();px=(e.clientX-r.left)/w-.5;py=(e.clientY-r.top)/h-.5}c.addEventListener('pointermove',move);reduced.addEventListener('change',start)
 return()=>{obs.disconnect();ro.disconnect();cancelAnimationFrame(frame);c.removeEventListener('pointermove',move);reduced.removeEventListener('change',start)}
 },[])
 return <figure className="field"><div className="field-head"><span>FIG. 01</span><span>Signal topology</span></div><div className="cross c1">+</div><div className="cross c2">+</div><canvas ref={ref} aria-label="Blue filaments carry signals around an interwoven three-dimensional loop"/><figcaption><i/> Continuous signal paths</figcaption></figure>
}
