/* THE DEEP BEYOND, stages 1 to 3 (planets 20 to 22), for the luxury big ships: 20 THE CRYSTAL CHOIR, 21 THE CLOCKWORK ABYSS, 22 THE VOID GARDEN.
   Also adds the shared bullet patterns (BOSS.gapring, sweep, shardstorm, seeds, tickring, corners, arcs) and the shared sprite helpers used by packs/bigthemes4.js. Needs packs/big.js. */
(function(){
'use strict';
const B=window.BIGKIT,{px,cnv,mod,clamp,rng,ell,poly,thick,line,rampAt,darken,K,NV,VI,BL,PU,LP,LV,mg,MG,rd,BR,TN,OR,YG,YL,GR,GD,LG,PG,cy,CY,D,GM,LM,LL,WH,RD}=B;
const TAU=Math.PI*2,PI=Math.PI,KIT=B.KIT,BOSS=B.BOSS,muz=B.muz;
function waves(h,rows){const L=h.level;for(const r of rows)h.add(r[0],r[1],r[2]+(L-1)*(r[7]||1),r[3],r[4],r[5],r[6])}
const dk=p=>p.slice(0,p.length-1);
const wrapA=a=>mod(a+PI,TAU)-PI;
/* a hexagonal crystal spire: base at x,y, pointing along ang */
function prism(g,x,y,len,wid,ang,pal){
  const ca=Math.cos(ang),sa=Math.sin(ang),nx=-sa*wid/2,ny=ca*wid/2,P_=(d,s)=>[x+ca*d+nx*s,y+sa*d+ny*s];
  const bl=P_(0,1),br=P_(0,-1),sl=P_(len*.72,1),sr=P_(len*.72,-1),tp=P_(len,0),bc=P_(0,0),sc=P_(len*.72,0);
  poly(g,[bl,sl,tp,sc,bc],pal);poly(g,[br,sr,tp,sc,bc],dk(pal));
  line(g,pal[pal.length-1],bc[0],bc[1],tp[0],tp[1]);px(g,WH,tp[0],tp[1]);
}
/* a floating rock with spires growing out of it */
function island(r,seed,pal,pal2,rock){const q=rng(seed);return cnv(r*3,r*3,g=>{const c=r*1.5,pts=[];
  for(let i=0;i<9;i++){const a=i/9*TAU,rr=r*(.4+q()*.2);pts.push([c+Math.cos(a)*rr,c+Math.sin(a)*rr*.8])}poly(g,pts,rock||ROCKC);
  for(let i=0;i<7;i++){const a=i/7*TAU+q()*.6;prism(g,c+Math.cos(a)*r*.15,c+Math.sin(a)*r*.15,r*(.7+q()*.7),r*(.2+q()*.1),a,i%3===2?pal2:pal)}})}
/* rotating hazard rocks: fn(g,size,ang) draws one frame */
function rockSet(fn,R,r){
  const mkset=size=>{const a=[],wh=[];for(let i=0;i<16;i++){const c=B.fin(cnv(size,size,g=>fn(g,size,i/16*TAU)));a.push(c);wh.push(whiteOf(c))}return[a,wh]};
  const [bg,bgw]=mkset(R),[sm,smw]=mkset(r);
  return{init(e){e.spin=rnd(-1.4,1.4);if(Math.abs(e.spin)<.4)e.spin=.6},
    draw(c,e,fl){const big=!!e.big,k=mod(Math.floor((e.t*(e.spin||1)+(e.spr||0))*2.5),16),im=(fl?(big?bgw:smw):(big?bg:sm))[k];c.drawImage(im,(e.x-im.width/2)|0,(e.y-im.height/2)|0)}}}
/* recolour the black outline of a sprite to a bright rim so it stands out of a dark backdrop */
function rimify(c,col){const w=c.width,h=c.height,o=cnv(w,h,g=>g.drawImage(c,0,0)),g=o.getContext('2d'),d=g.getImageData(0,0,w,h),a=d.data,op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&a[(y*w+x)*4+3]>40;
  const hex=parseInt(col.slice(1),16),R=hex>>16,G_=(hex>>8)&255,B_=hex&255;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(a[i+3]>40&&a[i]<8&&a[i+1]<8&&a[i+2]<8&&(!op(x-1,y)||!op(x+1,y)||!op(x,y-1)||!op(x,y+1))){a[i]=R;a[i+1]=G_;a[i+2]=B_}}
  g.putImageData(d,0,0);return o}
/* a wrapper that adds a foreground and midground hook to the shared pack builder */
function mkPack3(T){
  const base=B.mkPack(T);
  return{script:base.script,init(){const A=base.init(),f0=A.drawForeground,m0=A.drawMidground;
    if(T.rim)for(const k of ['ring','ringR','dart','cross','pod']){const sk=A.enemies[k];if(sk&&sk.frames){sk.frames=sk.frames.map(f=>rimify(f,T.rim));sk.white=sk.frames.map(whiteOf)}}
    if(T.fg)A.drawForeground=t=>{f0(t);T.fg(t)};
    if(T.mid)A.drawMidground=t=>{m0(t);T.mid(t)};
    if(T.wrap)T.wrap(A);return A}};
}
/* a timed warning line of text at the top of the play area */
function warnText(msg,t){if(blinkAt(t,3))text(msg,160-msg.length*2,TOP+3,'#ffffaa',1)}
B.H={rimify,waves,dk,wrapA,prism,island,rockSet,mkPack3,warnText};

/* ---------- shared boss attacks ---------- */
/* a ring with a hole in it, not in line with the ship, so the ship has to move into the hole */
BOSS.gapring=(b,o)=>{const m=muz(b,o.m),a0=Math.atan2(P.y-m[1],P.x-m[0]),hole=a0+(Math.random()<.5?1:-1)*(o.off||.8),n=o.n;
  for(let i=0;i<n;i++){const a=hole+(i+.5)/n*TAU;if(Math.abs(wrapA(a-hole))<(o.gap||.42))continue;ebShot(m[0],m[1],Math.cos(a)*o.sp,Math.sin(a)*o.sp,{sty:o.s})}};
/* a line of shots that swings round like a hand */
BOSS.sweep=(b,o)=>{const m0=muz(b,o.m),arc=o.arc||2,d=o.dir||(Math.random()<.5?1:-1),a0=o.a0!=null?o.a0:Math.atan2(P.y-m0[1],P.x-m0[0])-arc/2*d,cnt=o.cnt||20;
  b.bursts.push({n:cnt,t:0,gap:o.gap||.08,fn:k=>{const m=muz(b,o.m),a=a0+(k/cnt)*arc*d;ebShot(m[0],m[1],Math.cos(a)*o.sp,Math.sin(a)*o.sp,{sty:o.s});if(o.mirror)ebShot(m[0],m[1],Math.cos(a+PI)*o.sp,Math.sin(a+PI)*o.sp,{sty:o.s})}})};
/* shots falling at a slant from the top right, the way the backdrop moves */
BOSS.shardstorm=(b,o)=>{for(let i=0;i<o.n;i++)ebShot(rnd(110,W+60),TOP+1,-o.sp*.6,o.sp*.8,{sty:o.s,life:4.5})};
/* lobbed seeds that arc and fall */
BOSS.seeds=(b,o)=>{const m=muz(b,o.m);for(let i=0;i<o.n;i++)ebShot(m[0],m[1],-rnd(25,70),-rnd(30,80),{sty:o.s,ay:o.ay||70,life:4.5})};
/* rings that follow each other, each turned half a step */
BOSS.tickring=(b,o)=>{b.bursts.push({n:o.cnt||3,t:0,gap:o.gap||.28,fn:k=>{const m=muz(b,o.m);ebRing(m[0],m[1],o.n,o.sp,(k%2)*PI/o.n,{sty:o.s})}})};
/* aimed fans from the two right corners of the screen */
BOSS.corners=(b,o)=>{for(const y of [TOP+6,BOT-6])ebFan(W-4,y,o.n,o.sd||.5,o.sp,Math.atan2(P.y-y,P.x-(W-4)),{sty:o.s})};
/* shots that leave straight and curve back */
BOSS.arcs=(b,o)=>{const m=muz(b,o.m);for(let i=0;i<o.n;i++){const vy=(i/(o.n-1)-.5)*(o.sd||1)*o.sp;ebShot(m[0],m[1],-o.sp,vy,{sty:o.s,ay:-vy*(o.curve||.9),life:5})}};

/* ---------- boss helper: a body that fades slowly in and out ---------- */

/* =============== 20 THE CRYSTAL CHOIR =============== */
const CRE=['#1c1450','#4a3ad0','#8a7af8','#d8f6ff',WH],CR=[K,'#1c1450','#5a4ac0','#a6e6ff',WH],CRM=['#1a0a30',PU,mg,MG,WH],ROCKC=[K,'#14102a','#2a2450',VI,BL],GLOW=[K,'#3a1a6a',mg,MG,WH];
KIT.chime=function(g,f,w,h,o){const cx=w*.58,cy0=h/2;
  poly(g,[[cx,1],[cx+w*.24,cy0],[cx,h-1],[cx-w*.24,cy0]],o.pal);
  poly(g,[[cx,5],[cx+w*.09,cy0],[cx,h-5],[cx-w*.09,cy0]],[o.pal[2],o.pal[3],o.pal[4],WH]);px(g,WH,cx-1,cy0-4,1,3);
  for(let k=0;k<3;k++){const r=6+((f+k*2)%6)*2.2;g.fillStyle=k&1?o.pal[3]:WH;for(let a=2.3;a<4;a+=.09){const x=Math.round(cx-3+Math.cos(a)*r),y=Math.round(cy0+Math.sin(a)*r*1.3);g.fillRect(x,y,1,1)}}
};
KIT.harp=function(g,f,w,h,o){const cy0=h/2,x0=w*.7,rx=x0-3,ry=h/2-2;
  for(let i=0;i<=36;i++){const a=PI/2+i/36*PI,xa=x0+Math.cos(a)*rx,ya=cy0+Math.sin(a)*ry;thick(g,i%3?o.pal[2]:o.pal[3],xa,ya,xa,ya,3)}
  for(let i=1;i<=5;i++){const x=x0-i*rx/5.6,ye=ry*Math.sqrt(Math.max(0,1-Math.pow((x-x0)/rx,2)))-2,off=((f+i)%4<2)?0:1;g.fillStyle=i%2?o.pal[4]:o.pal[3];
    for(let y=-ye;y<=ye;y++)g.fillRect(Math.round(x+Math.sin(y*.5+f*1.5)*off),Math.round(cy0+y),1,1)}
  poly(g,[[x0-2,1],[x0+3,1],[x0+3,h-1],[x0-2,h-1]],o.pal);ell(g,x0,cy0,4,4,GLOW);px(g,WH,x0-1,cy0-1,2,1);
};
KIT.splinter=function(g,f,w,h,o){const cy0=h/2;
  poly(g,[[1,cy0],[w*.22,cy0-h*.32],[w-7,cy0-h*.46],[w-3,cy0],[w-7,cy0+h*.46],[w*.22,cy0+h*.32]],o.pal);
  line(g,o.pal[4],2,cy0,w-5,cy0);line(g,o.pal[3],w*.25,cy0-h*.3,w-8,cy0-h*.4);
  for(let i=0;i<3;i++)px(g,i%2?CY:WH,w-2+((f+i)%2),cy0-5+i*5,2,1);
};
KIT.geode=function(g,f,w,h,o){const cx=w/2,cy0=h/2,r=Math.min(w,h)/2-2,op=[1,3,5,3][f];
  ell(g,cx,cy0,r,r,ROCKC);
  g.save();g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(cx+2,cy0);g.lineTo(cx-r*1.6,cy0-(r*.3+op*2.2));g.lineTo(cx-r*1.6,cy0+(r*.3+op*2.2));g.closePath();g.fill();g.restore();
  ell(g,cx-r*.2,cy0,r*.62,r*.55,[K,'#14102a','#3a1a6a']);
  for(let i=-2;i<=2;i++)prism(g,cx+r*.15,cy0+i*r*.12,r*(.95-Math.abs(i)*.12),r*.26,PI+i*.2,(i&1)?CRM:CR);
  px(g,WH,cx-r*.6,cy0-1,2,2);for(let i=0;i<3;i++)px(g,ROCKC[3],cx-r*.3+i*r*.4,cy0-r+1+i%2,2,1);
};
KIT.organ=function(g,f,w,h,o){const base=h*.8;
  poly(g,[[1,base],[w-6,base],[w-3,h-1],[3,h-1]],ROCKC);
  const hs=[.42,.62,.84,1,.86,.66,.46];
  for(let i=0;i<7;i++){const x=3+i*(w-14)/6.2,len=(base-1)*hs[i];prism(g,x+3,base+1,len,5.6,-PI/2,i%3===1?CRM:o.pal);if(((i+f)&3)===0)px(g,WH,x+2,base-len+1,2,2)}
  px(g,o.flame||MG,w-4,h-7,3,3);px(g,YL,w-5,h-6,1,1);
};
function forkBody(g,w,h){const cy0=h/2,bx=w*.6;
  poly(g,[[bx,cy0-5],[w-14,cy0-4],[w-14,cy0+4],[bx,cy0+5]],CR);ell(g,w-9,cy0,8,8,CRM);px(g,WH,w-12,cy0-4,3,2);
  for(const s of [-1,1]){const yc=cy0+s*h*.3;
    prism(g,bx+4,yc,bx+2,19,PI,s<0?CRE:CRM)}
  poly(g,[[bx-4,cy0-h*.3-9],[bx+12,cy0-h*.3-9],[bx+12,cy0+h*.3+9],[bx-4,cy0+h*.3+9]],CR);
  ell(g,bx-13,cy0,10,10,GLOW);ell(g,bx-14,cy0-1,4,4,[mg,MG,WH,WH]);
}
function choirBoss(g,w,h){const cx=w*.5,cy0=h/2;
  poly(g,[[w*.52,cy0-h*.2],[w*.74,cy0-h*.3],[w-10,cy0-h*.08],[w-6,cy0+h*.16],[w*.7,cy0+h*.3],[w*.5,cy0+h*.22]],ROCKC);
  for(const [a,l,wd,c] of [[0,52,14,0],[.5,46,13,1],[-.5,46,13,1],[1,38,12,0],[-1,38,12,0],[1.5,30,11,1],[-1.5,30,11,1]])prism(g,cx+Math.cos(a)*6,cy0+Math.sin(a)*6,l,wd,a,c?CRM:CR);
  for(const [a,l,wd,c] of [[PI,76,18,0],[PI-.45,68,16,1],[PI+.45,68,16,1],[PI-.9,58,15,0],[PI+.9,58,15,0],[PI-1.35,46,13,1],[PI+1.35,46,13,1],[PI-1.8,36,12,0],[PI+1.8,36,12,0]])prism(g,cx+Math.cos(a)*6,cy0+Math.sin(a)*6,l,wd,a,c?CRM:CR);
  ell(g,cx,cy0,18,18,GLOW);ell(g,cx-2,cy0-2,8,8,[mg,MG,WH,WH]);
  for(const [a,rr,l] of [[PI-.25,92,12],[PI+.25,92,12],[PI+.1,100,9],[PI-.1,100,9],[-2.3,66,10],[2.3,66,10]])prism(g,cx+Math.cos(a)*rr*.99,cy0+Math.sin(a)*rr*.62,l,5,a+PI,CR);   // loose shards drifting round it
}
const CHOIR={
  bullets:{orb:['orb',VI,CY,WH],shard:['shard',BL,CY,WH],note:['big',mg,MG,WH],needle:['needle',CY,WH],dot:['dot',CY]},
  en:{
    ring:{kit:'chime',w:34,h:40,o:{pal:CRE},hp:1.6,pts:180,vx:-44,mv:'sine',mvp:{a:36,f:3},at:'aim',atp:{n:3,sd:.5,sp:84,s:'shard',cd:2.3}},
    ringR:{kit:'harp',w:40,h:34,o:{pal:CRE},hp:3.4,pts:300,vx:-40,mv:'sine',mvp:{a:26,f:1.6},at:'ring',atp:{n:10,sp:52,s:'orb',cd:3}},
    dart:{kit:'splinter',w:44,h:14,o:{pal:CRM},hp:2,pts:210,vx:-160,mv:'dive',mvp:{track:1.2,sp:62},at:false},
    cross:{kit:'geode',w:34,h:34,o:{},hp:5.5,pts:380,vx:-30,mv:'bounce',mvp:{vy:24},at:'spiral',atp:{n:5,sp:58,s:'note',cd:2.6}},
    pod:{kit:'organ',w:52,h:36,o:{pal:CRE,flame:MG},hp:9.5,pts:600,vx:-22,mv:'drift',mvp:{a:8},at:'aim',atp:{n:9,sd:1.5,sp:70,s:'shard',cd:3}}
  },
  rim:'#c8f0ff',
  rock:()=>rockSet((g,s,a)=>{prism(g,s/2,s/2,s*.46,s*.3,a,CR);prism(g,s/2,s/2,s*.36,s*.26,a+PI*.8,CRM)},22,11),
  mini:{w:124,h:84,hp:2,x:228,bob:36,debris:[CY,MG,WH],build:forkBody,core:{x:-7,y:0,w:22,h:22},muz:[[-.46,-.3],[-.46,.3],[-.2,0]],
    deco(c,b,f){if(f)return;const k=stepAt(b.t,3)%3,x=(b.x-7)|0,y=b.y|0;c.fillStyle=k?'#ff77ff':'#ffffff';for(let i=0;i<6;i++){const a=i/6*TAU+b.t;c.fillRect((x+Math.cos(a)*(14+k*2))|0,(y+Math.sin(a)*(14+k*2))|0,2,2)}},
    phases:[[{a:'fan',n:5,sd:1,sp:78,cd:1.6,s:'shard',m:0},{a:'gapring',n:20,sp:48,cd:4.2,s:'orb',m:2}],
            [{a:'fan',n:7,sd:1.2,sp:82,cd:1.4,s:'shard',m:1},{a:'gapring',n:22,sp:52,cd:3.4,s:'orb',m:2},{a:'shardstorm',n:5,sp:74,cd:5,s:'shard'}],
            [{a:'fan',n:9,sd:1.4,sp:86,cd:1.2,s:'shard',m:0},{a:'gapring',n:24,sp:54,cd:3,s:'note',m:2},{a:'shardstorm',n:7,sp:78,cd:4,s:'shard'},{a:'sweep',arc:2.2,cnt:18,sp:70,cd:6,s:'needle',m:2}]]},
  boss:{w:190,h:134,hp:3,x:232,bob:30,charge:12,chargeDist:110,debris:[CY,MG,WH,BL],build:choirBoss,core:{x:0,y:0,w:36,h:36},boom:44,
    deco(c,b,f){if(f)return;const k=stepAt(b.t,2.5)%4,x=b.x|0,y=b.y|0;c.fillStyle=k&1?'#ff77ff':'#cc44cc';for(let i=0;i<16;i++){const a=i/16*TAU;c.fillRect((x+Math.cos(a)*(22+k*3))|0,(y+Math.sin(a)*(22+k*3))|0,2,1)}},
    muz:[[-.45,0],[-.34,-.3],[-.34,.3]],
    phases:[[{a:'fan',n:7,sd:1.2,sp:78,cd:1.8,s:'shard',m:0},{a:'gapring',n:22,sp:48,cd:4,s:'orb',m:0},{a:'shardstorm',n:6,sp:74,cd:6.5,s:'shard'}],
            [{a:'fan',n:9,sd:1.4,sp:82,cd:1.5,s:'shard',m:1},{a:'fan',n:9,sd:1.4,sp:82,cd:1.5,s:'shard',m:2,at:.8},{a:'gapring',n:26,sp:52,cd:3.4,s:'note',m:0},{a:'sweep',arc:2.4,cnt:22,sp:66,cd:6,s:'needle',m:0},{a:'shardstorm',n:8,sp:78,cd:5,s:'shard'}],
            [{a:'fan',n:11,sd:1.6,sp:86,cd:1.3,s:'shard',m:1},{a:'gapring',n:28,sp:56,cd:3,s:'note',m:0},{a:'sweep',arc:3.2,cnt:28,gap:.07,sp:70,cd:5,s:'needle',m:0,mirror:1},{a:'shardstorm',n:10,sp:82,cd:4.4,s:'shard'},{a:'tickring',n:14,cnt:3,sp:56,cd:6,s:'orb',m:0},{a:'lance',n:11,sp:170,w:.8,cd:5.4,s:'needle'},{a:'summon',type:'dart',n:4,cd:9}]]},
  tick(dt,live){if(!live||G.boss||G.mini)return;const ph=bgT()%26;if(ph>19.5&&ph<23){CHOIR.acc-=dt;if(CHOIR.acc<=0){CHOIR.acc=.2;ebShot(rnd(100,W+50),TOP+1,-55,68,{sty:'shard',life:4.5})}}},
  acc:0,
  fg(t){if(G.boss||G.mini)return;const ph=t%26;if(ph>17.5&&ph<19.5)B.H.warnText('SHARD STORM',t);if(ph>19.5&&ph<23){ctx.fillStyle=CY;for(let i=0;i<10;i++){const x=mod(i*37-t*60,W+40),y=mod(i*23+t*74,H);ctx.fillRect(x|0,y|0,1,3)}}},
  scene:K_=>({seed:20,angles:[0,.6,0,-.5,.35,0,.7,-.35],sky:['#02021a','#0a0a38','#1c1a6a','#3a3a9a'],skyFn:(x,y)=>.08+y/200*.28+.1*Math.sin((x*.6+y*1.1)*.025)+.1*Math.exp(-Math.pow((x-90)/80,2)),stars:[CY,LV,WH,WH],
    layers:[
      {z:'bg',t:'clouds',ramp:['#02021a','#0a2a4a','#2a7a9a',CY],seed:201,vx:5,alpha:.34,thr:.5,fx:.02,fy:.07},
      {z:'bg',t:'objs',n:2,vx:6,seed:202,list:[darken(cnv(120,170,g=>{prism(g,14,168,150,22,-PI/2-.12,CR);prism(g,106,168,150,22,-PI/2+.12,CR);prism(g,60,168,100,16,-PI/2,CR);ell(g,60,50,16,16,[K,NV,BL,CY])}),.6)]},
      {z:'bg',t:'objs',n:5,vx:11,seed:203,list:[darken(island(54,1,CR,CRM),.5),darken(island(40,2,CR,CRM),.45),darken(island(66,3,CR,CRM),.55)],lights:CY},
      {z:'mid',t:'objs',n:7,vx:26,seed:204,list:[island(16,4,CR,CRM),island(12,5,CR,CRM),cnv(14,14,g=>{prism(g,7,12,12,6,-PI/2,CR)})],lights:WH},
      {z:'mid',t:'streak',n:14,vx:90,len:6,cols:[CY,WH,MG],seed:21},
      {z:'fg',t:'objs',n:2,vx:80,seed:205,list:[darken(island(70,6,CR,CRM),.55)]},
      {z:'fg',t:'streak',n:20,vx:120,len:5,cols:[CY,WH],seed:22}]}),
  script(sc,h){waves(h,[[3,'ring',6,.45,60,0],[8,'dart',6,.35,40,26],[14,'ringR',3,1.2,70,40],[19,'cross',3,1.6,50,45],[25,'ring',8,.34,120,0],[31,'pod',1,0,100,0],[34,'dart',7,.3,45,20],
    [40,'ringR',4,1,60,30],[45,'cross',4,1.3,50,40],[50,'ring',9,.3,100,0],[56,'pod',2,2,70,60],[61,'dart',8,.27,40,18],[66,'ringR',5,.9,60,26],[72,'cross',4,1.2,60,35],[77,'ring',10,.25,80,0]])}
};

/* =============== 21 THE CLOCKWORK ABYSS =============== */
const BRS=['#1a0e04','#4a2c10','#8a6a28','#e0b050','#ffeeaa'],STL=[K,'#1c2030','#4a5668','#8a9ab0','#d0e0f0'],IV=['#4a3a20','#9a8050','#d8c890','#f4ecc0',WH];
KIT.cogwheel=function(g,f,w,h,o){const cx=w/2,cy0=h/2,r=Math.min(w,h)/2-4,n=o.teeth||10,rot=f*TAU/n/4;
  for(let i=0;i<n;i++){const a=i/n*TAU+rot;thick(g,o.pal[2],cx+Math.cos(a)*(r-1),cy0+Math.sin(a)*(r-1),cx+Math.cos(a)*(r+3),cy0+Math.sin(a)*(r+3),3);px(g,o.pal[4],cx+Math.cos(a)*(r+3),cy0+Math.sin(a)*(r+3))}
  ell(g,cx,cy0,r,r,o.pal);
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4+rot;ell(g,cx+Math.cos(a)*r*.56,cy0+Math.sin(a)*r*.56,r*.24,r*.24,[K,K,'#1c2030'])}
  ell(g,cx,cy0,r*.28,r*.28,o.eye||[K,rd,RD,WH]);
};
KIT.clockbot=function(g,f,w,h,o){const cx=w/2,cy0=h*.46,r=Math.min(w,h)*.34,ph=[0,1,2,1][f];
  for(const s of [-1,1]){thick(g,o.pal[2],cx+s*r*.45,cy0+r*.8,cx+s*(r*.7+(s>0?ph:2-ph)*.8),h-3,2);px(g,o.pal[4],cx+s*(r*.7+(s>0?ph:2-ph)*.8)-1,h-3,3,2)}
  for(const s of [-1,1]){ell(g,cx+s*r*.62,cy0-r*.98,r*.3,r*.26,o.pal);px(g,o.pal[4],cx+s*r*.62,cy0-r*1.12)}
  ell(g,cx,cy0,r+1.5,r+1.5,o.pal);ell(g,cx,cy0,r-1,r-1,IV);
  for(let i=0;i<12;i++){const a=i/12*TAU;px(g,K,cx+Math.cos(a)*(r-2.5),cy0+Math.sin(a)*(r-2.5))}
  const a1=f*1.57-1.57;line(g,K,cx,cy0,cx+Math.cos(a1)*(r-3),cy0+Math.sin(a1)*(r-3));line(g,rd,cx,cy0,cx+Math.cos(a1*.25+1)*(r-5),cy0+Math.sin(a1*.25+1)*(r-5));px(g,rd,cx,cy0,2,2);
};
KIT.coil=function(g,f,w,h,o){const cy0=h/2;
  for(let i=4;i<w-3;i++){const y=cy0+Math.sin(i*.8+f*1.57)*h*.34,y2=cy0+Math.sin((i+1)*.8+f*1.57)*h*.34;thick(g,(i%4<2)?o.pal[3]:o.pal[2],i,y,i+1,y2,2)}
  poly(g,[[1,cy0],[7,cy0-h*.36],[8,cy0+h*.36]],o.pal);px(g,RD,3,cy0,2,1);poly(g,[[w-4,cy0-h*.42],[w-1,cy0-h*.42],[w-1,cy0+h*.42],[w-4,cy0+h*.42]],o.pal);
};
KIT.orrery=function(g,f,w,h,o){const cx=w/2,cy0=h/2,R=w/2-2;
  for(const [tilt,rad,col] of [[0,R,o.pal[2]],[1.1,R-3,o.pal[3]],[-1.1,R-6,o.pal[2]]]){for(let i=0;i<64;i++){const a=i/64*TAU,x=Math.cos(a)*rad,y=Math.sin(a)*rad*.32;px(g,col,cx+x*Math.cos(tilt)-y*Math.sin(tilt),cy0+x*Math.sin(tilt)+y*Math.cos(tilt),2,2)}}
  ell(g,cx,cy0,5,5,o.core||[rd,OR,YL,WH]);const a=f*1.57;ell(g,cx+Math.cos(a)*(R-1),cy0+Math.sin(a)*(R-1)*.32,3,3,o.pal);
  px(g,o.pal[4],cx-R,cy0-1,2,3);px(g,o.pal[4],cx+R-2,cy0-1,2,3);
};
KIT.steamer=function(g,f,w,h,o){const by=h*.62;
  poly(g,[[1,by+2],[8,by-9],[8,by+8]],o.pal);
  poly(g,[[7,by-10],[w-6,by-10],[w-6,by+7],[7,by+7]],o.pal);ell(g,w-8,by-1,5,9,o.pal);
  for(let i=0;i<5;i++)px(g,o.pal[4],11+i*6,by-8,1,1);for(let i=0;i<4;i++)px(g,o.pal[0],12+i*7,by-3,1,9);
  poly(g,[[w*.5,by-10],[w*.5+7,by-10],[w*.5+5,by-20],[w*.5+2,by-20]],o.pal);
  for(let i=0;i<3;i++){ell(g,w*.5+4-i*3+((f+i)&1),by-22-i*4,2+i,2+i,[GM,LM,LL,WH])}
  for(let i=0;i<3;i++){const wx=12+i*13;ell(g,wx,by+9,4.5,4.5,[K,K,'#1c2030',GM]);px(g,o.pal[3],wx,by+9,1,1)}
  ell(g,w-9,by-1,3,5,[rd,OR,YL,WH]);px(g,RD,10,by-6,2,2);
};
function escapeBodyOld(g,w,h){const cx=w*.4,cy0=h/2,r=h*.4,n=16;
  for(let i=0;i<n;i++){const a=i/n*TAU;thick(g,BRS[2],cx+Math.cos(a)*(r-2),cy0+Math.sin(a)*(r-2),cx+Math.cos(a)*(r+7),cy0+Math.sin(a)*(r+7),4);px(g,BRS[4],cx+Math.cos(a)*(r+7),cy0+Math.sin(a)*(r+7),2,2)}
  ell(g,cx,cy0,r,r,BRS);ell(g,cx,cy0,r*.84,r*.84,[BRS[0],BRS[1],BRS[1],BRS[2]]);ell(g,cx,cy0,r*.3,r*.3,GLOWR);
  poly(g,[[w*.7,cy0-h*.46],[w-4,cy0-h*.46],[w-4,cy0+h*.46],[w*.7,cy0+h*.46],[w*.76,cy0]],STL);
  poly(g,[[cx+r*.4,cy0-r-8],[w*.72,cy0-h*.4],[w*.72,cy0-h*.28],[cx+r*.6,cy0-r+2]],STL);poly(g,[[cx+r*.4,cy0+r+8],[w*.72,cy0+h*.4],[w*.72,cy0+h*.28],[cx+r*.6,cy0+r-2]],STL,true);
  for(let i=0;i<4;i++)px(g,YL,w*.78,cy0-h*.4+i*(h*.27),3,2);
}
const GLOWR=[K,rd,OR,YL,WH];
function escapeBody(g,w,h){const cx=w*.46,cy0=h/2,r=h*.42,n=16;
  for(const s of [-1,1]){poly(g,[[cx+r*.2,cy0+s*(r+2)],[w-6,cy0+s*h*.3],[w-6,cy0+s*h*.46],[cx+r*.5,cy0+s*(r+8)]],STL,s>0);for(let i=0;i<3;i++)px(g,YL,w-14+i*3,cy0+s*h*.38-1,2,2)}
  poly(g,[[w*.8,cy0-5],[w-2,cy0-7],[w-2,cy0+7],[w*.8,cy0+5]],STL);px(g,OR,w-3,cy0-4,2,8);
  for(let i=0;i<n;i++){const a=i/n*TAU;thick(g,BRS[2],cx+Math.cos(a)*(r-2),cy0+Math.sin(a)*(r-2),cx+Math.cos(a)*(r+7),cy0+Math.sin(a)*(r+7),4);px(g,BRS[4],cx+Math.cos(a)*(r+7),cy0+Math.sin(a)*(r+7),2,2)}
  ell(g,cx,cy0,r,r,BRS);ell(g,cx,cy0,r*.8,r*.8,[BRS[0],BRS[1],BRS[1],BRS[2]]);ell(g,cx,cy0,r*.36,r*.36,[K,'#3a0a08']);ell(g,cx,cy0,r*.26,r*.26,GLOWR);
}
function colossusBoss(g,w,h){const cy0=h/2,fx=w*.46,fr=h*.36;
  poly(g,[[w*.62,cy0-h*.3],[w-4,cy0-h*.18],[w-4,cy0+h*.18],[w*.62,cy0+h*.3]],[K,'#0c1018','#141c28','#222e40']);
  for(let i=0;i<4;i++){const y=cy0-h*.2+i*h*.13;thick(g,STL[3],w-6,y,w-18,y+2,3);ell(g,w-20,y+2,5,5,BRS)}
  for(const s of [-1,1]){const gy=cy0+s*h*.38,n=14;for(let i=0;i<n;i++){const a=i/n*TAU;thick(g,BRS[2],fx+34+Math.cos(a)*18,gy+Math.sin(a)*18,fx+34+Math.cos(a)*24,gy+Math.sin(a)*24,4)}ell(g,fx+34,gy,18,18,BRS);ell(g,fx+34,gy,7,7,[K,K,'#1c2030']);}
  for(const s of [-1,1]){const y=cy0+s*h*.2;thick(g,STL[2],fx-fr*.6,y,6,cy0+s*h*.12,9);poly(g,[[1,cy0+s*h*.12-7],[14,cy0+s*h*.12-9],[14,cy0+s*h*.12+9],[1,cy0+s*h*.12+7]],STL);thick(g,K,0,cy0+s*h*.12,10,cy0+s*h*.12,5);ell(g,fx-fr*.6,y,8,8,BRS)}
  ell(g,fx,cy0,fr+5,fr+5,BRS);ell(g,fx,cy0,fr+1,fr+1,[BRS[0],BRS[1],BRS[2]]);ell(g,fx,cy0,fr-2,fr-2,IV);
  for(let i=0;i<12;i++){const a=i/12*TAU,l=i%3===0?5:3;line(g,i%3===0?K:BRS[1],fx+Math.cos(a)*(fr-3),cy0+Math.sin(a)*(fr-3),fx+Math.cos(a)*(fr-3-l),cy0+Math.sin(a)*(fr-3-l))}
  ell(g,fx,cy0,11,11,[K,'#3a0a08',BRS[1]]);ell(g,fx,cy0,8,8,GLOWR);
  for(let i=0;i<5;i++){const x=fx-26+i*13;poly(g,[[x,cy0-fr-4],[x+8,cy0-fr-4],[x+9,cy0-fr-14],[x-1,cy0-fr-14]],STL)}
  for(let i=0;i<3;i++)ell(g,fx-14+i*14,cy0-fr-16,6,6,BRS);
}
const CLOCK={
  bullets:{orb:['orb',BRS[1],OR,YL],bolt:['needle',OR,YL],gear:['big',BRS[1],BRS[3],YL],shard:['shard',BRS[2],YL,WH],dot:['dot',YL]},
  en:{
    ring:{kit:'cogwheel',w:30,h:30,o:{pal:BRS,teeth:10,eye:[K,'#0a3a5a',CY,WH]},hp:1.7,pts:190,vx:-46,mv:'sine',mvp:{a:36,f:3.2},at:'aim',atp:{n:3,sd:.45,sp:86,s:'bolt',cd:2.2}},
    ringR:{kit:'clockbot',w:38,h:40,o:{pal:BRS},hp:3.6,pts:310,vx:-36,mv:'sine',mvp:{a:22,f:1.5},at:'ring',atp:{n:10,sp:52,s:'gear',cd:3}},
    dart:{kit:'coil',w:42,h:18,o:{pal:STL},hp:2.1,pts:220,vx:-165,mv:'zig',mvp:{p:.35,a:95},at:false},
    cross:{kit:'orrery',w:36,h:36,o:{pal:BRS},hp:6,pts:400,vx:-30,mv:'bounce',mvp:{vy:24},at:'spiral',atp:{n:6,sp:60,s:'orb',cd:2.4}},
    pod:{kit:'steamer',w:54,h:40,o:{pal:STL},hp:10,pts:630,vx:-22,mv:'drift',mvp:{a:6},at:'aim',atp:{n:9,sd:1.5,sp:72,s:'shard',cd:3}}
  },
  rock:()=>rockSet((g,s,a)=>{const c=s/2,n=7;for(let i=0;i<n;i++){const q=i/n*TAU+a;thick(g,BRS[2],c+Math.cos(q)*s*.2,c+Math.sin(q)*s*.2,c+Math.cos(q)*s*.43,c+Math.sin(q)*s*.43,Math.max(2,s*.16))}ell(g,c,c,s*.27,s*.27,BRS);ell(g,c,c,s*.1,s*.1,[K,K,'#1c2030'])},22,11),
  mini:{w:112,h:84,hp:2,x:226,bob:34,debris:[OR,YL,GM],build:escapeBody,core:{x:-5,y:0,w:24,h:24},muz:[[-.4,-.3],[-.4,.3],[.18,0]],
    deco(c,b,f){if(f)return;const x=(b.x-b.w*.04)|0,y=b.y|0,r=b.h*.34;c.fillStyle='#000000';for(let i=0;i<4;i++){const a=stepAt(b.t,6)*.24+i*PI/2;for(let q=4;q<r;q+=1)c.fillRect((x+Math.cos(a)*q)|0,(y+Math.sin(a)*q)|0,1,1)}c.fillStyle=blinkAt(b.t,1.5)?'#ffffaa':'#ff9966';c.fillRect(x-2,y-2,5,5)},
    phases:[[{a:'fan',n:5,sd:1,sp:78,cd:1.6,s:'bolt',m:0},{a:'tickring',n:12,cnt:3,sp:48,cd:4.4,s:'gear',m:2}],
            [{a:'fan',n:7,sd:1.2,sp:82,cd:1.4,s:'bolt',m:1},{a:'tickring',n:14,cnt:3,sp:52,cd:3.6,s:'gear',m:2},{a:'curtain',n:10,sp:68,gap:34,cd:5,s:'orb'}],
            [{a:'fan',n:9,sd:1.4,sp:86,cd:1.2,s:'bolt',m:0},{a:'tickring',n:16,cnt:4,sp:56,cd:3,s:'gear',m:2},{a:'curtain',n:11,sp:72,gap:30,cd:4.4,s:'orb'},{a:'sweep',arc:3,cnt:24,sp:66,cd:6,s:'bolt',m:2}]]},
  boss:{w:200,h:140,hp:3.1,x:226,bob:26,charge:10,chargeDist:100,debris:[OR,YL,GM,LL],build:colossusBoss,core:{x:-3,y:0,w:22,h:22},boom:48,
    deco(c,b,f){if(f)return;const x=(b.x-b.w*.04)|0,y=b.y|0,hp=b.hp/b.mhp,sp=hp>.66?.6:hp>.33?1:1.7,a1=b.t*sp-1.57,a2=b.t*sp/12-1.57;
      c.fillStyle='#000000';for(let q=3;q<44;q++)c.fillRect((x+Math.cos(a1)*q)|0,(y+Math.sin(a1)*q)|0,2,2);c.fillStyle='#9a3a3a';for(let q=3;q<28;q++)c.fillRect((x+Math.cos(a2)*q)|0,(y+Math.sin(a2)*q)|0,3,3);
      c.fillStyle=blinkAt(b.t,2)?'#ffffaa':'#ff9966';c.fillRect(x-3,y-3,6,6)},
    muz:[[-.04,0],[-.44,-.18],[-.44,.18]],
    phases:[[{a:'fan',n:7,sd:1.2,sp:78,cd:1.7,s:'bolt',m:1},{a:'fan',n:7,sd:1.2,sp:78,cd:1.7,s:'bolt',m:2,at:.9},{a:'tickring',n:14,cnt:3,sp:50,cd:4.6,s:'gear',m:0}],
            [{a:'fan',n:9,sd:1.4,sp:82,cd:1.4,s:'bolt',m:1},{a:'fan',n:9,sd:1.4,sp:82,cd:1.4,s:'bolt',m:2,at:.7},{a:'tickring',n:16,cnt:4,sp:54,cd:3.8,s:'gear',m:0},{a:'sweep',arc:3.4,cnt:26,gap:.07,sp:68,cd:5.6,s:'bolt',m:0},{a:'curtain',n:12,sp:72,gap:32,cd:5,s:'orb'}],
            [{a:'fan',n:11,sd:1.6,sp:86,cd:1.2,s:'bolt',m:1},{a:'tickring',n:18,cnt:4,sp:58,cd:3.2,s:'gear',m:0},{a:'sweep',arc:6.2,cnt:44,gap:.06,sp:70,cd:5.2,s:'bolt',m:0,dir:1},{a:'curtain',n:13,sp:76,gap:28,cd:4.2,s:'orb'},{a:'corners',n:5,sd:.6,sp:76,cd:4,s:'shard'},{a:'summon',type:'ring',n:4,cd:8}]]},
  tick(dt,live){if(!live||G.boss||G.mini)return;const t=bgT(),per=Math.floor(t/15),ph=t-per*15;if(ph>=11.2&&CLOCK.fired!==per){CLOCK.fired=per;const y=CLOCK.barY(per);for(let i=0;i<14;i++)ebShot(W+8+i*7,y,-150,0,{sty:'bolt'});}},
  fired:-1,barY:per=>TOP+22+((per*47+13)%100)*1.3,
  fg(t){if(G.boss||G.mini)return;const per=Math.floor(t/15),ph=t-per*15;if(ph>=10&&ph<11.2&&blinkAt(t,3)){const y=CLOCK.barY(per)|0;ctx.fillStyle='#ff7777';ctx.fillRect(4,y,W-8,1);ctx.fillStyle='#ffffaa';ctx.fillRect(W-12,y-2,8,5);B.H.warnText('PISTON',t)}},
  scene:K_=>({seed:21,angles:[0,.7,0,-.7,.3,0,-.4,.9],sky:['#0a0604','#1a0e04','#2a1808','#4a2c10'],skyFn:(x,y)=>.06+y/200*.36+.08*Math.sin((x*.8+y*.6)*.03),stars:[BRS[2],OR,YL,WH],
    layers:[
      {z:'bg',t:'clouds',ramp:['#0a0604','#2a1808',BRS[1],BRS[2]],seed:211,vx:5,alpha:.5,thr:.48,fx:.025,fy:.07},
      {z:'bg',t:'objs',n:3,vx:6,seed:212,list:[darken(gearImg(70,20,BRS),.5),darken(gearImg(52,16,STL),.5),darken(gearImg(88,24,BRS),.55)]},
      {z:'bg',t:'objs',n:3,vx:13,seed:213,list:[darken(rail(200,16),.75),darken(rail(150,12),.75)],lights:OR},
      {z:'mid',t:'objs',n:6,vx:26,seed:214,list:[gearImg(24,9,BRS),gearImg(16,7,STL),gearImg(30,11,BRS),pipe(36,10)],lights:YL},
      {z:'mid',t:'streak',n:14,vx:70,len:4,cols:[YL,OR],seed:23},
            {z:'fg',t:'clouds',ramp:['#0a0604','#1a0e04','#2a1808'],seed:216,vx:44,alpha:.28,thr:.58}]}),
  script(sc,h){waves(h,[[3,'ring',7,.4,60,0],[8,'dart',6,.33,40,26],[13,'ringR',4,1.1,70,36],[18,'cross',3,1.5,50,45],[24,'ring',8,.34,120,0],[30,'pod',1,0,100,0],[33,'dart',7,.3,45,20],
    [39,'ringR',5,1,60,28],[44,'cross',4,1.3,50,40],[49,'ring',9,.3,100,0],[55,'pod',2,2,70,60],[60,'dart',8,.26,40,18],[65,'ringR',5,.9,60,26],[71,'cross',5,1.1,60,32],[76,'ring',10,.25,80,0]])}
};
function gearImg(r,n,pal){return cnv(r*2+16,r*2+16,g=>{const c=r+8;for(let i=0;i<n;i++){const a=i/n*TAU;thick(g,pal[2],c+Math.cos(a)*(r-2),c+Math.sin(a)*(r-2),c+Math.cos(a)*(r+6),c+Math.sin(a)*(r+6),Math.max(3,r*.14))}
  ell(g,c,c,r,r,pal);ell(g,c,c,r*.82,r*.82,[pal[0],pal[1],pal[1],pal[2]]);for(let i=0;i<6;i++){const a=i/6*TAU;thick(g,pal[3],c,c,c+Math.cos(a)*r*.8,c+Math.sin(a)*r*.8,Math.max(2,r*.1))}ell(g,c,c,r*.2,r*.2,pal)})}
