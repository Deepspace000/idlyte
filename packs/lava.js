/* Idlyte art pack 3: LAVA WORLD.
   Sunset gold over a volcanic world: a huge low sun, ash clouds, a far volcano range,
   obsidian spires with lava falls, the near obsidian ridge with erupting volcanoes,
   a glowing lava river along the bottom edge, drifting ash and rising embers.
   Cast: magma darts (dart), fire elementals (ringR splits into two small ring flames),
   lava bombers (pod), slag crawlers (cross), volcanic bombs and slag (rock).
   Boss: the magma dragon rising out of the lava. */
PACKS[3]={
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
  function bake(w,h,fn){const c=mk(w,h),x=c.getContext('2d'),id=x.createImageData(w,h),d=id.data;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const col=fn(i,j);if(!col)continue;const v=rgb(col),q=(j*w+i)*4;d[q]=v[0];d[q+1]=v[1];d[q+2]=v[2];d[q+3]=255}
    x.putImageData(id,0,0);return c}
  /* colour function to sprite, with a 1 pixel black outline around it */
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
      if(o.vg)v+=(.5-j/h)*o.vg;
      if(o.rim!==0&&!D(i,j-1))v+=(o.rim||.3);
      const col=rp(ramp,v,i,j);
      if(o.paint){const c2=o.paint(i,j,v,col,D(i,j));if(c2!=null)return c2}
      return col;
    },o.out);
  }
  const anchor=(c,ax,ay)=>{c.ax=ax;c.ay=ay;return c};

  /* ---------- pack state (reset for every new run) ---------- */
  const S={g:null,bt:0,vol:[]};
  function sync(){if(S.g!==G){S.g=G;S.bt=0;S.vol=[{armed:false,tele:0,fl:0},{armed:false,tele:0,fl:0}]}}
  /* scroll clock: the level clock plus the time spent in the boss fight, so the world keeps moving */
  const clk=t=>t+(S.g===G?S.bt:0);
  const NEAR_V=38,MID_V=15,FAR_V=5,RIV_V=60;

  /* =====================================================================
     BACKGROUND
     ===================================================================== */
  const SUNX=200,SUNY=148,SR=58;
  const SKYR=['#1c1840','#352879','#6f3d86','#cc44cc','#ff7777','#ff9966','#ffffaa'];
  const SKP=[[0,0],[56,1],[112,2],[150,3],[166,4],[178,5],[192,6]];
  const skyIdx=y=>{if(y<=0)return 0;for(let k=1;k<SKP.length;k++)if(y<=SKP[k][0]){const a=SKP[k-1],b=SKP[k];return a[1]+(y-a[0])/(b[0]-a[0])*(b[1]-a[1])}return 6};
  const SKY=bake(W,H,(i,j)=>{let v=skyIdx(j);const d=Math.hypot(i-SUNX,(j-SUNY)*1.3);v+=Math.max(0,1-d/95)*.85;return rp(SKYR,v/6,i,j)});
  /* the huge low sun, with sunset bands sliding slowly down */
  const SS=2*SR+9,SC=(SS-1)/2;
  const SUN=[0,1,2,3].map(f=>bake(SS,SS,(i,j)=>{const dx=i-SC,dy=j-SC,d=Math.hypot(dx,dy);
    if(d>SR){if(d<SR+4&&((i+j)&1)&&hash(i,j,3)<(SR+4-d)/4)return '#ff7777';return null}
    if(dy>-SR*.12){const gw=1+(dy+SR*.12)/SR*3.2;if(((dy+SR+9-f*2.25)%9)<gw)return null}
    if(d>SR-1)return '#ffffaa';
    return rp(['#cc44cc','#ff7777','#ff9966','#ffffaa'],1.0-(dy+SR)/(2*SR)*1.08,i,j)}));
  function cloudStrip(w,h,n,seed,ryA,ryB,rxA,rxB,cols){sd=seed;const bl=[];for(let k=0;k<n;k++)bl.push([lr(0,w),lr(ryB+1,h-ryB-1),lr(rxA,rxB),lr(ryA,ryB)]);
    return bake(w,h,(i,j)=>{let best=0,bdy=0;for(const b of bl){let dx=Math.abs(i-b[0]);dx=Math.min(dx,w-dx);const v=1-((dx/b[2])**2+((j-b[1])/b[3])**2);if(v>best){best=v;bdy=(j-b[1])/b[3]}}
      if(best<=0)return null;best+=(hash(i>>2,j,seed)-.5)*.25;if(best<.08)return null;return cols(best,bdy,i,j)})}
  const CLH=cloudStrip(640,56,12,5,2.5,6,30,90,(v,dy,i,j)=>dy>.45?rp(['#352879','#6f3d86'],v*1.6,i,j):(v<.25&&((i+j)&1))?null:'#352879');
  const CLL=cloudStrip(640,26,7,9,1.2,3.2,40,120,(v,dy,i,j)=>dy>.35?(v>.45?'#ff77ff':'#cc44cc'):dy<-.5?'#6f3d86':'#352879');
  /* far volcano range with smoke plumes */
  const FW=640,FH=92,FY=BOT-FH,FVX=[150,470];
  const fTop=x=>{let y=60+6*Math.sin(TAU*3*x/FW)+4*Math.sin(TAU*7*x/FW+1)+2*Math.sin(TAU*17*x/FW+2);for(const v of FVX){const dx=Math.abs(x-v);y=Math.min(y,dx<=3?(dx<=1?27:26):26+(dx-3)*.5)}return y};
  const FAR=bake(FW,FH,(i,j)=>{const t=fTop(i);
    if(j<t){for(const v of FVX){const hg=26-j;if(hg<=0)continue;const pc=v-hg*.7+Math.sin(hg*.25)*2,pw=1.5+hg*.28;if(Math.abs(i-pc)<pw){const dn=.8-hg/32;if(hash(i>>1,j>>1,77)<dn&&(((i+j)&1)||dn>.5))return '#352879'}}return null}
    const dp=j-t;
    if(dp<1)return (fTop(i+1)>t+.2)?'#cc44cc':'#6f3d86';
    for(const v of FVX){if(Math.abs(i-v)<40&&j>27&&j<52){for(const sg of [-1,1]){const lx=v+sg*((j-26)+1.5)+Math.sin(j*.9)*1;if(Math.abs(i-lx)<.6&&hash(i,j,4)>.25)return j<36?'#ff7777':'#9a3a3a'}}}
    if(dp<2)return '#352879';
    return rp(['#1c1840','#352879'],.15+Math.max(0,(j-70)/22)*.6+(hash(i>>2,j>>2,11)-.5)*.2,i,j)});
  /* obsidian spires, middle depth */
  const MW=640,MH=88,MY=BOT-MH;
  sd=77;const SPI=[];for(let x=3;x<MW-6;){const w=lr(6,16);SPI.push({cx:x,w,top:lr(10,56),lean:lr(-.16,.16),crack:LR()<.5});x+=lr(12,28)}
  const mbase=x=>74+3*Math.sin(TAU*3*x/MW)+2*Math.sin(TAU*9*x/MW+1);
  const shw=(s,j,bs)=>{const t=Math.min(1,(j-s.top)/(bs+4-s.top));return s.w/2*Math.pow(t,.62)};
  const MID=bake(MW,MH,(i,j)=>{const bs=mbase(i);
    for(const s of SPI){if(j<s.top)continue;const hw=shw(s,j,bs)+(hash(j>>2,s.cx|0,5)-.5)*1.2;if(hw<=.3)continue;
      const cxx=s.cx+s.lean*(bs-j);let d=i-cxx;if(d>MW/2)d-=MW;if(d<-MW/2)d+=MW;if(Math.abs(d)>hw)continue;
      const rel=d/hw;
      if(s.crack&&j>s.top+(bs-s.top)*.4&&Math.abs(d-Math.sin(j*.55+s.cx)*hw*.35)<.55)return j>bs-6?'#ff9966':j>bs-16?'#9a3a3a':'#68372b';
      if(j<s.top+2)return '#6f3d86';
      if(rel<-.72)return '#352879';
      if(rel>.78)return j<s.top+24?'#6f3d86':'#1c1840';
      if(rel<-.05)return ((i+j*.5+s.cx*3)%10<1)?'#352879':'#1c1840';
      return '#000000'}
    if(j>=bs)return j<bs+1?'#352879':'#000000';
    return null});
  const FALLS=[];{let last=-999;for(const s of SPI){if(s.top<36&&s.cx-last>150&&FALLS.length<3&&s.cx<MW-20){const bs=mbase(s.cx),ly=Math.round(s.top+(bs-s.top)*.32),fx=Math.round(s.cx+s.lean*(bs-ly)+shw(s,ly,bs))+1;FALLS.push({x:fx,y:ly});last=s.cx}}}
  const FT=bake(5,160,(i,j)=>{if(((j+i*3)%16)<2)return (i===0||i===4)?'#ff7777':'#ffffaa';if(((j+7+i*5)%16)<1)return '#9a3a3a';return ['#9a3a3a','#ff7777','#ff9966','#ff7777','#9a3a3a'][i]});
  sd=91;const STL=[];for(let x=0;x<MW;){STL.push({cx:x,len:lr(4,22),w:lr(3,9)});x+=lr(9,30)}
  const MIDC=bake(MW,26,(i,j)=>{if(j<2)return '#1c1840';for(const s of STL){let d=i-s.cx;if(d>MW/2)d-=MW;if(d<-MW/2)d+=MW;const t=j/s.len;if(t>1)continue;const hw=s.w/2*Math.pow(1-t,.8);if(Math.abs(d)>hw)continue;if(d/hw>.55)return '#352879';if(t>.82)return '#68372b';return '#1c1840'}return null});
  /* near ridge, volcanoes and ceiling: profiles shared with the slag crawlers */
  const NW=960,NH=56,NY=BOT-NH,VX=[250,700];
  const GY=new Float32Array(NW),CY=new Float32Array(NW),GW=new Float32Array(NW),CW=new Float32Array(NW);
  const s2=(k,x,p)=>Math.sin(TAU*k*x/NW+(p||0));
  const coneY=(x,vx)=>{const dx=Math.abs(x-vx);return dx<=4?(dx<=2?147.5:146):146+(dx-4)*.62};
  sd=101;const OUTC=[];for(let k=0;k<16;k++){let c=lr(0,NW);while(VX.some(v=>Math.abs(c-v)<70))c=lr(0,NW);OUTC.push([c,lr(6,13),lr(5,11)])}
  for(let x=0;x<NW;x++){
    let y=173+2.5*s2(5,x)+2*s2(11,x,1)+1.2*s2(37,x,2)+(hash(x>>2,9)-.5)*1.6;
    for(const o of OUTC){let dx=Math.abs(x-o[0]);dx=Math.min(dx,NW-dx);if(dx<o[1]/2)y=Math.min(y,173-o[2]*Math.pow(1-dx/(o[1]/2),1.3))}
    for(const v of VX)y=Math.min(y,coneY(x,v));
    GY[x]=Math.round(Math.min(184,y));
    CY[x]=Math.round(20+2.2*s2(4,x)+1.6*s2(13,x,2)+(hash(x>>2,19)-.5)*1.4);
  }
  sd=131;for(let k=0;k<14;k++){const c=Math.floor(lr(0,NW)),L=lr(3,7);for(let d=-3;d<=3;d++){const x=(c+d+NW)%NW;CY[x]+=Math.round(L*(1-Math.abs(d)/3.5))}}
  for(let x=0;x<NW;x++){let g=999,cc=0;for(let d=-6;d<=6;d++){const q=(x+d+NW)%NW;g=Math.min(g,GY[q]);cc=Math.max(cc,CY[q])}GW[x]=g;CW[x]=cc}
  const CRK=new Set();sd=55;for(let k=0;k<80;k++){let x=lr(0,NW),y=lr(152,184),a=lr(-2.4,-.7);const n=lr(4,12);for(let s=0;s<n;s++){CRK.add(((Math.round(x)%NW+NW)%NW)+','+Math.round(y));x+=Math.cos(a)*1.2;y+=Math.sin(a)*1.2;a+=lr(-.6,.6)}}
  const NEAR=bake(NW,NH,(x,j)=>{const y=j+NY,g=GY[x];if(y<g)return null;const dp=y-g;
    let vol=-1;for(const v of VX)if(Math.abs(x-v)<56&&y>=coneY(x,v))vol=v;
    if(vol>=0){const ady=y-146;
      if(Math.abs(x-vol)<=2&&dp<=1)return '#ff9966';
      for(const sg of [-1,1]){const lx=vol+sg*(ady/.62+4)*.5+Math.sin(y*.7+sg)*1.1;if(ady>1&&Math.abs(x-lx)<.75&&hash(x,y,3)>.12)return ady<8?'#ffffaa':ady<20?'#ff9966':'#ff7777'}}
    if(dp===0)return vol>=0?'#9a6759':'#6f3d86';
    if(dp===1)return '#352879';
    if(CRK.has(x+','+y))return y>176?'#ffffaa':y>166?'#ff9966':'#9a3a3a';
    if(y>=180)return rp(['#000000','#68372b','#9a3a3a'],(y-180)/5,x,y);
    if(dp<12&&((x-y*.6+2000)%13)<1)return '#352879';
    return rp(['#000000','#1c1840'],(vol>=0?.6:.3)+hash(x>>1,y>>1,7)*.3,x,y)});
  const NEARC=bake(NW,24,(x,j)=>{const y=j+TOP,c=CY[x];if(y>c)return null;const dp=c-y;
    if(dp===0)return '#9a3a3a';if(dp===1)return '#68372b';if(dp===2)return '#352879';if(hash(x,y,5)<.03)return '#68372b';return '#000000'});
  /* lava river tiles */
  const RIVR=['#68372b','#9a3a3a','#ff7777','#ff9966','#ffffaa'];
  const RIV=[0,1,2].map(f=>bake(64,9,(i,j)=>{
    if(j===0)return hash(i>>1,0,f)<.18?'#ff9966':'#ffffaa';
    if((j===2||j===3)&&((i>=9&&i<=13)||(i>=40&&i<=45&&j===3)))return (i===11||i===42)?'#000000':'#68372b';
    const v=.86-j*.08+.2*Math.sin(TAU*(i/32)+j*.8-f*TAU/3)+.1*Math.sin(TAU*(i/16)-j*1.3+f*TAU/3);
    return rp(RIVR,v,i,j)}));
  /* embers, ash and storm haze */
  sd=13;const EMB=[];for(let i=0;i<20;i++)EMB.push({x:lr(0,W),o:lr(0,150),v:lr(14,34),w:lr(1,3)});
  const ASH=[];for(let i=0;i<40;i++)ASH.push({x:lr(0,W),y:lr(0,BOT-TOP),v:lr(10,28),vy:lr(3,10),c:LR()<.55?'#9a6759':(LR()<.5?'#6c6c6c':'#6f3d86'),s:LR()<.25?2:1});
  const HZT=bake(W,40,(x,j)=>hash(x,j,41)<.11*(1-j/40)?(hash(x,j,42)<.5?'#9a6759':'#6f3d86'):null);
  const HZB=bake(W,40,(x,j)=>hash(x,j,44)<.11*(j/40)?(hash(x,j,45)<.5?'#9a6759':'#68372b'):null);
  const HZM=bake(W,BOT-TOP,(x,j)=>hash(x,j,43)<.01?'#9a6759':null);
  const storm=a=>{const ph=(((a%38)+38)%38)/38;return ph>.5&&ph<.85?Math.sin((ph-.5)/.35*Math.PI):0};
  function strip(img,off,y){const w=img.width;let x=-(((off%w)+w)%w);for(;x<W;x+=w)ctx.drawImage(img,Math.floor(x),y)}

  /* =====================================================================
     ENEMY SPRITES
     ===================================================================== */
  /* magma darts: molten arrowheads, three headings */
  const DRAMP=['#1c1840','#68372b','#9a3a3a','#ff7777','#ff9966'];
  function dartSprite(ang,f){
    const Sz=21,c=10,ca=Math.cos(ang),sa=Math.sin(ang);
    const loc=(i,j)=>{const dx=i-c,dy=j-c;return [dx*ca+dy*sa,-dx*sa+dy*ca]};
    const inside=(i,j)=>{const [u,v]=loc(i,j),av=Math.abs(v);
      if(u>9.5||u<-8.5)return false;
      if(u>3)return av<=(9.5-u)/6.5*2.7;
      if(u>=-5&&av<=2.7+(3-u)*.07)return !(u<-4&&av<1.1);
      if(u<0&&av<=Math.min(5.6,2.2-u*.62)&&u>=-8+(av-2.5)*.55)return !(av<1.1);
      return false};
    return relief(Sz,Sz,inside,DRAMP,{cap:2.5,paint:(i,j,v)=>{const [u,vv]=loc(i,j),av=Math.abs(vv);
      if(u>6.5)return v>.5?'#ffffff':'#ffffaa';
      if(av<.85&&u>-4.5&&u<5)return ((Math.floor(u)+f+20)%3===0)?'#ffffff':'#ffffaa';
      if(av<1.6&&u>-4&&u<4)return '#ff9966';
      if(av>1.6&&hash(Math.round(u)+20,Math.round(vv)+20,3)<.2)return '#68372b';
      return null}});
  }
  const DART=[Math.PI,Math.PI-.62,Math.PI+.62].map(a=>[0,1,2,3].map(f=>dartSprite(a,f)));
  const DARTW=DART.map(s=>s.map(whiteOf));
  const TRAIL=['#ffffff','#ffffaa','#ffffaa','#ff9966','#ff7777','#9a3a3a','#68372b'];
  /* fire elementals: pink gold flame spirits with faces */
  const FL=['#6f3d86','#cc44cc','#ff77ff','#ff9966','#ffffaa','#ffffff'];
  function flameSprite(s,f){
    const w=Math.round(22*s)+2,h=Math.round(27*s)+1,cx=(w-1)/2,rb=6.4*s,cyb=h-2-rb,maxH=cyb-.5,ph=f/6*TAU;
    const body=(i,j)=>{const dx=i-cx,dy=j-cyb;
      if(dy>=0){const a=Math.atan2(dy,dx),rr=rb+.6*s*Math.sin(a*5+ph*2);return dx*dx+dy*dy<=rr*rr}
      const hh=-dy;if(hh>maxH)return false;
      const sh=Math.sin(hh*.42/s-ph)*hh*.16+Math.sin(ph)*.6*s,hw=rb*Math.pow(1-hh/maxH,.75)*(1+.12*Math.sin(hh*.9/s+ph*2)),ax=Math.abs(dx-sh);
      if(ax>=hw)return false;
      if(hh>rb*1.15&&ax<(hh-rb*1.15)*.2&&f%3!==1)return false;
      return true};
    const arm=(i,j)=>{for(const sg of [-1,1]){const ax=cx+sg*(rb+1.1*s),ay=cyb+.6*s+Math.sin(ph+sg)*1.3*s;if(Math.hypot(i-ax,(j-ay)*1.25)<1.8*s)return true}return false};
    const wisp=(i,j)=>Math.hypot(i-(cx+Math.sin(ph)*2.2*s),j-(1.2+(f%3)*s))<(f%2?1.2:.9)*Math.max(1,s);
    const eyeY=Math.round(cyb-1.4*s),eL=Math.round(cx-3.6*s),eR=Math.round(cx-.4*s),mY=Math.round(cyb+2.1*s);
    const face=(i,j)=>{if((i===eL||i===eR)&&(j===eyeY||(s>.8&&j===eyeY+1)))return '#1c1840';
      if(s>.8&&f%2===0&&j===mY&&i>=eL&&i<=eR-1)return '#6f3d86';return null};
    return anchor(relief(w,h,(i,j)=>body(i,j)||arm(i,j)||wisp(i,j),FL,{cap:3,paint:(i,j,v)=>{const fc=face(i,j);if(fc)return fc;
      const dx=i-(cx-s),dy=j-(cyb+.6*s),dn=Math.hypot(dx,dy*(dy<0?.55:1))/(rb*1.55);
      return rp(FL,1.02-dn+(v-.45)*.35,i,j)}}),(w+2)/2,cyb+1);
  }
  const FLB=[0,1,2,3,4,5].map(f=>flameSprite(1,f)),FLS=[0,1,2,3,4,5].map(f=>flameSprite(.62,f));
  const FLBW=FLB.map(c=>anchor(whiteOf(c),c.ax,c.ay)),FLSW=FLS.map(c=>anchor(whiteOf(c),c.ax,c.ay));
  /* lava bombers: gunmetal and bronze armour, furnace vents, a glowing bomb bay */
  const METAL=['#1c1840','#444444','#6c6c6c','#959595','#bbbbbb','#ffffff'],BRONZE=['#1c1840','#68372b','#9a6759','#ff9966','#ffffaa'];
  const VENT=['#9a3a3a','#ff7777','#ff9966','#ffffaa'];
  function bomberSprite(f){
    const hull=(i,j)=>Math.pow(Math.abs((i-13.5)/11.5),2.6)+Math.pow(Math.abs((j-7)/4.6),2.6)<=1;
    const dome=(i,j)=>Math.hypot((i-8)/3.5,(j-3.4)/2.2)<=1;
    const bayM=(i,j)=>Math.hypot((i-13)/5,(j-12)/2.8)<=1;
    const mask=(i,j)=>hull(i,j)||(i<=4&&Math.abs(j-8)<=i*.7+.6)||dome(i,j)||(i>=15&&i<=22&&j>=(22-i)*.45&&j<4)||(i>=21&&i<=25&&j>=5&&j<=10&&!(i===25&&(j===5||j===10)))||bayM(i,j)||((i===7||i===19)&&j>=12&&j<=14);
    return relief(26,16,mask,METAL,{cap:3,paint:(i,j,v)=>{
      if((i===7||i===19)&&j>=12)return j===14?'#959595':'#444444';
      if(dome(i,j)&&j<=4&&!hull(i,j)||dome(i,j)&&j<=3)return rp(['#352879','#cc44cc','#ff77ff','#ffffff'],v,i,j);
      if(j===7&&[10,11,13,14,16,17].includes(i))return VENT[(f+((i-10)>>1))%4];
      if(j===8&&[10,11,13,14,16,17].includes(i))return '#000000';
      if(i>=24&&j>=6&&j<=9)return (j===7||j===8)&&i===25?VENT[(f+2)%4]:'#000000';
      if(bayM(i,j)&&j>=11&&!hull(i,j)){if(Math.hypot(i-13,j-13)<2)return ['#ff7777','#ff9966','#ffffaa','#ff9966'][f];return rp(BRONZE,v-.15,i,j)}
      if((i===9||i===18)&&hull(i,j)&&j>2&&j<11)return '#1c1840';
      if((i===12||i===16)&&j===4||i===21&&j===7)return '#ffffff';
      if(i<=4||(hull(i,j)&&j>=9))return rp(BRONZE,v,i,j);
      return null}});
  }
  const POD=[0,1,2,3].map(bomberSprite),PODW=POD.map(whiteOf);
  /* slag crawlers: basalt beetles with molten seams and six legs, floor and ceiling versions */
  const BASALT=['#000000','#1c1840','#352879','#444444','#6c6c6c','#959595'];
  function crawlerSprite(f,roof){
    const w=20,h=13,Yf=j=>roof?h-1-j:j;
    const shell=(i,j)=>j<=9&&Math.hypot((i-11)/8.6,(j-6.2)/5.6)<=1;
    const head=(i,j)=>Math.hypot((i-3.2)/2.9,(j-8)/2.4)<=1;
    const legs=new Map();
    [5,10,15].forEach((hx,k)=>{const off=Math.round(Math.sin(f/4*TAU+k*Math.PI)*1.5);
      legs.set((hx+1)+','+10,'#352879');legs.set((hx+2-off)+','+11,'#352879');legs.set((hx+2-off)+','+12,'#352879');
      legs.set(hx+','+10,'#6c6c6c');legs.set((hx-1+off)+','+11,'#6c6c6c');legs.set((hx-2+off)+','+12,'#959595')});
    const seam=(i,j)=>shell(i,j)&&j>1&&(Math.abs(i-(8-(j-6)*.25))<.55||Math.abs(i-(14+(j-6)*.25))<.55);
    const mask=(i,j)=>{const y=Yf(j);return shell(i,y)||head(i,y)||legs.has(i+','+y)||(i===0&&(y===7||y===9))||(i===1&&y===10)};
    return relief(w,h,mask,BASALT,{cap:3,paint:(i,j,v)=>{const y=Yf(j);
      if(legs.has(i+','+y)&&!shell(i,y))return legs.get(i+','+y);
      if((i===0&&(y===7||y===9))||(i===1&&y===10))return '#ff9966';
      if(i===2&&y===7)return f%2?'#ffffff':'#ffffaa';
      if(seam(i,y))return (f>>1)%2?'#ffffaa':'#ff9966';
      if(shell(i,y)&&y===9)return '#9a3a3a';
      if(head(i,y)&&!shell(i,y))return rp(BASALT,v-.15,i,j);
      if(shell(i,y)&&hash(i,y,61)<.08)return '#9a3a3a';
      return null}});
  }
  const CRF=[0,1,2,3].map(f=>crawlerSprite(f,false)),CRR=[0,1,2,3].map(f=>crawlerSprite(f,true));
  const CRFW=CRF.map(whiteOf),CRRW=CRR.map(whiteOf);
  /* volcanic rocks: dark crust with a hot glowing core showing through cracks, 8 tumble frames */
  function rockSet(r,seed,hot){
    sd=seed;const n=10,rad=[];for(let k=0;k<n;k++)rad.push(r*(.74+LR()*.36));
    const cr=new Set();for(let q=0;q<(hot?4:3);q++){let x=0,y=0,a=LR()*TAU;for(let s=0;s<r*1.1;s++){cr.add(Math.round(x)+','+Math.round(y));x+=Math.cos(a);y+=Math.sin(a);a+=lr(-.7,.7)}}
    const Sz=r*2+3,c=(Sz-1)/2,out=[];
    const CRUST=hot?['#352879','#68372b','#9a3a3a','#ff7777','#ff9966']:['#000000','#1c1840','#352879','#68372b','#9a6759','#ff9966'];
    for(let f=0;f<8;f++){const ra=f/8*TAU,ca=Math.cos(ra),sa=Math.sin(ra);
      const lp=(i,j)=>{const dx=i-c,dy=j-c;return [dx*ca+dy*sa,-dx*sa+dy*ca]};
      const mask=(i,j)=>{const [u,v]=lp(i,j),a=(Math.atan2(v,u)+Math.PI)/TAU*n,k=Math.floor(a)%n,fr=a-Math.floor(a),rr=rad[k]*(1-fr)+rad[(k+1)%n]*fr;return Math.hypot(u,v)<=rr};
      out.push(relief(Sz,Sz,mask,CRUST,{cap:Math.max(2,r*.6),paint:(i,j)=>{const [u,w2]=lp(i,j);if(cr.has(Math.round(u)+','+Math.round(w2))){const dd=Math.hypot(u,w2)/r;return dd<.35?'#ffffff':dd<.6?'#ffffaa':dd<.85?'#ff9966':'#ff7777'}return null}}));
    }
    return out;
  }
  const RKL=[rockSet(9,3,false),rockSet(10,11,false)],RKS=[rockSet(4,5,true),rockSet(5,9,true),rockSet(4,17,true)];
  const RKLW=RKL.map(s=>s.map(whiteOf)),RKSW=RKS.map(s=>s.map(whiteOf));

  /* =====================================================================
     BOSS SPRITES: the magma dragon
     ===================================================================== */
  const BP=[
   {body:['#000000','#1c1840','#68372b','#9a3a3a','#9a6759','#ff9966'],crack:['#9a3a3a','#ff9966','#ffffaa'],belly:['#68372b','#9a3a3a','#ff9966','#ffffaa'],horn:['#1c1840','#6f4f25','#9a6759','#b8c76f','#ffffaa'],eye:['#ffffaa','#ffffff'],mouth:['#ff7777','#ff9966','#ffffaa','#ffffff'],cracks:6},
   {body:['#000000','#1c1840','#352879','#68372b','#9a3a3a','#ff7777'],crack:['#ff7777','#ff9966','#ffffaa'],belly:['#68372b','#9a3a3a','#ff7777','#ff9966'],horn:['#1c1840','#68372b','#9a6759','#b8c76f','#ffffaa'],eye:['#ff7777','#ffffff'],mouth:['#ff7777','#ff9966','#ffffaa','#ffffff'],cracks:12,broken:1},
   {body:['#68372b','#9a3a3a','#ff7777','#ff9966','#ffffaa','#ffffff'],crack:['#ffffaa','#ffffff','#ffffff'],belly:['#ff9966','#ffffaa','#ffffff','#ffffff'],horn:['#9a3a3a','#ff7777','#ff9966','#ffffaa','#ffffff'],eye:['#ffffff','#ffffff'],mouth:['#ffffaa','#ffffff','#ffffff','#ffffff'],cracks:12,broken:1}];
  sd=211;const HCR=new Set();
  for(let k=0;k<9;k++){let x=lr(10,38),y=lr(8,20),a=lr(-.6,1.2);const n=lr(3,7);for(let s=0;s<n;s++){const xi=Math.round(x),yi=Math.round(y);if(!(xi>=17&&xi<=23&&yi>=10&&yi<=14))HCR.add(xi+','+yi);x+=Math.cos(a);y+=Math.sin(a);a+=lr(-.7,.7)}}
  const HK=1.35;   /* head scale: designed on a 50x38 grid, rendered bigger */
  function headSprite(pal,jaw){
    const w=Math.round(50*HK),h=Math.round(38*HK),hx=27,hy=21,ja=[0,.2,.42][jaw],ca=Math.cos(ja),sa=Math.sin(ja);
    const jl=(i,j)=>{const dx=i-hx,dy=j-hy;return [dx*ca-dy*sa,dx*sa+dy*ca]};
    const curve=(i,j,x0,y0,cx,cy,x1,y1,t0,t1,end)=>{for(let s=0;s<=end;s+=.03){const m=1-s,px=m*m*x0+2*m*s*cx+s*s*x1,py=m*m*y0+2*m*s*cy+s*s*y1;if(Math.hypot(i-px,j-py)<t0+(t1-t0)*s)return true}return false};
    const isHorn=(i,j)=>curve(i,j,31,8,38,0,48,1,2.4,.4,pal.broken?.62:1)||curve(i,j,35,11,43,6,49,9,2,.4,1);
    const spike=(i,j)=>curve(i,j,39,25,42,27,46,30,1.5,.3,1)||curve(i,j,34,27,35,30,37,33,1.3,.3,1)||curve(i,j,9,12,8,10,6,8,1.1,.3,1)||curve(i,j,26,7,27,4,29,2,1.2,.3,1);
    const cran=(i,j)=>Math.hypot((i-28)/12,(j-15)/8.5)<=1;
    const brow=(i,j)=>Math.hypot((i-21)/5.5,(j-10.5)/2.4)<=1;
    const snout=(i,j)=>{if(i<3||i>27)return false;const top=11.6+(27-i)*.08+(i<7?(7-i)*.6:0);return j>=top&&j<=20.4};
    const throat=(i,j)=>Math.hypot((i-37)/7.5,(j-22)/7)<=1;
    const jawM=(i,j)=>{const [u,v]=jl(i,j);return u>=-20.5&&u<=3&&v>=-.5&&v<=4.6+u*.1};
    const lowTeeth=(i,j)=>{if(!jaw)return false;const [u,v]=jl(i,j);return v>=-1.7&&v<-.5&&[-18,-15,-12,-9,-6].some(t=>Math.abs(u-t)<.55)};
    const upTeeth=(i,j)=>j>20.4&&j<21.7&&[8,11,14,17,20].some(t=>Math.abs(i-t)<.55);
    const mouth=(i,j)=>{if(!jaw||i<7||i>hx+1||j<=20.4)return false;const [u,v]=jl(i,j);return v<-.5&&u>-20};
    const mask=(i,j)=>cran(i,j)||brow(i,j)||snout(i,j)||throat(i,j)||jawM(i,j)||isHorn(i,j)||spike(i,j)||upTeeth(i,j)||lowTeeth(i,j)||mouth(i,j);
    return relief(w,h,(i,j)=>mask(i/HK,j/HK),pal.body,{cap:4,paint:(pi,pj,v)=>{
      const i=pi/HK,j=pj/HK,xi=Math.floor(i),yi=Math.floor(j);
      if(upTeeth(i,j)||lowTeeth(i,j))return '#ffffff';
      if(isHorn(i,j)||spike(i,j))return rp(pal.horn,v,pi,pj);
      if(mouth(i,j)&&!jawM(i,j)&&!snout(i,j)){const u=jl(i,j)[0];return rp(pal.mouth,.35+(u+20)/22*.8,pi,pj)}
      if(i>=18.6&&i<21.8&&j>=11.8&&j<13.6)return (Math.abs(i-20.3)<.6&&j<12.7)?pal.eye[1]:(j>=12.9?'#000000':pal.eye[0]);
      if(i>=17.6&&i<22.6&&j>=11&&j<11.8)return '#000000';
      if(xi===5&&yi===14)return '#000000';
      if(HCR.has(xi+','+yi)&&!(pal.cracks<9&&hash(xi,yi,2)<.4))return rp(pal.crack,hash(pi,pj,8),pi,pj);
      if((throat(i,j)&&j>22)||(jawM(i,j)&&jl(i,j)[1]>2.6))return rp(pal.belly,.35+v*.6-((pj%3===0)?.3:0),pi,pj);
      if(hash(pi,pj,1)<.1)return rp(pal.body,v-.2,pi,pj);
      return null}});
  }
  const HEAD=BP.map(p=>[0,1,2].map(j=>headSprite(p,j))),HEADW=HEAD[0].map(whiteOf);
  const DR=[13,12,11,10,9,8,7,6,5,4];
  function disc(r,pal){
    const L=r*.5+3,Sz=Math.ceil(2*(r+L))+1,c=(Sz-1)/2,a0=-.85;
    const sp=(i,j)=>{const dx=i-c,dy=j-c,d=Math.hypot(dx,dy);let da=Math.atan2(dy,dx)-a0;da=Math.atan2(Math.sin(da),Math.cos(da));const t=(d-r*.8)/L;return t>0&&t<1&&Math.abs(da)<.36*(1-t)};
    return relief(Sz,Sz,(i,j)=>Math.hypot(i-c,j-c)<=r||sp(i,j),pal.body,{cap:r*.65,paint:(i,j,v)=>{
      if(sp(i,j)&&Math.hypot(i-c,j-c)>r-.5)return rp(pal.horn,v,i,j);
      const dx=i-c,dy=j-c,bd=(dx*-.55+dy*.84)/r;
      if(bd>.22)return rp(pal.belly,.25+bd*.75+(v-.5)*.3-((Math.round(dx*.84+dy*.55+40)%3===0)?.3:0),i,j);
      if(hash(i,j,r*7)<(pal.cracks>9?.09:.05))return rp(pal.crack,hash(i,j,9),i,j);
      if(hash(i,j,r)<.12)return rp(pal.body,v-.2,i,j);
      return null}});
  }
  const DISC=BP.map(p=>DR.map(r=>disc(r,p))),DISCW=DISC[0].map(whiteOf);
  const WK=1.5,WSX=Math.round(5*WK)+1,WSY=Math.round(60*WK)+1;
  const flipH=c=>{const o=mk(c.width,c.height),x=o.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return o};
  function wingSprite(f,pal,hurt){
    const w=74,h=64,L=[1,.86,.72,.86][f];
    const Sp=[5,60],Eb=[17,60-28*L-4],Wr=[31,Math.max(3,60-52*L-2)],F1=[71,Math.min(52,Wr[1]+5+(1-L)*14)],F2=[66,Math.min(58,Wr[1]+27+(1-L)*8)],F3=[50,61];
    const poly=[Sp,Eb,Wr,F1,F2,F3];
    const inP=(x,y)=>{let o=false;for(let a=0,b=poly.length-1;a<poly.length;b=a++){const A=poly[a],B=poly[b];if((A[1]>y)!==(B[1]>y)&&x<(B[0]-A[0])*(y-A[1])/(B[1]-A[1])+A[0])o=!o}return o};
    const cxp=poly.reduce((s,p)=>s+p[0],0)/6,cyp=poly.reduce((s,p)=>s+p[1],0)/6;
    const sc=[[F1,F2],[F2,F3],[F3,Sp]].map(([A,B])=>{const mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2,dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy);let nx=-dy/l,ny=dx/l;if(nx*(mx-cxp)+ny*(my-cyp)<0){nx=-nx;ny=-ny}return [mx+nx*l*.3,my+ny*l*.3,l*.4]});
    const segD=(x,y,A,B)=>{const dx=B[0]-A[0],dy=B[1]-A[1],t=Math.max(0,Math.min(1,((x-A[0])*dx+(y-A[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-A[0]-dx*t,y-A[1]-dy*t)};
    const bones=[[Sp,Eb,2.3],[Eb,Wr,1.8],[Wr,F1,1.1],[Wr,F2,1],[Wr,F3,1]];
    sd=300+f;const holes=hurt?[0,1,2].map(()=>[lr(38,60),lr(Wr[1]+16,50),lr(1.8,3)]):[];
    const bone=(x,y)=>{let best=9;for(const b of bones){const d=segD(x,y,b[0],b[1])/b[2];if(d<best)best=d}return best};
    const memb=(x,y)=>inP(x,y)&&!sc.some(s=>Math.hypot(x-s[0],y-s[1])<s[2])&&!holes.some(q=>Math.hypot(x-q[0],y-q[1])<q[2]);
    const wx=Math.round(Wr[0]),wy=Math.round(Wr[1]);
    const claw=(x,y)=>{x=Math.round(x);y=Math.round(y);return (y===wy-2&&(x===wx-1||x===wx-2))||(x===wx-3&&y===wy-1)};
    const aF=[F1,F2,F3].map(F=>Math.atan2(F[1]-Wr[1],F[0]-Wr[0]));
    const e1=1/WK;
    return paint(Math.round(w*WK),Math.round(h*WK),(px,py)=>{const x=px/WK,y=py/WK;
      const bd=bone(x,y);
      if(bd<1)return rp(pal.bone,1-bd*.8+(y<Wr[1]+4?.1:0),px,py);
      if(claw(x,y))return pal.bone[pal.bone.length-1];
      if(!memb(x,y))return null;
      for(const [ox,oy] of [[e1,0],[-e1,0],[0,e1],[0,-e1]])if(!memb(x+ox,y+oy)&&bone(x+ox,y+oy)>=1)return pal.edge;
      const a=Math.atan2(y-Wr[1],x-Wr[0]),sec=a<aF[0]?0:a<aF[1]?1:a<aF[2]?2:3;
      return rp(pal.memb,[.72,.5,.66,.44][sec]-(y/h)*.3+(bd<1.8?.18:0),px,py)});
  }
  const WP=[{memb:['#1c1840','#352879','#6f3d86','#cc44cc'],bone:['#1c1840','#68372b','#9a6759','#ff9966','#ffffaa'],edge:'#ff9966'},
            {memb:['#1c1840','#352879','#6f3d86','#cc44cc'],bone:['#1c1840','#68372b','#9a6759','#ff9966','#ffffaa'],edge:'#ff7777'},
            {memb:['#68372b','#9a3a3a','#ff7777','#ff9966'],bone:['#9a3a3a','#ff9966','#ffffaa','#ffffff'],edge:'#ffffaa'}];
  const WING=WP.map((p,i)=>[0,1,2,3].map(f=>flipH(wingSprite(f,p,i>0)))),WINGW=WING[0].map(whiteOf);
  const WFAR=[0,1,2,3].map(f=>wingSprite(f,{memb:['#000000','#1c1840','#352879','#6f3d86'],bone:['#000000','#1c1840','#68372b','#9a6759'],edge:'#9a3a3a'},false));
  const TIP=BP.map(p=>relief(13,12,(i,j)=>{const dx=Math.abs(i-6);return j<6?dx<=j*.9:j<9?dx<=(9-j)*1.6+.5:dx<=1.2},p.body,{cap:2.5,paint:(i,j)=>(Math.abs(i-6)<.5&&j>1&&j<8)?p.crack[1]:null})),TIPW=whiteOf(TIP[0]);
  const SPL=[0,1,2].map(f=>{sd=500+f;const dr=[0,1,2,3,4].map(()=>[lr(6,54),lr(0,7),lr(.8,1.6)]);
    return paint(60,16,(i,j)=>{const top=9+Math.sin(i*.45+f*2.1)*1.3+Math.pow(Math.abs(i-30)/30,2)*6;
      if(j>=top){const d=j-top;return d<1?'#ffffaa':rp(['#9a3a3a','#ff7777','#ff9966'],.9-d*.12+(hash(i,j,f)-.5)*.3,i,j)}
      for(const q of dr)if(Math.hypot(i-q[0],j-q[1])<q[2])return '#ff9966';return null})});

  /* =====================================================================
     BEHAVIOUR HELPERS
     ===================================================================== */
  const npos=()=>clk(bgT())*NEAR_V;
  function crPlace(e){const n=npos();e.x=e.wx-n;const gx=((Math.round(e.wx)%NW)+NW)%NW;e.y=e.roof?CW[gx]+6:GW[gx]-5}
  function burst(b){
    {const n=EB.length<18?6:EB.length<26?4:0,a0=Math.random()*TAU;for(let i=0;i<n;i++){const a=a0+i/n*TAU;ebShot(b.x,b.y,Math.cos(a)*40,Math.sin(a)*40,{sty:'spark',life:2.6})}}
    FX.push({ring:1,x:b.x,y:b.y,r:2,life:.3,max:10,col:'#ffffaa'});
    for(let k=0;k<4;k++){const l=rnd(.25,.45);FX.push({x:b.x,y:b.y,vx:rnd(-40,40),vy:rnd(-40,40),life:l,l0:l,ramp:1,s:1})}
    sfxEnemyLaser();
  }
  function bomb(x,y,vx,vy,ay,fuse){return ebShot(x,y,vx,vy,{sty:'bomb',ay,fuse,hw:2,hh:2})}
  function rumble(){try{if(SPEED<4&&typeof sfxOn==='function'&&sfxOn('lavaRumble',1.5))sfxNoise(1,.06,180,50,'lowpass',{att:.4})}catch(err){}}
  function erupt(sx,cy){
    const n=[3,4,5][Math.min(2,(G.level||1)-1)]+(G.loop>4?1:0),bigI=Math.floor(Math.random()*n);
    for(let k=0;k<n;k++){const sp=k-(n-1)/2;spawn({type:'rock',erupt:1,x:sx+sp*2,y:cy-5,vx:-NEAR_V+sp*24+rnd(-5,5),vy:-rnd(72,92),big:k===bigI&&Math.random()<.6})}
    for(let k=0;k<12;k++){const l=rnd(.4,.8);FX.push({x:sx+rnd(-3,3),y:cy-4,vx:rnd(-40,40),vy:rnd(-90,-30),life:l,l0:l,ramp:1,s:2})}
    shake=Math.max(shake,.25);sfxBoom(8,false);
  }

  /* =====================================================================
     BOSS LOGIC
     ===================================================================== */
  const NS=13;
  function bossNeck(b){
    const x0=b.baseX,y0=BOT+18,x3=b.x+16,y3=b.y+9,x1=x0+12,y1=y0-(y0-y3)*.6,x2=x3+44,y2=y3+4;
    const pt=(u,o)=>{const m=1-u,a=m*m*m,bb=3*m*m*u,cc=3*m*u*u,dd=u*u*u;o.x=a*x0+bb*x1+cc*x2+dd*x3;o.y=a*y0+bb*y1+cc*y2+dd*y3};
    for(let k=0;k<NS;k++){const u=(k+.5)/NS,s=b.seg[k];pt(u,s);s.r=13-6*u}
    pt(.2,b.wa);
  }
  function mouthXY(b){return [b.x-28,b.y+7]}
  function summonDarts(n){let c=0;for(const e of E)if(e.type==='dart')c++;for(let i=0;i<n&&c<5;i++,c++)spawn({type:'dart',y:100,dv:'low'})}

  return {
    noFG:true,
    drawBackground(t){
      sync();const a=clk(t),c=ctx;
      c.drawImage(SKY,0,0);
      strip(CLH,a*3,TOP+6);
      c.drawImage(SUN[Math.floor(a*2)%4],SUNX-SC,SUNY-SC);
      strip(FAR,a*FAR_V,FY);
      {const fo=((a*FAR_V)%FW+FW)%FW;for(const v of FVX){let sx=v-fo;if(sx<-10)sx+=FW;if(sx<W+10){c.fillStyle=Math.floor(a*3+v)%3?'#9a3a3a':'#ff7777';c.fillRect((sx-1)|0,FY+26,3,1)}}}
      strip(CLL,a*8,106);
      const ms=a*MID_V,mo=((ms%MW)+MW)%MW;
      strip(MID,ms,MY);
      for(const f of FALLS){let sx=f.x-mo;if(sx<-8)sx+=MW;if(sx>W)continue;const y0=MY+f.y,len=Math.min(140,BOT-y0);
        c.drawImage(FT,0,Math.floor(16-(a*40)%16),5,len,Math.floor(sx),y0,5,len);
        c.fillStyle='#ffffaa';c.fillRect(Math.floor(sx)-1,y0,3,1);if(Math.floor(a*8+f.x)%2){c.fillStyle='#ff9966';c.fillRect(Math.floor(sx)+5,y0+1,1,1)}}
      strip(MIDC,ms,TOP);
      const ns=a*NEAR_V,no=((ns%NW)+NW)%NW;
      strip(NEAR,ns,NY);
      for(let i=0;i<VX.length;i++){let sx=VX[i]-no;if(sx<-80)sx+=NW;if(sx>W+40||sx<-40)continue;sx=Math.floor(sx);const cy=145,v=S.g===G?S.vol[i]:null;
        for(let k=0;k<3;k++){const ag=(a*.5+k/3)%1;c.fillStyle=pat(ag<.5?'#352879':'#1c1840');const sz=2+Math.floor(ag*6);c.fillRect(sx-Math.floor(ag*16)-(sz>>1),cy-4-Math.floor(ag*40),sz,sz)}
        c.fillStyle=Math.floor(a*5+i)%2?'#ffffaa':'#ff9966';c.fillRect(sx-1,cy+1,3,1);
        if(v&&v.tele>0){const k=1-v.tele,bl=Math.floor(a*(10+k*20))%2,r=3+Math.floor(k*6);
          c.fillStyle=pat('#ff9966');c.fillRect(sx-r-3,cy-r,2*r+7,r+2);
          c.fillStyle=bl?'#ffffff':'#ffffaa';c.fillRect(sx-r+1,cy-2,2*r-1,3);
          c.fillStyle='#ff9966';for(let q=0;q<3;q++)c.fillRect(sx-3+q*3,cy-4-((Math.floor(a*30)+q*5)%(4+Math.floor(k*10))),1,2)}
        if(v&&v.fl>0){const hgt=Math.floor(v.fl*70);c.fillStyle='#ff7777';c.fillRect(sx-4,cy-hgt,9,hgt);c.fillStyle='#ffffaa';c.fillRect(sx-2,cy-hgt+2,5,hgt-2);c.fillStyle='#ffffff';c.fillRect(sx-1,cy-hgt+4,3,hgt-6)}}
      strip(NEARC,ns,TOP);
      {const ro=((a*RIV_V)%64+64)%64,rv=RIV[Math.floor(a*6)%3];for(let x=-ro;x<W;x+=64)c.drawImage(rv,Math.floor(x),BOT-8)}
    },
    drawForeground(t){
      const a=clk(t),c=ctx,st=storm(a);
      if(st>.2){const o=((a*80)%W+W)%W;for(let x=-o;x<W;x+=W){c.drawImage(HZT,Math.floor(x),TOP);c.drawImage(HZB,Math.floor(x),BOT-40)}
        if(st>.55){const o2=((a*130)%W+W)%W;for(let x=-o2;x<W;x+=W)c.drawImage(HZM,Math.floor(x),TOP)}}
      for(let i=0;i<EMB.length;i++){const p=EMB[i],lf=(a*p.v+p.o)%150,y=BOT-6-lf,x=((p.x-a*(10+st*30)+Math.sin(a*p.w+i)*4)%W+W)%W;
        c.fillStyle=lf<40?((Math.floor(a*12)+i)%3?'#ffffaa':'#ff9966'):lf<95?'#ff7777':'#9a3a3a';c.fillRect(x|0,y|0,1,1)}
      const na=Math.round(14+st*26);
      for(let i=0;i<na;i++){const p=ASH[i],x=((p.x-a*p.v*(1+st*2.2))%W+W)%W,y=TOP+(((p.y+a*p.vy*(1+st)+Math.sin(a*1.3+i)*3)%(BOT-TOP))+(BOT-TOP))%(BOT-TOP);
        c.fillStyle=p.c;c.fillRect(x|0,y|0,p.s,1)}
    },
    tick(dt,live){
      sync();
      if(G.boss||G.state!=='play')S.bt+=dt;
      for(const b of EB)if(b.fuse&&!b.pop&&b.t>=b.fuse){b.pop=1;b.life=1e-6;burst(b)}
      const ns=npos();
      for(let i=0;i<VX.length;i++){const v=S.vol[i];let sx=VX[i]-(((ns%NW)+NW)%NW);if(sx<-80)sx+=NW;
        if(sx>W+10)v.armed=true;
        else if(v.armed&&sx<292&&sx>170){v.armed=false;if(live&&!G.boss&&G.state==='play'&&Math.random()<[.75,.9,1][Math.min(2,(G.level||1)-1)]){v.tele=1.05;shake=Math.max(shake,.12);rumble()}}
        if(v.tele>0){v.tele-=dt;if(v.tele<=0){v.tele=0;if(live&&G.state==='play')erupt(sx,145);v.fl=.5}}
        if(v.fl>0)v.fl-=dt}
    },
    enemies:{
      /* MAGMA DARTS: streak in from the right, dive from the sky or leap out of the lava */
      dart:{frames:[...DART[0],DART[1][0],DART[2][0]],white:DARTW[0],
        init(e,o){e.age=0;let m=0;
          if(o.dv==='top')m=1;else if(o.dv==='low')m=2;else if(o.rand){const r=Math.random();m=r<.2?1:r<.4?2:0}
          e.mode=m;
          if(m===1){e.x=rnd(170,300);e.y=TOP-4;e.vx=-86;e.vy=62}
          else if(m===2){e.x=rnd(180,300);e.y=BOT+4;e.vx=-86;e.vy=-62;FX.push({ring:1,x:e.x,y:BOT-4,r:2,life:.3,max:9,col:'#ffffaa'})}},
        move(e,dt,live){e.age=(e.age||0)+dt;
          if(e.mode){e.x+=e.vx*dt;e.y+=e.vy*dt;return}
          e.x+=e.vx*dt;if(e.age<.9&&live){const dy=Math.sign(P.y-e.y)*Math.min(Math.abs(P.y-e.y),30*dt);e.y+=dy;e.vy=dy/dt}else e.vy=0},
        draw(c,e,fl){const vx=e.vx||-1,vy=e.mode?(e.vy||0):0,ai=vy>20?1:vy<-20?2:0,fr=Math.floor((e.t||0)*12)%4,im=(fl?DARTW:DART)[ai][fr];
          const l=Math.hypot(vx,vy)||1,bx=-vx/l,by=-vy/l,px=-by,py=bx;
          for(let k=0;k<7;k++){const d=7+k*2.2,jit=k>2?(((fr+k)%3)-1):0,s=k<2?3:k<4?2:1;c.fillStyle=TRAIL[k];c.fillRect(Math.floor(e.x+bx*d+px*jit-s/2),Math.floor(e.y+by*d+py*jit-s/2),s,s)}
          for(let q=0;q<2;q++){const d=10+(((e.t||0)*50+q*9)%16);c.fillStyle='#ffffaa';c.fillRect(Math.floor(e.x+bx*d+px*(q?2:-2)),Math.floor(e.y+by*d+py*(q?2:-2)),1,1)}
          c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2))}},
      /* FIRE ELEMENTALS: the big one splits into two small flames when it dies */
      ringR:{frames:FLB,white:FLBW,w:18,h:20,hp:3,pts:200,vx:-40,
        init(e){e.y0=Math.max(TOP+34,Math.min(BOT-36,e.y0));e.y=e.y0;e.shootT=rnd(1.5,3)},
        move(e,dt,live){e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.t*2.2+e.ph)*22;e.vy=Math.cos(e.t*2.2+e.ph)*48;
          if(live&&e.x<W-30&&e.x>80&&(e.shootT-=dt)<=0){e.shootT=rnd(2.6,3.8);if(EB.length<30){sfxEnemyLaser();for(const s of [-.18,.18])ebAim(e.x-6,e.y,60+G.loop*5,s,{sty:'ember'})}}},
        draw(c,e,fl){const set=fl?FLBW:FLB,im=set[Math.floor(e.t*11+e.ph*3)%6];c.drawImage(im,Math.floor(e.x-im.ax),Math.floor(e.y-im.ay));
          if(!fl)for(let k=0;k<2;k++){const r=(e.t*18+k*6)%12;c.fillStyle=r<6?'#ffffaa':'#ff77ff';c.fillRect(Math.floor(e.x+Math.sin(e.t*7+k*3)*3),Math.floor(e.y-im.ay-r),1,1)}},
        onKill(e){for(const sg of [-1,1]){const n=spawn({type:'ring',y:e.y,split:1,sg});n.x=e.x}}},
      ring:{frames:FLS,white:FLSW,w:11,h:13,
        init(e,o){e.amp=rnd(16,26);e.y0=Math.max(TOP+28,Math.min(BOT-28,e.y0));if(o.split){e.sg=o.sg;e.st=.55;e.amp=8;e.t=0;e.ph=0;e.shootT=rnd(1.6,2.6)}},
        move(e,dt,live){e.x+=e.vx*dt;if(e.st>0){e.st-=dt;e.y0=Math.max(TOP+14,Math.min(BOT-14,e.y0+e.sg*48*dt))}
          e.y=e.y0+Math.sin(e.t*3+e.ph)*e.amp;e.vy=Math.cos(e.t*3+e.ph)*3*e.amp+(e.st>0?e.sg*48:0);
          if(live&&e.x<W-30&&e.x>70&&(e.shootT-=dt)<=0){e.shootT=rnd(2.4,4);if(EB.length<30){sfxEnemyLaser();ebAim(e.x-5,e.y,62+G.loop*5,rnd(-.1,.1),{sty:'ember'})}}},
        draw(c,e,fl){const set=fl?FLSW:FLS,im=set[Math.floor(e.t*12+(e.ph||0)*3)%6];c.drawImage(im,Math.floor(e.x-im.ax),Math.floor(e.y-im.ay+2))}},
      /* LAVA BOMBERS: drop slow magma bombs that burst into sparks; they carry a power-up */
      pod:{frames:POD,white:PODW,w:24,h:14,vx:-28,
        init(e){e.y0=Math.max(38,Math.min(105,e.y0));e.y=e.y0;e.bombT=rnd(1,2)},
        move(e,dt,live){e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.t*1.4)*6;e.vy=Math.cos(e.t*1.4)*8.4;
          if(live&&e.x<W-24&&e.x>70&&(e.bombT-=dt)<=0){e.bombT=rnd(2.6,3.6);if(EB.length<34)bomb(e.x+1,e.y+7,e.vx*.6,18,26,2)}},
        draw(c,e,fl){const im=(fl?PODW:POD)[Math.floor(e.t*8)%4],x=Math.floor(e.x-im.width/2),y=Math.floor(e.y-im.height/2),fk=Math.floor(e.t*20)%3;
          c.fillStyle='#ff7777';c.fillRect(x+im.width-1,y+7,3+fk,3);c.fillStyle='#ffffaa';c.fillRect(x+im.width-1,y+8,1+fk,1);
          c.drawImage(im,x,y);
          if(!fl&&e.bombT!=null&&e.bombT<.45&&Math.floor(e.t*16)%2){c.fillStyle='#ffffff';c.fillRect(x+13,y+13,3,2)}}},
      /* SLAG CRAWLERS: glued to the ridge or the ceiling, lob molten slag */
      cross:{frames:[...CRF,...CRR],white:CRFW,w:18,h:11,
        init(e,o){e.roof=o.edge==='roof'||(o.edge!=='floor'&&o.y<70&&Math.random()<.6);e.wx=e.x+npos();e.cs=rnd(8,16);e.shootT=rnd(1.2,2.6);crPlace(e)},
        move(e,dt,live){e.wx-=e.cs*dt;crPlace(e);e.vx=-(NEAR_V+e.cs);e.vy=0;
          if(live&&e.x<W-16&&e.x>96&&(e.shootT-=dt)<=0){e.shootT=rnd(2,3.2);if(EB.length<30){sfxEnemyLaser();ebAim(e.x-6,e.y+(e.roof?4:-4),64+G.loop*5,rnd(-.08,.08),{sty:'slag',ay:8})}}},
        draw(c,e,fl){const set=e.roof?(fl?CRRW:CRR):(fl?CRFW:CRF),im=set[Math.floor(e.t*10)%4];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2))}},
      /* ROCKS: tumbling volcanic bombs and glowing slag, also thrown up by the volcanoes */
      rock:{frames:[...RKL[0].slice(0,4),...RKS[0].slice(0,4)],white:RKLW[0],
        init(e,o){e.spin=rnd(-7,7);e.rot=rnd(0,8);
          if(o.erupt){e.erupt=1;e.x=o.x;e.y=o.y;e.vx=o.vx;e.vy=o.vy;e.big=!!o.big;e.g=36;e.w=e.h=e.big?17:9;e.hp=e.mhp=(e.big?4:2)*loopScale();e.spr=Math.floor(Math.random()*(e.big?2:3));e.y0=e.y}},
        move(e,dt){if(e.g)e.vy+=e.g*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot=(e.rot||0)+(e.spin||3)*dt},
        draw(c,e,fl){const big=!!e.big,set=big?RKL:RKS,si=(e.spr||0)%set.length,k=((Math.floor(e.rot!=null?e.rot:e.t*4)%8)+8)%8,im=(fl?(big?RKLW:RKSW):set)[si][k];
          const vx=e.vx||-30,vy=e.vy||0;
          for(let q=1;q<=3;q++){c.fillStyle=q===1?'#ffffaa':q===2?'#ff9966':'#9a3a3a';const s=4-q;c.fillRect(Math.floor(e.x-vx*.05*q*(big?1.4:1)-s/2),Math.floor(e.y-vy*.05*q*(big?1.4:1)-s/2),s,s)}
          c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2))}}
    },
    bullets:{
      fire(c,b){const x=Math.floor(b.x),y=Math.floor(b.y),fl=Math.floor(b.t*16)%2,l=Math.hypot(b.vx,b.vy)||1,tx=-b.vx/l,ty=-b.vy/l;
        c.fillStyle='#9a3a3a';c.fillRect(Math.floor(x+tx*7),Math.floor(y+ty*7),2,2);
        c.fillStyle='#ff7777';c.fillRect(Math.floor(x+tx*4.5-1),Math.floor(y+ty*4.5-1),3,3);
        c.fillStyle='#000000';c.fillRect(x-3,y-2,7,5);c.fillRect(x-2,y-3,5,7);
        c.fillStyle='#ff9966';c.fillRect(x-2,y-2,5,5);
        c.fillStyle='#ffffaa';c.fillRect(x-1,y-2,3,5);c.fillRect(x-2,y-1,5,3);
        c.fillStyle=fl?'#ffffff':'#ffffaa';c.fillRect(x-1,y-1,3,3)},
      ember(c,b){const x=Math.floor(b.x),y=Math.floor(b.y);
        c.fillStyle='#cc44cc';c.fillRect(x+2,y,2,1);
        c.fillStyle='#000000';c.fillRect(x-2,y-1,5,3);c.fillRect(x-1,y-2,3,5);
        c.fillStyle='#ff77ff';c.fillRect(x-1,y-1,3,3);
        c.fillStyle=Math.floor(b.t*14)%2?'#ffffff':'#ffffaa';c.fillRect(x,y,1,1)},
      slag(c,b){const x=Math.floor(b.x),y=Math.floor(b.y);
        c.fillStyle='#000000';c.fillRect(x-2,y-1,5,3);c.fillRect(x-1,y-2,3,5);
        c.fillStyle='#9a3a3a';c.fillRect(x-1,y-1,3,3);
        c.fillStyle='#ff9966';c.fillRect(x-1,y-1,2,2);
        c.fillStyle=Math.floor(b.t*10)%2?'#ffffaa':'#ff9966';c.fillRect(x-1,y-1,1,1)},
      bomb(c,b){const x=Math.floor(b.x),y=Math.floor(b.y),rem=(b.fuse||2)-b.t,on=rem<.6?Math.floor(b.t*20)%2:Math.floor(b.t*6)%2;
        c.fillStyle='#000000';c.fillRect(x-3,y-2,7,5);c.fillRect(x-2,y-3,5,7);
        c.fillStyle='#68372b';c.fillRect(x-2,y-1,5,3);c.fillRect(x-1,y-2,3,5);
        c.fillStyle='#9a6759';c.fillRect(x-2,y-1,1,1);c.fillRect(x-1,y-2,1,1);
        if(rem<.35){c.fillStyle='#ffffff';c.fillRect(x-1,y-1,3,3)}
        else{c.fillStyle=on?'#ffffaa':'#ff9966';c.fillRect(x-1,y-1,1,1);c.fillRect(x,y,1,1);c.fillRect(x+1,y+1,1,1);c.fillRect(x+1,y-1,1,1)}},
      spark(c,b){const x=Math.floor(b.x),y=Math.floor(b.y);
        c.fillStyle='#000000';c.fillRect(x-2,y-1,5,3);c.fillRect(x-1,y-2,3,5);
        c.fillStyle=Math.floor(b.t*16)%2?'#ffffff':'#ffffaa';c.fillRect(x-1,y,3,1);c.fillRect(x,y-1,1,3)},
      wave(c,b){const x=Math.floor(b.x),y=Math.floor(b.y),f=Math.floor(b.t*12)%2;
        c.fillStyle='#000000';c.fillRect(x-4,y-2,9,5);c.fillRect(x-3,y-3,6,1);
        c.fillStyle='#ff7777';c.fillRect(x-3,y-1,7,3);
        c.fillStyle='#ffffaa';c.fillRect(x-3,y-2,5,1);c.fillStyle='#ff9966';c.fillRect(x-2,y-1,5,1);
        c.fillStyle=f?'#ffffaa':'#ff9966';c.fillRect(x-4+f,y-4,1,1);c.fillRect(x+1-f,y-5,1,1)}
    },
    /* THE MAGMA DRAGON */
    boss:{
      w:56,h:32,hp:.75,
      init(b){b.bt=0;b.x=300;b.y=224;b.vx=0;b.vy=0;b.in=true;b.mt=0;b.ph=1;b.jaw=0;b.br=null;b.tail=null;b.brT=2.2;b.bombT=5;b.tailT=3;b.sumT=9;
        b.baseX=262;b.seg=[];for(let k=0;k<NS;k++)b.seg.push({x:0,y:0,r:8});b.wa={x:0,y:0};bossNeck(b);
        b.hitTest=(b2,x,y)=>{if(Math.abs(x-(b2.x-4))<30&&Math.abs(y-(b2.y+3))<16)return 1;for(let k=4;k<NS;k++){const s=b2.seg[k],dx=x-s.x,dy=y-s.y;if(dx*dx+dy*dy<s.r*s.r)return .6}return 0};
        b.touch=(b2,px,py)=>Math.abs(px-(b2.x-4))<26+shk(12)&&Math.abs(py-(b2.y+3))<14+shk(6)},
      update(b,dt,live){
        b.bt=(b.bt||0)+dt;
        const f=b.hp/b.mhp,ph=f>.66?1:f>.33?2:3;
        if(b.in){const k=Math.min(1,b.bt/3),e=1-Math.pow(1-k,3);b.x=300-72*e;b.y=224-124*e;
          if(b.y<BOT+2&&!b.splashed){b.splashed=1;shake=Math.max(shake,.4);for(let q=0;q<16;q++){const l=rnd(.5,1);FX.push({x:b.x+rnd(-14,14),y:BOT-4,vx:rnd(-50,50),vy:rnd(-110,-40),life:l,l0:l,ramp:1,s:2})}}
          if(b.bt>=3.2)b.in=false}
        else{b.mt+=dt*[1,1.35,1.8][ph-1];const tx=228+Math.sin(b.mt*.55)*20,ty=100+Math.sin(b.mt*.9)*38,k=Math.min(1,dt*2.5);b.x+=(tx-b.x)*k;b.y+=(ty-b.y)*k}
        if(b.x<210)b.x=210;
        b.baseX=266+Math.sin(b.bt*.5)*5;b.vx=0;b.vy=0;
        bossNeck(b);
        b.jaw=b.br?(b.br.st===0?1:2):0;
        bossWear(b,live,30,30,40,45);
        /* tail slam animation (runs even when not live so it always finishes) */
        if(b.tail){const tl=b.tail;tl.t-=dt;
          if(tl.st===0){const k=Math.max(0,1-tl.t/1),e=k*k*(3-2*k);tl.ty=BOT+14-58*e;tl.tx=tl.x+Math.sin(b.bt*6)*2;if(tl.t<=0){tl.st=1;tl.t=.22}}
          else if(tl.st===1){const k=Math.max(0,1-tl.t/.22);tl.ty=BOT-44+46*k;tl.tx=tl.x-16*k;
            if(tl.t<=0){tl.st=2;tl.t=.6;if(live&&G.state==='play'){shake=Math.max(shake,.35);sfxBoom(10,false);
              if(EB.length<22)for(let q=0;q<5;q++)ebShot(tl.x-22-q*9,181,-92,0,{sty:'wave',hh:2,life:4});
              if(EB.length<24)for(let q=0;q<2;q++)ebShot(tl.x-26-q*9,172,-92,0,{sty:'wave',hh:2,life:4});
              for(let q=0;q<10;q++){const l=rnd(.4,.8);FX.push({x:tl.x-14+rnd(-6,6),y:BOT-4,vx:rnd(-50,30),vy:rnd(-90,-30),life:l,l0:l,ramp:1,s:2})}}}}
          else{const k=Math.max(0,1-tl.t/.6);tl.ty=BOT+2+20*k;tl.tx=tl.x-16;if(tl.t<=0)b.tail=null}}
        if(!live||b.in)return;
        if(ph!==b.ph){b.ph=ph;shake=Math.max(shake,.5);FX.push({ring:1,x:b.x-12,y:b.y,r:3,life:.5,max:44,col:ph===3?'#ffffff':'#ffffaa'});
          summonDarts(ph===2?3:2);if(ph===3)b.bombT=1.5}
        /* fire breath: telegraph with an open glowing mouth, then a sweeping fan or a stream */
        const [mx,my]=mouthXY(b);
        if(!b.br){b.brT-=dt;if(b.brT<=0)b.br={st:0,t:.8,k:0,a:0,dir:Math.random()<.5?-1:1}}
        else if(b.br.st===0){b.br.t-=dt;if(Math.random()<.3)FX.push({x:mx+rnd(-2,2),y:my+rnd(-2,2),vx:rnd(-30,-5),vy:rnd(-15,15),life:.25,l0:.25,ramp:1,s:1});
          if(b.br.t<=0){b.br.st=1;b.br.t=0;b.br.a=Math.atan2(P.y-my,P.x-mx)+rnd(-.12,.12)}}
        else{b.br.t-=dt;
          if(b.br.t<=0){const br=b.br,N=[5,7,14][ph-1],sp=[56,60,66][ph-1]+G.loop*3;let ang;
            if(ph<3){const span=ph===1?1.1:1.3;ang=br.a+br.dir*(-span/2+span*br.k/(N-1));br.t=ph===1?.13:.11}
            else{const tg=Math.atan2(P.y-my,P.x-mx);let d=tg-br.a;d=Math.atan2(Math.sin(d),Math.cos(d));br.a+=Math.max(-.05,Math.min(.05,d));ang=br.a+Math.sin(br.k*.9)*.1;br.t=.13}
            if(EB.length<24){ebShot(mx,my,Math.cos(ang)*sp,Math.sin(ang)*sp,{sty:'fire'});sfxEnemyLaser()}
            br.k++;if(br.k>=N){b.br=null;b.brT=[3.2,2.8,2.1][ph-1]}}}
        /* lava bombs: lobbed out of the lava, or rained from the jaws when enraged */
        b.bombT-=dt;
        if(b.bombT<=0){b.bombT=[6.5,7.5,2.8][ph-1];
          if(ph<3){if(EB.length<18)bomb(b.baseX-30,BOT-4,rnd(-72,-55),rnd(-82,-68),30,2.1)}
          else for(let q=0;q<2;q++)if(EB.length<18)bomb(mx,my-2,rnd(-75,-35),rnd(-60,-40),36,rnd(1.9,2.4))}
        /* tail slam and summons from phase 2 */
        if(ph>=2&&!b.tail){b.tailT-=dt;if(b.tailT<=0){b.tail={st:0,t:1,x:rnd(178,212),tx:0,ty:BOT+14};b.tailT=ph===3?6:7;rumble()}}
        if(ph>=2){b.sumT-=dt;if(b.sumT<=0){b.sumT=11;summonDarts(2)}}
      },
      draw(c,b,fl){
        if(!b.seg)return;
        const f=b.hp/b.mhp,pi=f>.66?0:f>.33?1:2,fr=Math.floor(b.bt*[3,4.5,6][pi])%4,ax=Math.floor(b.wa.x),ay=Math.floor(b.wa.y);
        c.drawImage(WFAR[(fr+1)%4],ax-WSX+2,ay-WSY-20);
        {const wi=fl?WINGW[fr]:WING[pi][fr];c.drawImage(wi,ax-(wi.width-1-WSX)+4,ay-WSY-26)}
        if(b.tail){const tl=b.tail,x0=tl.x+16,y0=BOT+12,cx=tl.x+20,cy=tl.ty+10;
          for(let k=0;k<6;k++){const u=k/5,m=1-u,x=m*m*x0+2*m*u*cx+u*u*tl.tx,y=m*m*y0+2*m*u*cy+u*u*tl.ty,ri=Math.min(7,5+Math.floor(u*3)),im=fl?DISCW[ri]:DISC[pi][ri];c.drawImage(im,Math.floor(x-im.width/2),Math.floor(y-im.height/2))}
          const ti=fl?TIPW:TIP[pi];c.drawImage(ti,Math.floor(tl.tx-ti.width/2),Math.floor(tl.ty-ti.height+2));
          const sp=SPL[Math.floor(b.bt*9+1)%3];c.drawImage(sp,Math.floor(tl.x+12-sp.width/2),BOT-sp.height+3)}
        for(let k=0;k<NS;k++){const s=b.seg[k],ri=Math.max(0,Math.min(9,Math.round(13-s.r))),im=fl?DISCW[ri]:DISC[pi][ri];c.drawImage(im,Math.floor(s.x-im.width/2),Math.floor(s.y-im.height/2))}
        {const sp=SPL[Math.floor(b.bt*8)%3];c.drawImage(sp,Math.floor(b.baseX-sp.width/2),BOT-sp.height+3)}
        const hd=fl?HEADW[b.jaw||0]:HEAD[pi][b.jaw||0];c.drawImage(hd,Math.floor(b.x)-37,Math.floor(b.y)-22);
        if(b.br&&!fl){const [mx,my]=mouthXY(b),p=b.br.st===0?Math.min(1,1-b.br.t/.8):1,r=1+Math.round(p*2),x=Math.floor(mx),y=Math.floor(my);
          c.fillStyle='#ff9966';c.fillRect(x-r-1,y-r,2*r+3,2*r+1);c.fillStyle=Math.floor(b.bt*20)%2?'#ffffff':'#ffffaa';c.fillRect(x-r,y-r+1,2*r+1,2*r-1)}
        if(pi===2&&!fl)for(let k=0;k<5;k++){c.fillStyle=k%2?'#ffffaa':'#ffffff';c.fillRect(Math.floor(b.x-16+k*8+Math.sin(b.bt*5+k)*2),Math.floor(b.y-26-((b.bt*30+k*7)%14)),1,1)}
      },
      onKill(b){if(!b.seg)return;for(const k of [2,5,8,11]){const s=b.seg[k];FX.push({burst:1,x:s.x,y:s.y,vx:0,vy:0,life:.5,l0:.5,max:10})}
        for(let q=0;q<14;q++){const l=rnd(.5,1.1);FX.push({x:b.baseX+rnd(-20,20),y:BOT-4,vx:rnd(-50,50),vy:rnd(-110,-40),life:l,l0:l,ramp:1,s:2})}}
    }
  };
},
script(sc,h){
  const L=h.level;
  /* slag crawlers patrolling the ridge and the ceiling */
  for(const t of [7,18,33,46,60,75])sc.push({t,type:'cross',y:170,edge:'floor'});
  for(const t of [25,52,70])sc.push({t,type:'cross',y:28,edge:'roof'});
  if(L>=2)for(const t of [12,40,66,81])sc.push({t,type:'cross',y:170,edge:'floor'});
  if(L>=3)for(const t of [30,57])sc.push({t,type:'cross',y:28,edge:'roof'});
  /* magma darts diving from the sky and leaping out of the lava */
  for(const t of [15,37,58,79])sc.push({t,type:'dart',y:0,dv:'top'},{t:t+.4,type:'dart',y:0,dv:'top'});
  for(const t of [26,48,69])sc.push({t,type:'dart',y:0,dv:'low'},{t:t+.5,type:'dart',y:0,dv:'low'});
  /* big fire elementals that split */
  h.add(20,'ringR',2,1.4,70,50);h.add(53,'ringR',2,1.4,60,70);
  if(L>=2)h.add(44,'ringR',3,1.1,50,45);
  /* lava bombers */
  sc.push({t:31,type:'pod',y:60});
  if(L>=3)sc.push({t:61,type:'pod',y:50});
}
};
Object.assign(PLANETS[3],{d:'VOLCANOES, DARTS, FLAMES, BOMBERS, CRAWLERS.',every:8,waves:[['dart',4,.35],['ring',3,.5]]});
