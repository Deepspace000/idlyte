/* WE NEED A BIGGER SHIP, stages 3 to 5: 12 THE DYSON FORGE, 13 EVENT HORIZON and 14 THE ARMADA. Needs packs/big.js. */
(function(){
'use strict';
const B=window.BIGKIT,{px,cnv,mod,clamp,rng,ell,poly,thick,line,rampAt,darken,K,NV,VI,BL,PU,LP,LV,mg,MG,rd,BR,TN,OR,YG,YL,GR,GD,LG,PG,cy,CY,D,GM,LM,LL,WH,RD}=B;
const TAU=Math.PI*2,PI=Math.PI;
function waves(h,rows){const L=h.level;for(const r of rows){h.add(r[0],r[1],r[2]+(L-1)*(r[7]||1),r[3],r[4],r[5],r[6])}}
const girder=(len,th,ramp,seed)=>{const r=rng(seed);return cnv(len,th,g=>{g.fillStyle=ramp[2];g.fillRect(0,0,len,2);g.fillRect(0,th-2,len,2);px(g,ramp[3],0,0,len,1);
  for(let x=0;x<len;x+=th){line(g,ramp[1],x,1,x+th/2,th-2);line(g,ramp[1],x+th/2,th-2,x+th,1)}for(let i=0;i<4;i++)px(g,OR,r()*len,r()*th,1,1)})};
const ring=(r,ramp)=>cnv(r*2+2,r*2+2,g=>{for(let i=0;i<120;i++){const a=i/120*TAU;px(g,rampAt(ramp,.5+.5*Math.sin(a),i,0),r+1+Math.cos(a)*r,r+1+Math.sin(a)*r,2,2)}});
const panel=(w,h,ramp)=>cnv(w,h,g=>{poly(g,[[0,2],[w-2,0],[w,h-2],[2,h]],ramp);for(let i=1;i<5;i++)px(g,ramp[0],i*w/5,1,1,h-2);px(g,ramp[4],2,2,w-4,1)});
const hullB=(w,hh,seed,ramp,lamp)=>{const r=rng(seed);return cnv(w,hh,g=>{const c=hh*.5;poly(g,[[0,c],[w*.1,c-hh*.3],[w*.8,c-hh*.32],[w,c-hh*.05],[w,c+hh*.1],[w*.8,c+hh*.3],[w*.1,c+hh*.3]],ramp);
  poly(g,[[w*.35,c-hh*.3],[w*.45,c-hh*.5],[w*.62,c-hh*.5],[w*.7,c-hh*.3]],ramp);for(let i=0;i<10;i++)px(g,lamp,w*.1+r()*w*.8,c-hh*.2+r()*hh*.4,1,1)})};
/* a black hole with a photon ring and a hot accretion arc */
const blackHole=r=>cnv(r*3,r*2+8,g=>{const cx=r*1.5,cy0=r+4;
  for(let k=0;k<5;k++)for(let i=0;i<260;i++){const a=i/260*TAU,v=.5+.5*Math.sin(a*2-k);px(g,rampAt([VI,mg,MG,YL,WH],v*(1-k*.1),i,k),cx+Math.cos(a)*(r*1.35+k*2),cy0+Math.sin(a)*(r*.22+k*.7),2,2)}
  ell(g,cx,cy0,r,r,[K,K,K,'#0a0630']);for(let i=0;i<260;i++){const a=i/260*TAU;px(g,Math.cos(a+2.2)>0?WH:LV,cx+Math.cos(a)*(r+1),cy0+Math.sin(a)*(r+1),2,2)}
  for(let k=0;k<3;k++)for(let i=0;i<260;i++){const a=i/260*TAU;if(Math.sin(a)<0)continue;px(g,rampAt([mg,MG,YL,WH],.5+.5*Math.sin(a*3),i,k),cx+Math.cos(a)*(r*1.35+k*2),cy0+Math.sin(a)*(r*.22+k*.7),2,2)}});
const blob=(r,ramp)=>cnv(r*2+2,r*2+2,g=>ell(g,r+1,r+1,r,r,ramp));

/* =============== 12 THE DYSON FORGE =============== */
const GOLD=['#2a1500',BR,OR,YL,WH],METAL=[K,'#1c1840',GM,LM,LL],HOT=[rd,OR,YL,WH,WH],STEELB=[K,'#0e1830','#2a3a5a','#5a7a9a',LL];
function forgeBoss(g,w,h){
  const cx=w/2,cy0=h/2;
  for(let i=0;i<10;i++){const a=i/10*TAU;thick(g,METAL[2],cx,cy0,cx+Math.cos(a)*(h/2-6),cy0+Math.sin(a)*(h/2-6),3)}                                      // the cage spokes
  for(const rr of [h/2-4,h/2-14]){for(let i=0;i<150;i++){const a=i/150*TAU;px(g,rampAt(STEELB,.5+.5*Math.sin(a-1),i,0),cx+Math.cos(a)*rr*1.12,cy0+Math.sin(a)*rr,2,2)}}   // two rings
  ell(g,cx,cy0,h/2-22,h/2-22,['#3a2a10',BR,YL,WH]);for(let i=0;i<7;i++){const a=i/7*TAU;line(g,'#2a1500',cx+Math.cos(a)*9,cy0+Math.sin(a)*9,cx+Math.cos(a)*(h/2-22),cy0+Math.sin(a)*(h/2-22))}ell(g,cx,cy0,8,8,[BR,OR,YL,WH]);   // the star, banded and seamed
  for(let i=0;i<8;i++){const a=i/8*TAU;ell(g,cx+Math.cos(a)*(h/2+2)*1.1,cy0+Math.sin(a)*(h/2+2),5,5,METAL);px(g,OR,cx+Math.cos(a)*(h/2+2)*1.1,cy0+Math.sin(a)*(h/2+2),2,2)}   // gun nodes
  poly(g,[[w-12,cy0-8],[w,cy0-14],[w,cy0+14],[w-12,cy0+8]],GOLD);                                                                                       // exhaust fins
  for(let i=0;i<12;i++){const a=i/12*TAU;px(g,YL,cx+Math.cos(a)*(h/2-24),cy0+Math.sin(a)*(h/2-24),2,2)}
}
function foundryBody(g,w,h){
  const cy0=h/2;poly(g,[[w*.22,cy0-h*.3],[w*.8,cy0-h*.3],[w-3,cy0],[w*.8,cy0+h*.3],[w*.22,cy0+h*.3]],METAL);
  for(let i=0;i<10;i++){const a=i/10*TAU;ell(g,w*.38+Math.cos(a)*18,cy0+Math.sin(a)*18,4,4,GOLD)}ell(g,w*.38,cy0,16,16,GOLD);ell(g,w*.38,cy0,7,7,HOT);
  for(let s=-1;s<=1;s+=2){thick(g,METAL[3],w*.6,cy0+s*h*.2,6,cy0+s*h*.34,5);ell(g,8,cy0+s*h*.34,6,5,GOLD);thick(g,K,6,cy0+s*h*.34,0,cy0+s*h*.34,3)}
  for(let i=0;i<5;i++)px(g,YL,w*.64+i*4,cy0-3+(i%2)*4,2,1);
}
const FORGE={
  bullets:{orb:['orb',OR,YL],flare:['big',rd,OR,YL],shard:['shard',BR,OR,YL],needle:['needle',OR,YL],dot:['dot',OR]},
  en:{
    ring:{kit:'gear',w:28,h:28,o:{pal:STEELB,teeth:9,core:HOT},hp:1.5,pts:170,vx:-44,mv:'sine',mvp:{a:36,f:3.2},at:'aim',atp:{n:3,sd:.45,sp:78,s:'orb',cd:2.4}},
    ringR:{kit:'drone',w:38,h:30,o:{pal:STEELB,spark:YL,eye:[K,rd,OR,YL]},hp:3.2,pts:280,vx:-36,mv:'sine',mvp:{a:24,f:1.5},at:'ring',atp:{n:10,sp:50,s:'shard',cd:3}},
    dart:{kit:'gear',w:22,h:22,o:{pal:[K,'#0e1830',OR,YL,WH],teeth:14,core:HOT},hp:1.9,pts:200,vx:-150,mv:'dive',mvp:{track:1.2,sp:60},at:false},
    cross:{kit:'cross',w:32,h:32,o:{pal:STEELB,eye:YL,core:HOT},hp:5,pts:360,vx:-30,mv:'bounce',mvp:{vy:24},at:'spiral',atp:{n:5,sp:58,s:'flare',cd:2.5}},
    pod:{kit:'piston',w:48,h:30,o:{pal:STEELB,lamp:YL,eye:YL},hp:9,pts:560,vx:-22,mv:'drift',mvp:{a:8},at:'aim',atp:{n:7,sd:1.2,sp:68,s:'orb',cd:3.1}}
  },
  mini:{w:96,h:66,hp:1.9,x:232,bob:44,debris:[OR,YL,LL],build:foundryBody,core:{x:-12,y:0,w:30,h:30},muz:[[-.46,-.3],[-.46,.3]],
    phases:[[{a:'fan',n:5,sd:1,sp:76,cd:1.6,s:'orb',m:0},{a:'flare',n:5,sp:70,cd:4.2,s:'needle'}],
            [{a:'fan',n:7,sd:1.2,sp:80,cd:1.4,s:'orb',m:1},{a:'flare',n:6,sp:76,cd:3.6,s:'needle'},{a:'ring',n:14,sp:52,cd:3.4,s:'shard',m:0}],
            [{a:'fan',n:9,sd:1.4,sp:84,cd:1.2,s:'orb',m:1},{a:'flare',n:7,sp:80,cd:3,s:'needle'},{a:'ring',n:16,sp:56,cd:2.8,s:'shard',m:0},{a:'curtain',n:10,sp:70,gap:32,cd:4.8,s:'orb'}]]},
  boss:{w:184,h:136,hp:2.9,x:232,bob:34,charge:12,chargeDist:110,debris:[OR,YL,WH,LL],build:forgeBoss,core:{x:0,y:0,w:42,h:42},boom:40,deco(c,b,f){if(f)return;const on=((b.t*2.5)|0)%2,x=b.x|0,y=b.y|0;for(let i=0;i<8;i++){if(((b.t*2+i)|0)%3===0){const a=i/8*6.2832;c.fillStyle='#ffffaa';c.fillRect((x+Math.cos(a)*50)|0,(y+Math.sin(a)*50)|0,4,3)}}c.fillStyle=on?'#ffffff':'#ffffaa';c.fillRect(x-5,y-5,10,10);c.fillStyle=on?'#ff9966':'#ffffff';c.fillRect(x-8,y-1,16,2);c.fillRect(x-1,y-8,2,16)},
    muz:[[-.5,0],[-.35,-.34],[-.35,.34]],
    phases:[[{a:'ring',n:16,sp:50,cd:3.2,s:'flare',m:0},{a:'fan',n:7,sd:1.2,sp:78,cd:1.8,s:'orb',m:1},{a:'flare',n:6,sp:76,cd:4.4,s:'needle'}],
            [{a:'ring',n:18,sp:54,cd:2.8,s:'flare',m:0},{a:'fan',n:9,sd:1.4,sp:82,cd:1.5,s:'orb',m:2},{a:'flare',n:7,sp:82,cd:3.6,s:'needle'},{a:'spiral',arms:4,cnt:16,gap:.1,sp:58,cd:6,s:'shard',m:0},{a:'curtain',n:12,sp:72,gap:32,cd:5,s:'orb'}],
            [{a:'ring',n:20,sp:58,cd:2.5,s:'flare',m:0},{a:'fan',n:11,sd:1.6,sp:86,cd:1.3,s:'orb',m:1},{a:'flare',n:8,sp:88,cd:3,s:'needle'},{a:'spiral',arms:5,cnt:18,gap:.09,sp:62,cd:5.2,s:'shard',m:0},{a:'lance',n:11,sp:170,w:.8,cd:5.4,s:'needle'},{a:'summon',type:'ring',n:4,cd:9}]]},
  scene:K_=>({seed:12,sky:['#02030a','#0a1020','#1c2440','#3c5a7a'],skyFn:(x,y)=>y/200*.4+.1+Math.sin((x*.7-y)*.02)*.06,stars:[CY,YL,WH,WH],
    layers:[
      {z:'bg',t:'clouds',ramp:['#02030a','#0e1830','#2a3a5a','#5a7a9a'],seed:41,vx:5,alpha:.55,thr:.5},
      {z:'bg',t:'clouds',ramp:['#0e0500','#2a1500',BR,OR],seed:46,vx:8,alpha:.12,thr:.62},
      {z:'bg',t:'objs',n:4,vx:8,seed:42,list:[ring(70,GOLD),ring(46,METAL),ring(90,GOLD)]},
      {z:'bg',t:'objs',n:6,vx:14,seed:43,list:[darken(girder(170,16,STEELB,1),.2),darken(girder(120,12,STEELB,2),.2),darken(girder(220,18,STEELB,3),.2)],lights:OR},
      {z:'mid',t:'objs',n:6,vx:26,seed:44,list:[panel(40,26,METAL),panel(30,20,GOLD),blob(5,GOLD)]},
      {z:'fg',t:'objs',n:2,vx:80,seed:45,list:[darken(girder(240,22,METAL,4),.35)]},
      {z:'fg',t:'streak',n:18,vx:100,len:5,cols:[YL,OR],seed:7}]}),
  script(sc,h){waves(h,[[3,'ring',6,.45,60,0],[9,'dart',5,.4,40,28],[14,'ringR',3,1.2,70,40],[20,'cross',3,1.6,50,45],[26,'ring',7,.38,120,0],[32,'pod',1,0,100,0],[35,'dart',6,.33,45,22],
    [42,'ringR',4,1,60,30],[47,'cross',4,1.3,50,40],[52,'ring',8,.32,100,0],[58,'pod',2,2,70,60],[63,'dart',7,.3,40,20],[68,'ringR',5,.9,60,26],[74,'cross',4,1.2,60,35],[78,'ring',9,.28,80,0]])}
};

/* =============== 13 EVENT HORIZON =============== */
const VOID=['#05021a','#0a0630',VI,BL,LV],GHOST=[K,'#0a0630',BL,LV,WH],ASH=['#0a0630','#1c1840',GM,LM,LL];
function devourerBoss(g,w,h){
  const cx=w*.5,cy0=h/2;
  for(let i=0;i<260;i++){const a=i/260*TAU;px(g,i%2?mg:MG,cx+Math.cos(a)*(h/2-9),cy0+Math.sin(a)*(h/2-9),2,2)}   // a hot halo around the black sphere
  for(let k=0;k<4;k++)for(let i=0;i<220;i++){const a=i/220*TAU,rr=h*.5+k*3-6,v=.5+.5*Math.sin(a*2-k);px(g,rampAt([mg,MG,LV,YL,WH],v*(1-k*.15),i,k),cx+Math.cos(a)*rr*1.4,cy0+Math.sin(a)*rr*.34,2,2)}   // the accretion ring
  ell(g,cx,cy0,h/2-14,h/2-14,['#0a0010','#3a0a40',PU,mg,MG]);                                                                                                                              // the black sphere
  for(let i=0;i<220;i++){const a=i/220*TAU,lit=Math.cos(a+2.4)>0?WH:LV;px(g,lit,cx+Math.cos(a)*(h/2-13),cy0+Math.sin(a)*(h/2-13),2,2)}   // a bright rim so it stands out of the backdrop
  for(let k=0;k<2;k++)for(let i=0;i<220;i++){const a=i/220*TAU;if(Math.sin(a)<0)continue;px(g,rampAt([VI,BL,LV,WH],.6+.4*Math.sin(a*3),i,k),cx+Math.cos(a)*(h*.5+k*3-6)*1.4,cy0+Math.sin(a)*(h*.5+k*3-6)*.34,2,2)}   // the front of the ring
  thick(g,LV,cx,6,cx+3,0,2);thick(g,LV,cx,h-6,cx+3,h,2);                                                                                                                      // jets
  ell(g,cx-h*.18,cy0-4,11,13,[K,VI,YL,WH]);px(g,K,cx-h*.18-3,cy0-8,6,9);px(g,WH,cx-h*.18-1,cy0-6,2,2);                                                                                                        // the eye
}
function houndBody(g,w,h){   // a gyroscope: two crossed rings round a hot core
  const cx=w*.5,cy0=h/2;
  for(let i=0;i<200;i++){const a=i/200*TAU;px(g,rampAt([VI,mg,MG,YL,WH],.5+.5*Math.sin(a*2+1),i,0),cx+Math.cos(a)*w*.44,cy0+Math.sin(a)*h*.17,2,2);px(g,rampAt([VI,BL,LV,CY,WH],.5+.5*Math.sin(a*3),i,1),cx+Math.cos(a)*w*.15,cy0+Math.sin(a)*h*.46,2,2)}
  ell(g,cx,cy0,15,15,[K,'#3a0a40',PU,mg]);ell(g,cx,cy0,9,9,[K,YL,WH,WH]);px(g,K,cx-3,cy0-2,3,4);
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4;poly(g,[[cx+Math.cos(a)*18,cy0+Math.sin(a)*18],[cx+Math.cos(a+.3)*10,cy0+Math.sin(a+.3)*10],[cx+Math.cos(a-.3)*10,cy0+Math.sin(a-.3)*10]],[VI,LV,WH])}
}
const HORIZON={
  bullets:{orb:['orb',YL,WH],bub:['big',mg,YL,WH],needle:['needle',YL,WH],shard:['shard',mg,WH,YL],dot:['dot',YL]},
  en:{
    ring:{kit:'orb',w:28,h:28,o:{pal:[K,'#1b3036','#3c6a78',CY,WH],eye:[K,rd,OR,YL],ring:1,rc:CY},hp:1.6,pts:180,vx:-44,mv:'sine',mvp:{a:36,f:3},at:'aim',atp:{n:3,sd:.5,sp:82,s:'orb',cd:2.3}},
    ringR:{kit:'manta',w:40,h:30,o:{pal:[K,'#0a1030','#3c6a78',cy,CY],fins:1,eye:YL},hp:3.4,pts:300,vx:-44,mv:'sine',mvp:{a:24,f:1.7},at:'aim',atp:{n:5,sd:1,sp:78,s:'shard',cd:2.8}},
    dart:{kit:'eel',w:46,h:18,o:{pal:[K,VI,LV,CY,WH],spark:WH,tent:1,eye:WH},hp:2,pts:210,vx:-155,mv:'zig',mvp:{p:.4,a:90},at:false},
    cross:{kit:'crystal',w:34,h:34,o:{pal:[K,VI,LV,CY,WH],core:[K,mg,YL,WH]},hp:5.5,pts:380,vx:-30,mv:'bounce',mvp:{vy:24},at:'ring',atp:{n:12,sp:54,s:'bub',cd:2.8}},
    pod:{kit:'hauler',w:48,h:30,o:{pal:[K,'#3a0a40',PU,mg,MG],cargo:1,win:[K,mg,YL,WH],flame:MG,eye:YL},hp:9.5,pts:580,vx:-22,mv:'drift',mvp:{a:8},at:'aim',atp:{n:9,sd:1.5,sp:70,s:'shard',cd:3}}
  },
  mini:{w:136,h:96,hp:1.9,x:226,bob:40,debris:[BL,LV,WH],build:houndBody,core:{x:-3,y:0,w:26,h:26},muz:[[-.45,-.1]],
    phases:[[{a:'fan',n:5,sd:1,sp:78,cd:1.6,s:'orb',m:0},{a:'mines',n:3,ay:12,life:2.4,cd:4.4,s:'bub'}],
            [{a:'fan',n:7,sd:1.2,sp:82,cd:1.4,s:'orb',m:0},{a:'mines',n:4,ay:14,life:2.4,cd:3.6,s:'bub'},{a:'lance',n:9,sp:160,w:.8,cd:5,s:'needle'}],
            [{a:'fan',n:9,sd:1.4,sp:86,cd:1.2,s:'orb',m:0},{a:'mines',n:5,ay:16,life:2.4,cd:3,s:'bub'},{a:'lance',n:10,sp:170,w:.7,cd:4,s:'needle'},{a:'pull',t:2,f:34,cd:8}]]},
  boss:{w:196,h:132,hp:3.1,x:230,bob:34,charge:11,chargeDist:110,debris:[BL,LV,WH,VI],build:devourerBoss,core:{x:-24,y:-4,w:26,h:30},boom:42,
    muz:[[-.5,-.04],[-.3,-.3],[-.3,.3]],
    phases:[[{a:'spiral',arms:4,cnt:16,gap:.09,sp:58,cd:5.2,s:'orb',m:0},{a:'fan',n:7,sd:1.2,sp:80,cd:1.8,s:'shard',m:0},{a:'mines',n:3,ay:14,life:2.6,cd:4,s:'bub'},{a:'pull',t:2.2,f:32,cd:9}],
            [{a:'spiral',arms:5,cnt:18,gap:.08,sp:60,cd:4.8,s:'orb',m:0},{a:'fan',n:9,sd:1.4,sp:84,cd:1.6,s:'shard',m:1},{a:'mines',n:4,ay:16,life:2.6,cd:3.4,s:'bub'},{a:'lance',n:11,sp:170,w:.8,cd:5.2,s:'needle'},{a:'pull',t:2.4,f:36,cd:8}],
            [{a:'spiral',arms:6,cnt:20,gap:.07,sp:62,cd:4.2,s:'orb',m:0},{a:'fan',n:11,sd:1.6,sp:88,cd:1.4,s:'shard',m:2},{a:'mines',n:5,ay:18,life:2.6,cd:3,s:'bub'},{a:'lance',n:12,sp:180,w:.7,cd:4.4,s:'needle'},{a:'pull',t:2.6,f:40,cd:7},{a:'curtain',n:13,sp:76,gap:30,cd:5,s:'bub'},{a:'summon',type:'dart',n:4,cd:8}]]},
  scene:K_=>({seed:13,angles:[0,.8,.2,-.8,0,.6,-.4,1],sky:['#020010','#05021a','#0a0630','#1c1840'],skyFn:(x,y)=>.1+.3*Math.exp(-Math.pow((x-200)/110,2)-Math.pow((y-100)/60,2))+y/200*.08,stars:[BL,LV,WH,WH],
    layers:[
      {z:'bg',t:'clouds',ramp:['#05021a','#1c1840',BL,LV],seed:51,vx:7,alpha:.5,thr:.5,fx:.02,fy:.12},
      {z:'bg',t:'clouds',ramp:['#05021a','#0a0630',VI,LV],seed:52,vx:15,alpha:.4,thr:.55,fx:.012,fy:.16},
      {z:'bg',t:'objs',n:1,vx:3,seed:50,list:[blackHole(36)],pos:[[84,62]]},
      {z:'bg',t:'objs',n:7,vx:18,seed:53,list:[blob(5,ASH),blob(8,VOID),blob(3,GHOST)]},
      {z:'mid',t:'streak',n:26,vx:60,len:12,cols:[BL,LV,WH],seed:8},
      {z:'fg',t:'streak',n:30,vx:130,len:9,cols:[LV,WH,CY],seed:9},
      {z:'fg',t:'clouds',ramp:['#05021a','#0a0630',VI],seed:54,vx:44,alpha:.3,thr:.6,fx:.02,fy:.1}]}),
  script(sc,h){waves(h,[[3,'ring',6,.45,60,0],[8,'dart',6,.35,40,26],[14,'ringR',3,1.2,70,40],[19,'cross',3,1.6,50,45],[25,'ring',8,.35,120,0],[31,'pod',1,0,100,0],[34,'dart',7,.3,45,20],
    [40,'ringR',4,1,60,30],[45,'cross',4,1.3,50,40],[50,'ring',9,.3,100,0],[56,'pod',2,2,70,60],[61,'dart',8,.28,40,18],[66,'ringR',5,.9,60,26],[72,'cross',4,1.2,60,35],[77,'ring',9,.26,80,0]])}
};

/* =============== 14 THE ARMADA =============== */
const CRIM=['#1c0808',BR,rd,RD,YL],STEEL=['#07050e',D,GM,LM,LL];
const DSTEEL=['#05040a','#10101c','#2a2a3a',GM,LM];
function warlordBoss(g,w,h){
  const cy0=h/2;
  poly(g,[[3,cy0+10],[14,cy0-26],[w*.55,cy0-34],[w-6,cy0-16],[w-3,cy0],[w-6,cy0+18],[w*.55,cy0+36],[14,cy0+28]],DSTEEL);                      // hull
  for(const yy of [-30,-22,22,30]){line(g,RD,12,cy0+yy,w-10,cy0+yy*.55)}for(let i=0;i<5;i++){px(g,YL,w*.2+i*w*.13,cy0-8+(i%2)*14,3,2);px(g,K,w*.2+i*w*.13-2,cy0-3,7,6)}                    // red trim and hangar bays
  poly(g,[[w*.18,cy0-30],[w*.28,cy0-h*.46],[w*.55,cy0-h*.46],[w*.62,cy0-32]],CRIM);poly(g,[[w*.3,cy0-h*.44],[w*.5,cy0-h*.44],[w*.5,cy0-h*.37],[w*.3,cy0-h*.37]],[K,rd,RD,YL]);   // bridge
  poly(g,[[w*.12,cy0+30],[w*.2,cy0+h*.46],[w*.5,cy0+h*.46],[w*.58,cy0+34]],CRIM,true);
  for(let i=0;i<5;i++){ell(g,w*.2+i*w*.12,cy0-33,7,5,CRIM);thick(g,K,w*.2+i*w*.12-3,cy0-33,w*.2+i*w*.12-17,cy0-30,3)}                         // gun turrets
  for(let i=0;i<4;i++){ell(g,w*.24+i*w*.13,cy0+35,7,5,CRIM);thick(g,K,w*.24+i*w*.13-3,cy0+35,w*.24+i*w*.13-17,cy0+32,3)}
  for(let i=0;i<10;i++)px(g,STEEL[0],10+i*(w-24)/10,cy0-18,1,36);for(let i=0;i<16;i++)px(g,RD,16+((i*41)%(w-40)),cy0-14+((i*17)%28),2,1);
  poly(g,[[w-30,cy0-16],[w-3,cy0-18],[w-3,cy0+18],[w-30,cy0+16]],[K,'#68372b',OR,YL,WH]);g.fillStyle=K;g.fillRect(w-27,cy0-13,22,26);   // a bright frame round the weak point
  ell(g,w-16,cy0,9,11,[K,rd,OR,YL,WH]);
  for(let s=-1;s<=1;s+=2){poly(g,[[w*.52,cy0+s*38],[w-24,cy0+s*40],[w-8,cy0+s*50],[w*.6,cy0+s*54]],CRIM,s>0);ell(g,w-12,cy0+s*47,7,6,[K,rd,OR,YL]);px(g,YL,w-8,cy0+s*47,2,2);thick(g,K,w*.62,cy0+s*50,w*.74,cy0+s*50,2)}   // engine nacelles
  poly(g,[[w*.34,cy0-h*.46],[w*.4,cy0-h*.5],[w*.5,cy0-h*.5],[w*.54,cy0-h*.46]],STEEL);for(let i=0;i<4;i++)px(g,YL,w*.36+i*4,cy0-h*.47,2,1);   // the tower top
  for(let i=0;i<3;i++)px(g,OR,w-2,cy0-14+i*14,3,5);for(let i=0;i<4;i++)px(g,YL,w*.1,cy0-12+i*8,3,2);
  g.clearRect(w*.4,cy0+10,14,8);
}
function escortBody(g,w,h){
  const cy0=h/2;poly(g,[[w*.15,cy0],[w*.25,cy0-h*.36],[w*.85,cy0-h*.3],[w-3,cy0],[w*.85,cy0+h*.3],[w*.25,cy0+h*.36]],CRIMB);
  poly(g,[[w*.5,cy0-h*.3],[w*.8,cy0-h*.26],[w*.8,cy0-h*.14],[w*.5,cy0-h*.16]],STEEL);poly(g,[[w*.5,cy0+h*.3],[w*.8,cy0+h*.26],[w*.8,cy0+h*.14],[w*.5,cy0+h*.16]],STEEL,true);
  poly(g,[[w*.3,cy0-h*.3],[w*.45,cy0-h*.46],[w*.6,cy0-h*.46],[w*.7,cy0-h*.3]],CRIM);ell(g,w*.45,cy0,8,6,[K,rd,RD,YL]);
  for(let s=-1;s<=1;s+=2){thick(g,CRIM[2],w*.5,cy0+s*h*.34,8,cy0+s*h*.44,4);ell(g,8,cy0+s*h*.44,5,4,CRIM);thick(g,K,6,cy0+s*h*.44,0,cy0+s*h*.44,3)}
  for(let i=0;i<8;i++)px(g,RD,w*.35+i*4,cy0-h*.1+(i%2)*3,1,1);
}
const CRIMB=['#1c0808',BR,rd,OR,YL];
const ARMADA={
  bullets:{orb:['orb',rd,OR,YL],bolt:['needle',RD,YL],big:['big',rd,OR,YL],shard:['shard',BR,OR,YL],dot:['dot',OR]},
  en:{
    ring:{kit:'wedge',w:30,h:16,o:{pal:CRIM,flame:OR,guns:1,stripe:STEEL[3]},hp:1.7,pts:190,vx:-46,mv:'sine',mvp:{a:36,f:3},at:'aim',atp:{n:3,sd:.45,sp:84,s:'bolt',cd:2.2}},
    ringR:{kit:'manta',w:42,h:30,o:{pal:CRIMB,fins:1,eye:WH},hp:3.6,pts:320,vx:-40,mv:'sine',mvp:{a:24,f:1.6},at:'aim',atp:{n:5,sd:1,sp:80,s:'orb',cd:2.7}},
    dart:{kit:'eel',w:42,h:12,o:{pal:CRIM,spark:YL},hp:2.1,pts:220,vx:-160,mv:'dive',mvp:{track:1.2,sp:65},at:false},
    cross:{kit:'cross',w:34,h:34,o:{pal:[K,'#1c0808',rd,OR,YL],eye:YL,core:[K,rd,OR,YL]},hp:6,pts:400,vx:-30,mv:'bounce',mvp:{vy:26},at:'spiral',atp:{n:6,sp:60,s:'orb',cd:2.4}},
    pod:{kit:'hauler',w:52,h:32,o:{pal:CRIM,cargo:1,win:[K,rd,OR,YL],flame:YL},hp:10,pts:620,vx:-22,mv:'drift',mvp:{a:8},at:'aim',atp:{n:9,sd:1.5,sp:72,s:'shard',cd:3},at2:'launch'}
  },
  mini:{w:104,h:70,hp:2,x:232,bob:44,debris:[rd,OR,LL],build:escortBody,core:{x:-8,y:0,w:26,h:22},muz:[[-.48,-.34],[-.48,.34]],
    phases:[[{a:'fan',n:7,sd:1.1,sp:80,cd:1.5,s:'bolt',m:0},{a:'fan',n:7,sd:1.1,sp:80,cd:1.5,s:'bolt',m:1,at:.8},{a:'ring',n:14,sp:52,cd:3.6,s:'orb',m:0}],
            [{a:'fan',n:9,sd:1.3,sp:84,cd:1.3,s:'bolt',m:0},{a:'fan',n:9,sd:1.3,sp:84,cd:1.3,s:'bolt',m:1,at:.7},{a:'ring',n:16,sp:56,cd:3,s:'orb',m:0},{a:'summon',type:'dart',n:3,cd:8}],
            [{a:'fan',n:11,sd:1.5,sp:88,cd:1.1,s:'bolt',m:0},{a:'fan',n:11,sd:1.5,sp:88,cd:1.1,s:'bolt',m:1,at:.6},{a:'ring',n:18,sp:60,cd:2.6,s:'orb',m:0},{a:'lance',n:10,sp:170,w:.7,cd:4.4,s:'bolt'},{a:'summon',type:'dart',n:4,cd:7}]]},
  boss:{w:192,h:130,hp:3.4,x:216,bob:22,charge:10,chargeDist:110,debris:[rd,OR,YL,LL],build:warlordBoss,core:{x:73,y:0,w:24,h:28},boom:46,deco(c,b,f){if(f)return;const on=((b.t*3)|0)%2,x=(b.x+73)|0,y=b.y|0;c.fillStyle=on?'#ffffff':'#ffffaa';c.fillRect(x-4,y-5,8,10);c.fillStyle='#ff9966';c.fillRect(x-6,y-2,12,4);
    for(let i=0;i<8;i++){c.fillStyle=((b.t*4+i)|0)%2?'#ff7777':'#9a3a3a';c.fillRect((b.x-96+i*26)|0,(b.y-64)|0,3,2);c.fillRect((b.x-96+i*26)|0,(b.y+62)|0,3,2)}},
    muz:[[-.42,-.3],[-.42,0],[-.42,.3]],
    phases:[[{a:'fan',n:7,sd:1.2,sp:80,cd:1.5,s:'bolt',m:0},{a:'fan',n:7,sd:1.2,sp:80,cd:1.5,s:'bolt',m:2,at:.9},{a:'ring',n:16,sp:50,cd:3.4,s:'big',m:1},{a:'curtain',n:12,sp:72,gap:32,cd:5,s:'orb'}],
            [{a:'fan',n:9,sd:1.4,sp:84,cd:1.3,s:'bolt',m:0},{a:'fan',n:9,sd:1.4,sp:84,cd:1.3,s:'bolt',m:2,at:.8},{a:'ring',n:18,sp:54,cd:3,s:'big',m:1},{a:'curtain',n:13,sp:76,gap:30,cd:4.4,s:'orb'},{a:'spiral',arms:4,cnt:16,gap:.09,sp:60,cd:5.8,s:'orb',m:1},{a:'summon',type:'dart',n:4,cd:8}],
            [{a:'fan',n:11,sd:1.6,sp:88,cd:1.1,s:'bolt',m:0},{a:'fan',n:11,sd:1.6,sp:88,cd:1.1,s:'bolt',m:2,at:.7},{a:'ring',n:20,sp:58,cd:2.6,s:'big',m:1},{a:'curtain',n:14,sp:80,gap:28,cd:3.8,s:'orb'},{a:'spiral',arms:6,cnt:20,gap:.08,sp:64,cd:4.8,s:'orb',m:1},{a:'lance',n:12,sp:180,w:.7,cd:4.2,s:'bolt'},{a:'rain',n:8,both:1,sp:66,cd:4.4,s:'dot'},{a:'summon',type:'ringR',n:3,cd:8},{a:'summon',type:'dart',n:5,cd:6.5}]]},
  scene:K_=>({seed:14,angles:[0,.7,0,-.7,.3,0,-.4,.9],sky:['#0e0200','#1c0808',BR,rd],skyFn:(x,y)=>y/200*.4+.1+Math.sin((x*.9+y)*.018)*.05,stars:[BR,OR,YL,WH],
    layers:[
      {z:'bg',t:'clouds',ramp:['#0e0200','#3a0a08',rd,OR],seed:61,vx:6,alpha:.75,thr:.45},
      {z:'bg',t:'objs',n:5,vx:10,seed:62,list:[darken(hullB(150,56,1,STEEL,RD),.62),darken(hullB(120,46,2,STEEL,OR),.62),darken(hullB(170,64,3,STEEL,RD),.62)],lights:RD},
      {z:'mid',t:'objs',n:5,vx:22,seed:63,list:[hullB(90,34,4,STEEL,YL),blob(5,[rd,OR,YL,WH]),hullB(70,28,5,CRIMB,YL)],lights:YL},
      {z:'mid',t:'streak',n:18,vx:120,len:7,cols:[RD,OR,YL],seed:10},
      {z:'fg',t:'clouds',ramp:['#0e0200','#1c0808','#3a1c10'],seed:64,vx:50,alpha:.3,thr:.58},
      {z:'fg',t:'streak',n:26,vx:110,len:6,cols:[OR,YL,WH],seed:11}]}),
  script(sc,h){waves(h,[[3,'ring',7,.4,60,0],[8,'dart',6,.33,40,26],[13,'ringR',4,1.1,70,36],[18,'cross',3,1.5,50,45],[24,'ring',8,.34,120,0],[30,'pod',1,0,100,0],[33,'dart',7,.3,45,20],
    [39,'ringR',5,1,60,28],[44,'cross',4,1.3,50,40],[49,'ring',9,.3,100,0],[55,'pod',2,2,70,60],[60,'dart',8,.26,40,18],[65,'ringR',5,.9,60,26],[71,'cross',5,1.1,60,32],[76,'ring',10,.25,80,0],[79,'pod',1,0,100,0]])}
};
PACKS[12]=B.mkPack(FORGE);PACKS[13]=B.mkPack(HORIZON);PACKS[14]=B.mkPack(ARMADA);
})();
