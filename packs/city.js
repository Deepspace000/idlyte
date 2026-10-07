/* THE BURNING CITY art pack (planet 9): the final stage of Idlyte.
   A burning dystopian future city where the tech has gone crazy: black and navy skyscraper canyons lit by orange fire,
   glitching magenta and cyan neon, corrupted holograms, out-of-control sky traffic, rolling black smoke, embers and arcing power lines.
   Enemies: rogue police drones (ring), riot drones and hacked delivery bots (ringR), runaway hover cars (dart),
   glitching AI constructs (cross), police dropships and delivery carriers (pod), tumbling burning wreckage (rock).
   Mini boss: the MECHA DRAGON BILLBOARD.
   Boss: levels 1 and 2 are a boss rush of reanimated, tech-corrupted old bosses borrowed from the other packs;
   level 3 brings the Hive Queen back and then the vast FUSION OF ALL MACHINES. Elite stage: bullet hell, up to 60 bullets. */
(function(){
'use strict';
const PI=Math.PI,TAU=PI*2;
const K='#000000',NV='#1c1840',VI='#352879',BL='#6c5eb5',PU='#6f3d86',LP='#8a5aa6',LV='#cc99ff',mg='#cc44cc',MG='#ff77ff',
  rd='#9a3a3a',BR='#68372b',TN='#9a6759',OR='#ff9966',YG='#b8c76f',YL='#ffffaa',GR='#588d43',GD='#2c5a2c',LG='#9ad284',PG='#ccff99',
  cy='#70a4b2',CY='#9ad2e0',D='#444444',GM='#6c6c6c',LM='#959595',LL='#bbbbbb',WH='#ffffff',RD='#ff7777';
const N0='#07050e',N1='#0e0a1c',N2='#150f28',EM='#3a0a14';

/* ---------- little helpers ---------- */
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
  return{vn,fbm,H};
}
const hash=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return(((h^(h>>>16))>>>0)%10000)/10000};
function rampAt(r,v,i,j){v=clamp(v,0,.999);const t=v*(r.length-1),k=Math.min(r.length-2,Math.floor(t)),f=t-k;return f>BAYER[j&3][i&3]/16?r[k+1]:r[k]}
/* a shaded ellipsoid lit from the upper left, dithered between the ramp colours (dark to light) */
function ell(g,cx,cy,rx,ry,ramp,o){
  o=o||{};const n=ramp.length;
  for(let j=Math.floor(cy-ry-1);j<=Math.ceil(cy+ry+1);j++)for(let i=Math.floor(cx-rx-1);i<=Math.ceil(cx+rx+1);i++){
    const nx=(i+.5-cx)/rx,ny=(j+.5-cy)/ry,d=nx*nx+ny*ny;if(d>1)continue;
    const nz=Math.sqrt(1-d),l=-.5*nx-.55*ny+.7*nz,t=Math.max(0,Math.min(.999,(l+.15)/1.05))*(n-1),k=Math.floor(t),f=t-k;
    px(g,ramp[f>BAYER[j&3][i&3]/16&&k<n-1?k+1:k],i,j)}
}
/* black outline around everything opaque (adds one pixel on every side) */
function outline(c,col){
  const w=c.width,h=c.height,o=mk(w+2,h+2),g=o.getContext('2d'),d=c.getContext('2d').getImageData(0,0,w,h).data;
  const op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>40;
  g.fillStyle=col||K;
  for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){if(op(x,y))continue;if(op(x-1,y)||op(x+1,y)||op(x,y-1)||op(x,y+1))g.fillRect(x+1,y+1,1,1)}
  g.drawImage(c,1,1);return o;
}
const fin=c=>outline(polish(c),K);
function lineF(x0,y0,x1,y1,fn){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(;;){fn(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function line(g,col,x0,y0,x1,y1){g.fillStyle=col;lineF(x0,y0,x1,y1,(x,y)=>g.fillRect(x,y,1,1))}
function thick(g,col,x0,y0,x1,y1,th){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);g.fillStyle=col;for(let i=0;i<=n;i++)g.fillRect(Math.round(x0+(x1-x0)*i/n-th/2),Math.round(y0+(y1-y0)*i/n-th/2),th,th)}
const N4=[[1,0],[-1,0],[0,1],[0,-1]];
/* neon tube: bright core line plus a checker dithered halo */
function neon(g,pts,core,halo){
  g.fillStyle=halo;
  for(let i=0;i<pts.length-1;i++)lineF(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],(x,y)=>{for(const d of N4)if(((x+d[0]+y+d[1])&1)===0)g.fillRect(x+d[0],y+d[1],1,1)});
  g.fillStyle=core;
  for(let i=0;i<pts.length-1;i++)lineF(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],(x,y)=>g.fillRect(x,y,1,1));
}
function inPoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const xi=P[i][0],yi=P[i][1],xj=P[j][0],yj=P[j][1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
const polyM=P=>(x,y)=>inPoly(P,x+.5,y+.5);
function fillPoly(g,P,col){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of P){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}
  g.fillStyle=col;for(let y=Math.floor(y0);y<=y1;y++)for(let x=Math.floor(x0);x<=x1;x++)if(inPoly(P,x+.5,y+.5))g.fillRect(x,y,1,1)}
/* plate: black outline, bright rim top and left, dark bevel bottom right, dithered body lit from the upper left */
function plate(w,h,inside,o){o=o||{};
  const c=mk(w,h),g=c.getContext('2d'),m=new Uint8Array(w*h);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)m[j*w+i]=inside(i,j)?1:0;
  const at=(i,j)=>i>=0&&j>=0&&i<w&&j<h&&m[j*w+i]===1;
  const ramp=o.ramp||[NV,D,GM,LM],lit=o.lit||((i,j)=>.8-i/w*.35-j/h*.5);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(!at(i,j))continue;let col;
    if(!at(i-1,j)||!at(i+1,j)||!at(i,j-1)||!at(i,j+1))col=K;
    else if(!at(i,j-2)||!at(i-2,j))col=o.rim||LL;
    else if(!at(i,j+2)||!at(i+2,j))col=o.shadow||NV;
    else col=rampAt(ramp,lit(i,j),i,j);
    if(o.extra){const e=o.extra(i,j,col);if(e)col=e}
    g.fillStyle=col;g.fillRect(i,j,1,1)}
  return c}
/* limb: a thick shaded bar from (x0,y0) to (x1,y1) as a plate polygon */
function limbPts(x0,y0,x1,y1,t0,t1){const a=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(a),ny=Math.cos(a);return [[x0+nx*t0,y0+ny*t0],[x1+nx*t1,y1+ny*t1],[x1-nx*t1,y1-ny*t1],[x0-nx*t0,y0-ny*t0]]}
function sil(c,col){const o=mk(c.width,c.height),g=o.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,o.width,o.height);return o}
/* hologram version of a sprite: luminance mapped onto a neon ramp, every other row missing, sparse dither (palette pure) */
function holo(c,par,ramp){
  const w=c.width,h=c.height,d=c.getContext('2d').getImageData(0,0,w,h).data,r=ramp||[VI,cy,CY,WH];
  return cnv(w,h,g=>{for(let y=0;y<h;y++){if((y+par)%3===0)continue;for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<100)continue;
    const l=(d[i]*.3+d[i+1]*.55+d[i+2]*.15)/255;if(l<.08&&BAYER[y&3][x&3]>5)continue;px(g,r[Math.min(r.length-1,Math.floor(Math.pow(l,1.3)*1.25*r.length))],x,y)}}});
}
function rotC(c,a,S){return cnv(S,S,g=>{g.translate(S/2,S/2);g.rotate(a);g.drawImage(c,-(c.width>>1),-(c.height>>1))})}
function tile(c,off,y){const w=c.width;let x=-Math.floor(mod(off,w));for(;x<W;x+=w)ctx.drawImage(c,x,y|0)}
const CHM=[[0,LM],[.1,LL],[.2,WH],[.32,LL],[.44,GM],[.5,K],[.56,VI],[.66,PU],[.76,MG],[.86,PU],[.95,VI]];   // magenta chrome bands
const CHC=[[0,GM],[.1,LL],[.22,WH],[.34,LL],[.46,GM],[.52,K],[.58,NV],[.68,cy],[.78,CY],[.88,cy],[.96,NV]];  // cyan chrome bands

/* ---------- shared state ---------- */
/* the level clock stops while the boss is alive: this extra clock keeps the city scrolling */
const S={G:null,ex:0};
function clk(){if(S.G!==G){S.G=G;S.ex=0}return S.ex}
const room=n=>EB.length+n<=60;                    // elite stage: up to about 60 enemy bullets
const LV_=()=>clamp((G&&G.level)||1,1,3);
const lvF=()=>[1,.86,.74][LV_()-1];              // shorter timers on higher levels
const spd=v=>v*(1+.07*(LV_()-1));
const aimA=(x,y)=>Math.atan2(P.y-y,P.x-x);
const fxOk=()=>FX.length<160;
let A=null;          // our own built assets
let CUR=null;        // a borrowed pack whose code runs right now: its spawns become its own enemies
const RUSH={host:null,sub:null,F:null};
const BOR={};        // borrowed packs by planet index

/* run a borrowed pack's code safely: its spawns stay its own, G.boss points at its own boss, its bullet styles get registered */
function tagB(F,n0){if(!F||!F.A||!F.A.bullets)return;for(let i=Math.max(0,n0);i<EB.length;i++){const b=EB[i];if(b.sty&&!b.tg){const k='f'+F.i+'_'+b.sty;if(!A.bullets[k]&&F.A.bullets[b.sty])A.bullets[k]=F.A.bullets[b.sty];b.sty=k;b.tg=1}}}
function run(F,fn){
  const pc=CUR,pb=G.boss,sw=!!(RUSH.host&&pb===RUSH.host&&RUSH.sub&&RUSH.F===F),n0=EB.length;CUR=F;if(sw)G.boss=RUSH.sub;let ok=true;
  try{fn()}catch(err){ok=false;if(!F.err){F.err=1;console.warn('city pack: borrowed code of planet '+F.i+' failed, falling back',err)}}
  finally{CUR=pc;if(sw&&G.boss===RUSH.sub)G.boss=pb}
  tagB(F,n0);return ok}
function packF(i){
  if(BOR[i])return BOR[i].ok?BOR[i]:null;
  let A2=null;
  try{if(PACKS[i]&&typeof PACKS[i].init==='function')A2=PACKA[i]||(PACKA[i]=PACKS[i].init())}catch(err){console.warn('city pack: pack '+i+' failed to build',err);A2=null}
  const ok=!!(A2&&A2.boss&&typeof A2.boss.update==='function'&&typeof A2.boss.draw==='function');
  BOR[i]={i,A:A2,boss:ok?A2.boss:null,ok};return ok?BOR[i]:null}

/* ---------- foreign enemies: things a borrowed boss spawns keep their own look and behaviour ---------- */
const DEF={ring:{w:15,h:9},ringR:{w:20,h:10},dart:{w:16,h:9},cross:{w:13,h:13},pod:{w:17,h:13},rock:{}};
function fsk(e){const F=e.fx;return F&&F.A&&F.A.enemies?F.A.enemies[e.fr]:null}
function defMove(e,dt,live){
  if(e.type==='ring'||e.type==='ringR'){e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.t*3.2+e.ph)*30;if(live&&e.x<W-30&&e.x>60&&(e.shootT-=dt)<=0){e.shootT=rnd(2.2,4);enemyShot(e,0)}}
  else if(e.type==='dart'){e.x+=e.vx*dt;if(e.t<.9&&live)e.y+=Math.sign(P.y-e.y)*Math.min(Math.abs(P.y-e.y),30*dt)}
  else if(e.type==='cross'){e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.y<TOP+10||e.y>BOT-10)e.vy*=-1;if(live&&e.x<W-20&&e.x>80&&(e.shootT-=dt)<=0){e.shootT=rnd(1.8,3);enemyShot(e,0)}}
  else if(e.type==='pod'){e.x+=e.vx*dt;e.y+=Math.sin(e.t*1.5)*10*dt;if(live&&e.x<W-20&&e.x>80&&(e.shootT-=dt)<=0){e.shootT=rnd(2.2,3.2);enemyShot(e,0);enemyShot(e,.35);enemyShot(e,-.35)}}
  else{e.x+=e.vx*dt;e.y+=e.vy*dt}
}
function drawForeign(c,e,f){
  const sk=fsk(e);
  if(sk&&sk.draw){run(e.fx,()=>sk.draw(c,e,f))}
  else if(sk&&sk.frames&&sk.frames.length){const fr=(f&&sk.white)?sk.white:sk.frames,sp=fr[Math.floor((e.t||0)*(sk.fps||10))%fr.length];c.drawImage(sp,(e.x-sp.width/2)|0,(e.y-sp.height/2)|0)}
  else{c.fillStyle=f?WH:MG;c.fillRect((e.x-4)|0,(e.y-4)|0,8,8);c.fillStyle=K;c.fillRect((e.x-2)|0,(e.y-2)|0,4,4)}
  if(!f&&(((e.t||0)*9)|0)%5===0){const w=e.w||10,h=e.h||10;c.fillStyle=((e.t*30)|0)&1?MG:CY;c.fillRect((e.x-w/2)|0,(e.y-h/2+mod((e.t||0)*40,h))|0,w|0,1)}   // corruption scanline
}
function wrap(type,mine){
  return {
    init(e,o){
      if(CUR){const F=CUR,sk=F.A&&F.A.enemies?F.A.enemies[type]:null;e.fx=F;
        if(type!=='rock'&&sk){const d=DEF[type];e.w=sk.w||d.w;e.h=sk.h||d.h;if(sk.hp)e.hp=e.mhp=sk.hp*loopScale();if(sk.pts)e.pts=sk.pts;if(sk.vx)e.vx=sk.vx}
        if(sk&&sk.init)run(F,()=>sk.init(e,o));return}
      if(mine.init)mine.init(e,o)},
    move(e,dt,live){if(e.fx){const sk=fsk(e);if(sk&&sk.move)run(e.fx,()=>sk.move(e,dt,live));else defMove(e,dt,live);return}mine.move(e,dt,live)},
    update(e,dt,live){if(e.fx){const sk=fsk(e);if(sk&&sk.update)run(e.fx,()=>sk.update(e,dt,live));return}if(mine.update)mine.update(e,dt,live)},
    draw(c,e,f){if(e.fx){drawForeign(c,e,f);return}mine.draw(c,e,f)},
    onKill(e){if(e.fx){const sk=fsk(e);if(sk&&sk.onKill)run(e.fx,()=>sk.onKill(e));return}if(mine.onKill)mine.onKill(e)}
  }}

/* ======================================================================
   ENEMY ART
   ====================================================================== */
