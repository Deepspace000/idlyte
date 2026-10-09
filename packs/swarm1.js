/* THE SWARM, stages 1 to 3 (planets 15 to 17), for the small ships: 15 ION STORM BELT, 16 SPORE CLOUD, 17 MIRROR MAZE. Needs packs/big.js. */
(function(){
'use strict';
const B=window.BIGKIT,{px,cnv,mod,clamp,rng,ell,poly,thick,line,rampAt,darken,K,NV,VI,BL,PU,LP,LV,mg,MG,rd,BR,TN,OR,YG,YL,GR,GD,LG,PG,cy,CY,D,GM,LM,LL,WH,RD}=B;
const TAU=Math.PI*2,PI=Math.PI;
function waves(h,rows){const L=h.level;for(const r of rows)h.add(r[0],r[1],r[2]+(L-1)*(r[7]||1),r[3],r[4],r[5],r[6])}
const chunk=(r,seed,ramp)=>{const q=rng(seed);return cnv(r*2+2,r*2+2,g=>{const pts=[];for(let i=0;i<9;i++){const a=i/9*TAU,rr=r*(.6+q()*.4);pts.push([r+1+Math.cos(a)*rr,r+1+Math.sin(a)*rr])}poly(g,pts,ramp)})};
const bubble=(r,ramp)=>cnv(r*2+2,r*2+2,g=>{ell(g,r+1,r+1,r,r,ramp);px(g,WH,r-1,r-1,2,1)});
const shard=(w,h,ramp)=>cnv(w,h,g=>{poly(g,[[w*.5,0],[w,h*.45],[w*.7,h],[w*.2,h],[0,h*.4]],ramp);line(g,ramp[0],w*.5,0,w*.45,h);px(g,WH,w*.35,h*.25,2,2)});

/* =============== 15 ION STORM BELT =============== */
const ELEC=[K,'#1c1840',BL,CY,WH],DK=[K,NV,VI,BL,LV],ROCKB=['#07050e','#1c1840','#352879','#6c5eb5','#9ad2e0'];
function teslaBody(g,w,h){const cx=w*.55,cy0=h/2;
  poly(g,[[cx-18,cy0+h*.4],[cx-10,cy0-6],[cx+10,cy0-6],[cx+18,cy0+h*.4]],DK);
  for(let i=0;i<4;i++){const y=cy0-10-i*7;ell(g,cx,y,13-i*2,3,ELEC);px(g,YL,cx-9+i*2,y,2,1);px(g,YL,cx+8-i*2,y,2,1)}
  ell(g,cx,cy0-h*.46,5,5,[K,'#7a5410',YL,WH]);for(const s of [-1,1]){thick(g,DK[2],cx+s*14,cy0+h*.3,cx+s*34,cy0+h*.2,4);ell(g,cx+s*36,cy0+h*.2,5,5,ELEC);px(g,YL,cx+s*36-1,cy0+h*.2-1,3,3)}
  for(let i=0;i<7;i++)px(g,CY,cx-12+i*4,cy0+h*.3+(i%2)*3,2,1)}
function stormBody(g,w,h){const cx=w*.5,cy0=h/2;
  for(let k=0;k<3;k++){const rx=h*.5-k*10;for(let i=0;i<150;i++){const a=i/150*TAU;px(g,rampAt(ELEC,.45+.45*Math.sin(a*2+k),i,k),cx+Math.cos(a)*rx*1.3,cy0+Math.sin(a)*rx*.55,2,2)}}
  ell(g,cx,cy0,h*.26,h*.26,[K,'#7a5410',YL,WH]);for(let i=0;i<8;i++){const a=i/8*TAU;thick(g,DK[3],cx+Math.cos(a)*h*.2,cy0+Math.sin(a)*h*.2,cx+Math.cos(a)*h*.46,cy0+Math.sin(a)*h*.46,3);ell(g,cx+Math.cos(a)*h*.5,cy0+Math.sin(a)*h*.5,5,5,ELEC);px(g,YL,cx+Math.cos(a)*h*.5,cy0+Math.sin(a)*h*.5,2,2)}
  poly(g,[[w-14,cy0-10],[w-1,cy0-16],[w-1,cy0+16],[w-14,cy0+10]],DK)}
const ION={
  bullets:{orb:['orb',CY,WH],needle:['needle',YL,WH],big:['big',BL,CY,WH],shard:['shard',VI,CY,WH],dot:['dot',YL]},
  en:{
    ring:{kit:'orb',w:26,h:26,o:{pal:ELEC,eye:[K,VI,YL,WH],spikes:8,sl:4,sc:YL,tip:WH},hp:1.4,pts:170,vx:-48,mv:'sine',mvp:{a:36,f:3.2},at:'aim',atp:{n:3,sd:.6,sp:84,s:'orb',cd:2.2}},
    ringR:{kit:'drone',w:36,h:28,o:{pal:ELEC,spark:YL,eye:[K,VI,YL,WH]},hp:3,pts:270,vx:-40,mv:'sine',mvp:{a:24,f:1.6},at:'ring',atp:{n:9,sp:56,s:'orb',cd:2.8}},
    dart:{kit:'wedge',w:30,h:15,o:{pal:[K,VI,BL,CY,WH],flame:YL,guns:1,stripe:YL},hp:1.7,pts:190,vx:-150,mv:'dive',mvp:{track:1.1,sp:60},at:false},
    cross:{kit:'cross',w:32,h:32,o:{pal:DK,eye:YL,core:[K,'#7a5410',YL,WH]},hp:4.8,pts:350,vx:-30,mv:'bounce',mvp:{vy:24},at:'spiral',atp:{n:4,sp:62,s:'needle',cd:2.4}},
    pod:{kit:'hauler',w:46,h:28,o:{pal:DK,cargo:1,win:[K,VI,YL,WH],flame:YL},hp:8.5,pts:540,vx:-22,mv:'drift',mvp:{a:8},at:'aim',atp:{n:7,sd:1.3,sp:70,s:'big',cd:3.2}}
  },
  mini:{w:92,h:68,hp:1.9,x:230,bob:44,debris:[CY,YL,BL],build:teslaBody,core:{x:-1,y:-28,w:14,h:14},muz:[[-.4,-.38],[.2,.36]],
    phases:[[{a:'fan',n:5,sd:1,sp:78,cd:1.5,s:'needle',m:0},{a:'lance',n:8,sp:150,w:.8,cd:4.8,s:'needle'}],
            [{a:'fan',n:7,sd:1.2,sp:82,cd:1.3,s:'needle',m:0},{a:'ring',n:14,sp:54,cd:3.2,s:'orb',m:1},{a:'lance',n:9,sp:160,w:.7,cd:4,s:'needle'}],
            [{a:'fan',n:9,sd:1.4,sp:86,cd:1.1,s:'needle',m:0},{a:'ring',n:16,sp:58,cd:2.8,s:'orb',m:1},{a:'lance',n:10,sp:170,w:.6,cd:3.4,s:'needle'},{a:'curtain',n:11,sp:70,gap:34,cd:4.6,s:'big'}]]},
  boss:{w:180,h:124,hp:2.6,x:230,bob:34,charge:11,chargeDist:110,debris:[CY,YL,BL,WH],build:stormBody,core:{x:-8,y:0,w:36,h:36},boom:36,
    muz:[[-.4,0],[-.3,-.32],[-.3,.32]],
    phases:[[{a:'ring',n:14,sp:50,cd:3.2,s:'orb',m:0},{a:'fan',n:7,sd:1.2,sp:80,cd:1.8,s:'needle',m:1},{a:'lance',n:9,sp:150,w:.8,cd:5,s:'needle'}],
            [{a:'ring',n:16,sp:54,cd:2.8,s:'orb',m:0},{a:'fan',n:9,sd:1.4,sp:84,cd:1.5,s:'needle',m:2},{a:'lance',n:10,sp:165,w:.7,cd:4.2,s:'needle'},{a:'curtain',n:12,sp:72,gap:32,cd:5,s:'big'}],
            [{a:'ring',n:18,sp:58,cd:2.5,s:'orb',m:0},{a:'fan',n:11,sd:1.6,sp:88,cd:1.3,s:'needle',m:1},{a:'lance',n:11,sp:175,w:.6,cd:3.4,s:'needle'},{a:'curtain',n:13,sp:76,gap:30,cd:4,s:'big'},{a:'spiral',arms:5,cnt:16,gap:.09,sp:62,cd:5.5,s:'orb',m:0},{a:'summon',type:'dart',n:4,cd:8}]]},
  scene:K_=>({seed:15,angles:[0,.5,0,-.6,.4,0],sky:['#05021a','#0a0630','#1c1840','#352879'],skyFn:(x,y)=>y/200*.45+.1+Math.sin((x+y)*.03)*.05,stars:[BL,CY,YL,WH],
    layers:[
      {z:'bg',t:'clouds',ramp:['#05021a','#1c1840',VI,BL],seed:151,vx:6,alpha:.55,thr:.5},
      {z:'bg',t:'objs',n:7,vx:12,seed:152,list:[chunk(9,1,ROCKB),chunk(14,2,ROCKB),chunk(6,3,ROCKB)]},
      {z:'mid',t:'streak',n:10,vx:140,len:16,cols:[YL,WH,CY],seed:153},
      {z:'mid',t:'objs',n:6,vx:26,seed:154,list:[chunk(7,4,ROCKB),bubble(4,[K,VI,CY,WH])]},
      {z:'fg',t:'streak',n:26,vx:110,len:7,cols:[CY,WH,YL],seed:155},
      {z:'fg',t:'clouds',ramp:['#05021a','#0a0630','#352879'],seed:156,vx:42,alpha:.22,thr:.6}]}),
  script(sc,h){waves(h,[[3,'ring',6,.45,60,0],[8,'dart',6,.35,40,26],[13,'ringR',3,1.1,70,40],[19,'cross',3,1.5,50,45],[25,'ring',8,.35,120,0],[31,'pod',1,0,100,0],[34,'dart',7,.3,45,20],[40,'ringR',4,1,60,30],[45,'cross',4,1.3,50,40],[51,'ring',9,.3,100,0],[57,'pod',2,2,70,60],[62,'dart',8,.27,40,18],[67,'ringR',5,.9,60,26],[73,'cross',4,1.2,60,35],[78,'ring',9,.26,80,0]])}
};

/* =============== 16 SPORE CLOUD =============== */
const SP=['#102010',GD,GR,LG,PG],SPD=['#0a1a0a','#1c3a1c',GD,GR,LG];
function motherBody(g,w,h){const cx=w*.5,cy0=h/2;
  for(let i=0;i<7;i++){const a=i/7*TAU;ell(g,cx+Math.cos(a)*h*.28,cy0+Math.sin(a)*h*.26,h*.17,h*.15,SP)}
  ell(g,cx,cy0,h*.3,h*.28,[SPD[0],GD,GR,LG,PG]);ell(g,cx-6,cy0-3,5,5,[K,GD,YL,WH]);px(g,K,cx-8,cy0-5,3,4);
  for(let i=0;i<9;i++)px(g,YL,cx-h*.2+((i*17)%(h*.4)),cy0-h*.2+((i*11)%(h*.4)),2,2)}
function bloomBody(g,w,h){const cx=w*.5,cy0=h/2;
  thick(g,GD,cx,cy0,w-6,cy0+4,5);for(let k=0;k<3;k++){poly(g,[[w-30-k*18,cy0+4],[w-20-k*18,cy0-14],[w-14-k*18,cy0+6]],SP,k%2===1)}
  for(let i=0;i<9;i++){const a=i/9*TAU,px_=cx+Math.cos(a)*h*.34,py_=cy0+Math.sin(a)*h*.34;poly(g,[[cx,cy0],[px_+Math.sin(a)*14,py_-Math.cos(a)*14],[px_*1+Math.cos(a)*18-cx*0+cx*0,py_+Math.sin(a)*18],[px_-Math.sin(a)*14,py_+Math.cos(a)*14]],i%2?[mg,MG,YL,WH]:[GD,GR,LG,PG])}
  ell(g,cx,cy0,h*.2,h*.2,[K,'#7a5410',YL,WH]);ell(g,cx-4,cy0,6,8,[K,GD,LG,WH]);px(g,K,cx-6,cy0-2,4,6);for(let i=0;i<10;i++){const a=i/10*TAU;px(g,PG,cx+Math.cos(a)*h*.24,cy0+Math.sin(a)*h*.24,2,2)}}
const SPORE={
  bullets:{orb:['orb',GD,PG],spore:['big',GD,LG,YL],needle:['needle',PG,WH],shard:['shard',GD,PG,YL],dot:['dot',PG]},
  en:{
    ring:{kit:'jelly',w:34,h:24,o:{pal:SP,tn:5,tc:PG,eye:[K,GD,YL,WH]},hp:1.4,pts:170,vx:-40,mv:'sine',mvp:{a:30,f:2.4},at:'aim',atp:{n:3,sd:.7,sp:74,s:'orb',cd:2.4}},
    ringR:{kit:'beast',w:44,h:30,o:{pal:[K,'#1c3a1c',GR,LG,PG],eye:YL},hp:3.2,pts:280,vx:-34,mv:'sine',mvp:{a:18,f:1.4},at:'ring',atp:{n:10,sp:50,s:'spore',cd:3}},
    dart:{kit:'eel',w:46,h:20,o:{pal:[K,GD,GR,LG,PG],spark:YL,eye:YL,th:.4,lure:1},hp:1.8,pts:200,vx:-140,mv:'zig',mvp:{p:.4,a:80},at:false},
    cross:{kit:'orb',w:30,h:30,o:{pal:[K,'#7a5410',YL,'#ffffaa',WH],eye:[K,GD,LG,WH],spikes:10,sl:5,sc:GR,tip:PG},hp:4.6,pts:350,vx:-30,mv:'bounce',mvp:{vy:22},at:'spiral',atp:{n:5,sp:58,s:'needle',cd:2.6}},
    pod:{kit:'crab',w:42,h:30,o:{pal:SP,eye:YL,cannon:1},hp:8.6,pts:540,vx:-22,mv:'drift',mvp:{a:10},at:'aim',atp:{n:7,sd:1.4,sp:66,s:'spore',cd:3.2}}
  },
  mini:{w:96,h:70,hp:1.9,x:228,bob:44,debris:[GR,LG,YL],build:motherBody,core:{x:-6,y:-3,w:16,h:16},muz:[[-.4,0]],
    phases:[[{a:'fan',n:5,sd:1,sp:70,cd:1.7,s:'orb',m:0},{a:'rain',n:6,sp:56,cd:4.4,s:'dot'}],
            [{a:'fan',n:7,sd:1.2,sp:74,cd:1.5,s:'orb',m:0},{a:'ring',n:14,sp:50,cd:3.2,s:'spore',m:0},{a:'rain',n:7,both:1,sp:58,cd:4,s:'dot'}],
            [{a:'fan',n:9,sd:1.4,sp:78,cd:1.3,s:'orb',m:0},{a:'ring',n:16,sp:54,cd:2.8,s:'spore',m:0},{a:'rain',n:8,both:1,sp:60,cd:3.6,s:'dot'},{a:'mines',n:4,ay:-12,life:2.6,cd:4,s:'spore'}]]},
  boss:{w:184,h:128,hp:2.7,x:230,bob:36,charge:12,chargeDist:110,debris:[GR,LG,YL,MG],build:bloomBody,core:{x:-6,y:0,w:34,h:34},boom:38,
    muz:[[-.2,0],[-.15,-.3],[-.15,.3]],
    phases:[[{a:'spiral',arms:4,cnt:14,gap:.1,sp:56,cd:5.2,s:'orb',m:0},{a:'ring',n:14,sp:48,cd:3.4,s:'spore',m:0},{a:'rain',n:7,both:1,sp:58,cd:4.4,s:'dot'}],
            [{a:'spiral',arms:5,cnt:16,gap:.09,sp:58,cd:4.8,s:'orb',m:0},{a:'ring',n:16,sp:52,cd:3,s:'spore',m:0},{a:'rain',n:8,both:1,sp:60,cd:3.8,s:'dot'},{a:'mines',n:4,ay:-14,life:2.6,cd:3.8,s:'spore'}],
            [{a:'spiral',arms:6,cnt:18,gap:.08,sp:60,cd:4.2,s:'orb',m:0},{a:'ring',n:18,sp:56,cd:2.6,s:'spore',m:0},{a:'rain',n:9,both:1,sp:62,cd:3.4,s:'dot'},{a:'mines',n:5,ay:-16,life:2.6,cd:3.2,s:'spore'},{a:'curtain',n:13,sp:72,gap:30,cd:4.8,s:'orb'},{a:'summon',type:'ring',n:4,cd:8}]]},
  scene:K_=>({seed:16,angles:[0,.6,-.4,0,.8,-.5],sky:['#05100a','#0a2010','#1c3a1c','#3a6a2c'],skyFn:(x,y)=>y/200*.4+.12+Math.sin((x-y)*.025)*.06,stars:[GR,LG,YL,WH],
    layers:[
      {z:'bg',t:'clouds',ramp:['#05100a','#0a2010',GD,GR],seed:161,vx:5,alpha:.6,thr:.48},
      {z:'bg',t:'clouds',ramp:['#05100a','#1c3a1c',LG,YL],seed:162,vx:9,alpha:.3,thr:.58,fx:.03},
      {z:'bg',t:'objs',n:12,vx:14,seed:163,list:[bubble(4,SPD),bubble(6,SP),bubble(3,[K,GD,LG,PG])]},
      {z:'mid',t:'objs',n:7,vx:26,seed:164,list:[bubble(9,[K,GD,GR,LG]),bubble(5,[K,'#7a5410',YL,WH])]},
      {z:'fg',t:'streak',n:30,vx:60,len:4,cols:[LG,PG,YL],seed:165},
      {z:'fg',t:'clouds',ramp:['#05100a','#0a2010',GD],seed:166,vx:46,alpha:.24,thr:.6}]}),
  script(sc,h){waves(h,[[3,'ring',6,.5,60,0],[9,'dart',5,.4,40,28],[14,'ringR',3,1.2,70,40],[20,'cross',3,1.6,50,45],[26,'ring',7,.4,120,0],[32,'pod',1,0,100,0],[35,'dart',6,.35,45,22],[42,'ringR',4,1,60,30],[47,'cross',4,1.4,60,40],[52,'ring',8,.33,100,0],[58,'pod',2,2,70,60],[63,'dart',7,.3,40,20],[68,'ringR',4,1,70,28],[74,'cross',4,1.2,60,35],[78,'ring',8,.3,80,0]])}
};

/* =============== 17 MIRROR MAZE =============== */
const SIL=[K,GM,LM,LL,WH],ICE=[K,'#2a3a5a',cy,CY,WH];
function prismMini(g,w,h){const cx=w*.5,cy0=h/2;
  poly(g,[[cx-8,cy0-h*.46],[cx+34,cy0-6],[cx+8,cy0+h*.46],[cx-34,cy0+6]],ICE);poly(g,[[cx-8,cy0-h*.46],[cx+34,cy0-6],[cx,cy0]],[K,'#7a5410',YL,WH]);poly(g,[[cx-34,cy0+6],[cx,cy0],[cx+8,cy0+h*.46]],SIL);
  line(g,K,cx-8,cy0-h*.46,cx+8,cy0+h*.46);line(g,K,cx-34,cy0+6,cx+34,cy0-6);px(g,WH,cx-6,cy0-14,3,3)}
function kaleidoBoss(g,w,h){const cx=w*.5,cy0=h/2;
  for(let i=0;i<8;i++){const a0=i/8*TAU,a1=(i+1)/8*TAU,r1=h*.48;poly(g,[[cx,cy0],[cx+Math.cos(a0)*r1,cy0+Math.sin(a0)*r1*.95],[cx+Math.cos(a1)*r1,cy0+Math.sin(a1)*r1*.95]],[[K,'#2a3a5a',cy,CY,WH],[K,VI,mg,MG,WH],[K,'#7a5410',YL,'#ffffaa',WH],SIL][i%4],i>3)}
  for(let i=0;i<8;i++){const a=i/8*TAU;line(g,K,cx,cy0,cx+Math.cos(a)*h*.48,cy0+Math.sin(a)*h*.46)}
  ell(g,cx,cy0,h*.14,h*.14,[K,'#2a3a5a',CY,WH]);ell(g,cx-3,cy0,5,6,[K,rd,RD,WH]);px(g,K,cx-5,cy0-2,3,5);
  for(let i=0;i<8;i++){const a=i/8*TAU;poly(g,[[cx+Math.cos(a)*h*.46,cy0+Math.sin(a)*h*.44],[cx+Math.cos(a+.15)*h*.56,cy0+Math.sin(a+.15)*h*.52],[cx+Math.cos(a-.15)*h*.56,cy0+Math.sin(a-.15)*h*.52]],SIL)}}
const MIRROR={
  bullets:{orb:['orb',cy,WH],needle:['needle',CY,WH],big:['big',cy,CY,WH],shard:['shard',cy,WH,YL],dot:['dot',WH]},
  en:{
    ring:{kit:'crystal',w:30,h:30,o:{pal:ICE,core:[K,'#2a3a5a',CY,WH]},hp:1.5,pts:180,vx:-46,mv:'sine',mvp:{a:34,f:3},at:'aim',atp:{n:3,sd:.6,sp:86,s:'needle',cd:2.2}},
    ringR:{kit:'wedge',w:34,h:18,o:{pal:SIL,flame:CY,guns:1,stripe:CY,cano:[K,'#2a3a5a',CY,WH]},hp:3,pts:290,vx:-44,mv:'sine',mvp:{a:24,f:1.8},at:'aim',atp:{n:5,sd:1,sp:82,s:'shard',cd:2.7}},
    dart:{kit:'eel',w:44,h:16,o:{pal:SIL,spark:CY,eye:CY,tent:1},hp:1.8,pts:200,vx:-155,mv:'zig',mvp:{p:.4,a:84},at:false},
    cross:{kit:'eye',w:32,h:32,o:{pal:SIL,iris:[K,'#2a3a5a',CY,WH]},hp:5,pts:360,vx:-30,mv:'bounce',mvp:{vy:24},at:'ring',atp:{n:10,sp:54,s:'big',cd:2.8}},
    pod:{kit:'manta',w:48,h:34,o:{pal:ICE,fins:1,eye:WH},hp:8.8,pts:560,vx:-22,mv:'drift',mvp:{a:9},at:'aim',atp:{n:9,sd:1.5,sp:70,s:'shard',cd:3}}
  },
  mini:{w:96,h:72,hp:1.9,x:230,bob:42,debris:[CY,WH,YL],build:prismMini,core:{x:0,y:-4,w:20,h:20},muz:[[-.4,-.1]],
    phases:[[{a:'fan',n:6,sd:1.1,sp:82,cd:1.5,s:'needle',m:0},{a:'lance',n:8,sp:150,w:.8,cd:4.6,s:'needle'}],
            [{a:'fan',n:8,sd:1.3,sp:86,cd:1.3,s:'needle',m:0},{a:'ring',n:14,sp:54,cd:3.2,s:'big',m:0},{a:'lance',n:9,sp:160,w:.7,cd:3.8,s:'needle'}],
            [{a:'fan',n:10,sd:1.5,sp:90,cd:1.1,s:'needle',m:0},{a:'ring',n:16,sp:58,cd:2.8,s:'big',m:0},{a:'lance',n:10,sp:170,w:.6,cd:3.2,s:'needle'},{a:'curtain',n:11,sp:72,gap:34,cd:4.6,s:'shard'}]]},
  boss:{w:176,h:128,hp:2.8,x:230,bob:32,charge:11,chargeDist:110,debris:[CY,WH,YL,MG],build:kaleidoBoss,core:{x:-4,y:0,w:30,h:30},boom:38,
    muz:[[-.4,0],[-.3,-.3],[-.3,.3]],
    phases:[[{a:'fan',n:7,sd:1.2,sp:84,cd:1.6,s:'needle',m:0},{a:'ring',n:16,sp:52,cd:3.2,s:'big',m:0},{a:'lance',n:9,sp:150,w:.8,cd:5,s:'needle'}],
            [{a:'fan',n:9,sd:1.4,sp:88,cd:1.4,s:'needle',m:1},{a:'fan',n:9,sd:1.4,sp:88,cd:1.4,s:'needle',m:2,at:.9},{a:'ring',n:18,sp:56,cd:2.8,s:'big',m:0},{a:'lance',n:10,sp:165,w:.7,cd:4.2,s:'needle'},{a:'curtain',n:12,sp:74,gap:32,cd:5,s:'shard'}],
            [{a:'fan',n:11,sd:1.6,sp:92,cd:1.2,s:'needle',m:1},{a:'fan',n:11,sd:1.6,sp:92,cd:1.2,s:'needle',m:2,at:.7},{a:'ring',n:20,sp:60,cd:2.5,s:'big',m:0},{a:'lance',n:12,sp:180,w:.6,cd:3.4,s:'needle'},{a:'curtain',n:13,sp:78,gap:30,cd:4,s:'shard'},{a:'spiral',arms:6,cnt:18,gap:.08,sp:64,cd:5.2,s:'orb',m:0},{a:'summon',type:'dart',n:4,cd:8}]]},
  scene:K_=>({seed:17,angles:[0,.9,.2,-.9,0,.7,-.4],sky:['#02030a','#0a1020','#1c2440','#3c5a7a'],skyFn:(x,y)=>.12+y/200*.35+Math.sin((x+y*1.3)*.04)*.05,stars:[CY,WH,WH,LL],
    layers:[
      {z:'bg',t:'clouds',ramp:['#02030a','#1c2440','#5a7a9a',CY],seed:171,vx:7,alpha:.4,thr:.5,fx:.025,fy:.1},
      {z:'bg',t:'objs',n:8,vx:11,seed:172,list:[darken(shard(60,90,ICE),.4),darken(shard(40,70,SIL),.4),darken(shard(80,50,ICE),.45)]},
      {z:'mid',t:'objs',n:7,vx:24,seed:173,list:[shard(24,38,ICE),shard(18,28,SIL),shard(30,20,ICE)]},
      {z:'mid',t:'streak',n:16,vx:90,len:12,cols:[CY,WH,LL],seed:174},
      {z:'fg',t:'streak',n:26,vx:140,len:10,cols:[WH,CY],seed:175},
      {z:'fg',t:'objs',n:2,vx:80,seed:176,list:[darken(shard(50,80,ICE),.3)]}]}),
  script(sc,h){waves(h,[[3,'ring',6,.45,60,0],[8,'dart',6,.35,40,26],[13,'ringR',4,1,70,38],[19,'cross',3,1.5,50,45],[25,'ring',8,.34,120,0],[31,'pod',1,0,100,0],[34,'dart',7,.3,45,20],[40,'ringR',5,.9,60,30],[45,'cross',4,1.3,50,40],[51,'ring',9,.3,100,0],[57,'pod',2,2,70,60],[62,'dart',8,.26,40,18],[67,'ringR',5,.85,60,26],[73,'cross',4,1.2,60,35],[78,'ring',9,.26,80,0]])}
};
PACKS[15]=B.mkPack(ION);PACKS[16]=B.mkPack(SPORE);PACKS[17]=B.mkPack(MIRROR);
})();
