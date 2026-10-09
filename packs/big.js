/* WE NEED A BIGGER SHIP: five elite stages (planets 10 to 14) that only the big ships from the Shipyard can fly.
   One shared kit builds every stage: sprite kits for the enemy art, a capital ship engine for the mini bosses and bosses,
   and a bullet pattern library. Each stage is a theme: palette, backdrop, five enemies, a mini boss, a boss and a wave script.
   10 TITAN GRAVEYARD   11 LEVIATHAN NEBULA   12 THE DYSON FORGE   13 EVENT HORIZON   14 THE ARMADA */
(function(){
'use strict';
const PI=Math.PI,TAU=PI*2;
const K='#000000',NV='#1c1840',VI='#352879',BL='#6c5eb5',PU='#6f3d86',LP='#8a5aa6',LV='#cc99ff',mg='#cc44cc',MG='#ff77ff',
  rd='#9a3a3a',BR='#68372b',TN='#9a6759',OR='#ff9966',YG='#b8c76f',YL='#ffffaa',GR='#588d43',GD='#2c5a2c',LG='#9ad284',PG='#ccff99',
  cy='#70a4b2',CY='#9ad2e0',D='#444444',GM='#6c6c6c',LM='#959595',LL='#bbbbbb',WH='#ffffff',RD='#ff7777';

/* ---------- helpers ---------- */
const px=(g,col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x|0,y|0,w||1,h||1)};
const cnv=(w,h,fn)=>{const c=mk(w,h),g=c.getContext('2d');g.imageSmoothingEnabled=false;fn(g,c);return c};
const mod=(a,n)=>((a%n)+n)%n;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function rng(seed){let s=(seed>>>0)||1;return()=>(s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff}
function mkNoise(seed){
  const H=(x,y)=>{let h=(x*374761393+y*668265263+seed*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return(((h^(h>>>16))>>>0)%100000)/100000};
  const S=t=>t*t*(3-2*t);
  const vn=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=S(x-ix),fy=S(y-iy),a=H(ix,iy),b=H(ix+1,iy),c=H(ix,iy+1),d=H(ix+1,iy+1);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy};
  const fbm=(x,y,o)=>{o=o||3;let v=0,a=.5,f=1,t=0;for(let i=0;i<o;i++){v+=vn(x*f,y*f)*a;t+=a;a*=.5;f*=2}return v/t};
  return{vn,fbm};
}
const rampAt=(r,v,i,j)=>{v=clamp(v,0,.999);const t=v*(r.length-1),k=Math.min(r.length-2,Math.floor(t)),f=t-k;return f>BAYER[j&3][i&3]/16?r[k+1]:r[k]};
/* a shaded ellipsoid lit from the upper left, dithered between the ramp colours (dark to light) */
function ell(g,cx,cy,rx,ry,ramp){
  const n=ramp.length;
  for(let j=Math.floor(cy-ry-1);j<=Math.ceil(cy+ry+1);j++)for(let i=Math.floor(cx-rx-1);i<=Math.ceil(cx+rx+1);i++){
    const nx=(i+.5-cx)/rx,ny=(j+.5-cy)/ry,d=nx*nx+ny*ny;if(d>1)continue;
    const nz=Math.sqrt(1-d),l=-.5*nx-.55*ny+.7*nz,t=Math.max(0,Math.min(.999,(l+.15)/1.05))*(n-1),k=Math.floor(t),f=t-k;
    px(g,ramp[f>BAYER[j&3][i&3]/16&&k<n-1?k+1:k],i,j)}
}
function inPoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const xi=P[i][0],yi=P[i][1],xj=P[j][0],yj=P[j][1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
/* a polygon shaded top (light) to bottom (dark), dithered */
function poly(g,pts,ramp,flip){
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
  for(let j=Math.floor(y0);j<=Math.ceil(y1);j++)for(let i=Math.floor(x0);i<=Math.ceil(x1);i++){
    if(!inPoly(pts,i+.5,j+.5))continue;
    let v=1-(j-y0)/(y1-y0+1)*.85-(i-x0)/(x1-x0+1)*.15;if(flip)v=1-v;
    px(g,rampAt(ramp,v,i,j),i,j)}
}
function lineF(x0,y0,x1,y1,fn){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(let n=0;n<400;n++){fn(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function line(g,col,x0,y0,x1,y1){g.fillStyle=col;lineF(x0,y0,x1,y1,(x,y)=>g.fillRect(x,y,1,1))}
function thick(g,col,x0,y0,x1,y1,th){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);g.fillStyle=col;for(let i=0;i<=n;i++)g.fillRect(Math.round(x0+(x1-x0)*i/n-th/2),Math.round(y0+(y1-y0)*i/n-th/2),th,th)}
function outline(c,col){
  const w=c.width,h=c.height,o=mk(w+2,h+2),g=o.getContext('2d'),d=c.getContext('2d').getImageData(0,0,w,h).data;
  const op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>40;
  g.fillStyle=col||K;
  for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){if(op(x,y))continue;if(op(x-1,y)||op(x+1,y)||op(x,y-1)||op(x,y+1))g.fillRect(x+1,y+1,1,1)}
  g.drawImage(c,1,1);return o;
}
const fin=c=>outline(polish(c),K);
const darken=(c,k)=>{const o=mk(c.width,c.height),g=o.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(0,0,0,'+k+')';g.fillRect(0,0,o.width,o.height);return o};
const tile=(c,off,y)=>{const w=c.width;let x=-Math.floor(mod(off,w));for(;x<W;x+=w)ctx.drawImage(c,x,y|0)};
/* a dithered gradient the size of the screen: v(x,y) in 0..1 picks from the ramp */
function dithered(w,h,fn,ramp){return cnv(w,h,g=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){const v=fn(i,j);if(v<0)continue;px(g,rampAt(ramp,v,i,j),i,j)}})}
function clouds(w,h,seed,ramp,fx,fy,thr){const nz=mkNoise(seed);return cnv(w,h,g=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){
  const nx=i/w*6.283,v=nz.fbm(Math.cos(nx)*w*fx/6.283+50,j*fy+Math.sin(nx)*w*fx/6.283,4);const a=(v-thr)/(1-thr);if(a<=0)continue;px(g,rampAt(ramp,Math.min(1,a*1.3),i,j),i,j)}})}

/* ---------- sprite kits: every kit draws one frame (f 0 to 3) facing left ---------- */
const KIT={
  /* round body with an eye, optional spikes, ring and claws */
  orb(g,f,w,h,o){const cx=w/2,cy=h/2,r=Math.min(w,h)/2-2;
    if(o.spikes){for(let i=0;i<o.spikes;i++){const a=i/o.spikes*TAU+f*.3,l=r+o.sl;thick(g,o.sc||o.pal[2],cx+Math.cos(a)*r*.7,cy+Math.sin(a)*r*.7,cx+Math.cos(a)*l,cy+Math.sin(a)*l,2);px(g,o.tip||WH,cx+Math.cos(a)*l,cy+Math.sin(a)*l)}}
    if(o.claws){const s=Math.sin(f*1.57)*2;thick(g,o.pal[1],cx-r+1,cy-r*.6,cx-r-4,cy-r*.9-s,2);thick(g,o.pal[1],cx-r+1,cy+r*.6,cx-r-4,cy+r*.9+s,2);px(g,o.pal[3],cx-r-5,cy-r*.9-s-1,2,2);px(g,o.pal[3],cx-r-5,cy+r*.9+s,2,2)}
    ell(g,cx,cy,r,r,o.pal);
    if(o.ring){const rr=r+3;for(let i=0;i<40;i++){const a=i/40*TAU;if(Math.sin(a+f*.8)>.2)continue;px(g,o.rc||o.pal[4],cx+Math.cos(a)*rr*1.2,cy+Math.sin(a)*rr*.45)}}
    const ex=cx-r*.35,ey=cy,er=Math.max(2,r*.4);ell(g,ex,ey,er,er,o.eye||[K,rd,RD,WH]);px(g,K,ex-1+(f&1?0:1),ey-1,2,3);
    if(o.plate){px(g,o.pal[0],cx+r*.1,cy-r*.8,r*.5,1);px(g,o.pal[0],cx+r*.1,cy+r*.8,r*.5,1);for(let i=0;i<3;i++)px(g,o.pal[3],cx+r*.2+i*2,cy-2+i%2,1,1)}
  },
  /* dome with trailing tendrils */
  jelly(g,f,w,h,o){const cx=w*.4,cy=h/2,r=h/2-2;
    for(let t=0;t<o.tn;t++){const yy=cy-r*.7+t*(r*1.4/(o.tn-1));let px0=cx+r*.5,py0=yy;g.fillStyle=o.tc||o.pal[3];
      for(let i=0;i<w*.5;i++){px0+=1;py0=yy+Math.sin(i*.45-f*1.57+t)*(1+i*.07);g.fillRect(px0|0,py0|0,1,1)}}
    ell(g,cx,cy,r*1.3,r,o.pal);
    for(let i=0;i<4;i++)px(g,o.pal[4],cx-r*.8+i*2,cy-r*.5+i%2,1,1);
    ell(g,cx-r*.55,cy,2,2,o.eye||[K,VI,CY,WH]);
  },
  /* a ray or manta with flapping wings */
  manta(g,f,w,h,o){const cx=w/2,cy=h/2,fl=[0,2,4,2][f]-2;
    poly(g,[[w-3,cy],[w*.55,cy-h*.5+3+fl*.6],[w*.2,cy-h*.42+fl],[1,cy-3],[w*.2,cy],[w*.2,cy+0]],o.pal);
    poly(g,[[w-3,cy],[w*.55,cy+h*.5-3-fl*.6],[w*.2,cy+h*.42-fl],[1,cy+3],[w*.2,cy]],o.pal,true);
    thick(g,o.pal[2],w*.2,cy,1,cy,1);ell(g,w*.62,cy,w*.2,h*.2,o.pal);px(g,o.eye||WH,w*.74,cy-2);px(g,o.eye||WH,w*.74,cy+2);
    if(o.fins)for(let i=0;i<3;i++)px(g,o.pal[4],w*.3+i*4,cy-1+((f+i)&1),2,1);
  },
  /* an arrow shaped attack craft with an engine flame at the back (right) */
  wedge(g,f,w,h,o){const cx=w/2,cy=h/2,fl=(f&1)?2:4;
    px(g,o.flame||OR,w-3,cy-1,3,3);px(g,YL,w-fl,cy,fl,1);
    poly(g,[[1,cy],[w*.35,cy-h*.42],[w-6,cy-h*.5],[w-8,cy-1],[w-8,cy+1],[w-6,cy+h*.5],[w*.35,cy+h*.42]],o.pal);
    poly(g,[[w*.3,cy-2],[w*.55,cy-2],[w*.62,cy],[w*.55,cy+2],[w*.3,cy+2]],o.cano||[K,VI,CY,WH]);
    if(o.guns){px(g,o.pal[4],w*.35,cy-h*.38,5,1);px(g,o.pal[4],w*.35,cy+h*.38,5,1)}
    if(o.stripe)px(g,o.stripe,w*.2,cy-h*.3,2,h*.6);
  },
  /* a crab: body, legs that walk, big claws */
  crab(g,f,w,h,o){const cx=w*.55,cy=h/2,ph=[0,1,0,-1][f];
    for(let s=-1;s<=1;s+=2)for(let i=0;i<3;i++){const x0=cx-6+i*6,y0=cy+s*h*.2,x1=x0+((i+ph*s)%2)*1.5-2,y1=cy+s*(h/2-1);thick(g,o.pal[2],x0,y0,x1,y1,1)}
    thick(g,o.pal[1],cx-w*.2,cy-h*.25,1.5,cy-h*.38+ph,2);thick(g,o.pal[1],cx-w*.2,cy+h*.25,1.5,cy+h*.38-ph,2);
    poly(g,[[1,cy-h*.45+ph],[7,cy-h*.45+ph],[7,cy-h*.2],[3,cy-h*.2]],o.pal);poly(g,[[1,cy+h*.45-ph],[7,cy+h*.45-ph],[7,cy+h*.2],[3,cy+h*.2]],o.pal,true);
    ell(g,cx,cy,w*.38,h*.3,o.pal);px(g,o.eye||RD,cx-w*.3,cy-2,3,2);px(g,o.eye||RD,cx-w*.3,cy+1,3,2);
    if(o.cannon){thick(g,o.pal[4],cx-4,cy,cx-w*.45,cy,3)}
  },
  /* a plus shaped gun platform that turns slowly */
  cross(g,f,w,h,o){const cx=w/2,cy=h/2,a=f*.2;
    for(let i=0;i<4;i++){const an=a+i*PI/2,ex=cx+Math.cos(an)*(w/2-3),ey=cy+Math.sin(an)*(h/2-3);thick(g,o.pal[2],cx,cy,ex,ey,4);ell(g,ex,ey,3,3,o.pal);px(g,o.eye||RD,ex,ey)}
    ell(g,cx,cy,w*.25,w*.25,o.pal);ell(g,cx,cy,w*.11,w*.11,o.core||[K,rd,OR,YL]);
  },
  /* a boxy freighter or carrier */
  hauler(g,f,w,h,o){const cy=h/2;
    px(g,o.flame||OR,w-4,cy-5,3,3);px(g,o.flame||OR,w-4,cy+3,3,3);if(f&1){px(g,YL,w-5,cy-4,2,1);px(g,YL,w-5,cy+4,2,1)}
    poly(g,[[3,cy-h*.3],[w*.25,cy-h*.5],[w-5,cy-h*.5],[w-5,cy+h*.5],[w*.25,cy+h*.5],[3,cy+h*.3]],o.pal);
    for(let i=0;i<4;i++){px(g,o.pal[0],w*.3+i*(w*.14),cy-h*.5+2,1,h-4)}
    for(let i=0;i<3;i++)ell(g,w*.22+i*w*.22,cy,2,2,o.win||[K,VI,CY,WH]);
    px(g,o.pal[4],4,cy-1,w*.18,3);px(g,o.eye||RD,5,cy,2,1);
    if(o.cargo){px(g,o.pal[1],w*.3,cy-h*.5-2,w*.3,3);px(g,o.pal[3],w*.3,cy-h*.5-2,w*.3,1)}
  },
  /* a long thin eel or streak */
  eel(g,f,w,h,o){const cy=h/2;let ox=2;
    for(let i=0;i<w-6;i++){const x=ox+i,y=cy+Math.sin(i*.35-f*1.57)*(h*.25*(i/(w-6)+.2)),th=Math.max(1,Math.round((1-i/(w-6))*h*.34+1));
      for(let k=0;k<th;k++)px(g,rampAt(o.pal,1-k/th*.9-(i%5===0?.15:0),x,y+k),x,y-th/2+k)}
    ell(g,5,cy,4,Math.max(3,h*.22),o.pal);px(g,o.eye||WH,3,cy-1,2,1);px(g,o.eye||WH,3,cy+1,2,1);
    for(let i=0;i<3;i++)px(g,o.spark||CY,w*.4+i*5,cy-h*.3+((f+i)&1)*h*.5,1,1);
  },
  /* a large eye */
  eye(g,f,w,h,o){const cx=w/2,cy=h/2,r=Math.min(w,h)/2-2;
    ell(g,cx,cy,r,r,o.pal);
    for(let i=0;i<10;i++){const a=i/10*TAU+f*.1;line(g,o.pal[1],cx+Math.cos(a)*r*.9,cy+Math.sin(a)*r*.9,cx+Math.cos(a)*(r+2+((i+f)&1)),cy+Math.sin(a)*(r+2+((i+f)&1)))}
    ell(g,cx-r*.25,cy,r*.62,r*.62,o.iris||[K,rd,OR,YL]);ell(g,cx-r*.35,cy,r*.28,r*.4,[K,K,D]);px(g,WH,cx-r*.6,cy-r*.3,2,2);
    if(f===2)px(g,o.pal[0],cx-r,cy-r,r*2,2);
  },
  /* a heavy beast: oval body, tail fluke, eye and mouth */
  beast(g,f,w,h,o){const cy=h/2,sw=[0,2,3,2][f]-1.5;
    poly(g,[[w-2,cy-4+sw],[w-10,cy-1],[w-10,cy+1],[w-2,cy+4+sw]],o.pal);
    ell(g,w*.44,cy,w*.42,h*.42,o.pal);
    poly(g,[[w*.4,cy-h*.35],[w*.55,cy-h*.5],[w*.7,cy-h*.3]],o.pal);poly(g,[[w*.4,cy+h*.35],[w*.55,cy+h*.5],[w*.7,cy+h*.3]],o.pal,true);
    px(g,K,3,cy+2,w*.2,1);px(g,o.eye||WH,w*.16,cy-3,2,2);
    for(let i=0;i<5;i++)px(g,o.pal[4],w*.3+i*3,cy-h*.1+((i+f)&1),1,1);
  },
  /* a gear or sun with teeth */
  gear(g,f,w,h,o){const cx=w/2,cy=h/2,r=Math.min(w,h)/2-3,n=o.teeth||10;
    for(let i=0;i<n;i++){const a=i/n*TAU+f*.12;ell(g,cx+Math.cos(a)*(r+1),cy+Math.sin(a)*(r+1),2,2,o.pal)}
    ell(g,cx,cy,r,r,o.pal);ell(g,cx,cy,r*.5,r*.5,o.core||[rd,OR,YL,WH]);
    for(let i=0;i<4;i++){const a=i*PI/2+f*.5;px(g,K,cx+Math.cos(a)*r*.75,cy+Math.sin(a)*r*.75,1,1)}
  }
};
function frames(w,h,kit,o){const a=[0,1,2,3].map(f=>fin(cnv(w,h,g=>KIT[kit](g,f,w,h,o))));return{frames:a,white:a.map(whiteOf)}}

/* ---------- enemy bullets ---------- */
function mkBullet(kind,c1,c2,c3){
  return (c,b)=>{const x=b.x|0,y=b.y|0,w=(b.t*10|0)&1;
    if(kind==='orb'){px(c,K,x-3,y-3,7,7);px(c,c1,x-2,y-2,5,5);px(c,c2,x-1,y-1,3,3);px(c,WH,x-1,y-1,1,1);px(c,c3||c2,x+(w?1:-2),y+(w?-2:1))}
    else if(kind==='needle'){const a=Math.atan2(b.vy,b.vx),dx=Math.cos(a),dy=Math.sin(a);for(let i=-5;i<=3;i++){px(c,i>1?WH:i>-2?c2:c1,x+dx*i,y+dy*i)}px(c,K,x+dx*4,y+dy*4)}
    else if(kind==='big'){px(c,K,x-5,y-5,11,11);px(c,c1,x-4,y-4,9,9);px(c,c2,x-3,y-3,7,7);px(c,c3||WH,x-2,y-2,4,4);px(c,WH,x-2,y-2,2,2);if(w){px(c,c2,x+5,y,1,1);px(c,c2,x-6,y,1,1)}}
    else if(kind==='shard'){px(c,K,x-4,y-2,9,5);px(c,c1,x-3,y-1,7,3);px(c,c2,x-2,y-1,4,1);px(c,WH,x-2,y-1,1,1);px(c,c3||c1,x+3,y,2,1)}
    else{px(c,K,x-2,y-2,5,5);px(c,c1,x-1,y-1,3,3);px(c,WH,x,y,1,1)}}
}

/* ---------- enemy behaviour presets ---------- */
const MV={
  sine:(e,dt,o)=>{e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.t*(o.f||3)+e.ph)*(o.a||30)},
  dive:(e,dt,o)=>{e.x+=e.vx*dt*(e.t<.8?.5:1.5);if(e.t<(o.track||1)&&G.state==='play')e.y+=Math.sign(P.y-e.y)*Math.min(Math.abs(P.y-e.y),(o.sp||50)*dt)},
  bounce:(e,dt,o)=>{if(e.vy===0)e.vy=(Math.random()<.5?1:-1)*(o.vy||26);e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.y<TOP+14||e.y>BOT-14)e.vy*=-1},
  drift:(e,dt,o)=>{e.x+=e.vx*dt;e.y+=Math.sin(e.t*(o.f||1.5)+e.ph)*(o.a||10)*dt},
  strafe:(e,dt,o)=>{const hold=o.x||200;if(e.t<(o.stay||7)&&e.x<=hold){e.y=e.y0+Math.sin(e.t*(o.f||1.6)+e.ph)*(o.a||40);if(e.t>(o.stay||7))e.x-=0}else if(e.t>=(o.stay||7)){e.x+=e.vx*dt*2;e.y+=(e.y<100?-1:1)*20*dt}else e.x+=e.vx*dt*1.6;if(e.x>hold&&e.t<(o.stay||7))e.x+=e.vx*dt*1.6-e.vx*dt},
  orbit:(e,dt,o)=>{e.ax=(e.ax==null?W+6:e.ax)+e.vx*dt*.6;const a=e.t*(o.f||2)+e.ph;e.x=e.ax+Math.cos(a)*(o.r||22);e.y=e.y0+Math.sin(a)*(o.r||22)},
  zig:(e,dt,o)=>{e.x+=e.vx*dt;const k=Math.floor(e.t/(o.p||.5))%2?1:-1;e.y+=k*(o.a||70)*dt;e.y=clamp(e.y,TOP+10,BOT-10)}
};
const AT={
  aim:(e,o)=>{for(let i=0;i<(o.n||1);i++)ebAim(e.x-6,e.y,o.sp||70,(o.n>1?(i/(o.n-1)-.5)*(o.sd||.5):0)+rnd(-.05,.05),{sty:o.s})},
  ring:(e,o)=>{ebRing(e.x,e.y,o.n||8,o.sp||50,e.t,{sty:o.s})},
  spiral:(e,o)=>{e.spi=(e.spi||0)+1;ebSpiral(e.x,e.y,o.n||3,o.sp||55,e.spi*.5,{sty:o.s})},
  drop:(e,o)=>{ebShot(e.x,e.y,-10,o.sp||60,{sty:o.s});ebShot(e.x,e.y,-10,-(o.sp||60),{sty:o.s})},
  burst:(e,o)=>{e.burst=o.n||3;e.burstT=0},
  launch:(e,o)=>{const d=spawn({type:'dart',y:e.y,rand:0});d.x=e.x-12;d.y=e.y}
};
function enemyHooks(cfg){
  const mv=MV[cfg.mv||'sine'],mp=cfg.mvp||{},at=AT[cfg.at||'aim'],ap=cfg.atp||{};
  return{
    move(e,dt){mv(e,dt,mp)},
    update(e,dt,live){
      if(!live||cfg.at===false)return;
      if(e.burst>0){e.burstT-=dt;if(e.burstT<=0){e.burst--;e.burstT=.12;ebAim(e.x-6,e.y,ap.sp||80,0,{sty:ap.s})}}
      if(e.x<W-24&&e.x>40&&(e.shootT-=dt)<=0){e.shootT=(ap.cd||2.2)*(.85+Math.random()*.3);at(e,ap);sfxEnemyLaser();
        if(cfg.at2){AT[cfg.at2](e,cfg.atp2||ap)}}
    }
  };
}

