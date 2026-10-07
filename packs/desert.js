/* Idlyte art pack 7: SUNFIRE WASTES (elite).
   A blazing desert at noon: a harsh white-gold sun in a lapis and turquoise sky, far mesas, pyramids and seated
   colossi on a hazy horizon with a shimmering heat band, three depths of dunes with long hard shadows,
   half-buried ruins (stepped pyramid, columns, a colossal head, obelisks, a pylon gate, a standing colossus),
   red canyon rims along the top, red rock hoodoos and a natural arch along the bottom, and sandstorm walls
   that sweep across (telegraphed by a rising haze).
   Cast: scarab swarms (ring, some carry bombs), royal scarab bombers (ringR), vulture gliders (dart),
   scorpion walkers glued to the dunes (cross), sand worms bursting out of the dunes (pod),
   sandstone blocks, falling obelisks and dust devils (rock).
   Mini boss: the dune ripper worm. Boss: Sun-god Ra, a golden war engine with a sun disc. */
PACKS[7]={
init(){
  /* ---------- helpers ---------- */
  const TAU=Math.PI*2;
  let sd=7;
  const LR=()=>(sd=(sd*1103515245+12345)&0x7fffffff)/0x7fffffff;
  const lr=(a,b)=>a+LR()*(b-a);
  const hash=(i,j,k)=>{let h=(i*374761393+j*668265263+(k||0)*1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296};
  const bay=(i,j)=>(BAYER[j&3][i&3]+.5)/16;
  const rp=(ramp,v,i,j)=>{v=v<0?0:v>.999?.999:v;const t=v*(ramp.length-1),k=Math.floor(t);return ramp[(t-k>bay(i,j))?Math.min(ramp.length-1,k+1):k]};
  const RGB={};const rgb=h=>RGB[h]||(RGB[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
  const mod=(a,n)=>((a%n)+n)%n;
  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  function bake(w,h,fn){const c=mk(w,h),x=c.getContext('2d'),id=x.createImageData(w,h),d=id.data;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const col=fn(i,j);if(!col)continue;const v=rgb(col),q=(j*w+i)*4;d[q]=v[0];d[q+1]=v[1];d[q+2]=v[2];d[q+3]=255}
    x.putImageData(id,0,0);return c}
  /* colour function to sprite, with a 1 pixel outline (black unless told otherwise, false for none) */
  function paint(w,h,fn,outline){
    const pd=outline===false?0:1,cw=w+2*pd,ch=h+2*pd,cols=new Array(cw*ch).fill(null);
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const col=fn(i,j);if(col)cols[(j+pd)*cw+i+pd]=col}
    if(pd){const oc=typeof outline==='string'?outline:'#000000',add=[];
      for(let j=0;j<ch;j++)for(let i=0;i<cw;i++){const q=j*cw+i;if(cols[q])continue;
        if((i>0&&cols[q-1])||(i<cw-1&&cols[q+1])||(j>0&&cols[q-cw])||(j<ch-1&&cols[q+cw]))add.push(q)}
      for(const q of add)cols[q]=oc}
    return bake(cw,ch,(i,j)=>cols[j*cw+i]);
  }
  /* relief shading: distance field bevel lit from the upper left, dithered into a ramp */
  function relief(w,h,mask,ramp,o){
    o=o||{};const N=w*h,m=new Uint8Array(N),d=new Float32Array(N),cap=o.cap||4,nz=o.nz||1.1;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(mask(i,j)){m[j*w+i]=1;d[j*w+i]=1e3}
    const D=(i,j)=>(i<0||j<0||i>=w||j>=h)?0:d[j*w+i];
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const q=j*w+i;if(m[q])d[q]=Math.min(d[q],D(i-1,j)+1,D(i,j-1)+1,D(i-1,j-1)+1.41,D(i+1,j-1)+1.41)}
    for(let j=h-1;j>=0;j--)for(let i=w-1;i>=0;i--){const q=j*w+i;if(m[q])d[q]=Math.min(d[q],D(i+1,j)+1,D(i,j+1)+1,D(i+1,j+1)+1.41,D(i-1,j+1)+1.41)}
    const Hh=(i,j)=>{const v=D(i,j);if(!v)return 0;const x=Math.min(v,cap)/cap;return Math.sqrt(1-(1-x)*(1-x))};
    return paint(w,h,(i,j)=>{
      if(!m[j*w+i])return null;
      const gx=Hh(i+1,j)-Hh(i-1,j),gy=Hh(i,j+1)-Hh(i,j-1),nl=Math.hypot(gx,gy,nz);
      let v=(gx*.55+gy*.65+nz*.52)/nl;
      v=(v-.2)*(o.k||1.35)+(o.amb||0);
      if(o.rim!==0&&!D(i,j-1))v+=(o.rim||.3);
      const col=rp(ramp,v,i,j);
      if(o.paint){const c2=o.paint(i,j,v,col,D(i,j));if(c2!=null)return c2}
      return col;
    },o.out);
  }
  const flipH=c=>{const o=mk(c.width,c.height),x=o.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return o};
  function inPoly(P,x,y){let o=false;for(let a=0,b=P.length-1;a<P.length;b=a++){const A=P[a],B=P[b];if((A[1]>y)!==(B[1]>y)&&x<(B[0]-A[0])*(y-A[1])/(B[1]-A[1])+A[0])o=!o}return o}
  const segD=(x,y,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,t=clamp(((x-ax)*dx+(y-ay)*dy)/l2,0,1);return Math.hypot(x-ax-dx*t,y-ay-dy*t)};
  /* recolour a finished sprite through a colour map (used once at init for darker or damaged versions) */
  const HEX=v=>'#'+((1<<24)|(v[0]<<16)|(v[1]<<8)|v[2]).toString(16).slice(1);
  function recolor(c,map){const o=mk(c.width,c.height),g=o.getContext('2d');g.drawImage(c,0,0);const id=g.getImageData(0,0,o.width,o.height),d=id.data;
    for(let q=0;q<d.length;q+=4){if(!d[q+3])continue;const h=HEX([d[q],d[q+1],d[q+2]]),n=map[h];if(n){const v=rgb(n);d[q]=v[0];d[q+1]=v[1];d[q+2]=v[2]}}
    g.putImageData(id,0,0);return o}
  const DARK={'#ffffff':'#ffffaa','#ffffaa':'#ff9966','#ff9966':'#9a6759','#b8c76f':'#9a6759','#9a6759':'#68372b','#68372b':'#433900','#433900':'#000000','#6f4f25':'#433900',
    '#9ad2e0':'#70a4b2','#70a4b2':'#352879','#6c5eb5':'#352879','#352879':'#1c1840','#1c1840':'#000000','#ff7777':'#9a3a3a','#9a3a3a':'#68372b'};
  function strip(img,off,y){const w=img.width;let x=-mod(off,w);for(;x<W;x+=w)ctx.drawImage(img,Math.floor(x),y)}
  function line(g,col,x0,y0,x1,y1,s){s=s||1;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);g.fillStyle=col;for(let i=0;i<=n;i++)g.fillRect(Math.floor(x0+(x1-x0)*i/n),Math.floor(y0+(y1-y0)*i/n),s,s)}

  /* ---------- palettes ---------- */
  const GOLD=['#433900','#6f4f25','#9a6759','#ff9966','#ffffaa','#ffffff'];
  const GOLDB=['#68372b','#9a6759','#ff9966','#ffffaa','#ffffff'];
  const LAPIS=['#000000','#1c1840','#352879','#6c5eb5','#9ad2e0'];
  const TURQ=['#1c1840','#352879','#70a4b2','#9ad2e0','#ffffff'];
  const TURQR=['#352879','#70a4b2','#9ad2e0'];
  const BRONZE=['#000000','#433900','#68372b','#9a6759','#ff9966','#ffffaa'];
  const BONE=['#433900','#9a6759','#ffffaa','#ffffff'];
  const STONE=['#68372b','#9a6759','#ff9966','#ffffaa'];
  const REDR=['#000000','#68372b','#9a3a3a','#9a6759','#ff9966'];
  const WORM=['#000000','#68372b','#9a3a3a','#9a6759','#ff9966','#ffffaa'];

  /* ---------- pack state (reset for every new run) ---------- */
  const S={g:null,bt:0};
  function sync(){if(S.g!==G){S.g=G;S.bt=0;S.skip=null}}
  /* scroll clock: the level clock plus the time spent in the boss fight, so the world keeps moving */
  const clk=t=>t+(S.g===G?S.bt:0);
  const NEAR_V=44,MID_V=18,FD_V=9,FAR_V=4,CIR_V=2,FCAN_V=14;
  const CAP=60;
  /* hp multipliers for the elite fights. The standard boss and mini hp (90 and 26 x level scaling) melt in seconds
     against the ships that can enter this stage (power 340 and up), so they are raised here */
  const HPK_BOSS=16,HPK_MINI=11;
  const lvl=()=>Math.min(3,Math.max(1,(G&&G.level)||1));
  const TM=()=>[1,.86,.74][lvl()-1];
  const room=n=>EB.length+n<=CAP;
  const aimA=(x,y)=>Math.atan2(P.y-y,P.x-x);

  /* =====================================================================
     BACKGROUND
     ===================================================================== */
  const HZ=124,SUNX=54,SUNY=42;
  const SKYR=['#352879','#70a4b2','#9ad2e0','#ffffaa'];
  const SKY=bake(W,H,(i,j)=>{
    const dx=i-SUNX,dy=j-SUNY,d=Math.hypot(dx,dy);
    if(d<10.5)return '#ffffff';
    if(d<13.5)return bay(i,j)<(13.5-d)/3?'#ffffff':'#ffffaa';
    let v=clamp((j-TOP)/(HZ-TOP),0,1);v=.05+Math.pow(v,.9)*.95;
    const gl=Math.max(0,1-d/78);v+=gl*gl*.8;
    const a=Math.atan2(dy,dx),ray=Math.pow(Math.max(0,Math.cos(a*7+.4)),36)*Math.max(0,1-d/130);
    if(d>15&&ray>bay(i,j)+.2)return v>.62?'#ffffff':'#ffffaa';
    return rp(SKYR,v,i,j)});
  /* thin high cirrus */
  sd=11;const CB=[];for(let k=0;k<9;k++)CB.push([lr(0,640),lr(4,24),lr(30,84),lr(1.1,2.4)]);
  const CIR=bake(640,30,(i,j)=>{let best=0;for(const b of CB){let dx=Math.abs(i-b[0]);dx=Math.min(dx,640-dx);const v=1-(dx/b[2])**2-((j-b[1])/b[3])**2;if(v>best)best=v}
    if(best<=0)return null;best+=(hash(i>>3,j,5)-.5)*.3;if(best<.12)return null;return best>.55?'#ffffff':(((i+j)&1)?'#9ad2e0':null)});
  /* far canyon wall hanging along the top, hazy */
  const FCW=640,FCH=34;
  const FCAN=bake(FCW,FCH,(i,j)=>{const b=10+5*Math.sin(TAU*3*i/FCW)+3*Math.sin(TAU*7*i/FCW+1)+2*Math.sin(TAU*17*i/FCW+2)+(hash(i>>2,3,8)-.5)*2+(Math.sin(TAU*2*i/FCW)>.6?8:0);
    if(j>b)return null;const band=((j+Math.round(Math.sin(i*.05)*2))>>2)%3;return rp(['#9a6759','#ff9966','#ffffaa'],.3+band*.12+(j>b-1.5?.3:0),i,j)});
  /* far horizon: mesas, pyramids, obelisks and seated colossi in the haze */
  const FW=960,FH=54,fBase=FH-8,FY=HZ-fBase;
  sd=31;const FO=[];{let x=10;while(x<FW-70){const r=LR();if(r<.3)FO.push({k:'mesa',x,w:lr(54,96),h:lr(14,24)});else if(r<.6)FO.push({k:'pyr',x,w:lr(28,60)});else if(r<.8)FO.push({k:'obel',x,h:lr(18,30)});else FO.push({k:'col',x});x+=lr(44,104)}}
  function farPix(i,j){const y=fBase-j;
    for(const o of FO){const lx=i-o.x;
      if(o.k==='pyr'){const h=o.w*.58,half=o.w/2;if(y<-8||y>h)continue;const hw=half*(1-y/h);if(Math.abs(lx-half)<=hw){if(y>h-2.5)return '#ffffff';return lx<half?.84:.36}}
      else if(o.k==='mesa'){if(y<-8||y>o.h)continue;const half=o.w/2,hw=half*.72+Math.max(0,6-y)*1.6-Math.max(0,y-(o.h-3))*1.2;if(Math.abs(lx-half)<=hw){const rel=(lx-half)/hw;let v=rel<-.6?.84:rel>.55?.3:.6;if(((y+(lx>>3))>>2)&1)v-=.12;return v}}
      else if(o.k==='obel'){if(y<-8||y>o.h+3)continue;const hw=y>o.h?(o.h+3-y)*.5:1.5-y/o.h*.5;if(Math.abs(lx-2)<=hw){if(y>o.h)return '#ffffff';return lx<2?.85:.35}}
      else{if(y<-8||y>30||lx<0||lx>20)continue;
        const throne=lx>=6&&lx<=19&&y<=14,body=lx>=4&&lx<=12&&y<=22,legs=lx>=1&&lx<=10&&y<=9,head=lx>=4&&lx<=11&&y>22&&y<=29&&!(y>27&&(lx<6||lx>9));
        if(throne||body||legs||head)return (lx<7&&!throne)?.84:throne?.4:.6}}
    return -1}
  const FAR=bake(FW,FH,(i,j)=>{const v=farPix(i,j);if(v===-1)return null;if(typeof v==='string')return v;return rp(['#9a6759','#ff9966','#ffffaa'],v+(j/FH)*.1,i,j)});

  /* dunes share one recipe: a surface profile, long hard shadows thrown down to the right by everything taller on the left */
  function shadowLine(T,k){const n=T.length,S=new Float32Array(n).fill(1e9);for(let q=0;q<2*n;q++){const x=q%n,p=(x-1+n)%n;S[x]=Math.min(T[p]+k,S[p]+k)}return S}
  /* far dunes */
  const FDW=640,FDH=34,FDY=HZ-6;
  const fdT=new Float32Array(FDW);for(let x=0;x<FDW;x++)fdT[x]=8+3*Math.sin(TAU*3*x/FDW)+2.5*Math.sin(TAU*7*x/FDW+1)+1.2*Math.sin(TAU*15*x/FDW+2);
  const fdS=shadowLine(fdT,.42);
  const FD=bake(FDW,FDH,(i,j)=>{const t=fdT[i];if(j<t)return null;const dp=j-t,sh=t-fdS[i];
    if(sh>.5&&dp<sh*2+2)return rp(['#9a6759','#ff9966'],.55-dp*.02,i,j);
    if(dp<1)return '#ffffff';
    return rp(['#ff9966','#ffffaa'],.82-dp*.02+((((i>>1)+j*3)%9)<1?-.25:0),i,j)});

  /* middle dunes with half-buried ruins */
  const MW=800,MH=100,MY=BOT-MH;
  const mT=x=>66+4*Math.sin(TAU*2*x/MW)+3*Math.sin(TAU*5*x/MW+1.3)+1.5*Math.sin(TAU*11*x/MW+.4);
  const MO=[{k:'pyr',x:34,cw:106,w:106,h:58,bury:9},{k:'cols',x:200,cw:58,bury:4},{k:'head',x:300,cw:40,bury:12},{k:'obel',x:388,cw:9,h:58,bury:4},
    {k:'mesa',x:446,cw:86,w:86,h:50,bury:6},{k:'stump',x:566,cw:9,h:22,bury:3},{k:'pylon',x:606,cw:58,bury:6},{k:'statue',x:726,cw:21,bury:5}];
  for(const o of MO)o.base=Math.round(mT(o.x+o.cw/2))+o.bury;
  function objPix(o,lx,y){
    switch(o.k){
      case 'pyr':{const half=o.w/2;if(y<0||y>o.h)return null;const hw=half*(1-y/o.h),d=lx-half;if(Math.abs(d)>hw)return null;
        if(d>0&&y>o.h*.3&&y<o.h*.44&&d>hw-6)return null;
        if(y>o.h-7)return [GOLDB,d<0?.86:.45];
        let v=d<0?.8:.42;if(((y|0)%4)===0)v-=.24;else if(((Math.floor(y/4)*3+(lx|0))%7)===0)v-=.14;return [STONE,v]}
      case 'cols':{
        if(y>=48&&y<53&&lx>=-2&&lx<=22)return [STONE,y>=52?.92:y<49?.22:.66];
        const C=[[0,44,1],[13,44,1],[26,50,1],[40,22,0]];
        for(const q of C){const r=lx-q[0],hh=q[1];
          if(q[2]&&y>=hh&&y<hh+4&&r>=-2&&r<=8)return [STONE,y>=hh+3?.95:r<1?.72:.5];
          if(r>=0&&r<7&&y<hh&&!(y>hh-4&&!q[2]&&hash(lx,y|0,3)<.6)){let v=r<2?.86:r>4?.3:.6;if(r===3)v-=.16;if(y>hh*.45&&y<hh*.45+3)return [LAPIS,.5+v*.4];return [STONE,v]}}
        return null}
      case 'head':{const cx=19,dx=lx-cx;if(y<0||y>42||lx<0||lx>38)return null;
        if(y>=37&&y<=41&&Math.abs(dx)<=1)return [GOLDB,.85];
        const face=(dx/8)**2+((y-20)/12)**2<=1;
        if(face){if(y>=23&&y<=24&&Math.abs(Math.abs(dx)-4)<=1.5)return [LAPIS,.15];
          if(y===25&&Math.abs(Math.abs(dx)-4)<=2.2)return [LAPIS,.3];
          if(Math.abs(dx)<=.5&&y>=15&&y<=21)return [STONE,.3];
          if(y===12&&Math.abs(dx)<=2.5)return [STONE,.12];
          if(hash(lx,y|0,77)<.05)return [STONE,.2];
          return [STONE,dx<0?.84:.5]}
        if(Math.abs(dx)<=2.2&&y>=0&&y<9)return [((y|0)>>1)%2?LAPIS:GOLDB,.55];
        const hw=y>26?17-(y-26)*.4:17-Math.max(0,8-y)*.3,top=36-Math.abs(dx)*.15;
        if(Math.abs(dx)<=hw&&y<=top&&y>=3){const st=((y|0)>>1)%2;return st?[LAPIS,dx<0?.8:.45]:[GOLDB,dx<0?.75:.42]}
        return null}
      case 'obel':case 'stump':{const c=4;
        if(o.k==='stump'){if(y<0||y>o.h-hash(lx,1,9)*4)return null}else if(y<0||y>o.h+6)return null;
        if(o.k==='obel'&&y>o.h){const hw=(o.h+6-y)*.62;if(Math.abs(lx-c)>hw)return null;return [GOLDB,lx<c?.92:.5]}
        const hw=3.6-y/(o.h||1)*1.1;if(Math.abs(lx-c)>hw)return null;
        if(Math.abs(lx-c)<.6&&(y|0)%4===1&&y<o.h-3)return [LAPIS,.4];return [STONE,lx<c-1?.86:lx>c+1?.36:.62]}
      case 'mesa':{const half=o.w/2;if(y<0||y>o.h)return null;const hw=half*.72+Math.max(0,8-y)*1.5-Math.max(0,y-(o.h-4))*1.4+Math.sin(y*.7)*.8,d=lx-half;if(Math.abs(d)>hw)return null;
        const rel=d/hw;let v=rel<-.55?.82:rel>.5?.3:.58;const band=Math.floor((y+Math.sin(lx*.15)*1.5)/4)%3;v+=[0,-.14,.06][band];if(y>o.h-1.5)v=.98;return [REDR,Math.max(.26,v)]}
      case 'pylon':{if(y<0||y>45||lx<0||lx>57)return null;
        const tw=cx=>Math.abs(lx-cx)<=12-y*.09+(y>40?1.5:0),inT=tw(12)||tw(45),lint=lx>=22&&lx<=35&&y>=26&&y<=33;
        if(!inT&&!lint)return null;
        if(y>40)return [STONE,y>44?.96:.62];
        if(y>=31&&y<=32)return [TURQR,lx<28?.75:.45];
        if(inT&&y>8&&y<27&&((lx%12)>3&&(lx%12)<7)&&((y|0)%6)<4)return [LAPIS,.5];
        const cxn=lx<28?12:45,d=lx-cxn;return [STONE,d<-6?.86:d>6?.34:.6]}
      case 'statue':{if(y<0||y>66||lx<0||lx>20)return null;let mat=STONE,v=null;
        if(y<4){if(lx>=1&&lx<=19)return [STONE,y>=3?.92:.48];return null}
        if(y<26&&((lx>=5&&lx<=8)||(lx>=11&&lx<=14)))v=(lx===5||lx===11)?.86:.55;
        else if(y>=26&&y<36&&lx>=4&&lx<=15){mat=GOLDB;v=(lx%2)?.72:.5}
        else if(y>=36&&y<50&&lx>=5&&lx<=14){v=lx<8?.86:.55;if(y>=43&&y<=45)mat=TURQR}
        else if(y>=36&&y<49&&(lx===3||lx===16))v=lx===3?.8:.42;
        else if(y>=50&&y<62&&lx>=4&&lx<=15){const st=((y|0)>>1)%2;mat=st?LAPIS:GOLDB;v=lx<8?.8:.48;if(lx>=5&&lx<=8&&y<58&&y>=51){mat=STONE;v=.8}}
        else if(y>=62&&y<66&&lx>=7&&lx<=12){mat=GOLDB;v=.88}
        if(v==null)return null;return [mat,v]}
    }
    return null;
  }
  const MOB=new Array(MW*MH).fill(null),mTop=new Float32Array(MW);
  for(let x=0;x<MW;x++){const dt=mT(x);mTop[x]=dt;
    for(const o of MO){const lx=x-o.x;if(lx<-3||lx>o.cw+3)continue;
      for(let j=0;j<Math.ceil(dt)+1&&j<MH;j++){if(MOB[j*MW+x])continue;const r=objPix(o,lx,o.base-j);if(r){MOB[j*MW+x]=r;if(j<mTop[x])mTop[x]=j}}}}
  const mS=shadowLine(mTop,.4);
  const MID=bake(MW,MH,(i,j)=>{const dt=mT(i);
    if(j>=dt){const dp=j-dt,t=mTop[i],sh=t<dt-.5?0:dt-mS[i],rip=(((i>>1)+j*2+Math.round(Math.sin(i*.07)*3))%8)<1?-.2:0;
      if(sh>.5&&dp<sh*1.6+2)return rp(['#68372b','#9a3a3a','#9a6759'],.62-dp*.02+rip*.5,i,j);
      if(dp<1)return '#ffffaa';
      return rp(['#9a6759','#ff9966','#ffffaa'],.74-dp*.022+rip,i,j)}
    const r=MOB[j*MW+i];if(!r)return null;return rp(r[0],r[1],i,j)});

  /* top canyon rim (near) */
  const NW=960;
  const CAN_H=34;
  const cY=new Float32Array(NW);
  for(let x=0;x<NW;x++)cY[x]=8+3*Math.sin(TAU*3*x/NW)+2*Math.sin(TAU*8*x/NW+1)+1.2*Math.sin(TAU*19*x/NW+2)+(hash(x>>2,5,2)-.5)*1.4;
  sd=131;for(let k=0;k<12;k++){const c=Math.floor(lr(0,NW)),L=lr(4,13),wd=lr(3,7);for(let d=-wd;d<=wd;d++){const x=mod(c+d,NW);cY[x]=Math.max(cY[x],8+L*(1-Math.abs(d)/(wd+.5)))}}
  const CAN=bake(NW,CAN_H,(i,j)=>{const b=cY[i];if(j>b)return null;const dp=b-j;
    if(dp<1)return '#000000';if(dp<2.5)return '#68372b';
    const face=cY[mod(i+1,NW)]>b+1.2||cY[mod(i+2,NW)]>b+2;   /* a drop to the right: a face turned to the sun */
    const band=((j+Math.round(Math.sin(i*.045)*2))>>1)%5;
    let v=[.3,.5,.42,.62,.38][band]+(face?.3:0);if(hash(i,j,4)<.04)v-=.25;return rp(REDR,v,i,j)});
  /* near dunes along the bottom, red rock hoodoos and a natural arch */
  const NH=50,NY=BOT-NH;
  const GY=new Float32Array(NW),GW=new Float32Array(NW),nT=new Float32Array(NW);
  for(let x=0;x<NW;x++)GY[x]=172+3.5*Math.sin(TAU*4*x/NW)+2.5*Math.sin(TAU*9*x/NW+1)+1.4*Math.sin(TAU*23*x/NW+2);
  for(let x=0;x<NW;x++){let g=999;for(let d=-4;d<=4;d++)g=Math.min(g,GY[mod(x+d,NW)]);GW[x]=g}
  const HOO=[{x:110,w:14,top:132},{x:330,w:18,top:140},{x:560,w:12,top:128},{x:700,w:20,top:138}],ARCH={x0:820,x1:884,top:134,th:9,leg:12};
  function rockAt(x,y){
    for(const h of HOO){const lx=x-h.x,cx=h.w/2,ry=y-h.top,hw=ry<6?cx+1.5-Math.max(0,1.5-ry)*1.2:cx*.62+ry*.06+Math.sin(ry*.5)*.6;
      if(ry>=0&&Math.abs(lx-cx)<=hw){const rel=(lx-cx)/hw;return {v:(rel<-.4?.82:rel>.45?.32:.56)+(((ry>>2)&1)?-.12:0)+(ry<1.5?.2:0)}}}
    {const a=ARCH,lx=x-a.x0,span=a.x1-a.x0;if(lx>=0&&lx<=span&&y>=a.top){
      const ry=y-a.top,inLeg=lx<a.leg+ry*.08||lx>span-a.leg-ry*.08,inSpan=ry<a.th+Math.pow(Math.abs(lx-span/2)/(span/2),3)*12;
      if(inLeg||inSpan){let v=lx<6?.82:lx>span-6?.32:.55;if(!inLeg&&ry>a.th-2+Math.pow(Math.abs(lx-span/2)/(span/2),3)*12)v=.18;if(((ry>>2)&1))v-=.1;if(ry<1.5)v+=.25;return {v}}}}
    return null}
  for(let x=0;x<NW;x++){let t=GY[x];for(let y=NY;y<t;y++){if(rockAt(x,y)){t=y;break}}nT[x]=t}
  const nS=shadowLine(nT,.42);
  const NEAR=bake(NW,NH,(i,j)=>{const y=j+NY,g=GY[i];
    if(y>=g){const dp=y-g,sh=nT[i]<g-.5?Math.max(g-nS[i],0):g-nS[i],rip=(((i>>1)+y*2+Math.round(Math.sin(i*.09)*2))%7)<1?-.22:0;
      if(sh>.5&&dp<sh*1.4+2)return rp(['#68372b','#9a3a3a','#9a6759'],.55-dp*.03+rip*.5,i,j);
      if(dp<1)return '#ffffaa';
      if(dp>13)return rp(['#68372b','#9a3a3a'],.7-(dp-13)*.04,i,j);
      return rp(['#9a3a3a','#ff9966','#ffffaa'],.66-dp*.03+rip,i,j)}
    const r=rockAt(i,y);if(!r)return null;
    if(!rockAt(i-1,y)||!rockAt(i+1,y)||!rockAt(i,y-1))return '#000000';
    return rp(REDR,r.v,i,j)});
  /* sand crests that blow off in the wind */
  const CREST=[];for(let x=1;x<NW-1;x++){if(GY[x]<GY[x-1]&&GY[x]<=GY[x+1]&&!rockAt(x,GY[x]-1))CREST.push(x)}
  /* sandstorm: a rising haze as the telegraph, then a wall of blowing sand */
  const SWW=150,SWH=BOT-TOP;
  const WALL=[0,1,2].map(f=>bake(SWW,SWH,(i,j)=>{const xc=(i-SWW/2)/(SWW/2),core=Math.max(0,1-xc*xc),n=hash(Math.floor((i+f*7)/5),j>>1,f+40),st=.5+.5*Math.sin(j*.9+i*.05+f*2.1);
    let d=core*(.42+.36*st)+(n-.5)*.22;if(j<6||j>SWH-6)d*=.6;if(d<bay(i,j)+.08)return null;return d>.68?'#ffffaa':d>.5?'#ff9966':'#9a6759'}));
  const HAZE=bake(W,64,(i,j)=>{const d=(j/64)*.62+(hash(i>>2,j>>1,7)-.5)*.2;return d>bay(i,j)+.12?(j>44?'#ff9966':'#ffffaa'):null});
  const DIM=bake(W,BOT-TOP,(i,j)=>{const b=BAYER[j&3][i&3];return b===0?'#ff9966':b===8?'#9a6759':null});
  const lvT=t=>t-((G&&G.loop)||0)*LEVEL_LEN+(S.g===G?S.bt:0);
  const STC=36,ST0=21,SD=(W+SWW+40)/82;
  const SST={h:0,x:-999,dim:0};
  function stormAt(a){const p=mod(a-ST0,STC);SST.h=0;SST.x=-999;SST.dim=0;if(S.skip===Math.floor((a-ST0)/STC))return SST;
    if(p<3)SST.h=p/3;else if(p-3<SD){const q=p-3;SST.h=1-Math.min(1,q/1.2)*.7;SST.x=W+20-q*82;SST.dim=Math.min(1,q/.6,(SD-q)/.8)}
    return SST}
  /* drifting grains */
  sd=17;const GR=[];for(let i=0;i<44;i++)GR.push({x:lr(0,W),y:lr(TOP+4,BOT-4),v:lr(60,150),c:['#ffffaa','#ff9966','#9a6759','#ffffff'][Math.floor(LR()*4)],l:LR()<.3?2:1,ph:lr(0,9)});

  /* =====================================================================
     ENEMY SPRITES
     ===================================================================== */
  /* SCARAB, seen from above and flying left: gold elytra split by a black seam with lapis grooves, six legs, buzzing glass wings.
     royal: lapis elytra with gold grooves and a gold pronotum, pushing a red sun ball */
  function scarabSprite(f,R){
    const s=R?1.35:1,w=Math.round(20*s),h=Math.round(21*s),cy=(h-1)/2;
    const ex=12.4*s,erx=6.4*s,ery=6.2*s;
    const ely=(i,j)=>((i-ex)/erx)**2+((j-cy)/ery)**2<=1;
    const pro=(i,j)=>((i-5.4*s)/(3*s))**2+((j-cy)/(4.6*s))**2<=1;
    const head=(i,j)=>((i-2.2*s)/(2.1*s))**2+((j-cy)/(2.9*s))**2<=1;
    const rake=(i,j)=>i<1&&Math.abs(j-cy)<=2.6*s&&((Math.round(j-cy)+20)%2===0);
    const th=[1.2,.85,.5,.85][f];
    const wing=(i,j,sg)=>{const px0=11*s,py0=cy+sg*3*s,a=sg*th,ca=Math.cos(a),sa=Math.sin(a),L=6.6*s,qx=px0+ca*L*.85,qy=py0+sa*L*.85,dx=i-qx,dy=j-qy,u=dx*ca+dy*sa,v=-dx*sa+dy*ca;return (u/L)**2+(v/(1.9*s))**2<=1};
    const legs=new Set();for(let k=0;k<3;k++){const bx=Math.round((5+k*3.8)*s),off=((k+f)&1)?1:0;for(const sg of [-1,1]){const by=Math.round(cy+sg*(k===0?3.6:4.6)*s);
      for(let q=1;q<=Math.round(2.2*s);q++)legs.add((bx+(k===0?-q:k===2?q:0)+off)+','+(by+sg*q))}}
    const mask=(i,j)=>ely(i,j)||pro(i,j)||head(i,j)||rake(i,j)||legs.has(i+','+j)||wing(i,j,-1)||wing(i,j,1);
    return relief(w,h,mask,GOLD,{cap:3,amb:.22,paint:(i,j,v)=>{
      const E2=ely(i,j);
      if(!E2&&!pro(i,j)&&(wing(i,j,-1)||wing(i,j,1))){const up=wing(i,j,-1);if((i+j+f)%3===0)return up?'#70a4b2':'#352879';return up?rp(['#9ad2e0','#ffffff'],v,i,j):'#70a4b2'}
      if(legs.has(i+','+j)&&!E2&&!pro(i,j)&&!head(i,j))return '#000000';
      if(E2){const dy=j-cy;if(Math.abs(dy)<.6)return '#000000';
        const sg=dy<0?-1:1,nx=(i-ex)/erx,ny=(j-(cy+sg*ery*.5))/(ery*.5),edge=((i-ex)/erx)**2+((j-cy)/ery)**2>.78;
        const li=clamp(1-Math.hypot(nx+.4,ny+.55)*.62,0,1);
        if(R){if(edge)return rp(GOLD,.5+li*.5,i,j);return rp(['#1c1840','#352879','#6c5eb5','#9ad2e0'],.15+li*.85,i,j)}
        if(edge&&sg>0)return rp(GOLD,.25+li*.3,i,j);
        if(i===Math.round(ex-2.5+f*.5)&&j===Math.round(cy+sg*ery*.5-1.5*s))return '#ffffff';
        return rp(['#6f4f25','#9a6759','#ff9966','#ffffaa','#ffffff'],.1+li*.9,i,j)}
      if(pro(i,j)){if(Math.abs(j-cy)<.6)return '#1c1840';return R?rp(GOLD,v+.1,i,j):rp(LAPIS,v+.3,i,j)}
      if(head(i,j)&&i===Math.round(2.4*s)&&Math.abs(Math.abs(j-cy)-Math.round(2*s))<.5)return '#ff7777';
      if(head(i,j)||rake(i,j))return rp(GOLD,v,i,j);
      return null}});
  }
  const SCA=[0,1,2,3].map(f=>scarabSprite(f,false)),SCAW=SCA.map(whiteOf);
  const ROY=[0,1,2,3].map(f=>scarabSprite(f,true)),ROYW=ROY.map(whiteOf);
  /* the little bomb a scarab carries, and the royal sun ball */
  const SBOMB=paint(5,5,(i,j)=>{const d=Math.hypot(i-2,j-2);if(d>2.4)return null;if(j===2)return '#ff9966';return d<1.2&&i<2&&j<2?'#6c6c6c':'#1c1840'});
  const SUNB=relief(7,7,(i,j)=>Math.hypot(i-3,j-3)<=3.2,['#9a3a3a','#ff7777','#ff9966','#ffffaa','#ffffff'],{cap:2});

  /* VULTURE GLIDER: big bronze mechanical raptor, gold, lapis and turquoise feather plates, a red eye. faces left */
  const VPOSE=[
    [[14,15],[18,10],[23,6],[30,3],[37,1],[39,2],[37,4],[38,6],[35,6],[35,8],[32,9],[31,11],[28,12],[26,15]],
    [[14,15],[16,10],[19,5],[23,1],[26,0],[27,2],[26,4],[27,6],[25,7],[24,10],[22,12],[20,15]],
    [[14,15],[22,13],[30,12],[38,12],[41,13],[38,15],[39,16],[35,16],[34,18],[30,18],[24,18]],
    [[14,16],[20,18],[24,21],[28,25],[30,27],[27,27],[26,25],[24,25],[23,23],[20,22],[17,19]],
    [[13,15],[22,13],[32,13],[40,15],[43,17],[37,17],[30,18],[22,18]]];
  function vultureSprite(f){
    const w=44,h=29,wp=VPOSE[f],dive=f===4;
    const body=(i,j)=>((i-19)/8.5)**2+((j-16.5)/3.6)**2<=1;
    const tail=(i,j)=>inPoly([[26,15],[34,14],[37,16.5],[34,19.5],[26,18.5]],i+.5,j+.5);
    const neck=(i,j)=>segD(i,j,11.5,15.5,7,12)<1.6;
    const head=(i,j)=>((i-5.6)/3)**2+((j-11.4)/2.5)**2<=1;
    const beak=(i,j)=>inPoly([[3,10.5],[0,12],[0,15],[1.5,13.5],[3,13.5]],i+.5,j+.5);
    const ruff=(i,j)=>((i-11.6)/2.6)**2+((j-15)/2.6)**2<=1;
    const wing=(i,j)=>inPoly(wp,i+.5,j+.5);
    const tal=new Set();if(dive){for(const p of [[15,19],[14,20],[13,21],[12,22],[11,23],[10,24],[12,24],[9,24]])tal.add(p+'')}else{for(const p of [[18,20],[19,20],[18,21],[20,21],[21,20]])tal.add(p+'')}
    const mask=(i,j)=>body(i,j)||tail(i,j)||neck(i,j)||head(i,j)||beak(i,j)||ruff(i,j)||wing(i,j)||tal.has(i+','+j);
    return relief(w,h,mask,BRONZE,{cap:2.5,paint:(i,j,v)=>{
      if(tal.has(i+','+j)&&!body(i,j))return (dive?j>=23:j>=21)?'#ffffff':'#000000';
      if(beak(i,j))return rp(BONE,v+.2,i,j);
      if(head(i,j)){if(i===5&&j===11)return '#ff7777';if(i===5&&j===10)return '#ffffff';return rp(['#444444','#6c6c6c','#bbbbbb','#ffffff'],v,i,j)}
      if(ruff(i,j)&&!wing(i,j))return rp(TURQR,v,i,j);
      if(wing(i,j)){const edge=!wing(i,j+1)||!wing(i+1,j);if(edge)return ((i+j)&1)?'#9ad2e0':'#ffffff';
        const lead=!wing(i,j-2)||!wing(i-2,j);if(lead)return rp(GOLD,v+.25,i,j);
        if(((i+j*(f===3?-1:1))%3+3)%3===0)return '#1c1840';
        return (((i>>1)+j)%6<2)?rp(['#352879','#70a4b2','#9ad2e0'],v,i,j):rp(['#1c1840','#352879','#6c5eb5'],v+.1,i,j)}
      if(tail(i,j)){if(i%2===0)return '#352879';return rp(GOLD,v,i,j)}
      if(body(i,j)&&j>=18)return rp(GOLD,v,i,j);
      return null}});
  }
  const VUL=[0,1,2,3,4].map(vultureSprite),VULW=VUL.map(whiteOf);

  /* SCORPION WALKER: a lapis-armoured machine with gold trim, a curled gold and lapis tail, a glowing red stinger. faces left */
  const LAPM=['#000000','#1c1840','#352879','#6c5eb5','#9ad2e0'];
  function scorpSprite(f){
    const w=28,h=20,fire=f===4,lg=f&3;
    const TP=fire?[[24.5,11],[26,7.5],[24.5,4],[21,2.4],[17,2.6],[13.6,4.2]]:[[24.5,11],[25.8,7.2],[24.4,3.8],[21.2,2],[17.8,2.4]];
    const TR=[2.2,2,1.9,1.7,1.5,1.4];
    const sting=fire?[11.4,6]:[15.4,3.8];
    const ceph=(i,j)=>((i-10)/5.4)**2+((j-13)/3.4)**2<=1;
    const abd=(i,j)=>((i-15)/2.8)**2+((j-13)/3.1)**2<=1||((i-18.8)/2.6)**2+((j-12.6)/2.9)**2<=1||((i-22.4)/2.4)**2+((j-12)/2.7)**2<=1;
    const tl=(i,j)=>{for(let k=0;k<TP.length;k++)if(Math.hypot(i-TP[k][0],j-TP[k][1])<=TR[k])return k+1;return 0};
    const st=(i,j)=>Math.hypot(i-sting[0],j-sting[1])<=1.7||(Math.round(i)===Math.round(sting[0]-1.7)&&Math.round(j)===Math.round(sting[1]+1.7));
    const open=lg===1||lg===2;
    const arm=(i,j)=>segD(i,j,6,13,3.4,10.4)<1.2;
    const claw=(i,j)=>((i-2.4)/2.5)**2+((j-9)/2)**2<=1&&!(open&&i<=2&&Math.abs(j-9)<.6);
    const legs=new Set();[9,12,15,18].forEach((hx,k)=>{const off=((k+lg)&1)?1:-1;legs.add(hx+',16');legs.add((hx+off)+',17');legs.add((hx+off*2)+',18')});
    const mask=(i,j)=>ceph(i,j)||abd(i,j)||tl(i,j)||st(i,j)||arm(i,j)||claw(i,j)||legs.has(i+','+j);
    return relief(w,h,mask,LAPM,{cap:2.4,amb:.12,paint:(i,j,v)=>{
      if(st(i,j)&&!tl(i,j))return fire?((i+j)&1?'#ffffff':'#ffffaa'):rp(['#9a3a3a','#ff7777','#ffffff'],v,i,j);
      if(legs.has(i+','+j)&&!ceph(i,j)&&!abd(i,j))return j===18?'#ffffaa':'#000000';
      if(i===7&&j===11)return '#ff7777';if(i===6&&j===11)return '#ffffff';
      const k=tl(i,j);if(k){if(k%2===0)return rp(GOLD,v+.1,i,j);return null}
      if(abd(i,j)&&(i===17||i===21))return '#000000';
      if((ceph(i,j)||abd(i,j))&&!ceph(i,j-1)&&!abd(i,j-1))return '#ffffaa';
      if((ceph(i,j)||abd(i,j))&&(!ceph(i,j-2)&&!abd(i,j-2)))return '#ff9966';
      if(claw(i,j)||arm(i,j))return rp(GOLD,v+.1,i,j);
      return null}});
  }
  const SCO=[0,1,2,3,4].map(scorpSprite),SCOW=SCO.map(whiteOf);

  /* SAND WORMS: a head in 16 headings with a toothed round maw, and plated body rings */
  function wormHead(r,ang,open,big){
    const S=Math.ceil(r*2+3),c=(S-1)/2,ca=Math.cos(ang),sa=Math.sin(ang),mo=open?.62:.42;
    const loc=(i,j)=>{const dx=i-c,dy=j-c;return [dx*ca+dy*sa,-dx*sa+dy*ca]};
    return relief(S,S,(i,j)=>Math.hypot(i-c,j-c)<=r,WORM,{cap:r*.6,paint:(i,j,v)=>{
      const [u,vv]=loc(i,j),d=Math.hypot(i-c,j-c);
      if(u>r*.18){const m=Math.hypot((u-r*.95)/(r*.85),vv/(r*mo));
        if(m<.62)return u>r*.75?'#ff7777':'#9a3a3a';
        if(m<.9)return ((Math.round(Math.atan2(vv,u-r)*6)+20)%2)?'#ffffff':'#000000';
        if(m<1.05)return '#68372b'}
      if(u<r*.1&&Math.abs(((u+40)%(big?5:3.5)))<.8)return '#68372b';
      if(big&&d>r-2.2&&vv<-r*.3&&u<0&&((Math.round(u)+40)%3===0))return '#9ad2e0';
      if(d>r-1.5&&vv<0&&u<0&&((Math.round(u)+40)%2===0))return '#ffffaa';
      return null}});
  }
  function wormSeg(r,big,k){
    const S=Math.ceil(r*2+3),c=(S-1)/2;
    return relief(S,S,(i,j)=>Math.hypot(i-c,j-c)<=r,WORM,{cap:r*.6,paint:(i,j,v)=>{
      const dx=i-c,dy=j-c,d=Math.hypot(dx,dy);
      if(Math.abs(dx)<.6&&d<r-1)return '#68372b';
      if(dy<-r*.62&&Math.abs(dx)<r*.5)return big&&((k+Math.round(dx))%3===0)?'#9ad2e0':((Math.round(dx)+20)%2?'#ffffaa':'#ff9966');
      if(big&&dy>r*.35&&Math.abs(dx)<r*.6)return rp(['#68372b','#9a6759','#ffffaa'],.4+v*.4,i,j);
      return null}});
  }
  const WH=[],WHW=[];for(let k=0;k<16;k++){const c=wormHead(7,k/16*TAU,false,false);WH.push(c);WHW.push(whiteOf(c))}
  const WSR=[6.2,5.7,5.2,4.7,4.2,3.7,3.2],WSG=WSR.map((r,k)=>wormSeg(r,false,k)),WSGW=WSG.map(whiteOf);

  /* ROCKS: carved sandstone blocks, falling obelisks, dust devils */
  function blockSet(a,b,seed,glyph){sd=seed;const chip=[lr(1,2.5),lr(1,2.5),lr(1,2.5),lr(1,2.5)];const out=[];
    for(let f=0;f<8;f++){const an=f/8*Math.PI,ca=Math.cos(an),sa=Math.sin(an),S=Math.ceil(Math.hypot(a,b)*2+3),c=(S-1)/2;
      const loc=(i,j)=>{const dx=i-c,dy=j-c;return [dx*ca+dy*sa,-dx*sa+dy*ca]};
      out.push(relief(S,S,(i,j)=>{const [u,v]=loc(i,j);if(Math.abs(u)>a||Math.abs(v)>b)return false;const q=(u>0?1:0)+(v>0?2:0);return Math.abs(u)+Math.abs(v)<a+b-chip[q]},STONE,{cap:2.5,paint:(i,j)=>{const [u,v]=loc(i,j);
        if(glyph&&Math.abs(u)<a-2&&Math.abs(v)<b-2&&(Math.round(u+a)%3===1)&&(Math.round(v+b)%4!==0))return hash(Math.round(u),Math.round(v),seed)<.45?'#352879':'#68372b';return null}}))}
    return out}
  const BLK=[blockSet(9,7,3,true),blockSet(8,8,5,true)],BLS=[blockSet(4,3.4,7,false),blockSet(3.6,4,9,false)];
  const BLKW=BLK.map(s=>s.map(whiteOf)),BLSW=BLS.map(s=>s.map(whiteOf));
  function obelSet(){const out=[];for(let f=0;f<8;f++){const an=-.3+f/8*.6+Math.PI/2,ca=Math.cos(an),sa=Math.sin(an),S=28,c=13.5;
      const loc=(i,j)=>{const dx=i-c,dy=j-c;return [dx*ca+dy*sa,-dx*sa+dy*ca]};
      out.push(relief(S,S,(i,j)=>{const [u,v]=loc(i,j);if(u<-12+hash(Math.round(v),0,4)*2||u>12)return false;const hw=u>7?(12-u)*.75:3.6-(u+12)*.03;return Math.abs(v)<=hw},STONE,{cap:2.5,paint:(i,j)=>{const [u,v]=loc(i,j);
        if(u>7)return rp(GOLDB,.9-(v>0?.4:0),i,j);if(Math.abs(v)<.6&&Math.round(u)%3===0&&u<6)return '#352879';return null}}))}return out}
  const OBL=obelSet(),OBLW=OBL.map(whiteOf);
  function devilSet(big){const w=big?18:12,h=big?36:22,out=[];
    for(let f=0;f<6;f++)out.push(paint(w,h,(i,j)=>{const t=j/h,hw=1+Math.pow(1-t,1.25)*(w/2-1.5),cx=w/2-.5+Math.sin(j*.28+f*TAU/6)*1.6*(1-t*.5);
      if(Math.abs(i-cx)>hw)return null;const ph=(j*.55-(i-cx)/hw*2.2-f*TAU/6*1.5),b=((Math.floor(ph)%3)+3)%3;
      if(bay(i,j)<.18&&Math.abs(i-cx)>hw-1.2)return null;return ['#ffffaa','#ff9966','#9a6759'][b]},'#68372b'));
    return out}
  const DVB=devilSet(true),DVS=devilSet(false);

  /* =====================================================================
     BOSS SPRITES: Sun-god Ra
     ===================================================================== */
  /* the sun disc with a lapis inlay ring; variants: normal, charged, dimmed (cracked, sunspots), white-hot */
  const DISCR=30;
  const DPAL={norm:['#ff7777','#ff9966','#ffffaa','#ffffff','#ffffff'],charge:['#ffffaa','#ffffff','#ffffff'],dim:['#68372b','#9a3a3a','#9a6759','#ff9966'],hot:['#ff7777','#ffffaa','#ffffff','#ffffff']};
  function discSprite(kind){const S=DISCR*2+3,c=(S-1)/2;sd=901;const spots=[0,1,2,3].map(()=>[lr(-18,18),lr(-18,18),lr(2,4)]);
    return relief(S,S,(i,j)=>Math.hypot(i-c,j-c)<=DISCR,DPAL[kind],{cap:12,k:1.1,amb:.15,paint:(i,j,v)=>{const dx=i-c,dy=j-c,d=Math.hypot(dx,dy);
      if(d>DISCR-3.2&&d<=DISCR-.8){const a=Math.atan2(dy,dx);if(((Math.round(a/TAU*24)%2)+2)%2===0&&d<DISCR-1.6)return kind==='dim'?'#ff9966':'#ffffaa';return kind==='charge'?'#9ad2e0':rp(LAPIS,.55+v*.3,i,j)}
      if(d>DISCR-4.2&&d<=DISCR-3.2)return kind==='charge'?'#ffffff':'#9a3a3a';
      if(kind==='dim'){for(const s of spots)if(Math.hypot(dx-s[0],dy-s[1])<s[2])return Math.hypot(dx-s[0],dy-s[1])<s[2]-1?'#000000':'#68372b';if(hash(i,j,5)<.03)return '#000000'}
      if(kind==='hot'&&hash(i>>1,j>>1,6)<.06)return '#ff7777';
      if(d<9&&kind!=='dim')return d<5?'#ffffff':rp(['#ffffaa','#ffffff'],.6,i,j);
      return null}})}
  const DISC={norm:discSprite('norm'),charge:discSprite('charge'),dim:discSprite('dim'),hot:discSprite('hot')},DISCW=whiteOf(DISC.norm);
  function raySprite(fr,hotc){const S=118,c=(S-1)/2;
    return paint(S,S,(i,j)=>{const dx=i-c,dy=j-c,d=Math.hypot(dx,dy);if(d<DISCR+1||d>DISCR+26)return null;
      const a=Math.atan2(dy,dx)+fr*(TAU/16)/4,k=((Math.round(a/TAU*16)%16)+16)%16,ca=a-k*TAU/16-Math.round((a-k*TAU/16)/TAU)*TAU,L=(k%2?11:22)+(hotc?4:0),wd=(1-(d-DISCR)/L)*.13;
      if(d-DISCR>L||Math.abs(ca)>wd)return null;return Math.abs(ca)<wd*.45?(hotc?'#ffffff':'#ffffaa'):(hotc?'#ffffaa':'#ff9966')},'#9a3a3a')}
  const RAYS=[0,1,2,3].map(f=>raySprite(f,false)),RAYH=[0,1,2,3].map(f=>raySprite(f,true));

  /* wings of gold, lapis and turquoise. drawn as the near (left) wing; the far wing is the mirrored darker copy */
  function wingSprite(f,dmg){const w=74,h=68;sd=400+dmg*7+f;
    const holes=[];for(let q=0;q<dmg*4;q++)holes.push([lr(8,58),lr(.55,.95),lr(1.4,2.6)]);
    const cracks=new Set();for(let q=0;q<dmg*5;q++){let x=lr(10,66),y=lr(10,40),a=lr(-1,1);for(let s=0;s<lr(4,9);s++){cracks.add(Math.round(x)+','+Math.round(y+6));x+=Math.cos(a);y+=Math.sin(a);a+=lr(-.6,.6)}}
    const lift=[30,20,10][f];
    return paint(w,h,(i,j)=>{const s=(70-i)/68;if(s<0||s>1)return null;
      const top=34-lift*Math.pow(s,.9)-7*Math.sin(Math.PI*s),th=Math.max(4,24*(1-s)+10-(s>.9?(s-.9)*50:0));
      const fr=((i+j*.3)%4)/4,bot=top+th-Math.abs(fr-.5)*3;
      if(j<top||j>bot)return null;const d=(j-top)/th;
      for(const q of holes)if(Math.abs(i-q[0])<q[2]&&Math.abs(d-q[1])<.12)return null;
      if(cracks.has(i+','+j))return '#000000';
      if(d<.3){if(((i+((j>>1)&1)*2)%4)===0&&d>.06)return '#9a6759';return rp(GOLD,.85-d*.9-s*.15+(dmg>1?-.2:0),i,j)}
      if(d<.38)return rp(LAPIS,.6,i,j);
      if(d<.44)return dmg>1?'#9a6759':'#ffffaa';
      const fi=Math.floor((i+j*.3)/4);if(fr<.22)return '#433900';
      if(d>.9)return (fi%2)?'#ffffff':'#9ad2e0';
      return (fi%2)?rp(TURQ,.68-d*.25,i,j):rp(LAPIS,.62-d*.2,i,j)})}
  const WINGS=[0,1,2].map(dmg=>[0,1,2].map(f=>wingSprite(f,dmg))),WINGSW=WINGS[0].map(whiteOf);
  const WFAR=WINGS.map(set=>set.map(c=>flipH(recolor(c,DARK))));
  /* the falcon-headed body: lappets, plinth, kilt, torso, broad collar, arms with ankhs, the head with the eye of Horus */
  const BW=56,BH=96;
  function part(w,h,mask,ramp,pt,o){return relief(w,h,mask,ramp,Object.assign({cap:3,paint:pt},o||{}))}
  function bodySprite(dmg){
    const c=mk(BW+2,BH+2),g=c.getContext('2d');
    const put=(cv2)=>g.drawImage(cv2,0,0);
    put(part(BW,BH,(i,j)=>inPoly([[26,9],[38,7],[43,37],[30,39]],i+.5,j+.5),LAPIS,(i,j,v)=>((j>>1)&1)?rp(GOLD,v+.1,i,j):rp(LAPIS,v+.25,i,j)));
    put(part(BW,BH,(i,j)=>inPoly([[14,74],[44,74],[50,93],[8,93]],i+.5,j+.5),GOLD,(i,j,v)=>{if(j>=77&&j<=79)return (i%5===0)?'#ffffaa':rp(LAPIS,.6,i,j);if(j>=89)return (i%4<2)?'#000000':'#433900';if(j>=83&&j<=84)return rp(TURQR,.6,i,j);return null}));
    put(part(BW,BH,(i,j)=>inPoly([[18,54],[38,54],[42,74],[14,74]],i+.5,j+.5),GOLD,(i,j,v)=>{if(j<=56)return (i===28||i===29)?'#ffffaa':rp(LAPIS,.6,i,j);if(i%2)return rp(GOLD,v-.15,i,j);if(Math.abs(i-27)<(j-56)*.3)return rp(GOLD,v+.15,i,j);return null}));
    put(part(BW,BH,(i,j)=>((i-28)/10)**2+((j-44)/12)**2<=1,GOLD,(i,j)=>(j===46||j===50)&&Math.abs(i-28)<6?'#9a6759':null));
    put(part(BW,BH,(i,j)=>{const d=Math.hypot(i-28,j-29);return d>=4.5&&d<=13.5&&j>=28},GOLD,(i,j,v)=>{const d=Math.hypot(i-28,j-29);if(d<7)return rp(GOLD,v+.1,i,j);if(d<9)return rp(TURQ,.6+v*.2,i,j);if(d<11)return rp(LAPIS,.55+v*.2,i,j);return ((i+j)&1)?'#ffffaa':'#9a3a3a'}));
    const ARM=(pts)=>part(BW,BH,(i,j)=>{for(let k=0;k<pts.length-1;k++)if(segD(i,j,pts[k][0],pts[k][1],pts[k+1][0],pts[k+1][1])<2.3)return true;return false},BRONZE,(i,j,v)=>{for(const p of pts.slice(1,2))if(Math.abs(i-p[0])<1.3)return rp(GOLD,v+.2,i,j);return null});
    const ANKH=(ax,ay)=>part(BW,BH,(i,j)=>{const lx=i-ax,ly=j-ay;const loop=((lx)/2.8)**2+((ly-3)/3.2)**2<=1&&!(((lx)/1.2)**2+((ly-3)/1.7)**2<=1);return loop||(ly>=6&&ly<=7&&Math.abs(lx)<=4)||(ly>=6&&ly<=14&&Math.abs(lx)<=1)},TURQ,(i,j,v)=>rp(TURQ,v+.2,i,j));
    put(ARM([[32,42],[18,50],[8,52]]));put(ANKH(5,42));
    const HD=(i,j)=>((i-24)/9.6)**2+((j-16)/9.6)**2<=1,BK=[[16,12.5],[10,15],[6.5,19.5],[8,23.5],[11,20.5],[16,21.5]];
    put(part(BW,BH,(i,j)=>HD(i,j)||inPoly(BK,i+.5,j+.5),GOLD,(i,j,v)=>{
      if(inPoly(BK,i+.5,j+.5)&&!HD(i,j))return j>=20&&i<=10?'#433900':rp(BONE,v+.15,i,j);
      const e=Math.hypot(i-20,j-14);if(e<1.4)return '#000000';if(e<2.6)return (i<20&&j<14)?'#ffffff':'#ffffaa';if(e<3.4)return '#000000';
      if(j>=13&&j<=14&&i>=23&&i<=32)return '#000000';
      if((i===19&&(j===18||j===19))||(i===18&&(j===20||j===21))||(i===19&&j===22)||(i===20&&j===23))return '#000000';
      if(j<11||i>28)return rp(LAPIS,v+.25,i,j);if(i>=23&&j>=15&&j<=19)return rp(['#9a6759','#ffffaa','#ffffff'],v,i,j);return rp(GOLD,v+.15,i,j)}));
    put(ARM([[30,32],[14,38],[6,36]]));put(ANKH(3,26));
    /* damage: cracks that leak sunlight, missing inlay */
    if(dmg){const id=g.getImageData(0,0,c.width,c.height),dd=id.data,al=(x,y)=>x>=0&&y>=0&&x<c.width&&y<c.height&&dd[(y*c.width+x)*4+3]>0;sd=700+dmg;
      for(let q=0;q<dmg*7;q++){let x=lr(8,46),y=lr(10,90),a=lr(0,TAU);for(let s=0;s<lr(5,11);s++){const xi=Math.round(x),yi=Math.round(y);if(al(xi,yi)&&al(xi+1,yi)&&al(xi,yi+1)){g.fillStyle='#000000';g.fillRect(xi,yi,1,1);if(dmg>1){g.fillStyle=(s&1)?'#ffffaa':'#ff7777';g.fillRect(xi+1,yi,1,1)}}x+=Math.cos(a);y+=Math.sin(a);a+=lr(-.7,.7)}}
      if(dmg>1)for(let q=0;q<10;q++){const x=Math.round(lr(10,46)),y=Math.round(lr(60,92));if(al(x,y)&&al(x+1,y+1)){g.fillStyle='#000000';g.fillRect(x,y,2,2)}}}
    return c;
  }
  const BODY=[0,1,2].map(bodySprite),BODYW=whiteOf(BODY[0]);

  /* the dune ripper worm (mini boss) */
  const RH=[],RHO=[],RHW=[];for(let k=0;k<16;k++){const a=k/16*TAU,c1=wormHead(13,a,false,true),c2=wormHead(13,a,true,true);RH.push(c1);RHO.push(c2);RHW.push(whiteOf(c1))}
  const RSR=[12,11.6,11.2,10.7,10.2,9.6,9,8.4,7.7,7,6.3,5.5],RSG=RSR.map((r,k)=>wormSeg(r,true,k)),RSGW=RSG.map(whiteOf);
  const MOUND=paint(34,10,(i,j)=>{const t=Math.abs(i-16.5)/17,top=10-Math.round(9*Math.pow(1-t*t,1.3));if(j<top)return null;return j===top?'#ffffaa':rp(['#9a3a3a','#ff9966','#ffffaa'],.7-(j-top)*.08-(i>17?.25:0),i,j)},'#68372b');

  /* =====================================================================
     BEHAVIOUR HELPERS
     ===================================================================== */
  const npos=()=>clk(bgT())*NEAR_V;
  const duneAt=sx=>GY[mod(Math.round(sx+npos()),NW)];
  function sfx(){sfxEnemyLaser()}
  function dust(x,y,n,up){for(let k=0;k<n;k++){const l=rnd(.35,.8);FX.push({x:x+rnd(-4,4),y:y+rnd(-2,2),vx:rnd(-50,40),vy:-rnd(up||30,(up||30)*2.6),life:l,l0:l,c:['#ffffaa','#ff9966','#9a6759'][k%3],s:k%3?1:2})}}
  /* worm bodies follow the head along a trail */
  function pushTrail(e){let lx=e.last[0],ly=e.last[1],dx=e.hx-lx,dy=e.hy-ly,d=Math.hypot(dx,dy);
    while(d>=1.5){const k=1.5/d;lx+=dx*k;ly+=dy*k;e.tr.push(lx,ly);dx=e.hx-lx;dy=e.hy-ly;d=Math.hypot(dx,dy)}
    e.last[0]=lx;e.last[1]=ly;if(e.tr.length>1600)e.tr.splice(0,e.tr.length-1600)}
  function placeSegs(e,n,sp){const L=e.tr.length>>1;for(let k=0;k<n;k++){const q=Math.max(0,L-1-Math.round((k+1)*sp/1.5));e.seg[2*k]=e.tr[2*q];e.seg[2*k+1]=e.tr[2*q+1]}}
  function startTrail(e,x,y,len){e.tr.length=0;for(let k=Math.ceil(len/1.5);k>=0;k--)e.tr.push(x,y+k*1.5);e.last=[x,y];e.hx=x;e.hy=y}
  /* the box the autopilot sees: everything of the worm that is above the ground */
  function wormBox(e,n,hr,rr){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const gy=e.gy;
    if(e.hy<gy+hr){x0=e.hx-hr;x1=e.hx+hr;y0=e.hy-hr;y1=e.hy+hr}
    for(let k=0;k<n;k++){const sx=e.seg[2*k],sy=e.seg[2*k+1];if(sy==null||sy-rr[k]>gy)continue;x0=Math.min(x0,sx-rr[k]);x1=Math.max(x1,sx+rr[k]);y0=Math.min(y0,sy-rr[k]);y1=Math.max(y1,Math.min(gy,sy+rr[k]))}
    if(x0>x1)return false;e.x=(x0+x1)/2;e.y=(y0+y1)/2;e.w=Math.max(8,x1-x0);e.h=Math.max(8,y1-y0);return true}
  function wormHitPart(e,x,y,n,hr,rr,bodyMul){if(y>e.gy+1)return 0;if(Math.hypot(x-e.hx,y-e.hy)<hr+1)return 1;
    for(let k=0;k<n;k++){const sx=e.seg[2*k],sy=e.seg[2*k+1];if(sy!=null&&Math.hypot(x-sx,y-sy)<rr[k]+1)return bodyMul}return 0}
  function wormTouchPart(e,px,py,n,hr,rr){if(py>e.gy+8)return false;if(Math.hypot(px-e.hx,py-e.hy)<hr+6)return true;
    for(let k=0;k<n;k++){const sx=e.seg[2*k],sy=e.seg[2*k+1];if(sy!=null&&sy<e.gy+rr[k]*.5&&Math.hypot(px-sx,py-sy)<rr[k]+5)return true}return false}
  function drawWorm(c,e,n,heads,headsW,segs,segsW,rr,fl,open){
    c.save();c.beginPath();c.rect(-20,-20,W+40,e.gy+20+1);c.clip();
    for(let k=n-1;k>=0;k--){const sx=e.seg[2*k],sy=e.seg[2*k+1];if(sy==null||sy-rr[k]>e.gy+2)continue;const im=fl?segsW[k]:segs[k];c.drawImage(im,Math.floor(sx-im.width/2),Math.floor(sy-im.height/2))}
    if(e.hy-14<e.gy){const a=Math.atan2(e.hvy,e.hvx),k=mod(Math.round(a/TAU*16),16),im=fl?headsW[k]:(open?e.openSet||heads:heads)[k];c.drawImage(im,Math.floor(e.hx-im.width/2),Math.floor(e.hy-im.height/2))}
    c.restore()}
  /* fuses: scarab bombs and royal sun balls burst */
  function popBomb(b){const lv=lvl();
    if(b.sty==='sunb'){const n=[9,11,12][lv-1];if(room(n)){const a0=aimA(b.x,b.y);for(let i=0;i<n;i++){const a=a0+i/n*TAU;ebShot(b.x,b.y,Math.cos(a)*46,Math.sin(a)*46,{sty:'grit',life:4})}}
      FX.push({ring:1,x:b.x,y:b.y,r:2,life:.35,max:16,col:'#ffffaa'})}
    else{const n=lv>=2?6:5;if(room(n)){const a0=Math.random()*TAU;for(let i=0;i<n;i++){const a=a0+i/n*TAU;ebShot(b.x,b.y,Math.cos(a)*44,Math.sin(a)*44,{sty:'grit',life:3})}}
      FX.push({ring:1,x:b.x,y:b.y,r:2,life:.3,max:10,col:'#ff9966'})}
    sfx()}

  /* =====================================================================
     RA, the boss: geometry
     ===================================================================== */
  const discXY=b=>[b.x+10,b.y-22];
  const eyeXY=b=>[b.x-8,b.y-26];
  const ankhA=b=>[b.x-25,b.y-11],ankhB=b=>[b.x-23,b.y+5];
  function raPh(b){const f=b.hp/b.mhp,L=lvl(),enr=L>=3?.3:L>=2?.2:-1;return f>.72?1:f>.45?2:f>enr?3:4}
  const LANES=[32,67.5,103,138.5,174];

  const A={noFG:true,enemies:{},bullets:{}};

  /* ---------- background drawing ---------- */
  A.drawBackground=function(t){
    sync();const a=clk(t),c=ctx;
    c.drawImage(SKY,0,0);
    strip(CIR,a*CIR_V,TOP+4);
    strip(FCAN,a*FCAN_V,TOP);
    strip(FAR,a*FAR_V,FY);
    strip(FD,a*FD_V,FDY);
    /* heat shimmer: the horizon band wobbles row by row */
    for(let y=HZ-24;y<HZ+12;y+=2){const o=Math.round(Math.sin(y*.8+a*6.5)*1.1+Math.sin(y*.31-a*3.3)*.7);if(o)c.drawImage(c.canvas,0,y,W,2,o,y,W,2)}
    strip(MID,a*MID_V,MY);
    strip(CAN,a*NEAR_V,TOP);
    strip(NEAR,a*NEAR_V,NY);
    /* sand blowing off the near crests */
    {const ns=a*NEAR_V,no=mod(ns,NW);for(let q=0;q<CREST.length;q++){let sx=CREST[q]-no;if(sx<-20)sx+=NW;if(sx<-20||sx>W+4)continue;const cy=GY[CREST[q]];
      for(let k=0;k<4;k++){const ph=mod(a*2.4+k*.25+q*.37,1);c.fillStyle=ph<.4?'#ffffaa':'#ff9966';c.fillRect(Math.floor(sx-ph*22),Math.floor(cy-1-ph*5-Math.sin(ph*6+k)*1.5),ph<.5?2:1,1)}}}
    const s=stormAt(lvT(t));
    if(s.h>0)c.drawImage(HAZE,0,Math.round(BOT-64*s.h));
    if(s.dim>.25)c.drawImage(DIM,0,TOP);
  };
  /* sandstorm wall over the enemies, under the ship and the shots */
  A.drawMidground=function(t){const a=clk(t),s=stormAt(lvT(t)),c=ctx;
    if(s.x>-SWW-10&&s.x<W+10){c.drawImage(WALL[Math.floor(a*10)%3],Math.floor(s.x),TOP);
      for(let k=0;k<14;k++){const ph=mod(a*1.7+k*.137,1),x=Math.floor(s.x-30+ph*(SWW+60)-((a*140+k*53)%60)),y=TOP+6+((k*37)%(BOT-TOP-12));c.fillStyle=k%3?'#ff9966':'#ffffaa';c.fillRect(x,y,6+(k%4)*3,1)}}};
  A.drawForeground=function(t){const a=clk(t),s=stormAt(lvT(t)),c=ctx,st=s.x>-SWW&&s.x<W+40?1:s.h;
    const n=Math.round(18+st*26);
    for(let i=0;i<n;i++){const p=GR[i],x=mod(p.x-a*p.v*(1+st*1.6),W),y=p.y+Math.sin(a*1.7+p.ph)*3;if(((a*3+p.ph)%1)<.8){c.fillStyle=p.c;c.fillRect(x|0,y|0,p.l+(st>.5?2:0),1)}}};

  A.tick=function(dt,live){
    sync();
    if(G.boss||G.state!=='play')S.bt+=dt;
    /* no new sandstorm while the mini boss or the boss is on screen */
    {const a=lvT(bgT());if(mod(a-ST0,STC)<3&&(G.boss||G.mini))S.skip=Math.floor((a-ST0)/STC)}
    for(const b of EB)if(b.fuse&&!b.pop&&b.t>=b.fuse){b.pop=1;b.life=1e-6;if(live)popBomb(b)}
  };

  /* ---------- enemies ---------- */
  const E_=A.enemies;
  /* SCARAB SWARMS: buzzing formation flyers; some carry a bomb they drop over the ship's lane */
  E_.ring={frames:SCA,white:SCAW,w:14,h:11,vx:-46,
    init(e,o){e.bomb=o.bomb!=null?!!o.bomb:Math.random()<.3;e.y0=clamp(e.y0,TOP+26,BOT-34);e.y=e.y0;e.amp=o.amp||rnd(12,20);e.bz=rnd(0,9);e.shootT=rnd(1.2,2.8);e.dropT=rnd(.6,2.2);
      if(o.sum){e.x=o.sx;e.y0=o.sy;e.vx=-58}},
    move(e,dt,live){e.x+=e.vx*dt;const w=e.t*2.6+e.ph;e.y=e.y0+Math.sin(w)*e.amp+Math.sin(e.t*23+e.bz)*1.1;e.vy=Math.cos(w)*2.6*e.amp;
      if(!live||e.x>W-24||e.x<64)return;
      if(e.bomb){if((e.dropT-=dt)<=0&&Math.abs(e.x-P.x)<150){e.bomb=false;ebShot(e.x,e.y+6,-20,16,{sty:'sbomb',ay:34,fuse:1.3,hw:1,hh:1});sfx()}}
      else if((e.shootT-=dt)<=0){e.shootT=rnd(2.2,3.6)*TM();if(room(1)){ebAim(e.x-6,e.y,68,rnd(-.08,.08),{sty:'grit'});sfx()}}},
    draw(c,e,fl){const im=(fl?SCAW:SCA)[Math.floor(e.t*18+e.bz)%4];const x=Math.floor(e.x-im.width/2),y=Math.floor(e.y-im.height/2);c.drawImage(im,x,y);
      if(e.bomb&&!fl){c.drawImage(SBOMB,x+13,y+(im.height>>1)+3);if(Math.floor(e.t*8)%2){c.fillStyle='#ffffff';c.fillRect(x+15,y+(im.height>>1)+2,1,1)}}}};
  /* ROYAL SCARAB BOMBERS: hold the line and drop sun balls that burst into aimed rings */
  E_.ringR={frames:ROY,white:ROYW,w:22,h:16,hp:4,pts:320,vx:-34,
    init(e){e.y0=clamp(e.y0,TOP+30,110);e.y=e.y0;e.dropT=rnd(1,2);e.shootT=rnd(1.5,2.5);e.bz=rnd(0,9)},
    move(e,dt,live){e.x+=e.vx*(e.x>200?1.4:.7)*dt;const w=e.t*1.5+e.ph;e.y=e.y0+Math.sin(w)*10+Math.sin(e.t*19+e.bz)*.8;e.vy=Math.cos(w)*15;
      if(!live||e.x>W-24||e.x<60)return;
      if((e.dropT-=dt)<=0){e.dropT=rnd(3,3.8)*TM();ebShot(e.x-2,e.y+9,-22,20,{sty:'sunb',ay:30,fuse:1.35,hw:2,hh:2});sfx()}
      if(lvl()>=2&&(e.shootT-=dt)<=0){e.shootT=rnd(2.6,3.4)*TM();if(room(3)){ebFan(e.x-10,e.y,3,.4,66,aimA(e.x-10,e.y),{sty:'grit'});sfx()}}},
    draw(c,e,fl){const im=(fl?ROYW:ROY)[Math.floor(e.t*16+e.bz)%4];const x=Math.floor(e.x-im.width/2),y=Math.floor(e.y-im.height/2);
      c.drawImage(im,x,y);if(!fl){const by=y+(im.height>>1)-3;c.fillStyle='#000000';c.fillRect(x-7,by-1,9,9);c.drawImage(SUNB,x-6,by);
        if(e.dropT<.35&&Math.floor(e.t*16)%2){c.fillStyle='#ffffff';c.fillRect(x-4,by+2,5,5)}}}};
  /* VULTURE GLIDERS: glide in, circle once (the telegraph), then dive at the ship with talons out and a feather fan */
  E_.dart={frames:VUL,white:VULW,w:26,h:14,hp:2,pts:220,vx:-84,
    init(e,o){e.st=0;e.y=clamp(o.rand?rnd(TOP+24,96):e.y,TOP+24,BOT-60);e.y0=e.y;e.cx=rnd(196,262);e.vy=0;e.lt=0},
    move(e,dt,live){
      if(e.st===0){e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.t*2)*5;e.vy=Math.cos(e.t*2)*10;if(e.x<=e.cx){e.st=1;e.lt=0;e.ox=e.x;e.oy=e.y+16}}
      else if(e.st===1){e.lt+=dt;const om=4.6,p=-Math.PI/2-e.lt*om;e.vx=16*om*Math.sin(p);e.vy=-16*om*Math.cos(p);e.x=e.ox+16*Math.cos(p);e.y=e.oy+16*Math.sin(p);
        if(e.lt>=TAU/om){e.st=2;e.lt=0;const a=Math.atan2(P.y-e.y,P.x-e.x),sp=[150,162,175][lvl()-1];e.vx=Math.cos(a)*sp;e.vy=Math.sin(a)*sp;
          if(live&&room(5)){const n=lvl()>=2?5:3;ebFan(e.x-6,e.y,n,.7,62,a,{sty:'feather'});sfx()}}}
      else if(e.st===2){e.lt+=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.lt>.9||e.x<P.x-10){e.st=3}}
      else{e.vy-=200*dt;e.vx=Math.min(e.vx,-90);e.x+=e.vx*dt;e.y+=e.vy*dt}},
    draw(c,e,fl){const set=fl?VULW:VUL;let k;
      if(e.st===2)k=4;else if(e.st===1)k=[1,2,3,2][Math.floor(e.t*10)%4];else k=[0,0,1,2,3,2][Math.floor(e.t*6)%6];
      const im=set[k];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2));
      if(!fl&&e.st===1&&Math.floor(e.t*14)%2){c.fillStyle='#ffffff';c.fillRect(Math.floor(e.x-13),Math.floor(e.y-4),2,2)}}};
  /* SCORPION WALKERS: glued to the near dunes, they cock the tail and lob stinger shots in a gentle arc */
  E_.cross={frames:SCO,white:SCOW,w:20,h:13,hp:4,pts:260,
    init(e){e.wx=e.x+npos();e.cs=rnd(8,16);e.shootT=rnd(.8,2);e.cock=0;const gx=mod(Math.round(e.wx),NW);e.y=GW[gx]-8},
    move(e,dt,live){e.wx-=e.cs*dt;const n=npos();e.x=e.wx-n;e.y=GW[mod(Math.round(e.wx),NW)]-8;e.vx=-(NEAR_V+e.cs);e.vy=0;
      if(e.cock>0){e.cock-=dt;if(e.cock<=0&&live){const L=lvl(),T=1.5,ay=34,n2=L>=2?3:2;
          if(room(n2)){for(let q=0;q<n2;q++){const tx=P.x+(q-(n2-1)/2)*26,vx=clamp((tx-e.x)/T,-120,-20),vy=clamp((P.y-e.y)/T-.5*ay*T,-130,-30);ebShot(e.x-4,e.y-10,vx,vy,{sty:'sting',ay,life:3.2})}sfx()}}}
      else if(live&&e.x<W-16&&e.x>110&&(e.shootT-=dt)<=0){e.shootT=rnd(2,2.8)*TM();e.cock=.45}},
    draw(c,e,fl){const set=fl?SCOW:SCO,im=e.cock>0?set[4]:set[Math.floor(e.t*9)%4];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2));
      if(!fl&&e.cock>0&&Math.floor(e.t*20)%2){c.fillStyle='#ffffff';c.fillRect(Math.floor(e.x-4),Math.floor(e.y-8),2,2)}}};
  /* SAND WORMS: a dust ring marks the spot, then the worm bursts out, arcs over, spits grit at the top and dives back in */
  const PWR=[7].concat(WSR);
  E_.pod={frames:[WH[8],WH[6],WH[10]].concat(WSG.slice(0,4)),white:[WHW[8]],w:16,h:14,hp:6,pts:420,vx:-1,
    init(e,o){e.st=0;e.wt=.95;e.sx=o.sx||rnd(150,205);e.gy=Math.min(BOT-10,duneAt(e.sx)+2);e.x=e.sx;e.y=e.gy-12;e.w=28;e.h=34;e.vx=0;e.vy=0;e.tr=[];e.seg=[];e.hx=e.sx;e.hy=e.gy+12;e.hvx=0;e.hvy=0;e.spit=0;e.last=[e.hx,e.hy];
      e.hitTest=(e2,x,y)=>e2.st===0?0:wormHitPart(e2,x,y,7,7,WSR,.6);e.touch=(e2,px,py)=>e2.st===0?false:wormTouchPart(e2,px,py,7,7,WSR)},
    move(e,dt,live){
      if(e.st===0){e.wt-=dt;e.x=e.sx;e.y=e.gy-12;e.w=28;e.h=34;e.vx=0;e.vy=0;if(Math.random()<.3)dust(e.sx,e.gy,1,20);
        if(e.wt<=0){e.st=1;startTrail(e,e.sx,e.gy+10,60);e.hvx=e.sx<175?rnd(34,54):-rnd(40,58);e.hvy=-rnd(150,172);dust(e.sx,e.gy,10,40);shake=Math.max(shake,.12)}return}
      e.hvy+=125*dt;e.hx+=e.hvx*dt;e.hy+=e.hvy*dt;pushTrail(e);placeSegs(e,7,5.2);
      if(!e.spit&&e.hvy>-12){e.spit=1;if(live&&room(7)){const n=[3,5,5][lvl()-1];ebFan(e.hx-4,e.hy,n,.8,64,aimA(e.hx,e.hy),{sty:'grit'});sfx()}}
      if(e.hvy>0&&e.hy>e.gy&&!e.dv){e.dv=1;dust(e.hx,e.gy,8,30)}
      const vis=wormBox(e,7,7,WSR);e.vx=e.hvx*.5;e.vy=0;
      if(!vis&&e.hvy>0)e.dead=1},
    draw(c,e,fl){
      if(e.st==null){const im=fl?WHW[8]:WH[8];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2));return}
      if(e.st===0){const k=1-e.wt/.95,r=4+Math.floor(k*10),x=Math.floor(e.sx),y=Math.floor(e.gy);c.fillStyle=Math.floor(e.t*14)%2?'#ffffff':'#68372b';
        for(let q=0;q<14;q++){const a=q/14*TAU+e.t*2;c.fillRect(Math.floor(x+Math.cos(a)*r),Math.floor(y+Math.sin(a)*r*.3),1,1)}
        c.drawImage(MOUND,x-17,y-7+((Math.floor(e.t*20)%2)));return}
      drawWorm(c,e,7,WH,WHW,WSG,WSGW,WSR,fl,false);
      if(!fl&&e.hy>e.gy-14){c.fillStyle='#ffffaa';for(let q=0;q<3;q++)c.fillRect(Math.floor(e.sx-4+q*4),Math.floor(e.gy-2-((e.t*30+q*5)%6)),1,1)}}};
  /* ROCKS: sandstone blocks, falling obelisks, dust devils; and the solar beam lanes of the boss */
  E_.rock={frames:[BLK[0][0],BLK[0][2],BLS[0][0],OBL[0],OBL[3],DVB[0],DVS[0]],white:[BLKW[0][0]],
    init(e,o){
      const k=o.kind||(Math.random()<.28?'devil':'block');e.kind=k;
      if(k==='lane'){e.ly=o.ly;e.y=o.ly;e.x2=o.x2;e.x=o.x2/2;e.w=o.x2;e.h=22;e.vx=0;e.vy=0;e.lt=0;e.ch=o.ch;e.fi=o.fi;e.hp=e.mhp=1e9;e.on=false;e.pts=0;e.big=false;
        e.hitTest=()=>0;e.touch=(e2,px,py)=>e2.on&&px<e2.x2+4&&Math.abs(py-e2.ly)<14;return}
      if(k==='obel'){e.x=o.x!=null?o.x:rnd(120,290);e.y=TOP-6;e.vx=-14;e.vy=0;e.warn=1;e.w=11;e.h=24;e.big=true;e.hp=e.mhp=4*loopScale();e.spr=0;e.touch=(e2,px,py)=>e2.warn<=0&&Math.abs(px-e2.x)<e2.w/2+10&&Math.abs(py-e2.y)<e2.h/2+6;return}
      if(k==='devil'){e.big=o.big!=null?!!o.big:Math.random()<.5;e.w=e.big?12:8;e.h=e.big?32:18;e.y0=o.y&&!o.rand?clamp(o.y,TOP+30,BOT-40):rnd(TOP+30,BOT-40);e.y=e.y0;e.vx=rnd(-52,-34);e.vy=0;e.wob=rnd(0,6);e.hp=e.mhp=1e9;e.pts=0;e.hitTest=()=>0;return}
      e.spin=rnd(-6,6);e.rot=rnd(0,8)},
    move(e,dt){const k=e.kind;
      if(k==='lane'){e.lt+=dt;if(G.boss){e.x2=Math.max(40,G.boss.x-36);e.x=e.x2/2;e.w=e.x2}e.on=e.lt>=e.ch&&e.lt<e.ch+e.fi;if(e.lt>=e.ch+e.fi)e.dead=1;return}
      if(k==='obel'){if(e.warn>0){e.warn-=dt;e.x+=e.vx*dt;return}e.vy=Math.min(180,e.vy+170*dt);e.x+=e.vx*dt;e.y+=e.vy*dt;
        const g=duneAt(e.x);if(e.y+10>=g){e.dead=1;dust(e.x,g,14,50);shake=Math.max(shake,.2);sfxBoom(6,false);
          if(lvl()>=2&&room(4))for(let q=0;q<4;q++)ebShot(e.x,g-6,-50+q*20,-rnd(80,96),{sty:'grit',ay:46,life:2.6})}return}
      if(k==='devil'){e.x+=e.vx*dt;const w=e.t*1.3+e.wob;e.y=e.y0+Math.sin(w)*14;e.vy=Math.cos(w)*18;return}
      e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot=(e.rot||0)+(e.spin||3)*dt},
    draw(c,e,fl){const k=e.kind;
      if(k==='lane'){const x2=Math.floor(e.x2),y=Math.floor(e.ly);
        if(!e.on){const p=e.lt/e.ch,blink=Math.floor(e.lt*(10+p*14))%2;c.fillStyle=blink?'#ffffff':'#ff7777';const step=p>.6?4:7;
          for(let x=x2-((Math.floor(e.lt*90))%step);x>0;x-=step)c.fillRect(x,y,2,1);
          c.fillStyle='#000000';for(let x=x2-((Math.floor(e.lt*90))%step);x>0;x-=step)c.fillRect(x,y+1,2,1);
          if(p>.5){c.fillStyle=pat('#ffffaa');c.fillRect(0,y-2-Math.floor(p*4),x2,1);c.fillRect(0,y+3+Math.floor(p*4),x2,1)}
          c.fillStyle=blink?'#ffffff':'#ffffaa';c.fillRect(2,y-3,2,7);c.fillRect(4,y-2,1,5);return}
        const j=Math.floor(e.lt*30)%2,f=1-Math.min(1,(e.lt-e.ch)/.12);
        c.fillStyle='#000000';c.fillRect(0,y-11,x2,1);c.fillRect(0,y+11,x2,1);
        c.fillStyle='#ff7777';c.fillRect(0,y-10,x2,21);c.fillStyle='#ff9966';c.fillRect(0,y-8+j,x2,17-2*j);
        c.fillStyle='#ffffaa';c.fillRect(0,y-6,x2,13);c.fillStyle='#ffffff';c.fillRect(0,y-3-j,x2,7+2*j);
        if(f>0){c.fillStyle='#ffffff';c.fillRect(0,y-12,x2,25)}
        c.fillStyle='#ffffaa';for(let q=0;q<10;q++){const xx=mod(x2-e.lt*400-q*37,x2);c.fillRect(Math.floor(xx),y-9+((q*7)%18),4,1)}return}
      if(k==='obel'){if(e.warn>0){const bl=Math.floor(e.t*16)%2;c.fillStyle=bl?'#ffffff':'#ff7777';c.fillRect(Math.floor(e.x-6),TOP+1,13,2);c.fillRect(Math.floor(e.x-1),TOP+4,3,6+Math.floor((1-e.warn)*10));
          c.fillStyle='#000000';c.fillRect(Math.floor(e.x-1),TOP+11+Math.floor((1-e.warn)*10),3,1);
          for(let q=0;q<3;q++){c.fillStyle='#9a6759';c.fillRect(Math.floor(e.x-4+q*4),Math.floor(TOP+4+((e.t*40+q*7)%14)),1,1)}return}
        const im=(fl?OBLW:OBL)[Math.floor(e.t*5)%8];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2));return}
      if(k==='devil'){const set=e.big?DVB:DVS,im=set[Math.floor(e.t*14)%6],x=Math.floor(e.x-im.width/2),y=Math.floor(e.y-im.height/2);c.drawImage(im,x,y);
        for(let q=0;q<5;q++){const a=e.t*7+q*1.3,yy=y+((q*9+Math.floor(e.t*20))%im.height);c.fillStyle=q%2?'#68372b':'#ffffaa';c.fillRect(Math.floor(e.x+Math.cos(a)*(im.width/2+1)*(1-(yy-y)/im.height*.6)),yy,q%2?2:1,1)}return}
      const set=e.big?BLK:BLS,si=(e.spr||0)%2,fr=((Math.floor(e.rot!=null?e.rot:e.t*4)%8)+8)%8,im=(fl?(e.big?BLKW:BLSW):set)[si][fr];
      c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2))}};

  /* ---------- enemy bullet styles: dark outlines so they read on the bright sky ---------- */
  A.bullets={
    grit(c,b){const x=Math.floor(b.x),y=Math.floor(b.y);c.fillStyle='#000000';c.fillRect(x-2,y-1,5,3);c.fillRect(x-1,y-2,3,5);
      c.fillStyle='#9a3a3a';c.fillRect(x-1,y-1,3,3);c.fillStyle=Math.floor(b.t*12)%2?'#ffffff':'#ff7777';c.fillRect(x-1,y-1,2,2)},
    sol(c,b){const x=Math.floor(b.x),y=Math.floor(b.y),f=Math.floor(b.t*16)%2;c.fillStyle='#000000';c.fillRect(x-3,y-2,7,5);c.fillRect(x-2,y-3,5,7);
      c.fillStyle='#ff7777';c.fillRect(x-2,y-2,5,5);c.fillStyle=f?'#ffffff':'#ffffaa';c.fillRect(x-1,y-2,3,5);c.fillRect(x-2,y-1,5,3);c.fillStyle='#ffffff';c.fillRect(x-1,y-1,3,3)},
    sun(c,b){const x=Math.floor(b.x),y=Math.floor(b.y);c.fillStyle='#000000';c.fillRect(x-2,y-2,5,5);c.fillStyle='#ff7777';c.fillRect(x-1,y-1,3,3);c.fillStyle=Math.floor(b.t*10)%2?'#ffffaa':'#ffffff';c.fillRect(x,y-1,1,3);c.fillRect(x-1,y,3,1)},
    flare(c,b){const x=Math.floor(b.x),y=Math.floor(b.y),l=Math.hypot(b.vx,b.vy)||1,tx=-b.vx/l,ty=-b.vy/l;
      c.fillStyle='#9a3a3a';c.fillRect(Math.floor(x+tx*7),Math.floor(y+ty*7),2,2);c.fillStyle='#ff9966';c.fillRect(Math.floor(x+tx*4.5-1),Math.floor(y+ty*4.5-1),2,2);
      c.fillStyle='#000000';c.fillRect(x-2,y-2,5,5);c.fillStyle='#ff7777';c.fillRect(x-1,y-1,3,3);c.fillStyle='#ffffff';c.fillRect(x-1,y-1,2,2)},
    ray(c,b){const x=Math.floor(b.x),y=Math.floor(b.y),l=Math.hypot(b.vx,b.vy)||1,ux=b.vx/l,uy=b.vy/l;
      for(let k=-4;k<=4;k+=2){c.fillStyle='#000000';c.fillRect(Math.floor(x+ux*k)-1,Math.floor(y+uy*k)-1,3,3)}
      for(let k=-4;k<=4;k+=2){c.fillStyle=k<0?'#ff7777':'#ffffff';c.fillRect(Math.floor(x+ux*k),Math.floor(y+uy*k),2,1)}},
    sting(c,b){const x=Math.floor(b.x),y=Math.floor(b.y);c.fillStyle='#000000';c.fillRect(x-2,y-2,5,5);c.fillStyle='#ff7777';c.fillRect(x-1,y-1,3,3);c.fillStyle=Math.floor(b.t*14)%2?'#ffffff':'#9ad2e0';c.fillRect(x,y-1,1,2)},
    feather(c,b){const x=Math.floor(b.x),y=Math.floor(b.y),l=Math.hypot(b.vx,b.vy)||1,ux=b.vx/l,uy=b.vy/l;
      c.fillStyle='#000000';for(let k=-3;k<=2;k++)c.fillRect(Math.floor(x+ux*k)-1,Math.floor(y+uy*k)-1,3,3);
      c.fillStyle='#ff7777';for(let k=-3;k<=0;k++)c.fillRect(Math.floor(x+ux*k),Math.floor(y+uy*k),1,1);c.fillStyle='#ffffff';c.fillRect(Math.floor(x+ux*2),Math.floor(y+uy*2),1,1);c.fillRect(x,y,1,1)},
    sand(c,b){const x=Math.floor(b.x),y=Math.floor(b.y);c.fillStyle='#000000';c.fillRect(x-2,y-2,5,5);c.fillStyle='#9a3a3a';c.fillRect(x-1,y-1,3,3);c.fillStyle='#ffffaa';c.fillRect(x-1,y-1,2,1);c.fillStyle=Math.floor(b.t*8+b.y)%2?'#ffffff':'#ff7777';c.fillRect(x,y,1,1)},
    orb(c,b){const x=Math.floor(b.x),y=Math.floor(b.y),f=Math.floor(b.t*12)%2;c.fillStyle='#000000';c.fillRect(x-3,y-3,7,7);c.fillStyle='#ff7777';c.fillRect(x-2,y-3,5,7);c.fillRect(x-3,y-2,7,5);
      c.fillStyle='#ffffaa';c.fillRect(x-2,y-2,5,5);c.fillStyle=f?'#ffffff':'#ffffaa';c.fillRect(x-1,y-1,3,3);if(b.orb){c.fillStyle='#ffffff';c.fillRect(x-4+f*8,y,1,1);c.fillRect(x,y-4+f*8,1,1)}},
    sbomb(c,b){const x=Math.floor(b.x),y=Math.floor(b.y),rem=(b.fuse||1.3)-b.t;c.drawImage(SBOMB,x-3,y-3);if(rem<.4||Math.floor(b.t*8)%2){c.fillStyle=rem<.4?'#ffffff':'#ff7777';c.fillRect(x,y-3,1,1)}},
    sunb(c,b){const x=Math.floor(b.x),y=Math.floor(b.y),rem=(b.fuse||1.3)-b.t;c.fillStyle='#000000';c.fillRect(x-4,y-4,9,9);c.drawImage(SUNB,x-4,y-4);
      if(rem<.45&&Math.floor(b.t*20)%2){c.fillStyle='#ffffff';c.fillRect(x-2,y-2,5,5)}}
  };

  /* =====================================================================
     MINI BOSS: the dune ripper worm
     ===================================================================== */
  const RN=12,RHR=13;
  function ripErupt(e){const L=lvl(),ph2=e.hp<e.mhp*.55;
    e.st='arc';e.gy=Math.min(BOT-8,duneAt(e.tx)+3);startTrail(e,e.tx,e.gy+16,RN*8+30);e.spit=0;e.dv=0;e.immune=false;
    e.pat=(e.cyc%2===0)?'leap':'lunge';if(ph2&&e.cyc%3===2)e.pat='leap';
    if(e.pat==='leap'){e.hvx=rnd(10,30);e.hvy=-rnd(200,214)}else{e.hvx=-rnd(84,96);e.hvy=-rnd(146,156)}
    dust(e.tx,e.gy,20,60);shake=Math.max(shake,.3);sfxBoom(8,false);
    /* eruption spray: grit thrown up and to the right, falling back gently */
    const n=[5,6,7][L-1]+(ph2?2:0);if(room(n)){for(let q=0;q<n;q++){const a=-Math.PI/2+(q/(n-1)-.5)*1.5+.25;ebShot(e.tx,e.gy-8,Math.cos(a)*74,Math.sin(a)*74,{sty:'grit',ay:26,life:3.4})}}}
  A.mini={w:30,h:30,hp:1.05*HPK_MINI,
    init(e){e.st='tun';e.bx=W+150;e.tx=rnd(160,205);e.gy=BOT-12;e.x=e.bx;e.y=e.gy;e.w=24;e.h=12;e.tr=[];e.seg=[];e.cyc=0;e.immune=true;e.hx=e.bx;e.hy=BOT+30;e.hvx=-1;e.hvy=0;e.last=[e.hx,e.hy];e.curT=0;e.curW=0;e.wt=0;
      e.openSet=RHO;
      e.hitTest=(e2,x,y)=>{if(e2.st==='tun'||e2.st==='warn')return(Math.abs(x-e2.bx)<18&&y>e2.gy-12&&y<e2.gy+6)?1:0;return wormHitPart(e2,x,y,RN,RHR,RSR,.55)};
      e.touch=(e2,px,py)=>(e2.st==='arc'||e2.st==='dive')&&wormTouchPart(e2,px,py,RN,RHR,RSR)},
    update(e,dt,live){
      const L=lvl(),ph2=e.hp<e.mhp*.55;
      if(e.st==='tun'){e.immune=true;const sp=ph2?190:150,dx=e.tx-e.bx;e.bx+=Math.sign(dx)*Math.min(Math.abs(dx),sp*dt);e.gy=Math.min(BOT-8,duneAt(e.bx)+3);
        if(Math.random()<.5)dust(e.bx+rnd(-6,6),e.gy-2,1,30);
        e.x=e.bx;e.y=e.gy-4;e.w=24;e.h=12;e.vx=0;e.vy=0;
        /* sand curtain with a gap, telegraphed by a shimmering column at the right edge */
        if(live&&(ph2||L>=3)&&e.curW<=0&&(e.curT-=dt)<=0){e.curW=.9;e.curT=99;e.curG=rnd(TOP+46,BOT-50)}
        if(Math.abs(dx)<1&&e.curW<=0){e.st='warn';e.wt=L>=3?.8:.95}}
      else if(e.st==='warn'){e.wt-=dt;e.x=e.tx;e.y=e.gy-22;e.w=40;e.h=52;e.vx=0;e.vy=0;if(Math.random()<.6)dust(e.tx+rnd(-10,10),e.gy-2,1,40);
        if(e.wt<=0){if(live)ripErupt(e);else{e.st='arc';e.gy=Math.min(BOT-8,duneAt(e.tx)+3);startTrail(e,e.tx,e.gy+16,RN*8+30);e.hvx=-26;e.hvy=-206;e.pat='leap';e.spit=0;e.dv=0;e.immune=false}}}
      else{
        e.hvy+=150*dt;e.hx+=e.hvx*dt;e.hy+=e.hvy*dt;pushTrail(e);placeSegs(e,RN,8.2);
        if(!e.spit&&e.hvy>-20){e.spit=1;
          if(live){if(e.pat==='leap'){const n=[5,7,7][L-1]+(ph2?2:0);if(room(n)){ebFan(e.hx-6,e.hy,n,ph2?1.25:1.05,66,aimA(e.hx,e.hy),{sty:'grit'});sfx()}}
            else{const n=[10,12,14][L-1];if(room(n)){ebRing(e.hx,e.hy,n,48,aimA(e.hx,e.hy),{sty:'sand'});sfx()}}}}
        if(e.hvy>0&&e.hy>e.gy&&!e.dv){e.dv=1;e.st='dive';dust(e.hx,e.gy,14,50)}
        const vis=wormBox(e,RN,RHR,RSR);e.vx=0;e.vy=0;
        if(e.st==='dive'&&!vis){e.st='tun';e.cyc++;e.bx=clamp(e.hx,60,W);e.tx=ph2&&e.cyc%2===1?clamp(e.bx+rnd(50,100),150,205):rnd(150,205);e.hy=BOT+40;e.curT=e.cyc%2?0:2}}
      if(e.curW>0){e.curW-=dt;if(e.curW<=0&&live&&room(14)){ebCurtain(W-4,TOP+8,BOT-10,15,-[58,62,68][L-1],e.curG,50,{sty:'sand'});sfx()}}
      bossWear(e,live,0,0,14,10)},
    draw(c,e,fl){
      fl=fl&&Math.floor(e.t*24)%2===0;
      if(e.curW>0){const g=e.curG,bl=Math.floor(e.t*16)%2;c.fillStyle=bl?'#ffffff':'#ff7777';for(let y=TOP+8;y<BOT-10;y+=5){if(Math.abs(y-g)<25)continue;c.fillRect(W-6,y,2,2)}
        c.fillStyle='#ffffaa';c.fillRect(W-9,Math.floor(g-25),6,1);c.fillRect(W-9,Math.floor(g+25),6,1)}
      if(e.st==='tun'||e.st==='warn'){const x=Math.floor(e.st==='warn'?e.tx:e.bx),y=Math.floor(e.gy),jit=Math.floor(e.t*24)%2;
        if(e.st==='warn'){const k=1-e.wt,r=6+Math.floor(k*16);c.fillStyle=Math.floor(e.t*14)%2?'#ffffff':'#000000';
          for(let q=0;q<22;q++){const a=q/22*TAU+e.t*3;c.fillRect(Math.floor(x+Math.cos(a)*r),Math.floor(y+Math.sin(a)*r*.3),2,1)}
          c.fillStyle='#ffffaa';for(let q=0;q<6;q++)c.fillRect(Math.floor(x-10+q*4),Math.floor(y-4-((e.t*60+q*9)%(10+k*20))),1,2)}
        c.drawImage(MOUND,x-17,y-8+jit);c.drawImage(MOUND,x-6-17,y-5);c.drawImage(MOUND,x+10-17,y-4+(1-jit));
        if(fl){c.fillStyle='#bbbbbb';c.fillRect(x-8,y-6,16,1)}
        c.fillStyle='#ff9966';for(let q=0;q<5;q++){const ph=(e.t*3+q*.2)%1;c.fillRect(Math.floor(x+10+ph*18),Math.floor(y-6-Math.sin(ph*3)*6),1,1)}return}
      drawWorm(c,e,RN,RH,RHW,RSG,RSGW,RSR,fl,!e.spit||Math.abs(e.hvy)<60);
      if(!fl){const x=Math.floor(e.tx);c.fillStyle='#ffffaa';for(let q=0;q<4;q++)c.fillRect(x-6+q*4,Math.floor(e.gy-2-((e.t*40+q*5)%8)),1,1)}},
    onKill(e){for(let k=0;k<RN;k+=2){const sx=e.seg[2*k],sy=e.seg[2*k+1];if(sy!=null&&sy<e.gy)dust(sx,sy,4,40)}dust(e.hx,Math.min(e.hy,e.gy),12,60)}};

  /* =====================================================================
     BOSS: Sun-god Ra
     ===================================================================== */
  function raHit(b,x,y){if(Math.abs(x-b.x)<20&&y>b.y-40&&y<b.y+50)return 1;
    const [dx,dy]=discXY(b);if(Math.hypot(x-dx,y-dy)<DISCR)return .5;
    if(Math.abs(x-b.x)<76&&y>b.y-48&&y<b.y-4)return .3;return 0}
  function raTouch(b,px,py){const [dx,dy]=discXY(b);return (Math.abs(px+10-b.x)<22&&Math.abs(py-(b.y+5))<46)||Math.hypot(px+10-dx,py-dy)<DISCR-2}
  function orbUpdate(b,dt){const [dx,dy]=discXY(b);let alive=0;
    for(let k=0;k<b.orbs.length;k++){const o=b.orbs[k];if(!o||!o.orb)continue;if(EB.indexOf(o)<0){b.orbs[k]=null;continue}alive++;
      o.oa+=dt*2.3;const tx=dx+Math.cos(o.oa)*44,ty=dy+Math.sin(o.oa)*44,vx=-Math.sin(o.oa)*44*2.3,vy=Math.cos(o.oa)*44*2.3;o.vx=vx;o.vy=vy;o.x=tx-vx*dt;o.y=ty-vy*dt}
    if(!alive)b.orbs.length=0;return alive}
  A.boss={w:96,h:84,hp:1.1*HPK_BOSS,
    init(b){b.x=250;b.y=BOT+80;b.in=true;b.bt=0;b.mt=0;b.ph=1;b.calm=0;b.wf=0;b.fan=null;b.arm=null;b.beam=null;b.spi=null;b.orbs=[];b.relT=0;
      b.T={bolt:2,ring:4,fan:2,arm:3.5,sum:5,beam:2.5,orb:1.5,spi:2.5,cur:4};b.hitTest=raHit;b.touch=raTouch},
    update(b,dt,live){
      b.bt+=dt;const ph=raPh(b),L=lvl(),tm=TM();
      if(b.in){const k=Math.min(1,b.bt/3.2),e2=1-Math.pow(1-k,3);b.x=250;b.y=BOT+80-(BOT+80-98)*e2;b.wf+=dt*4;
        if(live&&Math.random()<.5)dust(b.x+rnd(-50,50),BOT-6,1,50);if(b.bt>=3.4){b.in=false;b.calm=.8}return}
      const hold=b.beam||(b.arm&&b.arm.st===1);
      if(!hold)b.mt+=dt*[1,1,1.15,1.3,1.5][ph];
      const tx=246+Math.sin(b.mt*.42)*22,ty=98+Math.sin(b.mt*.77)*24;b.x+=(tx-b.x)*Math.min(1,dt*2);b.y+=(ty-b.y)*Math.min(1,dt*2);
      b.wf+=dt*(ph>=4?9:ph>=3?6.5:5);
      bossWear(b,live,0,-6,44,40);
      orbUpdate(b,dt);
      if(!live)return;
      if(ph!==b.ph){b.ph=ph;b.calm=1.3;shake=Math.max(shake,.45);const [dx,dy]=discXY(b);FX.push({ring:1,x:dx,y:dy,r:4,life:.5,max:60,col:ph>=4?'#ffffff':'#ffffaa'});
        b.fan=null;b.arm=null;b.spi=null;if(ph>=3)b.T.beam=2.2;b.T.cur=Math.max(b.T.cur,3);
        if(ph===4){for(let i=0;i<2;i++){const v=spawn({type:'dart',y:40+i*30});v.x=W+10+i*20}}}
      if(b.calm>0){b.calm-=dt;return}
      const [dx,dy]=discXY(b);
      /* A: aimed solar bolts from the eye */
      if((b.T.bolt-=dt)<=0){b.T.bolt=[0,1.9,1.75,1.55,1.15][ph]*tm;if(!b.beam&&room(5)){const [ex,ey]=eyeXY(b),n=ph>=3?5:3;ebFan(ex,ey,n,ph>=3?.56:.36,72,aimA(ex,ey),{sty:'sol'});sfx()}}
      /* B: slow aimed rings from the disc */
      if((b.T.ring-=dt)<=0){b.T.ring=[0,4.6,5.8,6.4,4.6][ph]*tm;const n=[0,14,14,16,18][ph]+(L-1)*2;if(!b.beam&&room(n)){ebRing(dx,dy,n,44,aimA(dx,dy),{sty:'sun',life:7});sfx()}}
      /* C: sweeping flare fan with one gap near the ship, telegraphed by a flicker on the disc */
      if(ph>=2&&!b.fan&&!b.beam&&(b.T.fan-=dt)<=0){const N=[0,0,14,16,20][ph]+(L-1)*2,dir=Math.random()<.5?-1:1,pa=aimA(dx,dy);
        let gk=Math.round(((pa-Math.PI+(pa<0?TAU:0))*dir+.85)/1.7*(N-1));gk=clamp(gk+Math.round(rnd(-2,2)),2,N-3);b.fan={st:0,t:.7,k:0,N,dir,gk}}
      if(b.fan){const F=b.fan;F.t-=dt;
        if(F.st===0){if(F.t<=0){F.st=1;F.t=0}}
        else if(F.t<=0){F.t=.065;if(Math.abs(F.k-F.gk)>1&&room(1)){const a=Math.PI+F.dir*(-.85+1.7*F.k/(F.N-1));ebShot(dx-20,dy+6,Math.cos(a)*62,Math.sin(a)*62,{sty:'flare'})}
          if(F.k%3===0)sfx();F.k++;if(F.k>=F.N){b.fan=null;b.T.fan=[0,0,4.8,4.4,3.4][ph]*tm}}}
      /* D: beam arms. phase 2 parallel rays, phase 3 and up a crossing lattice */
      if(ph>=2&&!b.arm&&!b.beam&&(b.T.arm-=dt)<=0)b.arm={st:0,t:.8,k:0};
      if(b.arm){const R=b.arm;R.t-=dt;
        if(R.st===0){if(R.t<=0){R.st=1;R.t=0}}
        else if(R.t<=0){R.t=.1;const [ax,ay]=ankhA(b),[bx,by]=ankhB(b),n=ph>=3?7:6;
          if(room(2)){if(ph<3){ebShot(ax,ay,-170,0,{sty:'ray'});ebShot(bx,by,-170,0,{sty:'ray'})}
            else{const sp=[0,0,0,140,150][ph];ebShot(ax,ay,Math.cos(Math.PI-.3)*sp,Math.sin(Math.PI-.3)*sp,{sty:'ray'});ebShot(bx,by,Math.cos(Math.PI+.3)*sp,Math.sin(Math.PI+.3)*sp,{sty:'ray'})}}
          if(R.k%2===0)sfx();R.k++;if(R.k>=n){b.arm=null;b.T.arm=[0,0,6.4,6,5][ph]*tm}}}
      /* E: scarab swarms summoned out of the disc */
      if(ph>=2&&(b.T.sum-=dt)<=0){b.T.sum=12*tm;let n=0;for(const e of E)if(e.type==='ring')n++;
        for(let i=0;i<4&&n<7;i++,n++){spawn({type:'ring',y:dy,sum:1,sx:dx-10,sy:clamp(dy-30+i*20,TOP+30,BOT-40),bomb:L>=2&&i%2===0,amp:10})}
        if(L>=2){let r=0;for(const e of E)if(e.type==='ringR')r++;if(r<2){const q=spawn({type:'ringR',y:60});q.x=W+10}}
        FX.push({ring:1,x:dx,y:dy,r:3,life:.4,max:36,col:'#9ad2e0'})}
      /* F: the solar beam: the disc overcharges, five lanes flicker, three of them burn */
      if(ph>=3&&!b.beam&&!b.fan&&!b.arm&&(b.T.beam-=dt)<=0){
        let near=0,bd=1e9;for(let k=0;k<5;k++){const d=Math.abs(LANES[k]-P.y);if(d<bd){bd=d;near=k}}
        const g1=clamp(near+(Math.random()<.5?-1:1),0,4);let g2=g1;while(g2===g1||Math.abs(g2-g1)===0)g2=Math.floor(Math.random()*5);
        const ch=L>=3?1.15:1.3,fi=1.1;b.beam={t:0,ch,fi,dbl:ph===4&&L>=3&&!b.beamDbl};
        for(let k=0;k<5;k++)if(k!==g1&&k!==g2)spawn({type:'rock',kind:'lane',y:LANES[k],ly:LANES[k],x2:b.x-36,ch,fi});
        shake=Math.max(shake,.15)}
      if(b.beam){b.beam.t+=dt;if(b.beam.t>=b.beam.ch+b.beam.fi){const d=b.beam.dbl;b.beam=null;b.T.beam=d?.6:[0,0,0,9.5,7.5][ph]*tm;b.beamDbl=d;b.T.cur=Math.max(b.T.cur,2);b.T.ring=Math.max(b.T.ring,1.2)}}
      /* G: orbiting flares that circle the disc and then peel off at the ship */
      if(ph>=3){if(b.orbs.length===0&&(b.T.orb-=dt)<=0){const n=ph>=4?6:4;if(room(n)){for(let k=0;k<n;k++){const a=k/n*TAU;b.orbs.push(ebShot(dx+Math.cos(a)*44,dy+Math.sin(a)*44,0,0,{sty:'orb',orb:1,oa:a}))}b.relT=[0,0,0,4,3][ph]*tm;b.T.orb=5*tm}}
        else if(b.orbs.length&&!b.beam&&(b.relT-=dt)<=0){b.relT=.28;for(let k=0;k<b.orbs.length;k++){const o=b.orbs[k];if(o&&o.orb){o.orb=0;const a=aimA(o.x,o.y)+rnd(-.08,.08),sp=L>=2?80:72;o.vx=Math.cos(a)*sp;o.vy=Math.sin(a)*sp;o.life=o.t+5;sfx();break}}}}
      /* H: rotating spiral arms (enraged, and phase 3 on the hardest level) */
      if((ph===4||(ph===3&&L>=3))&&!b.beam&&!b.spi&&(b.T.spi-=dt)<=0)b.spi={t:0,a:rnd(0,TAU),dir:Math.random()<.5?-1:1,e:0};
      if(b.spi){const Q=b.spi;Q.t+=dt;Q.e-=dt;if(Q.e<=0){Q.e=.16;Q.a+=.27*Q.dir;if(room(3)){ebSpiral(dx,dy,3,50,Q.a,{sty:'sun',life:6});}if(Math.floor(Q.t*6)%2)sfx()}
        if(Q.t>2.4){b.spi=null;b.T.spi=7*tm}}
      /* I: a curtain of sand with a gap drifting in from the right edge */
      if((ph>=3||(ph>=2&&L>=2))&&!b.beam&&(b.T.cur-=dt)<=0){b.T.cur=[0,0,9,8,6.5][ph]*tm;if(room(15)){ebCurtain(W-4,TOP+6,BOT-6,17,-56,rnd(TOP+46,BOT-46),54,{sty:'sand'});sfx()}}
    },
    draw(c,b,fl){
      fl=fl&&Math.floor(b.bt*24)%2===0;   /* under heavy fire the white flash flickers instead of hiding the art */
      const f=b.hp/b.mhp,ph=raPh(b),dm=f>.6?0:f>.3?1:2,[dx,dy]=discXY(b),charging=b.beam&&b.beam.t<b.beam.ch,firing=b.beam&&!charging;
      const bx=Math.floor(b.x),by=Math.floor(b.y),fr=Math.floor(b.bt*6)%4;
      /* sun rays and disc */
      if(!fl){const rays=(charging||firing||ph>=4)?RAYH:RAYS;if(ph!==3||charging||firing||Math.floor(b.bt*3)%3)c.drawImage(rays[fr],Math.floor(dx-59),Math.floor(dy-59))}
      let dk=ph>=4?'hot':ph===3?'dim':'norm';if(charging)dk=Math.floor(b.bt*(8+b.beam.t*14))%2?'charge':dk;if(firing)dk='charge';
      if(b.fan&&b.fan.st===0&&Math.floor(b.bt*16)%2)dk='charge';
      c.drawImage(fl?DISCW:DISC[dk],Math.floor(dx-DISCR-1),Math.floor(dy-DISCR-1));
      if(!fl&&charging){const k=b.beam.t/b.beam.ch,r=Math.floor(DISCR+4+(1-k)*20);c.fillStyle=Math.floor(b.bt*20)%2?'#ffffff':'#ffffaa';for(let q=0;q<24;q++){const a=q/24*TAU+b.bt*2;c.fillRect(Math.floor(dx+Math.cos(a)*r),Math.floor(dy+Math.sin(a)*r),2,2)}}
      if(!fl&&firing){c.fillStyle='#ffffff';for(const e of E){if(e.kind!=='lane'||!e.on)continue;const x2=e.x2,ly=e.ly;for(let s=0;s<=1;s+=.08){c.fillRect(Math.floor(dx+(x2-dx)*s)-1,Math.floor(dy+(ly-dy)*s)-1,3,3)}}}
      /* wings: the far wing behind, then the near wing */
      const wf=[0,1,2,1][Math.floor(b.wf)%4];
      c.drawImage(fl?whiteOf0(wf):WFAR[dm][wf],bx+5,by-54);
      c.drawImage(fl?WINGSW[wf]:WINGS[dm][wf],bx-77,by-53);
      /* body */
      c.drawImage(fl?BODYW:BODY[dm],bx-29,by-41);
      if(fl)return;
      /* engine vents under the plinth */
      for(let q=0;q<5;q++){const h=2+((Math.floor(b.bt*20)+q*3)%4);c.fillStyle=q%2?'#ff9966':'#ffffaa';c.fillRect(bx-17+q*8,by+53,3,h);c.fillStyle='#ffffff';c.fillRect(bx-16+q*8,by+53,1,1)}
      /* eye glow before a volley, ankhs glow before the arms fire */
      if(b.T&&b.T.bolt<.35&&Math.floor(b.bt*16)%2){const [ex,ey]=eyeXY(b);c.fillStyle='#ffffff';c.fillRect(Math.floor(ex)-1,Math.floor(ey)-1,3,3)}
      if(b.arm){const on=b.arm.st===1||Math.floor(b.bt*14)%2;if(on){for(const [ax,ay] of [ankhA(b),ankhB(b)]){c.fillStyle='#9ad2e0';c.fillRect(Math.floor(ax)-3,Math.floor(ay)-3,7,7);c.fillStyle='#ffffff';c.fillRect(Math.floor(ax)-1,Math.floor(ay)-1,3,3)}
          if(b.arm.st===0){c.fillStyle=pat('#ffffff');const [ax,ay]=ankhA(b),[bx2,by2]=ankhB(b);if(ph<3){c.fillRect(0,Math.floor(ay),Math.floor(ax)-4,1);c.fillRect(0,Math.floor(by2),Math.floor(bx2)-4,1)}
            else{for(let s=0;s<60;s++){c.fillRect(Math.floor(ax-s*4*Math.cos(.3)),Math.floor(ay+s*4*Math.sin(.3)),1,1);c.fillRect(Math.floor(bx2-s*4*Math.cos(.3)),Math.floor(by2-s*4*Math.sin(.3)),1,1)}}}}}
      /* white-hot shimmer when enraged */
      if(ph>=4)for(let q=0;q<6;q++){c.fillStyle=q%2?'#ffffaa':'#ffffff';c.fillRect(Math.floor(dx-20+q*8+Math.sin(b.bt*5+q)*2),Math.floor(dy-DISCR-6-((b.bt*30+q*7)%16)),1,2)}
    },
    onKill(b){const [dx,dy]=discXY(b);for(let k=0;k<8;k++){const a=k/8*TAU;FX.push({burst:1,x:dx+Math.cos(a)*24,y:dy+Math.sin(a)*24,vx:0,vy:0,life:.5,l0:.5,max:12})}
      FX.push({ring:1,x:dx,y:dy,r:4,life:.8,max:90,col:'#ffffff'});dust(b.x,b.y+40,20,60)}
  };
  const WFARW=[0,1,2].map(f=>whiteOf(WFAR[0][f]));
  function whiteOf0(f){return WFARW[f]}

  return A;
},
script(sc,h){
  const L=h.level;
  /* give the mini boss room */
  for(let i=sc.length-1;i>=0;i--){const s=sc[i];if(s.t>41&&s.t<53&&(s.type==='ring'||s.type==='dart'||s.type==='pod'))sc.splice(i,1)}
  /* scorpion walkers on the dunes */
  for(const t of [8,20,34,57,70,80])sc.push({t,type:'cross',y:170},{t:t+1.4,type:'cross',y:170});
  if(L>=2)for(const t of [15,27,63,76])sc.push({t,type:'cross',y:170});
  if(L>=3)for(const t of [39,66])sc.push({t,type:'cross',y:170},{t:t+.9,type:'cross',y:170});
  /* vulture squadrons */
  for(const t of [12,30,55,68])h.add(t,'dart',L>=2?3:2,.9,36,22);
  if(L>=3)h.add(78,'dart',3,.7,40,26);
  /* scarab swarms in formation, the bomb carriers in the middle */
  h.add(5,'ring',7,.28,62,0,{bomb:0});h.add(5.8,'ring',3,.6,62,0,{bomb:1});
  h.add(24,'ring',6,.3,120,0);h.add(36,'ring',8,.25,80,0,{amp:24});
  h.add(60,'ring',8,.26,100,0);h.add(60.6,'ring',4,.5,100,0,{bomb:1});
  if(L>=2){h.add(17,'ring',6,.3,50,0,{bomb:1});h.add(74,'ring',8,.25,70,0)}
  /* royal scarab bombers */
  h.add(26,'ringR',2,1.6,50,40);h.add(64,'ringR',2,1.6,60,30);
  if(L>=2)h.add(50,'ringR',2,1.4,46,44);if(L>=3)h.add(80,'ringR',2,1.2,40,40);
  /* sand worms bursting out of the dunes */
  for(const t of [17,38,61,77])sc.push({t,type:'pod',y:160});
  if(L>=2)for(const t of [29,70])sc.push({t,type:'pod',y:160,sx:200});
  /* dust devils, falling obelisks, sandstone blocks */
  for(const t of [10,32,54,72])sc.push({t,type:'rock',kind:'devil',y:60+((t*7)%80),big:t%2===0});
  for(const t of [22,46,66,82])sc.push({t,type:'rock',kind:'obel'});
  if(L>=2)for(const t of [35,58,75])sc.push({t,type:'rock',kind:'obel'});
  h.add(40,'rock',6+L*2,.4,0,0,{rand:1,kind:'block'});
}
};
Object.assign(PLANETS[7],{d:'ELITE. SCORCHED DUNES AND RUINS. SCARABS, WORMS, SCORPIONS.',every:6,waves:[['ring',5,.32],['dart',2,.7],['cross',2,1.1],['rock',2,.9]]});