/* ROGUE POLICE DRONE (ring): armoured saucer, red and blue siren bar, camera eye, stun prongs */
function copF(f){const w=19,h=13;return cnv(w,h,g=>{
  g.drawImage(plate(w,h,(x,y)=>(((x+.5-10)/8.6)**2+((y+.5-8)/4.6)**2<=1)||(x>=6&&x<=13&&y>=2&&y<=5),{ramp:[NV,VI,BL,LM],rim:LL,shadow:N1,lit:(i,j)=>.95-i/w*.3-j/h*.7}),0,0);
  const sr=[[RD,VI],[rd,CY],[WH,CY],[RD,WH]][f];
  px(g,K,7,3,6,2);px(g,sr[0],7,3,3,1);px(g,sr[1],10,3,3,1);px(g,f===2?WH:rd,8,4,1,1);px(g,f===1?WH:BL,11,4,1,1);
  px(g,LL,4,9,13,1);px(g,K,4,10,13,1);
  px(g,K,1,6,3,3);px(g,f&1?RD:WH,2,7,1,1);
  px(g,K,0,11,6,2);px(g,GM,1,11,4,1);px(g,f&1?CY:WH,0,11,1,1);
  px(g,f&1?CY:cy,18,7,1,3);
})}
/* RIOT DRONE (ringR variant 0): heavy hull behind a riot shield plate, twin sirens */
function riotF(f){const w=26,h=17;return cnv(w,h,g=>{
  g.drawImage(plate(w,h,(x,y)=>(((x+.5-15)/10)**2+((y+.5-10)/5.8)**2<=1)||(x>=11&&x<=20&&y>=1&&y<=5),{ramp:[NV,VI,BL,LM],rim:LL,shadow:N1,lit:(i,j)=>.95-i/w*.3-j/h*.7}),0,0);
  g.drawImage(plate(8,17,(x,y)=>x<=6&&y>=1&&y<=16&&!(x===0&&(y<3||y>14)),{ramp:[D,GM,LM,LL],rim:WH,shadow:D,lit:(i,j)=>.95-j/17*.6}),0,0);
  px(g,K,2,6,3,6);px(g,f&1?CY:cy,3,7,1,4);px(g,WH,3,7,1,1);
  const s=[[RD,CY],[CY,RD],[WH,RD],[RD,WH]][f];px(g,K,12,2,8,2);px(g,s[0],12,2,4,1);px(g,s[1],16,2,4,1);
  px(g,LL,9,12,14,1);px(g,K,9,13,14,1);for(let x=10;x<22;x+=3)px(g,RD,x,12,1,1);
  px(g,f&1?CY:cy,25,9,1,3);px(g,K,22,7,2,1);
})}
/* HACKED DELIVERY BOT (ringR variant 1): orange quad rotor with a corrupted smiley screen and a claw */
function botF(f){const w=24,h=16;return cnv(w,h,g=>{
  line(g,GM,5,5,9,7);line(g,GM,18,5,14,7);
  px(g,K,2,4,5,3);px(g,K,17,4,5,3);px(g,LM,3,4,3,1);px(g,LM,18,4,3,1);
  const L=[9,5,1,5][f];if(L>1){px(g,LL,4.5-L/2,2,L,1);px(g,LL,19.5-L/2,2,L,1)}else{px(g,WH,4,1,1,2);px(g,WH,19,1,1,2)}
  g.drawImage(plate(w,h,(x,y)=>x>=7&&x<=17&&y>=6&&y<=13,{ramp:[BR,TN,OR,YL],rim:YL,shadow:BR,lit:(i,j)=>.9-i/w*.4-j/h*.5}),0,0);
  px(g,K,8,8,5,4);
  if(f===3){px(g,CY,9,9,1,1);px(g,MG,11,10,1,1);px(g,CY,9,10,3,1)}
  else if(f===2){px(g,RD,9,9,1,1);px(g,RD,11,9,1,1);px(g,RD,9,10,3,1)}
  else{px(g,MG,9,9,1,1);px(g,MG,11,9,1,1);px(g,MG,9,11,3,1);px(g,MG,10,10,1,1)}
  px(g,K,14,7,1,6);px(g,WH,15,8,2,1);px(g,mg,15,10,2,1);
  px(g,GM,12,14,1,1);px(g,GM,10,15,5,1);
})}
const PARC=cnv(8,7,g=>{g.drawImage(plate(8,7,()=>true,{ramp:[BR,TN,OR],rim:YL,shadow:BR}),0,0);px(g,YL,1,3,6,1);px(g,YL,4,1,1,5);px(g,RD,6,1,1,1)});
/* RUNAWAY HOVER CAR (dart): wedge car, three liveries, headlight, taillight, hover glow and a sparking engine */
const CARP=[[N1,PU,mg,MG],[N1,VI,cy,CY],[BR,rd,OR,YL]];
function carF(p,f){const w=25,h=12;return cnv(w,h,g=>{
  const R=CARP[p];
  g.drawImage(plate(w,h,polyM([[0,8],[2,5],[8,4],[11,1],[18,1],[21,4],[24,5],[24,10],[1,10]]),{ramp:[N0,R[0],R[1],R[2]],rim:R[3],shadow:N0,lit:(i,j)=>.95-j/h*.75-i/w*.15}),0,0);
  fillPoly(g,[[11.5,2],[17.5,2],[20,4.5],[9.5,4.5]],NV);px(g,CY,12,2,2,1);px(g,WH,12,2,1,1);px(g,VI,14,3,4,1);
  px(g,R[3],3,6,18,1);px(g,K,13,5,1,4);
  px(g,WH,1,7,2,1);px(g,YL,1,8,2,1);px(g,RD,23,6,1,3);
  px(g,f&1?MG:mg,4,11,16,1);px(g,f&1?WH:MG,6+f*3,11,2,1);
  px(g,K,17,7,2,1);px(g,N0,19,8,1,1);
  if(f>=2){px(g,f===2?YL:OR,24,10,1,1);px(g,f===2?OR:YL,22,11,1,1)}
})}
/* GLITCHING AI CONSTRUCT (cross): a spinning flat shaded octahedron machine with a staring core */
function polyF(S,R,ang,edge){return cnv(S,S,g=>{
  const c=(S-1)/2,vs=[[R,0,0],[-R,0,0],[0,R,0],[0,-R,0],[0,0,R],[0,0,-R]];
  const ca=Math.cos(ang),sa=Math.sin(ang),ct=Math.cos(.55),st=Math.sin(.55);
  const Pp=vs.map(v=>{const x=v[0]*ca+v[2]*sa,z=-v[0]*sa+v[2]*ca,y=v[1];return [x,y*ct-z*st,y*st+z*ct]});
  const fs=[];for(const a of [0,1])for(const b of [2,3])for(const d of [4,5])fs.push([a,b,d]);
  const Lt=[-.5,-.6,.62],vis=[];
  for(const f of fs){const p0=Pp[f[0]],p1=Pp[f[1]],p2=Pp[f[2]],u=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],v=[p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]];
    let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const m=Math.hypot(n[0],n[1],n[2])||1;n=n.map(q=>q/m);
    const cc=[p0[0]+p1[0]+p2[0],p0[1]+p1[1]+p2[1],p0[2]+p1[2]+p2[2]];if(n[0]*cc[0]+n[1]*cc[1]+n[2]*cc[2]<0)n=n.map(q=>-q);
    if(n[2]>0)vis.push({f,n,z:cc[2]})}
  vis.sort((a,b)=>a.z-b.z);
  const RP=[N1,NV,VI,PU,LP,LV];
  for(const o of vis){const l=clamp(o.n[0]*Lt[0]+o.n[1]*Lt[1]+o.n[2]*Lt[2],0,1),pts=o.f.map(i=>[c+.5+Pp[i][0],c+.5+Pp[i][1]]);
    for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(inPoly(pts,x+.5,y+.5))px(g,rampAt(RP,.1+l*.9,x,y),x,y)}
  for(const o of vis)for(let k=0;k<3;k++){const a=Pp[o.f[k]],b=Pp[o.f[(k+1)%3]];line(g,edge,c+.5+a[0],c+.5+a[1],c+.5+b[0],c+.5+b[1])}
  px(g,K,c-1,c-1,3,3);px(g,MG,c-1,c-1,2,2);px(g,WH,c-1,c-1,1,1);
})}
/* POLICE DROPSHIP (pod variant 0): armoured carrier on twin ducted fans, open side door with a drone waiting */
function dropF(f){const w=34,h=21;return cnv(w,h,g=>{
  for(const fx of [10,25]){g.drawImage(plate(w,h,(x,y)=>((x+.5-fx)/5.2)**2+((y+.5-17)/3.4)**2<=1,{ramp:[N0,NV,VI,BL],rim:LM,shadow:N0}),0,0);px(g,K,fx-3,17,7,1);px(g,f&1?LL:GM,fx-3+((f*2)%5),17,2,1);px(g,CY,fx-1,19,2,1)}
  g.drawImage(plate(w,h,polyM([[0,10],[4,6],[10,4],[28,4],[33,7],[33,14],[28,16],[6,16],[1,13]]),{ramp:[NV,VI,BL,LM],rim:LL,shadow:N1,lit:(i,j)=>.95-j/h*.8-i/w*.2}),0,0);
  g.drawImage(plate(w,h,(x,y)=>x>=14&&x<=22&&y>=1&&y<=5,{ramp:[NV,VI,BL],rim:LM}),0,0);
  const s=[[RD,VI],[rd,CY],[WH,WH],[RD,CY]][f];px(g,K,15,2,7,2);px(g,s[0],15,2,3,1);px(g,s[1],19,2,3,1);
  px(g,LL,5,12,26,1);px(g,K,5,13,26,1);
  px(g,K,15,6,8,6);px(g,N0,16,7,6,4);px(g,f&1?RD:rd,18,8,2,1);px(g,GM,17,9,4,1);
  px(g,K,3,8,5,3);px(g,CY,4,8,3,1);px(g,WH,4,8,1,1);px(g,WH,1,13,2,1);
})}
/* DELIVERY CARRIER (pod variant 1): orange cargo hauler with a glitching neon smile logo */
function vanF(f){const w=34,h=21;return cnv(w,h,g=>{
  for(const fx of [13,28])px(g,f&1?CY:cy,fx,17,3,2);
  g.drawImage(plate(w,h,(x,y)=>x>=8&&x<=33&&y>=2&&y<=16,{ramp:[BR,TN,OR,YL],rim:YL,shadow:BR,lit:(i,j)=>.85-j/h*.6-i/w*.25}),0,0);
  for(let x=12;x<33;x+=5)px(g,BR,x,4,1,11);
  const lc=f===3?CY:MG,lh=f===3?cy:mg;
  if(f!==2){neon(g,[[13,9],[16,12],[24,12],[28,9]],lc,lh);neon(g,[[26,8],[28,9],[27,11]],lc,lh)}
  else{neon(g,[[13,10],[17,12]],lc,lh);neon(g,[[22,11],[28,8]],CY,cy)}
  g.drawImage(plate(w,h,polyM([[0,11],[2,6],[9,5],[9,16],[1,16]]),{ramp:[N1,NV,VI,BL],rim:LL,shadow:N0}),0,0);
  px(g,K,2,7,5,3);px(g,CY,3,7,3,1);px(g,WH,3,7,1,1);px(g,WH,0,13,2,1);px(g,f&1?RD:rd,30,3,2,1);
})}
/* hazards: tumbling wreckage */
function girderS(){return cnv(26,7,g=>{px(g,LM,0,0,26,1);px(g,GM,0,1,26,1);px(g,D,2,2,22,3);px(g,N1,3,3,20,1);px(g,GM,0,5,26,1);px(g,D,0,6,26,1);
  for(let x=1;x<26;x+=4){px(g,LL,x,0,1,1);px(g,LL,x,5,1,1)}px(g,TN,6,1,4,1);px(g,BR,7,5,5,1);px(g,TN,18,0,3,1);
  g.clearRect(24,0,2,2);g.clearRect(25,4,1,3)})}
function panelS(){return cnv(20,15,g=>{
  for(let y=0;y<15;y++)for(let x=0;x<20;x++){const e=x<2||x>17||y<2||y>12;px(g,e?CHM[Math.min(10,Math.floor(y/15*11))][1]:rampAt([PU,mg,MG,LV],1-y/15+(x%5===0?.2:0),x,y),x,y)}
  line(g,K,4,3,9,8);line(g,K,9,8,7,12);line(g,K,9,8,15,6);px(g,CY,3,9,13,1);px(g,WH,5,9,3,1)})}
function chunkS(seed){return cnv(10,10,g=>{ell(g,5,5,4.4,4,[N1,D,GM,LM,LL]);const r=rng(seed);for(let i=0;i<5;i++)px(g,N1,2+r()*6,2+r()*6);line(g,TN,1,7,8,3);px(g,OR,6,6,1,1);px(g,YL,6,5,1,1)})}
function shardS(){return cnv(10,10,g=>{fillPoly(g,[[1,8],[4,0],[9,3],[6,9]],cy);fillPoly(g,[[3,6],[4.5,1],[7,3]],CY);px(g,WH,4,2,1,2);line(g,VI,6,9,9,3)})}
function tubeS(){return cnv(12,5,g=>{px(g,K,0,1,12,3);neon(g,[[1,2],[10,2]],MG,mg);px(g,GM,0,1,2,3);px(g,LL,10,1,2,3);px(g,YL,11,2,1,1)})}

/* ======================================================================
   MINI BOSS ART: the Mecha Dragon Billboard
   ====================================================================== */
function chromeDragonHead(k){   // 44x30, nose to the left; k: 0 closed, 1 open, 2 wide
  return cnv(44,32,g=>{
    const jaw=[[3,19],[16,19+k],[30,20],[38,21],[36,25],[26,26+k*2],[12,24+k*3],[4,22+k*2]];
    // throat glow when open
    if(k)fillPoly(g,[[4,18],[30,18],[30,22+k*2],[10,22+k*3]],k>1?YL:OR);
    if(k)fillPoly(g,[[14,19],[30,19],[30,21+k],[16,21+k*2]],k>1?WH:YL);
    g.drawImage(plate(44,32,polyM(jaw),{ramp:[K,VI,GM,LL],rim:WH,shadow:N0,lit:(i,j)=>.9-(j-18)/12*.7,extra:(i,j,c)=>c===K||c===WH?null:(j>=23&&j<=24?MG:null)}),0,0);
    const skull=[[0,17],[5,12],[14,10],[24,6],[32,4],[40,7],[43,13],[42,20],[34,22],[20,19],[6,19]];
    g.drawImage(plate(44,32,polyM(skull),{ramp:[NV,VI,LM,LL],rim:WH,shadow:N0,lit:(i,j)=>{const b=Math.min(10,Math.floor((j-3)/20*11));return [.95,.9,.85,.7,.55,.2,.3,.45,.6,.45,.3][Math.max(0,b)]-i/44*.15}}),0,0);
    // horns swept back
    g.drawImage(plate(44,32,polyM([[30,6],[38,0],[44,0],[39,3],[35,8]]),{ramp:[VI,LM,LL],rim:WH}),0,0);
    neon(g,[[6,15],[16,12],[26,9]],CY,cy);
    neon(g,[[34,15],[41,12]],MG,mg);
    px(g,K,26,10,6,4);px(g,MG,27,11,4,2);px(g,WH,27,11,1,1);px(g,RD,30,12,1,1);
    for(let x=6;x<30;x+=3){px(g,WH,x,19,1,1+(k?1:0));px(g,WH,x+1,19+k*2,1,1)}
    px(g,K,4,14,2,1);px(g,MG,2,16,1,1);
  });
}
function segM(r,fn){const S=r*2+4;return cnv(S,S+4,g=>{
  // dorsal fin with a neon edge
  fillPoly(g,[[S/2-2,4],[S/2+3,0],[S/2+4,5]],VI);line(g,MG,S/2-1,3,S/2+3,0);
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const dx=(i+.5-S/2)/r,dy=(j+.5-S/2)/r,d=dx*dx+dy*dy;if(d>1)continue;
    const f=(j+.5-S/2+r)/(2*r);let col=CHM[Math.min(10,Math.floor(f*11))][1];if(d>.72&&((i+j)&1))col=f<.5?LL:VI;px(g,col,i,j+4)}
  px(g,K,S/2-1,S/2+4-1,2,2);px(g,fn?CY:MG,S/2-1,S/2+4-1,1,1);
})}
function clawM(open){return cnv(16,14,g=>{
  thick(g,GM,12,1,9,7,3);thick(g,LL,12,1,10,5,1);
  const tips=open?[[1,4],[0,9],[3,13]]:[[5,6],[4,9],[6,12]];
  for(const t of tips){thick(g,LM,9,8,t[0]+1,t[1],2);px(g,WH,t[0],t[1],1,1)}
  ell(g,10,8,3,3,[NV,GM,LL,WH]);px(g,MG,10,8,1,1);
})}
/* the billboard: chrome frame, neon trim, scanline screen */
function billboard(glitch){return cnv(96,70,g=>{
  for(let y=0;y<70;y++)for(let x=0;x<96;x++){const e=x<5||x>90||y<5||y>62;if(!e)continue;
    const f=x<5?x/5:x>90?(95-x)/5:y<5?y/5:(69-y)/7;px(g,y>62&&y<70&&(x<10||x>85)?D:CHC[Math.min(10,Math.floor(clamp(f,0,1)*5+(y<5?0:5)))][1],x,y)}
  px(g,K,0,0,96,1);px(g,K,0,0,1,70);px(g,K,95,0,1,70);px(g,K,0,69,96,1);px(g,K,5,5,86,1);px(g,K,5,5,1,58);px(g,K,90,5,1,58);px(g,K,5,62,86,1);
  for(let y=6;y<62;y++)for(let x=6;x<90;x++){const v=.15+.25*(1-y/62)+(y%2?0:.08);px(g,rampAt([N0,N1,NV,VI],v,x,y),x,y)}
  if(glitch){for(let k=0;k<5;k++){const y=10+k*10+((k*7)%5);px(g,k&1?MG:CY,8,y,80,1);px(g,K,30+k*9,y+2,20,2)}}
  neon(g,[[7,7],[88,7]],MG,mg);neon(g,[[7,60],[88,60]],CY,cy);
  for(const q of [[2,2],[92,2],[2,66],[92,66]])px(g,WH,q[0],q[1],2,2);
  for(let x=20;x<80;x+=18){px(g,K,x,0,5,3);px(g,YL,x+1,1,3,1)}
})}

/* ======================================================================
   FUSION OF ALL MACHINES ART
   ====================================================================== */
