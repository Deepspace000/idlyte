/* Idlyte art pack: ICE MOON (planet index 2).
   Moody twilight over a frozen canyon.
   Background: dithered twilight sky with a cold low sun and the crescent of the parent planet, a shimmering aurora,
   far glacier mountains, a mid glacier with frozen wrecks (their lights still blink), near crystal spires top and bottom.
   Foreground: dark silhouettes and a wind driven blizzard.
   Cast: frost drones (ring, ringR), ice wraiths (dart, only hittable when solid), snow cannons (cross, mounted on ice
   pillars at the canyon edges), glacier whales (pod, release jelly spawn), cracking ice shelves (rock, some calve off
   the cliffs) and the Frozen Ancient Ship boss that thaws phase by phase.
   Everything is wrapped in a closure so no names leak into the shared global scope. */
(function(){
'use strict';

/* ---------- palette ramps (dark to bright) ---------- */
const ICE=['#1c1840','#352879','#6c5eb5','#70a4b2','#9ad2e0','#ffffff'];
const VIO=['#1c1840','#352879','#6f3d86','#6c5eb5','#cc99ff','#ffffff'];
const WRA=['#1c1840','#352879','#6f3d86','#8a5aa6','#cc99ff','#ffffff'];
const STEEL=['#1c1840','#352879','#444444','#6c6c6c','#959595','#bbbbbb'];
const HULL=['#000000','#1c1840','#352879','#6f3d86','#8a5aa6','#cc99ff'];
const HOT=['#000000','#1c1840','#6f3d86','#9a3a3a','#ff7777','#ff9966'];
const SHARDC=['#ffffff','#9ad2e0','#70a4b2','#9ad2e0'];
const VN=30,VM=13,VF=5,VFG=72; // scroll speeds in px/s: near terrain, mid glacier, far mountains, foreground
const CAY=6;                    // snowball gravity, kept gentle for the autopilot

/* ---------- tiny utilities ---------- */
const HEXC={};
function rgbOf(h){return HEXC[h]||(HEXC[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)])}
function srand(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
function dpick(r,v,x,y){const n=r.length;if(v<=0)return r[0];if(v>=.999)return r[n-1];const t=v*(n-1),k=Math.floor(t);return r[(t-k)>BAYER[y&3][x&3]/16?k+1:k]}
function nrm(a){const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function fx(x,y,vx,vy,life,c,s){if(FX.length<120)FX.push({x,y,vx,vy,life,c,s:s||1})}
function shatter(x,y,n,sp,cols){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=sp*(.35+Math.random()*.65);fx(x,y,Math.cos(a)*v,Math.sin(a)*v,.35+Math.random()*.5,cols[i%cols.length],Math.random()<.35?2:1)}}
function disc(c,x,y,r,col){c.fillStyle=col;if(r<=0){c.fillRect(x,y,1,1);return}c.fillRect(x-r,y-r+1,2*r+1,2*r-1);c.fillRect(x-r+1,y-r,2*r-1,2*r+1)}

/* pixel buffer: colours as hex strings, null is transparent. wrap=true wraps x (seamless strips) */
class Pix{
  constructor(w,h,wrap){this.w=w;this.h=h;this.wrap=!!wrap;this.c=new Array(w*h).fill(null)}
  set(x,y,col){if(y<0||y>=this.h)return;if(this.wrap)x=((x%this.w)+this.w)%this.w;else if(x<0||x>=this.w)return;this.c[y*this.w+x]=col}
  get(x,y){if(y<0||y>=this.h)return null;if(this.wrap)x=((x%this.w)+this.w)%this.w;else if(x<0||x>=this.w)return null;return this.c[y*this.w+x]}
  blit(p,ox,oy){for(let j=0;j<p.h;j++)for(let i=0;i<p.w;i++){const v=p.c[j*p.w+i];if(v)this.set(ox+i,oy+j,v)}return this}
  outline(col){const o=this.c.slice();for(let j=0;j<this.h;j++)for(let i=0;i<this.w;i++){if(this.c[j*this.w+i])continue;if(this.get(i-1,j)||this.get(i+1,j)||this.get(i,j-1)||this.get(i,j+1))o[j*this.w+i]=col}this.c=o;return this}
  flipY(){const o=new Array(this.w*this.h);for(let j=0;j<this.h;j++)for(let i=0;i<this.w;i++)o[(this.h-1-j)*this.w+i]=this.c[j*this.w+i];this.c=o;return this}
  copy(){const p=new Pix(this.w,this.h,this.wrap);p.c=this.c.slice();return p}
  canvas(){const cv=mk(this.w,this.h),g=cv.getContext('2d'),id=g.createImageData(this.w,this.h),d=id.data;
    for(let q=0;q<this.c.length;q++){const v=this.c[q];if(!v)continue;const r=rgbOf(v);d[q*4]=r[0];d[q*4+1]=r[1];d[q*4+2]=r[2];d[q*4+3]=255}
    g.putImageData(id,0,0);return cv}
}
function chamfer(D,w,h){
  const at=(i,j)=>(i<0||j<0||i>=w||j>=h)?1e4:D[j*w+i];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const q=j*w+i;if(D[q])D[q]=Math.min(D[q],at(i-1,j)+1,at(i,j-1)+1,at(i-1,j-1)+1.414,at(i+1,j-1)+1.414)}
  for(let j=h-1;j>=0;j--)for(let i=w-1;i>=0;i--){const q=j*w+i;if(D[q])D[q]=Math.min(D[q],at(i+1,j)+1,at(i,j+1)+1,at(i+1,j+1)+1.414,at(i-1,j+1)+1.414)}
}
/* bevel shading: a height field from the distance to the mask edge, lit from the upper left, dithered into a ramp.
   o.extra(i,j,v,dist,normal) may return a colour string, null (transparent) or a new light value */
function bevel(w,h,mask,o){
  o=o||{};const ramp=o.ramp||ICE,dep=o.depth||4,N=w*h,D=new Float32Array(N),M=new Uint8Array(N);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(mask(i,j)){M[j*w+i]=1;D[j*w+i]=1e4}
  const at=(i,j)=>(i<0||j<0||i>=w||j>=h)?0:D[j*w+i];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const q=j*w+i;if(M[q])D[q]=Math.min(D[q],at(i-1,j)+1,at(i,j-1)+1,at(i-1,j-1)+1.414,at(i+1,j-1)+1.414)}
  for(let j=h-1;j>=0;j--)for(let i=w-1;i>=0;i--){const q=j*w+i;if(M[q])D[q]=Math.min(D[q],at(i+1,j)+1,at(i,j+1)+1,at(i+1,j+1)+1.414,at(i-1,j+1)+1.414)}
  const HT=new Float32Array(N);
  for(let q=0;q<N;q++)if(M[q]){const d=Math.min(D[q],dep)/dep;HT[q]=(o.round?Math.sqrt(1-(1-d)*(1-d)):d)*dep}
  const ht=(i,j)=>(i<0||j<0||i>=w||j>=h)?0:HT[j*w+i];
  const L=nrm(o.light||[-.55,-.7,.62]),Hh=nrm([L[0],L[1],L[2]+1]),p=new Pix(w,h),sl=o.slope||1;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const q=j*w+i;if(!M[q])continue;
    const gx=(ht(i+1,j)-ht(i-1,j))*.5*sl,gy=(ht(i,j+1)-ht(i,j-1))*.5*sl,n=nrm([-gx,-gy,1]);
    const df=Math.max(0,n[0]*L[0]+n[1]*L[1]+n[2]*L[2]),sp=Math.pow(Math.max(0,n[0]*Hh[0]+n[1]*Hh[1]+n[2]*Hh[2]),o.sh||12);
    let v=(o.amb==null?.06:o.amb)+(o.kd==null?.95:o.kd)*df+(o.ks||0)*sp;
    if(o.extra){const r=o.extra(i,j,v,D[q],n);if(typeof r==='string'){p.c[q]=r;continue}if(r===null)continue;if(typeof r==='number')v=r}
    p.c[q]=dpick(ramp,v,i,j)}
  if(o.outline!==false){const oc=o.outline||'#000000';
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const q=j*w+i;if(M[q])continue;
      if((i>0&&M[q-1])||(i<w-1&&M[q+1])||(j>0&&M[q-w])||(j<h-1&&M[q+w]))p.c[q]=oc}}
  p.M=M;p.D=D;return p}

/* ---------- convex polyhedron renderer for crystals and ice slabs ---------- */
function mmul(A,B){const C=[[0,0,0],[0,0,0],[0,0,0]];for(let i=0;i<3;i++)for(let j=0;j<3;j++)C[i][j]=A[i][0]*B[0][j]+A[i][1]*B[1][j]+A[i][2]*B[2][j];return C}
function rX(a){const c=Math.cos(a),s=Math.sin(a);return [[1,0,0],[0,c,-s],[0,s,c]]}
function rY(a){const c=Math.cos(a),s=Math.sin(a);return [[c,0,s],[0,1,0],[-s,0,c]]}
function rZ(a){const c=Math.cos(a),s=Math.sin(a);return [[c,-s,0],[s,c,0],[0,0,1]]}
function rAx(u,a){u=nrm(u);const c=Math.cos(a),s=Math.sin(a),t=1-c,x=u[0],y=u[1],z=u[2];
  return [[t*x*x+c,t*x*y-s*z,t*x*z+s*y],[t*x*y+s*z,t*y*y+c,t*y*z-s*x],[t*x*z-s*y,t*y*z+s*x,t*z*z+c]]}
function mv(R,v){return [R[0][0]*v[0]+R[0][1]*v[1]+R[0][2]*v[2],R[1][0]*v[0]+R[1][1]*v[1]+R[1][2]*v[2],R[2][0]*v[0]+R[2][1]*v[1]+R[2][2]*v[2]]}
function mtv(R,v){return [R[0][0]*v[0]+R[1][0]*v[1]+R[2][0]*v[2],R[0][1]*v[0]+R[1][1]*v[1]+R[2][1]*v[2],R[0][2]*v[0]+R[1][2]*v[1]+R[2][2]*v[2]]}
/* bipyramid: n sided, equator radius r, points at +-hl along axis ax (0 x, 1 y, 2 z). planes are [nx,ny,nz,d] with n.p<=d */
function bipyr(n,r,hl,ax){const ri=r*Math.cos(Math.PI/n),out=[];
  for(let k=0;k<n;k++){const a=(k+.5)/n*2*Math.PI,u1=Math.cos(a),u2=Math.sin(a);
    for(const sg of [1,-1]){const v=[0,0,0];v[ax]=sg*ri;v[(ax+1)%3]=hl*u1;v[(ax+2)%3]=hl*u2;const l=Math.hypot(v[0],v[1],v[2]);out.push([v[0]/l,v[1]/l,v[2]/l,ri*hl/l])}}
  return out}
/* a box with random corner cuts: an ice chunk */
function chunk(hx,hy,hz,cuts,rr){const out=[[1,0,0,hx],[-1,0,0,hx],[0,1,0,hy],[0,-1,0,hy],[0,0,1,hz],[0,0,-1,hz]];
  for(let i=0;i<cuts;i++){const n=nrm([rr()*2-1,rr()*2-1,rr()*2-1]),sup=hx*Math.abs(n[0])+hy*Math.abs(n[1])+hz*Math.abs(n[2]);out.push([n[0],n[1],n[2],sup*(.62+rr()*.22)])}
  return out}
