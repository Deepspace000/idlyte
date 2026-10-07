/* ASTEROID BELT art pack (planet 1): deep purple glitter.
   Terrain: tumbling ore-vein rock fields, mining wreckage, dust clouds that hide enemies, sparkling rock ridges.
   Enemies: miner drones (ring, ringR), pirate skiffs (dart), rock crabs (cross), ore haulers (pod).
   Boss: the rock-eating space worm. */
(function(){
/* ---------- little helpers ---------- */
const BG0='#04020f';
const px=(g,col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x|0,y|0,w||1,h||1)};
const cnv=(w,h,fn)=>{const c=mk(w,h),g=c.getContext('2d');fn(g,c);return c};
function rng(seed){let s=(seed>>>0)||1;return()=>(s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff}
function mkNoise(seed){
  const H=(x,y)=>{let h=(x*374761393+y*668265263+seed*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return(((h^(h>>>16))>>>0)%100000)/100000};
  const S=t=>t*t*(3-2*t);
  const vn=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=S(x-ix),fy=S(y-iy),a=H(ix,iy),b=H(ix+1,iy),c=H(ix,iy+1),d=H(ix+1,iy+1);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy};
  const fbm=(x,y,o)=>{o=o||3;let v=0,a=.5,f=1,t=0;for(let i=0;i<o;i++){v+=vn(x*f,y*f)*a;t+=a;a*=.5;f*=2}return v/t};
  return{vn,fbm,H};
}
/* a shaded ellipsoid lit from the upper left, dithered between the ramp colours (ramp runs dark to light) */
function ell(g,cx,cy,rx,ry,ramp,o){
  o=o||{};const n=ramp.length,lx=o.lx==null?-.5:o.lx,ly=o.ly==null?-.55:o.ly,lz=o.lz==null?.7:o.lz;
  for(let j=Math.floor(cy-ry-1);j<=Math.ceil(cy+ry+1);j++)for(let i=Math.floor(cx-rx-1);i<=Math.ceil(cx+rx+1);i++){
    const nx=(i+.5-cx)/rx,ny=(j+.5-cy)/ry,d=nx*nx+ny*ny;if(d>1)continue;
    const nz=Math.sqrt(1-d),l=lx*nx+ly*ny+lz*nz,t=Math.max(0,Math.min(.999,(l+.15)/1.05))*(n-1),k=Math.floor(t),f=t-k;
    px(g,ramp[f>BAYER[j&3][i&3]/16&&k<n-1?k+1:k],i,j)}
}
/* black outline around everything opaque (adds one pixel on every side) */
function outline(c,col){
  const w=c.width,h=c.height,o=mk(w+2,h+2),g=o.getContext('2d'),d=c.getContext('2d').getImageData(0,0,w,h).data;
  const op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>40;
  g.fillStyle=col||'#000000';
  for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){if(op(x,y))continue;if(op(x-1,y)||op(x+1,y)||op(x,y-1)||op(x,y+1))g.fillRect(x+1,y+1,1,1)}
  g.drawImage(c,1,1);return o;
}
const fin=c=>outline(polish(c),'#07041a');
const darken=(c,a)=>{const o=mk(c.width,c.height),g=o.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(4,2,15,'+a+')';g.fillRect(0,0,c.width,c.height);return o};
const mod=(a,n)=>((a%n)+n)%n;

/* ---------- rocks: tumbling, with glittering ore veins ---------- */
const ROCKPAL=['#12092e','#2a1d52','#4a2f86','#6f3d86','#8a5aa6','#cc99ff'];
const VEIN=['#ff77ff','#9ad2e0','#ffffaa','#cc99ff','#ffffff'];
function rockImg(R,seed,ang,pal,veins){
  const S=Math.ceil(R*2+3),c=mk(S,S),g=c.getContext('2d'),cx=(S-1)/2,cy=(S-1)/2,n=mkNoise(seed),rg=rng(seed*7+1),N=9,prof=[],glints=[];
  for(let i=0;i<N;i++)prof.push(R*(.78+rg()*.34));
  const ca=Math.cos(ang),sa=Math.sin(ang);
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){
    const dx=i-cx,dy=j-cy,d=Math.hypot(dx,dy),bu=dx*ca+dy*sa,bv=-dx*sa+dy*ca;
    const a=(Math.atan2(bv,bu)+Math.PI)/(Math.PI*2)*N,k=Math.floor(a)%N,f=a-Math.floor(a),rr=prof[k]*(1-f)+prof[(k+1)%N]*f;
    if(d>rr)continue;
    const nx=dx/rr,ny=dy/rr,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),tex=n.fbm(bu*.3+seed,bv*.3,3);
    let l=-.55*nx-.5*ny+.65*nz+(tex-.5)*.8;if(d>rr-1.1)l-=.3;
    const vein=veins&&Math.abs(Math.sin(bu*.42+bv*.31+seed))<.075+(tex>.6?.05:0)&&d<rr-1.3;
    let col;
    if(vein){col=veins[mod((i+j)*7+seed,veins.length)];if(((i*3+j*5)&3)===0)glints.push([i+1,j+1])}
    else{const t=Math.max(0,Math.min(.999,(l+.2)/1.2))*(pal.length-1),k2=Math.floor(t),f2=t-k2;col=pal[f2>BAYER[j&3][i&3]/16&&k2<pal.length-1?k2+1:k2]}
    px(g,col,i,j);
  }
  return{c:outline(c,'#07041a'),glints};
}
function rockSet(R,seed,nf,pal,veins){
  const frames=[],white=[],glints=[];
  for(let f=0;f<nf;f++){const r=rockImg(R,seed,f/nf*Math.PI*2,pal,veins);frames.push(r.c);white.push(whiteOf(r.c));glints.push(r.glints)}
  return{frames,white,glints};
}