function rail(len,th){return cnv(len,th,g=>{px(g,STL[2],0,0,len,3);px(g,STL[3],0,0,len,1);px(g,STL[1],0,th-3,len,3);for(let x=4;x<len;x+=th){px(g,STL[2],x,3,3,th-6);px(g,BRS[3],x,th>>1,2,2)}})}
function pipe(len,th){return cnv(len,th,g=>{poly(g,[[0,0],[len,0],[len,th],[0,th]],STL);for(let x=6;x<len;x+=12)px(g,BRS[3],x,0,2,th);px(g,STL[4],0,1,len,1)})}

/* =============== 22 THE VOID GARDEN =============== */
const GRN=['#04140c','#0a2a1c','#1c6a3c','#4cc060',PG],PET=['#2a0a24','#8a1a6a','#e03aa0','#ff88cc','#ffe0f0'],BARK=['#0a0604','#2a1a0c','#5a3a1c','#8a6a3a','#c8a860'];
KIT.bloom=function(g,f,w,h,o){const cx=w*.46,cy0=h/2,R=Math.min(w,h)*.36;
  let y0=cy0,x0=cx+R;g.fillStyle=GRN[2];for(let i=0;i<w-cx-R;i++){x0=cx+R+i;y0=cy0+Math.sin(i*.4-f*1.57)*3;g.fillRect(x0|0,y0|0,1,2)}
  ell(g,cx,cy0,R*1.08,R*1.08,['#14041c','#2a0a3a','#3a0a50']);
  for(let i=0;i<8;i++){const a=i/8*TAU+f*.12;ell(g,cx+Math.cos(a)*R*.62,cy0+Math.sin(a)*R*.62,R*.38,R*.38,o.pal)}
  ell(g,cx,cy0,R*.5,R*.5,[BARK[1],'#c89a14',YL,WH]);px(g,K,cx-2,cy0-1,3,3);
};
/* an open mouth: tip at xl, hinge at xl+len, jaws opened by gap, each jaw hgt tall, with teeth */
function jawHead(g,xl,yc,len,gap,hgt,pal){
  poly(g,[[xl+2,yc-gap],[xl+len,yc-gap],[xl+len,yc+gap],[xl+2,yc+gap]],[K,'#3a0a30',PET[1],PET[2]]);
  for(const s of [-1,1]){poly(g,[[xl,yc+s*gap],[xl+len*.25,yc+s*(gap+hgt*.8)],[xl+len*.6,yc+s*(gap+hgt)],[xl+len,yc+s*2],[xl+len*.6,yc+s*gap]],pal,s>0);
    line(g,pal[4],xl+3,yc+s*(gap+hgt*.6),xl+len*.6,yc+s*(gap+hgt*.95));
    for(let i=0;i<5;i++){const x=xl+3+i*len*.13;poly(g,[[x,yc+s*gap],[x+len*.08,yc+s*gap],[x+len*.04,yc+s*(gap-3.2)]],[WH,WH,WH])}}
}
KIT.maw=function(g,f,w,h,o){const cy0=h/2,gap=[2,4,6,4][f],hx=w*.74;
  thick(g,GRN[2],hx,cy0,w-1,h-1,3);jawHead(g,1,cy0,hx-1,gap,h*.3,o.pal);ell(g,hx-6,cy0-gap-5,3,3,[BARK[1],'#7a5410',YL,WH]);
};
KIT.seed=function(g,f,w,h,o){const cy0=h/2;
  for(let i=0;i<5;i++){const a=(i/4-.5)*1.4;g.fillStyle=WH;for(let q=0;q<10;q++)g.fillRect(Math.round(w*.52+Math.cos(a)*q*(w*.045)+((f&1)&&q>7?1:0)),Math.round(cy0+Math.sin(a)*q*(h*.05)),1,1)}
  poly(g,[[1,cy0],[w*.2,cy0-h*.36],[w*.55,cy0-h*.34],[w*.6,cy0],[w*.55,cy0+h*.34],[w*.2,cy0+h*.36]],o.pal);line(g,o.pal[4],2,cy0,w*.55,cy0);px(g,RD,w*.14,cy0-1,2,2);
};
KIT.bramble=function(g,f,w,h,o){const cx=w/2,cy0=h/2,r=Math.min(w,h)/2-6,q=rng(77);
  for(let i=0;i<16;i++){const a=q()*TAU+f*.16*(i&1?1:-1),l=r+3+q()*5;thick(g,'#c8a030',cx+Math.cos(a)*r*.5,cy0+Math.sin(a)*r*.5,cx+Math.cos(a)*l,cy0+Math.sin(a)*l,2);px(g,RD,cx+Math.cos(a)*(l+1),cy0+Math.sin(a)*(l+1),2,2)}
  ell(g,cx,cy0,r,r,o.pal);ell(g,cx-r*.2,cy0,r*.45,r*.45,[K,rd,RD,WH]);px(g,K,cx-r*.3+((f&1)?0:1),cy0-1,2,3);
};
KIT.bulb=function(g,f,w,h,o){const cx=w*.42,cy0=h*.56,rx=w*.34,ry=h*.38;
  for(let i=0;i<3;i++){let xx=cx+rx*.8,yy=cy0+(i-1)*6;g.fillStyle=GRN[2];for(let k=0;k<w*.28;k++){xx++;yy+=Math.sin(k*.5-f*1.57+i)*.6;g.fillRect(xx|0,yy|0,1,2)}}
  for(let i=-1;i<=1;i++)poly(g,[[cx,cy0-ry*.8],[cx+i*9+4,cy0-ry-9],[cx+i*9-4,cy0-ry-9]],GRN);
  ell(g,cx,cy0,rx,ry,o.pal);for(let i=-2;i<=2;i++)line(g,o.pal[0],cx+i*rx*.4,cy0-ry*.85,cx+i*rx*.2,cy0+ry*.85);
  for(let i=0;i<6;i++){const a=i/6*TAU+.4,x=cx+Math.cos(a)*rx*.7,y=cy0+Math.sin(a)*ry*.65;ell(g,x,y,2.5,2.5,((f+i)&3)===0?[PET[1],PET[3],WH,WH]:[K,PET[1],PET[2],PET[3]])}
  ell(g,cx-rx*.35,cy0,4,4,[K,rd,RD,WH]);px(g,K,cx-rx*.35,cy0-1,2,3);
};
function bloomBody(g,w,h){const cx=w*.5,cy0=h/2,q=rng(5);
  for(let i=0;i<5;i++){const a=PI+(i-2)*.5;thick(g,GRN[2],w-2,cy0,cx+Math.cos(a)*10,cy0+Math.sin(a)*10,4)}
  for(let i=0;i<10;i++){const a=i/10*TAU,l=h*.46;
    poly(g,[[cx,cy0],[cx+Math.cos(a-.35)*l*.7,cy0+Math.sin(a-.35)*l*.7],[cx+Math.cos(a)*l,cy0+Math.sin(a)*l],[cx+Math.cos(a+.35)*l*.7,cy0+Math.sin(a+.35)*l*.7]],i&1?PET:[PET[0],PET[1],PET[2],PET[3],PET[4]])}
  for(let i=0;i<10;i++){const a=(i+.5)/10*TAU,l=h*.3;poly(g,[[cx,cy0],[cx+Math.cos(a-.3)*l*.7,cy0+Math.sin(a-.3)*l*.7],[cx+Math.cos(a)*l,cy0+Math.sin(a)*l],[cx+Math.cos(a+.3)*l*.7,cy0+Math.sin(a+.3)*l*.7]],['#2a0a24','#e03aa0','#ff88cc',WH])}
  ell(g,cx,cy0,h*.2,h*.2,[BARK[0],'#7a5410',YL,WH]);ell(g,cx-3,cy0,h*.1,h*.1,[K,rd,RD,WH]);
  for(let i=0;i<10;i++)px(g,YL,cx-12+q()*24,cy0-12+q()*24,1,1);
}
function heartBoss(g,w,h){const cx=w*.58,cy0=h/2;
  poly(g,[[w*.74,cy0-h*.16],[w-3,cy0-h*.2],[w-2,cy0+h*.2],[w*.74,cy0+h*.16]],[K,'#0e1420','#1c2430',STL[2]]);   // the wreck the garden grew over
  for(let i=0;i<4;i++){const y=cy0-h*.32+i*h*.21;for(let k=0;k<=20;k++){const u=k/20;thick(g,k%3?GRN[2]:GRN[3],w-8+(cx-w+8)*u,y+(cy0-y)*u+Math.sin(u*PI*2+i)*4,0,0,5-u*2)}}
  for(const [hy,k] of [[cy0-44,-1],[cy0,0],[cy0+44,1]]){
    let ox=cx-10,oy=cy0,hx=w*.1+4,pts=[];for(let i=0;i<=24;i++){const u=i/24,x=ox+(hx-ox)*u,y=oy+(hy-oy)*u+Math.sin(u*PI)*k*-14;thick(g,i%3?GRN[2]:GRN[3],x,y,x,y,9-u*2)}
    jawHead(g,hx-12,hy,40,7,12,GRN);ell(g,hx+22,hy-16,4,4,[BARK[1],'#7a5410',YL,WH])}
  ell(g,cx,cy0,30,34,[K,'#3a0a30',PET[1],PET[2],PET[3]]);
  ell(g,cx-6,cy0-2,15,17,[YL,YL,WH,WH]);ell(g,cx-6,cy0-2,13,15,[PET[0],PET[1],PET[3],WH]);px(g,K,cx-9,cy0-8,5,12);px(g,WH,cx-8,cy0-4,2,2);
}
const GARDEN={
  bullets:{orb:['orb',GRN[2],PG,WH],pol:['dot',YL],seed:['shard',BARK[2],YL,WH],pet:['big',PET[1],PET[3],WH],needle:['needle',PET[3],WH]},
  en:{
    ring:{kit:'bloom',w:36,h:34,o:{pal:PET},hp:1.6,pts:180,vx:-44,mv:'sine',mvp:{a:34,f:3},at:'aim',atp:{n:3,sd:.5,sp:82,s:'seed',cd:2.3}},
    ringR:{kit:'maw',w:44,h:34,o:{pal:GRN},hp:3.5,pts:300,vx:-38,mv:'sine',mvp:{a:24,f:1.7},at:'aim',atp:{n:5,sd:1,sp:78,s:'seed',cd:2.7}},
    dart:{kit:'seed',w:40,h:18,o:{pal:['#3a2a08','#8a6a14','#d8b030','#fff070',WH]},hp:2,pts:210,vx:-160,mv:'dive',mvp:{track:1.2,sp:64},at:false},
    cross:{kit:'bramble',w:34,h:34,o:{pal:GRN},hp:5.8,pts:390,vx:-30,mv:'bounce',mvp:{vy:24},at:'ring',atp:{n:12,sp:54,s:'pet',cd:2.8}},
    pod:{kit:'bulb',w:54,h:40,o:{pal:PET},hp:9.8,pts:610,vx:-22,mv:'drift',mvp:{a:8},at:'aim',atp:{n:9,sd:1.5,sp:68,s:'orb',cd:3}}
  },
  rock:()=>rockSet((g,s,a)=>{const c=s/2;for(let i=0;i<7;i++){const q=i/7*TAU+a;thick(g,BARK[2],c+Math.cos(q)*s*.2,c+Math.sin(q)*s*.2,c+Math.cos(q)*s*.46,c+Math.sin(q)*s*.46,2);px(g,RD,c+Math.cos(q)*s*.46,c+Math.sin(q)*s*.46,2,2)}ell(g,c,c,s*.3,s*.3,GRN)},22,11),
  mini:{w:100,h:92,hp:2,x:228,bob:34,debris:[PET[2],PET[3],GRN[3]],build:bloomBody,core:{x:0,y:0,w:24,h:24},deco(c,b,f){if(f)return;const k=stepAt(b.t,2)%3,x=b.x|0,y=b.y|0;c.fillStyle=k?'#ffffaa':'#ffffff';c.fillRect(x-2,y-2,4,4);c.fillStyle='#ffe0f0';for(let i=0;i<8;i++){const a=i/8*TAU;c.fillRect((x+Math.cos(a)*(11+k))|0,(y+Math.sin(a)*(11+k))|0,2,2)}},muz:[[0,0],[-.3,-.3],[-.3,.3]],
    phases:[[{a:'fan',n:5,sd:1,sp:76,cd:1.6,s:'seed',m:1},{a:'seeds',n:6,ay:70,cd:3.6,s:'pet',m:0}],
            [{a:'fan',n:7,sd:1.2,sp:80,cd:1.4,s:'seed',m:2},{a:'seeds',n:8,ay:70,cd:3,s:'pet',m:0},{a:'gapring',n:20,sp:48,cd:4.2,s:'orb',m:0}],
            [{a:'fan',n:9,sd:1.4,sp:84,cd:1.2,s:'seed',m:1},{a:'seeds',n:10,ay:70,cd:2.6,s:'pet',m:0},{a:'gapring',n:24,sp:52,cd:3.4,s:'orb',m:0},{a:'arcs',n:7,sp:70,sd:1.4,cd:4.6,s:'needle',m:0}]]},
  boss:{w:200,h:140,hp:3.2,x:226,bob:30,charge:11,chargeDist:100,debris:[PET[2],PET[3],GRN[3],WH],build:heartBoss,core:{x:-14,y:0,w:30,h:34},boom:50,
    deco(c,b,f){if(f)return;const k=stepAt(b.t,1.6)%3,x=(b.x+0.08*b.w)|0,y=b.y|0;c.fillStyle=k?'#ff88cc':'#ffe0f0';for(let i=0;i<14;i++){const a=i/14*TAU;c.fillRect((x+Math.cos(a)*(34+k*2))|0,(y+Math.sin(a)*(38+k*2))|0,2,2)}},
    muz:[[-.4,-.31],[-.45,0],[-.4,.31]],
    phases:[[{a:'fan',n:7,sd:1.2,sp:76,cd:1.8,s:'seed',m:0},{a:'fan',n:7,sd:1.2,sp:76,cd:1.8,s:'seed',m:2,at:.9},{a:'seeds',n:8,ay:70,cd:3.4,s:'pet',m:1}],
            [{a:'fan',n:9,sd:1.4,sp:80,cd:1.5,s:'seed',m:0},{a:'fan',n:9,sd:1.4,sp:80,cd:1.5,s:'seed',m:2,at:.7},{a:'seeds',n:10,ay:70,cd:2.8,s:'pet',m:1},{a:'gapring',n:24,sp:50,cd:3.6,s:'orb',m:1},{a:'arcs',n:7,sp:72,sd:1.4,cd:5,s:'needle',m:0}],
            [{a:'fan',n:11,sd:1.6,sp:84,cd:1.3,s:'seed',m:0},{a:'fan',n:11,sd:1.6,sp:84,cd:1.3,s:'seed',m:2,at:.6},{a:'seeds',n:12,ay:70,cd:2.4,s:'pet',m:1},{a:'gapring',n:28,sp:54,cd:3,s:'orb',m:1},{a:'arcs',n:9,sp:76,sd:1.6,cd:4.2,s:'needle',m:2},{a:'curtain',n:12,sp:68,gap:30,cd:4.8,s:'seed'},{a:'summon',type:'ring',n:4,cd:8}]]},
  tick(dt,live){if(!live||G.boss||G.mini)return;const ph=bgT()%17;if(ph>10&&ph<14.5){GARDEN.acc-=dt;if(GARDEN.acc<=0){GARDEN.acc=.45;ebShot(rnd(100,W+40),TOP+1,rnd(-30,-12),rnd(16,26),{sty:'pol',ay:6,life:6});ebShot(rnd(100,W+40),TOP+1,rnd(-30,-12),rnd(16,26),{sty:'pol',ay:6,life:6})}}},
  acc:0,
  fg(t){if(G.boss||G.mini)return;const ph=t%17;if(ph>8.5&&ph<10)B.H.warnText('SPORE FALL',t)},
  scene:K_=>({seed:22,angles:[0,.5,.1,-.6,.3,0,.6,-.4],sky:['#02100a','#0a1a24','#1a2a4a','#3a2a5a'],skyFn:(x,y)=>.08+y/200*.3+.12*Math.exp(-Math.pow((x-230)/100,2)-Math.pow((y-60)/70,2)),stars:[PG,PET[3],WH,YL],
    layers:[
      {z:'bg',t:'clouds',ramp:['#02100a','#1a2a4a','#4a2a6a',PET[1]],seed:221,vx:5,alpha:.4,thr:.5,fx:.02,fy:.07},
      {z:'bg',t:'objs',n:3,vx:7,seed:222,list:[darken(overgrown(wreck(170,64,1),1),.45),darken(overgrown(wreck(130,50,2),2),.45),darken(overgrown(wreck(200,74,3),3),.5)],lights:PG},
      {z:'bg',t:'objs',n:5,vx:13,seed:223,list:[darken(tree(70,120,1),.35),darken(tree(60,100,2),.35),darken(tree(80,130,3),.4)]},
      {z:'mid',t:'objs',n:7,vx:26,seed:224,list:[flower(15,1),flower(11,2),podImg(9),podImg(13)],lights:YL},
      {z:'mid',t:'clouds',ramp:['#000000','#5a5a20','#c8c860',YL],seed:225,vx:34,alpha:.22,thr:.6,fx:.03,fy:.05},
      {z:'fg',t:'objs',n:3,vx:80,seed:226,list:[darken(tree(90,150,4),.55),vine(14,190)]},
      {z:'mid',t:'streak',n:16,vx:50,len:3,cols:[PET[2],PET[3],YL],seed:27},
      {z:'fg',t:'streak',n:22,vx:60,len:3,cols:[YL,PG],seed:24}]}),
  script(sc,h){waves(h,[[3,'ring',7,.4,60,0],[8,'dart',6,.33,40,26],[13,'ringR',4,1.1,70,36],[18,'cross',3,1.5,50,45],[24,'ring',8,.34,120,0],[30,'pod',1,0,100,0],[33,'dart',7,.3,45,20],
    [39,'ringR',5,1,60,28],[44,'cross',4,1.3,50,40],[49,'ring',9,.3,100,0],[55,'pod',2,2,70,60],[60,'dart',8,.26,40,18],[65,'ringR',5,.9,60,26],[71,'cross',5,1.1,60,32],[76,'ring',10,.25,80,0]])}
};
function vine(w,hh){return cnv(w,hh,g=>{let x=w/2;for(let y=hh-1;y>=0;y--){x+=Math.sin(y*.09)*.8;thick(g,y%5?GRN[1]:GRN[2],x,y,x,y,4);if(y%17===0){ell(g,x+5,y,5,2.5,GRN);ell(g,x-5,y-6,5,2.5,GRN)}}})}
function wreck(w,hh,seed){const r=rng(seed);return cnv(w,hh,g=>{const c=hh*.5;poly(g,[[0,c],[w*.1,c-hh*.3],[w*.8,c-hh*.32],[w,c-hh*.05],[w,c+hh*.1],[w*.8,c+hh*.3],[w*.1,c+hh*.3]],STL);
  poly(g,[[w*.35,c-hh*.3],[w*.45,c-hh*.5],[w*.62,c-hh*.5],[w*.7,c-hh*.3]],STL);for(let i=0;i<5;i++){g.clearRect(w*.1+r()*w*.7,c-hh*.2+r()*hh*.3,3+r()*6,3)}for(let i=0;i<9;i++)line(g,STL[4],w*.1+i*w*.09,c-hh*.3,w*.1+i*w*.09+3,c+hh*.28);for(let i=0;i<8;i++)px(g,PET[3],w*.1+r()*w*.8,c-hh*.2+r()*hh*.4,1,1)})}