const SKIN=['#1c1008','#3a2a10','#6f4f25','#9a6759','#d8a878'];
const CHIT=[K,'#0f2214',GD,GR,LG];
const DRG=[K,EM,BR,rd,RD];
const AR=[N1,NV,D,GM,LM];
function part(w,h,ox,oy,fn){const c=fin(cnv(w,h,fn));return {c,w:whiteOf(c),ox:ox-1,oy:oy-1}}
function buildFusion(){
  const F={};
  /* Ra's sun disc, behind everything */
  const disc=(rot,broken)=>part(108,108,30-54,-44-54,g=>{const c=53.5;
    for(let y=0;y<108;y++)for(let x=0;x<108;x++){const dx=x-c,dy=y-c,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
      if(d<=31){px(g,rampAt(['#2a1008',BR,TN,OR],.3+.3*(1-d/31)+(-dx-dy)/31*.15,x,y),x,y);continue}
      if(d<=37){if(broken&&a>.4&&a<1.1)continue;px(g,rampAt([BR,TN,OR,YL,WH],.55+(-dx-dy)/(37*1.4)*.45-(d>35.5?.25:0),x,y),x,y);continue}
      const k=(a+PI+rot)/(TAU/16),fk=k-Math.floor(k),ray=Math.floor(mod(k,16)),len=ray%2?47:53;
      if(d<=len&&Math.abs(fk-.5)<(1-(d-37)/(len-37))*.32){if(broken&&ray%3===0&&d>41)continue;px(g,rampAt([BR,OR,YL],1-(d-37)/(len-37)*.8+(-dx-dy)/150,x,y),x,y)}}
    for(let i=0;i<72;i++){const a=i/72*TAU;px(g,i%2?BR:'#2a1008',c+Math.cos(a)*33.5,c+Math.sin(a)*33.5)}
    if(broken){line(g,K,c+20,c-20,c+8,c-6);line(g,K,c+8,c-6,c+12,c+4);line(g,K,c-30,c+8,c-18,c+4)}
  });
  F.disc=[0,1,2,3].map(i=>disc(i*TAU/64,false));F.discX=[0,1].map(i=>disc(i*TAU/32,true));
  /* worm tail segments (asteroid worm flesh, bolted steel bands) */
  F.tail=[];for(let k=0;k<9;k++){const r=12-k*.85;F.tail.push(part(Math.ceil(r*2+3)+(k===8?9:0),Math.ceil(r*2+3),0,0,g=>{const cx=(r*2+3)/2,cy=cx;
    if(k===8)for(let x=0;x<9;x++){const hh=(9-x)*.45;px(g,x<5?LM:LL,r*2+2+x,cy-hh,1,hh*2+1)}
    ell(g,cx,cy,r,r,SKIN);for(let a=0;a<TAU;a+=.06){const x=cx+Math.cos(a)*r*.62,y=cy+Math.sin(a)*r*.62;if(Math.cos(a)>-.2)px(g,(a*10|0)%2?GM:LL,x,y)}
    px(g,MG,cx-1,cy-r*.4,2,2);px(g,WH,cx-1,cy-r*.4,1,1)}));F.tail[k].r=r}
  /* kraken tentacle beads */
  F.tent=[];for(let r=2;r<=7;r++)F.tent[r]=part(r*2+2,r*2+2,0,0,g=>{ell(g,r+1,r+1,r,r,[N0,VI,cy,CY]);if(r>2){px(g,LV,r+1,r+r*.5+1,1,1);px(g,PU,r,r+r*.5+1,1,1)}});
  /* hive carapace torso */
  const torso=cracked=>part(97,91,-42,-46,g=>{const ox=-42,oy=-46,cx=10-ox,cy=2-oy,rx=44,ry=40;
    for(let y=0;y<91;y++)for(let x=0;x<97;x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,d=nx*nx+ny*ny;if(d>1)continue;
      const nz=Math.sqrt(1-d),l=-.5*nx-.55*ny+.68*nz,band=Math.abs(Math.sin(ny*7.6))<.11;
      const col_=Math.floor(x/6),hy=y/5.4+(col_&1)*.5,row=Math.floor(hy),seam=(x%6===0)||(hy-row<.16);
      let col=rampAt(CHIT,(l+.12)/1.05,x,y);
      if(band||seam)col=d>.8?GD:'#0c1a10';
      else if(hash(col_,row)<.13&&d<.85)col=hash(row,col_)<.5?OR:(((x+y)&1)?YL:OR);
      if(d>.9)col=l>.2?LG:GD;
      if(cracked){const gx=(x+ox+6)/14,gy=(y+oy-2)/30;const gd=gx*gx+gy*gy+Math.sin(y*.7)*.08;if(gd<1)col=gd<.55?(((x+y)&1)?RD:rd):(gd<.8?EM:K)}
      px(g,col,x,y)}
  });
  F.torso=torso(false);F.torsoX=torso(true);
  /* ice ship hull plates bolted on */
  const ICE=[VI,cy,CY,WH];
  F.hull=part(97,96,-44,-54,g=>{const ox=-44,oy=-54,T=P_=>P_.map(p=>[p[0]-ox,p[1]-oy]);
    for(const pp of [[[-40,-26],[-10,-46],[24,-50],[46,-36],[22,-26],[-16,-16]],[[-30,26],[20,22],[38,30],[30,41],[-18,41]],[[38,-14],[52,-8],[50,14],[36,10]]]){
      const Q=T(pp);g.drawImage(plate(97,96,polyM(Q),{ramp:ICE,rim:WH,shadow:VI,lit:(i,j)=>.92-j/96*.5-i/97*.2}),0,0);
      for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length],n=Math.max(2,Math.floor(Math.hypot(b[0]-a[0],b[1]-a[1])/5));for(let k=1;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,cx=Q.reduce((s,p)=>s+p[0],0)/Q.length,cy=Q.reduce((s,p)=>s+p[1],0)/Q.length,dd=Math.hypot(cx-x,cy-y)||1;px(g,VI,x+(cx-x)/dd*2.5,y+(cy-y)/dd*2.5)}}}
    for(let i=0;i<5;i++){const x=-10+i*9-ox,y=-36+i*-1.6-oy;px(g,K,x,y,4,3);px(g,CY,x+1,y+1,2,1);px(g,WH,x+1,y+1,1,1)}
    line(g,WH,-30-ox,-24-oy,-20-ox,-30-oy);line(g,CY,0-ox,32-oy,14-ox,30-oy);
  });
  F.hullX=part(97,96,-44,-54,g=>{const ox=-44,oy=-54;for(const pp of [[[-40,-26],[-30,-32],[-26,-22],[-36,-20]],[[30,-40],[46,-36],[36,-30]],[[-30,30],[-22,26],[-18,38]]])g.drawImage(plate(97,96,polyM(pp.map(p=>[p[0]-ox,p[1]-oy])),{ramp:ICE,rim:WH,shadow:VI}),0,0)});
  /* billboard chrome chest screen: the glitching eye */
  F.screen=[0,1,2].map(k=>part(41,33,-26,-14,g=>{
    for(let y=0;y<33;y++)for(let x=0;x<41;x++){const e=x<3||x>37||y<3||y>29;if(e)px(g,CHM[Math.min(10,Math.floor(y/33*11))][1],x,y)}
    px(g,K,3,3,35,1);px(g,K,3,29,35,1);px(g,K,3,3,1,27);px(g,K,37,3,1,27);
    for(let y=4;y<29;y++)for(let x=4;x<37;x++)px(g,y%2?N1:'#120a24',x,y);
    if(k===2){const r=rng(5);for(let y=4;y<29;y++)for(let x=4;x<37;x++){if(r()<.45)px(g,[VI,BL,LV,WH,MG,K][(r()*6)|0],x,y)}}
    else{const sh=k===1?4:0;
      for(let y=8;y<26;y++)for(let x=6;x<36;x++){const ox_=y>=13&&y<=16?sh:0,dx=(x-ox_-20.5)/13,dy=(y-16.5)/7.5,d=dx*dx+dy*dy;if(d>1)continue;const ir=Math.hypot(x-ox_-20.5,(y-16.5)*1.3);
        px(g,ir<2.2?K:ir<4?(((x+y)&1)?MG:LV):ir<6?mg:(d>.8?LL:WH),x,y)}
      px(g,WH,17+(k?sh:0),13,2,1);
      if(k===1){px(g,RD,6,13,30,1);px(g,CY,10,17,26,1)}}
    neon(g,[[2,1],[38,1]],MG,mg);neon(g,[[2,31],[38,31]],CY,cy);
  }));
  /* mech claw arm (lower) */
  const clawArm=open=>part(70,48,-86,2,g=>{const ox=-86,oy=2,T=(x,y)=>[x-ox,y-oy];
    const L1=limbPts(...T(-24,18),...T(-48,32),5,4),L2=limbPts(...T(-48,32),...T(-68,27),4,3.5);
    g.drawImage(plate(70,48,polyM(L1),{ramp:AR,rim:LL,shadow:N1}),0,0);g.drawImage(plate(70,48,polyM(L2),{ramp:AR,rim:LL,shadow:N1}),0,0);
    neon(g,[T(-50,31),T(-66,27)],CY,cy);
    const tips=open?[[-84,15],[-86,28],[-80,42]]:[[-77,22],[-80,28],[-77,34]];
    for(const t of tips){const a=T(-68,27),b=T(t[0],t[1]);thick(g,K,a[0],a[1],b[0],b[1],3);thick(g,LM,a[0],a[1]-.5,b[0],b[1]-.5,2);px(g,WH,b[0],b[1],1,1)}
    ell(g,...T(-24,18),6,6,[N1,D,GM,LL]);ell(g,...T(-48,32),4.5,4.5,[N1,D,GM,LL]);ell(g,...T(-68,27),3.5,3.5,[N1,GM,LL,WH]);px(g,MG,...T(-48,32),1,1);
  });
  F.claw=[clawArm(true),clawArm(false)];
  F.clawX=part(70,48,-86,2,g=>{const ox=-86,oy=2,T=(x,y)=>[x-ox,y-oy];g.drawImage(plate(70,48,polyM(limbPts(...T(-24,18),...T(-36,26),5,4)),{ramp:AR,rim:LL,shadow:N1}),0,0);
    ell(g,...T(-24,18),6,6,[N1,D,GM,LL]);line(g,RD,...T(-36,26),...T(-44,30));line(g,YL,...T(-36,25),...T(-42,22));line(g,CY,...T(-35,27),...T(-40,34))});
  /* mech cannon arm (upper) */
  const canArm=broken=>part(86,40,-97,-39,g=>{const ox=-97,oy=-39,T=pp=>pp.map(p=>[p[0]-ox,p[1]-oy]);
    if(!broken){g.drawImage(plate(86,40,polyM(T([[-34,-24],[-60,-26],[-80,-23],[-94,-22],[-94,-12],[-80,-11],[-60,-8],[-34,-11]])),{ramp:AR,rim:LL,shadow:N1,lit:(i,j)=>.9-j/40*.7}),0,0);
      for(const x of [-82,-74,-66])px(g,K,x-ox,-24-oy,1,13);px(g,K,-95-ox,-20-oy,2,6);
      neon(g,T([[-90,-17],[-40,-17]]),CY,cy);for(const x of [-60,-52,-44])px(g,RD,x-ox,-11-oy,3,1)}
    else{line(g,RD,-36-ox,-18-oy,-46-ox,-22-oy);line(g,YL,-36-ox,-15-oy,-44-ox,-12-oy);line(g,CY,-37-ox,-17-oy,-48-ox,-16-oy)}
    g.drawImage(plate(86,40,(x,y)=>((x+.5-(-28-ox))/15)**2+((y+.5-(-22-oy))/12)**2<=1,{ramp:AR,rim:LL,shadow:N1,lit:(i,j)=>.95-j/40*.9}),0,0);
    neon(g,T([[-40,-28],[-28,-31],[-16,-26]]),MG,mg);
    if(broken){line(g,K,-34-ox,-30-oy,-26-ox,-20-oy);line(g,K,-26-ox,-20-oy,-30-ox,-14-oy)}
    for(const q of [[-36,-26],[-22,-28],[-20,-16]])px(g,LL,q[0]-ox,q[1]-oy,1,1);
  });
  F.can=canArm(false);F.canX=canArm(true);
  /* neck of magma rings */
  F.neck=part(52,40,-62,-60,g=>{const ox=-62,oy=-60;for(let i=0;i<5;i++){const t=i/4,x=-24+(-52+24)*t-ox,y=-34+(-48+34)*t-oy,r=8-i*.6;ell(g,x,y,r,r*.9,i%2?DRG:[NV,VI,LM,LL,WH]);if(i%2)px(g,OR,x-1,y,2,1)}});
  /* lava dragon head with a billboard chrome jaw */
  const head=k=>part(64,48,-108,-78,g=>{
    const jaw=[[4,30],[20,31+k*2],[38,33],[50,32],[48,37],[34,39+k*3],[16,37+k*5],[6,34+k*4]];
    if(k){fillPoly(g,[[4,28],[42,28],[44,33+k],[14,34+k*4]],k>1?YL:OR);fillPoly(g,[[18,30],[42,30],[42,32+k],[22,33+k*3]],WH)}
    g.drawImage(plate(64,48,polyM(jaw),{ramp:[K,VI,GM,LL],rim:WH,shadow:N0,lit:(i,j)=>{const f=(j-30)/12;return f<.3?.9:f<.5?.2:.55}}),0,0);
    const skull=[[2,28],[8,22],[18,19],[30,14],[42,12],[54,14],[60,21],[58,30],[46,33],[26,31],[10,31]];
    const nz=mkNoise(9);
    g.drawImage(plate(64,48,polyM(skull),{ramp:DRG,rim:RD,shadow:K,lit:(i,j)=>.95-j/48*.9-i/64*.1,extra:(i,j,c)=>{if(c===K)return null;const v=Math.abs(Math.sin(i*.42+j*.8+nz.fbm(i*.2,j*.2,2)*5));return v<.09?(v<.04?YL:OR):null}}),0,0);
    g.drawImage(plate(64,48,polyM([[40,13],[50,3],[60,0],[53,8],[48,15]]),{ramp:[K,D,LM,LL],rim:WH}),0,0);
    g.drawImage(plate(64,48,polyM([[50,16],[60,8],[64,10],[56,19]]),{ramp:[K,D,LM,LL],rim:WH}),0,0);
    px(g,K,38,18,7,4);px(g,YL,39,19,5,2);px(g,RD,41,19,1,2);px(g,WH,39,19,1,1);
    px(g,K,8,24,2,2);px(g,OR,8,25,1,1);
    for(let x=7;x<40;x+=3){px(g,WH,x,30,1,2);px(g,WH,x+1,31+k*2-(x>30?1:0),1,1)}
    neon(g,[[16,36+k*4],[44,35]],MG,mg);
  });
  F.head=[0,1,2].map(head);
  /* gas fortress stacks on the back */
  F.stk=part(26,22,22,-68,g=>{for(const x of [3,15]){g.drawImage(plate(26,22,(i,j)=>i>=x&&i<=x+6&&j>=2,{ramp:[N1,NV,D,GM],rim:LM,shadow:N0}),0,0);px(g,K,x,2,7,2);px(g,GM,x+1,6,5,1)}
    ell(g,13,18,7,4,[N1,PU,LP,LV]);px(g,K,6,16,2,1)});
  F.core=[cnv(23,23,g=>ell(g,11.5,11.5,10,10,[rd,MG,LV,WH])),cnv(23,23,g=>ell(g,11.5,11.5,11,11,[MG,LV,WH,WH]))];
  F.coreW=F.core.map(whiteOf);
  return F;
}

/* ======================================================================
   BACKGROUND ART
   ====================================================================== */
function flameF(w,h,f,seed){const n=mkNoise(seed+f*17);return cnv(w,h,g=>{const cx=(w-1)/2;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=Math.abs(x-cx)/(w/2),fy=(h-1-y)/h,fl=n.fbm(x*.35,y*.22-f*.9,2);
    const v=(1-fy)*(1-dx*dx)*1.3+(fl-.5)*.75-fy*.15;if(v<.14)continue;if(v<.24&&BAYER[y&3][x&3]>7)continue;
    px(g,v>1?WH:v>.78?YL:v>.52?OR:v>.32?rd:BR,x,y)}})}
function puffF(r,seed){const n=mkNoise(seed),S=r*2+2;return cnv(S,S,g=>{
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=(x-r)/r,dy=(y-r)/r,d=dx*dx+dy*dy+(n.fbm(x*.2,y*.2,2)-.5)*.7;if(d>1)continue;
    if(d>.7&&BAYER[y&3][x&3]>8)continue;const lit=dy>.35&&d>.45;px(g,lit?(((x+y)&1)?'#4a2024':'#2a1620'):d<.3?'#191220':((x+y)&1)?'#120c1a':'#0d0914',x,y)}})}
function smokeBank(w,h,seed,thr,ramp){const n=mkNoise(seed);return dithered(w,h,(x,y)=>{const s=x/w,v=n.fbm(x*.016,y*.05,4)*(1-s)+n.fbm((x-w)*.016,y*.05,4)*s,dy=Math.abs(y-h/2)/(h/2),d=v*(1-dy*dy)-thr;if(d<0)return -1;return clamp(d*3.2+(y/h)*.3,0,.999)},ramp)}
/* a skyline layer: towers with lit windows, fire bands, broken tops, sky bridges; two variants for the flicker */
function skyline(TW,TH,seed,o){
  const R=rng(seed),a=mk(TW,TH),b=mk(TW,TH),ga=a.getContext('2d'),gb=b.getContext('2d'),flames=[],bills=[],smoke=[],sparks=[];
  const both=(col,x,y,w,h,colB)=>{px(ga,col,x,y,w,h);px(gb,colB||col,x,y,w,h)};
  let x=Math.floor(R()*8),prev=null;
  while(x<TW-o.wmin-2){
    const w=Math.min(TW-2-x,o.wmin+Math.floor(R()*(o.wmax-o.wmin))),top=o.tmin+Math.floor(R()*(o.tmax-o.tmin)),burn=R()<o.burn,broken=o.broken&&R()<.35;
    const fy0=top+6+Math.floor(R()*30),fy1=fy0+10+Math.floor(R()*24);
    both(o.body,x,top,w,TH-top);both(o.rimL,x,top,1,TH-top);both(o.rimR,x+w-1,top,1,TH-top);both(o.roof,x,top,w,1);
    if(o.floors)for(let y=top+o.wy;y<TH;y+=o.wy*2)both(o.floor,x+1,y+o.ww,w-2,1);
    for(let y=top+3;y<TH-2;y+=o.wy)for(let i=x+2;i<x+w-2-o.ww+1;i+=o.wx){
      const inFire=burn&&y>=fy0&&y<=fy1,r=R();
      if(inFire){if(r<.75){both(OR,i,y,o.ww,o.wh,r<.3?YL:rd);if(r<.2)both(YL,i,y,1,1,OR)}continue}
      if(r<o.lit){const c=R()<.12?(R()<.5?CY:MG):R()<.25?BL:VI;both(c,i,y,o.ww,o.wh,R()<.06?N1:c)}}
    if(burn){both(o.glow,x,fy0-2,1,fy1-fy0+4);both(o.glow,x+w-1,fy0-2,1,fy1-fy0+4);if(o.flames)flames.push({x:x+2+Math.floor(R()*(w-6)),y:fy0-1,s:w>30?1:0,ph:R()*9});smoke.push({x:x+(w>>1),y:fy0})}
    if(broken){const d=4+Math.floor(R()*10),cxp=x+Math.floor(w*(.3+R()*.4));
      for(let i=x;i<x+w;i++){const cut=Math.max(0,d-Math.abs(i-cxp)*d/(w*.5)+(R()*3|0));ga.clearRect(i,top,1,cut);gb.clearRect(i,top,1,cut)}
      for(let k=0;k<3;k++){const yy=top+d-1+k*3;both(GM,x-2,yy,4+Math.floor(R()*6),1);both(D,x+w-4,yy+1,6,1)}
      flames.push({x:cxp-3,y:top+d-4,s:w>26?2:1,ph:R()*9});smoke.push({x:cxp,y:top});sparks.push({x:x-2,y:top+d})}
    else if(R()<.55){const ax=x+2+Math.floor(R()*(w-4)),al=4+Math.floor(R()*12);both(o.rimL,ax,top-al,1,al);both(RD,ax,top-al,1,1,rd)}
    if(o.bridges&&prev&&R()<.6){const by=Math.max(top,prev.top)+8+Math.floor(R()*28),x0=prev.x+prev.w,x1=x;if(x1-x0>3){const brk=R()<.45;
      for(let i=x0;i<x1;i++){if(brk&&Math.abs(i-(x0+x1)/2)<4)continue;both(K,i,by,1,4);both(D,i,by+1,1,1);both(i%3?NV:CY,i,by+2,1,1)}
      if(brk){const m=(x0+x1)>>1;line(ga,D,m-5,by+3,m-4,by+8);line(gb,D,m-5,by+3,m-4,by+8);line(ga,D,m+4,by+3,m+6,by+9);line(gb,D,m+4,by+3,m+6,by+9);sparks.push({x:m-4,y:by+8})}}}
    if(o.bills&&w>=22&&R()<.75)bills.push({x:x+2+Math.floor(R()*(w-20)),y:top+12+Math.floor(R()*Math.max(4,TH-top-60)),k:Math.floor(R()*6),id:bills.length});
    prev={x,w,top};x+=w+Math.floor(R()*o.gap)}
  return {a,b,flames,bills,smoke,sparks,TW};
}
function nearBottom(TW,TH){const R=rng(808),c=mk(TW,TH),g=c.getContext('2d'),fl=[];let x=0;
  while(x<TW){let w=16+Math.floor(R()*36);if(TW-x-w<14)w=TW-x;const h=6+Math.floor(R()*14),top=TH-h;
    px(g,N0,x,top,w,h);px(g,OR,x,top,w,1);px(g,BR,x,top+1,w,1);px(g,'#1a0c14',x,top+2,w,1);px(g,'#2a1018',x,top,1,h);
    const k=Math.floor(R()*5);
    if(k===0){px(g,N0,x+3,top-4,6,4);px(g,TN,x+3,top-4,6,1)}
    else if(k===1){px(g,N0,x+w-8,top-7,5,7);px(g,BR,x+w-8,top-7,5,1);px(g,N0,x+w-9,top-9,7,2);px(g,TN,x+w-9,top-9,7,1)}
    else if(k===2){px(g,N0,x+4,top-12,1,12);px(g,RD,x+4,top-12,1,1);line(g,N0,x+1,top-6,x+7,top-6)}
    else if(k===3){for(let i=x+1;i<x+w-1;i+=2)px(g,N0,i,top-3,1,3);px(g,N0,x+1,top-3,w-2,1)}
    if(R()<.5)fl.push({x:x+2+Math.floor(R()*(w-8)),y:top,s:R()<.4?1:0,ph:R()*9});
    if(R()<.3){neon(g,[[x+3,top+5],[x+Math.min(w-3,12),top+5]],R()<.5?MG:CY,R()<.5?mg:cy)}
    x+=w}
  return {c,fl}}