/* ---------- enemies ---------- */
const YEL=['#3a2018','#68372b','#9a6759','#b8c76f','#ffffaa'];
const ORG=['#3a2018','#68372b','#9a3a3a','#ff9966','#ffffaa'];
const STEEL=['#12092e','#352879','#6c5eb5','#9a8fe0','#ccd8ff'];
const SHELL=['#12092e','#2a1d52','#4a2f86','#8a5aa6','#cc99ff'];
const BONE=['#3a2a10','#6f4f25','#9a6759','#d8a878','#ffffaa'];

/* miner drone (ring): round yellow body, spinning drill, blinking lamp */
function minerFrame(f){
  return cnv(20,13,(g)=>{
    // drill cone, nose to the left, diagonal stripes that crawl with the frame
    for(let x=0;x<7;x++){const hh=1+x*.75;for(let y=-Math.ceil(hh);y<=Math.ceil(hh);y++){if(Math.abs(y)>hh)continue;px(g,((x+y+f)&3)<2?'#ffffff':'#6c6c6c',x,6+y)}}
    px(g,'#bbbbbb',0,6);
    ell(g,12,6.5,6.4,5.4,YEL);
    px(g,'#000000',9,3,1,7);px(g,'#68372b',9,3,1,7);               // collar seam
    for(let y=4;y<=9;y++)if((y&1)===0)px(g,'#000000',15,y,2,1);       // hazard slats
    px(g,'#70a4b2',12,5,3,3);px(g,'#ffffff',12,5,1,1);px(g,'#352879',14,7,1,1);   // cockpit glass
    px(g,f&1?'#ff7777':'#68372b',12,0,2,1);px(g,'#bbbbbb',12,1,2,1);   // antenna lamp
    px(g,f&2?'#ff9966':'#ffffaa',17,6,2,1);px(g,'#ff7777',18,7,1,1);   // exhaust
  });
}
/* foreman (ringR): bigger, orange plated, twin drills */
function foremanFrame(f){
  return cnv(26,17,(g)=>{
    for(const oy of [4,12]){for(let x=0;x<7;x++){const hh=.5+x*.55;for(let y=-Math.ceil(hh);y<=Math.ceil(hh);y++){if(Math.abs(y)>hh)continue;px(g,((x+y+f)&3)<2?'#ffffff':'#6c6c6c',x,oy+y)}}}
    ell(g,16,8.5,9,7.6,ORG);
    px(g,'#000000',10,2,1,13);
    for(let y=3;y<=14;y+=2)px(g,'#ffffaa',17,y,3,1);                    // warning stripes
    for(let y=3;y<=14;y+=2)px(g,'#000000',20,y,3,1);
    ell(g,12,8.5,3.4,3,['#12092e','#352879','#70a4b2','#ffffff']);     // big glass at the front
    px(g,'#000000',23,6,2,5);px(g,f&1?'#ff7777':'#9a3a3a',24,7,1,3);
    px(g,'#bbbbbb',16,0,3,1);px(g,f&2?'#ff7777':'#68372b',17,0,1,1);
    px(g,f&2?'#ff9966':'#ffffaa',24,8,2,1);
  });
}
/* pirate skiff (dart): sleek dark raider with magenta trim and patch plates, nose to the left */
function skiffFrame(f){
  return cnv(24,11,(g)=>{
    ell(g,13,5.5,10.5,3.9,SHELL);
    // swept wings
    for(let x=10;x<20;x++){const w=(x-9)*.45;for(let y=0;y<w;y++){px(g,SHELL[Math.min(4,1+((x+y)>>2)&3)],x,3-y-1+0);px(g,SHELL[1+((x+y)&1)],x,7+y)}}
    px(g,'#ff77ff',3,5,10,1);                                           // neon strip
    px(g,'#cc44cc',4,6,7,1);
    px(g,'#9a6759',9,3,3,2);px(g,'#68372b',9,5,3,1);px(g,'#9a6759',15,6,3,2);px(g,'#3a2018',15,8,3,1);   // rust patches
    px(g,'#ff7777',4,4,3,1);px(g,'#000000',5,4,1,1);                    // cockpit slit
    px(g,'#ffffff',2,5,1,1);                                            // nose glint
    px(g,f&1?'#ffffaa':'#ff9966',22,4,2,3);px(g,'#ff7777',23,5,1,1);px(g,f&2?'#ff9966':'#ffffff',21,5,1,1);   // flame
    px(g,f&1?'#ff77ff':'#cc44cc',12,9,2,1);px(g,f&1?'#ff77ff':'#cc44cc',12,1,2,1);
  });
}
/* rock crab (cross): rocky shell with ore glitter, snapping claws, scuttling legs */
function crabFrame(f){
  return cnv(21,19,(g)=>{
    const lg=f&1?1:0;
    // legs
    for(const s of [-1,1])for(let k=0;k<3;k++){const bx=9+k*3,by=9.5+s*5,ex=bx+((k+lg)&1?2:-1),ey=9.5+s*8.5;
      for(let t=0;t<=1;t+=.15)px(g,'#3a2a10',bx+(ex-bx)*t,by+(ey-by)*t);px(g,'#9a6759',ex,ey)}
    // claws
    const op=(f===1||f===2)?2:0;
    for(const s of [-1,1]){px(g,'#3a2a10',3,9.5+s*3,5,1);
      const cy=9.5+s*5;ell(g,3,cy,3,2.4,BONE);px(g,'#000000',0,cy+s*(op?0:-1),3,1);if(op){px(g,'#000000',1,cy-s*1,2,1)}
      px(g,'#ffffaa',0,cy-1,1,1)}
    // shell
    ell(g,12,9.5,7.6,7.2,SHELL);
    for(let i=0;i<7;i++){const a=i*.9+1,r=2+i*.7;const vx=12+Math.cos(a)*r,vy=9.5+Math.sin(a)*r*.9;px(g,VEIN[i%4],vx,vy)}
    px(g,'#ffffff',9,6,1,1);px(g,'#ff77ff',14,12,1,1);px(g,'#9ad2e0',11,13,1,1);
    // eyes on little stalks
    for(const s of [-1,1]){px(g,'#3a2a10',7,9.5+s*2,2,1);px(g,f===3?'#ffffff':'#ff9966',6,9.5+s*2,1,1);px(g,'#ff7777',6,9.5+s*2-(s>0?0:1),1,1)}
  });
}
/* ore hauler (pod): chunky cargo tug with a glittering ore bay, headlamp, warning stripes */
function haulerFrame(f){
  return cnv(32,19,(g)=>{
    // cab
    ell(g,8,10,6.4,5.4,STEEL);px(g,'#70a4b2',4,8,4,3);px(g,'#ffffff',4,8,1,1);px(g,'#352879',7,10,1,1);
    px(g,'#bbbbbb',0,9,2,2);px(g,f&1?'#ffffaa':'#b8c76f',0,10,1,1);                // headlamp
    if(f&1)px(g,'#ffffaa',0,6,1,1);
    // cargo frame
    px(g,'#12092e',13,3,17,13);px(g,'#352879',14,4,15,1);px(g,'#352879',14,15,15,1);
    for(let x=14;x<30;x+=3){px(g,'#6c5eb5',x,3,1,13)}
    // glowing ore inside the bay
    px(g,'#1c1840',15,5,13,10);
    for(let q=0;q<6;q++){const cx=16+q*2+((q*5)&1),cy=7+((q*7)%6),col=VEIN[(q+f)%4];px(g,col,cx,cy,2,2);px(g,'#ffffff',cx,cy,1,1)}
    px(g,'#ffffff',17+((f*5)%11),6+(f%3)*2,1,1);
    // hazard stripes on the hitch
    for(let x=10;x<14;x++)px(g,((x+f)&1)?'#ffffaa':'#000000',x,10,1,2);
    // belly rails and thruster
    px(g,'#6c5eb5',14,16,15,1);px(g,'#12092e',14,17,15,1);
    px(g,f&2?'#ff9966':'#ffffaa',30,8,2,3);px(g,'#ff7777',31,9,1,1);
    px(g,f&1?'#ff7777':'#68372b',9,4,1,1);
  });
}