/* ---------- capital ships: the engine behind every mini boss and boss ----------
   cfg: w,h,hp, build(g,w,h) draws the body once, deco(c,b,f) draws moving parts, core:{x,y,w,h}, bob, charge,
        phases:[[ {a,cd,...} ]] attacks by health stage, bullets already registered by the theme */
const BOSS={
  fan:(b,o)=>{const m=muz(b,o.m);ebFan(m[0],m[1],o.n,o.sd,o.sp,Math.atan2(P.y-m[1],P.x-m[0]),{sty:o.s})},
  ring:(b,o)=>{const m=muz(b,o.m);ebRing(m[0],m[1],o.n,o.sp,b.t*1.3,{sty:o.s})},
  spiral:(b,o)=>{b.bursts.push({n:o.cnt||14,t:0,gap:o.gap||.1,fn:(k)=>{const m=muz(b,o.m);ebSpiral(m[0],m[1],o.arms||3,o.sp,k*(o.rot||.35),{sty:o.s})}})},
  stream:(b,o)=>{b.bursts.push({n:o.cnt||8,t:0,gap:o.gap||.12,fn:(k)=>{const m=muz(b,o.m);ebAim(m[0],m[1],o.sp,0,{sty:o.s})}})},
  curtain:(b,o)=>{ebCurtain(b.x-b.w*.4,TOP+6,BOT-6,o.n,-o.sp,clamp(P.y+rnd(-20,20),TOP+30,BOT-30),o.gap,{sty:o.s})},
  rain:(b,o)=>{for(let i=0;i<o.n;i++){const x=rnd(40,W-30);ebShot(x,TOP+2,rnd(-12,0),o.sp,{sty:o.s});if(o.both)ebShot(rnd(40,W-30),BOT-2,rnd(-12,0),-o.sp,{sty:o.s})}},
  lance:(b,o)=>{b.lance={t:0,y:clamp(P.y,TOP+14,BOT-14),n:o.n||9,sp:o.sp,s:o.s,w:o.w||.9}},
  pull:(b,o)=>{b.pullT=o.t||2.4;b.pullF=o.f||34},
  summon:(b,o)=>{for(let i=0;i<(o.n||3);i++){const e=spawn({type:o.type,y:rnd(TOP+14,BOT-14),rand:1});e.x=W+10+i*16}},
  mines:(b,o)=>{for(let i=0;i<o.n;i++){ebShot(b.x-b.w*.4,b.y+rnd(-b.h*.4,b.h*.4),-rnd(20,44),rnd(-18,18),{sty:o.s,ay:o.ay||0,life:o.life||2.4})}},
  flare:(b,o)=>{for(let k=0;k<o.n;k++){const y=TOP+14+(BOT-TOP-28)*(k+.5)/o.n+rnd(-6,6);ebShot(b.x-b.w*.35,y,-o.sp,0,{sty:o.s});ebShot(b.x-b.w*.35,y,-o.sp*.7,(k%2?1:-1)*20,{sty:o.s})}}
};
function muz(b,i){const a=b.cfg.muz&&b.cfg.muz[i||0]||[-.45,0];return[b.x+a[0]*b.w,b.y+a[1]*b.h]}
function capital(cfg,isMini){
  let body=null,white=null;
  const make=()=>{if(body)return;body=fin(cnv(cfg.w,cfg.h,g=>cfg.build(g,cfg.w,cfg.h)));white=whiteOf(body)};
  const tx=cfg.x||(isMini?232:244);
  return{w:cfg.w+2,h:cfg.h+2,hp:cfg.hp,
    init(b){make();b.cfg=cfg;b.in=true;b.vx=-60;b.bursts=[];b.cds=[];b.lance=null;b.pullT=0;b.st=0;b.chg=0;b.dash=0;
      b.hitTest=(e,x,y)=>{const c=cfg.core;if(c&&Math.abs(x-(e.x+c.x))<c.w/2+2&&Math.abs(y-(e.y+c.y))<c.h/2+2)return 1.35;return(Math.abs(x-e.x)<cfg.w*.46&&Math.abs(y-e.y)<cfg.h*.46)?.8:0};
      b.touch=(e,px_,py_)=>Math.abs(px_-e.x)<cfg.w*.34&&Math.abs(py_-e.y)<cfg.h*.34;
      b.hold=false;
    },
    update(b,dt,live){
      if(b.in){b.x+=b.vx*dt;if(b.x<=tx){b.in=false;b.vx=0;b.bx=b.x}return}
      b.st+=dt;const p=b.hp/b.mhp,ph=p>.66?0:p>.33?1:2,dd=ph>=(cfg.phases.length-1)?cfg.phases.length-1:ph;
      /* movement: a slow bob, and in the late stages a charge at the ship */
      if(b.chg===0){b.x+=((b.bx+Math.sin(b.t*.5)*(cfg.sway||8))-b.x)*Math.min(1,dt*4);b.y+=((100+Math.sin(b.t*(cfg.bobf||.8)*(1+ph*.12))*(cfg.bob||38))-b.y)*Math.min(1,dt*3)}
      else if(b.chg===1){b.x+=Math.sin(b.st*50)*.5;if(b.st>.8){b.chg=2;b.st=0}}
      else if(b.chg===2){b.x-=240*dt;if(b.x<b.bx-(cfg.chargeDist||120)||b.st>1.2){b.chg=3;b.st=0}}
      else if(b.chg===3){b.x+=130*dt;if(b.x>=b.bx){b.x=b.bx;b.chg=0;b.dash=cfg.charge?(cfg.charge-ph*1.4):99}}
      if(cfg.charge&&ph>=1&&b.chg===0&&live){b.dash=(b.dash==null?cfg.charge:b.dash)-dt;if(b.dash<=0){b.chg=1;b.st=0}}
      /* gravity: some bosses drag the ship toward them */
      if(b.pullT>0&&live){b.pullT-=dt;P.x-=b.pullF*dt*.55;P.y+=Math.sign(b.y-P.y)*b.pullF*.5*dt;if(P.x<12)P.x=12}
      if(live&&b.chg===0){
        const list=cfg.phases[dd];
        for(let i=0;i<list.length;i++){const a=list[i];b.cds[ph*8+i]=(b.cds[ph*8+i]==null?(a.at||1.5):b.cds[ph*8+i])-dt;
          if(b.cds[ph*8+i]<=0){b.cds[ph*8+i]=a.cd*(.92+Math.random()*.16);BOSS[a.a](b,a);sfxEnemyLaser()}}
        for(const q of b.bursts){q.t-=dt;if(q.t<=0&&q.n>0){q.n--;q.t=q.gap;q.k=(q.k||0)+1;q.fn(q.k)}}
        b.bursts=b.bursts.filter(q=>q.n>0);
        if(b.lance){const L=b.lance;L.t+=dt;if(L.t>=L.w&&!L.fired){L.fired=1;for(let i=0;i<L.n;i++)ebShot(b.x-b.w*.4-i*7,L.y,-L.sp,0,{sty:L.s});sfxEnemyLaser()}if(L.t>L.w+.3)b.lance=null}
      }
      bossWear(b,live,0,0,cfg.w*.4,cfg.h*.4);
    },
    draw(c,b,f){make();
      const im=f?white:body;c.drawImage(im,(b.x-im.width/2)|0,(b.y-im.height/2)|0);
      if(cfg.deco)cfg.deco(c,b,f);
      if(b.lance&&!f){const L=b.lance;if(!L.fired&&((L.t*14)|0)%2===0){c.fillStyle=RD;c.fillRect(4,L.y|0,(b.x-b.w*.4)|0,1);c.fillStyle=WH;c.fillRect((b.x-b.w*.4-3)|0,L.y-1,3,3)}}
      if(b.chg===1&&!f&&((b.st*14)|0)%2===0){c.fillStyle=WH;c.fillRect((b.x-b.w*.5)|0,(b.y-1)|0,6,3)}
    },
    onKill(b){const n=cfg.boom||(isMini?10:26);for(let i=0;i<n;i++){const x=b.x+rnd(-b.w*.45,b.w*.45),y=b.y+rnd(-b.h*.4,b.h*.4);boom(x,y,10,i%3===0);
      for(let k=0;k<3;k++)FX.push({x,y,vx:rnd(-50,50),vy:rnd(-60,30),life:1.1,l0:1.1,c:cfg.debris[k%cfg.debris.length],s:2})}}
  };
}
/* ---------- diagonal scrolling backdrops ----------
   cfg: sky ramp + skyFn(x,y), stars colours, layers [{z:'bg'|'mid'|'fg', t:'clouds'|'objs'|'streak', ...}], dir [dx,dy] (the world slides left and down by default)
   Every layer moves along the diagonal at its own speed, so the whole stage drifts across the screen at an angle. */