/* orthographic ray cast through a union of convex parts. viewer at -z, light from the upper left front */
function gem(w,h,parts,R,o){
  o=o||{};const ramp=o.ramp||ICE,p=new Pix(w,h),N=w*h,F=new Int16Array(N).fill(-1),Vv=new Float32Array(N);
  const tp=parts.map(pl=>pl.map(q=>{const n=mv(R,q);return [n[0],n[1],n[2],q[3]]}));
  const L=nrm([-.5,-.72,-.62]),Hv=nrm([L[0],L[1],L[2]-1]),cx=w/2,cy=h/2;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
    const x=i+.5-cx,y=j+.5-cy;let best=1e9,bn=null,bid=-1,th=0;
    for(let k=0;k<tp.length;k++){const pl=tp[k];let zi=-1e9,zo=1e9,id=-1,ok=true;
      for(let q=0;q<pl.length;q++){const pq=pl[q],a=pq[2],b=pq[3]-pq[0]*x-pq[1]*y;
        if(Math.abs(a)<1e-7){if(b<0){ok=false;break}continue}
        const z=b/a;if(a>0){if(z<zo)zo=z}else if(z>zi){zi=z;id=q}}
      if(ok&&id>=0&&zi<=zo&&zi<best){best=zi;bn=pl[id];bid=k*64+id;th=zo-zi}}
    if(bid<0)continue;
    const q=j*w+i,df=Math.max(0,bn[0]*L[0]+bn[1]*L[1]+bn[2]*L[2]),sp=Math.pow(Math.max(0,bn[0]*Hv[0]+bn[1]*Hv[1]+bn[2]*Hv[2]),o.sh||14);
    let v=(o.amb==null?.1:o.amb)+(o.kd==null?.75:o.kd)*df+(o.ks==null?.5:o.ks)*sp;
    F[q]=bid;Vv[q]=v;
    if(o.extra){const r=o.extra(i,j,v,mtv(R,[x,y,best]),th,x,y);if(typeof r==='string'){p.c[q]=r;Vv[q]=-99;continue}if(typeof r==='number')Vv[q]=r}
  }
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const q=j*w+i;if(F[q]<0||Vv[q]===-99)continue;let v=Vv[q];
    const fl=i>0?F[q-1]:-1,fu=j>0?F[q-w]:-1;if((fl>=0&&fl!==F[q])||(fu>=0&&fu!==F[q]))v+=(o.edge==null?.2:o.edge);
    p.c[q]=dpick(ramp,v,i,j)}
  if(o.outline!==false)p.outline(o.outline||'#000000');
  return p}

/* rotate a Pix by angle a (nearest neighbour). result.map(lx,ly) gives where a source pixel lands */
function rotPix(p,a){const c=Math.cos(a),s=Math.sin(a),cx=p.w/2,cy=p.h/2;
  const cs=[[-cx,-cy],[cx,-cy],[-cx,cy],[cx,cy]].map(q=>[q[0]*c-q[1]*s,q[0]*s+q[1]*c]);
  const w=Math.ceil(Math.max(...cs.map(q=>q[0]))-Math.min(...cs.map(q=>q[0])))+2,h=Math.ceil(Math.max(...cs.map(q=>q[1]))-Math.min(...cs.map(q=>q[1])))+2,o=new Pix(w,h),ox=w/2,oy=h/2;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=i+.5-ox,dy=j+.5-oy,v=p.get(Math.floor(dx*c+dy*s+cx),Math.floor(-dx*s+dy*c+cy));if(v)o.c[j*w+i]=v}
  o.map=(lx,ly)=>{const dx=lx+.5-cx,dy=ly+.5-cy;return [Math.floor(dx*c-dy*s+ox),Math.floor(dx*s+dy*c+oy)]};
  return o}
/* snow on every upward facing edge */
function snowTop(p){const o=p.c.slice();for(let j=1;j<p.h;j++)for(let i=0;i<p.w;i++){const q=j*p.w+i;if(p.c[q]&&!p.c[q-p.w]){o[q]='#ffffff';if(j+1<p.h&&p.c[q+p.w]&&((i+j)&1))o[q+p.w]='#9ad2e0'}}p.c=o;return p}

/* ---------- terrain shapes ---------- */
/* crystal spire: base row, height, half width, apex lean. pal=[shadow,mid,lit,rim,tip]. o.split adds a third facet */
function spire(px,cx,base,hgt,hw,lean,pal,o){o=o||{};const ax=cx+lean,ay=base-hgt,rg=o.ridge==null?-hw*.12:o.ridge;
  for(let y=Math.max(0,Math.ceil(ay));y<=base&&y<px.h;y++){
    const f=(y-ay)/Math.max(1,hgt),xl=ax+(cx-hw-ax)*f,xr=ax+(cx+hw-ax)*f,xm=ax+(cx+rg-ax)*f,xs=ax+(cx-hw*.55-ax)*f,up=1-f;
    const il=Math.round(xl),ir=Math.round(xr),im=Math.round(xm),is=Math.round(xs);
    for(let x=il;x<=ir;x++){let col;
      if(x===il)col=f<.4?pal[4]:pal[3];
      else if(x<im){if(o.split&&x<is)col=dpick([pal[1],pal[2],pal[3]],.45+up*.55,x,y);else if(o.split&&x===is)col=f<.6?pal[3]:pal[2];else col=dpick([pal[1],pal[2],pal[3]],.2+up*.55,x,y)}
      else if(x===im)col=f<.5?pal[3]:pal[2];
      else col=dpick([pal[0],pal[1]],.12+up*.6,x,y);
      px.set(x,y,col)}}
  const ty=Math.ceil(ay);if(ty>=0&&ty<px.h)px.set(Math.round(ax),ty,pal[4])}
/* glacier block: snow cap, vertical striations, strata lines. pal=[shadow,body,lit,rim,snow] */
function block(px,x0,x1,top,base,pal,seed){const r=srand(seed);
  for(let x=x0;x<=x1;x++){const e=Math.min(x-x0,x1-x),tn=Math.round(top+(e<5?(5-e)*1.3:0)+(r()<.25?1:0));
    for(let y=Math.max(0,tn);y<=base&&y<px.h;y++){let col;const dy=y-tn;
      if(dy===0)col=pal[4];
      else if(dy<3)col=dpick([pal[2],pal[4]],.55-dy*.15,x,y);
      else{const st=((x*37+11)%7)/7;let v=.22+.4*st-(dy/(base-tn+1))*.25;if(x-x0<2)v+=.4;if(((y+((x*.15)|0))%7)===0)v-=.2;col=dpick([pal[0],pal[1],pal[2]],v,x,y)}
      px.set(x,y,col)}}}