/* ---------- more drawing helpers ---------- */
function line(g,col,x0,y0,x1,y1){x0|=0;y0|=0;x1|=0;y1|=0;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(;;){px(g,col,x0,y0);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function thick(g,col,x0,y0,x1,y1,th){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++){px(g,col,x0+(x1-x0)*i/n-th/2,y0+(y1-y0)*i/n-th/2,th,th)}}
const flipV=c=>{const o=mk(c.width,c.height),g=o.getContext('2d');g.translate(0,c.height);g.scale(1,-1);g.drawImage(c,0,0);return o};
function wrapNoise(nz,x,y,w,sx,sy,o){const a=nz.fbm(x*sx,y*sy,o),b=nz.fbm((x-w)*sx,y*sy,o),s=x/w;return a*(1-s)+b*s}
function tile(c,off,y){const w=c.width;let x=-mod(off,w);for(;x<W;x+=w)ctx.drawImage(c,x|0,y|0)}

/* ---------- background pieces ---------- */
const SKYR=['#04020f','#0a0620','#130b30','#1c1840','#2a1d52','#352879'];
function nebula(w,h,seed,sx,sy,thr,ramp){
  const nz=mkNoise(seed);
  return dithered(w,h,(x,y)=>{const dy=Math.abs(y-h/2)/(h/2),v=wrapNoise(nz,x,y,w,sx,sy,4)*(1-dy*dy*.85);return v<thr?-1:Math.min(.999,(v-thr)/(.6-thr))},ramp);
}
function geode(R,seed){
  const S=R*2+1,nz=mkNoise(seed),rg=rng(seed);
  const c=dithered(S,S,(x,y)=>{
    const dx=x-R,dy=y-R,d=Math.hypot(dx,dy);if(d>R)return -1;
    const nx=dx/R,ny=dy/R,nzz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),lit=Math.max(0,-nx*.78-ny*.38+nzz*.5);
    const band=nz.fbm(x*.05,y*.16+nx*1.4,3);
    return Math.max(0,Math.min(.999,Math.pow(lit,.95)*.78+band*.5*lit+(d>R-1.5?(lit>.25?.3:-.25):0)));
  },['#04020f','#12092e','#2a1d52','#4a2f86','#8a5aa6','#cc99ff']);
  const g=c.getContext('2d');
  for(let i=0;i<46;i++){const a=rg()*6.28,r=Math.sqrt(rg())*R*.9,x=R+Math.cos(a)*r,y=R+Math.sin(a)*r;if(x<R*.45){px(g,['#ffffff','#ff77ff','#9ad2e0','#ffffaa'][i&3],x,y)}}
  return c;
}
const RIDGE=['#07041a','#12092e','#1c1840','#2a1d52','#4a2f86','#8a5aa6'];
const RIDGE_FAR=['#04020f','#07041a','#0c0722','#130b30','#1c1840','#2a1d52'];
function ridge(w,h,seed,ramp,spark){
  const nz=mkNoise(seed),rg=rng(seed+3),c=mk(w,h),g=c.getContext('2d'),prof=[];
  for(let x=0;x<w;x++){const s=x/w,v=nz.fbm(x*.024,3.1,3)*(1-s)+nz.fbm((x-w)*.024,3.1,3)*s;prof.push(Math.min(h,Math.floor(h*(.2+v*1.0))))}
  for(let x=0;x<w;x++){
    const hg=prof[x];
    for(let y=0;y<hg;y++){
      const depth=hg-1-y,t=nz.vn(x*.16,y*.16);let k=depth<1?5:depth<3?4:depth<6?3:depth<11?2:depth<17?1:0;
      if(t>.64&&k>1&&depth>1)k--;else if(t<.28&&k<4&&depth>3)k++;
      px(g,ramp[k],x,y);
    }
    if(spark&&rg()<.07&&hg>7){px(g,spark[Math.floor(rg()*spark.length)],x,Math.floor(2+rg()*(hg-6)))}
  }
  return c;
}
function dustImg(w,h,seed){
  const nz=mkNoise(seed),c=mk(w,h),g=c.getContext('2d'),ramp=['#12092e','#1c1840','#2a1d52','#352879'];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const nx=(x-w/2)/(w/2),ny=(y-h/2)/(h/2),d=Math.hypot(nx,ny*1.35),v=nz.fbm(x*.075+seed,y*.11,3)*1.55-d*1.05;
    if(v<.1)continue;const op=Math.min(.86,.22+v*1.15);if(BAYER[y&3][x&3]/16>op)continue;
    px(g,ramp[Math.min(3,Math.floor(v*3.4))],x,y);
  }
  return c;
}