const tile2=(c,ox,oy)=>{const w=c.width,h=c.height;let y=-Math.floor(mod(oy,h));for(;y<H;y+=h){let x=-Math.floor(mod(ox,w));for(;x<W;x+=w)ctx.drawImage(c,x,y)}};
function scene(cfg){
  const sky=dithered(W,H,cfg.skyFn,cfg.sky),R=rng(cfg.seed||7),ANG=cfg.angles||[0,.6,0,-.5,.35,0,.7,-.35];
  const stars=[];for(let l=0;l<3;l++)for(let i=0;i<[50,30,16][l];i++)stars.push({x:R()*(W+40),y:R()*(H+40),l,c:cfg.stars[Math.min(cfg.stars.length-1,l+(R()<.3?1:0))]});
  /* the backdrop changes heading every 16 seconds between straight left and a slope up or down, and now and then surges to a much higher speed */
  let lt=null,ax=0,ay=0,mul=1;
  const heading=t=>{const seg=16,k=Math.floor(t/seg),f=t/seg-k,e=f<.2?f/.2:1,a0=ANG[mod(k-1,ANG.length)],a1=ANG[mod(k,ANG.length)];return a0+(a1-a0)*(e*e*(3-2*e))};
  const surge=t=>{const q=((t+7)%19)/3.4;return q<1?1+2.6*Math.pow(Math.sin(Math.PI*q),2):1};
  const step=t=>{if(lt===null||t<lt||t-lt>.5){lt=t;mul=surge(t);return}const dt=t-lt;lt=t;mul=surge(t);ax+=dt*mul;ay+=dt*mul*heading(t)};
  const layers=(cfg.layers||[]).map(l=>{
    if(l.t==='clouds'){const c=clouds(256,100,l.seed||5,l.ramp,l.fx||.02,l.fy||.045,l.thr||.5);return Object.assign({},l,{img:cnv(256,200,g=>{g.drawImage(c,0,0);g.save();g.translate(0,200);g.scale(1,-1);g.drawImage(c,0,0);g.restore()})})}
    if(l.t==='objs'){const r2=rng((l.seed||11)+3),a=[];for(let i=0;i<l.n;i++)a.push({s:l.list[i%l.list.length],x:r2()*(W+160),y:r2()*(H+120),ph:r2()*6});return Object.assign({},l,{a})}
    if(l.t==='streak'){const r2=rng((l.seed||13)+9),a=[];for(let i=0;i<l.n;i++)a.push({x:r2()*(W+60),y:r2()*(H+60),k:.6+r2()*.8,c:l.cols[i%l.cols.length]});return Object.assign({},l,{a})}
    return l});
  const draw=(z,t)=>{
    const hd=heading(t);
    if(z==='bg'){ctx.drawImage(sky,0,0);
      for(const s of stars){const sp=[5,12,26][s.l],x=mod(s.x-ax*sp,W+40)-20,y=mod(s.y+ay*sp,H+40)-20;px(ctx,s.c,x,y);if(mul>1.5&&s.l>0){px(ctx,s.c,x+2,y-hd*2)}if(s.l===2&&(((t*1.3+s.x*.37)|0)%7===0)){px(ctx,WH,x-1,y);px(ctx,WH,x+1,y);px(ctx,WH,x,y-1);px(ctx,WH,x,y+1)}}}
    for(const l of layers){if((l.z||'bg')!==z)continue;
      if(l.t==='clouds'){if(l.alpha!=null)ctx.globalAlpha=l.alpha;tile2(l.img,ax*l.vx,-ay*l.vx+(l.y0||0));ctx.globalAlpha=1}
      else if(l.t==='objs'){for(const o of l.a){const sp=l.vx,x=mod(o.x-ax*sp,W+160)-80-o.s.width/2,y=mod(o.y+ay*sp,H+120)-60-o.s.height/2;
        if(x<W&&y<H&&x>-o.s.width&&y>-o.s.height){ctx.drawImage(o.s,x|0,y|0);if(l.lights){const b=((t*1.6+o.ph)%1)<.4;if(b)px(ctx,l.lights,x+o.s.width*.2,y+o.s.height*.4,2,1)}}}}
      else if(l.t==='streak'){for(const o of l.a){const sp=l.vx*o.k,x=mod(o.x-ax*sp,W+60)-30,y=mod(o.y+ay*sp,H+60)-30,len=l.len*o.k*(1+(mul-1)*1.8);ctx.fillStyle=o.c;
        lineF(x,y,x+len,y-hd*len,(a,b)=>ctx.fillRect(a,b,1,1))}}
    }};
  return{bg:t=>{step(t);draw('bg',t)},mid:t=>draw('mid',t),fg:t=>draw('fg',t)};
}
/* ---------- the shared pack builder ---------- */
function mkPack(T){
  return{
    init(){
      const A={enemies:{},bullets:{}};
      T.sprites&&0;
      for(const k in T.bullets)A.bullets[k]=mkBullet.apply(null,T.bullets[k]);
      for(const slot of ['ring','ringR','dart','cross','pod']){
        const c=T.en[slot],fr=frames(c.w,c.h,c.kit,c.o),hk=enemyHooks(c);
        A.enemies[slot]={frames:fr.frames,white:fr.white,fps:c.fps||7,w:c.w-2,h:c.h-2,hp:c.hp,pts:c.pts,vx:c.vx,move:hk.move,update:hk.update,
          init(e,o){e.shootT=rnd(.5,2);if(c.init)c.init(e,o)},onKill:c.onKill};
      }
      A.enemies.rock=T.rock?T.rock():undefined;if(!A.enemies.rock)delete A.enemies.rock;
      {const s=scene(T.scene(window.BIGKIT));A.drawBackground=s.bg;A.drawMidground=s.mid;A.drawForeground=s.fg;A.noFG=true}
      A.mini=capital(T.mini,true);A.boss=capital(T.boss,false);
      if(T.tick)A.tick=T.tick;
      return A;
    },
    script:T.script
  };
}
window.BIGKIT={scene,mkPack,px,cnv,mod,clamp,rng,mkNoise,ell,poly,thick,line,lineF,dithered,clouds,tile,darken,rampAt,fin,outline,KIT,frames,mkBullet,K,NV,VI,BL,PU,LP,LV,mg,MG,rd,BR,TN,OR,YG,YL,GR,GD,LG,PG,cy,CY,D,GM,LM,LL,WH,RD};
})();
