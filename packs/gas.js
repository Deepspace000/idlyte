/* art pack: GAS GIANT (planet 4). Pastel Jupiter.
   Background: shearing cream, peach, rose and lavender cloud bands, a giant swirling eye-storm,
   far and near floating cloud cities with lit windows and landing lights, gas jets with wisps,
   puffy cloud banks, lightning with a distant glow telegraph and a short flash that silhouettes things.
   Cast: storm cross-wings (cross), lightning rays (ring, ringR), mini jellies (ring with o.mini),
   storm fighters and carrier fighters (dart, e.variant 0 and 1), sky jellyfish and cloud carriers
   (pod, e.variant 0 and 1), thunderheads, hail and churning cloud knots (rock).
   Boss: the Sky Fortress, a floating city turned warship. */
PACKS[4]=(function(){
const TAU=Math.PI*2,TW=400;
function hs(n){const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)}
function rng(seed){let s=(seed|0)||1;return()=>(s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff}
const RGBC={};
function rgbOf(h){let v=RGBC[h];if(!v)v=RGBC[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];return v}
/* paint a canvas from fn(x,y) -> colour or null, through ImageData (init only) */
function paint(w,h,fn){
  const c=mk(w,h),g=c.getContext('2d'),id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const col=fn(x,y);if(!col)continue;const q=rgbOf(col),i=(y*w+x)*4;d[i]=q[0];d[i+1]=q[1];d[i+2]=q[2];d[i+3]=255}
  g.putImageData(id,0,0);return c}
/* ordered dither pick from a ramp (dark to light), v 0..1 */
function dz(r,v,x,y){if(!(v>0))v=0;if(v>.999)v=.999;const t=v*(r.length-1),k=Math.floor(t);return r[(t-k)>BAYER[y&3][x&3]/16?Math.min(r.length-1,k+1):k]}
/* sprite buffer: a colour per pixel plus a silhouette mask (mask without colour = see-through glass) */
function Buf(w,h){return{w,h,c:new Array(w*h).fill(null),m:new Uint8Array(w*h)}}
function bp(B,x,y,col){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=B.w||y>=B.h)return;const i=y*B.w+x;B.c[i]=col;B.m[i]=1}
/* fn returns: null keep, 0 mask only (glass), '' clear, colour string paint */
function bfill(B,x0,y0,x1,y1,fn){
  x0=Math.max(0,Math.floor(x0));y0=Math.max(0,Math.floor(y0));x1=Math.min(B.w-1,Math.ceil(x1));y1=Math.min(B.h-1,Math.ceil(y1));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*B.w+x,r=fn(x,y,B.c[i]);
    if(r==null)continue;if(r===0){B.m[i]=1;continue}if(r===''){B.c[i]=null;B.m[i]=0;continue}B.c[i]=r;B.m[i]=1}}
/* ellipse fill; part 1 = upper half only, 2 = lower half only */
function bEll(B,cx,cy,rx,ry,part,fn){bfill(B,cx-rx,cy-ry,cx+rx,cy+ry,(x,y,cur)=>{const nx=(x-cx)/rx,ny=(y-cy)/ry,r2=nx*nx+ny*ny;if(r2>1)return null;if(part===1&&y>cy)return null;if(part===2&&y<cy)return null;return fn(x,y,nx,ny,Math.sqrt(1-r2),cur)})}
const LIGHT={'#000000':'#1c1840','#1c1840':'#352879','#352879':'#6c5eb5','#6c5eb5':'#cc99ff','#8a5aa6':'#cc99ff','#6f3d86':'#8a5aa6','#cc99ff':'#ffffff','#1b3036':'#3c6a78','#3c6a78':'#70a4b2','#70a4b2':'#9ad2e0','#9ad2e0':'#ffffff','#2a1a40':'#6f3d86','#cc44cc':'#ff77ff','#ff77ff':'#ffaaaa','#ffaaaa':'#ffffff','#ff7777':'#ffaaaa','#9a3a3a':'#ff7777','#68372b':'#9a6759','#9a6759':'#d8a878','#d8a878':'#ffffaa','#ffffaa':'#ffffff','#ff9966':'#ffffaa','#444444':'#6c6c6c','#6c6c6c':'#959595','#959595':'#bbbbbb','#bbbbbb':'#ffffff','#222222':'#444444'};
const DARK={'#ffffff':'#bbbbbb','#cc99ff':'#8a5aa6','#8a5aa6':'#6f3d86','#6c5eb5':'#352879','#352879':'#1c1840','#1c1840':'#000000','#9ad2e0':'#70a4b2','#70a4b2':'#3c6a78','#3c6a78':'#1b3036','#ff77ff':'#cc44cc','#cc44cc':'#6f3d86','#6f3d86':'#2a1a40','#ffaaaa':'#ff7777','#ff7777':'#9a3a3a','#d8a878':'#9a6759','#9a6759':'#68372b','#ffffaa':'#d8a878','#ff9966':'#9a6759','#bbbbbb':'#959595','#959595':'#6c6c6c','#6c6c6c':'#444444','#444444':'#222222'};
/* rim light on top/left edges, shade bottom/right edges (light from the upper left) */
function brim(B){const w=B.w,h=B.h,o=B.c.slice(),em=(x,y)=>x<0||y<0||x>=w||y>=h||!B.m[y*w+x];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,c=B.c[i];if(!c)continue;
    if(em(x,y-1)||em(x-1,y))o[i]=LIGHT[c]||c;else if(em(x,y+1)||em(x+1,y))o[i]=DARK[c]||c}
  B.c=o}
function bout(B,col){const w=B.w,h=B.h,add=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(B.m[i])continue;
    if((x>0&&B.m[i-1]===1)||(x<w-1&&B.m[i+1]===1)||(y>0&&B.m[i-w]===1)||(y<h-1&&B.m[i+w]===1))add.push(i)}
  for(const i of add){B.c[i]=col;B.m[i]=2}}
function bcv(B){return paint(B.w,B.h,(x,y)=>B.c[y*B.w+x])}
function fin(B,col){brim(B);bout(B,col||'#000000');return bcv(B)}
function tint(c,col){const o=mk(c.width,c.height),x=o.getContext('2d');x.drawImage(c,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,o.width,o.height);return o}
function canFire(n){return EB.length+(n||1)<=25}
/* jagged electric arc between two points (cosmetic) */
function zap(c,x0,y0,x1,y1){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,n=Math.max(2,L|0),px=-dy/L,py=dx/L;let off=0;
  for(let i=0;i<=n;i++){off+=(Math.random()-.5)*1.6;if(off>2.5)off=2.5;if(off<-2.5)off=-2.5;const k=i/n,e=Math.min(1,Math.min(i,n-i)/3),x=(x0+dx*k+px*off*e)|0,y=(y0+dy*k+py*off*e)|0;
    c.fillStyle='#352879';c.fillRect(x+1,y+1,1,1);c.fillStyle=i&1?'#9ad2e0':'#ffffff';c.fillRect(x,y,1,1)}}

/* ================= enemy sprites ================= */
/* storm cross-wing: four swept violet blades round a magenta eye, electrode tips, crackle arcs */
function crossWing(f){
  const S=23,C=11,B=Buf(S,S),rot=f*Math.PI/12;
  const BL=['#1c1840','#352879','#6c5eb5','#8a5aa6','#cc99ff'],HB=['#1c1840','#352879','#6f3d86','#cc44cc'];
  bfill(B,0,0,S-1,S-1,(x,y)=>{
    const dx=x-C,dy=y-C,r=Math.hypot(dx,dy);
    if(r<=3.7){if(r<1.5)return (dx<0&&dy<0)?'#ffffff':'#ff77ff';const nx=dx/3.7,ny=dy/3.7;return dz(HB,.35+(-.6*nx-.75*ny)*.5+Math.sqrt(Math.max(0,1-nx*nx-ny*ny))*.2,x,y)}
    for(let k=0;k<4;k++){
      const a=rot+k*Math.PI/2,ca=Math.cos(a),sa=Math.sin(a),u=dx*ca+dy*sa,v=-dx*sa+dy*ca;
      if(u<2.6||u>10)continue;
      const s=(u-2.6)/7.4,vv=v-2.4*s*s,hw=3*(1-s)+.5;
      if(Math.abs(vv)>hw)continue;
      if(s>.86)return s>.94?'#ffffff':'#9ad2e0';
      if(Math.abs(s-.45)<.07)return vv<0?'#ff77ff':'#cc44cc';
      const side=vv/hw,pl=.6*sa-.75*ca;
      return dz(BL,.5+side*pl*.55+(1-Math.abs(side))*.18,x,y)}
    return null});
  const c=fin(B),g=c.getContext('2d'),R=rng(31+f*17);
  for(let q=0;q<2;q++){const k=(f+q*2+(f>>1))%4,a=rot+k*Math.PI/2,ca=Math.cos(a),sa=Math.sin(a);
    let x=C+10*ca-2.4*sa,y=C+10*sa+2.4*ca;
    for(let s=0;s<3;s++){x+=ca*1.1+(R()-.5)*1.8;y+=sa*1.1+(R()-.5)*1.8;if(x<0||y<0||x>=S||y>=S)break;
      g.fillStyle='#352879';g.fillRect((x|0)+1,(y|0)+1,1,1);g.fillStyle=s?'#9ad2e0':'#ffffff';g.fillRect(x|0,y|0,1,1)}}
  return c}