/* mining wreckage: dark silhouettes with rim light and a few blinking lamps */
function mkRig(){
  const g0=cnv(34,44,(g)=>{
    const D='#12092e',M='#1c1840',L='#2a1d52',R_='#4a2f86';
    line(g,L,7,43,14,16);line(g,L,26,43,19,16);line(g,M,8,43,15,16);line(g,M,25,43,18,16);
    line(g,R_,6,43,13,16);
    for(const yy of [22,28,34]){const a=7+(43-yy)*.2,b=27-(43-yy)*.2;line(g,M,a,yy,b,yy);line(g,L,a,yy+1,b,yy+4>43?43:yy+3)}
    px(g,L,7,16,20,3);px(g,R_,7,15,20,1);px(g,D,7,19,20,1);
    px(g,D,10,8,10,8);px(g,M,11,9,8,6);px(g,R_,10,8,10,1);px(g,'#ff9966',12,10,3,2);px(g,'#ffffaa',12,10,1,1);px(g,'#ff9966',16,10,2,2);
    px(g,L,16,0,2,8);px(g,R_,16,0,1,8);
    px(g,M,14,19,5,15);px(g,R_,14,19,1,15);px(g,'#6c6c6c',13,34,7,3);px(g,'#bbbbbb',14,37,5,2);px(g,'#6c6c6c',15,39,3,2);
    px(g,'#ff9966',3,31,2,1);line(g,L,4,31,8,28);
  });
  return{c:g0,lights:[[16,0,'#ff7777',2.2,0],[12,10,'#ffffaa',.9,1.7]]};
}
function mkPylon(){
  const c=cnv(14,52,(g)=>{
    const M='#1c1840',L='#2a1d52',R_='#4a2f86';
    px(g,L,6,6,3,46);px(g,R_,6,6,1,46);px(g,M,8,6,1,46);
    for(const [yy,w] of [[12,12],[22,9],[33,9],[44,13]]){px(g,L,7-w/2,yy,w,1);px(g,R_,7-w/2,yy,w,1);px(g,M,7-w/2,yy+1,w,1)}
    px(g,L,5,3,5,3);px(g,R_,5,3,5,1);px(g,'#ff7777',6,1,3,2);
    line(g,M,0,13,6,16);line(g,M,13,13,8,16);px(g,'#9ad2e0',1,13,1,1);px(g,'#9ad2e0',12,13,1,1);
  });
  return{c,lights:[[7,1,'#ff7777',1.6,.4],[1,13,'#9ad2e0',.7,0]]};
}
function mkPod(){
  const c=cnv(26,17,(g)=>{
    const D='#12092e',M='#1c1840',L='#2a1d52',R_='#4a2f86';
    px(g,D,2,3,22,12);px(g,M,3,4,20,10);px(g,L,3,4,20,1);px(g,R_,3,4,20,1);
    for(let x=3;x<23;x+=5){px(g,L,x,4,1,10);px(g,D,x+1,4,1,10)}
    for(let x=3;x<23;x++){px(g,((x>>1)&1)?'#ffffaa':'#12092e',x,12,1,2)}
    px(g,'#70a4b2',5,6,4,3);px(g,'#ffffff',5,6,1,1);px(g,M,18,3,5,3);px(g,D,19,4,3,2);
    px(g,L,0,6,2,5);px(g,L,24,6,2,5);px(g,R_,0,6,2,1);
  });
  return{c,lights:[[6,7,'#ffffff',.8,.3]]};
}
function mkArray(){
  const c=cnv(46,26,(g)=>{
    const D='#12092e',M='#1c1840',L='#2a1d52',R_='#4a2f86';
    px(g,L,22,10,3,16);px(g,R_,22,10,1,16);px(g,M,24,10,1,16);
    for(let k=0;k<3;k++){const x0=2+k*15;for(let y=0;y<14;y++){const sk=Math.floor((14-y)*.35);px(g,M,x0+sk,y,12,1)}
      for(let y=0;y<14;y+=3)for(let x=0;x<12;x+=3){px(g,'#352879',x0+x+Math.floor((14-y)*.35),y,1,1)}
      line(g,R_,x0+Math.floor(14*.35),0,x0+Math.floor(14*.35)+12,0);px(g,'#9ad2e0',x0+4+Math.floor((14-4)*.35),4,1,1)}
    px(g,L,6,13,34,1);
  });
  return{c,lights:[[23,10,'#ff9966',1.3,.9]]};
}
function mkTug(){
  const c=cnv(40,20,(g)=>{
    const D='#12092e',M='#1c1840',L='#2a1d52',R_='#4a2f86';
    for(let x=2;x<34;x++){const t=(x-2)/32,h=Math.round(3+Math.sin(t*Math.PI)*6);for(let y=-h;y<=h;y++){if(x>20&&y<-h+((x-20)>>1))continue;px(g,y>h-2?D:y<-h+1?R_:M,x,10+y)}}
    for(let x=6;x<32;x+=5){line(g,D,x,5,x,15)}
    px(g,D,22,2,10,4);px(g,D,24,0,2,3);px(g,'#ff9966',26,8,2,2);
    line(g,L,34,8,39,3);line(g,L,34,12,38,18);px(g,'#ffffaa',39,3,1,1);
    px(g,'#68372b',8,9,3,2);
  });
  return{c,lights:[[26,8,'#ff9966',1.1,.6],[39,3,'#ffffaa',2.8,.2]]};
}

