/* WE NEED A BIGGER SHIP, stages 1 and 2: 10 TITAN GRAVEYARD and 11 LEVIATHAN NEBULA. Needs packs/big.js. */
(function(){
'use strict';
const B=window.BIGKIT,{px,cnv,mod,clamp,rng,ell,poly,thick,line,rampAt,darken,K,NV,VI,BL,PU,LP,LV,mg,MG,rd,BR,TN,OR,YG,YL,GR,GD,LG,PG,cy,CY,D,GM,LM,LL,WH,RD}=B;
const TAU=Math.PI*2;
/* wave table helper: spec rows are [t, type, n, gap, y0, dy, opts]; harder levels add more of everything */
function waves(h,rows){const L=h.level;for(const r of rows){h.add(r[0],r[1],r[2]+(L-1)*(r[7]||1),r[3],r[4],r[5],r[6])}}
/* a dead warship hull for the backdrop */
function hulk(w,hh,seed,ramp,lamp){const r=rng(seed);return cnv(w,hh,g=>{
  const cy0=hh*.55;poly(g,[[0,cy0],[w*.12,cy0-hh*.28],[w*.7,cy0-hh*.3],[w,cy0-hh*.1],[w,cy0+hh*.14],[w*.3,cy0+hh*.28],[w*.05,cy0+hh*.18]],ramp);
  poly(g,[[w*.3,cy0-hh*.28],[w*.42,cy0-hh*.5],[w*.62,cy0-hh*.5],[w*.7,cy0-hh*.28]],ramp);
  for(let i=0;i<7;i++){const x=w*.12+r()*w*.7,y=cy0-hh*.2+r()*hh*.3;px(g,ramp[0],x,y,2+r()*6,1)}
  for(let i=0;i<9;i++){const x=w*.1+r()*w*.8,y=cy0-hh*.15+r()*hh*.3;px(g,lamp,x,y,1,1)}
  for(let i=0;i<5;i++){const x=r()*w,y=cy0-hh*.4+r()*hh*.8,q=2+r()*4;g.clearRect(x,y,q,q*.7)}   // broken holes
})}
const chunk=(r,seed,ramp)=>{const q=rng(seed);return cnv(r*2+2,r*2+2,g=>{const pts=[];for(let i=0;i<9;i++){const a=i/9*TAU,rr=r*(.6+q()*.4);pts.push([r+1+Math.cos(a)*rr,r+1+Math.sin(a)*rr])}poly(g,pts,ramp)})};
const bubble=(r,ramp)=>cnv(r*2+2,r*2+2,g=>{ell(g,r+1,r+1,r,r,ramp);px(g,WH,r-1,r-1,2,1)});

/* =============== 10 TITAN GRAVEYARD =============== */
const RUST=['#1c1008',BR,TN,'#d8a878',YL],WRECK=['#0a0604','#2a1a14',BR,TN,'#d8a878'],TEAL=[K,'#1b3036','#3c6a78',cy,CY],DEAD=['#07050e','#1c1008','#2a1a14',BR,TN];
function titanBoss(g,w,h){
  const cy0=h/2;
  poly(g,[[2,cy0+8],[10,cy0-22],[w*.62,cy0-30],[w-4,cy0-12],[w-4,cy0+14],[w*.55,cy0+34],[10,cy0+24]],WRECK);               // main hull
  poly(g,[[w*.3,cy0-30],[w*.38,cy0-h*.46],[w*.62,cy0-h*.46],[w*.7,cy0-26]],WRECK);poly(g,[[w*.34,cy0-h*.44],[w*.58,cy0-h*.44],[w*.58,cy0-h*.36],[w*.34,cy0-h*.36]],TEAL);   // bridge
  for(let i=0;i<4;i++){ell(g,w*.26+i*w*.13,cy0-28,7,5,WRECK);thick(g,K,w*.26+i*w*.13-3,cy0-30,w*.26+i*w*.13-16,cy0-26,3)}    // top turrets
  for(let i=0;i<3;i++){ell(g,w*.3+i*w*.14,cy0+30,7,5,WRECK);thick(g,K,w*.3+i*w*.14-3,cy0+31,w*.3+i*w*.14-16,cy0+28,3)}
  for(let i=0;i<9;i++)px(g,WRECK[0],10+i*(w-24)/9,cy0-16,1,30);                                                                // armour seams
  for(let i=0;i<12;i++)px(g,TEAL[3],14+((i*37)%(w-34)),cy0-12+((i*13)%26),2,1);                                              // lamps
  g.clearRect(w*.2,cy0+6,16,8);g.clearRect(w*.46,cy0-20,10,6);g.clearRect(w*.7,cy0+14,9,6);g.clearRect(w*.12,cy0-8,7,5);for(let i=0;i<14;i++)px(g,CY,w*.18+((i*47)%(w*.6)),cy0+8+((i*13)%10),1,1);                                                                // battle damage
  ell(g,w-12,cy0,9,11,[K,'#1b3036',cy,CY,WH]);                                                                                 // the reactor glows through the hull
  px(g,YL,w-15,cy0-4,3,2);for(let i=0;i<3;i++){px(g,'#ff9966',w-2,cy0-12+i*10,3,4)}                                          // engines
  poly(g,[[2,cy0+8],[-0,cy0+2],[2,cy0-2]],WRECK);
}
function wardenBody(g,w,h){
  const cy0=h/2;
  poly(g,[[w*.2,cy0],[w*.3,cy0-h*.4],[w*.75,cy0-h*.35],[w-3,cy0],[w*.75,cy0+h*.35],[w*.3,cy0+h*.4]],WRECK);
  ell(g,w*.35,cy0,12,12,TEAL);px(g,K,w*.35-6,cy0-2,10,4);px(g,CY,w*.35-4,cy0-1,6,2);
  for(let s=-1;s<=1;s+=2){thick(g,WRECK[2],w*.55,cy0+s*h*.3,6,cy0+s*h*.42,5);ell(g,8,cy0+s*h*.42,6,5,WRECK);thick(g,K,6,cy0+s*h*.42,0,cy0+s*h*.42,3)}
  for(let i=0;i<6;i++)px(g,WRECK[0],w*.4+i*5,cy0-h*.3,1,h*.6);
}
const TITAN={
  pal:RUST,
  bullets:{orb:['orb',cy,CY],shard:['shard',BR,OR,YL],big:['big',rd,OR,YL],dot:['dot',cy]},
  en:{
    ring:{kit:'orb',w:26,h:26,o:{pal:WRECK,eye:TEAL,claws:1,plate:1,holes:4,rimc:CY},hp:1.5,pts:160,vx:-44,mv:'sine',mvp:{a:36,f:3},at:'aim',atp:{n:1,sp:78,s:'orb',cd:2.4}},
    ringR:{kit:'crab',w:34,h:26,o:{pal:WRECK,eye:CY,cannon:1,holes:5,rimc:CY},hp:3,pts:260,vx:-34,mv:'sine',mvp:{a:18,f:1.5},at:'aim',atp:{n:3,sd:.55,sp:72,s:'shard',cd:2.8}},
    dart:{kit:'wedge',w:30,h:15,o:{pal:WRECK,flame:CY,guns:1,stripe:CY,holes:3,rimc:CY},hp:1.8,pts:180,vx:-140,mv:'dive',mvp:{track:1.1,sp:55},at:false},
    cross:{kit:'cross',w:30,h:30,o:{pal:WRECK,eye:CY,core:[K,'#1b3036',cy,CY],holes:4,rimc:CY},hp:4.5,pts:340,vx:-30,mv:'bounce',mvp:{vy:22},at:'spiral',atp:{n:4,sp:54,s:'orb',cd:2.6}},
    pod:{kit:'hauler',w:42,h:26,o:{pal:WRECK,cargo:1,win:TEAL,holes:7,rimc:CY,flame:CY},hp:8,pts:520,vx:-22,mv:'drift',mvp:{a:8},at:'aim',atp:{n:5,sd:1,sp:66,s:'shard',cd:3.2}}
  },
  mini:{w:86,h:62,hp:1.8,x:232,bob:44,debris:[RUST[2],RUST[3],CY],build:wardenBody,core:{x:-14,y:0,w:26,h:26},muz:[[-.45,-.3],[-.45,.3]],
    phases:[[{a:'fan',n:5,sd:.9,sp:74,cd:1.6,s:'orb',m:0},{a:'ring',n:12,sp:50,cd:3.8,s:'shard',m:1}],
            [{a:'fan',n:7,sd:1.1,sp:78,cd:1.4,s:'orb',m:0},{a:'ring',n:14,sp:54,cd:3.2,s:'shard',m:1},{a:'rain',n:6,sp:56,cd:4.6,s:'dot'}],
            [{a:'fan',n:9,sd:1.3,sp:82,cd:1.2,s:'orb',m:0},{a:'ring',n:16,sp:56,cd:2.8,s:'shard',m:1},{a:'curtain',n:10,sp:64,gap:36,cd:4.4,s:'orb'}]]},
  boss:{w:168,h:112,hp:2.6,x:236,bob:36,charge:12,chargeDist:110,debris:[RUST[2],RUST[3],CY,OR],build:titanBoss,core:{x:62,y:0,w:26,h:30},boom:34,
    muz:[[-.42,-.28],[-.42,0],[-.42,.28]],
    phases:[[{a:'fan',n:5,sd:.9,sp:74,cd:1.7,s:'orb',m:0},{a:'ring',n:14,sp:48,cd:3.8,s:'shard',m:1},{a:'stream',cnt:6,gap:.14,sp:92,cd:4.5,s:'big',m:2}],
            [{a:'fan',n:7,sd:1.1,sp:78,cd:1.5,s:'orb',m:0},{a:'ring',n:16,sp:52,cd:3.2,s:'shard',m:1},{a:'curtain',n:11,sp:70,gap:34,cd:4.8,s:'orb'},{a:'spiral',arms:3,cnt:14,gap:.1,sp:56,cd:6.5,s:'big',m:1}],
            [{a:'fan',n:9,sd:1.3,sp:82,cd:1.3,s:'orb',m:0},{a:'ring',n:18,sp:56,cd:2.8,s:'shard',m:1},{a:'curtain',n:12,sp:74,gap:30,cd:4.2,s:'orb'},{a:'rain',n:7,both:1,sp:64,cd:4.4,s:'dot'},{a:'lance',n:9,sp:150,w:.9,cd:6.2,s:'needle'},{a:'summon',type:'dart',n:3,cd:9}]]},
  scene:K_=>({seed:10,sky:['#07050e','#0e0a1c','#1c1008','#2a1a14'],skyFn:(x,y)=>y/200*.5+.08+Math.sin(x*.02)*.03,stars:[VI,BL,CY,WH],dir:[1,.55],
    layers:[
      {z:'bg',t:'clouds',ramp:['#07050e','#0e0a1c','#1b3036','#3c6a78'],seed:3,vx:6,alpha:.45,thr:.52},
      {z:'bg',t:'objs',n:2,vx:4,seed:20,list:[darken(hulk(300,110,7,DEAD,CY),.75),darken(hulk(250,90,8,DEAD,OR),.75)]},
      {z:'bg',t:'objs',n:9,vx:12,seed:19,list:[bubble(2,[rd,OR,YL]),bubble(3,[BR,OR,YL]),bubble(2,[rd,OR,YL])]},
      {z:'bg',t:'objs',n:5,vx:9,seed:21,list:[hulk(150,62,1,DEAD,CY),hulk(110,46,2,DEAD,OR),hulk(190,70,3,DEAD,CY)],lights:CY},
      {z:'mid',t:'objs',n:7,vx:24,seed:22,list:[chunk(7,1,RUST),chunk(11,2,RUST),chunk(5,3,RUST)]},
      {z:'fg',t:'objs',n:3,vx:75,seed:23,list:[darken(chunk(16,4,DEAD),.2),darken(chunk(12,5,DEAD),.2)]},
      {z:'fg',t:'streak',n:22,vx:95,len:5,cols:[OR,YL,TN],seed:5}]}),
  script(sc,h){waves(h,[[3,'ring',5,.5,60,0],[9,'dart',4,.5,40,30],[15,'ringR',2,1.4,70,50],[20,'cross',2,2,60,70],[26,'ring',6,.4,130,0],[32,'pod',1,0,100,0],[34,'dart',5,.4,50,20],
    [42,'ringR',3,1.2,60,40],[46,'cross',3,1.5,50,50],[52,'ring',7,.35,100,0],[58,'pod',2,2,70,60],[63,'dart',6,.35,40,22],[68,'ringR',4,1,60,30],[74,'cross',3,1.4,60,45],[78,'ring',7,.3,80,0]])}
};

/* =============== 11 LEVIATHAN NEBULA =============== */
const GLOW=['#0a0630',VI,BL,mg,MG],CYAN=['#0a1030',VI,cy,CY,WH],PEARL=['#352879',BL,LV,'#ffd0ff',WH];
function leviBoss(g,w,h){
  const cy0=h/2;
  poly(g,[[w-6,cy0-6],[w-30,cy0-30],[w*.5,cy0-44],[w*.18,cy0-34],[4,cy0-4],[4,cy0+10],[w*.2,cy0+30],[w*.5,cy0+40],[w-28,cy0+26],[w-6,cy0+8]],GLOW);       // whale body
  poly(g,[[w-6,cy0-6],[w+6,cy0-24],[w+10,cy0-4],[w+10,cy0+8],[w+6,cy0+24],[w-6,cy0+8]],PEARL);                                                        // tail
  poly(g,[[w*.5,cy0-44],[w*.58,cy0-58],[w*.72,cy0-34]],PEARL);poly(g,[[w*.4,cy0+38],[w*.5,cy0+54],[w*.64,cy0+32]],PEARL,true);                         // fins
  for(let i=0;i<6;i++){line(g,GLOW[0],10+i*7,cy0+6,20+i*6,cy0+24)}                                                                                     // belly lines
  for(let i=0;i<22;i++){px(g,i%3?CY:WH,w*.2+((i*53)%(w*.65)),cy0-30+((i*29)%46),1,1)}                                                                  // lights along the body
  poly(g,[[3,cy0+4],[w*.3,cy0+8],[w*.28,cy0+12],[3,cy0+10]],[K,'#0a0630',VI]);                                                                         // jaw line
  ell(g,22,cy0-8,7,7,[K,VI,CY,WH]);px(g,K,19,cy0-9,3,4);                                                                                              // eye
  ell(g,w*.55,cy0,15,16,[K,K,'#3a0a40',PU]);ell(g,w*.55,cy0,11,12,[mg,MG,YL,WH]);for(let i=0;i<3;i++)px(g,rampAt([mg,MG],.5,i,0),w*.55-8,cy0-5+i*5,16,1);                                                                  // the heart, warm so it stands out
  for(let i=0;i<5;i++)px(g,i%2?PEARL[2]:GLOW[1],8+i*3,cy0+14+i*2,w*.4-i*4,1);                                                                         // hard dither bands on the belly
}
function sirenBody(g,w,h){
  const cy0=h/2;ell(g,w*.55,cy0,w*.38,h*.4,GLOW);
  poly(g,[[w*.2,cy0-2],[3,cy0+4],[6,cy0+14],[w*.3,cy0+8]],GLOW);for(let i=0;i<7;i++)px(g,WH,4+i*2,cy0+5+(i%2)*2,1,2);                              // teeth
  thick(g,GLOW[2],w*.4,cy0-h*.38,w*.25,cy0-h*.62,2);thick(g,GLOW[2],w*.25,cy0-h*.62,6,cy0-h*.55,2);ell(g,6,cy0-h*.55,4,4,[K,mg,MG,WH]);              // lure
  ell(g,w*.3,cy0-6,6,6,[K,VI,CY,WH]);px(g,K,w*.3-2,cy0-8,3,4);
  poly(g,[[w-3,cy0],[w-16,cy0-14],[w-14,cy0+14]],PEARL);for(let i=0;i<10;i++)px(g,CY,w*.35+i*4,cy0-h*.2+(i%3)*3,1,1);
}
const NEBULA={
  pal:GLOW,
  bullets:{orb:['orb',mg,MG],bub:['big',VI,CY,WH],needle:['needle',cy,CY],shard:['shard',BL,LV,WH],dot:['dot',MG]},
  en:{
    ring:{kit:'jelly',w:34,h:24,o:{pal:GLOW,tn:5,tc:LV,eye:[K,VI,CY,WH]},hp:1.4,pts:170,vx:-40,mv:'sine',mvp:{a:30,f:2.4},at:'aim',atp:{n:1,sp:70,s:'orb',cd:2.4}},
    ringR:{kit:'manta',w:38,h:28,o:{pal:CYAN,fins:1,eye:WH},hp:3,pts:270,vx:-44,mv:'sine',mvp:{a:22,f:1.8},at:'aim',atp:{n:5,sd:.9,sp:74,s:'shard',cd:3}},
    dart:{kit:'eel',w:44,h:22,o:{pal:[K,'#0a1030',VI,cy,CY],spark:YL,eye:YL,th:.46,lure:1},hp:1.7,pts:190,vx:-120,mv:'zig',mvp:{p:.45,a:70},at:false},
    cross:{kit:'orb',w:30,h:30,o:{pal:PEARL,eye:[K,mg,MG,WH],spikes:10,sl:5,sc:MG,tip:WH,ring:1,rc:CY},hp:4.5,pts:350,vx:-30,mv:'bounce',mvp:{vy:20},at:'ring',atp:{n:10,sp:50,s:'bub',cd:3}},
    pod:{kit:'beast',w:46,h:30,o:{pal:GLOW,eye:WH},hp:8,pts:540,vx:-22,mv:'drift',mvp:{a:10},at:'aim',atp:{n:7,sd:1.4,sp:64,s:'bub',cd:3.4}}
  },
  mini:{w:92,h:66,hp:1.8,x:232,bob:44,debris:[BL,LV,CY],build:sirenBody,core:{x:-6,y:-16,w:22,h:22},muz:[[-.5,-.05]],
    phases:[[{a:'fan',n:5,sd:1,sp:72,cd:1.7,s:'orb',m:0},{a:'lance',n:8,sp:140,w:.9,cd:5.5,s:'needle'}],
            [{a:'fan',n:7,sd:1.2,sp:76,cd:1.5,s:'orb',m:0},{a:'ring',n:14,sp:50,cd:3.4,s:'bub',m:0},{a:'lance',n:9,sp:150,w:.8,cd:4.5,s:'needle'}],
            [{a:'fan',n:9,sd:1.4,sp:80,cd:1.3,s:'orb',m:0},{a:'ring',n:16,sp:54,cd:2.9,s:'bub',m:0},{a:'lance',n:10,sp:160,w:.7,cd:3.8,s:'needle'},{a:'rain',n:7,sp:54,cd:4.6,s:'dot'}]]},
  boss:{w:176,h:118,hp:2.7,x:234,bob:40,charge:11,chargeDist:120,debris:[BL,LV,CY,MG],build:leviBoss,core:{x:8,y:0,w:28,h:28},boom:36,deco(c,b,f){if(f)return;const p=((b.t*3)|0)%2;c.fillStyle=p?'#ffffaa':'#ffffff';c.fillRect((b.x+8-3)|0,(b.y-3)|0,6,6);c.fillStyle=p?'#ff77ff':'#ffffaa';c.fillRect((b.x+8-6)|0,(b.y-1)|0,12,2);c.fillRect((b.x+8-1)|0,(b.y-6)|0,2,12)},
    muz:[[-.48,-.06],[-.3,-.2],[.1,-.35]],
    phases:[[{a:'spiral',arms:3,cnt:14,gap:.1,sp:56,cd:5.2,s:'orb',m:0},{a:'fan',n:7,sd:1.2,sp:76,cd:2,s:'shard',m:0},{a:'mines',n:3,ay:-14,life:2.6,cd:4.2,s:'bub'}],
            [{a:'spiral',arms:4,cnt:16,gap:.09,sp:58,cd:4.8,s:'orb',m:0},{a:'fan',n:9,sd:1.4,sp:80,cd:1.7,s:'shard',m:0},{a:'mines',n:4,ay:-16,life:2.6,cd:3.6,s:'bub'},{a:'rain',n:8,both:1,sp:58,cd:4.4,s:'dot'}],
            [{a:'spiral',arms:5,cnt:18,gap:.08,sp:60,cd:4.2,s:'orb',m:0},{a:'fan',n:11,sd:1.6,sp:84,cd:1.5,s:'shard',m:0},{a:'mines',n:5,ay:-18,life:2.6,cd:3.2,s:'bub'},{a:'lance',n:10,sp:160,w:.8,cd:5.2,s:'needle'},{a:'pull',t:2.2,f:36,cd:8},{a:'summon',type:'dart',n:3,cd:9}]]},
  scene:K_=>({seed:11,sky:['#05021a','#0a0630',VI,'#6f3d86'],skyFn:(x,y)=>y/200*.45+.1+Math.sin((x+y)*.025)*.05,stars:[BL,LV,CY,WH],dir:[1,.7],
    layers:[
      {z:'bg',t:'clouds',ramp:['#0a0630',VI,PU,mg],seed:31,vx:5,alpha:.55,thr:.5},
      {z:'bg',t:'clouds',ramp:['#05021a','#0a1030','#1b3036',cy],seed:32,vx:10,alpha:.4,thr:.55,fx:.03},
      {z:'bg',t:'objs',n:12,vx:14,seed:33,list:[bubble(4,CYAN),bubble(6,PEARL),bubble(3,GLOW)]},
      {z:'mid',t:'objs',n:7,vx:26,seed:34,list:[bubble(9,[K,VI,BL,LV]),bubble(5,CYAN)]},
      {z:'fg',t:'streak',n:30,vx:70,len:4,cols:[CY,LV,MG,WH],seed:6},
      {z:'fg',t:'clouds',ramp:['#05021a','#0a0630',VI,BL],seed:33,vx:48,alpha:.22,thr:.62}]}),
  script(sc,h){waves(h,[[3,'ring',6,.5,60,0],[9,'dart',5,.4,40,28],[14,'ringR',3,1.2,70,40],[20,'cross',3,1.6,50,45],[26,'ring',7,.4,120,0],[32,'pod',1,0,100,0],[35,'dart',6,.35,45,22],
    [42,'ringR',4,1,60,30],[47,'cross',3,1.5,60,40],[52,'ring',8,.33,100,0],[58,'pod',2,2,70,60],[63,'dart',7,.3,40,20],[68,'ringR',4,1,70,28],[74,'cross',4,1.2,60,35],[78,'ring',8,.3,80,0]])}
};
PACKS[10]=B.mkPack(TITAN);PACKS[11]=B.mkPack(NEBULA);
})();
