/* Idlyte art pack 5: ENEMY BASE, the final system.
   Neon cyberpunk station run: black metal hull corridors trimmed with hot magenta and cyan neon,
   laser gates on a timer, hull turret batteries, shield pylons with crackling arcs, elite fighters,
   combat drones, heavy gunships, repair tenders, and the Depth Core's Guardian Mech.
   Neon glow = bright core pixel line plus a checker dithered halo, never a smooth blur. */
(function(){
'use strict';
const K='#000000',NV='#1c1840',VI='#352879',D='#444444',GM='#6c6c6c',LM='#959595',LL='#bbbbbb',WH='#ffffff',
  MG='#ff77ff',mg='#cc44cc',CY='#9ad2e0',cy='#70a4b2',LV='#cc99ff',RD='#ff7777',rd='#9a3a3a',PU='#6f3d86',BL='#6c5eb5',
  GR='#9ad284',gr='#588d43',YL='#ffffaa',OR='#ff9966';
const PM={k:K,n:NV,v:VI,d:D,g:GM,l:LM,L:LL,w:WH,M:MG,m:mg,C:CY,c:cy,p:LV,R:RD,r:rd,u:PU,b:BL,G:GR,e:gr,y:YL,o:OR};
const SPD=60;              // near hull scroll speed in px/s; turrets and laser gates ride on it
const HULL_T=27,HULL_B=175; // first free rows below the top hull and above the bottom hull
/* the level clock stops while the boss is alive and during the warp out; this extra clock keeps the station moving */
const S={G:null,ex:0};
function clk(){if(S.G!==G){S.G=G;S.ex=0}return S.ex}
function HT(){return bgT()+clk()}
const PWC={P:'#ff7777',S:'#70a4b2',M:'#b8c76f',H:'#9ad284',O:'#cc99ff',R:'#ff9966',B:'#ffffff'};

PACKS[5]={
init(){
  let seed=1;
  const R=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
  const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const rr=(a,b)=>a+R()*(b-a);
  const rows=r=>fromRows(r,ch=>PM[ch]);
  const N4=[[1,0],[-1,0],[0,1],[0,-1]];
  const px=(g,x,y,c)=>{g.fillStyle=c;g.fillRect(x,y,1,1)};
  const rc=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  function rampAt(r,v,i,j){v=Math.max(0,Math.min(.999,v));const t=v*(r.length-1),k=Math.min(r.length-2,Math.floor(t)),f=t-k;return f>BAYER[j&3][i&3]/16?r[k+1]:r[k]}
  function line(x0,y0,x1,y1,fn){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(;;){fn(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
  function neon(g,pts,core,halo){
    g.fillStyle=halo;
    for(let i=0;i<pts.length-1;i++)line(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],(x,y)=>{for(const d of N4)if(((x+d[0]+y+d[1])&1)===0)g.fillRect(x+d[0],y+d[1],1,1)});
    g.fillStyle=core;
    for(let i=0;i<pts.length-1;i++)line(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],(x,y)=>g.fillRect(x,y,1,1));
  }
  function inPoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const xi=P[i][0],yi=P[i][1],xj=P[j][0],yj=P[j][1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
  const polyM=P=>(x,y)=>inPoly(P,x+.5,y+.5);
  /* plate: black outline, bright bevel on the top and left, dark bevel bottom right, dithered body lit from the upper left */
  function plate(w,h,inside,o){o=o||{};
    const c=mk(w,h),g=c.getContext('2d'),m=new Uint8Array(w*h);
    for(let j=0;j<h;j++)for(let i=0;i<w;i++)m[j*w+i]=inside(i,j)?1:0;
    const at=(i,j)=>i>=0&&j>=0&&i<w&&j<h&&m[j*w+i]===1;
    const ramp=o.ramp||[NV,D,GM,LM],lit=o.lit||((i,j)=>.8-i/w*.35-j/h*.5);
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(!at(i,j))continue;let col;
      if(!at(i-1,j)||!at(i+1,j)||!at(i,j-1)||!at(i,j+1))col=K;
      else if(!at(i,j-2)||(!at(i-2,j)&&!o.noLeft))col=o.rim||LL;
      else if(!at(i,j+2)||!at(i+2,j))col=o.shadow||NV;
      else col=rampAt(ramp,lit(i,j),i,j);
      if(o.extra){const e=o.extra(i,j,col);if(e)col=e}
      g.fillStyle=col;g.fillRect(i,j,1,1)}
    return c}
  function fillPoly(g,P,col){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of P){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}
    g.fillStyle=col;for(let y=Math.floor(y0);y<=y1;y++)for(let x=Math.floor(x0);x<=x1;x++)if(inPoly(P,x+.5,y+.5))g.fillRect(x,y,1,1)}
  function orb(r,cols){const S2=r*2+3,h=(S2-1)/2;return dithered(S2,S2,(x,y)=>{const dx=x-h,dy=y-h,d=Math.hypot(dx,dy);if(d>r+.3)return -1;return Math.max(0,Math.min(.999,1-d/r*.65-(dx+dy)/r*.2))},cols)}
  const HR=[K,NV,D,GM,LM];
  const AR=[NV,D,GM,LM];      // black metal armour
  const AD=[K,NV,D,GM];       // darker armour
  const FR=[K,NV,VI,D];       // endoskeleton frame
  const ST=[K,D,GM,LM];       // gun steel

  /* ================= background art ================= */
  // far stars
  const STAR=mk(320,200);{const g=STAR.getContext('2d');seed=77;
    for(let i=0;i<120;i++){const q=R();px(g,ri(0,319),ri(14,191),q<.5?NV:q<.8?VI:q<.94?D:GM)}
    for(let i=0;i<10;i++){const x=ri(0,319),y=ri(16,189);px(g,x,y,LL);px(g,x+1,y,VI);px(g,x-1,y,VI)}}
  // the Depth Core: a giant dark sphere station with a tilted neon ring and spires, far back
  const MSW=240,MSH=184,MCX=120,MCY=92,MR=52;
  const MS=dithered(MSW,MSH,(x,y)=>{
    const dx=x-MCX,dy=y-MCY,d=Math.hypot(dx,dy);
    const e=Math.hypot(dx/114,dy/21);
    if((Math.abs(e-1)<.05||Math.abs(e-.88)<.03)&&(dy>0||d>MR+1))return Math.abs(e-1)<.02?.78:.52;
    if(d<=MR){const nx=dx/MR,ny=dy/MR,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
      let v=.08+Math.max(0,-nx*.5-ny*.6+nz*.35)*.36;
      if(Math.abs(Math.sin(ny*9))>.965&&nz>.2)v=.44;
      if(Math.abs(Math.sin(Math.atan2(nx,nz)*5))>.975&&nz>.35)v=Math.max(v,.34);
      if(d>MR-1.2&&dx+dy<0)v=.55;
      return Math.min(.999,v)}
    const ay=Math.abs(dy);
    if(ay>MR-4){const k=(ay-MR+4)/(MCY-MR+4),hw=5*(1-k)+.6;if(Math.abs(dx)<hw)return Math.abs(dx)<1?.42:.26;
      if(Math.abs(dx+9)<1.5&&ay<MR+16)return .26;if(Math.abs(dx-11)<1.5&&ay<MR+10)return .26}
    return -1},[K,NV,VI,PU,mg]);
  {const g=MS.getContext('2d');for(let i=-3;i<=3;i++){px(g,MCX+i*6,MCY-MR+18,BL)}rc(g,MCX-1,2,2,1,MG)}
  const TRAF=[];seed=91;for(let i=0;i<7;i++)TRAF.push({y:ri(36,70)+(i%2?84:0),v:rr(14,40),p:rr(0,400),c:i%3?BL:PU});

  function farStrip(top){
    const TW=400,TH=top?64:92,c=mk(TW,TH),g=c.getContext('2d');seed=top?5507:6607;
    let x=ri(0,8);
    while(x<TW-34){const w=ri(10,30),h=top?ri(26,60):ri(22,84),y0=top?0:TH-h,y1=top?h:TH;
      for(let j=y0;j<y1;j++)for(let i=x;i<x+w;i++){
        let col=NV;if(i===x||(top?j===y1-1:j===y0))col=VI;
        else if(i<x+w-1&&j%3===1&&(i-x)%3===1&&R()<.35)col=R()<.1?(R()<.5?BL:PU):VI;
        px(g,i,j,col)}
      if(R()<.5){const sw=ri(4,Math.max(4,w-4)),sh=ri(3,9),sx=x+ri(1,Math.max(1,w-sw-1));
        for(let j=0;j<sh;j++)for(let i=0;i<sw;i++)px(g,sx+i,top?y1+j:y0-sh+j,(i===0||j===(top?sh-1:0))?VI:NV)}
      if(R()<.6){const ax=x+ri(2,w-3),al=ri(4,12);rc(g,ax,top?y1:y0-al,1,al,VI);px(g,ax,top?y1+al-1:y0-al,mg)}
      x+=w+ri(0,12)}
    return c}
  const FAR_T=farStrip(true),FAR_B=farStrip(false);

  function midStrip(top){
    const TW=360,TH=top?50:54,c=mk(TW,TH),g=c.getContext('2d'),domes=[],lights=[];seed=top?3301:4409;
    // columns behind everything
    let x=ri(4,20);
    while(x<TW-12){const w=ri(4,8);
      const ya=top?0:ri(2,12),yb=top?ri(36,46):TH;
      for(let j=ya;j<yb;j++)for(let i=0;i<w;i++)px(g,x+i,j,i===0?GM:i<w/2?D:NV);
      rc(g,x-1,top?yb-2:ya,w+2,2,D);rc(g,x-1,top?yb-1:ya,w+2,1,top?K:GM);
      if(R()<.6)lights.push({x:x+(w>>1),y:top?yb-4:ya+3,c:R()<.5?RD:mg,r:rr(.4,1.2),p:R(),d:.4,s:1});
      x+=w+ri(22,64)}
    // truss
    const r0=top?32:14,r1=top?39:21;
    for(let i=0;i<TW;i++){px(g,i,r0,GM);px(g,i,r0+1,D);px(g,i,r1,D);px(g,i,r1-1,NV)}
    for(let i=0;i<TW;i+=8){line(i,r0+2,i+7,r1-2,(a,b)=>px(g,a%TW,b,VI));line(i+7,r0+2,i,r1-2,(a,b)=>px(g,a%TW,b,VI))}
    // tanks
    for(let k=0;k<2;k++){const tx=ri(20,TW-60)+k*0,tw=ri(22,34),ty=top?ri(18,22):ri(4,7);
      const tk=plate(tw,9,(i,j)=>{const ex=Math.min(i,tw-1-i);return ex>=3||Math.hypot(3-ex,j-4)<=4.4},{ramp:[K,NV,D,GM],rim:LM,lit:(i,j)=>.85-j/9*.8});
      g.drawImage(tk,tx,ty);rc(g,tx+5,ty+4,tw-10,1,PU)}
    // conduits with dim neon
    {const cyy=top?44:26;neon(g,[[0,cyy],[TW-1,cyy]],PU,VI)}
    // shield pylons with glowing domes (decor; arcs crackle between each pair)
    for(const dx of (top?[196,290]:[64,168])){
      const dc=orb(7,[VI,cy,CY,WH]);
      if(top){for(let j=0;j<40;j++)for(let i=-3;i<=3;i++)px(g,dx+i,j,i===-3?GM:i<0?D:NV);rc(g,dx-5,38,11,3,K);rc(g,dx-5,38,11,1,GM);
        g.drawImage(dc,dx-8,34);rc(g,dx-8,32,17,7,K);domes.push({x:dx,y:44})}
      else{for(let j=12;j<TH;j++)for(let i=-3;i<=3;i++)px(g,dx+i,j,i===-3?GM:i<0?D:NV);
        g.drawImage(dc,dx-8,3);rc(g,dx-8,11,17,7,K);rc(g,dx-5,12,11,1,GM);domes.push({x:dx,y:6})}
    }
    return {c,domes,lights}}
  const MID_T=midStrip(true),MID_B=midStrip(false);

  function nearStrip(top){
    const TW=480,TH=top?36:30,c=mk(TW,TH),g=c.getContext('2d'),L=[];seed=top?1013:2029;
    const pa=top?0:8,pb=top?24:TH;
    let x=0;
    while(x<TW){
      let w=ri(20,56);if(TW-x-w<20)w=TW-x;
      const kind=ri(0,7),vb=R()*.12-.06;
      for(let j=pa;j<pb;j++){const f=(j-pa)/(pb-pa);for(let i=x;i<x+w;i++)px(g,i,j,rampAt(HR,(top?.27+.24*f:.58-.3*f)+vb,i,j))}
      rc(g,x,pa,1,pb-pa,K);rc(g,x+1,pa,1,pb-pa,GM);
      const sy=top?ri(3,20):ri(pa+3,TH-4);rc(g,x+1,sy,w-1,1,K);rc(g,x+1,sy+1,w-1,1,top?D:GM);
      const ly=()=>top?ri(3,15):ri(pa+3,TH-10);
      if(kind===0){for(let i=x+3;i<x+w-2;i+=6){px(g,i,pa+2,LM);px(g,i,pb-3,LM)}}
      else if(kind===1){const vx=x+4,vw=Math.min(w-8,26),vy=ly();rc(g,vx-1,vy-1,vw+2,9,K);for(let k=0;k<4;k++){rc(g,vx,vy+k*2,vw,1,D)}rc(g,vx-1,vy+8,vw+2,1,GM)}
      else if(kind===2){const hy=ly();for(let j=0;j<5;j++)for(let i=x+2;i<x+w-1;i++)px(g,i,hy+j,((i+j)>>2)&1?K:rd);rc(g,x+2,hy-1,w-3,1,K);rc(g,x+2,hy+5,w-3,1,K)}
      else if(kind===3){const py=ly();rc(g,x+1,py,w-1,1,LL);rc(g,x+1,py+1,w-1,1,LM);rc(g,x+1,py+2,w-1,1,GM);rc(g,x+1,py+3,w-1,1,K);for(let i=x+4;i<x+w-3;i+=10){rc(g,i,py-1,2,6,K);rc(g,i,py-1,1,5,GM)}}
      else if(kind===4){const wy=ly();for(let i=x+4;i<x+w-5;i+=6){rc(g,i-1,wy-1,5,4,K);rc(g,i,wy,3,2,(i>>3)&1?cy:VI);px(g,i,wy,CY);if(R()<.35)L.push({x:i+1,y:wy,c:R()<.5?CY:LV,r:rr(.1,.4),p:R(),d:.6,s:2})}}
      else if(kind===5){const gy0=ly();for(let j=0;j<6;j++)for(let i=x+3;i<x+w-3;i++)if((i+j)&1)px(g,i,gy0+j,K)}
      else if(kind===6){const by=ly(),bx=x+ri(3,Math.max(3,w-14));rc(g,bx,by,11,6,K);rc(g,bx+1,by+1,9,4,NV);for(let k=0;k<3;k++){px(g,bx+2+k*3,by+2,rd);L.push({x:bx+2+k*3,y:by+2,c:[RD,CY,MG][k],r:rr(.6,2.2),p:R(),d:.5,s:1})}}
      else{const by=ly();for(let i=x+4;i<x+w-4;i+=4){rc(g,i,by,2,8,K);rc(g,i,by,1,8,D)}}
      if(R()<.5)L.push({x:x+ri(3,w-3),y:top?ri(15,22):ri(9,14),c:R()<.5?RD:WH,r:rr(.3,1.4),p:R(),d:.25,s:1});
      x+=w;
    }
    if(top){
      rc(g,0,24,TW,1,LM);rc(g,0,25,TW,1,D);rc(g,0,26,TW,1,K);
      x=0;let col=0;
      while(x<TW){const n=Math.min(TW-x,ri(50,110));neon(g,[[x+3,28],[x+n-4,28]],col?CY:MG,col?cy:mg);rc(g,x,26,3,4,K);rc(g,x+1,27,1,2,GM);x+=n;col^=1}
      x=ri(10,40);
      while(x<TW-30){const w=ri(8,20),h=ri(4,7);
        g.drawImage(plate(w+2,h+2,(i,j)=>j<=h&&(j<h-1||(i>0&&i<w+1)),{ramp:HR,lit:(i,j)=>.55-j/h*.25}),x,25);
        L.push({x:x+(w>>1),y:25+h-1,c:R()<.5?RD:CY,r:rr(.5,1.6),p:R(),d:.5,s:2});
        x+=w+ri(40,110)}
    }else{
      rc(g,0,5,TW,1,K);rc(g,0,6,TW,1,LL);rc(g,0,7,TW,1,LM);
      x=0;let col=1;
      while(x<TW){const n=Math.min(TW-x,ri(50,110));neon(g,[[x+3,3],[x+n-4,3]],col?CY:MG,col?cy:mg);rc(g,x,1,3,5,K);rc(g,x+1,2,1,2,GM);x+=n;col^=1}
      x=ri(10,40);
      while(x<TW-30){const w=ri(8,20),h=ri(3,5);
        g.drawImage(plate(w+2,h+2,(i,j)=>j>=1&&(j>1||(i>0&&i<w+1)),{ramp:HR,lit:(i,j)=>.7-j/h*.3}),x,5-h);
        L.push({x:x+(w>>1),y:6-h,c:R()<.5?RD:CY,r:rr(.5,1.6),p:R(),d:.5,s:2});
        x+=w+ri(40,110)}
    }
    return {c,L}}
  const NEAR_T=nearStrip(true),NEAR_B=nearStrip(false);

  // foreground struts that whip past at the very edges
  function strut(top){const w=26,h=34,c=mk(w,h),g=c.getContext('2d');
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const edge=i<3||i>w-4||(top?j>h-4:j<3);if(edge||((i+j)%9<2)||((i-j+90)%9<2))px(g,i,j,i===0||i===w-1?VI:K)}
    neon(g,top?[[2,h-2],[w-3,h-2]]:[[2,1],[w-3,1]],MG,mg);return c}
  const STR=[strut(true),strut(false)];

  function tileDraw(img,TW,off,y){const o=Math.floor(((off%TW)+TW)%TW);ctx.drawImage(img,-o,y);if(TW-o<W)ctx.drawImage(img,TW-o,y)}
  function drawLights(L,TW,off,y0,T){const o=Math.floor(((off%TW)+TW)%TW);
    for(let i=0;i<L.length;i++){const l=L[i];if(((T*l.r+l.p)%1)>l.d)continue;let x=l.x-o;if(x<-2)x+=TW;if(x>W)continue;
      ctx.fillStyle=l.c;ctx.fillRect(x,y0+l.y,l.s,1);if(l.s>1){ctx.fillStyle=pat(l.c);ctx.fillRect(x-1,y0+l.y-1,l.s+2,3)}}}
  function arc(x0,y0,x1,y1,bend){if(Math.random()<.3)return;
    let px0=x0,py0=y0;const n=9;
    for(let i=1;i<=n;i++){const k=i/n,xx=x0+(x1-x0)*k,yy=y0+(y1-y0)*k+(i<n?(Math.random()-.5)*7+Math.sin(k*Math.PI)*bend:0);
      pxLine(px0,py0+1,xx,yy+1,cy);pxLine(px0,py0,xx,yy,Math.random()<.5?WH:CY);px0=xx;py0=yy}}
  function drawArcs(M,off,y0,bend){const o=Math.floor(((off%360)+360)%360);
    for(const base of [-o,360-o]){const a=M.domes[0],b=M.domes[1],xa=base+a.x,xb=base+b.x;if(xb<-4||xa>W+4)continue;
      arc(xa,y0+a.y,xb,y0+b.y,bend);
      for(const d of M.domes){const dx=base+d.x;if(dx<-8||dx>W+8)continue;if(Math.random()<.5){ctx.fillStyle=WH;ctx.fillRect(dx-1,y0+d.y-1,2,2)}}}}

  /* ================= enemy art ================= */
  // ELITE FIGHTER (dart): black and red interceptor, magenta neon chase stripe, cyan engines
  const EH=[
"................kk......",
"..............kkMk......",
"............kkrRmk......",
"..........kkrRRrkk.kkk..",
".....kkkkknggLLlkkkdlck.",
"..kkkndggLLwwLlggddnkcCk",
"kkRRMMMMggllllggddnnnkCw"];
  const DK={w:'L',L:'l',l:'g',g:'d',d:'n',R:'r',M:'m',C:'c'};
  const sym=(half,dk)=>{const h=half.length;return [...half,...half.slice(0,h-1).reverse().map(r=>r.split('').map(ch=>dk[ch]||ch).join(''))]};
  const ELR=sym(EH,DK);
  const EL=[0,1,2,3].map(f=>fromRows(ELR,(ch,i)=>{
    if(ch==='M'||ch==='m')return (i+f)%4===0?WH:PM[ch];
    if(i>=21&&(ch==='C'||ch==='c'||ch==='w'))return f%2?(ch==='c'?cy:WH):(ch==='w'?CY:PM[ch]);
    return PM[ch]}));
  const ELW=EL.map(whiteOf);

  // COMBAT DRONE (ring): small armoured robot with one red eye, 2 frames
  const DR=[rows([
"......k........",
".....kRk.......",
"......k........",
"....kkkkkkk....",
"..kkLLLLLllkk..",
".kLLwLLlllggdk.",
"kLLkkkkkkgggdnk",
"kLkRRwRRkkggdnk",
"kLkrRRRrkgggdnk",
".kgkkkkkggggdk.",
"..kkggggggdnkk.",
"...kkdddddnk...",
"..kdk.k.k..kdk.",
".kd.........dk."]),rows([
"......k........",
".....kdk.......",
"......k........",
"....kkkkkkk....",
"..kkLLLLLllkk..",
".kLLwLLlllggdk.",
"kLLkkkkkkgggdnk",
"kLkRRRwRkkggdnk",
"kLkrRRRrkgggdnk",
".kgkkkkkggggdk.",
"..kkggggggdnkk.",
"...kkdddddnk...",
"...kdkk.kkdk...",
"....kd...dk...."])];
  const DRW=DR.map(whiteOf);

  // HEAVY GUNSHIP (ringR): twin cannons, armour sponsons, red warning band, neon trim, magenta engines
  function gunBase(){const w=32,h=19,c=mk(w,h),g=c.getContext('2d');
    g.drawImage(plate(w,h,(x,y)=>(x>=3&&x<=17&&((y>=1&&y<=5)||(y>=13&&y<=17))),{ramp:AD,lit:(i,j)=>.85-i/w*.4}),0,0);
    rc(g,0,2,5,3,K);rc(g,0,3,5,1,LM);rc(g,0,14,5,3,K);rc(g,0,15,5,1,GM);
    g.drawImage(plate(w,h,polyM([[7,4],[12,2],[25,2],[30,6],[30,12],[25,16],[12,16],[7,14]]),{ramp:AR,lit:(i,j)=>.86-i/w*.3-j/h*.55}),0,0);
    g.drawImage(plate(w,h,(x,y)=>x>=26&&x<=31&&y>=5&&y<=13,{ramp:AD}),0,0);
    rc(g,9,7,6,3,K);rc(g,10,7,4,1,CY);px(g,10,7,WH);rc(g,10,8,4,1,cy);
    for(let j=4;j<15;j++){px(g,19+((j>>1)&1),j,rd);px(g,21+((j>>1)&1),j,K)}
    neon(g,[[13,4],[24,4]],MG,mg);neon(g,[[13,14],[24,14]],CY,cy);
    return c}
  const GB=gunBase(),GS=[0,1,2,3].map(f=>{const c=mk(GB.width,GB.height),g=c.getContext('2d');g.drawImage(GB,0,0);
    for(let j=6;j<=12;j++)px(g,31,j,(j+f)%2?MG:WH);px(g,30,8+(f&1)*2,WH);
    px(g,13+f*3,4,WH);px(g,13+f*3,14,WH);return c});
  const GSW=GS.map(whiteOf);

  // REPAIR TENDER (pod): pale support ship, antenna array, green repair cross, cyan-green emitter
  function tender(f){const w=26,h=20,c=mk(w,h),g=c.getContext('2d');
    // antenna mast and whips
    rc(g,15,1,1,8,K);rc(g,16,2,1,7,LM);rc(g,19,4,1,5,GM);rc(g,21,5,1,4,GM);
    px(g,19,3,f%2?GR:gr);px(g,21,4,f%2?gr:CY);px(g,16,1,f<2?WH:GR);
    // dish (turns)
    const dw=[5,3,1,3][f];for(let j=0;j<5;j++){const ww=Math.max(1,Math.round(dw*(1-Math.abs(j-2)/3)));rc(g,11-ww,1+j,ww,1,j<2?LL:LM);px(g,11,1+j,K)}rc(g,11,3,4,1,GM);
    g.drawImage(plate(w,h,(x,y)=>((x+.5-13)/12.5)**2+((y+.5-13)/5.6)**2<=1||(y>=16&&y<=19&&x>=9&&x<=17),{ramp:[D,GM,LM,LL],rim:WH,lit:(i,j)=>.9-i/w*.3-(j-7)/12*.5}),0,0);
    rc(g,3,13,20,1,GR);rc(g,3,14,20,1,gr);
    rc(g,17,9,3,1,GR);rc(g,18,8,1,3,GR);rc(g,17,9,1,1,WH);
    rc(g,5,10,5,2,K);rc(g,6,10,3,1,CY);
    rc(g,0,14,3,3,K);px(g,1,15,f%2?WH:GR);px(g,0,15,f%2?CY:gr);
    for(let i=0;i<3;i++)px(g,10+i*2,18,(i+f)%3?K:GR);
    return c}
  const TD=[0,1,2,3].map(tender),TDW=TD.map(whiteOf);

  // TURRET BATTERY (cross): bunker built into the hull, separate rotating twin barrel
  function turretBase(top,f){const w=21,h=12,c=mk(w,h),g=c.getContext('2d');
    const mask=(x,y)=>{const yy=top?y:h-1-y;if(yy<=2)return true;return ((x+.5-10.5)/9)**2+((yy-2.5)/8.6)**2<=1};
    g.drawImage(plate(w,h,mask,{ramp:[D,GM,LM,LL],rim:WH,lit:(i,j)=>.9-i/w*.35-j/h*.4}),0,0);
    const ny=top?2:h-3;rc(g,0,ny,w,1,K);
    for(let i=1;i<w-1;i+=2)px(g,i,top?1:h-2,((i>>1)+f)%2?K:rd);
    if(top){neon(g,[[4,6],[10,8],[16,6]],MG,mg)}else{neon(g,[[4,5],[10,3],[16,5]],MG,mg)}
    px(g,2,top?1:h-2,f?RD:rd);px(g,w-3,top?1:h-2,f?rd:RD);
    return c}
  const TB=[[turretBase(true,0),turretBase(true,1)],[turretBase(false,0),turretBase(false,1)]];
  const TBW=TB.map(a=>a.map(whiteOf));
  const BALL=orb(3,[K,D,GM,LL]);

  // LASER GATE parts
  const EMT=rows([
"kkkkkkkkkkk",
"kLLLLLLLLgk",
"kglddddddgk",
"kkgkkkkkdkk",
"..kgllldk..",
"..kgdddgk..",
"...kgddk...",
"...k...k..."]);
  const EMB=(function(){const c=mk(EMT.width,EMT.height),g=c.getContext('2d');g.translate(0,c.height);g.scale(1,-1);g.drawImage(EMT,0,0);return c})();
  const NODE=rows(["..kkk..",".kgLgk.","kgL.Lgk",".kgdgk.","..kkk.."]);

  // DEBRIS: torn hull plates, 4 spin frames
  function shard(r,sd){const out=[];for(let f=0;f<4;f++){seed=sd;const n=ri(4,6),pts=[],S2=r*2+3,ang=f*Math.PI/4;
      for(let i=0;i<n;i++){const a=i/n*Math.PI*2+rr(-.3,.3),rad=r*rr(.6,1),ux=Math.cos(a)*rad,uy=Math.sin(a)*rad*.62;pts.push([S2/2+ux*Math.cos(ang)-uy*Math.sin(ang),S2/2+ux*Math.sin(ang)+uy*Math.cos(ang)])}
      const c=plate(S2,S2,polyM(pts),{ramp:AR,lit:(i,j)=>.85-(i+j)/S2*.45});
      const g=c.getContext('2d'),sx=Math.cos(ang)*r*.6,sy=Math.sin(ang)*r*.6;
      if(r>6)line(S2/2-sx,S2/2-sy,S2/2+sx,S2/2+sy,(x,y)=>px(g,x,y,mg));
      px(g,Math.round(pts[0][0]-.5),Math.round(pts[0][1]-.5),OR);out.push(c)}
    return out}
  const DEB_L=[shard(10,11),shard(10,23)],DEB_S=[shard(4,5),shard(5,9),shard(4,17)];

  /* ================= helpers for the entities ================= */
  function dotLine(c,x0,y0,x1,y1,step,ph,c1,c2){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;if(n<1)return;
    for(let i=0;i<=n;i++){const m=(i+ph)%step;if(m>1)continue;c.fillStyle=m?c2:c1;c.fillRect((x0+(x1-x0)*i/n)|0,(y0+(y1-y0)*i/n)|0,1,1)}}
  const sp=v=>v+(G?G.loop:0)*4;
  const room=n=>EB.length+n<=24;

  /* LASER GATE: two rock entities (top and bottom beam), timed on/off, always a gap between them */
  const GATE_OFF=1.4,GATE_WARN=1.0;
  function gateState(e){const lt=HT()-e.h0+e.off,q=((lt%e.cyc)+e.cyc)%e.cyc;
    if(q<GATE_OFF)return [0,GATE_OFF-q];if(q<GATE_OFF+GATE_WARN)return [1,q-GATE_OFF];return [2,q-GATE_OFF-GATE_WARN]}
  function gateTouch(e,px_,py){return e.st===2&&Math.abs(px_-e.x)<3+shk(9)&&Math.abs(py-e.cy)<e.len/2+shk(5)}
  const noHit=()=>0;
  function beamTouch(e,px_,py){return e.st===2&&px_<e.ox+4&&Math.abs(py-e.by)<3+shk(6)}

  const enemies={
    /* ELITE FIGHTERS */
    dart:{w:20,h:11,pts:150,vx:-112,
      init(e){e.age=0;e.dodge=0;e.dv=0;e.nd=0;e.gun=Math.random()<.5;e.shootT=rnd(.3,1.2)},
      move(e,dt,live){e.age+=dt;e.x+=e.vx*dt;
        if(e.age<.6&&live)e.y+=Math.sign(P.y-e.y)*Math.min(Math.abs(P.y-e.y),22*dt);
        if(e.dodge>0){e.dodge-=dt;e.y+=e.dv*dt}
        else if(live&&e.nd<3){for(const b of PB){if(b.x<e.x&&b.x>e.x-55&&Math.abs(b.y-e.y)<8){e.dv=(e.y>=b.y?1:-1)*75;if(e.y<TOP+22)e.dv=75;if(e.y>BOT-22)e.dv=-75;e.dodge=.22;e.nd++;break}}}
        e.y=Math.max(TOP+14,Math.min(BOT-14,e.y));e.vy=e.dodge>0?e.dv:0;
        if(live&&e.gun&&e.x<W-30&&e.x>P.x+50&&(e.shootT-=dt)<=0){e.gun=false;enemyShot(e,0)}},
      draw(c,e,fl){const t=e.t||0,f=Math.floor(t*12)%4,x=(e.x-12)|0,y=(e.y-6)|0;
        if(!fl){const n=2+(Math.floor(t*24)%3);c.fillStyle=pat(mg);c.fillRect(x+24,y+4,n+2,5);c.fillStyle=MG;c.fillRect(x+24,y+5,n,3);c.fillStyle=WH;c.fillRect(x+24,y+6,Math.max(1,n-1),1)}
        c.drawImage(fl?ELW[f]:EL[f],x,y)}},
    /* COMBAT DRONES */
    ring:{w:13,h:12,pts:90,
      init(e,o){e.vx=-(62+rnd(0,16));e.ph=o.ph!=null?o.ph:rnd(0,6);e.gun=Math.random()<.35;e.shootT=rnd(.4,2.4)},
      move(e,dt,live){e.x+=e.vx*dt;if(live){const d=P.y-e.y0;e.y0+=Math.max(-8*dt,Math.min(8*dt,d))}
        e.y=Math.max(TOP+10,Math.min(BOT-10,e.y0+Math.sin(e.t*4.2+e.ph)*11));e.vy=Math.cos(e.t*4.2+e.ph)*46;
        if(live&&e.gun&&e.x<W-30&&e.x>P.x+40&&(e.shootT-=dt)<=0){e.gun=false;enemyShot(e,0)}},
      draw(c,e,fl){const t=e.t||0,f=Math.floor(t*6)%2,x=(e.x-7)|0,y=(e.y-7)|0;
        if(!fl){c.fillStyle=Math.floor(t*20)%2?MG:WH;c.fillRect(x+15,y+7,2,2);c.fillStyle=pat(mg);c.fillRect(x+16,y+6,3,4)}
        c.drawImage(fl?DRW[f]:DR[f],x,y)}},
    /* HEAVY GUNSHIPS: flickering front shield (immune while up), paired aimed shots */
    ringR:{w:28,h:16,hp:3,pts:260,
      init(e){e.vx=-30;e.sc=rnd(0,3.4);e.shootT=rnd(1,2);e.ph=rnd(0,6)},
      move(e,dt,live){e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.t*1.6+e.ph)*9;e.vy=Math.cos(e.t*1.6+e.ph)*14;
        e.sc+=dt;const q=e.sc%3.4;e.immune=q<1.4;
        if(live&&e.x<W-30&&e.x>P.x+40&&(e.shootT-=dt)<=0&&room(2)){e.shootT=rnd(2.6,3.4);sfxEnemyLaser();
          const a=Math.atan2(P.y-e.y,P.x-(e.x-16)),s=sp(66);for(const o of [-5,5])ebShot(e.x-16,e.y+o,Math.cos(a)*s,Math.sin(a)*s)}},
      draw(c,e,fl){const t=e.t||0,f=Math.floor(t*10)%4,x=(e.x-16)|0,y=(e.y-9)|0;
        if(!fl){const n=2+Math.floor(t*20)%3;c.fillStyle=MG;c.fillRect(x+32,y+7,n,5);c.fillStyle=WH;c.fillRect(x+32,y+8,n-1,3)}
        c.drawImage(fl?GSW[f]:GS[f],x,y);
        const q=(e.sc||0)%3.4;
        if(q<1.4&&!(q>1.15&&Math.floor(t*24)%2)){const cx=e.x+2,cyy=e.y;
          for(let i=0;i<26;i++){const a=Math.PI*.62+i/25*Math.PI*.76,xx=Math.round(cx+Math.cos(a)*19),yy=Math.round(cyy+Math.sin(a)*12);
            c.fillStyle=(i+Math.floor(t*16))%6===0?WH:CY;c.fillRect(xx,yy,1,1);if((xx+yy)&1){c.fillStyle=cy;c.fillRect(xx+1,yy,1,1)}}}}},
    /* REPAIR TENDERS: heal nearby enemies with a visible beam; carry a power-up */
    pod:{w:24,h:16,pts:400,
      init(e){e.vx=-26;e.tg=[null,null];e.pick=0;e.shootT=rnd(2,3.5)},
      move(e,dt,live){e.x+=e.vx*dt;e.y=e.y0+Math.sin(e.t*1.3)*8;e.vy=Math.cos(e.t*1.3)*10;
        if(live&&e.x<W-24&&e.x>P.x+50&&(e.shootT-=dt)<=0){e.shootT=rnd(3.5,5);enemyShot(e,0)}},
      update(e,dt){if(!e.tg)return;
        e.pick-=dt;if(e.pick<=0){e.pick=.3;e.tg[0]=e.tg[1]=null;let b0=1e9,b1=1e9;
          for(const o of E){if(o===e||o.type==='rock'||o.type==='boss'||o.dead)continue;const d=Math.hypot(o.x-e.x,o.y-e.y);if(d>64)continue;
            const s=d-(o.hp<o.mhp?40:0);if(s<b0){b1=b0;e.tg[1]=e.tg[0];b0=s;e.tg[0]=o}else if(s<b1){b1=s;e.tg[1]=o}}}
        for(const o of e.tg)if(o&&!o.dead&&o.hp<o.mhp){o.hp=Math.min(o.mhp,o.hp+o.mhp*.16*dt);if(Math.random()<dt*6)FX.push({x:o.x+rnd(-5,5),y:o.y+rnd(-4,4),vx:0,vy:-18,life:.4,c:GR,s:1})}},
      draw(c,e,fl){const t=e.t||0,f=Math.floor(t*6)%4,x=(e.x-13)|0,y=(e.y-11)|0;
        if(!fl&&e.tg){const ph=Math.floor(t*24);for(const o of e.tg)if(o&&!o.dead&&o.x>-30){dotLine(c,e.x-12,e.y+4,o.x,o.y,4,ph,GR,CY);if(ph%2){c.fillStyle=pat(GR);c.fillRect((o.x-3)|0,(o.y-3)|0,7,7)}}}
        c.drawImage(fl?TDW[f]:TD[f],x,y);
        if(!fl&&e.carry){c.fillStyle=PWC[e.carry]||WH;c.fillRect(x+12,y+16,3,2)}}},
    /* TURRET BATTERIES: glued to the hull, tracking twin barrel, short bursts */
    cross:{w:17,h:9,pts:240,
      init(e,o){e.side=o.side!=null?o.side:(Math.random()<.5?0:1);e.y=e.y0=e.side?HULL_B-6:HULL_T+6;e.vy=0;e.h0=HT();e.x0=W+12;e.x=e.x0;e.vx=-SPD;
        e.shootT=rnd(.6,1.4);e.bur=0;e.ang=e.side?-Math.PI/2:Math.PI/2;e.mf=0},
      move(e,dt,live){e.x=e.x0-(HT()-e.h0)*SPD;e.vx=-SPD;
        const want=Math.atan2(P.y-e.y,P.x-e.x);let a=e.side?Math.max(-Math.PI+.2,Math.min(-.2,want>0?(want>Math.PI/2?-Math.PI+.2:-.2):want)):Math.max(.2,Math.min(Math.PI-.2,want<0?(want<-Math.PI/2?Math.PI-.2:.2):want));
        let da=a-e.ang;e.ang+=Math.max(-2.6*dt,Math.min(2.6*dt,da));if(e.mf>0)e.mf-=dt;
        // bottom guns hold fire while hidden behind the level map in the bottom right corner
        if(live&&e.x<(e.side?196:W-16)&&e.x>P.x+24&&(e.shootT-=dt)<=0){
          if(e.bur<=0){e.bur=3}
          if(room(1)){const s=sp(72),mx=e.x+Math.cos(e.ang)*11,my=e.y+(e.side?-2:2)+Math.sin(e.ang)*11;ebShot(mx,my,Math.cos(e.ang)*s,Math.sin(e.ang)*s);e.mf=.07;sfxEnemyLaser()}
          e.bur--;e.shootT=e.bur>0?.15:rnd(2.4,3.4)}},
      draw(c,e,fl){const sd=e.side?1:0,t=e.t||0,f=Math.floor(t*3)%2,x=(e.x-10)|0,y=(e.y-6)|0;
        const ang=e.ang!=null?e.ang:(sd?-Math.PI/2:Math.PI/2),bx=e.x|0,by=(e.y+(sd?-2:2))|0,ca=Math.cos(ang),sa=Math.sin(ang),nx=-sa,ny=ca;
        if(!fl){c.fillStyle=pat(mg);c.fillRect(x-2,sd?y-2:y+3,25,sd?10:11)}
        c.drawImage(fl?TBW[sd][f]:TB[sd][f],x,y);
        for(const o of [-1,1]){for(let k=2;k<=11;k++){const xx=Math.round(bx+ca*k+nx*o*1.2),yy=Math.round(by+sa*k+ny*o*1.2);c.fillStyle=fl?WH:k>9?K:(o<0?LM:D);c.fillRect(xx,yy,1,1)}}
        c.drawImage(BALL,bx-4,by-4);
        if(!fl&&e.mf>0){const mx=Math.round(bx+ca*13),my=Math.round(by+sa*13);c.fillStyle=WH;c.fillRect(mx-1,my-1,3,3);c.fillStyle=pat(RD);c.fillRect(mx-3,my-3,7,7)}}},
    /* ROCK: laser gates, the boss core laser, and drifting torn hull plates */
    rock:{
      init(e,o){
        if(o.variant==='fence'){e.variant='fence';e.part=o.part;e.gy=o.gy;e.gap=o.gap||62;e.h0=HT();e.x0=W+14;e.x=e.x0;e.vx=-SPD;e.vy=0;
          e.hp=e.mhp=1e9;e.pts=0;e.w=4;e.cyc=o.cyc||4.2;e.off=o.off||0;
          e.ya=e.part?e.gy+e.gap/2:HULL_T+5;e.yb=e.part?HULL_B-5:e.gy-e.gap/2;e.cy=(e.ya+e.yb)/2;e.len=e.yb-e.ya;e.st=0;e.sq=0;
          e.hitTest=noHit;e.touch=gateTouch;e.y=-25;e.h=2}
        else if(o.variant==='beam'){e.variant='beam';e.hp=e.mhp=1e9;e.pts=0;e.vx=0;e.vy=0;e.w=2;e.h=7;e.st=1;e.lt=0;e.ox=0;e.hitTest=noHit;e.touch=beamTouch}
        else{e.spin=rnd(4,9)*(Math.random()<.5?-1:1)}},
      move(e,dt){
        if(e.variant==='fence'){e.x=e.x0-(HT()-e.h0)*SPD;const s=gateState(e);e.st=s[0];e.sq=s[1];
          const act=e.st>0||e.sq<.7;if(act&&e.x>-20){e.y=e.cy;e.h=e.len;e.w=4}else{e.y=-25;e.h=2;e.w=2}}
        else if(e.variant==='beam'){if(!e.boss||G.boss!==e.boss||e.boss.beam!==e)e.dead=1}
        else{e.x+=e.vx*dt;e.y+=e.vy*dt}},
      draw(c,e,fl){
        if(e.variant==='fence')drawGate(c,e);
        else if(e.variant==='beam')drawBeam(c,e);
        else{const set=e.big?DEB_L:DEB_S,fr=set[(e.spr||0)%set.length],sp_=fr[(Math.floor((e.t||0)*Math.abs(e.spin||5))%4+4)%4];
          if(fl)c.globalAlpha=.5;c.drawImage(sp_,(e.x-sp_.width/2)|0,(e.y-sp_.height/2)|0);c.globalAlpha=1}}}
  };
  function drawGate(c,e){const x=e.x|0,t=e.t||0,st=e.st||0,top=!e.part;
    const lens=st===2?WH:st===1?(Math.floor(t*14)%2?MG:WH):rd;
    if(top){c.drawImage(EMT,x-5,HULL_T-2);c.fillStyle=lens;c.fillRect(x-1,HULL_T+4,3,2)}
    else{c.drawImage(EMB,x-5,HULL_B-6);c.fillStyle=lens;c.fillRect(x-1,HULL_B-6,3,2)}
    const y0=e.ya|0,y1=e.yb|0;
    if(st===1){dotLine(c,x,y0,x,y1,4,Math.floor(t*30),MG,mg);if(Math.floor(t*10)%2){c.fillStyle=pat(mg);c.fillRect(x-3,top?HULL_T+2:HULL_B-9,7,7)}}
    else if(st===2){const fl=Math.floor(t*30)%2;c.fillStyle=pat(mg);c.fillRect(x-3,y0,7,y1-y0);c.fillStyle=MG;c.fillRect(x-1,y0,3,y1-y0);c.fillStyle=fl?WH:LV;c.fillRect(x,y0,1,y1-y0);
      const gy=(y0+((t*90)%(y1-y0+1)))|0;c.fillStyle=WH;c.fillRect(x-1,gy,3,2)}
    const ny=top?y1:y0;c.drawImage(NODE,x-3,ny-2);c.fillStyle=st===2?WH:st===1?MG:(Math.floor(t*2)%2?cy:VI);c.fillRect(x,ny,1,1)}
  function drawBeam(c,e){const t=e.lt||0,y=Math.round(e.by!=null?e.by:e.y),x1=Math.round(e.ox)-2;if(x1<2)return;
    if(e.st===1){dotLine(c,0,y,x1,y,5,Math.floor((e.t||0)*40),MG,mg);
      const r=Math.max(1,Math.round(9-t*7));c.fillStyle=pat(MG);c.fillRect(x1-r,y-r,r*2+1,r*2+1);c.fillStyle=WH;c.fillRect(x1-1,y-1,3,3);
      for(let i=0;i<5;i++){const a=i*1.26+t*9,d=14*(1-((t*2+i*.2)%1));c.fillStyle=LV;c.fillRect((x1+Math.cos(a)*d)|0,(y+Math.sin(a)*d)|0,1,1)}}
    else{const w=Math.random()<.5?1:0;c.fillStyle=pat(mg);c.fillRect(0,y-4-w,x1,9+2*w);c.fillStyle=MG;c.fillRect(0,y-2,x1,5);c.fillStyle=WH;c.fillRect(0,y-1,x1,2+w);
      c.fillStyle=pat(WH);c.fillRect(x1-6,y-6,12,13);
      for(let i=0;i<6;i++){c.fillStyle=Math.random()<.5?WH:LV;c.fillRect((Math.random()*x1)|0,y+((Math.random()*12-6)|0),2,1)}}}

  /* ================= bullets ================= */
  const bullets={
    missile(c,b){const s=Math.hypot(b.vx,b.vy)||1,ux=b.vx/s,uy=b.vy/s,x=b.x,y=b.y;
      c.fillStyle=D;c.fillRect((x-ux*9)|0,(y-uy*9)|0,1,1);c.fillStyle=GM;c.fillRect((x-ux*7)|0,(y-uy*7)|0,2,1);
      c.fillStyle=Math.floor(b.t*20)%2?WH:OR;c.fillRect((x-ux*5-1)|0,(y-uy*5)|0,2,2);
      c.fillStyle=rd;c.fillRect((x-ux*3-1)|0,(y-uy*3-1)|0,3,3);c.fillStyle=RD;c.fillRect((x-ux*1.5-1)|0,(y-uy*1.5-1)|0,3,3);
      c.fillStyle=WH;c.fillRect((x-1)|0,(y-1)|0,2,2)},
    orb(c,b){const x=b.x|0,y=b.y|0,a=Math.floor(b.t*16)%2;c.fillStyle=rd;c.fillRect(x-3,y-2,6,5);c.fillRect(x-2,y-3,4,7);
      c.fillStyle=a?RD:WH;c.fillRect(x-2,y-1,4,3);c.fillRect(x-1,y-2,2,5);c.fillStyle=WH;c.fillRect(x-1,y-1,2,2)}
  };

  /* ================= THE GUARDIAN MECH ================= */
  function part(x0,y0,x1,y1){const w=x1-x0+1,h=y1-y0+1,c=mk(w,h);return {x0,y0,w,h,c,g:c.getContext('2d')}}
  function pPoly(p,P,ramp,base,o){const Q=P.map(q=>[q[0]-p.x0,q[1]-p.y0]);let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;
    for(const q of Q){bx0=Math.min(bx0,q[0]);by0=Math.min(by0,q[1]);bx1=Math.max(bx1,q[0]);by1=Math.max(by1,q[1])}
    const b=base==null?.8:base;
    p.g.drawImage(plate(p.w,p.h,polyM(Q),Object.assign({ramp,lit:(i,j)=>b-(i-bx0)/(bx1-bx0+1)*.36-(j-by0)/(by1-by0+1)*.5},o||{})),0,0)}
  function pEll(p,cx,cy_,rx,ry,ramp,base){const ax=cx-p.x0,ay=cy_-p.y0,b=base==null?.85:base;
    p.g.drawImage(plate(p.w,p.h,(x,y)=>((x+.5-ax)/rx)**2+((y+.5-ay)/ry)**2<=1,{ramp,lit:(i,j)=>b-(i-ax)/rx*.3-(j-ay)/ry*.4}),0,0)}
  function pNeon(p,pts,core,halo){neon(p.g,pts.map(q=>[q[0]-p.x0,q[1]-p.y0]),core,halo)}
  function pR(p,x,y,w,h,c){p.g.fillStyle=c;p.g.fillRect(x-p.x0,y-p.y0,w,h)}
  function pFill(p,P,c){fillPoly(p.g,P.map(q=>[q[0]-p.x0,q[1]-p.y0]),c)}
  const fin=p=>{p.wc=whiteOf(p.c);return p};
  function rack(p,x0,y0,n){pPoly(p,[[x0,y0],[x0+n*6+2,y0],[x0+n*6+2,y0+11],[x0,y0+11]],AD,.8);
    for(let i=0;i<n;i++)for(let r=0;r<2;r++){pR(p,x0+2+i*6,y0+2+r*5,4,3,K);pR(p,x0+3+i*6,y0+3+r*5,2,1,RD);pR(p,x0+3+i*6,y0+3+r*5,1,1,WH)}}

  const BP={};
  // rear arm
  BP.rArm=(()=>{const p=part(20,-34,50,32);
    pPoly(p,[[24,-30],[37,-31],[41,-4],[29,-4]],AD,.7);pEll(p,35,-4,5,5,FR,.9);
    pPoly(p,[[27,-6],[45,-7],[47,16],[41,25],[30,23],[26,12]],AD,.78);
    pPoly(p,[[29,22],[35,23],[33,31],[29,29]],FR,.9);pPoly(p,[[38,24],[44,22],[45,30],[40,30]],FR,.9);
    pNeon(p,[[44,-3],[45,14]],cy,VI);return fin(p)})();
  BP.rArmX=(()=>{const p=part(20,-34,50,32);
    pPoly(p,[[30,-30],[35,-30],[38,-4],[33,-4]],FR,.9);pEll(p,35,-4,5,5,FR,.9);pPoly(p,[[32,-6],[40,-6],[41,20],[35,22]],FR,.85);
    pPoly(p,[[29,22],[35,23],[33,31],[29,29]],FR,.9);pPoly(p,[[38,24],[44,22],[45,30],[40,30]],FR,.9);
    line(37-20,-28+34,39-20,-6+34,(x,y)=>px(p.g,x,y,rd));line(39-20,-6+34,38-20,18+34,(x,y)=>px(p.g,x,y,rd));return fin(p)})();
  // rear shoulder
  BP.rSh=(()=>{const p=part(12,-62,52,-20);
    pPoly(p,[[34,-48],[48,-60],[51,-56],[42,-42]],AD,.8);pEll(p,32,-37,16,12,AR,.9);
    pPoly(p,[[17,-33],[47,-33],[45,-26],[20,-25]],AR,.62);pNeon(p,[[20,-30],[44,-30]],MG,mg);
    for(const q of [[22,-44],[30,-47],[38,-45]])pR(p,q[0],q[1],1,1,LL);return fin(p)})();
  BP.rShX=(()=>{const p=part(12,-62,52,-20);
    pEll(p,30,-32,7,7,FR,.9);pPoly(p,[[26,-40],[30,-40],[30,-28],[26,-28]],FR,.8);rack(p,18,-53,4);return fin(p)})();
  // hip skirt and thrusters
  BP.skirt=(()=>{const p=part(-30,12,32,47);
    pPoly(p,[[-24,16],[24,16],[30,32],[16,40],[-12,40],[-27,32]],AR,.72);
    pR(p,-8,17,1,22,K);pR(p,-7,17,1,22,GM);pR(p,6,17,1,22,K);pR(p,7,17,1,22,GM);
    pNeon(p,[[-24,31],[-12,38],[16,38],[28,31]],CY,cy);
    pEll(p,-10,43,4,3,FR,.9);pEll(p,10,43,4,3,FR,.9);return fin(p)})();
  BP.skirtX=(()=>{const p=part(-30,12,32,47);
    pPoly(p,[[-14,16],[12,16],[10,30],[-12,30]],FR,.85);pPoly(p,[[-12,29],[-8,29],[-8,40],[-12,40]],FR,.8);pPoly(p,[[8,29],[12,29],[12,40],[8,40]],FR,.8);
    pEll(p,-10,43,4,3,FR,.9);pEll(p,10,43,4,3,FR,.9);pR(p,-3,22,6,1,RD);return fin(p)})();
  // endoskeleton torso (always under the chest plates)
  BP.torso=(()=>{const p=part(-32,-42,30,22);
    pPoly(p,[[-7,-40],[7,-40],[8,20],[-8,20]],FR,.85);
    for(const y of [-33,-23,-3,7])pPoly(p,[[-26,y],[24,y-1],[24,y+3],[-26,y+4]],FR,.8);
    pEll(p,-4,-13,12,12,FR,.95);pEll(p,-4,-13,9,9,[K,K,NV,NV],.5);
    for(const q of [[-24,-31],[22,-24],[-24,-1],[22,9]])pR(p,q[0],q[1],1,1,RD);return fin(p)})();
  // chest plate closed / opened
  BP.chest=(()=>{const p=part(-32,-42,30,18);
    pPoly(p,[[-28,-34],[-4,-39],[24,-36],[28,-16],[18,8],[-4,16],[-22,8],[-30,-12]],AR,.86);
    pPoly(p,[[-20,-28],[-4,-31],[18,-29],[20,-16],[12,2],[-4,8],[-16,2],[-22,-14]],AR,.64);
    pNeon(p,[[-22,-31],[-4,-6],[16,-31]],MG,mg);
    for(const y of [-17,-14,-11])pR(p,-9,y,9,1,K);
    for(const q of [[-26,-30],[22,-32],[-24,-6],[20,-8]])pR(p,q[0],q[1],1,1,LL);return fin(p)})();
  BP.chestO=(()=>{const p=part(-32,-46,30,22);
    pPoly(p,[[-28,-38],[-4,-43],[24,-40],[26,-29],[-29,-29]],AR,.86);
    pPoly(p,[[-30,-1],[27,-1],[18,12],[-4,20],[-22,12]],AR,.7);
    pPoly(p,[[-32,-28],[-27,-28],[-27,-2],[-32,-2]],AD,.8);pPoly(p,[[24,-28],[29,-28],[28,-2],[24,-2]],AD,.7);
    pNeon(p,[[-26,-31],[23,-31]],MG,mg);pNeon(p,[[-27,1],[24,1]],MG,mg);return fin(p)})();
  // head
  function headPart(cracked){const p=part(-28,-73,24,-32);
    pPoly(p,[[-2,-60],[16,-71],[21,-68],[10,-55]],AD,.85);
    pPoly(p,[[-23,-50],[-18,-59],[-6,-64],[6,-61],[10,-52],[8,-40],[-4,-35],[-18,-40]],AR,.9);
    pPoly(p,[[-21,-45],[-8,-41],[-6,-36],[-17,-38]],AD,.65);
    pFill(p,[[-24,-53],[-6,-54],[-5,-48],[-22,-47]],K);
    pNeon(p,[[0,-60],[16,-69]],CY,cy);pNeon(p,[[-19,-57],[-6,-61],[4,-59]],MG,mg);
    if(cracked){pEll(p,-12,-59,6,4,FR,.6);pR(p,-13,-59,2,2,RD);pR(p,-13,-59,1,1,WH);
      line(-6+28,-58+73,2+28,-48+73,(x,y)=>px(p.g,x,y,K));line(2+28,-48+73,0+28,-40+73,(x,y)=>px(p.g,x,y,K));line(-18+28,-56+73,-22+28,-50+73,(x,y)=>px(p.g,x,y,K))}
    return fin(p)}
  BP.head=headPart(false);BP.headX=headPart(true);
  // front shoulder
  BP.fSh=(()=>{const p=part(-58,-56,-8,-10);
    pPoly(p,[[-54,-26],[-50,-40],[-38,-49],[-22,-49],[-11,-40],[-11,-24],[-22,-13],[-46,-15]],AR,.92);
    pPoly(p,[[-52,-32],[-12,-32],[-12,-27],[-53,-27]],AR,.72);
    pPoly(p,[[-54,-24],[-12,-24],[-14,-18],[-22,-12],[-46,-14]],AR,.6);
    pPoly(p,[[-31,-49],[-27,-55],[-22,-49]],AD,.8);
    pNeon(p,[[-51,-21],[-15,-21]],MG,mg);pNeon(p,[[-48,-38],[-38,-46],[-24,-46]],CY,cy);
    for(const q of [[-46,-35],[-36,-42],[-20,-38],[-16,-30]])pR(p,q[0],q[1],1,1,LL);return fin(p)})();
  BP.fShX=(()=>{const p=part(-58,-56,-8,-10);
    pEll(p,-32,-28,8,8,FR,.9);pPoly(p,[[-36,-37],[-30,-37],[-30,-22],[-36,-22]],FR,.8);rack(p,-54,-50,4);return fin(p)})();
  // shoulder cannon (stays in every phase)
  BP.sCan=(()=>{const p=part(-77,-62,-28,-42);
    pPoly(p,[[-48,-60],[-32,-60],[-29,-46],[-46,-44]],AR,.86);
    pPoly(p,[[-75,-58],[-47,-58],[-47,-54],[-75,-54]],ST,.95);pPoly(p,[[-75,-52],[-47,-52],[-47,-48],[-75,-48]],ST,.9);
    pPoly(p,[[-77,-59],[-71,-59],[-71,-53],[-77,-53]],AD,.8);pPoly(p,[[-77,-53],[-71,-53],[-71,-47],[-77,-47]],AD,.7);
    pNeon(p,[[-45,-49],[-33,-51]],CY,cy);pR(p,-40,-57,4,1,rd);return fin(p)})();
  // front arm with the big arm cannon
  BP.fArm=(()=>{const p=part(-78,-26,-14,18);
    pPoly(p,[[-42,-24],[-28,-24],[-26,-2],[-39,-2]],AD,.78);
    pPoly(p,[[-22,-6],[-46,-9],[-58,-5],[-75,-3],[-75,9],[-58,11],[-46,15],[-22,13]],AR,.9);
    pPoly(p,[[-46,-9],[-24,-7],[-24,0],[-46,-1]],AR,.72);
    pR(p,-76,0,2,6,K);pNeon(p,[[-70,4],[-30,4]],CY,cy);pNeon(p,[[-72,-1],[-58,-3],[-47,-6]],MG,mg);
    for(const xx of [-40,-36,-32])pR(p,xx,7,1,5,K);for(const xx of [-66,-58,-50])pR(p,xx,9,2,1,rd);return fin(p)})();
  BP.fArmX=(()=>{const p=part(-78,-26,-14,18);
    pPoly(p,[[-40,-22],[-32,-22],[-30,-2],[-37,-2]],FR,.85);
    pPoly(p,[[-75,0],[-30,0],[-30,7],[-75,7]],ST,.85);pEll(p,-30,3,6,6,FR,.9);pR(p,-76,1,2,5,K);
    line(-30+78,-1+26,-52+78,-5+26,(x,y)=>px(p.g,x,y,rd));line(-52+78,-5+26,-60+78,0+26,(x,y)=>px(p.g,x,y,rd));
    for(const xx of [-60,-50,-40])pR(p,xx,7,3,1,D);return fin(p)})();
  const CORE=[orb(6,[mg,MG,LV,WH]),orb(7,[mg,MG,LV,WH])],CORE_O=[orb(8,[rd,MG,LV,WH]),orb(9,[MG,LV,WH,WH])];

  function bPhase(b){const f=b.hp/b.mhp;return f>.75?1:f>.5?2:f>.25?3:4}
  const BOX=[[-77,-62,-10,16],[-28,-72,22,-34],[-32,-42,30,20],[14,-60,50,30],[-28,14,30,46]];
  function bHit(b,x,y){const lx=x-b.x,ly=y-b.y-(b.bob||0);
    for(const q of BOX)if(lx>=q[0]&&lx<=q[2]&&ly>=q[1]&&ly<=q[3]){if(bPhase(b)>=3&&Math.hypot(lx+4,ly+13)<10)return 1.6;return 1}return 0}
  function bTouch(b,px_,py){const lx=px_-b.x,ly=py-b.y-(b.bob||0),mx=shk(12),my=shk(6);
    for(const q of BOX)if(lx>=q[0]-mx&&lx<=q[2]+mx&&ly>=q[1]-my&&ly<=q[3]+my)return true;return false}
  function chunks(x,y,n){for(let i=0;i<n;i++)FX.push({x:x+rnd(-8,8),y:y+rnd(-6,6),vx:rnd(-50,30),vy:rnd(-40,30),life:1.4,l0:1.4,c:i%3?GM:(i%2?LL:D),s:i%4?3:4})}
  function shed(b,p){
    if(p===2){boom(b.x-34,b.y-30,22,true);boom(b.x+32,b.y-38,14,false);chunks(b.x-34,b.y-30,10);chunks(b.x+32,b.y-36,8);b.cd.mis=1.2}
    else if(p===3){boom(b.x-4,b.y-13,24,true);chunks(b.x-4,b.y-30,8);chunks(b.x-4,b.y+6,8);b.cd.las=2;b.cd.sum=0}
    else if(p===4){boom(b.x-12,b.y-56,18,true);boom(b.x-50,b.y+2,18,true);boom(b.x,b.y+30,14,false);chunks(b.x-50,b.y,10);chunks(b.x,b.y+28,8);chunks(b.x-12,b.y-56,6);G.flashT=Math.max(G.flashT||0,.12);b.cd.spr=1;b.cd.las=4}
    shake=Math.max(shake,.45)}
  function summon(n,cy0){for(let i=0;i<n;i++){const k=Math.ceil(i/2),s=i%2?-1:1;const e=spawn({type:'dart',y:Math.max(40,Math.min(160,cy0+s*k*12))});e.x=W+12+k*14}}
  function laserStep(b,dt,ph){
    b.lt+=dt;
    if(b.las===1){if(Math.abs(b.y-b.ty)<3||b.lt>1.4){b.las=2;b.lt=0;b.beam=spawn({type:'rock',y:100,variant:'beam'});b.beam.boss=b}}
    else if(b.las===2){if(b.lt>=1.1){b.las=3;b.lt=0;shake=Math.max(shake,.25);sfxBoom(10,true)}}
    else if(b.las===3){const k=Math.min(1,b.lt/1.9);b.ty=b.ly0+(b.ly1-b.ly0)*k+13;
      if(b.lt>=1.9){b.las=0;if(b.beam)b.beam.dead=1;b.beam=null;b.cd.las=ph>=4?8.5:10}}
    if(b.beam){const e=b.beam,ox=b.x-8,by=b.y+(b.bob||0)-13;e.ox=ox;e.x=ox/2;e.w=ox;e.by=by;e.st=b.las===3?2:1;e.lt=b.lt;e.vy=0;
      // the avoid box covers the rest of the sweep, so the autopilot knows where the beam is going
      const ya=e.st===2?by:b.ly0,y0=Math.min(ya,b.ly1)-4,y1=Math.max(ya,b.ly1)+4;e.y=(y0+y1)/2;e.h=y1-y0}}
  function fan(x,y,n,spread,s,sty){const a0=Math.atan2(P.y-y,P.x-x);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*spread;ebShot(x,y,Math.cos(a)*s,Math.sin(a)*s,sty?{sty}:undefined)}sfxEnemyLaser()}

  const boss={w:112,h:112,hp:1,
    init(b){b.x=W+80;b.y=104;b.in=true;b.hx=246;b.bob=0;b.ph=1;b.cd={can:2.2,ring:4,mis:2.5,las:5,spr:2,sum:0,arm:1.3};
      b.bur=0;b.burT=0;b.las=0;b.lt=0;b.beam=null;b.mfS=0;b.mfA=0;b.ty=104;b.vyR=0;b.sprOn=0;b.sprT=0;b.rack=0;
      b.hitTest=bHit;b.touch=bTouch},
    update(b,dt,live){
      const ph=bPhase(b),t=b.t||0;
      bossWear(b,live,-10,-8,46,46);
      if(live&&ph>b.ph){for(let p=b.ph+1;p<=ph;p++)shed(b,p);b.ph=ph}
      b.bob=Math.round(Math.sin(t*1.4)*2);
      if(b.mfS>0)b.mfS-=dt;if(b.mfA>0)b.mfA-=dt;
      if(b.in){b.x-=70*dt;b.y+=(104-b.y)*Math.min(1,dt*2);if(b.x<=b.hx){b.x=b.hx;b.in=false}return}
      const hx=ph>=4?b.hx-10+Math.sin(t*.9)*12:b.hx+Math.sin(t*.45)*7;
      if(b.las===0)b.ty=104+Math.sin(t*.55)*(ph>=4?24:16);
      const py=b.y;b.y+=(b.ty-b.y)*Math.min(1,dt*(b.las?2.6:1.6));b.x+=(hx-b.x)*Math.min(1,dt*2);b.vyR=dt>0?(b.y-py)/dt:0;b.vy=b.vyR;
      if(b.las)laserStep(b,dt,ph);
      if(!live)return;
      const c=b.cd;c.can-=dt;c.ring-=dt;c.mis-=dt;c.las-=dt;c.sum-=dt;c.spr-=dt;c.arm-=dt;
      const X=b.x,Y=b.y+b.bob,busy=b.las>=2;
      // shoulder cannon bursts (phases 1, 2, 4)
      if(b.bur>0){b.burT-=dt;if(b.burT<=0){b.burT=ph>=4?.11:.15;b.bur--;if(room(1)){const top=b.bur%2===0;ebAim(X-78,Y-(top?56:50),sp(80),rnd(-.04,.04));b.mfS=.08;sfxEnemyLaser()}}}
      else if(ph!==3&&c.can<=0){c.can=ph===1?2.3:ph===2?2.5:1.8;b.bur=ph>=4?4:3;b.burT=0}
      // arm cannon spread (phases 3, 4)
      if(ph>=3&&c.arm<=0&&room(3)){c.arm=ph===3?2.6:2.9;fan(X-77,Y+3,3,.22,sp(74));b.mfA=.1}
      // slow arcs from the chest (phases 1, 2)
      if(ph<=2&&c.ring<=0){c.ring=ph===1?4.6:6;const n=ph===1?9:7;if(room(n)){for(let i=0;i<n;i++){const a=Math.PI+(i-(n-1)/2)*.3;ebShot(X-10,Y-13,Math.cos(a)*sp(42),Math.sin(a)*sp(42))}sfxEnemyLaser()}}
      // missile fans from the shoulder racks (phases 2 to 4)
      // an even count leaves a gap right where the ship is: it reads as homing but stays dodgeable
      if(ph>=2&&c.mis<=0&&!busy){const n=ph>=4?6:4;if(room(n)){c.mis=ph===2?3.6:ph===3?4.4:3.6;b.rack^=1;const rx=b.rack?X-38:X+31,ry=Y-(b.rack?47:50);fan(rx,ry,n,.3,sp(66),'missile');FX.push({ring:1,x:rx,y:ry,r:2,life:.3,max:10,col:OR})}else c.mis=.5}
      // core laser sweep (phases 3, 4)
      if(ph>=3&&b.las===0&&c.las<=0){b.las=1;b.lt=0;const low=P.y>=104;b.ly0=low?142:62;b.ly1=100;b.ty=b.ly0+13}
      // elite fighter escorts
      if(ph>=3&&c.sum<=0){c.sum=ph===3?11:14;let n=0;for(const e of E)if(e.type==='dart')n++;if(n<6)summon(ph===3?3:2,rnd(50,150))}
      // overcharged core sprinkler (phase 4)
      if(ph>=4){if(b.sprOn>0){b.sprOn-=dt;b.sprT-=dt;if(b.sprT<=0&&!busy&&room(1)){b.sprT=.19;const a=Math.PI+Math.sin(t*2.6)*1.05;ebShot(X-6,Y-13,Math.cos(a)*sp(60),Math.sin(a)*sp(60),{sty:'orb'})}}
        else if(c.spr<=0){b.sprOn=2.2;c.spr=4.6}}
    },
    draw(c,b,fl){
      const ph=bPhase(b),t=b.t||0,X=Math.round(b.x),Y=Math.round(b.y)+(b.bob||0);
      const hb=Math.round(Math.sin(t*1.4+.6)),ab=Math.round(Math.sin(t*1.4+1.2)*1.5),rb=Math.round(Math.sin(t*1.4+2));
      const dp=(p,dx,dy)=>c.drawImage(fl?p.wc:p.c,X+p.x0+dx,Y+p.y0+dy);
      dp(ph>=4?BP.rArmX:BP.rArm,0,rb);
      dp(ph>=2?BP.rShX:BP.rSh,0,0);
      dp(ph>=4?BP.skirtX:BP.skirt,0,0);
      if(!fl){for(const nx of [-10,10]){const n=9+((Math.random()*(ph>=4?9:6))|0);c.fillStyle=pat(mg);c.fillRect(X+nx-4,Y+45,9,n);for(let k=0;k<n;k++){const wd=k<n*.4?5:k<n*.75?3:1;c.fillStyle=k<3?WH:k<n*.5?MG:k<n*.8?mg:PU;c.fillRect(X+nx-(wd>>1),Y+45+k,wd,1)}c.fillStyle=WH;c.fillRect(X+nx,Y+45,1,(n*.5)|0)}}
      dp(BP.torso,0,0);
      if(ph>=3){const pu=Math.floor(t*8)%2,cs=ph>=4?CORE_O[pu]:CORE[pu];c.drawImage(fl?whiteCore(cs):cs,X-4-(cs.width>>1),Y-13-(cs.height>>1));
        if(!fl&&ph>=4)for(let i=0;i<4;i++){const a=Math.random()*6.283,d=9+Math.random()*5;c.fillStyle=Math.random()<.5?WH:LV;c.fillRect((X-4+Math.cos(a)*d)|0,(Y-13+Math.sin(a)*d)|0,1,1)}}
      if(ph<=2)dp(BP.chest,0,0);else if(ph===3)dp(BP.chestO,0,0);
      if(!fl&&ph<=2&&Math.floor(t*5)%2){c.fillStyle=MG;c.fillRect(X-8,Y-16,7,1);c.fillRect(X-8,Y-13,7,1);c.fillRect(X-8,Y-10,7,1)}
      dp(ph>=4?BP.headX:BP.head,0,hb);
      if(!fl){const vx=X-22,vy=Y-52+hb,sc=Math.floor(t*22)%16;
        c.fillStyle=ph>=4?rd:cy;c.fillRect(vx,vy,16,3);c.fillStyle=ph>=4?RD:CY;c.fillRect(vx,vy+1,16,1);c.fillStyle=WH;c.fillRect(vx+sc,vy,2,3);
        c.fillStyle=pat(ph>=4?RD:CY);c.fillRect(vx-2,vy-1,4,5)}
      dp(ph>=2?BP.fShX:BP.fSh,0,0);
      dp(BP.sCan,0,0);
      dp(ph>=4?BP.fArmX:BP.fArm,0,ab);
      if(!fl){
        if(b.mfS>0){for(const my of [-56,-50]){c.fillStyle=pat(RD);c.fillRect(X-84,Y+my-3,7,7);c.fillStyle=WH;c.fillRect(X-82,Y+my-1,4,3)}}
        if(b.mfA>0){c.fillStyle=pat(CY);c.fillRect(X-86,Y+ab-1,9,9);c.fillStyle=WH;c.fillRect(X-83,Y+ab+1,4,5)}
        if(ph>=4)for(let i=0;i<3;i++){const q=[[-32,-30],[30,-34],[-30,3],[0,30],[-12,-56]][(Math.random()*5)|0];c.fillStyle=Math.random()<.5?YL:WH;c.fillRect(X+q[0]+((Math.random()*8-4)|0),Y+q[1]+((Math.random()*8-4)|0),1,1)}
        if(ph>=2&&ph<4&&Math.random()<.3){c.fillStyle=YL;c.fillRect(X-32+((Math.random()*10-5)|0),Y-30+((Math.random()*8-4)|0),1,1)}
      }}
  };
  const WCORE=new Map();
  function whiteCore(cs){let w=WCORE.get(cs);if(!w){w=whiteOf(cs);WCORE.set(cs,w)}return w}

  return {
    noFG:true,
    tick(dt){clk();if(G.boss||G.state==='clear')S.ex+=dt},
    drawBackground(t){
      const T=t+(S.G===G?S.ex:0);
      tileDraw(STAR,320,T*2,0);
      const mx=Math.floor(((300-T*1.6)%760+760)%760)-240;
      if(mx>-MSW&&mx<W){ctx.drawImage(MS,mx,6);const pu=Math.floor(T*2)%2;ctx.fillStyle=pu?MG:mg;ctx.fillRect(mx+MCX-2,6+MCY-1,4,2);ctx.fillStyle=pat(mg);ctx.fillRect(mx+MCX-5,6+MCY-3,10,6)}
      for(const q of TRAF){const x=W+20-((T*q.v+q.p)%(W+60));ctx.fillStyle=q.c;ctx.fillRect(x|0,q.y,2,1);ctx.fillStyle=VI;ctx.fillRect((x+2)|0,q.y,4,1)}
      tileDraw(FAR_T,400,T*9,0);tileDraw(FAR_B,400,T*9,108);
      tileDraw(MID_T.c,360,T*30,0);tileDraw(MID_B.c,360,T*30,146);
      drawLights(MID_T.lights,360,T*30,0,T);drawLights(MID_B.lights,360,T*30,146,T);
      drawArcs(MID_T,T*30,0,5);drawArcs(MID_B,T*30,146,-5);
      tileDraw(NEAR_T.c,480,T*SPD,0);tileDraw(NEAR_B.c,480,T*SPD,170);
      drawLights(NEAR_T.L,480,T*SPD,0,T);drawLights(NEAR_B.L,480,T*SPD,170,T);
    },
    drawForeground(t){const T=t+(S.G===G?S.ex:0);
      for(let k=0;k<2;k++){const x=W+40-((T*150+k*760)%1500);if(x<-30||x>W)continue;ctx.drawImage(STR[k],x|0,k?172:-4)}},
    enemies,bullets,boss
  };
},
script(sc,h){
  const lv=h.level;sc.length=0;
  const put=(t,type,y,o)=>sc.push(Object.assign({t,type,y},o||{}));
  const cl=y=>Math.max(38,Math.min(162,y));
  const swarm=(t,n,cy0,sp)=>{for(let i=0;i<n;i++)put(t+i*.16,'ring',cl(cy0+(Math.random()*2-1)*(sp||22)),{ph:i*.9})};
  const vee=(t,cy0,n)=>{for(let i=0;i<n;i++){const k=Math.ceil(i/2),s=i%2?-1:1;put(t+k*.13,'dart',cl(cy0+s*k*11))}};
  const gate=(t,gy,off,gap)=>{put(t,'rock',0,{variant:'fence',part:0,gy,off:off||0,gap:gap||62});put(t,'rock',0,{variant:'fence',part:1,gy,off:off||0,gap:gap||62})};
  const tur=(t,side)=>put(t,'cross',side?150:50,{side});
  const gun=(t,y)=>put(t,'ringR',y);
  const tend=(t,y)=>put(t,'pod',y);
  const deb=(t,n)=>{for(let i=0;i<n;i++)put(t+i*.7,'rock',100)};
  swarm(2,6,100);
  tur(5,0);tur(6.2,1);
  vee(8.5,70,5);
  swarm(11.5,5,140);
  gate(13,100,0);
  gun(17,65);gun(17.6,135);tend(18.6,100);
  vee(22.5,130,5);
  gate(24.5,70,0);gate(27.5,128,.6);tur(26,0);
  swarm(30.5,6,95);deb(31,3);
  gun(34,100);gun(34.6,55);gun(35.2,145);tend(36.6,100);
  vee(40.5,60,5);vee(41.5,140,5);
  tur(44,0);tur(45,0);tur(46,0);gate(47.5,85,1);
  swarm(50.5,7,100);
  tur(53,0);gun(53,120);tend(54.5,78);
  gate(58,110,0);swarm(59.5,5,90);gate(61.5,62,.3);tur(63,0);gate(65,124,.6);
  vee(68.5,100,7);
  gun(70,60);gun(70.6,140);tend(71.8,100);swarm(72.8,5,100);
  tur(75.5,0);tur(76.5,1);deb(77,3);
  vee(78.5,70,5);vee(79.5,130,5);
  swarm(81.5,6,100);
  if(lv>=2){swarm(15.5,5,60);vee(37.5,100,5);gate(38,118,.4);swarm(66,5,140);tend(56,140);tur(32,1);gun(64,100)}
  if(lv>=3){gun(27,100);vee(57,100,5);swarm(45.5,6,60);tur(19,1);tur(70,0);gate(82,90,.2);swarm(24,5,40)}
}
};
Object.assign(PLANETS[5],{d:'STATION HULL, LASER GATES, TURRETS. ELITES, GUNSHIPS, TENDERS.',every:7,waves:[['ring',5,.2],['dart',3,.15],['ringR',1,0]]});
})();