/* lightning ray: teal manta seen from above, wings flap by span, glowing zigzag wing markings */
function rayFrame(L,S,flap,glow){
  const w=L+9,h=2*S+5,cy=S+2,B=Buf(w,h),RP=['#1b3036','#3c6a78','#70a4b2','#9ad2e0','#ffffff'],span=S*flap,x0=1.5;
  bfill(B,0,0,w-1,h-1,(x,y)=>{
    const bx=(x-x0)/L,dy=y-cy,ady=Math.abs(dy);
    if(bx<0)return null;
    if(bx>.9){if(dy===0&&x<w-1)return x>=w-3?'#ffffaa':'#3c6a78';return null}
    const bw=S*.32*Math.sqrt(Math.max(0,1-Math.pow((bx-.42)/.48,2)));
    let wg=0;if(bx>.1&&bx<.84)wg=bx<.47?Math.pow(Math.sin((bx-.1)/.37*Math.PI/2),.75):Math.pow(1-(bx-.47)/.37,1.3);
    const lim=Math.max(bw,wg*span),horn=bx<.14&&ady>=S*.18&&ady<=S*.18+1.6;
    if(ady>lim+.35){return horn?'#3c6a78':null}
    const e=lim>0?Math.min(1,ady/lim):0;
    if(ady>bw+.6){const q=bx-(.27+.2*(ady/S))-.035*((((ady*1.3)|0)&1)?1:-1);if(Math.abs(q)<.065)return glow?'#ffffff':'#ffffaa'}
    return dz(RP,.6-dy/S*.25-e*e*.32+(ady<=bw?.1:0),x,y)});
  const ex=Math.round(x0+L*.13),eo=S>7?2:1;bp(B,ex,cy-eo,'#ffffff');bp(B,ex,cy+eo,'#ffffff');
  return fin(B)}
/* jellyfish bell with see-through dither, glowing organs, scalloped skirt, waving tendrils */
function jellyFrame(big,f,n){
  const p=Math.sin(f/n*TAU),rx=(big?11.5:4.6)+p*(big?1.4:.6),ry=(big?9:3.8)-p*(big?1.1:.4);
  const w=big?33:13,h=big?40:17,cx=(w-1)/2,cy=big?11:5,sk=big?2:1;
  const B=Buf(w,h),BL=['#2a1a40','#6f3d86','#cc44cc','#ff77ff','#ffaaaa','#ffffff'];
  bfill(B,0,0,w-1,cy+sk,(x,y)=>{
    const nx=(x-cx)/rx,ny=(y-cy)/ry;
    if(y>cy){if(Math.abs(nx)>1-(y-cy)*.05)return null;if(y===cy+sk&&((x+f)%3===0))return null;
      return big&&(x%4===1)&&y===cy+1?'#9ad2e0':((x>>1)&1?'#ff77ff':'#cc44cc')}
    if(nx*nx+ny*ny>1)return null;
    const r=Math.hypot(nx,ny),nz=Math.sqrt(Math.max(0,1-r*r));
    if(big&&r<.8&&ny>-.6&&((x+y+f)&1))return 0;
    return dz(BL,.32+(-.55*nx-.8*ny)*.4+nz*.22+(r<.5?.12:0),x,y)});
  if(big){for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4,ox=cx+Math.cos(a)*4.2,oy=cy-3+Math.sin(a)*2.4;
      for(let q=0;q<8;q++){const b2=q/8*TAU;bp(B,ox+Math.cos(b2)*1.6,oy+Math.sin(b2)*1.2,q<4?'#ffffff':'#9ad2e0')}}
    bp(B,cx,cy-3,'#ffffff');bp(B,cx-1,cy-3,'#ffffaa')}
  else bp(B,cx,cy-1,'#ffffff');
  const c=fin(B),g=c.getContext('2d'),ph=f/n*TAU,y0=cy+sk+1,tn=big?7:4;
  for(let i=0;i<tn;i++){
    const x0=cx+(i-(tn-1)/2)*(big?3.1:2.4),len=big?14+(i*5)%9:5+(i%2)*2;
    for(let yy=0;yy<len;yy++){
      const x=Math.round(x0+Math.sin(yy*.45+ph+i*1.3)*(.6+yy*.08)+yy*.14),y=y0+yy;
      g.fillStyle='#2a1a40';g.fillRect(x+1,y,1,1);
      g.fillStyle=yy===len-1?'#9ad2e0':(yy>>1)%2?'#ffaaaa':'#cc44cc';g.fillRect(x,y,1,1)}}
  if(big)for(let s2=-1;s2<=1;s2+=2){
    for(let yy=0;yy<11;yy++){const x=Math.round(cx+s2*1.5+Math.sin(yy*.6+ph+s2)*1.4+yy*.1),y=y0+yy;
      g.fillStyle='#6f3d86';g.fillRect(x-1,y,3,1);g.fillStyle=yy%3?'#ff77ff':'#ffffff';g.fillRect(x,y,1,1)}}
  return c}
/* cloud carrier: armoured teal pod-ship, brass band, dorsal fin, belly bay (0 closed, 1 half, 2 open) */
function carrierFrame(bay,eng){
  const w=38,h=25,cy=10,B=Buf(w,h),HL=['#1c1840','#1b3036','#3c6a78','#70a4b2','#9ad2e0'];
  bfill(B,19,cy-10,27,cy-5,(x,y)=>{const d=cy-5-y;if(x<19+d*1.1)return null;return x<21+d*1.1?'#70a4b2':'#3c6a78'});
  bEll(B,18,cy+5,8,6,2,(x,y,nx,ny)=>dz(['#1c1840','#352879','#6c5eb5'],.6-ny*.5-Math.abs(nx)*.2,x,y));
  bfill(B,2,0,34,h-1,(x,y)=>{const t=(x-2)/32,hh=t<.2?7*Math.sqrt(t/.2):7-(t-.2)*3.4,dy=y-cy;if(Math.abs(dy)>hh)return null;
    const ny=dy/Math.max(1,hh),nx=t<.2?(t/.2-1):0;
    if(dy===2)return '#d8a878';if(dy===3)return '#9a6759';
    if(x%7===5&&Math.abs(ny)<.8)return '#1c1840';
    return dz(HL,.55-ny*.42-nx*.2-ny*ny*.12,x,y)});
  bEll(B,8,cy-3,3.2,2,0,(x,y,nx,ny)=>(nx<-.2&&ny<-.2)?'#ffffff':ny>.3?'#3c6a78':'#9ad2e0');
  for(let x=13;x<=23;x++){
    if(bay===0){bp(B,x,cy+9,(x>>1)&1?'#ffffaa':'#1c1840');bp(B,x,cy+10,'#6c5eb5')}
    else if(bay===1){const o=x>=16&&x<=20;bp(B,x,cy+9,o?'#ff9966':((x>>1)&1?'#ffffaa':'#1c1840'));bp(B,x,cy+10,o?'#ffffaa':'#6c5eb5')}
    else{bp(B,x,cy+9,x>=15&&x<=21?'#ff9966':'#1c1840');bp(B,x,cy+10,x>=16&&x<=20?'#ffffff':'#ffffaa')}}
  if(bay===2){bp(B,12,cy+11,'#6c5eb5');bp(B,11,cy+12,'#6c5eb5');bp(B,24,cy+11,'#6c5eb5');bp(B,25,cy+12,'#6c5eb5')}
  bfill(B,32,cy-4,35,cy+4,(x,y)=>x===35?(eng?'#ffffff':'#ff77ff'):(y===cy-4?'#959595':'#444444'));
  bp(B,27,cy-10,'#ff7777');
  const c=fin(B),g=c.getContext('2d');g.fillStyle=eng?'#ffaaaa':'#ff77ff';g.fillRect(37,cy-2,1,5);
  return c}
/* storm fighter (v 0, navy and magenta) and carrier fighter (v 1, teal and brass) */
function dartFrame(v,f){
  const L=v?11:15,w=L+3,h=v?9:11,cy=(h-1)/2,B=Buf(w,h);
  const RM=v?['#1b3036','#3c6a78','#70a4b2','#9ad2e0']:['#1c1840','#352879','#6c5eb5','#cc99ff'];
  bfill(B,1,0,L,h-1,(x,y)=>{const t=(x-1)/(L-1),dy=y-cy,ady=Math.abs(dy);
    const body=.5+t*1.5,fw=t>.5?(t-.5)/.45*cy:0,inFin=ady<=fw&&t<1-(ady/cy)*.12;
    if(ady>body+.3&&!inFin)return null;
    if(ady>body+.3){if(ady>=cy-.6&&t>.86)return f?'#ffffff':(v?'#d8a878':'#ff77ff');return dz(RM,.55-dy/cy*.35,x,y)}
    if(dy<0&&t>.16&&t<.5)return t<.26?'#ffffff':(v?'#ffffaa':'#ff77ff');
    return dz(RM,.6-dy/(body+1)*.35,x,y)});
  bp(B,L+1,cy,'#ffffaa');
  return fin(B)}
/* small thunderhead: f 0/1 churn, 2 crackle, 3 lit from inside */
function thunderSmall(seed,f){
  const w=14,h=12,B=Buf(w,h),R=rng(seed),pf=[[4,7,3.4],[7.5,4.8,4],[10,7,3.1],[6.5,8,3.2]].map(p=>[p[0]+(R()-.5)*1.2+(f&1)*.4,p[1]+(R()-.5)*.8,p[2]]);
  const RP=f===3?['#352879','#6c5eb5','#8a5aa6','#cc99ff','#ffffff']:['#1c1840','#352879','#6c5eb5','#8a5aa6','#cc99ff'];
  bfill(B,0,0,w-1,h-2,(x,y)=>{let v=0,bx=0,by=0;for(const p of pf){const d=1-Math.hypot(x-p[0],y-p[1])/p[2];if(d>v){v=d;bx=(x-p[0])/p[2];by=(y-p[1])/p[2]}}
    if(v<=0)return null;return dz(RP,.25+(-.55*bx-.8*by)*.35+v*.3+(y>8?-.12:0),x,y)});
  if(f>=2)for(const q of [[7,3],[6,4],[7,5],[8,6],[7,7],[8,8]])bp(B,q[0],q[1],f===3?'#ffffff':'#ffffaa');
  return fin(B)}