function nearTop(TW,TH){const R=rng(909),c=mk(TW,TH),g=c.getContext('2d'),poles=[];
  px(g,N0,0,0,TW,7);px(g,'#1a1028',0,7,TW,1);px(g,VI,0,8,TW,1);
  for(let i=0;i<TW;i+=10){line(g,N1,i,1,i+9,6);line(g,N1,i+9,1,i,6)}
  for(let p=40;p<TW;p+=TW/2){poles.push(p);px(g,N0,p-1,8,3,8);px(g,GM,p-2,15,5,1);px(g,LL,p-2,16,1,1);px(g,LL,p+2,16,1,1)}
  for(let k=0;k<poles.length;k++){const a=poles[k],b=k+1<poles.length?poles[k+1]:poles[0]+TW;for(let i=a;i<=b;i++){const s=(i-a)/(b-a),y=16+Math.sin(s*PI)*7;px(g,N1,mod(i,TW),y,1,1)}}
  for(let i=0;i<10;i++){const x=Math.floor(R()*TW),l=2+Math.floor(R()*8);px(g,N0,x,9,1,l);if(R()<.5){px(g,K,x-1,9+l,3,2);px(g,R()<.5?YL:RD,x,9+l,1,1)}}
  return {c,poles}}
/* neon billboards and holograms: each [normal, glitch] */
function mkBills(){
  const out=[];
  const ad=(fn)=>{const A_=cnv(30,21,g=>{px(g,K,0,0,30,19);px(g,LM,1,1,28,1);px(g,GM,1,17,28,1);for(let y=2;y<17;y++)for(let x=2;x<28;x++)px(g,rampAt([PU,mg,MG],1-(y-2)/15,x,y),x,y);fn(g);px(g,D,6,19,2,2);px(g,D,22,19,2,2)});
    const B_=cnv(30,21,g=>{g.drawImage(A_,0,0);g.drawImage(A_,2,6,26,4,6,6,26,4);g.drawImage(A_,2,11,26,3,0,11,26,3);px(g,CY,2,9,26,1);px(g,K,2,14,26,2);px(g,WH,10+((Math.random()*8)|0),4,6,1)});return [A_,B_]};
  out.push(ad(g=>{ell(g,15,9,6,6,[BR,OR,YL,WH]);px(g,K,12,7,2,2);px(g,K,17,7,2,2);px(g,K,12,12,7,1);px(g,K,11,11,1,1);px(g,K,19,11,1,1)}));
  out.push(ad(g=>{px(g,K,8,4,8,12);px(g,CY,9,5,6,10);px(g,WH,9,5,2,10);px(g,RD,9,9,6,2);for(let i=0;i<4;i++)px(g,YL,19+i*2,4+((i*5)%9),1,1)}));
  // vertical neon sign of symbols
  {const sym=(on)=>cnv(12,36,g=>{px(g,N0,1,0,10,36);const c1=on?MG:'#3a1a3a',c2=on?CY:'#1a2a3a';neon(g,[[1,1],[10,1],[10,34],[1,34],[1,1]],c1,on?mg:'#2a1028');
      neon(g,[[4,5],[7,5],[8,7],[7,9],[4,9],[3,7],[4,5]],c2,on?cy:N1);neon(g,[[3,18],[6,13],[9,18],[3,18]],on?YL:'#3a3a1a',on?OR:N1);if(on)neon(g,[[3,25],[5,23],[7,27],[9,25]],CY,cy);else neon(g,[[3,25],[5,23]],c2,N1);neon(g,[[5,29],[6,32]],c1,on?mg:N1)});
    out.push([sym(true),sym(false)])}
  // big neon arrow
  {const arr=(on)=>cnv(28,13,g=>{const pts=[[1,6],[8,1],[8,4],[26,4],[26,8],[8,8],[8,11],[1,6]];neon(g,pts,on?CY:'#1a2a3a',on?cy:N1);if(on)for(let x=10;x<25;x+=4)px(g,WH,x,6,2,1)});out.push([arr(true),arr(false)])}
  // hologram face (ghosted)
  {const face=cnv(34,44,g=>{ell(g,17,20,14,18,[N1,VI,BL,LV,WH]);px(g,K,9,16,6,3);px(g,K,20,16,6,3);px(g,CY,11,17,2,1);px(g,CY,22,17,2,1);px(g,K,13,30,9,2);px(g,LL,16,24,2,4);px(g,LV,6,34,22,6)});
    out.push([holo(face,0,[NV,cy,CY,WH]),holo(cnv(34,44,g=>{g.drawImage(face,0,0);g.drawImage(face,0,10,34,6,5,10,34,6);g.drawImage(face,0,26,34,5,-4,26,34,5)}),1,[PU,mg,MG,WH])])}
  // corrupted hologram: pyramid eye
  {const eye=cnv(30,26,g=>{fillPoly(g,[[15,0],[29,25],[1,25]],VI);line(g,LV,15,0,29,25);line(g,LV,15,0,1,25);line(g,LV,1,25,29,25);ell(g,15,16,6,3.6,[NV,LL,WH]);ell(g,15,16,2.4,2.4,[K,MG,LV])});
    out.push([holo(eye,0,[PU,mg,MG,WH]),holo(cnv(30,26,g=>{g.drawImage(eye,3,0);g.drawImage(eye,0,12,30,4,-5,12,30,4)}),1,[NV,cy,CY,WH])])}
  // background signs sit behind the action: a checker of shadow keeps them from reading as enemies
  return out.map((pr,k)=>pr.map(c=>cnv(c.width,c.height,g=>{g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=N1;for(let y=0;y<c.height;y++)for(let x=(y+k)&1;x<c.width;x+=2)g.fillRect(x,y,1,1)})));
}

/* ======================================================================
   REGISTRATION
   ====================================================================== */
