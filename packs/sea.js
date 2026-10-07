/* STORMTIDE SEA art pack (planet 6), an elite stage: flying low over a storm-wracked ocean.
   Background: a heavy storm sky with roiling slate clouds and telegraphed lightning, a wide horizon with islands,
   lighthouses, sea stacks and wrecks, rolling swells in three depths with white crests and spray, whirlpools,
   huge dark shapes breaching, driving rain. The near swell is shared with everything that rides the water
   (gunboats, serpents, the shark and the kraken) through surfN() and seaCover().
   Cast: flying fish schools (ring), sailfish (ringR), attack gulls and gull drones (dart), navy gunboats riding
   the swell (cross), sea serpents (pod), waterspouts, breach spray, storm wreckage and lightning strikes (rock).
   Mini boss: the Shark Mech. Boss: the Kraken. */
(function(){
'use strict';
const TAU=Math.PI*2,K='#000000';
let sd=7;
const LR=()=>(sd=(sd*1103515245+12345)&0x7fffffff)/0x7fffffff;
const lr=(a,b)=>a+LR()*(b-a);
const hash=(i,j,k)=>{let h=(i*374761393+j*668265263+(k||0)*1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296};
const bay=(i,j)=>(BAYER[j&3][i&3]+.5)/16;
const rp=(ramp,v,i,j)=>{v=v<0?0:v>.999?.999:v;const t=v*(ramp.length-1),k=Math.floor(t);return ramp[(t-k>bay(i,j))?Math.min(ramp.length-1,k+1):k]};
const mod=(a,n)=>((a%n)+n)%n;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const RGB={};const rgb=h=>RGB[h]||(RGB[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);

/* ---------- pixel helpers ---------- */
function bake(w,h,fn){const c=mk(w,h),x=c.getContext('2d'),id=x.createImageData(w,h),d=id.data;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const col=fn(i,j);if(!col)continue;const v=rgb(col),q=(j*w+i)*4;d[q]=v[0];d[q+1]=v[1];d[q+2]=v[2];d[q+3]=255}
  x.putImageData(id,0,0);return c}
/* colour function to sprite, with an optional 1 pixel outline */
function paint(w,h,fn,ol){
  const pd=ol===false?0:1,cw=w+2*pd,ch=h+2*pd,cols=new Array(cw*ch).fill(null);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const col=fn(i,j);if(col)cols[(j+pd)*cw+i+pd]=col}
  if(pd){const oc=typeof ol==='string'?ol:K,add=[];
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
function mkNoise(seed){
  const Hs=(x,y)=>hash(x,y,seed);const S=t=>t*t*(3-2*t);
  const vn=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=S(x-ix),fy=S(y-iy),a=Hs(ix,iy),b=Hs(ix+1,iy),c=Hs(ix,iy+1),d=Hs(ix+1,iy+1);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy};
  const fbm=(x,y,o)=>{o=o||3;let v=0,a=.5,f=1,t=0;for(let i=0;i<o;i++){v+=vn(x*f,y*f)*a;t+=a;a*=.5;f*=2}return v/t};
  /* horizontally wrapping fbm over a strip of width w */
  const wrap=(x,y,w,sx,sy,o)=>{const s=x/w;return fbm(x*sx,y*sy,o)*(1-s)+fbm((x-w)*sx,y*sy,o)*s};
  return{vn,fbm,wrap};
}
function outline(c,col){
  const w=c.width,h=c.height,o=mk(w+2,h+2),g=o.getContext('2d'),d=c.getContext('2d').getImageData(0,0,w,h).data;
  const op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>40;g.fillStyle=col||K;
  for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){if(op(x,y))continue;if(op(x-1,y)||op(x+1,y)||op(x,y-1)||op(x,y+1))g.fillRect(x+1,y+1,1,1)}
  g.drawImage(c,1,1);return o;
}
function harden(c){const g=c.getContext('2d'),id=g.getImageData(0,0,c.width,c.height),d=id.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]>110?255:0;g.putImageData(id,0,0);return c}
/* nearest neighbour rotation onto a square canvas, centred */
function rotC(src,a){const S=Math.ceil(Math.hypot(src.width,src.height))+2,c=mk(S,S),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.translate(S/2,S/2);g.rotate(a);g.drawImage(src,-src.width/2,-src.height/2);return harden(c)}
const fin=c=>outline(polish(c));
const flipV=c=>{const o=mk(c.width,c.height),g=o.getContext('2d');g.translate(0,c.height);g.scale(1,-1);g.drawImage(c,0,0);return o};
function inTri(x,y,ax,ay,bx,by,cx,cy){const d1=(x-bx)*(ay-by)-(ax-bx)*(y-by),d2=(x-cx)*(by-cy)-(bx-cx)*(y-cy),d3=(x-ax)*(cy-ay)-(cx-ax)*(y-ay);return !((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0))}
function segD(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-ax-dx*t,y-ay-dy*t)}
function strip(img,off,y){const w=img.width;let x=-mod(off,w);for(;x<W;x+=w)ctx.drawImage(img,Math.floor(x),y)}

/* ---------- world layout ---------- */
const HY=92;                                        // the horizon
const NW=480,NY=160,NF=6,NFPS=7,NEARV=46;            // near swell strip (gunboats ride its first crest)
const MW=480,MY=116,MF=4,MFPS=4,MIDV=17;            // mid swells
const FW=640,FARV=8;                                // far sea band
const WL=174;                                       // mean water line for the big beasts
const NB=[170,186],NA=[4.2,5];
const nCrest=(r,u,f)=>NB[r]+NA[r]*Math.sin(TAU*3*u/NW+r*2.1)+1.7*Math.sin(TAU*8*u/NW+f*TAU/NF+r)+.8*Math.sin(TAU*19*u/NW-2*f*TAU/NF+r*3);
const MB=[121,130,141,154,169],MA=[1.1,1.7,2.5,3.3,4.1],MC1=[6,5,4,4,3],MC2=[13,11,9,8,7];
const mCrest=(r,u,f)=>MB[r]+MA[r]*Math.sin(TAU*MC1[r]*u/MW+r*1.7)+MA[r]*.45*Math.sin(TAU*MC2[r]*u/MW+f*TAU/MF+r);
const FB=[93,95,97,100,103,107,111,116,121],FC=[17,15,13,11,10,9,8,7,6];
const fCrest=(r,u)=>FB[r]+(.3+r*.18)*Math.sin(TAU*FC[r]*u/FW+r*2.3);

/* ---------- pack state (reset for every new run) ---------- */
const S={g:null,bt:0,churn:0,na:0,nf:0};
function sync(){if(S.g!==G){S.g=G;S.bt=0;S.churn=0}}
const clk=t=>t+(S.g===G?S.bt:0);
function nearState(a){S.na=a*NEARV;S.nf=Math.floor(a*NFPS*(1+S.churn*.7))%NF}
/* height of the near swell at screen x, the water line every rider uses */
const surfN=x=>nCrest(0,mod(x+S.na,NW),S.nf);
const LV=()=>(G&&G.level)||1;
const room=n=>EB.length+n<=60;
const aim=(x,y)=>Math.atan2(P.y-y,P.x-x);