/* ---------- the rock-eating space worm ---------- */
const SKIN=['#1c1008','#3a2a10','#6f4f25','#9a6759','#d8a878','#ffffaa'];
const SKIN2=['#2a1a0a','#4a3010','#8a5a30','#b87f58','#e8c090','#ffffcc'];
const BONEP=['#12092e','#352879','#6f3d86','#8a5aa6','#cc99ff'];
function segImg(r,seed,tail){
  const S=Math.ceil(r*2+4),rg=rng(seed);
  const c=cnv(S+(tail?10:0),S,(g)=>{
    const cx=S/2,cy=S/2;
    if(tail){for(let x=0;x<10;x++){const hh=Math.max(0,(10-x)*.55-.4);for(let y=-Math.ceil(hh);y<=Math.ceil(hh);y++){if(Math.abs(y)<=hh)px(g,y<0?SKIN[4]:SKIN[2],S-2+x,cy+y)}}}
    ell(g,cx,cy,r,r,SKIN);
    for(let a=0;a<6.2832;a+=.07){const rr=r*.62,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;if(BAYER[(y|0)&3][(x|0)&3]/16<.55)px(g,SKIN[1],x,y)}
    for(let i=0;i<4;i++){const a=rg()*6.28,rr=r*(.2+rg()*.55),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;px(g,VEIN[i%4],x,y);if(i&1)px(g,'#ffffff',x,y)}
    for(let i=0;i<3;i++){const a=rg()*6.28,rr=r*.78,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;ell(g,x,y,1.6,1.5,BONEP)}
  });
  return c;
}
function headImg(open){
  return cnv(48,40,(g)=>{
    const cx=29,cy=20,A=2.4+open*4.6;
    ell(g,cx+2,cy,15,13,SKIN);
    for(let i=0;i<5;i++){ell(g,cx-6+i*5,cy-13+(i>2?i-2:0),3.4,3,BONEP)}
    for(let i=0;i<4;i++){ell(g,cx-2+i*5,cy+13-(i>1?i-1:0),3,2.6,BONEP)}
    ell(g,cx-9,cy+1,10,9,SKIN);
    const hh=x=>{const t=(21-x)/19;return A*Math.pow(Math.max(0,Math.sin(Math.PI*Math.min(1,Math.max(0,t)))),.7)};
    // mouth: a curved lens that opens from the middle, throat glowing at the back
    for(let x=2;x<=21;x++){const h=hh(x);for(let y=-Math.ceil(h);y<=Math.ceil(h);y++){if(Math.abs(y)>h)continue;px(g,x>15?'#9a3a3a':'#3a0a14',x,cy+y)}if(h>1.5&&x>15)px(g,'#ff7777',x,cy,1,1)}
    // jaw plates along the curves, hooked at the tips
    for(let x=0;x<=22;x++){const h=hh(Math.min(21,Math.max(2,x))),tip=x<4?(4-x):0;
      for(let k=0;k<3;k++){px(g,[SKIN[5],SKIN[4],SKIN[2]][k],x,cy-h-1-k+tip*.8);px(g,[SKIN[3],SKIN[2],SKIN[1]][k],x,cy+h+1+k-tip*.8)}}
    // teeth along both edges and long hooked fangs at the tips
    for(let x=6;x<=19;x+=3){const h=hh(x);px(g,'#ffffff',x,cy-h,1,2);px(g,'#ffffff',x+1,cy+h-1,1,2)}
    px(g,'#ffffff',3,cy-2,1,3);px(g,'#ffffff',3,cy,1,3);px(g,'#ffffaa',2,cy-1,1,2);
    // nostrils and head rings
    px(g,'#3a2a10',cx-16,cy-5,2,2);
    for(let x=cx-4;x<=cx+14;x+=6)for(let y=cy-9;y<=cy+9;y++)if(BAYER[y&3][x&3]/16<.35)px(g,SKIN[1],x,y);
    // round glowing eye with a slit pupil, heavy brow
    for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){const d=(x*x+y*y)/10;if(d<=1)px(g,d>.7?'#3a0a14':'#ffcc33',cx-4+x,cy-8+y)}
    px(g,'#000000',cx-4,cy-10,1,5);px(g,'#ffffff',cx-6,cy-10,1,1);
    thick(g,'#12092e',cx-10,cy-12,cx+2,cy-9,2);thick(g,BONEP[3],cx-10,cy-13,cx+2,cy-10,1);
    for(let i=0;i<5;i++)px(g,VEIN[i%4],cx+5+i*3,cy-4+((i*5)%9));
  });
}
/* ---------- registration ---------- */
PACKS[1]={
  init(){
    const A={noFG:true,enemies:{},bullets:{}};
    const nz=mkNoise(41),rg=rng(77);
    /* rocks, the hazard */
    const rocks={big:[rockSet(9.5,3,12,ROCKPAL,VEIN),rockSet(10.5,11,12,ROCKPAL,VEIN)],small:[rockSet(4,5,8,ROCKPAL,VEIN),rockSet(4.5,9,8,ROCKPAL,VEIN),rockSet(4,17,8,ROCKPAL,VEIN)]};
    A.enemies.rock={
      init(e){e.sp=(Math.random()<.5?-1:1)*(.35+Math.random()*.9)},
      draw(c,e,f){
        const set=(e.big?rocks.big:rocks.small)[e.spr%(e.big?2:3)],n=set.frames.length,k=Math.floor(mod(e.t*(e.sp||1)*.8,1)*n),fr=f?set.white[k]:set.frames[k];
        const x=(e.x-fr.width/2)|0,y=(e.y-fr.height/2)|0;c.drawImage(fr,x,y);
        if(!f){const gl=set.glints[k];for(let q=0;q<gl.length;q++){if(((e.t*4+q*1.7)|0)%5===0)px(c,'#ffffff',x+gl[q][0],y+gl[q][1])}}
      }
    };
    /* the cast */
    const mn=[0,1,2,3].map(f=>fin(minerFrame(f)));A.enemies.ring={frames:mn,white:mn.map(whiteOf),fps:9,w:16,h:10};
    const fm=[0,1,2,3].map(f=>fin(foremanFrame(f)));A.enemies.ringR={frames:fm,white:fm.map(whiteOf),fps:8,w:21,h:13};
    const sk=[0,1,2,3].map(f=>fin(skiffFrame(f)));A.enemies.dart={frames:sk,white:sk.map(whiteOf),fps:12,w:18,h:9};
    const cb=[0,1,2,3].map(f=>fin(crabFrame(f)));A.enemies.cross={frames:cb,white:cb.map(whiteOf),fps:7,w:15,h:15,
      update(e,dt,live){if(live&&e.shootT<=0&&e.x<W-30){/* crabs also spit a shard now and then */}}};
    const hl=[0,1,2,3].map(f=>fin(haulerFrame(f)));A.enemies.pod={frames:hl,white:hl.map(whiteOf),fps:6,w:26,h:15,
      onKill(e){for(let i=0;i<3;i++)PK.push({k:'coin',x:e.x+rnd(-5,5),y:e.y+rnd(-5,5),vx:rnd(-30,10),vy:rnd(-25,25),t:Math.random()*4})}};

    /* backgrounds */
    const sky=dithered(320,200,(x,y)=>Math.min(.999,y/200*.78+(nz.fbm(x*.012,y*.02+5,3)-.5)*.2+.04),SKYR);
    const neb1=nebula(640,130,5,.012,.028,.4,['#12092e','#1c1840','#352879','#4a2f86','#6f3d86']);
    const neb2=nebula(520,110,19,.016,.034,.42,['#1c1840','#352879','#6f3d86','#8a5aa6','#cc99ff']);
    const planet=geode(40,23);
    const starDef=[[60,5,0],[44,12,1],[26,26,2]],stars=[];
    const SC=['#352879','#6c5eb5','#8a5aa6','#cc99ff','#ff77ff','#9ad2e0','#ffffff','#ffffaa'];
    for(const [n,sp,l] of starDef)for(let i=0;i<n;i++)stars.push({x:rg()*W,y:TOP+rg()*(BOT-TOP),sp,l,c:SC[Math.floor((l===0?rg()*3:l===1?2+rg()*4:3+rg()*5))]});
    const bgRocks=(n,rmin,rmax,pal,world,sp,seed0)=>{const out=[];const r2=rng(seed0);for(let i=0;i<n;i++){const R=rmin+r2()*(rmax-rmin);out.push({c:rockImg(R,seed0+i,r2()*6.28,pal,null).c,x:world*(i+r2()*.7)/n,y:TOP+14+r2()*(BOT-TOP-28),sp,world})}return out};
    const farRocks=bgRocks(13,4,8,RIDGE_FAR.slice(0,5).concat(['#352879']),680,8,100);
    const midRocks=bgRocks(7,9,16,['#07041a','#12092e','#1c1840','#2a1d52','#4a2f86','#6f3d86'],720,19,200);
    const deco=[mkRig(),mkPylon(),mkPod(),mkArray(),mkTug()];
    const decoFar=deco.map(d=>({c:darken(d.c,.55),lights:d.lights,dim:true}));
    const place=(arr,world,sp,seed,dim)=>{const r2=rng(seed),out=[];for(let i=0;i<arr.length*2;i++){const d=arr[i%arr.length];out.push({d,x:world*i/(arr.length*2)+r2()*60,y:TOP+8+r2()*(BOT-TOP-d.c.height-16),sp,world,ph:r2()*6})}return out};
    const decoFarList=place(decoFar,900,13,31,true),decoNearList=place(deco.slice(0,3).concat(deco.slice(4)),1100,27,57,false).filter((_,i)=>i%2===0);
    const ridgeFarT=ridge(640,34,8,RIDGE_FAR,null),ridgeFarB=flipV(ridge(640,34,9,RIDGE_FAR,null));
    const ridgeNearT=ridge(520,20,12,RIDGE,['#ff77ff','#9ad2e0','#ffffaa','#cc99ff']),ridgeNearB=flipV(ridge(520,18,13,RIDGE,['#ff77ff','#9ad2e0','#ffffaa','#cc99ff']));
    /* dust clouds hide enemies */
    const dust=[dustImg(120,58,3),dustImg(96,46,7),dustImg(140,64,11),dustImg(104,50,15)];
    const dustList=[];{const r2=rng(9);for(let i=0;i<6;i++)dustList.push({c:dust[i%4],x:880*i/6+r2()*70,y:46+r2()*98,sp:24+r2()*10,world:880})}
    /* glitter motes and near rock chunks in front */
    const motes=[];for(let i=0;i<42;i++)motes.push({x:rg()*W,y:TOP+4+rg()*(BOT-TOP-8),v:70+rg()*110,c:SC[3+Math.floor(rg()*5)],ph:rg()*9,big:rg()<.25});
    const chunks=[];{const r2=rng(21);for(let i=0;i<4;i++)chunks.push({c:darken(rockImg(15+r2()*8,60+i,r2()*6.28,ROCKPAL,VEIN).c,.3),x:600*i/4+r2()*90,y:i&1?TOP-12:BOT-18,sp:95+r2()*20,world:600})}

    const blink=(t,lamp)=>((t*lamp[3]+lamp[4])%1)<.45;
    A.drawBackground=function(t){
      ctx.drawImage(sky,0,0);
      tile(neb1,t*3,TOP+4);tile(neb2,t*7,TOP+60);
      for(const s of stars){const x=mod(s.x-t*s.sp,W);px(ctx,s.c,x,s.y);if(s.l===2&&(((t*1.3+s.x*.37)|0)%9===0)){px(ctx,'#ffffff',x-1,s.y);px(ctx,'#ffffff',x+1,s.y);px(ctx,'#ffffff',x,s.y-1);px(ctx,'#ffffff',x,s.y+1)}}
      {const x=380-t*3.1;if(x>-50&&x<W+50)ctx.drawImage(planet,(x-40)|0,62)}
      for(const r of farRocks){const x=mod(r.x-t*r.sp,r.world)-40;if(x<W)ctx.drawImage(r.c,x|0,r.y|0)}
      tile(ridgeFarT,t*10,TOP);tile(ridgeFarB,t*10+120,BOT-ridgeFarB.height);
      for(const o of decoFarList){const x=mod(o.x-t*o.sp,o.world)-50;if(x<W){ctx.drawImage(o.d.c,x|0,o.y|0);for(const l of o.d.lights)if(blink(t+o.ph,l))px(ctx,l[2],x+l[0],o.y+l[1])}}
      for(const r of midRocks){const x=mod(r.x-t*r.sp,r.world)-40;if(x<W)ctx.drawImage(r.c,x|0,r.y|0)}
      for(const o of decoNearList){const x=mod(o.x-t*o.sp,o.world)-50;if(x<W){ctx.drawImage(o.d.c,x|0,o.y|0);for(const l of o.d.lights)if(blink(t+o.ph,l))px(ctx,l[2],x+l[0],o.y+l[1])}}
      tile(ridgeNearT,t*34,TOP);tile(ridgeNearB,t*34+200,BOT-ridgeNearB.height);
    };
    A.drawMidground=function(t){for(const d of dustList){const x=mod(d.x-t*d.sp,d.world)-80;if(x<W&&x>-d.c.width)ctx.drawImage(d.c,x|0,d.y|0)}};
    A.drawForeground=function(t){
      for(const k of chunks){const x=mod(k.x-t*k.sp,k.world)-60;if(x<W)ctx.drawImage(k.c,x|0,k.y|0)}
      for(const m of motes){const x=mod(m.x-t*m.v,W),on=((t*2.2+m.ph)%1)<.7;if(on){px(ctx,m.c,x,m.y);if(m.big){px(ctx,m.c,x+1,m.y);px(ctx,m.c,x,m.y+1)}}}
    };

    /* enemy bullet styles */
    A.bullets.glob=(c,b)=>{const x=b.x|0,y=b.y|0,w=(b.t*12|0)&1;px(c,'#12092e',x-3,y-2,6,5);px(c,'#cc44cc',x-2,y-2,4,4);px(c,'#ff77ff',x-2,y-2,3,2);px(c,'#ffffff',x-2,y-2,1,1);px(c,w?'#9ad2e0':'#cc99ff',x+1,y+1,1,1);px(c,'#cc44cc',x-4,y,1,1)};
    A.bullets.shard=(c,b)=>{const x=b.x|0,y=b.y|0;px(c,'#12092e',x-3,y-1,7,3);px(c,'#d8a878',x-2,y-1,5,1);px(c,'#ffffaa',x-2,y-1,2,1);px(c,'#9a6759',x-1,y,5,1);px(c,'#ffffff',x+2,y,1,1)};

    /* ----- the boss ----- */
    const NSEG=13,SP=10;
    const segs=[],segW=[],segOx=[];for(let i=0;i<NSEG;i++){const r=12.2-i*.42,c=fin(segImg(r,100+i,i===NSEG-1));segs.push(c);segW.push(whiteOf(c));segOx.push(Math.ceil(r*2+4)/2+1)}
    const heads=[0,1,2].map(o=>fin(headImg(o))),headsW=heads.map(whiteOf);
    const radius=i=>12.2-i*.42+1;
    const pushTrail=b=>{
      let lx=b.last[0],ly=b.last[1],dx=b.x-lx,dy=b.y-ly,d=Math.hypot(dx,dy);
      while(d>=1.5){const k=1.5/d;lx+=dx*k;ly+=dy*k;b.tr.push([lx,ly]);dx=b.x-lx;dy=b.y-ly;d=Math.hypot(dx,dy)}
      b.last=[lx,ly];if(b.tr.length>700)b.tr.splice(0,b.tr.length-700);
    };
    const place_=b=>{
      b.seg=b.seg||[];
      for(let i=0;i<NSEG;i++){const k=Math.max(0,b.tr.length-1-Math.round((i+1)*SP/1.5)),p=b.tr[k]||[b.x,b.y];b.seg[i]=[p[0],p[1]]}
    };
    const refill=(b,x,y)=>{b.x=x;b.y=y;b.tr=[];for(let k=520;k>=0;k--)b.tr.push([x+k*1.5,y]);b.last=[x,y];place_(b)};
    const shoot=(b,ph)=>{
      const a0=Math.atan2(P.y-b.y,P.x-b.x),mx=b.x+Math.cos(a0)*20,my=b.y+Math.sin(a0)*20;
      const spread=ph===1?[-.3,0,.3]:[-.52,-.26,0,.26,.52];
      for(const s of spread)ebShot(mx,my,Math.cos(a0+s)*(ph===1?60:66),Math.sin(a0+s)*(ph===1?60:66),{sty:'glob'});
      if(ph===3){ebShot(mx,my,Math.cos(a0+.1)*98,Math.sin(a0+.1)*98,{sty:'shard'});ebShot(mx,my,Math.cos(a0-.1)*98,Math.sin(a0-.1)*98,{sty:'shard'})}
      sfxEnemyLaser();
    };
    A.boss={w:130,h:64,hp:1.45,
      init(b){
        b.in=true;b.state='enter';b.st=0;b.vx=0;b.vy=0;b.mouth=0;b.spitT=2;b.chargeT=8;b.face=Math.PI;
        refill(b,W+70,100);
        b.hitTest=(e,x,y)=>{
          if(Math.hypot(x-e.x,y-e.y)<17)return 1;
          for(let i=0;i<NSEG;i++){const s=e.seg[i];if(s&&Math.hypot(x-s[0],y-s[1])<radius(i)+1)return .4}
          return 0};
        b.touch=(e,px_,py_)=>{
          if(Math.hypot(px_-e.x,py_-e.y)<17+8)return true;
          for(let i=0;i<NSEG;i++){const s=e.seg[i];if(s&&Math.hypot(px_-s[0],py_-s[1])<radius(i)+6)return true}
          return false};
      },
      update(b,dt,live){
        const p=b.hp/b.mhp,ph=p>.66?1:p>.33?2:3;b.st+=dt;
        const want=Math.atan2(P.y-b.y,P.x-b.x);let df=want-b.face;df=Math.atan2(Math.sin(df),Math.cos(df));b.face+=df*Math.min(1,dt*5);
        if(b.state==='enter'){
          b.x-=115*dt;b.y+=((100+Math.sin(b.t*1.4)*38)-b.y)*Math.min(1,dt*3);
          if(b.x<=250){b.state='coil';b.st=0;b.in=false}
        }else if(b.state==='coil'||b.state==='tele'){
          const m=[0,1,1.14,1.32][ph],tt=b.t*m,tx=238+46*Math.sin(.72*tt+.6),ty=100+47*Math.sin(1.19*tt);
          b.vx+=((tx-b.x)*16-b.vx*6.5)*dt;b.vy+=((ty-b.y)*16-b.vy*6.5)*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
          if(b.state==='coil'){
            b.spitT-=dt;b.mouth=b.spitT<.45?2:(Math.sin(b.t*2.6)>.7?1:0);
            if(b.spitT<=0&&live){b.spitT=[0,2.1,1.7,1.25][ph];shoot(b,ph)}
            if(ph>=2){b.chargeT-=dt;if(b.chargeT<=0&&live){b.state='tele';b.st=0}}
          }else{
            b.mouth=2;b.x+=Math.sin(b.st*50)*.6;
            if(b.st>.9){b.state='pass';b.st=0;b.py=b.y;b.vx=-200}
          }
        }else if(b.state==='pass'){
          b.x+=b.vx*dt;b.y=b.py+Math.sin(b.st*3.6)*30;b.mouth=2;
          if(b.x<-100){b.state='gone';b.st=0;b.rain=0;b.chargeT=[0,0,7.5,5.6][ph]}
        }else if(b.state==='gone'){
          b.mouth=0;
          if(live){
            if(b.rain<1&&b.st>.1){b.rain=1;for(let i=0;i<3+ph;i++){const r=spawn({type:'rock',y:rnd(TOP+20,BOT-20)});r.x=W+12+i*24}}
            if(b.rain<2&&b.st>.8){b.rain=2;for(let i=0;i<3+ph;i++){const r=spawn({type:'rock',y:rnd(TOP+20,BOT-20)});r.x=W+12+i*24}}
          }
          let clear=b.st>.9;if(clear){for(let i=0;i<NSEG;i++){if(b.seg[i]&&b.seg[i][0]>-20){clear=false;break}}}
          if(clear||b.st>2.4){b.state='enter';b.st=0;refill(b,W+70,rnd(70,130))}
        }
        pushTrail(b);place_(b);
        bossWear(b,live,-20,0,70,26);
      },
      draw(c,b,f){
        for(let i=NSEG-1;i>=0;i--){const s=b.seg&&b.seg[i];if(!s)continue;const im=f?segW[i]:segs[i];c.drawImage(im,(s[0]-segOx[i])|0,(s[1]-im.height/2)|0)}
        const ro=Math.max(-1.0,Math.min(1.0,Math.atan2(Math.sin(b.face-Math.PI),Math.cos(b.face-Math.PI)))),hi=(f?headsW:heads)[b.mouth||0];
        c.save();c.translate(b.x|0,b.y|0);c.rotate(ro);c.drawImage(hi,-30,-hi.height/2|0);
        const p=b.hp/b.mhp;if(!f&&p<.4&&((b.t*8)|0)%2===0){c.fillStyle='#ff7777';c.fillRect(-7,-7,2,2)}
        if(b.state==='tele'&&((b.st*14)|0)%2===0&&!f){c.fillStyle='#ffffff';c.fillRect(-8,-8,5,5)}
        c.restore();
      },
      onKill(b){for(let i=0;i<NSEG;i++){const s=b.seg[i];if(s){boom(s[0],s[1],12,i<3);for(let k=0;k<5;k++)FX.push({x:s[0]+rnd(-6,6),y:s[1]+rnd(-6,6),vx:rnd(-40,40),vy:rnd(-50,20),life:1.1,l0:1.1,c:VEIN[k%4],s:2})}}}
    };
    return A;
  },
  script(sc,h){
    const L=h.level;
    h.add(20,'rock',8+L*3,.34,0,0,{rand:1});
    h.add(54,'rock',9+L*3,.3,0,0,{rand:1});
    h.add(33,'pod',2,1.3,60,70);
    h.add(12,'dart',5,.35,50,25);
    h.add(28,'ring',5,.5,90,0);
    h.add(46,'cross',3,1.1,60,45);
    if(L>=2)h.add(44,'dart',6,.3,50,20);
    if(L>=2){h.add(16,'ringR',3,.6,100,0);h.add(60,'cross',4,.9,50,35)}
    if(L>=3){h.add(8,'ringR',4,.5,80,25);h.add(36,'pod',2,1.2,70,60);h.add(66,'dart',8,.25,40,15)}
  }
};
Object.assign(PLANETS[1],{d:'TUMBLING ROCK FIELDS, DUST CLOUDS AND MINING PIRATES.'});
})();