/* hail: three icy stones tumbling round each other */
function hailFrame(f){const B=Buf(13,13),HR=['#3c6a78','#70a4b2','#9ad2e0','#ffffff'];
  for(let k=0;k<3;k++){const a=f*Math.PI/6+k*TAU/3,sx=6+Math.cos(a)*2.8,sy=6+Math.sin(a)*2.8,r=k===0?2.6:2.1;
    bEll(B,sx,sy,r,r,0,(x,y,nx,ny,nz)=>dz(HR,.4+(-.6*nx-.75*ny)*.45+nz*.2,x,y))}
  return fin(B)}
/* churning cloud knot (big hazard): boiling edge, spiral arms, optional inner lightning */
function knotFrame(seed,f,lit,hue){
  const S=25,C=12,B=Buf(S,S),R=rng(seed),bm=[];for(let i=0;i<3;i++)bm.push(R()*TAU);
  const RP=hue?['#1c1840','#2a1a40','#6f3d86','#8a5aa6','#cc99ff']:['#1c1840','#352879','#6c5eb5','#8a5aa6','#cc99ff'];
  bfill(B,0,0,S-1,S-1,(x,y)=>{const dx=x-C,dy=y-C,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
    let rr=10.4;for(let i=0;i<3;i++)rr+=Math.sin(a*(i+3)+bm[i]+f*TAU/4*(i+1))*.55;
    if(r>rr)return null;
    const sw=Math.sin(a*3-r*.6+f*TAU/4);
    return dz(RP,.3+(-.6*dx-.8*dy)/rr*.32+sw*.13+(1-r/rr)*.12+(lit?.28:0),x,y)});
  const c=fin(B);
  if(lit){const g=c.getContext('2d'),R2=rng(seed*3+f+1);let x=C-4+R2()*4,y=C-7;
    for(let s=0;s<10;s++){g.fillStyle=s%3?'#ffffaa':'#ffffff';g.fillRect(x|0,y|0,1,1);if(s%3===0)g.fillRect((x|0)+1,y|0,1,1);x+=(R2()-.45)*2.4;y+=1.35}}
  return c}

/* ================= boss sprites ================= */
const OX=75,OY=60,TUR=[[17,52],[33,70]],BAYS=[[42,71],[48,81]];
const SPIRES=[[7,42],[46,36],[106,32],[116,41],[138,40],[143,47]];
function turretFrame(f){const B=Buf(15,9);
  bfill(B,0,0,14,8,(x,y)=>{const nx=(x-7)/7,ny=(y-4)/4,r=Math.hypot(nx,ny);if(r>1)return null;
    if(r<.42)return (x===7&&y===4)?'#ff7777':'#1c1840';
    const a=Math.atan2(ny,nx);if(Math.sin(6*(a-f*TAU/36))>.55)return ny>0?'#ffffaa':'#d8a878';
    return dz(['#1b3036','#3c6a78','#70a4b2','#9ad2e0'],.55-ny*.45,x,y)});
  return fin(B)}
function fireFrame(f){const R=rng(5+f*11),wob=[];for(let i=0;i<11;i++)wob.push((R()-.5)*1.6);
  return paint(7,11,(x,y)=>{const hw=Math.pow(y/10,.7)*3.2,cx=3+wob[y]*(1-y/10),d=Math.abs(x-cx);if(d>hw||(y<1&&f%2))return null;
    return dz(['#9a3a3a','#ff7777','#ff9966','#ffffaa','#ffffff'],1-d/(hw+.01)*.6-(1-y/10)*.7,x,y)})}
function fortress(stage){
  const w=150,h=104,B=Buf(w,h);
  const HULL=['#000000','#1c1840','#352879','#6c5eb5','#8a5aa6','#cc99ff'],BR=['#68372b','#9a6759','#d8a878','#ffffaa'],
    ST=['#222222','#444444','#6c6c6c','#959595','#bbbbbb'],RO=['#2a1a40','#6f3d86','#cc44cc','#ff77ff','#ffaaaa'],GL=['#1b3036','#3c6a78','#70a4b2','#9ad2e0','#ffffff'];
  const lit=(nx,ny,nz)=>.36+(-.6*nx-.75*ny)*.42+nz*.24;
  const dark=(x,y,p)=>stage>=1&&hs(x*7.3+y*3.1)<p;
  // towers seen through the shield dome
  for(const [tx,tw,ty] of [[54,4,40],[59,5,30],[65,4,22],[71,4,27],[84,5,25],[91,4,33],[97,4,38],[102,3,44]])
    bfill(B,tx,ty,tx+tw-1,57,(x,y)=>{if(y<ty+2&&(x===tx||x===tx+tw-1))return null;
      if((y-ty)%4===2&&x>tx&&x<tx+tw-1)return dark(x,y,.4)?'#1c1840':'#ffffaa';
      return x===tx?'#cc99ff':x===tx+tw-1?'#352879':'#6c5eb5'});
  // central spire with two ring platforms
  bfill(B,78,4,80,57,(x)=>x===78?'#cc99ff':x===79?'#8a5aa6':'#352879');
  for(const py of [16,28])bEll(B,79,py,5,1.6,0,(x,y,nx,ny)=>dz(BR,.65-ny*.4,x,y));
  // geodesic shield dome: lattice is glass, cells are see-through; cracked open at stage 2
  const hx=66,hy=38;
  bEll(B,79,57,31,30,1,(x,y,nx,ny)=>{const r=Math.hypot(nx,ny);
    if(stage===2){const hd=Math.hypot(x-hx,y-hy);if(hd<4+hs(x*3+y)*1.5)return '';if(hd<5.6&&((x+y)&1))return '#ffffff'}
    if(r>.92)return dz(GL,.5+(-.6*nx-.75*ny)*.55,x,y);
    const a=Math.atan2(ny,nx);if(r>.66&&r<.76&&a<-1.75&&a>-2.85)return '#ffffff';
    const gx=x-79,gy=57-y;if(((gx+gy*2)%9+9)%9===0||((gx-gy*2)%9+9)%9===0||gy%8===0)return (-nx-ny>0)?'#9ad2e0':'#70a4b2';
    return 0});
  if(stage===2){const R=rng(77);for(let k=0;k<6;k++){let a=k/6*TAU+R(),x=hx+Math.cos(a)*5,y=hy+Math.sin(a)*5;const n=8+R()*8;
    for(let s=0;s<n;s++){x+=Math.cos(a);y+=Math.sin(a);a+=(R()-.5)*.9;const nx=(x-79)/31,ny=(y-57)/30;if(nx*nx+ny*ny>.85||y>55)break;bp(B,x,y,'#ffffff');bp(B,x+1,y+1,'#1c1840')}}}
  // side domes (the left one is shot away at stage 2, the right one scorched)
  const side=(cx,rx,ry,broken,scorch)=>bEll(B,cx,57,rx,ry,1,(x,y,nx,ny,nz)=>{
    if(broken){if(y<57-ry*.4-hs(x*1.7)*3)return null;return dz(['#000000','#222222','#444444','#68372b'],.35-nx*.2+hs(x+y*5)*.3,x,y)}
    if(scorch&&nx>-.1&&hs(x*3.3+y*7.7)<.5)return (x+y)&1?'#2a1a40':'#000000';
    if(y===Math.round(57-ry*.45)&&x%3===0)return '#ffffaa';
    return dz(RO,lit(nx,ny,nz),x,y)});
  side(32,13,11,stage===2,false);side(122,12,10,false,stage>=1);
  if(stage<2){bp(B,32,45,'#ffaaaa');bp(B,32,44,'#ffffff')}bp(B,122,46,'#ffaaaa');bp(B,122,45,'#ffffff');
  for(const [sx,sy] of SPIRES)bfill(B,sx,sy,sx+1,57,(x)=>x===sx?'#cc99ff':'#352879');
  // deck plate
  bEll(B,75,57,69,4.5,1,(x,y,nx,ny)=>dz(BR,.85-(ny+1)*.3,x,y));
  // rim disk with a row of windows
  bEll(B,75,61,71,6.5,0,(x,y,nx,ny)=>{if(y===61&&x%4<2&&x>8&&x<142)return dark(x,y,stage===2?.5:.22)?'#1c1840':'#ffffaa';if(y===66)return '#9a6759';return dz(HULL,.62-ny*.38-Math.abs(nx)*.18,x,y)});
  // keel with decks, ribs and windows
  bEll(B,80,64,48,33,2,(x,y,nx,ny,nz)=>{if(y<=66)return null;const dk=(y-64)%7;if(dk===0)return '#1c1840';
    if(dk===3&&x%5<2&&nz>.4)return dark(x,y,.3*stage)?'#1c1840':(y>82?'#ff9966':'#ffffaa');
    if((x-80)%16===0&&nz>.3)return '#1c1840';
    return dz(HULL,lit(nx*.9,ny*.6+.15,nz),x,y)});
  // keel engine nacelle
  bEll(B,80,97,10,4.5,0,(x,y,nx,ny,nz)=>y>=99&&Math.abs(nx)<.6?'#ff9966':dz(ST,lit(nx,ny,nz),x,y));
  // main cannon: housing and coil-wrapped barrel
  bEll(B,22,63,8,6,0,(x,y,nx,ny,nz)=>dz(HULL,lit(nx,ny,nz)+.1,x,y));
  bfill(B,1,60,17,67,(x,y)=>{if(x<4)return y===60||y===67?'#1c1840':(y>61&&y<66?(x===1?'#ff77ff':'#cc44cc'):'#352879');if(y===60||y===67)return null;if((x-6)%4===0)return y===61?'#ffffaa':'#d8a878';return dz(ST,1-(y-61)/5,x,y)});
  // rear exhaust nozzle
  bfill(B,140,56,149,67,(x,y)=>{const hh=2.5+(x-140)*.35;if(Math.abs(y-61.5)>hh)return null;return x>=148?(Math.abs(y-61.5)<hh-1?'#ff77ff':'#444444'):dz(ST,.7-(y-61.5)/hh*.4,x,y)});
  // launch bay doors (closed; drawn open per frame)
  for(const [bx,by] of BAYS)bfill(B,bx,by,bx+11,by+5,(x,y)=>(y===by||y===by+5)?(((x>>1)&1)?'#ffffaa':'#000000'):(x===bx||x===bx+11)?'#1c1840':((x+y)%4===0?'#352879':'#6c5eb5'));
  for(const [tx,ty] of TUR)bEll(B,tx,ty+2,6,2.5,0,(x,y,nx,ny)=>dz(HULL,.5-ny*.3,x,y));
  // scorch marks
  if(stage>=1){const sc=stage===1?[[112,62,6,3],[60,82,7,4],[96,74,5,3]]:[[112,62,7,4],[60,82,8,4],[96,74,6,3],[40,62,6,3],[130,60,5,3],[86,90,6,3],[70,50,5,4]];
    for(const [sx,sy,rx,ry] of sc)bfill(B,sx-rx,sy-ry,sx+rx,sy+ry,(x,y,cur)=>{const d=Math.hypot((x-sx)/rx,(y-sy)/ry);if(d>1||!cur)return null;return d<.5?'#000000':((x+y)&1?'#1c1840':null)})}
  return fin(B)}