PACKS[6]={
init(){
  const A={noFG:true,enemies:{},bullets:{}};

  /* =====================================================================
     SEA: three depths of swells, all baked from the same crest functions
     ===================================================================== */
  function sweep(w,y0,h,n,crest,col){
    const cr=[];for(let r=0;r<n;r++){const a=new Float32Array(w+8);for(let u=-4;u<w+4;u++)a[u+4]=crest(r,mod(u,w));cr.push(a)}
    const C=(r,u)=>cr[r][u+4];
    return bake(w,h,(i,j)=>{const y=y0+j+.5;let k=-1;for(let r=0;r<n;r++)if(y>=C(r,i))k=r;
      for(let r=n-1;r>k;r--){const pk=(C(r,i-3)+C(r,i+3))/2-C(r,i),gap=C(r,i)-y;if(gap<2.6&&pk>1.05&&hash(i,j*7+r,n)<.5)return col(i,y,r,-1,pk,0)}
      if(k<0)return null;
      const d=y-C(k,i),pk=(C(k,i-3)+C(k,i+3))/2-C(k,i),sl=C(k,i+1)-C(k,i-1);
      return col(i,y,k,d,pk,sl)});
  }
  const NEARR=['#020609','#050d12','#08161c','#0d2127','#132d33','#1b3c40','#26504f','#356663'];
  const NEAR=[];for(let f=0;f<NF;f++)NEAR.push(sweep(NW,NY,BOT-NY+1,2,(r,u)=>nCrest(r,u,f),(i,y,k,d,pk,sl)=>{
    if(d<0)return '#ffffff';                                                  // spray thrown over a breaking crest
    if(d<1)return pk>.6?'#ffffff':pk>.1?'#9ad2e0':'#70a4b2';
    if(d<2&&pk>.2)return pk>.8?'#ffffff':'#9ad2e0';
    if(d<6&&pk>.25&&hash(i,y|0,f+11)<(pk-.25)*1.1*(1-d/6))return d<3?'#ffffff':'#9ad2e0';
    if(d<3&&sl<-.3&&hash(i,y|0,f+17)<.35)return '#70a4b2';
    const fl=Math.abs(d-(6.5+2*Math.sin(i*.06+k*3+f*.5)));if(fl<.5&&hash(i>>2,k,f)<.55)return '#26504f';
    if(d<9&&hash(i,y|0,f+3)<.012)return '#4a807a';
    return rp(NEARR,(k?.5:.58)-d*.035-sl*.14,i,y|0)}));
  const MIDR=['#050d12','#08161c','#0d2127','#132d33','#1b3c40','#26504f','#356663','#4a807a'];
  const MID=[];for(let f=0;f<MF;f++)MID.push(sweep(MW,MY,BOT-MY+1,5,(r,u)=>mCrest(r,u,f),(i,y,k,d,pk,sl)=>{
    if(d<0)return k>=3?'#9ad2e0':'#70a4b2';
    if(d<1)return k<2?(pk>.4?'#70a4b2':'#4a807a'):(pk>1.1?'#9ad2e0':'#70a4b2');
    if(d<3&&pk>.5&&k>=2&&hash(i,y|0,f+21)<(pk-.5)*.6*(1-d/3))return '#70a4b2';
    if(k>=2){const fl=Math.abs(d-(5+1.5*Math.sin(i*.08+k*2+f)));if(fl<.5&&hash(i>>2,k+9,f)<.5)return '#1b3c40'}
    return rp(MIDR,[.8,.72,.64,.56,.48][k]-d*.045-sl*.12,i,y|0)}));
  const FARR=['#0d2127','#132d33','#1b3c40','#26504f','#356663','#4a807a','#5e8c8a'];
  const FAR=sweep(FW,HY,36,FB.length,fCrest,(i,y,k,d)=>{
    if(y<HY+1)return '#5e8c8a';
    if(d<1){if(hash(i>>1,k,3)<.05)return '#9ad2e0';return k<4?'#5e8c8a':'#4a807a'}
    return rp(FARR,.82-k*.045-d*.09,i,y|0)});

  /* =====================================================================
     SKY: storm gradient with a cold break of light, roiling cloud decks, rain
     ===================================================================== */
  const nz=mkNoise(61);
  const SKYR=['#05070b','#0a0e15','#10161f','#161f2a','#1e2a36','#283844','#344856','#44585f','#5e7478','#70a4b2','#9ad2e0'];
  const skyV=(i,j)=>{let v=.06+Math.pow(j/HY,1.7)*.52;const d=Math.hypot((i-212)/74,(j-76)/24);v+=Math.max(0,1-d)*.42;v+=(nz.fbm(i*.02,j*.05,3)-.5)*.16;return v};
  const SKY=bake(W,HY+2,(i,j)=>rp(SKYR,skyV(i,j),i,j));
  const SKYF=bake(W,HY+2,(i,j)=>rp(SKYR,skyV(i,j)+.32,i,j));
  function clouds(w,h,seed,sx,sy,thr,fall,ramp,lift){
    const n=mkNoise(seed);const dn=(x,y)=>n.wrap(mod(x,w),y,w,sx,sy,4)*(1.3-y/h*fall);
    return bake(w,h,(i,j)=>{const v=dn(i,j);if(v<thr)return null;
      if(v<thr+.025&&bay(i,j)>.5)return null;
      const core=clamp((v-thr)/.22,0,1),lit=clamp((v-dn(i-2,j-3))*7,0,1),under=clamp((dn(i,j+3)-v)*-6,0,1);
      return rp(ramp,.62-core*.5+lit*.3+under*.12+(lift||0),i,j)});
  }
  const CR1=['#0a0e15','#10161f','#161f2a','#1e2a36','#283844','#344856','#44585f','#5e7478'];
  const CR2=['#05070b','#0a0e15','#10161f','#161f2a','#1e2a36','#283844','#344856'];
  const CRF=['#283844','#344856','#44585f','#5e7478','#70a4b2','#9ad2e0','#bbbbbb','#ffffff'];
  const CF=clouds(640,64,3,.011,.05,.44,.95,CR1),CFF=clouds(640,64,3,.011,.05,.44,.95,CRF);
  const CM=clouds(640,40,9,.016,.08,.47,1.1,CR2),CMF=clouds(640,40,9,.016,.08,.47,1.1,CRF,-.15);
  const SCUD=(()=>{const n=mkNoise(17);return bake(480,14,(i,j)=>{const b=5+n.wrap(i,0,480,.03,1,3)*10;if(j>b)return null;if(j>b-1.5&&bay(i,j)>.5)return null;return j>b-2?'#1e2a36':j>b-4?rp(['#05070b','#10161f'],.6,i,j):'#05070b'})})();
  const GLOW=bake(56,22,(i,j)=>{const d=Math.hypot((i-28)/28,(j-11)/11);if(d>1)return null;if(bay(i,j)>1.1-d)return null;return d<.35?'#9ad2e0':d<.65?'#70a4b2':'#44585f'});
  const RAIN=[0,1].map(k=>{const c=mk(W,184),g=c.getContext('2d');sd=300+k*17;
    for(let q=0;q<(k?70:110);q++){const x=lr(0,W),y=lr(0,184),L=k?5:3;g.fillStyle=k?'#344856':(LR()<.5?'#1e2a36':'#283844');for(let s=0;s<L;s++)g.fillRect(Math.floor(x-s*.5),Math.floor(y+s),1,1)}
    return c});
  /* a pale, shimmering reflection of the light break on the water */
  const REFL=[0,1,2].map(f=>bake(76,30,(i,j)=>{const d=Math.abs((i-38)/(38-j*.6));if(d>1)return null;if(hash(i>>1,j,f)>(1-d)*(1-j/34)*.7)return null;return (j<6&&hash(i,j,f+5)<.4)?'#9ad2e0':'#70a4b2'}));

  /* =====================================================================
     HORIZON AND MIDDLE DISTANCE: islands, lighthouses, sea stacks, wrecks
     ===================================================================== */
  const FARK=['#070b10','#0c1119','#121a24','#1a2430','#24323e'];
  const MIDK=['#03050a','#070b10','#0c1119','#121a24','#1a2430','#24323e','#30424e'];
  const n2=mkNoise(23);
  const mkO=(c,lights,beam)=>({c,lights:lights||[],beam});
  const islandL=mkO(relief(84,26,(i,j)=>{const t=(i-38)/40;if(Math.abs(t)>1)return (i>=52&&i<=54&&j>=4&&j<17);const top=26-12*Math.pow(1-t*t,.8)-n2.fbm(i*.12,1,2)*5;return j>=top||(i>=52&&i<=54&&j>=4)},FARK,{cap:3,out:false,paint:(i,j)=>(i>=51&&i<=55&&j<=5)?(j<=3?'#24323e':null):null}),[[53,4,'#ffffaa',1.1,0]],[53,4]);
  const islandT=mkO(relief(64,22,(i,j)=>{const a=Math.max(0,1-Math.abs(i-20)/18),b=Math.max(0,1-Math.abs(i-44)/16);const top=22-Math.max(a*a*20,b*b*15)-n2.fbm(i*.2,4,2)*3;return j>=top},FARK,{cap:3,out:false}));
  const stackF=mkO(relief(16,26,(i,j)=>Math.abs(i-8+(26-j)*.06)<3+j*.12+n2.fbm(i*.3,j*.2,2)*1.5,FARK,{cap:2,out:false}));
  const wreckF=mkO(relief(50,20,(i,j)=>{const hull=j>=13-(i-6)*.12&&j<=20&&i>=4&&i<=44&&j>=10+(i>38?(i-38)*.6:0);const m1=Math.abs(i-14-(18-j)*.25)<.8&&j>=2&&j<14,m2=Math.abs(i-28+(16-j)*.1)<.7&&j>=6&&j<13;return hull||m1||m2},FARK,{cap:2,out:false}),[[40,12,'#ff9966',.7,.3]]);
  const HOR=[[islandL,40],[stackF,250],[wreckF,380],[islandT,560],[stackF,700],[islandL,880],[islandT,1050]].map(([s,x])=>({s,x}));
  const HWLD=1180;
  /* middle distance */
  const stackM=mkO(relief(36,80,(i,j)=>{const hw=(6+6*Math.pow(j/80,1.4)+n2.fbm(i*.15,j*.1,3)*4-(j>20&&j<26?2:0))*Math.min(1,Math.sqrt(Math.max(0,j-1)/9));return Math.abs(i-18-(80-j)*.08)<hw},MIDK,{cap:4,out:false,paint:(i,j,v)=>hash(i,j,4)<.03?'#30424e':null}),[[16,6,'#ffffff',.4,.2]]);
  const archM=mkO(relief(64,52,(i,j)=>{const outer=j>=52-46*Math.pow(Math.max(0,1-Math.pow((i-32)/32,2)),.5)-n2.fbm(i*.1,2,3)*7;const hole=Math.hypot((i-30)/12,(j-52)/26)<1;return outer&&!hole},MIDK,{cap:5,out:false}));
  const lightM=mkO(relief(30,86,(i,j)=>{if(j>=64)return Math.abs(i-15)<9+(j-64)*.4+n2.fbm(i*.2,j*.2,2)*3;if(j>=14)return Math.abs(i-15)<3.4+(j-14)*.035;if(j>=8)return Math.abs(i-15)<(j===13?5:3);return Math.abs(i-15)<(j-2)*.6&&j>=3},MIDK,{cap:3,out:false,paint:(i,j,v)=>{
      if(j>=14&&j<64){const band=Math.floor((j-14)/8)%2;if(j===14||j===15)return '#30424e';return rp(band?['#2a1418','#4a2424','#5e3030']:['#121a24','#1e2a36','#30424e'],v,i,j)}
      if(j>=8&&j<13)return (i>=13&&i<=17)?'#44585f':null;return null}}),[[15,10,'#ffffaa',.9,0],[15,40,'#ff9966',2.2,.5]],[15,10]);
  const wreckM=mkO(relief(72,46,(i,j)=>{
      const deck=26+(i-8)*.18,keel=40+(i>50?-(i-50)*.3:0);const hull=i>=6&&i<=66&&j>=deck-(i<14?(14-i)*1.2:0)&&j<=keel;
      const m1=Math.abs(i-24-(26-j)*.18)<1.1&&j>=3&&j<28,m2=Math.abs(i-44-(30-j)*.3)<1&&j>=14&&j<31;
      const yard=Math.abs(j-9-(i-24)*.18)<.8&&i>=16&&i<=34;
      const rag=inTri(i+.5,j+.5,18,10,33,12,25,22)&&hash(i>>1,j>>1,3)>.25;
      const stern=i>=56&&i<=66&&j>=deck-6&&j<=deck;
      return hull||m1||m2||yard||rag||stern},['#050302','#120806','#22100a','#3a1a12','#4a2a1a','#68372b'],{cap:3,out:false,paint:(i,j,v)=>{
      if(inTri(i+.5,j+.5,18,10,33,12,25,22)&&!(Math.abs(i-24-(26-j)*.18)<1.1))return rp(['#1e2a36','#30424e','#44585f'],v,i,j);
      if(hash(i,j,2)<.04)return '#000000';return null}}),[[61,32,'#ffffaa',1.3,.4]]);
  const MIDO=[[stackM,30],[wreckM,260],[archM,520],[lightM,760],[stackM,980],[archM,1200]].map(([s,x])=>({s,x}));
  const MWLD=1380,MIDOV=11;

  /* whirlpools, the breaching leviathan and its shadow */
  function whirl(rx,ry,f){return bake(2*rx+2,2*ry+2,(i,j)=>{const nx=(i-rx-.5)/rx,ny=(j-ry-.5)/ry,r=Math.hypot(nx,ny);if(r>1)return null;
    if(r>.72&&bay(i,j)<(r-.72)*3.6)return null;
    if(r<.14)return '#020609';
    const a=Math.atan2(ny,nx),s=Math.sin(3*a+Math.log(r+.04)*5.5+f*TAU/6);
    if(s>.5&&hash(i,j,f)<.9-r*.5)return r<.45?'#9ad2e0':'#70a4b2';
    return rp(['#020609','#050d12','#08161c','#0d2127','#132d33','#1b3c40'],r*.85+s*.1,i,j)})}
  const WHM=[0,1,2,3,4,5].map(f=>whirl(24,6,f)),WHB=[0,1,2,3,4,5].map(f=>whirl(66,13,f));
  const LEVR=['#020609','#050d12','#08161c','#0d2127','#132d33','#1b3c40','#356663'];
  const BACK=relief(98,32,(i,j)=>{const t=(i-49)/49;if(Math.abs(t)>1)return false;const top=31-24*Math.sqrt(1-t*t)-(Math.abs(i-58)<5?(5-Math.abs(i-58))*1.3:0)-n2.fbm(i*.2,1,2)*2;return j>=top},LEVR,{cap:6,out:false,paint:(i,j)=>{
    if(hash(i>>1,j>>1,8)<.06&&j>8)return hash(i,j,9)<.5?'#6c6c6c':'#444444';if(Math.abs(i-30-j*.3)<.6&&j>10&&j<22)return '#0d2127';return null}});
  const FLUKE=relief(50,30,(i,j)=>{const x=Math.abs(i+.5-25),y=j+.5;if(x<3.2-(y<16?0:(y-16)*-.08)&&y>13)return true;if(x>24)return false;const q=x/24,yt=11-9*Math.pow(q,1.3)+(x<2.5?3:0),yb=17-8*q*q-(q>.8?(q-.8)*14:0);return y>=yt&&y<=yb},LEVR,{cap:4,out:false});
  const SHADOW=bake(96,14,(i,j)=>{const d=Math.hypot((i-48)/48,(j-7)/7);if(d>1)return null;return bay(i,j)<(1-d)*.9?'#050d12':null});

  /* lightning in the sky (deterministic from the scroll clock) */
  const LZ={on:false,d:-9,x:0,k:0};
  function lz(a){const per=S.churn>.5?2.6:5.2,k=Math.floor(a/per),ph=a-k*per;LZ.k=k;LZ.on=hash(k,3,9)>.25;LZ.d=ph-(1+hash(k,5,9)*(per-2));LZ.x=24+hash(k,7,9)*272}
  const flashOn=()=>LZ.on&&((LZ.d>=0&&LZ.d<.09)||(LZ.d>=.16&&LZ.d<.22));
  function bseg(x0,y0,x1,y1,core,halo,wd){const n=Math.max(1,Math.abs(y1-y0)|0);for(let i=0;i<=n;i+=2){const x=(x0+(x1-x0)*i/n)|0,y=(y0+(y1-y0)*i/n)|0;ctx.fillStyle=halo;ctx.fillRect(x-wd,y,2*wd+1,2);ctx.fillStyle=core;ctx.fillRect(x,y,1,2)}}
  function skyBolt(){let x=LZ.x,y=TOP+22;for(let i=0;i<8;i++){const nx=x+(hash(LZ.k,i,4)-.5)*14,ny=y+(HY-TOP-22)/8;bseg(x,y,nx,ny,'#ffffff','#9ad2e0',1);
      if(i===3){const bx=nx+(hash(LZ.k,i,6)<.5?-12:12);bseg(nx,ny,bx,ny+10,'#ffffff','#70a4b2',0)}x=nx;y=ny}
    ctx.fillStyle='#ffffff';ctx.fillRect((x-3)|0,HY,7,1);ctx.fillStyle='#9ad2e0';ctx.fillRect((x-8)|0,HY+1,17,1)}

  /* foreground spray blown along the bottom edge */
  sd=91;const SPR=[];for(let i=0;i<26;i++)SPR.push({x:lr(0,W+20),y:lr(-6,8),v:lr(70,150),ph:lr(0,9),s:LR()<.3?2:1,c:LR()<.5?'#ffffff':'#9ad2e0'});
  sd=93;const CHURN=[];for(let i=0;i<22;i++)CHURN.push({x:lr(0,W),y:lr(124,188),v:lr(60,140),ph:lr(0,9)});

  /* the near sea cut out over a rider, so hulls and bodies sit IN the water */
  function seaCover(x0,x1){const img=NEAR[S.nf];x0=Math.floor(x0);let w=Math.ceil(x1)-x0,sx=Math.floor(mod(x0+S.na,NW)),x=x0;
    while(w>0){const ww=Math.min(w,NW-sx);ctx.drawImage(img,sx,0,ww,img.height,x,NY,ww,img.height);x+=ww;w-=ww;sx=0}}
  function splash(x,y,n,big){if(FX.length>150||x<-10||x>W+10)return;for(let k=0;k<n;k++){const l=rnd(.25,.5)*(big?1.6:1);FX.push({x:x+rnd(-3,3),y:y-1,vx:rnd(-30,20),vy:rnd(-60,-20)*(big?1.6:1),life:l,l0:l,c:k%3?'#9ad2e0':'#ffffff',s:big&&k%2?2:1})}}

  A.drawBackground=function(t){
    sync();const a=clk(t),c=ctx;nearState(a);lz(a);const fl=flashOn();
    c.drawImage(fl?SKYF:SKY,0,0);
    strip(fl?CFF:CF,a*2.2,TOP-2);
    if(LZ.on&&LZ.d<0&&LZ.d>-.9&&(LZ.d>-.3||((-LZ.d*16)|0)%2))c.drawImage(GLOW,(LZ.x-28)|0,TOP+6);
    strip(fl?CMF:CM,a*5.5,TOP-2);
    if(LZ.on&&LZ.d>=0&&LZ.d<.22&&(LZ.d<.09||LZ.d>=.16))skyBolt();
    /* horizon: islands, wrecks, lighthouses with sweeping beams */
    for(const o of HOR){const x=Math.floor(mod(o.x-a*3.5,HWLD)-90),s=o.s;if(x>W||x<-s.c.width)continue;const y=HY+1-s.c.height;c.drawImage(s.c,x,y);
      for(const l of s.lights)if(((a*l[3]+l[4])%1)<.5){c.fillStyle=l[2];c.fillRect(x+l[0],y+l[1],1,1)}
      if(s.beam){const ph=(a*.45+o.x*.01)%1,ln=Math.floor(Math.sin(ph*TAU)*30),bx=x+s.beam[0],by=y+s.beam[1];c.fillStyle=pat('#5e7478');
        if(ln>2)for(let k=2;k<ln;k+=3)c.fillRect(bx+k,by-(k>>3),3,1+(k>>3)*2);else if(ln<-2)for(let k=2;k<-ln;k+=3)c.fillRect(bx-k-3,by-(k>>3),3,1+(k>>3)*2);
        c.fillStyle='#ffffaa';c.fillRect(bx,by,1,1)}}
    strip(FAR,a*FARV,HY);
    if(fl){c.fillStyle=pat('#5e8c8a');c.fillRect(0,HY+1,W,8);c.fillStyle=pat('#9ad2e0');c.fillRect((LZ.x-10)|0,HY+1,20,26)}
    c.drawImage(REFL[Math.floor(a*3)%3],174,HY+1);
    /* middle distance: tall stacks, an arch, the lighthouse and a galleon wreck */
    for(const o of MIDO){const x=Math.floor(mod(o.x-a*MIDOV,MWLD)-100),s=o.s;if(x>W||x<-s.c.width)continue;const y=126-s.c.height;c.drawImage(s.c,x,y);
      for(const l of s.lights)if(((a*l[3]+l[4])%1)<.55){c.fillStyle=l[2];c.fillRect(x+l[0],y+l[1],1,1);if(l[2]==='#ffffaa'){c.fillRect(x+l[0]-1,y+l[1],3,1)}}
      if(s.beam){const ph=(a*.4+.3)%1,ln=Math.floor(Math.sin(ph*TAU)*60),bx=x+s.beam[0],by=y+s.beam[1];c.fillStyle=pat('#70a4b2');
        if(ln>3)for(let k=3;k<ln;k+=4)c.fillRect(bx+k,by-1-(k>>4),4,3+(k>>4)*2);else if(ln<-3)for(let k=3;k<-ln;k+=4)c.fillRect(bx-k-4,by-1-(k>>4),4,3+(k>>4)*2)}}
    strip(MID[Math.floor(a*MFPS)%MF],a*MIDV,MY);
    /* whirlpools on the mid swells */
    {const wf=Math.floor(a*9)%6;for(const q of [[120,134],[560,150]]){const x=Math.floor(mod(q[0]-a*MIDV,900)-60);if(x<W+30&&x>-30)c.drawImage(WHM[wf],x-25,q[1]-7)}}
    /* a leviathan surfacing: shadow, arching back, fluke slap, spray */
    {const per=21,k=Math.floor(a/per),ph=a-k*per;if(ph<7){const sx=Math.floor(150+hash(k,1,7)*150-ph*MIDV),by=147;
      if(sx>-60&&sx<W+60){
        if(ph<1.6)c.drawImage(SHADOW,sx-48,by-4);
        if(ph>1&&ph<3.4){const vis=Math.floor(Math.sin((ph-1)/2.4*Math.PI)*BACK.height);if(vis>0){c.drawImage(BACK,0,0,BACK.width,vis,sx-49,by-vis,BACK.width,vis);c.fillStyle='#9ad2e0';for(let q=0;q<8;q++)c.fillRect(sx-46+q*12+((a*20+q*5)%6|0),by-1,4,1)}}
        if(ph>3.6&&ph<5.4){const vis=Math.floor(Math.sin((ph-3.6)/1.8*Math.PI)*FLUKE.height);if(vis>0)c.drawImage(FLUKE,0,0,FLUKE.width,vis,sx+20,by-vis,FLUKE.width,vis)}
        if(ph>5.1&&ph<6.6){const tt=ph-5.1;for(let q=0;q<16;q++){const vx=(hash(k,q,2)-.6)*40,vy=40+hash(k,q,3)*50,x=sx+44+vx*tt,y=by-(vy*tt-46*tt*tt);if(y<by){c.fillStyle=q%3?'#9ad2e0':'#ffffff';c.fillRect(x|0,y|0,q%4?1:2,q%4?1:2)}}}
      }}}
    /* the churning sea under an angry kraken */
    if(S.churn>.2){c.fillStyle='#70a4b2';for(let i=0;i<CHURN.length*S.churn;i++){const p=CHURN[i],x=mod(p.x-a*p.v,W),y=p.y+Math.sin(a*3+p.ph)*3;c.fillRect(x|0,y|0,3+(i&3),1)}}
    strip(NEAR[S.nf],S.na,NY);
    /* rain, two layers, falling down and to the left */
    for(let k=0;k<2;k++){const r=RAIN[k],ox=mod(a*(k?90:60),W),oy=mod(a*(k?220:160),184);
      for(const dx of [0,W])for(const dy of [0,184])c.drawImage(r,Math.floor(dx-ox),Math.floor(TOP+dy-oy))}
  };
  A.drawForeground=function(t){
    const a=clk(t),c=ctx;
    strip(SCUD,a*34,TOP);
    for(let i=0;i<SPR.length;i++){const p=SPR[i],x=mod(p.x-a*p.v,W+20)-10,y=183+p.y+Math.sin(a*2.6+p.ph)*3;if(((a*1.7+p.ph)%1)<.75){c.fillStyle=p.c;c.fillRect(x|0,y|0,p.s,p.s)}}
    lz(a);if(flashOn()&&LZ.d<.05){c.fillStyle=pat('#9ad2e0');c.fillRect(0,TOP,W,4)}
  };
  A.tick=function(dt,live){
    sync();
    if(G.boss||G.state!=='play')S.bt+=dt;
    nearState(clk(bgT()));
    if(!G.boss)S.churn=Math.max(0,S.churn-dt*.3);
    for(const b of EB){
      if(b.fuse&&!b.pop&&b.t>=b.fuse){b.pop=1;b.life=1e-6;if(live&&room(6)){ebSpiral(b.x,b.y,6,46,Math.random()*TAU,{sty:'shard',life:2.4})}FX.push({ring:1,x:b.x,y:b.y,r:2,life:.25,max:9,col:'#ffffff'})}
      if(b.ign&&!b.lit&&b.t>=b.ign){b.lit=1;b.vx=-(b.isp||135);b.vy=0;b.ay=0}
    }
  };

  /* =====================================================================
     ENEMY SPRITES
     ===================================================================== */
  /* flying fish: silver body, blue back, big wing fins, three headings */
  function fishSpr(th,f){
    const Sz=17,c=8.5,ct=Math.cos(th),st=Math.sin(th),ws=[-5,-2.6,1.6,-1.2][f];
    return paint(Sz,Sz,(i,j)=>{const dx=i+.5-c,dy=j+.5-c,u=dx*ct+dy*st,v=-dx*st+dy*ct;
      const eb=(u+1)/5.3,hb=Math.abs(eb)<1?2.4*Math.sqrt(1-eb*eb):0,body=Math.abs(v)<=hb;
      const stalk=u>=3.4&&u<=5.4&&Math.abs(v)<=.85,au=u-4.6,fork=u>4.6&&u<8.2&&Math.abs(v)<=au*1.15+.3&&Math.abs(v)>=au*1.15-1.4;
      if(inTri(u,v,-2.4,-.3,2.4,-.3,3.6,ws))return Math.abs(((u+3)*1.1)%2-1)<.35?'#ffffff':'#9ad2e0';
      if(body){if(u<-3.5&&u>-4.9&&v>-1.3&&v<-.1)return K;if(u<-5.2)return '#9ad2e0';if(v<-1.3)return '#352879';if(v<-.5)return '#70a4b2';if(v<.5)return '#bbbbbb';return '#ffffff'}
      if(stalk||fork)return v<0?'#70a4b2':'#352879';
      return null},false);
  }
  const FISH=[.5,0,-.5].map(th=>[0,1,2,3].map(f=>fin(fishSpr(th,f)))),FISHW=FISH.map(s=>s.map(whiteOf));
  /* sailfish: violet-blue with a tall rippling sail and a sword bill */
  function sailSpr(th,f){
    const Sz=32,c=16,ct=Math.cos(th),st=Math.sin(th),ws=[-6,-3,2,-2][f],rip=f*TAU/4;
    return paint(Sz,Sz,(i,j)=>{const dx=i+.5-c,dy=j+.5-c,u=dx*ct+dy*st,v=-dx*st+dy*ct;
      const eb=u/8.6,hb=Math.abs(eb)<1?3.3*Math.sqrt(1-eb*eb):0,body=Math.abs(v)<=hb;
      const bill=u>=-15&&u<-7&&Math.abs(v+.6)<=.3+(u+15)*.08;
      const sh=5.5*(1-Math.pow((u+.5)/6.5,2))+Math.sin(u*1.1+rip)*.8,sail=u>-6&&u<6&&v<0&&v>-hb-sh&&!body;
      const au=u-8,tail=(u>=7&&u<=9.5&&Math.abs(v)<1.3)||(u>8&&u<14.5&&Math.abs(v)<=au*1.3+.5&&Math.abs(v)>=au*1.3-1.7);
      if(inTri(u,v,-3,.4,2,.4,3.6,ws))return Math.abs(((u+4)*1.1)%2-1)<.3?'#ffffff':'#9ad2e0';
      if(body){if(u<-5.6&&u>-7&&v>-1.6&&v<-.3)return K;
        if(v<-1.6)return '#352879';if(v<.4)return (Math.abs((u+20)%3.2-1.6)<.45&&u>-4)?'#9ad2e0':'#6c5eb5';return v<1.6?'#bbbbbb':'#ffffff'}
      if(bill)return '#959595';
      if(sail)return Math.abs(((u+6)*.9)%2-1)<.3?'#6c5eb5':(hash(Math.round(u*2),Math.round(v*2),5)<.12?'#9ad2e0':'#352879');
      if(tail)return '#352879';
      return null},false);
  }
  const SAIL=[.42,0,-.42].map(th=>[0,1,2,3].map(f=>fin(sailSpr(th,f)))),SAILW=SAIL.map(s=>s.map(whiteOf));
  /* attack gull (white seabird, black wingtips) and gull drone (mechanical, red eye) */
  function gullSpr(f,mech){
    const TIP=[[17,1],[19.5,3.5],[17,13],[19.5,5]],ELB=[[12.5,2.5],[13.5,4.5],[13,10],[13.5,5.5]];
    const dive=f===4,T=dive?[20,7]:TIP[f],E=dive?[14.5,6.4]:ELB[f],S0=[10,7.2],TR=[16,8];
    return paint(22,14,(i,j)=>{const x=i+.5,y=j+.5;
      const head=((x-6)/2.5)**2+((y-6.6)/2.3)**2<=1,body=((x-11.2)/5.6)**2+((y-8.3)/2.5)**2<=1;
      const tail=x>=15.5&&x<=19.5&&y>=7.4&&y<=9.6;
      const beak=x>=2.2&&x<4&&y>=6.4&&y<=7.6;
      const wing=inTri(x,y,S0[0],S0[1],E[0],E[1],TR[0],TR[1])||inTri(x,y,E[0],E[1],T[0],T[1],TR[0],TR[1]);
      if(wing){const tip=Math.hypot(x-T[0],y-T[1]),lead=Math.min(segD(x,y,S0[0],S0[1],E[0],E[1]),segD(x,y,E[0],E[1],T[0],T[1]));
        if(mech){if(tip<1.6)return f&1?'#ff7777':'#9a3a3a';if(lead<.8)return '#bbbbbb';return (Math.floor(x+y)%3===0)?'#352879':'#6c6c6c'}
        if(tip<3.4)return (Math.floor(x)+Math.floor(y))%4===0?'#ffffff':'#444444';if(lead<.8)return '#ffffff';return '#959595'}
      if(head){if(x>4.6&&x<5.8&&y>5.4&&y<6.6)return mech?(f&1?'#ff7777':'#ffffff'):K;if(mech)return y<6?'#bbbbbb':'#6c6c6c';return '#ffffff'}
      if(beak){if(mech)return x<3?'#bbbbbb':'#444444';return (x<3.2&&y>7)?'#ff7777':'#ffffaa'}
      if(body){if(mech){if(Math.abs(y-8.6)<.5)return '#1c1840';return y<8?'#959595':'#444444'}return y<8.4?'#ffffff':'#bbbbbb'}
      if(tail){if(mech)return '#444444';return x>18.5?'#444444':'#ffffff'}
      return null},false);
  }
  const GULL=[0,1,2,3,4].map(f=>fin(gullSpr(f,false))),DRONE=[0,1,2,3,4].map(f=>fin(gullSpr(f,true)));
  const GULLW=GULL.map(whiteOf),DRONEW=DRONE.map(whiteOf);
  /* navy gunboat: armoured hull, rust waterline, lit bridge, turret with an up-angled gun */
  const BOATRAW=paint(34,20,(i,j)=>{
    if(j>=12&&j<=18){const xl=2+(j-12)*1.3,xr=31-(j-12)*.5;if(i>=xl&&i<=xr){
      if(j===12)return '#6c6c6c';if(j===15)return (i%5===0)?'#68372b':'#9a3a3a';if(j>15)return '#1c1840';
      return hash(i,j,3)<.12?'#68372b':(j===13?'#352879':'#1c1840')}}
    if(i>=14&&i<=22&&j>=6&&j<12){if(j===8&&i>=15&&i<=21&&i%2)return '#ffffaa';if(j===6)return '#bbbbbb';return i<16?'#959595':'#6c6c6c'}
    if(i>=24&&i<=27&&j>=5&&j<12){if(j===7)return '#9a3a3a';if(j===5)return '#444444';return i===24?'#6c6c6c':'#444444'}
    if(i===19&&j>=1&&j<6)return '#959595';if(j===2&&i>=17&&i<=21)return '#6c6c6c';
    if(((i-8.5)/3.4)**2+((j-11)/2.4)**2<=1&&j<12)return j<10?'#bbbbbb':'#959595';
    {const t=(7.5-i)/6.5;if(t>=0&&t<=1&&Math.abs(j-(9-t*4))<.75)return t>.85?'#bbbbbb':'#444444'}
    if(j===10&&i>=28&&i<=31)return '#6c6c6c';if(i>=28&&i<=30&&j===11)return '#959595';
    return null},false);
  const TILT=[-.18,-.09,0,.09,.18],BOAT=TILT.map(a=>fin(rotC(BOATRAW,a))),BOATW=BOAT.map(whiteOf);
  /* sea serpent: green scaled head with a red frill, segmented neck */
  const GRN=['#06120a','#14301c','#2c5a2c','#588d43','#9ad284','#ccff99'];
  function serpHead(a,flare){
    const Hx=19,Hy=12.5,ca=Math.cos(a),sa=Math.sin(a);
    const skull=(x,y)=>((x-17)/9)**2+((y-8.5)/6.2)**2<=1,snout=(x,y)=>x>=3&&x<=13&&y>=5.5+(13-x)*.12&&y<=12.5,neck=(x,y)=>((x-25)/6)**2+((y-12)/6)**2<=1;
    const jaw0=(x,y)=>x>=4&&x<=19&&y>12.5&&y<=15.5-(x<8?(8-x)*.4:0);
    const jq=(x,y)=>{const dx=x-Hx,dy=y-Hy;return [dx*ca-dy*sa+Hx,dx*sa+dy*ca+Hy]};
    const jaw=(x,y)=>{const q=jq(x,y);return jaw0(q[0],q[1])};
    const frill=(x,y)=>{for(let k=0;k<4;k++){const bx=12+k*3.3,by=3+k*.6;if(inTri(x,y,bx-1.4,by+2.5,bx+1.4,by+2.5,bx+2.2+flare,by-4-flare*1.5))return true}return false};
    const mouth=(x,y)=>a>.05&&x>4&&x<Hx-1&&y>12.5&&jq(x,y)[1]<12.5&&Math.hypot(x-Hx,y-Hy)<16;
    const mask=(i,j)=>{const x=i+.5,y=j+.5;return skull(x,y)||snout(x,y)||neck(x,y)||jaw(x,y)||frill(x,y)||mouth(x,y)};
    return relief(32,22,mask,GRN,{cap:3,paint:(i,j,v)=>{const x=i+.5,y=j+.5;
      if(frill(x,y)&&!skull(x,y))return Math.abs((x-12)%3.3-1.6)<.5?'#ff7777':'#9a3a3a';
      if(mouth(x,y)&&!jaw(x,y)&&!snout(x,y)){if(y<14.2&&Math.floor(x)%3===0)return '#ffffff';return x>14?'#68372b':'#9a3a3a'}
      if(jaw(x,y)){const q=jq(x,y);if(a>.05&&q[1]<13.6&&Math.floor(q[0])%3===1&&q[0]>5&&q[0]<17)return '#ffffff';if(q[1]>14.2)return rp(['#588d43','#b8c76f','#ffffaa'],v,i,j);return null}
      if(x>10.2&&x<12.8&&y>6.2&&y<8.6)return Math.abs(x-11.5)<.5?K:'#ffffaa';
      if(x>9.5&&x<13.5&&y>5&&y<6.2)return '#06120a';
      if(Math.floor(x)===4&&Math.floor(y)===7)return K;
      if(neck(x,y)&&y>14)return rp(['#588d43','#b8c76f','#ffffaa'],v,i,j);
      if(hash(i,j,31)<.14)return rp(GRN,v-.25,i,j);
      return null}});
  }
  const SHEAD=[[0,0],[.22,0],[.6,0],[.6,1.2]].map(p=>serpHead(p[0],p[1])),SHEADW=SHEAD.map(whiteOf);
  const disc=(r,ramp,belly,seed)=>{const Sz=Math.ceil(r*2)+1,c=(Sz-1)/2;return relief(Sz,Sz,(i,j)=>Math.hypot(i-c,j-c)<=r+.2,ramp,{cap:Math.max(2,r*.7),paint:(i,j,v)=>{
    const dx=i-c,dy=j-c;if(belly&&dy>r*.35&&dx<r*.3)return rp(belly,v,i,j);if(hash(i,j,seed)<.13)return rp(ramp,v-.25,i,j);return null}})};
  const SNECK=[];for(let r=3;r<=9;r++)SNECK.push(disc(r,GRN,['#588d43','#b8c76f','#ffffaa'],r*3));
  const SNECKW=SNECK.map(whiteOf);
  /* storm wreckage: mast with a torn sail, a hull chunk, barrel, crate, buoy */
  const WOOD=['#2a140c','#3a2018','#68372b','#9a6759','#d8a878'];
  const mastRaw=paint(24,24,(i,j)=>{const x=i+.5,y=j+.5;
    if(segD(x,y,3,20,20,3)<1.5)return segD(x,y,3.6,19.4,20.6,2.6)<.6?'#9a6759':'#68372b';
    if(segD(x,y,6,8,16,18)<.9)return '#68372b';
    if(inTri(x,y,8,10,15,17,17,9)&&hash(i,j,4)>.15)return (Math.abs(x-y-1)<.8)?'#9a3a3a':((x+y)%4<1?'#959595':'#bbbbbb');
    if(segD(x,y,20,3,22,12)<.5&&j%2)return '#444444';
    return null},false);
  const hullRaw=paint(24,16,(i,j)=>{const x=i+.5,t=(x-12)/12,top=3+t*t*6;if(j<top||j>top+8)return null;if(hash(i,j>>2,5)<.08&&(j<top+1.5||j>top+6.5))return null;
    if(hash(i,j,6)<.05)return '#bbbbbb';const pl=Math.floor((j-top)/2)%2;if(i%6===2)return '#2a140c';return pl?'#68372b':'#9a6759'},false);
  const barrelRaw=paint(9,11,(i,j)=>{const x=i+.5,y=j+.5;if(((x-4.5)/4.4)**2+((y-5.5)/5.4)**2>1)return null;if(j===2||j===8)return '#444444';return x<3?'#9a6759':x<6?'#68372b':'#3a2018'},false);
  const crateRaw=paint(9,9,(i,j)=>{if(i===0||j===0||i===8||j===8)return '#68372b';if(i===j||i===8-j)return '#68372b';return (i+j)%3?'#9a6759':'#d8a878'},false);
  const buoyRaw=paint(11,11,(i,j)=>{const d=Math.hypot(i-5,j-5);if(d>5.2||d<2.4)return null;return (Math.floor(Math.atan2(j-5,i-5)/(TAU/8)+8)%2)?'#9a3a3a':'#bbbbbb'},false);
  const spinSet=(raw,n)=>{const fr=[];for(let k=0;k<n;k++)fr.push(fin(rotC(raw,k/n*TAU)));return {fr,w:fr.map(whiteOf)}};
  const WBIG=[spinSet(mastRaw,8),spinSet(hullRaw,8)],WSMALL=[spinSet(barrelRaw,8),spinSet(crateRaw,8),spinSet(buoyRaw,8)];
  /* waterspout column (sea rooted) and its cloud funnel twin */
  function spoutSpr(f){const w=30,h=74;
    return paint(w,h,(i,j)=>{const q=j/(h-1),cx=15+Math.sin(j*.11+f*TAU/6)*3*(1-q*.6)+Math.sin(j*.05)*1.5;
      let hw=2.4+Math.pow(1-q,3)*6;if(q>.84)hw+=(q-.84)/.16*9;
      const dx=i+.5-cx;if(Math.abs(dx)>hw)return null;
      if(q>.84){if(hash(i,j,f)<(q-.84)*3)return null;return hash(i,j+3,f)<.45?'#ffffff':'#9ad2e0'}
      const sw=Math.sin(j*.55-dx*1.1+f*TAU/3),side=dx/hw;
      if(side<-.4)return sw>.2?'#ffffff':'#9ad2e0';if(side<.3)return sw>.4?'#9ad2e0':'#70a4b2';return sw>.5?'#70a4b2':'#356663'})}
  const SPOUT=[0,1,2,3,4,5].map(spoutSpr),FUNNEL=SPOUT.map(flipV);
  /* breach spray column, 7 growth frames anchored at the bottom */
  const SPH=[12,34,58,76,82,66,40];
  const SPRAY=SPH.map((hh,f)=>paint(30,88,(i,j)=>{const y=87-j;if(y>hh+3)return null;const q=y/hh;
    let hw=3.5+q*3+(q>.72?Math.sin(clamp((q-.72)/.3,0,1)*Math.PI)*5:0)+Math.sin(y*.4+f)*1.1;const dx=Math.abs(i+.5-15);
    if(dx>hw){if(dx<hw+4&&hash(i,j,f+40)<.05)return '#9ad2e0';return null}
    if(dx>hw-1.5&&hash(i,j,f)<.45)return null;
    return dx<hw*.35?'#ffffff':dx<hw*.75?'#9ad2e0':'#70a4b2'}));

  /* =====================================================================
     ENEMIES
     ===================================================================== */
  /* FLYING FISH: schools leaping from the swell in long skipping arcs */
  A.enemies.ring={frames:FISH[1],white:FISHW[1],w:12,h:8,pts:120,vx:-68,
    init(e,o){e.t=0;e.base=rnd(164,169);e.apex=Math.min(clamp(e.y0,40,128),e.base-34);e.om=rnd(2.3,2.6);e.ph0=((o.ph||0)%1)*.5;e.k=0;e.y=e.base;e.shootT=rnd(1.5,4);e.gun=Math.random()<[.25,.4,.55][LV()-1]},
    move(e,dt,live){e.x+=e.vx*dt;const a=e.t*e.om+e.ph0,s=Math.sin(a),Am=e.base-e.apex;e.y=e.base-Am*Math.abs(s);e.vy=-Am*Math.cos(a)*e.om*(s<0?-1:1);
      const k=Math.floor(a/Math.PI);if(k!==e.k){e.k=k;splash(e.x,e.base,3)}
      if(e.gun&&live&&e.x<W-30&&e.x>96&&(e.shootT-=dt)<=0){e.shootT=rnd(3,4.6)/(1+.18*(LV()-1));if(room(1)){ebAim(e.x-6,e.y,60,rnd(-.08,.08),{sty:'pellet'});sfxEnemyLaser()}}},
    draw(c,e,fl){const vy=e.vy||0,hd=vy<-30?0:vy>30?2:1,im=(fl?FISHW:FISH)[hd][Math.floor((e.t||0)*14)%4];c.drawImage(im,(e.x-im.width/2)|0,(e.y-im.height/2)|0)}};
  /* SAILFISH: big slow leaps, a fan at the top of every arc */
  A.enemies.ringR={frames:SAIL[1],white:SAILW[1],w:22,h:11,hp:3,pts:220,vx:-52,
    init(e,o){e.t=0;e.base=rnd(166,170);e.apex=Math.min(clamp(e.y0,42,118),e.base-46);e.om=rnd(1.55,1.75);e.ph0=((o.ph||0)%1)*.4;e.k=0;e.k2=0;e.y=e.base},
    move(e,dt,live){e.x+=e.vx*dt;const a=e.t*e.om+e.ph0,s=Math.sin(a),Am=e.base-e.apex;e.y=e.base-Am*Math.abs(s);e.vy=-Am*Math.cos(a)*e.om*(s<0?-1:1);
      const k=Math.floor(a/Math.PI);if(k!==e.k){e.k=k;splash(e.x,e.base,5,true)}
      const k2=Math.floor((a-Math.PI/2)/Math.PI);if(k2!==e.k2){e.k2=k2;if(live&&e.x>100&&e.x<W-20){const n=LV()>=2?5:3;if(room(n)){ebFan(e.x-10,e.y,n,.5+n*.06,62,aim(e.x-10,e.y),{sty:'pellet'});sfxEnemyLaser()}}}},
    draw(c,e,fl){const vy=e.vy||0,hd=vy<-30?0:vy>30?2:1,im=(fl?SAILW:SAIL)[hd][Math.floor((e.t||0)*10)%4];c.drawImage(im,(e.x-im.width/2)|0,(e.y-im.height/2)|0)}};
  /* ATTACK GULLS and GULL DRONES: sweeping dives from the clouds; drones drop torpedoes */
  A.enemies.dart={frames:GULL.slice(0,4).concat(DRONE.slice(0,4)),white:GULLW,w:16,h:9,pts:140,vx:-105,
    init(e,o){e.v=o.v!=null?o.v:(Math.random()<.4?1:0);e.dive=o.dive!=null?!!o.dive:Math.random()<.6;e.vx=-105;e.vy=0;e.dropped=0;e.pull=0;
      if(e.dive){e.x=rnd(190,300);e.y=TOP-6;e.ty=clamp((P?P.y:100)+rnd(-12,12),46,160)}else{e.ty=clamp(e.y,30,170)}},
    move(e,dt,live){e.x+=e.vx*dt;
      if(!e.pull&&e.x<(P?P.x:60)+88){e.pull=1;e.ty=e.y>100?clamp(e.y-70,TOP+8,BOT-30):clamp(e.y+70,TOP+30,BOT-20)}
      const want=(e.ty-e.y)*3.2;e.vy+=(want-e.vy)*Math.min(1,dt*4);e.y+=e.vy*dt;
      if(live&&!e.dropped&&e.x<262&&e.x>150&&Math.abs(e.y-e.ty)<14){e.dropped=1;
        if(e.v){if(room(1)){ebShot(e.x,e.y+5,e.vx*.3,28,{sty:'torp',ign:.45,isp:125+LV()*8,hh:1});sfxEnemyLaser()}}
        else if(room(2)){if(LV()>=2)ebFan(e.x-6,e.y,LV()>=3?3:2,.3,68,aim(e.x-6,e.y),{sty:'pellet'});else ebAim(e.x-6,e.y,66,0,{sty:'pellet'});sfxEnemyLaser()}}},
    draw(c,e,fl){const dv=Math.abs(e.vy||0)>48,set=e.v?(fl?DRONEW:DRONE):(fl?GULLW:GULL),im=set[dv?4:Math.floor((e.t||0)*12)%4],x=(e.x-im.width/2)|0,y=(e.y-im.height/2)|0;
      c.drawImage(im,x,y);
      if(e.v&&!e.dropped&&!fl){c.fillStyle=K;c.fillRect(x+8,y+12,9,3);c.fillStyle='#959595';c.fillRect(x+9,y+13,7,1);c.fillStyle='#ff7777';c.fillRect(x+8,y+13,1,1)}}};
  /* NAVY GUNBOATS: glued to the near swell, ballistic shells and flak that bursts near the ship */
  const boatMuzzle=(e,tt)=>{const a=TILT[tt],ox=-16,oy=-5;return [e.x+ox*Math.cos(a)-oy*Math.sin(a),e.y+ox*Math.sin(a)+oy*Math.cos(a)]};
  A.enemies.cross={frames:BOAT,white:BOATW,w:26,h:12,hp:4,pts:260,
    init(e,o){e.cs=rnd(4,16);e.wx=e.x+S.na;e.n=0;e.mf=0;e.tt=2;e.shootT=rnd(.8,1.8);e.y=surfN(e.x)-6;e.vy=0},
    move(e,dt,live){e.wx-=e.cs*dt;e.x=e.wx-S.na;const y0=surfN(e.x);e.y=y0-6;const sl=(surfN(e.x+8)-surfN(e.x-8))/16;e.tt=clamp(Math.round(Math.atan(sl)/.09)+2,0,4);
      e.vx=-(NEARV+e.cs);e.vy=0;if(e.mf>0)e.mf-=dt;
      if(live&&e.x<W-20&&e.x>110&&(e.shootT-=dt)<=0){e.shootT=rnd(2.1,3)*[1,.85,.72][LV()-1];
        const [mx,my]=boatMuzzle(e,e.tt);
        if(room(6)){const sp=70,dx=P.x-mx,dy=P.y-my,T=Math.max(.7,Math.hypot(dx,dy)/sp),ay=12,vx=dx/T,vy=(dy-.5*ay*T*T)/T;
          if(e.n++%2===0||LV()===1)ebShot(mx,my,vx,vy,{sty:'shell',ay});else ebShot(mx,my,vx,vy,{sty:'flak',ay,fuse:T*.78});
          e.mf=.14;sfxEnemyLaser()}}},
    draw(c,e,fl){const tt=e.tt==null?2:e.tt,im=(fl?BOATW:BOAT)[tt],x=(e.x-im.width/2)|0,y=(e.y-im.height/2)|0,t=e.t||0;
      for(let k=0;k<3;k++){const ag=(t*.8+k/3)%1;c.fillStyle=ag<.4?'#6c6c6c':'#444444';c.fillRect((e.x+8+ag*10)|0,(e.y-9-ag*14)|0,ag<.5?2:3,ag<.5?2:3)}
      c.drawImage(im,x,y);
      if(!fl){if(((t*2.5)|0)%2){c.fillStyle='#ffffaa';c.fillRect((e.x+2+Math.sin(TILT[tt])*9)|0,(e.y-9)|0,1,1)}
        if(e.mf>0){const [mx,my]=boatMuzzle(e,tt);c.fillStyle='#ffffaa';c.fillRect((mx-2)|0,(my-1)|0,3,3);c.fillStyle='#ffffff';c.fillRect((mx-1)|0,my|0,1,1)}}
      const sy=surfN(e.x);if(Math.abs(e.y+6-sy)<4){seaCover(e.x-18,e.x+18);c.fillStyle='#ffffff';c.fillRect((e.x-16)|0,(sy-1)|0,3,1);c.fillStyle='#9ad2e0';c.fillRect((e.x-18+((t*12)|0)%3)|0,(sy)|0,4,1);c.fillRect((e.x+12)|0,sy|0,6,1)}}};
  /* SEA SERPENTS: a neck rising out of the swell, weaving, rearing and biting, spitting fans */
  const NS=12,TMP=[];for(let k=0;k<NS;k++)TMP.push({x:0,y:0,r:5});
  function serpNeck(e,out){
    const ax=e.x+30+Math.sin((e.t||0)*.9)*4,ay=surfN(ax)+3,hx=e.x+9,hy=e.y+3,c1x=ax+4,c1y=ay-(ay-hy)*.7,c2x=hx+22,c2y=hy+8;
    for(let k=0;k<NS;k++){const u=(k+.5)/NS,m=1-u,a=m*m*m,b=3*m*m*u,cc=3*m*u*u,d=u*u*u,s=out[k];s.x=a*ax+b*c1x+cc*c2x+d*hx;s.y=a*ay+b*c1y+cc*c2y+d*hy;s.r=8.4-u*3.4}
    e.ax=ax;e.ay=ay;
  }
  A.enemies.pod={frames:SHEAD,white:SHEADW,w:20,h:13,hp:6,pts:420,vx:-24,
    init(e,o){e.y0=clamp(e.y0,66,138);e.y=e.y0;e.bx=e.x;e.st='swim';e.sT=rnd(2,3.2);e.spitT=rnd(1.2,2.2);e.ox=0;e.oy=0;e.jaw=0;e.seg=[];for(let k=0;k<NS;k++)e.seg.push({x:0,y:0,r:5});serpNeck(e,e.seg);
      e.hitTest=(m,x,y)=>{if(Math.abs(x-m.x)<12&&Math.abs(y-m.y)<8)return 1;for(const s of m.seg){if(s.y<m.ay-2&&Math.hypot(x-s.x,y-s.y)<s.r+1)return .7}return 0}},
    move(e,dt,live){const px0=e.x,py0=e.y;e.bx+=e.vx*dt;e.sT-=dt;const hy=e.y0+Math.sin(e.t*1.2)*16;
      if(e.st==='swim'){e.ox+=(0-e.ox)*Math.min(1,dt*4);e.oy+=(0-e.oy)*Math.min(1,dt*4);e.jaw=Math.sin(e.t*3)>.8?1:0;
        if(live&&e.bx>100&&e.bx<W-20&&(e.spitT-=dt)<=0){e.spitT=rnd(2.6,3.4)*[1,.85,.72][LV()-1];const n=LV()>=3?7:5;if(room(n)){ebFan(e.x-10,e.y+2,n,.9,58,aim(e.x-10,e.y),{sty:'spit'});sfxEnemyLaser();e.jaw=2}}
        if(e.sT<=0&&e.bx>110&&e.bx<W-30){e.st='rear';e.sT=.6}}
      else if(e.st==='rear'){e.ox+=(10-e.ox)*Math.min(1,dt*6);e.oy+=(-12-e.oy)*Math.min(1,dt*6);e.jaw=3;if(e.sT<=0){e.st='lunge';e.sT=.32;e.tx=-34;e.ty=clamp(P.y,40,165)-hy}}
      else if(e.st==='lunge'){e.ox+=(e.tx-e.ox)*Math.min(1,dt*12);e.oy+=(e.ty-e.oy)*Math.min(1,dt*12);e.jaw=2;if(e.sT<=0){e.st='back';e.sT=.6}}
      else{e.jaw=1;if(e.sT<=0){e.st='swim';e.sT=rnd(3.4,4.6)*[1,.85,.72][LV()-1]}}
      e.x=e.bx+e.ox;e.y=hy+e.oy;e.vx=dt>0?(e.x-px0)/dt:-24;e.vy=dt>0?(e.y-py0)/dt:0;if(e.st!=='lunge'&&e.st!=='rear')e.vx=Math.min(e.vx,-10);
      serpNeck(e,e.seg)},
    draw(c,e,fl){const seg=e.seg||(serpNeck(e,TMP),TMP),t=e.t||0,nk=fl?SNECKW:SNECK;
      if(!e.seg)serpNeck(e,TMP);
      /* coils breaking the water behind the neck */
      for(let h=0;h<2;h++){const cx=e.ax+18+h*20,cy=surfN(cx)+4,hr=7+Math.sin(t*2+h*2)*2;for(let q=0;q<5;q++){const an=Math.PI+q/4*Math.PI,im=nk[3];c.drawImage(im,(cx+Math.cos(an)*hr-im.width/2)|0,(cy+Math.sin(an)*hr-im.height/2)|0)}}
      for(let k=0;k<NS;k++){const s=seg[k],im=nk[clamp(Math.round(s.r)-3,0,6)];c.drawImage(im,(s.x-im.width/2)|0,(s.y-im.height/2)|0)}
      if(Math.abs(e.ay-surfN(e.ax)-3)<6)seaCover(e.ax-12,e.ax+52);
      const hd=(fl?SHEADW:SHEAD)[e.jaw||0];c.drawImage(hd,(e.x-hd.width/2+3)|0,(e.y-hd.height/2)|0);
      if(e.st==='rear'&&!fl&&((t*16)|0)%2){c.fillStyle='#ffffff';c.fillRect((e.x-3)|0,(e.y-4)|0,2,2)}}};
  /* HAZARDS: storm wreckage, waterspouts, breach spray, lightning strikes, kraken arms */
  A.enemies.rock={frames:WBIG[0].fr.slice(0,4).concat(WSMALL[0].fr.slice(0,2),WSMALL[2].fr.slice(0,2)),white:WBIG[0].w,
    init(e,o){e.kind=o.kind||'wreck';e.st='tele';e.sT=0;
      if(e.kind==='wreck'){e.spin=rnd(-5,5);e.rot=rnd(0,8);if(e.big){e.w=e.h=19}else e.spr=Math.floor(Math.random()*3)}
      else{e.hp=e.mhp=1e6;e.pts=0;e.hazard=true;
        if(e.kind==='spout'){e.immune=true;e.up=o.up!=null?!!o.up:Math.random()<.35;e.w=12;e.h=70;e.vx=-rnd(36,48);e.vy=0;e.x=W+16;e.y=e.up?TOP+36:WL-35;e.sw=rnd(0,6);
          e.touch=(m,px_,py_)=>{const top=m.y-35,bot=m.y+35;return Math.abs(px_-m.x)<4+shk(9)&&py_>top-shk(5)&&py_<bot+shk(5)}}
        else if(e.kind==='spray'){e.hitTest=()=>0;e.x=o.x!=null?o.x:rnd(200,262);e.vx=-NEARV;e.vy=0;e.w=18;e.h=80;e.y=WL-38;e.hh=0;e.burst=0}
        else if(e.kind==='bolt'){e.hitTest=()=>0;e.x=o.x;e.vx=0;e.vy=0;e.w=10;e.y=(TOP+WL)/2;e.h=WL-TOP;e.zz=[];for(let k=0;k<20;k++)e.zz.push(rnd(-5,5));e.tele=o.tele||1.2}
        else if(e.kind==='arm'){e.hitTest=()=>0;e.mode=o.mode;e.boss=o.boss;e.vx=0;e.vy=0;e.P=[];for(let k=0;k<18;k++)e.P.push({x:0,y:0,r:5});
          if(e.mode==='lash'){e.bx=o.bx;e.ly=o.ly;e.x=(14+e.bx)/2;e.w=e.bx-14;e.y=e.ly;e.h=20}else{e.sx=o.sx;e.x=e.sx-16;e.w=44;e.y=110;e.h=140}armPath(e)}}},
    move(e,dt,live){e.sT+=dt;
      if(e.kind==='wreck'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot+=(e.spin||3)*dt;if(e.y<TOP+10||e.y>BOT-12)e.vy=-e.vy;return}
      if(e.kind==='spout'){const sw=Math.cos(e.sT*1.4+e.sw)*16;e.x+=(e.vx0||e.vx)*dt;if(!e.vx0)e.vx0=e.vx;e.x+=sw*dt;e.vx=e.vx0+sw;if(!e.up)e.y=surfN(e.x)-35;return}
      if(e.kind==='spray'){e.x+=e.vx*dt;
        if(e.st==='tele'&&e.sT>=1){e.st='burst';e.sT=0;if(live&&e.x<W){splash(e.x,WL-4,10,true);if(room(3))for(let q=0;q<3;q++)ebShot(e.x-2,WL-56,rnd(-58,-30),rnd(-36,-14),{sty:'drop',ay:28,life:3.2});sfxBoom(6,false)}}
        if(e.st==='burst'){const k=Math.min(6,Math.floor(e.sT/.14));e.fk=k;e.hh=SPH[k];if(e.sT>=.98){e.dead=1}}
        return}
      if(e.kind==='bolt'){if(e.st==='tele'&&e.sT>=e.tele){e.st='strike';e.sT=0;if(live){shake=Math.max(shake,.25);sfxBoom(8,false);splash(e.x,WL-2,10,true)}}
        if(e.st==='strike'&&e.sT>=.26)e.st='fade';if(e.st==='fade'&&e.sT>=.46)e.dead=1;return}
      if(e.kind==='arm'){armStep(e,dt,live);armPath(e)}},
    draw(c,e,fl){const k=e.kind||'wreck';
      if(k==='wreck'){const set=e.big?WBIG[(e.spr||0)%2]:WSMALL[(e.spr||0)%3],n=set.fr.length,i=((Math.floor(e.rot!=null?e.rot:(e.t||0)*4)%n)+n)%n,im=fl?set.w[i]:set.fr[i];
        c.drawImage(im,(e.x-im.width/2)|0,(e.y-im.height/2)|0);return}
      if(k==='spout'){const f=Math.floor((e.t||0)*12)%6,x=e.x|0;
        if(e.up){c.drawImage(FUNNEL[f],x-16,TOP-1);c.fillStyle=pat('#30424e');for(let y=TOP+74;y<WL;y+=3)c.fillRect((x+Math.sin(y*.13+(e.t||0)*5)*3)|0,y,2,3);c.fillStyle='#9ad2e0';c.fillRect(x-5,(surfN(x)-1)|0,11,1)}
        else{const by=(surfN(x)+3)|0;c.fillStyle=pat('#30424e');for(let y=TOP;y<by-72;y+=3)c.fillRect((x+Math.sin(y*.13+(e.t||0)*5)*3)|0,y,2,3);c.drawImage(SPOUT[f],x-16,by-75);seaCover(x-17,x+17)}
        return}
      if(k==='spray'){const x=e.x|0;
        if(e.st==='tele'){const p=e.sT,bl=((p*14)|0)%2;c.fillStyle=pat('#050d12');c.fillRect(x-14,WL-3,28,5);c.fillStyle=bl?'#ffffff':'#9ad2e0';
          for(let q=0;q<5;q++){const bb=(p*2+q*.21)%1;c.fillRect((x-9+q*4+Math.sin(q*2+p*9)*2)|0,(WL+2-bb*10*p)|0,1,1)}c.fillStyle='#70a4b2';c.fillRect(x-10-(p*6|0),WL-1,20+(p*12|0),1)}
        else{const im=SPRAY[e.fk||0];c.drawImage(im,x-16,WL-im.height+4);seaCover(x-17,x+17)}
        return}
      if(k==='bolt'){const x=e.x|0,t=e.sT||0;
        if(e.st==='tele'){const on=t>e.tele-.35||((t*10)|0)%2;c.drawImage(GLOW,x-28,TOP+2);if(on){c.fillStyle=t>e.tele-.35?'#ffffff':'#9ad2e0';for(let y=TOP+16;y<WL;y+=7)c.fillRect(x,y,1,3)}
          c.fillStyle=((t*12)|0)%2?'#ffffff':'#70a4b2';c.fillRect(x-6,WL-1,13,1)}
        else if(e.st==='strike'){let y=TOP,px_=x;for(let s=0;s<20;s++){const ny=TOP+(WL-TOP)*(s+1)/20,nx=x+e.zz[s];bseg(px_,y,nx,ny,K,K,2);bseg(px_,y,nx,ny,'#ffffff','#9ad2e0',1);px_=nx;y=ny}
          c.fillStyle='#ffffaa';c.fillRect(x-9,WL-3,19,3);c.fillStyle='#ffffff';c.fillRect(x-5,WL-4,11,2)}
        else{c.fillStyle=pat('#70a4b2');c.fillRect(x-1,TOP,3,WL-TOP)}
        return}
      if(k==='arm')drawArm(c,e,fl)}};

  /* bullet styles: every one reads as red and white on the dark sea */
  A.bullets.pellet=(c,b)=>{const x=b.x|0,y=b.y|0;c.fillStyle=K;c.fillRect(x-2,y-1,5,3);c.fillRect(x-1,y-2,3,5);c.fillStyle='#ff7777';c.fillRect(x-1,y-1,3,3);c.fillStyle=((b.t*14)|0)%2?'#ffffff':'#ffffaa';c.fillRect(x,y,1,1)};
  A.bullets.rivet=(c,b)=>{const x=b.x|0,y=b.y|0,f=((b.t*16)|0)%2;c.fillStyle=K;c.fillRect(x-2,y-2,5,5);c.fillStyle=f?'#ff7777':'#9a3a3a';c.fillRect(x-1,y-1,3,3);c.fillStyle='#ffffff';c.fillRect(x,y-1,1,3);c.fillRect(x-1,y,3,1)};
  A.bullets.spit=(c,b)=>{const x=b.x|0,y=b.y|0,f=((b.t*12)|0)%2;c.fillStyle=K;c.fillRect(x-2,y-2,5,5);c.fillStyle='#ff7777';c.fillRect(x-1,y-1,3,3);c.fillStyle='#ffffff';c.fillRect(x-1,y-1,1+f,1);c.fillStyle='#9ad284';c.fillRect(x+2,y,1,1)};
  A.bullets.ink=(c,b)=>{const x=b.x|0,y=b.y|0,f=((b.t*10)|0)%2;c.fillStyle=K;c.fillRect(x-3,y-2,7,5);c.fillRect(x-2,y-3,5,7);c.fillStyle='#ff7777';c.fillRect(x-2,y-2,5,5);c.fillStyle='#1c1840';c.fillRect(x-1,y-1,3,3);c.fillStyle=f?'#ffffff':'#ff77ff';c.fillRect(x-2,y-2,1,1);c.fillStyle='#ffffff';c.fillRect(x,y,1,1)};
  A.bullets.shell=(c,b)=>{const x=b.x|0,y=b.y|0;c.fillStyle='#444444';c.fillRect((x-b.vx*.05)|0,(y-b.vy*.05)|0,2,2);c.fillStyle=K;c.fillRect(x-2,y-2,5,5);c.fillStyle='#959595';c.fillRect(x-1,y-1,3,3);c.fillStyle=((b.t*12)|0)%2?'#ff7777':'#ffffff';c.fillRect(x-1,y-1,2,2)};
  A.bullets.flak=(c,b)=>{const x=b.x|0,y=b.y|0,rem=(b.fuse||1)-b.t,on=rem<.4?((b.t*24)|0)%2:((b.t*6)|0)%2;c.fillStyle=K;c.fillRect(x-3,y-2,7,5);c.fillRect(x-2,y-3,5,7);c.fillStyle='#9a3a3a';c.fillRect(x-2,y-2,5,5);c.fillStyle=on?'#ffffff':'#ff7777';c.fillRect(x-1,y-1,3,3)};
  A.bullets.shard=(c,b)=>{const x=b.x|0,y=b.y|0;c.fillStyle=K;c.fillRect(x-2,y-1,5,3);c.fillRect(x-1,y-2,3,5);c.fillStyle=((b.t*16)|0)%2?'#ffffff':'#ff7777';c.fillRect(x-1,y,3,1);c.fillRect(x,y-1,1,3)};
  A.bullets.torp=(c,b)=>{const x=b.x|0,y=b.y|0;c.fillStyle=K;c.fillRect(x-5,y-2,11,4);c.fillStyle='#959595';c.fillRect(x-4,y-1,8,2);c.fillStyle='#bbbbbb';c.fillRect(x-3,y-1,6,1);c.fillStyle='#ff7777';c.fillRect(x-4,y-1,2,2);
    if(b.lit){c.fillStyle=((b.t*20)|0)%2?'#ffffff':'#9ad2e0';c.fillRect(x+5,y-1,2,2);c.fillStyle='#70a4b2';for(let q=1;q<4;q++)c.fillRect(x+6+q*3,y+((q+((b.t*10)|0))%2?-1:0),1,1)}};
  A.bullets.drop=(c,b)=>{const x=b.x|0,y=b.y|0;c.fillStyle=K;c.fillRect(x-2,y-2,5,5);c.fillRect(x-1,y-3,3,1);c.fillStyle='#9ad2e0';c.fillRect(x-1,y-2,3,4);c.fillStyle='#ffffff';c.fillRect(x-1,y-1,2,2);c.fillStyle='#ff7777';c.fillRect(x,y+1,1,1)};
  A.bullets.wave=(c,b)=>{const x=b.x|0,y=b.y|0,f=((b.t*12)|0)%2;c.fillStyle=K;c.fillRect(x-5,y-3,11,6);c.fillRect(x-3,y-4,7,1);c.fillStyle='#70a4b2';c.fillRect(x-4,y-1,9,3);c.fillStyle='#ffffff';c.fillRect(x-4,y-2,7,1);c.fillRect(x-4,y-3,3,1);c.fillStyle='#ff7777';c.fillRect(x-4,y+1,9,1);c.fillStyle=f?'#ffffff':'#9ad2e0';c.fillRect(x-5+f,y-5,1,1);c.fillRect(x+1-f,y-6,1,1)};

  /* =====================================================================
     THE KRAKEN
     ===================================================================== */
  const KR=[K,'#1c1840','#352879','#6f3d86','#9a3a3a','#9a6759','#ff9966'];
  const KRE=['#1c1840','#68372b','#9a3a3a','#ff7777','#ff9966','#ffffaa'];
  const nk=mkNoise(77);
  const CUTS=[[[70,18,82,34],[40,52,52,46],[88,58,96,72]],[[58,10,66,30],[20,62,30,76],[76,78,90,84]]];
  function krakenBody(dmg,ramp){
    const socket=(x,y)=>((x-30)/8.5)**2+((y-71)/6.5)**2<1||((x-82)/6)**2+((y-70)/5)**2<1;
    const mask=(i,j)=>{const x=i+.5,y=j+.5;
      if(dmg>=2&&((x-87)/7)**2+((y-14)/9)**2<1)return false;
      const mant=((x-64-(40-y)*.2)/31)**2+((y-38)/36)**2<=1,face=((x-56)/48)**2+((y-82)/25)**2<=1&&y<=104;
      const bl=((x-30)/12.5)**2+((y-70)/10.5)**2<=1,br=((x-82)/9.5)**2+((y-70)/8.5)**2<=1;
      const siph=segD(x,y,46,82,37,90)<3.6;
      return mant||face||bl||br||siph};
    const cuts=dmg>=1?CUTS[0].concat(dmg>=2?CUTS[1]:[]):[];
    return relief(112,104,mask,ramp,{cap:10,k:1.25,paint:(i,j,v)=>{const x=i+.5,y=j+.5;
      if(socket(x,y))return '#1c1840';
      for(const s of cuts){const d=segD(x,y,s[0],s[1],s[2],s[3]);if(d<.7)return K;if(d<1.6)return '#ff7777'}
      if(dmg>=2)for(const s of cuts){if(Math.abs(x-s[2])<.6&&y>s[3]&&y<s[3]+6+((s[2]*7)%9))return '#1c1840'}
      if(segD(x,y,46,82,37,90)<3.6){if(segD(x,y,38.5,89,37,90)<1.6)return K;return null}
      if(y>90&&hash(i>>1,j>>1,6)<.16)return hash(i,j,7)<.5?'#bbbbbb':'#6c6c6c';
      if(nk.fbm(i*.08,j*.08,3)>.6)return rp(ramp,v-.22,i,j);
      if(y<62&&Math.abs(Math.sin(x*.3+y*.05))<.1)return rp(ramp,v-.18,i,j);
      if(hash(i,j,5)<.012&&v>.5)return ramp[ramp.length-1];
      return null}});
  }
  const KBODY=[krakenBody(0,KR),krakenBody(1,KR),krakenBody(2,KR),krakenBody(2,KRE)],KBODYW=whiteOf(KBODY[0]);
  function eyeSpr(rx,ry,mode){return paint(2*rx+1,2*ry+1,(i,j)=>{const nx=(i-rx)/rx,ny=(j-ry)/ry,d=nx*nx+ny*ny;if(d>1.05)return null;
    if(mode===1){if(ny<.15)return ny>-.1?K:'#6f3d86'}
    if(mode===2){if(Math.abs(nx)<.16&&Math.abs(ny)<.8)return '#9a3a3a';return d<.3?'#ffffff':d<.62?'#ffffaa':'#ff7777'}
    if(Math.abs(ny)<.24&&Math.abs(nx)<.66)return K;if(nx<-.25&&ny<-.35&&d<.62)return '#ffffff';return ny>.4?'#b8c76f':'#ffffaa'})}
  const EYEB=[0,1,2].map(m=>eyeSpr(8,6,m)),EYES=[0,1,2].map(m=>eyeSpr(5,4,m));
  /* tentacles: a smooth tube of overlapping shaded discs over a black outline pass, suckers on the underside */
  const tdisc=(r,ramp)=>{const Sz=Math.ceil(r*2)+1,c=(Sz-1)/2;return relief(Sz,Sz,(i,j)=>Math.hypot(i-c,j-c)<=r+.2,ramp,{cap:Math.max(1.5,r*.8),out:false,rim:.2,paint:(i,j,v)=>hash(i,j,r*5)<.08?rp(ramp,v-.3,i,j):null})};
  const kdisc=r=>{const Sz=Math.ceil(r*2)+3,c=(Sz-1)/2;return bake(Sz,Sz,(i,j)=>Math.hypot(i-c,j-c)<=r+1.2?K:null)};
  const TUBE=[],TUBEE=[],TUBEK=[],TUBEW=[];for(let r=2;r<=10;r++){TUBE.push(tdisc(r,KR.slice(1,6)));TUBEE.push(tdisc(r,KRE));TUBEK.push(kdisc(r));TUBEW.push(bake(Math.ceil(r*2)+3,Math.ceil(r*2)+3,(i,j)=>Math.hypot(i-r-1,j-r-1)<=r+1.2?'#ffffff':null))}
  function drawChain(c,P_,n,fl,hot){
    for(let pass=0;pass<2;pass++){const set=pass?(fl?null:(hot?TUBEE:TUBE)):(fl?TUBEW:TUBEK);if(!set)break;
      for(let k=n-1;k>0;k--){const p=P_[k],q=P_[k-1],d=Math.hypot(q.x-p.x,q.y-p.y),st=Math.max(1,Math.ceil(d/2.2));
        for(let s=0;s<st;s++){const u=s/st,x=p.x+(q.x-p.x)*u,y=p.y+(q.y-p.y)*u,r=p.r+(q.r-p.r)*u,im=set[clamp(Math.round(r)-2,0,8)];c.drawImage(im,(x-im.width/2)|0,(y-im.height/2)|0)}}
      const p0=P_[0],im0=set[clamp(Math.round(p0.r)-2,0,8)];c.drawImage(im0,(p0.x-im0.width/2)|0,(p0.y-im0.height/2)|0)}
    if(fl)return;for(let k=1;k<n-1;k++){const p=P_[k],q=P_[k+1];let nx=-(q.y-p.y),ny=q.x-p.x;const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(ny<0){nx=-nx;ny=-ny}
      const sx=(p.x+nx*p.r*.6)|0,sy=(p.y+ny*p.r*.6)|0;c.fillStyle=K;c.fillRect(sx-1,sy,4,2);c.fillStyle=k&1?'#ff9966':'#ffffaa';c.fillRect(sx,sy,2,1)}}
  /* idle arms around the head: chains that rise from the water and curl outward */
  function idleArms(b){const L=b.armL||1;for(let i=0;i<4;i++){const Aa=b.arms[i],ox=[-54,-30,32,56][i],side=i<2?-1:1;let x=b.x+ox,y=WL+6,a=-Math.PI/2+side*(.42+.12*Math.sin(b.bt*.9+i));
    for(let k=0;k<11;k++){const s=k/10;Aa[k].x=x;Aa[k].y=y;Aa[k].r=9.6-s*6.6;a-=side*(.02+s*.3)*(1+.6*Math.sin(b.bt*1.2+i*1.9));x+=Math.cos(a)*6.2*L;y+=Math.sin(a)*6.2*L}}}
  /* attack arms: separate hazard entities so the autopilot can see them */
  function armPath(e){const P_=e.P,n=P_.length;
    if(e.mode==='lash'){const st=e.st,t=e.sT;let r=1,tip=e.bx-18;
      if(st==='tele')r=clamp(t/.8,0,1);else if(st==='lash')tip=e.bx-18-(e.bx-32)*clamp(t/.3,0,1);else if(st==='hold')tip=14;else if(st==='back'){tip=14+(e.bx-32)*clamp(t/.5,0,1);r=1-clamp((t-.3)/.3,0,1)}
      if(st==='lash'||st==='hold'||(st==='back'&&t<.5))e.tip=tip;else e.tip=e.bx;
      const ky=WL+8+(e.ly-WL-8)*r,qv=st==='tele'?Math.sin(t*30)*2*r:0,kx=e.bx-12;
      for(let k=0;k<n;k++){const s=k/(n-1),p=P_[k];
        if(s<.3){const u=s/.3;p.x=e.bx+(kx-e.bx)*u;p.y=WL+10+(ky-WL-10)*Math.sin(u*Math.PI/2)}
        else{const u=(s-.3)/.7;p.x=kx+(tip-kx)*u;p.y=ky+Math.sin(u*9+e.sT*10)*2*u+qv*u}
        p.r=9.5-s*7}}
    else{const st=e.st,t=e.sT,sx=e.sx;let tx=sx-10,ty=44,r=1;
      if(st==='tele'){r=clamp(t/.6,0,1);tx+=Math.sin(t*34)*2.5;ty=WL-(WL-44)*r}
      else if(st==='slam'){const u=clamp(t/.2,0,1);tx=sx-10-36*u;ty=44+(WL-4-44)*u*u}
      else if(st==='hold'){tx=sx-46;ty=WL-4}
      else{const u=clamp(t/.5,0,1);tx=sx-46;ty=WL-4+u*30}
      const bx0=sx+6,by0=WL+12,mx=(bx0+tx)/2+12,my=Math.min(by0,ty)+(by0-ty)*.35;
      for(let k=0;k<n;k++){const u=k/(n-1),m=1-u,p=P_[k];p.x=m*m*bx0+2*m*u*mx+u*u*tx;p.y=m*m*by0+2*m*u*my+u*u*ty;p.r=10-u*7.5}}}
  function armStep(e,dt,live){const t=e.sT;
    if(e.mode==='lash'){
      if(e.st==='tele'&&t>=1.1){e.st='lash';e.sT=0;if(live)sfxBoom(5,false)}
      else if(e.st==='lash'&&t>=.3){e.st='hold';e.sT=0;shake=Math.max(shake,.15)}
      else if(e.st==='hold'&&t>=.5){e.st='back';e.sT=0}
      else if(e.st==='back'&&t>=.7)e.dead=1;
      e.touch=(m,px_,py_)=>(m.st==='lash'||m.st==='hold'||(m.st==='back'&&m.sT<.4))&&px_>=m.tip-4&&px_<=m.bx&&Math.abs(py_-m.ly)<8+shk(6)}
    else{
      if(e.st==='tele'&&t>=1.05){e.st='slam';e.sT=0}
      else if(e.st==='slam'&&t>=.2){e.st='hold';e.sT=0;if(live&&G.state==='play'){shake=Math.max(shake,.4);sfxBoom(10,false);splash(e.sx-46,WL-4,14,true);
        const L=LV();if(room(6))for(let q=0;q<4;q++)ebShot(e.sx-58-q*11,WL+3,-92-L*4,0,{sty:'wave',hh:2,life:4});
        if(L>=2&&room(4))for(let q=0;q<3;q++)ebShot(e.sx-62-q*13,WL-7,-80,0,{sty:'wave',hh:2,life:4})}}
      else if(e.st==='hold'&&t>=.4){e.st='back';e.sT=0}
      else if(e.st==='back'&&t>=.5)e.dead=1;
      e.touch=(m,px_,py_)=>{if(m.st==='back')return false;for(let k=4;k<m.P.length;k+=2){const p=m.P[k];if(Math.hypot(px_-p.x,py_-p.y)<p.r+shk(9))return true}return false}}}
  function drawArm(c,e,fl){if(!e.P)return;const st=e.st;
    if(e.mode==='lash'&&st==='tele'&&!fl){const bl=((e.sT*12)|0)%2;c.fillStyle=bl?'#ff7777':'#9a3a3a';for(let x=e.bx-20;x>14;x-=9)c.fillRect(x,e.ly,3,1)}
    drawChain(c,e.P,e.P.length,fl,e.boss&&e.boss.hp<e.boss.mhp*.15);
    const tp=e.P[e.P.length-1];if(!fl){c.fillStyle='#ff9966';c.fillRect((tp.x-1)|0,(tp.y-1)|0,2,2)}
    seaCover((e.mode==='lash'?e.bx:e.sx)-16,(e.mode==='lash'?e.bx:e.sx)+20)}

  const BOSSHP=[20,20,17];
  const PATS=[null,['fan','lash','ring','fan','lash'],['slam','spiral','lash','fan','summon','ring'],['curtain','bolt','spiral','slam','lash','bolt','fan'],['lattice','bolt','spiral','curtain','slam','bolt']];
  const siph=b=>[b.x-17,b.y+33];
  function startAtk(b,k){const L=LV(),ph=b.ph;b.atk={k,t:0,n:0,tele:k==='curtain'?1.05:k==='lattice'?.85:k==='fan'?.7:k==='ring'?.6:k==='spiral'?.55:0,done:false};
    const a=b.atk;
    if(k==='lash'){const n=ph===1&&L===1?1+((b.lc=(b.lc||0)+1)%2):2,lanes=[128,148,168].sort(()=>Math.random()-.5).slice(0,n);
      lanes.forEach((ly,i)=>spawn({type:'rock',kind:'arm',mode:'lash',ly,bx:b.x-58+i*12,boss:b}));a.done=true}
    else if(k==='slam'){spawn({type:'rock',kind:'arm',mode:'slam',sx:rnd(190,212),boss:b});if(L>=3&&ph>=3)a.dbl=1;a.done=!a.dbl}
    else if(k==='bolt'){const n=(ph>=4&&L>=2)?2:1,x0=clamp(P.x+rnd(-12,12),48,142);spawn({type:'rock',kind:'bolt',x:x0,y:100});
      if(n>1)spawn({type:'rock',kind:'bolt',x:x0<95?x0+78:x0-78,y:100,tele:1.5});a.done=true}
    else if(k==='summon'){let nb=0;for(const e of E)if(e.type==='cross')nb++;for(let i=0;i<2&&nb<3;i++,nb++){const s=spawn({type:'cross',y:170});s.x=W+12+i*40;s.wx=s.x+S.na}
      for(let i=0;i<5;i++){const s=spawn({type:'ring',y:70+L*6,ph:.3});s.x=W+12+i*14}a.done=true}
    else if(k==='curtain'){a.gy=clamp(P.y+rnd(-30,30),48,160);a.gy2=clamp(a.gy+(a.gy>104?-1:1)*rnd(44,62),48,160);a.cx=b.x-72}
    else if(k==='lattice'){a.cx=b.x-62}}
  function runAtk(b,dt,live){const a=b.atk,L=LV(),ph=b.ph;a.t+=dt;if(a.done||!live)return;
    const [sx,sy]=siph(b);
    if(a.t<a.tele)return;
    const t=a.t-a.tele;
    switch(a.k){
      case 'fan':{const nv=L>=3?3:2;if(t>=a.n*.45&&a.n<nv){const n=5+(a.n%2),sp=.95,an=aim(sx,sy)+(a.n%2?0:0);if(room(n)){ebFan(sx,sy,n,sp,60+L*4,an,{sty:'ink'});sfxEnemyLaser()}a.n++}if(a.n>=nv)a.done=true;break}
      case 'ring':{const nv=L>=2?2:1;if(t>=a.n*.55&&a.n<nv){const n=14+2*(L-1),a0=aim(sx,sy)+(a.n?Math.PI/n:0);if(room(n)){ebRing(sx,sy,n,50,a0,{sty:'ink'});sfxEnemyLaser()}a.n++}if(a.n>=nv)a.done=true;break}
      case 'spiral':{const dur=L>=3?2.2:1.8,arms=L>=3||ph>=4?4:3;b.sa=(b.sa||0)+dt*2.1*(b.sdir||1);if(t>=a.n*.12){a.n++;if(room(arms)){ebSpiral(sx,sy,arms,54,b.sa,{sty:'ink'});if(a.n%3===0)sfxEnemyLaser()}}if(t>=dur){a.done=true;b.sdir=-(b.sdir||1)}break}
      case 'curtain':{if(a.n===0){a.n=1;if(room(12)){ebCurtain(a.cx,26,178,14,-56,a.gy,50,{sty:'ink'});sfxEnemyLaser()}}
        if((L>=2||ph>=4)&&a.n===1&&t>=1.25){a.n=2;if(room(12)){ebCurtain(a.cx,26,178,14,-56,a.gy2,50,{sty:'ink'});sfxEnemyLaser()}}
        if(t>=1.4)a.done=true;break}
      case 'lattice':{const nv=L>=3?4:3;if(t>=a.n*1.0&&a.n<nv){a.n++;if(room(8)){for(let i=0;i<4;i++){const y=30+i*44+(a.n%2)*22;ebShot(a.cx,y,-56,20,{sty:'ink'});ebShot(a.cx,y,-56,-20,{sty:'ink'})}sfxEnemyLaser()}}if(a.n>=nv)a.done=true;break}
      case 'slam':{if(a.dbl&&t>=1.7){spawn({type:'rock',kind:'arm',mode:'slam',sx:rnd(196,214),boss:b});a.done=true}break}
    }}
  A.boss={w:150,h:110,hp:1,
    init(b){{const k=BOSSHP[LV()-1];b.hp*=k;b.mhp*=k}b.bt=0;b.x=250;b.y=250;b.in=true;b.ph=1;b.cd=2.4;b.atk=null;b.pi=0;b.sa=0;b.armL=1;b.aimT=1;b.arms=[];for(let i=0;i<4;i++){const q=[];for(let k=0;k<11;k++)q.push({x:0,y:0,r:5});b.arms.push(q)}idleArms(b);
      b.hitTest=(m,x,y)=>{if(y>WL)return 0;const dx=(x-m.x)/44,dy=(y-(m.y-2))/50;return dx*dx+dy*dy<1?1:0};
      b.touch=(m,px_,py_)=>{const dx=(px_-m.x)/(44+shk(12)),dy=(py_-(m.y-2))/(50+shk(6));return py_<WL&&dx*dx+dy*dy<1}},
    update(b,dt,live){
      b.bt+=dt;const f=b.hp/b.mhp,ph=f>.66?1:f>.33?2:f>.15?3:4,L=LV();
      if(b.in){const k=Math.min(1,b.bt/3.2),ez=1-Math.pow(1-k,3);b.y=250-132*ez;
        if(b.y<WL+20&&!b.spl){b.spl=1;shake=Math.max(shake,.5);splash(b.x-30,WL-2,14,true);splash(b.x+30,WL-2,14,true)}
        if(b.bt>=3.4)b.in=false}
      else{const ty=[0,118,114,108,104][ph];b.y+=(ty+Math.sin(b.bt*.8)*4-b.y)*Math.min(1,dt*2);b.x=250+Math.sin(b.bt*.35)*12+(ph===4?(((b.bt*30)|0)%2?1:-1):0)}
      b.armL+=(([0,1,1.1,1.2,1.25][ph])-b.armL)*Math.min(1,dt);
      S.churn+=((ph>=3?1:ph===2?.4:.1)-S.churn)*Math.min(1,dt*.8);
      idleArms(b);
      bossWear(b,live,0,-10,40,40);
      if(b.atk)runAtk(b,dt,live);
      if(!live||b.in)return;
      if(ph!==b.ph){b.ph=ph;shake=Math.max(shake,.5);FX.push({ring:1,x:b.x,y:b.y,r:3,life:.5,max:50,col:ph>=3?'#ff7777':'#9ad2e0'});
        splash(b.x-40,WL-2,12,true);splash(b.x+40,WL-2,12,true);b.pi=0;b.cd=Math.min(b.cd,1.2);if(ph===2||ph===3)startAtk(b,'summon'),b.atk=null}
      if(ph>=4){b.aimT-=dt;if(b.aimT<=0){b.aimT=1.1/(1+.2*(L-1));const [sx,sy]=siph(b);if(room(1))ebAim(sx,sy,66,0,{sty:'ink'})}}
      if(b.atk&&!b.atk.done)return;
      b.cd-=dt;if(b.cd>0)return;
      let list=PATS[ph];if(ph===1){if(L>=2)list=list.concat(['spiral']);if(L>=3)list=list.concat(['curtain'])}
      const k=list[b.pi%list.length];b.pi++;startAtk(b,k);
      b.cd=[0,1.5,1.2,1.0,.75][ph]*[1,.85,.72][L-1]+(k==='lash'||k==='slam'?1.1:0);
    },
    draw(c,b,fl){if(!b.arms)return;
      const f=b.hp/b.mhp,ph=f>.66?1:f>.33?2:f>.15?3:4,enr=ph===4&&((b.bt*6)|0)%2,dv=enr?3:ph>=3?2:ph===2?1:0,t=b.bt||0;
      if(ph>=3)c.drawImage(WHB[Math.floor(t*10)%6],(b.x-67)|0,WL-12);
      drawChain(c,b.arms[0],11,fl,enr);drawChain(c,b.arms[3],11,fl,enr);
      const bx=(b.x-57)|0,by=(b.y-53)|0;c.drawImage(fl?KBODYW:KBODY[dv],bx,by);
      if(!fl){const blink=(t%4.3)<.14,em=ph>=3?2:blink?1:0,eb=EYEB[em],es=EYES[em];c.drawImage(eb,bx+31-8,by+72-6);c.drawImage(es,bx+83-5,by+71-4);
        if(ph>=3&&((t*8)|0)%2){c.fillStyle=pat('#ff7777');c.fillRect(bx+20,by+63,22,17);c.fillRect(bx+75,by+64,16,13)}
        const a=b.atk;if(a&&a.tele&&a.t<a.tele){const [sx,sy]=siph(b),p=a.t/a.tele,r=1+Math.floor(p*3),on=((a.t*(10+p*20))|0)%2;c.fillStyle='#ff7777';c.fillRect((sx-r-1)|0,(sy-r)|0,2*r+3,2*r+1);c.fillStyle=on?'#ffffff':'#ffffaa';c.fillRect((sx-r)|0,(sy-r+1)|0,2*r+1,2*r-1);
          if(a.k==='curtain'&&on){c.fillStyle='#ff7777';for(let i=0;i<14;i++){const y=26+152*i/13;if(Math.abs(y-a.gy)<25)continue;c.fillRect(a.cx-1,y|0,3,1)}}
          if(a.k==='lattice'&&on){c.fillStyle='#ff7777';for(let i=0;i<4;i++)c.fillRect(a.cx-1,30+i*44,3,3)}}}
      drawChain(c,b.arms[1],11,fl,enr);drawChain(c,b.arms[2],11,fl,enr);
      seaCover(b.x-92,b.x+92);
      if(!fl){c.fillStyle='#ffffff';for(let q=0;q<14;q++){const x=b.x-70+q*10+Math.sin(t*3+q)*3,y=surfN(x)-1;c.fillRect(x|0,y|0,q%3?3:5,1)}
        c.fillStyle='#9ad2e0';for(let q=0;q<10;q++){const ag=(t*1.3+q*.1)%1,x=b.x-60+q*13,y=surfN(x)-2-ag*9;c.fillRect(x|0,y|0,1,1)}}
    },
    onKill(b){for(const Aa of b.arms)for(let k=0;k<11;k+=3)boom(Aa[k].x,Aa[k].y,8,k===0);
      for(let q=0;q<30;q++){const l=rnd(.6,1.3);FX.push({x:b.x+rnd(-70,70),y:WL-2,vx:rnd(-40,40),vy:rnd(-120,-40),life:l,l0:l,c:q%3?'#9ad2e0':'#ffffff',s:2})}S.churn=0}
  };

  /* =====================================================================
     THE SHARK MECH (mini boss)
     ===================================================================== */
  /* great white silhouette: deep chest, pointed snout, tall dorsal, crescent tail; chrome and navy plates */
  function sharkRaw(ja,tf,dmg){
    const CY=21,Hx=19,Hy=24,ca=Math.cos(ja),sa=Math.sin(ja);
    const top=x=>x<1?99:x<16?CY-11.5*Math.pow((x-1)/15,.55):x<36?CY-11.5+(x-16)*.04:x<58?CY-10.7+(x-36)*.39:99;
    const bot=x=>x<2?-99:x<18?CY+9.5*Math.pow((x-2)/16,.7):x<34?CY+9.5:x<58?CY+9.5-(x-34)*.33:-99;
    const body=(x,y)=>y>=top(x)&&y<=bot(x);
    const jaw0=(x,y)=>x<Hx&&y>=Hy&&body(x,y);
    const jq=(x,y)=>{const dx=x-Hx,dy=y-Hy;return [dx*ca-dy*sa+Hx,dx*sa+dy*ca+Hy]};
    const jaw=(x,y)=>{const q=jq(x,y);return jaw0(q[0],q[1])};
    const mouth=(x,y)=>ja>.05&&x<Hx-1&&y>Hy&&jq(x,y)[1]<Hy&&Math.hypot(x-Hx,y-Hy)<17&&x>2;
    const dors=(x,y)=>inTri(x,y,22,11,38,11,35,0)&&!(x>33&&y<10&&(x-33)>(10-y)*.55),dors2=(x,y)=>inTri(x,y,47,14,53,15,54,9),pect=(x,y)=>inTri(x,y,21,28,31,28,36,38);
    const tail=(x,y)=>inTri(x,y,54,15,61,18,71,1+tf)||inTri(x,y,54,15,66,13,71,1+tf)||inTri(x,y,55,23,61,20,67,35-tf)||(x>=55&&x<=61&&y>=15&&y<=23);
    const upper=(x,y)=>body(x,y)&&!jaw0(x,y);
    const holes=dmg?[[29,14,2.4],[44,22,2],[13,17,1.5]]:[];
    return paint(72,40,(i,j)=>{const x=i+.5,y=j+.5;
      if(holes.some(h=>Math.hypot(x-h[0],y-h[1])<h[2])&&upper(x,y))return hash(i,j,9)<.3?'#ff9966':K;
      if(dors(x,y)||dors2(x,y)||pect(x,y)||tail(x,y)){if(upper(x,y))return null;
        const ed=dors(x,y)?segD(x,y,22,11,35,0):pect(x,y)?segD(x,y,21,28,36,38):segD(x,y,54,15,71,1+tf);
        if(ed<.9)return '#ffffff';if(ed<1.9)return '#bbbbbb';return (Math.floor(x+y)%6===0)?'#1c1840':(y<CY?'#6c6c6c':'#444444')}
      if(mouth(x,y)&&!jaw(x,y)){if(y<Hy+2&&Math.floor(x)%2===0&&x>4)return '#ffffff';return x>13?'#9a3a3a':(x>8?'#68372b':'#1c1840')}
      if(jaw(x,y)&&ja>.05){const q=jq(x,y);if(q[1]<Hy+1.5&&Math.floor(q[0])%2===1&&q[0]>4)return '#ffffff';return q[1]>Hy+3?'#bbbbbb':'#ffffff'}
      if(!upper(x,y)&&!jaw(x,y))return null;
      const tt=top(x),bb=bot(x),dy=(y-tt)/(bb-tt);
      /* face: red eye, smile line with teeth, gills */
      if(x>=8&&x<11&&y>=15&&y<17.5)return (x<9&&y<16)?'#ffffff':'#ff7777';
      if(x>=7&&x<12&&y>=14&&y<18.5)return K;
      if(ja<=.05&&Math.abs(y-(Hy-.3+(x-12)*.06))<.55&&x>3.5&&x<Hx)return K;
      if(ja<=.05&&y>Hy+.2&&y<Hy+1.4&&x>5&&x<17&&Math.floor(x)%2===0)return '#ffffff';
      if([22,24,26].includes(Math.floor(x))&&dy>.25&&dy<.7)return K;
      if([23,25].includes(Math.floor(x))&&dy>.35&&dy<.6)return '#ff7777';
      if(x>=33&&x<=43&&y>=bb-4.5&&y<bb-2.5)return Math.floor(x)===38?K:'#444444';
      if(dmg&&x>27&&x<35&&y>tt+1&&y<tt+5)return (Math.floor(x)%3===0)?'#444444':'#1c1840';
      if(dmg&&hash(i,j,12)<.05)return '#68372b';
      if(x<3.5)return '#bbbbbb';
      if(dy<.07)return '#ffffff';
      if(dy<.42){if(Math.floor(x)%10===0)return K;if(Math.floor(x)%10===5&&j%3===0)return '#6c5eb5';return dy<.18?'#6c5eb5':dy<.3?'#352879':'#1c1840'}
      if(dy<.5)return (Math.floor(x)+j)%4<2?'#ffffff':'#bbbbbb';
      if(x>48&&hash(i,j,13)<.2)return '#68372b';
      if(dy<.6)return '#959595';
      return dy<.9?'#ffffff':'#bbbbbb'},false);
  }
  const PIT=[-.5,-.25,0,.25,.5];
  /* elite health: the standard hp dies in seconds to a ship of this stage's entry power, so scale it per level */
  const MINIHP=[8,6,4.5];
  const SH=[0,1].map(dm=>PIT.map(p=>[0,.3,.6].map(ja=>[0,2].map(tf=>fin(rotC(sharkRaw(ja,tf,dm),p))))));
  const SHW=PIT.map((p,i)=>whiteOf(SH[0][i][0][0]));
  const FINS=paint(14,11,(i,j)=>{const x=i+.5,y=j+.5;if(!inTri(x,y,1,11,13,11,10,0))return null;if(segD(x,y,1,11,10,0)<.9)return '#bbbbbb';if(x>9&&y<5)return '#ff7777';return (x+y)%6<1?'#352879':'#6c6c6c'});
  const FINW=whiteOf(FINS);
  function mGo(e,st){e.st=st;e.sT=0}
  A.mini={w:56,h:20,hp:1,
    init(e){{const k=MINIHP[LV()-1];e.hp*=k;e.mhp*=k}e.st='enter';e.sT=0;e.x=W+30;e.y=WL;e.vx=-70;e.vy=0;e.jaw=0;e.pitch=0;e.leaps=0;e.cyc=0;e.immune=true;e.in=true;e.w=14;e.h=8;e.next='surf';e.sa=0;
      e.hitTest=(m,x,y)=>{if(m.st==='surf'||m.st==='leap'){const dx=(x-m.x)/31,dy=(y-m.y)/12;return dx*dx+dy*dy<1?1:0}return (Math.abs(x-m.x)<8&&Math.abs(y-(m.wy||WL)+5)<6)?1:0};
      e.touch=(m,px_,py_)=>(m.st==='surf'||m.st==='leap')&&Math.abs(px_-m.x)<24+shk(12)&&Math.abs(py_-m.y)<8+shk(6)},
    update(e,dt,live){
      const L=LV(),hard=e.hp<e.mhp*.5,ox=e.x,oy=e.y;e.sT+=dt;const wy=surfN(e.x);e.wy=wy;
      if(e.st==='enter'){e.x-=80*dt;e.y=wy-3;e.pitch=0;if(e.x<=252){e.in=false;mGo(e,'surf')}}
      else if(e.st==='fin'){const dx=e.tx-e.x;e.x+=clamp(dx,-95*dt,95*dt);e.y=wy-3;if(Math.abs(dx)<2&&e.sT>.8)mGo(e,e.next==='leap'?'tele':'surf')}
      else if(e.st==='tele'){e.y=wy-3;if(e.sT>=.85){const long=e.leaps%2===1;e.x0=e.x;e.y0=wy+8;e.long=long;e.x1=long?-70:rnd(116,146);e.apex=long?42:rnd(52,70);e.D=long?2.15:1.55;e.snap=0;mGo(e,'leap');splash(e.x,wy-2,10,true)}}
      else if(e.st==='leap'){const s=Math.min(1,e.sT/e.D),Hh=e.y0-e.apex;e.x=e.x0+(e.x1-e.x0)*s;e.y=e.y0-4*Hh*s*(1-s);
        const vx=(e.x1-e.x0)/e.D,vy=-4*Hh*(1-2*s)/e.D;e.pitch=clamp(Math.atan2(-vy,-vx),-.5,.5);e.jaw=s>.36&&s<.64?2:s>.3&&s<.7?1:0;
        if(s>=.5&&!e.snap){e.snap=1;if(live&&e.x>60&&e.x<W-10){const n=12+2*(L-1);if(room(n)){ebRing(e.x-8,e.y,n,52,aim(e.x,e.y),{sty:'rivet'});sfxEnemyLaser()}}}
        if(s>=1){e.leaps++;splash(e.x,surfN(clamp(e.x,0,W))-2,14,true);
          if(live&&e.x>30&&e.x<W&&room(5)){ebFan(e.x,surfN(e.x)-6,5,1.1,58,-2.3,{sty:'drop'});sfxEnemyLaser()}
          if(e.long)e.x=W+30;e.pitch=0;e.jaw=0;e.tx=rnd(236,272);
          e.next=(e.leaps%(L>=2||hard?2:1)===0)?'surf':'leap';mGo(e,'fin')}}
      else if(e.st==='surf'){const t=e.sT;e.pitch=0;
        if(t<.8){e.y=wy+16-23*(t/.8);e.jaw=0}else if(t<3.6)e.y=wy-7+Math.sin(t*3)*1.5;else e.y=wy-7+(t-3.6)*40;
        if(live&&t>=.8&&!e.v1){e.v1=1;const gy=clamp(P.y+rnd(-36,36),50,158);e.gy=gy;if(room(9)){ebCurtain(e.x-34,30,176,10,-72,gy,48,{sty:'torp',hh:1});sfxEnemyLaser()}}
        if(live&&(L>=2||hard)&&t>=1.9&&!e.v2){e.v2=1;const gy=clamp(e.gy+(e.gy>104?-1:1)*rnd(46,64),50,158);if(room(9)){ebCurtain(e.x-34,30,176,10,-72,gy,48,{sty:'torp',hh:1});sfxEnemyLaser()}}
        if(live&&(hard||L>=3)&&t>=2.3&&t<3.4){e.jaw=2;e.sa+=dt*2.4;e.sp=(e.sp||0)-dt;if(e.sp<=0){e.sp=.13;if(room(3))ebSpiral(e.x-26,e.y+2,3,50,e.sa,{sty:'rivet'})}}else if(t>=3.4)e.jaw=0;
        if(t>=4.1){e.v1=e.v2=0;e.tx=rnd(250,280);e.next='leap';mGo(e,'fin')}}
      const sub=e.st==='fin'||e.st==='tele'||e.st==='enter';e.immune=sub;e.w=sub?14:56;e.h=sub?8:20;
      if(dt>0){e.vx=(e.x-ox)/dt;e.vy=(e.y-oy)/dt}if(Math.abs(e.vx)>400)e.vx=-60;
      if(hard&&live&&!sub&&Math.random()<.2)FX.push({x:e.x+rnd(-20,20),y:e.y+rnd(-6,6),vx:rnd(-20,20),vy:rnd(-30,0),life:.3,l0:.3,c:Math.random()<.5?'#ffffaa':'#ff9966',s:1});
      bossWear(e,live,0,0,24,8)},
    draw(c,e,fl){const wy=surfN(e.x),t=e.t||0;
      if(e.st==='enter'||e.st==='fin'||e.st==='tele'){
        if(e.st==='tele'){const p=e.sT/.85;c.fillStyle=pat('#050d12');c.fillRect((e.x-22)|0,(wy-2)|0,44,5);c.fillStyle=((t*16)|0)%2?'#ffffff':'#9ad2e0';
          for(let q=0;q<7;q++){const bb=(t*2+q*.17)%1;c.fillRect((e.x-15+q*5)|0,(wy+1-bb*8*p)|0,1+(q&1),1)}c.fillStyle='#70a4b2';c.fillRect((e.x-14-p*8)|0,(wy-1)|0,28+p*16|0,1)}
        else{c.fillStyle='#ffffff';for(let k=0;k<5;k++){const d=4+k*5;c.fillRect((e.x+d)|0,(wy-1+(k>>1))|0,3,1)}c.fillStyle='#9ad2e0';for(let k=0;k<5;k++){const d=6+k*6;c.fillRect((e.x+d)|0,(wy+2+(k>>1))|0,4,1)}}
        const fi=fl?FINW:FINS;c.drawImage(fi,(e.x-fi.width/2)|0,(wy-fi.height+(e.st==='tele'?3+e.sT*6:2))|0);seaCover(e.x-9,e.x+9);return}
      const pi=clamp(Math.round(e.pitch/.25)+2,0,4),dm=e.hp<e.mhp*.5?1:0,im=fl?SHW[pi]:SH[dm][pi][e.jaw||0][Math.floor(t*8)%2];
      c.drawImage(im,(e.x-im.width/2)|0,(e.y-im.height/2)|0);
      if(e.st==='surf'&&e.sT>.1&&e.sT<.8&&!fl&&((t*14)|0)%2){c.fillStyle='#ff7777';c.fillRect((e.x-3)|0,(e.y+4)|0,8,2)}
      if(e.y>wy-24)seaCover(e.x-44,e.x+44)},
    onKill(e){for(let q=0;q<20;q++){const l=rnd(.5,1.1);FX.push({x:e.x+rnd(-26,26),y:e.y+rnd(-8,8),vx:rnd(-50,50),vy:rnd(-90,-20),life:l,l0:l,c:q%3?'#bbbbbb':'#9ad2e0',s:2})}}
  };
  return A;
},
script(sc,h){
  const L=h.level;
  /* the shared pods become serpents; keep them clear of the mini boss */
  for(let i=sc.length-1;i>=0;i--){const s=sc[i];if(s.type==='pod'&&s.t>41&&s.t<56)s.t=s.t<48?36:58}
  /* flying fish schools leaping in chains */
  for(const [t,y] of [[5,70],[20,110],[31,60],[61,90],[77,70]])h.add(t,'ring',7,.22,y,0,{ph:.2});
  if(L>=2)for(const [t,y] of [[13,90],[39,60],[68,120]])h.add(t,'ring',8,.2,y,0,{ph:.6});
  if(L>=3)for(const [t,y] of [[25,80],[72,50]])h.add(t,'ring',9,.18,y,0,{ph:.1});
  /* sailfish */
  h.add(26,'ringR',2,1.4,70,20,{ph:.3});h.add(66,'ringR',2,1.3,60,30,{ph:.1});
  if(L>=2)h.add(36,'ringR',2,1.2,80,0);if(L>=3)h.add(80,'ringR',3,1,60,20);
  /* gulls diving out of the clouds and gull drones with torpedoes */
  for(const t of [11,35,58,73])sc.push({t,type:'dart',y:60,dive:1,v:0},{t:t+.5,type:'dart',y:60,dive:1,v:0});
  for(const t of [24,52,82])sc.push({t,type:'dart',y:rnd(50,140),dive:0,v:1},{t:t+.6,type:'dart',y:rnd(50,140),dive:0,v:1});
  if(L>=2)for(const t of [17,44,65])sc.push({t,type:'dart',y:60,dive:1,v:1},{t:t+.4,type:'dart',y:60,dive:1,v:0},{t:t+.8,type:'dart',y:60,dive:1,v:1});
  if(L>=3)for(const t of [30,48,84])sc.push({t,type:'dart',y:rnd(40,150),dive:0,v:1},{t:t+.5,type:'dart',y:rnd(40,150),dive:0,v:1});
  /* navy gunboats riding the swell */
  for(const t of [8,18,33,59,70,79])sc.push({t,type:'cross',y:170});
  if(L>=2)for(const t of [25,40,64,75])sc.push({t,type:'cross',y:170});
  if(L>=3)for(const t of [14,29,53])sc.push({t,type:'cross',y:170});
  /* serpents */
  if(L>=2)sc.push({t:28,type:'pod',y:100});if(L>=3)sc.push({t:62,type:'pod',y:80});
  /* waterspouts sweeping across, breach spray bursting under the ship's lane */
  for(const t of [16,40,63,83])sc.push({t,type:'rock',kind:'spout',y:100});
  for(const t of [10,29,52,69])sc.push({t,type:'rock',kind:'spray',y:140});
  if(L>=2){for(const t of [27,74])sc.push({t,type:'rock',kind:'spout',y:100,up:1});for(const t of [37,58,79])sc.push({t,type:'rock',kind:'spray',y:140})}
  if(L>=3){for(const t of [47,86])sc.push({t,type:'rock',kind:'spout',y:100});for(const t of [21,45,66])sc.push({t,type:'rock',kind:'spray',y:140})}
  /* storm wreckage */
  h.add(55,'rock',4+L,.5,0,0,{rand:1,kind:'wreck'});
}
};
Object.assign(PLANETS[6],{d:'ELITE. STORM OVER THE SEA. FISH, GUNBOATS, SERPENTS.',every:7,waves:[['ring',5,.22],['dart',2,.5]]});
})();