function overgrown(im,seed){const r=rng(seed*7),w=im.width,h=im.height;return cnv(w,h,g=>{g.drawImage(im,0,0);for(let i=0;i<9;i++){let x=r()*w,y=h*.2+r()*h*.5;g.fillStyle=GRN[2+(i&1)];for(let k=0;k<26;k++){x+=1;y+=Math.sin(k*.4+i)*1.2+.4;g.fillRect(x|0,y|0,2,2)}}
  for(let i=0;i<10;i++){ell(g,r()*w,h*.2+r()*h*.6,3,2.5,PET)}})}
function tree(w,hh,seed){const r=rng(seed*5);return cnv(w,hh,g=>{let x=w*.5,y=hh-1;for(let i=0;i<hh*.8;i++){y--;x+=Math.sin(i*.07+seed)*.6;thick(g,BARK[2+(i&1)],x,y,x,y,Math.max(2,6-i*.05))}
  for(let i=0;i<14;i++){const lx=w*.5+(r()-.5)*w*.8,ly=r()*hh*.45+4;ell(g,lx,ly,5+r()*5,3+r()*3,GRN)}for(let i=0;i<6;i++)ell(g,w*.5+(r()-.5)*w*.7,r()*hh*.4+6,2.5,2.5,PET)})}
function flower(r,seed){return cnv(r*2+4,r*2+4,g=>{const c=r+2;for(let i=0;i<8;i++){const a=i/8*TAU;ell(g,c+Math.cos(a)*r*.6,c+Math.sin(a)*r*.6,r*.4,r*.4,PET)}ell(g,c,c,r*.35,r*.35,[BARK[1],'#7a5410',YL,WH])})}
function podImg(r){return cnv(r*2+2,r*2+2,g=>{ell(g,r+1,r+1,r,r,GRN);for(let i=0;i<4;i++)px(g,PET[3],r*.5+i*r*.3,r*.5+((i*5)%r),2,2)})}

PACKS[20]=mkPack3(CHOIR);PACKS[21]=mkPack3(CLOCK);PACKS[22]=mkPack3(GARDEN);
})();