function fortHit(b,x,y){const sx=x-b.x+OX,sy=y-b.y+OY;
  if(sx<0||sx>150||sy<0||sy>104)return false;
  let nx=(sx-75)/72,ny=(sy-61)/7.5;if(nx*nx+ny*ny<=1)return true;
  if(sy>=61){nx=(sx-80)/50;ny=(sy-64)/35;if(nx*nx+ny*ny<=1)return true}
  if(sy<=58){nx=(sx-79)/33;ny=(sy-57)/32;if(nx*nx+ny*ny<=1)return true;
    nx=(sx-32)/15;ny=(sy-57)/13;if(nx*nx+ny*ny<=1)return true;nx=(sx-122)/14;ny=(sy-57)/12;if(nx*nx+ny*ny<=1)return true}
  return sx<=20&&sy>=59&&sy<=68}

/* ================= background pieces ================= */
function puff(r,cols){const S=r*2+1;return paint(S,S,(x,y)=>{const d=Math.hypot(x-r,y-r)/r;if(d>1)return null;if(d>.55&&BAYER[y&3][x&3]>7)return null;return dz(cols,1-d+(-(x-r)-(y-r))/r*.15,x,y)})}
function plumeFrame(f){const w=22,h=90,PR=['#cc44cc','#ff77ff','#ffaaaa','#ffffaa','#ffffff'];
  return paint(w,h,(x,y)=>{const k=y/h,cx=10.5+Math.sin(y*.11+f*TAU/4)*1.6*k+Math.sin(y*.27-f*TAU/4)*.6;
    const hw=2.2+Math.pow(k,.45)*8.3,d=Math.abs(x-cx)/hw;if(d>1)return null;
    const v=1-d*.9+Math.sin(y*.45+f*TAU/4*2+x*.5)*.12-(y<6?(6-y)*.08:0);
    if(v<BAYER[y&3][x&3]/16*.5)return null;
    return dz(PR,v,x,y)})}
/* tileable puffy cloud strip; side 1 = bank below (filled downward), -1 = bank above */
function cloudStrip(w,h,seed,n,yc,yj,r0,r1,ramp,side,bias){
  const R=rng(seed),P=[];for(let i=0;i<n;i++)P.push([i/n*w+R()*w/n*.8,yc+(R()-.5)*yj,r0+R()*(r1-r0)]);
  return paint(w,h,(x,y)=>{let v=0,bx=0,by=0;
    for(const p of P){let dx=x-p[0];dx-=Math.round(dx/w)*w;const d=Math.hypot(dx/1.3,y-p[1])/p[2];if(1-d>v){v=1-d;bx=dx/1.3/p[2];by=(y-p[1])/p[2]}}
    if(side>0&&y>yc+2&&v<.3){v=.3;bx=0;by=.6}
    if(side<0&&y<yc-2&&v<.3){v=.3;bx=0;by=-.2}
    if(v<=0)return null;
    return dz(ramp,.45+(-.45*bx-.85*by)*.45+v*.25+(bias||0),x,y)})}
function bandStrip(i,def){
  const y0=def[0],h=def[1],ramp=def[2],R=rng(17+i*31),s1=R()*TAU,s2=R()*TAU,s3=R()*TAU,k1=2+(R()*3|0),k2=3+(R()*4|0),k3=5+(R()*5|0),amp=2+R()*2.5;
  const curls=[];for(let q=0;q<3;q++)curls.push([R()*TW,8+R()*5,4.5+R()*2,R()<.5?1:-1]);
  const H=h+6;
  return paint(TW,H,(x,y)=>{
    const u=x/TW*TAU,edge=4+amp*(.6*Math.sin(u*k1+s1)+.4*Math.sin(u*k3+s2));
    if(i>0&&y<edge)return null;
    const ly=y-edge;
    const cm=def[4]||1;let v=.5+cm*(.24*Math.sin(u*k2+ly*.38+1.6*Math.sin(u*k1*2+s3))+.14*Math.sin(u*k3*2-ly*.22+s1));
    if(i>0){if(ly<2.2)v+=.3*cm+.05;else if(ly<4.5)v+=.12*cm}
    for(const c of curls){let dx=x-c[0];dx-=Math.round(dx/TW)*TW;const dy=y-c[1],r=Math.hypot(dx/1.7,dy);
      if(r<c[2]){const a=Math.atan2(dy,dx/1.7);v+=Math.sin(a*c[3]+r*1.3)*.3*cm*(1-r/c[2])}}
    return dz(ramp,v,x,y)})}
function eyeFrame(f){const w=120,h=52,cx=59.5,cy=25.5,ER=['#6f3d86','#9a3a3a','#ff7777','#ff9966','#ffaaaa','#ffffaa','#ffffff'];
  return paint(w,h,(x,y)=>{const nx=(x-cx)/58,ny=(y-cy)/24,r=Math.hypot(nx,ny),a=Math.atan2(ny,nx);
    const edge=.97+.05*Math.sin(a*5+f*TAU/6)+.02*Math.sin(a*9);
    if(r>edge)return null;if(r>edge-.1&&BAYER[y&3][x&3]>9)return null;
    const sw=Math.sin(a*2-r*8+f*TAU/6);
    const base=r<.15?.1:r<.26?.9:r<.5?.6:r<.78?.45:.68;
    return dz(ER,base+sw*.15*(r>.15?1:.3)+(-nx*.06-ny*.1),x,y)})}
function cityBuild(o){
  const B=Buf(o.w,o.h),P=o.pal,cx=o.cx,dy=o.dy,lights=[];
  for(const [tx,tw,ty] of o.towers)bfill(B,tx,ty,tx+tw-1,dy,(x,y)=>(y-ty)%3===1&&x>tx&&x<tx+tw-1?P.win:x===tx?P.hull[3]:x===tx+tw-1?P.hull[0]:P.hull[2]);
  for(const [sx,sy] of o.spires){bfill(B,sx,sy,sx+1,dy,(x)=>x===sx?P.hull[3]:P.hull[1]);bp(B,sx,sy-1,P.hull[3]);lights.push([sx,sy-2])}
  for(const [x0,r,glass] of o.domes)bEll(B,x0,dy,r,r*.9,1,(x,y,nx,ny,nz)=>{
    if(glass){const gx=x-x0,gy=dy-y;if(Math.hypot(nx,ny)>.84)return dz(P.glass,.55+(-.6*nx-.75*ny)*.6,x,y);if(((gx+gy*2)%5+5)%5===0||((gx-gy*2)%5+5)%5===0)return P.glass[1];return 0}
    return dz(P.dome,.35+(-.6*nx-.75*ny)*.45+nz*.25,x,y)});
  bEll(B,cx,dy+1,o.rx,2.6,0,(x,y,nx,ny)=>dz(P.brass,.7-ny*.45,x,y));
  bEll(B,cx,dy+3,o.rx*.72,o.keel,2,(x,y,nx,ny,nz)=>((y-dy-3)%4===1&&x%3===0&&nz>.3)?P.win:dz(P.hull,.4+(-.6*nx-.75*ny)*.4+nz*.2,x,y));
  lights.push([cx-o.rx,dy+1],[cx+o.rx-1,dy+1],[cx,dy+3+o.keel+1]);
  brim(B);bout(B,P.out);const c=bcv(B);return {c,lights,sil:tint(c,o.silc||'#352879')}}

