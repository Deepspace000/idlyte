/* Idlyte art pack 8: THE HOLLOW DEEP (elite).
   Deep caves under the ground, lit only by their own glow: near black rock with a wet shine, giant crystal
   clusters in cold blue, green and magenta, old mines with warm lanterns, rails and carts, dark rivers,
   glowing mineral pools, hot vents puffing steam, drifting spores.
   While the level scrolls the cave runs through four parts (25 s each): tunnels, crystal caverns,
   rivers and vents, old mines. Rock ceiling and floor in three depths, a far cave wall behind.
   Cast: cave bats (ring), fire wyrmlings (ringR), mole drills bursting out of the rock (dart),
   crystal golems that reflect shots (cross), fungal spore pods (pod), falling stalactites, boulders,
   cart wrecks and runaway mine carts (rock). Hive drones and spiderlings are ring variants.
   Mini boss: the giant cave spider. Boss: the Hive Queen in her glowing hive. */
PACKS[8]={
init(){
  /* =====================================================================
     HELPERS
     ===================================================================== */
  const TAU=Math.PI*2;
  let sd=7;
  const LR=()=>(sd=(sd*1103515245+12345)&0x7fffffff)/0x7fffffff;
  const lr=(a,b)=>a+LR()*(b-a);
  const hash=(i,j,k)=>{let h=(i*374761393+j*668265263+(k||0)*1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296};
  const bay=(i,j)=>(BAYER[j&3][i&3]+.5)/16;
  const mod=(a,n)=>((a%n)+n)%n;
  const cl=(v,a,b)=>v<a?a:v>b?b:v;
  const rp=(ramp,v,i,j)=>{v=v<0?0:v>.999?.999:v;const t=v*(ramp.length-1),k=Math.floor(t);return ramp[(t-k>bay(i,j))?Math.min(ramp.length-1,k+1):k]};
  const RGB={};const rgb=h=>RGB[h]||(RGB[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
  function bake(w,h,fn){const c=mk(w,h),x=c.getContext('2d'),id=x.createImageData(w,h),d=id.data;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const col=fn(i,j);if(!col)continue;const v=rgb(col),q=(j*w+i)*4;d[q]=v[0];d[q+1]=v[1];d[q+2]=v[2];d[q+3]=255}
    x.putImageData(id,0,0);return c}
  /* colour function to sprite, optionally with a 1 pixel outline */
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
  /* black outline around a composed canvas (init only) */
  function outl(c,col){const w=c.width,h=c.height,d=c.getContext('2d').getImageData(0,0,w,h).data,o=mk(w+2,h+2),g=o.getContext('2d');g.fillStyle=col||'#000000';
    const op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>40;
    for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){if(op(x,y))continue;if(op(x-1,y)||op(x+1,y)||op(x,y-1)||op(x,y+1))g.fillRect(x+1,y+1,1,1)}
    g.drawImage(c,1,1);return o}
  const px=(g,col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(Math.floor(x),Math.floor(y),w||1,h||1)};
  function tl(g,col,x0,y0,x1,y1,th){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*1.5));for(let i=0;i<=n;i++){const t=i/n;px(g,col,x0+(x1-x0)*t-th/2+.5,y0+(y1-y0)*t-th/2+.5,th,th)}}
  function qc(g,col,x0,y0,cx,cy,x1,y1,t0,t1){const n=60;for(let i=0;i<=n;i++){const s=i/n,m=1-s,x=m*m*x0+2*m*s*cx+s*s*x1,y=m*m*y0+2*m*s*cy+s*s*y1,th=Math.max(1,Math.round(t0+(t1-t0)*s));px(g,col,x-th/2+.5,y-th/2+.5,th,th)}}
  const inPoly=pts=>(x,y)=>{let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins}return ins};
  const segD=(x,y,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-ax-dx*t,y-ay-dy*t)};
  const flipV=c=>{const o=mk(c.width,c.height),x=o.getContext('2d');x.translate(0,c.height);x.scale(1,-1);x.drawImage(c,0,0);return o};
  const darken=(c,col,a)=>{const o=mk(c.width,c.height),g=o.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(0,0,o.width,o.height);return o};
  const put=(dst,src,x,y)=>dst.getContext('2d').drawImage(src,Math.round(x),Math.round(y));
  /* smooth value noise, periodic in x with period pw (in noise units) */
  function vn(x,y,seed,pw){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
    const a=hash(mod(ix,pw),iy,seed),b=hash(mod(ix+1,pw),iy,seed),c=hash(mod(ix,pw),iy+1,seed),d=hash(mod(ix+1,pw),iy+1,seed);
    return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}
  function fbm(x,y,seed,pw,o){let v=0,a=.5,f=1,t=0;for(let i=0;i<o;i++){v+=vn(x*f,y*f,seed+i*31,pw*f)*a;t+=a;a*=.5;f*=2}return v/t}
  /* a crystal prism painted straight onto a context. pal: 6 steps dark to white. a: direction, L length, w half width, sh brightness shift */
  function prism(g,pal,x0,y0,a,L,w,sh,glint){
    const ca=Math.cos(a),sa=Math.sin(a),tp=Math.min(L*.5,w*1.8),R=Math.ceil(L+w+1),side=(sa-ca)>0?1:-1;
    for(let j=Math.floor(y0-R);j<=Math.ceil(y0+R);j++)for(let i=Math.floor(x0-R);i<=Math.ceil(x0+R);i++){
      const dx=i+.5-x0,dy=j+.5-y0,u=dx*ca+dy*sa,v=-dx*sa+dy*ca;
      if(u<-.6||u>L)continue;const hw=u>L-tp?w*(L-u)/tp:w;if(Math.abs(v)>hw+.05)continue;
      const s=v*side/Math.max(.8,hw);let k;
      if(u>L-tp*.55&&Math.abs(v)<.9)k=5;else if(Math.abs(s)<.22)k=4;else if(s>0)k=3;else k=u<L*.4?1:2;
      if(u<L*.18&&k<4)k=Math.max(0,k-1);
      if(glint!=null&&Math.abs(u-glint*L)<1.3&&k>1)k=5;
      px(g,pal[cl(k+(sh||0),0,5)],i,j)}}
  /* a crystal cluster sprite: n prisms fanning out of a base. up: grows upwards, else hangs down */
  function cluster(pal,seed,n,size,up,sh){
    sd=seed;const P=[];
    for(let k=0;k<n;k++){const a=(up?-1:1)*Math.PI/2+(k?lr(-.85,.85):lr(-.15,.15));P.push({a,L:size*(k?lr(.4,.85):1),w:size*(k?lr(.12,.18):.2)+.6,ox:k?lr(-size*.35,size*.35):0})}
    P.sort((p,q)=>q.L-p.L);
    const Wd=Math.ceil(size*2.4)+4,Ht=Math.ceil(size*1.1)+4,bx=Wd/2,by=up?Ht-1.5:1.5,c=mk(Wd,Ht),g=c.getContext('2d');
    for(const p of P)prism(g,pal,bx+p.ox,by,p.a,p.L,p.w,sh||0);
    const o=outl(c);o.tips=P.map(p=>[bx+p.ox+Math.cos(p.a)*(p.L-1)+1,by+Math.sin(p.a)*(p.L-1)+1]);o.bx=bx+1;o.by=by+1;return o}
  /* dim dithered glow (never over bullets: only used in background layers) */
  function halo(rx,ry,cols,k){const W2=2*rx+1,H2=2*ry+1;return bake(W2,H2,(i,j)=>{const d=Math.hypot((i-rx)/rx,(j-ry)/ry);if(d>=1)return null;const v=1-d,b=bay(i,j);
    if(v*v*(k||.5)>b)return (cols[1]&&v>.5&&(v-.5)*(k||.5)*1.6>b)?cols[1]:cols[0];return null})}
  /* hanging spike (stalactite) or standing spike, relief shaded rock */
  function spike(w,h,ramp,seed,up,wet){
    sd=seed;const wob=lr(0,6),lean=lr(-.12,.12);
    const m=(i,j)=>{const t=j/h,hw=w/2*Math.pow(1-t,.75)+.2,cx=w/2+Math.sin(j*.45+wob)*.5+lean*j;return Math.abs(i+.5-cx)<=hw};
    const c=relief(w+4,h,(i,j)=>m(i-2,j),ramp,{cap:2,rim:0,out:false,paint:(i,j,v)=>{if(wet&&v>.55&&hash(i,j,seed)<.25)return '#70a4b2';if(j>=h-2&&wet)return '#9ad2e0';return null}});
    return up?flipV(c):c}

  /* =====================================================================
     PALETTES
     ===================================================================== */
  const CRB=['#1c1840','#352879','#6c5eb5','#70a4b2','#9ad2e0','#ffffff'];
  const CRG=['#0f2414','#2c5a2c','#588d43','#9ad284','#ccff99','#ffffff'];
  const CRM=['#2a1236','#6f3d86','#8a5aa6','#cc44cc','#ff77ff','#ffffff'];
  const CRP=[CRB,CRG,CRM];
  const HALO=[['#0d0b26','#1c1840'],['#08180c','#12301a'],['#1a0a24','#2e1440']];
  const WOOD=['#140c06','#2a1a0e','#4a2e18','#6f4f25','#9a6759'];
  const IRON=['#0e0e14','#2a2a30','#444444','#6c6c6c','#959595','#bbbbbb'];
  const MIDR=['#0a0814','#110e20','#18142c','#211c3c','#2c2650'];
  const NEARR=['#000000','#06050c','#0d0b18','#151226','#1e1a36'];
  const SPKM=['#0e0c1a','#18142c','#241f44','#352879','#4a3f8a'];
  const SPKN=['#000000','#0d0b18','#1a1630','#2a2450','#3e3570','#6c5eb5'];

  /* =====================================================================
     PACK STATE AND CLOCKS
     the scroll clock follows the level clock, eases to a halt in the hive chamber when the boss comes,
     and runs on again after it; the animation clock never stops
     ===================================================================== */
  const S={g:null};
  function sync(){if(S.g!==G){S.g=G;S.bs=0;S.ba=0;S.spd=1}}
  const scl=()=>G.t+(S.g===G?S.bs:0);
  const acl=()=>G.t+(S.g===G?S.ba:0);
  const spdNow=()=>S.g===G?(G.boss?S.spd:1):1;
  const FAR_V=8,MID_V=20,NEAR_V=40,FG_V=95;
  const nscroll=()=>scl()*NEAR_V;
  const L3=()=>Math.min(3,G.level||1);
  const bsp=b=>b+Math.min(14,(G.loop||0)*1.3);        /* bullet speed: gentle loop scaling, patterns stay readable */
  const room=n=>EB.length<n;

  /* =====================================================================
     BACK WALL (3 px/s) with very dim glows
     ===================================================================== */
  const BKW=640,BKH=BOT-TOP;
  const BACK=bake(BKW,BKH,(i,j)=>{const m=Math.abs(j-BKH/2)/(BKH/2);
    let v=fbm(i/10*.25,j/10*.32,3,16,3)*.95+m*m*.5-.42;
    v+=Math.sin(j*.32+fbm(i/10*.15,j*.02,9,BKW/10*.15,2)*8)*.05;
    return rp(['#000000','#030207','#07060e','#0c0a17','#120f24'],v,i,j)});
  {sd=17;for(let k=0;k<7;k++){const p=k%3,h=halo(Math.round(lr(26,44)),Math.round(lr(18,30)),[HALO[p][0],null],.3);put(BACK,h,lr(0,BKW-h.width),lr(-10,BKH-h.height+10))}}
  /* wet streaks running down the far wall */


  /* =====================================================================
     FAR LAYER (8 px/s): dim ceiling and floor, pillars, far crystals, waterfall, scaffolds
     ===================================================================== */
  const FW=400,FCH=44,FFH=44;
  const fcy=new Float32Array(FW),ffy=new Float32Array(FW);
  for(let x=0;x<FW;x++){fcy[x]=14+5*Math.sin(TAU*2*x/FW)+3*Math.sin(TAU*5*x/FW+1)+vn(x/10,.5,4,40)*4;ffy[x]=FFH-14-5*Math.sin(TAU*3*x/FW+2)-3*Math.sin(TAU*7*x/FW)-vn(x/10,1.5,6,40)*4}
  sd=31;for(let k=0;k<22;k++){const c=lr(0,FW),L=lr(6,22),w=lr(2,6),top=k%2===0;for(let d=-Math.ceil(w);d<=Math.ceil(w);d++){const x=mod(Math.round(c)+d,FW),t=1-Math.abs(d)/w;if(t<=0)continue;if(top)fcy[x]=Math.max(fcy[x],fcy[x]+L*Math.pow(t,1.6)*.8);else ffy[x]=Math.min(ffy[x],ffy[x]-L*Math.pow(t,1.6)*.8)}}
  const FARC=bake(FW,FCH,(i,j)=>{const e=fcy[i];if(j>e)return null;const d=e-j;if(d<1)return '#241f44';if(d<2)return '#18142c';return rp(['#07060e','#0c0a17','#110e20'],fbm(i/10,j/8,31,40,2)*.8+Math.max(0,1-d/10)*.5-.1,i,j)});
  const FARF=bake(FW,FFH,(i,j)=>{const s=ffy[i];if(j<s)return null;const d=j-s;if(d<1)return '#2a2450';if(d<2)return '#18142c';return rp(['#07060e','#0c0a17','#110e20'],fbm(i/10,j/8,33,40,2)*.8+Math.max(0,1-d/10)*.5-.1,i,j)});
  const FFY=BOT-FFH;
  function pillar(seed){sd=seed;const w0=lr(10,16),wm=lr(3,6),h=BKH,wob=lr(0,6);
    return bake(Math.ceil(w0*2)+4,h,(i,j)=>{const t=Math.abs(j-h/2)/(h/2),hw=wm+(w0-wm)*Math.pow(t,2.2),cx=w0+2+Math.sin(j*.05+wob)*2;const d=i+.5-cx;if(Math.abs(d)>hw)return null;
      if(d<-hw+1)return '#211c3c';if(d>hw-1.2)return '#07060e';return rp(['#0a0814','#110e20','#18142c'],.45+(fbm(i/4,j/6,seed,1e3,2)-.5)*.8-d/hw*.3,i,j)})}
  function farCrystal(p,seed,up){const cr=cluster(CRP[p].map((c,i,a)=>a[Math.max(0,i-1)]),seed,7,lr(18,30),up,-1);const h=halo(46,36,HALO[p],.42),c=mk(h.width,h.height);put(c,h,0,0);const cy=up?h.height/2+cr.height*.35-cr.height:h.height/2-cr.height*.35;put(c,cr,h.width/2-cr.bx,cy);c.anc=up?Math.round(cy+cr.height-2):Math.round(cy+2);return c}
  function waterfall(){return bake(12,BKH,(i,j)=>{const e=Math.abs(i-5.5);if(e>4.5+Math.sin(j*.2)*.6)return null;if(e>3.6)return '#0c0a17';return (hash(i,j>>1,8)<.4)?'#1c1840':(hash(i,j,9)<.12?'#352879':'#0d0b26')})}
  function scaffold(seed){sd=seed;const w=lr(40,56)|0,h=BKH;return bake(w,h,(i,j)=>{
    const post=i<4||i>=w-4,beam=(j>=10&&j<14)||(j>=h-30&&j<h-26),brace=Math.abs((i-4)-(j-14)*.7)<1.2&&j<44&&j>14||Math.abs((w-5-i)-(j-14)*.7)<1.2&&j<44&&j>14;
    if(!(post||beam||brace))return null;return (i===0||i===w-4||j===10)?'#160f09':((i+j)%5===0?'#0a0604':'#0f0a06')})}
  const FARD=[];{
    const P1=pillar(41),P2=pillar(43),P3=pillar(47),WF=waterfall(),SC1=scaffold(51),SC2=scaffold(53);
    const add=(wx,img,y)=>FARD.push({wx,img,y});
    add(30,P1,TOP);add(150,P2,TOP);
    const fc=(p,s,up,x)=>{const c=farCrystal(p,s,up),xi=Math.round(mod(x,FW));add(x,c,up?Math.round(FFY+ffy[xi]+3-c.anc):Math.round(TOP+fcy[xi]-3-c.anc))};
    fc(0,61,true,215);fc(2,63,false,268);fc(1,65,true,330);fc(0,67,false,372);
    add(430,WF,TOP);add(520,P3,TOP);fc(1,69,true,470);
    add(615,SC1,TOP);add(700,SC2,TOP);add(760,P1,TOP);
  }

  /* =====================================================================
     SPRITES FOR THE TERRAIN
     ===================================================================== */
  function lantern(){return outl(bake(7,10,(i,j)=>{
    if(j===0)return (i===3)?'#6c6c6c':null;
    if(j===1)return (i>=1&&i<=5)?'#444444':null;
    if(j===9)return (i>=1&&i<=5)?'#444444':null;
    if(i===0||i===6)return null;
    if(i===1||i===5)return j===2||j===8?'#444444':'#2a2a30';
    if(i===3&&j>=4&&j<=6)return '#ffffff';
    return j<4?'#ffffaa':j<7?'#ff9966':'#9a6759'}))}
  function cart(ore,f){const c=mk(22,16),g=c.getContext('2d');
    const bod=relief(20,10,(i,j)=>j>=0&&Math.abs(i+.5-10)<=9.5-j*.25,['#1c1008','#2a2a30','#444444','#6c6c6c','#959595'],{cap:2,out:false,paint:(i,j)=>{
      if(j===1&&(i===3||i===16))return '#bbbbbb';if(j===6&&i%4===1)return '#959595';if(hash(i,j,5)<.12)return '#68372b';if(j===4)return '#2a2a30';return null}});
    if(ore){sd=ore;for(let k=0;k<5;k++){const p=k%3;prism(g,CRP[p],4+k*3.2,5,-Math.PI/2+lr(-.6,.6),lr(3,6),1.2,0)}}
    put(c,bod,1,4);
    for(const wx of [5,16]){g.fillStyle='#000000';g.fillRect(wx-2,12,5,4);g.fillStyle='#444444';g.fillRect(wx-1,13,3,2);g.fillStyle=f?'#959595':'#6c6c6c';g.fillRect(wx-1+(f?0:2),13,1,1);g.fillRect(wx,14-(f?0:1),1,1)}
    return outl(c)}
  function drillRig(){const c=mk(52,26),g=c.getContext('2d');
    const body=relief(30,16,(i,j)=>(j>=3&&i<28)||(j<3&&i>=16&&i<26),['#1c1008','#68372b','#9a6759','#ff9966'],{cap:3,out:false,paint:(i,j)=>{if(j>=5&&j<=8&&i>=18&&i<=23)return j===5?'#9ad2e0':'#352879';if(j===12&&i%3===0)return '#000000';if(j>3&&j<11&&i>=3&&i<=12&&((i+j)>>1)%2===0)return '#ffffaa';return hash(i,j,3)<.1?'#2a1a0e':null}});
    put(c,body,18,4);
    for(let x=0;x<18;x++){const r=(18-x)/18*5.5;for(let y=-Math.ceil(r);y<=Math.ceil(r);y++)if(Math.abs(y)<=r)px(g,((x+y)>>1)%2?'#6c6c6c':'#bbbbbb',x,12+y)}
    g.fillStyle='#000000';g.fillRect(16,20,34,6);g.fillStyle='#2a2a30';g.fillRect(17,21,32,4);for(let x=18;x<48;x+=4){g.fillStyle='#6c6c6c';g.fillRect(x,22,2,2)}
    return darken(outl(c),'#030208',.35)}
  function ventMound(){return relief(18,8,(i,j)=>Math.abs(i+.5-9)<=2+j*.95&&!(j<2&&Math.abs(i+.5-9)<1.5),SPKN,{cap:2,paint:(i,j)=>{if(j>=1&&j<=3&&Math.abs(i+.5-9)<2.5)return j===1?'#ffffaa':'#ff9966';if(Math.abs(i+.5-9-Math.sin(j)*1.5)<.6&&j>3)return '#9a3a3a';return null}})}
  function pool(w,seed){sd=seed;return bake(w,5,(i,j)=>{const d=Math.hypot((i+.5-w/2)/(w/2),(j+.5-2.5)/2.5);if(d>1)return null;if(j===0)return d>.8?'#2c5a2c':'#9ad284';if(hash(i,j,seed)<.08)return '#ffffff';return rp(['#2c5a2c','#588d43','#9ad284','#ccff99'],1-d*1.1+(j===1?.2:0),i,j)})}
  function timber(w){return bake(w,4,(i,j)=>j===0?'#6f4f25':j===3?'#140c06':((i*7+j*3)%11<2?'#2a1a0e':'#4a2e18'))}
  function post(h){return bake(4,h,(i,j)=>i===0?'#6f4f25':i===3?'#140c06':((j*5+i)%9<2?'#2a1a0e':'#4a2e18'))}

  /* =====================================================================
     MID LAYER (20 px/s): four zone tiles of 500 px, ceiling and floor
     ===================================================================== */
  const MW=500,MCH=40,MFH=42,MFY=BOT-MFH;
  const mcy=new Float32Array(MW),mfb=new Float32Array(MW);
  for(let x=0;x<MW;x++){mcy[x]=9+3*Math.sin(TAU*3*x/MW)+2*Math.sin(TAU*7*x/MW+1.3)+vn(x/10,.5,7,50)*4;mfb[x]=MFH-12-2.5*Math.sin(TAU*2*x/MW+.7)-2*Math.sin(TAU*9*x/MW+2)-vn(x/10,.5,8,50)*4}
  const MFZ=[0,1,2,3].map(z=>{const a=new Float32Array(MW);for(let x=0;x<MW;x++){if(z===3){const w=Math.min(1,Math.min(x,MW-x)/24);a[x]=mfb[x]*(1-w)+(MFH-13)*w}else a[x]=mfb[x]}return a});
  const MIDLIGHT=[];
  function midCeil(z){
    const c=bake(MW,MCH,(i,j)=>{const e=mcy[i];if(j>e)return null;const d=e-j;if(d<1)return hash(i,0,4)<.12?'#6c5eb5':'#3a3268';if(d<2)return '#2c2650';return rp(MIDR,fbm(i/10,j/8,12,50,2)*.8-.25+Math.max(0,1-d/9)*.75,i,j)});
    sd=100+z;
    if(z===0||z===2)for(let k=0;k<(z?9:16);k++){const x=lr(6,MW-14),s=spike(Math.round(lr(4,9)),Math.round(lr(10,z?20:30)),SPKM,k+z*50,false,z===2);put(c,s,x-s.width/2,mcy[Math.round(x)]-2)}
    if(z===1){for(let k=0;k<5;k++){const x=lr(30,MW-30),p=k%3,cr=cluster(CRP[p],200+k,6,lr(10,15),false,0),h=halo(36,24,HALO[p],.45);put(c,h,x-36,mcy[Math.round(x)]-14);put(c,cr,x-cr.bx,mcy[Math.round(x)]-3)}
      for(let k=0;k<5;k++){const x=lr(6,MW-14),s=spike(4,Math.round(lr(6,12)),SPKM,300+k,false,false);put(c,s,x-s.width/2,mcy[Math.round(x)]-2)}}
    if(z===3){for(let x=30;x<MW-40;x+=92){const xx=x+lr(-6,6),y=mcy[Math.round(xx)];put(c,timber(34),xx-17,y-1);put(c,post(10),xx-17,y);put(c,post(10),xx+13,y)}
      const dr=flipV(drillRig()),x=300;put(c,dr,x,mcy[x]-6);MIDLIGHT.push({wx:3*MW+x+14,y:TOP+mcy[x]+12,c:'#ff7777',r:1.3})}
    return c}
  function midFloor(z){
    const f=MFZ[z];
    const c=bake(MW,MFH,(i,j)=>{const s=f[i];if(j<s)return null;const d=j-s;if(d<1)return hash(i,1,4)<.15?'#6c5eb5':'#3a3268';if(d<2)return '#2c2650';return rp(MIDR,fbm(i/10,j/8,13,50,2)*.8-.25+Math.max(0,1-d/9)*.75,i,j)});
    const g=c.getContext('2d');sd=140+z;
    if(z===0||z===2)for(let k=0;k<(z?6:13);k++){const x=lr(6,MW-14),s=spike(Math.round(lr(4,9)),Math.round(lr(6,z?12:20)),SPKM,400+k+z*50,true,false);put(c,s,x-s.width/2,f[Math.round(x)]+2-s.height)}
    if(z===1){for(let k=0;k<6;k++){const x=lr(30,MW-30),p=(k+1)%3,cr=cluster(CRP[p],220+k,7,lr(11,17),true,0),h=halo(40,26,HALO[p],.45);put(c,h,x-40,f[Math.round(x)]-20);put(c,cr,x-cr.bx,f[Math.round(x)]+3-cr.height)}}
    if(z===2){for(let k=0;k<3;k++){const x=60+k*150+lr(-20,20),p=pool(Math.round(lr(22,34)),k+9),h=halo(30,12,HALO[1],.5);put(c,h,x-30,f[Math.round(x)]-9);put(c,p,x-p.width/2,f[Math.round(x)])}
      for(const x of [130,350]){const v=ventMound();put(c,v,x-v.width/2,f[x]+2-v.height);MIDLIGHT.push({wx:2*MW+x,y:MFY+f[x]-5,c:'#ff9966',r:.8})}}
    if(z===3){const ry=MFH-13;for(let x=24;x<MW-24;x+=6){px(g,'#2a1a0e',x,ry+1,4,2)}px(g,'#6c6c6c',24,ry-1,MW-48,1);px(g,'#2a2a30',24,ry,MW-48,1);
      for(let x=40;x<MW-40;x+=110){put(c,post(28),x,ry-28);put(c,post(28),x+28,ry-28);put(c,timber(34),x-1,ry-30)}
      put(c,darken(cart(77,0),'#030208',.3),90,ry-15);put(c,darken(cart(0,1),'#030208',.3),270,ry-15);const dr=drillRig();put(c,dr,370,ry-dr.height+3);MIDLIGHT.push({wx:3*MW+370+40,y:MFY+ry-14,c:'#ffffaa',r:2.1})}
    return c}
  const MIDC=[0,1,2,3].map(midCeil),MIDF=[0,1,2,3].map(midFloor);

  /* =====================================================================
     NEAR LAYER (40 px/s): four zone tiles of 1000 px. black wet rock, rails, river, vents, lanterns
     ===================================================================== */
  const NW=1000,NCH=34,NFH=26,NFY=BOT-NFH;
  const ncy=new Float32Array(NW),nfb=new Float32Array(NW);
  for(let x=0;x<NW;x++){ncy[x]=14+3*Math.sin(TAU*3*x/NW)+2.4*Math.sin(TAU*8*x/NW+1)+1.3*Math.sin(TAU*23*x/NW+2)+vn(x/8,.5,5,125)*3-1.5;
    nfb[x]=10+2.5*Math.sin(TAU*4*x/NW+.4)+1.8*Math.sin(TAU*11*x/NW+1.7)+vn(x/8,.5,6,125)*3-1.5}
  const WSEG=[[60,330],[420,640],[720,950]];
  const inWater=x=>{for(const s of WSEG)if(x>=s[0]&&x<s[1])return true;return false};
  const NFZ=[0,1,2,3].map(z=>{const a=new Float32Array(NW);for(let x=0;x<NW;x++){let v=nfb[x];
    if(z===2){if(inWater(x))v=15.5;else{let e=99;for(const s of WSEG)e=Math.min(e,Math.abs(x-s[0]),Math.abs(x-s[1]));if(e<14)v=v+(15-v)*(1-e/14)}}
    if(z===3){const w=Math.min(1,Math.min(x,NW-x)/30);v=v*(1-w)+9*w}a[x]=v}return a});
  const NST=[],NLAN=[],NVENT=[],NSPK=[];
  function nearCeil(z){
    const c=bake(NW,NCH,(i,j)=>{const e=ncy[i];if(j>e)return null;const d=e-j;
      if(d<1)return hash(i,0,7)<.16?'#70a4b2':'#3e3570';if(d<2)return hash(i,1,7)<.14?'#9ad2e0':'#2a2450';
      if(fbm(i/10,j/4,25,100,2)>.66&&hash(i,j,26)<.5)return '#1e1a36';
      return rp(NEARR,fbm(i/10,j/7,21,100,2)*.9-.3+Math.max(0,1-d/8)*.8,i,j)});
    sd=500+z;
    for(let x=4;x<NW;x+=7)if(hash(x,z,11)<.45)NSPK.push({wx:z*NW+x,y:TOP+ncy[x]-.5,ph:hash(x,z,12)*9});
    if(z===1){for(let k=0;k<7;k++){const x=lr(20,NW-20),p=k%3,cr=cluster(CRP[p],600+k,5,lr(6,9),false,0),h=halo(22,16,HALO[p],.5);put(c,h,x-22,ncy[Math.round(x)]-10);put(c,cr,x-cr.bx,ncy[Math.round(x)]-2);
      for(const t of cr.tips)NSPK.push({wx:z*NW+x-cr.bx+t[0],y:TOP+ncy[Math.round(x)]-2+t[1],ph:k*1.3+t[0],cr:p})}}
    if(z===3){for(let x=40;x<NW-40;x+=lr(95,130)){const y=ncy[Math.round(x)];put(c,timber(26),x-13,y-1);NLAN.push({wx:z*NW+x,y:TOP+y+3,ch:Math.round(lr(3,9)),ph:lr(0,9)})}}
    const nS=[16,3,7,2][z];for(let k=0;k<nS;k++){const x=lr(8,NW-8),len=Math.round(lr(12,z===0?34:22)),w=Math.round(lr(6,11)),s=spike(w,len,SPKN,700+k+z*40,false,true);
      NST.push({wx:z*NW+x,img:s,ox:s.width/2,y:TOP+ncy[Math.round(x)]-3,tip:TOP+ncy[Math.round(x)]-3+len,per:lr(1.6,3.2),ph:lr(0,5),fy:NFY+NFZ[z][Math.round(x)]})}
    return c}
  function nearFloor(z){
    const f=NFZ[z];
    const c=bake(NW,NFH,(i,j)=>{if(z===2&&inWater(i))return null;const s=f[i];if(j<s)return null;const d=j-s;
      if(d<1)return hash(i,2,7)<.14?'#9ad2e0':(hash(i,3,7)<.35?'#6c5eb5':'#3e3570');if(d<2)return '#2a2450';
      if(fbm(i/10,j/4,27,100,2)>.66&&hash(i,j,28)<.5)return '#1e1a36';
      return rp(NEARR,fbm(i/10,j/7,22,100,2)*.9-.3+Math.max(0,1-d/8)*.8,i,j)});
    const g=c.getContext('2d');sd=800+z;
    for(let x=4;x<NW;x+=9)if(!(z===2&&inWater(x))&&hash(x,z,13)<.35)NSPK.push({wx:z*NW+x,y:NFY+f[x],ph:hash(x,z,14)*9});
    if(z===0)for(let k=0;k<9;k++){const x=lr(8,NW-8),s=spike(Math.round(lr(5,9)),Math.round(lr(6,14)),SPKN,900+k,true,false);put(c,s,x-s.width/2,f[Math.round(x)]+2-s.height)}
    if(z===1)for(let k=0;k<8;k++){const x=lr(20,NW-20),p=(k+2)%3,cr=cluster(CRP[p],640+k,5,lr(6,10),true,0),h=halo(22,14,HALO[p],.5);put(c,h,x-22,f[Math.round(x)]-14);put(c,cr,x-cr.bx,f[Math.round(x)]+2-cr.height)}
    if(z===2){const banks=[[0,60],[330,420],[640,720],[950,1000]];
      for(const b of banks){const x=Math.round((b[0]+b[1])/2);if(b[1]-b[0]>50){const v=ventMound();put(c,v,x-v.width/2,f[x]+2-v.height);NVENT.push({wx:z*NW+x,y:NFY+f[x]-6,ph:hash(x,1,3)*3})}}
      for(const x of [380,690]){const p=pool(14,x);put(c,p,x-7+20,f[x+20])}}
    if(z===3){const ry=9;for(let x=30;x<NW-30;x+=7){px(g,'#2a1a0e',x,ry+1,5,2);px(g,'#4a2e18',x,ry+1,5,1)}
      px(g,'#bbbbbb',30,ry-2,NW-60,1);px(g,'#6c6c6c',30,ry-1,NW-60,1);px(g,'#2a2a30',30,ry,NW-60,1);
      for(const x of [30,NW-34]){px(g,'#9a3a3a',x,ry-5,4,5);px(g,'#ffffaa',x+1,ry-4,2,1)}}
    return c}
  const NEARC=[0,1,2,3].map(nearCeil),NEARF=[0,1,2,3].map(nearFloor);
  const nearFloorY=sx=>{const wx=mod(Math.round(sx+nscroll()),4*NW);return NFY+NFZ[Math.floor(wx/NW)][wx%NW]};
  const nearCeilY=sx=>{const wx=mod(Math.round(sx+nscroll()),NW);return TOP+ncy[wx]};
  /* water tiles of the underground river */
  const WT=[0,1,2].map(f=>bake(64,11,(i,j)=>{
    if(j===0)return hash(i>>1,f,4)<.25?'#9ad2e0':'#352879';
    const v=.75-j*.07+.18*Math.sin(TAU*(i/32)+j*.9-f*TAU/3)+.1*Math.sin(TAU*(i/16)-j*1.4+f*TAU/3);
    if(j<4&&hash(i,j+f*20,5)<.04)return '#ffffff';
    return rp(['#03040c','#070b1c','#0d1430','#1c1840','#352879'],v,i,j)}));
  const LHALO=[halo(16,13,['#2a160c','#4a2614'],.45),halo(14,11,['#2a160c','#4a2614'],.42)];
  const LAN=lantern();

  /* =====================================================================
     FOREGROUND: fast black rock silhouettes at the very edges, spores
     ===================================================================== */
  function fgRock(w,h,seed,top){sd=seed;const c=bake(w,h,(i,j)=>{const t=Math.abs(i-w/2)/(w/2),edge=h*(1-Math.pow(t,1.6))*(.8+.2*Math.sin(i*.5+seed));const jj=top?j:h-1-j;if(jj>edge)return null;
    if(jj>edge-1)return top?'#16132a':'#2a2450';return '#000000'});return c}
  const FG=[];{sd=91;for(let k=0;k<4;k++){FG.push({wx:k*400+lr(0,200),img:fgRock(Math.round(lr(40,70)),Math.round(lr(9,14)),k,true),top:1});FG.push({wx:k*400+lr(200,380),img:fgRock(Math.round(lr(46,80)),Math.round(lr(8,13)),k+9,false),top:0})}}
  const SPORE=[];{sd=95;const SC=['#9ad284','#ccff99','#cc99ff','#ff77ff','#9ad2e0','#ccff99'];for(let i=0;i<38;i++)SPORE.push({x:lr(0,W+20),y:lr(TOP+6,BOT-6),v:lr(5,16),a:lr(3,10),w:lr(.4,1.1),ph:lr(0,9),c:SC[i%6],big:LR()<.2})}

  /* =====================================================================
     ENEMY SPRITES
     ===================================================================== */
  /* cave bat: violet fur, membrane wings with bright leading edges, glowing pink eyes. 6 flap frames */
  function batSprite(f){
    const wy=[-5,-2,1,4,3,-1][f],cx=10,cy=6;
    const tipX=s=>cx+.5+s*(9.8-(f===3||f===4?1.2:0)),tipY=cy+wy;
    const wing=s=>inPoly([[cx+.5+s*1.5,cy-1.5],[cx+.5+s*5,cy-2.5+wy*.5],[tipX(s),tipY],[cx+.5+s*8,cy+2+wy*.7],[cx+.5+s*6.5,cy+1+wy*.45],[cx+.5+s*5,cy+3+wy*.3],[cx+.5+s*3.2,cy+1.5+wy*.15],[cx+.5+s*1.5,cy+2.5]]);
    const WL=wing(-1),WR=wing(1);
    return paint(21,13,(i,j)=>{const x=i+.5,y=j+.5;
      const hd=Math.hypot((x-cx-.5)/2.4,(y-cy+1.4)/2.1)<=1,bd=Math.hypot((x-cx-.5)/2.3,(y-cy-1.8)/2.9)<=1;
      const ear=((j===cy-4||j===cy-5)&&(i===cx-2||i===cx+2))||(j===cy-3&&(i===cx-2||i===cx+2));
      if(hd||bd||ear){
        if(j===cy-2&&(i===cx-1||i===cx+1))return f%3===0?'#ffffff':'#ff7777';
        if(j===cy&&(i===cx-1||i===cx+1))return '#ffffff';
        if(ear)return j===cy-5?'#cc99ff':'#6c5eb5';
        return rp(['#1c1840','#352879','#6c5eb5','#8a5aa6'],.8-(x-cx)/7-(y-cy)/9,i,j)}
      for(const s of [-1,1]){const lead=Math.min(segD(x,y,cx+.5+s*1.5,cy-1.5,cx+.5+s*5,cy-2.5+wy*.5),segD(x,y,cx+.5+s*5,cy-2.5+wy*.5,tipX(s),tipY));
        const inW=(s<0?WL:WR)(x,y);if(lead<.7&&(inW||lead<.5))return '#cc99ff';
        if(inW){const fing=segD(x,y,cx+.5+s*5,cy-2.5+wy*.5,cx+.5+s*6.5,cy+1+wy*.45)<.5;return fing?'#8a5aa6':rp(['#2a1236','#6f3d86','#8a5aa6'],.7-Math.abs(x-cx)/20+(y<cy?.1:-.1),i,j)}}
      if(j===cy+5&&(i===cx-1||i===cx+2))return '#6c5eb5';
      return null});
  }
  const BAT=[0,1,2,3,4,5].map(batSprite),BATW=BAT.map(whiteOf);
  /* hive drone: striped wasp, green compound eye, flickering wings. 3 frames */
  function droneSprite(f){
    const wc=[[8,2.2,4.5,2.2],[8.5,3,4.2,1.6],[8,4.6,4.4,1.4]][f];
    return paint(17,12,(i,j)=>{const x=i+.5,y=j+.5;
      const hd=Math.hypot((x-3.5)/2.7,(y-7)/2.5)<=1,th=Math.hypot((x-7.2)/2.2,(y-7)/2.2)<=1,ab=Math.hypot((x-12)/3.8,(y-7.6)/2.7)<=1;
      if(hd){if(Math.hypot(x-2.8,y-6.3)<1.5)return (i===2&&j===5)?'#ffffff':'#9ad284';return y<6.5?'#6f4f25':'#2a1a0e'}
      if(ab){if(i%3===1)return '#000000';return y<7?'#ffffaa':y<8.5?'#b8c76f':'#6f4f25'}
      if(th)return y<6.5?'#9a6759':'#4a2e18';
      if(i===16&&j===8)return '#ffffff';
      if(j===10&&(i===6||i===8))return '#2a1a0e';
      const wd=Math.hypot((x-wc[0])/wc[2],(y-wc[1])/wc[3]);if(wd<=1)return wd>.75?'#ffffff':(bay(i,j)<.55?'#9ad2e0':null);
      return null})}
  const DRN=[0,1,2].map(droneSprite),DRNW=DRN.map(whiteOf);
  /* spiderling: small black spider with glowing red eyes. 4 scuttle frames */
  function splSprite(f){const c=mk(14,9),g=c.getContext('2d');
    const FT=[0,4,9,13];for(let k=0;k<4;k++){const o=((k+f)&1)?1:-1,bx=5+k*1.3,kx=[2,4.5,9,11.5][k];tl(g,'#8a5aa6',bx,4,kx,1,1);tl(g,'#6f3d86',kx,1,cl(FT[k]+o,0,13),8,1)}
    const b=relief(10,6,(i,j)=>Math.hypot((i+.5-3)/2.4,(j+.5-3.5)/2.2)<=1||Math.hypot((i+.5-7)/3.2,(j+.5-3)/2.8)<=1,['#0a0612','#1c1840','#352879','#6f3d86','#8a5aa6'],{cap:2,out:false,paint:(i,j)=>(i<=2&&j===2)?'#ff7777':(i===7&&j===2)?'#ff77ff':null});
    put(c,b,2,1);return outl(c)}
  const SPL=[0,1,2,3].map(splSprite),SPLW=SPL.map(whiteOf);
  /* fire wyrmling: green scaled head and wiggling body segments, little magenta wings */
  const WG=['#0f2414','#2c5a2c','#588d43','#9ad284','#ccff99'];
  function wyrmHead(open){
    return relief(14,11,(i,j)=>{const skull=Math.hypot((i-8.5)/4.6,(j-4.5)/3.6)<=1,snout=i>=1&&i<=7&&j>=3&&j<=5.5,jaw=open?(i>=2&&i<=7&&j>=7&&j<=8.5-((7-i)*.15)):(i>=2&&i<=7&&j>=6&&j<=7),horn=(i===12&&j===1)||(i===13&&j===0)||(i===11&&j===1);return skull||snout||jaw||horn},WG,{cap:2.5,paint:(i,j)=>{
      if(i===7&&j===3)return '#ffffaa';if(i===8&&j===3)return '#ff9966';if(i===2&&j===4)return '#000000';
      if((i>=11&&j<=1))return '#ffffaa';if(open&&j>=6&&j<=7&&i>=1&&i<=7&&i>=2)return j===6?'#ff9966':'#ffffaa';if(j>=6&&!open)return '#b8c76f';if(j>=8)return '#b8c76f';return null}})}
  const WH=[wyrmHead(0),wyrmHead(1)],WHW=WH.map(whiteOf);
  function wyrmSeg(r,tail){const S2=Math.ceil(r*2)+1+(tail?5:0),c=Math.ceil(r);
    return relief(S2,Math.ceil(r*2)+1,(i,j)=>Math.hypot(i-c,j-c)<=r+.2||(tail&&i>c&&Math.abs(j-c)<=r*(1-(i-c)/(S2-c))),WG,{cap:2,paint:(i,j)=>{if(j>c+r*.4)return '#b8c76f';if(j<=c-r+1&&(i&1))return '#6f3d86';return (hash(i,j,7)<.15)?'#2c5a2c':null}})}
  const WSEGS=[wyrmSeg(3.6),wyrmSeg(3.2),wyrmSeg(2.8),wyrmSeg(2.3),wyrmSeg(1.8,true)],WSEGW=WSEGS.map(whiteOf);
  function wyrmWing(f){return paint(8,7,(i,j)=>{const tip=[0,2,5][f];if(j<tip&&i<4)return null;const inW=inPoly([[1,6],[3,tip],[7,tip+1],[6,6]])(i+.5,j+.5);if(!inW)return null;return (i===3&&j<=tip+1)||(j===tip&&i>2)?'#ff77ff':'#cc44cc'})}
  const WWING=[0,1,2].map(wyrmWing);
  /* mole drill: rusty orange burrowing machine with a spinning drill nose, 16 headings x 3 frames */
  function drillSprite(a,f){
    const S2=25,c=12,ca=Math.cos(a),sa=Math.sin(a);
    const loc=(i,j)=>{const dx=i+.5-c-.5,dy=j+.5-c-.5;return [dx*ca+dy*sa,-dx*sa+dy*ca]};
    const cone=(u,v)=>u>=3&&u<=11.5&&Math.abs(v)<=(11.5-u)*.52+.3;
    const body=(u,v)=>u>=-8&&u<3&&Math.abs(v)<=4.2&&!(u<-6.8&&Math.abs(v)>3.2);
    const tread=(u,v)=>u>=-8.6&&u<2.2&&Math.abs(v)>4.2&&Math.abs(v)<=6;
    const ex=(u,v)=>u>=-10&&u<-8&&Math.abs(v)<1.6;
    return relief(S2,S2,(i,j)=>{const [u,v]=loc(i,j);return cone(u,v)||body(u,v)||tread(u,v)||ex(u,v)},['#1c1008','#68372b','#9a6759','#ff9966','#ffffaa'],{cap:2.5,paint:(i,j,v)=>{const [u,w]=loc(i,j);
      if(cone(u,w)){if(u>10.4)return '#ffffff';return (mod(Math.floor(u*1.2+w*1.1-f*1.4),3)<2)?(v>.5?'#ffffff':'#bbbbbb'):(v>.5?'#6c6c6c':'#444444')}
      if(tread(u,w)&&!body(u,w))return mod(Math.floor(u+f*1.5),3)<1?'#959595':'#2a2a30';
      if(u<-8)return f%2?'#ffffaa':'#ff9966';
      if(u>=1.6)return '#b8c76f';
      const ph=Math.hypot(u+2.5,w);if(ph<1.8)return ph<.8?'#ffffff':'#70a4b2';
      if(u>-6.5&&u<-4.5)return mod(Math.floor(u+w),2)?'#ffffaa':'#1c1008';
      return null}});
  }
  const DRL=[];for(let d=0;d<16;d++)DRL.push([0,1,2].map(f=>drillSprite(d/16*TAU,f)));
  const DRLW=DRL.map(s=>whiteOf(s[0]));
  const BUMP=relief(16,6,(i,j)=>Math.hypot((i+.5-8)/8,(j+.5-6)/6)<=1,SPKN,{cap:2,paint:(i,j)=>hash(i,j,4)<.2?'#9a6759':null}),BUMPR=flipV(BUMP);
  /* crystal golem: dark stone body grown through with living crystal. mode 0 normal, 1 shining (immune), 2 cracked */
  const ROCKG=['#15122a','#241f44','#352879','#4a3f8a','#6c5eb5'];
  const GCRK=new Set();{sd=333;for(let q=0;q<3;q++){let x=lr(9,17),y=lr(10,15),a=lr(0,TAU);for(let s=0;s<7;s++){GCRK.add(Math.round(x)+','+Math.round(y));x+=Math.cos(a);y+=Math.sin(a);a+=lr(-.9,.9)}}}
  function golemSprite(p,f,mode){
    const pal=CRP[p],w=28,h=31,c=mk(w,h),g=c.getContext('2d');
    const bob=[0,1,1,0][f],sw=[0,1,0,-1][f],sh=mode===1?1:mode===2?-1:0,gl=mode===1?f/3:null;
    prism(g,pal,18,9,-1.1,11,2.3,sh-1,gl);prism(g,pal,14.5,8,-1.75,9,2,sh-1,gl);prism(g,pal,21,12,-.55,8,1.9,sh-1,gl);
    const backArm=relief(w,h,(i,j)=>segD(i+.5,j+.5,20,12,22,19+sw*.5)<=2.3,ROCKG,{cap:2,out:false,amb:-.25});g.drawImage(backArm,0,0);
    const torso=(i,j)=>Math.hypot((i+.5-14)/7.6,(j+.5-14.5)/6.6)<=1;
    const head=(i,j)=>Math.hypot((i+.5-9.5)/3.8,(j+.5-6.5)/3.3)<=1;
    const arm=(i,j)=>segD(i+.5,j+.5,7,11,5.5+sw,19)<=2.6;
    const hips=(i,j)=>Math.abs(i+.5-14)<=4.5-(j-19)*.6&&j>=19&&j<=23;
    const body=relief(w,h,(i,j)=>torso(i,j)||head(i,j)||arm(i,j)||hips(i,j),ROCKG,{cap:3,out:false,paint:(i,j,v)=>{
      if(j===6&&i>=7&&i<=10)return mode===2?(i===8?'#ffffff':'#ff7777'):pal[mode===1?5:4];
      if(mode===2&&GCRK.has(i+','+j))return (i+j)%2?'#ffffff':pal[4];
      if(mode===2&&Math.hypot(i-14,j-15)<1.8)return pal[5];
      if(torso(i,j)&&(mod(i+Math.floor(j/4)*2,5)===0&&mod(j,4)!==0||mod(j,4)===0)&&hash(i>>2,j>>2,7)<.7)return '#15122a';
      if(hash(i,j,5)<.05)return pal[3];
      return ROCKG[cl(Math.round(v*4.2-.3),0,4)]}});
    g.drawImage(body,0,0);
    prism(g,pal,5.5+sw,20,1.6,7,2.6,sh,gl);
    prism(g,pal,8,9,-2.35,6,1.7,sh,gl);
    prism(g,pal,13.5,24+bob,1.57,6,1.8,sh,gl);prism(g,pal,17,24-bob,1.25,4.5,1.3,sh,gl);prism(g,pal,10.5,24-bob,1.9,4,1.2,sh,gl);
    return outl(c,mode===1?pal[4]:'#000000')}
  const GOL=[0,1,2].map(p=>({n:[0,1,2,3].map(f=>golemSprite(p,f,0)),s:[0,1,2,3].map(f=>golemSprite(p,f,1)),k:[0,1].map(f=>golemSprite(p,f*2,2))}));
  for(const o of GOL){o.nw=o.n.map(whiteOf);o.kw=o.k.map(whiteOf)}
  /* fungal spore pod: violet mushroom cap with glowing green spots, cream stalk with a face, glowing roots. 6 frames */
  const SPOTS=[[5,6],[9,3],[14,3],[18,6],[11,7],[7,9],[16,9],[13,0]];
  function podSprite(f){
    const ph=f/6*TAU,br=Math.sin(ph)*.5;
    const cap=(i,j)=>j<=11&&Math.hypot((i+.5-12)/(10.6+br*.4),(j+.5-11)/(9.4-br*.4))<=1;
    const stalk=(i,j)=>Math.hypot((i+.5-12)/4.8,(j+.5-15.5)/4.6)<=1;
    const roots=new Map();
    for(let k=0;k<4;k++){const x0=8.5+k*2.4;for(let y=19;y<24;y++){const x=Math.round(x0+Math.sin(ph+k*1.7+y*.6)*(y-18)*.45);roots.set(x+','+y,y>=22?(k&1?'#ff77ff':'#ccff99'):'#8a5aa6')}}
    const c=relief(24,24,(i,j)=>cap(i,j)||stalk(i,j)||roots.has(i+','+j),['#2a1236','#6f3d86','#8a5aa6','#cc44cc','#ff77ff'],{cap:3,paint:(i,j,v)=>{
      if(roots.has(i+','+j)&&!stalk(i,j))return roots.get(i+','+j);
      if(cap(i,j)){if(j>=10)return (i%3===0)?'#cc99ff':'#1a0a24';
        for(let k=0;k<SPOTS.length;k++){const s=SPOTS[k];if(Math.hypot(i-s[0],j-s[1])<(k===4?1.6:1.2)){const on=((k+f)%3)===0;return on?'#ffffff':(Math.hypot(i-s[0],j-s[1])<.7?'#ccff99':'#9ad284')}}return null}
      if(j===14&&(i===10||i===14))return '#000000';if(j===13&&(i===10||i===14))return f%3===0?'#000000':'#ccff99';if(j===17&&i>=11&&i<=13)return '#4a2e18';
      return rp(['#4a2e18','#6f4f25','#9a6759','#d8a878'],v,i,j)}});
    return c}
  const POD=[0,1,2,3,4,5].map(podSprite),PODW=POD.map(whiteOf);
  /* rocks: dark cave boulders with crystal flecks, 8 tumble frames */
  function rockSet(r,seed){
    sd=seed;const n=10,rad=[];for(let k=0;k<n;k++)rad.push(r*(.76+LR()*.32));
    const fl=[];for(let q=0;q<Math.round(r*.9);q++)fl.push([lr(-r*.6,r*.6),lr(-r*.6,r*.6),q%3]);
    const Sz=r*2+3,c=(Sz-1)/2,out=[];
    for(let f=0;f<8;f++){const ra=f/8*TAU,ca=Math.cos(ra),sa=Math.sin(ra);
      const lp=(i,j)=>{const dx=i-c,dy=j-c;return [dx*ca+dy*sa,-dx*sa+dy*ca]};
      const mask=(i,j)=>{const [u,v]=lp(i,j),a=(Math.atan2(v,u)+Math.PI)/TAU*n,k=Math.floor(a)%n,fr=a-Math.floor(a),rr=rad[k]*(1-fr)+rad[(k+1)%n]*fr;return Math.hypot(u,v)<=rr};
      out.push(relief(Sz,Sz,mask,['#0e0c1a','#211d3c','#444444','#6c6c6c','#959595'],{cap:Math.max(2,r*.6),paint:(i,j)=>{const [u,v]=lp(i,j);for(const q of fl)if(Math.abs(u-q[0])<.7&&Math.abs(v-q[1])<.7)return CRP[q[2]][4];return null}}))}
    return out}
  const RKL=[rockSet(9,3),rockSet(10,11)],RKS=[rockSet(4,5),rockSet(5,9),rockSet(4,17)];
  const RKLW=RKL.map(s=>s.map(whiteOf)),RKSW=RKS.map(s=>s.map(whiteOf));
  /* cart wreck (tumbling broken mine cart) and loose wheels */
  function wreckSet(){const out=[];for(let f=0;f<8;f++){const ra=f/8*TAU,ca=Math.cos(ra),sa=Math.sin(ra),c=11;
    const lp=(i,j)=>{const dx=i+.5-c,dy=j+.5-c;return [dx*ca+dy*sa,-dx*sa+dy*ca]};
    const m=(i,j)=>{const [u,v]=lp(i,j);const bucket=v>=-5&&v<=3&&Math.abs(u)<=9-(v+5)*.2&&!(u>3&&v<-1&&u-3>v+5),wh=Math.hypot(u+4.5,v-4.5)<=2.2||Math.hypot(u-5,v-4.5)<=2.2;return bucket||wh};
    out.push(relief(22,22,m,['#1c1008','#2a2a30','#444444','#6c6c6c','#959595'],{cap:2,paint:(i,j)=>{const [u,v]=lp(i,j);if(Math.hypot(u+4.5,v-4.5)<=2.2||Math.hypot(u-5,v-4.5)<=2.2)return Math.hypot(u+4.5,v-4.5)<1||Math.hypot(u-5,v-4.5)<1?'#bbbbbb':'#2a2a30';if(hash(Math.round(u+20),Math.round(v+20),3)<.25)return '#68372b';if(Math.abs(v+4)<.6)return '#959595';return null}}))}return out}
  function wheelSet(){const out=[];for(let f=0;f<8;f++){const a0=f/8*TAU*.25;out.push(relief(9,9,(i,j)=>Math.hypot(i-4,j-4)<=4.2,IRON,{cap:2,paint:(i,j)=>{const d=Math.hypot(i-4,j-4);if(d<1.2)return '#ffffff';if(d<3.1){const a=Math.atan2(j-4,i-4)-a0;return Math.abs(Math.sin(2*a))<.38?'#bbbbbb':'#2a2a30'}return d<3.8?'#6c6c6c':null}}))}return out}
  const WRK=wreckSet(),WHL=wheelSet(),WRKW=WRK.map(whiteOf),WHLW=WHL.map(whiteOf);
  const SPK=[spike(7,16,['#211d3c','#352879','#444444','#6c6c6c','#959595'],71,false,true),spike(10,26,['#211d3c','#352879','#444444','#6c6c6c','#959595'],73,false,true)].map(c=>outl(c));
  const SPKW=SPK.map(whiteOf);
  const RCART=[cart(91,0),cart(91,1)],RCARTW=RCART.map(whiteOf);

  /* =====================================================================
     MINI BOSS SPRITES: the giant cave spider
     ===================================================================== */
  const SPW=108,SPH=50;
  function spiderFrame(f,curl){
    const c=mk(SPW,SPH),g=c.getContext('2d');g.translate(9,0);
    const AT=[28,32,36,40],KX=[-13,-6,7,15],KY=[3,0,0,3],FX_=[-30,-16,16,31];
    const legs=(far)=>{for(let k=0;k<4;k++){
      const grp=((k+(far?1:0))&1),ph=f/4*TAU+(grp?Math.PI:0),off=curl?0:Math.sin(ph)*3,lift=curl?0:Math.max(0,Math.cos(ph))*2.5;
      const ax=AT[k]+(far?1:0),ay=far?22:25;
      let kx=ax+KX[k]+(far?2:0)+off*.4,ky=KY[k]+(far?2:0),fx=ax+FX_[k]+(far?3:0)+off,fy=47-lift;
      if(curl){kx=ax+KX[k]*.5;ky=12;fx=ax+KX[k]*.3;fy=31}
      const c1=far?'#15122a':'#352879',c2=far?'#241f44':'#8a5aa6';
      const mx=kx+(fx-kx)*.45,my=ky+(fy-ky)*.4-2;
      tl(g,c1,ax,ay,kx,ky,curl?2:3);tl(g,c2,ax,ay-1,kx,ky-1,1);tl(g,c1,kx,ky,mx,my,2);tl(g,c2,kx,ky-1,mx,my-1,1);tl(g,c1,mx,my,fx,fy,1);
      if(!far){px(g,'#cc99ff',kx-1,ky-1,2,2);px(g,'#8a5aa6',mx,my-1,1,1);px(g,'#cc99ff',fx,fy,1,1);for(let q=1;q<3;q++)px(g,'#6c6c6c',ax+(kx-ax)*q/3+(KX[k]<0?-1:1),ay+(ky-ay)*q/3-1)}}};
    legs(true);
    const R=['#0a0612','#1c1840','#352879','#6f3d86','#8a5aa6'];
    const abd=relief(34,26,(i,j)=>Math.hypot((i+.5-17)/16,(j+.5-13)/12)<=1,R,{cap:5,out:false,paint:(i,j,v)=>{
      const x=i-17,y=j-13;for(let k=0;k<4;k++){const cx=-8+k*5.5;if(Math.abs(Math.abs(y+4)*.7-(x-cx))<.7&&Math.abs(y+4)<4&&y<0)return k%2?'#ff77ff':'#cc44cc'}
      if(y>3&&hash(i,j,4)<.15)return '#6c6c6c';if(y<-8&&hash(i,j,5)<.2)return '#8a5aa6';return R[cl(Math.round(v*4.2-.3),0,4)]}});
    put(c,abd,40,6);
    const ceph=relief(20,16,(i,j)=>Math.hypot((i+.5-10)/9.5,(j+.5-8)/7.4)<=1||Math.hypot((i+.5-19)/2.5,(j+.5-8)/2.5)<=1,R,{cap:4,out:false,paint:(i,j,v)=>(Math.abs(i-10-(j-8)*.3)<.6&&j<9)?'#0a0612':R[cl(Math.round(v*4.2-.3),0,4)]});
    put(c,ceph,23,14);
    legs(false);
    tl(g,'#1c1840',24,26,22,31,2);tl(g,'#1c1840',27,27,26,32,2);px(g,'#ffffff',21,32);px(g,'#ffffff',25,33);
    tl(g,'#352879',23,22,18,26,2);
    for(const e of [[25,17,2],[28,16,2],[23,20,1],[26,15,1],[31,16,1],[24,18,1]]){px(g,'#ff7777',e[0],e[1],e[2],e[2]);px(g,'#ffffaa',e[0],e[1])}
    return outl(c)}
  const SPF=[0,1,2,3].map(f=>spiderFrame(f,false)),SPCURL=spiderFrame(0,true);
  const SPFR=SPF.map(flipV),SPFW=SPF.map(whiteOf),SPFRW=SPFR.map(whiteOf),SPCW=whiteOf(SPCURL);
  const SPCX=55,SPCY=23;   /* body centre inside the frame (with outline) */

  /* =====================================================================
     BOSS SPRITES: the Hive Queen and her hive
     ===================================================================== */
  const QW=150,QH=90,QAX=75,QAY=45;
  const QBODY=['#0e0a06','#2a1a0e','#4a2e18','#6f4f25','#9a6759','#d8a878'];
  const QEYE=[['#2c5a2c','#588d43','#9ad284','#ccff99','#ffffff'],['#68372b','#9a3a3a','#ff7777','#ffffaa','#ffffff']];
  const SACS=[[83,71,4.5],[96,74,5],[109,75,5],[122,73,4.5],[134,69,4]];
  const QCRK=new Set();{sd=611;for(let k=0;k<14;k++){let x=lr(40,140),y=lr(30,70),a=lr(0,TAU);const n=lr(4,10);for(let s=0;s<n;s++){QCRK.add(Math.round(x)+','+Math.round(y)+','+(k<6?1:2));x+=Math.cos(a);y+=Math.sin(a);a+=lr(-.7,.7)}}}
  const crk=(i,j,lv)=>QCRK.has(i+','+j+',1')||(lv>1&&QCRK.has(i+','+j+',2'));
  function queenSprite(dmg,jaw){
    const c=mk(QW,QH),g=c.getContext('2d'),eye=QEYE[dmg>=2?1:0];
    /* legs and antennae behind the body */
    const LEGS=[[[44,57],[38,70],[30,80]],[[51,58],[49,72],[43,85]],[[58,57],[63,71],[59,85]]];
    for(const l of LEGS){tl(g,'#2a1a0e',l[0][0],l[0][1],l[1][0],l[1][1],3);tl(g,'#4a2e18',l[0][0],l[0][1]-1,l[1][0],l[1][1]-1,1);tl(g,'#2a1a0e',l[1][0],l[1][1],l[2][0],l[2][1],2);px(g,'#9a6759',l[1][0]-1,l[1][1]-1,2,2);px(g,'#d8a878',l[2][0],l[2][1])}
    qc(g,'#4a2e18',19,35,10,22,3,9,2,1);qc(g,'#4a2e18',25,34,21,18,14,5,2,1);px(g,'#b8c76f',2,8,2,2);px(g,'#b8c76f',13,4,2,2);
    for(let k=1;k<8;k++){const s=k/8,m=1-s;px(g,'#9a6759',m*m*19+2*m*s*10+s*s*3,m*m*35+2*m*s*22+s*s*9)}
    /* abdomen, segmented, with brood sacs */
    const abd=relief(86,56,(i,j)=>Math.hypot((i+.5-43)/42,(j+.5-27)/26.5)<=1,QBODY,{cap:7,out:false,paint:(i,j,v)=>{
      const X=i+64,Y=j+25;
      for(const s of SACS){const d=Math.hypot(X-s[0],Y-s[1]);if(d<s[2])return rp(['#68372b','#ff9966','#ffffaa','#ffffff'],1.05-d/s[2]+(Y<s[1]?.15:-.1),i,j)}
      if(crk(X,Y,dmg))return dmg>=2?((X+Y)%2?'#ccff99':'#9ad284'):'#0e0a06';
      for(let k=0;k<6;k++){const sx=76+k*12+(Y-50)*(Y-50)*.008;if(Math.abs(X-sx)<.7)return '#0e0a06';if(Math.abs(X-sx-1)<.6&&v>.3)return '#d8a878'}
      if(Y<36&&hash(X,Y,3)<.08)return '#9a6759';
      return null}});
    put(c,abd,64,25);
    const pet=relief(10,10,(i,j)=>Math.hypot(i+.5-5,j+.5-5)<=4.6,QBODY,{cap:3,out:false});put(c,pet,61,44);
    const tho=relief(32,30,(i,j)=>Math.hypot((i+.5-16)/15.5,(j+.5-15)/14.5)<=1,QBODY,{cap:6,out:false,paint:(i,j,v)=>{const X=i+34,Y=j+30;if(crk(X,Y,dmg))return dmg>=2?'#9ad284':'#0e0a06';if(Math.abs(Y-38-(X-50)*(X-50)*.02)<.6)return '#0e0a06';if(Math.abs(X-50)<.6&&Y<44)return '#d8a878';return null}});
    put(c,tho,34,30);
    const neck=relief(12,14,(i,j)=>Math.hypot((i+.5-6)/5.5,(j+.5-7)/6.8)<=1,QBODY,{cap:3,out:false});put(c,neck,31,40);
    const head=relief(26,24,(i,j)=>Math.hypot((i+.5-13)/12.6,(j+.5-12)/11.4)<=1,QBODY,{cap:5,out:false,paint:(i,j,v)=>{const X=i+11,Y=j+35;
      const d=Math.hypot((X+.5-20)/6.8,(Y+.5-41)/8.2);if(d<=1){const hx=mod(X+(Math.floor(Y/2)%2),3)===0||Y%2===0;if(d<.4&&hash(X,Y,2)<.5)return eye[4];return hx?eye[1]:rp(eye.slice(1,4),1-d+(Y<40?.2:-.1),i,j)}
      if(X>=14&&X<=18&&Y===52)return '#000000';return null}});
    put(c,head,11,35);
    /* mandibles */
    const up=jaw?[13,52,6,46,1,48]:[13,52,4,50,3,58],lo=jaw?[13,57,6,66,1,68]:[13,57,4,63,4,58];
    qc(g,'#4a2e18',up[0],up[1],up[2],up[3],up[4],up[5],3,1);qc(g,'#9a6759',up[0],up[1]-1,up[2],up[3]-1,up[4],up[5]-1,1,1);
    qc(g,'#2a1a0e',lo[0],lo[1],lo[2],lo[3],lo[4],lo[5],3,1);px(g,'#ffffff',up[4],up[5]);px(g,'#ffffff',lo[4],lo[5]);
    if(dmg>=2){px(g,'#000000',3,47,3,2)}
    return outl(c)}
  const QB=[0,1,2].map(d=>[queenSprite(d,0),queenSprite(d,1)]),QBW=QB[0].map(whiteOf);
  /* wings: translucent dithered membranes with veins, 3 buzz frames; torn when damaged */
  function wingSprite(f,torn,back){
    const tip=[[80,3],[78,15],[70,29]][f],root=[4,42],w=84,h=46;
    const poly=inPoly([root,[30,root[1]-14-(tip[1]-3)*.4],tip,[tip[0]-5,tip[1]+8],[52,root[1]-6-(tip[1]-3)*.1],[20,root[1]+2]]);
    sd=900+f;const holes=torn?[0,1,2,3].map(()=>[lr(40,72),lr(8,30),lr(2,4)]):[];
    const C=back?['#1c1840','#352879','#6c5eb5']:['#70a4b2','#9ad2e0','#ffffff'];
    return bake(w,h,(i,j)=>{const x=i+.5,y=j+.5;if(!poly(x,y))return null;
      for(const q of holes)if(Math.hypot(x-q[0],y-q[1]-(tip[1]-3)*.5)<q[2])return null;
      if(segD(x,y,root[0],root[1],tip[0],tip[1])<.8)return C[2];
      for(const t of [.35,.6,.85]){const vx=root[0]+(tip[0]-5-root[0])*t+4,vy=root[1]+(tip[1]+8-root[1])*t+3;if(segD(x,y,root[0]+3,root[1]-2,vx,vy)<.55)return C[0]}
      return bay(i,j)<(back?.3:.36)?C[1]:null})}
  const WINGF=[0,1,2].map(f=>wingSprite(f,false,false)),WINGT=[0,1,2].map(f=>wingSprite(f,true,false)),WINGB=[0,1,2].map(f=>wingSprite(f,false,true));
  const WINGFW=WINGF.map(whiteOf);
  /* the hive: resin comb with glowing brood cells, three damage states */
  const HVW=160,HVH=BKH,HOX=-14,HOY=89,HRX=150,HRY=57;
  function hiveSprite(dmg){
    const R=5,s3=Math.sqrt(3);
    const inside=(x,y)=>{const n=(vn(x/9,y/9,77+dmg,1e6)-.5)*(8+dmg*6),ny=(y-HOY)/(HRY+n*.6+(dmg>=2?-4:0)),nx=(x-HOX)/(HRX+n);if(nx*nx+ny*ny<=1)return false;const L=46-46*Math.pow(Math.abs(y-HOY)/HOY,1.4)+n;return x>=L};
    const c=bake(HVW,HVH,(i,j)=>{if(!inside(i,j))return null;
      const q=(s3/3*i-j/3)/R,r=(2/3*j)/R;let rx=Math.round(q),rz=Math.round(r),ry=Math.round(-q-r);const dx=Math.abs(rx-q),dz=Math.abs(rz-r),dy=Math.abs(ry+q+r);
      if(dx>dy&&dx>dz)rx=-ry-rz;else if(dz>dy)rz=-rx-ry;
      const cx=R*s3*(rx+rz/2),cy=R*1.5*rz,ox=i+.5-cx,oy=j+.5-cy,m=Math.max(Math.abs(ox),.5*Math.abs(ox)+.866*Math.abs(oy))/(R*.866);
      const edge=!inside(i-1,j)||!inside(i,j-1)||!inside(i+1,j)||!inside(i,j+1);
      if(edge)return (!inside(i-1,j)||!inside(i,j-1))?'#d8a878':'#2a1a0e';
      const ch=hash(rx+50,rz+50,3),broken=dmg&&hash(rx+50,rz+50,9)<(dmg===1?.15:.35);
      if(dmg&&QCRK.has((i>>1)+','+(j>>1)+',1')&&hash(i,j,1)<.7)return dmg>=2?'#9ad284':'#0e0a06';
      if(m>.74){return (ox+oy<0)?'#9a6759':(m>.9?'#2a1a0e':'#4a2e18')}
      if(broken)return m>.5?'#0e0a06':'#000000';
      if(ch<.5)return rp(['#000000','#0e0a06','#2a1a0e'],m*1.1-(ox+oy)*.04,i,j);
      if(ch<.78)return rp(['#2a1a0e','#4a2e18','#6f4f25','#9a6759'],.9-m*.6-(ox+oy)*.05,i,j);
      return rp(['#2c5a2c','#588d43','#b8c76f','#ffffaa'],1-m*1.1,i,j)});
    /* a dim glow inside the opening */
    return c}
  const HIVE=[0,1,2].map(hiveSprite);
  const HGLOW=halo(70,44,['#1a1406','#2a2008'],.35);
  const BROOD=[[40,30],[62,24],[88,20],[36,148],[60,154],[86,158],[118,30],[120,150]];
  const LARVA=[0,1].map(f=>paint(7,5,(i,j)=>{const d=Math.hypot((i+.5-3.5)/3.4,(j+.5-2.5)/2.2);if(d>1)return null;if((i+f)%2===0&&d>.5)return '#9ad284';return d<.45?'#ffffff':'#ccff99'}));

  /* =====================================================================
     BULLETS (black outline, bright core, readable on the dark cave)
     ===================================================================== */
  const B=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  const bullets={
    sonic(c,b){const x=b.x|0,y=b.y|0,f=Math.floor(b.t*14)%2;B(c,'#000000',x-3,y-2,7,5);B(c,'#000000',x-2,y-3,5,7);B(c,'#cc44cc',x-2,y-2,5,5);B(c,f?'#ffffff':'#ff77ff',x-1,y-1,3,3);B(c,'#cc44cc',x,y,1,1)},
    fire(c,b){const x=b.x|0,y=b.y|0,fl=Math.floor(b.t*16)%2,l=Math.hypot(b.vx,b.vy)||1,tx=-b.vx/l,ty=-b.vy/l;
      B(c,'#9a3a3a',Math.floor(x+tx*6),Math.floor(y+ty*6),2,2);B(c,'#ff7777',Math.floor(x+tx*4-1),Math.floor(y+ty*4-1),2,2);
      B(c,'#000000',x-3,y-2,7,5);B(c,'#000000',x-2,y-3,5,7);B(c,'#ff9966',x-2,y-2,5,5);B(c,'#ffffaa',x-1,y-2,3,5);B(c,fl?'#ffffff':'#ffffaa',x-1,y-1,3,3)},
    shard(c,b){const x=b.x|0,y=b.y|0,f=Math.floor(b.t*12)%2;B(c,'#000000',x-4,y-1,9,3);B(c,'#000000',x-2,y-2,5,5);B(c,'#70a4b2',x-3,y,7,1);B(c,'#9ad2e0',x-1,y-1,3,3);B(c,f?'#ffffff':'#9ad2e0',x,y-1,1,3);B(c,'#ffffff',x-1,y,3,1)},
    glint(c,b){const x=b.x|0,y=b.y|0,f=Math.floor(b.t*20)%2;B(c,'#000000',x-2,y-2,5,5);B(c,f?'#ffffff':'#ff77ff',x-1,y-1,3,3);B(c,'#ffffff',x,y-2,1,5);B(c,'#ffffff',x-2,y,5,1)},
    spore(c,b){const x=b.x|0,y=b.y|0,f=Math.floor(b.t*6+b.x*.1)%2;B(c,'#000000',x-3,y-2,7,5);B(c,'#000000',x-2,y-3,5,7);B(c,'#588d43',x-2,y-2,5,5);B(c,'#9ad284',x-2,y-2,4,4);B(c,f?'#ffffff':'#ccff99',x-1,y-1,2,2)},
    web(c,b){const x=b.x|0,y=b.y|0;if(b.lk&&!b.lk.dead&&b.lk.t<(b.lk.life||99)&&Math.abs(b.lk.x-b.x)<2){const y1=Math.min(y,b.lk.y|0),y2=Math.max(y,b.lk.y|0);B(c,'#959595',x,y1,1,y2-y1)}
      B(c,'#000000',x-3,y-3,7,7);B(c,'#bbbbbb',x-2,y-2,5,5);B(c,'#000000',x-1,y-1,3,3);B(c,'#ffffff',x-2,y,5,1);B(c,'#ffffff',x,y-2,1,5);B(c,'#ffffff',x,y,1,1)},
    venom(c,b){const x=b.x|0,y=b.y|0,f=Math.floor(b.t*12)%2;B(c,'#000000',x-3,y-2,7,5);B(c,'#000000',x-2,y-3,5,7);B(c,'#cc44cc',x-2,y-2,5,5);B(c,'#ff77ff',x-2,y-2,3,3);B(c,f?'#ffffff':'#ffffaa',x-1,y-1,1,1)},
    acid(c,b){const x=b.x|0,y=b.y|0,f=Math.floor(b.t*10)%2;B(c,'#000000',x-3,y-2,7,5);B(c,'#000000',x-2,y-3,5,7);B(c,'#588d43',x-2,y-2,5,5);B(c,'#ccff99',x-2,y-2,4,3);B(c,f?'#ffffff':'#ffffaa',x-1,y-1,2,2)},
    rain(c,b){const x=b.x|0,y=b.y|0;B(c,'#000000',x-2,y-4,5,8);B(c,'#9ad284',x-1,y-3,3,6);B(c,'#ccff99',x-1,y-1,3,3);B(c,'#ffffff',x,y,1,2)},
    buzz(c,b){const x=b.x|0,y=b.y|0,f=Math.floor(b.t*16)%2;B(c,'#000000',x-3,y-3,7,7);B(c,'#b8c76f',x-2,y-2,5,5);B(c,f?'#ffffaa':'#ffffff',x-1,y-1,3,3);B(c,'#000000',x-1+f,y,1,1)},
    larva(c,b){const im=LARVA[Math.floor(b.t*6)%2];c.fillStyle='#000000';c.fillRect((b.x|0)-4,(b.y|0)-3,9,7);c.drawImage(im,(b.x|0)-3,(b.y|0)-2)},
    chip(c,b){const x=b.x|0,y=b.y|0;B(c,'#000000',x-2,y-2,5,5);B(c,'#959595',x-1,y-1,3,3);B(c,'#ffffff',x-1,y-1,1,1)}
  };

  /* =====================================================================
     BEHAVIOUR HELPERS
     ===================================================================== */
  const fx=(x,y,vx,vy,life,c,s)=>{if(FX.length<160)FX.push({x,y,vx,vy,life,l0:life,c,s:s||1})};
  function shatter(x,y,n,sp,cols){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=rnd(sp*.3,sp);fx(x,y,Math.cos(a)*s,Math.sin(a)*s,rnd(.3,.7),cols[i%cols.length],Math.random()<.4?2:1)}}
  const DUST=['#6c6c6c','#444444','#959595'];
  function countV(v){let n=0;for(const e of E)if(e.v===v)n++;return n}
  /* boss helpers */
  const mouth=b=>[b.x-QAX+3,b.y-QAY+58];
  const hiveX=b=>b.x-80;

  /* =====================================================================
     THE PACK
     ===================================================================== */
  return {
    noFG:true,
    bullets,
    drawBackground(){
      sync();const sc=scl(),ac=acl(),c=ctx;
      /* back wall */
      {const o=mod(sc*3,BKW);c.drawImage(BACK,-Math.floor(o),TOP);if(BKW-o<W)c.drawImage(BACK,Math.floor(BKW-o),TOP)}
      /* far layer */
      const fs=sc*FAR_V;
      for(const d of FARD){const x=mod(d.wx-fs+90,800)-90;if(x<W)c.drawImage(d.img,Math.floor(x),d.y)}
      {const o=mod(fs,FW);for(let x=-o;x<W;x+=FW){c.drawImage(FARC,Math.floor(x),TOP);c.drawImage(FARF,Math.floor(x),FFY)}}
      /* far waterfall shimmer */
      {const x=mod(430-fs+90,800)-90;if(x>-20&&x<W)for(let k=0;k<6;k++){const y=TOP+mod(ac*46+k*31,BKH);c.fillStyle='#352879';c.fillRect(Math.floor(x)+3+(k%3)*2,Math.floor(y),1,3)}}
      /* mid layer */
      const ms=sc*MID_V;
      {let k=Math.floor(ms/MW);for(let x=k*MW-ms;x<W;x+=MW,k++){const z=mod(k,4);c.drawImage(MIDC[z],Math.floor(x),TOP);c.drawImage(MIDF[z],Math.floor(x),MFY)}}
      for(const l of MIDLIGHT){const x=mod(l.wx-ms+40,4*MW)-40;if(x<W&&((ac*l.r)%1)<.5){c.fillStyle=l.c;c.fillRect(Math.floor(x),l.y,2,2)}}
      /* near layer */
      const ns=sc*NEAR_V;
      {let k=Math.floor(ns/NW);for(let x=k*NW-ns;x<W;x+=NW,k++){const z=mod(k,4);
        if(z===2){const wf=WT[Math.floor(ac*5)%3],x0=Math.max(x,-64),x1=Math.min(x+NW,W);const wo=mod(ac*14,64);for(let xx=Math.floor(x0-mod(x0-x+wo,64));xx<x1;xx+=64)c.drawImage(wf,xx,BOT-11)}
        c.drawImage(NEARC[z],Math.floor(x),TOP);c.drawImage(NEARF[z],Math.floor(x),NFY)}}
      /* vents puffing glowing steam */
      for(const v of NVENT){const x=mod(v.wx-ns+40,4*NW)-40;if(x>W+10)continue;const cyc=mod(ac/3.4+v.ph,1),on=cyc<.55;
        c.fillStyle=Math.floor(ac*9+v.ph)%2?'#ff9966':'#ffffaa';c.fillRect(Math.floor(x)-1,v.y+1,3,1);
        if(on)for(let q=0;q<6;q++){const life=mod(ac*1.3+q/6,1),y=v.y-life*44,xx=x+Math.sin(life*7+q)*2-life*10,s=2+Math.floor(life*7);
          c.fillStyle=life<.15?'#ff9966':life<.35?pat('#9a6759'):pat(life<.7?'#444444':'#2a2a30');c.fillRect(Math.floor(xx-s/2),Math.floor(y-s/2),s,s)}}
      /* hanging stalactites with drips */
      for(const s of NST){const x=mod(s.wx-ns+40,4*NW)-40;if(x>W+20)continue;const xi=Math.floor(x);c.drawImage(s.img,xi-Math.floor(s.ox),s.y);
        const f=mod(ac/s.per+s.ph,1);
        if(f<.55){if(f>.2){c.fillStyle='#9ad2e0';c.fillRect(xi,s.tip,1,f>.4?2:1)}}
        else{const tf=(f-.55)*s.per,y=s.tip+150*tf*tf;if(y<s.fy-1){c.fillStyle='#9ad2e0';c.fillRect(xi,Math.floor(y),1,2);c.fillStyle='#ffffff';c.fillRect(xi,Math.floor(y)+1,1,1)}
          else if(y<s.fy+18){c.fillStyle='#9ad2e0';c.fillRect(xi-2,s.fy-2,1,1);c.fillRect(xi+2,s.fy-2,1,1);c.fillRect(xi,s.fy-3,1,1)}}}
      /* lanterns with a warm flicker */
      for(const l of NLAN){const x=mod(l.wx-ns+40,4*NW)-40;if(x>W+20)continue;const xi=Math.floor(x),fl=hash(Math.floor(ac*7+l.ph*3),l.wx,5)<.82?0:1;
        const H_=LHALO[fl];c.drawImage(H_,xi-(H_.width>>1),l.y+l.ch+5-(H_.height>>1));
        c.fillStyle='#444444';for(let q=0;q<l.ch;q+=2)c.fillRect(xi,l.y+q,1,1);c.fillStyle='#6c6c6c';for(let q=1;q<l.ch;q+=2)c.fillRect(xi,l.y+q,1,1);
        c.drawImage(LAN,xi-4,l.y+l.ch);if(fl){c.fillStyle='#ff9966';c.fillRect(xi-1,l.y+l.ch+4,3,3)}}
      /* wet shine and crystal twinkles */
      for(const p of NSPK){const x=mod(p.wx-ns+10,4*NW)-10;if(x>W)continue;const k=mod(ac*1.6+p.ph,4);if(k<.5){c.fillStyle=p.cr!=null?CRP[p.cr][5]:'#ffffff';c.fillRect(Math.floor(x),Math.floor(p.y),1,1);if(k<.18&&p.cr!=null){c.fillStyle=CRP[p.cr][4];c.fillRect(Math.floor(x)-1,Math.floor(p.y),3,1);c.fillRect(Math.floor(x),Math.floor(p.y)-1,1,3)}}}
      /* the queen's chamber glow during the boss */
      if(G.boss&&G.boss.pkBoss&&G.boss.hx!=null){c.drawImage(HGLOW,Math.floor(G.boss.hx-40),TOP+45)}
    },
    drawForeground(){
      const sc=scl(),ac=acl(),c=ctx,fs=sc*FG_V;
      for(const f of FG){const x=mod(f.wx-fs+90,1600)-90;if(x<W)c.drawImage(f.img,Math.floor(x),f.top?TOP:BOT-f.img.height)}
      for(let i=0;i<SPORE.length;i++){const p=SPORE[i],x=mod(p.x-ac*p.v,W+20)-10,y=TOP+4+mod(p.y-TOP-ac*2.5+Math.sin(ac*p.w+p.ph)*p.a,BOT-TOP-8);
        if(((ac*.7+p.ph)%3)<2.4){c.fillStyle=p.c;c.fillRect(Math.floor(x),Math.floor(y),1,1);if(p.big){c.fillRect(Math.floor(x)+1,Math.floor(y),1,1)}}}
    },
    tick(dt,live){
      sync();
      const tgt=(G.boss&&G.state==='play')?0:1;S.spd+=(tgt-S.spd)*Math.min(1,dt*.7);
      if(G.boss||G.state!=='play'){S.bs+=dt*S.spd;S.ba+=dt}
    },
    enemies:{
      /* CAVE BATS swooping off the ceiling in loops; also HIVE DRONES and SPIDERLINGS */
      ring:{w:14,h:9,pts:110,
        init(e,o){e.age=0;
          if(o.drone){e.v='drone';e.w=12;e.h=8;e.pts=90;e.vx=o.vx||-50;e.vy=o.vy||0;return}
          if(o.spl){e.v='spl';e.w=10;e.h=7;e.pts=80;e.roof=!!o.roof;e.ty=cl(o.ty||rnd(50,150),36,166);e.vx=-20;e.vy=0;return}
          e.v='bat';e.y0=cl(e.y0,40,160);e.y=TOP+8;e.xb=e.x;e.amp=rnd(18,30);e.lw=rnd(2.3,3.1);e.vx=-(48+rnd(0,12));e.shootT=rnd(1.6,3.2)},
        move(e,dt,live){e.age+=dt;
          if(e.v==='drone'){e.vx+=(-66-e.vx)*Math.min(1,dt*1.4);const ty=P.y+Math.sin(e.age*3+e.ph)*26,wvy=cl((ty-e.y)*.9,-46,46);e.vy+=(wvy-e.vy)*Math.min(1,dt*2);e.x+=e.vx*dt;e.y=cl(e.y+e.vy*dt,TOP+8,BOT-8);return}
          if(e.v==='spl'){if(e.age<.9){e.y+=(e.ty-e.y)*Math.min(1,dt*3);e.vy=(e.ty-e.y)*3;e.x+=e.vx*dt}else{e.vx=-72;e.x+=e.vx*dt;const hop=Math.abs(Math.sin(e.age*7))*5;e.y=e.ty-hop;e.vy=0}return}
          e.xb+=e.vx*dt;const k=Math.min(1,e.age/1),ease=k*k*(3-2*k),a=e.age*e.lw+e.ph,py=e.y;
          e.y=TOP+8+(e.y0+Math.sin(a)*e.amp-TOP-8)*ease;e.x=e.xb+Math.cos(a)*13*ease;e.vy=(e.y-py)/Math.max(dt,1e-4);
          if(live&&e.x<W-30&&e.x>90&&(e.shootT-=dt)<=0){e.shootT=rnd(2.6,4)*[1,.85,.7][L3()-1];if(room(52)){ebAim(e.x-4,e.y,bsp(74),0,{sty:'sonic'});if(L3()>=2)ebAim(e.x-4,e.y,bsp(60),rnd(-.4,.4),{sty:'sonic'});sfxEnemyLaser()}}},
        draw(c,e,fl){
          if(e.v==='drone'){const im=(fl?DRNW:DRN)[Math.floor(e.age*24)%3];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2));return}
          if(e.v==='spl'){if(e.age<.9&&e.roof){c.fillStyle='#959595';const y0=Math.floor(e.y)-30;for(let y=Math.max(TOP,y0);y<e.y-3;y+=2)c.fillRect(Math.floor(e.x),y,1,1)}
            const im=(fl?SPLW:SPL)[Math.floor(e.age*14)%4];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2));return}
          const im=(fl?BATW:BAT)[Math.floor((e.age||0)*13+e.ph*2)%6];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2))}},
      /* FIRE WYRMLINGS: wiggling body, spit fire fans */
      ringR:{w:26,h:11,hp:3,pts:240,vx:-36,
        init(e){e.age=0;e.y0=cl(e.y0,46,154);e.y=e.y0;e.shootT=rnd(1.4,2.6)},
        move(e,dt,live){e.age+=dt;e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.age*1.7+e.ph)*24;e.vy=Math.cos(e.age*1.7+e.ph)*40.8;
          if(live&&e.x<W-30&&e.x>90&&(e.shootT-=dt)<=0){e.shootT=rnd(2.2,3.2)*[1,.85,.72][L3()-1];if(room(50)){const n=L3()>=3?5:3;ebFan(e.x-14,e.y,n,.5+n*.06,bsp(68),Math.atan2(P.y-e.y,P.x-e.x+14),{sty:'fire'});sfxEnemyLaser()}
            for(let k=0;k<5;k++)fx(e.x-14,e.y,rnd(-40,-10),rnd(-15,15),.3,k%2?'#ffffaa':'#ff9966',1)}},
        draw(c,e,fl){const a=e.age||0;
          for(let k=4;k>=0;k--){const im=(fl?WSEGW:WSEGS)[k],sx=e.x-2+k*4.6,sy=e.y+Math.sin(a*9-k*.95-1)*(1+k*.6);c.drawImage(im,Math.floor(sx-im.height/2),Math.floor(sy-im.height/2));
            if(k===0&&!fl){const wi=WWING[Math.floor(a*12)%3];c.drawImage(wi,Math.floor(sx-3),Math.floor(sy-9))}}
          const im=(fl?WHW:WH)[(e.shootT!=null&&e.shootT<.35)?1:0];c.drawImage(im,Math.floor(e.x-14),Math.floor(e.y-6+Math.sin(a*9)*.6))}},
      /* MOLE DRILLS: a rumbling bump in the rock for 0.8 s, then they burst out and shoot across in a straight line */
      dart:{w:14,h:12,pts:140,
        init(e,o){e.age=0;e.roof=o.edge==='roof'||(o.edge!=='floor'&&(o.rand?Math.random()<.5:e.y<100));
          e.wx=(o.x!=null?o.x:rnd(176,296))+nscroll();e.tele=.8;e.immune=true;e.dir=e.roof?4:12;
          e.touch=(q,px_,py_)=>!(q.tele>0)&&Math.abs(q.x-px_)<q.w/2+shk(12)&&Math.abs(q.y-py_)<q.h/2+shk(6);place(e)},
        move(e,dt,live){e.age+=dt;
          if(e.tele>0){e.tele-=dt;place(e);if(Math.random()<dt*20)fx(e.x+rnd(-7,7),e.y+(e.roof?-2:2),rnd(-6,6),e.roof?rnd(10,40):rnd(-40,-10),.5,DUST[Math.floor(Math.random()*3)],1);
            if(e.tele<=0){let a=live?Math.atan2(P.y-e.y,P.x-e.x):(e.roof?2:-2);
              if(e.roof)a=cl(a,Math.PI/2,Math.PI-.3);else{a=mod(a,TAU);a=cl(a,Math.PI+.3,Math.PI*1.5)}
              const sp=bsp(118);e.vx=Math.cos(a)*sp;e.vy=Math.sin(a)*sp;e.dir=mod(Math.round(a/(TAU/16)),16);e.immune=false;
              shatter(e.x,e.y,10,60,DUST);shake=Math.max(shake,.08);
              if(live&&L3()>=2&&room(50))for(let k=-1;k<=1;k++)ebShot(e.x,e.y,Math.cos(a+k*.7)*bsp(50),Math.sin(a+k*.7)*bsp(50),{sty:'chip',life:3})}
            return}
          e.x+=e.vx*dt;e.y+=e.vy*dt;
          if(Math.random()<dt*14)fx(e.x-e.vx*.08,e.y-e.vy*.08,rnd(-10,10),rnd(-10,10),.4,DUST[Math.floor(Math.random()*3)],1);
          if((e.vy>0&&e.y>nearFloorY(e.x)-2)||(e.vy<0&&e.y<nearCeilY(e.x)+2)){shatter(e.x,e.y,8,40,DUST);e.dead=1}},
        draw(c,e,fl){
          if(e.tele>0){const j=(Math.floor(e.age*30)%2)?1:-1,x=Math.floor(e.x-8+j*(e.tele<.4?1:.5)),y=e.roof?Math.floor(e.y-6):Math.floor(e.y-1);
            const im=e.roof?BUMPR:BUMP;c.drawImage(im,x-1,e.roof?y-2:y-3);
            if(e.tele<.35){const s=DRL[e.dir][Math.floor(e.age*20)%3];c.drawImage(s,Math.floor(e.x-12),Math.floor(e.y-12+(e.roof?-7:7)*(e.tele/.35)))}
            return}
          const di=e.dir==null?8:e.dir,im=fl?DRLW[di]:DRL[di][Math.floor((e.age||0)*18)%3];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2))}},
      /* CRYSTAL GOLEMS: shine (immune, reflect shots), then crack (vulnerable, extra damage) and fire shard fans */
      cross:{w:20,h:26,hp:3,pts:280,vx:-24,
        init(e,o){e.age=0;e.col=o.col!=null?o.col:Math.floor(Math.random()*3);e.y0=cl(o.rand?rnd(52,148):e.y,48,150);e.y=e.y0;e.cyc=rnd(0,4.2);e.refT=0;e.mode=0;
          e.hitTest=(q,x,y)=>{if(Math.abs(x-q.x)<q.w/2+3&&Math.abs(y-q.y)<q.h/2+1){if(q.immune&&q.refT<=0&&G.state==='play'&&room(48)){q.refT=.45;ebAim(x-3,y,bsp(78),rnd(-.08,.08),{sty:'glint'})}return q.mode===2?1.6:1}return 0}},
        move(e,dt,live){e.age+=dt;e.refT-=dt;e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.age*.9+e.ph)*14;e.vy=Math.cos(e.age*.9+e.ph)*12.6;
          const c=mod(e.age+e.cyc,4.2)/4.2,pm=e.mode;e.mode=c<.4?1:c<.55?2:0;e.immune=e.mode===1;
          if(e.mode===2&&pm!==2&&live&&e.x<W-20&&e.x>90&&room(50)){const n=[5,6,7][L3()-1];ebFan(e.x-8,e.y,n,1.0,bsp(64),Math.atan2(P.y-e.y,P.x-e.x),{sty:'shard'});sfxEnemyLaser();shatter(e.x,e.y,6,40,CRP[e.col])}},
        draw(c,e,fl){const g=GOL[e.col||0],f=Math.floor((e.age||e.t)*7)%4;let im;
          if(e.mode===1)im=g.s[f];else if(e.mode===2)im=fl?g.kw[f&1]:g.k[Math.floor((e.age||0)*10)%2];else im=fl?g.nw[f]:g.n[f];
          c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2))},
        onKill(e){shatter(e.x,e.y,18,80,CRP[e.col||0].slice(2))}},
      /* FUNGAL SPORE PODS: drift and bob, puff slow spore clouds, burst in a ring of spores; carry a power-up */
      pod:{w:20,h:20,vx:-22,pts:320,
        init(e){e.age=0;e.y0=cl(e.y0,46,150);e.y=e.y0;e.shootT=rnd(1.2,2.2)},
        move(e,dt,live){e.age+=dt;e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.age*1.3)*9;e.vy=Math.cos(e.age*1.3)*11.7;
          if(live&&e.x<W-24&&e.x>80&&(e.shootT-=dt)<=0){e.shootT=rnd(2.6,3.4)*[1,.85,.75][L3()-1];
            if(room(46)){const n=[8,10,12][L3()-1];ebRing(e.x,e.y-6,n,bsp(42),e.age*.7,{sty:'spore',life:6});ebAim(e.x-6,e.y-4,bsp(56),0,{sty:'spore',life:6});sfxEnemyLaser()}
            for(let k=0;k<8;k++)fx(e.x+rnd(-8,8),e.y-8,rnd(-14,14),rnd(-30,-8),.6,k%2?'#ccff99':'#9ad284',1)}},
        draw(c,e,fl){const im=(fl?PODW:POD)[Math.floor((e.age||e.t)*7)%6];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2))},
        onKill(e){const n=EB.length<38?12:EB.length<48?6:0;ebRing(e.x,e.y,n,bsp(36),Math.random()*TAU,{sty:'spore',life:3.6});shatter(e.x,e.y,14,50,['#ccff99','#ff77ff','#9ad284'])}},
      /* ROCKS: boulders, cart wrecks, falling stalactites, runaway mine carts, the queen's acid beam */
      rock:{
        init(e,o){e.age=0;e.spin=rnd(-6,6);e.rot=rnd(0,8);
          if(o.beam){e.kind='beam';e.w=10;e.h=10;e.vx=0;e.vy=0;e.immune=true;e.hp=e.mhp=1e9;e.on=0;e.hitTest=()=>0;e.touch=(q,px_,py_)=>q.on&&px_<q.x+q.w/2+shk(10)&&Math.abs(py_-q.y)<q.h/2+shk(6);return}
          if(o.fall){e.kind='fall';e.big=!!o.big;e.w=e.big?10:7;e.h=e.big?24:15;e.hp=e.mhp=(e.big?3:1.5)*loopScale();e.wx=(o.x!=null?o.x:rnd(172,300))+nscroll();e.tele=1;e.immune=true;e.vy=0;
            e.touch=(q,px_,py_)=>!(q.tele>0)&&Math.abs(q.x-px_)<q.w/2+shk(12)&&Math.abs(q.y-py_)<q.h/2+shk(6);placeFall(e);return}
          if(o.cart){e.kind='cart';e.big=true;e.w=20;e.h=13;e.hp=e.mhp=6*loopScale();e.x=W+14;e.y=BOT-NFH+9-9;e.vx=0;e.vy=0;e.tele=1;e.immune=true;
            e.touch=(q,px_,py_)=>!(q.tele>0)&&Math.abs(q.x-px_)<q.w/2+shk(12)&&Math.abs(q.y-py_)<q.h/2+shk(6);return}
          e.kind=(o.wreck||Math.random()<.3)?'wreck':'rock';
          if(e.kind==='wreck'){e.w=e.h=e.big?17:8;e.hp=e.mhp=(e.big?5:2)*loopScale()}
          else e.w=e.h=e.big?17:9;
          e.y=cl(e.y,TOP+22,BOT-22)},
        move(e,dt,live){e.age+=dt;
          if(e.kind==='beam')return;
          if(e.kind==='fall'){
            if(e.tele>0){e.tele-=dt;placeFall(e);if(Math.random()<dt*18)fx(e.x+rnd(-4,4),nearCeilY(e.x)+2,rnd(-4,4),rnd(20,50),.6,DUST[Math.floor(Math.random()*3)],1);
              if(e.tele<=0){e.immune=false;e.vy=30;sfxBoom(3,false)}return}
            e.vx=-NEAR_V*spdNow();e.vy=Math.min(130,e.vy+300*dt);e.x+=e.vx*dt;e.y+=e.vy*dt;
            if(e.y+e.h/2>nearFloorY(e.x)){shatter(e.x,e.y+e.h/2,12,60,['#959595','#6c6c6c','#9ad2e0']);if(live&&room(54))for(const s of [-1,1])ebShot(e.x,e.y+e.h/2-3,s*bsp(40)-20,-bsp(46),{sty:'chip',ay:30,life:2});e.dead=1}
            return}
          if(e.kind==='cart'){
            if(e.tele>0){e.tele-=dt;if(e.tele<=0){e.immune=false;e.vx=-bsp(150);sfxBoom(4,false)}return}
            e.x+=e.vx*dt;if(Math.random()<dt*30)fx(e.x+8,e.y+7,rnd(10,60),rnd(-30,-5),.25,Math.random()<.5?'#ffffaa':'#ff9966',1);return}
          e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot+=e.spin*dt},
        draw(c,e,fl){const k=((Math.floor(e.rot||0)%8)+8)%8;let im;
          if(e.kind==='beam'){drawBeam(c,e);return}
          if(e.kind==='fall'){im=(fl?SPKW:SPK)[e.big?1:0];let x=e.x;if(e.tele>0)x+=(Math.floor(e.age*26)%2?1:-1)*(e.tele<.5?1:.5);c.drawImage(im,Math.floor(x-im.width/2),Math.floor(e.y-im.height/2));
            if(e.tele>0&&Math.floor(e.age*10)%2){c.fillStyle='#bbbbbb';c.fillRect(Math.floor(x)-3,Math.floor(e.y-e.h/2)+1,1,1);c.fillRect(Math.floor(x)+3,Math.floor(e.y-e.h/2)+2,1,1)}return}
          if(e.kind==='cart'){if(e.tele>0){const on=Math.floor(e.age*12)%2;c.fillStyle=on?'#ffffaa':'#ff9966';c.fillRect(W-3,Math.floor(e.y)-2,3,3);c.fillStyle=pat('#ff9966');c.fillRect(W-14,Math.floor(e.y)-5,11,9);return}
            im=(fl?RCARTW:RCART)[Math.floor(e.age*14)%2];c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2));c.fillStyle='#ffffaa';c.fillRect(Math.floor(e.x-im.width/2)-1,Math.floor(e.y)-1,2,2);return}
          if(e.kind==='wreck')im=e.big?(fl?WRKW:WRK)[k]:(fl?WHLW:WHL)[k];
          else{const set=e.big?RKL:RKS,si=(e.spr||0)%set.length;im=(fl?(e.big?RKLW:RKSW):set)[si][k]}
          c.drawImage(im,Math.floor(e.x-im.width/2),Math.floor(e.y-im.height/2))},
        onKill(e){if(e.kind==='cart'||e.kind==='wreck')shatter(e.x,e.y,12,70,['#6c6c6c','#959595','#68372b']);else shatter(e.x,e.y,8,50,['#6c6c6c','#444444','#9ad2e0'])}}
    },
    /* ==================== MINI BOSS: THE GIANT CAVE SPIDER ==================== */
    /* hp multipliers: the Hollow Deep needs a near maxed ship (power 420), so the elites are tuned for one */
    mini:{w:62,h:24,get hp(){return [0,17,17,13][L3()]},
      init(e){e.x=W+50;e.st='enter';e.sT=0;e.roof=true;e.y=spRoofY();e.in=true;e.atk=0;e.bt=0;e.walk=0;e.thr=0;e.sa=0;
        e.hitTest=(q,x,y)=>{const s=q.roof?-1:1,dy=s*(y-q.y);return (Math.hypot((x-(q.x-11))/10,(dy+1)/8)<=1||Math.hypot((x-(q.x+11))/16,(dy+4)/12)<=1)?1:0};
        e.touch=(q,px_,py_)=>Math.abs(px_-q.x)<30+shk(10)&&Math.abs(py_-q.y)<12+shk(6)},
      update(e,dt,live){
        e.sT+=dt;e.bt+=dt;const hard=e.hp<e.mhp*.5,L=L3(),k=[1,.85,.72][L-1]*(hard?.8:1);
        const walkTo=(tx,sp)=>{const d=tx-e.x;if(Math.abs(d)>1){e.x+=Math.sign(d)*Math.min(Math.abs(d),sp*dt);e.walk+=dt*sp*.25}};
        if(e.st==='enter'){e.roof=true;e.y=spRoofY();walkTo(250,70);if(e.x<=251){e.st='ceil';e.sT=0;e.in=false;e.atk=0}return}
        if(e.st==='ceil'){e.roof=true;e.y=spRoofY();walkTo(250+Math.sin(e.bt*.6)*38,40);
          if(live){
            if(e.atk===0&&e.sT>.8*k){e.atk=1;webCurtain(e)}
            if(e.atk===1&&e.sT>2.4*k){e.atk=2;spiderlings(e,L>=2?4:3)}
            if(e.atk===2&&e.sT>3.4*k){e.atk=3;e.sa=Math.random()*TAU;e.spT=0}
            if(e.atk===3){e.spT-=dt;if(e.spT<=0){e.spT=.12;if(room(56))ebSpiral(e.x-10,e.y+8,L>=2?3:2,bsp(48),e.sa,{sty:'web',life:5});e.sa+=.31}if(e.sT>(L>=2?5.6:4.8)*k)e.atk=4}
            if(e.atk===4&&e.sT>6*k){e.atk=5;webCurtain(e)}
          }
          if(e.sT>7.4*k){e.st='drop';e.sT=0;e.y0=e.y}return}
        if(e.st==='drop'){const t=Math.min(1,e.sT/1.3),ease=t*t*(3-2*t);e.y=e.y0+(spFloorY()-e.y0)*ease;e.thr=1;
          if(t>=1){e.st='floor';e.sT=0;e.roof=false;e.thr=0;e.atk=0;shake=Math.max(shake,.25);shatter(e.x,e.y+18,12,50,DUST);
            if(live&&room(48))ebRing(e.x-10,e.y,[10,12,14][L-1],bsp(46),Math.random(),{sty:'web',life:5})}return}
        if(e.st==='floor'){e.roof=false;e.y=spFloorY();walkTo(240+Math.sin(e.bt*.7)*40,40);
          if(live){
            if(e.atk===0&&e.sT>.7*k){e.atk=1;venom(e,0)}
            if(e.atk===1&&e.sT>1.5*k){e.atk=2;venom(e,.12)}
            if(e.atk===2&&e.sT>2.6*k){e.atk=3;webCurtain(e)}
            if(e.atk===3&&e.sT>4*k){e.atk=4;ebRing(e.x-10,e.y-4,[12,14,16][L-1],bsp(44),e.bt,{sty:'web',life:5});if(L>=2)spiderlings(e,2)}
            if(e.atk===4&&e.sT>5.2*k){e.atk=5;venom(e,0);if(hard)venom(e,.2)}
          }
          if(e.sT>6.6*k){e.st='leave';e.sT=0}return}
        if(e.st==='leave'){e.roof=false;e.y=spFloorY();walkTo(W+70,110);if(e.x>=W+69){e.st='enter';e.sT=0;e.x=W+60;e.roof=true;e.in=false}}
      },
      draw(c,e,fl){
        if(e.st==='drop'){c.fillStyle='#bbbbbb';for(let y=TOP+8;y<e.y-12;y+=2)c.fillRect(Math.floor(e.x+6),y,1,1);c.fillStyle='#6c6c6c';for(let y=TOP+9;y<e.y-12;y+=2)c.fillRect(Math.floor(e.x+6),y,1,1);
          const im=fl?SPCW:SPCURL;c.drawImage(im,Math.floor(e.x-SPCX),Math.floor(e.y-SPCY));return}
        const f=Math.floor(e.walk)%4,im=e.roof?(fl?SPFRW:SPFR)[f]:(fl?SPFW:SPF)[f],oy=e.roof?im.height-1-SPCY:SPCY;
        c.drawImage(im,Math.floor(e.x-SPCX),Math.floor(e.y-oy));
        if(!fl){const s=e.roof?-1:1,on=Math.floor(e.bt*(e.hp<e.mhp*.5?10:4))%2;c.fillStyle=on?'#ffffff':'#ffffaa';c.fillRect(Math.floor(e.x-SPCX+35),Math.floor(e.y+s*(18-SPCY)-(e.roof?1:0)),2,1);
          if(on){c.fillStyle='#ff77ff';c.fillRect(Math.floor(e.x+8),Math.floor(e.y+s*(-12)),1,1)}}
      },
      onKill(e){shatter(e.x,e.y,30,90,['#352879','#6f3d86','#cc44cc','#ff77ff','#ffffff']);for(let i=0;i<6;i++)FX.push({burst:1,x:e.x+rnd(-26,26),y:e.y+rnd(-10,10),vx:0,vy:0,life:.5,l0:.5,max:8})}
    },
    /* ==================== BOSS: THE HIVE QUEEN ==================== */
    boss:{w:150,h:80,get hp(){return [0,22,25,20][L3()]},
      init(b){b.x=W+170;b.y=100;b.in=true;b.bt=0;b.ph=1;b.jaw=0;b.hx=hiveX(b);b.pat=null;b.patT=2.2;b.spitT=3;b.sa=0;b.beam=null;b.cells=BROOD.map(()=>({st:0,t:0}));b.last='';b.rain=null;
        b.hitTest=(q,x,y)=>{if(q.in)return 0;const ax=q.x-QAX,ay=q.y-QAY;if(Math.hypot((x-(ax+24))/13,(y-(ay+47))/12)<=1)return 1.2;if(Math.hypot((x-(ax+50))/15,(y-(ay+45))/14)<=1)return 1;if(Math.hypot((x-(ax+107))/42,(y-(ay+52))/27)<=1)return .7;if(Math.hypot((x-(ax+37))/6,(y-(ay+47))/7)<=1)return 1;return 0};
        b.touch=(q,px_,py_)=>Math.abs(px_-(q.x-QAX+38))<30+shk(10)&&Math.abs(py_-(q.y+2))<16+shk(6)},
      update(b,dt,live){
        b.bt+=dt;const f=b.hp/b.mhp,L=L3(),enr=(L>=2&&f<.2)||f<.1,ph=enr?4:f>.66?1:f>.33?2:3,spd=[1,1,.82,.68,.55][ph]*[1,.88,.78][L-1];
        if(b.in){const k=Math.min(1,b.bt/3.4),e=1-Math.pow(1-k,3);b.x=W+170-(W+170-245)*e;b.y=100;b.hx=hiveX(b);if(k>=1){b.in=false;b.bt=0}return}
        /* sway inside the hive opening; locked while the beam fires */
        if(!b.beam){const am=[0,12,16,22,26][ph],w=[0,.55,.7,.85,1.1][ph];b.my=(b.my||0)+dt*w;b.y+=((100+Math.sin(b.my)*am)-b.y)*Math.min(1,dt*3)}
        b.x=245+Math.sin(b.bt*.4)*3;b.hx=hiveX(b);
        bossWear(b,live,-10,8,60,26);
        b.jaw=(b.pat&&(b.pat.k==='fan'||b.pat.k==='beam'))||b.spitT<.4?1:0;
        for(const cc of b.cells){if(cc.st===1){cc.t-=dt;if(cc.t<=0){cc.st=2;if(live)broodBurst(b,cc)}}}
        if(!live)return;
        if(ph!==b.ph){b.ph=ph;shake=Math.max(shake,.5);FX.push({ring:1,x:b.x-50,y:b.y,r:3,life:.5,max:50,col:ph>=3?'#ccff99':'#ffffaa'});
          drones(b,ph===4?4:3);if(b.beam){b.beam.dead=1;b.beam=null}b.rain=null;b.pat=null;b.patT=1.2;if(ph>=3){shatter(b.hx+40,TOP+30,20,70,['#9a6759','#d8a878','#9ad284']);shatter(b.hx+40,BOT-30,20,70,['#9a6759','#d8a878','#9ad284'])}}
        /* background aimed spit between patterns */
        b.spitT-=dt;if(b.spitT<=0){b.spitT=[0,3.2,2.6,2.2,1.6][ph]*[1,.9,.8][L-1];if(!b.beam&&room(54)){const [mx,my]=mouth(b);ebFan(mx,my,3,.28,bsp(80),Math.atan2(P.y-my,P.x-mx),{sty:'acid'});sfxEnemyLaser()}}
        /* pattern sequencer */
        if(!b.pat){b.patT-=dt;if(b.patT<=0){const pool=[null,['fan','spiral','drones','fan','lattice'],['gust','fan','lattice','spiral','drones','brood'],['beam','rain','spiral','gust','lattice','fan','brood'],['beam','spiral','gust','rain','lattice','fan','drones']][ph];
            let k;do{k=pool[Math.floor(Math.random()*pool.length)]}while(k===b.last&&pool.length>1);b.last=k;b.pat={k,t:0,n:0,c:0};startPat(b,b.pat)}}
        else{const p=b.pat;p.t+=dt;if(runPat(b,p,dt,ph,L)){b.pat=null;b.patT=[0,1.6,1.3,1.05,.8][ph]*[1,.88,.75][L-1]}}
      },
      draw(c,b,fl){
        const f=b.hp/b.mhp,dm=f>.66?0:f>.33?1:2,hx=Math.floor(b.hx!=null?b.hx:hiveX(b));
        c.drawImage(HIVE[dm],hx,TOP);
        for(let i=0;i<BROOD.length;i++){const cc=b.cells?b.cells[i]:null,x=hx+BROOD[i][0],y=TOP+BROOD[i][1];
          if(!cc||cc.st===0){const on=Math.floor((b.bt||0)*3+i)%3===0;c.fillStyle=on?'#ffffaa':'#b8c76f';c.fillRect(x-1,y-1,3,2)}
          else if(cc.st===1){const s=Math.floor((b.bt||0)*16)%2;c.fillStyle=pat('#ccff99');c.fillRect(x-5,y-4,11,9);c.fillStyle=s?'#ffffff':'#ccff99';c.fillRect(x-2,y-2,5,4)}
          else{c.fillStyle='#000000';c.fillRect(x-2,y-2,5,4);c.fillStyle='#588d43';c.fillRect(x-1,y+2,1,2)}}
        const ax=Math.floor(b.x-QAX),ay=Math.floor(b.y-QAY),wf=Math.floor((b.bt||0)*(b.pat&&b.pat.k==='gust'?40:22))%3;
        const wx=ax+52-4,wy=ay+32-42;
        c.drawImage(WINGB[(wf+1)%3],wx+6,wy-3);
        c.drawImage(fl?QBW[b.jaw||0]:QB[dm][b.jaw||0],ax,ay);
        c.drawImage(fl?WINGFW[wf]:(dm>=2?WINGT:WINGF)[wf],wx,wy);
        if(!fl){
          for(let k=0;k<SACS.length;k++){const s=SACS[k];if(Math.floor((b.bt||0)*4+k*1.3)%4===0){c.fillStyle='#ffffff';c.fillRect(ax+s[0]-1,ay+s[1]-1,2,2)}}
          const enr=b.ph===4;if(enr&&Math.floor((b.bt||0)*10)%2){c.fillStyle='#ff7777';c.fillRect(ax+16,ay+36,6,3);c.fillStyle='#ffffff';c.fillRect(ax+18,ay+37,2,1)}
          if(b.jaw){const [mx,my]=mouth(b),s=Math.floor((b.bt||0)*20)%2;c.fillStyle=s?'#ccff99':'#9ad284';c.fillRect(Math.floor(mx)-1,Math.floor(my)-1,3,3)}
          if(b.pat&&b.pat.k==='gust'&&b.pat.t<.9){for(let q=0;q<7;q++){const yy=TOP+30+q*20+Math.sin(b.bt*9+q)*3,xx=b.x-90-mod(b.bt*160+q*23,60);c.fillStyle=q%2?'#b8c76f':'#ffffaa';c.fillRect(Math.floor(xx),Math.floor(yy),6,1)}}
          if(b.rain&&b.rain.t>0){for(const x of b.rain.xs){const s=Math.floor((b.bt||0)*14)%2;c.fillStyle=s?'#ccff99':'#588d43';c.fillRect(Math.floor(x)-1,TOP+8,3,2+Math.floor((1-b.rain.t/.8)*3))}}
        }
      },
      onKill(b){const ax=b.x-QAX,ay=b.y-QAY;for(const s of SACS)FX.push({burst:1,x:ax+s[0],y:ay+s[1],vx:0,vy:0,life:.5,l0:.5,max:9});
        shatter(ax+24,ay+47,24,90,['#9ad284','#ccff99','#ffffff']);shatter(b.hx+60,TOP+40,24,80,['#9a6759','#d8a878','#ffffaa']);shatter(b.hx+60,BOT-40,24,80,['#9a6759','#d8a878','#ffffaa']);
        for(const e of E)if(e.kind==='beam')e.dead=1}
    }
  };

  /* ---------- placement helpers used above (function declarations are hoisted) ---------- */
  function place(e){e.x=e.wx-nscroll();e.vx=-NEAR_V*spdNow();e.vy=0;e.y=e.roof?nearCeilY(e.x)+3:nearFloorY(e.x)-3}
  function placeFall(e){e.x=e.wx-nscroll();e.vx=-NEAR_V*spdNow();e.vy=0;e.y=nearCeilY(e.x)+e.h/2-3}
  function spRoofY(){return TOP+35}
  function spFloorY(){return BOT-39}
  function webCurtain(e){
    if(!room(44))return;const L=L3(),gh=[52,48,44][L-1],gy=cl(P.y+rnd(-30,30),40+gh/2,170-gh/2);
    const n=11,x=e.x-24;let prev=null;
    for(let i=0;i<n;i++){const y=34+(170-34)*i/(n-1);if(Math.abs(y-gy)<gh/2){prev=null;continue}const b=ebShot(x,y,-bsp(46),0,{sty:'web',life:9,hh:1});if(prev)b.lk=prev;prev=b}
    if(L>=3){const x2=x+26;prev=null;const gy2=cl(gy+rnd(-26,26),40+gh/2,170-gh/2);for(let i=0;i<n;i++){const y=34+(170-34)*(i+.5)/(n-1);if(y>170||Math.abs(y-gy2)<gh/2){prev=null;continue}const b=ebShot(x2,y,-bsp(46),0,{sty:'web',life:9,hh:1});if(prev)b.lk=prev;prev=b}}
    sfxEnemyLaser()}
  function spiderlings(e,n){if(countV('spl')>6)return;for(let i=0;i<n;i++){const s=spawn({type:'ring',spl:1,roof:e.roof,ty:40+i*(120/Math.max(1,n-1))+rnd(-8,8),y:e.y});s.x=e.x-10+i*6;s.y=e.y}}
  function venom(e,off){if(!room(50))return;const mx=e.x-24,my=e.y+(e.roof?6:-2),a=Math.atan2(P.y-my,P.x-mx);ebFan(mx,my,[3,5,5][L3()-1],.5,bsp(78),a+off,{sty:'venom'});sfxEnemyLaser()}
  function drones(b,n){const cap=[0,5,6,6,8][b.ph||1];for(let i=0;i<n&&countV('drone')<cap;i++){const top=i%2===0,y=top?TOP+28+rnd(-4,6):BOT-28+rnd(-6,4);const d=spawn({type:'ring',drone:1,y,vx:-30,vy:top?40:-40});d.x=b.hx+40+rnd(-6,10);d.y=y}}
  function broodBurst(b,cc){const i=b.cells.indexOf(cc),x=b.hx+BROOD[i][0],y=TOP+BROOD[i][1],top=y<100;shatter(x,y,10,50,['#ccff99','#9ad284','#ffffaa']);
    if(room(54)){const n=[0,4,5,6,7][b.ph||1];for(let k=0;k<n;k++){const a=Math.PI+(top?1:-1)*(.25+k*.22);ebShot(x,y,Math.cos(a)*bsp(56),Math.sin(a)*bsp(56),{sty:'larva',ay:top?-6:6,life:6})}}}
  function startPat(b,p){
    if(p.k==='beam'){const [mx,my]=mouth(b);const m=spawn({type:'rock',beam:1,y:my});m.x=mx/2;m.w=mx;m.y=my;m.h=10;b.beam=m;p.dur=1.25;sfxBoom(2,false)}
    if(p.k==='rain'){const gap=rnd(60,150),xs=[];for(let x=18;x<200;x+=17)if(Math.abs(x-gap)>26)xs.push(x);b.rain={t:.8,xs};p.xs=xs}
    if(p.k==='spiral'){p.a=Math.random()*TAU;p.dir=Math.random()<.5?1:-1}
  }
  function runPat(b,p,dt,ph,L){
    const [mx,my]=mouth(b);
    switch(p.k){
      case 'fan':{/* three to five aimed acid fans */
        const N=[0,3,3,4,5][ph],gap=.55;if(p.t>.45+p.n*gap&&p.n<N){p.n++;if(room(56)){const n=[0,7,8,9,9][ph];ebFan(mx,my,n,1.1,bsp(60),Math.atan2(P.y-my,P.x-mx)+(p.n%2?.07:-.07),{sty:'acid'});sfxEnemyLaser()}}
        return p.n>=N&&p.t>.45+N*gap}
      case 'spiral':{/* rotating arms from the brood sacs: slow, wide lanes */
        const arms=[0,3,3,4,5][ph]+(L>=3?1:0),dur=[0,2.4,2.6,2.8,3.2][ph];
        if(p.t<.6){if(Math.random()<.5)fx(b.x-38+rnd(-8,8),b.y+16+rnd(-6,6),rnd(-10,10),rnd(-10,10),.3,'#ff77ff',1);return false}
        p.c-=dt;if(p.c<=0){p.c=.11;if(room(55)){ebSpiral(b.x-38,b.y+16,arms,bsp(50),p.a,{sty:'venom',life:7})}p.a+=.2*p.dir}
        return p.t>.6+dur}
      case 'drones':{if(p.n===0){p.n=1;drones(b,[0,3,3,3,4][ph]+(L>=3?1:0))}if(p.t>.8&&room(54)&&p.n===1){p.n=2;ebRing(b.x-40,b.y,[0,10,12,12,14][ph],bsp(46),Math.random(),{sty:'acid',life:6})}return p.t>1.4}
      case 'gust':{/* wing buzz: curtains of pollen with a moving gap, telegraphed by the buzzing wings */
        const N=[0,0,3,3,4][ph]+(L>=3?1:0);if(p.t<.9)return false;
        if(p.t>.9+p.n*1.0&&p.n<N){p.n++;if(room(48)){const gh=[0,0,50,46,44][ph];p.gy=p.gy==null?cl(P.y,40+gh/2,170-gh/2):cl(p.gy+rnd(-34,34),40+gh/2,170-gh/2);ebCurtain(b.x-90,34,170,12,-bsp(58),p.gy,gh,{sty:'buzz',life:8});sfxEnemyLaser()}}
        return p.n>=N&&p.t>.9+N*1.0}
      case 'lattice':{/* crossing diagonal streams from the top and bottom comb */
        const dur=[0,2.4,2.6,2.8,3.2][ph],iv=[0,.42,.38,.34,.3][ph];p.c-=dt;
        if(p.c<=0&&p.t<dur){p.c=iv;p.n++;const top=p.n%2===0,x=b.hx+30,y=top?TOP+26:BOT-26,a=Math.PI+(top?-.58:.58);if(room(56)){ebShot(x,y,Math.cos(a)*bsp(56),(top?1:-1)*Math.abs(Math.sin(a))*bsp(56),{sty:'larva',life:7})}}
        return p.t>dur}
      case 'brood':{/* brood cells swell and burst into arcs of glowing larvae */
        if(p.n===0){p.n=1;const free=b.cells.filter(c=>c.st===0);if(free.length<3)for(const c of b.cells)c.st=0;const pick=b.cells.filter(c=>c.st===0).sort(()=>Math.random()-.5).slice(0,[0,0,2,3,3][ph]+(L>=3?1:0));pick.forEach((c,i)=>{c.st=1;c.t=.7+i*.35})}
        return p.t>2.2}
      case 'rain':{/* acid rain from the cave ceiling with a gap */
        if(b.rain){b.rain.t-=dt;if(b.rain.t<=0){const xs=b.rain.xs;b.rain=null;if(room(50))for(const x of xs)ebShot(x,TOP+12,-8,bsp(52),{sty:'rain',life:5});p.n++;
          if(p.n<(ph>=4?3:2)){const gap=rnd(60,150),xs2=[];for(let x=18+(p.n%2)*8;x<200;x+=17)if(Math.abs(x-gap)>26)xs2.push(x);b.rain={t:.8,xs:xs2}}}}
        return !b.rain&&p.t>1}
      case 'beam':{/* a charging acid beam with a clear telegraph, then a short burst */
        const m=b.beam;if(!m)return true;const [mx2,my2]=mouth(b);m.x=mx2/2;m.w=mx2;m.y=my2;
        if(!m.on&&p.t>p.dur){m.on=1;shake=Math.max(shake,.3);sfxBoom(6,false)}
        if(m.on&&p.t>p.dur+.9){m.dead=1;b.beam=null;if(room(50))ebFan(mx2,my2,[0,0,0,7,9][ph],1.6,bsp(56),Math.PI,{sty:'acid'});return true}
        m.tele=p.t<p.dur?p.t/p.dur:1;return false}
    }
    return true}
  function drawBeam(c,e){
    const x1=Math.floor(e.x+e.w/2),y=Math.floor(e.y),t=G.boss?G.boss.bt:0;
    if(!e.on){const k=e.tele||0,s=Math.floor(t*(10+k*20))%2;
      c.fillStyle=s?'#ccff99':'#588d43';for(let x=x1-4-(Math.floor(t*40)%4);x>0;x-=4)c.fillRect(x,y,2,1);
      if(k>.55){c.fillStyle=s?'#9ad284':'#2c5a2c';for(let x=x1-6;x>0;x-=8){c.fillRect(x,y-5,3,1);c.fillRect(x,y+5,3,1)}}
      c.fillStyle=pat('#9ad284');const r=2+Math.floor(k*5);c.fillRect(x1-r,y-r,2*r+1,2*r+1);c.fillStyle=s?'#ffffff':'#ccff99';c.fillRect(x1-1,y-1,3,3);return}
    const fl=Math.floor(t*30)%2;
    c.fillStyle='#000000';c.fillRect(0,y-5,x1,11);
    c.fillStyle='#588d43';c.fillRect(0,y-4,x1,9);
    c.fillStyle='#9ad284';c.fillRect(0,y-3+fl,x1,6-fl);
    c.fillStyle='#ccff99';c.fillRect(0,y-2,x1,4);
    c.fillStyle='#ffffff';c.fillRect(0,y-1,x1,2);
    for(let q=0;q<8;q++){c.fillStyle=q%2?'#ffffff':'#ccff99';c.fillRect(mod(x1-t*400-q*37,x1),y-4-(q%3),3,1)}
  }
},
script(sc,h){
  const L=h.level;
  /* the shared script stays, minus its plain crosses and big rings: golems and wyrmlings are placed by hand */
  for(let i=sc.length-1;i>=0;i--){const o=sc[i];if((o.type==='cross'||o.type==='ringR'||o.type==='rock')&&!o.cave)sc.splice(i,1)}
  const P_=(t,type,y,o)=>sc.push(Object.assign({t,type,y,cave:1},o||{}));
  /* TUNNELS (0 to 25 s): bat swarms off the ceiling, mole drills, falling stalactites */
  h.add(4,'ring',6,.28,70,0,{cave:1});h.add(8.5,'ring',6,.28,130,0,{cave:1});
  P_(6,'dart',0,{edge:'roof'});P_(6.6,'dart',0,{edge:'floor'});
  for(const t of [10,12.2,17,19.5,23])P_(t,'rock',0,{fall:1,big:t%2>1});
  P_(14,'pod',90);P_(15,'dart',0,{edge:'floor'});P_(15.5,'dart',0,{edge:'roof'});
  h.add(20,'ring',7,.25,100,0,{cave:1});
  if(L>=2){h.add(12,'ring',6,.25,60,0,{cave:1});P_(21,'dart',0,{edge:'roof'});P_(21.4,'dart',0,{edge:'roof'});P_(13.5,'rock',0,{fall:1,big:1})}
  /* CRYSTAL CAVERNS (25 to 50 s): golems, spore pods, more bats; the spider comes at 43 s */
  P_(26,'cross',60,{col:0});P_(27.5,'cross',140,{col:2});P_(31,'cross',100,{col:1});P_(35,'cross',70,{col:2});
  P_(29,'pod',110);h.add(33,'ring',6,.28,130,0,{cave:1});P_(37,'dart',0,{edge:'floor'});P_(38,'dart',0,{edge:'roof'});
  if(L>=2){P_(30,'cross',130,{col:0});P_(39,'cross',110,{col:1});P_(34,'pod',60)}
  if(L>=3){P_(32,'cross',50,{col:1});P_(40.5,'cross',150,{col:0})}
  /* RIVERS AND VENTS (50 to 75 s): wyrmlings, boulders, drills */
  h.add(51,'ringR',3,1.3,60,40,{cave:1});h.add(58,'rock',7,.5,0,0,{rand:1,cave:1});
  P_(55,'pod',70);P_(61,'dart',0,{edge:'floor'});P_(61.5,'dart',0,{edge:'roof'});P_(62,'dart',0,{edge:'floor'});
  h.add(64,'ringR',3,1.1,140,-40,{cave:1});P_(67,'cross',100,{col:1});P_(66,'rock',0,{fall:1,big:1});P_(69,'rock',0,{fall:1});
  h.add(70,'ring',7,.25,60,0,{cave:1});
  if(L>=2){h.add(56,'ringR',2,1.2,100,30,{cave:1});P_(72,'pod',130);h.add(60,'rock',4,.6,0,0,{rand:1,cave:1})}
  if(L>=3){h.add(66,'ringR',3,.9,50,50,{cave:1});P_(71,'cross',60,{col:2})}
  /* OLD MINES (75 to 86 s): runaway carts on the rails, cart wrecks, golems and drills */
  P_(76,'rock',0,{cart:1});P_(81.5,'rock',0,{cart:1});h.add(77,'rock',4,.6,0,0,{rand:1,wreck:1,cave:1});
  P_(78,'cross',70,{col:0});P_(79,'dart',0,{edge:'roof'});P_(80,'dart',0,{edge:'roof'});h.add(82,'ring',6,.25,90,0,{cave:1});
  if(L>=2){P_(84,'rock',0,{cart:1});P_(83,'cross',130,{col:2});P_(78.5,'rock',0,{fall:1,big:1})}
  if(L>=3){h.add(74,'ringR',2,1,120,-40,{cave:1});P_(85,'pod',100)}
}
};
Object.assign(PLANETS[8],{d:'ELITE. CRYSTAL CAVES AND OLD MINES. BATS, GOLEMS, SPORES.',every:9,waves:[['ring',5,.3],['dart',2,.5]]});
