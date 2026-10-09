/* THE SWARM, stages 4 and 5 (planets 18 and 19), for the small ships: 18 DEAD STAR YARD and 19 THE HIVE QUEEN. Needs packs/big.js. */
(function(){
'use strict';
const B=window.BIGKIT,{px,cnv,mod,clamp,rng,ell,poly,thick,line,rampAt,darken,K,NV,VI,BL,PU,LP,LV,mg,MG,rd,BR,TN,OR,YG,YL,GR,GD,LG,PG,cy,CY,D,GM,LM,LL,WH,RD}=B;
const TAU=Math.PI*2,PI=Math.PI;
function waves(h,rows){const L=h.level;for(const r of rows)h.add(r[0],r[1],r[2]+(L-1)*(r[7]||1),r[3],r[4],r[5],r[6])}
const bubble=(r,ramp)=>cnv(r*2+2,r*2+2,g=>{ell(g,r+1,r+1,r,r,ramp);px(g,WH,r-1,r-1,2,1)});
const hullB=(w,hh,seed,ramp,lamp)=>{const r=rng(seed);return cnv(w,hh,g=>{const c=hh*.5;poly(g,[[0,c],[w*.1,c-hh*.3],[w*.8,c-hh*.32],[w,c-hh*.05],[w,c+hh*.1],[w*.8,c+hh*.3],[w*.1,c+hh*.3]],ramp);
  poly(g,[[w*.35,c-hh*.3],[w*.45,c-hh*.5],[w*.62,c-hh*.5],[w*.7,c-hh*.3]],ramp);for(let i=0;i<5;i++){const x=w*.12+r()*w*.7;g.clearRect(x,c-hh*.2+r()*hh*.3,3+r()*5,2)}for(let i=0;i<10;i++)px(g,lamp,w*.1+r()*w*.8,c-hh*.2+r()*hh*.4,1,1)})};
const chunk=(r,seed,ramp)=>{const q=rng(seed);return cnv(r*2+2,r*2+2,g=>{const pts=[];for(let i=0;i<9;i++){const a=i/9*TAU,rr=r*(.6+q()*.4);pts.push([r+1+Math.cos(a)*rr,r+1+Math.sin(a)*rr])}poly(g,pts,ramp)})};

/* =============== 18 DEAD STAR YARD =============== */
const BONE=['#1c1c1c','#444444',GM,LL,WH],ASH=[K,'#1c1c1c',D,GM,LL];
function wraithBody(g,w,h){const cx=w*.5,cy0=h/2;
  poly(g,[[cx-30,cy0],[cx-18,cy0-h*.4],[cx+20,cy0-h*.34],[cx+36,cy0],[cx+20,cy0+h*.34],[cx-18,cy0+h*.4]],ASH);
  for(let i=0;i<6;i++){const y=cy0-h*.3+i*(h*.6/5);line(g,BONE[2],cx-20,y,cx+28,y);px(g,RD,cx-22,y,2,1)}
  ell(g,cx-14,cy0-4,6,6,[K,rd,RD,WH]);px(g,K,cx-16,cy0-6,3,5);for(let i=0;i<3;i++)thick(g,BONE[3],cx+30,cy0-8+i*8,cx+44,cy0-12+i*10,2)}
function paleKing(g,w,h){const cy0=h/2;
  poly(g,[[4,cy0+8],[16,cy0-24],[w*.6,cy0-32],[w-6,cy0-14],[w-4,cy0+10],[w*.55,cy0+34],[16,cy0+26]],[D,GM,LM,LL,WH]);
  for(let i=0;i<9;i++){const x=22+i*(w-50)/9;line(g,K,x,cy0-26,x+4,cy0+26);px(g,WH,x+1,cy0-24,2,2)}                       // ribs
  g.clearRect(w*.35,cy0-8,20,16);g.clearRect(w*.58,cy0+6,14,12);
  poly(g,[[w*.3,cy0-32],[w*.4,cy0-h*.46],[w*.62,cy0-h*.46],[w*.68,cy0-30]],[D,GM,LM,LL]);
  for(let i=0;i<5;i++){ell(g,w*.2+i*w*.12,cy0-33,7,5,[D,GM,LM,LL]);thick(g,K,w*.2+i*w*.12-3,cy0-33,w*.2+i*w*.12-22,cy0-30,3)}
  for(let i=0;i<4;i++){ell(g,w*.24+i*w*.13,cy0+35,7,5,[D,GM,LM,LL]);thick(g,K,w*.24+i*w*.13-3,cy0+35,w*.24+i*w*.13-22,cy0+32,3)}
  poly(g,[[w*.52,cy0-8],[w-18,cy0-12],[w-18,cy0+12],[w*.52,cy0+8]],[K,rd,RD,WH]);ell(g,w-24,cy0,9,11,[K,rd,OR,YL,WH]);
  for(let i=0;i<3;i++)px(g,OR,w-2,cy0-12+i*12,3,5);
  poly(g,[[w*.1,cy0-4],[2,cy0-12],[0,cy0+12],[w*.1,cy0+4]],[D,GM,LM])}
const DEADS={
  bullets:{orb:['orb',rd,RD],needle:['needle',RD,WH],big:['big',rd,OR,YL],shard:['shard',D,LL,WH],dot:['dot',RD]},
  en:{
    ring:{kit:'gear',w:28,h:28,o:{pal:BONE,teeth:9,core:[K,rd,OR,YL]},hp:1.5,pts:180,vx:-46,mv:'sine',mvp:{a:36,f:3},at:'aim',atp:{n:3,sd:.6,sp:84,s:'orb',cd:2.2}},
    ringR:{kit:'drone',w:38,h:30,o:{pal:BONE,spark:RD,eye:[K,rd,OR,YL]},hp:3.2,pts:290,vx:-38,mv:'sine',mvp:{a:24,f:1.5},at:'ring',atp:{n:10,sp:52,s:'orb',cd:3}},
    dart:{kit:'wedge',w:32,h:15,o:{pal:BONE,flame:RD,guns:1,stripe:RD},hp:1.8,pts:200,vx:-150,mv:'dive',mvp:{track:1.2,sp:60},at:false},
    cross:{kit:'eye',w:32,h:32,o:{pal:ASH,iris:[K,rd,RD,WH]},hp:5,pts:370,vx:-30,mv:'bounce',mvp:{vy:24},at:'ring',atp:{n:10,sp:54,s:'big',cd:2.8}},
    pod:{kit:'hauler',w:48,h:30,o:{pal:BONE,cargo:1,win:[K,rd,OR,YL],flame:OR},hp:9,pts:580,vx:-22,mv:'drift',mvp:{a:8},at:'aim',atp:{n:9,sd:1.5,sp:70,s:'shard',cd:3}}
  },
  mini:{w:92,h:66,hp:2,x:230,bob:42,debris:[LL,GM,RD],build:wraithBody,core:{x:-14,y:-4,w:18,h:18},muz:[[-.45,0]],
    phases:[[{a:'fan',n:6,sd:1.1,sp:80,cd:1.5,s:'orb',m:0},{a:'lance',n:8,sp:150,w:.8,cd:4.8,s:'needle'}],
            [{a:'fan',n:8,sd:1.3,sp:84,cd:1.3,s:'orb',m:0},{a:'ring',n:14,sp:54,cd:3.2,s:'big',m:0},{a:'lance',n:9,sp:160,w:.7,cd:4,s:'needle'}],
            [{a:'fan',n:10,sd:1.5,sp:88,cd:1.1,s:'orb',m:0},{a:'ring',n:16,sp:58,cd:2.8,s:'big',m:0},{a:'lance',n:10,sp:170,w:.6,cd:3.4,s:'needle'},{a:'summon',type:'dart',n:3,cd:8}]]},
  boss:{w:204,h:130,hp:3,x:218,bob:24,charge:10,chargeDist:110,debris:[LL,GM,RD,OR],build:paleKing,core:{x:78,y:0,w:24,h:28},boom:44,
    muz:[[-.42,-.3],[-.42,0],[-.42,.3]],
    phases:[[{a:'fan',n:7,sd:1.2,sp:82,cd:1.5,s:'orb',m:0},{a:'fan',n:7,sd:1.2,sp:82,cd:1.5,s:'orb',m:2,at:.9},{a:'ring',n:16,sp:50,cd:3.4,s:'big',m:1},{a:'curtain',n:12,sp:72,gap:32,cd:5,s:'shard'}],
            [{a:'fan',n:9,sd:1.4,sp:86,cd:1.3,s:'orb',m:0},{a:'fan',n:9,sd:1.4,sp:86,cd:1.3,s:'orb',m:2,at:.8},{a:'ring',n:18,sp:54,cd:3,s:'big',m:1},{a:'curtain',n:13,sp:76,gap:30,cd:4.4,s:'shard'},{a:'lance',n:10,sp:165,w:.7,cd:4.6,s:'needle'},{a:'summon',type:'dart',n:4,cd:8}],
            [{a:'fan',n:11,sd:1.6,sp:90,cd:1.1,s:'orb',m:0},{a:'fan',n:11,sd:1.6,sp:90,cd:1.1,s:'orb',m:2,at:.7},{a:'ring',n:20,sp:58,cd:2.6,s:'big',m:1},{a:'curtain',n:14,sp:80,gap:28,cd:3.8,s:'shard'},{a:'lance',n:12,sp:180,w:.6,cd:3.6,s:'needle'},{a:'spiral',arms:6,cnt:20,gap:.08,sp:64,cd:5,s:'orb',m:1},{a:'summon',type:'ringR',n:3,cd:8},{a:'summon',type:'dart',n:5,cd:6.5}]]},
  scene:K_=>({seed:18,angles:[0,.6,0,-.7,.3,0,-.4],sky:['#050505','#1c1c1c','#2a1a1a','#444444'],skyFn:(x,y)=>.1+.35*Math.exp(-Math.pow((x-250)/90,2)-Math.pow((y-70)/60,2))+y/200*.08,stars:[GM,LL,WH,RD],
    layers:[
      {z:'bg',t:'objs',n:1,vx:2,seed:181,list:[cnv(70,70,g=>{ell(g,35,35,22,22,[GM,LL,WH,WH]);for(let i=0;i<60;i++){const a=i/60*TAU;px(g,'#ffffff55',35+Math.cos(a)*32,35+Math.sin(a)*32,2,2)}})],pos:[[250,64]]},
      {z:'bg',t:'clouds',ramp:['#050505','#1c1c1c','#444444',GM],seed:182,vx:6,alpha:.5,thr:.5},
      {z:'bg',t:'objs',n:5,vx:9,seed:183,list:[darken(hullB(190,70,1,ASH,RD),.5),darken(hullB(140,54,2,ASH,OR),.5),darken(hullB(220,80,3,ASH,RD),.5)],lights:RD},
      {z:'mid',t:'objs',n:6,vx:24,seed:184,list:[chunk(7,1,BONE),chunk(11,2,BONE),chunk(5,3,BONE)]},
      {z:'fg',t:'streak',n:24,vx:110,len:6,cols:[LL,GM,RD],seed:185},
      {z:'fg',t:'clouds',ramp:['#050505','#1c1c1c','#2a2a2a'],seed:186,vx:46,alpha:.25,thr:.58}]}),
  script(sc,h){waves(h,[[3,'ring',6,.45,60,0],[8,'dart',6,.35,40,26],[13,'ringR',4,1,70,36],[18,'cross',3,1.5,50,45],[24,'ring',8,.34,120,0],[30,'pod',1,0,100,0],[33,'dart',7,.3,45,20],[39,'ringR',5,.95,60,28],[44,'cross',4,1.3,50,40],[49,'ring',9,.3,100,0],[55,'pod',2,2,70,60],[60,'dart',8,.26,40,18],[65,'ringR',5,.9,60,26],[71,'cross',5,1.1,60,32],[76,'ring',10,.25,80,0]])}
};

/* =============== 19 THE HIVE QUEEN =============== */
const HV=['#3a0a38',PU,mg,MG,YL],GOLDH=['#2a1500',BR,OR,YL,WH];
function guardBody(g,w,h){const cx=w*.5,cy0=h/2;
  ell(g,cx+10,cy0,h*.34,h*.3,HV);for(let i=0;i<4;i++)line(g,K,cx+4+i*9,cy0-h*.28,cx+8+i*9,cy0+h*.28);
  ell(g,cx-24,cy0,h*.2,h*.2,HV);px(g,YL,cx-30,cy0-4,4,3);px(g,YL,cx-30,cy0+2,4,3);thick(g,GOLDH[3],cx-38,cy0-4,cx-48,cy0-10,3);thick(g,GOLDH[3],cx-38,cy0+4,cx-48,cy0+10,3);
  for(const s of [-1,1]){thick(g,HV[2],cx+4,cy0+s*h*.3,cx-8,cy0+s*h*.46,3);thick(g,HV[2],cx+20,cy0+s*h*.3,cx+30,cy0+s*h*.46,3)}
  poly(g,[[cx+6,cy0-h*.3],[cx+30,cy0-h*.5],[cx+40,cy0-h*.2]],[PU,mg,MG,WH])}
function queenBoss(g,w,h){const cy0=h/2;
  for(let i=0;i<4;i++){ell(g,w*.74-i*20,cy0+4,16-i*2,13-i*2,HV);line(g,K,w*.74-i*20-8,cy0-10,w*.74-i*20-6,cy0+16)}                         // the abdomen
  poly(g,[[w*.5,cy0-8],[w*.62,cy0-h*.52],[w*.86,cy0-h*.46],[w*.84,cy0-6]],[mg,MG,YL,WH]);poly(g,[[w*.5,cy0+8],[w*.62,cy0+h*.52],[w*.86,cy0+h*.46],[w*.84,cy0+6]],[mg,MG,YL,WH],true);   // wings
  for(let i=0;i<5;i++){px(g,K,w*.6+i*7,cy0-h*.4+(i%2)*6,1,h*.3);px(g,K,w*.6+i*7,cy0+h*.12+(i%2)*6,1,h*.3)}
  ell(g,w*.38,cy0,20,17,HV);ell(g,w*.2,cy0,14,13,HV);                                                                                   // thorax and head
  px(g,YL,w*.2-8,cy0-6,6,5);px(g,YL,w*.2-8,cy0+2,6,5);px(g,K,w*.2-6,cy0-5,2,3);px(g,K,w*.2-6,cy0+3,2,3);
  for(let s=-1;s<=1;s+=2){poly(g,[[w*.1,cy0+s*6],[3,cy0+s*14],[w*.1+6,cy0+s*12]],GOLDH);thick(g,GOLDH[3],w*.2,cy0+s*10,w*.12,cy0+s*h*.32,3)}
  poly(g,[[w*.14,cy0-12],[w*.2,cy0-26],[w*.27,cy0-12]],GOLDH);for(let i=0;i<3;i++)px(g,YL,w*.17+i*3,cy0-14,2,2);                                 // a crown
  ell(g,w*.38,cy0,7,7,[K,'#7a5410',YL,WH])}
const HIVE={
  bullets:{orb:['orb',mg,YL],needle:['needle',YL,WH],big:['big',mg,MG,YL],shard:['shard',PU,MG,YL],dot:['dot',YL]},
  en:{
    ring:{kit:'orb',w:28,h:28,o:{pal:HV,eye:[K,PU,YL,WH],claws:1,plate:1},hp:1.6,pts:190,vx:-48,mv:'sine',mvp:{a:36,f:3.4},at:'aim',atp:{n:3,sd:.6,sp:86,s:'needle',cd:2.1}},
    ringR:{kit:'crab',w:38,h:28,o:{pal:HV,eye:YL,cannon:1},hp:3.4,pts:300,vx:-38,mv:'sine',mvp:{a:20,f:1.6},at:'aim',atp:{n:5,sd:1,sp:80,s:'orb',cd:2.6}},
    dart:{kit:'eel',w:46,h:18,o:{pal:[K,PU,mg,MG,YL],spark:YL,tent:1,eye:YL},hp:1.9,pts:210,vx:-158,mv:'dive',mvp:{track:1.2,sp:66},at:false},
    cross:{kit:'cross',w:34,h:34,o:{pal:HV,eye:YL,core:[K,'#7a5410',YL,WH]},hp:5.6,pts:400,vx:-30,mv:'bounce',mvp:{vy:26},at:'spiral',atp:{n:6,sp:60,s:'big',cd:2.4}},
    pod:{kit:'beast',w:50,h:34,o:{pal:HV,eye:YL},hp:10,pts:620,vx:-22,mv:'drift',mvp:{a:9},at:'aim',atp:{n:9,sd:1.5,sp:72,s:'shard',cd:3},at2:'launch'}
  },
  mini:{w:104,h:72,hp:2,x:228,bob:42,debris:[mg,MG,YL],build:guardBody,core:{x:-24,y:0,w:22,h:22},muz:[[-.45,-.05]],
    phases:[[{a:'fan',n:7,sd:1.1,sp:82,cd:1.5,s:'needle',m:0},{a:'ring',n:14,sp:52,cd:3.6,s:'orb',m:0}],
            [{a:'fan',n:9,sd:1.3,sp:86,cd:1.3,s:'needle',m:0},{a:'ring',n:16,sp:56,cd:3,s:'orb',m:0},{a:'summon',type:'dart',n:3,cd:8}],
            [{a:'fan',n:11,sd:1.5,sp:90,cd:1.1,s:'needle',m:0},{a:'ring',n:18,sp:60,cd:2.6,s:'orb',m:0},{a:'lance',n:10,sp:170,w:.7,cd:4.4,s:'needle'},{a:'summon',type:'dart',n:4,cd:7}]]},
  boss:{w:208,h:132,hp:3.4,x:216,bob:24,charge:10,chargeDist:110,debris:[mg,MG,YL,OR],build:queenBoss,core:{x:-24,y:0,w:28,h:28},boom:48,
    muz:[[-.42,-.05],[-.3,-.22],[-.3,.22]],
    phases:[[{a:'fan',n:7,sd:1.2,sp:84,cd:1.5,s:'needle',m:0},{a:'ring',n:16,sp:50,cd:3.4,s:'big',m:1},{a:'curtain',n:12,sp:72,gap:32,cd:5,s:'orb'},{a:'summon',type:'dart',n:3,cd:8}],
            [{a:'fan',n:9,sd:1.4,sp:88,cd:1.3,s:'needle',m:0},{a:'ring',n:18,sp:54,cd:3,s:'big',m:1},{a:'curtain',n:13,sp:76,gap:30,cd:4.4,s:'orb'},{a:'spiral',arms:4,cnt:16,gap:.09,sp:60,cd:5.6,s:'orb',m:2},{a:'summon',type:'dart',n:4,cd:7}],
            [{a:'fan',n:11,sd:1.6,sp:92,cd:1.1,s:'needle',m:0},{a:'ring',n:20,sp:58,cd:2.6,s:'big',m:1},{a:'curtain',n:14,sp:80,gap:28,cd:3.8,s:'orb'},{a:'spiral',arms:6,cnt:20,gap:.08,sp:64,cd:4.8,s:'orb',m:2},{a:'lance',n:12,sp:180,w:.6,cd:3.8,s:'needle'},{a:'rain',n:8,both:1,sp:66,cd:4.4,s:'dot'},{a:'summon',type:'ringR',n:3,cd:8},{a:'summon',type:'dart',n:5,cd:6}]]},
  scene:K_=>({seed:19,angles:[0,.7,0,-.7,.4,-.3,.9],sky:['#0a0210','#2a0a2a','#6f3d86','#cc44cc'],skyFn:(x,y)=>y/200*.4+.1+Math.sin((x+y)*.03)*.06,stars:[PU,MG,YL,WH],
    layers:[
      {z:'bg',t:'clouds',ramp:['#0a0210','#3a0a38',PU,mg],seed:191,vx:5,alpha:.6,thr:.48},
      {z:'bg',t:'clouds',ramp:['#0a0210','#2a1500',BR,OR],seed:192,vx:9,alpha:.25,thr:.6},
      {z:'bg',t:'objs',n:12,vx:14,seed:193,list:[bubble(5,[K,PU,mg,YL]),bubble(8,[K,'#3a0a38',mg,MG]),bubble(3,[K,BR,OR,YL])]},
      {z:'mid',t:'objs',n:7,vx:26,seed:194,list:[bubble(10,[K,PU,mg,MG]),bubble(6,[K,'#7a5410',YL,WH])]},
      {z:'fg',t:'streak',n:26,vx:100,len:5,cols:[MG,YL,WH],seed:195},
      {z:'fg',t:'clouds',ramp:['#0a0210','#3a0a38',PU],seed:196,vx:44,alpha:.24,thr:.6}]}),
  script(sc,h){waves(h,[[3,'ring',7,.4,60,0],[8,'dart',7,.33,40,26],[13,'ringR',4,1.1,70,36],[18,'cross',3,1.4,50,45],[24,'ring',9,.32,120,0],[30,'pod',1,0,100,0],[33,'dart',8,.28,45,20],[39,'ringR',5,.95,60,28],[44,'cross',4,1.2,50,40],[49,'ring',10,.28,100,0],[55,'pod',2,2,70,60],[60,'dart',9,.25,40,18],[65,'ringR',5,.9,60,26],[71,'cross',5,1.1,60,32],[76,'ring',11,.24,80,0],[79,'pod',1,0,100,0]])}
};
PACKS[18]=B.mkPack(DEADS);PACKS[19]=B.mkPack(HIVE);
})();