return {
init(){
  /* ---------- enemy art ---------- */
  const CROSS=[0,1,2,3,4,5].map(crossWing),CROSSW=CROSS.map(whiteOf);
  const FL=[1,.78,.5,.78];
  const RAY=FL.map((f,i)=>rayFrame(13,6,f,i%2===0)),RAYW=RAY.map(whiteOf);
  const RAYB=FL.map((f,i)=>rayFrame(20,9,f,i%2===0)),RAYBW=RAYB.map(whiteOf);
  const MINI=[0,1,2,3].map(f=>jellyFrame(false,f,4)),MINIW=MINI.map(whiteOf);
  const JELLY=[0,1,2,3,4,5].map(f=>jellyFrame(true,f,6)),JELLYW=JELLY.map(whiteOf);
  const CAR=[];for(let b=0;b<3;b++)for(let e=0;e<2;e++)CAR.push(carrierFrame(b,e));const CARW=CAR.map(whiteOf);
  const DART0=[0,1].map(f=>dartFrame(0,f)),DART0W=DART0.map(whiteOf),DART1=[0,1].map(f=>dartFrame(1,f)),DART1W=DART1.map(whiteOf);
  const THS=[[11,23].map(s=>[0,1,2,3].map(f=>thunderSmall(s,f)))][0],THSW=THS.map(a=>a.map(whiteOf));
  const HAIL=[0,1,2,3].map(hailFrame),HAILW=HAIL.map(whiteOf);
  const KNOT=[[41,0],[97,1]].map(q=>[0,1,2,3].map(f=>knotFrame(q[0],f,false,q[1])).concat([knotFrame(q[0],0,true,q[1]),knotFrame(q[0],2,true,q[1])])),KNOTW=KNOT.map(a=>a.map(whiteOf));
  const PUFF=[puff(1,['#ff77ff','#ffaaaa','#ffffff']),puff(2,['#ff77ff','#ffaaaa','#ffffff']),puff(3,['#cc44cc','#ff77ff','#ffaaaa'])];
  /* ---------- boss art ---------- */
  const FORT=[0,1,2].map(fortress),FORTW=FORT.map(whiteOf),TURF=[0,1,2,3,4,5].map(turretFrame),FIRE=[0,1,2,3].map(fireFrame);
  const FIRES=[[],[[110,58],[62,80],[98,72]],[[110,58],[62,80],[98,72],[30,52],[124,48],[88,90],[16,60],[94,44]]];
  /* ---------- background art ---------- */
  const BANDDEF=[
    [6,32,['#ffaaaa','#ffffaa','#ffffff'],3,1],
    [30,26,['#ff9966','#ffaaaa','#ffffaa'],7,1],
    [50,28,['#d8a878','#ffaaaa','#ffffaa'],4.5,.8],
    [72,30,['#cc99ff','#ffaaaa','#ffffaa'],9,.6],
    [96,34,['#8a5aa6','#cc99ff','#ffaaaa'],6,.55],
    [124,30,['#ff7777','#ff9966','#ffaaaa'],10.5,.6],
    [148,28,['#d8a878','#ffaaaa','#ffffaa'],5,.8],
    [168,32,['#8a5aa6','#cc99ff','#ffaaaa'],8,1]];
  const BANDS=BANDDEF.map((d,i)=>({c:bandStrip(i,d),y:d[0]-4,sp:d[3],off:hs(i+.5)*TW}));
  const EYE=[0,1,2,3,4,5].map(eyeFrame),EYE_Y=58;
  const GLOW=paint(40,24,(x,y)=>{const d=Math.hypot((x-19.5)/19,(y-11.5)/11);if(d>1)return null;const v=1-d;if(v<BAYER[y&3][x&3]/16*.9)return null;return v>.6?'#ffffff':v>.3?'#ffffaa':'#ffaaaa'});
  const PLUME=[0,1,2,3].map(plumeFrame);
  const BANK_B=cloudStrip(480,40,5,22,22,10,8,15,['#8a5aa6','#cc99ff','#ffaaaa','#ffffaa','#ffffff'],1);
  const BANK_T=cloudStrip(480,30,9,22,8,6,7,12,['#cc99ff','#ffaaaa','#ffffaa','#ffffff'],-1,.05);
  const NEAR_B=cloudStrip(480,24,13,14,12,6,8,13,['#ffaaaa','#ffffaa','#ffffff'],1,.1);
  const NEAR_T=cloudStrip(480,16,21,16,3,4,6,10,['#ffaaaa','#ffffaa','#ffffff'],-1,.1);
  const WISP=paint(400,9,(x,y)=>{const u=x/400*TAU,v=Math.sin(u*3+y*.5)*.5+Math.sin(u*7+1)*.3+.25-Math.abs(y-4)/5;if(v<.15||((x+y)&1))return null;return v>.5?'#ffffff':'#ffffaa'});
  const WISPF=(()=>{const o=mk(400,9),x=o.getContext('2d');x.translate(0,9);x.scale(1,-1);x.drawImage(WISP,0,0);return o})();
  const CP_FAR={hull:['#8a5aa6','#cc99ff','#cc99ff','#ffffff'],brass:['#cc99ff','#ffaaaa','#ffffaa'],glass:['#cc99ff','#ffffff','#ffffff'],dome:['#8a5aa6','#cc99ff','#ffaaaa','#ffffff'],win:'#ffffaa',out:'#8a5aa6'};
  const CP_MID={hull:['#352879','#6c5eb5','#8a5aa6','#cc99ff'],brass:['#9a6759','#d8a878','#ffffaa'],glass:['#3c6a78','#70a4b2','#9ad2e0','#ffffff'],dome:['#6f3d86','#cc44cc','#ff77ff','#ffaaaa'],win:'#ffffaa',out:'#352879'};
  const CP_NEAR={hull:['#000000','#1c1840','#352879','#6c5eb5'],brass:['#68372b','#9a6759','#d8a878'],glass:['#1b3036','#3c6a78','#70a4b2','#9ad2e0'],dome:['#1c1840','#352879','#6f3d86','#8a5aa6'],win:'#ffffaa',out:'#000000'};
  const FAR=[
    cityBuild({w:44,h:26,cx:22,dy:14,rx:19,keel:7,towers:[[14,3,6],[26,3,8]],domes:[[21,7,1],[10,4,0],[32,4,0]],spires:[[18,2],[30,5]],pal:CP_FAR,silc:'#6f3d86'}),
    cityBuild({w:40,h:24,cx:20,dy:12,rx:17,keel:7,towers:[[12,3,4],[22,4,6]],domes:[[24,6,0],[13,5,1]],spires:[[19,1]],pal:CP_FAR,silc:'#6f3d86'}),
    cityBuild({w:36,h:20,cx:18,dy:10,rx:15,keel:6,towers:[[10,3,3],[20,3,5]],domes:[[17,5,1]],spires:[[14,1],[24,3]],pal:CP_FAR,silc:'#6f3d86'})];
  const MID=[
    cityBuild({w:72,h:44,cx:36,dy:24,rx:32,keel:13,towers:[[24,4,12],[40,3,9],[46,4,14],[30,3,15]],domes:[[36,11,1],[16,6,0],[56,7,0]],spires:[[33,2],[50,6],[62,14],[10,16]],pal:CP_MID}),
    cityBuild({w:62,h:40,cx:31,dy:20,rx:27,keel:12,towers:[[18,3,8],[24,4,6],[38,3,10]],domes:[[30,8,0],[45,6,1]],spires:[[22,1],[40,4],[52,10]],pal:CP_MID})];
  const EDGE=cityBuild({w:110,h:28,cx:55,dy:18,rx:52,keel:9,towers:[[30,5,8],[40,4,4],[62,5,6],[72,4,10]],domes:[[54,13,1],[20,8,0],[88,9,0]],spires:[[48,0],[66,2],[96,4],[10,6]],pal:CP_NEAR,silc:'#000000'});
  const FARP=[[0,22,0],[1,146,260],[2,28,470],[0,150,650],[2,138,820]];
  const MIDP=[[0,150,80],[1,154,520]];
  const JETS=[[40,7.1,0,72],[250,8.3,2.5,56],[430,6.4,4.1,66],[600,9.2,1.2,50]];

  /* ---------- lightning (deterministic from the level clock) ---------- */
  const LZ={on:false,d:-9,x:0,y:0,k:0,top:false};
  function lz(t){const PER=6.1,k=Math.floor(t/PER),ph=t-k*PER;LZ.k=k;LZ.on=hs(k)>.22;if(!LZ.on)return;
    LZ.d=ph-(1.2+hs(k+7.7)*(PER-2));LZ.top=hs(k+3.3)<.5;LZ.x=30+hs(k+1.1)*260;LZ.y=LZ.top?24+hs(k+5.5)*10:150+hs(k+9.9)*10}
  function flashOn(){return LZ.on&&((LZ.d>=0&&LZ.d<.12)||(LZ.d>=.22&&LZ.d<.26))}
  function seg(x0,y0,x1,y1){const n=Math.max(1,Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0);
    ctx.fillStyle='#352879';for(let i=0;i<=n;i++)ctx.fillRect(((x0+(x1-x0)*i/n)|0)-1,(y0+(y1-y0)*i/n)|0,4,1);
    ctx.fillStyle='#ffffff';for(let i=0;i<=n;i++)ctx.fillRect((x0+(x1-x0)*i/n)|0,(y0+(y1-y0)*i/n)|0,2,1)}
  function drawBolt(){let x=LZ.x,y=LZ.y;const sg=LZ.top?1:-1;
    for(let i=0;i<7;i++){const nx=x+(hs(LZ.k*13+i)-.5)*10,ny=y+sg*(2+hs(LZ.k*7+i*3)*2.6);seg(x,y,nx,ny);
      if(i===2){const bx=nx+(hs(LZ.k+i)<.5?-9:9),by=ny+sg*4;seg(nx,ny,bx,by)}x=nx;y=ny}
    for(let i=0;i<5;i++){const nx=LZ.x+(i+1)*7*(hs(LZ.k*3)<.5?-1:1),ny=LZ.y+(hs(LZ.k*5+i)-.5)*5;seg(i?LZ.x+i*7*(hs(LZ.k*3)<.5?-1:1):LZ.x,i?LZ.y+(hs(LZ.k*5+i-1)-.5)*5:LZ.y,nx,ny)}}

  function drawBackground(t){
    ctx.fillStyle='#cc99ff';ctx.fillRect(0,0,W,H);
    // layer 1: shearing storm bands, each sliding at its own speed
    for(const b of BANDS){const x=-Math.floor((t*b.sp+b.off)%TW);ctx.drawImage(b.c,x,b.y);ctx.drawImage(b.c,x+TW,b.y)}
    // the giant eye-storm drifting past
    {const ex=380-((t*5+150)%800);if(ex>-70&&ex<W+70)ctx.drawImage(EYE[Math.floor(t*1.3)%6],(ex-60)|0,EYE_Y-26)}
    lz(t);const fl=flashOn();
    // telegraph: a distant glow pulsing inside the clouds
    if(LZ.on&&LZ.d<0&&LZ.d>-.95&&(LZ.d>-.35||(Math.floor(LZ.d*14)&1)))ctx.drawImage(GLOW,(LZ.x-20)|0,(LZ.y-12)|0);
    if(fl){ctx.fillStyle=pat('#ffffff');ctx.fillRect(0,TOP,W,BOT-TOP)}
    // layer 2: far hazy cloud cities (silhouettes in the flash)
    for(const p of FARP){const x=W+60-((t*8+p[2])%900);if(x<-50||x>W+4)continue;const s=FAR[p[0]];ctx.drawImage(fl?s.sil:s.c,x|0,p[1])}
    // gas jets erupting from the lower clouds, with rising wisps
    for(let i=0;i<JETS.length;i++){const j=JETS[i],jx=((j[0]-t*16)%700+700)%700-40;if(jx<-20||jx>W+20)continue;
      const tau=(t+j[2])%j[1];let hg=0;
      if(tau<.7)hg=j[3]*Math.pow(tau/.7,.6);else if(tau<3.4)hg=j[3]*(1+.05*Math.sin(tau*9));else if(tau<4.6)hg=j[3]*(1-(tau-3.4)/1.2);
      if(hg>2){const hh=Math.min(90,hg|0);ctx.drawImage(PLUME[Math.floor(t*10+i)%4],0,0,22,hh,(jx-11)|0,BOT+4-hh,22,hh);
        for(let k=0;k<5;k++){const ag=(t*.9+k*.2+j[2])%1,wx=jx+Math.sin(ag*5+k*2)*4-ag*12,wy=BOT+4-hh-ag*20;ctx.fillStyle=ag<.45?'#ffffff':'#ff77ff';const s=ag<.5?2:1;ctx.fillRect(wx|0,wy|0,s,s)}}}
    // layer 3: mid cloud banks top and bottom
    {const x=-Math.floor((t*16)%480),x2=-Math.floor((t*16+200)%480);ctx.drawImage(BANK_T,x2,TOP-6);ctx.drawImage(BANK_T,x2+480,TOP-6);ctx.drawImage(BANK_B,x,BOT-30);ctx.drawImage(BANK_B,x+480,BOT-30)}
    // layer 4: mid cloud cities with blinking landing lights
    for(const p of MIDP){const x=Math.floor(W+80-((t*21+p[2])%900));if(x<-80||x>W+4)continue;const s=MID[p[0]];ctx.drawImage(fl?s.sil:s.c,x,p[1]);
      if(!fl)for(let i=0;i<s.lights.length;i++){const q=s.lights[i],ph=(t*1.8+i*.37)%1;if(ph>.55)continue;ctx.fillStyle=i<s.lights.length-3?(ph<.2?'#ffffff':'#ff7777'):(ph<.25?'#ffffff':'#ffffaa');ctx.fillRect(x+q[0],p[1]+q[1],i<s.lights.length-3?1:2,1)}}
    if(LZ.on&&LZ.d>=0&&LZ.d<.26&&(LZ.d<.12||LZ.d>=.22))drawBolt();
    // layer 5: near cloud banks hugging the edges
    {const x=-Math.floor((t*36)%480),x2=-Math.floor((t*36+300)%480);ctx.drawImage(NEAR_T,x2,TOP-4);ctx.drawImage(NEAR_T,x2+480,TOP-4);ctx.drawImage(NEAR_B,x,BOT-12);ctx.drawImage(NEAR_B,x+480,BOT-12)}
  }
  function drawMidground(t){
    const x=-Math.floor((t*70)%400);
    ctx.drawImage(WISP,x,BOT-8);ctx.drawImage(WISP,x+400,BOT-8);
    const x2=-Math.floor((t*70+170)%400);ctx.drawImage(WISPF,x2,TOP);ctx.drawImage(WISPF,x2+400,TOP);
  }
  function drawForeground(t){
    lz(t);const fl=flashOn();
    // a near cloud city sliding along the bottom edge now and then
    const ex=W+10-((t*60+300)%1500);
    if(ex>-115&&ex<W+5){ctx.drawImage(fl?EDGE.sil:EDGE.c,ex|0,BOT-14);
      if(!fl)for(let i=0;i<EDGE.lights.length-3;i++){if((Math.floor(t*3)+i)%3)continue;const q=EDGE.lights[i];ctx.fillStyle='#ff7777';ctx.fillRect((ex|0)+q[0],BOT-14+q[1],1,1)}}
    // the lightning flash reaches the edges only, briefly
    if(fl&&LZ.d<.08){ctx.fillStyle=pat('#ffffff');if(LZ.top)ctx.fillRect(0,TOP,W,12);else ctx.fillRect(0,BOT-12,W,12)}
  }

  /* ---------- enemies ---------- */
  function rayMove(big){return function(e,dt,live){
    if(e.mini){e.x+=e.vx*dt;e.vx+=(-30-e.vx)*Math.min(1,dt*.8);if(((e.t*1.25)%1)<dt*1.25)e.vy-=16;e.vy+=(7-e.vy)*Math.min(1,dt*1.1);e.y+=e.vy*dt;
      if(e.y<TOP+8){e.y=TOP+8;e.vy=Math.abs(e.vy)}if(e.y>BOT-8){e.y=BOT-8;e.vy=-Math.abs(e.vy)}return}
    e.x+=e.vx*dt;const a=e.t*2+e.ph;e.y=e.y0+Math.sin(a)*e.amp;e.vy=Math.cos(a)*e.amp*2;
    if(live&&e.x<W-30&&e.x>70&&(e.shootT-=dt)<=0){e.shootT=rnd(2.4,4.2);if(canFire()){sfxEnemyLaser();ebAim(e.x-8,e.y,(big?74:68)+G.loop*6,0,{sty:'bolt'})}}}}
  function rayInit(big){return function(e,o){e.mini=!!o.mini;
    if(e.mini){e.w=9;e.h=9;e.hp=e.mhp=loopScale();e.pts=60;e.vx=-32;e.vy=0;return}
    e.amp=big?20:26;e.y0=Math.max(TOP+14+e.amp,Math.min(BOT-14-e.amp,e.y));e.y=e.y0+Math.sin(e.t*2+e.ph)*e.amp}}
  function rayDraw(big){return function(c,e,f){
    if(e.mini||(e.mini==null&&e.spr===2)){const s=(f?MINIW:MINI)[Math.floor(((e.t*1.25)%1)*4)%4];c.drawImage(s,(e.x-6)|0,(e.y-5)|0);return}
    const A=big?(f?RAYBW:RAYB):(f?RAYW:RAY),s=A[Math.floor(e.t*8)%4];c.drawImage(s,(e.x-s.width/2)|0,(e.y-s.height/2)|0);
    if(f||((e.t*3+e.ph)%2)>.55)return;
    for(const o of E){if(o===e||o.mini||(o.fr!=='ring'&&o.fr!=='ringR')||o.x<=e.x)continue;const dx=o.x-e.x,dy=o.y-e.y;if(dx*dx+dy*dy>52*52)continue;zap(c,e.x+4,e.y,o.x-4,o.y);break}}}
  const enemies={
    cross:{w:15,h:15,pts:220,
      init(e,o){e.amp=rnd(22,34);e.ph=o.ph||rnd(0,TAU);e.y0=Math.max(TOP+16+e.amp,Math.min(BOT-16-e.amp,e.y));e.y=e.y0+Math.sin(e.t*1.5+e.ph)*e.amp},
      move(e,dt,live){const a=e.t*1.5+e.ph;e.vx=-46-Math.cos(a*2)*14;e.x+=e.vx*dt;e.y=e.y0+Math.sin(a)*e.amp;e.vy=Math.cos(a)*e.amp*1.5;
        if(live&&e.x<W-20&&e.x>80&&(e.shootT-=dt)<=0){e.shootT=rnd(1.8,3);if(canFire()){sfxEnemyLaser();ebAim(e.x-5,e.y,66+G.loop*6,rnd(-.06,.06),{sty:'spark'})}}},
      draw(c,e,f){const s=(f?CROSSW:CROSS)[Math.floor(e.t*12)%6];c.drawImage(s,(e.x-11)|0,(e.y-11)|0)}},
    ring:{w:15,h:9,init:rayInit(false),move:rayMove(false),draw:rayDraw(false)},
    ringR:{w:24,h:14,pts:180,init:rayInit(true),move:rayMove(true),draw:rayDraw(true)},
    dart:{
      init(e,o){e.variant=o.variant!=null?o.variant:0;e.trk=.9;if(e.variant===1){e.w=12;e.h=8;e.pts=80}},
      move(e,dt,live){
        if(e.launch>0){e.launch-=dt;e.x+=e.vx*dt;e.vy=46;e.y+=e.vy*dt;if(e.launch<=0){e.vy=0;e.trk=.7}return}
        const tv=e.variant?-105:-120;e.vx+=(tv-e.vx)*Math.min(1,dt*3);e.x+=e.vx*dt;
        if(e.trk>0&&live){e.trk-=dt;const d=Math.sign(P.y-e.y)*Math.min(Math.abs(P.y-e.y),30*dt);e.y+=d;e.vy=d/dt}else e.vy=0},
      draw(c,e,f){const v=e.variant!=null?e.variant:e.spr%2,A=v?(f?DART1W:DART1):(f?DART0W:DART0),s=A[Math.floor(e.t*10)%2],x=(e.x-s.width/2)|0,y=(e.y-s.height/2)|0;
        if(!f){const n=v?5:8,cy=y+(s.height>>1);for(let k=0;k<n;k++){if(k>1&&Math.random()<.3)continue;c.fillStyle=k<2?'#ffffff':k<4?'#ffffaa':k<6?'#ff9966':'#ff77ff';c.fillRect(x+s.width+k-1,cy,1,k<3?1:1)}}
        c.drawImage(s,x,y)}},
    pod:{
      init(e,o){e.variant=o.variant!=null?o.variant:(Math.random()<.6?0:1);
        if(e.variant===0){e.w=22;e.h=20;e.hp=e.mhp=6*loopScale();e.pts=350;e.vx=-19}
        else{e.w=32;e.h=16;e.hp=e.mhp=8*loopScale();e.pts=450;e.vx=-17;e.bayT=rnd(1.2,2.2);e.bay=0}
        e.y0=Math.max(TOP+26,Math.min(BOT-34,e.y));e.y=e.variant?e.y0+Math.sin(e.t*.9)*8:e.y0;e.shootT=rnd(1.5,2.5)},
      move(e,dt,live){
        e.x+=e.vx*dt;
        if(e.variant===0){const cyc=(e.t*.7+e.ph)%1;e.vy=(cyc<.3?-20:9)+(e.y0-e.y)*.5;e.y+=e.vy*dt;
          if(live&&e.x<W-24&&e.x>90&&(e.shootT-=dt)<=0){e.shootT=rnd(2.8,3.6);sfxEnemyLaser();for(let k=-2;k<=2;k++){if(!canFire())break;ebAim(e.x-4,e.y+2,36+G.loop*3,k*.26,{sty:'spore'})}}
          return}
        const ny=e.y0+Math.sin(e.t*.9)*8;e.vy=(ny-e.y)/dt;e.y=ny;
        if(e.bay>0)e.bay-=dt;
        if(live&&e.x<W-30&&e.x>100){e.bayT-=dt;if(e.bayT<=0){e.bayT=rnd(3.4,4.4);e.bay=1.3;e.baySp=0}}
        if(live&&e.bay>0&&e.bay<.9&&!e.baySp){e.baySp=1;let n=0;for(const o of E)if(o.owner===e)n++;
          if(n<3){const d=spawn({type:'dart',y:e.y+10,variant:1});d.x=e.x-2;d.y=e.y+10;d.owner=e;d.launch=.4;d.vx=e.vx}}
        if(live&&e.x<W-24&&e.x>90&&(e.shootT-=dt)<=0){e.shootT=rnd(2.6,3.4);sfxEnemyLaser();for(let k=-1;k<=1;k+=2)if(canFire())ebAim(e.x-14,e.y-1,56+G.loop*5,k*.1,{sty:'shell'})}},
      draw(c,e,f){const v=e.variant!=null?e.variant:e.spr%2;
        if(v===0){const s=(f?JELLYW:JELLY)[Math.floor(((e.t*.7+(e.ph||0))%1)*6)%6];c.drawImage(s,(e.x-16)|0,(e.y-11)|0);return}
        const b=e.bay||0,st=b>1.1?1:b>.2?2:b>0?1:0,s=(f?CARW:CAR)[st*2+(Math.floor(e.t*12)%2)];
        if(!f)for(let k=0;k<3;k++){const ag=(e.t*1.8+k/3)%1,p=PUFF[ag<.4?0:1];c.drawImage(p,(e.x+18+ag*14)|0,(e.y-2+Math.sin(ag*6+k)*1.5)|0)}
        c.drawImage(s,(e.x-19)|0,(e.y-10)|0)},
      onKill(e){if(e.variant===1)return;const n=2+(Math.random()<.5?1:0);
        for(let k=0;k<n;k++){const m=spawn({type:'ring',y:e.y,mini:1});m.x=e.x+rnd(-5,5);m.y=e.y+rnd(-6,6);m.vx=rnd(-46,-22);m.vy=rnd(-35,35)}}},
    rock:{
      draw(c,e,f){let s;
        if(e.big){const k=e.spr%2,lit=((e.t*1.1+k*.37)%1)<.08,A=f?KNOTW[k]:KNOT[k];s=lit?A[4+(Math.floor(e.t*20)%2)]:A[Math.floor(e.t*5)%4]}
        else if(e.spr%3===2)s=(f?HAILW:HAIL)[Math.floor(e.t*8)%4];
        else{const A=(f?THSW:THS)[e.spr%2],cy=(e.t*.9+e.spr*.41)%1;s=A[cy<.05?3:cy<.1?2:cy<.14?3:Math.floor(e.t*3)%2]}
        c.drawImage(s,(e.x-s.width/2)|0,(e.y-s.height/2)|0)}}
  };

  /* ---------- enemy bullet styles (all with black outlines so they read on the pastel sky) ---------- */
  const bullets={
    spark(c,b){const x=b.x|0,y=b.y|0,f=Math.floor(b.t*18)%3;
      c.fillStyle='#000000';c.fillRect(x-1,y-3,3,7);c.fillRect(x-3,y-1,7,3);c.fillRect(x-2,y-2,5,5);
      c.fillStyle=f===0?'#9ad2e0':f===1?'#ffffff':'#cc99ff';c.fillRect(x,y-2,1,5);c.fillRect(x-2,y,5,1);
      c.fillStyle='#ffffff';c.fillRect(x-1,y-1,3,3);c.fillStyle='#ff77ff';c.fillRect(x,y,1,1)},
    bolt(c,b){const sp=Math.hypot(b.vx,b.vy)||1,ux=b.vx/sp,uy=b.vy/sp,f=Math.floor(b.t*16)&1;
      c.fillStyle='#000000';for(let k=0;k<4;k++)c.fillRect((b.x-ux*k*2-1.5)|0,(b.y-uy*k*2-1.5)|0,4,4);
      for(let k=0;k<4;k++){const o=((k+f)&1?.8:-.8);c.fillStyle=k===0?'#ffffff':k<3?'#ffffaa':'#b8c76f';c.fillRect((b.x-ux*k*2-uy*o)|0,(b.y-uy*k*2+ux*o)|0,k===0?2:1,k===0?2:1)}},
    spore(c,b){const x=b.x|0,y=b.y|0,p=Math.floor(b.t*6)&1;
      c.fillStyle='#000000';c.fillRect(x-2,y-3,5,7);c.fillRect(x-3,y-2,7,5);
      c.fillStyle=p?'#ff77ff':'#cc44cc';c.fillRect(x-2,y-2,5,5);c.fillStyle='#ffaaaa';c.fillRect(x-1,y-1,3,3);c.fillStyle='#ffffff';c.fillRect(x-1,y-1,2,1)},
    shell(c,b){const x=b.x|0,y=b.y|0;
      c.fillStyle='#000000';c.fillRect(x-2,y-3,5,7);c.fillRect(x-3,y-2,7,5);
      c.fillStyle='#9a3a3a';c.fillRect(x-2,y-2,5,5);c.fillStyle=Math.floor(b.t*12)&1?'#ffffff':'#ff7777';c.fillRect(x-1,y-1,3,3);c.fillStyle='#ffffff';c.fillRect(x,y,1,1)},
    orb(c,b){const x=b.x|0,y=b.y|0;
      c.fillStyle='#000000';c.fillRect(x-2,y-3,5,7);c.fillRect(x-3,y-2,7,5);
      c.fillStyle='#352879';c.fillRect(x-2,y-2,5,5);c.fillStyle=Math.floor(b.t*10)&1?'#9ad2e0':'#70a4b2';c.fillRect(x-1,y-2,3,5);c.fillRect(x-2,y-1,5,3);c.fillStyle='#ffffff';c.fillRect(x-1,y-1,2,2)},
    arc(c,b){const p=b.prev;if(p&&!p.dead&&Math.abs(p.x-b.x)+Math.abs(p.y-b.y)<30)zap(c,b.x,b.y,p.x,p.y);
      const x=b.x|0,y=b.y|0;c.fillStyle='#000000';c.fillRect(x-2,y-2,5,5);c.fillStyle=Math.floor(b.t*20)&1?'#ffffaa':'#ffffff';c.fillRect(x-1,y-1,3,3)},
    beam(c,b){const x=b.x|0,y=b.y|0,f=Math.floor(b.t*20)&1;
      c.fillStyle='#000000';c.fillRect(x-7,y-3,15,7);c.fillStyle=f?'#cc44cc':'#ff77ff';c.fillRect(x-6,y-2,13,5);c.fillStyle='#ffffff';c.fillRect(x-5,y-1,12,3)}
  };

  /* ---------- boss: the Sky Fortress ---------- */
  const boss={w:136,h:84,hp:1.7,
    init(b){b.x=W+80;b.y=100;b.vx=-55;b.in=true;b.tA=1.2;b.burst=0;b.bt=0;b.tur=0;b.tS=2.5;b.spN=0;b.spT=0;b.spA=0;b.tB=1.5;b.bayOpen=0;b.baySp=1;
      b.tArc=2;b.arcTel=0;b.arcN=0;b.arcT=0;b.arcD=1;b.prev=null;b.tCan=2.5;b.charge=0;b.lockY=100;b.fireN=0;b.fireT=0;b.t0=0;
      b.hitTest=(e,x,y)=>fortHit(e,x,y)?1:0;
      b.touch=(e,px,py)=>fortHit(e,px+16,py)||fortHit(e,px+6,py-8)||fortHit(e,px+6,py+8)},
    update(b,dt,live){
      if(b.in){b.x+=b.vx*dt;b.vy=0;if(b.x<=246){b.x=246;b.in=false;b.vx=0;b.t0=b.t}return}
      const f=b.hp/b.mhp,ph=f>.66?1:f>.33?2:3;b.phase=ph;
      let ty=100+Math.sin((b.t-b.t0)*.55)*(ph===3?28:22);
      if(b.charge>0||b.fireN>0)ty=b.lockY-3.5;
      ty=Math.max(74,Math.min(128,ty));
      const ny=b.y+(ty-b.y)*Math.min(1,dt*(b.charge>0?2.5:1.4)),nx=244+Math.sin((b.t-b.t0)*.4)*5;
      b.vy=(ny-b.y)/dt;b.vx=(nx-b.x)/dt;b.y=ny;b.x=nx;
      if(b.bayOpen>0)b.bayOpen-=dt;
      bossWear(b,live,0,0,62,30);
      if(!live)return;
      const sp=66+G.loop*5;
      // turret rings: aimed bursts, alternating rings
      b.tA-=dt;if(b.tA<=0){b.tA=ph===1?1.15:ph===2?1.7:1.4;b.burst=ph===3?4:3;b.bt=0;b.tur^=1}
      if(b.burst>0&&(b.bt-=dt)<=0){b.bt=.14;b.burst--;const T=TUR[b.tur];if(canFire()){sfxEnemyLaser();ebAim(b.x+T[0]-OX-6,b.y+T[1]-OY,sp,rnd(-.05,.05),{sty:'shell'})}}
      // slow spirals from the dome (phases 1 and 3)
      if(ph!==2){b.tS-=dt;if(b.tS<=0){b.tS=ph===1?2.8:2;b.spN=ph===1?7:10;b.spT=0}}
      if(b.spN>0&&(b.spT-=dt)<=0){b.spT=.13;b.spN--;b.spA+=.5;const v=40+G.loop*3;
        for(let k=0;k<3;k++){const a=b.spA+k*TAU/3;if(Math.cos(a)>-.2)continue;if(!canFire())break;ebShot(b.x-6,b.y-18,Math.cos(a)*v,Math.sin(a)*v,{sty:'orb'})}}
      // launch bays release fighters (phases 2 and 3), at most 3 alive
      if(ph>=2){b.tB-=dt;if(b.tB<=0){b.tB=ph===2?4.2:5.6;b.bayOpen=1.6;b.baySp=0}
        if(b.bayOpen>0&&b.bayOpen<1.1&&!b.baySp){b.baySp=1;let n=0;for(const e of E)if(e.owner===b)n++;
          for(const q of BAYS){if(n>=4)break;const d=spawn({type:'dart',y:b.y+q[1]-OY+3,variant:1});d.x=b.x+q[0]-OX+6;d.y=b.y+q[1]-OY+3;d.owner=b;d.launch=.45;d.vx=-25;n++}}}
      // sweeping lightning arc over the ship's half of the screen (phases 2 and 3)
      if(ph>=2&&b.arcN<=0&&b.arcTel<=0&&b.charge<=0&&b.fireN<=0){b.tArc-=dt;if(b.tArc<=0){b.tArc=ph===2?4.6:6.4;b.arcTel=.9;b.arcD=P.y<b.y-20?-1:1}}
      if(b.arcTel>0){b.arcTel-=dt;if(b.arcTel<=0){b.arcN=13;b.arcT=0;b.prev=null}}
      if(b.arcN>0&&(b.arcT-=dt)<=0){b.arcT=.09;const i=13-b.arcN;b.arcN--;
        const a=Math.PI-b.arcD*(.85-i/12*.73);
        if(EB.length<26){const s=ebShot(b.x-26,b.y-20,Math.cos(a)*112,Math.sin(a)*112,{sty:'arc',hw:1,hh:1});s.prev=b.prev;b.prev=s}
        if(i===0)sfxEnemyLaser()}
      // main cannon (phase 3): 1.5 s charge with an aim line, then a straight beam
      if(ph===3&&b.charge<=0&&b.fireN<=0&&b.arcN<=0&&b.arcTel<=0){b.tCan-=dt;if(b.tCan<=0){b.tCan=5;b.charge=1.5;b.lockY=Math.max(TOP+40,Math.min(BOT-40,P.y))}}
      if(b.charge>0){b.charge-=dt;if(b.charge<=0){b.fireN=8;b.fireT=0;shake=Math.max(shake,.15)}}
      if(b.fireN>0&&(b.fireT-=dt)<=0){b.fireT=.045;b.fireN--;ebShot(b.x-OX+1,b.y+3.5,-150-G.loop*4,0,{sty:'beam',hw:2,hh:2,pierce:true});if(b.fireN===7)sfxEnemyLaser()}
    },
    draw(c,b,flash){
      const st=b.hp>b.mhp*.66?0:b.hp>b.mhp*.33?1:2,X=Math.round(b.x-OX),Y=Math.round(b.y-OY),t=b.t;
      if(flash){c.drawImage(FORTW[st],X,Y);return}
      // gas venting from the keel engine and the rear nozzle, behind the hull
      for(let k=0;k<4;k++){const ag=(t*1.3+k/4)%1,p=PUFF[ag<.3?0:ag<.7?1:2];c.drawImage(p,(X+80+Math.sin(ag*6+k)*3-ag*8-p.width/2)|0,(Y+99+ag*14-p.height/2)|0)}
      for(let k=0;k<4;k++){const ag=(t*1.6+k/4)%1,p=PUFF[ag<.35?0:ag<.7?1:2];c.drawImage(p,(X+150+ag*16-p.width/2)|0,(Y+61-ag*8+Math.sin(ag*7+k)*2-p.height/2)|0)}
      c.drawImage(FORT[st],X,Y);
      // turret rings rotating, barrels aimed at the ship
      const fr=Math.floor(t*9)%6;
      for(let i=0;i<2;i++){const T=TUR[i],tx=X+T[0],ty=Y+T[1],a=Math.atan2(P.y-ty,P.x-tx);c.drawImage(TURF[fr],tx-7,ty-4);
        c.fillStyle='#000000';for(let k=2;k<9;k++)c.fillRect(((tx+Math.cos(a)*k)|0)-1,((ty+Math.sin(a)*k*.7)|0)-1,4,4);for(let k=2;k<9;k++){c.fillStyle=k>7?'#ffffff':(k&1)?'#d8a878':'#ffffaa';c.fillRect((tx+Math.cos(a)*k)|0,(ty+Math.sin(a)*k*.7)|0,2,2)}}
      // beacon, spire lights, landing lights chasing along the rim
      c.fillStyle=Math.floor(t*3)%2?'#ff7777':'#ffffff';c.fillRect(X+78,Y+2,3,2);
      for(let i=0;i<SPIRES.length;i++){if((Math.floor(t*2.5)+i)%3)continue;const s=SPIRES[i];c.fillStyle='#ff7777';c.fillRect(X+s[0],Y+s[1]-1,2,1)}
      {const k=Math.floor(t*12)%8;c.fillStyle='#ffffaa';for(let x=10+k*2;x<140;x+=16)c.fillRect(X+x,Y+65,2,1)}
      // launch bays open
      if(b.bayOpen>0){const o=b.bayOpen>1.35||b.bayOpen<.25?1:2;for(const q of BAYS){const bx=X+q[0],by=Y+q[1];c.fillStyle='#000000';c.fillRect(bx,by,12,6);
        c.fillStyle=Math.floor(t*10)%2?'#ff9966':'#ffffaa';c.fillRect(bx+2,by+1,8,o===2?4:2);if(o===2){c.fillStyle='#6c5eb5';c.fillRect(bx-1,by+6,3,2);c.fillRect(bx+10,by+6,3,2)}}}
      // fires at damage stages
      const F=FIRES[st];for(let i=0;i<F.length;i++){const q=F[i];c.drawImage(FIRE[(Math.floor(t*10)+i)%4],X+q[0]-3,Y+q[1]-10)}
      // failing shield crackle
      if(st===2&&Math.floor(t*7)%4===0){for(let k=0;k<6;k++){const a=-Math.random()*Math.PI,r=.5+Math.random()*.45;c.fillStyle=k&1?'#ffffff':'#9ad2e0';c.fillRect((X+79+Math.cos(a)*31*r)|0,(Y+57+Math.sin(a)*30*r)|0,2,1)}}
      // arc beam telegraph: sparks at the dome emitter and a dotted preview
      if(b.arcTel>0){const ex=X+49,ey=Y+40;for(let k=0;k<6;k++){c.fillStyle=k&1?'#ffffff':'#9ad2e0';c.fillRect((ex+rnd(-5,5))|0,(ey+rnd(-5,5))|0,2,1)}
        const a=Math.PI-b.arcD*.85;for(let k=6;k<46;k+=4){c.fillStyle=((Math.floor(t*12)+k/4)&1)?'#ffffff':'#352879';c.fillRect((ex+Math.cos(a)*k)|0,(ey+Math.sin(a)*k)|0,2,2)}}
      // main cannon: growing glow and a blinking aim line
      if(b.charge>0){const g=1-b.charge/1.5,mx=X+1,my=Math.round(b.y+3.5),r=(1+g*6)|0;
        c.fillStyle=pat('#ff77ff');c.fillRect(mx-r,my-r,r*2+1,r*2+1);c.fillStyle='#ffffff';c.fillRect(mx-(r>>1),my-(r>>1),(r>>1)*2+1,(r>>1)*2+1);
        const bl=Math.floor(t*(6+g*14))%2,o=Math.floor(t*60)%6;
        for(let x=mx-8-o;x>0;x-=6){c.fillStyle='#000000';c.fillRect(x-1,my-1,5,3);c.fillStyle=bl?'#ff7777':'#ffffff';c.fillRect(x,my,3,1)}}
    }
  };
  return {drawBackground,drawMidground,drawForeground,noFG:true,enemies,bullets,boss};
},
script(sc,h){
  const L=h.level;
  // shared pods become a mix of jellyfish and carriers; drop the crowded shared pod at 50 s
  let k=0;for(let i=sc.length-1;i>=0;i--){const s=sc[i];if(s.type==='pod'&&s.variant==null){if(s.t===50){sc.splice(i,1);continue}s.variant=(k++%3===1)?1:0}}
  h.add(5,'ring',4,.5,60,0);
  h.add(8,'ringR',2,1.2,140,-60);
  h.add(19,'pod',1,0,64,0,{variant:0});
  h.add(31,'pod',1,0,118,0,{variant:1});      // carrier event 1
  h.vwave(40,'dart',5,96);
  h.add(46,'ring',6,.45,124,0,{ph:1});
  h.add(53,'rock',4,.9,0,0,{rand:1});
  h.add(57,'pod',1,0,136,0,{variant:0});
  h.add(63,'pod',1,0,70,0,{variant:1});       // carrier event 2
  h.add(68,'ringR',3,.9,60,40);
  h.add(77,'cross',4,.8,0,0,{rand:1});
  if(L>=2){h.add(36,'ringR',2,1,50,90);h.add(72,'pod',1,0,110,0,{variant:0})}
  if(L>=3){h.add(48,'pod',1,0,90,0,{variant:1});h.vwave(81,'dart',5,120)}
}
};
})();
Object.assign(PLANETS[4],{d:'STORM BANDS AND CLOUD CITIES. RAYS, JELLIES, CARRIERS.',every:10,waves:[['cross',2,1],['ring',4,.45]]});