/* ================================================================== */
PACKS[2]={
init(){
  /* ---------- sky: twilight gradient, cold low sun, crescent of the parent planet, stars ---------- */
  const SX=150,SY=145,PLX=64,PLY=-26,PLR=70,sdir=nrm([SX-PLX,SY-PLY,0]);
  const SKY=['#000000','#1c1840','#352879','#6f3d86','#6c5eb5','#70a4b2','#9ad2e0'];
  const skyP=new Pix(W,H),rs=srand(9),TWK=[];
  for(let y=TOP-1;y<=BOT;y++)for(let x=0;x<W;x++){
    const g=(y-TOP)/(BOT-TOP);let v=g<.3?g/.3*.16:.16+(g-.3)/.7*.3;
    const sd=Math.hypot((x-SX)*.75,(y-SY)*1.5);v+=Math.max(0,1-sd/110)*.2+Math.max(0,1-sd/34)*.18;
    if(Math.abs(y-SY)<=1)v+=Math.max(0,1-Math.abs(x-SX)/70)*.14;
    let col=dpick(SKY,v,x,y);
    const px=x-PLX,py=y-PLY,pr=Math.hypot(px,py);
    if(pr<PLR){const nx=px/PLR,ny=py/PLR,lit=nx*sdir[0]+ny*sdir[1];
      if(pr>PLR-1.3&&lit>.45)col=lit>.8?'#9ad2e0':'#6c5eb5';
      else if(lit>.84)col=dpick(['#352879','#6c5eb5','#70a4b2','#9ad2e0'],(lit-.84)/.16,x,y);
      else{const band=.5+.5*Math.sin(ny*17+Math.sin(nx*4)*1.3);col=dpick(['#000000','#1c1840','#352879'],.18+band*.3*(lit+1)*.5,x,y)}}
    else if(y<132&&rs()<.014*(1-g)){const q=rs();col=q<.25?'#bbbbbb':q<.55?'#6c6c6c':'#444444';if(q<.08&&TWK.length<14)TWK.push([x,y])}
    const sdd=Math.hypot(x-SX,y-SY);if(sdd<6.5)col=sdd<3.6?'#ffffff':sdd<5.5?'#9ad2e0':'#70a4b2';
    skyP.set(x,y,col)}
  const SKYC=skyP.canvas();

  /* ---------- aurora: two strips (dim, bright) drawn in rippling 4 px slices ---------- */
  const AW=480,AH=58;
  const AUR=[0,1].map(br=>{const p=new Pix(AW+4,AH),TP=Math.PI*2/AW;
    for(let x=0;x<AW+4;x++){const xx=x%AW;
      const base=30+7*Math.sin(xx*TP*2)+5*Math.sin(xx*TP*5+1)+2.5*Math.sin(xx*TP*11+2);
      const ray=clamp(.5+.5*Math.sin(xx*TP*37)*Math.sin(xx*TP*9+2)+.15*Math.sin(xx*TP*83),0,1);
      for(let y=0;y<AH;y++){let col=null;
        if(y>base){const d=y-base;if(d<5)col=dpick([null,'#6f3d86','#cc44cc','#ff77ff'],(1-d/5)*(br?.95:.62)*(.4+.6*ray),x,y)}
        else{const d=base-y;let v=ray*Math.exp(-d/(br?15:11))*(br?1:.7);if(d<2)v+=.22*(br?1:.6);col=dpick([null,null,'#2c5a2c','#588d43','#9ad284','#ccff99'],v,x,y)}
        if(col)p.set(x,y,col)}}
    return p.canvas()});

  /* ---------- far glacier mountains (bottom) ---------- */
  const FW=640,FH=64,farP=new Pix(FW,FH,true),rf=srand(101),peaks=[];
  for(let i=0;i<20;i++)peaks.push({cx:i*32+rf()*20,h:20+rf()*40,s:.9+rf()*.8});
  for(let x=0;x<FW;x++){let best=-1,bdx=0;
    for(const p of peaks){let dx=x-p.cx;dx-=Math.round(dx/FW)*FW;const hh=p.h-Math.abs(dx)*p.s+Math.sin(x*.9+p.cx)*.9+Math.sin(x*2.3)*.6;if(hh>best){best=hh;bdx=dx}}
    best=Math.max(best,6+2*Math.sin(x*Math.PI*2/FW*9));const yt=Math.round(FH-best);
    for(let y=Math.max(0,yt);y<FH;y++){const d=y-yt;let col;
      if(bdx<0)col=d===0?'#6c5eb5':d<3?dpick(['#352879','#6c5eb5'],.35,x,y):dpick(['#1c1840','#352879'],.6-d/40,x,y);
      else col=d===0?'#352879':dpick(['#000000','#1c1840'],.75-d/50,x,y);
      if(y>FH-12)col=dpick([col,'#352879'],(y-(FH-12))/18,x,y);
      farP.set(x,y,col)}}
  const FARC=farP.canvas();

  /* ---------- frozen wrecks (pre-rendered, rotated, snow on top, lights listed) ---------- */
  const lights=[];
  function wreckFreighter(){
    const m=(i,j)=>{const x=i+.5,y=j+.5;
      if(x>=4&&x<=58&&y>=7&&y<=16){if(x<10)return ((x-10)/6)**2+((y-11.5)/4.5)**2<=1;if(x>40&&x<45&&((j*3+i)%5)<2)return false;return true}
      if(x>=46&&x<=56&&y>=2&&y<=7)return true;
      for(const c of [14,23,32])if(x>=c&&x<=c+7&&y>=4&&y<=7)return true;
      return x>58&&x<=62&&y>=9&&y<=14};
    const p=bevel(64,20,m,{ramp:STEEL,depth:3,round:true,outline:false,extra:(i,j,v)=>{if(j===10&&i%3===0&&i>8&&i<40)return '#1c1840';if(j===4&&i>=48&&i<=54&&i%2===0)return '#1c1840';return v}});
    return {p,l:[[49,4,'#ffffaa',2.2,.5],[61,11,'#ff7777',1.3,.3],[20,10,'#9ad284',3.1,.6],[29,10,'#9ad284',2.7,.2]]}}
  function wreckStation(){
    const m=(i,j)=>{const x=i+.5,y=j+.5;
      if(y<=27&&((x-23)/15)**2+((y-27)/14)**2<=1)return true;
      if(y>23&&y<=28&&x>=4&&x<=42)return true;
      if(x>=22&&x<=23.5&&y>=2&&y<=14)return true;
      return ((x-30)/3.2)**2+((y-9)/1.6)**2<=1};
    const p=bevel(46,30,m,{ramp:STEEL,depth:4,round:true,outline:false,extra:(i,j,v)=>{if(j<22&&j>13&&(i*7+j*13)%23===0)return '#1c1840';if(j%5===0&&j>14)return v-.2;return v}});
    return {p,l:[[22,2,'#ff7777',1.6,.35],[16,18,'#9ad284',2.5,.5],[29,17,'#70a4b2',3.4,.7]]}}
  function wreckFighter(){
    const wing=(x,y)=>{const ay=Math.abs(y);return x>=13&&x<=27&&ay>=1.5&&ay<=7&&x>=13+(ay-1.5)*1.6&&x<=22+(ay-1.5)*.9};
    const m=(i,j)=>{const x=i+.5,y=j+.5-8;if(x>=2&&x<=27){const t=(x-2)/25;if(Math.abs(y)<=.8+t*2.8)return true}return wing(x,y)};
    const p=bevel(30,16,m,{ramp:STEEL,depth:2,round:true,outline:false,extra:(i,j,v)=>(i>=6&&i<=9&&j===7)?'#352879':v});
    return {p,l:[[8,7,'#70a4b2',2.9,.4],[24,1,'#ff7777',1.1,.25],[24,15,'#ff7777',1.1,.25]]}}

  /* ---------- mid glacier (bottom): cliffs, spires, frozen wrecks ---------- */
  const MW=768,MH=52,midB=new Pix(MW,MH,true),rm=srand(311);
  const MSP=['#1c1840','#352879','#6c5eb5','#70a4b2','#9ad2e0'],MBL=['#1c1840','#352879','#6c5eb5','#70a4b2','#9ad2e0'];
  for(let i=0;i<14;i++)spire(midB,Math.round(rm()*MW),MH-1,18+rm()*22,4+rm()*4,(rm()-.5)*5,MSP,{split:rm()<.5});
  for(let x=0;x<MW;){const w=22+Math.round(rm()*44),tall=rm();block(midB,x,x+w,MH-8-Math.round(tall*tall*26),MH-1,MBL,x+7);x+=w+Math.round(rm()*14)-4}
  const WRK=[[wreckFreighter(),-.22,80],[wreckStation(),.14,340],[wreckFighter(),-1.0,585]];
  for(const wk of WRK){const rp=rotPix(wk[0].p,wk[1]);snowTop(rp);rp.outline('#000000');
    const ox=wk[2],oy=MH-rp.h-(wk[1]<-.5?-2:4),iceLine=MH-11;
    for(let j=0;j<rp.h;j++)for(let i=0;i<rp.w;i++){let v=rp.c[j*rp.w+i];if(!v)continue;const X=ox+i,Y=oy+j;
      if(Y>iceLine)v=BAYER[Y&3][X&3]<8?(Y>iceLine+4?'#352879':'#6c5eb5'):v;midB.set(X,Y,v)}
    for(const l of wk[0].l){const m=rp.map(l[0],l[1]);if(oy+m[1]<=iceLine)lights.push({x:ox+m[0],y:oy+m[1],c:l[2],p:l[3],d:l[4]})}}
  for(let x=0;x<MW;){const w=14+Math.round(rm()*26);if(rm()<.55)block(midB,x,x+w,MH-5-Math.round(rm()*6),MH-1,MBL,x+91);x+=w+Math.round(rm()*20)}
  midB.outline('#1c1840');
  const MIDBC=midB.canvas();

  /* ---------- mid glacier (top): hanging ice and icicles ---------- */
  const MTH=30,midT=new Pix(MW,MTH,true);
  for(let x=0;x<MW;){const w=24+Math.round(rm()*40);block(midT,x,x+w,MTH-6-Math.round(rm()*8),MTH-1,['#000000','#1c1840','#352879','#6c5eb5','#70a4b2'],x+3);x+=w-Math.round(rm()*6)}
  for(let i=0;i<34;i++)spire(midT,Math.round(rm()*MW),MTH-1,8+rm()*18,1.5+rm()*2.5,(rm()-.5)*2,['#1c1840','#352879','#6c5eb5','#70a4b2','#9ad2e0'],{});
  midT.flipY();midT.outline('#1c1840');
  const MIDTC=midT.canvas();

  /* ---------- near crystal spires (bottom and top) ---------- */
  const NW=704,NBH=30,NTH=22,rn=srand(203);
  const NPAL=['#352879','#6c5eb5','#70a4b2','#9ad2e0','#ffffff'],NPD=['#1c1840','#352879','#6c5eb5','#70a4b2','#9ad2e0'];
  const nearB=new Pix(NW,NBH,true);
  for(let x=0;x<NW;x+=8+rn()*10)spire(nearB,Math.round(x),NBH-1,3+rn()*5,7+rn()*6,(rn()-.5)*3,NPD,{});
  for(let cx=6;cx<NW;){const hm=11+rn()*16,hw=3+rn()*3,side=[],ns=1+Math.floor(rn()*3);
    for(let k=0;k<ns;k++){const sg=rn()<.5?-1:1;side.push([cx+sg*(hw+1+rn()*6),hm*(.35+rn()*.4),2+rn()*2.5,sg*(1+rn()*3)])}
    spire(nearB,cx,NBH-1,hm,hw,(rn()-.5)*4,NPAL,{split:rn()<.6});
    for(const s of side)spire(nearB,Math.round(s[0]),NBH-1,s[1],s[2],s[3],NPAL,{});
    cx+=Math.round(34+rn()*46)}
  nearB.outline('#000000');
  const NBT=new Int16Array(NW).fill(NBH);for(let x=0;x<NW;x++)for(let y=0;y<NBH;y++)if(nearB.c[y*NW+x]){NBT[x]=y;break}
  const nearT=new Pix(NW,NTH,true);
  for(let x=0;x<NW;x+=8+rn()*10)spire(nearT,Math.round(x),NTH-1,2+rn()*4,7+rn()*6,(rn()-.5)*3,NPD,{});
  for(let cx=20;cx<NW;){const hm=7+rn()*12,hw=1.6+rn()*2;spire(nearT,cx,NTH-1,hm,hw,(rn()-.5)*2,NPAL,{});
    const ns=Math.floor(rn()*3);for(let k=0;k<ns;k++){const sg=rn()<.5?-1:1;spire(nearT,Math.round(cx+sg*(hw+2+rn()*4)),NTH-1,hm*(.3+rn()*.4),1.2+rn()*1.5,0,NPAL,{})}
    cx+=Math.round(26+rn()*40)}
  nearT.flipY();nearT.outline('#000000');
  const NTB=new Int16Array(NW).fill(0);for(let x=0;x<NW;x++)for(let y=NTH-1;y>=0;y--)if(nearT.c[y*NW+x]){NTB[x]=y;break}
  const NEARBC=nearB.canvas(),NEARTC=nearT.canvas();

  /* ---------- foreground silhouettes ---------- */
  const GW=1280,GBH=18,GTH=14,rg=srand(77),fgB=new Pix(GW,GBH,true),fgT=new Pix(GW,GTH,true),FGL=[];
  const SIL=['#000000','#000000','#1c1840','#352879','#6c5eb5'];
  for(const cx of [150,520,860,1120]){spire(fgB,cx,GBH-1,10+rg()*7,4+rg()*3,(rg()-.5)*4,SIL,{});spire(fgB,cx+7,GBH-1,5+rg()*5,3,3,SIL,{});spire(fgB,cx-6,GBH-1,4+rg()*4,3,-2,SIL,{})}
  for(let i=0;i<46;i++){const x=640+i,y=Math.round(GBH-3-i*.18);fgB.set(x,y,'#000000');fgB.set(x,y+1,'#000000');if(i%6===0)for(let k=0;k<6;k++)fgB.set(x+(k>>1),y+1+k,'#000000')}
  for(let i=0;i<46;i++)fgB.set(640+i,Math.round(GBH-4-i*.18),'#352879');
  FGL.push({x:685,y:GBH-13,c:'#ff7777',p:1.4,d:.3});
  for(const cx of [300,700,1000,1210]){spire(fgT,cx,GTH-1,8+rg()*5,2+rg()*2,0,SIL,{});spire(fgT,cx+5,GTH-1,4+rg()*4,1.5,0,SIL,{})}
  fgT.flipY();fgB.outline('#000000');
  const FGBC=fgB.canvas(),FGTC=fgT.canvas();

  /* ---------- snow ---------- */
  const FL=[],rsn=srand(55);
  for(let i=0;i<76;i++){const z=rsn();FL.push({x:rsn()*360,y:rsn()*178,z,v:.45+z*1.25,ph:rsn()*6.28,c:z<.35?'#6c5eb5':z<.75?'#9ad2e0':'#ffffff'})}

  /* ---------- enemy sprites ---------- */
  // frost drone: rotating hexagonal ice bipyramid with a glowing core
  const DF=[];
  for(let f=0;f<6;f++){const R=mmul(rY(.42),mmul(rZ(-.08),rX(f/6*Math.PI/3))),cs=[1,1.1,1.25,1.1,1,.9][f];
    DF.push(gem(19,15,[bipyr(6,5.4,7.6,0)],R,{ramp:ICE,amb:.12,kd:.8,ks:.6,edge:.22,extra:(i,j,v,po,th,x,y)=>{
      const cr=(x*x)/(2.4*2.4*cs)+(y*y)/(1.7*1.7*cs);if(cr<1)return cr<.4?'#ffffff':'#9ad2e0';return v-th*.012}}).canvas())}
  const DW=DF.map(whiteOf);
  // big drone: an octagonal crystal with a cross of spikes and a pink heart
  const RRF=[];
  for(let f=0;f<8;f++){const R=mmul(rY(.35),mmul(rZ(.06),rX(f/8*Math.PI)));
    RRF.push(gem(25,19,[bipyr(8,4.6,10,0),bipyr(4,2.3,7.6,1),bipyr(4,2,5.2,2)],R,{ramp:VIO,amb:.12,kd:.8,ks:.6,edge:.2,extra:(i,j,v,po,th,x,y)=>{
      const cr=(x*x)/4.4+(y*y)/2.6;if(cr<1)return cr<.35?'#ffffff':(f%2?'#ff77ff':'#cc44cc');return v-th*.01}}).canvas())}
  const RRW=RRF.map(whiteOf);
  // jelly spawn released by glacier whales
  const JM={k:'#000000',g:'#588d43',a:'#9ad284',w:'#ffffff',m:'#ff77ff',p:'#cc44cc',d:'#2c5a2c'};
  const JF=[[
"...........","...kkkkk...","..kgaaagk..",".kgawaaagk.",".kgaagaggk.","kgggmgmgggk","kkdkdkdkdkk","..m.m.m.m..","..p.m.p.m..",".m..p..m.p.",".p.......m."],[
"....kkk....","...kgaak...","..kgawagk..","..kgaaggk..","..kgagagk..","..kgmgmgk..","..kdkdkdk..","...m.m.m...","...p.m.p...","...m.p.m...","....p.p...."]].map(r=>fromRows(r,ch=>JM[ch]));
  const JW=JF.map(whiteOf);
  // ice wraith: a pale spectral blade with a swept crest and trailing wisps
  const wrMask=(i,j)=>{const x=i+.5,y=j+.5-8.5;
    if(x>=2&&x<=21){const t=(x-2)/19;let hh=.6+3.3*Math.sin(Math.min(1,t*1.3)*Math.PI/2);if(t>.78)hh-=(t-.78)*12;if(hh>0&&Math.abs(y+t*.6)<=hh)return true}
    if(x>=7&&x<=20){const yc=-3.2-(x-7)*.33;if(Math.abs(y-yc)<=1.2-(x-7)*.05)return true}
    if(x>=10&&x<=17){const yc=3.2+(x-10)*.4;if(Math.abs(y-yc)<=.9)return true}
    return false};
  const WRF=[],WRG=[];
  for(let f=0;f<4;f++){
    const body=bevel(30,17,wrMask,{ramp:WRA,depth:3,round:true,amb:.12,kd:.95,ks:.4,extra:(i,j,v,d)=>{
      if(j===8&&(i===5||i===6))return f===3?'#cc44cc':(i===5&&f%2===0?'#ffffff':'#ff77ff');
      if(i%3===0&&i>8&&i<19&&d>1)return v-.22;return v}});
    const p=new Pix(30,17);
    for(let k=0;k<3;k++)for(let x=17;x<30;x++){const u=(x-17)/12,y=Math.round(8.5+(k-1)*2.6+Math.sin(x*.75+f*Math.PI/2+k*1.7)*(x-16)*.13);
      if(u>.55&&((x+y+f)&1))continue;p.set(x,y,u<.35?'#cc99ff':u<.7?'#8a5aa6':'#6f3d86')}
    p.blit(body,0,0);WRF.push(p.canvas());
    const g=new Pix(30,17),GM={'#ffffff':'#cc99ff','#cc99ff':'#6c5eb5','#8a5aa6':'#352879','#6f3d86':'#352879','#352879':'#1c1840','#1c1840':null,'#000000':null};
    for(let j=0;j<17;j++)for(let i=0;i<30;i++){const v=p.c[j*30+i];if(!v||BAYER[j&3][i&3]>=8)continue;const m=v in GM?GM[v]:v;if(m)g.c[j*30+i]=m}
    WRG.push(g.canvas())}
  const WRW=WRF.map(whiteOf);
  // snow cannon: frosted steel dome on an ice pillar
  const domeMask=(i,j)=>{const x=i+.5,y=j+.5;if(y<=9.5&&((x-8.5)/7)**2+((y-9.5)/7.6)**2<=1)return true;return y>9&&y<=11.5&&x>=1.5&&x<=15.5};
  const DB=[],DT=[];
  for(let f=0;f<2;f++){
    const mkDome=()=>bevel(17,15,domeMask,{ramp:STEEL,depth:3,round:true,amb:.1,kd:.9,ks:.5,extra:(i,j,v)=>{
      if((i===5||i===6)&&j===6)return f?'#9a3a3a':'#ff7777';
      if(j<4.2+Math.sin(i*1.4)*.8&&j<9)return j<3.4?'#ffffff':(((i+j)&1)?'#ffffff':'#9ad2e0');
      if(j===11)return v-.3;if(j===10&&i%3===0)return '#959595';return v}});
    const b=mkDome();for(const ic of [[3,2],[6,1],[11,3],[13,1]])for(let k=0;k<ic[1];k++)b.set(ic[0],12+k,k===ic[1]-1?'#ffffff':'#9ad2e0');
    DB.push(b.canvas());
    const t=mkDome().flipY();for(const ic of [[7,13],[8,13],[8,14],[10,13]])t.set(ic[0],ic[1],ic[1]===14?'#ffffff':'#9ad2e0');
    DT.push(t.canvas())}
  const DBW=DB.map(whiteOf),DTW=DT.map(whiteOf);
  const pilP=bevel(13,48,(i,j)=>{const x=i+.5;return Math.abs(x-6.5)<=5-(((j*7)%5)===0?1:0)},{ramp:ICE,depth:3,amb:.08,kd:.85,ks:.3,extra:(i,j,v,d)=>{
    if(j%9===4&&d>1)return '#1c1840';if(j%9===5)return v+.18;if(i===3)return v+.12;return v-j*.006}});
  const PIL=pilP.canvas(),PILT=pilP.copy().flipY().canvas();
  // glacier whale: translucent ice creature, crystal back spikes, glowing organs, beating tail
  const SPK=[[16,4],[21,5.5],[26,4],[30.5,2.5]],SPOTS=[[14.5,13],[19.5,12],[24.5,13],[29,13.5]];
  const yTopW=x=>{const u=(x-22)/14;return Math.abs(u)<1?14.5-7.6*Math.sqrt(1-u*u):99};
  const spikeAt=(x,y)=>{for(const k of SPK){const yt=yTopW(k[0]);if(y<yt+1.5&&y>=yt-k[1]&&Math.abs(x-k[0])<=(y-(yt-k[1]))*.42+.3)return k}return null};
  const WHF=[];
  for(let f=0;f<4;f++){const tb=[0,2.2,0,-2.2][f],fa=[.5,.85,1.15,.85][f];
    const m=(i,j)=>{const x=i+.5,y=j+.5;
      if(((x-13)/10.5)**2+((y-14)/9)**2<=1)return true;
      if(((x-22)/14)**2+((y-14.5)/7.6)**2<=1)return true;
      if(x>=30&&x<=39.5){const t=(x-30)/9.5,yc=14.5+tb*t*t,hh=5.2-3.7*t;if(Math.abs(y-yc)<=hh)return true}
      if(x>=37&&x<=44.5){const t=(x-37)/7.5,yc=14.5+tb*1.2,sp=1.6+t*6.2,fl=Math.abs(y-yc-tb*t*.6);if(fl<=sp&&fl>=sp-2.4-(1-t)*1.6)return true}
      {const dx=x-15,dy=y-19.5,ux=Math.cos(fa),uy=Math.sin(fa),s=dx*ux+dy*uy,dd=-dx*uy+dy*ux;if(s>=0&&s<=8.5&&Math.abs(dd)<=1.7*(1-s/8.5)+.35)return true}
      return !!spikeAt(x,y)};
    WHF.push(bevel(46,30,m,{ramp:ICE,depth:5,round:true,amb:.1,kd:.9,ks:.45,extra:(i,j,v)=>{const x=i+.5,y=j+.5;
      const k=spikeAt(x,y);if(k&&y<yTopW(x)+.5)return x<k[0]?'#ffffff':(x<k[0]+1?'#9ad2e0':'#70a4b2');
      if(i===7&&j===11)return '#ffffff';if(((i===6||i===8)&&j===11)||(i===7&&(j===10||j===12)))return '#1c1840';
      const my=15.8+(x-3)*.07;if(x<13&&Math.abs(y-my)<.5)return '#1c1840';   // starts at the very tip of the snout
      for(let s=0;s<SPOTS.length;s++){const q=SPOTS[s],dd=Math.hypot(x-q[0],y-q[1]);if(dd<1.45){const on=(s+f)%2===0;if(dd<.75)return on?'#ffffff':(s%2?'#ff77ff':'#ccff99');if(on)return s%2?'#ff77ff':'#ccff99';return v+.1}}
      if(y>17&&x>5&&x<27&&j%2===0)v-=.22;
      if(y>15.5)v-=(y-15.5)*.05;
      for(const rx of [18,21,24,27])if(Math.abs(x-rx)<.6&&y>10.5&&y<17.5)v-=.14;
      return v}}).canvas())}
  const WHW=WHF.map(whiteOf);
  // ice shelves: tumbling translucent slabs with a bright crack plane, and small shards
  const RK={big:[],sm:[],bigW:[],smW:[]};
  for(let s=0;s<2;s++){const rr=srand(500+s*17),parts=[chunk(9.5,6,3.4,6,rr)],ax=nrm([rr()-.5,rr()-.5,rr()-.5]),R0=mmul(rX(rr()*3),rY(rr()*3));
    const nc=nrm([rr()-.5,rr()-.5,rr()*.4]),b1=[(rr()-.5)*10,(rr()-.5)*6,(rr()-.5)*3],fr=[];
    for(let f=0;f<16;f++){const R=mmul(rAx(ax,f/16*Math.PI*2),R0);
      fr.push(gem(27,27,parts,R,{ramp:ICE,amb:.1,kd:.78,ks:.55,edge:.18,extra:(i,j,v,po,th)=>{
        const d=po[0]*nc[0]+po[1]*nc[1]+po[2]*nc[2]+.8*Math.sin(po[0]*1.4+po[1]*.9)+.5*Math.sin(po[1]*2.1);
        if(Math.abs(d)<.5)return v>.45?'#ffffff':'#9ad2e0';
        if(d>.5&&d<1.2)return v-.35;
        if(Math.hypot(po[0]-b1[0],po[1]-b1[1],po[2]-b1[2])<1.3)return v+.3;
        return v-th*.018}}).canvas())}
    RK.big.push(fr);RK.bigW.push(fr.map(whiteOf))}
  for(let s=0;s<3;s++){const rr=srand(900+s*31),parts=[chunk(4.6,2.2,2,4,rr)],ax=nrm([rr()-.5,rr()-.5,rr()-.5]),fr=[];
    for(let f=0;f<16;f++)fr.push(gem(13,13,parts,rAx(ax,f/16*Math.PI*2),{ramp:ICE,amb:.14,kd:.8,ks:.6,edge:.25}).canvas());
    RK.sm.push(fr);RK.smW.push(fr.map(whiteOf))}

  /* ---------- bullets ---------- */
  const bullets={
    needle(c,b){const x=b.x|0,y=b.y|0;c.fillStyle='#000000';c.fillRect(x-3,y-1,7,3);c.fillRect(x-1,y-2,3,5);c.fillStyle='#70a4b2';c.fillRect(x-2,y,5,1);c.fillRect(x,y-1,1,3);c.fillStyle=blinkAt(b.t,16)?'#ffffff':'#9ad2e0';c.fillRect(x-1,y,3,1);c.fillStyle='#ffffff';c.fillRect(x,y,1,1)},
    snowball(c,b){const x=b.x|0,y=b.y|0;c.fillStyle='#352879';c.fillRect(((b.x-b.vx*.09)|0)-1,((b.y-b.vy*.09)|0)-1,2,2);c.fillStyle='#6c5eb5';c.fillRect(((b.x-b.vx*.05)|0)-1,((b.y-b.vy*.05)|0)-1,2,2);
      c.fillStyle='#000000';c.fillRect(x-2,y-3,5,7);c.fillRect(x-3,y-2,7,5);c.fillStyle='#9ad2e0';c.fillRect(x-2,y-2,5,5);c.fillStyle='#ffffff';c.fillRect(x-2,y-2,3,3);c.fillRect(x-1,y-2,3,1);c.fillStyle='#70a4b2';c.fillRect(x,y+2,2,1);c.fillRect(x+2,y,1,2)},
    bubble(c,b){const x=b.x|0,y=b.y|0,f=blinkAt(b.t,8);c.fillStyle='#000000';c.fillRect(x-2,y-3,5,7);c.fillRect(x-3,y-2,7,5);c.fillStyle=f?'#ccff99':'#9ad284';c.fillRect(x-2,y-2,5,5);c.fillStyle='#2c5a2c';c.fillRect(x-1,y-1,3,3);c.fillStyle='#ffffff';c.fillRect(x-1,y-1,1,1)},
    shard(c,b){const sp=Math.hypot(b.vx,b.vy)||1,nx=b.vx/sp,ny=b.vy/sp,x=b.x,y=b.y,C=['#ffffff','#9ad2e0','#70a4b2','#352879'];
      c.fillStyle='#000000';for(let k=0;k<3;k++)c.fillRect(Math.round(x-nx*k*2)-1,Math.round(y-ny*k*2)-1,3,3);
      for(let k=0;k<4;k++){c.fillStyle=C[k];c.fillRect(Math.round(x-nx*k*2),Math.round(y-ny*k*2),k?1:2,k?1:2)}},
    frost(c,b){const x=b.x|0,y=b.y|0,f=blinkAt(b.t,6);c.fillStyle='#000000';c.fillRect(x-2,y-2,5,5);c.fillStyle='#cc99ff';
      if(f){c.fillRect(x-2,y,5,1);c.fillRect(x,y-2,1,5)}else{c.fillRect(x-2,y-2,1,1);c.fillRect(x+2,y-2,1,1);c.fillRect(x-2,y+2,1,1);c.fillRect(x+2,y+2,1,1);c.fillRect(x-1,y-1,3,3)}
      c.fillStyle='#ffffff';c.fillRect(x,y,1,1)},
    beam(c,b){const sp=Math.hypot(b.vx,b.vy)||1,nx=b.vx/sp,ny=b.vy/sp,C=['#ffffff','#ffffaa','#ff9966','#ff77ff','#cc44cc','#6f3d86'];
      c.fillStyle='#000000';for(let k=0;k<4;k++)c.fillRect(Math.round(b.x-nx*k*2.5)-1,Math.round(b.y-ny*k*2.5)-1,3,3);
      for(let k=0;k<6;k++){c.fillStyle=C[k];c.fillRect(Math.round(b.x-nx*k*2.5),Math.round(b.y-ny*k*2.5),k<2?2:1,k<2?2:1)}},
    ember(c,b){const x=b.x|0,y=b.y|0;c.fillStyle='#000000';c.fillRect(x-2,y-1,5,3);c.fillRect(x-1,y-2,3,5);c.fillStyle='#ff9966';c.fillRect(x-1,y-1,3,3);c.fillStyle=blinkAt(b.t,14)?'#ffffff':'#ffffaa';c.fillRect(x,y,1,1)},
    wisp(c,b){const x=b.x|0,y=b.y|0;c.fillStyle='#6f3d86';c.fillRect(((b.x-b.vx*.06)|0),((b.y-b.vy*.06)|0),2,1);c.fillStyle='#000000';c.fillRect(x-1,y-1,3,3);c.fillStyle='#cc99ff';c.fillRect(x-1,y,3,1);c.fillRect(x,y-1,1,3);c.fillStyle='#ffffff';c.fillRect(x,y,1,1)}
  };

  /* ---------- enemies ---------- */
  const touchBox=(e,px,py)=>Math.abs(e.x-px)<e.w/2+10&&Math.abs(e.y-py)<e.h/2+5;
  const launchRing=(e,x)=>{e.x=x;e.x0=x+15*Math.sin(e.ph||0)};
  const enemies={
    /* frost drones fly a looping path (every drone in a wave follows the same loops) and fire ice needles.
       variant 'jelly' is the little spawn a glacier whale releases */
    ring:{w:15,h:9,
      init(e,o){e.age=0;if(o.variant==='jelly'){e.jelly=1;e.w=9;e.h=9;e.hp=e.mhp=loopScale();e.pts=50;e.sv=0;return}
        e.y0=clamp(e.y,TOP+26,BOT-26);launchRing(e,e.x)},
      move(e,dt,live){e.age+=dt;
        if(e.jelly){const pu=Math.max(0,Math.sin(e.age*5));e.vx=-16-pu*38;e.sv*=1-Math.min(1,dt*2.5);e.vy=e.sv+clamp((P.y-e.y)*.35,-14,14);
          e.x+=e.vx*dt;e.y=clamp(e.y+e.vy*dt,TOP+8,BOT-8);return}
        const a=e.age*3.1+(e.ph||0);e.x=e.x0-40*e.age-15*Math.sin(a);const ny=e.y0-17*Math.cos(a);
        e.vx=-40-46.5*Math.cos(a);e.vy=52.7*Math.sin(a);e.y=ny;
        if(live&&e.x<W-30&&e.x>60&&(e.shootT-=dt)<=0){e.shootT=rnd(3.2,5);ebAim(e.x-6,e.y,66,rnd(-.08,.08),{sty:'needle'});sfxEnemyLaser()}},
      draw(c,e,fl){
        if(e.jelly){const s=(fl?JW:JF)[Math.sin((e.age||0)*5)>0?1:0];c.drawImage(s,Math.round(e.x-5),Math.round(e.y-5));return}
        const s=(fl?DW:DF)[Math.floor((e.t||0)*12)%6];c.drawImage(s,Math.round(e.x-s.width/2),Math.round(e.y-s.height/2));
        if(!fl){const a=(e.t||0)*5;c.fillStyle='#9ad2e0';c.fillRect(Math.round(e.x+Math.cos(a)*11),Math.round(e.y+Math.sin(a)*6),1,1);c.fillStyle='#ffffff';c.fillRect(Math.round(e.x-Math.cos(a)*11),Math.round(e.y-Math.sin(a)*6),1,1)}},
      onKill(e){shatter(e.x,e.y,e.jelly?5:9,55,e.jelly?['#ccff99','#ff77ff','#9ad284']:SHARDC);if(!e.jelly&&FX.length<120)FX.push({ring:1,x:e.x,y:e.y,r:2,life:.3,max:10,col:'#9ad2e0'})}
    },
    /* big crystal drones sweep in wide waves and fire a three needle fan */
    ringR:{frames:RRF,white:RRW,fps:12,w:20,h:12,vx:-46,
      init(e){e.age=0;e.y0=clamp(e.y,TOP+34,BOT-34)},
      move(e,dt,live){e.age+=dt;e.x+=e.vx*dt;const ny=e.y0+Math.sin(e.age*1.7+(e.ph||0))*24;e.vy=(ny-e.y)/Math.max(dt,1e-3);e.y=ny;
        if(live&&e.x<W-30&&e.x>70&&(e.shootT-=dt)<=0){e.shootT=rnd(3.6,5);for(let k=-1;k<=1;k++)ebAim(e.x-10,e.y,64,k*.2,{sty:'needle'});sfxEnemyLaser()}},
      onKill(e){shatter(e.x,e.y,12,65,['#ffffff','#cc99ff','#ff77ff','#9ad2e0']);if(FX.length<120)FX.push({ring:1,x:e.x,y:e.y,r:2,life:.35,max:14,col:'#cc99ff'})}
    },
    /* ice wraiths: fade out for about 35 percent of a 1.7 s cycle. faded = immune and intangible */
    dart:{w:16,h:9,vx:-105,
      init(e){e.age=0;e.po=rnd(0,1.7);e.fade=false;e.touch=(q,px,py)=>!q.fade&&touchBox(q,px,py)},
      update(e,dt,live){e.age+=dt;const cy=((e.age+e.po)/1.7)%1,was=e.fade;e.fade=cy>.65;e.immune=e.fade;e.blink=Math.abs(cy-.65)<.04||cy>.965;
        e.y+=Math.sin(e.age*6)*dt*14;
        if(was&&!e.fade&&live&&e.x>110&&e.x<W-10&&Math.random()<.5){ebAim(e.x-8,e.y,70,0,{sty:'wisp'});sfxEnemyLaser()}},
      draw(c,e,fl){const f=Math.floor((e.t||0)*10)%4,x=Math.round(e.x-15),y=Math.round(e.y-8);
        let solid=!e.fade;if(e.blink)solid=blinkAt((e.t||0),30)===0;
        if(solid)c.drawImage(fl?WRW[f]:WRF[f],x,y);else{c.globalAlpha=.8;c.drawImage(WRG[f],x,y);c.globalAlpha=1}},
      onKill(e){shatter(e.x,e.y,10,45,['#cc99ff','#8a5aa6','#ffffff','#ff77ff'])}
    },
    /* snow cannons: domes on ice pillars at the canyon edges, glued to the near terrain. lob slow snowballs */
    cross:{w:13,h:12,hp:3,pts:200,
      init(e,o){const ed=o.edge||(e.y<100?-1:1);e.top=ed<0;e.u0=e.x+bgT()*VN;const col=((Math.round(e.u0)%NW)+NW)%NW;
        if(e.top)e.y=Math.max(36,TOP+NTB[col]+7);else e.y=Math.min(165,BOT-NBH+NBT[col]-7);
        e.vx=-VN;e.vy=0;e.aim=e.top?2.4:-2.4;e.rc=0},
      move(e,dt,live){e.x=e.u0-bgT()*VN;e.vx=-VN;e.vy=0;
        const py=e.y+(e.top?2:-2),dx=P.x-e.x,dy=P.y-py,T=clamp(Math.hypot(dx,dy)/64,.9,2.3),vx=dx/T,vy=dy/T-.5*CAY*T;
        let a=Math.atan2(vy,vx);a=e.top?clamp(a,.25,Math.PI-.25):clamp(a,-Math.PI+.25,-.25);e.aim+=(a-e.aim)*Math.min(1,dt*4);
        if(e.rc>0)e.rc-=dt*3;
        if(live&&e.x<W-16&&e.x>70&&(e.shootT-=dt)<=0){e.shootT=rnd(3.2,4.4);const mx=e.x+Math.cos(e.aim)*9,my=py+Math.sin(e.aim)*9;
          ebShot(mx,my,vx,vy,{sty:'snowball',ay:CAY,life:5});e.rc=1;for(let k=0;k<5;k++)fx(mx,my,rnd(-20,20)+Math.cos(e.aim)*20,rnd(-20,20)+Math.sin(e.aim)*20,.4,k%2?'#ffffff':'#9ad2e0',1);sfxEnemyLaser()}},
      draw(c,e,fl){const top=!!e.top,x=Math.round(e.x),y=Math.round(e.y),f=Math.floor((e.t||0)*3)%2;
        if(top){const len=clamp(y-5-(TOP-2),0,48);if(len>0)c.drawImage(PILT,0,48-len,13,len,x-6,y-5-len,13,len)}
        else{const len=clamp(BOT+2-(y+5),0,48);if(len>0)c.drawImage(PIL,0,0,13,len,x-6,y+5,13,len)}
        c.drawImage((fl?(top?DTW:DBW):(top?DT:DB))[f],x-8,y-7);
        const a=e.aim==null?(top?2.4:-2.4):e.aim,ca=Math.cos(a),sa=Math.sin(a),pv=y+(top?2:-2),rc=(e.rc>0?e.rc:0)*2;
        c.fillStyle='#000000';for(let s=3;s<=9;s++)c.fillRect(Math.round(x+ca*(s-rc))-1,Math.round(pv+sa*(s-rc))-1,3,3);
        for(let s=3;s<=9;s++){const bx=Math.round(x+ca*(s-rc)),by=Math.round(pv+sa*(s-rc));c.fillStyle=fl?'#ffffff':(s>=8?'#bbbbbb':'#444444');c.fillRect(bx-1,by-1,2,2);if(s<8&&!fl){c.fillStyle='#959595';c.fillRect(bx-1,by-1,1,1)}}
        if(!fl){c.fillStyle='#ffffff';c.fillRect(Math.round(x+ca*(9-rc)),Math.round(pv+sa*(9-rc)),1,1)}},
      onKill(e){shatter(e.x,e.y,14,60,['#ffffff','#9ad2e0','#6c6c6c','#bbbbbb'])}
    },
    /* glacier whales cruise slowly, spout frost and fire a spread of bubbles, and release jelly spawn when they die */
    pod:{frames:WHF,white:WHW,fps:5,w:34,h:16,hp:9,pts:500,vx:-20,
      init(e){e.y0=clamp(e.y,TOP+40,BOT-40)},
      move(e,dt,live){e.x+=e.vx*dt;const ny=e.y0+Math.sin(e.t*.9+(e.ph||0))*10;e.vy=(ny-e.y)/Math.max(dt,1e-3);e.y=ny;
        if(live&&e.x<W-24&&e.x>90&&(e.shootT-=dt)<=0){e.shootT=rnd(3.8,4.8);for(let k=-1;k<=1;k++)ebAim(e.x-18,e.y+2,48,k*.36,{sty:'bubble'});
          for(let k=0;k<7;k++)fx(e.x-11+rnd(-1,1),e.y-11,rnd(-12,12),rnd(-48,-22),.6,k%2?'#ffffff':'#9ad2e0',1);sfxEnemyLaser()}},
      onKill(e){shatter(e.x,e.y,22,80,SHARDC);const n=E.length<30?3:1;
        for(let i=0;i<n;i++){const j=spawn({type:'ring',y:e.y+(i-1)*8,variant:'jelly'});j.x=e.x+(i-1)*6;j.sv=(i-(n-1)/2)*44}}
    },
    /* ice shelves: tumbling slabs and shards. o.calve: a slab cracks off a cliff (1.1 s shaking telegraph) and drifts in */
    rock:{
      init(e,o){e.ang=rnd(0,6.28);e.spin=rnd(-1.6,1.6);if(Math.abs(e.spin)<.4)e.spin=.6;
        if(o.shard){e.big=false;e.w=e.h=9;e.hp=e.mhp=loopScale();e.spr=Math.floor(Math.random()*3);e.spin=rnd(-4,4);e.y=o.y;return}
        if(o.calve){e.big=true;e.w=e.h=21;e.hp=e.mhp=5*loopScale();e.spr=Math.floor(Math.random()*2);e.edge=o.calve;
          e.x=rnd(175,295);e.y=o.calve>0?BOT-3:TOP+3;e.u0=e.x+bgT()*VN;e.calveT=1.1;e.immune=true;e.spin=0;
          e.touch=(q,px,py)=>!(q.calveT>0)&&touchBox(q,px,py)}},
      move(e,dt,live){e.ang+=e.spin*dt;
        if(e.calveT>0){e.calveT-=dt;e.x=e.u0-bgT()*VN;e.vx=-VN;e.vy=0;if(Math.random()<dt*14)fx(e.x+rnd(-10,10),e.y+(e.edge>0?-10:10),rnd(-8,8),e.edge>0?rnd(-20,-5):rnd(5,20),.5,'#ffffff',1);
          if(e.calveT<=0){e.immune=false;e.calved=1;e.vx=-rnd(26,38);e.vy=e.edge>0?-rnd(26,32):rnd(26,32);e.spin=rnd(-1.4,1.4);shatter(e.x,e.y+(e.edge>0?-8:8),8,40,SHARDC)}return}
        if(e.calved)e.vy+=((e.edge>0?-6:6)-e.vy)*Math.min(1,dt*.55);
        e.x+=e.vx*dt;e.y+=e.vy*dt},
      draw(c,e,fl){const big=!!e.big,set=big?RK.big:RK.sm,s=(e.spr||0)%set.length,a=e.ang==null?(e.t||0)*(e.spin||1):e.ang,fi=((Math.floor(a/(Math.PI*2)*16)%16)+16)%16;
        const im=(fl?(big?RK.bigW:RK.smW):set)[s][fi];let x=e.x;if(e.calveT>0)x+=(blinkAt((e.t||0),24)?1:-1)*(e.calveT<.5?1.5:.8);
        c.drawImage(im,Math.round(x-im.width/2),Math.round(e.y-im.height/2));
        if(e.calveT>0){const k=Math.floor((e.t||0)*12);c.fillStyle=k%2?'#ffffff':'#9ad2e0';c.fillRect(Math.round(x-7+(k*5)%14),Math.round(e.y+(e.edge>0?-9:8)),3,1);c.fillRect(Math.round(x+5-(k*3)%10),Math.round(e.y+(e.edge>0?-8:7)),1,1)}},
      onKill(e){shatter(e.x,e.y,e.big?16:7,e.big?70:45,SHARDC);
        if(e.big&&E.length<32)for(const k of [-1,1]){const s=spawn({type:'rock',shard:1,y:e.y+k*5});s.x=e.x+rnd(-3,3);s.vx=Math.min(-12,e.vx*.7-10);s.vy=k*rnd(22,34)}}
    }
  };

  /* ---------- boss: the Frozen Ancient Ship ---------- */
  const BW=150,BH=80,BCX=75,BCY=40,BX0=236;
  const inPoly=pts=>(x,y)=>{let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins}return ins};
  const HPOLY=[inPoly([[2,40],[16,37],[40,33],[40,47],[16,43]]),
    inPoly([[30,34],[50,25],[78,18],[110,19],[130,25],[143,30],[143,50],[130,55],[110,61],[78,62],[50,55],[30,46]]),
    inPoly([[72,20],[86,5],[99,3],[104,6],[98,20]]),inPoly([[76,60],[84,73],[97,76],[102,73],[98,60]]),
    inPoly([[47,28],[33,18],[22,13],[26,17],[38,25],[48,31]]),inPoly([[47,52],[33,62],[22,67],[26,63],[38,55],[48,49]])];
  const NOZ=[[29,34],[37,43],[46,51]],VENTS=[[54,29,14,2],[54,50,14,2],[112,39,12,2]],SEAMX=[48,62,76,104,118,130];
  const TUR=[[72,22,-1],[108,22,-1],[90,59,1]],RL=[[44,32],[58,26],[100,21],[122,27],[58,54],[100,59],[122,53],[136,40]];
  const hullM=(i,j)=>{const x=i+.5,y=j+.5;for(const f of HPOLY)if(f(x,y))return true;if(i>=142&&i<=147)for(const n of NOZ)if(j>=n[0]&&j<=n[1])return true;return false};
  const hullX=hot=>(i,j,v,d)=>{
    const rd=Math.hypot(i+.5-90,j+.5-40);if(rd<=8.5)return rd>7?(hot?'#ff77ff':'#000000'):(hot?'#6f3d86':'#1c1840');
    for(const vt of VENTS)if(i>=vt[0]&&i<vt[0]+vt[2]){if(j>=vt[1]&&j<vt[1]+vt[3])return hot?'#ff9966':'#000000';if(j===vt[1]-1)return v+.3}
    if(i>=143)for(const n of NOZ)if(j>n[0]&&j<n[1])return hot?'#ffffaa':'#000000';
    if(i>=21&&i<=25&&j>=39&&j<=40)return '#000000';
    if(d>1.5&&SEAMX.indexOf(i)>=0)return hot?'#ff9966':v-.34;
    if(d>1.5&&SEAMX.indexOf(i-1)>=0)return v+.14;
    if(d>2&&j===40&&i>40&&i<128)return hot?'#ff7777':v-.24;
    if(d>2&&j===46&&i>=58&&i<=84&&i%4===0)return hot?'#ffffaa':'#352879';
    if(d>2&&(i*3+j*5)%17===0)return v-.12;
    return v};
  const hullP=bevel(BW,BH,hullM,{ramp:HULL,depth:6,amb:.08,kd:.95,ks:.25,extra:hullX(false)});
  const hotP=bevel(BW,BH,hullM,{ramp:HOT,depth:6,amb:.08,kd:.9,ks:.25,extra:hullX(true)});
  const HULLC=hullP.canvas(),HULLW=whiteOf(HULLC);
  const HOTC=[5,9,13].map(k=>{const p=new Pix(BW,BH);for(let j=0;j<BH;j++)for(let i=0;i<BW;i++){const q=j*BW+i;p.c[q]=BAYER[j&3][i&3]<k?hotP.c[q]:hullP.c[q]}return p.canvas()});
  const HM=new Uint8Array(BW*BH);for(let j=0;j<BH;j++)for(let i=0;i<BW;i++)HM[j*BW+i]=hullM(i,j)?1:0;
  // glowing seams for the thawed ship: only the hot accent pixels, drawn over the normal hull
  const SEAMC=(()=>{const p=new Pix(BW,BH),hx=hullX(true);for(let j=0;j<BH;j++)for(let i=0;i<BW;i++){const q=j*BW+i;if(!HM[q])continue;const v=hx(i,j,.5,hullP.D[q]);if(typeof v==='string'&&v!=='#000000'&&v!=='#6f3d86')p.c[q]=v}return p.canvas()})();
  function scarC(seed,n,holes){const p=new Pix(BW,BH),r=srand(seed);
    for(let k=0;k<n;k++){let x=40+r()*95,y=26+r()*30,a=r()*6.28;for(let s=0;s<14;s++){a+=(r()-.5)*1.2;x+=Math.cos(a)*1.6;y+=Math.sin(a)*1.6;const i=x|0,j=y|0;
      if(i>=0&&j>=0&&i<BW&&j<BH&&HM[j*BW+i]){p.set(i,j,'#000000');if(r()<.3&&j+1<BH&&HM[(j+1)*BW+i])p.set(i,j+1,'#9a3a3a')}}}
    for(let k=0;k<holes;k++){const cx=(45+r()*90)|0,cy=(28+r()*26)|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const i=cx+dx,j=cy+dy;if(!HM[j*BW+i])continue;const dd=dx*dx+dy*dy;if(dd<=2)p.set(i,j,'#000000');else if(dd<=5)p.set(i,j,dd===5?'#68372b':'#9a3a3a')}}
    return p.canvas()}
  const SCAR1=scarC(71,6,2),SCAR2=scarC(137,7,4);
  // the ice that encases the ship: hull plus a ragged crust and big glacier lumps, split into cells that thaw away
  const DH=new Float32Array(BW*BH);for(let q=0;q<BW*BH;q++)DH[q]=HM[q]?0:1e4;chamfer(DH,BW,BH);
  const ventWin=(i,j)=>VENTS.some(v=>{const cx=v[0]+v[2]/2,cy=v[1]+v[3]/2;return ((i+.5-cx)/(v[2]/2+3.5))**2+((j+.5-cy)/4.2)**2<=1});
  const BLOBS=[[16,40,14,9],[34,40,16,21],[92,10,12,6],[90,71,13,6],[128,24,10,6],[128,56,10,6]];
  const iceM=(i,j)=>{if(i<1||j<1||i>=BW-1||j>=BH-1)return false;if(ventWin(i,j))return false;const q=j*BW+i;if(HM[q])return true;
    if(DH[q]<=2.6+2.2*(.5+.5*Math.sin(i*.23+j*.11))+1.4*Math.sin(j*.41+i*.07))return true;
    for(const b of BLOBS)if(((i-b[0])/b[2])**2+((j-b[1])/b[3])**2+.25*Math.sin(i*.7+j*.5)<=1)return true;return false};
  const IM=new Uint8Array(BW*BH),icePix=[];for(let j=0;j<BH;j++)for(let i=0;i<BW;i++)if(iceM(i,j)){IM[j*BW+i]=1;icePix.push(j*BW+i)}
  const ri=srand(4242),SEEDS=[];
  for(let tries=0;tries<4000&&SEEDS.length<18;tries++){const q=icePix[Math.floor(ri()*icePix.length)],x=q%BW,y=(q/BW)|0;if(SEEDS.every(s=>Math.hypot(s[0]-x,(s[1]-y)*1.6)>17))SEEDS.push([x,y])}
  const NC=SEEDS.length,CELL=new Int8Array(BW*BH).fill(-1),CT=SEEDS.map(()=>(ri()-.5)*.24);
  for(const q of icePix){const i=q%BW,j=(q/BW)|0;let bd=1e9,bc=0;for(let k=0;k<NC;k++){const d=Math.hypot(i-SEEDS[k][0],(j-SEEDS[k][1])*1.3)+2.2*Math.sin(i*.5+j*.3+k);if(d<bd){bd=d;bc=k}}CELL[q]=bc}
  const iceP=bevel(BW,BH,(i,j)=>IM[j*BW+i]===1,{ramp:ICE,depth:5,amb:.08,kd:.66,ks:.4,sh:10,extra:(i,j,v,d)=>{const q=j*BW+i,c=CELL[q];
    if((i+1<BW&&IM[q+1]&&CELL[q+1]!==c)||(j+1<BH&&IM[q+BW]&&CELL[q+BW]!==c))return '#9ad2e0';
    if((i>0&&IM[q-1]&&CELL[q-1]!==c)||(j>0&&IM[q-BW]&&CELL[q-BW]!==c))return '#1c1840';
    if(HM[q]&&d>2.2&&BAYER[j&3][i&3]>=7)return null;
    if(!HM[q]&&d>3)v-=.08;
    if(((i*7+j*13)%61)===0)return '#ffffff';
    return v+CT[c]}});
  const cellP=[];for(let c=0;c<NC;c++)cellP.push(new Pix(BW,BH));
  const CEN=SEEDS.map(()=>[0,0,0]);
  for(let q=0;q<BW*BH;q++){const col=iceP.c[q];if(!col)continue;let c=CELL[q];const i=q%BW,j=(q/BW)|0;
    if(c<0)for(const dd of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+dd[0],jj=j+dd[1];if(ii>=0&&jj>=0&&ii<BW&&jj<BH&&CELL[jj*BW+ii]>=0){c=CELL[jj*BW+ii];break}}
    if(c>=0){cellP[c].c[q]=col;CEN[c][0]+=i;CEN[c][1]+=j;CEN[c][2]++}}
  for(const ce of CEN){if(ce[2]){ce[0]/=ce[2];ce[1]/=ce[2]}}
  const CC=cellP.map(p=>p.canvas());
  // thaw order: cells over turrets and engines break at the phase 2 threshold, a few early, the last ones in phase 3
  const CK=new Array(NC).fill(0),special=new Set();
  for(const t of TUR.concat([[145,40],[145,31],[145,49]])){for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=3;dx++){const c=CELL[(t[1]+dy)*BW+t[0]+dx];if(c>=0)special.add(c)}}
  const rest=[];for(let c=0;c<NC;c++)if(special.has(c))CK[c]=.655;else rest.push(c);
  for(let i=rest.length-1;i>0;i--){const j=Math.floor(ri()*(i+1)),t=rest[i];rest[i]=rest[j];rest[j]=t}
  {const m=rest.length,early=[.95,.88,.8,.72],late=[.3,.22,.14];
    rest.forEach((c,k)=>{CK[c]=k<early.length?early[k]:k>=m-late.length?late[k-(m-late.length)]:.62-(k-early.length)*(.27/Math.max(1,m-early.length-late.length-1))})}
  const SPARK=[];{const rp=srand(808);for(let k=0;k<16;k++){const q=icePix[Math.floor(rp()*icePix.length)];SPARK.push([q%BW,(q/BW)|0,CELL[q]])}}
  const turP=bevel(11,9,(i,j)=>{const x=i+.5,y=j+.5;return (((x-5.5)/4.5)**2+((y-6.5)/5)**2<=1&&y<=6.5)||(y>6&&y<=8&&x>=1&&x<=10)},{ramp:STEEL,depth:2,round:true,extra:(i,j,v)=>(i===5&&j===4)?'#ccff99':v});
  const TURU=turP.canvas(),TURD=turP.copy().flipY().canvas();
  const phOf=b=>{const r=b.hp/b.mhp;return r>.66?1:r>.33?2:3};
  function bossHit(b,x,y){const i=Math.floor(x-b.x+BCX),j=Math.floor(y-b.y+BCY);if(i<0||j<0||i>=BW||j>=BH)return 0;
    const q=j*BW+i,r=b.hp/b.mhp,c=CELL[q];if(c>=0&&r>=CK[c])return .85;if(!HM[q])return 0;
    const ph=phOf(b);if(ph===1)return (Math.abs(j-30)<=2||Math.abs(j-51)<=2)?1.5:1;if(ph===2)return (Math.abs(j-22)<=3||(j>=56&&j<=62))?1.4:1;return Math.abs(j-40)<=5?1.6:1}
  function summon(b){let n=0;for(const e of E)if(e.type!=='boss')n++;if(n>=6)return;b.sk=(b.sk||0)+1;
    if(b.sk%2){for(let k=0;k<3;k++){const e=spawn({type:'ring',y:clamp(b.y+(k-1)*26,TOP+26,BOT-26),ph:k*2.1});launchRing(e,b.x-30)}}
    else for(let k=0;k<2;k++){const e=spawn({type:'dart',y:clamp(b.y+(k?-30:30),TOP+16,BOT-16)});e.x=b.x-46}}
  function turretShot(b){b.ti=((b.ti||0)+1)%3;const tp=TUR[b.ti],tx=b.x-BCX+tp[0],ty=b.y-BCY+tp[1],a=Math.atan2(P.y-ty,P.x-tx);
    ebShot(tx+Math.cos(a)*7,ty+Math.sin(a)*7,Math.cos(a)*72,Math.sin(a)*72,{sty:'shard'});b.tf=.15;b.tfi=b.ti}
  const boss={w:130,h:62,hp:.9,
    init(b){b.x=W+90;b.y=100;b.in=true;b.ph=1;b.gone=new Array(NC).fill(0);b.fall=[];b.atk={aim:2,ring:4,fan:1.5,tur:1.2,sum:3};b.stag=0;b.tt=0;b.st='gap2';b.mt=1.5;b.tele=0;b.tf=0;b.hitTest=bossHit},
    update(b,dt,live){
      b.tt+=dt;const r=Math.max(0,b.hp/b.mhp),ph=phOf(b);
      for(let c=0;c<NC;c++)if(!b.gone[c]&&r<CK[c]){b.gone[c]=1;if(b.fall.length<12)b.fall.push({c,x:0,y:0,vx:rnd(-16,10),vy:rnd(-22,-4),t:0});shatter(b.x-BCX+CEN[c][0],b.y-BCY+CEN[c][1],7,45,SHARDC)}
      for(const f of b.fall){f.t+=dt;f.vy+=110*dt;f.x+=f.vx*dt;f.y+=f.vy*dt}
      if(b.fall.length&&b.fall[0].t>1.6)b.fall=b.fall.filter(f=>f.t<=1.6);
      if(b.tf>0)b.tf-=dt;
      if(b.in){b.x-=60*dt;b.y+=(100-b.y)*Math.min(1,dt*2);if(b.x<=BX0){b.x=BX0;b.in=false}return}
      if(ph>b.ph){b.ph=ph;b.stag=1.3;shake=Math.max(shake,.45);shatter(b.x-10,b.y,26,80,SHARDC);if(FX.length<120)FX.push({ring:1,x:b.x,y:b.y,r:4,life:.5,max:60,col:'#9ad2e0'});sfxBoom(24,true);
        b.atk.sum=2.5;b.st='gap2';b.mt=1.5;
        if(live&&ph===3)for(let k=0;k<2;k++){const e=spawn({type:'dart',y:clamp(P.y+(k?-36:36),TOP+16,BOT-16)});e.x=b.x-40-k*14}}
      const tt=b.tt,amp=ph===1?12:ph===2?24:30,ty=100+Math.sin(tt*(ph===1?.45:ph===2?.62:.8))*amp+(ph===3?Math.sin(tt*2.3)*3:0);
      b.y+=(ty-b.y)*Math.min(1,dt*1.5);b.x=BX0+Math.sin(tt*.37)*(ph===1?3:6);
      bossWear(b,live,8,0,58,24);
      if(ph>=2&&Math.random()<dt*(ph===2?6:10))fx(b.x+rnd(-55,50),b.y+rnd(14,26),rnd(-6,2),rnd(20,40),.7,'#9ad2e0',1);
      if(ph===3&&Math.random()<dt*8)fx(b.x+rnd(-40,50),b.y-rnd(14,24),rnd(-8,4),rnd(-30,-14),.8,Math.random()<.5?'#bbbbbb':'#ffffff',2);
      if(!live)return;
      if(b.stag>0){b.stag-=dt;return}
      const A=b.atk,px=b.x-72,py=b.y;
      if(ph===1){
        if((A.aim-=dt)<=0){A.aim=2.6;if(EB.length<20){for(let k=-1;k<=1;k++)ebAim(px,py,58,k*.14,{sty:'shard'});sfxEnemyLaser()}}
        if((A.ring-=dt)<=0){A.ring=5.4;if(EB.length<14){ebRing(b.x-14,b.y-10,10,36,tt,{sty:'frost',life:6});sfxEnemyLaser()}}
      }else if(ph===2){
        if((A.fan-=dt)<=0){A.fan=3;if(EB.length<17){for(let k=-3;k<=3;k++)ebAim(px,py,62,k*.15,{sty:'shard'});sfxEnemyLaser()}}
        if((A.tur-=dt)<=0){A.tur=1.5;if(EB.length<22)turretShot(b)}
        if((A.sum-=dt)<=0){A.sum=10;summon(b)}
      }else{
        if(b.st==='tele'){b.tele-=dt;if(b.tele<=0){b.st='fire';b.nb=6;b.bt=0}}
        else if(b.st==='fire'){b.bt-=dt;if(b.bt<=0&&b.nb>0){b.bt=.06;b.nb--;ebShot(px,py,Math.cos(b.ta)*200,Math.sin(b.ta)*200,{sty:'beam',hw:1,hh:1,life:3});sfxEnemyLaser()}if(b.nb<=0){b.st='gap1';b.mt=1}}
        else if(b.st==='spiral'){b.mt-=dt;b.bt-=dt;if(b.bt<=0){b.bt=.2;b.sa=(b.sa||0)+.45;if(EB.length<24)for(const o of [0,Math.PI]){const a=Math.PI+Math.sin(b.sa+o)*1.05;ebShot(b.x+15,b.y,Math.cos(a)*56,Math.sin(a)*56,{sty:'ember'})}}if(b.mt<=0){b.st='gap2';b.mt=1.2}}
        else{b.mt-=dt;if(b.mt<=0){if(b.st==='gap1'){b.st='spiral';b.mt=2.2;b.bt=0}else{b.st='tele';b.tele=1;b.ta=Math.atan2(P.y-py,P.x-px)}}}
        if((A.ring-=dt)<=0){A.ring=6.5;if(EB.length<12&&b.st!=='spiral')ebRing(b.x+15,b.y,12,40,tt,{sty:'frost',life:6})}
        if((A.tur-=dt)<=0){A.tur=2.1;if(EB.length<22)turretShot(b)}
      }
    },
    draw(c,b,fl){
      const r=Math.max(0,b.hp/b.mhp),ph=phOf(b),tt=b.tt||0,ox=Math.round(b.x-BCX),oy=Math.round(b.y-BCY);
      if(ph>=2){const cols=ph===2?['#ffffff','#9ad2e0','#70a4b2','#352879']:['#ffffff','#ffffaa','#ff9966','#ff7777'];
        for(let k=0;k<3;k++){const n=NOZ[k],yc=oy+((n[0]+n[1])>>1),len=5+((Math.floor(tt*18)+k*2)%4)*2+(ph===3?3:0);
          for(let s=0;s<len;s++){c.fillStyle=cols[Math.min(3,Math.floor(s/len*4))];const th=s<len*.5?3:1;c.fillRect(ox+148+s,yc-(th>>1),1,th)}}}
      let hi=HULLC;if(ph===3){const pz=Math.sin(tt*5)+(r<.15?.7:0);hi=pz>.9?HOTC[2]:pz>.3?HOTC[1]:pz>-.4?HOTC[0]:HULLC}else if(ph===2&&r<.45&&Math.sin(tt*7)>.7)hi=HOTC[0];
      c.drawImage(hi,ox,oy);if(ph===3&&Math.floor(tt*9)%4)c.drawImage(SEAMC,ox,oy);
      if(r<.5)c.drawImage(SCAR1,ox,oy);if(r<.25)c.drawImage(SCAR2,ox,oy);
      for(const v of VENTS){let col;
        if(ph===1){const p=.5+.5*Math.sin(tt*2.2+v[0]*.1);col=p>.66?'#9ad2e0':p>.33?'#70a4b2':'#6c5eb5'}else if(ph===2)col=Math.floor(tt*8+v[0])%3?'#9ad2e0':'#ffffff';else col=Math.floor(tt*10+v[0])%2?'#ff9966':'#ffffaa';
        c.fillStyle=col;c.fillRect(ox+v[0],oy+v[1],v[2],v[3]);c.fillStyle=pat(ph===3?'#ff7777':'#70a4b2');c.fillRect(ox+v[0]-1,oy+v[1]-2,v[2]+2,1);c.fillRect(ox+v[0]-1,oy+v[1]+v[3]+1,v[2]+2,1)}
      {const cx=ox+90,cy=oy+40;
        if(ph===1){const hb=tt%2.6;if(hb<.35)disc(c,cx,cy,hb<.15?3:2,'#352879')}
        else if(ph===2){const p=Math.sin(tt*3);disc(c,cx,cy,5,'#352879');disc(c,cx,cy,p>0?4:3,'#6c5eb5');disc(c,cx,cy,2,p>.5?'#ffffff':'#9ad2e0')}
        else{const p=Math.floor(tt*12)%3;disc(c,cx,cy,6,'#cc44cc');disc(c,cx,cy,5,p?'#ff77ff':'#ff9966');disc(c,cx,cy,3,'#ffffaa');disc(c,cx,cy,1,'#ffffff');
          c.fillStyle=pat('#ff77ff');const rl=4+p*2;c.fillRect(cx-9-rl,cy,rl,1);c.fillRect(cx+10,cy,rl,1);c.fillRect(cx,cy-9-rl,1,rl);c.fillRect(cx,cy+10,1,rl)}}
      if(ph===2&&Math.floor(tt*3)%2){c.fillStyle='#9ad2e0';c.fillRect(ox+22,oy+39,3,2)}
      if(ph===3){c.fillStyle=blinkAt(tt,8)?'#ff7777':'#ffffff';c.fillRect(ox+22,oy+39,3,2)}
      if(ph>=2)for(let k=0;k<RL.length;k++)if(((Math.floor(tt*6)-k)%8+8)%8===0){c.fillStyle=ph===3?'#ff77ff':'#ccff99';c.fillRect(ox+RL[k][0],oy+RL[k][1],1,1)}
      if(ph>=2)for(let k=0;k<3;k++){const t=TUR[k],tx=ox+t[0],ty=oy+t[1],a=Math.atan2(P.y-ty,P.x-tx),ca=Math.cos(a),sa=Math.sin(a);
        c.drawImage(t[2]<0?TURU:TURD,tx-5,t[2]<0?ty-6:ty-2);
        c.fillStyle='#000000';for(let s=2;s<=7;s++)c.fillRect(Math.round(tx+ca*s)-1,Math.round(ty+sa*s)-1,3,3);
        for(let s=2;s<=7;s++){c.fillStyle=s>=6?'#bbbbbb':'#444444';c.fillRect(Math.round(tx+ca*s),Math.round(ty+sa*s),1,1)}
        if(b.tf>0&&b.tfi===k)disc(c,Math.round(tx+ca*8),Math.round(ty+sa*8),1,'#ffffff')}
      for(let k=0;k<NC;k++)if(r>=CK[k])c.drawImage(CC[k],ox,oy);
      for(let k=0;k<SPARK.length;k++){const s=SPARK[k];if(s[2]>=0&&r>=CK[s[2]]&&(Math.floor(tt*3)+k)%7===0){c.fillStyle='#ffffff';c.fillRect(ox+s[0]-1,oy+s[1],3,1);c.fillRect(ox+s[0],oy+s[1]-1,1,3)}}
      if(b.fall)for(const f of b.fall){if(f.t>1&&blinkAt(f.t,20))continue;c.drawImage(CC[f.c],ox+Math.round(f.x),oy+Math.round(f.y))}
      if(b.st==='tele'&&b.tele>0&&ph===3){const ex=b.x-72,ey=b.y,ca=Math.cos(b.ta),sa=Math.sin(b.ta);
        for(let k=1;k<40;k++){const x=ex+ca*k*6,y=ey+sa*k*6;if(x<0||y<TOP||y>BOT)break;c.fillStyle=(k+Math.floor(tt*20))%2?'#ff77ff':'#6f3d86';c.fillRect(Math.round(x),Math.round(y),2,1)}
        disc(c,Math.round(ex),Math.round(ey),Math.round((1-b.tele)*3),blinkAt(tt,16)?'#ffffff':'#ff77ff')}
      if(fl){c.globalAlpha=.45;c.drawImage(HULLW,ox,oy);c.globalAlpha=1}
    },
    onKill(b){shatter(b.x,b.y,40,110,SHARDC);shatter(b.x+30,b.y,20,90,['#ff77ff','#ffffaa','#ff9966'])}
  };

  /* ---------- per frame drawing ---------- */
  function strip(cv,speed,t,y){const w=cv.width;let x=Math.floor(-((t*speed)%w));if(x>0)x-=w;ctx.drawImage(cv,x,y);if(x+w<W)ctx.drawImage(cv,x+w,y);return x}
  return {
    noFG:true,
    drawBackground(t){
      ctx.drawImage(SKYC,0,0);
      for(let k=0;k<TWK.length;k++){const s=(Math.floor(t*2.5)+k*3)%9;if(s<2){ctx.fillStyle=s?'#70a4b2':'#ffffff';ctx.fillRect(TWK[k][0],TWK[k][1],1,1);if(!s){ctx.fillStyle='#6c5eb5';ctx.fillRect(TWK[k][0]-1,TWK[k][1],1,1);ctx.fillRect(TWK[k][0]+1,TWK[k][1],1,1)}}}
      for(let i=0;i<80;i++){const sx=Math.floor((((i*4+t*3)%AW)+AW)%AW),dy=Math.round(Math.sin(t*.8+i*.12)*3+Math.sin(t*.33+i*.05)*4),sh=Math.sin(t*1.9-i*.21)+.6*Math.sin(t*.7+i*.09);
        ctx.drawImage(sh>.95?AUR[1]:AUR[0],sx,0,4,AH,i*4,16+dy,4,AH)}
      strip(FARC,VF,t,BOT-FH);
      strip(MIDTC,VM,t,TOP-1);
      const mx=strip(MIDBC,VM,t,BOT-MH);
      for(const l of lights){if(((t+l.x*.01)%l.p)/l.p>l.d)continue;let x=mx+l.x;if(x<-4)x+=MW;if(x>W+4)x-=MW;if(x<0||x>=W)continue;ctx.fillStyle=l.c;ctx.fillRect(x,BOT-MH+l.y,1,1);ctx.fillStyle=pat(l.c);ctx.fillRect(x-1,BOT-MH+l.y-1,3,3)}
      strip(NEARTC,VN,t,TOP-1);
      strip(NEARBC,VN,t,BOT-NBH)},
    drawForeground(t){
      const gx=strip(FGBC,VFG,t,BOT-GBH+2);strip(FGTC,VFG,t,TOP-1);
      for(const l of FGL){if((t%l.p)/l.p>l.d)continue;let x=gx+l.x;if(x<-4)x+=GW;if(x>W+4)x-=GW;if(x>=0&&x<W){ctx.fillStyle=l.c;ctx.fillRect(x,BOT-GBH+2+l.y,2,1)}}
      const g=.5+.5*Math.sin(t*.4),D=60*t-100*Math.cos(t*.4),n=g>.55?FL.length:52;
      for(let i=0;i<n;i++){const f=FL[i],x=((f.x-D*f.v)%360+360)%360-20,y=TOP+((f.y+t*(12+f.z*12)+Math.sin(t*1.3+f.ph)*3)%178+178)%178;
        const len=1+Math.round(f.z*1.4+g*2.6*f.z+(i>=52?2:0));ctx.fillStyle=i>=52?'#6c5eb5':f.c;ctx.fillRect(x|0,y|0,f.z>.9?Math.min(len,3):len,f.z>.9?2:1)}},
    enemies,bullets,boss
  };
},
/* level script: snow cannon placements, whales, calving shelves, wraith squadrons and drone loops on top of the shared script */
script(sc,h){
  const L=h.level;
  for(const c of [[6,1],[11,-1],[18,1],[27,-1],[35,1],[41,-1],[49,1],[57,-1],[64,1],[71,-1],[79,1]]){if(Math.random()<(L===1?.4:.2))continue;sc.push({t:c[0]+Math.random(),type:'cross',y:c[1]>0?170:30,edge:c[1]})}
  if(L>=2)for(const t0 of [22,45,68])sc.push({t:t0,type:'cross',y:30,edge:-1},{t:t0+.6,type:'cross',y:170,edge:1});
  sc.push({t:20,type:'pod',y:85},{t:52,type:'pod',y:115});if(L>=2)sc.push({t:73,type:'pod',y:60});if(L>=3)sc.push({t:36,type:'pod',y:140});
  for(const t0 of (L===1?[15,47,77]:[15,33,47,61,77])){const n=L>=3?3:2;for(let i=0;i<n;i++)sc.push({t:t0+i*1.1,type:'rock',calve:i%2?1:-1})}
  h.add(26,'dart',3,.35,60,40);h.add(54,'dart',4,.3,45,35);if(L>=2)h.add(66,'dart',4,.3,150,-30);
  if(L>=2)h.add(30,'ring',6,.32,75,0,{ph:0});if(L>=3)h.add(58,'ring',6,.32,125,0,{ph:3.14});
  h.add(44,'ringR',3,.8,60,40);if(L>=3)h.add(82,'ringR',3,.8,70,30);
}
};
Object.assign(PLANETS[2],{d:'ICE CLIFFS. CANNONS, WRAITHS, WHALES.',every:13,waves:[['ring',4,.38],['rock',1,0]]});
})();