PACKS[9]={
init(){
  A={noFG:true,enemies:{},bullets:{}};
  const t0=performance.now(),prof={},mark=k=>{prof[k]=Math.round(performance.now()-t0)};
  /* ---------- sprites ---------- */
  const COP=[0,1,2,3].map(copF),COPW=COP.map(whiteOf);
  const RIOT=[0,1,2,3].map(riotF),RIOTW=RIOT.map(whiteOf);
  const DBOT=[0,1,2,3].map(botF),DBOTW=DBOT.map(whiteOf);
  const CAR=[0,1,2].map(p=>[0,1,2,3].map(f=>carF(p,f))),CARW=CAR.map(s=>s.map(whiteOf));
  const CON=[0,1,2,3,4,5].map(f=>fin(polyF(19,8,f/6*PI/2,CY))),CONW=CON.map(whiteOf),CONR=CON.map(c=>sil(c,RD)),CONC=CON.map(c=>sil(c,CY));
  const CONs=[0,1,2,3,4,5].map(f=>fin(polyF(13,5.4,f/6*PI/2,MG))),CONsW=CONs.map(whiteOf),CONsR=CONs.map(c=>sil(c,RD)),CONsC=CONs.map(c=>sil(c,CY));
  const DROP=[0,1,2,3].map(dropF),DROPW=DROP.map(whiteOf),VAN=[0,1,2,3].map(vanF),VANW=VAN.map(whiteOf);
  const PARCW=whiteOf(PARC);
  const CONE=[0,1].map(k=>cnv(28,40,g=>{const ax=23,bl=k?2:0,br=k?24:18;for(let y=1;y<40;y++){const f=y/40,x0=ax+(bl-ax)*f,x1=ax+(br-ax)*f;for(let x=Math.floor(x0);x<=x1;x++){const b=BAYER[y&3][x&3];if(b===0||(y<12&&b===8))px(g,y<16?CY:cy,x,y)}}}));
  const BEAM=cnv(16,9,g=>{for(let x=0;x<16;x++){const hh=(15-x)/15*3.5+.5;for(let y=Math.floor(4-hh);y<=4+hh;y++){const b=BAYER[y&3][x&3];if(b<(x>10?3:1))px(g,x>10?WH:YL,x,y)}}});
  const wreck=fin(cnv(25,12,g=>{g.drawImage(carF(2,2),0,0);g.globalCompositeOperation='source-atop';for(let i=0;i<30;i++)px(g,(i&1)?N0:BR,Math.random()*25,Math.random()*12,2,1)}));
  const RK={big:[[],[],[]],small:[[],[],[]]};
  {const bases=[wreck,girderS(),panelS()],sm=[chunkS(3),shardS(),tubeS()];
    for(let k=0;k<3;k++)for(let f=0;f<8;f++){const c=fin(rotC(bases[k],f/8*TAU,k===1?28:27));RK.big[k].push(c)}
    for(let k=0;k<3;k++)for(let f=0;f<6;f++){const c=fin(rotC(sm[k],f/6*TAU,13));RK.small[k].push(c)}}
  const RKW={big:RK.big.map(s=>s.map(whiteOf)),small:RK.small.map(s=>s.map(whiteOf))};
  mark('enemies');
  /* mini boss */
  const MH=[0,1,2].map(k=>fin(chromeDragonHead(k))),MHW=MH.map(whiteOf),MHH=[0,1].map(p=>holo(MH[0],p,[NV,cy,CY,WH])),MHH2=[0,1].map(p=>holo(MH[2],p,[NV,cy,CY,WH]));
  const MHM=[0,1].map(p=>holo(MH[1],p,[PU,mg,MG,WH]));
  const MSEG=[fin(segM(7,false)),fin(segM(6,true)),fin(segM(5,false)),fin(segM(4,true))],MSEGW=MSEG.map(whiteOf),MSEGH=MSEG.map(c=>holo(c,0,[NV,cy,CY,WH]));
  const MCL=[fin(clawM(true)),fin(clawM(false))],MCLW=MCL.map(whiteOf),MCLH=MCL.map(c=>holo(c,1,[NV,cy,CY,WH]));
  const BILL=[billboard(false),billboard(true)];
  const POLE=cnv(12,40,g=>{px(g,K,2,0,8,40);px(g,GM,3,0,1,40);px(g,D,4,0,4,40);px(g,N1,7,0,2,40);for(let y=4;y<40;y+=9){px(g,K,0,y,12,2);px(g,LM,1,y,10,1)}});
  mark('mini');
  /* fusion: built on first use (level 3 only), during the pause between rush segments */
  let FU=null;
  /* ---------- backgrounds ---------- */
  const nz=mkNoise(31);
  const SKY=dithered(320,200,(x,y)=>clamp(Math.pow(y/200,1.45)*.95+(nz.fbm(x*.02,y*.03,3)-.5)*.16,0,.999),['#05030c','#0a0618','#120a24','#1c1840','#2a1438','#40162e','#5a1c24','#7a2a20']);
  const SM1=smokeBank(640,74,7,.33,['#08060e','#0e0a16','#16101e','#221626','#3a1a24']);
  const SM2=smokeBank(560,64,13,.36,['#120a12','#1c0e16','#2e121a','#4a1a1e','#6a2a20']);
  const FAR=skyline(640,186,1201,{wmin:12,wmax:30,tmin:16,tmax:112,gap:6,burn:.35,body:N1,rimL:NV,rimR:'#2a1028',roof:VI,floor:N2,wx:3,wy:3,ww:1,wh:1,lit:.22,glow:'#4a1a20',floors:false});
  const MID=skyline(720,186,3307,{wmin:22,wmax:44,tmin:46,tmax:124,gap:16,burn:.45,body:N2,rimL:VI,rimR:'#4a1a20',roof:BL,floor:N1,wx:5,wy:5,ww:2,wh:2,lit:.2,glow:BR,floors:true,broken:true,bridges:true,bills:true,flames:true});
  const MIDT=cnv(720,30,g=>{const R=rng(77);let x=0;while(x<720){const w=20+Math.floor(R()*50),h=6+Math.floor(R()*18);px(g,N1,x,0,w,h);px(g,VI,x,h-1,w,1);px(g,'#2a1028',x,h-2,w,1);
      for(let i=x+3;i<x+w-3;i+=5)if(R()<.5)px(g,R()<.2?RD:R()<.5?YL:CY,i,h-4,1,1);if(R()<.5){const cx=x+Math.floor(R()*w);line(g,N1,cx,h,cx+Math.floor(R()*4-2),h+4+Math.floor(R()*8))}x+=w}});
  mark('skylines');
  const NB=nearBottom(480,30),NT=nearTop(480,24);
  const FLM=[[5,8],[8,13],[12,18]].map((s,i)=>[0,1,2,3].map(f=>flameF(s[0],s[1],f,i*31+5)));
  const PUFF=[puffF(6,3),puffF(10,7),puffF(16,11)];
  const BILLS=mkBills();
  const TRF=[],TRN=[],EMB=[];
  {const r=rng(55);
    for(let i=0;i<28;i++)TRF.push({y:30+r()*120,v:(r()<.75?-1:1)*(18+r()*70),p:r()*400,a:r()<.35?6+r()*14:0,f:.3+r()*1.2,c:[WH,YL,CY,MG,OR][(r()*5)|0],near:r()<.3});
    for(let i=0;i<3;i++)TRN.push({y:46+i*38+r()*10,v:-(36+r()*30),p:r()*600,n:5+((r()*5)|0),a:4+r()*8,f:.2+r()*.3});
    for(let i=0;i<40;i++)EMB.push({x:r()*W,y:r()*H,vx:-(20+r()*60),vy:-(14+r()*40),ph:r()*9,s:r()<.2?2:1,c:[OR,YL,RD,OR][(r()*4)|0]})}
  const DEX=[{x:60,y:70,p:0},{x:230,y:55,p:.4},{x:150,y:110,p:.75}];

  const flick=(T,id)=>{const r=hash((T*7)|0,id*13+3);return r<.1?1:r<.14?2:0};
  function strip(L,sp,T,y){const off=Math.floor(mod(T*sp,L.TW));return off}
  function drawSky(T){
    ctx.drawImage(SKY,0,0);
    tile(SM1,T*2,TOP);
    // far skyline and its distant explosions
    const fv=((T*5)|0)&1;tile(fv?FAR.b:FAR.a,T*6,TOP);
    for(const d of DEX){const ph=mod(T*.23+d.p,1);if(ph<.12){const x=mod(d.x-T*6,W+40)-20,r=1+ph*80;ctx.fillStyle=ph<.04?WH:ph<.08?YL:OR;ctx.fillRect(x-r/2|0,d.y-r/3|0,r|0,(r/1.5)|0);ctx.fillStyle=pat(OR);ctx.fillRect(x-r|0,d.y-r/1.5|0,r*2|0,(r*1.3)|0)}}
    // far traffic: tiny streaks in the sky lanes
    for(const q of TRF){if(q.near)continue;const x=mod(q.p+q.v*T,W+40)-20,y=q.y+(q.a?Math.sin(T*q.f+q.p)*q.a:0);ctx.fillStyle=q.c;ctx.fillRect(x|0,y|0,1,1);ctx.fillStyle=q.v<0?VI:rd;ctx.fillRect((x+(q.v<0?1:-2))|0,y|0,2,1)}
    tile(SM2,T*4,104);
  }
  function drawMid(T){
    const off=mod(T*14,720),mv=((T*6+1)|0)&1;
    tile(MIDT,T*14,TOP);tile(mv?MID.b:MID.a,T*14,TOP);
    // neon billboards and holograms
    for(const b of MID.bills){let x=b.x-off;if(x<-40)x+=720;if(x>W)continue;const st=flick(T,b.id+b.k*5);if(st===2&&b.k<4)continue;const s=BILLS[b.k][st===1?1:0];ctx.drawImage(s,x|0,(TOP+b.y)|0)}
    // flames on the burning towers
    for(const f of MID.flames){let x=f.x-off;if(x<-14)x+=720;if(x>W)continue;const s=FLM[f.s][((T*10+f.ph)|0)&3];ctx.drawImage(s,x|0,(TOP+f.y-s.height+2)|0)}
    // rolling black smoke columns
    for(let i=0;i<MID.smoke.length;i++){const sm=MID.smoke[i];let x0=sm.x-off;if(x0<-60)x0+=720;if(x0>W+30)continue;
      for(let k=0;k<7;k++){const ag=mod(T*.2+k/7+i*.13,1),sz=ag<.3?0:ag<.65?1:2,s=PUFF[sz],x=x0-ag*40+Math.sin(ag*6+i)*4,y=TOP+sm.y-ag*110;if(y<-20)continue;ctx.drawImage(s,(x-s.width/2)|0,(y-s.height/2)|0)}}
    // sparks on the broken bridges and floors
    for(const s of MID.sparks){let x=s.x-off;if(x<-4)x+=720;if(x>W)continue;const q=hash((T*12)|0,s.x);if(q<.3){ctx.fillStyle=q<.1?WH:YL;ctx.fillRect(x|0,(TOP+s.y)|0,1,1);ctx.fillRect((x+1)|0,(TOP+s.y+1+(q*20|0)%4)|0,1,1)}}
  }
  function drawNear(T){
    // near traffic and the trains looping along the sky lanes
    for(const tr of TRN){const x0=mod(tr.p+tr.v*T,W+tr.n*8+80)-40,y=tr.y+Math.sin(T*tr.f+tr.p)*tr.a;
      for(let k=0;k<tr.n;k++){const x=x0+k*8,yy=y+Math.sin(T*tr.f+tr.p-k*.08)*1.5;ctx.fillStyle=K;ctx.fillRect(x|0,(yy-1)|0,8,4);ctx.fillStyle=k===0?BL:VI;ctx.fillRect((x+1)|0,yy|0,6,2);ctx.fillStyle=((k+((T*3)|0))%3)?YL:CY;ctx.fillRect((x+2)|0,yy|0,1,1);ctx.fillRect((x+5)|0,yy|0,1,1)}
      ctx.fillStyle=WH;ctx.fillRect((x0-1)|0,y|0,1,1)}
    for(const q of TRF){if(!q.near)continue;const x=mod(q.p+q.v*T*1.4,W+40)-20,y=q.y+(q.a?Math.sin(T*q.f*1.5+q.p)*q.a:0);ctx.fillStyle=K;ctx.fillRect((x-1)|0,(y-1)|0,6,3);ctx.fillStyle=q.c===YL?OR:q.c;ctx.fillRect(x|0,y|0,4,1);ctx.fillStyle=q.v<0?WH:RD;ctx.fillRect((q.v<0?x:x+3)|0,y|0,1,1)}
    const no=mod(T*36,480);
    tile(NT.c,T*36,TOP);tile(NB.c,T*36,H-NB.c.height);
    for(const f of NB.fl){let x=f.x-no;if(x<-14)x+=480;if(x>W)continue;const s=FLM[f.s][((T*12+f.ph)|0)&3];ctx.drawImage(s,x|0,(H-NB.c.height+f.y-s.height+2)|0)}
    // sparking power line
    for(let k=0;k<NT.poles.length;k++){let x=NT.poles[k]-no;if(x<-240)x+=480;const q=hash((T*9)|0,k+1);if(q<.35){const s=hash((T*9)|0,k+7),xx=x+s*240,yy=TOP+16+Math.sin(s*PI)*7;ctx.fillStyle=WH;ctx.fillRect(xx|0,yy|0,2,1);ctx.fillStyle=pat(CY);ctx.fillRect((xx-2)|0,(yy-2)|0,6,5);if(q<.1){ctx.fillStyle=YL;ctx.fillRect((xx+2)|0,(yy+3)|0,1,1);ctx.fillRect((xx-1)|0,(yy+5)|0,1,1)}}}
  }
  A.tick=function(dt,live){clk();if(G.boss||G.state==='clear')S.ex+=dt;
    for(let i=0;i<EB.length;i++){const b=EB[i];if(b.fuse!=null&&!b.pop&&b.t>=b.fuse){b.pop=1;b.life=b.t+.0001;if(live&&room(8))ebRing(b.x,b.y,8,50,rnd(0,.8),{sty:'cyshr',life:2.6});FX.push({ring:1,x:b.x,y:b.y,r:2,life:.3,max:10,col:OR})}}};
  const TT=t=>t+(S.G===G?S.ex:0);
  A.drawBackground=function(t){const T=TT(t);drawSky(T);drawMid(T);drawNear(T)};
  A.drawForeground=function(t){const T=TT(t);
    // embers
    for(const m of EMB){const x=mod(m.x+m.vx*T,W),y=mod(m.y+m.vy*T+Math.sin(T*2+m.ph)*6,H);if(((T*3+m.ph)%1)>.8)continue;ctx.fillStyle=m.c;ctx.fillRect(x|0,y|0,m.s,m.s)}
    // electric arcs on the overhead line
    const k=(T*1.7)|0,q=hash(k,99);if(q<.4&&mod(T*1.7,1)<.25){const x0=hash(k,5)*W,y0=TOP+15;let lx=x0,ly=y0;for(let i=1;i<=6;i++){const nx=x0+i*5,ny=y0+(hash(k,i)*10-3)+i;ctx.fillStyle=i&1?WH:CY;lineF(lx,ly,nx,ny,(x,y)=>ctx.fillRect(x,y,1,1));lx=nx;ly=ny}}
    // girders whipping past at the edges
    const gx=W+40-mod(T*160,1300);if(gx>-40&&gx<W){ctx.drawImage(FGT,gx|0,TOP-6)}const gx2=W+40-mod(T*150+600,1500);if(gx2>-40&&gx2<W)ctx.drawImage(FGB,gx2|0,BOT-10)};
  const FGT=cnv(36,16,g=>{px(g,N0,0,0,36,6);for(let i=0;i<36;i+=6){line(g,N0,i,5,i+5,12);line(g,N0,i+5,5,i,12)}px(g,N0,0,11,36,2);neon(g,[[2,14],[30,14]],MG,mg)});
  const FGB=cnv(30,16,g=>{fillPoly(g,[[0,16],[6,2],[12,0],[24,4],[30,16]],N0);neon(g,[[7,3],[12,1],[22,4]],CY,cy);px(g,BR,8,6,14,1)});

  /* ---------- enemy bullets ---------- */
  const B=A.bullets;
  const orbB=(c0,c1,c2)=>(c,b)=>{const x=b.x|0,y=b.y|0,a=((b.t*16)|0)&1;c.fillStyle=K;c.fillRect(x-3,y-2,6,5);c.fillRect(x-2,y-3,4,7);c.fillStyle=a?c1:c0;c.fillRect(x-2,y-2,4,4);c.fillStyle=c2;c.fillRect(x-1,y-1,2,2);c.fillStyle=WH;c.fillRect(x-1,y-1,1,1)};
  B.cystun=(c,b)=>{orbB(cy,CY,WH)(c,b);const a=((b.t*20)|0)&3;c.fillStyle=WH;c.fillRect((b.x|0)+(a===0?2:a===2?-3:0),(b.y|0)+(a===1?2:a===3?-3:0),1,1)};
  B.cyplasma=orbB(mg,MG,LV);
  B.cysun=orbB(OR,YL,WH);
  B.cyfire=(c,b)=>{const s=Math.hypot(b.vx,b.vy)||1,ux=b.vx/s,uy=b.vy/s,x=b.x,y=b.y,a=((b.t*18)|0)&1;
    c.fillStyle=BR;c.fillRect((x-ux*7)|0,(y-uy*7)|0,1,1);c.fillStyle=rd;c.fillRect((x-ux*5)|0,(y-uy*5)|0,2,2);
    c.fillStyle=K;c.fillRect((x-3)|0,(y-2)|0,6,5);c.fillRect((x-2)|0,(y-3)|0,4,7);c.fillStyle=a?OR:RD;c.fillRect((x-2)|0,(y-2)|0,4,4);c.fillStyle=YL;c.fillRect((x-1)|0,(y-1)|0,2,2);c.fillStyle=WH;c.fillRect((x-1)|0,(y-1)|0,1,1)};
  B.cyparcel=(c,b)=>{const x=(b.x-4)|0,y=(b.y-3)|0,left=(b.fuse||1)-b.t,bl=left<.5?((b.t*24)|0)&1:((b.t*6)|0)&1;c.fillStyle=K;c.fillRect(x-1,y-1,10,9);c.drawImage(bl&&left<.5?PARCW:PARC,x,y);if(bl){c.fillStyle=RD;c.fillRect(x+6,y+1,2,2)}};
  B.cyshr=(c,b)=>{const x=b.x|0,y=b.y|0;c.fillStyle=K;c.fillRect(x-2,y-2,5,5);c.fillStyle=((b.t*14)|0)&1?OR:YL;c.fillRect(x-1,y-1,3,3);c.fillStyle=WH;c.fillRect(x,y,1,1)};
  B.cyg=(c,b)=>{const x=b.x|0,y=b.y|0,k=((b.t*14)|0)&3;c.fillStyle=K;c.fillRect(x-3,y-3,6,6);c.fillStyle=[MG,CY,LV,WH][k];c.fillRect(x-2,y-2,4,4);c.fillStyle=[CY,MG,WH,MG][k];c.fillRect(x-2+(k&1),y-2+(k>>1),2,2)};
  B.cyink=(c,b)=>{const x=b.x|0,y=b.y|0;c.fillStyle=K;c.fillRect(x-3,y-3,7,7);c.fillStyle=CY;c.fillRect(x-2,y-2,5,5);c.fillStyle=NV;c.fillRect(x-1,y-1,3,3);c.fillStyle=((b.t*10)|0)&1?WH:LV;c.fillRect(x-1,y-1,1,1)};
  B.cyshard=(c,b)=>{const x=b.x|0,y=b.y|0;c.fillStyle=K;c.fillRect(x-3,y-2,7,5);c.fillStyle=CY;c.fillRect(x-2,y-1,5,3);c.fillStyle=WH;c.fillRect(x-1,y-1,3,1);c.fillStyle=cy;c.fillRect(x+1,y+1,2,1)};

  /* ---------- the cast ---------- */
  const fl=(e)=>(e.t||0);
  A.enemies.ring=wrap('ring',{
    init(e,o){e.hp=e.mhp=loopScale();e.w=16;e.h=11;e.pts=120;e.vx=-(50+rnd(0,14));e.ph=o.ph!=null?o.ph:rnd(0,6);e.shootT=rnd(.8,2.2);e.amp=16+rnd(0,6)},
    move(e,dt,live){e.x+=e.vx*dt;if(live){const d=P.y-e.y0;e.y0+=clamp(d,-9*dt,9*dt)}e.y0=clamp(e.y0,TOP+26,BOT-26);
      e.y=e.y0+Math.sin(e.t*3+e.ph)*e.amp;e.vy=Math.cos(e.t*3+e.ph)*3*e.amp;
      if(live&&e.x<W-24&&e.x>P.x+40&&(e.shootT-=dt)<=0){e.shootT=rnd(2.2,3.2)*lvF();if(room(1)){ebAim(e.x-9,e.y+4,spd(70),rnd(-.05,.05),{sty:'cystun'});sfxEnemyLaser()}}},
    draw(c,e,f){const t=fl(e),fr=((t*8)|0)&3,x=(e.x-10)|0,y=(e.y-7)|0;
      if(!f){c.drawImage(CONE[((t*1.1+(e.ph||0))|0)&1],x-14,y+9);c.fillStyle=pat(fr&1?CY:RD);c.fillRect(x+5,y,10,5)}
      c.drawImage(f?COPW[fr]:COP[fr],x,y)}});
  A.enemies.ringR=wrap('ringR',{
    init(e,o){e.variant=o.variant!=null?o.variant:(Math.random()<.5?0:1);e.ph=rnd(0,6);
      if(e.variant===0){e.hp=e.mhp=4*loopScale();e.w=24;e.h=15;e.pts=320;e.vx=-30;e.sc=rnd(0,3.2);e.shootT=rnd(1,2)}
      else{e.hp=e.mhp=3*loopScale();e.w=20;e.h=14;e.pts=280;e.vx=-38;e.par=LV_()>=2?2:1;e.pt=rnd(.6,1.4)}},
    move(e,dt,live){e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.t*1.8+e.ph)*10;e.vy=Math.cos(e.t*1.8+e.ph)*18;
      if(e.variant===0){e.sc+=dt;e.immune=(e.sc%3.2)<1.2;
        if(live&&e.x<W-26&&e.x>P.x+40&&(e.shootT-=dt)<=0){e.shootT=rnd(2.4,3)*lvF();if(room(3)){ebFan(e.x-14,e.y,3,.42,spd(66),aimA(e.x-14,e.y),{sty:'cystun'});sfxEnemyLaser()}}}
      else if(live&&e.par>0&&e.x<W-30&&e.x>P.x+30&&(e.pt-=dt)<=0){e.pt=rnd(1.4,2)*lvF();e.par--;
        if(room(9)){if(e.par%2)ebShot(e.x,e.y+9,-26,30,{sty:'cyparcel',fuse:1.5,ay:8});else ebAim(e.x,e.y+9,spd(56),0,{sty:'cyparcel',fuse:1.25});sfxEnemyLaser()}}},
    draw(c,e,f){const t=fl(e),v=e.variant!=null?e.variant:((e.spr||0)&1);
      if(v===0){const fr=((t*8)|0)&3,x=(e.x-13)|0,y=(e.y-8)|0;c.drawImage(f?RIOTW[fr]:RIOT[fr],x,y);
        const q=(e.sc||0)%3.2;if(!f&&q<1.2&&!(q>.95&&((t*24)|0)&1)){for(let i=0;i<22;i++){const a=PI*.62+i/21*PI*.76,xx=Math.round(e.x+2+Math.cos(a)*17),yy=Math.round(e.y+Math.sin(a)*11);c.fillStyle=(i+((t*16)|0))%6===0?WH:CY;c.fillRect(xx,yy,1,1);if((xx+yy)&1){c.fillStyle=cy;c.fillRect(xx+1,yy,1,1)}}}}
      else{const fr=((t*14)|0)&3,x=(e.x-12)|0,y=(e.y-8)|0;if(e.par==null||e.par>0)c.drawImage(f?PARCW:PARC,x+8,y+15);c.drawImage(f?DBOTW[fr]:DBOT[fr],x,y)}}});
  A.enemies.dart=wrap('dart',{
    init(e,o){e.hp=e.mhp=loopScale();e.w=21;e.h=10;e.pts=140;e.col=(Math.random()*3)|0;e.vx=-rnd(110,150)*(1+.06*(LV_()-1));e.lane=!!o.lane;e.spin=Math.random()<.22;
      e.gun=Math.random()<.22+.1*LV_();e.shootT=rnd(.2,.9);e.sw=rnd(0,6);e.ang=0;e.age=0},
    move(e,dt,live){e.age+=dt;e.x+=e.vx*dt;
      if(!e.lane&&e.age<.7&&live)e.y+=Math.sign(P.y-e.y)*Math.min(Math.abs(P.y-e.y),28*dt);
      const wv=Math.sin(e.age*7+e.sw)*(e.spin?42:12);e.y+=wv*dt;e.vy=wv;e.y=clamp(e.y,TOP+10,BOT-10);
      e.ang=e.spin?e.ang+dt*7*(e.sw>3?1:-1):Math.sin(e.age*9+e.sw)*.1;
      if(live&&e.gun&&e.x<W-30&&e.x>P.x+60&&(e.shootT-=dt)<=0){e.gun=false;if(room(1)){ebAim(e.x-12,e.y,spd(92),0,{sty:'cyplasma'});sfxEnemyLaser()}}
      if(fxOk()&&Math.random()<dt*9)FX.push({x:e.x+11,y:e.y+3,vx:rnd(10,50),vy:rnd(-10,30),life:.25,c:Math.random()<.5?YL:OR,s:1})},
    draw(c,e,f){const t=fl(e),p=(e.col!=null?e.col:(e.spr||0))%3,fr=((t*12)|0)&3,s=f?CARW[p][fr]:CAR[p][fr];
      if(!f&&!e.spin)c.drawImage(BEAM,(e.x-27)|0,(e.y-3)|0);
      if(Math.abs(e.ang||0)>.06){c.save();c.translate(e.x|0,e.y|0);c.rotate(e.ang);c.drawImage(s,-12,-6);c.restore()}else c.drawImage(s,(e.x-12)|0,(e.y-6)|0)}});
  A.enemies.cross=wrap('cross',{
    init(e,o){e.child=!!o.child;e.hp=e.mhp=(e.child?1:3)*loopScale();e.w=e.h=e.child?11:15;e.pts=e.child?80:240;e.vx=-rnd(34,46);e.vy=(Math.random()<.5?1:-1)*rnd(18,28);
      e.hop=rnd(1,2);e.gl=0;e.split=false;e.shootT=rnd(1,2)},
    move(e,dt,live){
      if(e.gl>0){e.gl-=dt;if(e.gl<=0&&e.hp0){e.hp0=false;const ox=e.x,oy=e.y;e.x-=rnd(8,18);e.y=clamp(e.y+rnd(20,34)*(Math.random()<.5?-1:1),TOP+16,BOT-16);if(fxOk()){FX.push({ring:1,x:ox,y:oy,r:2,life:.25,max:9,col:MG});FX.push({ring:1,x:e.x,y:e.y,r:2,life:.25,max:9,col:CY})}}}
      else{e.hop-=dt;if(e.hop<=0){e.hop=rnd(1.4,2.4)*lvF();e.gl=.35;e.hp0=true}}
      e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.y<TOP+12){e.y=TOP+12;e.vy=Math.abs(e.vy)}if(e.y>BOT-12){e.y=BOT-12;e.vy=-Math.abs(e.vy)}
      if(live&&!e.child&&e.x<W-20&&e.x>P.x+40&&(e.shootT-=dt)<=0){e.shootT=rnd(1.8,2.6)*lvF();
        if(LV_()>=2&&room(3))ebFan(e.x-6,e.y,3,.4,spd(60),aimA(e.x-6,e.y),{sty:'cyg'});else if(room(1))ebAim(e.x-6,e.y,spd(62),0,{sty:'cyg'});sfxEnemyLaser()}},
    update(e,dt,live){if(!e.child&&!e.split&&e.hp<e.mhp&&e.hp>0){e.split=true;let n=0;for(const q of E)if(q.type==='cross')n++;
      if(n<12)for(const s of [-1,1]){const k=spawn({type:'cross',y:clamp(e.y+s*12,TOP+14,BOT-14),child:1});k.x=e.x+4;k.vy=s*34;k.vx=e.vx-6}}},
    draw(c,e,f){const t=fl(e),ch=!!e.child,fr=((t*9)|0)%6,set=ch?(f?CONsW:CONs):(f?CONW:CON),s=set[fr],hw=s.width>>1,x=(e.x-hw)|0,y=(e.y-hw)|0;
      const gl=(e.gl>0)||(((t*7+e.x*.1)|0)%11===0);
      if(gl&&!f){const j=((t*30)|0)&1;c.drawImage((ch?CONsR:CONR)[fr],x-2-j,y);c.drawImage((ch?CONsC:CONC)[fr],x+2+j,y);const h2=s.height>>1;c.drawImage(s,0,0,s.width,h2,x+2,y,s.width,h2);c.drawImage(s,0,h2,s.width,s.height-h2,x-2,y+h2,s.width,s.height-h2)}
      else c.drawImage(s,x,y)}});
  A.enemies.pod=wrap('pod',{
    init(e,o){e.variant=o.variant!=null?o.variant:(Math.random()<.5?0:1);e.hp=e.mhp=9*loopScale();e.w=30;e.h=18;e.pts=650;e.vx=-22;e.rel=rnd(1.5,2.5);e.nrel=0;e.shootT=rnd(1.4,2.4)},
    move(e,dt,live){e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.t*1.2)*8;e.vy=Math.cos(e.t*1.2)*10;
      if(!live||e.x>W-24||e.x<P.x+50)return;
      if((e.shootT-=dt)<=0){e.shootT=rnd(2.8,3.4)*lvF();if(e.variant===0){if(room(5)){ebFan(e.x-16,e.y+2,5,.9,spd(60),aimA(e.x-16,e.y),{sty:'cystun'});sfxEnemyLaser()}}
        else if(room(9)){for(let i=0;i<2;i++)ebShot(e.x-8+i*10,e.y+10,-30-i*14,26+i*8,{sty:'cyparcel',fuse:1.4+i*.3,ay:8});sfxEnemyLaser()}}
      if(e.nrel<3&&(e.rel-=dt)<=0){e.rel=3*lvF();let n=0;for(const q of E)if(q.type==='ring'||q.type==='ringR')n++;if(n<10){e.nrel++;
        const k=e.variant===0?spawn({type:'ring',y:clamp(e.y+12,TOP+26,BOT-26)}):spawn({type:'ringR',y:clamp(e.y+14,TOP+20,BOT-20),variant:1});k.x=e.x;if(e.variant!==0)k.par=1}}},
    draw(c,e,f){const t=fl(e),v=e.variant!=null?e.variant:((e.spr||0)&1),fr=((t*8)|0)&3,x=(e.x-17)|0,y=(e.y-10)|0;
      if(!f&&v===0)c.drawImage(CONE[((t*.8)|0)&1],x-10,y+15);
      c.drawImage(v===0?(f?DROPW[fr]:DROP[fr]):(f?VANW[fr]:VAN[fr]),x,y);
      if(!f&&e.carry){c.fillStyle=({P:'#ff7777',S:'#70a4b2',M:'#b8c76f',H:'#9ad284',O:'#cc99ff',R:'#ff9966',B:'#ffffff'})[e.carry]||WH;c.fillRect(x+15,y+20,4,2)}},
    onKill(e){for(let i=0;i<8&&fxOk();i++)FX.push({x:e.x+rnd(-10,10),y:e.y+rnd(-6,6),vx:rnd(-50,30),vy:rnd(-40,30),life:1,l0:1,c:i%3?GM:(i%2?OR:LL),s:2})}});
  A.enemies.rock=wrap('rock',{
    init(e,o){
      if(o.variant==='decoy'){Object.assign(e,{variant:'decoy',hp:1e9,mhp:1e9,pts:0,w:30,h:20,vx:o.vx||-24,vy:0,age:0,shots:0,gy:o.gy||e.y,immune:true});e.hitTest=()=>0;e.touch=()=>false;return}
      if(o.variant==='fbeam'){Object.assign(e,{variant:'fbeam',hp:1e9,mhp:1e9,pts:0,w:2,h:2,vx:0,vy:0,st:1,lt:0,immune:true,mx:0,my:0,ty:0});e.hitTest=()=>0;e.touch=beamTouch;return}
      e.kind=(e.spr||0)%3;e.vx=-rnd(32,58);e.vy=rnd(-6,24);if(e.vy>8)e.y=rnd(TOP+16,BOT-50);e.spin=rnd(5,10)*(Math.random()<.5?-1:1);e.burn=e.big?e.kind!==1:e.kind===0||Math.random()<.3;e.age=0},
    move(e,dt,live){
      if(e.variant==='decoy'){e.age+=dt;e.x+=e.vx*dt;e.y+=(e.gy-e.y)*Math.min(1,dt*2);e.vy=(e.gy-e.y)*2;
        if(live&&((e.shots===0&&e.age>1.1)||(e.shots===1&&e.age>2.5))){e.shots++;if(room(3)){ebFan(e.x-14,e.y+2,3,.5,spd(60),aimA(e.x-14,e.y),{sty:'cyg'});sfxEnemyLaser()}}
        if(e.age>3.8)e.dead=1;return}
      if(e.variant==='fbeam'){const h=G.boss;if(!h||!h.cur||h.cur.sub!==e.own||!e.own.las){e.dead=1;return}return}
      e.x+=e.vx*dt;e.y+=e.vy*dt;e.age+=dt;
      if(e.burn&&fxOk()&&Math.random()<dt*7)FX.push({x:e.x+rnd(-3,3),y:e.y-3,vx:rnd(5,25),vy:rnd(-30,-10),life:.4,l0:.4,ramp:1,c:OR,s:1})},
    draw(c,e,f){
      if(e.variant==='decoy'){const t=e.age||0;if(t>3.2&&((t*20)|0)&1)return;const s=(t<.8?MHM:MHH)[((t*12)|0)&1];if(((t*7)|0)%9===0)return;c.drawImage(s,(e.x-22+((((t*30)|0)%7===0)?3:0))|0,(e.y-16)|0);return}
      if(e.variant==='fbeam'){drawBeam(c,e);return}
      const big=!!e.big,k=(e.kind!=null?e.kind:(e.spr||0))%3,set=(f?RKW:RK)[big?'big':'small'][k],n=set.length,fr=set[Math.floor(mod((e.t||0)*Math.abs(e.spin||6)*.25,1)*n)];
      c.drawImage(fr,(e.x-fr.width/2)|0,(e.y-fr.height/2)|0);
      if(!f&&(e.burn||(e.big&&k!==1))){const t=e.t||0;for(let i=0;i<3;i++){const q=((t*14+i*3)|0)%4;c.fillStyle=q===0?YL:q===1?OR:rd;c.fillRect((e.x+rnd(-3,3)+i*2)|0,(e.y-(big?9:4)-i*2-q)|0,1+(i===0?1:0),1)}}}});

  /* ---------- the fusion's laser beam (an entity, so the autopilot sees it) ---------- */
  function beamY(e,px_){return e.my+(e.ty-e.my)*(e.mx-px_)/Math.max(1,e.mx)}
  function beamTouch(e,px_,py){return e.st===2&&px_<e.mx+4&&Math.abs(py-beamY(e,px_))<3+shk(6)}
  function drawBeam(c,e){const t=e.lt||0,mx=e.mx|0,my=e.my|0;if(mx<4)return;
    if(e.st===1){const n=Math.max(1,mx/4|0),ph=((e.t||0)*40)|0;for(let i=0;i<=n;i++){if((i+ph)%3)continue;const x=mx-i*4;c.fillStyle=((i+ph)&1)?MG:WH;c.fillRect(x|0,beamY(e,x)|0,2,1)}
      const r=Math.max(1,Math.round(9-t*7));c.fillStyle=pat(MG);c.fillRect(mx-r,my-r,r*2+1,r*2+1);c.fillStyle=WH;c.fillRect(mx-1,my-1,3,3)}
    else{const w=Math.random()<.5?1:0;for(let x=0;x<mx;x+=2){const y=beamY(e,x)|0;c.fillStyle=pat(mg);c.fillRect(x,y-4-w,2,9+2*w);c.fillStyle=MG;c.fillRect(x,y-2,2,5);c.fillStyle=WH;c.fillRect(x,y-1,2,2+w)}
      c.fillStyle=pat(WH);c.fillRect(mx-6,my-6,12,13)}}

  /* ======================================================================
     MINI BOSS: the Mecha Dragon Billboard
     ====================================================================== */
  const TRN_=512;
  function trInit(e,x,y){e.trx=new Float32Array(TRN_);e.trY=new Float32Array(TRN_);e.tn=0;for(let i=200;i>=0;i--){e.trx[e.tn&(TRN_-1)]=x+i*2;e.trY[e.tn&(TRN_-1)]=y;e.tn++}e.lx=x;e.ly=y}
  function trPush(e,x,y){let dx=x-e.lx,dy=y-e.ly,d=Math.hypot(dx,dy);while(d>=2){const k=2/d;e.lx+=dx*k;e.ly+=dy*k;e.trx[e.tn&(TRN_-1)]=e.lx;e.trY[e.tn&(TRN_-1)]=e.ly;e.tn++;dx=x-e.lx;dy=y-e.ly;d=Math.hypot(dx,dy)}}
  const tri=(e,j)=>(e.tn-1-Math.min(j,TRN_-2))&(TRN_-1);
  const MSEGN=9,MSP=[0,7,13,19,25,30,35,40,44,48];
  const msIdx=k=>k<3?0:k<5?1:k<7?2:3;
  function miniHit(e,x,y){
    if(e.mph==='burst')return 0;
    if(e.mph==='holo')return (Math.abs(x-e.x)<46&&Math.abs(y-e.y)<32)?1:0;
    if(Math.hypot(x-(e.hx-6),y-e.hy)<15)return 1;
    for(let k=1;k<=MSEGN;k++){const i=tri(e,MSP[k]),r=k<3?8:k<5?7:k<7?6:5;if(Math.hypot(x-e.trx[i],y-e.trY[i])<r)return .5}return 0}
  function miniTouch(e,px_,py){
    if(e.mph==='holo'||e.mph==='burst')return Math.abs(px_-e.x)<46+shk(10)&&Math.abs(py-e.y)<32+shk(5);
    if(Math.hypot(px_-(e.hx-6),py-e.hy)<13+shk(8))return true;
    for(let k=1;k<=MSEGN;k++){const i=tri(e,MSP[k]);if(Math.hypot(px_-e.trx[i],py-e.trY[i])<5+shk(7))return true}return false}
  function decoy(x,y,gy){const d=spawn({type:'rock',y,variant:'decoy',gy,vx:-22});d.x=x;d.y=y;return d}
  A.mini={w:84,h:60,get hp(){return [32,28,22][LV_()-1]},
    init(e){e.x=W+56;e.y=100;e.in=true;e.mph='holo';e.hx=e.x-14;e.hy=e.y;e.mouth=0;e.st=0;trInit(e,e.hx,e.hy);
      e.cd={fan:1.2,dec:3.5,sw:3,ring:4};e.atk=null;e.at=0;e.bfall=0;e.bvy=0;e.bx=0;e.by=0;e.hitTest=miniHit;e.touch=miniTouch},
    update(e,dt,live){
      const t=e.t||0,L=LV_(),lf=lvF();e.st+=dt;
      if(e.mph==='holo'){
        if(e.in){e.x-=58*dt;if(e.x<=236){e.x=236;e.in=false}}
        e.y=100+Math.sin(t*.9)*16;e.vx=e.in?-58:0;e.vy=Math.cos(t*.9)*14;
        e.hx=e.x-10+Math.sin(t*1.7)*16;e.hy=e.y+Math.sin(t*2.3)*12;trPush(e,e.hx,e.hy);
        e.mouth=e.atk==='fan'?(e.at<.5?1:2):0;
        if(e.hp<e.mhp*.6){e.mph='burst';e.st=0;e.bx=e.x;e.by=e.y;e.bvy=-30;e.immune=true;
          boom(e.x-20,e.y-10,22,true);boom(e.x+18,e.y+8,16,true);shake=Math.max(shake,.5);G.flashT=Math.max(G.flashT||0,.12);
          for(let i=0;i<20&&fxOk();i++)FX.push({x:e.x+rnd(-40,40),y:e.y+rnd(-26,26),vx:rnd(-90,40),vy:rnd(-60,40),life:1.1,l0:1.1,c:[CY,MG,WH,LV][i&3],s:i%3?1:2});
          if(live&&L>=2&&room(12)){ebRing(e.x,e.y,12,spd(52),aimA(e.x,e.y)+PI/12,{sty:'cyshard'})}
          return}
        if(!live||e.in)return;
        for(const k in e.cd)e.cd[k]-=dt;
        if(e.atk==='fan'){e.at+=dt;if(e.at>=.5&&!e.fired){e.fired=1;const n=L>=3?6:5;if(room(n)){ebFan(e.hx-20,e.hy+4,n,L>=3?1.5:1.25,spd(62),aimA(e.hx-20,e.hy+4),{sty:'cyfire'});sfxEnemyLaser()}}if(e.at>.8)e.atk=null}
        else if(e.cd.fan<=0){e.cd.fan=(L>=2?1.45:1.7)*lf;e.atk='fan';e.at=0;e.fired=0}
        if(e.cd.dec<=0){e.cd.dec=6.5*lf;decoy(e.x-30,e.y-34,clamp(e.y-46,40,160));decoy(e.x-30,e.y+34,clamp(e.y+46,40,160))}
        return}
      if(e.mph==='burst'){e.bvy+=140*dt;e.bfall+=e.bvy*dt;e.vx=0;e.vy=0;
        const k=Math.min(1,e.st/1.2);e.hx=e.bx-10-k*30;e.hy=e.by+Math.sin(e.st*6)*10;trPush(e,e.hx,e.hy);e.x=e.hx;e.y=e.hy;e.mouth=2;
        if(e.st>=1.2){e.mph='free';e.st=0;e.immune=false;e.cd.fan=.8;e.cd.sw=2.6;e.cd.dec=5;e.atk=null}return}
      /* free: the solid chrome dragon */
      const px0=e.hx,py0=e.hy;
      if(e.atk==='swipe'){e.at+=dt;
        if(e.at<1){e.hx+=(W-36-e.hx)*Math.min(1,dt*5);e.hy+=(e.lane-e.hy)*Math.min(1,dt*6);e.mouth=1}
        else if(e.at<1.05){/* hold */}
        else{e.hx-=300*dt;e.mouth=2;if(fxOk()&&Math.random()<dt*30)FX.push({x:e.hx+10,y:e.lane+rnd(-8,8),vx:rnd(20,80),vy:rnd(-20,20),life:.35,c:Math.random()<.5?MG:WH,s:1});
          const ti=tri(e,MSP[MSEGN]);if(e.trx[ti]<-30){e.atk=null;e.hx=W+50;e.hy=clamp(P.y<100?140:60,40,160);trInit(e,e.hx,e.hy);e.cd.sw=(L>=2?5.6:6.8)*lf}}}
      else{const tx=232+Math.sin(t*.8)*36,ty=100+Math.sin(t*1.3)*48;e.hx+=(tx-e.hx)*Math.min(1,dt*1.8);e.hy+=(ty-e.hy)*Math.min(1,dt*1.8)}
      trPush(e,e.hx,e.hy);e.x=e.hx;e.y=e.hy;e.vx=dt>0?(e.hx-px0)/dt:0;e.vy=dt>0?(e.hy-py0)/dt:0;e.w=e.atk==='swipe'?44:40;e.h=26;
      bossWear(e,live,0,0,20,10);
      if(!live)return;
      for(const k in e.cd)e.cd[k]-=dt;
      if(e.atk==='breath'){e.at+=dt;e.mouth=e.at<.6?1:2;
        if(e.at>=.6){e.bt-=dt;if(e.bt<=0&&e.nb<3){e.bt=.34;e.nb++;const n=5,sp_=1.3,a0=aimA(e.hx-20,e.hy+4)+(e.nb===2?.06:e.nb===3?-.06:0);if(room(n)){ebFan(e.hx-20,e.hy+4,n,sp_,spd(64+e.nb*6),a0,{sty:'cyfire'});sfxEnemyLaser()}}}
        if(e.at>1.9)e.atk=null}
      else if(!e.atk){
        if(e.cd.sw<=0){e.atk='swipe';e.at=0;e.lane=clamp(P.y,44,156)}
        else if(e.cd.fan<=0){e.cd.fan=(L>=2?2.2:2.7)*lf;e.atk='breath';e.at=0;e.bt=0;e.nb=0}
        else e.mouth=0}
      if(e.cd.dec<=0&&e.atk!=='swipe'){e.cd.dec=7*lf;decoy(e.hx+10,e.hy-30,clamp(e.hy-50,40,160));decoy(e.hx+10,e.hy+30,clamp(e.hy+50,40,160));
        if(L>=2&&room(12)){ebRing(e.hx,e.hy,12,spd(50),aimA(e.hx,e.hy)+PI/12,{sty:'cyshard'});sfxEnemyLaser()}}
    },
    draw(c,e,f){
      const t=e.t||0;
      if(e.mph==='holo'||e.mph==='burst'){
        const bx=((e.mph==='holo'?e.x:e.bx)-48)|0,by=((e.mph==='holo'?e.y:e.by)-35+e.bfall)|0;
        for(let y=by+70;y<BOT+8;y+=40)c.drawImage(POLE,bx+42,y);
        const gl=e.mph==='burst'||((t*6)|0)%7===0;c.drawImage(BILL[gl?1:0],bx,by);
        if(e.mph==='holo'){
          c.save();c.beginPath();c.rect(bx+6,by+6,84,56);c.clip();
          const p=((t*14)|0)&1,jit=((t*9)|0)%5===0?3:0;
          for(let k=MSEGN;k>=1;k--){const i=tri(e,MSP[k]),s=MSEGH[msIdx(k)];c.drawImage(s,(e.trx[i]-s.width/2+jit)|0,(e.trY[i]-s.height/2-2)|0)}
          const hs=(e.mouth?MHH2:MHH)[p];c.drawImage(f?MHW[e.mouth]:hs,(e.hx-24-jit)|0,(e.hy-16)|0);
          if(!f&&e.atk==='fan'&&e.at<.5&&((t*20)|0)&1){c.fillStyle=pat(OR);c.fillRect((e.hx-28)|0,(e.hy-2)|0,10,9)}
          // screen scanline glare
          c.fillStyle=pat(CY);c.fillRect(bx+6,(by+6+mod(t*30,56))|0,84,2);
          c.restore()}
        else{/* the screen shatters */const k=e.st;c.fillStyle=pat(WH);for(let i=0;i<6;i++)c.fillRect(bx+8+i*14,by+8+((i*23+k*60)%50|0),6,4)}
        if(e.mph==='holo')return}
      if(e.mph==='burst'||e.mph==='free'){
        // telegraph of the claw swipe lane
        if(!f&&e.atk==='swipe'&&e.at<1.05&&((t*14)|0)&1){c.fillStyle=RD;for(let x=4;x<W-4;x+=8)c.fillRect(x,(e.lane-1)|0,4,1);c.fillStyle=pat(RD);c.fillRect(0,(e.lane-14)|0,W,1);c.fillRect(0,(e.lane+13)|0,W,1)}
        for(let k=MSEGN;k>=1;k--){const i=tri(e,MSP[k]),s=(f?MSEGW:MSEG)[msIdx(k)];c.drawImage(s,(e.trx[i]-s.width/2)|0,(e.trY[i]-s.height/2-2)|0);
          if(k===2||k===4){const cl=(f?MCLW:MCL)[e.atk==='swipe'||((t*2+k)|0)%3===0?0:1];c.drawImage(cl,(e.trx[i]-14)|0,(e.trY[i]+2)|0)}}
        c.drawImage((f?MHW:MH)[e.mouth||0],(e.hx-24)|0,(e.hy-16)|0);
        if(!f&&e.atk==='breath'&&e.at<.6&&((t*20)|0)&1){c.fillStyle=pat(YL);c.fillRect((e.hx-30)|0,(e.hy-1)|0,12,9)}
        if(!f&&e.mph==='free'&&e.hp<e.mhp*.3&&((t*10)|0)&1){c.fillStyle=YL;c.fillRect((e.hx+rnd(-10,10))|0,(e.hy+rnd(-6,6))|0,1,1)}}
    },
    onKill(e){for(let k=1;k<=MSEGN;k+=2){const i=tri(e,MSP[k]);boom(e.trx[i],e.trY[i],10,k<4)}
      for(let i=0;i<14&&fxOk();i++)FX.push({x:e.hx+rnd(-12,12),y:e.hy+rnd(-8,8),vx:rnd(-60,60),vy:rnd(-70,20),life:1.2,l0:1.2,c:[LL,MG,CY,WH][i&3],s:2})}
  };

  /* ======================================================================
     FUSION OF ALL MACHINES (level 3 finale), driven as a segment of the rush host
     ====================================================================== */
  const FX_=252,FY_=100;
  const fPh=e=>{const r=e.hp/e.mhp;return r>.82?1:r>.64?2:r>.46?3:r>.28?4:r>.1?5:6};
  const FBOX={torso:[-38,-42,50,40],head:[-106,-74,-46,-32],can:[-96,-38,-14,0],claw:[-86,4,-20,46]};
  const inB=(b,x,y,m,n)=>x>=b[0]-(m||0)&&x<=b[2]+(m||0)&&y>=b[1]-(n||0)&&y<=b[3]+(n||0);
  function fPos(e){return {mx:e.x-104,my:e.y-46+(e.hb||0),sx:e.x-6,sy:e.y+2,dx:e.x+30,dy:e.y-44,cx:e.x-94,cy:e.y-17,kx:e.x+34,ky:e.y-62}}
  function fShed(e,p){const X=e.x,Y=e.y;
    const bm=(x,y,n,b)=>{boom(X+x,Y+y,n,b);for(let i=0;i<6&&fxOk();i++)FX.push({x:X+x+rnd(-8,8),y:Y+y+rnd(-6,6),vx:rnd(-60,40),vy:rnd(-50,30),life:1.3,l0:1.3,c:[LL,GM,CY,OR][i&3],s:i%3?2:3})};
    if(p===2){bm(-20,-34,20,true);bm(30,-40,14,false);bm(10,34,14,false)}
    else if(p===3){bm(-60,28,22,true);bm(-40,24,12,false)}
    else if(p===4){bm(-64,-18,22,true);bm(-30,-22,14,false)}
    else if(p===5){bm(-6,2,26,true);bm(22,-34,18,true);bm(10,-10,14,false)}
    else if(p===6){bm(-70,-50,16,true);bm(0,0,20,true)}
    shake=Math.max(shake,.55);G.flashT=Math.max(G.flashT||0,.14);e.pause=1.3;e.tel=null;e.las=0;e.spir=0;e.br=null;e.dsp=0}
  function fLaser(e,dt,host){
    const p=fPos(e);e.lt+=dt;
    if(e.las===1){e.las=2;e.lt=0;const low=P.y>=100;e.ys0=low?176:24;e.ys1=low?104:96;e.beam=spawn({type:'rock',y:100,variant:'fbeam'});e.beam.own=e}
    else if(e.las===2&&e.lt>=1.1){e.las=3;e.lt=0;shake=Math.max(shake,.25);sfxBoom(10,true)}
    else if(e.las===3&&e.lt>=1.9){e.las=0;if(e.beam)e.beam.dead=1;e.beam=null;e.cd.las=7.5;return}
    const bm=e.beam;if(!bm)return;
    const k=e.las===3?Math.min(1,e.lt/1.9):0,y80=e.ys0+(e.ys1-e.ys0)*k;
    bm.mx=p.cx;bm.my=p.cy;bm.ty=p.cy+(y80-p.cy)*p.cx/Math.max(20,p.cx-80);bm.st=e.las===3?2:1;bm.lt=e.lt;
    const ya=bm.st===2?y80:e.ys0,y0=Math.min(ya,e.ys1)-6,y1=Math.max(ya,e.ys1)+6;bm.x=p.cx/2;bm.w=p.cx;bm.y=(y0+y1)/2;bm.h=y1-y0;bm.vy=0}
  const FUS={w:170,h:140,
    init(e){if(!FU)FU=buildFusion();e.x=W+150;e.y=FY_;e.in=true;e.ph=1;e.pause=0;e.cd={glob:1.5,ice:3,br:2,lava:3,gas:5,las:1.5,ink:2.5,can:2,sp:1.5,hive:4,glob4:2,ring:2,lat:1,cur:3,ov:0};
      e.tel=null;e.las=0;e.beam=null;e.spir=0;e.sa=0;e.br=null;e.dsp=0;e.dspT=0;e.hb=0;e.mouth=0;e.fT=0},
    update(e,dt,live,host){
      const t=e.t||0;e.hb=Math.round(Math.sin(t*1.5)*2);
      if(e.in){e.x-=60*dt;e.y=FY_+Math.sin(t*.61)*10;if(e.x<=FX_){e.x=FX_;e.in=false}return}
      const ph=fPh(e);if(live&&ph>e.ph){for(let q=e.ph+1;q<=ph;q++)fShed(e,q);e.ph=ph}
      const en=ph>=6?1.3:1;
      e.x=FX_+Math.sin(t*.37)*8-(ph>=5?Math.sin(t*.9)*8:0);const py=e.y;e.y=FY_+Math.sin(t*.61)*(e.las>=2?4:14);e.vy=dt>0?(e.y-py)/dt:0;e.vx=0;
      bossWear(e,live,-10,0,50,40);
      if(e.las)fLaser(e,dt,host);
      if(e.mouth>0)e.mouth=Math.max(0,e.mouth-dt);
      if(!live)return;
      if(e.pause>0){e.pause-=dt;return}
      const c=e.cd,p=fPos(e);for(const k in c)c[k]-=dt*en;
      // telegraphed patterns
      if(e.tel){e.tel.t-=dt;if(e.tel.t<=0){const tl=e.tel;e.tel=null;
          if(tl.k==='ice'&&room(14)){ebRing(p.sx,p.sy,14,46,aimA(p.sx,p.sy)+PI/14,{sty:'cyshard',life:6});sfxEnemyLaser()}
          else if(tl.k==='cur'){if(room(16))ebCurtain(tl.x,TOP+12,BOT-12,16,-48,tl.gy,52,{sty:'cyink'});if(tl.two&&room(16)){e.tel2={t:1.3,x:tl.x,gy:clamp(tl.gy+(tl.gy<100?44:-44),48,152)}}sfxEnemyLaser()}
          else if(tl.k==='sp'){e.spir=2.6;e.spT=0}
          else if(tl.k==='br'){e.br={t:0,low:tl.low,ft:0}}}}
      if(e.tel2){e.tel2.t-=dt;if(e.tel2.t<=0){if(room(16))ebCurtain(e.tel2.x,TOP+12,BOT-12,16,-48,e.tel2.gy,52,{sty:'cyink'});e.tel2=null}}
      // Ra's spiral and the fire breath stream
      if(e.spir>0){e.spir-=dt;e.spT-=dt;if(e.spT<=0){e.spT=.15;e.sa+=.21;if(room(5))ebSpiral(p.dx,p.dy,5,48,e.sa,{sty:'cysun',life:4.6})}}
      if(e.br){const b=e.br;b.t+=dt;b.ft-=dt;e.mouth=.2;if(b.ft<=0&&b.t<1.8){b.ft=.065;const ty=(b.low?174:26)+((b.low?104:96)-(b.low?174:26))*(b.t/1.8);if(room(1)){const a=Math.atan2(ty-p.my,60-p.mx);ebShot(p.mx,p.my,Math.cos(a)*96,Math.sin(a)*96,{sty:'cyfire'})}}if(b.t>=1.8)e.br=null}
      const busy=!!(e.tel||e.br||e.spir>0||e.las);
      if(ph===1){
        if(c.glob<=0){c.glob=2;if(room(5)){ebFan(p.mx,p.my,5,.9,64,aimA(p.mx,p.my),{sty:'cyplasma'});e.mouth=.4;sfxEnemyLaser()}}
        if(c.ice<=0&&!e.tel){c.ice=4.2;e.tel={k:'ice',t:.8}}}
      else if(ph===2){
        if(c.br<=0&&!busy){c.br=6.2;e.tel={k:'br',t:.9,low:P.y>=100}}
        if(c.lava<=0){c.lava=3.4;if(room(3)){for(let i=0;i<3;i++)ebShot(p.dx-10,p.dy-20,-rnd(46,78),-rnd(18,46),{sty:'cyfire',ay:22});sfxEnemyLaser()}}
        if(c.gas<=0){c.gas=8.5;for(let i=0;i<2;i++){const d=spawn({type:'dart',y:p.ky+i*14});d.x=p.kx;d.y=p.ky+i*14;d.lane=true}}
        if(c.glob<=0){c.glob=3.2;if(room(5)){ebFan(p.mx,p.my,5,.9,64,aimA(p.mx,p.my),{sty:'cyplasma'});e.mouth=.4}}}
      else if(ph===3){
        if(c.las<=0&&!e.las&&!e.tel){e.las=1;e.lt=0}
        if(c.ink<=0&&!e.tel&&!e.las){c.ink=4.8;e.tel={k:'cur',t:.9,x:e.x-70,gy:rnd(52,148),two:false}}
        if(c.can<=0&&e.las<2){c.can=2.6;if(room(3)){ebFan(p.cx,p.cy,3,.3,88,aimA(p.cx,p.cy),{sty:'cystun'});sfxEnemyLaser()}}}
      else if(ph===4){
        if(c.sp<=0&&!busy){c.sp=6.8;e.tel={k:'sp',t:1}}
        if(c.hive<=0){c.hive=8.5;for(const s of [-1,1]){const k=spawn({type:'cross',y:clamp(e.y+s*34,TOP+16,BOT-16)});k.x=e.x-30}}
        if(c.glob4<=0&&e.spir<=0){c.glob4=2.6;if(room(5)){ebFan(p.mx,p.my,5,1,62,aimA(p.mx,p.my),{sty:'cyplasma'});e.mouth=.4}}
        if(c.ink<=0&&!busy){c.ink=6.5;e.tel={k:'cur',t:.9,x:e.x-70,gy:rnd(52,148),two:false}}}
      else{
        // phases 5 and 6: all the machines at once, a layered bullet hell
        e.dspT-=dt;if(e.dsp>0){e.dsp-=dt;if(e.dspT<=0){e.dspT=ph>=6?.1:.13;e.sa+=.19;const arms=ph>=6?4:3;if(room(arms*2)){ebSpiral(p.sx,p.sy,arms,44,e.sa,{sty:'cyg',life:4.4});ebSpiral(p.sx,p.sy,arms,44,-e.sa*1.3+.5,{sty:'cyplasma',life:4.4})}}}
        else if(c.ov<=0){c.ov=ph>=6?4.2:4.8;e.dsp=ph>=6?3.2:2.8;e.fT=.8}
        if(c.ring<=0){c.ring=ph>=6?2.6:3.2;if(room(12)){ebRing(p.sx,p.sy,12,50,aimA(p.sx,p.sy)+PI/12,{sty:'cyshard',life:6});sfxEnemyLaser()}}
        if(c.lat<=0){c.lat=.75;if(room(2)){ebShot(e.x-60,TOP+4,-46,34,{sty:'cystun',life:6});ebShot(e.x-60,BOT-4,-46,-34,{sty:'cystun',life:6})}}
        if(c.cur<=0&&!e.tel){c.cur=ph>=6?4.2:5.6;e.tel={k:'cur',t:.9,x:e.x-60,gy:rnd(54,146),two:ph>=6}}
        if(ph>=6&&c.glob<=0){c.glob=2.4;if(room(5)){ebFan(p.mx,p.my,5,1,66,aimA(p.mx,p.my),{sty:'cyfire'});e.mouth=.4}}}
    },
    hit(e,x,y){const lx=x-e.x,ly=y-e.y,ph=fPh(e);
      if(ph>=5&&Math.hypot(lx+6,ly-2)<14)return 1.6;
      if(inB(FBOX.torso,lx,ly))return 1;
      if(inB(FBOX.head,lx,ly-(e.hb||0)))return .9;
      if(ph<4&&inB(FBOX.can,lx,ly))return .6;
      if(ph<3&&inB(FBOX.claw,lx,ly))return .6;
      return 0},
    touch(e,px_,py){const lx=px_-e.x,ly=py-e.y,ph=fPh(e),m=shk(12),n=shk(6);
      if(inB([-34,-38,46,36],lx,ly,m,n))return true;if(inB(FBOX.head,lx,ly-(e.hb||0),m,n))return true;
      if(ph<4&&inB([-96,-30,-30,-4],lx,ly,m,n))return true;if(ph<3&&inB([-84,14,-40,40],lx,ly,m,n))return true;return false},
    draw(c,e,f){
      const t=e.t||0,ph=fPh(e),X=Math.round(e.x),Y=Math.round(e.y),hb=e.hb||0,ab=Math.round(Math.sin(t*1.5+1)*1.5);
      const dp=(pp,dx,dy)=>c.drawImage(f?pp.w:pp.c,X+pp.ox+(dx||0),Y+pp.oy+(dy||0));
      const p=fPos(e);
      // Ra's disc, spinning faster during the spiral
      if(!f&&(e.tel&&e.tel.k==='sp'||e.spir>0)&&((t*12)|0)&1){c.fillStyle=pat(YL);c.fillRect(X+30-58,Y-44-58,116,116)}
      dp(ph>=5?FU.discX[((t*3)|0)&1]:FU.disc[((t*(e.spir>0?14:3))|0)&3]);
      // the worm tail coiling off to the right
      for(let k=8;k>=0;k--){const s=FU.tail[k],x=X+38+k*8,y=Y+30+k*6+Math.sin(t*1.6-k*.6)*(3+k*1.4);c.drawImage(f?s.w:s.c,(x-s.c.width/2+(k===8?4:0))|0,(y-s.c.height/2)|0)}
      // kraken tentacles
      const tent=(i)=>{let x=X-8+i*16,y=Y+36+(i===1?4:0);for(let k=0;k<10;k++){const a=PI*.66+i*.08+Math.sin(t*1.8+i*1.3-k*.45)*.38;x+=Math.cos(a)*5.4;y+=Math.sin(a)*5.4;if(y>BOT+4)break;const r=Math.max(2,Math.round(6.5-k*.5)),s=FU.tent[r];c.drawImage(f?s.w:s.c,(x-s.c.width/2)|0,(y-s.c.height/2)|0)}
        if(!f&&e.tel&&e.tel.k==='cur'&&((t*16)|0)&1){c.fillStyle=pat(CY);c.fillRect((x-4)|0,(y-4)|0,9,9)}};
      tent(2);
      dp(ph>=5?FU.torsoX:FU.torso);
      dp(FU.stk);
      if(!f){for(const sx of [X+28,X+40]){const ag=mod(t*.8+sx*.1,1),s=PUFF[ag<.5?0:1];c.drawImage(s,(sx-s.width/2-ag*14)|0,(Y-66-ag*30-s.height/2)|0)}c.fillStyle=((t*3)|0)&1?RD:rd;c.fillRect(X+28,Y-64,1,1);c.fillRect(X+40,Y-64,1,1)}
      dp(ph>=2?FU.hullX:FU.hull);
      if(ph>=5){const cs=FU.core[((t*8)|0)&1];c.drawImage(f?FU.coreW[0]:cs,X-6-11,Y+2-11)}
      else{const sc=((t*5)|0)%9;dp(FU.screen[sc<6?0:sc<8?1:2])}
      tent(0);tent(1);
      dp(ph>=3?FU.clawX:FU.claw[((t*1.4)|0)&1],0,ph>=3?0:ab);
      dp(FU.neck,0,Math.round(hb/2));
      dp(FU.head[e.br?2:(e.mouth>0?1:0)],0,hb);
      dp(ph>=4?FU.canX:FU.can,0,ph>=4?0:-ab);
      if(f)return;
      // eye glow and telegraphs
      if(((t*4)|0)&1){c.fillStyle=WH;c.fillRect(X-66,Y-58+hb,2,1)}
      if(e.tel){const tl=e.tel,bl=((t*16)|0)&1;
        if(tl.k==='ice'&&bl){c.fillStyle=pat(CY);c.fillRect(p.sx-16,p.sy-14,32,28)}
        if(tl.k==='br'){c.fillStyle=bl?YL:OR;c.fillRect(p.mx-4,p.my-2,6,5);const y0=tl.low?174:26;for(let i=0;i<12;i++){const k=i/12,x=p.mx+(60-p.mx)*k,y=p.my+(y0-p.my)*k;if((i+((t*20)|0))&1)c.fillRect(x|0,y|0,2,1)}}
        if(tl.k==='cur'){for(let y=TOP+12;y<BOT-12;y+=6){if(Math.abs(y-tl.gy)<26)continue;c.fillStyle=bl?CY:WH;c.fillRect((tl.x)|0,y,2,2)}c.fillStyle=bl?WH:CY;c.fillRect((tl.x-3)|0,(tl.gy-26)|0,8,1);c.fillRect((tl.x-3)|0,(tl.gy+26)|0,8,1)}}
      if(e.tel2){const bl=((t*16)|0)&1;for(let y=TOP+12;y<BOT-12;y+=6){if(Math.abs(y-e.tel2.gy)<26)continue;c.fillStyle=bl?CY:WH;c.fillRect((e.tel2.x)|0,y,2,2)}}
      if(e.fT>0||(e.dsp>0&&((t*10)|0)%4===0)){e.fT=Math.max(0,e.fT-1/60);if(((t*14)|0)&1){c.fillStyle=pat(MG);c.fillRect(X-20,Y-12,28,28)}}
      if(ph>=4)for(let i=0;i<3;i++){c.fillStyle=Math.random()<.5?YL:WH;c.fillRect((X+rnd(-40,50))|0,(Y+rnd(-40,40))|0,1,1)}
      if(ph>=6&&((t*8)|0)&1){c.fillStyle=pat(RD);c.fillRect(X-40,Y-44,92,86)}
    },
    onKill(e){const X=e.x,Y=e.y;for(let i=0;i<10;i++)boom(X+rnd(-90,60),Y+rnd(-60,60),16,i<5);
      for(let i=0;i<30&&fxOk();i++)FX.push({x:X+rnd(-60,40),y:Y+rnd(-50,50),vx:rnd(-90,60),vy:rnd(-90,40),life:1.6,l0:1.6,c:[YL,OR,CY,MG,LL,LG][i%6],s:i%3?2:3});shake=1;G.flashT=.3}
  };

  /* ======================================================================
     THE BOSS HOST: boss rush (levels 1, 2) and Hive Queen + Fusion (level 3)
     ====================================================================== */
  const HPM={1:46,2:52,3:36};   // hp multipliers on the standard boss hp: tuned for a fully maxed ship (about 330 damage per second) on an extreme contract
  const SUBS={1:[0,1,2,3],2:[4,5,6,7],3:[8,'F']};
  const SUBW={3:[.18,.82]};
  const FALL={1:[2,3],2:[1,3],3:[2,1],4:[3,5,2],5:[4,3,2],6:[2,3,1,5],7:[3,5,4,1],8:[5,4,3,2,1]};
  const SPK={1:1.05,2:1.18,3:1.05};
  function resolveSegs(){
    const L=LV_(),list=SUBS[L],used={},out=[],ws=SUBW[L]||list.map(()=>1/list.length);
    list.forEach((i,n)=>{
      if(i==='F'){out.push({kind:'F',w:ws[n]});return}
      let pick=null;
      if(i===0)pick=0;else if(packF(i))pick=i;
      else{for(const j of (FALL[i]||[]))if(!used[j]&&packF(j)){pick=j;break}if(pick==null)pick=0}
      used[pick]=1;out.push(pick===0?{kind:0,w:ws[n]}:{kind:pick,F:packF(pick),w:ws[n]})});
    return out}
  function baseOf(b,i){let s=0;for(let k=i+1;k<b.segs.length;k++)s+=b.segs[k].w;return b.mhp*s}
  function startSeg(b,i){
    const s=b.segs[i];b.si=i;
    const sub={type:'boss',fr:'boss',x:W+90,y:100,vx:-60,vy:0,w:128,h:78,hp:1,mhp:1,pts:0,t:0,flash:0,shootT:2,ringT:4,phase:0,in:true,pkBoss:false};
    sub.mhp=b.mhp*s.w;sub.hp=Math.max(1e-4,b.hp-baseOf(b,i));
    b.cur={s,sub};RUSH.host=b;RUSH.sub=sub;RUSH.F=s.F||null;
    if(s.kind==='F'){sub.w=FUS.w;sub.h=FUS.h;FUS.init(sub)}
    else if(s.kind!==0){sub.pkBoss=true;sub.w=s.F.boss.w||128;sub.h=s.F.boss.h||78;if(!run(s.F,()=>{if(s.F.boss.init)s.F.boss.init(sub)}))toGlobal(b)}
    b.cz={cd:5,tele:0,kind:0,on:0,ft:0,a:0,gy:100,n:0}}
  function toGlobal(b){const cur=b.cur;if(!cur||cur.s.kind===0)return;cur.s={kind:0,w:cur.s.w};cur.sub.pkBoss=false;cur.sub.w=128;cur.sub.h=78;if(!(cur.sub.x>40&&cur.sub.x<W+120)){cur.sub.x=W+90;cur.sub.in=true;cur.sub.vx=-60}
    cur.sub.hitTest=null;cur.sub.touch=null;RUSH.F=null}
  function endSeg(b){
    const cur=b.cur,sub=cur.sub,s=cur.s;
    if(s.F&&s.F.boss.onKill)run(s.F,()=>s.F.boss.onKill(sub));
    for(let i=0;i<7;i++)boom(sub.x+rnd(-40,40),sub.y+rnd(-30,30),14,i<3);
    shake=Math.max(shake,.7);G.flashT=Math.max(G.flashT||0,.18);
    for(let i=0;i<EB.length&&fxOk();i+=2)FX.push({x:EB[i].x,y:EB[i].y,vx:rnd(-20,20),vy:rnd(-20,20),life:.4,c:MG,s:1});
    EB.length=0;dropCoins(sub.x,sub.y,12);
    b.hp=baseOf(b,b.si);b.cur=null;RUSH.sub=null;RUSH.F=null;b.gap=1.5}
  function hostHit(b,x,y){if(b.gap>0||!b.cur)return 0;const s=b.cur.s,sub=b.cur.sub;
    if(s.kind==='F')return sub.in?0:FUS.hit(sub,x,y);
    if(sub.hitTest){try{return sub.hitTest(sub,x,y)}catch(err){return 0}}
    return(Math.abs(x-sub.x)<sub.w/2+3&&Math.abs(y-sub.y)<sub.h/2+1)?1:0}
  function hostTouch(b,px_,py){if(b.gap>0||!b.cur)return false;const s=b.cur.s,sub=b.cur.sub;
    if(s.kind==='F')return FUS.touch(sub,px_,py);
    if(sub.touch){try{return sub.touch(sub,px_,py)}catch(err){return false}}
    return Math.abs(sub.x-px_)<sub.w/2+shk(12)&&Math.abs(sub.y-py)<sub.h/2+shk(6)}
  /* corruption layer: glitch curtains, spirals and aimed rings on top of the borrowed boss */
  function corrupt(b,sub,dt,live){
    const L=LV_(),cz=b.cz;if(!live||sub.in||sub.x>W-10||sub.x<60)return;
    if(cz.on>0){cz.on-=dt;cz.ft-=dt;if(cz.kind===1&&cz.ft<=0){cz.ft=L>=2?.13:.17;cz.a+=.33;if(room(4))ebSpiral(sub.x-10,sub.y,4,46,cz.a,{sty:'cyg',life:4.2})}return}
    if(cz.tele>0){cz.tele-=dt;if(cz.tele<=0){
        if(cz.kind===0){if(room(15))ebCurtain(W+2,TOP+12,BOT-12,15,-50,cz.gy,50,{sty:'cyg'});if(L>=2){cz.kind=3;cz.tele=1.3;cz.gy=clamp(cz.gy+(cz.gy<100?46:-46),50,150);return}}
        else if(cz.kind===3){if(room(15))ebCurtain(W+2,TOP+12,BOT-12,15,-50,cz.gy,50,{sty:'cyg'})}
        else if(cz.kind===1){cz.on=L>=2?2:1.5;cz.ft=0}
        else if(cz.kind===2){if(room(14))ebRing(sub.x,sub.y,14,50,aimA(sub.x,sub.y)+PI/14,{sty:'cyg',life:5})}
        sfxEnemyLaser()}return}
    cz.cd-=dt;if(cz.cd<=0){cz.cd=(L>=3?6:L>=2?4.6:7.5);cz.n++;cz.kind=L>=2?cz.n%3:cz.n%2;cz.tele=.9;cz.gy=rnd(52,148)}}
  /* drawing a borrowed boss through the corruption filter */
  const OC=mk(W,H),OG=OC.getContext('2d'),TC=mk(W,H),TG=TC.getContext('2d');OG.imageSmoothingEnabled=false;TG.imageSmoothingEnabled=false;
  const mkPat=(g,cols,w,h)=>{const c=mk(w,h),x=c.getContext('2d');for(let j=0;j<h;j++)for(let i=0;i<w;i++){const col=cols(i,j);if(col){x.fillStyle=col;x.fillRect(i,j,1,1)}}return g.createPattern(c,'repeat')};
  const SCAN=mkPat(OG,(i,j)=>j%4===0?((i&1)?MG:null):j%4===2&&!(i&1)?rd:null,2,4);
  const BAND=mkPat(OG,(i,j)=>((i+j)&1)?RD:null,2,2);
  const PTM=mkPat(TG,(i,j)=>((i+j)&1)?MG:null,2,2),PTC=mkPat(TG,(i,j)=>((i+j)&1)?CY:null,2,2);
  function drawGlobalBoss(g,e,f){const spr=f?SPR.bossW:(e.hp<e.mhp*.5?SPR.bossD:SPR.boss);if(!spr)return;g.save();g.translate((e.x-70)|0,(e.y-46)|0);g.scale(2,2);g.drawImage(spr,0,0);
    if(!f){g.fillStyle=Math.floor(e.t*6)%2?WH:RD;g.fillRect(21,23,3,3)}g.restore()}
  function corruptDraw(c,b,f){
    const cur=b.cur,s=cur.s,sub=cur.sub,t=b.t||0;
    OG.globalCompositeOperation='source-over';OG.clearRect(0,0,W,H);
    if(s.kind===0)drawGlobalBoss(OG,sub,f);
    else if(!run(s.F,()=>s.F.boss.draw(OG,sub,f))){toGlobal(b);drawGlobalBoss(OG,sub,f)}
    if(!f){OG.globalCompositeOperation='source-atop';const so=((t*20)|0)%4;OG.save();OG.translate(0,so);OG.fillStyle=SCAN;OG.fillRect(0,-so,W,H);OG.restore();
      const by=mod(t*70,H+40)-20;OG.fillStyle=BAND;OG.fillRect(0,by|0,W,10);OG.globalCompositeOperation='source-over';
      TG.globalCompositeOperation='source-over';TG.clearRect(0,0,W,H);TG.drawImage(OC,0,0);TG.globalCompositeOperation='source-in';TG.fillStyle=PTM;TG.fillRect(0,0,W,H);
      const j=((t*25)|0)%3;c.drawImage(TC,-2-j,0);TG.fillStyle=PTC;TG.fillRect(0,0,W,H);c.drawImage(TC,2+j,0)}
    c.drawImage(OC,0,0);
    if(!f){const k=(t*10)|0;for(let i=0;i<2;i++){const y0=(hash(k,i)*(H-20))|0,hh=2+((hash(k,i+5)*6)|0),dx=((hash(k,i+9)-.5)*12)|0;if(Math.abs(y0-sub.y)<70)c.drawImage(OC,0,y0,W,hh,dx,y0,W,hh)}}}
  function drawHostTele(c,b){const cz=b.cz;if(!cz||cz.tele<=0||!b.cur)return;const t=b.t||0,bl=((t*16)|0)&1,sub=b.cur.sub;
    if(cz.kind===0||cz.kind===3){for(let y=TOP+12;y<BOT-12;y+=6){if(Math.abs(y-cz.gy)<25)continue;c.fillStyle=bl?MG:CY;c.fillRect(W-6,y,3,2)}c.fillStyle=WH;c.fillRect(W-9,(cz.gy-25)|0,6,1);c.fillRect(W-9,(cz.gy+25)|0,6,1)}
    else{const r=Math.round(6+cz.tele*30);pixRing(c,sub.x,sub.y,r,bl?MG:CY)}}
  function pixRing(c,x,y,r,col){c.fillStyle=col;const n=Math.max(16,r*3);for(let i=0;i<n;i+=2){const a=i/n*TAU;c.fillRect((x+Math.cos(a)*r)|0,(y+Math.sin(a)*r)|0,1,1)}}

  A.boss={w:120,h:80,get hp(){return HPM[LV_()]},
    init(b){b.x=W+90;b.y=100;b.in=true;b.gap=0;b.segs=resolveSegs();b.hitTest=hostHit;b.touch=hostTouch;startSeg(b,0)},
    update(b,dt,live){
      RUSH.host=b;
      if(b.gap>0){b.gap-=dt;b.immune=true;b.x=W+60;b.y=100;b.vx=0;b.vy=0;b.w=b.h=2;if(b.gap<=0&&b.si<b.segs.length-1){b.immune=false;startSeg(b,b.si+1)}return}
      const cur=b.cur;if(!cur)return;const s=cur.s,sub=cur.sub,base=baseOf(b,b.si);
      sub.mhp=b.mhp*s.w;sub.hp=Math.max(1e-4,b.hp-base);sub.flash=b.flash;
      const k=s.kind==='F'?1:SPK[LV_()],sdt=dt*k;
      RUSH.sub=sub;RUSH.F=s.F||null;
      if(s.kind==='F'){sub.t+=dt;try{FUS.update(sub,dt,live,b)}catch(err){console.warn('city pack: fusion update',err)}}
      else if(s.kind===0){try{bossUpdate(sub,sdt,live)}catch(err){}}
      else{sub.t+=sdt;if(!run(s.F,()=>s.F.boss.update(sub,sdt,live)))toGlobal(b)}
      const cs=b.cur?b.cur.s:s;
      b.x=isFinite(sub.x)?sub.x:W+60;b.y=isFinite(sub.y)?sub.y:100;b.vx=sub.vx||0;b.vy=sub.vy||0;b.w=cs.kind==='F'?FUS.w:(sub.w||128);b.h=cs.kind==='F'?FUS.h:(sub.h||78);
      b.immune=cs.kind==='F'&&sub.in;b.in=sub.in;
      if(b.si<b.segs.length-1&&b.hp<=base+1e-4){endSeg(b);return}
      if(cs.kind!=='F')corrupt(b,sub,dt,live);
    },
    draw(c,b,f){
      if(!b.cur)return;const s=b.cur.s,sub=b.cur.sub;
      if(s.kind==='F'){FUS.draw(c,sub,f);return}
      corruptDraw(c,b,f);if(!f)drawHostTele(c,b)},
    onKill(b){
      const cur=b.cur;if(!cur)return;
      if(cur.s.kind==='F')FUS.onKill(cur.sub);
      else{if(cur.s.F&&cur.s.F.boss.onKill)run(cur.s.F,()=>cur.s.F.boss.onKill(cur.sub));for(let i=0;i<5;i++)boom(cur.sub.x+rnd(-40,40),cur.sub.y+rnd(-30,30),14,true)}
      b.cur=null;RUSH.host=null;RUSH.sub=null;RUSH.F=null}
  };
  A.buildMs=Math.round(performance.now()-t0);A.prof=prof;
  return A;
},
script(sc,h){
  const L=h.level;sc.length=0;
  const put=(t,type,y,o)=>sc.push(Object.assign({t,type,y},o||{}));
  const cl=y=>Math.max(36,Math.min(164,y));
  const pair=(t,y)=>{put(t,'ring',cl(y-11),{ph:0});put(t+.12,'ring',cl(y+11),{ph:0})};           // police drones fly in pairs
  const patrol=(t,n,y)=>{for(let i=0;i<n;i++)pair(t+i*.9,y+(i%2?18:-18))};
  const cars=(t,n,lanes)=>{for(let i=0;i<n;i++)put(t+i*.3,'dart',cl(lanes[i%lanes.length]),{lane:1})};
  const riot=(t,y)=>put(t,'ringR',cl(y),{variant:0});
  const bot=(t,y)=>put(t,'ringR',cl(y),{variant:1});
  const glitch=(t,n,y)=>{for(let i=0;i<n;i++)put(t+i*.5,'cross',cl(y+(i%2?24:-24)))};
  const ship=(t,y,v)=>put(t,'pod',cl(y),{variant:v});
  const junk=(t,n)=>{for(let i=0;i<n;i++)put(t+i*.55,'rock',100)};
  /* the planet wave table, as in the shared script, but kept clear of the mini boss */
  const pl=PLANETS[9],ev=pl.every*[1,.85,.7][L-1];
  for(let t0=8;t0<h.LEN-6;t0+=ev){if(t0>39&&t0<52)continue;for(const w of pl.waves)h.add(t0+Math.random()*2,w[0],w[1],w[2],40+Math.random()*120,0,{rand:1,ph:Math.random()*5})}
  patrol(2,2,70);cars(5,4,[60,140]);junk(7,2);
  bot(9,60);bot(10,140);pair(11.5,100);
  glitch(13,2,100);cars(15,6,[45,100,155]);
  ship(17,100,0);riot(18,60);riot(18.5,140);
  junk(21,4);patrol(22,3,100);
  cars(25,5,[70,130]);glitch(26,3,80);
  ship(29,60,1);bot(30,150);pair(31,120);
  cars(33,8,[40,80,120,160]);junk(34,3);
  riot(37,100);glitch(38,2,130);
  junk(45,3);pair(48,60);
  ship(51,130,0);cars(52,6,[50,150]);bot(53,90);
  glitch(55,4,100);patrol(56,3,70);
  riot(59,50);riot(59.4,150);junk(60,4);
  cars(63,9,[40,70,100,130,160]);ship(65,100,1);
  glitch(67,3,60);bot(68,140);pair(69,100);
  junk(71,5);riot(72,100);patrol(73,3,130);
  cars(76,8,[60,100,140]);glitch(77,3,100);ship(78,80,0);
  bot(80,50);bot(80.5,150);junk(81,4);pair(82,100);
  if(L>=2){riot(14,100);glitch(23,2,140);ship(36,140,1);bot(57,60);patrol(61.5,2,140);cars(70,6,[50,150]);riot(75,50);glitch(83,2,60)}
  if(L>=3){cars(19,6,[40,100,160]);glitch(32,3,100);riot(54,150);ship(62,50,0);junk(66,4);bot(74,100);cars(84,6,[70,130])}
}
};
Object.assign(PLANETS[9],{d:'FINAL. A BURNING FUTURE CITY. NEEDS A MAXED SHIP.',every:6,waves:[['ring',4,.3],['dart',4,.3],['cross',2,.8]]});
})();
