/* SURFACE TRANSPORTER: a platformer sub game. You control a spacewalker with a laser gun and a big jump.
   Five alien worlds, scrolling sideways, with ground, lifts, stairs, towers and caves above and below the surface.
   Gold found here is GREEN GOLD, a separate currency kept in SAVE.surf.green. Needs packs/big.js for the drawing helpers. */
(function(){
'use strict';
const B=window.BIGKIT,{px,cnv,ell,poly,thick,line,rng,rampAt,fin,mod,clamp}=B;
const TS=8,VW=320,VH=200,PI=Math.PI,TAU=PI*2;
const K='#000000',NV='#1c1840',VI='#352879',BL='#6c5eb5',PU='#6f3d86',LP='#8a5aa6',LV='#cc99ff',mg='#cc44cc',MG='#ff77ff',rd='#9a3a3a',BR='#68372b',TN='#9a6759',OR='#ff9966',YG='#b8c76f',YL='#ffffaa',GR='#588d43',GD='#2c5a2c',LG='#9ad284',PG='#ccff99',cy='#70a4b2',CY='#9ad2e0',D='#444444',GM='#6c6c6c',LM='#959595',LL='#bbbbbb',WH='#ffffff',RD='#ff7777';
const WATC=['#3a9ae0','#2cb0b0','#2a8ac0','#2a8ac0','#8aff4a'],WATL=['#cce8ff','#d0ffff','#cce8ff','#cce8ff','#e0ffc0'];
const GREEN=['#2c5a2c','#588d43','#9ad284','#ccff99','#ffffff'];   // green gold: its own colour everywhere
const rgb=(a,b)=>a+Math.floor(Math.random()*(b-a+1));

/* ---------------- the five worlds ---------------- */
const WORLDS=[
 {n:'FUNGAL JUNGLE',sub:'GIANT MUSHROOMS, SPRING CAPS AND ROOT CAVES',lw:1120,lh:192,
  sky:['#2a0a5a','#6f3d86',mg,OR],skyY:.55,ridge:[['#4a1a6a','#8a3aa6'],['#8a3aa6','#ff77ff']],
  rock:['#2a0a3a','#6f3d86',mg,MG],wallc:['#0a2a34','#124650','#1c6470','#2c9a98'],topc:['#2c8a2c','#9ad284','#ccff99'],plat:['#cc44cc','#ffffaa'],mush:1,glow:MG,plant:{leaf:['#2c5a2c','#588d43','#9ad284'],fl:[MG,YL,OR],kind:'jungle'},
  en:[
   {id:'sporeling',n:'SPORELING',ai:'walker',kit:'blob',o:{eyes:'cyclops'},pal:[NV,PU,LP,LV,WH],w:14,h:12,hp:2,spd:22,gold:1},
   {id:'puffcap',n:'PUFFCAP',ai:'dropper',kit:'cap',pal:[BR,TN,OR,YL,WH],w:18,h:14,hp:2,spd:16,gold:2,fly:1},
   {id:'vinesnap',n:'VINESNAP',ai:'turret',kit:'turretk',o:{shape:'plant'},pal:['#102010',GD,GR,LG,PG],w:14,h:20,hp:3,cd:2.2,range:130,bul:{n:1,sp:80},gold:2},
   {id:'glowmoth',n:'GLOWMOTH',ai:'flyer',kit:'wing',o:{wing:'moth'},pal:[PU,LP,LV,CY,WH],w:18,h:12,hp:2,spd:34,gold:2,fly:1,shoot:{cd:2.6,sp:70}},
   {id:'shroombrute',n:'SHROOM BRUTE',ai:'charger',kit:'golem',o:{cap:1,fist:4.2,inset:4},pal:[BR,TN,OR,YL,WH],w:22,h:22,hp:8,spd:18,gold:5}]},
 {n:'CRYSTAL DESERT',sub:'RED SAND, CRUMBLING BRIDGES AND CRYSTAL SPIRES',lw:1240,lh:208,
  sky:['#1c5a8a','#70a4b2','#ffffaa','#ffffff'],skyY:.5,ridge:[['#9a3a3a','#ff7777'],['#ff9966','#ffffaa']],
  rock:['#7a4030','#b85f44','#ee9a6c','#ffd7a0'],wallc:['#2a1638','#40224e','#5a3270','#8a4a9a'],topc:['#ff9966','#ffffaa','#ffffff'],plat:['#9a3a3a','#ffffaa'],crumble:1,glow:CY,plant:{leaf:['#2c5a2c','#9ad284','#ccff99'],fl:[MG,RD,YL],kind:'desert'},
  en:[
   {id:'dunecrab',n:'DUNE SCORPION',ai:'walker',kit:'crab',o:{shape:'scorpion'},pal:['#2a1008',BR,TN,OR,YL],w:18,h:12,hp:3,spd:26,gold:2},
   {id:'sandskipper',n:'SAND SKIPPER',ai:'hopper',kit:'crab',o:{shape:'hopper'},pal:['#2a1008',rd,RD,OR,YL],w:16,h:16,hp:2,spd:50,gold:2},
   {id:'shardturret',n:'SHARD TURRET',ai:'turret',kit:'turretk',o:{shape:'crystal'},pal:[VI,mg,MG,CY,WH],w:14,h:18,hp:4,cd:1.8,range:150,bul:{n:3,sp:80,sd:.35},gold:3},
   {id:'dustwisp',n:'DUST DEVIL',ai:'flyer',kit:'wing',o:{wing:'wisp'},pal:[BR,TN,OR,YL,WH],w:14,h:20,hp:2,spd:62,gold:2,fly:1},
   {id:'crystalgolem',n:'CRYSTAL GOLEM',ai:'charger',kit:'golem',o:{crystal:1,inset:3,fist:2.2},pal:[VI,mg,MG,CY,WH],w:22,h:24,hp:10,spd:20,gold:6}]},
 {n:'DERELICT STARSHIP',sub:'A CRASHED CARGO SHIP, OVERGROWN WITH GLOWING PLANTS',lw:1400,lh:224,ship:1,
  sky:['#0a0630','#1c1840',VI,BL],skyY:.5,ridge:[['#1c1840','#2a1d52'],['#352879','#4a2f86']],
  rock:['#1c2a4a','#3c5a8a','#70a4b2','#ccffff'],wallc:['#081230','#102050','#1a3478','#3a68c0'],topc:['#6c6c6c','#bbbbbb','#ffffaa'],plat:['#6c6c6c','#9ad2e0'],glow:CY,plant:{leaf:['#1b5a3a','#2c8a2c','#9ad284'],fl:[CY,MG,YL],kind:'ship'},
  en:[
   {id:'cargobot',n:'CARGO BOT',ai:'walker',kit:'droid',pal:[D,GM,YG,YL,WH],w:16,h:16,hp:4,spd:26,gold:2},
   {id:'sparkwisp',n:'SPARK WISP',ai:'dropper',kit:'cap',o:{ghost:1},pal:['#3a0a38',mg,MG,'#ffc0ff',WH],w:14,h:14,hp:2,spd:26,gold:2,fly:1},
   {id:'ventcrawler',n:'VENT CRAWLER',ai:'hopper',kit:'crab',o:{shape:'spider'},pal:['#102010',GD,LG,PG,YL],w:14,h:12,hp:3,spd:56,gold:2},
   {id:'wallgun',n:'WALL GUN',ai:'turret',kit:'turretk',o:{shape:'pylon'},pal:[D,GM,rd,OR,YL],w:12,h:24,hp:6,cd:1.8,range:150,bul:{n:2,sp:90,sd:.3},gold:3},
   {id:'loadermech',n:'LOADER MECH',ai:'charger',kit:'golem',o:{mech:1,pad:4.6,fist:3.4},pal:[D,GM,OR,YL,WH],w:26,h:28,hp:14,spd:22,gold:8,shoot:{cd:2.6,sp:80}}]},
 {n:'MAGMA CAVERNS',sub:'LAVA POOLS, FALLING ROCKS AND FIRE BEASTS',lw:1520,lh:240,
  sky:['#0a0200','#2a0a08',rd,OR],skyY:.45,ridge:[['#2a0a08','#68372b'],['#68372b','#ff9966']],cavern:1,
  rock:['#160c14','#3a2630','#7a4048','#ff9a62'],wallc:['#2a1612','#3c201a','#583028','#a05a3a'],topc:['#ff9966','#ffffaa','#ffffff'],plat:['#444444','#ff9966'],lava:1,glow:YL,plant:{leaf:['#68372b','#ff9966','#ffffaa'],fl:[YL,RD,WH],kind:'magma'},
  en:[
   {id:'lavaslug',n:'LAVA SLUG',ai:'walker',kit:'blob',o:{slug:1},pal:['#102a08','#6aa020','#b8e830','#f0ff80',WH],w:22,h:10,hp:4,spd:18,gold:2},
   {id:'ashbat',n:'ASH BAT',ai:'flyer',kit:'wing',o:{wing:'bat'},pal:['#101040','#5a5ad0','#9a9aff','#e0e0ff',YL],w:26,h:16,hp:3,spd:44,gold:3,fly:1,shoot:{cd:3,sp:75}},
   {id:'emberspitter',n:'EMBER SPITTER',ai:'lobber',kit:'turretk',o:{shape:'spitter'},pal:['#3a0840','#a02890','#e050d0','#ffa0f0',YL],w:22,h:20,hp:5,cd:2.4,range:170,gold:3},
   {id:'magmahopper',n:'MAGMA HOPPER',ai:'hopper',kit:'blob',o:{legs:1,angry:1},pal:['#082a3a','#1c7aa0','#30b8e0','#90f0ff',WH],w:14,h:14,hp:4,spd:60,gold:3},
   {id:'obsidianknight',n:'OBSIDIAN KNIGHT',ai:'charger',kit:'golem',o:{knight:1,inset:8,fist:2.4},pal:[K,'#2c3a6a','#5a78c8','#a0c0ff',RD],w:20,h:26,hp:14,spd:24,gold:8}]},
 {n:'ALIEN MOTHERSHIP',sub:'A LIVING SHIP: SLIME WALLS, EGG POOLS AND A HIVE GUARD',lw:1680,lh:256,ship:1,
  sky:['#0a0630','#352879',mg,CY],skyY:.5,ridge:[['#1c1840','#6c5eb5'],['#6c5eb5','#ff77ff']],
  rock:['#06241a','#0e5a30','#2c9a4a','#9affb0'],wallc:['#2a0c3a','#40124e','#601c68','#a04ab0'],topc:['#d08a38','#ffe08a','#ffffaa'],plat:['#1c7a44','#ffe08a'],glow:'#ffdd77',plant:{leaf:['#06241a','#1c7a44','#9affb0'],fl:['#ffd070','#ff9acb','#9affc8'],kind:'hive'},
  en:[
   {id:'hivebug',n:'HIVE BEETLE',ai:'walker',kit:'crab',o:{shape:'beetle'},pal:['#1a0a2a','#5a2a8a','#a050e0','#e0a0ff',WH],w:18,h:12,hp:5,spd:30,gold:3},
   {id:'stinger',n:'STINGER',ai:'flyer',kit:'wing',o:{wing:'wasp'},pal:['#08283a','#1c78a8','#44c0e8','#b0f4ff',WH],w:18,h:12,hp:4,spd:40,gold:3,fly:1,shoot:{cd:2,sp:85}},
   {id:'eggpod',n:'EGG POD',ai:'turret',kit:'turretk',o:{shape:'egg'},pal:['#3a0a38',mg,MG,PG,WH],w:14,h:20,hp:8,cd:1.6,range:160,bul:{n:5,sp:85,sd:.7},gold:4},
   {id:'leaper',n:'LEAPER',ai:'hopper',kit:'blob',o:{frog:1},pal:['#3a0a38','#2c5a2c','#588d43',PG,WH],w:14,h:14,hp:5,spd:68,gold:3},
   {id:'hiveguard',n:'HIVE GUARD',ai:'charger',kit:'golem',o:{mandibles:1,eye:PG,inset:4,fist:3.6},pal:['#3a0a38',PU,PU,mg,MG],w:28,h:30,hp:22,spd:26,gold:12,shoot:{cd:2.2,sp:88}}]}
];
const PARAM=[
 {gapMax:5,dens:.5,dmg:1,resp:50,caves:2,wt:{flat:3,stairs:2,gap:2,floaters:2,springs:3,cliff:1,tower:1,cavezone:3,hill:2,mound:6}},
 {gapMax:6,dens:.65,dmg:1,resp:45,caves:3,wt:{flat:2,stairs:2,gap:2,floaters:2,crumble:3,cliff:2,tower:1,cavezone:3,hill:2,mound:6}},
 {gapMax:6,dens:.8,dmg:1,resp:40,caves:3,wt:{flat:2,stairs:2,gap:3,floaters:2,liftgap:2,cliff:2,tower:2,updraft:3,gates:3,mezz:7,cavezone:3}},
 {gapMax:6,dens:1,dmg:2,resp:35,caves:4,wt:{flat:2,stairs:3,gap:1,lava:7,liftgap:2,cliff:3,tower:2,cavezone:3,hill:2}},
 {gapMax:6,dens:1.2,dmg:2,resp:30,caves:4,wt:{flat:2,stairs:3,gap:2,floaters:2,liftgap:3,cliff:3,tower:2,gates:3,mezz:7,cavezone:4,hill:2}}
];

/* ---------------- sprites ---------------- */
function hueRot(c,deg){const w=c.width,h=c.height,o=document.createElement('canvas');o.width=w;o.height=h;const g=o.getContext('2d');g.drawImage(c,0,0);const id=g.getImageData(0,0,w,h),d=id.data,a=deg*PI/180,cs=Math.cos(a),sn=Math.sin(a);
  const m0=.213+cs*.787-sn*.213,m1=.715-cs*.715-sn*.715,m2=.072-cs*.072+sn*.928,m3=.213-cs*.213+sn*.143,m4=.715+cs*.285+sn*.140,m5=.072-cs*.072-sn*.283,m6=.213-cs*.213-sn*.787,m7=.715-cs*.715+sn*.715,m8=.072+cs*.928+sn*.072;
  for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const r=d[i],gg=d[i+1],b=d[i+2];d[i]=r*m0+gg*m1+b*m2;d[i+1]=r*m3+gg*m4+b*m5;d[i+2]=r*m6+gg*m7+b*m8}
  g.putImageData(id,0,0);return o}
function hueAll(a){const walk=o=>{if(!o)return o;if(o.getContext&&o.width)return hueRot(o,HIVEHUE);if(Array.isArray(o))return o.map(walk);if(typeof o==='object'){const r={};for(const k in o)r[k]=walk(o[k]);return r}return o};
  a.plants=walk(a.plants);a.decor=walk(a.decor);a.deco=walk(a.deco)}
const HIVEHUE=-150;
function bakeH(L,ci,cj){return bakeChunk(L,SURF.idx,ci,cj)}
/* ---------------- backdrops: tall silhouettes on the horizon and big structures on the cave walls (painted once and cached) ---------------- */
function mkSkyVista(idx){
  if(idx<2)return null;
  const W=640,H=200;
  const mk=(layer)=>cnv(W,H,g=>{const R=rng(7700+idx*31+layer*7),rr=(a,b)=>a+Math.floor(R()*(b-a+1));
    if(idx===2){
      const col=layer?'#04051a':'#0c1040',rim=layer?'#9ab8ff':'#5a78d8',win=['#ffee88','#88ffff','#ffaa55'],H2=H;
      const lit=(x,y,s)=>{if(R()<.75)px(g,win[rr(0,2)],x,y,s||3,s||3)};
      const gantry=(x,h,w)=>{px(g,col,x,H2-h,5,h);px(g,col,x+w,H2-h,5,h);for(let y=H2-h+6;y<H2-12;y+=16){line(g,col,x,y,x+w,y+16);line(g,col,x+1,y,x+w+1,y+16);line(g,col,x+w,y,x,y+16);line(g,col,x+w+1,y,x+1,y+16)}px(g,col,x-5,H2-h,w+15,6);px(g,rim,x-5,H2-h,w+15,2);px(g,rim,x,H2-h,1,h);px(g,rim,x+w,H2-h,1,h);px(g,'#ff4444',x+(w>>1),H2-h-8,3,3);px(g,col,x+(w>>1),H2-h-6,3,6);for(let k=0;k<4;k++)lit(x+8,H2-h+14+k*22)};
      const mast=(x,h)=>{px(g,col,x,H2-h,4,h);px(g,rim,x,H2-h,1,h);poly(g,[[x-12,H2-h+8],[x+16,H2-h+8],[x+2,H2-h+20]],[col,col]);px(g,rim,x-12,H2-h+8,28,2);px(g,'#ff5555',x+1,H2-h-5,3,3);px(g,col,x-7,H2-h+34,18,5);px(g,rim,x-7,H2-h+34,18,1);lit(x-4,H2-h+44);lit(x+4,H2-h+44)};
      const dome=(x,r)=>{for(let i=-r;i<=r;i++){const hh=Math.round(Math.sqrt(1-(i/r)*(i/r))*r*.85);px(g,col,x+i,H2-hh,1,hh);px(g,rim,x+i,H2-hh,1,2)}for(let k=-r+8;k<r-5;k+=9)lit(x+k,H2-Math.round(r*.3))};
      const bell=(x,w,h)=>{poly(g,[[x-w*.28,H2-h],[x+w*.28,H2-h],[x+w*.5,H2],[x-w*.5,H2]],[col,col]);px(g,rim,x-w*.28,H2-h,w*.56,2);px(g,'#ff9a44',x-w*.46,H2-5,w*.92,3);px(g,'#ffee88',x-w*.3,H2-5,w*.6,2);px(g,col,x-w*.36,H2-h-14,w*.72,14);px(g,rim,x-w*.36,H2-h-14,w*.72,2);for(let k=0;k<3;k++)lit(x-w*.2+k*w*.2,H2-h-9)};
      const stack=(x,n)=>{for(let j=0;j<n;j++){px(g,col,x,H2-18*(j+1),34,18);px(g,rim,x,H2-18*(j+1),34,2);px(g,j&1?'#ffcc44':'#44ddff',x+4,H2-18*(j+1)+8,26,2)}};
      const hull=(x,w)=>{px(g,col,x,H2-40,w,40);px(g,rim,x,H2-40,w,2);for(let i=8;i<w-8;i+=9)lit(x+i,H2-28,4);poly(g,[[x+w,H2-40],[x+w+30,H2-20],[x+w,H2]],[col,col]);px(g,'#ffee88',x+w+10,H2-24,4,4)};
      const pl=[[16,'g'],[100,'m'],[165,'d'],[250,'b'],[340,'s'],[400,'g'],[480,'h'],[590,'m']];
      for(const [x,t] of pl){const j=rr(-6,6);if(t==='g')gantry(x+j,rr(120,185),rr(26,36));else if(t==='m')mast(x+j,rr(130,195));else if(t==='d')dome(x+j,rr(30,44));else if(t==='b')bell(x+j,rr(54,76),rr(70,100));else if(t==='s')stack(x+j,rr(3,5));else hull(x+j,rr(80,110))}
    }else if(idx===3){
      const col=layer?'#0c0614':'#22102e',rim=layer?'#ff9a44':'#8a3a5a';
      if(!layer){for(const [x,h,w] of [[110,112,64],[330,96,58],[540,118,70]]){poly(g,[[x-w,H],[x-w*.18,H-h],[x+w*.18,H-h],[x+w,H]],[col,col]);for(let i=-w;i<=w;i++){}
          line(g,rim,x-w,H,x-w*.18,H-h);line(g,rim,x+w*.18,H-h,x+w,H);ell(g,x,H-h,w*.19,4,['#ff6622','#ffaa33','#ffee88']);
          for(let k=0;k<6;k++){px(g,['#ffcc44','#ff8833','#ffee99'][k%3],x-4+k*2+(R()*4|0),H-h-6-k*4-(R()*3|0),2,2)}
          for(const s of [-1,1]){const x0=x+s*w*.1;for(let y=H-h+4;y<H;y++){const xx=x0+s*Math.round((y-(H-h))*w*.72/h)-s*2+((y>>3)&1);if(R()<.9)px(g,y%9<4?'#ffdd66':'#ff7a2a',xx,y,2,1)}}}
        for(let x=0;x<W;x+=1){const hh=22+Math.round(14*Math.sin(x*.045)+9*Math.sin(x*.13+2));px(g,'#1a0c26',x,H-hh,1,hh)}}
      else{for(let x=10;x<W;x+=rr(22,38)){const h=rr(60,130),w=rr(8,14);poly(g,[[x,H],[x+1,H-h+14],[x+w*.4,H-h],[x+w*.7,H-h+10],[x+w,H-h+22],[x+w+2,H]],[col,col]);px(g,rim,x+1,H-h+14,1,h-14);px(g,'#ff6622',x,H-4,w+3,4)}
        for(const x of [70,250,430,590]){for(let y=H-90;y<H;y++)px(g,y%7<3?'#ffe08a':'#ff8833',x,y,3,1);ctx_glow(g,x+1,H-45,'#ff7733')}}
    }else{
      const col=layer?'#150620':'#2a0a3a',rim=layer?'#ff66dd':'#8a3aa6';
      if(!layer){for(const x of [70,230,390,550]){const hgt=rr(100,140),wd=rr(60,80);for(let t=0;t<=1;t+=.012){const a=t*Math.PI,px_=x+Math.round(Math.cos(a)*wd*.5-wd*.5)+wd*.5+(0),py_=H-Math.round(Math.sin(a)*hgt);thick(g,col,x-wd/2+t*wd,py_,x-wd/2+t*wd,H,5);}
          for(let t=0;t<=1;t+=.02){const a=t*Math.PI;px(g,rim,Math.round(x-wd/2+t*wd),H-Math.round(Math.sin(a)*hgt),2,1)}}
        for(const x of [150,470]){ell(g,x,H-18,26,20,[col,col,'#4a1450']);for(let k=0;k<5;k++)line(g,'#ff44cc',x-18+k*9,H-34,x-14+k*9,H-4);ell(g,x,H-26,7,6,['#ff44cc','#ffaaee','#ffffff'])}}
      else{for(let x=14;x<W;x+=rr(20,34)){const h=rr(50,120);for(let y=H;y>H-h;y--){const xx=x+Math.round(Math.sin(y*.09+x)*4);px(g,col,xx,y,3,1);if(y%2)px(g,rim,xx,y,1,1)}ell(g,x+Math.round(Math.sin((H-h)*.09+x)*4)+1,H-h,3.5,3.5,['#ff44cc','#ffd070','#ffffff'])}}
    }
  });
  return [mk(0),mk(1)]}
function ctx_glow(g,x,y,c){g.globalAlpha=.18;g.fillStyle=c;g.beginPath();g.ellipse(x,y,9,48,0,0,TAU);g.fill();g.globalAlpha=1}
function mkWallVista(idx){
  const W=320,H=200;
  return cnv(W,H,g=>{const R=rng(8800+idx),rr=(a,b)=>a+Math.floor(R()*(b-a+1));
    if(idx===0){
      for(const x of [24,120,210,290]){const w=rr(9,13);px(g,'#3a1c66',x,0,w,H);px(g,'#7a4ac0',x,0,1,H);px(g,'#1a0a30',x+w-1,0,1,H);for(let y=10;y<H;y+=50){ell(g,x+(w>>1),y,w*1.4,6,['#2a1050','#8a4ad8','#e0a0ff','#ffffff']);px(g,'#ccff99',x+(w>>1)-1,y-1,3,2)}}
      for(let i=0;i<40;i++)px(g,['#ff77ff','#9affc8','#ffffaa'][i%3],rr(0,W),rr(0,H),1,1)
    }else if(idx===1){
      for(const [x,w] of [[30,10],[100,14],[190,10],[262,16]]){for(let y=0;y<H;y+=40){poly(g,[[x,y+40],[x+2,y+8],[x+w*.5,y],[x+w-2,y+8],[x+w,y+40]],['#c0ffff','#44c8e8','#1a6ab0']);px(g,'#ffffff',x+3,y+10,1,20)}g.globalAlpha=.2;g.fillStyle='#66e8ff';g.fillRect(x-4,0,w+8,H);g.globalAlpha=1}
      for(let i=0;i<30;i++)px(g,['#ff77ff','#ffffaa'][i&1],rr(0,W),rr(0,H),1,2)
    }else if(idx===2){
      for(const x of [14,118,226]){px(g,'#0c1a46',x,0,12,H);px(g,'#3a64c8',x,0,1,H);px(g,'#06102c',x+11,0,1,H);for(let y=0;y<H;y+=40){line(g,'#2a4a9a',x+1,y,x+10,y+20);line(g,'#2a4a9a',x+10,y,x+1,y+20);px(g,'#6aa0ff',x,y,12,1);px(g,'#06102c',x+1,y+20,10,2)}
        for(let y=8;y<H;y+=40)px(g,'#ffee88',x+5,y,2,2)}
      for(const y of [52,146]){px(g,'#050c22',0,y-3,W,12);px(g,'#1c3a88',0,y-3,W,1);for(let x=4;x<W;x+=11){if(R()<.78){const c=['#ffe08a','#8affff','#ffc060'][rr(0,2)];px(g,c,x,y,7,5);px(g,'#fff6cc',x,y,7,1);px(g,'#06102c',x+3,y+1,1,4)}}}
      px(g,'#03081a',60,96,46,20);px(g,'#44ddff',60,96,46,1);px(g,'#44ddff',60,115,46,1);px(g,'#44ddff',60,96,1,20);px(g,'#44ddff',105,96,1,20);for(let i=0;i<4;i++){px(g,'#ffee55',66+i*9,102,5,2);px(g,'#ffee55',70+i*9,104,2,2);px(g,'#ffee55',66+i*9,106,5,2)}
      for(let i=0;i<8;i++){px(g,i&1?'#ffdd33':'#101010',178+i*6,28,6,6)}px(g,'#ffdd33',178,28,48,1);px(g,'#ffdd33',178,33,48,1);
      for(let i=0;i<5;i++)px(g,'#ff5544',270+i*8,170,5,5);px(g,'#101830',266,166,44,13);for(let i=0;i<5;i++){px(g,['#ff5544','#ffee55','#55ff88','#55ccff','#ff88ff'][i],270+i*8,170,5,5)}
    }else if(idx===3){
      for(let x=0;x<W;x+=16){const w=rr(11,14);px(g,'#1a1026',x,0,w,H);px(g,'#4a3a66',x,0,1,H);px(g,'#0a0610',x+w-1,0,1,H);for(let y=rr(0,30);y<H;y+=rr(30,50))px(g,'#2a1c3c',x+2,y,w-4,2)}
      for(const [x,w] of [[40,6],[150,8],[262,6]]){g.globalAlpha=.22;g.fillStyle='#ff7733';g.fillRect(x-8,0,w+16,H);g.globalAlpha=.3;g.fillRect(x-4,0,w+8,H);g.globalAlpha=1;for(let y=0;y<H;y++){const s=Math.sin(y*Math.PI*2/50);for(let i=0;i<w;i++){const d=Math.abs(i-(w-1)/2)/(w/2);px(g,d<.35?(s>0?'#ffffcc':'#ffee88'):d<.7?(s>0?'#ffcc44':'#ff9933'):'#cc3311',x+i,y,1,1)}}}
      for(let i=0;i<60;i++)px(g,['#ffcc44','#ff8833'][i&1],rr(0,W),rr(0,H),1,1)
    }else{
      for(let k=0;k<5;k++){const x0=30+k*66;for(let y=0;y<H;y++){const xx=x0+Math.round(Math.sin(y*Math.PI*2/200*(1+(k&1))+k)*8);px(g,'#2a0a3a',xx,y,6,1);px(g,'#5a1c6a',xx+1,y,2,1);if(y%3===0)px(g,'#ff66dd',xx,y,1,1);if(y%25===0)ell(g,xx+3,y,6,5,['#3a0a48','#8a2a9a','#ff77ee','#ffd0ff'])}}
      for(const [x,y] of [[70,60],[240,140]]){ell(g,x,y,22,18,['#20082a','#4a1458','#a03ab0','#ff77ee']);for(let k=0;k<6;k++)line(g,'#ff44cc',x-16+k*6,y-14,x-12+k*6,y+12);ell(g,x,y,6,5,['#ff44cc','#ffd0ff','#ffffff'])}
    }
  })}
function ellp(g,cx,cy0,rx,ry,pal){ell(g,cx,cy0,rx,ry,pal)}
function ell2(c,x,y,r,pal){for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const d=i*i+j*j;if(d>r*r)continue;const nz=Math.sqrt(1-d/(r*r)),l=-.5*i/r-.55*j/r+.7*nz,t=clamp((l+.15)/1.05,0,.999)*(pal.length-1),k=Math.floor(t),f=t-k;c.fillStyle=pal[f>[0,8,2,10][(i&1)+2*(j&1)]/16&&k<pal.length-1?k+1:k];c.fillRect(x+i,y+j,1,1)}}
const KITS={
  blob(g,f,w,h,o){const cx=w/2,cy0=h/2+(o.slug?1:0),b=f&1?1:0;
    if(o.frog){px(g,o.pal[0],1,h-3,4,3+b);px(g,o.pal[0],w-5,h-3,4,3+b);ell(g,cx,cy0+2,w/2-1,h/2-3,[o.pal[1],o.pal[2],o.pal[2]]);px(g,K,3,cy0+3,w-6,1);for(const x0 of [cx-5,cx+2]){ell(g,x0+1.5,cy0-3,3,3,[YL,YL,YL]);px(g,K,x0+1,cy0-3,2,3)}return}
    if(o.legs){px(g,o.pal[1],w*.25,h-3,2,3+b);px(g,o.pal[1],w*.7,h-3,2,3+b);px(g,o.pal[2],w*.25-1,h-1,4,1);px(g,o.pal[2],w*.7-1,h-1,4,1)}
    ell(g,cx,cy0,w/2-1,h/2-(o.legs?2:1),o.pal);
    if(o.slug){for(let i=0;i<5;i++)px(g,o.pal[4],w*.2+i*3,cy0-h*.3+(i+f)%2,1,1);px(g,o.pal[3],1,cy0,2,2)}
    if(o.eyes==='cyclops'){ell(g,w*.32,cy0-1,3,3,[K,K,WH,WH]);px(g,K,w*.32-1,cy0-1,2,2)}
    else if(o.eyes==='three'){for(let i=0;i<3;i++){px(g,K,w*.2+i*4,cy0-2-(i%2),3,3);px(g,WH,w*.2+i*4,cy0-2-(i%2),1,1)}}
    else{px(g,K,w*.25,cy0-2,3,3);px(g,WH,w*.25,cy0-2,1,1);px(g,K,w*.5,cy0-2,3,3);px(g,WH,w*.5,cy0-2,1,1);if(o.angry){line(g,K,w*.2,cy0-4,w*.38,cy0-3);line(g,K,w*.62,cy0-4,w*.47,cy0-3)}}
    if(o.legs&&o.shape!=='x'){px(g,K,w*.3,cy0+2,w*.4,1)}},
  crab(g,f,w,h,o){const cx=w/2,cy0=h/2,k=f&1;
    if(o.shape==='beetle'){
      for(let i=0;i<3;i++){const y=cy0+1+i*2,sw=(i+f)&1;line(g,o.pal[2],cx-3+i*3,y,cx-5+i*3-sw,h-1);line(g,o.pal[2],cx-2+i*3,y,cx-3+i*3+sw,h-1)}
      ell(g,cx+2,cy0-1,w/2-3,h/2-2,o.pal);line(g,K,cx+2,cy0-h/2+2,cx+2,cy0+h/2-3);for(let i=0;i<3;i++){px(g,o.pal[4],cx-2+i*4,cy0-3+(i%2)*3,2,2)}
      ell(g,4,cy0,3,3,[o.pal[0],o.pal[1],o.pal[2],o.pal[3]]);px(g,YL,3,cy0-1,2,2);line(g,o.pal[3],1,cy0+2,0,cy0+(k?5:3));line(g,o.pal[3],5,cy0+3,3,cy0+(k?6:4))}
    else if(o.shape==='scorpion'){
      for(let i=0;i<3;i++){const x0=cx-4+i*4,s=((f+i)&1);line(g,o.pal[2],x0,cy0+2,x0+(s?-2:2),h-1)}
      ell(g,cx,cy0+1,w/2-4,h/3,o.pal);
      for(let a=0;a<7;a++){const t=a/6,x=w-3+Math.sin(t*3.2)*1-t*3,y=cy0-t*(h*.7)+(a>4?(a-4)*1.2:0);px(g,o.pal[3],x,y,2,2)}px(g,RD,w-6,2+k,2,2);   // curled tail with a sting
      thick(g,o.pal[3],cx-w*.3,cy0,2,cy0-2-k,2);thick(g,o.pal[3],cx-w*.3,cy0+2,1,cy0+3+k,2);px(g,K,cx-w*.2,cy0-1,2,2)}
    else if(o.shape==='hopper'){ // a grasshopper cocked to jump
      line(g,o.pal[2],cx+1,cy0+2,cx+5,cy0-3);line(g,o.pal[2],cx+5,cy0-3,cx+7,h-1);line(g,o.pal[2],cx,cy0+2,cx+3,cy0-2);line(g,o.pal[2],cx+3,cy0-2,cx+3,h-1);
      ell(g,cx,cy0,w*.28,h*.22,o.pal);ell(g,cx-w*.28,cy0-2,3,3,o.pal);px(g,K,cx-w*.28-1,cy0-3,2,2);px(g,YL,cx-w*.28-1,cy0-3,1,1);line(g,o.pal[3],cx-w*.28-1,cy0-5,cx-w*.28-3,cy0-8-(f&1));line(g,o.pal[2],cx-3,cy0+2,cx-5,h-1)}
    else{ // spider: bent legs
      ell(g,cx,cy0-1,w*.28,h*.3,o.pal);px(g,K,cx-3,cy0-2,2,2);px(g,K,cx+1,cy0-2,2,2);
      for(let s=-1;s<=1;s+=2)for(let i=0;i<3;i++){const x0=cx+s*(i+1)*2,kx=x0+s*5,ky=cy0-4-((f+i)&1)*2;line(g,o.pal[2],x0,cy0,kx,ky);line(g,o.pal[2],kx,ky,kx+s*3,h-1)}}},
  wing(g,f,w,h,o){const cx=w/2,cy0=h/2+1,fl=[0,3,0,-3][f%4],up=[-5,-2,2,-2][f%4];
    if(o.wing==='wisp'){for(let l=0;l<5;l++){const t=l/4,ww=4+t*(w-5),yy=h-3-l*((h-6)/4),sx=Math.sin(f*1.57+l*1.3)*2;ell(g,cx+sx,yy,ww/2,2.4,[o.pal[1],o.pal[2],o.pal[3]]);if(l===3){px(g,K,cx+sx-3,yy-1,2,2);px(g,WH,cx+sx-3,yy-1,1,1);px(g,K,cx+sx+1,yy-1,2,2);px(g,WH,cx+sx+1,yy-1,1,1)}}}
    else if(o.wing==='moth'){const wf=[0,2,0,-2][f%4];
      for(const sd of [-1,1]){const X=x=>cx+sd*x;poly(g,[[X(1),cy0-1],[X(w*.48),cy0-h*.42+wf],[X(w*.5),cy0+1],[X(w*.28),cy0+h*.34],[X(1),cy0+2]],[o.pal[0],o.pal[1],o.pal[2]]);ell(g,X(w*.3),cy0-1+wf*.4,2.2,2.2,[K,o.pal[3],o.pal[4],WH]);px(g,o.pal[3],X(w*.42),cy0+wf*.4,1,1)}
      ell(g,cx,cy0+1,2.4,h*.34,[BR,TN,YL,WH]);ell(g,cx,cy0-h*.3,2.3,2.3,[BR,TN,YL,WH]);px(g,K,cx-1,cy0-h*.3,1,1);px(g,K,cx+1,cy0-h*.3,1,1);
      for(const sd of [-1,1]){line(g,YL,cx+sd,cy0-h*.4,cx+sd*4,cy0-h*.5-1);px(g,WH,cx+sd*4,cy0-h*.5-1,1,1);px(g,YL,cx+sd*3,cy0-h*.5+1,1,1)}}
    else if(o.wing==='bat'){
      const tip=[-6,-2,3,-2][f%4],ww=w*.5-1;
      for(const s of [-1,1]){const X=x=>cx+s*x;
        poly(g,[[X(2),cy0-1],[X(ww*.45),cy0-4+tip],[X(ww),cy0-6+tip],[X(ww-2),cy0+tip*.3-1],[X(ww*.72),cy0+2+tip*.3],[X(ww*.5),cy0+1],[X(ww*.28),cy0+4],[X(2),cy0+3]],[o.pal[0],o.pal[1],o.pal[2],o.pal[3]]);
        px(g,o.pal[4],X(ww*.45),cy0-4+tip,1,1);px(g,o.pal[4],X(ww),cy0-6+tip,1,1)}
      ell(g,cx,cy0+1,3,4,[o.pal[0],o.pal[1],o.pal[2]]);ell(g,cx,cy0-3,2.5,2.5,[o.pal[0],o.pal[1],o.pal[2]]);
      poly(g,[[cx-3,cy0-5],[cx-3,cy0-8],[cx-1,cy0-5]],o.pal);poly(g,[[cx+1,cy0-5],[cx+3,cy0-8],[cx+3,cy0-5]],o.pal);px(g,RD,cx-2,cy0-3,1,1);px(g,RD,cx+1,cy0-3,1,1);px(g,WH,cx-1,cy0-1,1,1);px(g,WH,cx,cy0-1,1,1)}
    else{ // wasp
      ell(g,cx+w*.2,cy0+1,w*.24,h*.3,[o.pal[0],o.pal[1],YL,YL]);for(let i=0;i<3;i++)px(g,K,cx+w*.1+i*3,cy0-h*.2,1,h*.45);px(g,RD,w-2,cy0+1,2,1);
      ell(g,cx-2,cy0,3.5,3.5,o.pal);ell(g,cx-6,cy0-1,2.5,2.5,o.pal);px(g,RD,cx-8,cy0-2,2,2);line(g,K,cx-7,cy0-3,cx-9,cy0-5);
      const wy=cy0-5+up*.5;ell(g,cx+1,wy,w*.18,3,[o.pal[3],o.pal[4],WH,WH]);ell(g,cx+w*.14,wy+1,w*.14,2.5,[o.pal[3],o.pal[4],WH,WH])}},
  golem(g,f,w,h,o){const cx=w/2,sw=f&1;
    thick(g,o.pal[1],cx-3,h*.74,cx-3-sw,h-1,3);thick(g,o.pal[1],cx+3,h*.74,cx+3+sw,h-1,3);px(g,K,cx-6-sw,h-1,5,1);px(g,K,cx+1+sw,h-1,5,1);
    const ins=o.inset||5,pd=o.pad||3.5,fs=o.fist||2.8,tr=[o.pal[1],o.pal[2],o.pal[3]];
    poly(g,[[ins,h*.3],[w-ins,h*.3],[w-ins-2,h*.76],[ins+2,h*.76]],tr);
    for(const s of [-1,1]){const sx=s<0?3:w-4,ex=s<0?1:w-2,ey=h*.74+((s<0?sw:1-sw)*2);ell(g,sx,h*.34,pd,pd*.85,tr);thick(g,o.pal[2],sx,h*.36,ex,ey,3);ell(g,ex,ey+1,fs,fs,[o.pal[1],o.pal[2],o.pal[3]])}
    ell(g,cx,h*.17,w*.2,h*.13,tr);
    if(o.knight){poly(g,[[cx-6,h*.12],[cx,h*.0],[cx+6,h*.12]],[K,VI,BL]);line(g,RD,cx,0,cx+4,h*.12);px(g,o.eye||RD,cx-4,h*.17,8,2)}
    else if(o.mech){px(g,CY,cx-5,h*.12,10,5);px(g,WH,cx-5,h*.12,3,1);px(g,K,cx-5,h*.12,10,1);poly(g,[[cx-3,h*.42],[cx+4,h*.42],[cx+3,h*.58],[cx-2,h*.58]],[K,D,GM]);px(g,YL,cx-6,h*.64,2,2);px(g,YL,cx+4,h*.64,2,2);thick(g,o.pal[3],w-3,h*.5,w+1,h*.82,3);px(g,o.eye||RD,w-3,h*.84,3,2)}
    else if(o.mandibles){px(g,o.eye||PG,cx-5,h*.13,3,3);px(g,o.eye||PG,cx+2,h*.13,3,3);thick(g,o.pal[4],cx-4,h*.24,cx-6,h*.34,2);thick(g,o.pal[4],cx+4,h*.24,cx+6,h*.34,2);for(let i=0;i<3;i++)px(g,o.pal[0],7+i*4,h*.45,2,1)}
    else{px(g,o.eye||RD,cx-5,h*.14,3,2);px(g,o.eye||RD,cx+2,h*.14,3,2);line(g,K,cx-6,h*.1,cx-2,h*.13);line(g,K,cx+6,h*.1,cx+2,h*.13);px(g,K,cx-3,h*.22,6,1)}
    if(o.cap){ell(g,cx,h*.05,w*.46,h*.09,[BR,TN,OR,YL,WH]);for(let i=0;i<4;i++)px(g,YL,cx-9+i*5,h*.02+(i%2),2,2)}
    if(o.crystal){for(let i=0;i<5;i++){const x=cx-8+i*4;poly(g,[[x,h*.12],[x+2,h*(-.02+(i%2)*.08)],[x+4,h*.12]],[MG,CY,WH])}}
    if(o.horns){thick(g,LL,cx-6,h*.1,cx-9,0,2);thick(g,LL,cx+6,h*.1,cx+9,0,2)}},
  turretk(g,f,w,h,o){const cx=w/2,pulse=f&1;
    if(o.shape==='plant'){thick(g,o.pal[1],cx,h,cx,h*.4,3);ell(g,cx,h*.3,w/2-1,h*.3,[o.pal[0],o.pal[2],o.pal[3],YL]);px(g,K,cx-3,h*.28,6,2);for(let i=0;i<5;i++)px(g,WH,cx-4+i*2,h*.28-(i%2),1,1);poly(g,[[1,h],[cx,h-6],[w-1,h]],o.pal)}
    else if(o.shape==='egg'){poly(g,[[2,h],[w-2,h],[w-3,h-4],[3,h-4]],[o.pal[0],o.pal[1],o.pal[1]]);ell(g,cx,h*.5,w/2-1,h*.42,[o.pal[0],o.pal[1],o.pal[2],o.pal[3]]);
      if(pulse){px(g,K,cx-1,h*.28,3,h*.4);px(g,o.pal[4],cx,h*.45,1,2)}else px(g,K,cx,h*.3,1,h*.36);for(let i=0;i<4;i++)px(g,o.pal[4],3+i*3,h*.4+(i%2)*5,1,1)}
    else if(o.shape==='crystal'){poly(g,[[cx-6,h],[cx-3,h*.3],[cx,0],[cx+3,h*.3],[cx+6,h]],o.pal);poly(g,[[cx-3,h],[cx,h*.2],[cx+3,h]],[o.pal[2],o.pal[3],WH]);if(pulse)px(g,WH,cx,h*.25,1,2)}
    else if(o.shape==='gargoyle'){poly(g,[[2,h],[w-2,h],[w-3,h*.45],[2,h*.45]],o.pal);poly(g,[[1,h*.5],[cx,0],[w-1,h*.5]],o.pal);px(g,RD,cx-3,h*.4,2,2);px(g,RD,cx+2,h*.4,2,2);poly(g,[[0,h*.7],[3,h*.3],[3,h*.8]],o.pal)}
    else if(o.shape==='spitter'){
      ell(g,cx+1,h*.7,w*.42,h*.27,[o.pal[0],o.pal[1],o.pal[2]]);thick(g,o.pal[1],w-2,h*.88,w+1,h*.6,2);
      poly(g,[[1,h*.5],[w*.2,h*.12],[w*.55,h*.1],[w*.62,h*.56]],[o.pal[1],o.pal[2],o.pal[2]]);                                  // the head tipped up
      poly(g,[[3,h*.46],[w*.2,h*.18],[w*.5,h*.16],[w*.56,h*.5]],[K,K,K]);ell(g,w*.34,h*.34,3.2,3.2,pulse?[rd,OR,YL,WH]:[rd,rd,OR,YL]);   // black mouth with a glowing ball inside
      px(g,YL,w*.3,h*.04,2,2);px(g,K,w*.31,h*.05,1,1);px(g,YL,w*.55,h*.06,2,2);px(g,K,w*.56,h*.07,1,1);
      for(let i=0;i<3;i++)px(g,o.pal[3],w*.4+i*3,h*.58-(i%2),2,2)}
    else{poly(g,[[cx-4,h],[cx+4,h],[cx+3,2],[cx-3,2]],o.pal);ell(g,cx,5,5,5,[K,mg,MG,pulse?WH:MG]);for(let i=0;i<3;i++)px(g,MG,cx-3,h*.4+i*5,6,1)}},
  cap(g,f,w,h,o){const cx=w/2,k=f&1;
    for(let i=0;i<4;i++){const x0=3+i*(w-6)/3;line(g,o.pal[3],x0,h*.5,x0+(k?1:-1),h-1)}
    ell(g,cx,h*.4,w/2-1,h*.4,o.pal);if(o.ghost){for(let i=0;i<5;i++)px(g,WH,2+i*3,h*.3+(i%2)*3,1,1)}else for(let i=0;i<4;i++)px(g,o.pal[4],3+i*4,h*.2+(i%2)*2,2,2);
    if(o.ghost){px(g,K,cx-4,h*.4,3,3);px(g,K,cx+1,h*.4,3,3);px(g,YL,cx-3,h*.45,1,1);px(g,YL,cx+2,h*.45,1,1)}else{px(g,K,cx-3,h*.45,2,2);px(g,K,cx+1,h*.45,2,2)}},
  droid(g,f,w,h,o){const cx=w/2,k=f&1;
    if(o.rotor){ell(g,cx,h*.6,w/2-2,h/2-3,o.pal);line(g,LL,cx-8,2+k,cx+8,2+(1-k));px(g,LM,cx,3,1,3);px(g,o.pal[4],cx-1,h*.6,3,3)}
    else{
      if(o.springs){for(let i=0;i<2;i++){const x0=3+i*(w-8);for(let j=0;j<4;j++)px(g,o.pal[3],x0+(j%2)*2,h-8+j*2,3,1)}}
      else{ell(g,4,h-3,3,3,o.pal);ell(g,w-5,h-3,3,3,o.pal)}
      poly(g,[[2,h*.2],[w-2,h*.2],[w-2,h*.7],[2,h*.7]],o.pal);px(g,o.pal[4],4,h*.3,w-8,3);px(g,WH,5,h*.3+1,2,1);px(g,o.pal[4],cx,0,1,3);px(g,YL,cx-1,0,3,1)}}
};
function mkEnemySprite(e){
  const o=Object.assign({pal:e.pal},e.o||{});
  const fr=[0,1,2,3].map(f=>fin(cnv(e.w,e.h,g=>KITS[e.kit](g,f,e.w,e.h,o))));
  return{fr,wh:fr.map(whiteOf)};
}
function mkPlayer(){
  const set={};
  const draw=(g,f,mode)=>{
    const w=16,h=18,s=mode==='run'?[0,1,0,-1][f%4]:0,jump=mode==='jump'?-1:mode==='fall'?1:0;
    px(g,K,3,1,9,8);ell(g,7,5,4,4,[NV,BL,CY,WH]);px(g,K,9,3,3,3);px(g,CY,10,4,2,2);px(g,WH,10,4,1,1);               // helmet and visor
    poly(g,[[3,8],[11,8],[11,15],[3,15]],[VI,BL,LL,WH]);px(g,OR,4,10,2,2);                                          // suit
    poly(g,[[0,8],[3,8],[3,14],[0,14]],[D,GM,LM,LL]);                                                                // backpack
    if(mode==='climb'){px(g,BL,10,3,2,3);px(g,K,11,4,1,1);px(g,LL,2+(f&1)*6,15,3,3);px(g,LL,8-(f&1)*6,15,3,2);px(g,LL,4,8,1,0);px(g,LL,3+(f&1)*7,5,2,3)}
    else if(jump){px(g,LL,3,15+jump,3,2);px(g,LL,8,14,3,2)}else{px(g,LL,3+s,15,3,3-(s>0?1:0));px(g,LL,8-s,15,3,3-(s<0?1:0))}   // legs
    if(mode!=='climb'){px(g,LM,11,10,5,2);px(g,CY,15,10,1,2);px(g,D,11,12,2,2)}                                       // laser gun
  };
  set.idle=[0,1].map(f=>fin(cnv(16,18,g=>draw(g,f,'idle'))));
  set.run=[0,1,2,3].map(f=>fin(cnv(16,18,g=>draw(g,f,'run'))));
  set.climb=[0,1].map(f=>fin(cnv(16,18,g=>draw(g,f,'climb'))));set.jump=[fin(cnv(16,18,g=>draw(g,0,'jump')))];set.fall=[fin(cnv(16,18,g=>draw(g,0,'fall')))];
  set.white=set.idle.map(whiteOf);
  return set;
}
function mkTiles(W_){
  const r=rng(31),T={};
  const dith=(g,ramp,x0,y0,w,h,seed)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)px(g,rampAt(ramp,.25+.6*(((i*7+j*13+seed)%9)/9),i,j),x0+i,y0+j)};
  T.deep=cnv(8,8,g=>dith(g,W_.rock.slice(0,3),0,0,8,8,1));
  T.mid=cnv(8,8,g=>{dith(g,W_.rock.slice(1,4),0,0,8,8,3);px(g,W_.rock[0],2,3,2,1);px(g,W_.rock[0],5,6,2,1)});
  T.top=cnv(8,8,g=>{dith(g,W_.rock.slice(1,4),0,0,8,8,5);px(g,W_.topc[0],0,0,8,3);px(g,W_.topc[1],0,0,8,2);px(g,W_.topc[2],0,0,8,1);for(let i=0;i<4;i++)px(g,W_.topc[1],1+i*2,3,1,1+(i%2))});
  T.plat=cnv(8,8,g=>{px(g,W_.plat[0],0,0,8,4);px(g,W_.plat[1],0,0,8,1);px(g,K,0,4,8,1);for(let i=0;i<4;i++)px(g,K,1+i*2,1,1,3)});
  T.spike=cnv(8,8,g=>{for(let i=0;i<2;i++)poly(g,[[i*4,8],[i*4+2,1],[i*4+4,8]],[LM,LL,WH,WH])});
  T.spring=cnv(8,8,g=>{px(g,K,0,5,8,3);px(g,YL,1,6,6,1);for(let j=0;j<3;j++)px(g,j%2?OR:YL,1+(j%2),2+j,6-(j%2)*2,1);px(g,mg,0,1,8,2);px(g,MG,1,1,6,1)});
  T.crumble=cnv(8,8,g=>{dith(g,['#68372b','#9a6759','#b8884a'],0,0,8,8,7);px(g,K,2,1,1,5);px(g,K,4,3,1,4);px(g,K,6,2,1,3)});
  T.lava=[0,1,2,3].map(f=>cnv(8,8,g=>{for(let j=0;j<8;j++)for(let i=0;i<8;i++){const v=.5+.5*Math.sin((i+f*2)*.8+j*.9)+.25*Math.sin((i*1.7-f*3)+j*.4);const base=j<2?.85:j<5?.55:.25;px(g,rampAt(['#68372b',rd,OR,YL,WH],base+v*.3,i,j),i,j)}
    for(let i=0;i<8;i++){const hh=((i*3+f*2)%5<2)?1:0;if(hh){px(g,WH,i,0)}else px(g,YL,i,0)}
    px(g,WH,(1+f*2)%8,3);px(g,YL,(5+f*3)%8,2);px(g,rd,(3+f)%8,6);px(g,K,(6-f)%8,7)}));
  if(W_.ship){
    T.top=cnv(8,8,g=>{dith(g,W_.rock.slice(1,4),0,0,8,8,5);px(g,'#222222',0,0,8,3);for(let i=0;i<8;i+=4){px(g,YL,i,0,2,1);px(g,K,i+2,0,2,1)}px(g,W_.topc[1],0,1,8,1);px(g,W_.topc[0],0,2,8,1)});
    T.mid=cnv(8,8,g=>{dith(g,W_.rock.slice(0,3),0,0,8,8,3);px(g,W_.rock[0],0,0,8,1);px(g,W_.rock[0],0,0,1,8);px(g,W_.rock[3],1,1,1,1);px(g,W_.rock[3],6,6,1,1);px(g,W_.rock[3],6,1,1,1);px(g,W_.rock[3],1,6,1,1)});
    T.deep=cnv(8,8,g=>{dith(g,W_.rock.slice(0,2),0,0,8,8,9);px(g,W_.rock[2],3,3,2,1)});
    T.plat=cnv(8,8,g=>{px(g,W_.plat[0],0,0,8,3);px(g,W_.plat[1],0,0,8,1);for(let i=0;i<8;i+=2)px(g,K,i,1,1,2);px(g,K,0,3,8,1)});
    T.spikeA=[0,1].map(f=>cnv(8,8,g=>{px(g,D,0,6,8,2);let y=5;for(let i=0;i<8;i++){y=clamp(y+((i+f)%3===0?-3:(i+f)%3===1?2:1),1,6);px(g,'#ff4040',i,y,1,2);px(g,WH,i,y,1,1)}}));
    T.wall=[0,1,2,3,4].map(v=>cnv(8,8,g=>{
      for(let j=0;j<8;j++)for(let i=0;i<8;i++)px(g,rampAt([W_.rock[0],W_.rock[0],W_.rock[1]],.1+((i*3+j*5+v)%5)/14,i,j),i,j);
      px(g,W_.rock[1],0,0,8,1);px(g,W_.rock[0],0,7,8,1);
      if(v===1){px(g,W_.rock[2],0,3,8,2);px(g,W_.rock[3],0,3,8,1)}
      if(v===2){px(g,K,2,2,4,3);px(g,W_.glow,3,3,2,1)}
      if(v===3){ell(g,4,4,3,3,[K,VI,BL,CY]);px(g,WH,2,2,1,1);px(g,WH,5,5,1,1)}
      if(v===4){px(g,W_.rock[0],0,0,8,8);px(g,W_.rock[1],1,0,6,8);px(g,W_.rock[2],2,0,4,8);px(g,W_.rock[3],2,0,1,8);px(g,K,1,0,1,8);px(g,K,6,0,1,8)}}));
  }
  T.back=[0,1,2].map(v=>cnv(8,8,g=>{for(let j=0;j<8;j++)for(let i=0;i<8;i++)px(g,rampAt([W_.rock[0],W_.rock[0],W_.rock[1]],.2+((i*5+j*3+v*11)%7)/12,i,j),i,j);if(v===1){px(g,W_.glow,2,3,1,1);px(g,W_.glow,6,6,1,1)}if(v===2)px(g,W_.rock[2],4,2,2,1)}));
  T.gate=[0,1].map(f=>cnv(8,8,g=>{px(g,D,0,0,8,1);px(g,D,0,7,8,1);px(g,f?MG:mg,3,1,2,6);px(g,WH,4,1,1,6)}));
  T.conv=[0,1].map(f=>cnv(8,8,g=>{px(g,GM,0,0,8,3);px(g,K,0,3,8,1);for(let i=0;i<4;i++)px(g,f?YL:OR,i*2+f,1,1,1);px(g,D,0,4,8,4)}));
  /* ladders, platforms and hazards, drawn per biome: vine, wood and rope, metal, hot iron, bone */
  {const wi=WORLDS.indexOf(W_);
   const LD=[
    {r1:GR,r2:GD,r3:LG,run:TN,run2:BR,acc:MG},{r1:'#b8884a',r2:BR,r3:YL,run:OR,run2:BR,acc:YL},{r1:'#8af4ff',r2:'#1c5a8a',r3:WH,run:'#38d0ff',run2:'#1c3a78',acc:YL},{r1:'#ffc060',r2:'#7a3a1a',r3:YL,run:'#ff9a44',run2:'#7a3a1a',acc:YL},{r1:'#d8fff4',r2:'#2a8a7a',r3:WH,run:'#7af0d0',run2:'#1c5a5a',acc:'#ffe08a'}][wi];
   const ladder=top=>cnv(8,8,g=>{
     px(g,LD.r1,0,0,1,8);px(g,LD.r2,1,0,1,8);px(g,LD.r1,6,0,1,8);px(g,LD.r2,7,0,1,8);
     if(wi===0){for(let j=0;j<8;j+=2){px(g,LD.r3,0,j,1,1);px(g,LD.r3,7,j+1,1,1)}px(g,LD.r1,-1,3);px(g,LD.acc,7,6)}
     if(wi===2){px(g,LD.r3,0,0,1,8);px(g,LD.r3,6,0,1,8)}
     if(wi===4){for(const y0 of [0,4]){px(g,LD.r3,0,y0,2,2);px(g,LD.r3,6,y0,2,2)}}
     for(const y0 of [1,5]){px(g,LD.run,1,y0,6,2);px(g,LD.run2,1,y0+1,6,1);px(g,LD.r3,1,y0,6,1);if(wi===3){px(g,YL,2,y0,2,1)}if(wi===4){px(g,LD.run,0,y0,1,2);px(g,LD.run,7,y0,1,2)}}
     if(wi===0)px(g,LD.acc,3,5,1,1);if(wi===1)px(g,K,3,2,1,1);if(wi===2){px(g,LD.acc,1,3,1,1);px(g,LD.acc,6,7,1,1)}
     if(top){px(g,K,0,0,8,1);px(g,LD.run,0,1,8,1);px(g,LD.r3,0,1,8,1);px(g,LD.acc,2,0,1,1);px(g,LD.acc,5,0,1,1)}});
   T.ladder=[ladder(false),ladder(true)];
   const PL=[{hi:PG,top:LG,mid:GR,m2:BR,low:TN,dk:'#2a0a2a'},{hi:YL,top:'#ffffcc',mid:OR,m2:RD,low:rd,dk:BR},{hi:'#e8ffff',top:'#38d0ff',mid:'#2c5aa8',m2:'#1c3a78',low:'#0c1c48',dk:K},{hi:'#fff6b0',top:'#ffb030',mid:'#9a4a30',m2:'#4a2018',low:'#1c0808',dk:rd},{hi:'#fff0b0',top:'#ffc060',mid:'#1c7a44',m2:'#0e4a2a',low:'#072a18',dk:K}][wi];
   const plat=(l,r)=>cnv(8,7,g=>{
     px(g,PL.hi,0,0,8,1);px(g,PL.top,0,1,8,1);px(g,PL.mid,0,2,8,2);px(g,PL.m2,0,3,8,1);px(g,PL.low,0,4,8,1);px(g,PL.dk,0,5,8,1);
     if(wi===0){px(g,GR,0,1,8,1);px(g,PG,1,0,2,1);px(g,PG,5,0,1,1);px(g,BR,0,2,8,2);px(g,GR,0,2,8,1);px(g,TN,2,3,1,1);px(g,TN,5,4,1,1);px(g,GR,2,5,1,2);px(g,GR,6,5,1,1)}
     if(wi===1){px(g,K,2,3,1,1);px(g,K,5,2,1,2);px(g,'#ffffaa',3,0,2,1);px(g,BR,0,4,8,1)}
     if(wi===2){for(let i=0;i<8;i+=4){px(g,YL,i,2,2,1);px(g,K,i+2,2,2,1)}px(g,K,0,4,8,1);for(let i=1;i<8;i+=2)px(g,D,i,5,1,1);px(g,CY,3,1,2,1)}
     if(wi===3){px(g,rd,0,4,8,1);px(g,OR,1,5,2,1);px(g,YL,2,5,1,1);px(g,OR,5,5,2,1);px(g,'#4a1c14',3,2,1,1);px(g,OR,6,0,1,1)}
     if(wi===4){px(g,LL,0,0,8,1);px(g,PG,2,5,1,2);px(g,PG,6,5,1,1);px(g,LP,3,2,2,1)}
     if(l){px(g,0,0,0,1,1);ctxClear(g,0,0,1,1);px(g,PL.dk,0,1,1,5)}
     if(r){ctxClear(g,7,0,1,1);px(g,PL.dk,7,1,1,5)}});
   const ctxClear=(g,x,y,w,h)=>g.clearRect(x,y,w,h);
   T.platV=[plat(1,1),plat(1,0),plat(0,0),plat(0,1)];
   if(wi!==2){const SP=[['#7a0a0a','#ff3030','#ffa0a0',WH],['#7a0a0a','#ff3030','#ffa0a0',WH],0,['#7a0a0a','#ff3030','#ffa0a0',WH],['#7a0a0a','#ff3030','#ffa0a0',WH]][wi];
     T.spike=cnv(8,8,g=>{for(let i=0;i<2;i++)poly(g,[[i*4,8],[i*4+2,1],[i*4+4,8]],SP);px(g,K,0,7,8,1)})}
  }
  return T;
}
function mkPlants(W_){
  const P=W_.plant,lf=P.leaf,fl=P.fl,out={top:[],hang:[]};
  const t=(w,h,fn)=>out.top.push(cnv(w,h,fn)),hg=(w,h,fn)=>out.hang.push(cnv(w,h,fn));
  t(9,8,g=>{for(let i=0;i<5;i++){const x=1+i*2;line(g,i%2?lf[2]:lf[1],x,7,x+(i-2),1+(i%2)*2);px(g,lf[0],x,7)}});                         // grass tuft
  t(9,12,g=>{px(g,lf[1],4,4,1,8);px(g,lf[2],3,8,2,1);px(g,lf[2],5,6,2,1);ell(g,4.5,3,3.5,3,[lf[0],fl[0],fl[1],WH]);px(g,fl[2],4,3,1,1)});    // flower
  t(11,10,g=>{px(g,lf[2],5,5,2,5);ell(g,5.5,4,5,3.5,[lf[0],fl[0],fl[1],WH]);px(g,WH,3,3,1,1);px(g,WH,7,2,1,1);px(g,fl[2],5,4,1,1)});          // mushroom
  t(13,12,g=>{for(let i=0;i<4;i++){const a=-.9+i*.6;thick(g,i%2?lf[1]:lf[2],6,11,6+Math.sin(a)*8,11-Math.cos(a)*10,1);}px(g,lf[0],5,10,3,2)});  // fern
  t(12,9,g=>{ell(g,6,5,5.5,3.5,lf);px(g,fl[0],3,4,2,2);px(g,fl[1],7,3,2,2);px(g,fl[2],9,5,1,1)});                                              // flowering bush
  t(7,14,g=>{px(g,lf[1],3,3,1,11);for(let k=0;k<3;k++){px(g,lf[2],2-(k&1),5+k*3,2,1);px(g,lf[2],4,6+k*3,2+(k&1),1)}ell(g,3.5,2,2.5,2,[lf[0],W_.glow,WH,WH])});   // glow bud
  t(15,18,g=>{thick(g,lf[1],7,18,7,6,2);for(let i=0;i<5;i++){const a=-1.2+i*.6;thick(g,i%2?lf[1]:lf[2],7,6,7+Math.sin(a)*8,6-Math.cos(a)*6+2,1);px(g,lf[2],7+Math.sin(a)*8,6-Math.cos(a)*6+2,1,1)}ell(g,7,5,2,2,[lf[0],fl[0],fl[1],WH])});   // frond tree
  t(11,20,g=>{px(g,lf[1],5,6,2,14);for(let k=0;k<3;k++){px(g,lf[2],2,9+k*4,3,1);px(g,lf[2],6,11+k*4,3,1)}ell(g,5.5,5,5,5,[lf[0],fl[0],fl[1],WH]);ell(g,5.5,5,2,2,[fl[2],WH,WH,WH])});   // giant flower
  t(9,16,g=>{px(g,lf[1],4,5,1,11);ell(g,4.5,3,3.5,3.5,[W_.glow,WH,WH,WH]);for(let k=0;k<3;k++)px(g,lf[2],1+(k&1)*5,9+k*2,3,1)});   // glowing bulb stalk
  if(P.kind==='hive')t(12,9,g=>{for(let i=0;i<3;i++)ell(g,3+i*3.2,6-(i%2)*2,3,3.5,[lf[0],lf[1],fl[2],WH]);px(g,fl[0],2,5,1,1)});
  if(P.kind==='desert')for(let k=0;k<3;k++)t(14,16+k*2,g=>{for(let i=0;i<4;i++){const hh=8+((i*7+k*3)%7)+k*2,x=2+i*3;poly(g,[[x,17],[x+1,17-hh],[x+3,17]],[[VI,mg,MG,WH],[BL,cy,CY,WH],[PU,LV,MG,WH]][(i+k)%3])}});
  hg(7,24,g=>{px(g,lf[1],3,0,1,22);for(let k=0;k<7;k++){px(g,lf[2],2-(k&1)*2,2+k*3,3,1);px(g,lf[2],4,3+k*3,3,1)}px(g,fl[0],2,22,3,2);px(g,W_.glow,3,23,1,1)});   // long vine
  hg(5,16,g=>{px(g,lf[1],2,0,1,15);for(let k=0;k<5;k++){px(g,lf[2],1-(k&1),2+k*3,2,1);px(g,lf[2],3,3+k*3,2,1)}px(g,fl[0],2,14,2,2)});             // hanging vine
  hg(5,11,g=>{px(g,lf[1],2,0,1,9);for(let k=0;k<3;k++){px(g,lf[2],(k&1)?0:3,2+k*3,2,1)}ell(g,2.5,9,2,2,[lf[0],W_.glow,WH,WH])});                   // glowing lantern fruit
  hg(9,9,g=>{for(let i=0;i<3;i++){const x=1+i*3;line(g,lf[i%3],x,0,x+(i-1),8)}});                                                                  // roots
  return out;
}

/* ---------------- coloured flowers, tall grass and blooming vines: a second layer of plants that grows only outdoors ---------------- */
const FLC=[
 [['#ff44cc','#ffaaee'],['#33ddff','#bbf6ff'],['#ffdd33','#ffffaa'],['#ffffff','#e0d0ff'],['#ff8844','#ffcc99']],
 [['#ff6699','#ffc0d8'],['#ffcc22','#fff0a0'],['#ee4422','#ff9977'],['#ffffff','#fff0d0'],['#cc66ff','#e8b8ff']],
 [['#44ff88','#ccffdd'],['#44aaff','#bbe0ff'],['#ffee55','#ffffbb'],['#ffffff','#ddf8ff'],['#ff77cc','#ffc0e8']],
 [['#ff5522','#ffaa66'],['#ffcc22','#ffee99'],['#ff2222','#ff8888'],['#ffffff','#ffd0a0']],
 [['#ff55aa','#ffbbdd'],['#55ffcc','#bbffee'],['#cc88ff','#eeccff'],['#ffee66','#ffffbb']]];
/* how lush the ground is at a column: smooth, so there are green belts and bare stretches */
function lushAt(tx,idx){const a=Math.sin(tx*.016+idx*1.7)*.5+.5,b=Math.sin(tx*.047+idx*3.1+1)*.5+.5;return clamp(1.1*(a*.65+b*.35)-.04,.2,1)}
function mkFlora(W_,idx){
  const P=W_.plant,lf=P.leaf,out={flo:[],tall:[],hang:[]},t=(w,h,fn)=>out.flo.push(cnv(w,h,fn)),tl=(w,h,fn)=>out.tall.push(cnv(w,h,fn)),hg=(w,h,fn)=>out.hang.push(cnv(w,h,fn)),L4=[lf[0],lf[1],lf[2],lf[2]];
  for(const c of FLC[idx]){
    t(9,11,g=>{px(g,lf[1],4,5,1,6);px(g,lf[2],2,8,2,1);px(g,lf[2],5,7,2,1);px(g,c[0],3,2,3,5);px(g,c[0],2,3,5,3);px(g,c[1],4,3,1,1);px(g,'#ffee55',4,4,1,1)});
    t(7,11,g=>{px(g,lf[1],3,5,1,6);px(g,lf[2],1,8,2,1);px(g,c[0],2,2,3,4);px(g,c[0],1,3,5,2);px(g,c[1],3,2,1,2);px(g,c[0],1,1,1,2);px(g,c[0],5,1,1,2)});
    t(9,14,g=>{px(g,lf[1],4,1,1,13);px(g,lf[1],4,1,3,1);for(let k=0;k<3;k++){px(g,c[k&1?1:0],6-(k&1),2+k*3,2,3);px(g,c[0],3-(k&1)*2,3+k*3,2,2)}});
    t(7,19,g=>{px(g,lf[1],3,4,1,15);for(let k=0;k<6;k++){px(g,c[k&1],3-(k&1),1+k*2,2,2);px(g,c[0],3+(k%2),2+k*2,1,1)}px(g,lf[2],1,14,2,1);px(g,lf[2],4,16,2,1)});
    t(11,9,g=>{for(let k=0;k<3;k++){const x=1+k*4,y=4-(k&1)*3;px(g,lf[1],x+1,y+2,1,7-y);px(g,c[0],x,y,3,2);px(g,c[1],x+1,y,1,1);px(g,c[0],x+1,y-1,1,1)}});
    t(14,10,g=>{ell(g,7,6,6.5,3.8,L4);for(let k=0;k<5;k++)px(g,k&1?c[0]:c[1],2+k*2,3+((k*3)%4),2,2)});
    if(idx===0||idx===4)t(9,12,g=>{px(g,lf[1],4,6,1,6);ell(g,4.5,4,3.5,3.5,[c[0],c[0],c[1],WH]);px(g,W_.glow,4,4,1,1);px(g,c[1],0,1,1,1);px(g,c[1],8,3,1,1)});
    hg(7,22,g=>{px(g,lf[1],3,0,1,18);for(let k=0;k<3;k++)px(g,lf[2],2-(k&1)*2+1,3+k*5,3,1);px(g,c[0],2,18,3,3);px(g,c[1],3,19,1,1);px(g,c[0],1,15,2,2)});
  }
  const seed=['#ffee88','#ffd070','#aaffcc','#ff8844','#ff99dd'][idx];
  for(let k=0;k<3;k++)tl(11+k*2,18+k*3,g=>{const h=18+k*3;for(let i=0;i<5+k;i++){const x=1+i*2,hh_=h-4-((i*5+k*3)%7),dx=((i+k)%3)-1;line(g,i&1?lf[2]:lf[1],x,h-1,x+dx*2,h-1-hh_);px(g,i&1?lf[1]:lf[2],x+dx*2,h-2-hh_,1,2);if((i+k)%3===0)px(g,seed,x+dx*2,h-3-hh_,1,2)}});
  if(idx===0){
    t(13,22,g=>{px(g,lf[1],6,8,1,14);px(g,lf[2],3,14,3,1);px(g,lf[2],7,12,3,1);ell(g,6.5,6,5.5,5.5,['#ff22aa','#ff66dd','#ffbbff','#ffffff']);ell(g,6.5,6,2.5,2.5,['#33ffee','#aaffff','#ffffff','#ffffff'])});
    t(11,12,g=>{for(let i=0;i<3;i++){const x=1+i*4;px(g,'#e8f0ff',x+1,6+(i&1),1,6);ell(g,x+1.5,5+(i&1),2.5,3,['#0a6a8a','#33ddff','#bbf6ff','#ffffff'])}});
  }else if(idx===1){
    t(11,16,g=>{px(g,'#2c7a3a',4,3,3,13);px(g,'#5ac25a',4,3,1,13);px(g,'#2c7a3a',1,7,3,2);px(g,'#2c7a3a',1,5,1,3);px(g,'#2c7a3a',7,9,3,2);px(g,'#2c7a3a',9,6,1,4);px(g,'#9aee8a',5,3,1,10);px(g,'#ff5599',4,1,3,2);px(g,'#ffcc22',5,2,1,1);px(g,'#ff77aa',1,4,1,1);px(g,'#ffee55',9,5,1,1)});
    t(13,9,g=>{for(let i=0;i<7;i++){const a=-1.5+i*.5;line(g,i&1?'#2c8a5a':'#5acc8a',6,8,6+Math.sin(a)*6,8-Math.cos(a)*7)}px(g,'#ff5533',6,0,1,3);px(g,'#ffaa44',6,1,1,1)});
    t(10,8,g=>{ell(g,5,5,4.5,2.8,['#2c6a4a','#4aaa7a','#9aeabb','#ffffff']);px(g,'#ff77aa',4,1,2,2);px(g,'#ffeeaa',4,1,1,1)});
  }else if(idx===2){
    t(14,13,g=>{px(g,'#1c2a4a',0,9,14,4);px(g,'#3c5a8a',0,9,14,1);px(g,'#70a4b2',1,10,12,1);px(g,'#44ffcc',11,11,1,1);for(let i=0;i<5;i++){const x=2+i*2;line(g,i&1?'#2c8a4c':'#5acc7a',x,9,x+(i-2),2+(i&1)*2)}px(g,'#aaffcc',4,3,1,1);px(g,'#ffee55',9,2,1,1)});
    t(12,18,g=>{px(g,'#bbbbcc',5,2,1,16);for(let k=0;k<5;k++){px(g,'#2c8a4c',2+(k&1)*5,4+k*3,3,2);px(g,'#7aff9a',3+(k&1)*5,4+k*3,1,1)}px(g,'#ff55aa',5,0,2,2);px(g,'#44ffcc',6,15,1,1)});
    t(11,10,g=>{ell(g,5.5,6,5,3.5,['#14502a','#2c8a4c','#7aff9a','#ccffdd']);px(g,'#44ffcc',5,5,1,1);px(g,'#44ffcc',3,6,1,1);px(g,'#ffffff',8,5,1,1)});
  }else if(idx===3){
    t(10,14,g=>{px(g,'#3a1a14',4,5,2,9);for(let i=0;i<5;i++)px(g,i&1?'#ff5522':'#ffcc33',2+i,2+(i&1)*2,1,4-(i&1));px(g,'#ffee99',4,3,2,1);px(g,'#ff2200',3,1,4,1)});
    t(9,20,g=>{for(let i=0;i<3;i++){const x=1+i*3;px(g,'#2a0a08',x,6,1,14);px(g,'#4a2018',x+1,8,1,12);px(g,'#ff8a22',x,4+(i&1)*2,1,3);px(g,'#ffee66',x,4+(i&1)*2,1,1)}});
  }else{
    t(10,18,g=>{for(let y=0;y<14;y++){const x=4+Math.round(Math.sin(y*.55)*2.5);px(g,'#3a0a38',x,17-y,2,1);px(g,'#a050e0',x,17-y,1,1)}ell(g,6,3,3.5,3.5,['#5a1a4a','#c03a8a','#ff88cc','#ffffff']);px(g,'#77ffd0',6,3,1,1)});
    t(12,11,g=>{for(let i=0;i<3;i++)ell(g,3+i*3,7-(i&1)*2,2.5,3.5,['#1a4a40','#34a080','#80e0b8','#e0fff0']);px(g,'#ffee66',3,6,1,1);px(g,'#ffee66',9,5,1,1)});
  }
  return out;
}
function mkDecor(W_,idx){
  const out=[],r=rng(55+idx);
  if(idx===0)for(let i=0;i<4;i++){const h=18+((r()*24)|0);out.push(cnv(28,h+14,g=>{thick(g,[BL,PU,LP][i%3],14,h+14,14,12,5);ell(g,14,10,13,9,[VI,PU,LP,[LV,MG,PG,OR][i%4],WH]);for(let k=0;k<4;k++)px(g,WH,6+k*5,6+(k%2)*3,2,2)}))}
  else if(idx===1)for(let i=0;i<4;i++){const h=26+((r()*30)|0);out.push(cnv(20,h,g=>{poly(g,[[2,h],[10,0],[18,h]],[VI,mg,MG,WH]);poly(g,[[0,h],[4,h*.5],[8,h]],[VI,mg,MG])}))}
  else if(idx===2)for(let i=0;i<4;i++){const w=40+((r()*40)|0);out.push(cnv(w,26,g=>{poly(g,[[0,8],[w,8],[w*.8,24],[w*.2,20]],[BR,TN,OR,'#b8884a']);px(g,GR,0,6,w,3);px(g,LG,0,6,w,1);for(let k=0;k<5;k++)px(g,WH,4+k*8,5,2,2)}))}
  else if(idx===3)for(let i=0;i<3;i++){const h=40+((r()*30)|0);out.push(cnv(60,h,g=>{poly(g,[[0,h],[26,0],[34,0],[60,h]],['#1c0808','#3a1a14',BR,rd]);px(g,OR,27,0,6,3);px(g,YL,29,0,2,2);for(let k=0;k<5;k++)px(g,rd,10+k*8,h*.5+(k%2)*4,2,6)}))}
  else for(let i=0;i<4;i++){const h=30+((r()*36)|0);out.push(cnv(24,h,g=>{poly(g,[[2,h],[2,6],[8,0],[18,6],[22,h]],['#0a0630','#1c1840',VI,BL]);for(let k=0;k<6;k++)px(g,k%2?mg:cy,5+(k%3)*5,6+k*((h-10)/6),2,2)}))}
  return out;
}

/* big background props: trees, columns, arches and so on, one set per world, drawn behind the player */
function mkDeco(idx,W_){
  const DC={},F=(w,h,fn)=>fin(cnv(w,h,fn)),lf=W_.plant.leaf,fl=W_.plant.fl,GL=W_.glow;
  const ST=[[VI,PU,LP,LV],[BR,rd,RD,OR],[D,GM,LM,LL],['#1c0808',BR,rd,OR],['#3a0a38',PU,mg,MG]][idx];
  const ring=(g,w,h,t)=>{ell(g,w/2,h*.42,w/2,h*.4,ST);g.clearRect(t,Math.floor(h*.42),w-2*t,h)};
  /* an arch: two legs and a curved lintel; ship worlds get a bulkhead frame, the hive a rib */
  DC.arch=F(36,34,g=>{
    if(idx===2){px(g,ST[1],0,0,36,6);px(g,ST[2],0,0,36,1);px(g,ST[1],0,0,5,34);px(g,ST[1],31,0,5,34);px(g,ST[2],0,0,1,34);for(let k=0;k<4;k++){px(g,WH,2,4+k*8,1,1);px(g,WH,33,4+k*8,1,1)}px(g,YL,6,3,8,1);px(g,K,14,3,8,1);px(g,YL,22,3,8,1)}
    else if(idx===4){for(let y=0;y<34;y++){const t=y/34,xo=Math.round(Math.sin(t*Math.PI)*0);px(g,ST[1],0,y,6,1);px(g,ST[2],1,y,2,1);px(g,ST[1],30,y,6,1);px(g,ST[2],31,y,2,1)}ell(g,18,10,18,10,ST);g.clearRect(6,10,24,24);px(g,PG,17,2,2,2)}
    else{px(g,ST[1],0,10,6,24);px(g,ST[2],0,10,2,24);px(g,ST[0],5,10,1,24);px(g,ST[1],30,12,6,22);px(g,ST[2],30,12,2,22);ell(g,18,12,18,11,ST);g.clearRect(6,12,24,22);px(g,ST[0],7,12,3,2);for(let k=0;k<3;k++)px(g,GL,8+k*8,3+(k%2),2,1)}});
  DC.pillar=F(12,32,g=>{
    if(idx===2){px(g,ST[1],2,0,8,32);px(g,ST[2],2,0,2,32);px(g,ST[0],9,0,1,32);for(let k=0;k<4;k++){line(g,ST[0],2,k*8,9,k*8+8);line(g,ST[2],9,k*8,2,k*8+8)}px(g,YL,0,0,12,2);px(g,K,3,0,3,2)}
    else if(idx===4){for(let y=0;y<32;y++){const w=4+Math.round(Math.sin(y*.5)*1.5);px(g,ST[1],6-w/2,y,w,1);px(g,ST[3],6-w/2,y,1,1)}for(let k=0;k<3;k++)ell(g,6,4+k*10,5,3,ST)}
    else{px(g,ST[1],2,0,8,32);px(g,ST[2],2,0,2,32);px(g,ST[0],9,0,1,32);px(g,ST[2],0,0,12,3);px(g,ST[2],0,29,12,3);px(g,ST[0],1,3,10,1);if(idx===0)for(let k=0;k<4;k++){px(g,lf[1],1,6+k*6,10,2);px(g,lf[2],2,6+k*6,3,1)}else for(let k=0;k<5;k++)px(g,ST[0],3,5+k*5,6,1)}});
  DC.statue=F(14,22,g=>{
    if(idx===2){px(g,ST[0],2,17,10,5);px(g,ST[1],4,6,6,11);px(g,ST[2],4,6,2,11);px(g,ST[1],3,1,8,5);px(g,K,4,2,2,2);px(g,CY,7,2,2,2);line(g,LL,7,1,9,-1);px(g,rd,1,8,3,1);px(g,YL,9,9,2,1)}
    else if(idx===4){ell(g,7,12,5,9,ST);px(g,PG,6,8,2,3);px(g,K,6,12,2,2);px(g,ST[0],2,19,10,3)}
    else{px(g,ST[0],2,17,10,5);px(g,ST[1],4,7,6,10);px(g,ST[2],4,7,2,10);ell(g,7,4,3,3,ST);px(g,K,6,3,1,1);px(g,K,8,3,1,1);px(g,ST[2],1,9,3,3);px(g,GL,6,10,2,2)}});
  if(idx===0){
    DC.jtotem=F(14,30,g=>{const T=['#06303a','#0e5a64','#2c9aa0','#8affee'];px(g,T[1],3,6,8,24);px(g,T[2],3,6,2,24);px(g,T[0],10,6,1,24);px(g,T[1],1,26,12,4);px(g,T[2],1,26,12,1);ell(g,7,5,6,5,T);px(g,'#ffcc44',4,3,2,2);px(g,'#ffcc44',8,3,2,2);px(g,T[0],6,6,2,3);px(g,'#ffcc44',3,13,8,1);px(g,'#ffcc44',5,17,4,1);px(g,T[3],2,0,1,2);px(g,T[3],11,0,1,2);for(let k=0;k<3;k++)px(g,'#33dd88',3+k*3,20+(k&1),1,5)});
    DC.jcrys=F(26,26,g=>{const C=['#0a3a5a','#2a8ac0','#7ae0ff','#ffffff'];poly(g,[[2,26],[5,10],[9,1],[12,26]],C);poly(g,[[9,26],[14,6],[18,2],[20,26]],C);poly(g,[[16,26],[20,12],[24,8],[25,26]],C);poly(g,[[0,26],[2,17],[4,26]],C);px(g,'#ffffff',9,3,1,2);px(g,'#ffffff',18,4,1,2)});
    DC.jbones=F(38,22,g=>{const B=['#6a5a38','#b8a070','#e8d8b0','#ffffee'];px(g,B[1],2,19,34,3);px(g,B[2],2,19,34,1);for(let i=0;i<5;i++){const x=6+i*7,h=18-Math.abs(i-2)*4;for(let y=0;y<h;y++){const w=Math.round(Math.sin(y/h*Math.PI*.5)*2.4);px(g,B[1],x-w,19-y,2,1);px(g,B[2],x-w,19-y,1,1)}}ell(g,34,14,4,5,B);px(g,'#06080c',32,12,2,2);px(g,'#06080c',35,12,2,2)});
    DC.jlanterns=F(30,36,g=>{const W_=['#3a1a08','#7a4a18','#c08a38'];thick(g,W_[1],15,36,15,14,3);thick(g,W_[2],14,36,14,14,1);line(g,W_[1],15,16,4,8);line(g,W_[1],15,14,26,6);line(g,W_[1],15,22,24,18);for(const [x,y] of [[4,10],[26,8],[24,20],[15,12]])ell(g,x,y,3.5,3.5,['#c04a08','#ff8a22','#ffdd66','#ffffff'])});
    DC.jshell=F(20,18,g=>{const S=['#5a1a2a','#c04a5a','#ff9a88','#ffeedd'];ell(g,9,10,8,7,S);ell(g,9,10,5,4,[S[0],S[1],S[2],S[3]]);ell(g,9,10,2,2,[S[3],S[3],S[3],S[3]]);ell(g,17,14,3,3,['#3a1a1a','#a07a6a','#e0c0a0','#fff']);px(g,'#ffeedd',18,10,1,4);px(g,'#ffeedd',20-1,9,1,1)});
    DC.jrunes=F(30,30,g=>{const R=['#14301c','#2a6a3a','#5aa868','#aaffbb'];ell(g,15,15,14,14,R);g.clearRect(7,7,16,16);ell(g,15,15,7,7,[R[0],R[0],R[0],R[0]]);g.clearRect(9,9,12,12);px(g,R[1],2,26,26,4);px(g,R[2],2,26,26,1);for(let k=0;k<6;k++)px(g,'#55ff88',4+(k%3)*9,4+((k/3)|0)*20,3,1);ell(g,15,15,3,3,['#55ff88','#aaffbb','#ffffff','#ffffff'])});
    DC.jpod=F(22,28,g=>{const P=['#0a3a14','#2c8a2c','#7ad25a','#ccff99'];px(g,P[1],10,12,3,16);px(g,P[2],10,12,1,16);poly(g,[[3,12],[6,0],[11,8]],[P[0],P[1],P[2],P[3]]);poly(g,[[19,12],[16,0],[11,8]],[P[0],P[1],P[2],P[3]]);ell(g,11,12,6,5,['#6a0a08','#d02a1a','#ff7733','#ffdd66']);for(let k=0;k<4;k++)px(g,'#ffffee',6+k*3,9+(k&1)*7,1,2);px(g,P[2],2,20,6,1);px(g,P[2],14,22,6,1)});
  }
  if(idx===0)for(const k of ['jtotem','jshell','jrunes','jpod','jcrys','jbones','jlanterns']){const im=DC[k],c=document.createElement('canvas');c.width=im.width*2;c.height=im.height*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,0,0,c.width,c.height);DC[k]=c}
  DC.glyph=F(12,18,g=>{px(g,ST[1],1,0,10,18);px(g,ST[2],1,0,2,18);px(g,ST[0],10,0,1,18);px(g,K,3,3,6,12);const c=idx===2?CY:GL;for(let k=0;k<4;k++){px(g,c,4,4+k*3,(k&1)?4:2,1);px(g,c,7,5+k*3,1,2)}});
  DC.spire=F(18,38,g=>{
    if(idx===2){poly(g,[[0,38],[3,10],[11,2],[12,20],[18,38]],ST);line(g,LL,3,10,11,2);px(g,YL,6,26,2,1);px(g,CY,9,14,1,1)}
    else if(idx===4){poly(g,[[2,38],[7,0],[11,0],[16,38]],[ST[0],ST[1],ST[2],ST[3]]);px(g,PG,8,6,1,3)}
    else if(idx===3){poly(g,[[1,38],[8,0],[17,38]],['#050104','#1c0808','#2a0a08',BR]);px(g,OR,8,10,1,16);px(g,YL,8,14,1,3)}
    else poly(g,[[1,38],[8,0],[17,38]],idx===0?[VI,mg,MG,WH]:[BR,rd,RD,OR])});
  DC.crate=F(16,14,g=>{if(idx===2){px(g,BR,0,0,16,14);px(g,TN,0,0,16,2);px(g,K,0,6,16,1);px(g,K,7,0,2,14);px(g,YL,2,9,4,1);px(g,OR,10,3,4,1)}else{px(g,ST[1],0,0,16,14);px(g,ST[2],0,0,16,2);px(g,ST[0],0,6,16,1);px(g,ST[0],8,0,1,14);if(idx===4)ell(g,8,7,4,4,[ST[0],mg,PG,WH])}});
  DC.weed=F(10,26,g=>{const c=idx===2?[ST[1],CY,'#9ad2e0']:idx===4?['#3a0a38',mg,PG]:[lf[0],lf[1],lf[2]];for(let k=0;k<3;k++){let x=3+k*2;for(let y=25;y>0;y--){x+=(Math.sin(y*.4+k)>.3?1:0)-(Math.sin(y*.4+k)<-.3?1:0);x=clamp(x,0,9);px(g,c[k%3],x,y)}}if(idx===2)px(g,YL,5,2)});
  DC.shroom=F(22,18,g=>{if(idx===1){for(let i=0;i<3;i++)poly(g,[[3+i*6,18],[5+i*6,18-8-i*2],[8+i*6,18]],[VI,mg,MG,WH]);}
    else if(idx===2){px(g,GM,9,6,3,12);ell(g,10.5,5,6,4,['#1b5a3a','#2c8a2c','#9ad284','#ccff99']);px(g,CY,8,4,2,2)}
    else if(idx===4){for(let i=0;i<3;i++)ell(g,5+i*6,12-(i&1)*3,3.5,5,['#3a0a38',mg,PG,WH])}
    else if(idx===3){for(let i=0;i<3;i++){px(g,BR,4+i*6,9-(i&1)*2,2,9+(i&1)*2);ell(g,5+i*6,8-(i&1)*2,3,2.5,[rd,OR,YL,WH])}}
    else{for(let i=0;i<3;i++){px(g,TN,4+i*6,9-(i&1)*3,2,9+(i&1)*3);ell(g,5+i*6,8-(i&1)*3,4,3,[PU,mg,MG,WH])}}});
  DC.bush=F(24,16,g=>{
    if(idx===1){px(g,GD,10,4,4,12);px(g,GR,10,4,1,12);px(g,GD,5,8,3,5);px(g,GD,5,8,6,2);px(g,GD,16,6,3,6);px(g,GD,13,9,6,2);px(g,MG,11,3,2,2)}
    else if(idx===3){for(let i=0;i<6;i++)line(g,[BR,OR,rd][i%3],12,15,2+i*4,2+(i%3)*3);for(let i=0;i<4;i++)px(g,YL,4+i*5,3+(i%2)*4,1,1)}
    else{for(let i=0;i<6;i++)line(g,i%2?lf[2]:lf[1],12,15,2+i*4,2+(i%2)*4);ell(g,12,11,9,5,lf);px(g,fl[0],7,7,2,2);px(g,fl[1],15,6,2,2);if(idx===2)px(g,CY,11,9,1,1)}});
  DC.tree=F(40,56,g=>{
    if(idx===0){px(g,TN,18,18,4,38);px(g,OR,18,18,1,38);px(g,BR,21,18,1,38);ell(g,20,14,19,12,[VI,PU,mg,MG,WH]);ell(g,10,22,9,6,[VI,PU,mg,MG]);ell(g,30,21,9,6,[VI,PU,mg,MG]);for(let k=0;k<7;k++)px(g,WH,5+k*5,8+(k%3)*4,2,2)}
    else if(idx===1){thick(g,TN,16,55,22,20,3);thick(g,BR,17,55,23,20,1);for(let i=0;i<7;i++){const a=-1.4+i*.5;thick(g,i%2?GR:LG,22,20,22+Math.sin(a)*17,20-Math.cos(a)*9+4,1)}px(g,OR,20,22,3,3);px(g,OR,24,23,2,2)}
    else if(idx===2){px(g,GM,10,44,20,12);px(g,LL,10,44,20,1);px(g,D,10,50,20,1);px(g,YL,12,46,3,1);px(g,CY,24,46,3,1);px(g,'#2c8a2c',19,16,3,28);px(g,'#9ad284',19,16,1,28);ell(g,20,14,17,12,[ '#1b5a3a','#2c8a2c','#9ad284','#ccff99']);ell(g,9,24,7,5,['#1b5a3a','#2c8a2c','#9ad284']);ell(g,31,23,7,5,['#1b5a3a','#2c8a2c','#9ad284']);for(let k=0;k<5;k++)px(g,[CY,MG,YL][k%3],6+k*7,9+(k%2)*8,2,2)}
    else if(idx===3){thick(g,'#1c0808',20,55,20,12,4);line(g,'#2a0a08',20,28,6,14);line(g,'#2a0a08',20,24,34,10);line(g,'#2a0a08',20,38,8,30);line(g,'#2a0a08',20,34,33,24);for(const [x,y] of [[6,14],[34,10],[8,30],[33,24],[20,12]]){ell(g,x,y,3,3,['#2a0a08',rd,OR,YL])}px(g,OR,19,40,1,6);px(g,YL,19,42,1,2)}
    else{thick(g,ST[1],20,55,20,16,4);thick(g,ST[2],18,55,18,16,1);for(let i=0;i<5;i++){const a=-1.2+i*.6;line(g,ST[2],20,16,20+Math.sin(a)*17,16-Math.cos(a)*10+6);ell(g,20+Math.sin(a)*17,16-Math.cos(a)*10+6,2.5,2.5,['#3a0a38',mg,PG,WH])}ell(g,20,12,5,5,['#3a0a38',mg,PG,WH]);px(g,K,19,11,2,2)}});
  DC.porthole=F(18,18,g=>{ell(g,9,9,8.5,8.5,[D,GM,LM,LL]);ell(g,9,9,6,6,['#02020e','#0a0a30','#101a50','#101a50']);for(const [a,b] of [[6,6],[11,7],[8,11],[12,12],[5,10]])px(g,WH,a,b);px(g,CY,7,5,2,1)});
  DC.girderL=F(7,22,g=>{px(g,GM,0,0,7,2);px(g,LL,0,0,7,1);px(g,D,1,2,1,20);px(g,GM,5,2,1,20);for(let y=2;y<22;y+=4){line(g,LM,1,y,5,y+4);line(g,D,5,y,1,y+4)}});
  DC.girderS=F(7,12,g=>{px(g,GM,0,0,7,2);px(g,LL,0,0,7,1);px(g,D,1,2,1,10);px(g,GM,5,2,1,10);for(let y=2;y<12;y+=4){line(g,LM,1,y,5,y+4)}});
  DC.lamp=F(8,11,g=>{px(g,D,3,0,2,4);ell(g,4,7,3.5,3.5,['#444','#ffffaa','#ffffff','#ffffff']);});
  DC.rib=F(12,26,g=>{for(let y=0;y<26;y++){const x=Math.round(2+Math.sin(y/26*Math.PI)*7);px(g,'#6f3d86',x,y,3,1);px(g,'#cc99ff',x,y)}px(g,PG,1,0,3,2)});
  DC.egg=F(12,14,g=>{ell(g,6,8,5,6,['#3a0a38',PU,mg,PG]);px(g,WH,4,5);px(g,'#3a0a38',2,13,8,1)});
  DC.drip=F(5,14,g=>{px(g,'#2a0a08',1,0,3,5);px(g,rd,2,5,1,5);px(g,OR,2,9,1,3);px(g,YL,2,11,1,2);px(g,WH,2,12)});
  if(idx===2)DC.engine=F(46,38,g=>{px(g,GM,0,14,46,24);px(g,LL,0,14,46,2);px(g,D,0,36,46,2);ell(g,23,16,14,14,[D,GM,LM,LL]);ell(g,23,16,7,7,[K,'#0a3a5a',CY,WH]);for(let k=0;k<5;k++){px(g,K,3+k*4,22,2,10);px(g,K,29+k*3,22,2,10)}px(g,YL,3,17,3,1);px(g,OR,40,17,3,1);px(g,LL,20,0,6,5);px(g,GM,21,0,4,5)});
  if(idx===4)DC.heart=F(44,36,g=>{ell(g,22,20,20,15,['#3a0a38',PU,mg,PG,WH]);for(let k=0;k<4;k++){line(g,'#3a0a38',22,6,4+k*10,34);line(g,mg,23,7,5+k*10,34)}ell(g,22,18,6,5,['#1c0420',mg,MG,WH]);px(g,K,21,17,2,2)});
  const big=(src)=>{const o=cnv(src.width*2,src.height*2,g=>{g.imageSmoothingEnabled=false;g.drawImage(src,0,0,src.width*2,src.height*2)});return o};
  DC.landmark=big(idx===0?DC.tree:idx===1?DC.spire:idx===2?DC.pillar:idx===3?DC.spire:DC.tree);
  return DC;
}

/* ---------------- level generation: big rooms ("zones") laid out on a shaped grid of cells ---------------- */
const CW_=96,CH_=64;
const ZNAMES=['start','hills','mountain','stairs','forest','water','maze','hall','ruins','cavern','void','arena'];
const ZID={};ZNAMES.forEach((n,i)=>ZID[n]=i);
/* size, tallest peak, deepest abyss, number of peaks and abysses */
const WP=[{lw:960,pk:105,ab:150,np:2,nd:2,E:[[0,0],[1,0]]},{lw:1100,pk:150,ab:210,np:3,nd:3,E:[[0,0],[1,0]]},
 {lw:1200,pk:90,ab:122,np:3,nd:3,E:[[0,-38],[.16,-14],[.4,38],[.6,58],[.78,12],[1,-46]]},
 {lw:1300,pk:90,ab:140,np:3,nd:4,E:[[0,-22],[.22,12],[.45,54],[.7,30],[.86,-26],[1,-52]]},
 {lw:1300,pk:100,ab:140,np:3,nd:4,E:[[0,0],[.2,38],[.42,64],[.62,18],[.8,-30],[1,-56]]}];
const SPECS=[0,0,'reactor','caldera','heart'];
/* the pool of set pieces for each world, with weights */
const POOL=[
 {flat:1.5,hill:2,mound:1.5,stairs:1.5,longstairs:2,gap:1.5,floaters:2,liftgap:1.5,chasm:2.5,springs:2,cliff:1.2,tower:1.5,pocket:1,maze:.8,forest:3,lake:2.2,mountain:2.2,ruins:1,hall:1,spikes:1,nook:1.5,ladderwall:1},
 {flat:1,hill:2,mound:1.5,stairs:1.5,longstairs:2,gap:1.5,crumble:2,floaters:2,liftgap:1.2,chasm:3,springs:1,cliff:1.5,tower:2,pocket:1.2,maze:1.5,forest:.6,lake:1,mountain:3,ruins:3,hall:1.5,spikes:1.5,nook:1.5,ladderwall:1.2},
 {flat:1.5,stairs:2,longstairs:3,gap:1,floaters:2.5,liftgap:2,gates:2,updraft:1.8,chasm:3,cliff:1.5,tower:2,mezz:3,pocket:1.5,maze:2,forest:2,lake:2,ruins:2,hall:3.5,spikes:1.5,nook:1.2,open:2},
 {flat:1,hill:2,stairs:2,longstairs:2,gap:1.5,lava:2.5,floaters:2,liftgap:2,chasm:3.2,springs:1,cliff:2,tower:1.5,pocket:1.5,maze:1.5,forest:1.5,ruins:2,hall:2.5,spikes:2.2,nook:1.2,mound:1.5},
 {flat:1.5,stairs:2,longstairs:2.5,gap:1,floaters:2.5,liftgap:2,gates:1.5,updraft:1.5,chasm:3,cliff:1.5,tower:1.5,mezz:2,pocket:2,maze:2.5,forest:2,lake:2,ruins:1.5,hall:2.5,spikes:1.5,nook:1.2,open:1.5}
];
const ZTW=[
 [null,null,['#bcd0ff',.12],['#ffcc88',.1],['#33cc55',.2],['#2a8ae0',.34],['#aa3a6a',.2],['#ffe08a',.14],['#88ffcc',.2],['#6a2aaa',.16],['#1a1050',.26],['#ff5588',.14]],
 [null,null,['#ffffff',.1],['#ffaa55',.14],['#33aa55',.2],['#2ac0c0',.34],['#aa4422',.22],['#ffd080',.18],['#d0a060',.24],['#aa5533',.16],['#2a1008',.26],['#ff6644',.14]],
 [['#4488ff',.1],null,['#8899aa',.12],['#ffaa33',.16],['#22aa66',.24],['#22aadd',.36],['#33cc88',.18],['#ff9933',.2],['#ff3333',.2],['#ff7722',.2],['#001030',.3],['#33ffff',.15]],
 [null,null,null,['#7a7aff',.1],['#ff6622',.12],['#4a8aff',.2],['#aa3a2a',.14],['#ffcc44',.12],['#8a8aaa',.16],['#aa44ff',.12],['#100830',.3],['#ff4400',.12]],
 [null,null,null,['#ff77cc',.16],['#66ff88',.22],['#aaff44',.34],['#cc2266',.22],['#ffaacc',.16],['#aa66ff',.2],['#ff44aa',.16],['#1a0030',.3],['#ff3366',.16]]];
/* a level is one long journey made of set pieces: rolling ground, bridges over chasms, halls, forests, lakes, mountains,
   stairs, ruins and towers, with mazes, caves and nooks underneath, and a few very tall peaks and very deep abysses */
/* ---------------- things to find, read, solve and survive: lore, characters, puzzles, events (generated per level) ---------------- */
const LOREKIND=['WAYMAKER STONE','TEMPLE MURAL','TERMINAL LOG','SKELETON NOTE','HIVE WALL'];
const LORE=[
 [['WAYMAKER STONE','THE WAYMAKERS BUILT THE BEAM PADS ON EVERY WORLD. THEY WANTED TRAVELERS TO ALWAYS FIND A SAFE WAY HOME.'],
  ['SKELETON NOTE','I AM COMMANDER ADA REYES. THE GLOWING LIGHTS IN THIS JUNGLE FOLLOW THE LOST. IF YOU SEE THEM, FOLLOW THEM BACK.'],
  ['OLD MURAL','A GREAT SILVER SHIP CALLED THE SUNLARK ROSE OVER THE JUNGLE. IT WAS THE FASTEST SHIP EVER BUILT.'],
  ['SCRATCHED WARNING','THE SWARM CAME FROM THE DARK BETWEEN THE STARS. IT EATS METAL AND SINGS WHILE IT EATS.'],
  ['WAYMAKER STONE','WHEN THE SWARM CAME, THE WAYMAKERS BROKE THE SUNLARK INTO SIX PIECES AND HID THEM ON FIVE WORLDS.']],
 [['TEMPLE MURAL','THIS TEMPLE GUARDS ONE PIECE OF THE SUNLARK. THE RED KEY AND THE BLUE KEY TOGETHER OPEN THE INNER DOOR.'],
  ['BROKEN TABLET','THE BUILDERS BURIED THEIR TREASURE UNDER THE SAND AND DREW A MAP ON THREE BROKEN TABLETS. FIND ALL THREE.'],
  ['SAND WORN NOTE','THE HERMIT HERE HAS LIVED ALONE FOR FORTY YEARS. HE KNOWS WHERE THINGS ARE HIDDEN. GO AND TALK TO HIM.'],
  ['TEMPLE MURAL','THE SWARM CANNOT CROSS DEEP SAND. IT FLIES ABOVE IN A HUGE LIVING SHIP AND DROPS ITS SOLDIERS.'],
  ['TEMPLE WALL','THE SUNLARK HAD SIX PARTS: HULL, ENGINE, REACTOR, WINGS, COCKPIT AND WEAPON CORE. EACH WORLD KEEPS ONE.']],
 [['TERMINAL LOG 1','CARGO SHIP NOMAD. CAPTAIN OSEI. WE FOLLOWED A BEACON TO THESE WORLDS. OUR HOLD CARRIES ONE PART OF THE SUNLARK: THE REACTOR.'],
  ['TERMINAL LOG 2','DAY 3. THE CREW HEARD SINGING FROM THE SKY. THE SWARM QUEEN SHIP IS ABOVE US. WE LOCKED THE REACTOR IN THE VAULT.'],
  ['TERMINAL LOG 3','DAY 5. VAULT CODE, IN CASE I FORGET: THE CODE IS {CODE}. THE POWER NODES MUST BE SWITCHED ON IN THIS ORDER: {ORDER}.'],
  ['TERMINAL LOG 4','DAY 8. THE SWARM FOLLOWS ANYONE CARRYING A SHIP PART. DO NOT CARRY MORE THAN YOU MUST. WE ARE RUNNING OUT OF AIR.'],
  ['TERMINAL LOG 5','DAY 9. THE HULL IS BREAKING. THE MOTHERSHIP IS NOT A NEW SHIP. LOOK AT ITS RIBS. IT WAS ONCE THE SUNLARK.']],
 [['SKELETON NOTE','I TRIED TO CARRY THE WINGS OUT THROUGH THE LAVA TUBES. THE FORGE WAKES WHEN YOU PULL ITS LEVER. RUN UP AND DO NOT LOOK BACK.'],
  ['BURNT MURAL','THE SWARM MELTS SHIPS IN THE FIRE POOLS AND DRINKS THE METAL. THESE CAVES ARE ITS KITCHEN.'],
  ['SKELETON NOTE','SOME CHESTS HERE ARE NOT CHESTS. A CURSED CHEST HAS TEETH. LOOK CLOSELY BEFORE YOU OPEN ONE.'],
  ['SKELETON NOTE','A HUNTER TRACKS ANYONE WHO CARRIES A SHIP PART. IT SMELLS THE METAL. KEEP MOVING AND KEEP SHOOTING.'],
  ['BURNT MURAL','THE LAST WAYMAKER MESSAGE: BRING THE SIX PIECES TOGETHER AND THE SUNLARK WILL FLY FREE AGAIN.']],
 [['HIVE WALL','THE WALLS REMEMBER SOUNDS. THE POD CHAMBER SINGS A SONG. SING IT BACK IN THE SAME ORDER AND THE WALL WILL OPEN.'],
  ['HIVE WALL','THE EGGS HERE HOLD THE SWARM CHILDREN. SOME HATCH WHEN YOU WALK NEAR. SOME HOLD ONLY GOLD.'],
  ['HIVE WALL','THE QUEEN SHIP WAS BUILT FROM A STOLEN SHIP. ITS RIBS ARE THE RIBS OF THE SUNLARK.'],
  ['GHOST VOICE','I WAS THE PILOT OF THE SUNLARK. THE SWARM TOOK MY SHIP AND MY BODY. I STAY HERE TO WARN THE ONES WHO COME.'],
  ['THE WHOLE TRUTH','THIS MOTHERSHIP IS THE SUNLARK. THESE SIX PIECES ARE THE ONLY PARTS THE SWARM COULD NOT TAKE. BRING THEM TOGETHER AND IT WILL WAKE AND FLY HOME.']]
];
const COLN=['RED','BLUE','GREEN','YELLOW'],COLH=['#ff5544','#55aaff','#55ee66','#ffee55'];
const NPCN={astro:'STRANDED ASTRONAUT',hermit:'THE HERMIT',trader:'TRADER BOT',ghost:'THE PILOT GHOST'};
function featGen(c){
  const {L,idx,rooms,top,rh,LW,LH,S,G,rect,chest,spawn,deco,pockets,elevAt,A0}=c;
  const RF=rng(7100+idx*131),rf=(a,b)=>a+Math.floor(RF()*(b-a+1)),TSZ=8;
  const ia=L.ia=[],doors=L.doors=[],secrets=L.secrets=[],lights=L.lights=[],dark=L.dark=[];
  L.targets=[];L.eggs=[];L.runs=[];L.chase=null;L.ev=null;L.frag=[];L.buried=null;
  const doorAt=L.doorAt=new Map();
  const loreKinds=[0,1,2,3,4];
  const shuffled=rooms.slice();for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(RF()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
  const wet=(r)=>{if(r.wet!==undefined)return r.wet;let w=false;for(let x=r.x0;x<r.x0+r.w&&!w;x++)for(let y=r.y1-4;y<r.y1;y++){const t=G(x,y);if(t===10){w=true;break}}return r.wet=w};
  const takeRoom=(f,any)=>{for(let pass=0;pass<2;pass++)for(let i=0;i<shuffled.length;i++){const r=shuffled[i];if(!r.used&&!wet(r)&&(any||!r.shaped)&&(any===2||pass===1||!r.reserve)&&(!f||f(r))){r.used=true;return r}}return null};
  const frow=(tx,y1)=>{let y=y1-1,n=0;while(n++<14&&y>3&&G(tx,y)!==0)y--;n=0;while(n++<14&&G(tx,y+1)===0)y++;return y+1};
  const roomSpot=(r,m)=>{m=m||4;const lx=r.x0+rf(m,Math.max(m,r.w-m-1));let y=r.y1-1,n=0;while(n++<14&&y>3&&G(lx,y)!==0)y--;n=0;while(n++<14&&G(lx,y+1)===0)y++;return{x:lx*TSZ+4,y:(y+1)*TSZ}};
  const addIA=(o)=>{o.id=o.id||('i'+ia.length);ia.push(o);return o};
  const secret=(name)=>{const id=idx+'_'+secrets.length;secrets.push({id,name});return id};
  /* surface spots: flat stretches of open ground along the journey */
  const spots=[];
  for(let x=30;x<LW-70;x+=3){const t=top[x];if(t<0)continue;let ok=true;for(let q=0;q<7&&ok;q++){if(top[x+q]!==t)ok=false;else for(let y=t-1;y>=t-4;y--)if(G(x+q,y)!==0){ok=false;break}}if(ok)spots.push({x:x+3,y:t,u:false})}
  const takeSpot=(minx,maxx)=>{const c=spots.filter(s=>!s.u&&s.x>=minx&&s.x<=maxx);if(!c.length)return null;const s=c[Math.floor(RF()*c.length)];s.u=true;for(const o of spots)if(Math.abs(o.x-s.x)<18)o.u=true;return s};
  /* vault: a small chamber beside a room, behind a door */
  const vaults=[];
  const carveVault=(r,w,h)=>{
    for(const side of (RF()<.5?[0,1]:[1,0])){
      const wc=side?r.x0+r.w:r.x0-1,xl=side?wc+1:wc-w,xr=xl+w-1,yb=r.y1,yt=yb-h;
      let ok=xl>6&&xr<LW-6&&yt>4;if(!ok)continue;let n=0,s=0;for(let y=yt-1;y<=yb+1;y++)for(let x=xl-1;x<=xr+1;x++){if(x===wc&&y>=yb-4&&y<yb)continue;n++;if(G(x,y)===1)s++}
      if(s<n*.985)continue;
      if(vaults.some(v=>v.xl<xr+3&&v.xr>xl-3&&v.yt<yb+3&&v.yb>yt-3))continue;
      for(let y=yt;y<yb;y++)for(let x=xl;x<=xr;x++)S(x,y,0);
      const v={xl,xr,yt,yb,wc,side,dir:side?-1:1,room:r,cells:[]};for(let y=yb-4;y<yb;y++)v.cells.push([wc,y]);vaults.push(v);
      pockets.push({x0:xl,x1:xr+1,y0:yt,y1:yb,z:'ruins'});return v}
    return null};
  /* a small stone hut built on the floor of a room, when there is no solid rock beside the room to dig into */
  const buildHut=(r,w)=>{const y1=r.y1,hy=y1-4;
    for(const side of (RF()<.5?[0,1]:[1,0])){
      const bx=side?r.x0+r.w:r.x0-1;let wallOk=true;for(let y=y1-5;y<y1;y++)if(G(bx,y)!==1)wallOk=false;if(!wallOk)continue;
      for(let off=1;off<=9;off++){
        const hx0=side?r.x0+r.w-off-w:r.x0+off,hx1=hx0+w-1;if(hx0<=r.x0+1||hx1>=r.x0+r.w-2)continue;
        let ok=true;
        for(let x=hx0-1;x<=hx1+1&&ok;x++){const q=x-r.x0;if(q<0||q>=r.hh.length||r.hh[q]<10)ok=false}
        for(let y=y1-7;y<y1&&ok;y++)for(let x=hx0-1;x<=hx1+1&&ok;x++)if(G(x,y)!==0)ok=false;
        for(let x=hx0-1;x<=hx1+1&&ok;x++)if(G(x,y1)!==1)ok=false;
        if(vaults.some(v=>v.room===r))ok=false;
        if(!ok)continue;
        const inA=(x,y)=>x>=(hx0-1)*TSZ&&x<=(hx1+2)*TSZ&&y>=(hy-1)*TSZ&&y<=(y1+1)*TSZ;
        L.coins=L.coins.filter(c=>!inA(c.x,c.y));L.spawns=L.spawns.filter(q=>!inA(q.x,q.y));L.chests=L.chests.filter(c=>!inA(c.x+7,c.y+5));L.deco=L.deco.filter(d=>!inA(d.x,d.y-4));L.checks=L.checks.filter(c=>!inA(c.x,c.y));
        for(let x=hx0;x<=hx1;x++)S(x,hy,1);for(let y=hy;y<y1;y++){S(hx0,y,1);S(hx1,y,1)}
        const wc=side?hx0:hx1,v={xl:hx0+1,xr:hx1-1,yt:y1-3,yb:y1,wc,side,dir:side?-1:1,room:r,hut:1,cells:[]};for(let y=y1-3;y<y1;y++)v.cells.push([wc,y]);vaults.push(v);
        for(let x=hx0;x<=hx1;x+=2)L.coins.push({x:x*TSZ+4,y:(hy-2)*TSZ,v:1+(idx>>1)});
        return v}}
    return null};
  const furnish=(v,val,n)=>{const mid=(v.xl+v.xr)>>1;chest(mid,v.yb,val);L.chests[L.chests.length-1].big=1;for(let x=v.xl+2;x<=v.xr-2;x+=3)L.coins.push({x:x*TSZ+4,y:(v.yb-2)*TSZ,v:2+(idx>>1)});return mid};
  const setDoor=(v,lock,tile,extra)=>{const d=Object.assign({id:'d'+doors.length,lock,tile,open:0,cells:v.cells.slice(),vault:v},extra||{});doors.push(d);for(const [x,y] of d.cells){S(x,y,tile);doorAt.set(y*LW+x,d)}return d};
  const vaultSecret=(v,name)=>{const sid=secret(name);v.sid=sid;return sid};
  /* a door that is a cracked wall: shoot it */
  const mkCrack=()=>{const v=vaultFrom(q=>q.w>=26);if(!v)return null;if(v.cells.length>3)v.cells=v.cells.slice(1);const d=setDoor(v,'crack',13,{hp:{}});vaultSecret(v,'CRACKED WALL');furnish(v,18+idx*5);return v};
  const R_=p=>RF()<p;
  /* --- chase: a tall room with a forge lever; the pool of lava rises while you climb zig zag ledges to a chest (magma) */
  if(idx===3){const lv4=(rr)=>{for(let x=rr.x0;x<rr.x0+rr.w;x++)for(let y=rr.y1-4;y<rr.y1;y++)if(G(x,y)===4)return true;return false};const r=shuffled.filter(q=>!q.used&&!q.shaped&&q.w>=30&&q.h>=19&&!wet(q)&&!lv4(q)).sort((p,q)=>q.h-p.h)[0];if(r)r.used=true;
    if(r){const y1=r.y1;let bad=false;for(let x=r.x0;x<r.x0+r.w;x++)for(let y=y1-4;y<y1;y++){const t=G(x,y);if(t===4||t===10)bad=true}
      if(bad){r.used=false}else{
        const xl=r.x0,xr=r.x0+r.w-1,yb=y1,open=(x,y)=>{const q=x-r.x0;return q>=0&&q<r.hh.length&&y>=y1-r.hh[q]};
        let sd=0,topRow=-1,topX=0;
        for(let k=1;;k++){const R=y1-5*k;if(R<=r.yt+6)break;const C=[];for(let x=xl;x<=xr;x++){let okc=true;for(let y=R-3;y<=R;y++)if(!open(x,y)||G(x,y)===1)okc=false;if(okc)C.push(x)}
          if(C.length<14)break;const Ln=Math.ceil(C.length*.62),seg=sd?C.slice(C.length-Ln):C.slice(0,Ln);for(const x of seg)if(G(x,R)===0)S(x,R,2);topRow=R;topX=seg[seg.length>>1];sd^=1}
        if(topRow>0){const sid=secret('FORGE CLIMB');chest(topX,topRow,60);L.chests[L.chests.length-1].sec=sid;for(let q=-3;q<=3;q++)L.coins.push({x:(topX+q*2)*TSZ,y:(topRow-3)*TSZ,v:3});
          let lx=null;for(let q=0;q<30&&lx===null;q++){const x=xl+4+Math.floor(RF()*(r.w-8));let okc=true;for(let y=y1-3;y<y1;y++)if(G(x,y)!==0)okc=false;if(okc&&G(x,y1)===1)lx=x}
          if(lx===null)lx=(xl+xr)>>1;
          const lv=addIA({k:'lever',x:lx*TSZ+4,y:y1*TSZ,forge:1,on:0});
          L.chase={xl,xr,yt:r.yt,yb:y1,top:topRow,state:0,t:0,row:y1,set:[],sid,ent:{x:lx*TSZ-1,y:y1*TSZ-16}};pockets.push({x0:xl,x1:xr+1,y0:r.yt,y1:y1,z:'void'})}
        else r.used=false}}}
  /* --- lore: five per world, some inside rooms, some on the open ground */
  const loreSpots=[];
  const placeLore=(slot,where)=>{let p=null;
    if(where==='surf'){const s=takeSpot(40,LW-80);if(s)p={x:s.x*TSZ+4,y:s.y*TSZ}}
    if(!p){const r=takeRoom(q=>q.w>=20,1);if(r)p=roomSpot(r,5)}
    if(p)addIA({k:'lore',slot,x:p.x,y:p.y})};
  let codeStr='',orderStr='';
  /* the puzzle codes are decided first so the logs can print them */
  const digits=[rf(1,4),rf(1,4),rf(1,4)];codeStr=digits.join(' ');
  const seqOrder=[0,1,2,3].sort(()=>RF()-.5).slice(0,idx===2?3:4);orderStr=seqOrder.map(i=>COLN[i]).join(', THEN ');
  L.codeDigits=digits;L.seqOrder=seqOrder;
  for(let k=0;k<(idx===4?4:5);k++)placeLore(k,k===1||k===3?'surf':idx===1&&k===0?'room':RF()<.4?'surf':'room');
  if(idx===4)addIA({k:'lore',slot:4,x:0,y:0,final:1,hide:1});
  /* --- people */
  if(idx===0||idx===2||idx===4){const s=takeSpot(idx===0?30:120,idx===0?140:LW*.5)||takeSpot(30,LW*.5);if(s)addIA({k:'npc',npc:'trader',x:s.x*TSZ+4,y:s.y*TSZ})}
  {const s=takeSpot(LW*.2,LW*.8);if(s)addIA({k:'npc',npc:'astro',x:s.x*TSZ+4,y:s.y*TSZ,qid:'q'+idx})}
  if(idx===1){const r=takeRoom(q=>q.w>=26,1);if(r){const p=roomSpot(r,8);addIA({k:'npc',npc:'hermit',x:p.x,y:p.y})}}
  if(idx===2||idx===4){const r=takeRoom(q=>q.w>=22,1);if(r){const p=roomSpot(r,6);addIA({k:'npc',npc:'ghost',x:p.x,y:p.y})}}
  /* the astronaut's quest item sits in a room */
  {const r=takeRoom(q=>q.w>=24&&q.j>0,1);if(r){const p=roomSpot(r,6);L.questItem={x:p.x,y:p.y,got:0}}}
  /* --- vaults and puzzles, a different mix in each world */
  const mkLever=(v,where)=>{const d=setDoor(v,'lever',11);vaultSecret(v,'LEVER VAULT');furnish(v,22+idx*5);
    let p=null;const s=takeSpot(40,LW-80);if(where==='surf'&&s)p={x:s.x*TSZ+4,y:s.y*TSZ};else{const r2=takeRoom(null,1);if(r2)p=roomSpot(r2,5)}
    if(!p)return d;addIA({k:'lever',x:p.x,y:p.y,door:d.id,on:0});return d};
  const mkKey=(v,col)=>{const d=setDoor(v,col+'key',11,{col});vaultSecret(v,col.toUpperCase()+' KEY VAULT');furnish(v,22+idx*5);
    const r2=takeRoom(null,1);if(r2){const p=roomSpot(r2,5);addIA({k:'key',col,x:p.x,y:p.y-4,got:0})}return d};
  const mkPlate=(v)=>{const d=setDoor(v,'plate',11,{t:0});vaultSecret(v,'PLATE VAULT');furnish(v,22+idx*5);const r=v.room,dx=v.wc+v.dir*rf(6,9);addIA({k:'plate',x:dx*TSZ+4,y:r.y1*TSZ,door:d.id});return d};
  const mkCode=(v)=>{const d=setDoor(v,'code',11);vaultSecret(v,'CODE VAULT');furnish(v,26+idx*5);const r=v.room,dx=v.wc+v.dir*3;addIA({k:'panel',x:dx*TSZ+4,y:r.y1*TSZ,door:d.id,code:digits});return d};
  const mkSeq=(v,mode)=>{const d=setDoor(v,'seq',11);vaultSecret(v,mode==='echo'?'ECHO CHAMBER':'REACTOR PUZZLE');furnish(v,28+idx*5);const r=v.room,n=seqOrder.length,pods=[];
    for(let i=0;i<4;i++){pods.push(addIA({k:'pod',x:(v.wc+v.dir*(5+i*4))*TSZ+4,y:r.y1*TSZ,col:i,door:d.id,mode,lit:0}))}
    d.seq={mode,pods:pods.map(p=>p.id),order:seqOrder.slice(),step:0,play:0};
    if(mode==='echo')addIA({k:'echo',x:(v.wc+v.dir*(5+4*4+1))*TSZ+4,y:r.y1*TSZ,door:d.id});return d};
  const mkMirror=(v)=>{const r=v.room,y1=r.y1,dir=v.dir,x0=v.wc+dir*5,x1=x0+dir*7,x3=x1+dir*8,xa=Math.min(x1,x3),xb=Math.max(x1,x3),lo=Math.min(x0,xa-2),hi=Math.max(x0,xb+2);
    let ok=lo>r.x0+1&&hi<r.x0+r.w-2;for(let x=lo;x<=hi&&ok;x++){const q=x-r.x0;if(q<0||q>=r.hh.length||r.hh[q]<10)ok=false;for(let y=y1-8;y<y1&&ok;y++){const t=G(x,y);if(t!==0&&t!==1&&t!==2)ok=false}}
    if(!ok)return null;for(let x=lo;x<=hi;x++)for(let y=y1-8;y<y1;y++){const t=G(x,y);if(t===1||t===2)S(x,y,0)}
    const inA=(x,y)=>x>=(lo-1)*TSZ&&x<=(hi+2)*TSZ&&y>=(y1-10)*TSZ&&y<=(y1+1)*TSZ;L.coins=L.coins.filter(c=>!inA(c.x,c.y));L.spawns=L.spawns.filter(q=>!inA(q.x,q.y));L.chests=L.chests.filter(c=>!inA(c.x+7,c.y+5));L.deco=L.deco.filter(d=>!inA(d.x,d.y-4));
    const d=setDoor(v,'mirror',11);vaultSecret(v,'SUN MIRROR VAULT');furnish(v,28+idx*5);
    for(let x=xa-2;x<=xb+2;x++)S(x,y1-5,2);
    const ty=(y1-5)*TSZ,by=y1*TSZ,mk=(k,x,y,st)=>addIA(Object.assign({k,x:x*TSZ+4,y},st==null?{}:{st}));
    const src=mk('src',x0,by);src.dir=dir;const m1=mk('mirror',x1,by,0),m2=mk('mirror',x1,ty,0),m3=mk('mirror',x3,ty,0),gem=mk('gem',x3,by);
    d.mir={src:src.id,ids:[m1.id,m2.id,m3.id],gem:gem.id};
    /* find the solving states, then start from a wrong set */
    const tr=(sts)=>{let x=src.x,y=by-12,dx=dir,dy=0,hit=false;const ms=[m1,m2,m3];for(let seg=0;seg<6;seg++){let best=null,bd=1e9;ms.forEach((o,i)=>{const my=o.y-12,al=(o.x-x)*dx+(my-y)*dy,pe=Math.abs((o.x-x)*dy)+Math.abs((my-y)*dx);if(al>2&&pe<4&&al<bd){bd=al;best=[o,i,my]}});
        const ga=(gem.x-x)*dx+((gem.y-12)-y)*dy,gp=Math.abs((gem.x-x)*dy)+Math.abs(((gem.y-12)-y)*dx);if(ga>2&&gp<5&&ga<bd){hit=true;break}
        if(!best)break;x=best[0].x;y=best[2];const nd=sts[best[1]]?[-dy,-dx]:[dy,dx];dx=nd[0];dy=nd[1]}return hit};
    let sol=null;for(let m=0;m<8;m++){const sts=[m&1,(m>>1)&1,(m>>2)&1];if(tr(sts)){sol=m;break}}
    let start=rf(0,7);if(start===sol)start=(start+3)&7;m1.st=start&1;m2.st=(start>>1)&1;m3.st=(start>>2)&1;
    return d};
  const mkSurge=(v)=>{const r=v.room,y1=r.y1,dir=v.dir;let ok=true;const xs=[6,14,22].map(k=>v.wc+dir*k);for(const x of xs){const q=x-r.x0;if(q<2||q>=r.hh.length-2||r.hh[q]<9||G(x,y1-1)!==0||G(x,y1)!==1)ok=false}
    if(!ok)return null;const d=setDoor(v,'surge',11);vaultSecret(v,'SURGE VAULT');furnish(v,28+idx*5);d.rods=xs.map(x=>addIA({k:'rod',x:x*TSZ+4,y:y1*TSZ,door:d.id,on:0}).id);return d};
  const mkShrine=(v)=>{const sid=vaultSecret(v,'SHRINE');const mid=(v.xl+v.xr)>>1;addIA({k:'shrine',x:mid*TSZ+4,y:v.yb*TSZ,sid,perk:idx});furnish(v,15+idx*4)};
  const tried=new Set();
  const vaultFrom=(f,w,h)=>{for(let n=0;n<40;n++){const r=takeRoom(q=>!tried.has(q)&&(!f||f(q)));if(!r)return null;tried.add(r);const v=carveVault(r,w||rf(11,15),h||rf(7,9))||buildHut(r,w>=17?13:rf(8,10));if(v)return v;r.used=false}return null};
  const want={
    0:['crack','lever','plate','shrine'],
    1:['crack','key:red','key:blue','mirror','shrine','plate'],
    2:['code','seq','surge','crack','shrine'],
    3:['crack','key:red','lever','shrine','crack'],
    4:['seq','plate','crack','key:blue','shrine']}[idx];
  let temple=null;
  for(const w of want){
    if(w==='crack'){mkCrack();continue}
    const v=vaultFrom();if(!v)continue;
    if(w==='lever')mkLever(v,idx===0?'surf':'room');
    else if(w==='plate')mkPlate(v);
    else if(w==='code')mkCode(v);
    else if(w==='mirror'){let done=!!mkMirror(v);for(let a=0;a<10&&!done;a++){const vv=vaultFrom(q=>q.w>=34);if(!vv)break;done=!!mkMirror(vv)}}
    else if(w==='surge'){let done=!!mkSurge(v);for(let a=0;a<10&&!done;a++){const vv=vaultFrom(q=>q.w>=30);if(!vv)break;done=!!mkSurge(vv)}}
    else if(w==='seq')mkSeq(v,idx===2?'log':'echo');
    else if(w==='shrine'){/* shrine vaults are hidden behind a cracked wall */if(v.cells.length>3)v.cells=v.cells.slice(1);const d=setDoor(v,'crack',13,{hp:{}});mkShrine(v)}
    else if(w.startsWith('key:'))mkKey(v,w.slice(4));
  }
  /* the temple of the desert: an inner vault that needs both keys */
  if(idx===1){const v=vaultFrom(q=>q.w>=30,17,10);if(v){const d=setDoor(v,'both',11);vaultSecret(v,'TEMPLE INNER DOOR');furnish(v,50);chest(v.xl+3,v.yb,40);d.col='both'}}
  /* --- portals: from a room to a hidden island or a vault */
  {const A=takeRoom(q=>q.w>=18,1),isl=(L.hidden||[]).filter(h=>h.rx>=4)[0];
   if(A&&isl){const pa=roomSpot(A,5),pb={x:isl.x*TSZ+4,y:(isl.top0+0)*TSZ};const a=addIA({k:'portal',x:pa.x,y:pa.y,to:null,sid:secret('PORTAL TO A HIDDEN ISLAND')});const b=addIA({k:'portal',x:pb.x-14,y:pb.y,to:a.id,back:1});a.to=b.id}}
  /* --- treasure map: three fragments, then a buried chest */
  if(idx!==4){for(let q=0;q<3;q++){const r=takeRoom(w=>w.w>=16,1)||null;if(r){const p=roomSpot(r,4);L.frag.push(addIA({k:'frag',x:p.x,y:p.y-3,got:0,n:q}))}}
    const s=takeSpot(LW*.15,LW*.9);if(s){L.buried={x:s.x*TSZ+4,y:s.y*TSZ,got:0,sid:secret('BURIED TREASURE')}}}
  /* --- a timed target challenge and a mini boss lair */
  {const r=takeRoom(q=>q.w>=36,1);if(r){const sid=secret('TARGET CHALLENGE');const p=roomSpot(r,10);addIA({k:'console',x:p.x,y:p.y,room:{x0:r.x0,w:r.w,y1:r.y1,hh:r.hh},sid,state:0,t:0});
    for(let i=0;i<6;i++){const tx=r.x0+4+Math.floor(i*(r.w-8)/5);let ty=frow(tx,r.y1)-rf(8,Math.max(9,Math.min(r.h-3,16)));for(let z=0;z<8&&G(tx,ty)!==0;z++)ty--;L.targets.push({x:tx*TSZ+4,y:ty*TSZ,hit:0})}}}
  {const r=takeRoom(q=>q.w>=26,1);if(r){const sid=secret('MINI BOSS LAIR'),p=roomSpot(r,8),fy=p.y/TSZ;L.lair={x:p.x,y:p.y,sid,room:r};chest(Math.floor(p.x/TSZ)+6,frow(Math.floor(p.x/TSZ)+6,fy),40+idx*12);L.chests[L.chests.length-1].sec=sid;spawn([2,2,3,2,2][idx],p.x,(fy-1)*TSZ);const sp=L.spawns[L.spawns.length-1];sp.elite=1;sp.lair=1;sp.once=0;for(let q=0;q<8;q++)L.coins.push({x:(p.x+q*8-30),y:(fy-2)*TSZ,v:3})}}
  /* --- dark rooms: a lantern or the glow of the walls shows the way */
  for(let k=0;k<(idx===1||idx===3?3:idx===0?1:2);k++){const r=takeRoom(q=>q.w>=26&&q.j>0,1);if(!r)break;dark.push({x0:r.x0,x1:r.x0+r.w,y0:r.yt,y1:r.y1+1});r.dark=true;chest(r.x0+(r.w>>1),frow(r.x0+(r.w>>1),r.y1),16+idx*5);L.chests[L.chests.length-1].sec=secret('DARK ROOM TREASURE');
    for(let q=0;q<5;q++)lights.push({x:(r.x0+4+Math.floor(q*(r.w-8)/4))*TSZ,y:(frow(r.x0+(r.w>>1),r.y1)-rf(3,Math.max(4,r.h-4)))*TSZ,ph:RF()*6})}
  /* --- mimics and eggs */
  {const mp=idx===3?.16:idx===4?.1:idx===1?.06:.03;for(const ch of L.chests){if(ch.sec||ch.mimic)continue;if(RF()<mp)ch.mimic=1}
   if(idx===4){for(const r of shuffled){if(RF()<.5&&r.w>=20)for(let q=0;q<rf(2,3);q++){const p=roomSpot(r,4);L.eggs.push({x:p.x,y:p.y,st:0,t:0,real:RF()<.5})}}}}
  /* --- shiny creatures: a rare gold variant of some spawns */
  {let n=0;for(const sp of L.spawns){if(sp.lair)continue;if(RF()<.035&&n<8){sp.shiny=1;n++}}if(n<2){for(let q=0;q<2;q++){const sp=L.spawns[rf(0,L.spawns.length-1)];if(sp&&!sp.lair)sp.shiny=1}}
   secrets.push({id:idx+'_shiny',name:'SHINY CREATURE',shiny:1})}
  /* --- logs that give the codes need the numbers */
  L.loreFill=(txt)=>txt.replace('{CODE}',codeStr).replace('{ORDER}',orderStr);
  /* --- fireflies that lead toward secrets are drawn at runtime from L.secretPts */
  L.secretPts=doors.filter(d=>d.lock!=='crack'||true).map(d=>({x:d.cells[0][0]*TSZ+4,y:d.cells[0][1]*TSZ,sid:d.vault&&d.vault.sid}));
  if(L.chase)L.secretPts.push({x:((L.chase.xl+L.chase.xr)>>1)*TSZ,y:L.chase.yb*TSZ,sid:L.chase.sid});
  for(const o of ia){if(o.k==='console')L.secretPts.push({x:o.x,y:o.y,sid:o.sid});if(o.k==='portal'&&o.sid)L.secretPts.push({x:o.x,y:o.y,sid:o.sid})}
  for(const c of L.chests)if(c.sec&&!(L.chase&&c.sec===L.chase.sid))L.secretPts.push({x:c.x,y:c.y,sid:c.sec});
  /* --- collapsing runs on bridges */
  if(idx>=1){let n=0;for(const k of L.kinds){if(!(k.k==='chasm'||k.k==='abyss')||k.c0==null||n>=(idx===1?2:1))continue;let ok=true;for(let x=k.x+2;x<k.x+k.w-2;x++){const t=G(x,k.c0);if(t!==2&&t!==0){ok=false;break}}
      if(!ok)continue;let cnt=0;for(let x=k.x+1;x<k.x+k.w;x++)if(G(x,k.c0)===2){S(x,k.c0,6);cnt++}if(cnt>8){L.runs.push({y:k.c0,x0:k.x,x1:k.x+k.w});n++}}}
  /* --- magma: fire vents in the floor that puff, glow, then burst */
  L.vents=[];
  if(idx===3){const near=(x,y)=>ia.some(o=>Math.abs(o.x-x)<28&&Math.abs(o.y-y)<20)||L.checks.some(c=>Math.abs(c.x-x)<30&&Math.abs(c.y-y)<20)||L.vents.some(v=>Math.abs(v.x-x)<60&&Math.abs(v.y-y)<30);
    for(let q=0;q<6;q++){const s=takeSpot(40,LW-80);if(s&&!near(s.x*TSZ+4,s.y*TSZ))L.vents.push({x:s.x*TSZ+4,y:s.y*TSZ,ph:RF()*4.2})}
    for(const r of shuffled){if(L.vents.length>=18)break;if(r.w<22||wet(r)||r.dark)continue;const p=roomSpot(r,6);if(G(Math.floor(p.x/TSZ),r.y1)===1&&!near(p.x,p.y))L.vents.push({x:p.x,y:p.y,ph:RF()*4.2})}}
  /* --- hive: a nest that hatches three waves for a chest */
  L.hatch=null;
  if(idx===4){const r=takeRoom(q=>q.w>=34,1);if(r){const sid=secret('HATCHERY NEST'),p=roomSpot(r,12),eggs=[];for(let q=-2;q<=2;q++)eggs.push({x:p.x+q*14,y:frow(Math.floor((p.x+q*14)/TSZ),Math.floor(p.y/TSZ))*TSZ});
      L.hatch={x:p.x,y:p.y,eggs,sid,state:0,wave:0,room:{x0:r.x0,w:r.w,y1:r.y1}};addIA({k:'nest',x:p.x,y:p.y})}}
L.secretPts=L.secretPts||[];
  /* --- signature set piece rooms: each world has its own big themed rooms underground */
  L.sets=[];
  {const SETN={0:'MUSHROOM CATHEDRAL',1:'CRYSTAL GEODE',2:'REACTOR CORE HALL',3:'THE FORGE',4:'BROOD CHAMBER'};
   const runOf=(r,minhh)=>{let best=null,a=-1;for(let q=0;q<=r.hh.length;q++){const ok=q<r.hh.length&&r.hh[q]>=minhh;if(ok&&a<0)a=q;else if(!ok&&a>=0){if(!best||q-a>best.n)best={a,n:q-a};a=-1}}return best};
   const carve=(x0,x1,y0,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=G(x,y);if(t===2||t===1||t===6||t===5)S(x,y,0)}
     const inA=(x,y)=>x>=x0*TSZ&&x<=(x1+1)*TSZ&&y>=y0*TSZ&&y<=(y1+2)*TSZ;L.coins=L.coins.filter(c=>!inA(c.x,c.y));L.spawns=L.spawns.filter(q=>!inA(q.x,q.y));L.chests=L.chests.filter(c=>!inA(c.x+7,c.y+5));L.deco=L.deco.filter(d=>!inA(d.x,d.y-4));L.checks=L.checks.filter(c=>!inA(c.x,c.y));L.eggs=L.eggs.filter(e=>!inA(e.x,e.y))};
   const plat=(x0,x1,y,t)=>{for(let x=x0;x<=x1;x++)if(G(x,y)===0)S(x,y,t||2)};
   const bigChest=(x,y,name,v)=>{const sid=secret(name);chest(x,y,v);const c=L.chests[L.chests.length-1];c.sec=sid;c.big=1;c.setc=1;for(let q=-2;q<=2;q++)L.coins.push({x:(x+q*2)*TSZ+4,y:(y-3)*TSZ,v:2+idx});return c};
   const mkSet=(r,kind,name,x0,x1,y0,fx)=>{const o=Object.assign({k:kind,name,x0,x1,y0,y1:r.y1,id:'s'+L.sets.length},fx||{});L.sets.push(o);pockets.push({x0,x1:x1+1,y0,y1:r.y1,z:'ruins'});return o};
   const builders={
     cathedral(r){const run=runOf(r,13);if(!run||run.n<22)return false;const y1=r.y1,xa=r.x0+run.a+2,xb=r.x0+run.a+run.n-3,pm=(xa+xb)>>1,T=Math.min(...r.hh.slice(xa-r.x0,xb-r.x0+1))-1,top=Math.min(14,T),mid=Math.min(10,top-3);
       carve(xa,xb,y1-top,y1-1);S(xa+1,y1,5);S(xb-1,y1,5);
       const cw=rf(8,10);plat(xa+4,xa+4+cw,y1-6);plat(xb-4-cw,xb-4,y1-mid);plat(pm-5,pm+5,y1-top);
       let pool=true;for(let x=pm-2;x<=pm+2;x++)for(let y=y1+1;y<=y1+5;y++)if(G(x,y)!==1)pool=false;
       if(pool){for(let x=pm-2;x<=pm+2;x++){for(let y=y1;y<=y1+4;y++)S(x,y,10)}bigChest(pm,y1+5,'SUNKEN POOL CHEST',30+idx*10)}
       bigChest(pm,y1-top,'CATHEDRAL SPIRE CHEST',40+idx*10);
       for(const [sx,sy,t] of [[xa+8,y1-1,1],[xb-8,y1-1,3],[pm+8,y1-1,1],[pm-8,y1-1,3]])spawn(t,sx*TSZ,sy*TSZ);
       for(let k=0;k<8;k++)L.lights.push({x:(xa+3+k*((xb-xa-6)/7))*TSZ,y:(y1-rf(4,top))*TSZ,ph:RF()*6,deco:1});
       return mkSet(r,'cathedral',SETN[0],xa-1,xb+1,y1-top,{})},
     geode(r){const run=runOf(r,12);if(!run||run.n<22)return false;const y1=r.y1,xa=r.x0+run.a+2,xb=r.x0+run.a+run.n-3,pm=(xa+xb)>>1,pa=pm-6,pb=pm+5,T=Math.min(...r.hh.slice(xa-r.x0,xb-r.x0+1))-1,top=Math.min(12,T);
       for(let x=pa;x<=pb;x++)for(let y=y1+1;y<=y1+4;y++)if(G(x,y)!==1)return false;
       carve(xa,xb,y1-top,y1-1);
       for(let x=pa;x<=pb;x++){for(let y=y1+1;y<=y1+3;y++)S(x,y,0);S(x,y1,6)}
       for(let y=y1;y<=y1+3;y++){S(pa,y,7);S(pb,y,7)}
       for(let x=pm-1;x<=pm+1;x++)for(let y=y1-2;y<=y1+3;y++)S(x,y,1);
       bigChest(pm,y1-2,'GEODE HEART CHEST',50+idx*10);
       plat(xa+2,xa+9,y1-6);plat(xb-9,xb-2,y1-6);chest(xa+5,y1-6,14+idx*5);chest(xb-5,y1-6,14+idx*5);
       for(const sx of [xa+4,xb-4,pa-4,pb+4])spawn(0,sx*TSZ,(y1-1)*TSZ);spawn(2,(xa+6)*TSZ,(y1-7)*TSZ);spawn(2,(xb-6)*TSZ,(y1-7)*TSZ);
       for(let k=0;k<6;k++)deco(xa+2+k*((xb-xa-4)/5),y1,'spire');
       return mkSet(r,'geode',SETN[1],xa-1,xb+1,y1-top,{pit:[pa,pb]})},
     hall(r){const run=runOf(r,13);if(!run||run.n<26)return false;const y1=r.y1,xa=r.x0+run.a+2,xb=r.x0+run.a+run.n-3,pm=(xa+xb)>>1,T=Math.min(...r.hh.slice(xa-r.x0,xb-r.x0+1))-1,top=Math.min(12,T-1);
       carve(xa,xb,y1-T,y1-1);
       plat(xa+1,xa+11,y1-6);plat(xb-11,xb-1,y1-6);plat(pm-6,pm+6,y1-top);
       L.lifts.push({x:(xa+12)*TSZ,y:(y1-6)*TSZ,w:24,axis:'h',a:(xa+12)*TSZ,b:(xb-14)*TSZ,sp:30,ph:RF()*6});
       for(let x=xa+1;x<=xa+7;x++)for(let y=y1-2;y<=y1-1;y++)S(x,y,10);
       deco(pm,y1,'engine');
       bigChest(pm,y1-top,'REACTOR CORE CHEST',50+idx*10);chest(xa+6,y1-6,16+idx*5);chest(xb-6,y1-6,16+idx*5);
       spawn(3,(xa+9)*TSZ,(y1-7)*TSZ);spawn(3,(xb-9)*TSZ,(y1-7)*TSZ);spawn(1,(pm-3)*TSZ,(y1-9)*TSZ);spawn(0,(pm-8)*TSZ,(y1-1)*TSZ);spawn(0,(pm+8)*TSZ,(y1-1)*TSZ);
       return mkSet(r,'hall',SETN[2],xa-1,xb+1,y1-T,{fall:xa+3,core:pm})},
     engine(r){const run=runOf(r,12);if(!run||run.n<22)return false;const y1=r.y1,xa=r.x0+run.a+2,xb=r.x0+run.a+run.n-3,pm=(xa+xb)>>1,T=Math.min(...r.hh.slice(xa-r.x0,xb-r.x0+1))-1,hy=Math.min(10,T-1);
       carve(xa,xb,y1-T,y1-1);
       deco(pm,y1,'engine');for(const sx of [pm-9,pm+9,pm-14,pm+14])if(sx>xa+1&&sx<xb-1)L.vents.push({x:sx*TSZ+4,y:y1*TSZ,ph:RF()*4.2});
       S(xa+2,y1,5);S(xb-2,y1,5);plat(xa,xa+7,y1-hy);plat(xb-7,xb,y1-hy);
       bigChest(xa+3,y1-hy,'ENGINE ROOM CHEST',44+idx*10);chest(xb-3,y1-hy,16+idx*5);
       spawn(0,(pm-6)*TSZ,(y1-1)*TSZ);spawn(0,(pm+6)*TSZ,(y1-1)*TSZ);spawn(3,(xa+4)*TSZ,(y1-hy-1)*TSZ);
       return mkSet(r,'engine','DEAD ENGINE ROOM',xa-1,xb+1,y1-T,{core:pm})},
     forge(r){const run=runOf(r,12);if(!run||run.n<26)return false;const y1=r.y1,xa=r.x0+run.a+2,xb=r.x0+run.a+run.n-3,pm=(xa+xb)>>1,pa=pm-5,pb=pm+4,T=Math.min(...r.hh.slice(xa-r.x0,xb-r.x0+1))-1,hy=Math.min(8,T-2);
       for(let x=pa;x<=pb;x++)for(let y=y1+1;y<=y1+4;y++)if(G(x,y)!==1)return false;
       carve(xa,xb,y1-T,y1-1);
       for(let x=pa;x<=pb;x++){for(let y=y1+1;y<=y1+3;y++)S(x,y,4);S(x,y1,6)}
       L.lifts.push({x:(xa+2)*TSZ,y:y1*TSZ,w:24,axis:'v',a:(y1-hy)*TSZ,b:y1*TSZ,sp:30,ph:RF()*6,chain:1});L.lifts.push({x:(xb-4)*TSZ,y:y1*TSZ,w:24,axis:'v',a:(y1-hy)*TSZ,b:y1*TSZ,sp:30,ph:RF()*6,chain:1});
       plat(xa+5,xa+13,y1-hy);plat(xb-12,xb-5,y1-hy);plat(xa+14,xb-13,y1-hy,6);
       bigChest(pm,y1-hy,'CRUCIBLE BRIDGE CHEST',56+idx*10);chest(xa+9,y1-hy,16+idx*5);chest(xb-9,y1-hy,16+idx*5);
       spawn(2,(xa+10)*TSZ,(y1-hy-1)*TSZ);spawn(2,(xb-9)*TSZ,(y1-hy-1)*TSZ);spawn(3,(xa+4)*TSZ,(y1-1)*TSZ);spawn(3,(xb-4)*TSZ,(y1-1)*TSZ);
       L.vents.push({x:(pa-3)*TSZ+4,y:y1*TSZ,ph:1},{x:(pb+4)*TSZ+4,y:y1*TSZ,ph:3});
       return mkSet(r,'forge',SETN[3],xa-1,xb+1,y1-T,{river:[pa,pb]})},
     brood(r){const run=runOf(r,12);if(!run||run.n<24)return false;const y1=r.y1,xa=r.x0+run.a+2,xb=r.x0+run.a+run.n-3,pm=(xa+xb)>>1,T=Math.min(...r.hh.slice(xa-r.x0,xb-r.x0+1))-1,up=Math.min(13,T-1);
       carve(xa,xb,y1-T,y1-1);
       plat(xa,xa+7,y1-4);plat(xa,xa+7,y1-8);
       for(const [ex,ey] of [[xa+1,y1],[xa+4,y1],[xa+7,y1],[xa+2,y1-4],[xa+5,y1-4],[xa+1,y1-8],[xa+4,y1-8],[xa+7,y1-8],[xa+10,y1]])L.eggs.push({x:ex*TSZ+4,y:ey*TSZ,st:0,t:0,real:RF()<.55});
       L.ups.push({x:(pm+2)*TSZ,y:(y1-up)*TSZ,w:3*TSZ,h:up*TSZ,c:'#ff9acb'});L.ups.push({x:(xb-6)*TSZ,y:(y1-up)*TSZ,w:3*TSZ,h:up*TSZ,c:'#ff9acb'});
       plat(pm-2,pm+8,y1-up);plat(xb-8,xb-1,y1-up);
       bigChest(pm+4,y1-up,'BROOD CHAMBER CHEST',56+idx*10);chest(xb-4,y1-up,16+idx*5);
       for(const [t,sx,sy] of [[1,pm-4,y1-8],[1,pm+6,y1-9],[0,pm-6,y1-1],[0,xb-3,y1-1],[3,pm+10,y1-1]])spawn(t,sx*TSZ,sy*TSZ);
       return mkSet(r,'brood',SETN[4],xa-1,xb+1,y1-T,{})}};
   const kinds={0:['cathedral','cathedral'],1:['geode','geode'],2:['hall','engine'],3:['forge','forge'],4:['brood','brood']}[idx];
   const PA=A0||analyzeLevel(L,{noUps:true});const floorOK=(q)=>{for(let x=q.x0+4;x<q.x0+q.w-4;x+=3)for(let dy=-1;dy<=0;dy++)if(PA.F[(q.y1+dy-1)*LW+x])return true;return false};
   for(const k of kinds){for(let tries=0;tries<14;tries++){const r=takeRoom(q=>q.w>=34&&q.h>=17&&!q.dark&&!q.setp&&floorOK(q)&&(q.reserve||tries>8),2);if(!r)break;r.setp=1;if(builders[k](r))break;else r.used=false}}
   for(const c of L.chests)if(c.big&&c.sec)L.secretPts.push({x:c.x,y:c.y,sid:c.sec})}
  /* hanging stone pillars and stalactite clusters break up the big empty rooms */
  for(const r of shuffled){if(r.used||r.dark||r.w<24||r.h<16||wet(r)||RF()<.4)continue;const n=rf(1,2);for(let k=0;k<n;k++){const qx=rf(6,r.w-9),px_=r.x0+qx,cy=r.y1-Math.min(r.hh[qx],r.hh[qx+1]),len=rf(4,Math.min(9,Math.min(r.hh[qx],r.hh[qx+1])-10));if(len<4)continue;
      let ok=true;for(let y=cy-1;y<=cy+len+1&&ok;y++)for(let x=px_-1;x<=px_+2;x++){const t=G(x,y);if(y>=cy-1&&y<=cy&&t===1)continue;if(t!==0)ok=false}
      if(!ok)continue;for(let y=cy;y<=cy+len;y++){S(px_,y,1);S(px_+1,y,1)}S(px_,cy+len+1,1)}}
  /* relief: rolling floors, stalactite cones on the ceilings and stepped mounds, so rooms are not flat boxes */
  for(const r of shuffled){if(r.w<26||wet(r)||r.dark||r.setp)continue;const y1=r.y1,A=rf(2,4),ph=RF()*6,fq=rf(16,30)/100,prot=new Uint8Array(r.w);
    const mark=(px,rad)=>{const q=Math.round(px/TSZ)-r.x0;for(let k=q-rad;k<=q+rad;k++)if(k>=0&&k<r.w)prot[k]=1};
    for(const o of ia)if(Math.abs(o.y/TSZ-y1)<8)mark(o.x,4);for(const c of L.chests)if(Math.abs((c.y+10)/TSZ-y1)<8)mark(c.x+7,4);for(const c of L.checks)if(Math.abs(c.y/TSZ-y1)<8)mark(c.x,4);for(const d of doors)for(const [cx,cy] of d.cells)if(Math.abs(cy-y1)<8)mark(cx*TSZ,5);for(const v of L.vents||[])if(Math.abs(v.y/TSZ-y1)<8)mark(v.x,3);for(const l of L.lifts)if(Math.abs(l.y/TSZ-y1)<14)mark(l.x,6);
    for(let q=0;q<r.w;q++)for(let y=y1-3;y<y1;y++){const t=G(r.x0+q,y);if(t===7||t===10||t===4||t===5||t===3||t===2)prot[q]=1}
    const u=new Int8Array(r.w);for(let q=6;q<r.w-6;q++){if(prot[q])continue;const e=Math.min(1,(Math.min(q,r.w-1-q)-5)/4);u[q]=Math.max(0,Math.round(e*(A*(.5+.5*Math.sin(q*fq+ph))-.4)))}
    for(let q=1;q<r.w;q++)if(u[q]-u[q-1]>1)u[q]=u[q-1]+1;for(let q=r.w-2;q>=0;q--)if(u[q]-u[q+1]>1)u[q]=u[q+1]+1;
    for(let q=0;q<r.w;q++){if(prot[q])u[q]=0;if(u[q]>0&&r.hh[q]<u[q]+10)u[q]=0}
    for(let q=0;q<r.w;q++)for(let k=1;k<=u[q];k++)if(G(r.x0+q,y1-k)===0)S(r.x0+q,y1-k,1);
    if(RF()<.7){for(let tr=0;tr<6;tr++){const pw=rf(3,5),q0=rf(8,Math.max(9,r.w-pw-9));let ok=true;for(let q=q0-2;q<q0+pw+2&&ok;q++){if(prot[q]||u[q]>0)ok=false}
        if(ok){for(let q=q0;q<q0+pw&&ok;q++)for(let y=y1;y<=y1+6;y++)if(G(r.x0+q,y)!==1)ok=false}
        if(!ok)continue;for(let q=q0;q<q0+pw;q++){for(let y=y1;y<=y1+4;y++)S(r.x0+q,y,0);prot[q]=1}
        const cxp=r.x0+q0+(pw>>1);chest(cxp,y1+5,12+idx*5);for(let k=0;k<3;k++)L.coins.push({x:(cxp-2+k*2)*TSZ+4,y:(y1+3)*TSZ,v:2+idx});break}}
    const at=(px)=>u[Math.max(0,Math.min(r.w-1,Math.round(px/TSZ)-r.x0))]||0;
    for(const sp of L.spawns)if(Math.abs(sp.y/TSZ-y1)<3&&sp.x/TSZ>=r.x0&&sp.x/TSZ<r.x0+r.w)sp.y-=at(sp.x)*TSZ;
    for(const c of L.coins)if(Math.abs(c.y/TSZ-y1)<6&&c.x/TSZ>=r.x0&&c.x/TSZ<r.x0+r.w)c.y-=at(c.x)*TSZ;
    for(const d of L.deco)if(Math.abs(d.y/TSZ-y1)<3&&d.x/TSZ>=r.x0&&d.x/TSZ<r.x0+r.w)d.y-=at(d.x)*TSZ;
    for(const e of L.eggs)if(Math.abs(e.y/TSZ-y1)<3&&e.x/TSZ>=r.x0&&e.x/TSZ<r.x0+r.w)e.y-=at(e.x)*TSZ;}
  for(const r of shuffled){if(r.w<20||wet(r)||r.dark)continue;const y1=r.y1;
    const nS=rf(3,7);for(let k=0;k<nS;k++){const qx=rf(3,r.w-4),px_=r.x0+qx,top=y1-r.hh[qx],hhq=r.hh[qx];if(hhq<12||G(px_,top)!==0||G(px_,top-1)!==1)continue;const len=rf(2,Math.min(7,hhq-9));
      for(let j=0;j<=len;j++){const w=j<len*.35?3:j<len*.7?2:1,xs=px_-(w>>1);for(let x=xs;x<xs+w;x++)if(G(x,top+j)===0&&(G(x,top+j-1)===1||j>0))S(x,top+j,1)}}
    const nM=rf(1,3);for(let k=0;k<nM;k++){const w=rf(6,11),h=rf(2,4),qx=rf(4,Math.max(5,r.w-w-4)),x0=r.x0+qx;let ok=x0>r.x0+2&&x0+w<r.x0+r.w-2;
      for(let x=x0-1;x<=x0+w&&ok;x++){const q=x-r.x0;if(r.hh[q]<h+8)ok=false;if(G(x,y1)!==1)ok=false;for(let y=y1-h-3;y<y1&&ok;y++)if(G(x,y)!==0)ok=false}
      if(ok){for(const o of ia)if(Math.abs(o.x/TSZ-(x0+w/2))<w/2+3&&Math.abs(o.y/TSZ-y1)<6)ok=false;for(const c of L.chests)if(Math.abs((c.x+7)/TSZ-(x0+w/2))<w/2+2&&Math.abs((c.y+5)/TSZ-y1)<6)ok=false;for(const d of doors)for(const [cx,cy] of d.cells)if(cx>x0-3&&cx<x0+w+3&&Math.abs(cy-y1)<6)ok=false;for(const v of L.vents||[])if(Math.abs(v.x/TSZ-(x0+w/2))<w/2+2)ok=false}
      if(!ok)continue;const inA=(x,y)=>x>=(x0-1)*TSZ&&x<=(x0+w+1)*TSZ&&y>=(y1-h-1)*TSZ&&y<=(y1+1)*TSZ;L.spawns=L.spawns.filter(q=>!inA(q.x,q.y));L.coins=L.coins.filter(c=>!inA(c.x,c.y));L.deco=L.deco.filter(d=>!inA(d.x,d.y-4));
      for(let j=0;j<h;j++)for(let x=x0+j;x<x0+w-j;x++)S(x,y1-1-j,1)}}
  /* nothing you can use may stand in lava */
  {const clr=(x,y)=>{const tx=Math.floor(x/TSZ),ty=Math.round(y/TSZ);for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=1;dy++)if(G(tx+dx,ty+dy)===4&&G(tx+dx,ty+dy+1)===1)S(tx+dx,ty+dy,0)};for(const o of ia)clr(o.x,o.y);for(const c of L.chests)clr(c.x+7,c.y+10);for(const v of L.vents||[])clr(v.x,v.y)}
  /* a floor spot in a room: bottom-most standing row in the column with a clear box above it */
  const flSpot=(r,wd,ht)=>{for(let t=0;t<14;t++){const tx=r.x0+rf(Math.ceil(wd/2)+1,Math.max(Math.ceil(wd/2)+2,r.w-Math.ceil(wd/2)-1));let fy=-1;for(let y=Math.min(r.y1+3,LH-4);y>r.yt;y--)if(G(tx,y)===0&&G(tx,y+1)===1){fy=y;break}if(fy<0)continue;let ok=true;for(let dx=-(wd>>1);dx<=(wd>>1)&&ok;dx++){if(G(tx+dx,fy+1)!==1&&G(tx+dx,fy+1)!==2)ok=false;for(let dy=0;dy<ht&&ok;dy++){const q=G(tx+dx,fy-dy);if(q!==0&&q!==7)ok=false}}if(!ok)continue;const px_=tx*TSZ,py_=(fy+1)*TSZ;if(L.chests.some(c=>Math.abs(c.x-px_)<40&&Math.abs(c.y-py_)<40)||ia.some(o=>Math.abs(o.x-px_)<36&&Math.abs(o.y-py_)<36))continue;return {tx,fy}}return null};
  if(idx===4){for(const r of shuffled){if(r.w<24||wet(r))continue;const q=RF();if(q<.3){const s=flSpot(r,6,5);if(s)L.deco.push({x:s.tx*TSZ+4,y:(s.fy+1)*TSZ+1,k:'heart'})}if(q>.45)for(let k=0;k<2;k++){const s=flSpot(r,3,4);if(s)L.deco.push({x:s.tx*TSZ+4,y:(s.fy+1)*TSZ+1,k:'rib'})}}}
  /* jungle landmarks: every room gets a different big feature in a contrasting colour plus a soft tint of its own */
  if(idx!==0){L.tints=[];const TP=[0,['#ffcc66','#66ddff','#ff8899'],['#44ddff','#ffcc44','#44ff99','#ff66cc'],['#ff6633','#ffcc33','#ff3322'],['#ff66cc','#66ffdd','#ffdd66','#aa77ff']][idx];for(const r of rooms){if(r.w<14||wet(r))continue;L.tints.push({x:(r.x0+(r.w>>1))*TSZ,y:(r.y1-7)*TSZ,c:TP[(r.i*3+r.j*5)%TP.length]})}}
  if(idx===0){const LMK=[['jtotem',4,8,'#33dddd'],['jcrys',7,7,'#66eeff'],['jbones',10,6,'#ffeeaa'],['jlanterns',8,9,'#ffaa33'],['jshell',5,5,'#ff8866'],['jrunes',8,8,'#55ff88'],['jpod',6,7,'#ff7733']];L.landmarks=0;L.tints=[];
    rooms.forEach((r,n)=>{if(r.w<14||wet(r))return;const m=LMK[(r.i*3+r.j*5+n)%LMK.length],s=flSpot(r,m[1]+1,m[2]+2);if(!s)return;L.deco.push({x:s.tx*TSZ+4,y:(s.fy+1)*TSZ+1,k:m[0]});L.tints.push({x:s.tx*TSZ+4,y:(s.fy-2)*TSZ,c:m[3]});L.landmarks++;if(r.w>=26){const m2=LMK[(r.i*3+r.j*5+n+3)%LMK.length],s2=flSpot(r,m2[1]+1,m2[2]+2);if(s2&&Math.abs(s2.tx-s.tx)>9){L.deco.push({x:s2.tx*TSZ+4,y:(s2.fy+1)*TSZ+1,k:m2[0]});L.tints.push({x:s2.tx*TSZ+4,y:(s2.fy-2)*TSZ,c:m2[3]});L.landmarks++}}})}
  L.secretTotal=secrets.length;L.loreCount=ia.filter(o=>o.k==='lore').length;
}

/* ---------------- pictures for the things you can use ---------------- */
/* each world's guardian has its own shape */
const BOSSNAME=['SPORE TITAN','CRYSTAL SCARAB','REACTOR TANK','LAVA COLOSSUS','HIVE QUEEN'];
function mkBossSprite(idx){const SZ=[[22,22],[22,24],[26,28],[20,26],[28,30]][idx],w=SZ[0],h=SZ[1];
  const draw=(g,f)=>{const cx=w/2,b=f&1,c2=(f>>1)&1;
    if(idx===0){   /* a walking giant mushroom */
      thick(g,BR,cx-3,h-6,cx-3-b,h-1,3);thick(g,BR,cx+3,h-6,cx+3+(1-b),h-1,3);
      ell(g,cx,h*.64,5.6,6.6,[BR,TN,OR,YL]);
      thick(g,TN,cx-6,h*.52,cx-10,h*.66+b,2);thick(g,TN,cx+6,h*.52,cx+10,h*.66+(1-b),2);ell(g,cx-10,h*.7+b,2,2,[BR,TN,OR]);ell(g,cx+10,h*.7+(1-b),2,2,[BR,TN,OR]);
      ell(g,cx,h*.3,w*.5-.5,h*.27,['#4a1048',mg,MG,'#ffddff']);px(g,'#4a1048',2,h*.36,w-4,2);
      for(const [sx,sy,sw] of [[cx-7,.2,2],[cx+3,.14,3],[cx+7,.28,2],[cx-2,.3,2]])px(g,WH,sx,h*sy,sw,2);
      px(g,YL,cx-3,h*.56,2,2);px(g,YL,cx+1,h*.56,2,2);px(g,K,cx-3,h*.56+1,1,1);px(g,K,cx+1,h*.56+1,1,1);px(g,K,cx-2,h*.7,5,1);
      for(let i=0;i<3;i++)px(g,PG,3+i*7+c2,h*.42+((i+f)%3),1,2)}
    else if(idx===1){   /* a crystal scarab */
      for(let i=0;i<3;i++){const x0=cx-5+i*5,s=(f+i)&1;line(g,MG,x0,h*.7,x0+(s?-3:3),h-1);line(g,mg,x0+1,h*.7,x0+(s?-2:4),h-1)}
      ell(g,cx+1,h*.58,w*.44,h*.26,[PU,MG,'#ffccff',WH]);
      for(let i=0;i<5;i++){const x=cx-7+i*4;poly(g,[[x,h*.45],[x+2,h*(.05+(i%2)*.1)],[x+4,h*.45]],[WH,CY,MG])}
      ell(g,3.5,h*.58,3.6,3.4,[PU,MG,'#ffccff',WH]);px(g,WH,2,h*.54,2,2);px(g,K,2,h*.54+1,1,1);
      thick(g,CY,1,h*.7,-0.5+b,h*.84,2);thick(g,CY,3,h*.72,2-b,h*.88,2);
      line(g,CY,w-2,h*.56,w+1,h*.4-c2);px(g,WH,w-2,h*.4,2,2)}
    else if(idx===2){   /* a reactor tank on treads */
      px(g,K,1,h-7,w-2,7);px(g,D,2,h-6,w-4,5);for(let i=0;i<5;i++)ell(g,4+i*4.4,h-3.5,2,2,[K,GM,LM,LL]);px(g,GM,2,h-7,w-4,1);for(let i=0;i<w-4;i+=4)px(g,K,2+i+((f)&3),h-4,1,2);
      poly(g,[[3,h-7],[w-3,h-7],[w-5,h*.46],[5,h*.46]],[LM,GM,D]);
      for(let i=0;i<5;i++)px(g,i&1?OR:K,5+i*4,h*.62,3,2);
      ell(g,cx-1,h*.4,6.5,5.5,[NV,BL,CY,WH]);px(g,K,cx-4,h*.37,5,2);px(g,RD,cx-3,h*.37,1,1);
      thick(g,GM,cx+2,h*.38,w-1,h*.28+b,4);px(g,K,w-2,h*.28+b-1,2,5);px(g,OR,w-1,h*.3+b,1,2);
      px(g,LL,3,h*.5,2,4);px(g,D,3,h*.5,1,4);for(let i=0;i<2;i++)px(g,'#cccccc',4,h*.44-i*4-b,1,1)}
    else if(idx===3){   /* a molten colossus */
      thick(g,'#4a3a58',cx-4,h*.7,cx-5,h-1,4);thick(g,'#4a3a58',cx+4,h*.7,cx+5+b,h-1,4);px(g,OR,cx-6,h-2,3,1);px(g,OR,cx+4,h-2,3,1);
      ell(g,cx,h*.5,w*.42,h*.26,['#3a2a44','#7a4a5a',OR,YL]);
      ell(g,3,h*.42,3.2,3.4,['#3a2a44','#7a4a5a',OR,YL]);ell(g,w-3,h*.42,3.2,3.4,['#3a2a44','#7a4a5a',OR,YL]);
      thick(g,'#5a4466',2,h*.48,0+b,h*.76,3);thick(g,'#5a4466',w-3,h*.48,w-1-b,h*.76,3);ell(g,b,h*.8,2.6,2.6,[rd,OR,YL]);ell(g,w-1-b,h*.8,2.6,2.6,[rd,OR,YL]);
      ell(g,cx,h*.16,4,4,['#3a2a44','#7a4a5a',OR]);poly(g,[[cx-5,h*.14],[cx-7,h*.0],[cx-3,h*.1]],[OR,rd,D]);poly(g,[[cx+5,h*.14],[cx+7,h*.0],[cx+3,h*.1]],[OR,rd,D]);px(g,YL,cx-3,h*.17,2,1);px(g,YL,cx+1,h*.17,2,1);
      for(let i=0;i<5;i++){const x=cx-6+i*3;line(g,i&1?YL:OR,x,h*.36+(i%2)*2,x+1-(i&1)*2,h*.62-c2)}}
    else{   /* the hive queen */
      for(let i=0;i<3;i++){const x0=w*.3+i*3,s=(f+i)&1;line(g,PU,x0,h*.62,x0+(s?-2:2),h-1);line(g,mg,x0+1,h*.62,x0+(s?-1:3),h-1)}
      ell(g,w*.72,h*.56,9,8,['#3a0a38',PU,mg,PG]);for(let i=0;i<4;i++)line(g,'#3a0a38',w*.62+i*2.5,h*.42,w*.66+i*2.5,h*.7);
      for(let i=0;i<3;i++)ell(g,w*.8+(i-1)*2.4,h*.62+(i&1)*2.4,1.4,1.7,[PG,WH,WH]);
      ell(g,w*.4,h*.52,5.2,5,[PU,mg,MG,'#ffddff']);
      ell(g,w*.2,h*.38,4.8,4.4,[PU,mg,MG,WH]);px(g,PG,w*.2-3,h*.34,2,2);px(g,PG,w*.2+1,h*.34,2,2);px(g,K,w*.2-3,h*.34+1,1,1);px(g,K,w*.2+1,h*.34+1,1,1);
      thick(g,WH,w*.2-4,h*.46,w*.2-6,h*.56+b,2);thick(g,WH,w*.2+1,h*.46,w*.2+1,h*.57-b,2);
      poly(g,[[w*.38,h*.44],[w*.5,h*.08+b*2],[w*.64,h*.3]],[WH,CY,'#9ad2e0']);poly(g,[[w*.3,h*.46],[w*.34,h*.1+b*2],[w*.44,h*.34]],[WH,CY,'#9ad2e0']);
      line(g,PG,w*.14,h*.2,w*.1,h*.06);line(g,PG,w*.26,h*.2,w*.3,h*.06)}};
  const fr=[0,1,2,3].map(f=>fin(cnv(w,h,g=>draw(g,f))));return{fr,wh:fr.map(whiteOf)}}
function tintOf(c,col,a){return cnv(c.width,c.height,g=>{g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(0,0,c.width,c.height)})}
function mkFeatAssets(Wd,idx,T){
  const F={glow:Wd.glow};
  const gl=Wd.glow;
  /* lore objects, one look per world */
  F.lore=fin(cnv(16,18,g=>{
    if(idx===0){poly(g,[[2,18],[3,4],[8,0],[13,4],[14,18]],['#f0f0ff',LL,LM,GM]);px(g,'#ffffff',4,4,1,10);for(const [y,w] of [[5,6],[9,7],[13,5]]){px(g,gl,8-(w>>1),y,w,2);px(g,'#ffffff',8-(w>>1),y,w,1)}px(g,K,7,7,2,1);px(g,GM,0,16,16,2);px(g,LL,0,16,16,1)}
    else if(idx===1){poly(g,[[1,18],[1,4],[5,2],[8,4],[10,0],[15,3],[15,18]],['#fff0c0','#e8c080',OR,TN]);px(g,'#ffffff',2,5,2,10);for(const y of [6,10,14])px(g,BR,4,y,9,2);px(g,'#33e0d0',7,7,3,3);px(g,'#ffffff',7,7,1,1);px(g,K,8,3,1,12)}
    else if(idx===2){poly(g,[[1,9],[15,9],[15,17],[1,17]],['#8aa0c8','#4a6aa8','#2a4478']);px(g,'#0a1430',3,17,10,1);px(g,K,2,1,12,9);px(g,'#0a2a44',3,2,10,7);for(let i=0;i<4;i++){px(g,'#7affff',3,3+i*2,4+(i%3)*3,1)}px(g,'#ffffff',3,2,10,1);px(g,YL,3,12,2,2);px(g,'#ff5544',7,12,2,2);px(g,'#55ff88',11,12,2,2);px(g,'#ffffff',1,9,14,1)}
    else if(idx===3){poly(g,[[1,18],[3,11],[13,11],[15,18]],['#7a5a6a','#4a3040','#2a1a28']);ell(g,8,6,5.4,5.4,['#d0c0b0',LL,WH,WH]);px(g,K,5,4,3,3);px(g,K,9,4,3,3);px(g,'#ffcc44',6,5,1,1);px(g,'#ffcc44',10,5,1,1);px(g,K,8,8,1,3);px(g,OR,4,13,2,2);px(g,YL,10,14,2,2);px(g,'#ffffff',6,2,3,1)}
    else{ell(g,8,9,7,8.5,['#3a0a38','#8a2a9a',MG,'#ffd0ff']);px(g,'#ffe08a',4,6,8,2);px(g,K,7,6,2,2);px(g,'#9affc8',5,12,2,2);px(g,'#9affc8',10,11,2,2);px(g,'#ffffff',5,3,3,1)}}));
  /* people */
  F.npc={};
  F.npc.astro=fin(cnv(12,18,g=>{
    px(g,LL,3,10,2,6);px(g,LL,7,10,2,6);px(g,GM,3,15,2,2);px(g,GM,7,15,2,2);
    poly(g,[[2,7],[10,7],[10,13],[2,13]],[WH,LL,LL,LM]);px(g,OR,4,9,4,2);
    ell(g,6,4,4,4,[NV,BL,CY,WH]);px(g,K,6,2,4,4);px(g,CY,7,3,3,2);px(g,WH,7,3,1,1);
    px(g,LL,10,3,1,5);px(g,WH,10,2,2,2);px(g,LL,1,8,1,3)}));
  F.npc.hermit=fin(cnv(12,18,g=>{
    poly(g,[[1,17],[3,6],[6,3],[9,6],[11,17]],[BR,TN,'#5a3a30','#2a1008']);px(g,K,4,6,4,4);px(g,YL,4,7,1,1);px(g,YL,7,7,1,1);
    px(g,TN,2,13,1,1);px(g,TN,9,14,1,1);line(g,'#b8884a',11,3,11,17);px(g,OR,10,2,3,2);px(g,YL,11,1,1,1)}));
  F.npc.trader=fin(cnv(14,18,g=>{
    px(g,K,2,15,4,3);px(g,K,8,15,4,3);px(g,LL,3,16,2,1);px(g,LL,9,16,2,1);
    poly(g,[[2,8],[12,8],[12,15],[2,15]],[LL,LM,GM,D]);px(g,GREEN[3],4,10,6,3);px(g,GREEN[1],5,11,4,1);px(g,K,6,10,2,3);
    poly(g,[[3,2],[11,2],[11,8],[3,8]],[LL,LM,GM]);px(g,K,4,3,6,4);px(g,GREEN[3],5,4,1,2);px(g,GREEN[3],8,4,1,2);px(g,GREEN[2],5,6,4,1);
    line(g,LM,7,2,7,0);px(g,RD,6,0,3,1);px(g,YL,0,10,2,2);px(g,YL,12,10,2,2)}));
  F.npc.ghost=fin(cnv(12,18,g=>{
    ell(g,6,5,4.5,4.5,['#6c8aa8',CY,'#e0ffff',WH]);px(g,'#102030',4,3,5,4);px(g,CY,5,4,3,2);
    poly(g,[[2,9],[10,9],[11,17],[9,15],[7,17],[5,15],[3,17],[1,17]],['#e0ffff',CY,'#6c8aa8']);px(g,'#102030',3,11,1,1);px(g,'#102030',8,11,1,1)}));
  /* things to pull, press and carry */
  F.lever=[0,1].map(on=>fin(cnv(16,15,g=>{px(g,'#8a90a8',1,10,14,4);px(g,'#d8dcf0',1,10,14,1);px(g,'#4a5068',1,13,14,1);px(g,K,5,9,6,1);px(g,'#ffcc44',2,11,2,1);px(g,'#ffcc44',12,11,2,1);if(on){thick(g,'#f0f0ff',8,10,13,3,3);ell(g,13,2.5,3,3,['#117733','#44ee66','#ccffcc'])}else{thick(g,'#f0f0ff',8,10,3,3,3);ell(g,3,2.5,3,3,['#881122','#ff4455','#ffccc0'])}})));
  F.plate=[0,1].map(dn=>cnv(22,6,g=>{if(!dn){px(g,K,0,3,22,3);px(g,'#7a7a90',1,1,20,4);for(let i=0;i<20;i+=4){px(g,YL,1+i,1,2,4)}px(g,'#ffffff',1,0,20,1);px(g,'#44e8ff',1,0,20,1)}else{px(g,K,0,3,22,3);px(g,'#7a7a90',1,3,20,2);px(g,'#44ff88',2,3,18,1)}}));
  F.key=[['#ff5544','#aa2020','#ffc0b8'],['#55aaff','#2060aa','#c0e0ff']].map(c=>fin(cnv(14,12,g=>{ell(g,4.5,4.5,4.4,4.4,[c[1],c[0],c[2]]);px(g,K,3,3,3,3);px(g,'#ffffff',2,1,2,1);px(g,c[0],8,4,5,2);px(g,c[2],8,4,5,1);px(g,c[0],10,6,2,3);px(g,c[0],12,6,2,2)})));
  F.frag=fin(cnv(12,12,g=>{poly(g,[[0,3],[7,0],[12,4],[10,10],[3,12],[1,8]],['#fff0c0','#e8c080','#b08040']);px(g,'#ff4433',4,4,2,2);px(g,'#ff4433',7,4,2,2);px(g,'#ff4433',5,6,3,2);px(g,'#ff4433',4,8,2,2);px(g,'#ff4433',7,8,2,2);px(g,'#ffffff',2,3,3,1)}));
  F.shrine=fin(cnv(20,22,g=>{poly(g,[[1,22],[4,12],[16,12],[19,22]],['#f0f0ff',LL,LM,GM]);px(g,K,8,15,4,7);poly(g,[[5,12],[7,8],[13,8],[15,12]],['#ffffff',LL,LM]);ell(g,10,4.5,4.6,4.6,['#ff9a30','#ffee66','#ffffff','#ffffff']);px(g,'#ffffff',8,3,2,2);px(g,YL,0,18,20,1)}));
  F.panel=fin(cnv(16,20,g=>{poly(g,[[1,1],[15,1],[15,20],[1,20]],['#c8d0e8','#8a92b0','#4a5070']);px(g,K,2,2,12,7);px(g,'#0a2a44',3,3,10,5);for(let i=0;i<3;i++)px(g,'#7affff',4,4+i*2,3+(i%2)*4,1);px(g,'#ffffff',3,3,10,1);for(let j=0;j<3;j++)for(let i=0;i<3;i++)px(g,(i+j)%2?'#ffe08a':'#ffffff',3+i*4,11+j*3,3,2);px(g,'#ff5544',12,18,2,1)}));
  F.crystal=fin(cnv(10,14,g=>{poly(g,[[5,0],[9,5],[8,13],[2,13],[1,5]],['#c0f0ff','#44ccff','#1a6ac0']);px(g,'#ffffff',3,3,1,5);px(g,'#ffffff',5,1,1,2)}));
  F.heart=cnv(7,7,g=>{const c='#ff5566';px(g,c,0,1,3,2);px(g,c,4,1,3,2);px(g,c,0,2,7,2);px(g,c,1,4,5,1);px(g,c,2,5,3,1);px(g,c,3,6,1,1);px(g,'#ffffff',1,1,1,1);px(g,'#aa2233',5,3,1,1)});
  /* a door and a cracked wall, drawn as map tiles */
  F.door=cnv(8,8,g=>{px(g,K,0,0,8,8);px(g,'#6c6c88',1,0,6,8);px(g,'#ccccdd',1,0,6,1);px(g,'#ccccdd',1,0,1,8);px(g,'#44445a',6,0,1,8);px(g,'#44445a',1,7,6,1);px(g,'#8a8aa8',2,1,4,6);px(g,K,2,3,4,1);px(g,WH,2,1,1,1);px(g,WH,5,1,1,1);px(g,WH,2,6,1,1);px(g,WH,5,6,1,1)});
  F.crack=cnv(8,8,g=>{g.drawImage(T.mid,0,0);g.globalAlpha=.25;g.fillStyle='#fff';g.fillRect(0,0,8,8);g.globalAlpha=1;line(g,K,1,0,3,3);line(g,K,3,3,2,5);line(g,K,2,5,4,7);line(g,K,5,1,6,4);line(g,K,6,4,5,6);px(g,gl,3,4,1,1);px(g,gl,6,5,1,1)});
  /* the cursed chest: teeth, eyes and a tongue */
  F.mimic=(()=>{const fr=[0,1,2,3].map(f=>fin(cnv(14,12,g=>{const op=[1,3,5,3][f];
    poly(g,[[0,5+op],[14,5+op],[14,12],[0,12]],[BR,TN,OR]);px(g,K,0,7+op,14,1);px(g,YL,6,8+op,2,2);
    poly(g,[[0,0],[14,0],[14,4-(op>>1)],[0,4-(op>>1)]],[BR,OR,YL]);px(g,K,1,4-(op>>1),12,Math.max(1,op));px(g,RD,3,4,8,Math.max(1,op-1));
    for(let i=0;i<4;i++){px(g,WH,2+i*3,4-(op>>1),1,Math.min(2,op));px(g,WH,3+i*3,5+op,1,1)}
    px(g,YL,3,1,2,2);px(g,YL,9,1,2,2);px(g,K,4,2,1,1);px(g,K,9,2,1,1)})));
    return{fr,wh:fr.map(whiteOf)}})();
  return F;
}

function genLevel(idx){
  const Wd=WORLDS[idx],Pm=PARAM[idx],R=rng(9100+idx*977),rn=(a,b)=>a+Math.floor(R()*(b-a+1)),NZ=B.mkNoise(300+idx);
  const WPm=WP[idx],LW=WPm.lw,ship=!!Wd.ship,cavern=!!Wd.cavern;
  const Ef=f=>{const P=WPm.E;for(let i=1;i<P.length;i++)if(f<=P[i][0]){const t=(f-P[i-1][0])/(P[i][0]-P[i-1][0]),u=t*t*(3-2*t);return P[i-1][1]+(P[i][1]-P[i-1][1])*u}return P[P.length-1][1]};
  let upMax=0,dnMax=0;for(let i=0;i<=40;i++){const e=Ef(i/40);upMax=Math.max(upMax,-e);dnMax=Math.max(dnMax,e)}
  const SURF=WPm.pk+30+Math.round(upMax),LH=idx<2?SURF+30+WPm.ab+20:SURF+Math.round(dnMax)+WPm.ab+36;
  const elevAt=xx=>SURF+Math.round(Ef(clamp(xx/LW,0,1)));
  const g=new Uint8Array(LW*LH);
  const L={idx,LW,LH,g,cols:Math.ceil(LW/CW_),rows:Math.ceil(LH/CH_),lifts:[],coins:[],chests:[],spawns:[],checks:[],ups:[],springs:[],exit:null,crum:{},tick:0,deco:[],fish:[],gates:[],kinds:[],falls:[],glows:[],clouds:[],pieces:[],top:new Int16Array(LW).fill(-1),skyRow:SURF,cellsList:[]};
  const S=(x,y,t)=>{if(x>=0&&x<LW&&y>=0&&y<LH)g[y*LW+x]=t};
  const G=(x,y)=>x<0||x>=LW||y<0||y>=LH?1:g[y*LW+x];
  const rect=(x,y,w,h,t)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)S(x+i,y+j,t)};
  const spawn=(type,sx,sy)=>L.spawns.push({type,x:sx,y:sy,t:0,e:null});
  const chest=(x,y,v)=>L.chests.push({x:x*TS,y:y*TS-10,open:0,v});
  const deco=(x,y,k)=>L.deco.push({x:x*TS+4,y:y*TS+1,k});
  const coinArc=(x0,y0,n,hgt,v)=>{for(let i=0;i<n;i++)L.coins.push({x:(x0+i)*TS+4,y:(y0-Math.sin(i/(n-1||1)*PI)*hgt)*TS,v:v||1})};
  const top=new Int16Array(LW).fill(elevAt(0)),floorAt=new Int16Array(LW),rh=new Int16Array(LW),zc=new Uint8Array(LW);
  const feats=[],plats=[],posts=[],pockets=[],ladders=[];L.mazeEnds=[];L.abyss=[];L.sideCaves=[];const noCh=new Uint8Array(LW);
  let x=0,cyc=elevAt(0),curRH=ship?14:0,curZ=1,lastCheck=5;
  const baseRH=ship?14:cavern?15:0;curRH=baseRH;
  const col=h=>{top[x]=h;rh[x]=curRH;zc[x]=curZ;x++};
  const flat=n=>{for(let i=0;i<n&&x<LW-40;i++)col(cyc)};
  const gapCols=(n,fl)=>{const gx=x;for(let i=0;i<n&&x<LW-40;i++){floorAt[x]=fl;col(-1)}return gx};
  const groundSpawns=(x0,n,y)=>{const c=Math.max(0,Math.round(n/9*Pm.dens));for(let k=0;k<c;k++){const sx=x0+2+Math.floor(R()*Math.max(1,n-4)),t=R();spawn(t<.4?0:t<.6?3:t<.8?1:t<.95?2:4,sx*TS,y*TS)}};
  const CLO=()=>elevAt(x)-12,CHI=()=>elevAt(x)+10;
  const clampC=()=>{cyc=clamp(cyc,CLO(),CHI())};
  const zone=(z,name)=>{curZ=ZID[z];L.pieces.push({x0:x,z,name})};
  const lakes=[];
  /* ---------- the set pieces ---------- */
  const PC={
    slope(want){zone('stairs','slope');const x0=x,up=want<cyc,sw=rn(2,3);let g_=0;while(Math.abs(cyc-want)>2&&g_++<120&&x<LW-46){cyc+=up?-1:1;for(let k=0;k<sw;k++)col(cyc);if(g_%8===0)flat(rn(3,6));if(g_%13===0){chest(x-2,cyc,6+idx*3);deco(x-4,cyc,ship||idx===4?'crate':'pillar')}}
      for(let lx=x0+4;lx<x-4;lx+=rn(14,24))deco(lx,top[lx],idx===2?'girderL':idx===4?'rib':idx===3?'spire':'bush');groundSpawns(x0,x-x0,cyc-1)},
    flat(){zone('hills','flat');const n=rn(7,16),x0=x,amp=ship?0:idx===3?3:2.5,ph=R()*6;for(let i=0;i<n&&x<LW-40;i++){const f=Math.min(1,Math.min(i,n-1-i)/4);col(clamp(cyc+Math.round(amp*f*(Math.sin(i*.45+ph)+.5*Math.sin(i*.9))),CLO(),CHI()))}groundSpawns(x0,n,cyc-1);
      if(!ship&&!cavern&&n>=9&&R()<.6){feats.push({x:x0+2,y:cyc-6,t:1,w:n-4,h:2});for(let i=x0+3;i<x0+n-3;i+=2)L.coins.push({x:i*TS+4,y:(cyc-8)*TS,v:1})}},
    hill(){zone('hills','hill');const x0=x,st=rn(3,6),sw=rn(2,3);for(let s=0;s<st;s++){cyc--;clampC();for(let k=0;k<sw;k++)col(cyc)}flat(rn(4,7));for(let s=0;s<st;s++){cyc++;clampC();for(let k=0;k<sw;k++)col(cyc)}groundSpawns(x0,x-x0,cyc-1)},
    stairs(){zone('stairs','stairs');const x0=x,up=R()<.5,st=rn(3,6),sw=rn(2,3);for(let s=0;s<st;s++){cyc+=up?-1:1;clampC();for(let k=0;k<sw;k++)col(cyc)}groundSpawns(x0,x-x0,cyc-1)},
    longstairs(){zone('stairs','longstairs');const x0=x,up=cyc>SURF-2?true:cyc<SURF-6?false:R()<.5,st=rn(14,22),sw=2;
      for(let s=0;s<st;s++){cyc+=up?-1:1;clampC();for(let k=0;k<sw;k++)col(cyc);if(s%6===5){flat(3);if(R()<.4)chest(x-2,cyc,6+idx*3)}}
      for(let i=0;i<4;i++)deco(x0+6+i*12,top[Math.min(LW-1,x0+6+i*12)],'pillar');groundSpawns(x0,x-x0,cyc-1);if(R()<.5)flat(4)},
    mound(){zone('hills','mound');const x0=x,n=rn(14,22),hgt=rn(4,8);for(let i=0;i<n;i++)col(cyc-Math.round(hgt*Math.sin(i/(n-1)*PI)));groundSpawns(x0,n,cyc-hgt-1)},
    gap(){zone('void','gap');const n=rn(3,Pm.gapMax),fl=cyc+9,gx=gapCols(n,fl);for(let i=0;i<n;i++)feats.push({x:gx+i,y:fl-1,t:Wd.lava?4:3});coinArc(gx,cyc-2,n,3);flat(2)},
    crumble(){zone('void','crumble');const n=rn(8,14),fl=cyc+9,gx=gapCols(n,fl);for(let i=0;i<n;i++)feats.push({x:gx+i,y:cyc,t:6});flat(2)},
    lava(){zone('void','lavagap');const n=rn(8,14),fl=cyc+9,gx=gapCols(n,fl);for(let i=0;i<n;i++)feats.push({x:gx+i,y:fl-1,t:4});for(let i=1;i<n-1;i+=4)plats.push({x:gx+i,y:cyc-1+(i%3===0?-1:0),w:3});flat(2)},
    floaters(){zone('void','floaters');const n=rn(24,40),fl=cyc+12,gx=gapCols(n,fl);for(let i=0;i<n;i++)feats.push({x:gx+i,y:fl-1,t:3});
      let px0=gx+1,py=cyc;while(px0<gx+n-3){const w=rn(3,5);plats.push({x:px0,y:py,w});coinArc(px0,py-2,w,1);if(R()<.4)spawn(rn(0,1)?3:1,px0*TS+8,(py-2)*TS);px0+=w+rn(3,4);py=clamp(py+rn(-2,2),cyc-5,cyc+3)}
      plats.push({x:gx+n-4,y:cyc,w:3});flat(2)},
    gates(){PC.floaters();const gx=x-2-30;for(let i=gx+3;i<x-8;i+=7)L.gates.push({x:i,y:cyc-7,h:6})},
    liftgap(){zone('void','liftgap');const n=rn(20,30),fl=cyc+12,gx=gapCols(n,fl);for(let i=0;i<n;i++)feats.push({x:gx+i,y:fl-1,t:3});
      L.lifts.push({x:gx*TS+4,y:cyc*TS-2,w:24,axis:'h',a:gx*TS+4,b:(gx+n-3)*TS,sp:40,ph:R()*6});coinArc(gx,cyc-3,n,2);flat(2)},
    updraft(){zone('void','updraft');const n=rn(20,26),fl=cyc+12,gx=gapCols(n,fl),hh=ship?9:14;for(let i=0;i<n;i++)feats.push({x:gx+i,y:fl-1,t:3});
      L.ups.push({x:(gx+Math.floor(n/2)-2)*TS,y:(cyc-hh)*TS,w:5*TS,h:(hh+12)*TS});plats.push({x:gx+Math.floor(n/2)-3,y:cyc-hh,w:7},{x:gx+1,y:cyc,w:3},{x:gx+n-4,y:cyc,w:3});chest(gx+Math.floor(n/2),cyc-hh-1,6+idx*3);flat(2)},
    open(){zone('void','open');const sv=curRH;curRH=0;const n=rn(36,56),fl=cyc+20,gx=gapCols(n,fl);
      let px0=gx+1,py=cyc,k=0;while(px0<gx+n-6){const w=rn(4,7);plats.push({x:px0,y:py,w});coinArc(px0,py-2,w,1);if(R()<.5)spawn(rn(0,1)?3:1,px0*TS+8,(py-3)*TS);if(R()<.3)chest(px0+2,py-1,7+idx*3);
        const pend=px0+w;k++;if(k%4===3&&pend+20<gx+n-6){L.lifts.push({x:(pend-1)*TS,y:py*TS-2,w:24,axis:'h',a:(pend-1)*TS,b:(pend+13)*TS,sp:36,ph:R()*6});px0=pend+16}else{px0=pend+rn(3,4);py=clamp(py+rn(-3,3),cyc-8,cyc+6);if(px0>gx+n-26)py+=Math.sign(cyc-py)*Math.min(2,Math.abs(cyc-py))}}
      plats.push({x:gx+n-5,y:cyc,w:4});for(let i=0;i<n;i+=3)feats.push({x:gx+i,y:fl-1,t:Wd.lava?4:3});flat(2);curRH=sv},
    springs(){zone('hills','springs');const n=rn(10,16),gx=x;flat(n);feats.push({x:gx+2,y:cyc,t:5});plats.push({x:gx+4,y:cyc-9,w:5},{x:gx+9,y:cyc-14,w:4});chest(gx+10,cyc-15,5+idx*3);groundSpawns(gx,n,cyc-1)},
    cliff(){zone('mountain','cliff');const hgt=rn(8,14),bx=x;flat(6);const nc=clamp(cyc-hgt,CLO(),CHI());L.lifts.push({x:(bx+3)*TS,y:cyc*TS,w:24,axis:'v',a:nc*TS,b:cyc*TS,sp:34,ph:R()*6});
      const od=cyc;cyc=nc;for(let i=0;i<4;i++)col(cyc);const x0=x;flat(rn(4,8));groundSpawns(x0,x-x0,cyc-1);if(cyc<SURF-6&&R()<.5){/* back down on stairs */}},
    ladderwall(){zone('mountain','ladderwall');const hgt=rn(9,14),nc=clamp(cyc-hgt,CLO(),CHI());if(nc>=cyc-3)return PC.flat();flat(5);const lx=x-1,od=cyc;cyc=nc;ladders.push({x:lx,y0:nc,y1:od-1});for(let i=0;i<4;i++)col(cyc);const x0=x;flat(rn(5,9));groundSpawns(x0,x-x0,cyc-1);if(R()<.5)chest(lx+2,cyc,4+idx*2)},
    tower(){zone('ruins','tower');const n=rn(12,16),tx=x+Math.floor(n/2)-2,th=ship||cavern?rn(6,9):rn(11,15);flat(n);
      feats.push({x:tx,y:cyc-th,t:1,w:4,h:th});let py=cyc-3,side=0;for(;;){plats.push({x:side?tx-8:tx-4,y:py,w:4});if(py<=cyc-th+3)break;py-=3;side^=1}
      chest(tx+1,cyc-th,5+idx*3);spawn(2,(tx+2)*TS,(cyc-th-1)*TS);groundSpawns(tx-6,14,cyc-1);deco(tx+2,cyc-th,'spire')},
    mezz(){zone('hall','mezz');const n=rn(26,34),gx=x;flat(n);for(let k=0;k<7;k++)feats.push({x:gx+2+k*2,y:cyc-1-k,t:1,w:2,h:k+1});feats.push({x:gx+16,y:cyc-8,t:1,w:n-18,h:2});
      for(let i=gx+18;i<gx+n-3;i+=3)L.coins.push({x:i*TS+4,y:(cyc-10)*TS,v:1});chest(gx+n-8,cyc-9,5+idx*3);spawn(R()<.5?0:3,(gx+22)*TS,(cyc-9)*TS);groundSpawns(gx+14,n-16,cyc-1)},
    spikes(){zone('cavern','spikes');const n=rn(18,28),gx=x;flat(n);for(let i=4;i<n-5;i+=rn(4,7)){const w=rn(2,3);for(let k=0;k<w;k++)feats.push({x:gx+i+k,y:cyc-1,t:3});coinArc(gx+i-1,cyc-2,w+2,3);i+=w}groundSpawns(gx,n,cyc-1)},
    nook(){zone('hills','nook');const n=rn(16,22),gx=x;flat(n);groundSpawns(gx,n,cyc-1);const cx=gx+Math.floor(n/2),s0=cyc;
      posts.push(()=>{const dep=rn(7,11),w=rn(8,11),x0n=cx-Math.floor(w/2);rect(cx,s0,2,dep,0);rect(x0n,s0+dep,w,4,0);for(let i=1;i<w-1;i+=2)L.coins.push({x:(x0n+i)*TS+4,y:(s0+dep+3)*TS,v:1+(idx>>1)});chest(x0n+w-3,s0+dep+4,8+idx*3);if(R()<.6)spawn([0,3,1][rn(0,2)],(x0n+2)*TS,(s0+dep+3)*TS);for(let y=s0;y<s0+dep;y++)S(cx,y,7);pockets.push({x0:x0n,x1:x0n+w,y0:s0+dep,y1:s0+dep+4,z:'cavern'})})},
    pocket(){zone('hills','pocket');const n=rn(30,44),zx=x;flat(n);groundSpawns(zx,n,cyc-1);const s=cyc;
      posts.push(()=>{const t1=s+9,x1=zx+3,x2=zx+n-3;rect(x1,t1,x2-x1,6,0);
        const shaft=(sx,rt,rb)=>{rect(sx,rt,3,rb-rt,0);L.lifts.push({x:sx*TS-4,y:rb*TS,w:32,axis:'v',a:rt*TS,b:rb*TS,sp:30,ph:R()*6})};shaft(zx+4,s,t1+6);shaft(zx+n-7,s,t1+6);
        for(let cx=x1+9;cx<x2-9;cx+=rn(7,10)){if(R()<.5)rect(cx,t1+3,2,3,1);else for(let i=0;i<3;i++)S(cx+i,t1+2,2)}
        for(let cx=x1+10;cx<x2-10;cx+=rn(6,9))L.coins.push({x:cx*TS+4,y:(t1+4)*TS,v:1+(idx>>1)},{x:(cx+1)*TS+4,y:(t1+4)*TS,v:1+(idx>>1)});
        for(let k=0;k<Math.round(Pm.dens*3);k++)spawn([0,3,4,1][k%4],rn(x1+10,x2-10)*TS,(t1+4)*TS);chest(x2-4,t1+5,6+idx*3);pockets.push({x0:x1,x1:x2,y0:t1,y1:t1+6,z:'cavern'});
        if(idx>=1&&n>36){const t2=t1+14;rect(x1+4,t2,x2-x1-8,6,0);shaft(Math.floor((x1+x2)/2),t1+6,t2+6);chest(x2-8,t2+5,12+idx*4);for(let cx=x1+9;cx<x2-9;cx+=rn(6,9))L.coins.push({x:cx*TS+4,y:(t2+4)*TS,v:2});pockets.push({x0:x1+4,x1:x2-4,y0:t2,y1:t2+6,z:'cavern'})}})},
    maze(){zone('hills','maze');const nc=rn(9,13),nr=rn(4,6),n=nc*4+16,zx=x;flat(n);groundSpawns(zx,n,cyc-1);const s=cyc;
      posts.push(()=>{const mx0=zx+8,my0=s+8,wall=(a,b,c,d)=>rect(a,b,c,d,0);
        for(let cy=0;cy<nr;cy++)for(let cx=0;cx<nc;cx++)rect(mx0+4*cx+1,my0+4*cy+1,3,3,0);
        const seen=Array.from({length:nr},()=>new Array(nc).fill(false)),deg=Array.from({length:nr},()=>new Array(nc).fill(0)),st=[[0,0]];seen[0][0]=true;
        const lk=[],open=(cx,cy,dx,dy)=>{lk.push([cx,cy,cx+dx,cy+dy]);if(dx){wall(mx0+4*(dx>0?cx+1:cx),my0+4*cy+1,1,3)}else{const up=dy<0,fy=my0+4*(up?cy:cy+1),bx=mx0+4*cx+1;wall(bx,fy,2,1);for(let q=0;q<4;q++)S(bx,fy+q,7)}};
        while(st.length){const [cx,cy]=st[st.length-1],nb=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>{const a=cx+dx,b=cy+dy;return a>=0&&b>=0&&a<nc&&b<nr&&!seen[b][a]});
          if(!nb.length){st.pop();continue}const [dx,dy]=nb[rn(0,nb.length-1)];seen[cy+dy][cx+dx]=true;open(cx,cy,dx,dy);deg[cy][cx]++;deg[cy+dy][cx+dx]++;st.push([cx+dx,cy+dy])}
        for(let k=0;k<nc*nr*.12;k++)open(rn(0,nc-2),rn(0,nr-1),1,0);
        /* two ladder shafts up to the surface, at the top left and top right cells */
        for(const cx of [0,nc-1]){const sx=mx0+4*cx+1;rect(sx,s,2,my0+4-s,0);for(let y=s;y<my0+4;y++)S(sx,y,7)}
        for(let cy=0;cy<nr;cy++)for(let cx=0;cx<nc;cx++){const bx=mx0+4*cx+2,by=my0+4*cy+3;
          if(deg[cy][cx]===1&&R()<.5&&G(bx,by+1)===1)chest(bx,by+1,6+idx*3);else if(R()<.04)L.gates.push({x:bx,y:my0+4*cy+1,h:3});else if(R()<.14)spawn(rn(0,3),bx*TS,by*TS);else if(R()<.25)L.coins.push({x:bx*TS+4,y:by*TS,v:1+(idx>>1)})}
        {const dep=Array.from({length:nr},()=>new Array(nc).fill(-1)),q=[[0,0],[nc-1,0]];dep[0][0]=0;dep[0][nc-1]=0;
          for(let h=0;h<q.length;h++){const [a,b]=q[h];for(const [x1,y1,x2,y2] of lk){let o=null;if(x1===a&&y1===b)o=[x2,y2];else if(x2===a&&y2===b)o=[x1,y1];if(o&&dep[o[1]][o[0]]<0){dep[o[1]][o[0]]=dep[b][a]+1;q.push(o)}}}
          let best=null;for(let cy=0;cy<nr;cy++)for(let cx=0;cx<nc;cx++)if(deg[cy][cx]===1&&dep[cy][cx]>=0&&(!best||dep[cy][cx]>best.d))best={d:dep[cy][cx],x:mx0+4*cx+2,y:my0+4*cy+3};
          if(best)L.mazeEnds.push(best)}
        pockets.push({x0:mx0,x1:mx0+4*nc,y0:my0,y1:my0+4*nr,z:'maze'})})},
    forest(){zone('forest','forest');const n=rn(36,60),x0=x,sv=curRH;if(!ship&&!cavern)curRH=R()<.4?18:0;
      for(let i=0;i<n;i++){const r=Math.round(2*Math.sin(i*.22)+1.5*(NZ.vn((x0+i)/6,2)-.5)*2);col(clamp(cyc+r,CLO(),CHI()))}
      cyc=top[x-1];curRH=sv;
      for(let lx=x0+6;lx<x0+n-6;lx+=rn(10,15)){const fl=top[lx];deco(lx,fl,idx===0&&R()<.5?'landmark':'tree');const cy=fl-rn(8,11);plats.push({x:lx-3,y:cy,w:7});if(R()<.4)chest(lx,cy-1,6+idx*3);else for(let q=-2;q<=3;q++)L.coins.push({x:(lx+q)*TS+4,y:(cy-2)*TS,v:1})}
      for(let lx=x0+3;lx<x0+n-3;lx+=rn(5,8))deco(lx,top[lx],R()<.5?'shroom':'bush');groundSpawns(x0,n,cyc-1)},
    lake(){zone('water','lake');if(idx===3)return PC.lava();const n=rn(34,52),x0=x,D=rn(9,16),wr=cyc+1;
      for(let i=0;i<n;i++){const d=Math.min(i-6,n-7-i);col(cyc+clamp(Math.floor(d/2),0,D))}
      for(let k=0;k<5;k++){const lx=x0+rn(10,n-10);deco(lx,top[lx],'weed');L.fish.push({x:lx*TS,y:(wr+rn(2,Math.max(3,top[lx]-wr-1)))*TS,vx:(R()<.5?-1:1)*rn(8,18),x0:(x0+8)*TS,x1:(x0+n-8)*TS,c:k%3})}
      lakes.push({x0,n,wr});
      for(let q=0;q<3;q++){const ix=x0+rn(12,n-14),iw=rn(4,8);for(let lx=ix;lx<ix+iw;lx++)plats.push({x:lx,y:wr+(q%2)-1,w:1})}
      for(let lx=x0+8;lx<x0+n-8;lx+=5)L.coins.push({x:lx*TS+4,y:(top[lx]-3)*TS,v:1+(idx>>1)});chest(x0+rn(12,n-12),top[x0+Math.floor(n/2)],8+idx*3);
      for(let k=0;k<3;k++)spawn(3,(x0+rn(10,n-10))*TS,(wr+4)*TS);flat(3)},
    mountain(){zone('mountain','mountain');const n=rn(60,90),x0=x,H=rn(14,24);
      for(let i=0;i<n;i++){const t=i/(n-1),r=-H*Math.pow(Math.sin(Math.PI*t),1.2)+4*(NZ.vn((x0+i)/7,5)-.5);col(clamp(Math.round(cyc+r),CLO()-18,CHI()))}
      const e=top[x-1];cyc=clamp(e,CLO(),CHI());
      for(let lx=x0+6;lx<x0+n-4;lx+=rn(7,12))deco(lx,top[lx],'spire');
      const px=x0+Math.floor(n/2)+rn(-8,8);plats.push({x:px,y:top[px]-rn(8,11),w:6});chest(px+2,top[px]-rn(8,11)-1,8+idx*3);groundSpawns(x0,n,cyc-1)},
    ruins(){zone('ruins','ruins');const n=rn(34,50),x0=x;flat(n);
      for(let lx=x0+6;lx<x0+n-8;lx+=rn(10,15)){const k=rn(0,3);if(k===0){deco(lx+5,cyc,'arch');deco(lx,cyc,'pillar')}else if(k===1){const w=rn(5,8);feats.push({x:lx,y:cyc-3,t:1,w,h:3});feats.push({x:lx+1,y:cyc-4,t:1,w:w-3,h:1});deco(lx+2,cyc-4,'statue')}else if(k===2){feats.push({x:lx,y:cyc-2,t:1,w:5,h:2});deco(lx+7,cyc,'glyph')}else{deco(lx,cyc,'glyph');deco(lx+6,cyc,'pillar')}}
      const hx=x0+rn(12,n-14),hf=cyc;posts.push(()=>{rect(hx,hf+1,2,8,0);for(let y=hf;y<hf+9;y++)S(hx,y,7);rect(hx-5,hf+9,14,5,0);for(let lx=hx-5;lx<hx+9;lx++)S(lx,hf+14,1);chest(hx+5,hf+14,10+idx*3);chest(hx-3,hf+14,8+idx*3);for(let lx=hx-4;lx<hx+8;lx+=3)L.coins.push({x:lx*TS+4,y:(hf+12)*TS,v:2});pockets.push({x0:hx-5,x1:hx+9,y0:hf+9,y1:hf+14,z:'ruins'})});
      groundSpawns(x0,n,cyc-1)},
    hall(){zone('hall','hall');const n=rn(30,50),x0=x,sv=curRH;curRH=rn(26,36);flat(n);curRH=sv;
      for(let lx=x0+8;lx<x0+n-8;lx+=rn(9,14)){if(ship||idx===4){const w=rn(6,9),h=rn(3,5);for(let q=0;q<h;q++){const ww=Math.max(2,w-q*2);feats.push({x:lx+Math.floor((w-ww)/2),y:cyc-1-q,t:1,w:ww,h:1})}deco(lx+w/2,cyc-h,idx===2&&R()<.4?'engine':idx===4&&R()<.4?'heart':'crate')}else{deco(lx,cyc,'pillar');feats.push({x:lx+5,y:cyc-3,t:1,w:4,h:3})}}
      for(let q=0;q<2;q++){const px=x0+rn(6,n-14);plats.push({x:px,y:cyc-10-q*8,w:rn(8,12)});if(R()<.6)chest(px+3,cyc-11-q*8,8+idx*3)}
      groundSpawns(x0,n,cyc-1)},
    chasm(deep,wide,spec){const D=deep?deep:rn(30,66),fl=cyc+D,n=spec?rn(spec==='caldera'?96:70,spec==='caldera'?116:90):wide?rn(36,52):deep?rn(16,24):rn(18,34),gx=x;zone('void',deep?'abyss':'chasm');
      const sv=curRH;gapCols(n,fl);curRH=sv;
      let kind=['bridge','platforms','lifts','updraft'][rn(0,3)];if((kind==='updraft'||spec)&&n>26)kind='bridge';const lava=!!Wd.lava,c0=cyc;
      ladders.push({x:gx,y0:c0,y1:fl-1});
      if(kind==='bridge'||deep){for(let i=1;i<n-1;){const run=rn(4,8);for(let k2=0;k2<run&&i<n-1;k2++,i++)plats.push({x:gx+i,y:c0,w:1,c:!!Wd.crumble&&R()<.35});i+=rn(2,3)}}
      else if(kind==='platforms'){let lx=gx+2,pd=0;while(lx<gx+n-5){const w=rn(4,7),dy=clamp(pd+rn(-1,1),-2,2);pd=dy;plats.push({x:lx,y:c0+dy,w});lx+=w+rn(3,4)}plats.push({x:gx+n-4,y:c0,w:3})}
      else if(kind==='lifts'){const segs=n>26?[[1,Math.floor(n/3)],[Math.floor(n/3)+3,Math.floor(2*n/3)],[Math.floor(2*n/3)+3,n-1]]:[[1,n-1]];segs.forEach(([a,b],k)=>{if(k%2===0)L.lifts.push({x:(gx+a)*TS,y:c0*TS-2,w:24,axis:'h',a:(gx+a)*TS,b:(gx+b-3)*TS,sp:44,ph:R()*6});else for(let i=a;i<b;i++)plats.push({x:gx+i,y:c0,w:1})})}
      else{L.ups.push({x:(gx+Math.floor(n/2)-2)*TS,y:(c0-13)*TS,w:5*TS,h:(13+D)*TS});plats.push({x:gx+Math.floor(n/2)-3,y:c0-13,w:7},{x:gx+1,y:c0,w:3},{x:gx+n-4,y:c0,w:3})}
      /* rest ledges and pockets down the walls: every ~18 rows */
      let sd=0;for(let r=c0+9;r<fl-6;r+=deep?18:11){if(!(spec==='caldera'&&sd))plats.push(sd?{x:gx+n-6,y:r,w:5}:{x:gx+2,y:r,w:5});if(R()<.35)chest(sd?gx+n-4:gx+3,r-1,5+idx*3+Math.floor((r-c0)/12));sd^=1}
      for(let r=c0+14;r<fl-8;r+=deep?22:13){plats.push({x:gx+Math.floor(n/2)-2,y:r,w:4});if(R()<.4)spawn(R()<.5?3:1,(gx+Math.floor(n/2))*TS,(r-3)*TS)}
      for(let i=0;i<Math.floor((fl-c0-6)/(deep?3:2));i++)L.coins.push({x:(gx+n/2+Math.sin(i*.4)*n*.28)*TS,y:(c0+3+i*(deep?3:2))*TS,v:1+(idx>>1)});
      for(let i=6;i<n;i++)if(((i>>2)&1)&&R()<.7)feats.push({x:gx+i,y:fl-1,t:lava?4:3});
      if(spec){const pw=spec==='reactor'?rn(14,18):spec==='heart'?rn(10,14):0,px_=gx+Math.floor(n/2)-Math.floor(pw/2),ptop=c0+rn(10,14);
        if(pw){feats.push({x:px_,y:ptop,t:1,w:pw,h:fl-ptop});ladders.push({x:px_-1,y0:c0,y1:ptop-1});ladders.push({x:px_+pw,y0:ptop,y1:fl-1});for(let q=0;q<pw;q+=3)L.coins.push({x:(px_+q)*TS+4,y:(ptop-3)*TS,v:3});chest(px_+3,ptop-1,22+idx*5);deco(px_+pw/2,ptop,spec==='heart'?'heart':'engine');
          L.glows.push({x:px_,y:ptop,w:pw,h:Math.min(40,fl-ptop),c:spec==='heart'?'#ff44aa':'#33ffff'});
          for(let r=ptop+10;r<fl-8;r+=11){plats.push({x:px_-7,y:r,w:6},{x:px_+pw+1,y:r+5,w:6});if(R()<.4)chest(px_-5,r-1,8+idx*4)}}
        else{ /* caldera: islands in the lava, basalt columns, lava falls down the right wall */
          for(let q=0;q<5;q++){const ix=gx+8+Math.floor(q*(n-16)/4)+rn(-3,3),iw=rn(7,12),iy=fl-rn(26,30);feats.push({x:ix,y:iy,t:1,w:iw,h:fl-iy});chest(ix+2,iy-1,12+idx*4);deco(ix+iw/2,iy,'spire');for(let t=0;t<iw;t+=3)L.coins.push({x:(ix+t)*TS+4,y:(iy-3)*TS,v:2})}
          for(let y=c0+6;y<fl-24;y++)feats.push({x:gx+n-1,y,t:4});L.falls.push({x:gx+n-1,y0:c0+6,y1:fl-24});
          for(let q=0;q<3;q++){const cx2=gx+rn(10,n-10);const cl=c0+rn(14,24);feats.push({x:cx2,y:cl,t:1,w:3,h:fl-cl-25});plats.push({x:cx2-2,y:cl-1,w:7});deco(cx2+1,cl-1,'spire')}}}
      if(wide&&!spec){const pw=rn(6,10),px_=gx+Math.floor(n/2)-Math.floor(pw/2),ptop=c0+rn(8,12);feats.push({x:px_,y:ptop,t:1,w:pw,h:fl-ptop});ladders.push({x:px_-1,y0:c0,y1:ptop-1});chest(px_+2,ptop-1,12+idx*4);for(let q=0;q<pw;q+=2)L.coins.push({x:(px_+q)*TS+4,y:(ptop-3)*TS,v:2});deco(px_+pw/2,ptop,'spire')}
      chest(gx+Math.floor(n/2)+(wide?-8:0),fl-1,(deep?30:10)+idx*4);
      if(deep){posts.push(()=>{
        /* the bottom: a wide cavern with its own look, treasure and a reward */
        const bw=rn(46,70),bx0=gx-Math.floor((bw-n)/2),bh=rn(18,26);rect(bx0,fl-bh,bw,bh,0);for(let lx=bx0;lx<bx0+bw;lx++)for(let y=fl;y<fl+3;y++)if(G(lx,y)!==1)S(lx,y,1);
        for(let lx=bx0;lx<bx0+bw;lx++){const h=Math.round(5*Math.max(0,NZ.vn(lx*.11,fl*.1)-.35)*2);for(let y=fl-bh;y<fl-bh+h;y++)S(lx,y,1)}
        for(let lx=bx0+6;lx<bx0+bw-6;lx+=rn(4,7)){deco(lx,fl,idx===3?'bush':R()<.5?'shroom':'weed');if(R()<.3)deco(lx+2,fl,'spire')}
        if(lava&&spec==='caldera')for(let lx=bx0-6;lx<bx0+bw+6;lx++)for(let y=fl-24;y<fl;y++)if(G(lx,y)===0&&lx>gx+1)S(lx,y,4);
        else if(lava)for(let lx=bx0+8;lx<bx0+bw-8;lx++){if(Math.abs(lx-gx-n/2)>5)for(let y=fl-3;y<fl;y++)if(G(lx,y)===0)S(lx,y,4);}
        else if(spec==='heart')for(let lx=bx0-4;lx<bx0+bw+4;lx++)for(let y=fl-16;y<fl;y++)if(G(lx,y)===0&&lx>gx+1)S(lx,y,10);
        else if(idx!==1)for(let lx=bx0+10;lx<bx0+bw-10;lx++)if(Math.abs(lx-gx-n/2)>7)for(let y=fl-4;y<fl;y++)if(G(lx,y)===0)S(lx,y,10);
        for(let q=0;q<4;q++){const px=rn(bx0+6,bx0+bw-14);rect(px,fl-rn(6,10),rn(5,9),1,2);}
        chest(bx0+4,fl-1,60+idx*14);chest(bx0+bw-6,fl-1,50+idx*12);for(let lx=bx0+4;lx<bx0+bw-4;lx+=3)L.coins.push({x:lx*TS+4,y:(fl-3)*TS,v:3});
        for(let k=0;k<4;k++)spawn(rn(0,4),(bx0+rn(8,bw-8))*TS,(fl-1)*TS);L.checks.push({x:(gx+Math.floor(n/2))*TS,y:fl*TS,on:0});
        L.glows.push({x:bx0+4,y:fl-bh,w:bw-8,h:bh,c:lava?'#ff4400':idx===4?'#ff44aa':'#33ffcc',deep:1});
        L.abyss.push({gx,n,fl,bx0,bw,bh,c0});
        pockets.push({x0:bx0,x1:bx0+bw,y0:fl-bh,y1:fl,z:'cavern'});pockets.push({x0:gx,x1:gx+n,y0:c0+10,y1:fl,z:'void'})
        /* hollow side caves along the walls, reachable by flying */
        for(let q=0;q<5;q++){const pr=rn(c0+20,fl-bh-6),side=q%2,w=rn(10,16);rect(side?gx+n:gx-w,pr,w,5,0);for(let lx=side?gx+n:gx-w;lx<(side?gx+n+w:gx);lx++)S(lx,pr+5,1);L.sideCaves.push({x:side?gx+n+w-6:gx-w+5,y:pr+4,side,fl});chest(side?gx+n+w-4:gx-w+3,pr+4,12+idx*4);for(let k=1;k<w-1;k+=3)L.coins.push({x:((side?gx+n:gx-w)+k)*TS+4,y:(pr+3)*TS,v:2})}})}
      cyc=c0;flat(2);L.kinds.push({k:deep?'abyss':'chasm',x:gx,y:fl,w:n,c0})},
    massif(){const H=idx>=2?Math.round(WPm.pk*rn(34,52)/100):Math.max(36,Math.round(WPm.pk*rn(idx===0?32:40,idx===0?58:75)/100));if(x+Math.round(H*3.2)+50>LW-90)return PC.peak();zone('mountain','massif');const sv=curRH;flat(4);const c0=cyc;curRH=0;let h=0;const gx=x;
      const stage=(dir)=>{let hh=dir>0?0:H;const hs=[];const blocky=ship||idx===2;while(dir>0?hh<H:hh>0){if(blocky){const r=Math.min(rn(4,6),dir>0?H-hh:hh);hh+=dir*r;const pl=rn(5,8);for(let i=0;i<pl;i++)hs.push(hh)}else{const r=Math.min(rn(5,10),dir>0?H-hh:hh);for(let i=0;i<r;i++){hh+=dir;hs.push(hh)}const pl=rn(3,6);for(let i=0;i<pl;i++)hs.push(hh)}}return hs};
      const up=stage(1),dn=stage(-1);for(const v of up)col(c0-v);const px0=x;const topW=rn(14,22);for(let i=0;i<topW;i++)col(c0-H);const px1=x;for(const v of dn)col(c0-v);
      cyc=c0;curRH=sv;
      /* plateaus: chests, spires or cargo, a spring now and then, and caves in the rock reached from a ledge */
      for(let xx=gx;xx<x;xx++){if(top[xx]!==top[xx+1]||top[xx]===c0)continue;if((xx-gx)%9===4&&R()<.5){deco(xx,top[xx],ship||idx===4?'crate':'spire');if(R()<.5)chest(xx+2,top[xx]-1,6+idx*3+Math.floor((c0-top[xx])/12))}}
      for(let q=0;q<4;q++){const xx=rn(gx+4,x-4);if(Math.abs(top[xx]-c0)>10&&top[xx]===top[xx+1])feats.push({x:xx,y:top[xx],t:5})}
      chest(px0+Math.floor(topW/2),c0-H-1,34+idx*10);chest(px0+2,c0-H-1,14+idx*4);for(let q=2;q<topW-2;q+=3)L.coins.push({x:(px0+q)*TS+4,y:(c0-H-3)*TS,v:3});deco(px0+topW/2,c0-H,ship?'pillar':'spire');L.checks.push({x:(px0+4)*TS,y:(c0-H)*TS,on:0});
      for(let k=0;k<Math.floor(H/14);k++)L.clouds.push({x:(gx+rn(-30,x-gx+30))*TS,y:(c0-rn(8,H+30))*TS,s:rn(0,2)});
      groundSpawns(gx,x-gx,c0-2);L.kinds.push({k:'peak',x:px0,y:c0-H,w:topW,h:H});flat(5)},
    peak(){const H=Math.max(40,Math.round(WPm.pk*rn(55,100)/100)),W=ship?rn(14,20):rn(22,34);zone('mountain','peak');const sv=curRH;
      const c0=cyc;flat(5);curRH=0;const gx=x,xl=gx-1;
      for(let i=0;i<W;i++)col(c0-H);cyc=c0;const xr=gx+W;for(let q=gx-3;q<=xr+3;q++)noCh[q]=1;
      const hasRoof=baseRH>0;
      /* ladder up the left face with rest shelves, ladder and lift down the right face */
      ladders.push({x:xl,y0:c0-H,y1:c0-1});
      for(let r=c0-14;r>c0-H+4;r-=14){feats.push({x:xl-5,y:r,t:1,w:5,h:2});if(R()<.4)chest(xl-3,r-1,6+idx*4+Math.floor((c0-r)/20))}
      ladders.push({x:xr,y0:c0-H,y1:c0-1});L.lifts.push({x:(xr+2)*TS,y:c0*TS,w:24,axis:'v',a:(c0-H)*TS,b:c0*TS,sp:62,ph:R()*6});
      /* a wind column beside the left ladder, thin air at the top and floating islands for the rocket pack */
      L.ups.push({x:(xl-9)*TS,y:(c0-H)*TS,w:4*TS,h:(H+2)*TS});feats.push({x:xl-5,y:c0-H,t:1,w:5,h:1});
      for(let k=0;k<5;k++){const iy=c0-rn(20,H-10),ix=gx+rn(-20,W+14),w=rn(5,9);if(Math.abs(ix-xl)<5)continue;plats.push({x:ix,y:iy,w});if(R()<.6)chest(ix+2,iy-1,10+idx*4);for(let q=0;q<4;q++)L.coins.push({x:(ix+q)*TS+4,y:(iy-3)*TS,v:2})}
      for(let k=0;k<Math.floor(H/16);k++)L.clouds.push({x:(gx+rn(-40,W+40))*TS,y:(c0-rn(10,H+30))*TS,s:rn(0,2)});
      chest(gx+Math.floor(W/2),c0-H-1,40+idx*12);chest(gx+3,c0-H-1,14+idx*4);for(let q=2;q<W-2;q+=3)L.coins.push({x:(gx+q)*TS+4,y:(c0-H-3)*TS,v:3});
      deco(gx+W/2,c0-H,ship?'pillar':'spire');L.checks.push({x:(gx+6)*TS,y:(c0-H)*TS,on:0});
      if(ship){for(let r=c0-9;r>c0-H;r-=10){feats.push({x:xr+1,y:r,t:1,w:7,h:1});}}
      curRH=sv;flat(6);L.kinds.push({k:'peak',x:gx,y:c0-H,w:W,h:H})}
  };
  /* ---------- the order of pieces: a few set pieces for tall peaks and deep abysses, the rest drawn from the pool ---------- */
  const sched=[];
  {const N=WPm.np+WPm.nd,kinds_=[];for(let k=0;k<WPm.np;k++)kinds_.push('peak');for(let k=0;k<WPm.nd;k++)kinds_.push('deep');for(let i=kinds_.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[kinds_[i],kinds_[j]]=[kinds_[j],kinds_[i]]}
   let f=.08+R()*.06;kinds_.forEach((p,i)=>{sched.push({f,p});f+=(.86/N)*(.6+R()*.8)});const mx=sched[sched.length-1].f;if(mx>.9)sched.forEach(q=>q.f=q.f*.9/mx)}
  if(idx===0||idx===4)sched.push({f:idx===0?.5:.33,p:'maze'});
  if(SPECS[idx])sched.push({f:idx===2?.5:idx===3?.46:.42,p:'spec'});
  sched.sort((a,b)=>a.f-b.f);
  {let i=0;for(const s of sched){if(i>0&&s.f-sched[i-1].f<.055)s.f=sched[i-1].f+.06;i++}}
  const pool=Object.entries(POOL[idx]);const recent=[];
  const pick=()=>{const e=pool.map(([k,w])=>[k,recent.includes(k)?w*(recent[recent.length-1]===k?0:.15):w]),t=e.reduce((s,q)=>s+q[1],0);let v=R()*t;for(const [k,w] of e){v-=w;if(v<=0)return k}return 'flat'};
  zone('hills','start');flat(14);L.start={x:3*TS,y:(cyc-2)*TS};L.checks.push({x:5*TS,y:cyc*TS,on:0});
  const PKV=[['massif','peak'],['peak','massif','peak'],['massif','massif','peak'],['massif','peak','massif'],['massif','massif','peak']];let pk_=0;
  let si=0;
  while(x<LW-70){
    const frac=x/LW;let k;
    if(si<sched.length&&frac>=sched[si].f){const s=sched[si++];if(s.p==='peak'){k=PKV[idx][pk_++%PKV[idx].length]}else if(s.p==='maze'){k='maze'}else if(s.p==='spec'){k='spec'}else{k='deep'}}else k=pick();
    const x0=x;
    if(idx>=2&&k!=='peak'&&k!=='massif'&&k!=='maze'&&k!=='hall'){const rr=R();curRH=rr<.3?0:rr<.5?rn(24,34):baseRH}
    if(k==='maze')PC.maze();
    else if(k==='spec')PC.chasm(Math.min(WPm.ab,rn(120,150)),true,SPECS[idx]);
    else if(k==='deep'){const dp=Math.round(WPm.ab*rn(60,100)/100);PC.chasm(Math.min(WPm.ab,Math.max(80,dp)),R()<.45)}
    else if(k==='chasm')PC.chasm();
    else PC[k]();
    if(k!=='deep'&&k!=='peak'&&k!=='massif'&&k!=='spec'){recent.push(k);if(recent.length>3)recent.shift()}
    /* a short link between pieces, then a beam pad now and then */
    if(x<LW-70){const m=rn(2,5);if(idx<2)cyc=clamp(cyc,CLO(),CHI());flat(m)}
    if(idx>=2&&x<LW-60&&Math.abs(cyc-elevAt(x))>6)PC.slope(elevAt(x)+rn(-2,2));
    if(x-lastCheck>46&&x<LW-80&&top[x-1]===cyc&&top[x-3]===cyc&&top[x-3]>=0){L.checks.push({x:(x-2)*TS,y:cyc*TS,on:0});lastCheck=x}
  }
  /* the end: the arena and the beacon */
  if(idx>=2&&Math.abs(cyc-elevAt(x))>5)PC.slope(elevAt(x));
  zone('hills','arena');curRH=baseRH;for(;x<LW;)col(cyc);
  L.exit={x:(LW-14)*TS,y:cyc*TS,open:0};L.endRow=cyc;L.guardian={x:(LW-20)*TS,y:(cyc-1)*TS};
  /* ---------- fill the world ---------- */
  const roofRow=new Int16Array(LW).fill(-1);
  {let lastT=SURF;for(let i=0;i<LW;i++){if(top[i]>=0)lastT=top[i];if(rh[i]>0){const jit=cavern?Math.round(NZ.fbm(i*.06,5,2)*9)-4:0;roofRow[i]=lastT-rh[i]-jit}}
    for(let pass=0;pass<4;pass++){for(let i=1;i<LW;i++)if(roofRow[i]>=0&&roofRow[i-1]>=0){if(roofRow[i]>roofRow[i-1]+2)roofRow[i]=roofRow[i-1]+2;else if(roofRow[i]<roofRow[i-1]-2)roofRow[i]=roofRow[i-1]-2}
      for(let i=LW-2;i>=0;i--)if(roofRow[i]>=0&&roofRow[i+1]>=0){if(roofRow[i]>roofRow[i+1]+2)roofRow[i]=roofRow[i+1]+2;else if(roofRow[i]<roofRow[i+1]-2)roofRow[i]=roofRow[i+1]-2}}
    /* clearance over the ground */
    for(let i=0;i<LW;i++)if(roofRow[i]>=0){let m=1e9;for(let q=-6;q<=6;q++){const c=i+q;if(c>=0&&c<LW){const t=top[c]>=0?top[c]:(floorAt[c]>0?Math.min(SURF+10,floorAt[c]):1e9);if(top[c]>=0&&t<m)m=t}}if(m<1e9&&roofRow[i]>m-9)roofRow[i]=m-9}}
  const TH=ship?10:cavern?26:8;
  for(let i=0;i<LW;i++){const f=top[i]>=0?top[i]:floorAt[i];for(let y=f;y<LH;y++)g[y*LW+i]=1;if(roofRow[i]>=0)for(let y=Math.max(0,roofRow[i]-TH+1);y<=roofRow[i];y++)g[y*LW+i]=1}
  for(let y=0;y<LH;y++){S(0,y,1);S(1,y,1);S(LW-1,y,1);S(LW-2,y,1)}
  for(const f of feats){if(f.w)rect(f.x,f.y,f.w,f.h,f.t);else S(f.x,f.y,f.t)}
  for(const p of plats)for(let i=0;i<p.w;i++)if(G(p.x+i,p.y)===0)S(p.x+i,p.y,p.c?6:2);
  /* lakes: fill the basins with water */
  for(const lk of lakes)for(let i=0;i<lk.n;i++){const cx=lk.x0+i;for(let y=lk.wr;y<LH&&G(cx,y)===0;y++)S(cx,y,10)}
  for(const ld of ladders)for(let yy=ld.y0;yy<=ld.y1;yy++){const t=G(ld.x,yy);if(t===0||t===2)S(ld.x,yy,7)}
  for(const p of posts)p();
  /* ---------- big cave systems beside the abysses, joined to the ladder wall by a short tunnel ---------- */
  {const sys=idx===0?5:8;let made=0;for(let att=0;att<sys*6&&made<sys&&L.abyss.length;att++){const k=made;const a=L.abyss[att%L.abyss.length];const side=0;
      /* the ladder is on the left wall, so the tunnel always ends there */
      const cx=a.gx-rn(34,70),cy=rn(a.c0+30,Math.max(a.c0+32,a.fl-40));if(cx<24||cy<SURF+20||cy>LH-30)continue;
      const parts=[];let px_=cx,py_=cy;const np_=rn(7,11);let ok=true;
      for(let q=0;q<np_;q++){const rx=rn(7,17),ry=rn(4,9);parts.push({x:px_,y:py_,rx,ry});px_+=rn(-14,10);py_+=rn(-7,7);px_=clamp(px_,20,a.gx-12);py_=clamp(py_,SURF+20,LH-24)}
      /* keep clear of other things: all parts must lie in solid rock */
      for(const p of parts){for(let jj=-p.ry-1;jj<=p.ry+1&&ok;jj+=3)for(let ii=-p.rx-1;ii<=p.rx+1;ii+=4)if(G(p.x+ii,p.y+jj)!==1){ok=false;break}if(!ok)break}
      if(!ok)continue;
      let minY=1e9,maxY=-1,maxX=-1;const hole=B.mkNoise(900+idx*13+k);
      for(const p of parts){for(let jj=-p.ry;jj<=p.ry;jj++)for(let ii=-p.rx;ii<=p.rx;ii++){const d=ii*ii/(p.rx*p.rx)+jj*jj/(p.ry*p.ry)+(hole.vn((p.x+ii)*.25,(p.y+jj)*.25)-.5)*.5;if(d<1)S(p.x+ii,p.y+jj,0)}
        for(let ii=-Math.floor(p.rx*.7);ii<=Math.floor(p.rx*.7);ii++){S(p.x+ii,p.y+p.ry-1,1);S(p.x+ii,p.y+p.ry,1)}
        minY=Math.min(minY,p.y-p.ry);maxY=Math.max(maxY,p.y+p.ry);maxX=Math.max(maxX,p.x+p.rx)}
      /* chain the parts together with short walkways at floor level and a tunnel to the abyss wall */
      for(let q=1;q<parts.length;q++){const A_=parts[q-1],B_=parts[q],y1=Math.min(A_.y+A_.ry-2,B_.y+B_.ry-2);for(let xx=Math.min(A_.x,B_.x);xx<=Math.max(A_.x,B_.x);xx++){for(let yy=y1-5;yy<=y1;yy++)S(xx,yy,0)}for(let xx=Math.min(A_.x,B_.x);xx<=Math.max(A_.x,B_.x);xx++)S(xx,y1+1,G(xx,y1+1)===0?1:G(xx,y1+1))}
      const last=parts.reduce((m,p)=>p.x>m.x?p:m,parts[0]),ty=last.y+last.ry-2;for(let xx=last.x;xx<a.gx;xx++){for(let yy=ty-5;yy<=ty;yy++)S(xx,yy,0);if(G(xx,ty+1)===0)S(xx,ty+1,1)}
      /* life, treasure and hazards */
      parts.forEach((p,q)=>{const fy=p.y+p.ry-2;if(q%2===0)chest(p.x,fy+1,14+idx*5+(k<1?0:4));for(let ii=-p.rx+3;ii<=p.rx-3;ii+=3)L.coins.push({x:(p.x+ii)*TS+4,y:(fy-1)*TS,v:2});
        deco(p.x-2,fy+1,R()<.5?'shroom':'weed');deco(p.x+3,fy+1,idx===3?'bush':'shroom');spawn(rn(0,4),(p.x+rn(-p.rx+3,p.rx-3))*TS,fy*TS);
        if(R()<.4){plats.push({x:p.x-3,y:fy-6,w:6});chest(p.x,fy-7,8+idx*4)}
        if(q===1&&Wd.lava)for(let ii=-p.rx+4;ii<=p.rx-4;ii++)for(let yy=fy-1;yy<=fy;yy++)if(G(p.x+ii,yy)===0)S(p.x+ii,yy,4);
        else if(q===1&&idx!==1)for(let ii=-p.rx+4;ii<=p.rx-4;ii++)for(let yy=fy-2;yy<=fy;yy++)if(G(p.x+ii,yy)===0)S(p.x+ii,yy,10);
        pockets.push({x0:p.x-p.rx,x1:p.x+p.rx,y0:p.y-p.ry,y1:p.y+p.ry,z:'cavern'})});
      L.glows.push({x:last.x-4,y:last.y-2,w:8,h:4,c:'#ffffcc',hint:1});L.kinds.push({k:'cavesys',x:cx,y:cy,w:maxX-cx});made++}}
  /* ---------- below the ground: swiss cheese holes, deep closed caves and cave rooms with a ladder shaft down ---------- */
  {const nzc=B.mkNoise(70+idx),blobs=[],nb=Math.floor(LW/1.7);
    for(let k=0;k<nb;k++){const cx=rn(12,LW-14),rx=rn(2,6),ry=rn(2,5);let ok=true;for(let i=-rx-2;i<=rx+2;i++){const c=cx+i;if(c<0||c>=LW||top[c]<0||Math.abs(top[c]-top[cx])>1||noCh[c]){ok=false;break}}
      if(!ok)continue;const s=top[cx],cyb=s+rn(ry+4,26+ry);if(cyb+ry+3>=LH-2||cx<22||cx>LW-26)continue;
      for(let j=-ry-1;j<=ry+1;j++)for(let i=-rx-1;i<=rx+1;i++){const d=(i*i)/(rx*rx)+(j*j)/(ry*ry)+(nzc.vn(cx+i*.7,cyb+j*.7)-.5)*.5;if(d<1&&G(cx+i,cyb+j)===1)S(cx+i,cyb+j,0)}blobs.push({cx,cy:cyb,rx,ry,s})}
    for(let i=1;i<blobs.length;i++){const a=blobs[i-1],b=blobs[i];if(Math.abs(a.cx-b.cx)<24&&Math.abs(a.cy-b.cy)<9&&R()<.6){const x0b=Math.min(a.cx,b.cx),x1b=Math.max(a.cx,b.cx);let okt=true;for(let c=x0b;c<=x1b;c++)if(top[c]<0)okt=false;if(okt){rect(x0b,a.cy,x1b-x0b+1,2,0);const y0b=Math.min(a.cy,b.cy),y1b=Math.max(a.cy,b.cy);rect(b.cx,y0b,2,y1b-y0b+2,0)}}}
    for(const b of blobs){const depth=b.cy-b.ry-b.s;if(R()<.35&&depth<=13){rect(b.cx-1,b.s,3,depth+1,0);let sl=0;for(let y=b.s+3;y<b.cy-b.ry+1;y+=4){S(b.cx+(sl?-1:0),y,2);S(b.cx+(sl?0:1),y,2);sl^=1}
        for(let i=0;i<3+rn(0,3);i++)L.coins.push({x:(b.cx+rn(-b.rx+1,b.rx-1))*TS+4,y:(b.cy+b.ry-1)*TS,v:1});if(R()<.3)chest(b.cx,b.cy+b.ry,4+idx*2)}}
    /* deep closed caves */
    for(let k=0;k<Math.floor(LW*(LH-SURF)/6500);k++){const cx=rn(14,LW-14),rx=rn(3,9),ry=rn(2,6),cyb=rn(SURF+34,LH-12);for(let j=-ry-1;j<=ry+1;j++)for(let i=-rx-1;i<=rx+1;i++){const d=(i*i)/(rx*rx)+(j*j)/(ry*ry)+(nzc.vn(cx+i*.7,cyb+j*.7)-.5)*.5;if(d<1&&G(cx+i,cyb+j)===1)S(cx+i,cyb+j,0)}}
    /* cave rooms below flat ground */
    for(let k=0,tries=0;k<Math.floor(LW/110)&&tries<100;tries++){const cx=rn(30,LW-40);let ok=true;for(let i=-1;i<=4;i++)if(top[cx+i]<0||top[cx+i]!==top[cx]||G(cx+i,top[cx]-1)!==0||G(cx+i,top[cx])!==1)ok=false;if(!ok)continue;
      const s=top[cx],dep=rn(22,Math.min(80,LH-s-30)),w=rn(16,30),h=rn(8,12),x0=cx-rn(2,w-4),y0=s+dep;
      let clear=true;for(let yy=y0-2;yy<y0+h+3&&clear;yy+=2)for(let xx=x0-1;xx<x0+w+1;xx+=3)if(G(xx,yy)!==1){clear=false;break}if(!clear)continue;
      rect(cx,s,2,dep,0);for(let y=s;y<y0;y++)S(cx,y,7);rect(x0,y0,w,h,0);for(let q=x0;q<x0+w;q++)S(q,y0+h,1);
      const tag=R();for(let q=x0+3;q<x0+w-3;q+=3)L.coins.push({x:q*TS+4,y:(y0+h-2)*TS,v:2});chest(x0+w-4,y0+h,10+idx*4);if(R()<.6)chest(x0+3,y0+h,8+idx*3);
      if(tag<.3&&Wd.lava){for(let q=x0+5;q<x0+w-8;q++)for(let y=y0+h-2;y<y0+h;y++)S(q,y,4)}else if(tag<.5&&idx!==1){for(let q=x0+4;q<x0+w-6;q++)for(let y=y0+h-3;y<y0+h;y++)S(q,y,10)}
      for(let q=0;q<2;q++)spawn(rn(0,4),(x0+rn(4,w-4))*TS,(y0+h-1)*TS);for(let q=x0+2;q<x0+w-2;q+=rn(4,7))deco(q,y0+h,R()<.5?'shroom':'weed');
      pockets.push({x0,x1:x0+w,y0,y1:y0+h,z:'cavern'});k++}
  }
  /* ---------- hidden islands: small floating scenes with a reward, out in the voids, inside chasms and high above ---------- */
  {const want=idx===0?rn(4,5):rn(6,8),spots=[],kindsC=L.kinds.filter(k=>k.k==='chasm'||k.k==='abyss'),peaks=L.kinds.filter(k=>k.k==='peak');
    const clearBox=(x0,y0,w,h)=>{for(let y=y0;y<y0+h;y++)for(let xx=x0;xx<x0+w;xx++)if(G(xx,y)!==0)return false;return true};
    const far=(ix,iy)=>spots.every(s=>Math.abs(s.x-ix)+Math.abs(s.y-iy)>50);
    for(let tries=0;tries<2000&&spots.length<want;tries++){
      const r=R();let ix,iy,kind;
      if(r<.4&&kindsC.length){const c=kindsC[rn(0,kindsC.length-1)];if(c.w<18)continue;ix=c.x+Math.floor(c.w/2)+rn(-3,3);iy=rn((c.c0||SURF)+14,c.y-16);kind='chasm'}
      else if(r<.65&&peaks.length){const p=peaks[rn(0,peaks.length-1)];ix=p.x+(R()<.5?rn(-12,2):rn(p.w-2,p.w+12));iy=p.y-rn(6,22);kind='high'}
      else{ix=rn(60,LW-80);const t=top[ix];if(t<0)continue;iy=t-rn(15,22);kind='sky'}
      if(iy<8||ix<20||ix>LW-30||!far(ix,iy))continue;
      const rx=rn(4,6);if(!clearBox(ix-rx-3,iy-12,rx*2+7,20))continue;
      spots.push({x:ix,y:iy,k:kind,top0:iy-2,rx});
      /* the island */
      for(let jj=-2;jj<=2;jj++)for(let ii=-rx;ii<=rx;ii++)if(ii*ii/(rx*rx)+jj*jj/5<=1&&G(ix+ii,iy+jj)===0)S(ix+ii,iy+jj,1);
      for(let ii=-rx+1;ii<rx;ii++)S(ix+ii,iy+2,G(ix+ii,iy+2)===0&&R()<.5?1:G(ix+ii,iy+2));
      const sc=rn(0,4),top0=iy-2;
      deco(ix,top0,sc===0?'tree':sc===1?'statue':sc===2?'arch':sc===3?'crate':'shroom');
      if(sc===2||sc===1)deco(ix+3,top0,'glyph');if(sc===0||sc===4){deco(ix-3,top0,'bush');deco(ix+3,top0,'shroom')}
      chest(ix+rx-2,top0,40+idx*12);if(R()<.5)chest(ix-rx+1,top0,25+idx*8);
      for(let q=-2;q<=2;q++)L.coins.push({x:(ix+q*2)*TS+4,y:(top0-3)*TS,v:3});
      if(R()<.5)L.checks.push({x:(ix+1)*TS,y:(top0+1)*TS,on:0});
      L.glows.push({x:ix-rx,y:top0-5,w:rx*2,h:5,c:'#ffffaa',hint:1});
      /* a faint trail of coins leading toward it */
      for(let q=1;q<=4;q++)L.coins.push({x:(ix-rx-q*3)*TS+4,y:(top0-1-q)*TS,v:1});
      if(kind==='sky'&&R()<.45&&top[ix]>=0){const wy=top0+2;L.ups.push({x:(ix+rx+2)*TS,y:wy*TS,w:3*TS,h:Math.max(8,top[ix+rx+2]>=0?top[ix+rx+2]-wy:20)*TS})}
      else if(R()<.3&&top[ix]>=0){const sx2=ix+rx+4;if(top[sx2]>=0&&Math.abs(top[sx2]-top0)<30){plats.push({x:sx2,y:top0+4,w:3});}}
      pockets.push({x0:ix-rx-4,x1:ix+rx+4,y0:iy-12,y1:iy+6,z:'hills'});
    }
    L.hidden=spots}

  /* ---------- the lower map: designed rooms joined by corridors and ladders, instead of solid rock ---------- */
  const sstepf=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
  const bbN=B.mkNoise(410+idx);
  const bb=xx=>{const f=clamp(xx/LW,0,1),el=elevAt(xx);let T;if(idx<2){const e=Math.sqrt(Math.max(0,1-Math.pow((f-.5)/.5,2)));return el+(idx===0?60+120*e:90+130*e)+10*(bbN.fbm(xx*.02,9,2)-.5)}
    if(idx===2){T=142+12*(bbN.fbm(xx*.011,3,2)-.5)*2;if(f<.16)T=34+(T-34)*sstepf(f/.16);if(f>.93)T=Math.max(62,T-(f-.93)/.07*50);
      T+=22*sstepf(clamp((f-.36)/.04,0,1))*(1-sstepf(clamp((f-.64)/.04,0,1)));   /* a deeper keel in the middle */
      if(f>.8)T-=78*Math.pow((f-.8)/.2,1.7);   /* the bow narrows to a point */
      for(const bx of [.21,.27,.33]){const d=Math.abs(xx-bx*LW);if(d<12)T+=Math.round(86*Math.min(1,(12-d)/2))}}   /* three engine pods hang under the stern */
    else if(idx===3){T=165+30*(bbN.fbm(xx*.006,7,3)-.5)*2;if(f<.05)T=40+(T-40)*sstepf(f/.05);if(f>.95)T=Math.max(60,T-(f-.95)/.05*100)}
    else{const e=Math.sqrt(Math.max(0,1-Math.pow((f-.5)/.5,2)));T=60+215*e+16*(bbN.fbm(xx*.02,9,2)-.5);if(e>.25)T+=20*(Math.abs(Math.sin(xx*PI/56))-.55)}   /* ribs: the underside is scalloped like a shell */
    return el+T};
  const FK=[{cw:46,ch:30,k:'cave'},{cw:50,ch:32,k:'cave'},{cw:48,ch:28,k:'deck'},{cw:52,ch:34,k:'cave'},{cw:44,ch:36,k:'hex'}][idx];
  const rooms=[],ports=[],byRow={};
  {const Y0=SURF-Math.round(upMax)+36,nj=Math.ceil((LH-Y0)/FK.ch)+1;
   const dk=idx===0?['shroom','bush','weed']:idx===1?['spire','bush','weed']:idx===2?['crate','pillar','porthole']:idx===3?['spire','bush','pillar']:['egg','shroom','rib'];
   for(let j=0;j<nj;j++){const y1=Y0+j*FK.ch;if(y1>LH-16)break;
    let skipI=-99;
    for(let i=-1;i<Math.ceil(LW/FK.cw)+1;i++){
      if(i===skipI)continue;
      const off=(FK.k==='hex'&&j%2)?FK.cw/2:FK.k==='deck'?Math.round(((j*.382)%1)*FK.cw):0,cx0=Math.round(i*FK.cw+FK.cw/2+off+rn(-3,3));
      const roll=R(),variant=roll<.2?'wide':roll<.34?'tall':'norm';
      let w=Math.round(FK.cw*(.78+R()*.12)),h=rn(Math.round(FK.ch*.6),Math.round(FK.ch*.76)),cx=cx0;
      if(variant==='wide'){w=Math.round(FK.cw*(1.7+R()*.15));cx=cx0+Math.round(FK.cw/2)}
      else if(variant==='tall'){h=Math.round(FK.ch*(1.35+R()*.3))}
      const x0=cx-(w>>1),yt=y1-h;
      if(x0<12||x0+w>LW-12)continue;
      let ok=true;for(let xx=x0;xx<x0+w;xx+=4){const t=top[xx]>=0?top[xx]:elevAt(xx);if(yt<t+16||y1+8>bb(xx)){ok=false;break}}
      if(!ok)continue;let sol=0,tot=0;for(let yy=yt-3;yy<=y1+3;yy+=3)for(let xx=x0-3;xx<=x0+w+3;xx+=3){tot++;if(G(xx,yy)===1)sol++}
      if(sol<tot*.97)continue;
      if(variant==='wide')skipI=i+1;
      const r={i,j,cx,x0,w,h,yt,y1,hh:[],variant};
      for(let q=0;q<w;q++){const xx=x0+q,u=(xx-cx)/(w/2);let hh;
        if(FK.k==='deck')hh=h;else if(FK.k==='hex')hh=Math.round(h*(1-.4*Math.max(0,(Math.abs(u)-.5)/.5)));else hh=Math.round(h*(.5+.5*Math.sqrt(Math.max(0,1-u*u)))+2*(NZ.vn(xx*.2,y1*.3)-.5));
        hh=clamp(hh,5,h);r.hh.push(hh);for(let y=y1-hh;y<y1;y++)S(xx,y,0)}
      /* contents */
      const nest=FK.k==='hex'&&R()<.3,flood=(idx===2||idx===4||idx===0)&&j>0&&R()<(idx===0?.22:.4)&&!nest,lavaP=idx===3&&R()<.5;
      if(flood){const fd=idx===0?4:Math.min(h-6,4+((x0*7+j*3)%6));for(let q=0;q<w;q++)for(let y=y1-fd;y<y1;y++)if(G(x0+q,y)===0)S(x0+q,y,10)}
      else if(lavaP){const lw_=rn(5,8),lx=cx+rn(-7,1);for(let q=0;q<lw_;q++){S(lx+q,y1-1,4);S(lx+q,y1,4);S(lx+q,y1+1,4);S(lx+q,y1+2,1)}}
      if(FK.k==='deck'){for(let q=0;q<2;q++){const px_=x0+rn(4,Math.max(5,w-14)),pw=rn(7,11);for(let t=0;t<pw;t++)if(G(px_+t,y1-5)===0)S(px_+t,y1-5,2);if(R()<.5)chest(px_+3,y1-5,8+idx*3)}
        for(let q=0;q<2;q++){const bx_=x0+rn(3,w-9),bw_=rn(4,6),bh_=rn(2,3);if(!flood)for(let t=0;t<bh_;t++)rect(bx_+t,y1-1-t,Math.max(2,bw_-t*2),1,1)}}
      else{for(let q=0;q<2;q++){const px_=x0+rn(3,Math.max(4,w-12)),pw=rn(6,9);for(let t=0;t<pw;t++)if(G(px_+t,y1-5)===0&&r.hh[clamp(px_+t-x0,0,w-1)]>7)S(px_+t,y1-5,2);if(R()<.45)chest(px_+3,y1-5,8+idx*3)}
        for(let q=0;q<3;q++){const mx=x0+rn(3,w-8),mw=rn(4,7),mh=rn(1,3);if(!flood&&!lavaP)for(let t=0;t<mw;t++){const hgt=Math.round(mh*Math.sin(t/(mw-1)*Math.PI));if(hgt>0)rect(mx+t,y1-hgt,1,hgt,1)}}}
      if(variant==='tall'){for(let q=1;q<=2;q++){const py2=y1-5-q*7,px2=x0+rn(3,Math.max(4,w-12)),pw2=rn(7,10);for(let t=0;t<pw2;t++)if(G(px2+t,py2)===0)S(px2+t,py2,2);chest(px2+3,py2,10+idx*4);for(let t=0;t<pw2;t+=3)L.coins.push({x:(px2+t)*TS+4,y:(py2-2)*TS,v:2})}}
      if(variant==='wide'){for(let q=0;q<3;q++){const px2=x0+rn(4,Math.max(5,w-14)),pw2=rn(6,9);for(let t=0;t<pw2;t++)if(G(px2+t,y1-6)===0)S(px2+t,y1-6,2);if(R()<.6)chest(px2+3,y1-6,9+idx*4)}}
      for(let lx=x0+4;lx<x0+w-4;lx+=4)L.coins.push({x:lx*TS+4,y:(y1-2)*TS,v:1+(idx>>1)});
      if(R()<.5)chest(cx+rn(-w/3,w/3)|0,y1,6+idx*3+(j>>1)*2);
      for(let k=0;k<Math.round(w/9*Pm.dens*.7);k++)spawn(rn(0,4),(x0+rn(4,w-4))*TS,(y1-1)*TS);
      for(let k=0;k<3;k++)deco(x0+rn(3,w-3),y1,nest&&k<2?'egg':dk[rn(0,2)]);
      if(nest){for(let q=0;q<5;q++)deco(x0+rn(3,w-3),y1,'egg');chest(cx,y1,16+idx*5)}
      pockets.push({x0,x1:x0+w,y0:yt,y1,z:idx===2?'hall':idx===4&&nest?'ruins':'cavern'});
      rooms.push(r);(byRow[j]=byRow[j]||[]).push(r);ports.push({x:cx,y:y1-1});
    }}
  }
  /* corridors: every room joins its neighbours through a short tunnel (to the side) or a ladder shaft (above and below) */
  {const par=new Map();rooms.forEach(r=>par.set(r,r));const fd=a=>{while(par.get(a)!==a){par.set(a,par.get(par.get(a)));a=par.get(a)}return a};
   const edges=[];
   for(const r of rooms){const rr=(byRow[r.j]||[]).find(q=>q.i===r.i+1);if(rr&&rr.x0-(r.x0+r.w)<FK.cw*.7)edges.push({a:r,b:rr,t:'h'});
     for(const q of (byRow[r.j+1]||[])){const lo=Math.max(r.x0,q.x0)+4,hi=Math.min(r.x0+r.w,q.x0+q.w)-4;if(hi-lo>=6)edges.push({a:r,b:q,t:'v',x:rn(lo,hi-2)})}}
   for(let i=edges.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[edges[i],edges[j]]=[edges[j],edges[i]]}
   for(const e of edges){const ra=fd(e.a),rb=fd(e.b),join=ra!==rb;if(!join&&R()>.28&&!(FK.k==='deck'&&e.t==='h'))continue;if(join)par.set(ra,rb);
     if(e.t==='h'){const y1=e.a.y1,ch_=FK.k==='deck'?7:5;for(let xx=e.a.cx;xx<=e.b.cx;xx++){for(let y=y1-ch_;y<y1;y++){const t=G(xx,y);if(t===1)S(xx,y,0)}if(G(xx,y1)!==1&&G(xx,y1)!==7)S(xx,y1,1)}}
     else{const xs=e.x;for(let y=e.a.y1;y<e.b.y1;y++){S(xs,y,7);S(xs+1,y,0)}}}}
  /* a shaft from the surface to some of the top rooms, with a ladder */
  for(const r of rooms){if(R()>.3)continue;if(rooms.some(q=>q.i===r.i&&q.j<r.j&&Math.abs(q.cx-r.cx)<6))continue;const xs=r.cx+rn(-6,6);const t=top[xs];if(t<0||t>=r.yt-3||rh[xs]>0&&false)continue;
    let clear=true;for(let y=t;y<r.yt;y++)if(G(xs,y)!==1&&y>t||G(xs+1,y)!==1&&y>t){clear=false;break}if(!clear||G(xs,t-1)!==0)continue;
    for(let y=t;y<=r.y1-1;y++){S(xs,y,7);if(y>t&&y<r.yt)S(xs+1,y,0)}}
  /* ---------- cavern reshape: irregular, multi level caverns instead of wide flat rooms ---------- */
  const shapedChests=[];L.shapeStats={rooms:rooms.length,k:0,hill:0,pit:0,isl:0,bay:0,shaped:0};
  {const RS=rng(7300+idx*53),rs=(a,b)=>a+Math.floor(RS()*(b-a+1));
   const settleRow=(tx,ty)=>{let r=ty,n=0;while(n++<14&&r>3&&G(tx,r)!==0&&G(tx,r)!==7&&G(tx,r)!==10)r--;n=0;while(n++<14&&r<LH-3&&G(tx,r+1)===0)r++;return r};
   const wetR=(r)=>{for(let x=r.x0;x<r.x0+r.w;x+=2)for(let y=r.y1-4;y<=r.y1+1;y++){const t=G(x,y);if(t===10||t===4)return true}return false};
   {const big=rooms.filter(r=>r.w>=34&&r.h>=17);for(let i=big.length-1;i>0;i--){const j=Math.floor(RS()*(i+1));[big[i],big[j]]=[big[j],big[i]]}const okRun=r=>{let best=0,a=0;for(const h of r.hh){if(h>=13){a++;best=Math.max(best,a)}else a=0}return best>=24?1:0};big.sort((a,b)=>okRun(b)-okRun(a));big.slice(0,9).forEach(r=>r.reserve=true)}
   const wetMap=new Map();for(const r of rooms)wetMap.set(r,wetR(r));
   /* K: wide chimneys with zig zag ledges join some rooms to the room below, so the caverns run several levels deep */
   for(const a of rooms){if(a.reserve||wetMap.get(a))continue;for(const b of (byRow[a.j+1]||[])){if(b.reserve||wetMap.get(b)||RS()>.8)continue;
     const lo=Math.max(a.x0,b.x0)+5,hi=Math.min(a.x0+a.w,b.x0+b.w)-5;if(hi-lo<9)continue;const w=rs(5,7);let xs=0,ok=false;
     for(let tr=0;tr<8&&!ok;tr++){xs=rs(lo,hi-w-1);if(Math.abs(a.cx-(xs+w/2))<w/2+2||Math.abs(b.cx-(xs+w/2))<w/2+2)continue;ok=true;for(let y=a.y1;y<=b.y1&&ok;y++)for(let x=xs-1;x<=xs+w&&ok;x++){const t=G(x,y);if(t===7||t===10||t===4)ok=false}}
     if(!ok)continue;
     for(let y=a.y1;y<b.y1;y++)for(let x=xs;x<xs+w;x++){if(G(x,y)===1)S(x,y,0)}
     let k=0;for(let y=b.y1-4;y>a.y1+3;y-=4,k++){const l=k&1;for(let q=0;q<4;q++){const x=l?xs+w-1-q:xs+q;if(G(x,y)===0)S(x,y,2)}}
     for(const rr of [a,b]){rr.shaped=true;rr.blk=rr.blk||[];for(let x=xs-1;x<=xs+w;x++)rr.blk.push(x)}
     L.shapeStats.k++;pockets.push({x0:xs,x1:xs+w,y0:a.y1,y1:b.y1,z:'void'})}}
   /* organic lobes: irregular blobs of cavern open above, below and beside a room, so the voids merge and run on several levels */
   {const surfAt=(x)=>top[x]>=0?top[x]:elevAt(x);
    const nearLiq=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=G(x+dx,y+dy);if(t===4||t===10||t===3)return true}return false};
    const lobe=(cx,cy,rx,ry)=>{const ph=RS()*6.28,ph2=RS()*6.28;let n=0;for(let y=Math.floor(cy-ry*1.4);y<=Math.ceil(cy+ry*1.4);y++){if(y<8||y>=LH-6)continue;for(let x=Math.floor(cx-rx*1.4);x<=Math.ceil(cx+rx*1.4);x++){if(x<8||x>=LW-8)continue;
        const dx=(x-cx)/rx,dy=(y-cy)/ry,rr=Math.sqrt(dx*dx+dy*dy);if(rr>1.4)continue;const th=Math.atan2(dy,dx),lim=1+.22*Math.sin(3*th+ph)+.12*Math.sin(5*th+ph2);if(rr>lim)continue;
        if(y<surfAt(x)+14||y>bb(x)-6)continue;if(G(x,y)!==1)continue;if(nearLiq(x,y))continue;S(x,y,0);n++}}return n};
    for(const r of rooms){if(r.reserve||r.w<22||RS()<.15)continue;const n=rs(2,4);let did=false;
      for(let k=0;k<n;k++){const t=RS(),q=rs(6,r.w-7),lx=r.x0+q;
        if(t<.36){const ry=rs(5,9),rx=rs(8,15);did=lobe(lx,r.y1-r.hh[q]-rs(0,2),rx,ry)>12||did}
        else if(t<.64){const ry=rs(4,7),rx=rs(7,13);let air=false;for(let y=r.y1+1;y<=r.y1+2*ry+3;y++)if(G(lx,y)!==1){air=true;break}if(air)continue;did=lobe(lx,r.y1+ry-1,rx,ry)>12||did}
        else{const left=RS()<.5,ex=left?r.x0-rs(2,5):r.x0+r.w+rs(2,5),ry=rs(5,9),rx=rs(7,13);did=lobe(ex,r.y1-ry+rs(0,2),rx,ry)>12||did}}
      if(did){r.shaped=true;L.shapeStats.lobes=(L.shapeStats.lobes||0)+1}}}
   /* per room shapes: a stepped hill, a drop with a ladder, a chain of floating islands, taller chambers */
   for(const r of rooms){if(r.reserve||r.w<22||RS()<.08)continue;const w=r.w,y1=r.y1,EZ=7,used=new Uint8Array(w);
     if(r.blk)for(const x of r.blk){const q=x-r.x0;if(q>=0&&q<w)used[q]=2}
     for(let q=0;q<w;q++)for(let y=y1-12;y<=y1+1;y++){const t=G(r.x0+q,y);if(t===7||t===3||t===5||t===10||t===4)used[q]=2}
     for(const c of L.checks)if(Math.abs(c.y/TS-y1)<10){const q=Math.round(c.x/TS)-r.x0;for(let k=q-3;k<=q+3;k++)if(k>=0&&k<w)used[k]=2}
     for(const l of L.lifts)if(Math.abs(l.y/TS-y1)<16){const q=Math.round(l.x/TS)-r.x0;for(let k=q-5;k<=q+8;k++)if(k>=0&&k<w)used[k]=2}
     let did=0;const free=(q0,q1)=>{for(let q=q0;q<=q1;q++)if(q<0||q>=w||used[q])return false;return true},claim=(q0,q1)=>{for(let q=q0;q<=q1;q++)if(q>=0&&q<w)used[q]=1};
     /* a stepped hill with a cliff face */
     for(let hz=0;hz<3;hz++)if(RS()<[.95,.7,.45][hz])for(let att=0;att<12;att++){const pw=rs(3,7),Hm=rs(4,9),pc=rs(EZ+pw+7,Math.max(EZ+pw+8,w-EZ-pw-7)),sideL=RS()<.5,sheer=RS()<.45,span=pw+9;
       {const raise=new Int8Array(w);let okk=true;
         for(let q=0;q<w;q++){const d=Math.abs(q-pc)-pw;let h=d<=0?Hm:Math.max(0,Hm-2*Math.ceil(d/5));if(sheer&&(sideL?q<pc:q>pc)&&d>0)h=0;h=Math.min(h,r.hh[q]-9);if(q<EZ||q>=w-EZ)h=0;raise[q]=Math.max(0,h);if(raise[q]>0&&used[q]){okk=false;break}}
         if(!okk||Math.max(...raise)<3)continue;
         for(let q=0;q<w;q++)for(let k=1;k<=raise[q];k++)if(G(r.x0+q,y1-k)===0)S(r.x0+q,y1-k,1);
         if(sheer){const fq=sideL?pc-pw-1:pc+pw+1;if(fq>=0&&fq<w&&raise[sideL?fq+1:fq-1]>4){const x=r.x0+fq;for(let y=y1-raise[sideL?fq+1:fq-1];y<y1;y++)if(G(x,y)===0)S(x,y,7)}}
         for(let q=0;q<w;q++)if(raise[q]>0)claim(q-1,q+1);did=1;L.shapeStats.hill++;att=99;
         const tx=r.x0+pc;if(Hm>=5&&RS()<.7){chest(tx,y1-raise[pc],10+idx*4);shapedChests.push(L.chests[L.chests.length-1])}}}
     /* a drop: a pit with a ladder and a chest at the bottom */
     if(RS()<.65)for(let att=0;att<7;att++){const pw=rs(5,11),d=rs(4,7),q0=rs(EZ+9,Math.max(EZ+10,w-EZ-pw-10));if(free(q0-2,q0+pw+1)){let ok=true;
         for(let q=q0-1;q<q0+pw&&ok;q++)for(let y=y1;y<=y1+d+1;y++)if(G(r.x0+q,y)!==1)ok=false;
         if(ok){for(let q=q0;q<q0+pw;q++)for(let y=y1;y<y1+d;y++)S(r.x0+q,y,0);const lx=RS()<.5?q0-1:q0+pw;for(let y=y1;y<y1+d;y++)S(r.x0+lx,y,7);
           chest(r.x0+q0+(pw>>1),y1+d,12+idx*5);shapedChests.push(L.chests[L.chests.length-1]);for(let k=0;k<3;k++)L.coins.push({x:(r.x0+q0+1+k*2)*TS+4,y:(y1+d-2)*TS,v:2+idx});
           for(let q=q0;q<q0+pw;q+=3)if(RS()<.5)spawn(rs(0,2),(r.x0+q)*TS,(y1+d-1)*TS);
           claim(q0-3,q0+pw+2);did=1;L.shapeStats.pit++;att=99}}}
     /* floating islands: a staircase of rock slabs climbing to a chest high in the cavern */
     if(RS()<.6)for(let att=0;att<7;att++){const n=rs(3,5),dir=RS()<.5?1:-1;let qs=dir>0?rs(EZ+3,Math.max(EZ+4,w>>1)):rs(Math.max(EZ+4,w>>1),w-EZ-4);let qx=qs,yy=y1;let ok=true,last=null;const slabs=[];
       for(let k=0;k<n&&ok;k++){const wk=rs(4,6),gap=rs(2,3),x0k=k===0?qx:(dir>0?qx+gap:qx-gap-wk+1),yk=y1-4*(k+1);
         if(x0k<EZ||x0k+wk>=w-EZ){ok=false;break}
         for(let y=yk-4;y<=yk+1&&ok;y++)for(let q=x0k-1;q<=x0k+wk&&ok;q++){const t=G(r.x0+q,y);if(t!==0&&t!==2)ok=false}
         if(ok&&!free(x0k-1,x0k+wk))ok=false;
         if(!ok)break;slabs.push({q0:x0k,wk,yk});qx=dir>0?x0k+wk-1:x0k;if(dir<0)qx=x0k}
       if(slabs.length>=3){for(const s of slabs){for(let q=s.q0;q<s.q0+s.wk;q++)S(r.x0+q,s.yk,1);for(let q=s.q0+1;q<s.q0+s.wk-1;q++)S(r.x0+q,s.yk+1,1);claim(s.q0-1,s.q0+s.wk)}
         const t=slabs[slabs.length-1];L.shapeStats.isl++;chest(r.x0+t.q0+(t.wk>>1),t.yk,14+idx*5);shapedChests.push(L.chests[L.chests.length-1]);for(let q=0;q<t.wk;q+=2)L.coins.push({x:(r.x0+t.q0+q)*TS+4,y:(t.yk-2)*TS,v:1+(idx>>1)});did=1;att=99}}
     /* a taller chamber in the middle */
     if(r.hh.length>=24&&RS()<.5){const q0=EZ+4,q1=w-EZ-5;let any=false;for(let q=q0;q<=q1;q++){const e=Math.round(rs(2,4)*Math.sin((q-q0)/(q1-q0)*Math.PI)),x=r.x0+q,top=y1-r.hh[q];if(e<1)continue;let ok=true;for(let y=top-e-3;y<top-e;y++)if(G(x,y)!==1)ok=false;if(!ok)continue;for(let y=top-e;y<top;y++)if(G(x,y)===1){S(x,y,0);any=true}}if(any){did=1;L.shapeStats.bay++}}
     /* the floor is never flat for long: small stepped mounds, and ledges hanging in the air */
     {let q=EZ+2,mc=0;const free2=(a,b)=>{for(let k=a;k<=b;k++)if(k<0||k>=w||used[k]===2||(used[k]===1&&RS()<.7))return false;return true};while(q<w-EZ-7&&mc<9){if(used[q]===2||RS()<.1){q++;continue}const mw=rs(3,7),mh=rs(1,3);if(free2(q-1,q+mw+1)){let any=false;
         for(let k=0;k<mw;k++){const h=Math.min(mh,1+Math.min(k,mw-1-k),Math.max(0,r.hh[q+k]-9));for(let j=1;j<=h;j++)if(G(r.x0+q+k,y1-j)===0){S(r.x0+q+k,y1-j,1);any=true}}
         if(any){claim(q-1,q+mw);did=1;mc++;L.shapeStats.mound=(L.shapeStats.mound||0)+1}q+=mw+rs(2,6)}else q++}
      const nd=rs(1,3);for(let k=0;k<nd;k++)for(let att=0;att<6;att++){const dw=rs(4,9),dq=rs(EZ+2,Math.max(EZ+3,w-EZ-dw-2)),dd=rs(2,5);let ok=dq+dw<w-EZ;
        for(let q=dq;q<dq+dw&&ok;q++){if(used[q]===2){ok=false;break}const top=y1-r.hh[q];if(G(r.x0+q,top)!==0||G(r.x0+q,top-1)!==1||r.hh[q]-dd<10){ok=false;break}for(let j=1;j<=dd+8&&ok;j++)if(G(r.x0+q,top+j)!==0)ok=false}
        if(ok){for(let q=dq;q<dq+dw;q++){const top=y1-r.hh[q],tp=Math.max(1,Math.round(dd*(1-Math.abs((q-dq)-(dw-1)/2)/(dw/2+.5))));for(let j=0;j<tp;j++)S(r.x0+q,top+j,1)}did=1;L.shapeStats.drop=(L.shapeStats.drop||0)+1;break}}
      const nl=rs(1,3);for(let k=0;k<nl;k++)for(let att=0;att<6;att++){const lw=rs(4,7),q0=rs(EZ+2,Math.max(EZ+3,w-EZ-lw-2)),ly=y1-rs(5,9);let ok=q0+lw<w-EZ&&r.hh[q0]>=ly*-1+y1+4&&r.hh[Math.min(w-1,q0+lw)]>=y1-ly+4;
        for(let yy=ly-4;yy<=ly&&ok;yy++)for(let qq=q0-1;qq<=q0+lw&&ok;qq++){const t=G(r.x0+qq,yy);if(t!==0)ok=false}
        for(let qq=q0;qq<q0+lw&&ok;qq++)if(used[qq]===2)ok=false;
        if(ok){for(let qq=q0;qq<q0+lw;qq++)S(r.x0+qq,ly,2);if(RS()<.5)L.coins.push({x:(r.x0+q0+(lw>>1))*TS+4,y:(ly-2)*TS,v:1+(idx>>1)});did=1;L.shapeStats.ledge=(L.shapeStats.ledge||0)+1;break}}}
     if(did){r.shaped=true;L.shapeStats.shaped++}}
   /* things the room generator put on the old flat floor settle onto the new ground */
   const settleItems=(r)=>{const q0=r.x0-1,q1=r.x0+r.w+1;
     for(const c of L.chests){const tx=Math.floor((c.x+7)/TS),ty=Math.floor((c.y+9)/TS);if(tx<q0||tx>q1||Math.abs(ty-r.y1)>14)continue;if(G(tx,ty)!==0||(G(tx,ty+1)===0&&Math.abs(ty-(r.y1-1))<2)){const nr=settleRow(tx,ty);c.y=(nr+1)*TS-10}}
     for(const s of L.spawns){const tx=Math.floor(s.x/TS),ty=Math.floor(s.y/TS);if(tx<q0||tx>q1||Math.abs(ty-r.y1)>14)continue;if(G(tx,ty)!==0||G(tx,ty+1)===0){s.y=settleRow(tx,ty)*TS}}
     for(const c of L.coins){const tx=Math.floor(c.x/TS),ty=Math.floor(c.y/TS);if(tx<q0||tx>q1||Math.abs(ty-r.y1)>14)continue;if(G(tx,ty)===1||G(tx,ty)===2){const nr=settleRow(tx,ty);c.y=nr*TS-6}}
     for(const d of L.deco){const tx=Math.floor(d.x/TS),ty=Math.floor((d.y-1)/TS);if(tx<q0||tx>q1||Math.abs(ty-r.y1)>14)continue;if(G(tx,ty)===1&&(d.k==='egg'||d.k==='shroom'||d.k==='bush'||d.k==='weed'||d.k==='spire'||d.k==='pillar'||d.k==='crate')){let y=ty;while(y>3&&G(tx,y)!==0)y--;let n=0;while(n++<14&&G(tx,y+1)===0)y++;d.y=(y+1)*TS+1}}
     for(const p of ports)if(Math.abs(p.x-r.cx)<2&&Math.abs(p.y-(r.y1-1))<2){p.y=settleRow(p.x,p.y)}};
   for(const r of rooms)if(r.shaped)settleItems(r);
  }
  L.fillerPorts=ports;L.shapedChests=shapedChests;
  /* ---------- roof furnishings: portholes and girders in the hull, ribs and eggs in the hive, lava drips in the caverns ---------- */
  if(baseRH>0){for(let i=8;i<LW-8;i+=rn(10,20)){if(roofRow[i]<0||roofRow[i-4]<0||roofRow[i+4]<0)continue;const r=roofRow[i]+1;
      if(idx===2){const k=R();if(k<.22&&top[i]>=0)L.deco.push({x:i*TS+4,y:(roofRow[i]-2)*TS,k:'porthole'});else if(k<.55){const long=R()<.5;L.deco.push({x:i*TS+4,y:r*TS+(long?22:12),k:long?'girderL':'girderS'})}else if(k<.7)L.deco.push({x:i*TS+4,y:(r+1)*TS+10,k:'lamp'})}
      else if(idx===4){const k=R();if(k<.35)L.deco.push({x:i*TS+4,y:(r)*TS+26,k:'rib'});else if(k<.5)L.deco.push({x:i*TS+4,y:(r)*TS+14,k:'egg'})}
      else if(idx===3){if(R()<.5)L.deco.push({x:i*TS+4,y:(r)*TS+14,k:'drip'})}}}
  if(baseRH>0&&(idx===2||idx===4)){for(let i=14;i<LW-14;i+=rn(26,50)){if(roofRow[i]<0||roofRow[i-3]<0||roofRow[i+3]<0)continue;const tp=roofRow[i]-TH+1;L.deco.push({x:i*TS+4,y:tp*TS+1,k:idx===2?(R()<.5?'pillar':'engine'):(R()<.5?'rib':'heart')});}}
  /* ---------- the ship pieces: one hidden in each of levels 1-4, two in level 5 ---------- */
  L.shipPieces=[];
  {let AP_=null;const reach=(x,y)=>{if(!AP_)AP_=analyzeLevel(L,{pack:true});for(let dy=-3;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(AP_.F[(y+dy)*LW+x+dx])return true;return false};
  const used=new Set(),lowest=L.abyss.slice().sort((a,b)=>b.fl-a.fl),place=(id,tx,ty,how)=>{L.shipPieces.push({id,x:tx*TS+4,y:ty*TS,how});L.glows.push({x:tx-2,y:ty-4,w:4,h:6,c:'#ffffcc',hint:1})};
    const island=(kinds,hi)=>{let c=(L.hidden||[]).filter(h=>!used.has(h)&&kinds.includes(h.k));if(!c.length)c=(L.hidden||[]).filter(h=>!used.has(h));if(!c.length)return false;c.sort((a,b)=>hi?a.y-b.y:b.y-a.y);const h=c[0];used.add(h);place(0,h.x,h.top0-2,'island');L.shipPieces[L.shipPieces.length-1].id=-1;return true};
    const mazeEnd=()=>{const ok_=L.mazeEnds.filter(m=>G(m.x,m.y)===0&&G(m.x,m.y-1)===0&&reach(m.x,m.y-1));if(!ok_.length)return false;const m=ok_.sort((a,b)=>b.d-a.d)[0];L.mazeEnds=L.mazeEnds.filter(z=>z!==m);place(-1,m.x,m.y-1,'maze');return true};
    const bottom=()=>{while(lowest.length){const a=lowest.shift();if(!reach(a.bx0+3,a.fl-2))continue;place(-1,a.bx0+3,a.fl-2,'abyss floor');return true}return false};
    const sideCave=(side)=>{let c=L.sideCaves.filter(q=>q.side===side&&reach(q.x,q.y-1)).sort((a,b)=>b.fl-a.fl||b.y-a.y);if(!c.length)c=L.sideCaves.slice();if(!c.length)return false;const q=c[0];L.sideCaves=L.sideCaves.filter(z=>z!==q);place(-1,q.x,q.y-1,'side cave');return true};
    const ids=idx===4?[4,5]:[idx];
    const order=[
      ()=>mazeEnd()||bottom()||island(['sky'],false),
      ()=>island(['sky','chasm'],false)||sideCave(1),
      ()=>sideCave(1)||bottom()||island(['chasm'],false),
      ()=>island(['high'],true)||island(['sky'],true),
      ()=>mazeEnd()||bottom()||island(['chasm'],false),
      ()=>island(['high'],true)||island(['chasm','sky'],true)];
    const plan=idx===0?[0]:idx===1?[1]:idx===2?[2]:idx===3?[3]:[4,5];
    ids.forEach((id,k)=>{order[plan[k]]();const p=L.shipPieces[L.shipPieces.length-1];if(p)p.id=id});
    L.pieceSpots=L.shipPieces.map(p=>({x:p.x/TS,y:p.y/TS}))}
  /* ---------- the bottom edge: the world is a shaped mass floating in the sky or space ---------- */
  const out=new Uint8Array(LW*LH);L.out=out;
  {const bot=new Int16Array(LW);
    for(let xx=0;xx<LW;xx++){let need=0;for(let y=LH-1;y>=0;y--){const t=g[y*LW+xx];if(t!==1){need=y;break}}bot[xx]=Math.max(Math.round(bb(xx)),need+10)}
    {const raw=Int16Array.from(bot),W_=idx===2?24:16;for(let xx=0;xx<LW;xx++){let m=0;for(let q=Math.max(0,xx-W_);q<=Math.min(LW-1,xx+W_);q++)if(raw[q]>m)m=raw[q];bot[xx]=Math.min(LH,m)}}
    const sl=idx===2?3:1;for(let xx=1;xx<LW;xx++)bot[xx]=Math.max(bot[xx],bot[xx-1]-sl);for(let xx=LW-2;xx>=0;xx--)bot[xx]=Math.max(bot[xx],bot[xx+1]-sl);
    for(let xx=0;xx<LW;xx++)for(let y=Math.min(LH-1,bot[xx]);y<LH;y++){g[y*LW+xx]=0;out[y*LW+xx]=1}
    L.bot=bot}
  /* ---------- sky: open air above the first solid tile of each column ---------- */
  const skyB=new Int16Array(LW);for(let i=0;i<LW;i++){let y=0;while(y<LH&&g[y*LW+i]!==1)y++;skyB[i]=y;L.top[i]=(top[i]>=0&&rh[i]===0)?top[i]:-1}
  L.sky=(tx,ty)=>tx>=0&&tx<LW&&ty>=0&&ty<LH&&(ty<skyB[tx]||out[ty*LW+tx]===1);
  /* the tint grid: which kind of room each patch of the world is */
  L.cellOf=new Array(L.cols*L.rows).fill(null);
  for(let cj=0;cj<L.rows;cj++)for(let ci=0;ci<L.cols;ci++){const cx=Math.min(LW-1,ci*CW_+48),cy=Math.min(LH-1,cj*CH_+32);let z='cavern';
    const sr=top[cx]>=0?top[cx]:floorAt[cx];
    if(cy<sr-1)z=ZNAMES[zc[cx]]==='void'||ZNAMES[zc[cx]]==='mountain'?ZNAMES[zc[cx]]:rh[cx]>0||cy>sr-16?ZNAMES[zc[cx]]:'hills';
    for(const p of pockets)if(cx>=p.x0&&cx<p.x1&&cy>=p.y0-8&&cy<p.y1+8){z=p.z;break}
    if(cy>=sr-1&&z==='cavern'&&cy>sr+20)z='cavern';
    L.cellOf[cj*L.cols+ci]={zone:z}}
  L.zoneName=(tx,ty)=>{const c=L.cellOf[Math.min(L.rows-1,Math.max(0,(ty/CH_)|0))*L.cols+Math.min(L.cols-1,Math.max(0,(tx/CW_)|0))];return c?c.zone:null};
  L.zmap=new Uint8Array(L.cols*L.rows);for(let i=0;i<L.zmap.length;i++)L.zmap[i]=Math.max(0,ZNAMES.indexOf(L.cellOf[i].zone));
  L.surf=top;
  L.repairs=0;
  let A0=null;
  const repairPorts=(A)=>{let bad=0;
    for(const p of ports){const k=p.y*LW+p.x;if(A.F[k])continue;let best=null,bd=1e9;
      for(let dy=-46;dy<=46;dy++){const y=p.y+dy;if(y<3||y>=LH-2)continue;for(let dx=-46;dx<=46;dx++){const xx=p.x+dx;if(xx<2||xx>=LW-2)continue;const q=y*LW+xx;if(A.F[q]&&A.st[q]&&g[q]!==10){const d=Math.abs(dx)+Math.abs(dy)*1.6;if(d<bd){bd=d;best=[xx,y]}}}}
      if(!best)continue;bad++;const [vx,vy]=best,stp=vx>=p.x?1:-1;
      for(let xx=p.x;xx!==vx+stp;xx+=stp){for(let y=p.y-4;y<=p.y;y++){const t=G(xx,y);if(t===1||t===6)S(xx,y,0)}if(G(xx,p.y+1)===0)S(xx,p.y+1,1)}
      for(let y=Math.min(p.y,vy);y<=Math.max(p.y,vy);y++){const t=G(vx,y);if(t===0||t===1||t===2||t===6||t===10)S(vx,y,7)}L.repairs++}
    return bad};
  for(let it=0;it<2;it++){const A=analyzeLevel(L,{noUps:true});A0=A;const bad=repairPorts(A);
    if(!bad)break}
  {const keep=[];for(const c of L.chests){if(!shapedChests.includes(c)){keep.push(c);continue}const tx=Math.floor((c.x+7)/TS),ty=Math.floor((c.y+9)/TS);let ok=false;for(let dy=-3;dy<=1&&!ok;dy++)for(let dx=-2;dx<=2;dx++)if(A0.F[(ty+dy)*LW+tx+dx]){ok=true;break}if(ok)keep.push(c)}L.chests=keep}
  L.dist0=Math.hypot(L.start.x-L.exit.x,L.start.y-L.exit.y)||1;
  featGen({L,idx,rooms,top,rh,LW,LH,S,G,rect,chest,spawn,deco,pockets,elevAt,A0});
  if(L.sets&&L.sets.length){for(const c of L.chests)if(c.setc)ports.push({x:Math.floor((c.x+7)/TS),y:Math.floor((c.y+9)/TS)});repairPorts(analyzeLevel(L,{noUps:true}))}
  fixTraps(L);
  /* every ship piece must be reachable with the rocket pack: if not, give it a ledge and a ladder tunnel to the nearest reachable floor */
  let AP=analyzeLevel(L,{pack:true}),fixed=0;
  if(L.shipPieces.length){
    for(const sp of L.shipPieces){const px=Math.round(sp.x/TS),py=Math.round(sp.y/TS);let ok=false;for(let dy=-3;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(AP.F[(py+dy)*LW+px+dx])ok=true;if(ok)continue;
      for(let q=-1;q<=1;q++)if(G(px+q,py+1)!==1)S(px+q,py+1,2);
      let best=null,bd=1e9;for(let dy=-60;dy<=60;dy++){const y=py+dy;if(y<3||y>=LH-2)continue;for(let dx=-60;dx<=60;dx++){const xx=px+dx,q=y*LW+xx;if(xx>2&&xx<LW-2&&AP.F[q]&&AP.st[q]&&g[q]!==10){const d=Math.abs(dx)+Math.abs(dy)*1.5;if(d<bd){bd=d;best=[xx,y]}}}}
      if(!best)continue;const [vx,vy]=best,stp=vx>=px?1:-1;
      for(let xx=px;xx!==vx+stp;xx+=stp){for(let y=py-4;y<=py;y++){const t=G(xx,y);if(t===1||t===6)S(xx,y,0)}if(G(xx,py+1)===0)S(xx,py+1,1)}
      for(let y=Math.min(py,vy);y<=Math.max(py,vy);y++){const t=G(vx,y);if(t===0||t===1||t===2||t===6||t===10)S(vx,y,7)}fixed++}
    if(fixed){L.pieceFix=fixed;fixTraps(L)}}
  /* a signature room reward that cannot be reached is taken out of the secret count */
  for(const c of L.chests.slice()){if(!c.setc)continue;const tx=Math.floor((c.x+7)/TS),ty=Math.floor((c.y+9)/TS);let ok=false;for(let dy=-3;dy<=1&&!ok;dy++)for(let dx=-2;dx<=2;dx++)if(AP.F[(ty+dy)*LW+tx+dx]){ok=true;break}
    if(!ok){L.chests.splice(L.chests.indexOf(c),1);const si=L.secrets.findIndex(q=>q.id===c.sec);if(si>=0){L.secrets.splice(si,1);L.secretTotal=L.secrets.length}L.secretPts=L.secretPts.filter(q=>q.sid!==c.sec)}}
  return L;
}

/* ---------------- reachability: can the astronaut always get out of anywhere they can fall into? ---------------- */
/* A cell graph. A node is a cell where the astronaut can stand (two cells of air with support below) or hang on a ladder.
   Edges: walking, a one tile step up, falling, jumping (clear L shaped path, up to 5 rows up), ladders, lift ends and springs. */
function analyzeLevel(L,opt){
  const pack=!!(opt&&opt.pack);
  const LW=L.LW,LH=L.LH,g=L.g,N=LW*LH;
  const T=(x,y)=>x<0||x>=LW?1:y<0?0:y>=LH?1:g[y*LW+x];
  const pa=(x,y)=>{const t=T(x,y);return t===0||t===2||t===7||t===10};
  const virt=new Uint8Array(N),lad=new Uint8Array(N),st=new Uint8Array(N);
  for(const q of L.lifts){
    if(q.axis==='v'){const r0=Math.ceil(q.a/TS)-1,r1=Math.ceil(q.b/TS)-1;
      for(let c=Math.floor(q.x/TS);c<=Math.floor((q.x+q.w-1)/TS);c++){if(c<0||c>=LW)continue;virt[r0*LW+c]=virt[r1*LW+c]=1}}
    else{const r=Math.ceil(q.y/TS)-1;for(const px_ of [q.a,q.b])for(let c=Math.floor(px_/TS);c<=Math.floor((px_+q.w-1)/TS);c++){if(c>=0&&c<LW)virt[r*LW+c]=1}}}
  if(!(opt&&opt.noUps))for(const u of L.ups)for(let y=Math.floor(u.y/TS);y<Math.floor((u.y+u.h)/TS);y++)for(let x=Math.floor(u.x/TS);x<Math.floor((u.x+u.w)/TS);x++)if(x>=0&&x<LW&&y>=0&&y<LH&&pa(x,y))lad[y*LW+x]=1;
  const sup=(x,y)=>{const t=T(x,y);return t===1||t===2||t===5||t===6||(t===7&&T(x,y-1)!==7)};
  for(let y=2;y<LH-1;y++)for(let x=0;x<LW;x++){const i=y*LW+x;
    if(T(x,y)===7||T(x,y)===10)lad[i]=1;
    if(pa(x,y)&&pa(x,y-1)&&(sup(x,y+1)||virt[i]))st[i]=1}
  const node=i=>st[i]||lad[i];
  const out=new Map(),inn=new Map(),add=(a,b)=>{if(a===b)return;let o=out.get(a);if(!o)out.set(a,o=[]);o.push(b);let n=inn.get(b);if(!n)inn.set(b,n=[]);n.push(a)};
  const fall=(x2,y,from,dir)=>{for(let r=y;r<LH-1;r++){if(!pa(x2,r))return;if(st[r*LW+x2]||lad[r*LW+x2]){add(from,r*LW+x2);return}}};
  /* walking off an edge: the fall carries you a few tiles further the longer it is */
  const fallDrift=(x2,y,from,dir)=>{fall(x2,y,from);for(let dd=1;dd<=9;dd++){const xc=x2+dir*dd;if(xc<1||xc>=LW-1)return;if(!pa(xc,y)||!pa(xc,y-1))return;
      for(let r=y;r<LH-1;r++){if(!pa(xc,r))break;if(st[r*LW+xc]||lad[r*LW+xc]){if(dd<=1.6*Math.sqrt(r-y))add(from,r*LW+xc);break}}}};
  for(let y=2;y<LH-1;y++)for(let x=0;x<LW;x++){
    const i=y*LW+x;if(!node(i))continue;
    if(st[i]||lad[i]){   // moving sideways works from any node
      for(const d of [-1,1]){const x2=x+d;if(x2<0||x2>=LW)continue;const j=y*LW+x2;
        if(node(j)&&pa(x2,y))add(i,j);
        else if(st[i]&&st[j-LW]&&pa(x,y-2))add(i,j-LW);
        else if(lad[i]&&T(x,y)!==7&&st[j-LW]&&pa(x,y-1))add(i,j-LW);
        else if(pa(x2,y)&&pa(x2,y-1))fallDrift(x2,y,i,d)}}
    if(lad[i]){const iu=i-LW,id=i+LW;if(y>2&&node(iu)&&pa(x,y-1))add(i,iu);if(node(id)&&pa(x,y+1))add(i,id)}
    if(st[i]&&T(x,y)!==7&&T(x,y+1)===7){add(i,i+LW)}
    if(!st[i]||T(x,y)===10)continue;
    const sp=T(x,y+1)===5,rise=sp?14:pack?26:6;
    for(let dy=-12;dy<=rise;dy++){const y2=y-dy;if(y2<2||y2>=LH-1)continue;
      const dxm=pack?(dy>=0?Math.max(5,14-Math.floor(dy/3)):12):dy>=0?(sp?7:[7,7,6,5,4,3,3][Math.min(dy,6)]):Math.min(8,7+Math.floor(-dy*.34));
      for(let dx=-dxm;dx<=dxm;dx++){if(!dx&&!dy)continue;const x2=x+dx;if(x2<0||x2>=LW)continue;const j=y2*LW+x2;if(!st[j]&&!(lad[j]&&dy<=1))continue;
        if(Math.abs(dx)<=1&&dy===0)continue;
        const yt=Math.min(y,y2)-1;let ok=true;
        for(let r=yt-1;r<=y-1&&ok;r++)if(!pa(x,r))ok=false;                       // up from the take off
        const a=Math.min(x,x2),b=Math.max(x,x2);
        for(let c=a;c<=b&&ok;c++){if(!pa(c,yt-1)||!pa(c,yt))ok=false}              // across at the top of the jump
        for(let r=yt;r<=y2&&ok;r++)if(!pa(x2,r))ok=false;                          // down to the landing
        if(ok)add(i,j)}}
  }
  /* lift rides: top and bottom ends of one lift column are linked both ways */
  for(const q of L.lifts){
    if(q.axis==='v'){const r0=Math.ceil(q.a/TS)-1,r1=Math.ceil(q.b/TS)-1;for(let c=Math.floor(q.x/TS);c<=Math.floor((q.x+q.w-1)/TS);c++){if(c<0||c>=LW)continue;const a=r0*LW+c,b=r1*LW+c;if(st[a]&&st[b]){add(a,b);add(b,a)}}}
    else{const r=Math.ceil(q.y/TS)-1;for(let k=0;k<Math.floor(q.w/TS);k++){const c0=Math.floor(q.a/TS)+k,c1=Math.floor(q.b/TS)+k;if(c0<0||c1>=LW)continue;const a=r*LW+c0,b=r*LW+c1;if(st[a]&&st[b]){add(a,b);add(b,a)}}}}
  /* breadth first searches */
  const bfs=(starts,adj)=>{const seen=new Uint8Array(N),q=[];for(const s of starts)if(!seen[s]){seen[s]=1;q.push(s)}
    for(let h=0;h<q.length;h++){const o=adj.get(q[h]);if(o)for(const j of o)if(!seen[j]){seen[j]=1;q.push(j)}}return seen};
  let sN=-1;{const sx=Math.floor(L.start.x/TS)+1;for(let y=Math.floor(L.start.y/TS);y<LH-1;y++)if(st[y*LW+sx]){sN=y*LW+sx;break}}
  const ex=[];{const ecx=Math.floor(L.exit.x/TS);for(let dx=-3;dx<=3;dx++)for(let y=Math.floor(L.exit.y/TS)-4;y<=Math.floor(L.exit.y/TS);y++)if(ecx+dx>=0&&st[y*LW+ecx+dx])ex.push(y*LW+ecx+dx)}
  const F=bfs(sN>=0?[sN]:[],out),G=bfs(ex,inn);
  return{st,lad,F,G,out,inn,sN,ex,N,LW,LH,T,pa,reachExit:ex.some(e=>F[e])};
}
/* give every dead end a ladder (carving through rock if it has to) */
function fixTraps(L){
  let added=0;
  for(let it=0;it<8;it++){
    const A=analyzeLevel(L),LW=L.LW,g=L.g;
    if(!A.reachExit){L.verify={ok:false,added,note:'exit not reached by the model'};return A}
    const trapped=[];for(let i=0;i<A.N;i++)if(A.F[i]&&!A.G[i]&&A.st[i])trapped.push(i);
    if(!trapped.length){L.verify={ok:true,added,nodes:A.F.reduce((s,v)=>s+v,0)};return A}
    const isT=new Uint8Array(A.N);for(const i of trapped)isT[i]=1;
    const comp=new Int32Array(A.N).fill(-1),comps=[];
    for(const i of trapped){if(comp[i]>=0)continue;const c=comps.length,q=[i];comp[i]=c;
      for(let h=0;h<q.length;h++){for(const m of [A.out,A.inn]){const o=m.get(q[h]);if(o)for(const j of o)if(isT[j]&&comp[j]<0){comp[j]=c;q.push(j)}}}comps.push(q)}
    for(const C of comps){
      let best=null;
      const cols=new Map();for(const i of C){const x=i%LW,y=(i/LW)|0;if(!cols.has(x)||cols.get(x)<y)cols.set(x,y)}
      for(const [x,yb] of cols){
        let carve=0,plat=0,top=-1,bad=false;
        for(let r=yb;r>=2;r--){
          const t=A.T(x,r);
          if(t===3||t===4){bad=true;break}
          if(r<yb&&A.st[r*LW+x]&&A.G[r*LW+x]){top=r+1;break}
          if(A.st[r*LW+x+1]&&A.G[r*LW+x+1]&&r<yb+1&&A.pa(x,r-1)){top=r;break}
          if(x>0&&A.st[r*LW+x-1]&&A.G[r*LW+x-1]&&A.pa(x,r-1)){top=r;break}
          if(t===1||t===6)carve++;if(t===2)plat++;
        }
        if(bad||top<0)continue;
        const score=(yb-top)+carve*5+plat*3;
        if(!best||score<best.score)best={x,yb,top,score}
      }
      if(!best)continue;
      for(let r=best.top;r<=best.yb;r++)g[r*LW+best.x]=7;
      for(let r=best.top-1;r>=Math.max(1,best.top-2);r--){const t=g[r*LW+best.x];if(t===1||t===6||t===3||t===4)g[r*LW+best.x]=0}
      added++;
    }
  }
  const A=analyzeLevel(L);L.verify={ok:false,added,note:'still trapped after 8 passes'};return A;
}

function T0(g,LW,LH,x,y){return x<0||x>=LW||y<0||y>=LH?1:g[y*LW+x]}

/* ---------------- terrain: the ground is painted once per 256 pixel chunk, not tile by tile ---------------- */
const _c32={};
function C32(h){let v=_c32[h];if(v===undefined){const n=parseInt(h.slice(1,7),16);v=_c32[h]=((255<<24)|((n&255)<<16)|(n&0xff00)|(n>>16))>>>0}return v}
function mix32(a,b,t){const ar=a&255,ag=(a>>>8)&255,ab=(a>>>16)&255,br=b&255,bg=(b>>>8)&255,bb=(b>>>16)&255;
  return((255<<24)|(((ab+(bb-ab)*t)|0)<<16)|(((ag+(bg-ag)*t)|0)<<8)|((ar+(br-ar)*t)|0))>>>0}
const WH32=C32('#ffffff'),K32=C32('#000000');
const B4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
function ramp32(r,v,x,y){v=v<0?0:v>.999?.999:v;const t=v*(r.length-1),k=Math.floor(t),f=t-k;return f>B4[y&3][x&3]/16?r[k+1]:r[k]}
function hh(x,y,s){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,1442695041))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
const CHW=256;

/* per world ground painter: (wx,wy,dU,dD,dL,dR) -> colour. dU/dD/dL/dR are pixel distances to the nearest air above/below/left/right. */
function mkGround(idx,NZ){
  const c=a=>a.map(C32);
  if(idx===0){
    const lip=c([PG,LG,GR,GD]),soil=c(['#2a0a2a','#5a2236',BR,'#9a5a59']),deep=c(['#2c1050','#46207c','#6430a8','#8a50d0']),mg_=C32(mg),MG_=C32(MG),LV_=C32(LV),CY_=C32(CY),BR_=C32(BR);
    return (wx,wy,dU,dD,dL,dR)=>{
      const n=NZ.fbm(wx*.06,wy*.08,2),f=hh(wx,wy,1),lipD=2+((NZ.vn(wx*.35,7)*3.4)|0),dd=dU+(n-.5)*9;
      let col;
      if(dU<lipD)col=lip[Math.min(3,dU+(f>.7?1:0))];
      else if(dd<12)col=ramp32(soil,.3+n*.4+.08*Math.sin(wy*.5+n*5),wx,wy);
      else col=ramp32(deep,.38+n*.4+.1*Math.sin(wy*.33+n*4),wx,wy);
      if(dU>=lipD+1){
        const r=Math.abs(NZ.vn(wx*.05+9,wy*.06)-.5);
        if(r<.01)col=(wx+wy)&1?C32('#ff77ff'):C32('#d050e0');else if(r<.018)col=C32('#a040b8');
        const r2=Math.abs(NZ.vn(wx*.11,wy*.1+4)-.5);if(r2<.007&&dd>10)col=C32('#7affe0');
        if(f>.9985)col=MG_;else if(f<.02)col=C32('#1a0a30');
        if(hh(wx>>1,wy>>1,5)>.972)col=[CY_,LV_,MG_,C32('#ffcc66')][((wx>>4)+(wy>>4))&3];
        if(dd<12&&f>.95)col=BR_;
      }
      if(dD<2&&dU>4&&f>.45)col=lip[dD?2:1];                          // moss fringe under overhangs
      if(dD<1&&(wx&1)&&f>.8)col=CY_;
      return col};
  }
  if(idx===1){
    const sand=c(['#40160e',BR,'#9a3a3a',RD,OR,YL]),cr=C32('#68372b'),YL_=C32(YL),WH_=C32(WH),CY_=C32(CY),MG_=C32(MG),OR_=C32(OR),TN_=C32('#c8905a');
    return (wx,wy,dU,dD,dL,dR)=>{
      const n=NZ.fbm(wx*.04,wy*.07,2),f=hh(wx,wy,2);
      const warp=NZ.vn(wx*.03,wy*.04)*7,band=Math.sin((wy+warp)*.36)*.5+Math.sin((wy+warp)*.9+1)*.18;
      let v=.78-Math.min(dU,150)*.0042+band*.17+(n-.5)*.34;
      if(dU<2)return dU?OR_:(f>.4?WH_:YL_);
      if(dU<4)v=Math.max(v,.82);
      let col=ramp32(sand,v,wx,wy);
      if(f>.985)col=YL_;else if(f<.012)col=cr;
      const r=Math.abs(NZ.vn(wx*.07+3,wy*.09)-.5);if(r<.012&&dU>6)col=cr;
      const bnd=Math.sin((wy+warp)*.36+.9);if(bnd>.985&&dU>5)col=TN_;
      if(dD<1&&f>.5)col=cr;
      return col};
  }
  if(idx===2){   /* hull plating: plates, bulkheads, grates, pipes, lit strips and hazard stripes, each 16 pixel tile picks one */
    const steel=c(['#142652','#27478a','#3a68b4','#5a90dc','#aef0ff']),PIPE=c(['#16244a','#34548e','#7aa8e8','#d0e8ff']),SE=C32('#0a1638'),RS=C32('#a8ccff'),CYL=C32('#7af0ff'),YLL=C32('#ffe040'),LIT=C32('#ffe08a'),LIT2=C32('#8affff'),DK=C32('#0c1838'),MO=C32('#2e8a4a');
    return (wx,wy,dU,dD,dL,dR)=>{
      if(dU===0)return C32('#d8ffff');
      if(dU===1)return ((wx>>2)&1)?YLL:C32('#38c8ff');
      if(dU===2)return DK;
      const lx=wx&15,ly=wy&15,cx=wx>>4,cy_=wy>>4,tv=hh(cx,cy_,5),f=hh(wx,wy,3),n=NZ.vn(wx*.08,wy*.08);
      if(lx===0||ly===0)return SE;
      if(lx===1||ly===1)return ramp32(steel,.72,wx,wy);
      if(lx===15||ly===15)return ramp32(steel,.28,wx,wy);
      const v=.5+n*.08+(f-.5)*.05;
      if(tv<.14){if((lx===3||lx===12)&&(ly===3||ly===12))return RS}
      else if(tv<.28){if(lx>=3&&lx<=12&&ly>=3&&ly<=12)return (ly&1)?SE:ramp32(steel,.4,wx,wy)}
      else if(tv<.40){const pr=ly>=3&&ly<=5?ly-3:ly>=9&&ly<=11?ly-9:-1;if(pr>=0)return ramp32(PIPE,[.92,.6,.22][pr],wx,wy);if(lx<=2||lx>=13)return ramp32(steel,.8,wx,wy)}
      else if(tv<.47){if(ly>=6&&ly<=9&&lx>=2&&lx<=13)return (ly===6||ly===9)?SE:(((lx>>2)+cx)&1)?LIT:LIT2}
      else if(tv<.56){if(ly>=11&&ly<=13)return (((lx+ly)>>1)&1)?YLL:K32}
      else if(tv<.66){if(lx>=6&&lx<=9)return (lx===7||lx===8)?CYL:SE}
      else if(tv<.74){if(lx===ly||lx===15-ly)return SE}
      if(dU<9&&tv>.9&&f>.5)return MO;
      return ramp32(steel,v,wx,wy)};
  }
  if(idx===3){   /* cooled basalt: columns and slabs with glowing seams and glossy obsidian */
    const bas=c(['#241010','#44201a','#6e3224','#a24c2c','#e0803c']),OB=c(['#0a0406','#1c0a10','#3a1420','#a04040']),CRK=C32('#08040e'),G1=C32('#ff7a2a'),G2=C32('#ffd060'),G0=C32('#c0521e');
    return (wx,wy,dU,dD,dL,dR)=>{
      if(dU<2)return dU?C32('#ff9a44'):C32('#fff0a0');
      const band=wy>>5,off=(hh(band,0,31)*14)|0,bx=wx+off,col_=Math.floor(bx/14),lxx=bx-col_*14,ly=wy&31,ch=hh(col_,band,32),ch2=hh(col_,band,33);
      if(lxx===0)return ch2>.5?(dU>6?G0:CRK):CRK;
      if(ly===0&&ch>.45)return CRK;
      if(ch>.9){const g=((wx-wy)&15)<2?3:((wx-wy)&15)<4?2:ly>26?1:0;return OB[g]}
      let v=.42+ch*.28+(((wx*3+wy*7)&7)===0?.03:0)+(lxx<=2?.08:0)-(ly>28?.1:0);
      if(lxx===1)v+=.12;
      if(ch2>.82){const k=((lxx*3+ly*2)%23)|0;if(k<1)return G1;if(k<2)return G2}
      if(ch2<.07&&lxx>3&&lxx<10&&ly>5&&ly<12)return G0;
      return ramp32(bas,v,wx,wy)};
  }
  /* hive: living chitin and flesh. warped bulging cells with dark crevices, curved ribs, wet sheen and pink veins; nothing is a rectangle */
  const fl=c(['#06201c','#0e3c34','#1a6a58','#34a080','#80e0b8']),PG_=C32('#ffe08a'),MG_=C32('#ffc060'),mg_=C32('#d08a38'),SEH=C32('#031210'),AMB=C32('#ffd070'),LV_=C32('#9affc8'),VN=C32('#7a1c4a'),VN2=C32('#c0407a'),WET=C32('#d8fff0');
  const S=15;
  return (wx,wy,dU,dD,dL,dR)=>{
    if(dU===0)return (wx&3)===1?MG_:PG_;
    if(dU===1)return ((wx+(wy>>1))&2)?MG_:mg_;
    const xw=wx+4*Math.sin(wy*.11+wx*.03),yw=wy+4*Math.sin(wx*.09+1);
    const cx=Math.floor(xw/S),cy=Math.floor(yw/S);
    let d1=1e9,d2=1e9,bx=0,by=0,bi=0;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
      const ci=cx+i,cj=cy+j,px=(ci+.15+hh(ci,cj,61)*.7)*S,py=(cj+.15+hh(ci,cj,62)*.7)*S,dx=xw-px,dy=yw-py,d=dx*dx+dy*dy;
      if(d<d1){d2=d1;d1=d;bx=px;by=py;bi=hh(ci,cj,63)}else if(d<d2)d2=d}
    const e=Math.sqrt(d2)-Math.sqrt(d1);
    /* curved ribs sweeping across the wall */
    const rr=(wy+9*Math.sin(wx*.034+wy*.012))/46,rf=rr-Math.floor(rr);
    if(rf<.13){const k=rf/.13;return k<.18?fl[4]:k<.5?ramp32(fl,.62+(1-k)*.3,wx,wy):k<.82?fl[2]:SEH}
    if(e<1.5)return bi>.8&&e<.9?VN:SEH;
    const dx=xw-bx,dy=yw-by,r=Math.sqrt(d1),dome=1-r/(S*.62);
    let v=.38+dome*.34+bi*.12-(dx+dy>0?.0:-.1)+((dx+dy)<0?.1:-.06);
    if(e<2.6)v-=.16;
    if(dx<-1&&dx>-4&&dy<-1&&dy>-3.5&&bi>.35)return WET;
    if(bi>.93&&r<2.5)return AMB;
    if(bi<.06&&r<2)return LV_;
    if(bi>.84&&e>1.5&&e<2.2)return VN2;
    return ramp32(fl,Math.max(.04,Math.min(.97,v)),wx,wy)};
}

/* dark back wall inside caves and tunnels */
function mkBack(idx,NZ){
  const c=a=>a.map(C32);
  if(idx===0){const r=c(['#04101a','#081a2a','#0c2438','#123048']),G=C32(MG),B_=C32('#3a1230'),CYn=C32(CY);
    return (wx,wy)=>{const n=NZ.fbm(wx*.05,wy*.06,2),f=hh(wx,wy,11);let col=ramp32(r,.1+n*.8,wx,wy);
      const rt=NZ.vn(wx*.22,wy*.012+3);if(rt>.74&&f>.3)col=B_;
      if(f>.992)col=G;else if(f>.988)col=CYn;return col}}
  if(idx===1){const r=c(['#1a0c24','#2a1230','#44204a','#66306a']),cr=C32('#12081a'),YLd=C32('#8a6a88');
    return (wx,wy)=>{const n=NZ.fbm(wx*.05,wy*.08,2),f=hh(wx,wy,12);const w=wy+NZ.vn(wx*.03,3)*6;let col=ramp32(r,.18+n*.5+Math.sin(w*.4)*.14,wx,wy);
      if(Math.abs(NZ.vn(wx*.08,wy*.1)-.5)<.01)col=cr;if(f>.99)col=YLd;return col}}
  if(idx===2){const r=c(['#081034','#0e1a54','#162a78','#2440a0']),CYd=C32('#5a9aee'),line=C32('#2a4a9a'),LGd=C32('#1b5a3a');
    return (wx,wy)=>{const n=NZ.fbm(wx*.06,wy*.06,2),f=hh(wx,wy,13);let col=ramp32(r,.15+n*.6,wx,wy);
      if((wx&15)===0||(wy&15)===0)col=line;if((wx&15)===8&&(wy&15)===8)col=CYd;
      if(NZ.vn(wx*.1+20,wy*.1)>.8&&f>.4)col=LGd;return col}}
  if(idx===3){const r=c(['#140c10','#201418','#2e1c22','#40282c']),g1=C32('#4a2a30'),g2=C32('#8a5a50');
    return (wx,wy)=>{const n=NZ.fbm(wx*.06,wy*.07,2),f=hh(wx,wy,14);let col=ramp32(r,.1+n*.8,wx,wy);
      const rr=Math.abs(NZ.vn(wx*.05+5,wy*.06)-.5);if(rr<.012)col=g2;else if(rr<.02&&f>.5)col=g1;
      if(f>.995)col=g2;return col}}
  const r=c(['#100210','#1c0420','#2a0a2a','#3a0a38']),v1=C32('#6f3d86'),v2=C32(PG);
  return (wx,wy)=>{const n=NZ.fbm(wx*.06,wy*.07,2),f=hh(wx,wy,15);let col=ramp32(r,.1+n*.8,wx,wy);
    const rr=Math.abs(NZ.vn(wx*.05+9,wy*.055)-.5);if(rr<.013)col=v1;if(f>.994)col=v2;return col};
}

/* things buried in the ground, hanging from ceilings and standing on the surface: painted once into the chunks */
function mkStamps(idx,W_){
  const S={inner:[],near:[],ceil:[],props:[]},F=(w,h,fn)=>fin(cnv(w,h,fn)),N=(w,h,fn)=>cnv(w,h,fn);
  const pebble=p=>N(5,4,g=>ell(g,2.5,2,2.5,2,p)),rock=p=>F(9,6,g=>ell(g,4.5,3,4.5,3,p)),
    skull=(a,b)=>F(7,6,g=>{ell(g,3.5,2.5,3.4,2.6,[b,a,WH,WH]);px(g,b,2,5,3,1);px(g,K,1,2,2,2);px(g,K,4,2,2,2)}),
    bone=(a,b)=>N(11,4,g=>{px(g,b,1,1,9,2);px(g,a,1,1,9,1);px(g,a,0,0,2,2);px(g,a,0,2,2,2);px(g,a,9,0,2,2);px(g,a,9,2,2,2)}),
    ribs=(a,b)=>N(10,8,g=>{px(g,a,4,0,2,8);for(let i=0;i<3;i++){line(g,i&1?a:b,5,1+i*2,0,3+i*2);line(g,i&1?a:b,5,1+i*2,9,3+i*2)}}),
    gem=p=>F(5,8,g=>poly(g,[[2,0],[4,4],[3,8],[1,8],[0,4]],p)),
    cluster=p=>F(11,10,g=>{poly(g,[[5,0],[8,5],[6,10],[3,10],[2,5]],p);poly(g,[[1,3],[3,6],[2,10],[0,10]],p);poly(g,[[9,4],[11,7],[10,10],[7,10]],p)}),
    root=(a,b)=>N(5,11,g=>{let x=2;for(let y=0;y<11;y++){x+=(hh(y,x,idx)>.5?1:-1)*(y%3===0?1:0);x=clamp(x,0,4);px(g,y&1?a:b,x,y)}}),
    gl=(c)=>N(3,3,g=>{px(g,c,1,0);px(g,c,0,1,3,1);px(g,c,1,2);px(g,WH,1,1)});
  const cap=(g,cx,cy0,rx,ry,pal,spot)=>{ell(g,cx,cy0,rx,ry,pal);if(spot)for(let k=0;k<4;k++)px(g,spot,Math.round(cx-rx*.6+k*rx*.4+(k&1)),Math.round(cy0-ry*.4+(k%3)),2,1)};
  if(idx===0){
    S.inner=[rock(['#1c0a34','#4a1a6a','#8a5aa6',LV]),pebble(['#2e1050',PU,LP]),pebble(['#4a1a6a',LP,LV]),skull(LL,GM),bone(LL,GM),gem(['#352879',mg,MG,WH]),gem(['#1c5a6a',cy,CY,WH]),
      F(9,7,g=>{for(let i=0;i<3;i++){px(g,TN,2+i*2,3,1,4);cap(g,2.5+i*2,3,2.2,2,[PU,mg,MG,WH])}}),gl(MG),gl(CY),gl(YL)];
    S.near=[root(BR,TN),root('#4a2030',BR),pebble([BR,TN,OR]),bone(LL,GM)];
    S.ceil=[F(5,9,g=>poly(g,[[0,0],[5,0],[3,9]],['#1c5a6a',cy,CY,WH])),F(7,12,g=>{poly(g,[[0,0],[7,0],[4,12]],[VI,mg,MG,WH]);px(g,WH,3,3)}),N(5,10,g=>{px(g,GD,2,0,1,7);ell(g,2.5,8,2,2,[PU,MG,YL,WH])})];
    S.props=[
      F(34,38,g=>{px(g,TN,15,14,4,24);px(g,OR,15,14,1,24);px(g,BR,18,14,1,24);cap(g,17,12,16,10,[VI,PU,mg,MG,WH],WH);ell(g,17,12,16,10,[VI,PU,mg,MG,WH]);for(let k=0;k<5;k++)px(g,WH,5+k*5,6+(k%2)*5,2,2);px(g,PU,8,20,18,2);px(g,TN,10,19,14,1)}),
      F(24,28,g=>{px(g,TN,11,10,3,18);cap(g,12.5,8,11,7,[BR,TN,OR,YL,WH],YL);for(let k=0;k<4;k++)px(g,WH,4+k*5,4+(k%2)*3,2,2);px(g,TN,0,0,0,0)}),
      F(22,32,g=>{thick(g,GD,10,32,10,8,3);thick(g,GR,10,32,10,8,1);for(let k=0;k<4;k++){ell(g,5+(k&1)*11,9+k*5,3,2,[GD,GR,LG,PG]);px(g,k&1?MG:YL,4+(k&1)*13,8+k*5,2,2)}ell(g,10,6,5,5,[PU,mg,MG,WH]);ell(g,10,6,2,2,[YL,WH,WH,WH])}),
      F(26,22,g=>{for(let i=0;i<7;i++){const a=-1.3+i*.43;thick(g,i%2?GR:LG,13,21,13+Math.sin(a)*12,21-Math.cos(a)*18,2);}thick(g,GD,13,21,13,14,3);for(let i=0;i<4;i++)px(g,[MG,YL,CY,OR][i],5+i*5,3+(i%2)*3,2,2)}),
      F(14,12,g=>{for(let i=0;i<3;i++){px(g,TN,2+i*4,6-(i&1)*2,2,6);cap(g,3+i*4,5-(i&1)*2,3,2.5,[PU,mg,MG,WH])}}),
      F(18,26,g=>{thick(g,GD,9,26,9,6,2);ell(g,9,5,5,5,[W_.glow=== MG?'#6f3d86':PU,MG,PG,WH]);for(let k=0;k<3;k++){px(g,LG,2,10+k*5,4,1);px(g,LG,12,12+k*5,4,1)}px(g,WH,8,3,2,2)})];
  }else if(idx===1){
    S.inner=[rock([BR,rd,RD,OR]),pebble([rd,RD,OR]),pebble([BR,TN,YL]),skull('#ffffcc',TN),bone('#ffffcc',TN),ribs('#ffffcc',TN),gem([VI,mg,MG,WH]),gem([BL,cy,CY,WH]),
      F(8,8,g=>{ell(g,4,4,3.5,3.5,[TN,OR,YL,WH]);ell(g,4,4,1.5,1.5,[TN,TN,TN,TN]);px(g,TN,4,4)}),gl(CY),gl(YL)];
    S.near=[pebble([BR,rd,RD]),root('#9a5a3a',TN),bone('#ffffcc',TN),skull('#ffffcc',TN)];
    S.ceil=[F(5,8,g=>poly(g,[[0,0],[5,0],[3,8]],[BR,rd,RD,OR])),F(6,10,g=>poly(g,[[0,0],[6,0],[3,10]],[BR,TN,OR,YL]))];
    S.props=[
      F(26,34,g=>{poly(g,[[3,34],[8,4],[13,0],[18,10],[23,34]],[BR,rd,RD,OR]);px(g,YL,9,4,2,1);poly(g,[[0,34],[3,22],[8,34]],[BR,rd,RD])}),
      F(22,26,g=>{for(let i=0;i<3;i++){const x=2+i*6,hgt=12+((i*7)%3)*5;poly(g,[[x,26],[x+2,26-hgt],[x+5,26]],[[VI,mg,MG,WH],[BL,cy,CY,WH],[PU,LV,MG,WH]][i])}}),
      F(20,28,g=>{px(g,GD,8,6,5,22);px(g,GR,8,6,2,22);px(g,LG,8,6,1,22);px(g,GD,2,12,3,8);px(g,GD,2,17,8,3);px(g,GR,2,12,1,8);px(g,GD,16,8,3,8);px(g,GD,12,13,7,3);px(g,GR,16,8,1,8);px(g,MG,10,5,2,2);px(g,YL,10,5)}),
      F(30,22,g=>{poly(g,[[0,22],[4,8],[12,6],[15,12],[18,6],[26,9],[30,22]],[BR,rd,RD,OR]);px(g,OR,5,12,19,1);px(g,YL,7,14,2,1);px(g,'#ffffcc',20,15,3,1)}),
      F(30,18,g=>{for(let i=0;i<5;i++){line(g,i&1?'#ffffcc':TN,1+i*6,17,5+i*6,2)}px(g,TN,0,17,30,1)}),
      F(14,14,g=>{ell(g,7,7,6,6,[BR,rd,RD,OR]);px(g,K,4,5,2,2);px(g,K,8,5,2,2);px(g,'#ffffcc',3,9,8,1)})];
  }else if(idx===2){
    const st=['#0a1220','#1c2a4a','#3c5a8a','#70a4b2'];
    S.inner=[F(8,8,g=>{ell(g,4,4,3.5,3.5,[D,GM,LM,LL]);ell(g,4,4,1.5,1.5,[K,K,D,D]);for(let k=0;k<4;k++)px(g,LL,3+(k&1)*2-1,k<2?0:7,2,1)}),pebble([D,GM,LM]),rock(st),N(12,3,g=>{px(g,GM,0,0,12,3);px(g,LL,0,0,12,1);px(g,D,0,2,12,1);px(g,K,3,0,1,3);px(g,K,8,0,1,3)}),gl(CY),gl(MG),gl(YL),
      F(8,6,g=>{px(g,BR,0,0,8,6);px(g,TN,0,0,8,1);px(g,K,0,3,8,1);px(g,YL,3,2,2,2)})];
    S.near=[N(3,9,g=>{px(g,GD,1,0,1,9);px(g,LG,2,3);px(g,LG,0,6)}),pebble([D,GM,LM]),gl(CY)];
    S.ceil=[F(9,12,g=>{px(g,D,4,0,1,6);px(g,GM,3,6,3,2);ell(g,4.5,9,3.5,3,['#333',CY,'#ccffff',WH])}),N(7,12,g=>{px(g,K,1,0,1,8);px(g,D,3,0,1,12);px(g,CY,3,12,1,1);px(g,GM,5,0,1,6);px(g,YL,5,6,1,1)}),F(10,6,g=>{px(g,D,0,0,10,2);px(g,rd,1,2,8,1);px(g,OR,2,2,2,1);px(g,YL,7,2,1,1);px(g,LL,0,0,10,1)})];
    S.props=[
      F(14,24,g=>{px(g,D,5,0,4,24);px(g,GM,5,0,1,24);px(g,LM,5,3,4,1);px(g,LM,5,12,4,1);px(g,D,2,20,10,4);px(g,GM,2,20,10,1);px(g,YL,6,8,2,1)}),
      F(20,16,g=>{px(g,BR,0,6,20,10);px(g,TN,0,6,20,2);px(g,K,0,11,20,1);px(g,K,9,6,1,10);px(g,YL,3,8,3,1);px(g,OR,12,13,5,1);px(g,BR,4,0,12,6);px(g,TN,4,0,12,1);px(g,K,10,0,1,6)}),
      F(8,30,g=>{px(g,GM,3,6,2,24);px(g,LL,3,6,1,24);px(g,D,0,28,8,2);line(g,LL,4,6,0,2);line(g,LL,4,6,7,3);ell(g,4,2,2,2,[cy,CY,WH,WH])}),
      F(12,26,g=>{px(g,D,5,4,2,22);px(g,GM,0,2,12,3);px(g,LL,0,2,12,1);ell(g,6,8,5,3,[BR,OR,YL,WH]);px(g,WH,4,7,2,1);px(g,D,3,22,6,4)}),
      F(26,14,g=>{px(g,D,0,8,26,6);px(g,GM,0,8,26,1);px(g,K,3,10,8,3);px(g,CY,4,11,6,1);px(g,K,15,10,8,3);px(g,rd,16,11,2,1);px(g,OR,19,11,2,1);px(g,LG,3,3,5,5);px(g,GR,3,3,5,1);px(g,GD,8,2,3,6);px(g,LG,10,0,3,3)}),
      F(16,26,g=>{ell(g,8,5,6,5,[GD,GR,LG,PG]);thick(g,GR,8,5,8,26,2);for(let i=0;i<4;i++){px(g,LG,2+(i&1)*10,10+i*4,4,1);px(g,CY,3+(i&1)*9,9+i*4,2,2)}px(g,CY,7,4,2,2)})];
  }else if(idx===3){
    S.inner=[rock(['#0a0204','#2a0a08','#68372b','#9a3a3a']),pebble(['#1c0808',BR,rd]),F(7,7,g=>{ell(g,3.5,3.5,3,3,[rd,OR,YL,WH])}),gem(['#2a0a08',rd,OR,YL]),skull(LL,GM),bone(LL,GM),gl(YL),gl(OR),gl(RD),
      F(8,6,g=>{ell(g,4,3,4,3,['#0a0204',D,GM,LM]);px(g,OR,2,3,4,1);px(g,YL,3,3,1,1)})];
    S.near=[root('#2a0a08',BR),pebble(['#1c0808',BR,rd]),gl(OR)];
    S.ceil=[F(7,12,g=>{poly(g,[[0,0],[7,0],[4,12]],['#0a0204','#1c0808','#2a0a08',BR]);px(g,OR,4,10,1,2);px(g,YL,4,11)}),F(5,8,g=>{poly(g,[[0,0],[5,0],[3,8]],['#0a0204','#1c0808','#2a0a08',BR]);px(g,rd,3,6)}),N(3,9,g=>{px(g,OR,1,0,1,6);px(g,YL,1,6,1,2);px(g,WH,1,8)})];
    S.props=[
      F(18,34,g=>{poly(g,[[2,34],[7,2],[9,0],[13,6],[16,34]],['#050104','#1c0808','#2a0a08','#68372b']);px(g,OR,8,10,1,12);px(g,YL,8,14,1,3);px(g,rd,5,24,6,1)}),
      F(26,14,g=>{ell(g,13,10,13,6,[K,'#1c0808',BR,rd]);px(g,OR,6,9,14,1);px(g,YL,10,9,3,1);ell(g,13,4,5,3,[rd,OR,YL,WH]);px(g,WH,12,3,2,1)}),
      F(22,26,g=>{for(let i=0;i<4;i++){const x=1+i*5,hgt=14+((i*5)%3)*4;px(g,['#1c0808','#2a0a08','#3a1410','#1c0808'][i],x,26-hgt,4,hgt);px(g,BR,x,26-hgt,1,hgt);px(g,i&1?OR:rd,x+1,26-hgt,2,1)}}),
      F(16,22,g=>{poly(g,[[0,22],[3,10],[8,4],[13,10],[16,22]],['#0a0204','#1c0808','#2a0a08',BR]);px(g,OR,7,6,2,12);px(g,YL,7,8,1,4);px(g,rd,3,14,4,1)}),
      F(12,18,g=>{px(g,GM,2,12,8,6);px(g,LM,2,12,8,1);px(g,K,4,13,4,3);px(g,OR,5,14,2,1);px(g,D,0,16,12,2);px(g,rd,3,8,6,4);px(g,OR,4,6,4,3);px(g,YL,5,4,2,3)})];
  }else{
    S.inner=[F(8,8,g=>{ell(g,4,4,3.5,3.5,[PU,mg,MG,WH]);ell(g,4,4,1.6,1.6,[K,K,'#3a0a38',PG]);px(g,WH,3,3)}),F(6,8,g=>{ell(g,3,4,2.5,3.5,['#3a0a38',PU,LP,PG])}),pebble([PU,LP,LV]),skull(LV,PU),bone(LV,PU),ribs(LV,PU),gl(PG),gl(MG),gl(CY),
      F(7,7,g=>{ell(g,3.5,3.5,3,3,['#3a0a38','#2c5a2c',GR,PG]);px(g,WH,2,2)})];
    S.near=[root('#6f3d86','#3a0a38'),pebble([PU,LP,LV]),gl(PG)];
    S.ceil=[N(5,12,g=>{px(g,PU,2,0,1,6);px(g,mg,2,6,1,4);ell(g,2.5,10,2,2,['#3a0a38',mg,PG,WH])}),F(7,11,g=>{poly(g,[[0,0],[7,0],[4,11]],[PU,mg,MG,PG])}),N(3,9,g=>{px(g,PG,1,0,1,6);px(g,WH,1,7)})];
    S.props=[
      F(14,26,g=>{px(g,PU,5,4,4,22);px(g,mg,5,4,1,22);px(g,'#3a0a38',8,4,1,22);ell(g,7,4,6,5,['#3a0a38',mg,PG,WH]);px(g,K,6,3,3,3);px(g,PG,7,4)}),
      F(20,22,g=>{for(let i=0;i<4;i++){ell(g,4+(i%2)*7+(i>>1)*2,16-(i>>1)*8,4,5,['#3a0a38',PU,mg,PG,WH])}}),
      F(26,28,g=>{for(let i=0;i<3;i++){const x=4+i*9;line(g,mg,x,27,x+(i-1)*4,6);line(g,PU,x+1,27,x+1+(i-1)*4,6);ell(g,x+(i-1)*4,5,2.5,2.5,['#3a0a38',PU,PG,WH])}}),
      F(24,30,g=>{for(let k=0;k<4;k++){px(g,k&1?PU:mg,2,2+k*7,4,3);px(g,k&1?PU:mg,18,2+k*7,4,3);px(g,'#3a0a38',5+(k&1),4+k*7,2,1)}px(g,PU,10,0,4,30);px(g,mg,10,0,1,30)}),
      F(16,18,g=>{ell(g,8,10,7,7,[PU,mg,MG,WH]);ell(g,8,10,3,3,[K,PG,PG,WH]);px(g,K,8,10);px(g,WH,7,9)})];
  }
  return S;
}

/* paint one 256 by 256 pixel chunk of the ground */
function bakeChunk(L,idx,ci,cj){
  const A=SURF.A,Wd=WORLDS[idx],LW=L.LW,LH=L.LH,g=L.g,M=8,CHH=CHW,HH=CHH+2*M,W2=CHW+2*M,X0=ci*CHW-M,Y0=cj*CHH-M;
  if(!A.shade){A.NZ=B.mkNoise(200+idx);A.shade=mkGround(idx,A.NZ);A.back=mkBack(idx,A.NZ);A.stamps=mkStamps(idx,Wd)}
  const FILLC=C32(['#4e2c88','#b86a4c','#3a6ab2','#8a4630','#2a7a64'][idx]),BACKC=C32(['#04141c','#140a1c','#0c1448','#1c1018','#2a0c34'][idx]);
  const RIMC=C32(idx===0?'#d8a0ff':'#7affd0'),NZ=A.NZ,shade=A.shade,back=A.back,DEEPT=C32(['#14042a','#3a0a10','#02040c','#4a1006','#021008'][idx]);
  const sol=(tx,ty)=>tx<0||tx>=LW?(ty>=LH||Wd.ship||Wd.cavern||(ty>=0&&g[ty*LW+(tx<0?0:LW-1)]===1)):ty>=LH?true:ty<0?(Wd.ship||Wd.cavern):g[ty*LW+tx]===1;
  const mask=new Uint8Array(W2*HH),dU=new Uint8Array(W2*HH),dD=new Uint8Array(W2*HH),dL=new Uint8Array(W2*HH),dR=new Uint8Array(W2*HH);
  const tx0=Math.floor(X0/TS),tx1=Math.floor((X0+W2-1)/TS),ty0=Math.max(0,Math.floor(Y0/TS)),ty1=Math.min(LH-1,Math.floor((Y0+HH-1)/TS));
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){
    if(!sol(tx,ty))continue;
    const aU=!sol(tx,ty-1),aD=!sol(tx,ty+1),aL=!sol(tx-1,ty),aR=!sol(tx+1,ty);
    for(let j=0;j<TS;j++){const r=ty*TS+j-Y0;if(r<0||r>=HH)continue;for(let i=0;i<TS;i++){
      if(idx!==2&&((i===0&&j===0&&aU&&aL)||(i===7&&j===0&&aU&&aR)||(i===0&&j===7&&aD&&aL)||(i===7&&j===7&&aD&&aR)))continue;
      const c=tx*TS+i-X0;if(c<0||c>=W2)continue;mask[r*W2+c]=1}}
    /* ragged hanging edge under ceilings */
    if(idx!==2&&aD&&ty+1<LH&&g[(ty+1)*LW+tx]===0)for(let i=0;i<TS;i++){const wx=tx*TS+i,c=wx-X0;if(c<0||c>=W2)continue;const b=Math.max(0,Math.round(NZ.vn(wx*.3,ty*3.1)*4.6-1.2));for(let j=0;j<b;j++){const r=(ty+1)*TS+j-Y0;if(r>=0&&r<HH)mask[r*W2+c]=1}}
  }
  const run=(tx,ty,d)=>{let n=0;while(n<12&&sol(tx,ty+d*(n+1)))n++;return n};
  for(let c=0;c<W2;c++){const tx=(X0+c)>>3,a0=run(tx,Math.floor(Y0/TS),-1),b0=sol(tx,Math.floor((Y0+HH)/TS))?99:0;
    for(let y=0;y<HH;y++){const i=y*W2+c;if(mask[i]){dU[i]=y>0?(mask[i-W2]?Math.min(255,dU[i-W2]+1):0):Math.min(255,a0*8+8)}}
    for(let y=HH-1;y>=0;y--){const i=y*W2+c;if(mask[i]){dD[i]=y<HH-1?(mask[i+W2]?Math.min(255,dD[i+W2]+1):0):b0}}}
  for(let y=0;y<HH;y++){const r=y*W2;for(let c=0;c<W2;c++){const i=r+c;if(mask[i])dL[i]=c>0&&mask[i-1]?Math.min(255,dL[i-1]+1):0}
    for(let c=W2-1;c>=0;c--){const i=r+c;if(mask[i])dR[i]=c<W2-1&&mask[i+1]?Math.min(255,dR[i+1]+1):0}}
  /* a tint per tile that blends smoothly between neighbouring rooms */
  const tx0t=Math.floor(X0/TS),ty0t=Math.floor(Y0/TS),TW=Math.ceil(W2/TS)+1,TH=Math.ceil(HH/TS)+1,ZT=new Array(TW*TH).fill(null),zz=new Uint8Array(TW*TH);
  for(let a=0;a<TH;a++)for(let b=0;b<TW;b++){const wx=(tx0t+b)*TS+4,wy=(ty0t+a)*TS+4,u=wx/CW_/TS-.5,v=wy/CH_/TS-.5,i0=Math.floor(u),j0=Math.floor(v),fx=u-i0,fy=v-j0;
    let r=0,gg=0,bb=0,aa=0;
    for(let q=0;q<4;q++){const ci=i0+(q&1),cj=j0+(q>>1),w=((q&1)?fx:1-fx)*((q>>1)?fy:1-fy);if(ci<0||cj<0||ci>=L.cols||cj>=L.rows)continue;const cc=L.cellOf[cj*L.cols+ci];if(!cc||!cc.zone)continue;const zi=ZNAMES.indexOf(cc.zone),tt=ZTW[idx][zi];if(!tt)continue;const pc=C32(tt[0]);aa+=w*tt[1];r+=w*tt[1]*(pc&255);gg+=w*tt[1]*((pc>>>8)&255);bb+=w*tt[1]*((pc>>>16)&255)}
    if(aa>.01)ZT[a*TW+b]=[((255<<24)|(((bb/aa)|0)<<16)|(((gg/aa)|0)<<8)|((r/aa)|0))>>>0,Math.min(.6,aa)];
    const ci0=clamp(Math.floor(wx/CW_/TS),0,L.cols-1),cj0=clamp(Math.floor(wy/CH_/TS),0,L.rows-1),c0=L.cellOf[cj0*L.cols+ci0];zz[a*TW+b]=c0&&c0.zone?ZNAMES.indexOf(c0.zone):0}
  const out=new Uint32Array(CHW*CHH),litC=C32(Wd.glow||WH);
  for(let y=M;y<M+CHH;y++){const wy=Y0+y,ty=wy>>3,dp=clamp((ty-L.skyRow-8)/(LH-L.skyRow-8),0,1);
    for(let c=M;c<M+CHW;c++){const i=y*W2+c,wx=X0+c,tx=wx>>3;let col=0;
      if(wy<0||wy>=LH*TS){out[(y-M)*CHW+c-M]=0;continue}
      if(mask[i]){
        col=shade(wx,wy,dU[i],dD[i],dL[i],dR[i]);
        if(dU[i]>3&&dL[i]>3&&dR[i]>3&&dD[i]>2)col=mix32(col,FILLC,idx>=2?.16:.55);
        if(idx===4&&dU[i]>2&&((wx&15)===0||((wy+(((wx>>4)&1)<<3))&15)===0))col=mix32(col,K32,.4);
        if(dU[i]===2||dU[i]===3)col=mix32(col,K32,.22);
        if(dL[i]===0)col=mix32(col,WH32,.3);else if(dL[i]===1)col=mix32(col,WH32,.1);
        if(dR[i]===0)col=mix32(col,K32,.4);else if(dR[i]===1)col=mix32(col,K32,.15);
        if(dD[i]===0)col=mix32(col,K32,.45);
        if((idx===0||idx===4)&&dU[i]>1&&(dL[i]===1||dR[i]===1||dD[i]===1))col=mix32(col,RIMC,.5);
        if(dU[i]===0&&idx!==1&&idx!==2)col=mix32(col,WH32,.18);
        if(dU[i]>10)col=mix32(col,DEEPT,Math.min(.42,(dU[i]-10)*.025));
        if(dp>.12)col=mix32(col,DEEPT,Math.min(.5,(dp-.12)*.7));
        {const zt=ZT[(ty-ty0t)*TW+(tx-tx0t)];if(zt)col=mix32(col,zt[0],zt[1]*.45)}
      }else{
        const nb=(c>0&&mask[i-1])||(c<W2-1&&mask[i+1])||(y>0&&mask[i-W2])||(y<HH-1&&mask[i+W2]),nb2=false;
        if(nb)col=K32;
        else if(tx>=0&&tx<LW&&ty<LH&&g[ty*LW+tx]!==1&&!L.sky(tx,ty)){
          /* the cave back wall is drawn on screen as its own opaque layer; here we only bake soft shadow, depth and room tint on top of it */
          let aD=0;for(let k=2;k<=6;k++){if((c>=k&&mask[i-k])||(c<W2-k&&mask[i+k])||(y>=k&&mask[i-k*W2])||(y<HH-k&&mask[i+k*W2])){aD=.62-.1*(k-2);break}}
          if(dp>.1)aD=1-(1-aD)*(1-Math.min(.55,(dp-.1)*.8));
          {const zn=zz[(ty-ty0t)*TW+(tx-tx0t)];if(zn===6||zn===8){if((wy&15)===0||((wx+((wy>>4)&1)*8)&15)===0)aD=Math.max(aD,.28)}else if(zn===7){if(((wx>>4)&3)===0)aD=Math.max(aD,.26)}}
          const zt=ZT[(ty-ty0t)*TW+(tx-tx0t)],aT=zt?zt[1]*.3:0,aa=1-(1-aD)*(1-aT);
          if(aa>.02){const base=aT>0?mix32(K32,zt[0],aT/(aD+aT)):K32;col=((base&0xffffff)|((Math.min(255,aa*255)|0)<<24))>>>0}else col=0}
        else if(tx>=0&&tx<LW&&ty<LH&&g[ty*LW+tx]===0&&Wd.ship&&!(Wd.plant&&Wd.plant.kind==='hive')&&(tx%14===0)){
          const lx=wx&7;col=lx===0||lx===7?C32('#0a1220'):lx===1?C32('#3c5a8a'):lx===6?C32('#101a30'):C32('#1c2a4a');if((wy&15)===3&&lx>1&&lx<6)col=litC}
      }
      out[(y-M)*CHW+c-M]=col}}
  const cv_=cnv(CHW,CHH,()=>{}),cx=cv_.getContext('2d'),id=new ImageData(new Uint8ClampedArray(out.buffer),CHW,CHH);cx.putImageData(id,0,0);
  /* buried things */
  const ST=A.stamps,ox=ci*CHW,oy=cj*CHH,stamp=(im,x,y)=>cx.drawImage(im,Math.round(x-ox),Math.round(y-oy));
  const ta=Math.floor(ox/TS)-4,tb=Math.floor((ox+CHW)/TS)+4,tya=Math.max(1,Math.floor(oy/TS)-4),tyb=Math.min(LH-2,Math.floor((oy+CHH)/TS)+4);
  for(let tx=Math.max(2,ta);tx<=Math.min(LW-3,tb);tx++)for(let ty=tya;ty<=tyb;ty++){
    if(g[ty*LW+tx]!==1)continue;
    const h=hh(tx,ty,idx+40),h2=hh(tx,ty,idx+90);
    let intr=true;for(let j=-1;j<=1&&intr;j++)for(let i=-1;i<=1;i++)if(g[(ty+j)*LW+tx+i]!==1){intr=false;break}
    if(intr&&h<.012){let u=0;while(ty-u-1>0&&g[(ty-u-1)*LW+tx]===1&&u<4)u++;
      if(u>=2){const im=ST.inner[(h2*ST.inner.length)|0];stamp(im,tx*TS+4-im.width/2+((hh(tx,ty,7)*6-3)|0),ty*TS+4-im.height/2)}}
    else if(h>.93&&g[(ty-1)*LW+tx]===0&&g[ty*LW+tx-1]===1&&g[ty*LW+tx+1]===1){const im=ST.near[(h2*ST.near.length)|0];stamp(im,tx*TS+4-im.width/2,ty*TS+2)}
    else if(h>.80&&h<.9&&g[(ty+1)*LW+tx]===0&&ST.ceil.length&&ty+1<LH){const im=ST.ceil[(h2*ST.ceil.length)|0];stamp(im,tx*TS+4-im.width/2,ty*TS+7)}
  }
  /* props standing on the surface */
  for(let tx=Math.max(14,ta);tx<=Math.min(LW-20,tb);tx++){
    const h=hh(tx,3,idx+200);if(h>(idx===1?.14:.07))continue;
    const ty=L.top?L.top[tx]:-1;if(ty<0)continue;
    let ok=true;for(let i=-3;i<=3;i++)if(L.top[tx+i]!==ty)ok=false;
    if(!ok||g[(ty-1)*LW+tx]!==0||g[ty*LW+tx]!==1)continue;
    const im=ST.props[(hh(tx,5,idx)*ST.props.length)|0];stamp(im,tx*TS+4-im.width/2,ty*TS+2-im.height)}
  return cv_;
}

/* ---------------- state ---------------- */
const SURF={on:false,L:null,W:null,assets:{}};
window.SURF=SURF;SURF.gen=genLevel;SURF.bake=(L,i,ci,cj)=>bakeChunk(L,i,ci,cj);SURF.analyze=analyzeLevel;
function sv(){SAVE.surf=SAVE.surf||{};const s=SAVE.surf;s.done=s.done||[0,0,0,0,0];s.green=s.green||0;s.seen=s.seen||{};s.reward=s.reward||0;s.kills=s.kills||0;s.cp=s.cp||{};s.pieces=s.pieces||[0,0,0,0,0,0];s.intro=s.intro||{};s.lore=s.lore||{};s.met=s.met||{};s.sec=s.sec||{};s.q=s.q||{};s.perk=s.perk||[0,0,0,0,0];s.shop=s.shop||{};s.map=s.map||{};s.map3=s.map3||{};s.full=s.full||{};s.shiny=s.shiny||{};if(s.lay!==3){s.cp={};s.lay=3}   // the levels were rebuilt much bigger, so old beam pad positions no longer fit
  return s}
SURF.state=sv;
const PIECE_NAMES=['HULL','ENGINE','REACTOR','WINGS','COCKPIT','WEAPON CORE'];SURF.PIECE_NAMES=PIECE_NAMES;
SURF.pieceIds=i=>i===4?[4,5]:[i];
SURF.piecesFound=()=>{const p=sv().pieces;let n=0;for(let i=0;i<6;i++)if(p[i])n++;return n};
SURF.pieceStatus=i=>{const p=sv().pieces,ids=SURF.pieceIds(i),f=ids.filter(k=>p[k]).length;return ids.length===1?(f?'PIECE: FOUND':'PIECE: NOT FOUND YET'):'PIECES: '+f+' OF 2 FOUND'};
SURF.rewardReady=()=>SURF.allDone()&&SURF.piecesFound()>=6;
function mkPieceIcons(){
  const mk=(fn)=>fin(cnv(14,11,fn));
  const I=[
   mk(g=>{poly(g,[[0,5],[3,1],[11,1],[13,5],[11,9],[3,9]],[D,GM,LM,LL]);px(g,CY,8,3,3,2);px(g,K,3,5,6,1)}),                                    // hull
   mk(g=>{px(g,GM,1,2,8,7);px(g,LL,1,2,8,1);px(g,D,1,8,8,1);poly(g,[[9,2],[13,0],[13,10],[9,9]],[OR,YL,WH]);px(g,K,3,4,2,3)}),                      // engine
   mk(g=>{ell(g,6.5,5.5,5,5,[VI,BL,CY,WH]);px(g,YL,1,5,11,1);px(g,K,6,2,1,7)}),                                                                    // reactor
   mk(g=>{poly(g,[[0,10],[6,5],[13,0],[13,4],[8,8],[4,10]],[PU,LP,LV,WH]);px(g,K,7,5,1,1)}),                                                          // wings
   mk(g=>{ell(g,6.5,5,6,5,[NV,BL,CY,WH]);px(g,GM,0,8,14,2);px(g,WH,4,2,2,2)}),                                                                      // cockpit
   mk(g=>{poly(g,[[0,4],[8,4],[8,7],[0,7]],[D,GM,LM]);px(g,RD,8,3,5,5);px(g,WH,10,4,2,2);px(g,rd,3,8,3,2)})];                                       // weapon core
  return I.map(c=>({on:c,off:B.darken(c,.82),w:c.width,h:c.height}));
}
SURF.unlocked=i=>{const s=sv();return i===0?true:!!s.done[i-1]};
SURF.allDone=()=>sv().done.every(v=>v);
SURF.assets_=idx=>{
  if(SURF.assets[idx])return SURF.assets[idx];
  const Wd=WORLDS[idx],a={};
  a.tiles=mkTiles(Wd);a.plants=mkPlants(Wd);{const fl_=mkFlora(Wd,idx);a.plants.flo=fl_.flo;a.plants.tall=fl_.tall;a.plants.hang=a.plants.hang.concat(fl_.hang)}a.decor=mkDecor(Wd,idx);a.player=SURF.player||(SURF.player=mkPlayer());
  a.en=Wd.en.map(mkEnemySprite);
  a.sky=cnv(VW,VH,g=>{for(let j=0;j<VH;j++)for(let i=0;i<VW;i++){px(g,rampAt(Wd.sky,1-(j/VH)*.9+(((i*3+j)%4)/40),i,j),i,j)}});
  const R=rng(300+idx);
  /* three layers of hills that tile sideways, each with silhouettes and a haze toward the sky */
  const hz=Wd.sky[1],hzC=Wd.sky[2];
  const layerCols=[Wd.ridge[0],Wd.ridge[1],[Wd.rock[0],Wd.rock[1]]];
  a.far=[0,1,2].map(l=>cnv(320,120,g=>{
    const nz=B.mkNoise(40+idx*3+l),col=layerCols[l],hr=rng(70+idx*5+l);
    const hgt=i=>{const an=i/320*TAU;return 34+nz.fbm(Math.cos(an)*1.05+l*7,Math.sin(an)*1.05,3)*(50-l*9)};
    for(let i=0;i<320;i++){const h=hgt(i);for(let j=Math.floor(120-h);j<120;j++){const d=j-(120-h);px(g,d<2?col[1]:d<5&&(i+j)%2?col[1]:col[0],i,j)}}
    /* silhouettes standing on the hills */
    const nP=idx===0?7:idx===1?5:6;
    for(let k=0;k<nP;k++){const x=Math.floor(k*320/nP+hr()*20),y=Math.floor(120-hgt(x));
      if(idx===0){const hh=14+((hr()*18)|0)+l*3,w=5+((hr()*5)|0);px(g,col[0],x,y-hh,2,hh+2);ell(g,x+1,y-hh,w,Math.max(3,w*.55),[col[0],col[0],col[1]]);px(g,col[1],x-w+1,y-hh,w*2-1,1)}
      else if(idx===1){const hh=12+((hr()*16)|0)+l*3,w=12+((hr()*14)|0);poly(g,[[x,y+2],[x+3,y-hh],[x+w-3,y-hh],[x+w,y+2]],[col[1],col[0],col[0]]);px(g,col[1],x+3,y-hh,w-6,1)}
      else if(idx===2||idx===4){}}
    /* haze: the lowest part of each hill blends into the sky colour */
    const hc=C32(l===0?hzC:hz);for(let j=70;j<120;j++)for(let i=0;i<320;i++){const dv=(j-70)/50*.55;if(dv>B4[j&3][i&3]/16*.9)px(g,l===0?hzC:hz,i,j)}
  }));
  a.cloud=[0,1,2].map(k=>cnv(70+k*14,18+k*2,g=>{const w=70+k*14,h=18+k*2,cr=rng(500+idx*7+k);const nz=B.mkNoise(520+idx*5+k);const ramp=idx===0?['#6f3d86','#cc99ff','#ff77ff','#ffffff']:['#ffffff','#ffffaa','#ffffcc','#ffffff'];
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const e=Math.pow(Math.abs((i-w/2)/(w/2)),1.4)+Math.pow(Math.abs((j-h*.55)/(h*.5)),1.8);const v=nz.fbm(i*.09,j*.16,3)-e*.62;if(v>.12){px(g,rampAt(ramp,(1-j/h)*.7+v*.5,i,j),i,j)}}}));
  /* indoor worlds: a layer of ribs, pipes or rock teeth between the far wall and the ground */
  if(Wd.ship||Wd.cavern){const hive=Wd.plant&&Wd.plant.kind==='hive',rk=Wd.wallc||Wd.rock;
    a.ribs=cnv(200,200,g=>{const rr=rng(900+idx);
      for(let k=0;k<5;k++){const x=Math.floor(k*40+rr()*14);
        if(idx===2){px(g,'#0a1220',x,0,7,200);px(g,'#1c2a4a',x+1,0,2,200);px(g,'#2c4a6a',x+1,0,1,200);px(g,'#05080f',x+6,0,1,200);for(let y=14;y<200;y+=34){px(g,'#101a30',x-2,y,11,5);px(g,'#2c4a6a',x-2,y,11,1);px(g,CY,x+2,y+2,3,1)}
          for(let y=0;y<200;y+=2)px(g,'#05080f',x+2+(y>>3)%3,y)}
        else if(idx===3){for(const up of [0,1]){const hh=26+((rr()*40)|0),w=7+((rr()*7)|0);const y0=up?200:0;poly(g,up?[[x-w,y0],[x,y0-hh],[x+w,y0]]:[[x-w,y0],[x+w,y0],[x,y0+hh]],['#0a0204','#1c0808','#2a0a08','#3a1410']);px(g,rd,x,up?y0-hh:y0+hh-3,1,3);px(g,OR,x,up?y0-hh:y0+hh-1,1,1)}}
        else{const sw=(y,ph)=>Math.round(Math.sin(y*.05+ph)*5);for(let y=0;y<200;y++){const xx=x+sw(y,k);px(g,'#1c0420',xx,y,6,1);px(g,'#6f3d86',xx+1,y,1,1);px(g,mg,xx+3,y,1,y%9===0?1:0);if(y%23===0)ell(g,xx+3,y,4,4,['#1c0420','#6f3d86',mg,PG])}}}});}
  a.wall=cnv(128,96,g=>{
    const R2=rng(90+idx),rk=Wd.wallc||Wd.rock,hive=Wd.plant&&Wd.plant.kind==='hive';
    for(let j=0;j<96;j++)for(let i=0;i<128;i++)px(g,rampAt([rk[0],rk[0],rk[1]],.15+((i*3+j*5)%7)/22,i,j),i,j);
    if(Wd.ship&&!hive){
      for(let py=0;py<96;py+=32)for(let pxx=0;pxx<128;pxx+=32){px(g,rk[1],pxx,py,32,1);px(g,K,pxx,py+1,32,1);px(g,rk[1],pxx,py,1,32);px(g,K,pxx+1,py,1,32);for(const [rx,ry] of [[3,3],[28,3],[3,28],[28,28]])px(g,rk[2],pxx+rx,py+ry,2,2)}
      for(let i=0;i<6;i++){const wx=8+((i*53)%104),wy=6+((i*29)%80);px(g,K,wx,wy,3,12);px(g,rk[1],wx+3,wy,1,12);px(g,Wd.glow,wx+1,wy+3,1,1)}      // vents and pipes
      for(let i=0;i<3;i++){const wx=6+i*42,wy=10+(i%2)*30;px(g,K,wx,wy,24,14);px(g,'#05021a',wx+1,wy+1,22,12);for(let k=0;k<6;k++)px(g,[WH,CY,YL][k%3],wx+3+((k*7)%18),wy+2+((k*5)%9),1,1);px(g,rk[3],wx,wy,24,1)}  // windows onto space
    }else{
      if(hive)for(let i=0;i<9;i++){const x0=(R2()*128)|0;for(let j=0;j<96;j++){const xx=(x0+Math.sin(j*.15+i)*5)|0;px(g,rk[2],mod(xx,128),j,2,1);px(g,rk[3],mod(xx,128),j,1,1)}}
      for(let i=0;i<50;i++){const cxx=((R2()*128)|0),cyy=((R2()*96)|0),rr=1+((R2()*4)|0);ell(g,cxx,cyy,rr+1,rr,[rk[0],rk[1],rk[2]])}
      for(let i=0;i<3;i++){const x0=(R2()*128)|0;line(g,rk[2],x0,0,x0+(R2()*6-3),96)}                                                                            // glowing cracks
    }});
  const lazy=(o,k,fn)=>{let v;Object.defineProperty(o,k,{get(){return v||(v=fn())},set(x){v=x},configurable:true,enumerable:true})};
  lazy(a,'deco',()=>mkDeco(idx,Wd));
  a.skyobj=cnv(110,60,g=>{
    if(idx===0){ell(g,55,30,22,22,[VI,PU,mg,MG,WH]);for(let i=0;i<110;i++){const an=i/110*TAU;if(Math.sin(an)>0||Math.abs(Math.cos(an))>.4)px(g,i%2?YL:OR,55+Math.cos(an)*38,30+Math.sin(an)*9,2,1)}}
    else if(idx===1){ell(g,36,28,16,16,[OR,YL,WH,WH]);ell(g,82,38,8,8,[RD,OR,YL,WH])}
    else{}});
  a.vsky=mkSkyVista(idx);a.vwall=mkWallVista(idx);
  a.pieceIcons=mkPieceIcons();lazy(a,'fx',()=>mkFeatAssets(Wd,idx,a.tiles));lazy(a.en,5,()=>a.fx.mimic);lazy(a.en,6,()=>mkBossSprite(idx));a.en.slice(0,5).forEach(q=>{lazy(q,'gd',()=>q.fr.map(i=>tintOf(i,'#ffd24a',.55)))});
  a.coin=fin(cnv(8,8,g=>{ell(g,4,4,3.6,3.6,['#2c8a3a','#7aee66','#ddff99','#ffffff']);px(g,'#ffffff',2,2,2,1);px(g,'#1c5a2c',5,5,1,2)}));
  a.chest=[fin(cnv(14,10,g=>{poly(g,[[0,4],[14,4],[14,10],[0,10]],['#d89a50',TN,BR]);poly(g,[[0,0],[14,0],[14,5],[0,5]],[YL,'#e8a838',OR]);px(g,'#7a4a1c',0,4,14,1);px(g,'#ffe08a',0,0,14,1);px(g,'#ffe08a',2,4,1,6);px(g,'#ffe08a',11,4,1,6);px(g,'#ffffff',6,4,2,3);px(g,K,7,5,1,2)})),
    fin(cnv(14,11,g=>{poly(g,[[0,6],[14,6],[14,11],[0,11]],['#d89a50',TN,BR]);px(g,'#ffe08a',2,6,1,5);px(g,'#ffe08a',11,6,1,5);px(g,'#ccff99',2,0,10,6);px(g,'#ffffff',4,1,3,2);px(g,GREEN[3],8,2,2,3);px(g,GREEN[2],3,4,8,1)}))];
  a.beacon=cnv(18,28,g=>{poly(g,[[3,28],[15,28],[13,10],[5,10]],[D,GM,LM,LL]);ell(g,9,7,6,6,[NV,GR,LG,WH]);px(g,GREEN[4],8,5,2,2)});
  SURF.assets[idx]=a;return a;
};

/* ---------------- starting a visit ---------------- */
SURF.start=function(idx){
  const s=sv();SURF.idx=idx;SURF.W=WORLDS[idx];SURF.A=SURF.assets_(idx);
  const L=SURF.L=genLevel(idx);
  L.chests.forEach(c=>c.open=0);
  const cp=s.cp[idx];
  SURF.p={x:L.start.x,y:L.start.y,vx:0,vy:0,w:10,h:16,face:1,on:false,coy:0,jb:0,fire:0,hp:6,mhp:6,inv:0,anim:0,ride:null,safe:{x:L.start.x,y:L.start.y},sf:0,dead:0,jumpHeld:false};
  if(cp&&cp.x){SURF.p.x=cp.x;SURF.p.y=cp.y-16;SURF.p.safe={x:cp.x,y:cp.y-16}}
  SURF.en=[];SURF.bul=[];SURF.eb=[];SURF.fx=[];SURF.txt=[];SURF.coinsFly=[];
  SURF.cam={x:Math.max(0,SURF.p.x-140),y:Math.max(0,SURF.p.y-110)};
  SURF.cut={mode:'in',t:0,hx:SURF.p.x+5,hy:Math.max(12,SURF.p.y-64)};SURF.p.hidden=true;
  SURF.visit=0;SURF.t=0;SURF.msg=[WORLDS[idx].n,3];SURF.beam=null;SURF.done=0;SURF.help=10;
  SURF.srow=null;SURF.guard=null;SURF.touch={};SURF.fireDown=false;
  SURF.intro={t:0,first:!s.intro[idx]};s.intro[idx]=1;SURF.pieceBanner=null;
  L.spawns.forEach(sp=>{sp.e=null;sp.t=0});
  L.chests.forEach(c=>c.open=0);
  for(const c of L.checks)c.on=(cp&&Math.abs(c.x-cp.x)<4)?1:0;
  featStart();SURF.rb=null;SURF.skyK=null;SURF.srow=null;SURF.ztc=null;SURF.darkA=0;
  SURF.on=true;MODE='surface';UI.focus=0;
};
function addEnemy(spec,x,y,elite){
  const Wd=SURF.W,sp=Wd.en[spec],A=SURF.A.en[spec],sc=elite?1.7:1;
  const hpm=1+SURF.idx*.35;
  if(sp.fly)y-=26;
  const e={sp,A,x,y,vx:0,vy:0,w:Math.round(sp.w*sc)-2,h:Math.round(sp.h*sc)-1,hp:sp.hp*hpm*(elite?7:1),face:-1,t:Math.random()*6,cd:rnd(.5,2),st:0,on:false,elite:!!elite,y0:y,flash:0,home:x,spec,k:spec,sc};
  e.mhp=e.hp;SURF.en.push(e);return e;
}
const rnd=(a,b)=>a+Math.random()*(b-a);
/* ---------------- tiles, collision ---------------- */
function tile(x,y){const L=SURF.L;if(x<0||x>=L.LW)return 1;if(y<0)return 0;if(y>=L.LH)return 1;return L.g[y*L.LW+x]}
const solidT=t=>t===1||t===6||t===11||t===13;
function hitsSolid(x,y,w,h){const L=SURF.L,x0=Math.floor(x/TS),x1=Math.floor((x+w-.01)/TS),y0=Math.floor(y/TS),y1=Math.floor((y+h-.01)/TS);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const t=tile(tx,ty);if(solidT(t))return true}return false}
/* ---------------- input ---------------- */
function inp(){
  const k=UI.keys,T=SURF.touch||{};
  const l=!!(k.arrowleft||k.a||T.l||PAD.x<0),r=!!(k.arrowright||k.d||T.r||PAD.x>0);
  const jump=!!(k[' ']||k.w||k.k||k.arrowup||T.j||(PAD.prev&&PAD.prev.A)),fire=!!(k.x||k.j||k.z||k.r||k.enter||k.control||T.f||SURF.mouseFire||(PAD.prev&&(PAD.prev.X||PAD.prev.B||PAD.prev.RB||PAD.prev.RT)));
  const up=!!(k.arrowup||k.w||k.i||T.u||PAD.y<0),down=!!(k.arrowdown||k.s||T.d||PAD.y>0);
  const jumpB=!!(k[' ']||k.k||T.j||(PAD.prev&&PAD.prev.A));
  return{l,r,jump,jumpB,fire,up,down}
}
/* ---------------- update ---------------- */
SURF.key=function(k){
  const rep=typeof INP!=='undefined'&&INP.repeat,pad=typeof INP!=='undefined'&&INP.last==='pad';
  if(SURF.modal){if(rep)return;if(k==='enter'||k==='e'||k===' ')SURF.kOK=true;else if(k==='b'||k==='escape'||k==='p'||k==='t')SURF.kBack=true;return}
  if(k==='b'||k==='escape'||k==='t'||k==='p'){if(!rep&&!SURF.cut)openPause();return}
  if(k==='g'){const p=SURF.p;if(p&&p.dead<=0&&SURF.t-(SURF.rt||-9)>3){SURF.rt=SURF.t;const cp=sv().cp[SURF.idx];p.x=cp?cp.x:SURF.L.start.x;p.y=(cp?cp.y-16:SURF.L.start.y);p.vx=p.vy=0;p.ride=null;p.inv=1;SURF.msg=['BACK AT THE LAST BEAM PAD',1.6]}return}
  if(k==='enter'||k==='e'){const L=SURF.L,p=SURF.p;if(L.exit&&Math.abs(p.x-L.exit.x)<20&&Math.abs(p.y+8-L.exit.y)<24){tryExit();return}
    if(!rep&&SURF.near){SURF.useReq=true;if(pad)SURF.noJump=.2}}
};
function tryExit(){
  const L=SURF.L,s=sv();
  if(SURF.done)return;
  if(SURF.guard&&SURF.guard.hp>0){SURF.msg=['THE GUARDIAN BLOCKS THE BEACON',2.2];return}
  SURF.done=1;L.exit.open=1;s.done[SURF.idx]=1;const bonus=400+SURF.idx*300;s.green+=bonus;SURF.visit+=bonus;
  SURF.msg=['LEVEL CLEAR  +'+bonus+' GREEN GOLD',3.5];delete s.cp[SURF.idx];
  for(let i=0;i<30;i++)SURF.fx.push({x:L.exit.x+9,y:L.exit.y-14,vx:rnd(-60,60),vy:rnd(-110,-20),life:1.2,c:GREEN[i%5],s:2});
  SURF.endT=3.2;
  if(s.done.every(v=>v)&&SURF.piecesFound()<6){const n=SURF.piecesFound();SURF.banner={t:8,lines:['YOU ARE MISSING SHIP PIECES:',n+' OF 6 FOUND.','SEARCH THE LEVELS FOR THE REST.']};SURF.endT=7}
  save();
}
SURF.beamUp=function(){
  if(SURF.cut&&SURF.cut.mode==='out')return;const p=SURF.p;SURF.modal=null;
  SURF.cut={mode:'out',t:0,hx:p.x+5,hy:Math.max(12,p.y-64),py0:p.y,px0:p.x};try{sfxTone(300,700,.5,'sine',.04,{att:.01})}catch(e){}
};
function leave(){
  SURF.on=false;MODE='hub';HUB.screen='transporter';UI.focus=0;save(true);
}
SURF.tick=function(dt){
  dt=Math.min(dt,1/30);const L=SURF.L,p=SURF.p,s=sv();
  SURF.t+=dt;L.tick+=dt;
  if(SURF.banner){SURF.banner.t-=dt;if(SURF.banner.t<=0)SURF.banner=null}
  if(SURF.msg&&SURF.msg[1]>0)SURF.msg[1]-=dt;if(SURF.help>0)SURF.help-=dt;
  if(SURF.cut){const c=SURF.cut;c.t+=dt;
    if(c.mode==='in'){if(!c.dropped&&c.t>=1.1){c.dropped=1;p.hidden=false;p.x=c.hx-5;p.y=c.hy+10;p.vx=p.vy=0;try{sfxTone(500,200,.3,'sine',.03,{att:.005})}catch(e){}}if(c.t>=2.7)SURF.cut=null}
    else{if(c.t>.9&&c.t<1.7){const u=(c.t-.9)/.8,e=u*u*(3-2*u);p.x=c.px0+(c.hx-5-c.px0)*e;p.y=c.py0+(c.hy+10-c.py0)*e}
      if(c.t>=1.7)p.hidden=true;if(c.t>=2.7){leave();return}}}
  if(SURF.intro){SURF.intro.t+=dt;if(SURF.intro.t>9)SURF.intro=null}
  if(SURF.endT>0){SURF.endT-=dt;if(SURF.endT<=0){SURF.beamUp()}}
  const I=inp();if(SURF.intro&&SURF.intro.t>.8&&(I.l||I.r||I.jump||I.fire||I.up||I.down||Object.keys(UI.keys).length))SURF.intro=null;
  const beamed=false,locked=!!(SURF.cut&&(SURF.cut.mode==='out'||!SURF.cut.dropped));
  if(SURF.noJump>0){SURF.noJump-=dt;I.jump=false;I.jumpB=false}
  if(SURF.modal&&!locked){modalTick(dt,I);return}
  /* lifts */
  for(const q of L.lifts){const dist=Math.abs(q.b-q.a),per=dist/q.sp*2+1.4;let u=((L.tick+q.ph)%per)/per;
    let f=u<.5?u*2:(1-u)*2;f=f<.1?0:f>.9?1:(f-.1)/.8;const ease=f*f*(3-2*f),pos=q.a+(q.b-q.a)*ease;
    const ox=q.x,oy=q.y;if(q.axis==='h')q.x=pos;else q.y=pos;q.dx=q.x-ox;q.dy=q.y-oy;if(q.px==null){q.dx=0;q.dy=0}q.px=1}
  /* crumbling tiles come back */
  for(const k in L.crum){const c=L.crum[k];c.t-=dt;if(c.state==='shake'&&c.t<=0){L.g[k]=0;c.state='gone';c.t=4}else if(c.state==='gone'&&c.t<=0){const ty=Math.floor(k/L.LW),tx=k%L.LW;if(!(p.x+p.w>tx*TS&&p.x<tx*TS+TS&&p.y+p.h>ty*TS&&p.y<ty*TS+TS)){L.g[k]=6;delete L.crum[k]}else c.t=.5}}
  /* player */
  if(locked){/* the ship has the astronaut */}
  else if(p.dead>0){p.dead-=dt;if(p.dead<=0){p.x=p.safe.x;p.y=p.safe.y;p.vx=p.vy=0;p.hp=p.mhp;p.inv=1.5}}
  else{
    const sp=(p.inW?58:82)*(s.perk[1]?1.1:1);let ax=(I.r?1:0)-(I.l?1:0);if(beamed)ax=0;
    /* ladders: grab with up or down, climb with up and down, jump to let go */
    /* a ladder counts if any part of the body is over it, so it is easy to grab; once on it you stay on it */
    const cands=[Math.floor((p.x+p.w/2)/TS),Math.floor((p.x+1)/TS),Math.floor((p.x+p.w-1)/TS)];
    if(p.lad&&p.lcol!=null)cands.unshift(p.lcol);
    let lcx=cands[0],onL=false,belowL=false;
    for(const c of cands){if(tile(c,Math.floor((p.y+8)/TS))===7){lcx=c;onL=true;break}}
    if(!onL)for(const c of cands){if(tile(c,Math.floor((p.y+p.h+1)/TS))===7){lcx=c;belowL=true;break}}
    if(p.lgr>0)p.lgr-=dt;
    if(!p.lad){if(!(p.lgr>0)&&((I.up&&onL)||(I.down&&(onL||(p.on&&belowL))))){p.lad=true;p.lcol=lcx;p.vx=0;p.vy=0;p.on=false;if(!onL)p.y+=5;p.jb=0;p.jumpHeld=true;p.lsd=0;p.lg=.12;p.x=clamp(p.x+(((lcx*TS+4-p.w/2)-p.x)*.6),2,L.LW*TS-p.w-2)}}
    else if(!onL&&!(I.down&&belowL)){
      const rt=Math.floor((p.y+p.h-1)/TS);
      if(I.up&&tile(lcx,rt)===7&&tile(lcx,rt-1)!==7){p.y=rt*TS-p.h;p.vy=0;p.on=true;p.lad=false;p.coy=.09}   // climbed out onto the top rung
      else if((p.lg-=dt)<=0)p.lad=false}
    else p.lg=.12;
    if(p.lad){
      p.lcol=lcx;p.vx=0;if(ax)p.face=ax;
      p.vy=I.up?-70:I.down?70:0;p.lcl=(p.lcl||0)+(p.vy?dt*8:0);
      p.x+=((lcx*TS+4-p.w/2)-p.x)*Math.min(1,dt*22);   // always pulled to the middle of the ladder
      p.lsd=ax?(p.lsd||0)+dt:0;   // sideways has to be held for a moment to step off, so a bump does not drop you
      if(p.lsd>.4){p.lad=false;p.lgr=.3;p.vx=ax*70;p.vy=0}
      if(I.jumpB&&!p.lj){p.lad=false;p.lgr=.25;p.vy=-175;p.jb=0;p.jumpHeld=true;p.vx=ax*80;try{sfxTone(260,520,.1,'square',.02,{att:.002})}catch(e){}}
      p.lj=I.jumpB;
    }else{p.vx+=((ax*sp)-p.vx)*Math.min(1,dt*(p.on?14:7));if(ax)p.face=ax;p.lj=I.jumpB}
    if(p.ride){p.x+=p.ride.dx;p.y+=p.ride.dy;if(Math.abs(p.vx)<1){const off=p.x-p.ride.x;p.x+=Math.round(off)-off}}   // standing still on a lift: stay a whole pixel from its edge, so the sprite does not flicker against it
    p.inW=tile(Math.floor((p.x+p.w/2)/TS),Math.floor((p.y+10)/TS))===10;
    if(p.inW&&!p.lad){   // swimming: slow, floaty, hold jump to rise
      p.vy+=(I.jump?-520:130)*dt;if(p.vy>46)p.vy=46;if(p.vy<-78)p.vy=-78;p.vx*=1-dt*2.4;
      if(Math.random()<dt*7)SURF.fx.push({x:p.x+p.w/2+rnd(-3,3),y:p.y+3,vx:rnd(-6,6),vy:-30,life:.9,c:'#d0ffff',s:1,b:1})}
    else if(!p.lad){p.vy+=430*dt*gravK();if(p.vy>320)p.vy=320}
    /* wind lifts */
    for(const u of L.ups)if(p.x+p.w>u.x&&p.x<u.x+u.w&&p.y+p.h>u.y&&p.y<u.y+u.h){p.vy-=900*dt;if(p.vy<-95)p.vy=-95}
    p.jb-=dt;p.coy-=dt;
    if(p.drop>0)p.drop-=dt;
    /* S and jump together: drop down through a thin platform, a lift or the top of a ladder */
    const dEdge=I.down&&!p.dprev;p.dprev=I.down;p.dtm=I.down?.18:(p.dtm||0)-dt;   // down counts for a moment after it is released, so jump then down also works
    if(((I.jump&&(I.down||p.dtm>0)&&!p.jumpHeld)||(SURF.touch&&SURF.touch.d&&dEdge))&&!beamed&&!p.lad&&p.on){
      const fy=Math.floor((p.y+p.h+1)/TS);let thin=false,solid=false;
      for(let fx=Math.floor(p.x/TS);fx<=Math.floor((p.x+p.w-.01)/TS);fx++){const ft=tile(fx,fy);if(ft===2||ft===9||ft===7)thin=true;else if(solidT(ft))solid=true}
      if((thin&&!solid)||p.ride){p.drop=.3;p.on=false;p.ride=null;p.y+=2;p.vy=40;p.jumpHeld=true;p.jb=0;p.coy=0;try{sfxTone(400,160,.1,'square',.02,{att:.002})}catch(e){}}}
    if(I.jump&&!p.jumpHeld&&!beamed&&!p.lad){p.jb=.15}
    if(!I.jump)p.jumpHeld=false;
    if(p.jb>0&&(p.on||p.coy>0)){p.vy=p.inW?-120:-222;p.on=false;p.coy=0;p.jb=0;p.jumpHeld=true;try{sfxTone(260,520,.12,'square',.02,{att:.002})}catch(e){}}
    if(p.sp>0)p.sp-=dt;
    if(!I.jump&&p.vy<-90&&!p.on&&!p.lad&&!(p.sp>0))p.vy*=1-dt*9;   // let go to hop short
    /* rocket pack: press jump again in the air and hold it. Fuel comes back on the ground or a ladder. */
    p.thrust=false;
    if(p.on||p.lad){p.jarm=false;if(p.fuel==null)p.fuel=1;p.fuel=Math.min(1,p.fuel+dt*1.4)}
    else{if(!I.jump)p.jarm=true;if(p.fuel==null)p.fuel=1;
      if(s.jet&&I.jump&&p.jarm&&p.fuel>0&&!beamed&&!p.inW){p.thrust=true;p.vy-=900*dt;if(p.vy<-105)p.vy=-105;p.fuel=Math.max(0,p.fuel-dt*.5/(1+.4*(s.shop.fuel||0)+(s.perk[3]?.4:0)));
        p.jt=(p.jt||0)-dt;if(p.jt<=0){p.jt=.07;try{sfxTone(150,80,.07,'sawtooth',.012,{att:.001})}catch(e){}}
        for(let k=0;k<2;k++)SURF.fx.push({x:p.x+p.w/2-p.face*4+rnd(-1,1),y:p.y+p.h-2,vx:rnd(-14,14)-p.face*10,vy:rnd(70,130),life:rnd(.18,.4),c:[WH,YL,OR,OR,RD][(Math.random()*5)|0],s:k?1:2})}}
    /* move x with step-up */
    let nx=p.x+p.vx*dt;
    if(hitsSolid(nx,p.y,p.w,p.h)){if(p.on&&!hitsSolid(nx,p.y-TS,p.w,p.h)&&!hitsSolid(nx,p.y-TS,p.w,1)){p.x=nx;p.y-=TS}else p.vx=0}else p.x=nx;
    p.x=clamp(p.x,2,L.LW*TS-p.w-2);
    /* move y */
    let ny=p.y+p.vy*dt;p.on=false;p.ride=null;
    if(p.vy>=0){
      const botOld=p.y+p.h,botNew=ny+p.h;
      /* one way tiles and lifts */
      let land=null;
      const ty0=Math.floor(botOld/TS),ty1=Math.floor(botNew/TS);
      for(let ty=ty0;ty<=ty1;ty++){for(let tx=Math.floor(p.x/TS);tx<=Math.floor((p.x+p.w-.01)/TS);tx++){const t=tile(tx,ty);if(!(p.drop>0)&&(t===2||t===9||(t===7&&!p.lad&&tile(tx,ty-1)!==7))&&botOld<=ty*TS+1&&botNew>=ty*TS){const yy=ty*TS-p.h;if(!land||yy<land.y)land={y:yy,k:'t'}}}}
      if(!(p.drop>0))for(const q of L.lifts){if(p.x+p.w>q.x&&p.x<q.x+q.w){const top=q.y;if(botOld<=top+3+(q.dy>0?q.dy:0)&&botNew>=top-2){const yy=top-p.h;if(!land||yy<land.y)land={y:yy,k:'l',q}}}}
      if(hitsSolid(p.x+(p.lad?2:0),ny,p.lad?p.w-4:p.w,p.h)){const ty=Math.floor((ny+p.h)/TS);const yy=ty*TS-p.h;if(!land||yy<land.y)land={y:yy,k:'s'}}
      if(land){p.y=land.y;p.vy=0;p.on=true;p.coy=.13;if(land.q)p.ride=land.q;
        const bx=Math.floor((p.x+p.w/2)/TS),by=Math.floor((p.y+p.h+1)/TS),tt=tile(bx,by);
        if(tt===5){p.vy=-330;p.on=false;p.sp=.7;try{sfxTone(200,900,.18,'square',.03,{att:.002})}catch(e){}}
        if(tt===6){const k=by*L.LW+bx;if(!L.crum[k])L.crum[k]={state:'shake',t:.45}}}
      else p.y=ny;
    }else{
      if(hitsSolid(p.x+(p.lad?2:0),ny,p.lad?p.w-4:p.w,p.h)){p.vy=0}else p.y=ny;
    }
    p.anim+=dt*(p.on?Math.abs(p.vx)*.12:0);
    /* safe spot memory */
    p.sf-=dt;if(p.on&&p.sf<=0&&Math.abs(p.vx)<60){const bx=Math.floor((p.x+p.w/2)/TS),by=Math.floor((p.y+p.h+1)/TS);let ok=true;for(let d=-2;d<=2;d++){const t=tile(bx+d,by);if(t===3||t===4)ok=false}if(tile(bx,by)===6)ok=false;if(ok&&!p.ride){p.safe={x:p.x,y:p.y};p.sf=.5}}
    /* hazards */
    const cxT=Math.floor((p.x+p.w/2)/TS),cyT=Math.floor((p.y+p.h-2)/TS),cyH=Math.floor((p.y+3)/TS);
    for(const yy of [cyT,cyH]){const t=tile(cxT,yy);if(t===3&&p.inv<=0){hurt(1,true)}else if(t===4){if(L.chase&&L.chase.state===1)chaseFail();else hurt(PARAM[SURF.idx].dmg,true)}}
    if(p.y>L.LH*TS-10)hurt(1,true);
    if(p.inv>0)p.inv-=dt;
    /* gates */
    for(const gt of (L.gates||[])){const on=((L.tick*.6+gt.x)%2)<1;gt.on=on;if(on&&p.x+p.w>gt.x*TS&&p.x<gt.x*TS+8&&p.y+p.h>gt.y*TS&&p.y<(gt.y+gt.h)*TS&&p.inv<=0)hurt(1,false)}
    /* fire */
    p.fire-=dt;
    if(I.fire&&p.fire<=0&&!beamed){p.fire=s.perk[2]?.15:.2;const up=I.up&&!I.l&&!I.r?1:0,dir=p.face;
      SURF.bul.push({x:p.x+p.w/2+dir*8,y:p.y+(up?2:7),vx:up?0:dir*260,vy:up?-260:0,life:.7,d:1+(s.shop.dmg||0)*.5});try{sfxLaser()}catch(e){}}
    /* checkpoints and chests and coins */
    for(const sp of (L.shipPieces||[]))if(!s.pieces[sp.id]&&Math.abs(p.x+5-sp.x)<14&&Math.abs(p.y+8-sp.y)<16){s.pieces[sp.id]=1;const n=SURF.piecesFound();
      SURF.banner={t:7,lines:['SHIP PIECE FOUND: '+PIECE_NAMES[sp.id],'('+n+' OF 6)',n>=6?'ALL SIX PIECES FOUND! FINISH ALL FIVE WORLDS TO CLAIM THE SHIP.':'KEEP LOOKING. THE REST ARE HIDDEN IN THE OTHER WORLDS.']};
      try{sfxTone(400,1600,.7,'triangle',.06,{att:.005});setTimeout(()=>{try{sfxTone(800,1800,.4,'sine',.05,{att:.005})}catch(e){}},220)}catch(e){}shakeS=.2;
      for(let i=0;i<40;i++)SURF.fx.push({x:sp.x,y:sp.y,vx:rnd(-110,110),vy:rnd(-150,-10),life:1.1,c:[WH,YL,CY,MG][i%4],s:2});save()}
    for(const c of L.checks)if(!c.on&&Math.abs(p.x+5-c.x)<16&&Math.abs(p.y+16-c.y)<18){c.on=1;s.cp[SURF.idx]={x:c.x,y:c.y};SURF.msg=['BEAM PAD SAVED',1.6];for(let i=0;i<10;i++)SURF.fx.push({x:c.x,y:c.y-4,vx:rnd(-30,30),vy:rnd(-90,-20),life:.7,c:CY,s:2});p.safe={x:p.x,y:p.y}}
    for(const c of L.chests)if(!c.open&&Math.abs(p.x+5-(c.x+7))<14&&Math.abs(p.y+8-(c.y+5))<18){c.open=1;if(c.sec)foundSecret(c.sec);if(c.mimic){c.gone=1;spawnMimic(c.x,c.y);SURF.msg=['IT WAS A CURSED CHEST!',2];shakeS=.2;try{sfxBoom(8,false)}catch(e){}continue}try{sfxTone(500,1200,.3,'triangle',.04,{att:.005})}catch(e){}
      const cv=c.v*((c.sec||c.big)?6:1);for(let i=0;i<Math.min(12,cv);i++)L.coins.push({x:c.x+7,y:c.y,v:Math.ceil(cv/Math.min(12,cv)),vx:rnd(-50,50),vy:rnd(-130,-60),loose:1})}
    let anyGone=false;
    for(const c of L.coins){
      if(!c.loose&&(Math.abs(p.x+5-c.x)>(s.perk[4]?38:24)||Math.abs(p.y+8-c.y)>(s.perk[4]?38:24)))continue;
      if(c.loose){c.vy+=300*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;if(hitsSolid(c.x-2,c.y,4,4)){c.vy=-c.vy*.3;c.vx*=.6;c.y-=2}}
      const dx=p.x+5-c.x,dy=p.y+8-c.y;if(c.heart&&p.hp>=p.mhp)continue;if(!c.gone&&dx*dx+dy*dy<(s.perk[4]?340:150)){c.gone=1;anyGone=true;if(c.heart){p.hp=Math.min(p.mhp,p.hp+1);SURF.txt.push({x:c.x,y:c.y,t:1,s:'+1 HEART'})}else{s.green+=c.v;SURF.visit+=c.v;SURF.txt.push({x:c.x,y:c.y,t:.8,s:'+'+c.v})}try{beep(900+Math.random()*200,.05,'square',.03)}catch(e){}}}
    if(anyGone)L.coins=L.coins.filter(c=>!c.gone);
  }
  /* spawners: enemies in view and farm respawns */
  for(const sp of L.spawns){
    if(sp.killed)continue;
    const dx=Math.abs(sp.x-(p.x+5));
    if(sp.e&&sp.e.hp<=0){sp.e=null;sp.t=PARAM[SURF.idx].resp*(.7+Math.random()*.6)}
    if(!sp.e){sp.t-=dt;
      if(sp.t<=0&&dx<200){const cam=SURF.cam,on=sp.x>cam.x-20&&sp.x<cam.x+VW+20;
        if(!sp.once||!on){sp.once=1;const e=addEnemy(sp.type,sp.x,sp.y+TS-SURF.W.en[sp.type].h*(sp.elite?1.7:1),!!sp.elite);if(sp.elite){e.hp=e.mhp=e.hp/2.4;e.lair=1}if(sp.shiny){e.shiny=1;e.hp=e.mhp=e.hp*1.6}sp.e=e;e.sp_=sp}}}
  }
  /* the guardian shows up when you get near the end */
  if(!SURF.guard&&Math.abs(p.x-L.exit.x)<300&&Math.abs(p.y-L.exit.y)<200){const e=addEnemy(4,L.guardian.x,L.guardian.y-SURF.W.en[4].h*1.7,true);e.guardian=1;{const oh=e.h;e.sc=2.1;e.w=Math.round(SURF.W.en[4].w*2.1)-2;e.h=Math.round(SURF.W.en[4].h*2.1)-1;e.y-=e.h-oh;e.y0=e.y}e.k=SURF.W.en.length+1;e.hp=e.mhp=e.hp*[.9,.7,.6,.55,.5][SURF.idx];SURF.guard=e;SURF.msg=[BOSSNAME[SURF.idx],2.8];shakeS=Math.max(shakeS,.25)}
  /* enemies */
  for(const e of SURF.en){updateEnemy(e,dt)}
  SURF.en=SURF.en.filter(e=>{if(e.hp>0&&Math.abs(e.x-p.x)<520)return true;if(e.hp<=0)return false;if(e.sp_){e.sp_.e=null;e.sp_.t=0}return false});
  /* bullets */
  for(const b of SURF.bul){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;{const btx=Math.floor(b.x/TS),bty=Math.floor(b.y/TS);if(tile(btx,bty)===13){crackHit(btx,bty);b.life=0}}if(L.targets.length&&b.life>0)for(const tg of L.targets)if(!tg.hit&&Math.abs(b.x-tg.x)<6&&Math.abs(b.y-tg.y)<6&&L.ia.some(q=>q.k==='console'&&q.state===1)){tg.hit=1;b.life=0;SURF.msg=[L.targets.filter(q=>!q.hit).length+' TARGETS LEFT',1.2];try{sfxTone(900,1300,.1,'square',.04,{att:.002})}catch(e){}}
    if(hitsSolid(b.x-1,b.y-1,2,2))b.life=0;
    for(const e of SURF.en)if(e.hp>0&&b.life>0&&Math.abs(b.x-(e.x+e.w/2))<e.w/2+2&&Math.abs(b.y-(e.y+e.h/2))<e.h/2+2){b.life=0;e.hp-=b.d*(e.vent>0?2:1);e.flash=.08;for(let q=0;q<2;q++)SURF.fx.push({x:b.x,y:b.y,vx:rnd(-50,50),vy:rnd(-60,0),life:.25,c:WH,s:1});
      if(e.hp<=0)killEnemy(e);for(let i=0;i<3;i++)SURF.fx.push({x:b.x,y:b.y,vx:rnd(-40,40),vy:rnd(-40,40),life:.2,c:CY,s:1})}}
  SURF.bul=SURF.bul.filter(b=>b.life>0);
  for(const b of SURF.eb){b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.ay)b.vy+=b.ay*dt;b.life-=dt;if(hitsSolid(b.x-1,b.y-1,2,2))b.life=0;
    if(p.dead<=0&&Math.abs(b.x-(p.x+5))<6&&Math.abs(b.y-(p.y+8))<9&&b.life>0){b.life=0;hurt(PARAM[SURF.idx].dmg,false)}}
  SURF.eb=SURF.eb.filter(b=>b.life>0);
  /* particles */
  for(const f of SURF.fx){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=(f.b?-60:120)*dt}SURF.fx=SURF.fx.filter(f=>f.life>0);
  for(const t of SURF.txt){t.t-=dt;t.y-=18*dt}SURF.txt=SURF.txt.filter(t=>t.t>0);
  if(!locked)featTick(dt,I);
  /* camera */
  const cam=SURF.cam,tx=clamp(p.x+5-VW/2+p.face*28,0,L.LW*TS-VW),ty=clamp(p.y-VH*.58,0,L.LH*TS-VH);
  cam.x+=(tx-cam.x)*Math.min(1,dt*5);cam.y+=(ty-cam.y)*Math.min(1,dt*4);
};
function hurt(n,respawn){
  const p=SURF.p;if(p.inv>0&&!respawn||p.dead>0)return;
  if(SURF.cut&&SURF.cut.mode==='out')return;
  if(p.shield>0&&!respawn){p.shield--;p.inv=1;SURF.msg=['THE SHIELD BLOCKED THE HIT',1.2];for(let i=0;i<8;i++)SURF.fx.push({x:p.x+5,y:p.y+8,vx:rnd(-60,60),vy:rnd(-60,40),life:.4,c:CY,s:2});try{sfxTone(700,400,.1,'triangle',.04,{att:.002})}catch(e){}return}
  p.hp-=n;p.inv=1;shakeS=.16;SURF.hurtT=1;try{sfxBoom(8,false)}catch(e){}
  for(let i=0;i<10;i++)SURF.fx.push({x:p.x+5,y:p.y+8,vx:rnd(-70,70),vy:rnd(-90,10),life:.5,c:RD,s:2});
  if(p.hp<=0){const cp=sv().cp[SURF.idx];p.safe=cp?{x:cp.x,y:cp.y-16}:{x:SURF.L.start.x,y:SURF.L.start.y};p.dead=1.1;SURF.msg=['YOU WERE BEAMED BACK TO THE LAST PAD',1.6];for(let i=0;i<20;i++)SURF.fx.push({x:p.x+5,y:p.y+8,vx:rnd(-90,90),vy:rnd(-120,10),life:.9,c:i%2?WH:CY,s:2})}
  else if(respawn){p.x=p.safe.x;p.y=p.safe.y;p.vx=p.vy=0;p.ride=null}
}
let shakeS=0;
function killEnemy(e){
  const s=sv(),sp=e.sp;sv();s.kills++;try{sfxBoom(10,e.elite)}catch(e2){}
  if(e.shiny){s.shiny[SURF.idx+'_'+e.k]=1;foundSecret(SURF.idx+'_shiny','SHINY CREATURE')}
  if(e.sp_&&e.sp_.lair)e.sp_.killed=1;if(e.hunter)SURF.hunterDead=SURF.t;
  if(e.guardian&&SURF.idx===4){const f=SURF.L.ia.find(o=>o.final);if(f){f.hide=0;f.x=e.x+e.w/2;f.y=e.y+e.h;SURF.msg=['SOMETHING GLOWS WHERE THE GUARDIAN FELL',4]}}
  if(e.guardian&&SURF.idx===0&&!s.jet){s.jet=1;SURF.p.fuel=1;SURF.banner={t:8,lines:['YOU GOT A ROCKET PACK!','PRESS JUMP AGAIN IN THE AIR','AND HOLD IT TO FLY.','NOW YOU CAN EXPLORE FURTHER.']};shakeS=.3;try{sfxTone(300,1400,.6,'triangle',.05,{att:.005})}catch(e3){}
    for(let i=0;i<40;i++)SURF.fx.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:rnd(-110,110),vy:rnd(-150,-10),life:1.1,c:[WH,YL,OR,CY][i%4],s:2});save()}
  const key=SURF.idx+'_'+e.k;s.seen[key]=(s.seen[key]||0)+1;
  const n=Math.max(1,Math.round(sp.gold*(e.elite?4:1)*(e.shiny?5:1)*(e.hunter?3:1)));
  for(let i=0;i<Math.min(8,n);i++)SURF.L.coins.push({x:e.x+e.w/2,y:e.y+e.h/2,v:Math.ceil(n/Math.min(8,n)),vx:rnd(-60,60),vy:rnd(-120,-40),loose:1});
  for(let i=0;i<14;i++)SURF.fx.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:rnd(-80,80),vy:rnd(-100,20),life:.5,c:sp.pal[(i%3)+2],s:2});
  {const pl=SURF.p,low=pl.hp<=2?.3:pl.hp<=3?.12:0,big=e.guardian||e.lair,nh=big?2:(Math.random()<.05+low?1:0);for(let q=0;q<nh;q++)SURF.L.coins.push({x:e.x+e.w/2+q*8,y:e.y+e.h/2,v:0,heart:1,vx:rnd(-40,40),vy:rnd(-130,-70),loose:1})}
}
/* ---- guardians and mini bosses: telegraphed attacks, a twist at half health */
const BOSSATK=[['ring','ring','rain'],['fan','spikes'],['barrage','fan'],['geyser','geyser'],['brood','fan']];
const BOSSCOL=['#ccff77','#ff77ff','#ffee55','#ff7733','#55ffaa'];
const ATKTXT={ring:'SPORE RING INCOMING',rain:'SPORES FALL FROM ABOVE',fan:'SHARDS INCOMING',spikes:'CRYSTALS RISE',barrage:'SHELLS INCOMING',geyser:'LAVA GEYSERS RISE',brood:'THE HIVE CALLS ITS BROOD'};
function bossGround(x,y){const cx=Math.floor(x/TS),y0=Math.floor(y/TS);for(let q=y0;q<y0+30;q++){const t=tile(cx,q);if(t===1||t===2||t===6)return q*TS}return null}
function bossStrike(x,p,dur){const y=bossGround(x,p.y);if(y!=null)SURF.strikes.push({x,y,t:0,id:'erupt',dur:dur||1.1,col:BOSSCOL[SURF.idx],dmg:1+(SURF.idx>=3?1:0)})}
function bossTick(e,dt){const p=SURF.p,idx=SURF.idx;if(e.hp<=0||p.dead>0)return;
  const dx=(p.x+5)-(e.x+e.w/2);if(Math.abs(dx)>(e.lair?230:300)||Math.abs(p.y-e.y)>150){e.engaged=0;return}
  e.engaged=1;
  if(e.guardian&&!e.ph2&&e.hp<e.mhp*.5){e.ph2=1;bossTwist(e)}
  if(e.ph2&&idx===3&&e.guardian){e.gz=(e.gz==null?1.5:e.gz)-dt;if(e.gz<=0){e.gz=2.3;bossStrike(p.x+5+rnd(-70,70),p,1.2)}}
  if(e.tele){e.tele.t-=dt;if(e.tele.t<=0){bossFire(e,e.tele.k);e.tele=null;e.bt=(e.ph2?2.4:3.7)*(e.lair?1.25:1)}return}
  e.bt=(e.bt==null?2.2:e.bt)-dt;
  if(e.bt<=0&&!e.st){const L=BOSSATK[idx].slice();if(e.lair)L.length=2;if(!e.ph2&&idx===0)L.length=2;const k=L[(e.ac=(e.ac||0)+1)%L.length];e.tele={t:.95,m:.95,k};SURF.msg=[ATKTXT[k],1.6]}}
function bossTwist(e){const p=SURF.p,idx=SURF.idx;shakeS=Math.max(shakeS,.2);
  {const L=SURF.L,gy=Math.floor(bossGround(e.x+e.w/2,e.y)/TS);if(gy>0)for(const sd of [-1,1]){const x0=Math.floor((e.x+e.w/2)/TS)+sd*13-3;for(let q=0;q<7;q++)if(L.g[(gy-5)*L.LW+x0+q]===0)L.g[(gy-5)*L.LW+x0+q]=2}}
  if(idx===0){SURF.msg=['THE BRUTE ROARS. SPORELINGS ARE COMING.',3];for(let q=0;q<2;q++){const s=addEnemy(0,e.x+(q?60:-60),e.y,false);s.brood=1}}
  else if(idx===1){SURF.msg=['CRYSTALS ERUPT ACROSS THE GROUND.',3];for(let q=-3;q<=3;q++)bossStrike(e.x+e.w/2+q*46,p,1.4)}
  else if(idx===2){SURF.msg=['THE MECH IS OVERHEATING. SHOOT NOW.',3.5];e.vent=5;e.tele=null;e.bt=4}
  else if(idx===3){SURF.msg=['THE FLOOR ERUPTS. KEEP MOVING.',3]}
  else{SURF.msg=['THE GUARD CALLS ITS BROOD. GRAVITY DROPS.',3.5];SURF.bossLow=7;for(let q=0;q<3;q++){const s=addEnemy(q===1?3:0,e.x+(q-1)*50,e.y,false);s.brood=1}}}
function bossFire(e,k){const p=SURF.p,idx=SURF.idx,cx=e.x+e.w/2,cy=e.y+e.h*.4;try{sfxTone(180,120,.25,'sawtooth',.03,{att:.01})}catch(er){}
  if(k==='ring'){const n=e.lair?6:8,a0=Math.random()*6;for(let i=0;i<n;i++){const a=a0+i/n*TAU;ebul(cx,cy,Math.cos(a)*52,Math.sin(a)*52,{life:3.2})}}
  else if(k==='fan'){aimBullets(e,e.ph2?5:3,80,.8)}
  else if(k==='barrage'){for(let q=-1;q<=1;q++){const t=.95,tx=p.x+5+q*38;ebul(cx,cy,(tx-cx)/t,(p.y-cy-.5*180*t*t)/t,{ay:180,life:3,lob:1})}}
  else if(k==='spikes'||k==='geyser'){const n=e.ph2?5:3;for(let q=0;q<n;q++)bossStrike(p.x+5+(q-(n-1)/2)*44,p,1.1)}
  else if(k==='rain'){for(let q=0;q<4;q++)bossStrike(p.x+5+rnd(-90,90),p,1.2)}
  else if(k==='brood'){const n=SURF.en.filter(q=>q.brood&&q.hp>0).length;if(n<3){for(let q=0;q<2;q++){const s=addEnemy(q?3:0,cx+(q?40:-40),e.y,false);s.brood=1}}}}
function ebul(x,y,vx,vy,o){SURF.eb.push(Object.assign({x,y,vx,vy,life:2.4},o||{}))}
function aimBullets(e,n,sp,sd){const p=SURF.p,ox=e.x+e.w/2,oy=e.y+e.h*.4,a0=Math.atan2(p.y+8-oy,p.x+5-ox);for(let i=0;i<n;i++){const a=a0+(n>1?(i/(n-1)-.5)*(sd||.4):0);ebul(ox,oy,Math.cos(a)*sp,Math.sin(a)*sp)}try{sfxEnemyLaser()}catch(e2){}}
/* flying creatures stay in their own area and patrol it; they only drift towards you when you come close, and never leave their leash */
function flyPatrol(e,dt,spd,dx,dy,sight){
  const R=e.pr||(e.pr=rnd(55,95));if(!e.dir)e.dir=Math.random()<.5?-1:1;if(e.y00==null)e.y00=e.y0;
  if(hitsSolid(e.x,e.y,e.w,e.h)){e.y0-=45*dt;e.x+=(e.home>e.x?1:-1)*18*dt;return}   // never stay stuck inside rock
  const aggro=Math.abs(dx)<(sight||110)&&Math.abs(dy)<70,leash=R+(aggro?45:0);
  let vx=e.dir*spd*.8;if(aggro&&Math.abs(dx)>14){vx=Math.sign(dx)*spd*.7;e.dir=dx>0?1:-1}
  const nx=e.x+vx*dt;
  if(hitsSolid(nx,e.y,e.w,e.h)){e.dir=-e.dir}
  else if(nx>e.home+leash&&vx>0){e.dir=-1}else if(nx<e.home-leash&&vx<0){e.dir=1}else e.x=nx;
  e.face=vx>0?1:-1;
  const want=aggro?clamp(p_y_(dy,e),e.y00-24,e.y00+24):e.y00,ny0=e.y0+(want-e.y0)*Math.min(1,dt*.8);if(!hitsSolid(e.x,e.y+(ny0-e.y0),e.w,e.h))e.y0=ny0;
}
function p_y_(dy,e){return e.y0+dy*.4}
function updateEnemy(e,dt){
  if(e.guardian)dt*=.75;   // the guardian moves, charges and fires a quarter slower
  const sp=e.sp,p=SURF.p,L=SURF.L;e.t+=dt;if(e.flash>0)e.flash-=dt;if(e.hp<=0)return;
  const dx=(p.x+5)-(e.x+e.w/2),dy=(p.y+8)-(e.y+e.h/2),near=Math.abs(dx)<260;
  if(!near&&!e.guardian)return;
  if(e.vent>0){e.vent-=dt;if(Math.random()<dt*14)SURF.fx.push({x:e.x+rnd(0,e.w),y:e.y+2,vx:rnd(-10,10),vy:rnd(-50,-20),life:.7,c:'#dddddd',s:2});return}
  if(e.guardian||e.lair)bossTick(e,dt);
  const grav=()=>{e.vy+=430*dt;if(e.vy>300)e.vy=300;
    let ny=e.y+e.vy*dt;e.on=false;
    if(e.vy>=0&&hitsSolid(e.x,ny,e.w,e.h)){const ty=Math.floor((ny+e.h)/TS);e.y=ty*TS-e.h;e.vy=0;e.on=true}
    else if(e.vy<0&&hitsSolid(e.x,ny,e.w,e.h))e.vy=0;else e.y=ny;
    if(e.y>L.LH*TS)e.hp=0};
  const moveX=(vx)=>{const nx=e.x+vx*dt;if(hitsSolid(nx,e.y,e.w,e.h)){return false}e.x=nx;return true};
  const edgeAhead=()=>{const fx=e.x+(e.face>0?e.w+2:-2),fy=e.y+e.h+2;return !solidT(tile(Math.floor(fx/TS),Math.floor(fy/TS)))&&tile(Math.floor(fx/TS),Math.floor(fy/TS))!==2};
  const ai=sp.ai,spd=sp.spd*(1+SURF.idx*.07);
  if(ai==='walker'){grav();if(e.on){e.vx=e.face*spd;if(!moveX(e.vx)||edgeAhead()){e.face*=-1}}if(Math.abs(dx)<60&&e.on&&Math.abs(dy)<24){e.face=dx>0?1:-1}}
  else if(ai==='hopper'){grav();e.cd-=dt;if(e.on){e.vx*=.8;if(e.cd<=0&&Math.abs(dx)<150){e.vy=-170;e.vx=(dx>0?1:-1)*spd;e.face=dx>0?1:-1;e.cd=rnd(.9,1.6)}}if(Math.abs(e.vx)>1)moveX(e.vx)}
  else if(ai==='flyer'){flyPatrol(e,dt,spd,dx,dy,120);e.y=e.y0+Math.sin(e.t*2.2)*14;
    if(sp.shoot){e.cd-=dt;if(e.cd<=0&&Math.abs(dx)<150){e.cd=sp.shoot.cd;aimBullets(e,1,sp.shoot.sp)}}
  }
  else if(ai==='diver'){if(e.st===0){e.y=e.y0+Math.sin(e.t*2)*6;flyPatrol(e,dt,34,dx,dy,70);if(Math.abs(dx)<50&&dy>10){e.st=1;e.t2=0}}
    else if(e.st===1){e.t2+=dt;e.y+=170*dt;e.x+=Math.sign(dx)*60*dt;if(e.t2>.5||hitsSolid(e.x,e.y,e.w,e.h)){e.st=2}}
    else{e.y-=70*dt;if(e.y<=e.y0){e.y=e.y0;e.st=0}}}
  else if(ai==='turret'){grav();e.face=dx>0?1:-1;e.cd-=dt;if(Math.abs(dx)<sp.range&&Math.abs(dy)<80&&e.cd<=0){e.cd=sp.cd;aimBullets(e,sp.bul.n,sp.bul.sp,sp.bul.sd)}}
  else if(ai==='lobber'){grav();e.face=dx>0?1:-1;e.cd-=dt;if(Math.abs(dx)<sp.range&&e.cd<=0){e.cd=sp.cd;const t=.9,ox=e.x+e.w/2,oy=e.y;ebul(ox,oy,dx/t,(dy-.5*180*t*t)/t,{ay:180,life:3,lob:1});try{sfxEnemyLaser()}catch(e2){}}}
  else if(ai==='dropper'){e.y=e.y0+Math.sin(e.t*1.5)*10;e.x+=Math.cos(e.t*.9)*spd*dt;e.face=dx>0?1:-1;e.cd-=dt;if(e.cd<=0&&Math.abs(dx)<40&&dy>0){e.cd=2;ebul(e.x+e.w/2,e.y+e.h,0,20,{ay:260,life:2.5})}}
  else if(ai==='charger'){
    if(e.st===0){grav();if(e.on){e.vx=e.face*spd*.6;if(!moveX(e.vx)||edgeAhead())e.face*=-1}
      if(Math.abs(dx)<110&&Math.abs(dy)<40&&e.on){e.st=1;e.t2=.55;e.face=dx>0?1:-1}
      if(sp.shoot){e.cd-=dt;if(e.cd<=0&&Math.abs(dx)<150){e.cd=sp.shoot.cd;aimBullets(e,3,sp.shoot.sp,.5)}}}
    else if(e.st===1){grav();e.t2-=dt;e.x+=Math.sin(e.t*60)*.3;if(e.t2<=0){e.st=2;e.t2=.8}}
    else if(e.st===2){grav();e.t2-=dt;if(!moveX(e.face*spd*5.5)){e.st=3;e.t2=1}if(e.t2<=0){e.st=3;e.t2=.9}}
    else{grav();e.t2-=dt;if(e.t2<=0)e.st=0}}
  /* touching the player hurts */
  if(p.dead<=0&&p.inv<=0&&Math.abs(dx)<(e.w+p.w)/2-1&&Math.abs(dy)<(e.h+p.h)/2-2)hurt(PARAM[SURF.idx].dmg+(e.elite?1:0),false);
}

/* ---------------- features at run time: things to use, read, solve and survive ---------------- */
const ENDESC={walker:'WALKS BACK AND FORTH. TURNS TO FACE YOU WHEN NEAR.',hopper:'JUMPS AT YOU FROM A DISTANCE.',turret:'STAYS IN ONE SPOT AND SHOOTS AT YOU.',flyer:'FLIES AFTER YOU AND SOMETIMES SHOOTS.',charger:'SLOW, BUT CHARGES FAST WHEN IT SEES YOU.',dropper:'FLOATS ABOVE AND DROPS BOMBS ON YOU.',lobber:'LOBS SHELLS IN AN ARC OVER WALLS.',diver:'HOVERS, THEN DIVES AT YOU.'};
const PERKS=['SHRINE OF HEARTS: YOUR MAXIMUM HEALTH IS UP BY ONE.','SHRINE OF SWIFTNESS: YOU RUN A LITTLE FASTER.','SHRINE OF LIGHT: YOUR LASER FIRES FASTER.','SHRINE OF FIRE: YOUR ROCKET FUEL LASTS LONGER.','SHRINE OF GREED: YOU PICK UP GREEN GOLD FROM FURTHER AWAY.'];
const EVT=[
 [{id:'spore',warn:'WARNING: A SPORE STORM IS COMING.',on:'THE SPORE STORM IS HERE. THE WIND PUSHES YOU.'}],
 [{id:'sand',warn:'WARNING: A SANDSTORM IS COMING.',on:'THE SANDSTORM IS HERE. THE WIND PUSHES YOU HARD.'}],
 [{id:'surge',warn:'WARNING: A POWER SURGE IS COMING. WATCH FOR SPARKS.',on:'POWER SURGE. SPARKS STRIKE WHERE THE LIGHT FLASHES.'}],
 [{id:'meteor',warn:'WARNING: A METEOR SHOWER IS COMING.',on:'METEORS ARE FALLING. WATCH THE RED MARKS.'},{id:'quake',warn:'WARNING: AN EARTHQUAKE IS COMING.',on:'THE GROUND SHAKES. ROCKS FALL FROM ABOVE.'}],
 [{id:'pulse',warn:'WARNING: THE HIVE IS ABOUT TO PULSE.',on:'THE HIVE PULSES. YOU FLOAT, GRAVITY IS LOW.'}]];
function wrapT(str,w){const words=str.split(' '),out=[];let cur='';for(const wd of words){const t=cur?cur+' '+wd:wd;if(textW(t,1)>w&&cur){out.push(cur);cur=wd}else cur=t}if(cur)out.push(cur);return out}
function useLabel(){return(typeof INP!=='undefined'&&INP.last==='pad')?'A':(typeof INP!=='undefined'&&INP.last==='touch')||(typeof isTouch!=='undefined'&&isTouch)?'USE':'E'}
function foundSecret(id,name){const s=sv();if(!id||s.sec[id])return;s.sec[id]=1;const L=SURF.L,sc=L.secrets.find(q=>q.id===id);SURF.msg=['SECRET FOUND: '+(name||(sc&&sc.name)||''),3];try{sfxTone(500,1500,.5,'triangle',.05,{att:.005})}catch(e){}save()}
function trk(){const s=sv(),L=SURF.L,idx=SURF.idx;const sec=L.secrets.filter(q=>s.sec[q.id]).length,tot=L.secrets.length;
  let lr=0;for(let k=0;k<LORE[idx].length;k++)if(s.lore[idx*10+k])lr++;const W=SURF.W;let met=0;for(let k=0;k<W.en.length;k++)if(s.met[idx+'_'+k])met++;
  return{sec,tot,lr,lt:LORE[idx].length,met,mt:W.en.length,full:sec>=tot&&lr>=LORE[idx].length&&met>=W.en.length}}
function secretHint(){const L=SURF.L,p=SURF.p,s=sv();let best=null,bd=1e9;
  for(const q of L.secretPts){if(q.sid&&s.sec[q.sid])continue;const d=Math.hypot(q.x-p.x,(q.y-p.y)*1.5);if(d<bd){bd=d;best=q}}
  if(!best)return 'I HAVE NOTHING MORE TO TELL YOU. YOU HAVE FOUND ALL THE SECRETS I KNOW.';
  const dx=best.x-p.x,dy=best.y-p.y,sc=Math.max(1,Math.round(bd/320));
  const h=Math.abs(dx)>40?(dx>0?'TO THE RIGHT':'TO THE LEFT'):'';const v=Math.abs(dy)>60?(dy>0?'BELOW':'ABOVE'):'';
  return 'SOMETHING IS HIDDEN '+[v,h].filter(Boolean).join(' AND ')+', ABOUT '+sc+' SCREEN'+(sc>1?'S':'')+' AWAY. LISTEN FOR HOLLOW WALLS AND SHOOT THE ONES THAT GLOW.'}
function nearestSecret(){const L=SURF.L,p=SURF.p,s=sv();let best=null,bd=1e9;for(const q of L.secretPts){if(q.sid&&s.sec[q.sid])continue;const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<bd){bd=d;best=q}}return best?{q:best,d:bd}:null}
/* ---- modals */
function openModal(m){m.t=0;SURF.modal=m;SURF.pv=null;SURF.mh=[]}
function openText(title,body,opt){openModal(Object.assign({type:'text',title,lines:wrapT(body,262)},opt||{}))}
function openTalk(name,pages,done,choices){openModal({type:'talk',name,pages:pages.map(t=>wrapT(t,262)),page:0,done,choices})}
function openPause(){if(SURF.modal)return;openModal({type:'pause',tab:0,focus:0,btn:0,cur:[0,SURF.idx*5,0,0]})}
function closeModal(){const m=SURF.modal;SURF.modal=null;SURF.pv=null;SURF.mh=[];SURF.noJump=.25;if(m&&m.onClose)m.onClose()}
function readLore(ia){const L=SURF.L,s=sv(),idx=SURF.idx,k=ia.slot,e=LORE[idx][k];if(!e)return;const first=!s.lore[idx*10+k];s.lore[idx*10+k]=1;if(first)save();
  const o={lore:1};if(first&&ia.final)o.onClose=()=>{SURF.banner={t:8,lines:['THE ALIEN MOTHERSHIP WAS THE SUNLARK ALL ALONG.','FIND ALL SIX PIECES AND IT WILL FLY HOME.']};shakeS=.6;try{sfxTone(200,900,.8,'triangle',.06,{att:.01})}catch(e){}for(let i=0;i<40;i++)SURF.fx.push({x:SURF.p.x+5,y:SURF.p.y,vx:rnd(-120,120),vy:rnd(-160,-20),life:1.2,c:[WH,PG,MG,CY][i%4],s:2})};
  openText(e[0]+(first?'  (NEW)':''),L.loreFill(e[1]),o);}
/* ---- shop */
function shopRows(){const s=sv(),p=SURF.p,rows=[];const buy=(cost,fn)=>()=>{if(s.green<cost){SURF.msg=['NOT ENOUGH GREEN GOLD',1.6];return}s.green-=cost;fn();try{sfxTone(700,1400,.15,'square',.03,{att:.002})}catch(e){}save()};
  rows.push({t:'HEALTH REFILL',c:80,no:'FULL',d:'FILLS YOUR HEALTH BAR.',ok:p.hp<p.mhp,fn:buy(80,()=>{p.hp=p.mhp})});
  rows.push({t:'ENERGY SHIELD',c:220,no:'ON',d:'BLOCKS THE NEXT 3 HITS THIS VISIT.',ok:!(p.shield>0),fn:buy(220,()=>{p.shield=3})});
  rows.push({t:'ROCKET FUEL TANK',c:600,no:s.jet?'MAX':'NO PACK',d:s.jet?'MORE FUEL. YOU HAVE '+(s.shop.fuel||0)+' OF 3.':'NEEDS THE ROCKET PACK FIRST.',ok:!!s.jet&&(s.shop.fuel||0)<3,fn:buy(600,()=>{s.shop.fuel=(s.shop.fuel||0)+1})});
  rows.push({t:'LASER UPGRADE',c:(s.shop.dmg||0)?2000:800,no:'MAX',d:'MORE DAMAGE. YOU HAVE '+(s.shop.dmg||0)+' OF 2.',ok:(s.shop.dmg||0)<2,fn:buy((s.shop.dmg||0)?2000:800,()=>{s.shop.dmg=(s.shop.dmg||0)+1})});
  rows.push({t:'GLOW LANTERN',c:500,no:'OWNED',d:'SEE FURTHER IN DARK ROOMS.',ok:!s.shop.lamp,fn:buy(500,()=>{s.shop.lamp=1})});
  rows.push({t:'LEVEL MAP',c:300,no:'OWNED',d:'SHOWS THE WHOLE LEVEL ON THE MAP PAGE.',ok:!s.map[SURF.idx],fn:buy(300,()=>{s.map[SURF.idx]=1})});
  return rows}
function openShop(){const rows=shopRows();openModal({type:'menu',title:'TRADER BOT: GREEN GOLD SHOP',rows,cur:Math.max(0,rows.findIndex(r=>r.ok)),refresh:shopRows})}
/* ---- people */
function npcTalk(ia){const s=sv(),L=SURF.L,idx=SURF.idx;
  if(ia.npc==='trader'){openTalk('TRADER BOT',['BEEP. I BUY NOTHING AND SELL EVERYTHING. PAY IN GREEN GOLD ONLY. SHIP GOLD IS NOT ACCEPTED HERE.'],()=>openShop());return}
  if(ia.npc==='astro'){const q=s.q[ia.qid]||0,N=300+idx*150,qi=L.questItem;
    if(q===0&&qi){openTalk('STRANDED ASTRONAUT',['I AM STUCK HERE. MY DATA CRYSTAL FELL INTO THE ROOMS UNDER THE GROUND. IT GLOWS BLUE.','BRING IT BACK AND I WILL PAY YOU '+N+' GREEN GOLD.'],()=>{s.q[ia.qid]=1;SURF.msg=['QUEST: FIND THE DATA CRYSTAL',3];save()});return}
    if(q===1||q===2){if(q===2||(L.questItem&&L.questItem.got)){openTalk('STRANDED ASTRONAUT',['YOU FOUND MY DATA CRYSTAL! THANK YOU. HERE IS YOUR PAY: '+N+' GREEN GOLD.'],()=>{s.q[ia.qid]=3;s.green+=N;SURF.visit+=N;SURF.msg=['QUEST DONE  +'+N+' GREEN GOLD',3];save()});return}
      openTalk('STRANDED ASTRONAUT',['HAVE YOU FOUND MY DATA CRYSTAL YET? IT IS IN ONE OF THE ROOMS UNDER THE GROUND. LOOK FOR A BLUE GLOW.']);return}
    openTalk('STRANDED ASTRONAUT',['THANKS AGAIN FOR THE HELP.',secretHint()]);return}
  if(ia.npc==='hermit'){const sd=sv();openTalk('THE HERMIT',['I HAVE HEARD YOU WALKING ABOVE ME. SAND CARRIES EVERY SOUND.','THE TEMPLE HOLDS TWO KEYS, ONE RED AND ONE BLUE, IN TWO HIDDEN ROOMS. BOTH ARE NEEDED FOR THE INNER DOOR.','A ROOM OF SUN CRYSTALS GUARDS ANOTHER VAULT. TURN THE CRYSTALS UNTIL THE BEAM HITS THE GREEN GEM.',secretHint()]);return}
  if(ia.npc==='ghost'){openTalk('THE PILOT GHOST',idx===2?['I WAS THE NOMAD CREW. WE ARE ALL STILL HERE. THE LOG WILL TELL YOU THE CODE AND THE ORDER OF THE POWER NODES.','THREE POWER RODS GUARD A VAULT. STAND CLOSE SO A SPARK CHOOSES A ROD, THEN STEP AWAY BEFORE IT LANDS.',secretHint()]:['I FLEW THE SUNLARK ONCE. THE WALLS HERE REMEMBER SONGS. REPEAT THE SONG OF THE PODS AND THE WALL WILL OPEN.',secretHint()],()=>{const q=nearestSecret();if(q){SURF.guideT=30;SURF.msg=['THE GHOST LIGHTS POINT THE WAY',3]}});return}
}
/* ---- doors and tiles */
function doorOpen(d,msg){if(d.open)return;d.open=1;const L=SURF.L;for(const [x,y] of d.cells)if(L.g[y*L.LW+x]===d.tile)L.g[y*L.LW+x]=0;
  for(const [x,y] of d.cells)for(let i=0;i<4;i++)SURF.fx.push({x:x*TS+4,y:y*TS+4,vx:rnd(-40,40),vy:rnd(-60,0),life:.6,c:[LL,GM,YL][i%3],s:2});
  try{sfxBoom(8,false)}catch(e){}if(d.vault&&d.vault.sid)foundSecret(d.vault.sid);if(msg)SURF.msg=[msg,3];if(d.lock==='lever'){const c=d.cells[0];SURF.guideTo={x:c[0]*TS+4,y:c[1]*TS,t:16}}}
function doorClose(d){const L=SURF.L,p=SURF.p;for(const [x,y] of d.cells){if(p.x+p.w>x*TS&&p.x<x*TS+TS&&p.y+p.h>y*TS&&p.y<y*TS+TS)return false}
  {const v=d.vault;if(v&&p.x+p.w>(v.xl-1)*TS&&p.x<(v.xr+2)*TS&&p.y+p.h>(v.yt-1)*TS&&p.y<(v.yb+1)*TS)return false}   /* never lock the player inside a vault */d.open=0;for(const [x,y] of d.cells)if(L.g[y*L.LW+x]===0)L.g[y*L.LW+x]=d.tile;return true}
function crackHit(tx,ty){const L=SURF.L,d=L.doorAt.get(ty*L.LW+tx);if(!d||d.lock!=='crack'||d.open)return;const k=ty*L.LW+tx;d.hp[k]=(d.hp[k]||0)+1;
  for(let i=0;i<3;i++)SURF.fx.push({x:tx*TS+4,y:ty*TS+4,vx:rnd(-30,30),vy:rnd(-40,0),life:.4,c:LL,s:1});try{sfxTone(180,120,.06,'square',.03,{att:.001})}catch(e){}
  if(d.hp[k]>=3)doorOpen(d,'THE WALL CRUMBLES')}
/* ---- start of a visit */
function featStart(){const L=SURF.L,s=sv();SURF.modal=null;SURF.keys={};SURF.ev={next:rnd(35,60),phase:0,t:0,cur:null};SURF.strikes=[];SURF.near=null;SURF.useReq=false;SURF.kOK=SURF.kBack=false;SURF.guideT=0;SURF.hunter=null;SURF.chall=null;
  SURF.gl=[];for(let i=0;i<(SURF.idx===0?6:3);i++)SURF.gl.push({x:0,y:0,ph:Math.random()*6,a:0});
  SURF.explW=(L.LW>>3)+1;SURF.expl=new Uint8Array(SURF.explW*((L.LH>>3)+1));
  const p=SURF.p;p.mhp=6+(s.perk[0]?1:0);p.hp=p.mhp;p.shield=0;SURF.gt=0;SURF.dirtyMap=true;SURF.full100=false;
  for(const d of L.doors)d.open=0}
/* ---- every tick: interactions, puzzles, events */
function featTick(dt,I){const L=SURF.L,p=SURF.p,s=sv(),idx=SURF.idx;
  if(p.dead>0||p.hidden)return;
  /* map memory */
  {const ex=(p.x/TS)>>3,ey=(p.y/TS)>>3,W=SURF.explW;for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=3;dx++){const x=ex+dx,y=ey+dy;if(x>=0&&y>=0&&x<W)SURF.expl[y*W+x]=1}}
  /* bestiary */
  for(const e of SURF.en){if(e.hp<=0)continue;if(Math.abs(e.x-p.x)<170&&Math.abs(e.y-p.y)<110){const k=idx+'_'+e.k;if(!s.met[k]){s.met[k]=1;SURF.msg=['NEW CREATURE LOGGED: '+e.sp.n,2.4]}}}
  /* the nearest thing you can use */
  let best=null,bd=1e9;const px=p.x+5,py=p.y+16;
  for(const o of L.ia){if(o.hide||o.k==='key'||o.k==='frag'||o.k==='plate'||o.k==='rod'||o.k==='src'||o.k==='gem')continue;
    const dx=Math.abs(px-o.x),dy=Math.abs(py-o.y);if(dx<20&&dy<22&&dx+dy<bd){bd=dx+dy;best=o}}
  if(L.buried&&!L.buried.got&&sv().map3[idx+'_all']){const dx=Math.abs(px-L.buried.x),dy=Math.abs(py-L.buried.y);if(dx<18&&dy<22&&dx+dy<bd){bd=dx+dy;best={k:'dig',x:L.buried.x,y:L.buried.y}}}
  SURF.near=best;
  if(SURF.useReq){SURF.useReq=false;if(best&&!SURF.modal)useIA(best)}
  /* pickups and pressure plates */
  for(const o of L.ia){if(o.hide)continue;const dx=Math.abs(px-o.x),dy=Math.abs(py-o.y);
    if(o.k==='key'&&!o.got&&dx<14&&dy<22){o.got=1;SURF.keys[o.col]=1;SURF.msg=['YOU FOUND THE '+o.col.toUpperCase()+' KEY',3];try{sfxTone(600,1500,.3,'triangle',.04,{att:.005})}catch(e){}}
    if(o.k==='frag'&&!o.got&&!s.map3[idx+'_'+o.n]&&dx<14&&dy<24){o.got=1;s.map3[idx+'_'+o.n]=1;const n=[0,1,2].filter(q=>s.map3[idx+'_'+q]).length;SURF.msg=n>=3?['TREASURE MAP COMPLETE. LOOK FOR THE X.',4]:['TREASURE MAP PART '+n+' OF 3',3];if(n>=3)s.map3[idx+'_all']=1;save();try{sfxTone(500,1300,.3,'triangle',.04,{att:.005})}catch(e){}}
    if(o.k==='plate'){const on=p.on&&dx<9&&dy<5;const d=L.doors.find(q=>q.id===o.door);o.down=on?1:0;if(on&&d){if(!d.open){doorOpen(d,'PLATE PRESSED. THE DOOR IS OPEN FOR A SHORT TIME.')}d.t=9}}}
  if(L.questItem&&!L.questItem.got&&(s.q['q'+idx]||0)===1&&Math.abs(px-L.questItem.x)<14&&Math.abs(py-L.questItem.y)<24){L.questItem.got=1;s.q['q'+idx]=2;SURF.msg=['YOU FOUND THE DATA CRYSTAL. TAKE IT BACK.',3.5];try{sfxTone(500,1400,.3,'triangle',.04,{att:.005})}catch(e){}}
  for(const d of L.doors){
    if(d.lock==='plate'&&d.open&&d.t>0){d.t-=dt;if(d.t<=0){d.t=0;if(!doorClose(d))d.t=.5}}
    if((d.lock==='redkey'||d.lock==='bluekey'||d.lock==='both')&&!d.open){const [cx,cy]=d.cells[0];if(Math.abs(px-(cx*TS+4))<18&&Math.abs(py-(cy*TS+8))<26){const ok=d.lock==='both'?(SURF.keys.red&&SURF.keys.blue):d.lock==='redkey'?SURF.keys.red:SURF.keys.blue;
      if(ok)doorOpen(d,'THE DOOR UNLOCKS');else if(!d.warned||SURF.t-d.warned>4){d.warned=SURF.t;SURF.msg=[d.lock==='both'?'THIS DOOR NEEDS THE RED KEY AND THE BLUE KEY':'THIS DOOR NEEDS THE '+d.col.toUpperCase()+' KEY',2.5]}}}}
  /* collapsing bridge runs */
  /* the target challenge */
  for(const o of L.ia)if(o.k==='console'&&o.state===1){o.t-=dt;const left=L.targets.filter(q=>!q.hit).length;
    if(!left){o.state=2;SURF.msg=['ALL TARGETS HIT. A CHEST APPEARS.',3];const cx=Math.floor(o.x/TS);rtChest(cx+3,Math.round(o.y/TS),30+idx*10).sec=o.sid;for(let q=0;q<10;q++)L.coins.push({x:o.x+q*5,y:o.y-24,v:2,vx:rnd(-30,30),vy:rnd(-110,-50),loose:1});foundSecret(o.sid)}
    else if(o.t<=0){o.state=0;for(const t of L.targets)t.hit=0;SURF.msg=['TIME IS UP. TRY AGAIN.',2.5]}}
  /* the forge chase */
  if(L.chase){const ch=L.chase;
    if(ch.state===1){ch.t-=dt;if(ch.t<=0){ch.t=.8;if(ch.row>ch.top+1){ch.row--;for(let x=ch.xl;x<=ch.xr;x++){const k=ch.row*L.LW+x;if(L.g[k]===0){L.g[k]=4;ch.set.push(k)}}}else{ch.state=2;ch.t=5}}p.safe={x:ch.ent.x,y:ch.ent.y}}
    else if(ch.state===2){ch.t-=dt;if(ch.t<=0){ch.state=3;ch.t=.12}}
    else if(ch.state===3){ch.t-=dt;if(ch.t<=0){ch.t=.12;for(let q=0;q<500&&ch.set.length;q++){const k=ch.set.pop();if(L.g[k]===4)L.g[k]=0}if(!ch.set.length){ch.state=0;for(const o of L.ia)if(o.forge)o.on=0}}}}
  if(SURF.bossLow>0)SURF.bossLow-=dt;
  /* surge rods: stand close so a spark picks the rod, then step away before it lands */
  for(const d of L.doors){
    if(d.lock==='surge'&&!d.open){const rods=d.rods.map(id=>L.ia.find(q=>q.id===id)),un=rods.filter(r=>!r.on),nr=un.filter(r=>Math.abs(r.x-px)<100&&Math.abs(r.y-py)<60);
      if(nr.length&&!SURF.hintRod){SURF.hintRod=1;SURF.msg=['POWER RODS. STAND CLOSE, THEN STEP AWAY BEFORE THE SPARK LANDS.',4]}
      for(const r of rods)if(r.on){r.ct=(r.ct==null?15:r.ct)-dt;if(r.ct<=0){r.on=0;SURF.msg=['A ROD LOST ITS CHARGE',2]}}
      d.sg=(d.sg==null?2.2:d.sg)-dt;if(nr.length&&d.sg<=0&&!SURF.strikes.some(z=>z.rod)){nr.sort((a,b)=>Math.abs(a.x-px)-Math.abs(b.x-px));const r=nr[0];SURF.strikes.push({x:r.x,y:r.y,t:0,id:'surge',dur:1.5,rod:r.id,dmg:1,col:CY});d.sg=3.6}}
    if(d.lock==='mirror'){d.beam=traceBeam(d);if(d.beam.hit&&!d.open)doorOpen(d,'THE BEAM HITS THE GEM. THE VAULT OPENS');if(!d.hintDone&&Math.abs(d.cells[0][0]*TS-px)<140&&Math.abs(d.cells[0][1]*TS-py)<80&&!SURF.hintMir){SURF.hintMir=1;SURF.msg=['SUN CRYSTALS. TURN THEM SO THE BEAM HITS THE GREEN GEM.',4]}}}
  /* signature rooms announce themselves once */
  for(const st of L.sets){if(!st.seen&&px/TS>=st.x0&&px/TS<=st.x1&&py/TS>=st.y0&&py/TS<=st.y1+2){st.seen=1;SURF.rb={t:3.4,txt:st.name};try{sfxTone(380,760,.35,'triangle',.04,{att:.01})}catch(e){}}}
  /* fire vents */
  for(const v of (L.vents||[])){const ph=(L.tick+v.ph)%4.2;v.st=ph<2.6?0:ph<3.4?1:2;if(v.st===2&&p.dead<=0&&Math.abs(px-v.x)<11&&py>v.y-46&&py<v.y+6)hurt(PARAM[idx].dmg,false)}
  /* the hatchery nest */
  {const h=L.hatch;if(h&&h.state===1){const alive=SURF.en.filter(e=>e.nest&&e.hp>0).length;
    if(Math.abs(px-h.x)>360||Math.abs(py-h.y)>200){h.state=0;h.wave=0;for(const e of SURF.en)if(e.nest)e.hp=0;SURF.msg=['THE NEST WENT QUIET. DISTURB IT AGAIN TO TRY AGAIN.',3]}
    else if(!alive){h.t=(h.t||0)-dt;if(h.t<=0){h.wave++;if(h.wave>3){h.state=2;SURF.msg=['THE NEST IS EMPTY. A CHEST RISES.',3.5];rtChest(Math.floor(h.x/TS),Math.round(h.y/TS),40+idx*12).sec=h.sid;for(let q=0;q<3;q++)L.coins.push({x:h.x+q*10,y:h.y-10,v:0,heart:1,vx:rnd(-30,30),vy:rnd(-130,-80),loose:1});foundSecret(h.sid)}
      else{SURF.msg=['WAVE '+h.wave+' OF 3',2];const T=[[0,0,0],[3,3,0,0],[1,1,3,3,0]][h.wave-1];h.eggs.forEach((eg,i)=>{if(i>=T.length)return;const e=addEnemy(T[i],eg.x-6,eg.y-14,false);e.nest=1;for(let z=0;z<6;z++)SURF.fx.push({x:eg.x,y:eg.y-6,vx:rnd(-50,50),vy:rnd(-70,0),life:.5,c:[PG,MG,WH][z%3],s:2})});h.t=1}}}}}
  /* eggs that hatch */
  for(const e of L.eggs){if(e.st===2)continue;const dx=Math.abs(px-e.x),dy=Math.abs(py-e.y);
    if(e.st===0&&dx<26&&dy<26){e.st=1;e.t=.8;try{sfxTone(200,160,.2,'sawtooth',.03,{att:.01})}catch(er){}}
    else if(e.st===1){e.t-=dt;if(e.t<=0){e.st=2;if(e.real){(()=>{const q=addEnemy([0,3][rn_(0,1)],e.x-8,e.y-20,false);q.egg=1;return q})();SURF.msg=['THE EGG HATCHES',1.6]}else{for(let q=0;q<8;q++)L.coins.push({x:e.x,y:e.y-8,v:2,vx:rnd(-50,50),vy:rnd(-120,-50),loose:1})}
      for(let q=0;q<10;q++)SURF.fx.push({x:e.x,y:e.y-6,vx:rnd(-60,60),vy:rnd(-80,0),life:.6,c:[PG,MG,WH][q%3],s:2})}}}
  /* the hunter that follows you in the magma caves */
  if(idx===3&&SURF.t>85){const h=SURF.hunter;if(!h||(h.hp<=0&&SURF.t-(SURF.hunterDead||0)>60)){const sp=SURF.W.en.findIndex(q=>q.ai==='flyer');if(sp>=0){const e=addEnemy(sp,p.x+(Math.random()<.5?-1:1)*230,p.y-60,false,{hunter:1,keep:1});e.hp*=3;e.mhp=e.hp;e.sp=Object.assign({},e.sp,{spd:e.sp.spd*1.5});SURF.hunter=e;SURF.msg=['A HUNTER IS FOLLOWING YOU',3.5]}}
    else if(h.hp>0){const dx=h.x-p.x;if(Math.abs(dx)>330){h.x=p.x+Math.sign(dx)*250;h.y0=p.y-40}}}
  for(const e of SURF.en)if(e.shiny&&e.hp>0&&Math.random()<dt*10)SURF.fx.push({x:e.x+rnd(0,e.w),y:e.y+rnd(0,e.h),vx:rnd(-8,8),vy:rnd(-30,-5),life:.6,c:Math.random()<.5?YL:WH,s:1});
  /* guide lights toward the nearest secret */
  {let q=nearestSecret(),strong=idx===0||SURF.guideT>0;if(SURF.guideT>0)SURF.guideT-=dt;
   if(SURF.guideTo&&SURF.guideTo.t>0){SURF.guideTo.t-=dt;const gx=SURF.guideTo.x-p.x,gy=SURF.guideTo.y-p.y;q={q:SURF.guideTo,d:Math.hypot(gx,gy)};strong=true}
   for(const g of SURF.gl){let tx=p.x+5+Math.sin(L.tick*.7+g.ph)*34,ty=p.y-14+Math.cos(L.tick*.9+g.ph)*18;
     if(q&&strong&&q.d<(SURF.guideTo&&SURF.guideTo.t>0?3000:900)&&q.d>40){const ux=(q.q.x-p.x)/q.d,uy=(q.q.y-p.y)/q.d;tx+=ux*(46+g.ph*5);ty+=uy*(40+g.ph*4)}
     g.x+=(tx-g.x)*Math.min(1,dt*1.8);g.y+=(ty-g.y)*Math.min(1,dt*1.8)}}
  /* weather and events */
  eventTick(dt);
  /* the tracker's 100 percent reward */
  if(!s.full[idx]&&((SURF.gt=(SURF.gt||0)+dt)>2)){SURF.gt=0;const t=trk();if(t.full){s.full[idx]=1;const R=FULLR(idx);s.green+=R;SURF.visit+=R;SURF.banner={t:6,lines:['LEVEL 100 PERCENT COMPLETE','ALL SECRETS, LORE AND CREATURES FOUND','+'+R+' GREEN GOLD']};try{sfxTone(400,1800,.8,'triangle',.06,{att:.005})}catch(e){}save()}}
}
const rn_=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const FULLR=i=>600*(i+1);
function chaseFail(){const L=SURF.L,ch=L.chase;for(let q=0;q<6000&&ch.set.length;q++){const k=ch.set.pop();if(L.g[k]===4)L.g[k]=0}ch.state=0;for(const o of L.ia)if(o.forge)o.on=0;SURF.msg=null;SURF.banner={t:4,lines:['THE LAVA REACHED YOU.','THE FORGE COOLS. PULL THE LEVER TO TRY AGAIN.']};hurt(1,true)}
function rtChest(tx,ty,v){const c={x:tx*TS,y:ty*TS-10,open:0,v};SURF.L.chests.push(c);return c}
function gravK(){const e=SURF.ev;if(SURF.bossLow>0)return .45;return e&&e.phase===2&&e.cur&&e.cur.id==='pulse'?.45:1}
function spawnMimic(x,y){const sp={n:'CURSED CHEST',ai:'hopper',spd:46,w:14,h:12,hp:5,gold:8,pal:[BR,TN,OR,YL,WH]},e={sp,A:SURF.A.en[SURF.W.en.length],x,y:y-2,vx:0,vy:0,w:14,h:11,hp:5*(1+SURF.idx*.35),face:-1,t:0,cd:.3,st:0,on:false,elite:false,y0:y,flash:0,home:x,spec:SURF.W.en.length,k:SURF.W.en.length,sc:1,mimic:1};e.mhp=e.hp;SURF.en.push(e);return e}
function traceBeam(d){const L=SURF.L,m=d.mir,src=L.ia.find(q=>q.id===m.src),gem=L.ia.find(q=>q.id===m.gem),ms=m.ids.map(id=>L.ia.find(q=>q.id===id));
  let x=src.x,y=src.y-12,dx=src.dir,dy=0,hit=false;const pts=[[x,y]];
  for(let seg=0;seg<7;seg++){let best=null,bd=1e9;
    for(const o of ms){const my=o.y-12,al=(o.x-x)*dx+(my-y)*dy,pe=Math.abs((o.x-x)*dy)+Math.abs((my-y)*dx);if(al>2&&pe<4&&al<bd){bd=al;best=o}}
    const gy=gem.y-12,ga=(gem.x-x)*dx+(gy-y)*dy,gp=Math.abs((gem.x-x)*dy)+Math.abs((gy-y)*dx);
    if(ga>2&&gp<5&&ga<bd){hit=true;pts.push([gem.x,gy]);break}
    if(best){const my=best.y-12;pts.push([best.x,my]);x=best.x;y=my;const nd=best.st?[-dy,-dx]:[dy,dx];dx=nd[0];dy=nd[1]}else{pts.push([x+dx*160,y+dy*160]);break}}
  return{pts,hit}}
function useIA(o){const L=SURF.L,s=sv(),idx=SURF.idx,p=SURF.p;
  if(o.k==='nest'){const h=L.hatch;if(h.state===0){h.state=1;h.wave=0;h.t=.6;SURF.msg=['YOU DISTURBED THE NEST. DEFEAT THREE WAVES.',3]}else if(h.state===1)SURF.msg=['FIGHT THE BROOD.',1.5];else SURF.msg=['THE NEST IS EMPTY.',1.5];return}
  if(o.k==='mirror'){o.st=o.st?0:1;try{sfxTone(480+o.st*160,620,.15,'triangle',.04,{att:.003})}catch(e){}return}
  if(o.k==='lore')readLore(o);
  else if(o.k==='npc')npcTalk(o);
  else if(o.k==='lever'){if(o.forge){const ch=L.chase;if(ch&&ch.state===0){ch.state=1;ch.t=4;ch.row=ch.yb;o.on=1;SURF.msg=['THE FORGE WAKES. LAVA IS RISING. CLIMB!',3.5];shakeS=.4;try{sfxBoom(12,true)}catch(e){}}return}
    const d=L.doors.find(q=>q.id===o.door);if(d&&!o.on){o.on=1;doorOpen(d,'A DOOR OPENED SOMEWHERE')}}
  else if(o.k==='portal'){if(SURF.t-(SURF.portalT||-9)<1)return;const to=L.ia.find(q=>q.id===o.to);if(to){SURF.portalT=SURF.t;p.x=to.x-5;p.y=to.y-16;p.vx=p.vy=0;p.inv=.5;if(o.sid)foundSecret(o.sid);for(let i=0;i<20;i++)SURF.fx.push({x:to.x,y:to.y-8,vx:rnd(-60,60),vy:rnd(-80,0),life:.7,c:[MG,CY,WH][i%3],s:2});try{sfxTone(300,1200,.4,'sine',.05,{att:.01})}catch(e){}}}
  else if(o.k==='shrine'){if(s.perk[o.perk]){openText('SHRINE','THE SHRINE IS QUIET. ITS GIFT IS ALREADY YOURS.');return}s.perk[o.perk]=1;if(o.perk===0){p.mhp=7;p.hp=p.mhp}foundSecret(o.sid);openText('SHRINE',PERKS[o.perk]);save();for(let i=0;i<30;i++)SURF.fx.push({x:o.x,y:o.y-10,vx:rnd(-80,80),vy:rnd(-100,-10),life:1,c:[YL,WH,CY][i%3],s:2})}
  else if(o.k==='panel'){const d=L.doors.find(q=>q.id===o.door);if(d&&d.open){openText('CODE PANEL','THE DOOR IS ALREADY OPEN.');return}openModal({type:'code',digits:[0,0,0],cur:0,door:d,code:o.code})}
  else if(o.k==='pod'){const d=L.doors.find(q=>q.id===o.door),sq=d.seq;if(d.open||sq.play>0)return;podPress(d,o)}
  else if(o.k==='echo'){const d=L.doors.find(q=>q.id===o.door),sq=d.seq;if(d.open||sq.play>0)return;sq.step=0;sq.play=.01;sq.pi=0;sq.pt=.4;SURF.msg=['LISTEN TO THE SONG',2]}
  else if(o.k==='console'){if(o.state===0){o.state=1;o.t=24;for(const t of L.targets)t.hit=0;SURF.msg=['SHOOT ALL 6 TARGETS IN 24 SECONDS',3]}else if(o.state===1)SURF.msg=['SHOOT THE TARGETS!',1.5]}
  else if(o.k==='dig'){const b=L.buried;if(b&&!b.got){b.got=1;rtChest(Math.floor(b.x/TS),Math.round(b.y/TS),90+idx*25).sec=b.sid;SURF.msg=['YOU DUG UP A CHEST',3];for(let i=0;i<14;i++)SURF.fx.push({x:b.x,y:b.y-4,vx:rnd(-50,50),vy:rnd(-90,-20),life:.6,c:[TN,BR,YL][i%3],s:2});foundSecret(b.sid)}}
}
function podPress(d,o){const sq=d.seq;const exp=sq.order[sq.step];try{sfxTone(260+o.col*140,260+o.col*140,.3,'triangle',.05,{att:.005})}catch(e){}o.lit=.5;
  if(o.col===exp){o.on=1;sq.step++;if(sq.step>=sq.order.length){doorOpen(d,sq.mode==='echo'?'THE HIVE WALL OPENS':'THE VAULT OPENS');sq.done=1}}
  else{sq.step=0;for(const id of sq.pods){const q=SURF.L.ia.find(z=>z.id===id);if(q)q.on=0}SURF.msg=[sq.mode==='echo'?'WRONG NOTE. A SPARK HITS YOU. LISTEN AGAIN.':'WRONG ORDER. A SPARK HITS YOU. THE NODES RESET.',2.5];for(let i=0;i<8;i++)SURF.fx.push({x:o.x,y:o.y-8,vx:rnd(-60,60),vy:rnd(-80,-10),life:.4,c:YL,s:2});hurt(1,false);try{sfxTone(120,60,.3,'sawtooth',.05,{att:.005})}catch(e){}}}
/* ---- weather and strikes */
function eventTick(dt){const L=SURF.L,p=SURF.p,ev=SURF.ev,idx=SURF.idx;const pool=EVT[idx];
  if(ev.phase===0){ev.next-=dt;if(ev.next<=0){ev.cur=pool[Math.floor(Math.random()*pool.length)];ev.phase=1;ev.t=5;SURF.banner={t:5,lines:[ev.cur.warn]}}}
  else if(ev.phase===1){ev.t-=dt;if(ev.t<=0){ev.phase=2;ev.t=rnd(14,20);SURF.msg=[ev.cur.on,4];ev.strike=0;if(ev.cur.id==='quake'||ev.cur.id==='meteor')shakeS=.3}}
  else{ev.t-=dt;const id=ev.cur.id,exposed=L.sky(Math.floor((p.x+5)/TS),Math.floor(p.y/TS)-7);
    if(id==='spore'||id==='sand'){if(exposed){const w=(id==='sand'?30:14)*(ev.dir||(ev.dir=Math.random()<.5?-1:1)),nx=p.x+w*dt;if(!hitsSolid(nx,p.y,p.w,p.h))p.x=nx}}
    if(id==='quake'){shakeS=Math.max(shakeS,.1)}
    if(id==='meteor'||id==='quake'||id==='surge'){ev.strike=(ev.strike||0)-dt;if(ev.strike<=0){ev.strike=id==='surge'?rnd(1.6,2.6):rnd(.7,1.3);const x=p.x+rnd(-130,130);let y=Math.floor((p.y-60)/TS);const cx=Math.floor(x/TS);let found=-1;for(let q=y;q<y+60;q++){const t=tile(cx,q);if(t===1||t===2||t===6){found=q;break}}
      if((id==='meteor'&&!exposed&&Math.random()<.7)||found<0){}else SURF.strikes.push({x,y:found*TS,t:0,id,dur:id==='surge'?1.1:1.4})}}
    if(ev.t<=0){ev.phase=0;ev.next=rnd(60,100);ev.cur=null}}
  for(const st of SURF.strikes){st.t+=dt;if(!st.done&&st.t>=st.dur){st.done=1;shakeS=Math.max(shakeS,.08);for(let q=0;q<14;q++)SURF.fx.push({x:st.x,y:st.y-3,vx:rnd(-70,70),vy:rnd(-110,-10),life:.5,c:st.id==='surge'||st.id==='erupt'&&st.col?(st.col&&q%2?st.col:WH):[OR,YL,RD][q%3],s:2});try{sfxBoom(8,false)}catch(e){}
    const hit=Math.abs((p.x+5)-st.x)<(st.id==='erupt'?13:12)&&Math.abs((p.y+8)-st.y)<28;if(hit)hurt(st.dmg||1,false);
    if(st.rod){const r=L.ia.find(q=>q.id===st.rod);if(r){if(hit)SURF.msg=['THE ROD OVERLOADED. STEP AWAY BEFORE THE SPARK LANDS.',2.6];else{r.on=1;const dd=L.doors.find(q=>q.id===r.door);r.ct=15;if(dd&&dd.rods.every(id=>L.ia.find(q=>q.id===id).on))doorOpen(dd,'ALL THREE RODS ARE CHARGED. THE VAULT OPENS');else SURF.msg=['ROD CHARGED. THE CHARGE FADES IN 15 SECONDS.',2.4]}}}}}
  SURF.strikes=SURF.strikes.filter(st=>st.t<st.dur+.4);
  /* the echo song and beams */
  for(const d of L.doors)if(d.seq&&d.seq.play>0){const sq=d.seq;sq.pt-=dt;if(sq.pt<=0){const pod=L.ia.find(q=>q.id===sq.pods[sq.order[sq.pi]]);if(pod){pod.lit=.6;try{sfxTone(260+pod.col*140,260+pod.col*140,.4,'triangle',.05,{att:.005})}catch(e){}}sq.pi++;sq.pt=.75;if(sq.pi>=sq.order.length){sq.play=0;SURF.msg=['NOW SING IT BACK',2]}}}
  for(const o of L.ia)if(o.lit>0)o.lit-=dt}
/* ---- the modal windows */
function modalTick(dt,I){const m=SURF.modal;m.t+=dt;const cur={l:I.l,r:I.r,u:I.up,d:I.down,ok:I.jumpB,back:!!(UI.keys.x||UI.keys.z||UI.keys.j||(PAD.prev&&(PAD.prev.B||PAD.prev.X)))};
  if(!SURF.pv){SURF.pv=Object.assign({},cur);SURF.kOK=SURF.kBack=false;return}
  const E={};for(const k in cur){E[k]=cur[k]&&!SURF.pv[k];SURF.pv[k]=cur[k]}
  if(SURF.kOK){E.ok=true;SURF.kOK=false}if(SURF.kBack){E.back=true;SURF.kBack=false}
  if(m.t<.15)return;
  const s=sv();
  if(m.type==='text'){if(E.ok||E.back){if(m.back){SURF.modal=m.back;SURF.pv=null;SURF.mh=[]}else closeModal()}}
  else if(m.type==='talk'){if(E.ok||E.back||E.u||E.d){if(m.page<m.pages.length-1)m.page++;else{const f=m.done;closeModal();if(f)f()}}}
  else if(m.type==='menu'){const n=m.rows.length;if(E.d)m.cur=(m.cur+1)%n;if(E.u)m.cur=(m.cur+n-1)%n;if(E.back){closeModal();return}
    if(E.ok){const r=m.rows[m.cur];if(r.ok){r.fn();m.rows=m.refresh()}else SURF.msg=[r.d,1.5]}}
  else if(m.type==='code'){if(E.l)m.cur=(m.cur+2)%3;if(E.r)m.cur=(m.cur+1)%3;if(E.u)m.digits[m.cur]=(m.digits[m.cur]+1)%5;if(E.d)m.digits[m.cur]=(m.digits[m.cur]+4)%5;if(E.back){closeModal();return}
    if(E.ok)codeTry(m)}
  else if(m.type==='pause'){pauseKeys(m,E)}}
function codeTry(m){const L=SURF.L;const okc=m.digits[0]+1===m.code[0]&&m.digits[1]+1===m.code[1]&&m.digits[2]+1===m.code[2];if(okc){closeModal();doorOpen(m.door,'THE CODE IS RIGHT. THE VAULT OPENS')}else{SURF.msg=['WRONG CODE',1.6];try{sfxTone(120,60,.3,'sawtooth',.05,{att:.005})}catch(e){}}}
function pauseKeys(m,E){const NT=4;
  if(E.back){closeModal();return}
  if(m.focus===0){if(E.l)m.tab=(m.tab+NT-1)%NT;if(E.r)m.tab=(m.tab+1)%NT;if(E.d){if(m.tab===1||m.tab===2)m.focus=2;else m.focus=1}}
  else if(m.focus===2){const n=m.tab===1?25:SURF.W.en.length;if(E.d){if(m.cur[m.tab]<n-1)m.cur[m.tab]++;else m.focus=1}if(E.u){if(m.cur[m.tab]>0)m.cur[m.tab]--;else m.focus=0}if(E.ok&&m.tab===1){const q=m.cur[1],i=Math.floor(q/5),k=q%5;if(sv().lore[i*10+k]){const e=LORE[i][k];openModal({type:'text',title:e[0],lines:wrapT(SURF.L.loreFill(e[1]),262),back:m})}}}
  else{if(E.u)m.focus=m.tab===1||m.tab===2?2:0;if(E.l||E.r)m.btn=1-m.btn;if(E.ok){if(m.btn===0)closeModal();else{closeModal();SURF.beamUp()}}}}
/* ---- drawing the modals */
function panelBox(x,y,w,h,title){ctx.globalAlpha=.94;ctx.fillStyle='#05031a';ctx.fillRect(x,y,w,h);ctx.globalAlpha=1;ctx.fillStyle=YL;ctx.fillRect(x,y,w,1);ctx.fillRect(x,y+h-1,w,1);ctx.fillStyle='#352879';ctx.fillRect(x,y+1,w,9);if(title)textC2(title,x+w/2,y+2,YL)}
function mhit(x,y,w,h,fn){SURF.mh.push({x,y,w,h,fn})}
function btnBox(x,y,w,h,label,focus,fn){ctx.fillStyle=focus?'#8a7ae0':'#2a2150';ctx.fillRect(x,y,w,h);ctx.fillStyle=focus?WH:'#6c5eb5';ctx.fillRect(x,y,w,1);textC2(label,x+w/2,y+h/2-3,focus?WH:'#bbbbdd');if(fn)mhit(x,y,w,h,fn)}
function drawModal(){const m=SURF.modal;if(!m)return;SURF.mh=[];const s=sv(),A=SURF.A;
  if(m.type==='text'){const h=m.lines.length*9+34,y0=Math.max(14,Math.round((VH-h)/2)-6);panelBox(18,y0,VW-36,h,m.title);m.lines.forEach((ln,i)=>text(ln,26,y0+14+i*9,i>-1?WH:WH,1));
    btnBox(VW/2-26,y0+h-14,52,11,'OK  ('+useLabel()+')',true,()=>{if(m.back){SURF.modal=m.back;m.back.t=0}else closeModal()});mhit(0,0,VW,VH,()=>{if(m.back){SURF.modal=m.back}else closeModal()})}
  else if(m.type==='talk'){const ln=m.pages[m.page],h=ln.length*9+36,y0=VH-h-12;panelBox(10,y0,VW-20,h,m.name);ln.forEach((t,i)=>text(t,18,y0+14+i*9,WH,1));
    textR(m.page<m.pages.length-1?'NEXT':'OK',VW-16,y0+h-10,YL,1);mhit(0,0,VW,VH,()=>{if(m.page<m.pages.length-1)m.page++;else{const f=m.done;closeModal();if(f)f()}})}
  else if(m.type==='menu'){const n=m.rows.length,h=n*14+44,y0=Math.max(10,Math.round((VH-h)/2));panelBox(20,y0,VW-40,h,m.title);textR('GREEN GOLD '+s.green,VW-26,y0+12,GREEN[3],1);
    m.rows.forEach((r,i)=>{const y=y0+22+i*14,foc=i===m.cur;ctx.fillStyle=foc?'#3a2f7a':'#12102a';ctx.fillRect(26,y,VW-52,12);text(r.t,30,y+2,r.ok?(foc?WH:'#ccccee'):'#6c6c8c',1);textR(r.ok?r.c+'':r.no,VW-30,y+2,r.ok?(s.green>=r.c?GREEN[3]:RD):'#8888aa',1);mhit(26,y,VW-52,12,()=>{m.cur=i;if(r.ok){r.fn();m.rows=m.refresh()}else SURF.msg=[r.d,1.5]})});
    text(m.rows[m.cur].d,26,y0+h-20,'#9ad2e0',1);btnBox(VW-60,y0+h-12,34,10,'CLOSE',false,()=>closeModal());mhit(0,0,VW,y0,()=>closeModal())}
  else if(m.type==='code'){const h=70,y0=60;panelBox(80,y0,VW-160,h,'CODE PANEL');text('UP AND DOWN: CHANGE. LEFT AND RIGHT: MOVE.',86,y0+13,'#9ad2e0',1);
    for(let i=0;i<3;i++){const x=VW/2-36+i*26,foc=i===m.cur;ctx.fillStyle=foc?'#6c5eb5':'#2a2150';ctx.fillRect(x,y0+26,22,24);textC2(String(m.digits[i]+1),x+11,y0+34,WH);mhit(x,y0+26,22,12,()=>{m.cur=i;m.digits[i]=(m.digits[i]+1)%5});mhit(x,y0+38,22,12,()=>{m.cur=i;m.digits[i]=(m.digits[i]+4)%5})}
    btnBox(VW/2-30,y0+h-14,28,10,'ENTER',true,()=>codeTry(m));btnBox(VW/2+4,y0+h-14,28,10,'CLOSE',false,()=>closeModal())}
  else if(m.type==='pause')drawPause(m)}
function drawPause(m){const s=sv(),L=SURF.L,idx=SURF.idx,Wd=SURF.W,A=SURF.A;panelBox(8,6,VW-16,VH-12,'PAUSED:  '+Wd.n);
  const tabs=['PROGRESS','LORE','CREATURES','MAP'];tabs.forEach((t,i)=>{const x=14+i*76,foc=m.tab===i;ctx.fillStyle=foc?(m.focus===0?'#6c5eb5':'#4a3f8a'):'#1c1840';ctx.fillRect(x,18,72,11);textC2(t,x+36,20,foc?WH:'#8888aa');mhit(x,18,72,11,()=>{m.tab=i;m.focus=0})});
  const T=trk(),y0=34;
  if(m.tab===0){const rows=[['SECRETS FOUND',T.sec+' OF '+T.tot],['LORE READ',T.lr+' OF '+T.lt],['CREATURES LOGGED',T.met+' OF '+T.mt],['SHIP PIECE',SURF.pieceStatus(idx).replace('PIECE: ','').replace('PIECES: ','')],['GREEN GOLD THIS VISIT','+'+SURF.visit],['KEYS',(SURF.keys.red?'RED ':'')+(SURF.keys.blue?'BLUE':'')||'NONE'],['BONUS FOR 100 PERCENT',s.full[idx]?'CLAIMED':T.full?'READY':'+'+FULLR(idx)+' GREEN GOLD']];
    rows.forEach((r,i)=>{text(r[0],20,y0+i*11,'#bbbbdd',1);textR(r[1],VW-20,y0+i*11,i<3&&(i===0?T.sec>=T.tot:i===1?T.lr>=T.lt:T.met>=T.mt)?GREEN[3]:WH,1)});
    const yy=y0+rows.length*11+4;text('ALL WORLDS',20,yy,YL,1);for(let w=0;w<5;w++){let lr=0;for(let k=0;k<5;k++)if(s.lore[w*10+k])lr++;let sc=0,st=0;const x=20+w*56;text('W'+(w+1)+(s.done[w]?' CLEARED':' OPEN'),x,yy+10,s.done[w]?GREEN[3]:'#6c6c8c',1);text('LORE '+lr+'/5',x,yy+19,lr>=5?GREEN[3]:'#9ad2e0',1);text(s.full[w]?'100%':'',x,yy+28,YL,1)}
    text('SHIP PIECES '+SURF.piecesFound()+' OF 6.   USE: '+useLabel()+'   PAUSE: B',20,yy+38,'#8888aa',1);text('A SECRET IS A HIDDEN VAULT, PUZZLE OR TREASURE.',20,yy+48,'#8888aa',1)}
  else if(m.tab===1){const cur=m.cur[1],top0=Math.max(0,Math.min(cur-2,25-6));for(let i=0;i<6;i++){const q=top0+i;if(q>=25)break;const w=Math.floor(q/5),k=q%5,rd=s.lore[w*10+k],foc=m.focus===2&&q===cur;const y=y0+i*11;ctx.fillStyle=foc?'#3a2f7a':q===cur?'#201a48':'#0a0820';ctx.fillRect(14,y,VW-28,10);text('W'+(w+1)+'  '+(rd?LORE[w][k][0]:'???'),18,y+1,rd?WH:'#5a5a7a',1);mhit(14,y,VW-28,10,()=>{m.cur[1]=q;m.focus=2;if(rd){const e=LORE[w][k];openModal({type:'text',title:e[0],lines:wrapT(SURF.L.loreFill?SURF.L.loreFill(e[1]):e[1],262),back:m})}})}
    {const q=cur,w=Math.floor(q/5),k=q%5,rd=s.lore[w*10+k],ty=y0+6*11+4;ctx.fillStyle='#0a0820';ctx.fillRect(14,ty-2,VW-28,56);ctx.fillStyle='#352879';ctx.fillRect(14,ty-2,VW-28,1);if(rd){const ls=wrapT(SURF.L.loreFill?SURF.L.loreFill(LORE[w][k][1]):LORE[w][k][1],262);ls.slice(0,5).forEach((l_,i)=>text(l_,20,ty+2+i*9,WH,1))}else text('NOT FOUND YET. LOOK FOR LORE OBJECTS IN WORLD '+(w+1)+'.',20,ty+2,'#8888aa',1)}}
  else if(m.tab===2){const n=Wd.en.length,cur=m.cur[2];for(let i=0;i<n;i++){const e=Wd.en[i],met=s.met[idx+'_'+i],kills=s.seen[idx+'_'+i]||0,foc=m.focus===2&&i===cur,y=y0+i*20;ctx.fillStyle=foc?'#3a2f7a':i===cur?'#201a48':'#0a0820';ctx.fillRect(14,y,VW-28,19);
      if(met){const fr=A.en[i].fr[0],sc=Math.min(1,16/Math.max(fr.width,fr.height));ctx.drawImage(fr,22,y+9-fr.height*sc/2,fr.width*sc,fr.height*sc)}else text('?',26,y+6,'#5a5a7a',1);
      text(met?e.n:'???',44,y+2,met?WH:'#5a5a7a',1);text(met?wrapT(ENDESC[e.ai]||'',200)[0]||'':'NOT MET YET',44,y+10,'#9ad2e0',1);textR(met?'DEFEATED '+kills+(s.shiny[idx+'_'+i]?'  GOLD':''):'',VW-18,y+2,kills?GREEN[3]:'#8888aa',1);mhit(14,y,VW-28,19,()=>{m.cur[2]=i;m.focus=2})}
    let oth=0;for(const k in s.met)if(!k.startsWith(idx+'_'))oth++;text('CREATURES LOGGED ON OTHER WORLDS: '+oth,18,y0+n*20+4,'#8888aa',1)}
  else{drawMapPage(y0)}
  const by=VH-22;btnBox(VW/2-62,by,56,11,'CONTINUE',m.focus===1&&m.btn===0,()=>closeModal());btnBox(VW/2+6,by,56,11,'BEAM UP',m.focus===1&&m.btn===1,()=>{closeModal();SURF.beamUp()});
  if(m.focus!==1)text('DOWN: BUTTONS',16,by+2,'#6c6c8c',1)}
function buildMapCanvas(L,idx,cs,seenFn,cv){const LW=L.LW,LH=L.LH,W=Math.ceil(LW/cs),H=Math.ceil(LH/cs);cv=cv||document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),id=g.createImageData(W,H),d=id.data;
  const RIM=['#ff77ff','#ffd7a0','#9ad2e0','#ff9966','#ffcc66'][idx],ROCK=[[78,52,110],[150,86,60],[62,82,118],[96,44,34],[40,110,84]][idx],AIR=[[16,8,30],[30,12,10],[8,12,26],[22,6,6],[6,24,20]][idx];
  const kind=new Uint8Array(W*H);   /* 0 outside, 1 rock, 2 room, 3 water, 4 lava, 5 ladder, 6 platform, 7 door */
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let so=0,ai=0,wa=0,la=0,ld=0,pl=0,ou=0,sk=0,n=0;
    for(let dy=0;dy<cs;dy+=2)for(let dx=0;dx<cs;dx+=2){const tx=Math.min(LW-1,x*cs+dx),ty=Math.min(LH-1,y*cs+dy),t=L.g[ty*LW+tx];n++;if(L.out&&L.out[ty*LW+tx])ou++;else if(L.sky(tx,ty))sk++;else if(t===1||t===6||t===13)so++;else if(t===0)ai++;else if(t===10)wa++;else if(t===4)la++;else if(t===7)ld++;else if(t===2)pl++;else if(t===11)ai++}
    let k=1;if(ou+sk>=n*.5)k=0;else if(la)k=4;else if(wa>=n*.34)k=3;else if(ld>=2)k=5;else if(ai+wa+pl+ld>=n*.45)k=2;else if(so<n*.4)k=2;kind[y*W+x]=k}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=kind[y*W+x],i=(y*W+x)*4;let r=0,gg=0,b=0,a=255;const tx=x*cs,ty=y*cs;
    const seen=seenFn(tx,ty);
    if(k===0){a=0}
    else if(!seen){r=ROCK[0]*.3;gg=ROCK[1]*.3;b=ROCK[2]*.3+8;a=150}
    else if(k===1){let v=1;const edge=kind[(y>0?y-1:y)*W+x]===0||kind[(y<H-1?y+1:y)*W+x]===0||kind[y*W+(x>0?x-1:x)]===0||kind[y*W+(x<W-1?x+1:x)]===0;
      if(edge){const c=parseInt(RIM.slice(1),16);r=c>>16;gg=(c>>8)&255;b=c&255}
      else{v=.9+((x*7+y*13)%5)*.04;if(idx===2){if(y%7===0)v=.62;else if(x%9===0&&y%7===3)v=1.35}else if(idx===4){if(((x*5+(y>>1)*3)%13)<2)v=1.4;else if(((x+y*2)%17)===0)v=.7}else if(((x*3+y*5)%11)===0)v=1.15;r=ROCK[0]*v;gg=ROCK[1]*v;b=ROCK[2]*v}}
    else if(k===2){r=AIR[0];gg=AIR[1];b=AIR[2];if(idx===2&&(x*3+y*5)%23===0){r=200;gg=190;b=100}}
    else if(k===3){r=30;gg=90;b=170;if(idx===4){r=80;gg=190;b=50}}
    else if(k===4){r=235;gg=110;b=30}
    else if(k===5){r=210;gg=200;b=130}
    else{r=160;gg=140;b=70}
    const i2=(y*W+x)*4;d[i2]=r;d[i2+1]=gg;d[i2+2]=b;d[i2+3]=a}
  g.putImageData(id,0,0);let y0=0;while(y0<H-1){let any=false;for(let x=0;x<W;x++)if(kind[y0*W+x]!==0){any=true;break}if(any)break;y0++}y0=Math.max(0,y0-2);
  const c2=document.createElement('canvas');c2.width=W;c2.height=H-y0;c2.getContext('2d').drawImage(cv,0,y0,W,H-y0,0,0,W,H-y0);c2.y0=y0;return c2}
function drawMapPage(y0){const L=SURF.L,s=sv(),p=SURF.p,idx=SURF.idx;const cs=4;
  if(!L.mapCv||SURF.dirtyMap){const full=!!s.map[idx];L.mapCv=buildMapCanvas(L,idx,cs,(tx,ty)=>full||SURF.expl[(ty>>3)*SURF.explW+(tx>>3)]);SURF.dirtyMap=false;SURF.mapT=0}
  const W=L.mapCv.width,H=L.mapCv.height,yo=L.mapCv.y0||0;
  SURF.mapT=(SURF.mapT||0)+1;if(SURF.mapT>90){SURF.dirtyMap=true}
  const sc=Math.min((VW-24)/W,(VH-70)/H),dw=W*sc,dh=H*sc,ox=Math.round((VW-dw)/2),oy=y0+2;ctx.fillStyle='#000';ctx.fillRect(ox-1,oy-1,dw+2,dh+2);ctx.imageSmoothingEnabled=false;ctx.drawImage(L.mapCv,ox,oy,dw,dh);
  const dot=(x,y,c,sz)=>{sz+=1;ctx.fillStyle=K;ctx.fillRect(Math.round(ox+x/TS/cs*sc)-(sz>>1)-1,Math.round(oy+(y/TS/cs-yo)*sc)-(sz>>1)-1,sz+2,sz+2);ctx.fillStyle=c;ctx.fillRect(Math.round(ox+x/TS/cs*sc)-(sz>>1),Math.round(oy+(y/TS/cs-yo)*sc)-(sz>>1),sz,sz)};
  const seenAt=(x,y)=>!!s.map[idx]||SURF.expl[((y/TS)>>3)*SURF.explW+((x/TS)>>3)];
  for(const c of L.checks)if(seenAt(c.x,c.y))dot(c.x,c.y,'#55ffff',2);
  for(const c of L.chests)if(!c.open&&seenAt(c.x,c.y))dot(c.x,c.y,GREEN[2],2);
  dot(L.exit.x,L.exit.y,'#55ff55',3);
  for(const o of L.ia){if(o.hide||!seenAt(o.x,o.y))continue;if(o.k==='lore')dot(o.x,o.y,'#ffffff',2);else if(o.k==='npc')dot(o.x,o.y,'#55ddff',3);else if(o.k==='portal')dot(o.x,o.y,'#ff77ff',3);else if(o.k==='shrine')dot(o.x,o.y,'#ffffaa',3)}
  for(const d of L.doors){const c=d.cells[0];if(!seenAt(c[0]*TS,c[1]*TS))continue;dot(c[0]*TS,c[1]*TS,d.open?'#44aa44':'#ff9944',3)}
  for(const st of L.sets)if(seenAt(((st.x0+st.x1)>>1)*TS,st.y1*TS))dot(((st.x0+st.x1)>>1)*TS,(st.y1-4)*TS,'#ff9acb',4);
  for(const q of L.secretPts)if(q.sid&&s.sec[q.sid])dot(q.x,q.y,'#ffee33',3);
  if(s.map3[idx+'_all']&&L.buried&&!L.buried.got){dot(L.buried.x,L.buried.y,'#ffff55',4)}
  dot(p.x,p.y,'#ffffff',4);dot(p.x,p.y,'#ff3030',2);
  text(s.map[idx]?'MAP: FULL (BOUGHT)':'MAP: WHAT YOU HAVE SEEN. A LEVEL MAP IS SOLD BY THE TRADER BOT.',14,oy+dh+4,'#8888aa',1);text('WHITE: YOU  GREEN: BEACON  CYAN: BEAM PADS  LIME: CHESTS',14,oy+dh+14,'#bbbbdd',1);text('BLUE: PEOPLE  ORANGE: DOORS  PINK: PORTAL/BIG ROOM  YELLOW: FOUND',14,oy+dh+23,'#bbbbdd',1)}
/* ---- world drawing: things you can use */
function featWorld(){const L=SURF.L,A=SURF.A,F=A.fx,cam=SURF.cam,p=SURF.p,s=sv(),idx=SURF.idx,t=L.tick;
  const vis=(x,y,m)=>x>cam.x-m&&x<cam.x+VW+m&&y>cam.y-m&&y<cam.y+VH+m;
  /* tiles of doors */
  /* the glow of cracked walls and doors that hide something */
  for(const d of L.doors){if(d.open)continue;const [cx,cy]=d.cells[0];if(!vis(cx*TS,cy*TS,40))continue;const dd=Math.hypot(p.x-cx*TS,p.y-cy*TS);
    if(d.lock!=='crack'){const lc={lever:'#55eeee',plate:'#ff9966',code:'#ffee55',seq:'#ff77ff',redkey:'#ff5544',bluekey:'#55aaff',both:'#ffffff'}[d.lock]||WH,pu=.5+.5*Math.sin(t*4);for(const [x,y] of d.cells){ctx.fillStyle=lc;ctx.globalAlpha=.55+.45*pu;ctx.fillRect(x*TS-cam.x+3|0,y*TS-cam.y+3|0,2,2)}const [x0,y0]=d.cells[0],[x1,y1]=d.cells[d.cells.length-1];ctx.globalAlpha=.1+.12*pu;ctx.fillStyle=lc;ctx.fillRect(x0*TS-cam.x-3|0,y0*TS-cam.y-1|0,14,(y1-y0+1)*TS+2);ctx.globalAlpha=1}
    if(d.lock==='crack'&&dd<150){const a=.12+.1*Math.sin(t*3+cx)+Math.max(0,(150-dd)/150)*.25;ctx.globalAlpha=a;ctx.fillStyle='#ffddaa';for(const [x,y] of d.cells)ctx.fillRect(x*TS-cam.x-1|0,y*TS-cam.y-1|0,10,10);ctx.globalAlpha=1}
    if(d.lock==='crack')for(const [x,y] of d.cells){const h=d.hp[y*L.LW+x]||0;if(h){ctx.globalAlpha=.3*h;ctx.fillStyle=K;ctx.fillRect(x*TS-cam.x|0,y*TS-cam.y|0,8,8);ctx.globalAlpha=1}}}
  /* the rooms behind special doors glow faintly */
  for(const d of L.doors){const v=d.vault;if(!v||!vis(v.xl*TS,v.yt*TS,60))continue;const pu=.5+.5*Math.sin(t*2+v.xl);ctx.globalAlpha=.07+.05*pu;ctx.fillStyle=['#ffee88','#44ffdd','#ffee88','#88ccff','#ffee88'][idx];ctx.fillRect(Math.round(v.xl*TS-cam.x),Math.round(v.yt*TS-cam.y),(v.xr-v.xl+1)*TS,(v.yb-v.yt)*TS);ctx.globalAlpha=1}
  /* beams between lit pods (light puzzle) */
  for(const d of L.doors){if(!d.seq||d.seq.mode!=='log')continue;const sq=d.seq;const pods=sq.pods.map(id=>L.ia.find(q=>q.id===id));if(!vis(pods[0].x,pods[0].y,60))continue;
    for(let i=0;i<sq.step-1;i++){const a=pods.find(q=>q.col===sq.order[i]),b=pods.find(q=>q.col===sq.order[i+1]);if(!a||!b)continue;ctx.globalAlpha=.7+.3*Math.sin(t*12);ctx.strokeStyle=COLH[sq.order[i]];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x-cam.x,a.y-12-cam.y);ctx.lineTo(b.x-cam.x,b.y-12-cam.y);ctx.stroke();ctx.globalAlpha=1}
    if(sq.done){ctx.globalAlpha=.8;ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pods[0].x-cam.x,pods[0].y-12-cam.y);for(let i=1;i<pods.length;i++)ctx.lineTo(pods[i].x-cam.x,pods[i].y-12-cam.y);ctx.stroke();ctx.globalAlpha=1}}
  /* the look of each signature room */
  for(const st of L.sets){if(st.x1*TS<cam.x-20||st.x0*TS>cam.x+VW+20)continue;const sx0=Math.round(st.x0*TS-cam.x),sx1=Math.round((st.x1+1)*TS-cam.x),sy0=Math.round(st.y0*TS-cam.y),sy1=Math.round(st.y1*TS-cam.y);
    if(st.k==='cathedral'){for(let i=0;i<22;i++){const x=sx0+mod(i*41+Math.sin(t*.4+i)*14,sx1-sx0),y=sy1-mod(i*37+t*(6+i%4*3),Math.max(20,sy1-sy0));ctx.globalAlpha=.3+.4*Math.sin(t*2+i);ctx.fillStyle=['#ff77ff','#9affc8','#ffffaa'][i%3];ctx.fillRect(x|0,y|0,2,2)}ctx.globalAlpha=.05;ctx.fillStyle='#ff77ff';ctx.fillRect(sx0,sy0,sx1-sx0,sy1-sy0);ctx.globalAlpha=1}
    else if(st.k==='geode'){for(let i=0;i<4;i++){const ang=Math.sin(t*.25+i*1.7)*.35,bx=sx0+(sx1-sx0)*(.15+.23*i);ctx.globalAlpha=.09+.04*Math.sin(t*.6+i);ctx.fillStyle=['#aaffff','#ffffff','#ffccff','#aaffff'][i];ctx.beginPath();ctx.moveTo(bx,sy0);ctx.lineTo(bx+10,sy0);ctx.lineTo(bx+10+Math.tan(ang)*(sy1-sy0)+22,sy1);ctx.lineTo(bx+Math.tan(ang)*(sy1-sy0)-10,sy1);ctx.closePath();ctx.fill()}ctx.globalAlpha=1;
      if(st.pit){const px0=Math.round(st.pit[0]*TS-cam.x),px1=Math.round((st.pit[1]+1)*TS-cam.x);ctx.globalAlpha=.25;ctx.fillStyle='#ffd070';for(let i=0;i<8;i++){const x=px0+mod(i*23+t*8,px1-px0);ctx.fillRect(x|0,Math.round((st.y1)*TS-cam.y)-1,2,1)}ctx.globalAlpha=1}}
    else if(st.k==='hall'){const cx=Math.round(st.core*TS+4-cam.x),cy=Math.round(st.y1*TS-cam.y)-16,pu=.5+.5*Math.sin(t*1.4);ctx.globalAlpha=.12+.1*pu;ctx.fillStyle='#44ddff';ctx.beginPath();ctx.arc(cx,cy,34+pu*6,0,TAU);ctx.fill();ctx.globalAlpha=.2;ctx.beginPath();ctx.arc(cx,cy,16,0,TAU);ctx.fill();ctx.globalAlpha=1;
      const fx=Math.round(st.fall*TS-cam.x);ctx.fillStyle='#9ae8ff';for(let i=0;i<14;i++){ctx.globalAlpha=.5;ctx.fillRect(fx+(i%3)*2,((i*17+t*70)%(sy1-sy0))+sy0,1,5)}ctx.globalAlpha=.18;ctx.fillRect(fx-1,sy0,8,sy1-sy0);ctx.globalAlpha=1}
    else if(st.k==='engine'){const cx=Math.round(st.core*TS+4-cam.x),cy=Math.round(st.y1*TS-cam.y)-6,pu=.5+.5*Math.sin(t*1.1);ctx.globalAlpha=.1+.08*pu;ctx.fillStyle='#ff9a44';ctx.beginPath();ctx.arc(cx,cy,40,0,TAU);ctx.fill();ctx.globalAlpha=1}
    else if(st.k==='forge'){const px0=Math.round(st.river[0]*TS-cam.x),px1=Math.round((st.river[1]+1)*TS-cam.x),fy=Math.round(st.y1*TS-cam.y);ctx.globalAlpha=.2+.06*Math.sin(t*2);ctx.fillStyle='#ff7a22';ctx.fillRect(px0-6,fy-26,px1-px0+12,26);ctx.globalAlpha=.12;ctx.fillRect(px0-10,fy-60,px1-px0+20,34);ctx.globalAlpha=.7;ctx.fillStyle='#ffcc44';for(let i=0;i<8;i++){const x=px0+mod(i*29+t*12,px1-px0);ctx.fillRect(x|0,fy-4-((t*14+i*9)%30)|0,1,2)}ctx.globalAlpha=1}
    else if(st.k==='brood'){const beat=Math.pow(.5+.5*Math.sin(t*2.2),3);ctx.globalAlpha=.07+.1*beat;ctx.fillStyle='#ff44cc';ctx.fillRect(sx0,sy0,sx1-sx0,sy1-sy0);ctx.globalAlpha=.25+.3*beat;ctx.fillStyle='#ff88dd';ctx.fillRect(sx0-2,sy0,3,sy1-sy0);ctx.fillRect(sx1-1,sy0,3,sy1-sy0);ctx.fillRect(sx0,sy0-2,sx1-sx0,3);ctx.globalAlpha=1}}
  /* a small bobbing marker over things you can use */
  for(const o of L.ia){if(o.hide||!vis(o.x,o.y,40))continue;if(['lever','panel','console','pod','echo','shrine','portal','plate','mirror','nest'].includes(o.k)&&Math.abs(o.x-p.x)<110){const X=Math.round(o.x-cam.x),Y=Math.round(o.y-cam.y)-26+Math.round(Math.sin(t*4+o.x)*1.5);ctx.fillStyle=YL;ctx.fillRect(X-1,Y,3,1);ctx.fillRect(X,Y+1,1,2);ctx.fillRect(X-2,Y-1,5,1)}}
  /* the lights in dark rooms are real things on the wall: crystals, bulbs, lamps, embers */
  for(const l of L.lights){if(!vis(l.x,l.y,30))continue;const X=Math.round(l.x-cam.x),Y=Math.round(l.y-cam.y),pu=.5+.5*Math.sin(t*2+l.ph),cc=['#ccff77','#66ffee','#ffffaa','#ffaa44','#aaffcc'][idx];
    ctx.globalAlpha=.18+.12*pu;ctx.fillStyle=cc;ctx.beginPath();ctx.arc(X,Y,9,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle=K;
    if(idx===1){ctx.beginPath();ctx.moveTo(X,Y-6);ctx.lineTo(X+4,Y);ctx.lineTo(X,Y+6);ctx.lineTo(X-4,Y);ctx.closePath();ctx.fill();ctx.fillStyle=cc;ctx.beginPath();ctx.moveTo(X,Y-5);ctx.lineTo(X+3,Y);ctx.lineTo(X,Y+5);ctx.lineTo(X-3,Y);ctx.closePath();ctx.fill();ctx.fillStyle=WH;ctx.fillRect(X-1,Y-3,1,3)}
    else if(idx===2){ctx.fillRect(X-1,Y-8,3,5);ctx.fillRect(X-4,Y-4,9,6);ctx.fillStyle=cc;ctx.fillRect(X-3,Y-3,7,4);ctx.fillStyle=WH;ctx.fillRect(X-1,Y-2,3,2)}
    else{ctx.beginPath();ctx.arc(X,Y,4,0,TAU);ctx.fill();ctx.fillStyle=cc;ctx.beginPath();ctx.arc(X,Y,3,0,TAU);ctx.fill();ctx.fillStyle=WH;ctx.fillRect(X-1,Y-1,1,1)}}
  /* the arena of a mini boss lair and of the nest is walled by two columns of light */
  for(const ar of [L.lair&&{x:L.lair.x,y:L.lair.y,w:60,c:BOSSCOL[idx]},L.hatch&&{x:L.hatch.x,y:L.hatch.y,w:70,c:'#ff77ff'}]){if(!ar||!vis(ar.x,ar.y,120))continue;const live=ar.c===BOSSCOL[idx]?SURF.en.some(e=>e.lair&&e.hp>0):L.hatch.state!==2;if(!live)continue;for(const sd of [-1,1]){const X=Math.round(ar.x+sd*ar.w-cam.x),Y=Math.round(ar.y-cam.y);const gr=ctx.createLinearGradient(0,Y-70,0,Y);gr.addColorStop(0,'rgba(0,0,0,0)');ctx.globalAlpha=.3;gr.addColorStop(1,ar.c);ctx.fillStyle=gr;ctx.fillRect(X-2,Y-70,4,70);ctx.globalAlpha=1}}
  /* the floor of a mini boss lair is marked with a ring */
  if(L.lair&&vis(L.lair.x,L.lair.y,60)){const X=Math.round(L.lair.x-cam.x),Y=Math.round(L.lair.y-cam.y),lv=SURF.en.some(e=>e.lair&&e.hp>0);ctx.globalAlpha=lv?.28+.1*Math.sin(t*2):.12;ctx.strokeStyle=BOSSCOL[idx];ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(X,Y-1,34,5,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(X,Y-1,20,3,0,0,TAU);ctx.stroke();ctx.globalAlpha=1}
  /* every unopened chest glows softly in the world's key colour */
  for(const c of L.chests){if(c.open||c.gone||!vis(c.x,c.y,20))continue;const X=Math.round(c.x-cam.x+7),Y=Math.round(c.y-cam.y+5),pu=.5+.5*Math.sin(t*2.4+c.x);ctx.globalAlpha=.16+.1*pu;ctx.fillStyle=['#ffe08a','#aaf4ff','#ffe08a','#ffc060','#ffe08a'][idx];ctx.beginPath();ctx.arc(X,Y,13,0,TAU);ctx.fill();ctx.globalAlpha=1}
  /* a soft coloured halo behind the things you use */
  for(const o of L.ia){if(o.hide||!vis(o.x,o.y,40))continue;const hc={lever:'#ffcc44',plate:'#55eeee',panel:'#ffee55',console:'#ff9966',rod:'#ffee55',mirror:'#bfe8ff',pod:'#ffffff',key:o.col==='red'?'#ff5544':'#55aaff',shrine:'#ffffaa',portal:'#ff77ff',echo:'#ff77ff'}[o.k];if(!hc||(o.k==='key'&&o.got))continue;const X=Math.round(o.x-cam.x),Y=Math.round(o.y-cam.y)-6;ctx.globalAlpha=.2+.12*Math.sin(t*3+o.x);ctx.fillStyle=hc;ctx.beginPath();ctx.arc(X,Y,15,0,TAU);ctx.fill();ctx.globalAlpha=1}
  /* interactable objects */
  for(const o of L.ia){if(o.hide)continue;if(!vis(o.x,o.y,40))continue;const X=Math.round(o.x-cam.x),Y=Math.round(o.y-cam.y),bob=Math.round(Math.sin(t*2+o.x)*1);
    if(o.k==='lore'){const rd=s.lore[idx*10+o.slot];const im=F.lore;ctx.drawImage(im,X-im.width/2|0,Y-im.height+1);if(!rd){const pu=.5+.5*Math.sin(t*3+o.x);ctx.globalAlpha=.07+.05*pu;ctx.fillStyle=F.glow;ctx.fillRect(X-1,Y-im.height-30,3,30);ctx.globalAlpha=.16+.14*pu;ctx.fillStyle=F.glow;ctx.beginPath();ctx.arc(X,Y-im.height/2,11+pu*2,0,TAU);ctx.fill();ctx.globalAlpha=.8;ctx.fillRect(X-1,Y-im.height-4,3,2);ctx.globalAlpha=1}}
    else if(o.k==='npc'){const im=F.npc[o.npc];const fl=px_=>0;const face=(p.x+5)<o.x?-1:1;ctx.save();if(o.npc==='ghost'){ctx.globalAlpha=.55+.2*Math.sin(t*2)}if(face<0){ctx.translate(X+im.width/2,0);ctx.scale(-1,1);ctx.drawImage(im,0,Y-im.height+(o.npc==='ghost'?bob*3-6:0))}else ctx.drawImage(im,X-im.width/2|0,Y-im.height+(o.npc==='ghost'?bob*3-6:0));ctx.restore()}
    else if(o.k==='lever'){ctx.drawImage(F.lever[o.on?1:0],X-8,Y-14)}
    else if(o.k==='plate'){ctx.drawImage(F.plate[o.down?1:0],X-11,Y-(o.down?3:5))}
    else if(o.k==='key'&&!o.got){ctx.drawImage(F.key[o.col==='red'?0:1],X-7,Y-12+bob);ctx.globalAlpha=.3+.2*Math.sin(t*4);ctx.fillStyle=o.col==='red'?'#ff8888':'#88ccff';ctx.beginPath();ctx.arc(X,Y-6+bob,8,0,TAU);ctx.fill();ctx.globalAlpha=1}
    else if(o.k==='frag'&&!o.got&&!s.map3[idx+'_'+o.n]){ctx.drawImage(F.frag,X-6,Y-12+bob);ctx.globalAlpha=.25+.2*Math.sin(t*4);ctx.fillStyle=YL;ctx.beginPath();ctx.arc(X,Y-5+bob,7,0,TAU);ctx.fill();ctx.globalAlpha=1}
    else if(o.k==='portal'){const r=9+Math.sin(t*3)*1.5;ctx.globalAlpha=.35;ctx.fillStyle=MG;ctx.beginPath();ctx.ellipse(X,Y-12,r+3,r+8,0,0,TAU);ctx.fill();ctx.globalAlpha=.9;ctx.strokeStyle=CY;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(X,Y-12,r,r+6,0,0,TAU);ctx.stroke();ctx.strokeStyle=WH;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(X,Y-12,r-3,r+3,t*2,0,TAU*.7);ctx.stroke();ctx.globalAlpha=1}
    else if(o.k==='shrine'){ctx.drawImage(F.shrine,X-10,Y-21);const pu=.5+.5*Math.sin(t*3);ctx.globalAlpha=.25+.2*pu;ctx.fillStyle=YL;ctx.beginPath();ctx.arc(X,Y-14,9+pu*3,0,TAU);ctx.fill();ctx.globalAlpha=1}
    else if(o.k==='panel'){ctx.drawImage(F.panel,X-8,Y-19)}
    else if(o.k==='pod'){const lit=o.lit>0||o.on;const col=COLH[o.col];ctx.fillStyle=K;ctx.fillRect(X-8,Y-4,16,4);ctx.fillStyle=D;ctx.fillRect(X-7,Y-4,14,2);ctx.fillStyle=lit?col:'#2a2a3a';ctx.beginPath();ctx.arc(X,Y-10,8,Math.PI,0);ctx.fill();ctx.fillRect(X-8,Y-10,16,6);ctx.strokeStyle=col;ctx.lineWidth=1;ctx.strokeRect(X-8.5,Y-9.5,17,5);ctx.fillStyle=lit?WH:col;ctx.fillRect(X-2,Y-12,4,3);if(lit){ctx.globalAlpha=.4;ctx.fillStyle=col;ctx.beginPath();ctx.arc(X,Y-10,17,0,TAU);ctx.fill();ctx.globalAlpha=1}
      const d=L.doors.find(q=>q.id===o.door);if(d&&d.seq.mode==='log'){ctx.fillStyle=col;ctx.fillRect(X-1,Y-18,3,3)}}
    else if(o.k==='echo'){ctx.fillStyle=K;ctx.fillRect(X-6,Y-4,12,4);ctx.fillStyle=MG;ctx.beginPath();ctx.arc(X,Y-9,6,0,TAU);ctx.fill();ctx.fillStyle=WH;ctx.fillRect(X-1,Y-10,3,3);ctx.globalAlpha=.3+.2*Math.sin(t*5);ctx.fillStyle=MG;ctx.beginPath();ctx.arc(X,Y-9,11,0,TAU);ctx.fill();ctx.globalAlpha=1}
    else if(o.k==='console'){ctx.drawImage(F.panel,X-8,Y-19);if(o.state===1){textC2(Math.ceil(o.t)+'',X,Y-30,o.t<6?RD:YL)}}
    else if(o.k==='nest'){const h=L.hatch;ctx.globalAlpha=.25+.12*Math.sin(t*2);ctx.fillStyle='#ff77ff';ctx.beginPath();ctx.ellipse(X,Y-4,46,9,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
      for(const eg of h.eggs){const ex=Math.round(eg.x-cam.x),ey=Math.round(eg.y-cam.y),im=A.deco.egg;if(im)ctx.drawImage(im,ex-im.width/2|0,ey-im.height)}
      ctx.fillStyle=K;ctx.fillRect(X-9,Y-8,19,8);ctx.fillStyle=h.state===1?'#ff6688':h.state===2?'#556655':'#cc66aa';ctx.beginPath();ctx.ellipse(X,Y-8,9,5,0,0,TAU);ctx.fill();ctx.fillStyle=WH;ctx.fillRect(X-2,Y-10,2,2)}
    else if(o.k==='rod'){ctx.globalAlpha=.25+.12*Math.sin(t*3+o.x);ctx.fillStyle=o.on?CY:'#ffee55';ctx.beginPath();ctx.arc(X,Y-14,14,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle=K;ctx.fillRect(X-5,Y-2,11,3);ctx.fillRect(X-1,Y-26,3,25);ctx.fillStyle=o.on?CY:'#ffdd55';ctx.fillRect(X,Y-26,1,24);ctx.fillStyle=K;ctx.beginPath();ctx.arc(X,Y-28,4,0,TAU);ctx.fill();ctx.fillStyle=o.on?WH:'#ffee88';ctx.beginPath();ctx.arc(X,Y-28,3,0,TAU);ctx.fill();if(o.on){ctx.globalAlpha=.3+.15*Math.sin(t*3);ctx.fillStyle=CY;ctx.beginPath();ctx.arc(X,Y-28,9,0,TAU);ctx.fill();ctx.globalAlpha=1}}
    else if(o.k==='src'){ctx.fillStyle=K;ctx.fillRect(X-5,Y-4,11,4);ctx.fillStyle=GM;ctx.fillRect(X-4,Y-4,9,2);ctx.fillStyle=K;ctx.beginPath();ctx.arc(X,Y-12,6,0,TAU);ctx.fill();ctx.fillStyle=YL;ctx.beginPath();ctx.arc(X,Y-12,5,0,TAU);ctx.fill();ctx.fillStyle=WH;ctx.fillRect(X-1,Y-13,2,2)}
    else if(o.k==='gem'){const d=L.doors.find(q=>q.lock==='mirror'),on=d&&d.open;ctx.fillStyle=K;ctx.fillRect(X-5,Y-4,11,4);ctx.fillStyle=GM;ctx.fillRect(X-4,Y-4,9,2);ctx.fillStyle=on?'#ccffcc':'#33aa55';ctx.beginPath();ctx.moveTo(X,Y-20);ctx.lineTo(X+6,Y-12);ctx.lineTo(X,Y-4);ctx.lineTo(X-6,Y-12);ctx.closePath();ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=WH;ctx.fillRect(X-2,Y-15,2,2);if(on){ctx.globalAlpha=.3;ctx.fillStyle='#88ff88';ctx.beginPath();ctx.arc(X,Y-12,13,0,TAU);ctx.fill();ctx.globalAlpha=1}}
    else if(o.k==='mirror'){ctx.fillStyle=K;ctx.fillRect(X-1,Y-8,3,8);ctx.fillRect(X-4,Y-2,9,2);ctx.fillStyle=GM;ctx.fillRect(X,Y-8,1,6);ctx.fillStyle=K;ctx.fillRect(X-7,Y-19,15,15);ctx.fillStyle='#bfe8ff';ctx.fillRect(X-6,Y-18,13,13);ctx.strokeStyle=K;ctx.lineWidth=2;ctx.beginPath();if(o.st){ctx.moveTo(X-5,Y-6);ctx.lineTo(X+5,Y-17)}else{ctx.moveTo(X-5,Y-17);ctx.lineTo(X+5,Y-6)}ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(X-6,Y-18,2,2)}}
  /* fire vents: a grate that smokes, glows, then bursts */
  for(const v of (L.vents||[])){if(!vis(v.x,v.y,40))continue;const X=Math.round(v.x-cam.x),Y=Math.round(v.y-cam.y);ctx.fillStyle=K;ctx.fillRect(X-6,Y-2,13,3);ctx.fillStyle='#4a2a24';ctx.fillRect(X-5,Y-2,11,1);
    ctx.globalAlpha=.35;ctx.fillStyle='#ff9944';for(let q=-3;q<=3;q++)ctx.fillRect(X+q*3-1,Y,2,1);ctx.globalAlpha=1;
    if(v.st===0){ctx.globalAlpha=.25;ctx.fillStyle='#bbbbbb';const u=(t*.7+v.ph)%1;ctx.fillRect(X-1+Math.round(Math.sin(u*6)*2),Y-4-Math.round(u*10),2,2);ctx.globalAlpha=1}
    else if(v.st===1){const k=((L.tick+v.ph)%4.2-2.6)/.8;ctx.globalAlpha=.25+.3*k;ctx.fillStyle='#ff7733';ctx.beginPath();ctx.ellipse(X,Y-1,12,3,0,0,TAU);ctx.fill();ctx.globalAlpha=.3+.5*k;ctx.fillRect(X-4,Y-3,9,2);ctx.fillRect(X-2,Y-5-Math.round(k*6),5,4+Math.round(k*6));ctx.globalAlpha=1}
    else{const k=((L.tick+v.ph)%4.2-3.4)/.8,hgt=Math.round(46*Math.min(1,k*5+.2)*(1-.25*k));ctx.globalAlpha=.25;ctx.fillStyle='#ff6622';ctx.beginPath();ctx.arc(X,Y-hgt/2,16,0,TAU);ctx.fill();ctx.globalAlpha=.9;ctx.fillStyle='#ff6622';ctx.fillRect(X-8,Y-hgt,17,hgt);ctx.fillStyle='#ffcc44';ctx.fillRect(X-6,Y-hgt+4,13,hgt-4);ctx.fillStyle='#ffffcc';ctx.fillRect(X-3,Y-hgt+8,7,Math.max(0,hgt-8));ctx.globalAlpha=1}}
  /* beams of sunlight between the crystals */
  for(const d of L.doors){if(d.lock!=='mirror'||!d.beam||!vis(d.cells[0][0]*TS,d.cells[0][1]*TS,400))continue;const pts=d.beam.pts;ctx.lineCap='round';
    for(const [w,al,col] of [[5,.16,'#ffee88'],[2,.8,'#ffffcc']]){ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();pts.forEach((q,i)=>{const X=q[0]-cam.x,Y=q[1]-cam.y;if(i)ctx.lineTo(X,Y);else ctx.moveTo(X,Y)});ctx.stroke()}ctx.globalAlpha=1;ctx.lineCap='butt'}
  if(L.questItem&&!L.questItem.got&&(s.q['q'+idx]||0)===1){const q=L.questItem,X=Math.round(q.x-cam.x),Y=Math.round(q.y-cam.y);if(vis(q.x,q.y,30)){ctx.globalAlpha=.4+.25*Math.sin(t*4);ctx.fillStyle=CY;ctx.beginPath();ctx.arc(X,Y-6,9,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.drawImage(F.crystal,X-5,Y-14)}}
  if(L.buried&&!L.buried.got&&s.map3[idx+'_all']){const b=L.buried,X=Math.round(b.x-cam.x),Y=Math.round(b.y-cam.y);if(vis(b.x,b.y,30)){ctx.fillStyle=Math.floor(t*3)%2?'#ffff55':'#ff5555';ctx.fillRect(X-4,Y-1,3,1);ctx.fillRect(X+1,Y-1,3,1);ctx.fillRect(X-3,Y-2,1,1);ctx.fillRect(X+3,Y-2,1,1);ctx.fillRect(X-1,Y-3,3,1);ctx.fillRect(X-3,Y,1,1);ctx.fillRect(X+3,Y,1,1);ctx.globalAlpha=.3;ctx.fillStyle=YL;ctx.beginPath();ctx.arc(X,Y-3,10,0,TAU);ctx.fill();ctx.globalAlpha=1}}
  for(const tg of L.targets){if(!vis(tg.x,tg.y,20))continue;const con=L.ia.find(q=>q.k==='console'),act=con&&con.state===1,X=Math.round(tg.x-cam.x),Y=Math.round(tg.y-cam.y);ctx.fillStyle=K;ctx.beginPath();ctx.arc(X,Y,6,0,TAU);ctx.fill();ctx.fillStyle=tg.hit?'#445544':act?(Math.floor(t*6)%2?RD:WH):'#666677';ctx.beginPath();ctx.arc(X,Y,5,0,TAU);ctx.fill();ctx.fillStyle=tg.hit?'#223322':act?RD:'#444455';ctx.beginPath();ctx.arc(X,Y,2.5,0,TAU);ctx.fill()}
  for(const e of L.eggs){if(e.st===2||!vis(e.x,e.y,20))continue;const im=A.deco.egg;if(!im)continue;if(!e.real&&e.st===0&&((t*3+e.x)%4)<.35){ctx.fillStyle=YL;const ex=Math.round(e.x-cam.x),ey=Math.round(e.y-cam.y)-8;ctx.fillRect(ex,ey-4,1,3);ctx.fillRect(ex-1,ey-3,3,1)}
    const wob=e.st===1?Math.round(Math.sin(t*50)*2):0;ctx.drawImage(im,Math.round(e.x-cam.x-im.width/2)+wob,Math.round(e.y-cam.y-im.height))}
  /* the forge chamber glows */
  if(L.chase&&vis(L.chase.xl*TS,L.chase.yb*TS,300)&&L.chase.state===1){ctx.globalAlpha=.08+.04*Math.sin(t*1.6);ctx.fillStyle='#ff6622';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
  /* runs of collapsing planks look a little cracked */
  for(const r of L.runs){if(!vis(r.x0*TS,r.y*TS,60))continue;for(let x=r.x0;x<r.x1;x++){if(L.g[r.y*L.LW+x]===6&&((x*7)%3===0)){ctx.fillStyle='#00000066';ctx.fillRect(x*TS-cam.x+2|0,r.y*TS-cam.y+1|0,3,2)}}}
  /* guide lights and fireflies */
  const strong=idx===0||SURF.guideT>0;for(const g of SURF.gl){const X=g.x-cam.x,Y=g.y-cam.y,pu=.5+.5*Math.sin(t*3+g.ph);ctx.globalAlpha=(strong?.25:.12)+.18*pu;ctx.fillStyle=idx===4?'#ff77ff':idx===3?'#ffaa44':idx===2?'#88ffff':idx===1?'#ffe08a':'#ccff77';ctx.beginPath();ctx.arc(X,Y,strong?6:4,0,TAU);ctx.fill();ctx.globalAlpha=.9;ctx.fillStyle=WH;ctx.fillRect(X|0,Y|0,1,1);ctx.globalAlpha=1}
  /* mimic tell and shield */
  for(const c of L.chests){if(!c.mimic||c.open)continue;const dd=Math.hypot(p.x-c.x,p.y-c.y);if(dd<64){const X=Math.round(c.x-cam.x),Y=Math.round(c.y-cam.y);ctx.fillStyle=WH;for(let i=0;i<4;i++)ctx.fillRect(X+2+i*3,Y+3,1,2)}}
}
function featStrikes(){const L=SURF.L,cam=SURF.cam,t=L.tick;
  /* shooters glow softly just before they fire; bosses show a growing ring while they wind up */
  for(const e of SURF.en){if(e.hp<=0||e.x<cam.x-60||e.x>cam.x+VW+60)continue;const ai=e.sp.ai,X=Math.round(e.x+e.w/2-cam.x),Y=Math.round(e.y+e.h*.4-cam.y);
    if((ai==='turret'||ai==='lobber'||(ai==='flyer'&&e.sp.shoot))&&e.cd<.5&&e.cd>0&&Math.abs(e.x-SURF.p.x)<(e.sp.range||150)){ctx.globalAlpha=.5*(1-e.cd/.5);ctx.fillStyle='#ffddaa';ctx.beginPath();ctx.arc(X,Y,3+(1-e.cd/.5)*3,0,TAU);ctx.fill();ctx.globalAlpha=1}
    if(e.tele){const u=1-e.tele.t/e.tele.m;ctx.globalAlpha=.16*u;ctx.fillStyle=BOSSCOL[SURF.idx];ctx.fillRect(0,14,VW,4);ctx.fillRect(0,VH-4,VW,4);ctx.fillRect(0,14,4,VH-14);ctx.fillRect(VW-4,14,4,VH-14);ctx.globalAlpha=1;ctx.globalAlpha=.25+.45*u;ctx.strokeStyle=BOSSCOL[SURF.idx];ctx.lineWidth=3;ctx.beginPath();ctx.arc(X,Y,e.w*.7+(1-u)*16,0,TAU);ctx.stroke();ctx.strokeStyle=WH;ctx.lineWidth=1;ctx.globalAlpha=.4*u;ctx.beginPath();ctx.arc(X,Y,e.w*.7+(1-u)*16,0,TAU);ctx.stroke();ctx.globalAlpha=1}
    if(e.vent>0){ctx.globalAlpha=.3;ctx.fillStyle='#ff9966';ctx.beginPath();ctx.arc(X,Y,e.w*.8,0,TAU);ctx.fill();ctx.globalAlpha=1}}
  for(const st of SURF.strikes){const X=Math.round(st.x-cam.x),Y=Math.round(st.y-cam.y),u=Math.min(1,st.t/st.dur),col=st.col||(st.id==='surge'?CY:OR);
    if(st.t<st.dur){ctx.globalAlpha=.16+.34*u;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(X,Y-1,6+u*5,2+u*1.5,0,0,TAU);ctx.fill();
      if(st.id==='surge'||st.rod){ctx.globalAlpha=.12+.25*u;ctx.fillStyle=CY;ctx.fillRect(X-1,Y-120,3,120*u)}
      else if(st.id==='erupt'){ctx.globalAlpha=.5*u;ctx.fillStyle=col;ctx.fillRect(X-1,Y-2-14*u,3,14*u)}
      else{const fy=Y-140*(1-u);ctx.globalAlpha=.95;ctx.fillStyle=K;ctx.fillRect(X-5,fy-6,10,9);ctx.fillStyle=st.id==='meteor'?OR:'#8a6a4a';ctx.fillRect(X-4,fy-5,8,7);ctx.fillStyle=st.id==='meteor'?YL:'#c8a878';ctx.fillRect(X-3,fy-4,3,2)}ctx.globalAlpha=1}
    else if(st.t<st.dur+.45){const k=(st.t-st.dur)/.45;if(st.id==='erupt'){ctx.globalAlpha=.75*(1-k);ctx.fillStyle=col;ctx.fillRect(X-6,Y-38*(1-k*.3),12,38*(1-k*.3));ctx.fillStyle=WH;ctx.fillRect(X-2,Y-38*(1-k*.3),4,38*(1-k*.3))}else{ctx.globalAlpha=.6*(1-k);ctx.fillStyle=(st.id==='surge'||st.rod)?WH:OR;ctx.beginPath();ctx.arc(X,Y-4,12-k*8,0,TAU);ctx.fill()}ctx.globalAlpha=1}}}
/* ---- screen overlays: weather, darkness, the pulse */
function featOverlay(){const L=SURF.L,p=SURF.p,cam=SURF.cam,s=sv(),idx=SURF.idx,ev=SURF.ev,t=L.tick;
  if(SURF.hurtT>0){SURF.hurtT-=1/50;if(!SURF.vgCv){const c=SURF.vgCv=document.createElement('canvas');c.width=VW;c.height=VH;const g=c.getContext('2d'),gr=g.createRadialGradient(VW/2,VH/2,50,VW/2,VH/2,200);gr.addColorStop(0,'rgba(160,20,20,0)');gr.addColorStop(1,'rgba(160,20,20,.85)');g.fillStyle=gr;g.fillRect(0,0,VW,VH)}ctx.globalAlpha=.3*Math.min(1,SURF.hurtT);ctx.drawImage(SURF.vgCv,0,0);ctx.globalAlpha=1}
  if(idx===4){ctx.globalAlpha=.035+.03*Math.sin(t*.9);ctx.fillStyle='#ff44cc';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
  if(ev&&ev.phase===1&&ev.cur){const tc={spore:'#2c7a4a',sand:'#7a4a22',surge:'#000820',meteor:'#552200',quake:'#442200',pulse:'#ff44cc'}[ev.cur.id];ctx.globalAlpha=(1-ev.t/5)*.14;ctx.fillStyle=tc;ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
  if(ev&&ev.phase===2&&ev.cur){const id=ev.cur.id,al=Math.min(1,ev.t*.5,(20-(ev.t>20?20:ev.t))*.4+.3);
    if(id==='sand'||id==='spore'){const dir=ev.dir||1,sd=id==='sand',k=Math.min(1,ev.t*.5,(ev.t0||20)>0?1:1);ctx.globalAlpha=(sd?.3:.16)*Math.min(1,ev.t*.4);ctx.fillStyle=sd?'#7a4a22':'#2c7a4a';ctx.fillRect(0,0,VW,VH);
      for(let i=0;i<(sd?110:70);i++){const x=mod(i*53.7+dir*t*(sd?230:44)*(1+i%3*.4),VW+40)-20,y=mod(i*31.1+Math.sin(t+i)*(sd?3:8)+(sd?0:t*-10),VH);
        if(sd){ctx.globalAlpha=.55;ctx.fillStyle=i%3?'#e8c080':'#a87038';ctx.fillRect(x|0,y|0,6+i%4*3,1)}else{ctx.globalAlpha=.45+.4*Math.sin(t*3+i);ctx.fillStyle=i%2?'#ccff88':'#ffffaa';ctx.fillRect(x|0,y|0,2,1+(i%2))}}
      if(!sd){for(let i=0;i<9;i++){const x=mod(i*97+dir*t*20,VW+60)-30,y=mod(i*41+t*-6+Math.sin(t*.5+i)*20,VH);ctx.globalAlpha=.09;ctx.fillStyle='#ccff88';ctx.beginPath();ctx.arc(x,y,8+(i%3)*5,0,TAU);ctx.fill()}}
      ctx.globalAlpha=1}
    else if(id==='surge'){ctx.globalAlpha=.1+.1*(.5+.5*Math.sin(t*1.1));ctx.fillStyle='#000830';ctx.fillRect(0,0,VW,VH);for(let i=0;i<4;i++){const x=mod(i*83+t*10,VW+40)-20,w=12+i*3;ctx.globalAlpha=.06+.04*Math.sin(t*.8+i);ctx.fillStyle='#88ddff';ctx.fillRect(x,0,w,VH)}ctx.globalAlpha=1}
    else if(id==='pulse'){const pu=.5+.5*Math.sin(t*2.4);ctx.globalAlpha=.08+.12*pu;ctx.fillStyle='#ff44cc';ctx.fillRect(0,0,VW,VH);ctx.strokeStyle='#ffccff';ctx.lineWidth=2;for(let r=0;r<3;r++){const u=mod(t*.5+r/3,1);ctx.globalAlpha=.35*(1-u);ctx.beginPath();ctx.arc(VW/2,VH/2,20+u*230,0,TAU);ctx.stroke()}ctx.globalAlpha=1}
    else if(id==='quake'){ctx.globalAlpha=.14;ctx.fillStyle='#442200';ctx.fillRect(0,0,VW,VH);ctx.fillStyle='#8a6a4a';for(let i=0;i<46;i++){const x=(i*37.7)%VW,y=mod(i*23.1+t*(50+i%5*14),VH);ctx.globalAlpha=.5;ctx.fillRect(x|0,y|0,1+(i%3===0),2)}ctx.globalAlpha=1}
    else if(id==='meteor'){ctx.globalAlpha=.08;ctx.fillStyle='#552200';ctx.fillRect(0,0,VW,VH);ctx.strokeStyle='#ff9966';ctx.lineWidth=1;for(let i=0;i<14;i++){const x=mod(i*61+t*(30+i%4*10),VW+60)-30,y=mod(i*37+t*(70+i%3*20),VH);ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y-14);ctx.stroke()}ctx.globalAlpha=1}}
  /* dark rooms */
  let inDark=false;const px=(p.x+5)/TS,py=(p.y+8)/TS;for(const d of L.dark)if(px>=d.x0&&px<=d.x1&&py>=d.y0&&py<=d.y1){inDark=true;break}
  SURF.darkA=(SURF.darkA||0)+((inDark?1:0)-(SURF.darkA||0))*.12;
  if(SURF.darkA>.02){if(!SURF.dkCv){SURF.dkCv=document.createElement('canvas');SURF.dkCv.width=VW;SURF.dkCv.height=VH}const g=SURF.dkCv.getContext('2d');g.globalCompositeOperation='source-over';g.clearRect(0,0,VW,VH);g.fillStyle='rgba(0,0,6,.68)';g.fillRect(0,0,VW,VH);g.globalCompositeOperation='destination-out';
    const hole=(x,y,r,a)=>{const gr=g.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,'rgba(0,0,0,'+a+')');gr.addColorStop(.6,'rgba(0,0,0,'+a*.6+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill()};
    hole(p.x+5-cam.x,p.y+8-cam.y,(s.shop.lamp?118:84)+Math.sin(t*5)*1.5,1);for(const l of L.lights){const sx=l.x-cam.x,sy=l.y-cam.y;if(sx>-40&&sx<VW+40&&sy>-40&&sy<VH+40)hole(sx,sy,22+Math.sin(t*2+l.ph)*3,.85)}
    for(const o of L.ia){if(o.hide)continue;const sx=o.x-cam.x,sy=o.y-cam.y-6;if(sx>-30&&sx<VW+30&&sy>-30&&sy<VH+30)hole(sx,sy,16,.7)}
    for(const c of L.chests){const sx=c.x-cam.x+7,sy=c.y-cam.y+4;if(sx>-30&&sx<VW+30&&sy>-30&&sy<VH+30&&!c.open)hole(sx,sy,18,.8)}
    if(!L.beams)L.beams=genBeams(L,idx);g.fillStyle='#000';g.globalAlpha=.55;for(const b of L.beams){const q=beamPoly(b,cam);if(q[0][0]>VW+60||q[2][0]<-60&&q[0][0]<-60)continue;const ty0=Math.min(q[0][1],q[2][1]);if(ty0>VH||ty0+b.len<0)continue;g.beginPath();g.moveTo(q[0][0],q[0][1]);g.lineTo(q[1][0],q[1][1]);g.lineTo(q[2][0],q[2][1]);g.lineTo(q[3][0],q[3][1]);g.closePath();g.fill()}g.globalAlpha=1;
    g.globalCompositeOperation='source-over';ctx.globalAlpha=SURF.darkA;ctx.drawImage(SURF.dkCv,0,0);ctx.globalAlpha=1;
    for(const l of L.lights){const sx=l.x-cam.x,sy=l.y-cam.y;if(sx>-10&&sx<VW+10&&sy>-10&&sy<VH+10){ctx.globalAlpha=SURF.darkA*(.6+.4*Math.sin(t*3+l.ph));ctx.fillStyle='#ffffcc';ctx.fillRect(sx-1|0,sy|0,3,1);ctx.fillRect(sx|0,sy-1|0,1,3);ctx.globalAlpha=1}}
    for(const c of L.chests){if(c.open)continue;const sx=c.x-cam.x+7,sy=c.y-cam.y-4;if(sx>-10&&sx<VW+10&&sy>-10&&sy<VH+10){ctx.globalAlpha=SURF.darkA*(.5+.5*Math.sin(t*5));ctx.fillStyle=GREEN[3];ctx.fillRect(sx-1|0,sy-3|0,3,1);ctx.fillRect(sx|0,sy-4|0,1,3);ctx.globalAlpha=1}}}
  drawBeams();
  /* the shield bubble */
  if(p.shield>0&&!p.hidden&&p.dead<=0){const X=p.x+5-cam.x,Y=p.y+8-cam.y;ctx.globalAlpha=.3+.1*Math.sin(t*8);ctx.strokeStyle=CY;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(X,Y,12,0,TAU);ctx.stroke();ctx.globalAlpha=1}
  /* a giant shadow that sometimes crosses the sky */
  {const gs=SURF.giant;if(gs){gs.t+=1/60;const u=gs.t/gs.dur;if(u>=1)SURF.giant=null;else{const X=VW+80-u*(VW+260),Y=18+gs.y;ctx.globalAlpha=.28;ctx.fillStyle=idx===4?'#240030':idx===3?'#200800':'#0a0a20';ctx.beginPath();ctx.ellipse(X,Y,70,14,0,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(X+62,Y-2,22,8,0,0,TAU);ctx.fill();for(let i=0;i<6;i++){ctx.fillRect(X-60+i*20,Y+8,3,16+((i*5)%9))}ctx.fillStyle=idx===4?'#ff77ff':'#ffee77';ctx.globalAlpha=.8;ctx.fillRect(X+70,Y-4,2,2);ctx.globalAlpha=1;if(!gs.roar&&u>.45){gs.roar=1;shakeS=.5;SURF.msg=['SOMETHING HUGE ROARS FAR AWAY',3];try{sfxBoom(14,true)}catch(e){}}}}
   else if(Math.random()<.00012&&ev&&ev.phase===0&&L.sky(Math.floor(p.x/TS),Math.floor(p.y/TS)-8))SURF.giant={t:0,dur:11,y:Math.random()*40,roar:0}}
}
/* ---- the prompt and small indicators */
function featHud(){const L=SURF.L,p=SURF.p,cam=SURF.cam,s=sv();
  if(SURF.rb){SURF.rb.t-=1/60;if(SURF.rb.t<=0)SURF.rb=null;else{const a=Math.min(1,SURF.rb.t*2,(3.4-SURF.rb.t)*3),w=textW(SURF.rb.txt,1)*2+20;ctx.globalAlpha=a*.85;ctx.fillStyle='#000';ctx.fillRect(Math.round((VW-w)/2),22,w,17);ctx.fillStyle=YL;ctx.fillRect(Math.round((VW-w)/2),22,w,1);ctx.fillRect(Math.round((VW-w)/2),38,w,1);ctx.globalAlpha=a;textC(SURF.rb.txt,27,YL,2);ctx.globalAlpha=1}}
  if(SURF.modal){drawModal();return}
  {let bo=null;const g=SURF.guard;if(g&&g.hp>0&&g.engaged)bo=g;else for(const e of SURF.en)if(e.lair&&e.hp>0&&e.engaged){bo=e;break}
   if(bo){const w=150,x=(VW-w)/2,y=27;ctx.fillStyle='#000000cc';ctx.fillRect(x-4,y-11,w+8,19);textC2(bo.guardian?BOSSNAME[SURF.idx]:'MINI BOSS',VW/2,y-9,bo.vent>0?OR:YL);ctx.fillStyle=K;ctx.fillRect(x,y+1,w,5);ctx.fillStyle=bo.vent>0?OR:RD;ctx.fillRect(x+1,y+2,Math.round((w-2)*clamp(bo.hp/bo.mhp,0,1)),3)}}
  if(L.chase&&L.chase.state===1){const ch=L.chase,u=clamp((ch.yb-ch.row)/Math.max(1,ch.yb-ch.top),0,1);ctx.fillStyle='#000000cc';ctx.fillRect(VW/2-50,17,100,11);textC2('LAVA RISING',VW/2,18,OR);ctx.fillStyle=K;ctx.fillRect(VW/2-46,25,92,2);ctx.fillStyle=RD;ctx.fillRect(VW/2-46,25,Math.round(92*u),2)}
  const n=SURF.near;if(n){const X=Math.round(n.x-cam.x),Y=Math.round(n.y-cam.y)-28;const lbl={lore:'READ',npc:(n.npc==='trader'?'SHOP':'TALK'),lever:'PULL LEVER',mirror:'TURN MIRROR',nest:'DISTURB NEST',portal:'ENTER',shrine:'PRAY',panel:'TYPE CODE',pod:'TOUCH',echo:'LISTEN',console:n.state===1?'GO':'START',dig:'DIG'}[n.k]||'USE';
    const t=useLabel()+': '+lbl;const w=textW(t,1)+8,bx=clamp(X-w/2|0,2,VW-w-2),by=clamp(Y,16,VH-14);ctx.fillStyle='#000000cc';ctx.fillRect(bx,by-2,w,11);ctx.fillStyle=YL;ctx.fillRect(bx,by-2,w,1);textC2(t,bx+w/2,by,WH);SURF.promptRect={x:bx-4,y:by-6,w:w+8,h:19}}else SURF.promptRect=null;
  const tb=SURF.touchBtns;
  /* keys held */
  let kx=VW-10;if(SURF.keys.red){ctx.fillStyle='#ff5544';ctx.fillRect(kx,42,6,6);kx-=9}if(SURF.keys.blue){ctx.fillStyle='#55aaff';ctx.fillRect(kx,42,6,6)}
  const T=trk();textR('SECRETS '+T.sec+'/'+T.tot,VW-5,4,T.sec>=T.tot?GREEN[3]:'#bbbbdd',1);
  if(p.shield>0)text('SHIELD '+p.shield,6,VH-18,CY,1);
}


/* ---------------- streams of light: soft shafts that fall through dark caves, with dust floating in them ---------------- */
const BEAMC=[['#aaf0ff','#ccff88'],['#ffd890','#88eeff'],['#cfe4ff','#ffffff'],['#ff7a2a','#ffcc66'],['#ff77dd','#77ffd0']];
const BEAMS_=[{A:1.6,sl:.12},{A:1.15,sl:.16},{A:1.2,sl:.26},{A:.7,sl:.05},{A:1.3,sl:.04}];
function genBeams(L,idx){
  const LW=L.LW,LH=L.LH,g=L.g,R=rng(9100+idx*17),rn=(a,b)=>a+Math.floor(R()*(b-a+1)),out=[],spec=BEAMS_[idx],BC=BEAMC[idx];
  const stop=(x,y)=>{const t=g[y*LW+x];return t===1||t===2||t===6||t===13||t===11};
  const used=[],near=(x,y,dx,dy)=>used.some(u=>Math.abs(u.tx-x)<dx&&Math.abs(u.ty-y)<dy);
  const add=(tx,ty,w,len,up,col,col2)=>{used.push({tx,ty});out.push({x:tx*TS,y:ty*TS,w:w*TS,len:len*TS,up,sl:(R()<.5?-1:1)*spec.sl*(.6+.8*R()),c:col,c2:col2,ph:R()*6.28,tx,ty,w_:w,img:null})};
  const cmap=new Map(),flat=[];
  for(let x=12;x<LW-12;x++){const s=L.surf[x]>=0?L.surf[x]:L.skyRow;for(let y=s+14;y<LH-14;y++){if(g[y*LW+x]===0&&g[(y-1)*LW+x]===1){let d=0;while(d<26&&!stop(x,y+d))d++;if(d>=8&&g[(y+d)*LW+x]!==10){cmap.set(y*LW+x,d);flat.push(x,y,d)}y+=d}}}
  const seen=new Set(),pcs=[];
  for(let i=0;i<flat.length;i+=3){const x=flat[i],y=flat[i+1],k0=y*LW+x;if(seen.has(k0))continue;let xe=x;while(cmap.has(y*LW+xe+1))xe++;for(let q=x;q<=xe;q++)seen.add(y*LW+q);const rl=xe-x+1;
    for(let k=0;k<rl;k+=rn(10,22)){const w=Math.min(rn(3,6),rl-k);if(w<3)continue;let md=99;for(let q=0;q<w;q++)md=Math.min(md,cmap.get(y*LW+x+k+q));pcs.push({x:x+k,y,w,d:md})}}
  for(let i=pcs.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[pcs[i],pcs[j]]=[pcs[j],pcs[i]]}
  const place=(p)=>{const s=L.surf[p.x]>=0?L.surf[p.x]:L.skyRow,deep=p.y-s>70;add(p.x,p.y,p.w,Math.min(p.d,26),false,deep?BC[1]:BC[0],BC[1])};
  for(const dk of L.dark||[]){const p=pcs.find(q=>q.x>=dk.x0&&q.x+q.w<=dk.x1&&q.y>=dk.y0&&q.y<=dk.y1&&!near(q.x,q.y,10,10));if(p)place(p)}
  const cap=Math.min(60,Math.floor(LW/17));
  for(const p of pcs){if(out.length>=cap)break;if(R()<.3||near(p.x,p.y,18,22))continue;place(p)}
  /* lava glow: warm rays stand up off the lava pools */
  if(idx===3){const lv=[];for(let y=20;y<LH-6;y++)for(let x=12;x<LW-12;x++){if(g[y*LW+x]===4&&g[(y-1)*LW+x]===0){let xe=x;while(g[y*LW+xe+1]===4&&g[(y-1)*LW+xe+1]===0)xe++;if(xe-x>=3)lv.push({x,y,rl:xe-x+1});x=xe}}
    for(let i=lv.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[lv[i],lv[j]]=[lv[j],lv[i]]}
    let n=0;for(const q of lv){if(n>=26)break;const w=Math.min(rn(3,6),q.rl),x=q.x+rn(0,q.rl-w);let len=0;while(len<22&&!stop(x+(w>>1),q.y-1-len))len++;if(len<6||near(x,q.y,14,10))continue;add(x,q.y,w,len,true,BC[0],BC[1]);n++}}
  out.sort((a,b)=>a.x-b.x);return out}
function beamSprite(b,idx){
  const len=Math.round(b.len),sl=b.sl,xc0=(sl<0?-sl*len:0)+b.w*.65+1,SW=Math.ceil(xc0+Math.max(0,sl)*len+b.w*.9)+3,cv=document.createElement('canvas');cv.width=SW;cv.height=len;
  const g=cv.getContext('2d'),im=g.createImageData(SW,len),d_=im.data,col=hex3(b.c),A=BEAMS_[idx].A,bs=.6+.4*Math.sin(b.ph),f1=7+5*Math.sin(b.ph*1.7);
  for(let j=0;j<len;j++){const d=b.up?(len-1-j)/len:j/len,xc=xc0+sl*d*len,wd=b.w*(1+.3*d),l=xc-wd/2,fade=Math.pow(1-d,1.15)*(d<.05?.5+d*10:1);
    for(let i=Math.max(0,Math.floor(l));i<Math.min(SW,Math.ceil(l+wd));i++){const u=(i-l)/wd;if(u<0||u>1)continue;let pr=Math.pow(Math.sin(u*PI),.7);
      if(idx===2)pr*=1-.75*Math.exp(-Math.pow((u-.5)/.05,2));
      const st=.78+.22*Math.sin(u*f1+b.ph+d*3),al=A*pr*st*fade*bs,bay=((i&1)+(j&1)*2)/4-.375,qa=Math.max(0,Math.round(al*6+bay*.8))/6;if(qa<=0)continue;
      const o=(j*SW+i)*4;d_[o]=col[0];d_[o+1]=col[1];d_[o+2]=col[2];d_[o+3]=Math.min(255,qa*255)}}
  g.putImageData(im,0,0);b.xc0=xc0;b.img=cv;
  const pw=Math.ceil(b.w*2+16),pc=document.createElement('canvas');pc.width=pw;pc.height=12;const pg=pc.getContext('2d'),gr=pg.createRadialGradient(pw/2,6,1,pw/2,6,pw/2);gr.addColorStop(0,'rgba('+col[0]+','+col[1]+','+col[2]+',.55)');gr.addColorStop(1,'rgba('+col[0]+','+col[1]+','+col[2]+',0)');pg.save();pg.translate(0,6);pg.scale(1,.2);pg.translate(0,-6);pg.fillStyle=gr;pg.fillRect(0,-24,pw,60);pg.restore();b.pool=pc}
function hex3(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function beamPoly(b,cam){const sx=b.x+b.w/2-cam.x,sy=b.y-cam.y,we=b.w*1.3,ex=sx+b.sl*b.len,dy=b.up?-b.len:b.len;return [[sx-b.w/2,sy],[sx+b.w/2,sy],[ex+we/2,sy+dy],[ex-we/2,sy+dy]]}
function drawBeams(){
  const L=SURF.L,cam=SURF.cam,idx=SURF.idx,t=L.tick;if(!L.beams)L.beams=genBeams(L,idx);
  const ctx_=ctx;ctx_.globalCompositeOperation='lighter';
  for(const b of L.beams){const ex=Math.abs(b.sl*b.len)+b.w*1.3;if(b.x>cam.x+VW+ex||b.x+b.w<cam.x-ex)continue;const top=b.up?b.y-b.len:b.y;if(top>cam.y+VH||top+b.len<cam.y)continue;
    if(!b.img)beamSprite(b,idx);
    const sx=b.x+b.w/2-cam.x,sy=b.y-cam.y,br=.82+.18*Math.sin(t*.35+b.ph);
    ctx_.globalAlpha=br;ctx_.drawImage(b.img,Math.round(sx-b.xc0),Math.round(b.up?sy-b.len:sy));
    const hx=sx+b.sl*b.len,hy=b.up?sy:sy+b.len;
    ctx_.globalAlpha=.7*br;ctx_.drawImage(b.pool,Math.round(hx-b.pool.width/2),Math.round(hy-8));
    ctx_.fillStyle=b.c;if(!b.up){ctx_.globalAlpha=.55*br;ctx_.fillRect(Math.round(sx-b.w/2),Math.round(sy),b.w,1);ctx_.globalAlpha=.2*br;ctx_.fillRect(Math.round(sx-b.w/2)-2,Math.round(sy)-1,b.w+4,2)}else{ctx_.globalAlpha=.3*br;ctx_.drawImage(b.pool,Math.round(sx-b.pool.width/2),Math.round(sy-8))}
    const nm=Math.min(9,Math.ceil(b.len/28));
    for(let k=0;k<nm;k++){const d=((b.ph*7+k*.137+t*(.014+.007*(k%3)))%1),yy=b.up?sy-d*b.len:sy+d*b.len,wd=b.w*(1+.3*d),xx=sx+b.sl*d*b.len+Math.sin(t*.4+k*2.1+b.ph)*wd*.3;
      ctx_.globalAlpha=Math.sin(d*PI)*(.3+.6*Math.pow(Math.sin(t*.7+k*1.9),2))*br;ctx_.fillStyle=k%3?b.c2:'#ffffff';ctx_.fillRect(Math.round(xx),Math.round(yy),(k&3)===0?2:1,1)}}
  ctx_.globalCompositeOperation='source-over';ctx_.globalAlpha=1}

/* ---------------- ambient flying critters: fireflies, moths, butterflies, dragonflies, drones, embers and spores; harmless, they only drift ---------------- */
const CK=[[['fly',.3],['moth',.25],['bfly',.2],['spore',.25]],[['dragon',.3],['beetle',.25],['bfly',.2],['pollen',.25]],[['drone',.4],['fly',.3],['pollen',.3]],[['ember',.45],['moth',.3],['fly',.25]],[['spore',.4],['fly',.3],['moth',.3]]];
const CC=[['#ccff77','#ff77dd','#33ddff','#ffee55'],['#ffe08a','#33ddff','#ff7799','#ffcc22'],['#88ffcc','#aaccff','#ffffff','#44ffcc'],['#ff9933','#ffcc44','#ff5522','#ffee99'],['#ff77dd','#77ffd0','#cc99ff','#ffee66']];
const CMAX=[40,30,22,30,34];
function drawCritters(){
  const L=SURF.L,cam=SURF.cam,p=SURF.p,idx=SURF.idx,t=L.tick,C=L.crit||(L.crit=[]),dt=1/60,LW=L.LW,rnd=Math.random;
  const lu=lushAt(Math.floor((cam.x+VW/2)/TS),idx),want=lu<.18?0:Math.round(CMAX[idx]*Math.pow(lu,1.2));
  if(C.length<want&&(L.tickF|0)%5===0){const tx=Math.floor((cam.x-30+rnd()*(VW+60))/TS);if(tx>3&&tx<LW-3){const sr=L.surf[tx];if(sr>=0){const wy=sr*TS-8-rnd()*56;
      if(wy>cam.y-24&&wy<cam.y+VH+24&&(idx>=2?L.g[Math.floor(wy/TS)*LW+tx]===0:L.sky(tx,Math.floor(wy/TS)))&&lushAt(tx,idx)>.18){let r=rnd(),kind='fly';for(const [k,w] of CK[idx]){if(r<w){kind=k;break}r-=w}
        C.push({x:tx*TS+rnd()*8,y:wy,k:kind,ph:rnd()*6.28,a:rnd()*6.28,sp:kind==='dragon'?44:kind==='drone'?14:kind==='ember'?10:kind==='beetle'?26:kind==='spore'||kind==='pollen'?5:kind==='fly'?9:16+rnd()*8,col:CC[idx][Math.floor(rnd()*4)],age:0,life:16+rnd()*24})}}}}
  const ctx_=ctx;
  for(let i=C.length-1;i>=0;i--){const c=C[i];c.age+=dt;c.life-=dt;const tx=Math.floor(c.x/TS),sr=tx>=0&&tx<LW?L.surf[tx]:-1;
    if(c.life<=0||sr<0||c.x<cam.x-120||c.x>cam.x+VW+120||c.y>cam.y+VH+80||c.y<cam.y-90){C.splice(i,1);continue}
    const k=c.k,gy=sr*TS;
    c.a+=(Math.sin(t*(.9+c.ph*.1)+c.ph)+Math.sin(t*1.7+c.ph*2.3))*dt*(k==='dragon'?.9:k==='drone'?.35:1.6);
    let sp=c.sp;if(k==='dragon')sp*=Math.sin(t*1.3+c.ph)>.1?1.2:.15;
    let vx=Math.cos(c.a)*sp,vy=Math.sin(c.a)*sp*(k==='dragon'||k==='drone'?.25:.6);
    if(k==='ember'){vy=-sp*(.6+.4*Math.sin(t+c.ph));vx=Math.sin(t*.8+c.ph)*sp*.8}
    else if(k==='spore'||k==='pollen'){vy=Math.sin(t*.5+c.ph)*sp;vx=Math.cos(t*.37+c.ph*1.3)*sp+4}
    else{if(c.y>gy-6)vy-=34;else if(c.y<gy-72)vy+=14}
    const dx=c.x-(p.x+5),dy=c.y-(p.y+8),d2=dx*dx+dy*dy;if(d2<900&&d2>.5){const dd=Math.sqrt(d2),pu=(1-dd/30)*70;vx+=dx/dd*pu;vy+=dy/dd*pu}
    c.x+=vx*dt;c.y+=vy*dt;c.vx=vx;
    if(L.g[Math.floor(c.y/TS)*LW+tx]===1)c.y-=24*dt*3;
    const X=Math.round(c.x-cam.x),Y=Math.round(c.y-cam.y),al=Math.min(1,c.age*.6,c.life*.5),pl=.5+.5*Math.sin(t*1.3+c.ph),f=Math.floor(t*5+c.ph)%2;
    ctx_.fillStyle=c.col;
    if(k==='bfly'||k==='moth'||k==='dragon'||k==='beetle'||k==='drone'){ctx_.globalAlpha=al*(idx===1?.12:.1);ctx_.fillStyle=idx===1?'#401000':c.col;ctx_.beginPath();ctx_.arc(X+.5,Y+.5,3.5,0,TAU);ctx_.fill();ctx_.fillStyle=c.col}
    if(k==='fly'){ctx_.globalAlpha=al*.08*pl;ctx_.fillRect(X-3,Y-2,7,5);ctx_.fillRect(X-2,Y-3,5,7);ctx_.globalAlpha=al*.2*pl;ctx_.fillRect(X-1,Y-1,3,3);ctx_.globalAlpha=al*(.6+.4*pl);ctx_.fillRect(X-1,Y,3,2);ctx_.fillRect(X,Y-1,1,4);ctx_.globalAlpha=al*.7*pl;ctx_.fillStyle='#ffffff';ctx_.fillRect(X,Y,1,1)}
    else if(k==='moth'){ctx_.globalAlpha=al*.1;ctx_.fillRect(X-4,Y-3,9,7);ctx_.globalAlpha=al*.95;ctx_.fillRect(X-3,Y-1+f,3,2);ctx_.fillRect(X+1,Y-1+f,3,2);ctx_.fillStyle='#ffffff';ctx_.fillRect(X,Y-1,1,3);ctx_.globalAlpha=al*.7;ctx_.fillRect(X-2,Y+f,1,1);ctx_.fillRect(X+2,Y+f,1,1)}
    else if(k==='bfly'){ctx_.globalAlpha=al;ctx_.fillRect(X-4,Y-2+f,4,3);ctx_.fillRect(X+1,Y-2+f,4,3);ctx_.fillRect(X-3,Y+1+f,2,1);ctx_.fillRect(X+2,Y+1+f,2,1);ctx_.fillStyle=K;ctx_.fillRect(X,Y-2,1,5);ctx_.fillStyle='#ffffff';ctx_.fillRect(X-3,Y-1+f,1,1);ctx_.fillRect(X+3,Y-1+f,1,1)}
    else if(k==='dragon'){const s=c.vx>=0?1:-1;ctx_.globalAlpha=al;ctx_.fillRect(X-4*s,Y,8,1);ctx_.fillStyle='#ffffff';ctx_.fillRect(X+3*s,Y,2,2);ctx_.globalAlpha=al*.75;ctx_.fillStyle='#d8f8ff';ctx_.fillRect(X-s,Y-2+f*3,4,1);ctx_.fillRect(X+s,Y-2+(1-f)*3,4,1)}
    else if(k==='beetle'){ctx_.globalAlpha=al;ctx_.fillRect(X-1,Y,4,3);ctx_.fillStyle='#ffffff';ctx_.globalAlpha=al*.7;ctx_.fillRect(X-2,Y-1+f,2,1);ctx_.fillRect(X+3,Y-1+f,2,1);ctx_.globalAlpha=al*.5;ctx_.fillRect(X,Y,1,1)}
    else if(k==='drone'){ctx_.globalAlpha=al;ctx_.fillStyle='#8a98a8';ctx_.fillRect(X-2,Y,5,3);ctx_.fillStyle='#e8f0ff';ctx_.fillRect(X-3,Y-1,7,1);ctx_.fillRect(X-2,Y,5,1);const on=((t*.6+c.ph)%2)<.4;ctx_.fillStyle=on?'#44ffcc':'#1a4a5a';ctx_.fillRect(X,Y+2,1,1)}
    else if(k==='ember'){ctx_.globalAlpha=al*.12;ctx_.fillStyle='#ff9933';ctx_.fillRect(X-2,Y-2,5,5);ctx_.globalAlpha=al*.95;ctx_.fillRect(X,Y,2,2);ctx_.globalAlpha=al*.5;ctx_.fillStyle='#aa3311';ctx_.fillRect(X,Y+2,1,3);ctx_.fillStyle='#ffee99';ctx_.globalAlpha=al*.4*pl;ctx_.fillRect(X,Y,1,1)}
    else if(k==='spore'){ctx_.globalAlpha=al*.12;ctx_.fillRect(X-3,Y-3,7,7);ctx_.globalAlpha=al*.2;ctx_.fillRect(X-2,Y-2,5,5);ctx_.globalAlpha=al*(.55+.35*pl);ctx_.fillRect(X-1,Y-1,3,3)}
    else{ctx_.globalAlpha=al*.6;ctx_.fillStyle='#ffffcc';ctx_.fillRect(X,Y,1,1)}}
  ctx_.globalAlpha=1}
/* ---------------- drawing ---------------- */
SURF.draw=function(){
  const L=SURF.L,A=SURF.A,Wd=SURF.W,p=SURF.p,cam=SURF.cam;
  let sx=0,sy0=0;if(shakeS>0){shakeS-=1/60;sx=(Math.random()-.5)*3;sy0=(Math.random()-.5)*3}
  ctx.save();ctx.translate(sx|0,sy0|0);
  /* the background: a cave wall always, with the sky laid over it where the camera looks out at open air */
  const cxT=clamp(Math.floor((cam.x+VW/2)/TS),0,L.LW-1),cyT=clamp(Math.floor((cam.y+VH/2)/TS),0,L.LH-1);
  const skyT=L.sky(cxT,cyT)?1:0;
  SURF.skyK=SURF.skyK==null?skyT:SURF.skyK+(skyT-SURF.skyK)*.07;const sk=SURF.skyK;
  {ctx.fillStyle=(Wd.wallc||Wd.rock)[0];ctx.fillRect(0,0,VW,VH);const wi=A.wall,ox=-Math.floor(mod(cam.x*.45,128)),oy=-Math.floor(mod(cam.y*.45,96));for(let y=oy;y<VH;y+=96)for(let x=ox;x<VW;x+=128)ctx.drawImage(wi,x,y)}
  if(A.vwall){const wv=A.vwall,ox=-Math.floor(mod(cam.x*.3,320)),oy=-Math.floor(mod(cam.y*.3+(SURF.idx===3?L.tick*6:0),200));ctx.globalAlpha=SURF.idx===4?.5:SURF.idx===2?.62:.9;for(let x=ox;x<VW;x+=320)for(let y=oy;y<VH;y+=200)ctx.drawImage(wv,x,y);ctx.globalAlpha=1}
  {const dpt=clamp(((cam.y+VH/2)/TS-L.skyRow)/Math.max(1,L.LH-L.skyRow),0,1);ctx.globalAlpha=.02+.24*dpt;ctx.fillStyle='#000008';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1;
   if(!SURF.vgn){const c=SURF.vgn=document.createElement('canvas');c.width=VW;c.height=VH;const g=c.getContext('2d'),gr=g.createRadialGradient(VW/2,VH/2,60,VW/2,VH/2,215);gr.addColorStop(0,'rgba(0,0,8,0)');gr.addColorStop(1,'rgba(0,0,8,.4)');g.fillStyle=gr;g.fillRect(0,0,VW,VH)}ctx.drawImage(SURF.vgn,0,0)}
  if(SURF.idx===1&&sk<.9){ctx.globalAlpha=.06*(1-sk);ctx.fillStyle='#ffe0a0';for(let i=0;i<3;i++){const x0=mod(i*130-cam.x*.2,VW+80)-40;ctx.beginPath();ctx.moveTo(x0,0);ctx.lineTo(x0+26,0);ctx.lineTo(x0+90,VH);ctx.lineTo(x0+50,VH);ctx.closePath();ctx.fill()}ctx.globalAlpha=1}
  if(A.ribs){const f=.68,ox=-Math.floor(mod(cam.x*f,200)),oy=-Math.floor(mod(cam.y*f*.5,200));ctx.globalAlpha=Wd.cavern?.55:.7;for(let x=ox;x<VW;x+=200)for(let y=oy;y<VH;y+=200)ctx.drawImage(A.ribs,x,y);ctx.globalAlpha=1}
  const cxs=clamp(Math.floor((cam.x+VW/2)/TS),0,L.LW-1),sr0=L.surf[cxs]>=0?L.surf[cxs]:(SURF.srow==null?L.skyRow:SURF.srow);SURF.srow=SURF.srow==null?sr0:SURF.srow+(sr0-SURF.srow)*.05;const srow=SURF.srow;
  const horizon=clamp(150-(cam.y-(srow*TS-100))*.35,100,230);
  if(sk>.02){ctx.globalAlpha=sk;ctx.drawImage(A.sky,0,0);
    const alt=(srow*TS-(cam.y+VH/2))/TS,hk=clamp((alt-30)/110,0,1);
    if(SURF.idx<2){ctx.drawImage(A.skyobj,Math.floor(190-cam.x*.03),Math.floor(10-cam.y*.04));ctx.fillStyle=Wd.glow;for(let i=0;i<22;i++){const sx=mod(i*47-L.tick*(6+i%5),VW+20),sy=mod(i*31+Math.sin(L.tick*.7+i)*12,110)+4;ctx.globalAlpha=.5*sk;ctx.fillRect(sx|0,sy|0,2,2);ctx.globalAlpha=sk}}
    if(A.cloud&&SURF.idx<2)for(let i=0;i<4;i++){const c=A.cloud[i%3],sp=3+i*1.6,cxx=Math.floor(mod(i*131-L.tick*sp-cam.x*.06,VW+160))-80,cyy=Math.floor(14+((i*37)%50)-(cam.y-(srow*TS-100))*.05);ctx.globalAlpha=.55*sk;ctx.drawImage(c,cxx,cyy);ctx.globalAlpha=sk}
    if(SURF.idx===2||SURF.idx===4){ctx.fillStyle='#ffffff';for(let i=0;i<70;i++){const sx=mod(i*47.7-cam.x*.04*(1+i%3),VW),sy=mod(i*29.3-cam.y*.03*(1+i%3),VH),tw=.4+.6*Math.abs(Math.sin(L.tick*1.5+i));ctx.globalAlpha=sk*tw*(i%5?.5:1);ctx.fillRect(sx|0,sy|0,1+(i%7===0),1)}ctx.globalAlpha=sk;
      const px_=Math.floor(220-cam.x*.02),py_=Math.floor(40-cam.y*.02);ell2(ctx,px_,py_,30,SURF.idx===2?['#1c1840','#3c5a8a','#70a4b2','#ccffff']:['#3a0a38','#8a3aa6','#ff77ff','#ffccff'])}
    if(A.vsky){for(let l=0;l<2;l++){const img=A.vsky[l],f=[.14,.3][l],ox=-Math.floor(mod(cam.x*f,640)),oy=Math.floor(horizon-img.height+[6,30][l]);for(let x=ox;x<VW;x+=640)ctx.drawImage(img,x,oy)}}
    for(let l=0;l<3;l++){if(SURF.idx>=2)break;const img=A.far[l],f=[.1,.22,.38][l],ox=-Math.floor(mod(cam.x*f,320)),oy=Math.floor(horizon-img.height+[2,14,28][l]);
      for(let x=ox;x<VW;x+=320)ctx.drawImage(img,x,oy)}
    {const f=.5,span=A.decor.length*130;for(let i=0;i<A.decor.length*3;i++){const d=A.decor[i%A.decor.length],wx=i*130+((i*37)%50),x=Math.floor(wx-cam.x*f),y=Math.floor(horizon-d.height+16-(cam.y-(srow*TS-100))*.1);
      const xx=mod(x+60,span+VW)-60;if(xx>-d.width&&xx<VW)ctx.drawImage(d,xx,y)}}
    if(hk>0){const gr=ctx.createLinearGradient(0,0,0,VH);gr.addColorStop(0,'#02020e');gr.addColorStop(1,'#0c1040');ctx.globalAlpha=hk*.8*sk;ctx.fillStyle=gr;ctx.fillRect(0,0,VW,VH);ctx.fillStyle='#fff';for(let i=0;i<90;i++){const sx=mod(i*53.1-cam.x*.03,VW),sy=mod(i*37.7-cam.y*.02,VH);ctx.globalAlpha=hk*sk*(.3+.7*Math.abs(Math.sin(L.tick*1.3+i)));ctx.fillRect(sx|0,sy|0,1+(i%9===0),1)}}
    for(const c of L.clouds){const im=A.cloud&&A.cloud[c.s%3];if(!im)continue;const X=Math.floor(VW/2+(c.x-(cam.x+VW/2))*.7-im.width/2),Y=Math.floor(VH/2+(c.y-(cam.y+VH/2))*.7);if(X<-im.width||X>VW||Y<-30||Y>VH)continue;ctx.globalAlpha=.55*sk;ctx.drawImage(im,X,Y)}
    ctx.globalAlpha=1}
  /* each kind of room tints the light, and eases from one tint to the next */
  {const zn=L.zoneName(cxT,cyT),zi=zn?ZNAMES.indexOf(zn):0,tt=ZTW[SURF.idx][zi]||['#000000',0],pc=C32(tt[0]);
    const z=SURF.ztc=SURF.ztc||[0,0,0,0],tr=[pc&255,(pc>>>8)&255,(pc>>>16)&255,tt[1]];for(let k=0;k<4;k++)z[k]+=(tr[k]-z[k])*.04;
    SURF.zn=zn;if(z[3]>.01){ctx.globalAlpha=Math.min(.26,z[3]*.5);ctx.fillStyle='rgb('+(z[0]|0)+','+(z[1]|0)+','+(z[2]|0)+')';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}}
  /* tiles */
  const T=A.tiles,x0=Math.floor(cam.x/TS),x1=Math.min(L.LW-1,x0+41),y0=Math.floor(cam.y/TS),y1=Math.min(L.LH-1,y0+26);
  const tf=Math.floor(L.tick*3)%2;
  /* the painted ground */
  {const NCX=Math.floor((L.LW*TS-1)/CHW),NCY=Math.floor((L.LH*TS-1)/CHW),c0=Math.max(0,Math.floor(cam.x/CHW)),c1=Math.min(NCX,Math.floor((cam.x+VW)/CHW)),j0=Math.max(0,Math.floor(cam.y/CHW)),j1=Math.min(NCY,Math.floor((cam.y+VH)/CHW));
    const CH=L.chunks=L.chunks||{};
    for(let cj=j0;cj<=j1;cj++)for(let ci=c0;ci<=c1;ci++){const key=ci+cj*4096;if(!CH[key])CH[key]=bakeH(L,ci,cj);CH[key].u=L.tick;ctx.drawImage(CH[key],Math.floor(ci*CHW-cam.x),Math.floor(cj*CHW-cam.y))}
    /* bake one neighbour a frame so scrolling never stalls, and forget chunks far behind */
    pre:for(let r=1;r<=2;r++)for(let cj=j0-r;cj<=j1+r;cj++)for(let ci=c0-r;ci<=c1+r;ci++){if(ci<0||cj<0||ci>NCX||cj>NCY)continue;const key=ci+cj*4096;if(!CH[key]){CH[key]=bakeH(L,ci,cj);CH[key].u=L.tick;break pre}}
    if((L.tickF=(L.tickF||0)+1)%90===0){const ks=Object.keys(CH);if(ks.length>40){ks.sort((a,b)=>CH[a].u-CH[b].u);for(let q=0;q<ks.length-32;q++)delete CH[ks[q]]}}}
  /* big props behind the player, kept in buckets 256 pixels wide */
  if(!L.decoB){L.decoB={};for(const d of L.deco){const k=Math.floor(d.x/256);(L.decoB[k]=L.decoB[k]||[]).push(d)}}
  for(let k=Math.floor(cam.x/256)-1;k<=Math.floor((cam.x+VW)/256);k++){const bk=L.decoB[k];if(!bk)continue;for(const d of bk){const im=A.deco[d.k];if(!im)continue;const X=Math.floor(d.x-im.width/2-cam.x),Y=Math.floor(d.y-im.height-cam.y);if(X>VW||X<-im.width||Y>VH||Y<-im.height)continue;ctx.drawImage(im,X,Y)}}
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    const t=L.g[ty*L.LW+tx],X=Math.floor(tx*TS-cam.x),Y=Math.floor(ty*TS-cam.y);
    if(t===0)continue;
    if(t===10){const up=ty>0&&L.g[(ty-1)*L.LW+tx]===10;ctx.globalAlpha=up?.38:.46;ctx.fillStyle=WATC[SURF.idx];ctx.fillRect(X,Y,8,8);
      if(!up){ctx.globalAlpha=.85;ctx.fillStyle=WATL[SURF.idx];ctx.fillRect(X,Y,8,1);const w=Math.floor(L.tick*3+tx)%4;ctx.fillRect(X+w*2,Y-1,2,1);
        if(((tx*7919)%11)<3){let d=0;while(d<8&&L.g[(ty+d+1)*L.LW+tx]===10)d++;ctx.globalAlpha=.1+.04*Math.sin(L.tick*2+tx);ctx.fillStyle='#ffffff';ctx.fillRect(X+2,Y+1,3,d*8)}}
      ctx.globalAlpha=1;continue}
    let im;
    if(t===2){const l=L.g[ty*L.LW+tx-1]===2,r=L.g[ty*L.LW+tx+1]===2;im=T.platV[l?(r?2:3):(r?1:0)]}else if(t===7)im=T.ladder[(ty>0&&L.g[(ty-1)*L.LW+tx]===7)?0:1];
    else if(t===3)im=T.spikeA?T.spikeA[tf]:T.spike;else if(t===4){im=T.lava[Math.floor(L.tick*4)%4];if(ty>0&&L.g[(ty-1)*L.LW+tx]!==4){ctx.globalAlpha=.45+.1*Math.sin(L.tick*3+tx);ctx.fillStyle=OR;ctx.fillRect(X,Y-6,8,6);ctx.globalAlpha=.24;ctx.fillRect(X-3,Y-14,14,8);ctx.globalAlpha=.1;ctx.fillRect(X-5,Y-22,18,8);ctx.globalAlpha=1}}else if(t===5)im=T.spring;else if(t===11)im=A.fx.door;else if(t===13)im=A.fx.crack;
    else if(t===6){const c=L.crum[ty*L.LW+tx];im=T.crumble;if(c&&c.state==='shake')ctx.globalAlpha=.6+.4*Math.sin(L.tick*60)}
    if(im){ctx.drawImage(im,X,Y);ctx.globalAlpha=1}
    if(t===6){const gl=L.g[ty*L.LW+tx-1],gr=L.g[ty*L.LW+tx+1],gu=ty>0?L.g[(ty-1)*L.LW+tx]:1,gd=ty<L.LH-1?L.g[(ty+1)*L.LW+tx]:1;ctx.fillStyle=K;if(gl===0)ctx.fillRect(X,Y,1,8);if(gr===0)ctx.fillRect(X+7,Y,1,8);if(gu===0)ctx.fillRect(X,Y-1,8,1);if(gd===0)ctx.fillRect(X,Y+7,8,1)}
    if(t===1){if(ty>0&&L.g[(ty-1)*L.LW+tx]===0){{const rc=['#ffccff','#fff0c8','#aaf4ff','#ffd070','#fff0a0'][SURF.idx];ctx.fillStyle=rc;ctx.fillRect(X,Y,8,1);ctx.globalAlpha=.55;ctx.fillRect(X,Y+1,8,1);ctx.globalAlpha=1}}
      const h=((tx*73856093)^(ty*19349663))>>>0,sw=Math.floor(L.tick*1.5+h%7)%2;
      const zi=L.zmap[(ty>>6)*L.cols+((tx/96)|0)],ship=SURF.idx===2||SURF.idx===4,fz=ship?(zi===4?1:zi===1?.8:zi===5?.5:.1):(zi===4||zi===1?1:zi===5?.8:zi===2?.5:zi===3?.6:zi===9||zi===10?.5:.3);
      const cl=(((tx>>2)*2654435761)>>>0)%100,prob=(cl<55?85:10)*fz;
      let drew=false;
      if(ty>0&&L.g[(ty-1)*L.LW+tx]===0){const lu=lushAt(tx,SURF.idx),pr=Math.min(96,prob*(.4+.9*lu));
        if(h%100<pr){drew=true;const pl=A.plants.top[h%A.plants.top.length];ctx.drawImage(pl,X+4-(pl.width>>1)+sw+((h>>>6)%5)-2,Y-pl.height+1)}
        if(((h>>>11)%100)<58*lu*(.3+fz)){const pl=A.plants.tall[(h>>>4)%A.plants.tall.length];ctx.drawImage(pl,X+4-(pl.width>>1)+sw+((h>>>3)%7)-3,Y-pl.height+1)}
        if(SURF.idx>=2||L.sky(tx,ty-1)){if(((h>>>17)%100)<64*lu*(.35+fz*.9)){drew=true;const pl=A.plants.flo[(h>>>9)%A.plants.flo.length];ctx.drawImage(pl,X+4-(pl.width>>1)+sw+((h>>>13)%5)-2,Y-pl.height+1)}
          if(((h>>>23)%100)<26*lu*(.3+fz)){const pl=A.plants.flo[(h>>>5)%A.plants.flo.length];ctx.drawImage(pl,X+4-(pl.width>>1)+sw+((h>>>26)%7)-3,Y-pl.height+1)}}}
      if(!drew&&ty<L.LH-1&&L.g[(ty+1)*L.LW+tx]===0&&h%100<(SURF.idx===2?20:44)){const pl=A.plants.hang[h%A.plants.hang.length];ctx.drawImage(pl,X+2+sw,Y+7)}}
  }
  if(Wd.lava){const gy=VH-80;for(let i=0;i<16;i++){ctx.globalAlpha=.015+i*.005;ctx.fillStyle=i<8?'#9a3a3a':'#ff9966';ctx.fillRect(0,gy+i*5,VW,5)}ctx.globalAlpha=1}
  for(const gl of L.glows){const X=gl.x*TS-cam.x,Y=gl.y*TS-cam.y,W=gl.w*TS,H=gl.h*TS;if(X>VW||X+W<0||Y>VH||Y+H<0)continue;const pu=.5+.5*Math.sin(L.tick*2+gl.x);ctx.globalAlpha=(gl.hint?.1:.07)+(gl.hint?.1:.05)*pu;ctx.fillStyle=gl.c;ctx.fillRect(X|0,Y|0,W,H);ctx.globalAlpha=(gl.hint?.12:.05)*pu;ctx.fillRect((X-4)|0,(Y-4)|0,W+8,H+8);ctx.globalAlpha=1}
  /* soft coloured light round each jungle landmark */
  if(L.tints&&L.tints.length){const tc=SURF.tintC||(SURF.tintC={});ctx.globalCompositeOperation='lighter';for(const q of L.tints){const X=q.x-cam.x,Y=q.y-cam.y;if(X<-120||X>VW+120||Y<-90||Y>VH+90)continue;let im=tc[q.c];if(!im){im=tc[q.c]=document.createElement('canvas');im.width=220;im.height=150;const g=im.getContext('2d'),gr=g.createRadialGradient(110,75,2,110,75,105),rgb=hex3(q.c);gr.addColorStop(0,'rgba('+rgb+',.6)');gr.addColorStop(.5,'rgba('+rgb+',.25)');gr.addColorStop(1,'rgba('+rgb+',0)');g.save();g.translate(0,75);g.scale(1,.72);g.translate(0,-75);g.fillStyle=gr;g.fillRect(0,0,220,220);g.restore()}ctx.globalAlpha=.5+.14*Math.sin(L.tick*.6+q.x);ctx.drawImage(im,Math.round(X-110),Math.round(Y-75))}ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
  /* floating spores, blowing sand, dust and sparks, embers and ash */
  {const k0=SURF.idx,t=L.tick,N=44;
    for(let i=0;i<N;i++){
      const lay=i%3,par=[.35,.7,1.15][lay],sx=(i*73.13)%VW,sy=(i*41.7)%VH;let X,Y,col,al=.5,w=1,h=1;
      if(k0===0){X=mod(sx+Math.sin(t*.6+i)*14-cam.x*par+t*3,VW+8);Y=mod(sy-t*(5+lay*5)-cam.y*par*.3,VH);col=[MG,CY,YL,PG][i%4];al=.25+.6*Math.pow(Math.sin(t*2.4+i*1.7),2);w=h=lay===2?2:1}
      else if(k0===1){X=mod(sx-t*(26+lay*24)-cam.x*par,VW+8);Y=mod(sy+Math.sin(t*.8+i)*5-cam.y*par*.3,VH);col=[YL,WH,OR][i%3];al=.2+.18*lay;w=lay+2}
      else if(k0===2){if(i%11===0){X=mod(sx*3-cam.x*par,VW);Y=mod(sy*2+t*70,VH);col=YL;al=.9;h=2}else{X=mod(sx+Math.sin(t*.4+i)*10-cam.x*par,VW+8);Y=mod(sy+t*3*(lay+1)-cam.y*par*.3,VH);col=[CY,WH,'#9ad2e0'][i%3];al=.12+.1*lay}}
      else if(k0===3){if(i%5===0){X=mod(sx+Math.sin(t+i)*8-cam.x*par,VW+8);Y=mod(sy+t*(8+lay*5)-cam.y*par*.3,VH);col='#888888';al=.25}else{X=mod(sx+Math.sin(t*1.3+i)*9-cam.x*par,VW+8);Y=mod(sy-t*(12+lay*10)-cam.y*par*.3,VH);col=[OR,YL,RD][i%3];al=.4+.5*Math.pow(Math.sin(t*5+i),2);w=h=lay===2?2:1}}
      else{if(i%9===0){X=mod(sx*2-cam.x*par,VW);Y=mod(sy+t*55,VH);col=PG;al=.7;h=2}else{X=mod(sx+Math.sin(t*.5+i)*12-cam.x*par,VW+8);Y=mod(sy-t*(4+lay*4)-cam.y*par*.3,VH);col=[PG,MG,CY][i%3];al=.2+.5*Math.pow(Math.sin(t*2+i*1.3),2);w=h=lay===2?2:1}}
      ctx.globalAlpha=al;ctx.fillStyle=col;ctx.fillRect(X|0,Y|0,w,h)}
    ctx.globalAlpha=1}
  /* fish in the water, bubbles, fireflies and dust motes by room */
  for(const f of L.fish){f.x+=f.vx*(1/60);if(f.x<f.x0||f.x>f.x1)f.vx=-f.vx;const X=Math.floor(f.x-cam.x),Y=Math.floor(f.y-cam.y+Math.sin(L.tick*2+f.x*.05)*3);if(X<-12||X>VW+12||Y<-8||Y>VH+8)continue;
    const c=[['#ff9966','#ffffaa'],['#9ad2e0','#ffffff'],['#ff77ff','#ccff99']][f.c%3],d=f.vx>0?1:-1;ctx.fillStyle=c[0];ctx.fillRect(X,Y,6,3);ctx.fillRect(X+(d>0?-2:6),Y,2,1);ctx.fillRect(X+(d>0?-2:6),Y+2,2,1);ctx.fillStyle=c[1];ctx.fillRect(X+(d>0?4:1),Y,1,1);ctx.fillStyle=K;ctx.fillRect(X+(d>0?4:1),Y+1,1,1)}
  {const zn=SURF.zn,t=L.tick;let n=0,col='#ffffff';if(zn==='water'){n=18;col='#d0ffff'}else if(zn==='forest'){n=14;col='#ccff77'}else if(zn==='maze'||zn==='ruins'||zn==='hall'){n=10;col='#ffe8b0'}else if(zn==='void'){n=12;col='#ffffff'}
    for(let i=0;i<n;i++){let X,Y,al;
      if(zn==='water'){X=mod(i*53+Math.sin(t*.8+i)*6-cam.x*.9,VW);Y=mod(i*37-t*(14+i%5*4)-cam.y*.9,VH);al=.5;ctx.fillStyle=col;ctx.globalAlpha=al;ctx.fillRect(X|0,Y|0,2,2);ctx.globalAlpha=.9;ctx.fillStyle='#ffffff';ctx.fillRect((X|0),(Y|0),1,1)}
      else if(zn==='forest'){X=mod(i*61+Math.sin(t*.5+i*2)*22-cam.x*.8,VW);Y=mod(i*43+Math.sin(t*.7+i)*14-cam.y*.8,VH);al=.2+.8*Math.pow(Math.sin(t*2.2+i*1.9),2);ctx.globalAlpha=al;ctx.fillStyle=col;ctx.fillRect(X|0,Y|0,2,2)}
      else if(zn==='void'){X=mod(i*47-t*(10+i%4*6)-cam.x*.5,VW);Y=mod(i*29+t*3-cam.y*.5,VH);ctx.globalAlpha=.3;ctx.fillStyle=col;ctx.fillRect(X|0,Y|0,6+i%3*3,1)}
      else{X=mod(i*71+Math.sin(t*.3+i)*9-cam.x*.7,VW);Y=mod(i*33+t*(3+i%3)-cam.y*.7,VH);ctx.globalAlpha=.35;ctx.fillStyle=col;ctx.fillRect(X|0,Y|0,1,1)}}
    ctx.globalAlpha=1}
  drawCritters();
  /* laser gates */
  for(const gt of (L.gates||[])){for(let j=0;j<gt.h;j++){const X=Math.floor(gt.x*TS-cam.x),Y=Math.floor((gt.y+j)*TS-cam.y);if(gt.on){ctx.drawImage(T.gate[tf],X,Y)}else{ctx.fillStyle=D;ctx.fillRect(X+3,Y,2,8)}}}
  /* wind */
  for(const u of L.ups){ctx.fillStyle=u.c||'#ffffff55';for(let i=0;i<10;i++){const wx=u.x+8+((i*13)%(u.w-8)),wy=u.y+u.h-((L.tick*80+i*37)%u.h);ctx.fillRect((wx-cam.x)|0,(wy-cam.y)|0,1,3)}}
  /* lifts */
  for(const q of L.lifts){const X=Math.floor(q.x-cam.x),Y=Math.floor(q.y-cam.y);if(q.chain){ctx.fillStyle='#8a8a9a';for(let cy=Y-4;cy>Math.floor(q.a-cam.y)-16;cy-=3){ctx.fillRect(X+3,cy,2,2);ctx.fillRect(X+q.w-5,cy,2,2)}ctx.fillStyle=K;ctx.fillRect(X+2,Math.floor(q.a-cam.y)-18,q.w-4,3)}ctx.fillStyle=K;ctx.fillRect(X-1,Y,q.w+2,7);ctx.fillStyle=Wd.plat[0];ctx.fillRect(X,Y,q.w,5);ctx.fillStyle=Wd.plat[1];ctx.fillRect(X,Y,q.w,1);ctx.fillStyle=YL;for(let k=2;k<q.w-2;k+=6)ctx.fillRect(X+k,Y+2,2,1);ctx.fillStyle=D;ctx.fillRect(X+q.w/2-1,Y+5,2,2)}
  /* checkpoints */
  for(const c of L.checks){if(c.x<cam.x-20||c.x>cam.x+VW+20||c.y<cam.y-40||c.y>cam.y+VH+40)continue;const X=Math.floor(c.x-cam.x),Y=Math.floor(c.y-cam.y);ctx.fillStyle=K;ctx.fillRect(X-8,Y-2,16,3);ctx.fillStyle=c.on?CY:GM;ctx.fillRect(X-7,Y-2,14,2);if(c.on){ctx.fillStyle='#9ad2e044';ctx.fillRect(X-5,Y-30,10,28);ctx.fillStyle=WH;for(let i=0;i<4;i++)ctx.fillRect(X-4+((L.tick*30+i*9)%9),Y-4-((L.tick*40+i*11)%26),1,2)}}
  /* the beacon */
  {const e=L.exit,X=Math.floor(e.x-cam.x),Y=Math.floor(e.y-cam.y);ctx.drawImage(A.beacon,X,Y-28);const open=!(SURF.guard&&SURF.guard.hp>0);ctx.fillStyle=open?GREEN[3]:RD;ctx.fillRect(X+8,Y-24+((L.tick*8|0)%2),2,2);
    if(open&&!SURF.done&&Math.abs(p.x-e.x)<24){textC2('PRESS ENTER OR TAP THE BEACON',X+9,Y-38,YL)}}
  /* chests */
  for(const c of L.chests){if(c.gone||c.x<cam.x-16||c.x>cam.x+VW+16||c.y<cam.y-12||c.y>cam.y+VH+12)continue;const im=A.chest[c.open?1:0],cw_=Math.round(im.width*1.3),ch_=Math.round(im.height*1.3);ctx.drawImage(im,Math.floor(c.x-cam.x+7-cw_/2),Math.floor(c.y-cam.y+11-ch_),cw_,ch_)}
  /* ship pieces glow where they lie */
  for(const sp of (L.shipPieces||[])){if(sv().pieces[sp.id])continue;const X=Math.floor(sp.x-cam.x),Y=Math.floor(sp.y-cam.y);if(X<-30||X>VW+30||Y<-30||Y>VH+30)continue;const ic=A.pieceIcons[sp.id],pu=.5+.5*Math.sin(L.tick*3.2),bob=Math.round(Math.sin(L.tick*2.4)*1.5);
    ctx.globalAlpha=.1+.07*pu;ctx.fillStyle='#ffffcc';ctx.fillRect(X-2,Y-60,4,60);ctx.globalAlpha=.08+.06*pu;ctx.fillRect(X-5,Y-60,10,60);
    ctx.globalAlpha=.2+.16*pu;ctx.fillStyle='#ffffaa';ctx.beginPath();ctx.arc(X,Y,22+pu*4,0,TAU);ctx.fill();ctx.globalAlpha=.9;ctx.fillStyle=WH;for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1]])ctx.drawImage(ic.off,X-7+ox,Y-6+bob+oy);ctx.globalAlpha=1;ctx.globalAlpha=.2+.12*pu;ctx.fillStyle=WH;ctx.beginPath();ctx.arc(X,Y,9,0,TAU);ctx.fill();ctx.globalAlpha=1;
    ctx.drawImage(ic.on,X-11,Y-9+bob,ic.w*1.6,ic.h*1.6);const a=L.tick*2.2;for(let k=0;k<4;k++){const aa=a+k*1.57,r=11+3*Math.sin(L.tick*4+k);ctx.fillStyle=k&1?YL:WH;ctx.fillRect(Math.round(X+Math.cos(aa)*r),Math.round(Y+Math.sin(aa)*r*.8),1,1)}
    if(((L.tick*5)|0)%6===0){ctx.fillStyle=WH;ctx.fillRect(X+6,Y-8,1,3);ctx.fillRect(X+5,Y-7,3,1)}}
  /* coins */
  for(const c of L.coins){if(c.x<cam.x-8||c.x>cam.x+VW+8||c.y<cam.y-8||c.y>cam.y+VH+8)continue;const X=Math.floor(c.x-cam.x-3),Y=Math.floor(c.y-cam.y-3+Math.sin(L.tick*4+c.x)*1),w=(Math.floor(L.tick*6+c.x)%4)===0?5:7;if(c.heart){ctx.drawImage(A.fx.heart,X-1,Y-2+Math.round(Math.sin(L.tick*3+c.x)))}else{const cw=Math.max(3,Math.round(10*Math.abs(Math.cos(L.tick*3+c.x*.3))));ctx.drawImage(A.coin,X-1+((10-cw)>>1),Y-1,cw,10)}}
  featWorld();
  /* enemies */
  for(const e of SURF.en){if(e.hp<=0)continue;const fr=A.en[e.k],f=Math.floor(e.t*7)%4,im=(e.shiny&&fr.gd?fr.gd:fr.fr)[f];
    const w=Math.round(im.width*e.sc),h=Math.round(im.height*e.sc),X=Math.floor(e.x+e.w/2-w/2-cam.x),Y=Math.floor(e.y+e.h-h+1-cam.y);
    if(e.x-cam.x>-40&&e.x-cam.x<VW+40){
      ctx.save();ctx.globalAlpha=.7;{const wi=fr.wh[f];if(e.face>0){ctx.translate(X+w,Y);ctx.scale(-1,1);for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1]])ctx.drawImage(wi,ox,oy,w,h);ctx.scale(-1,1);ctx.translate(-(X+w),-Y)}else for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1]])ctx.drawImage(wi,X+ox,Y+oy,w,h)}ctx.restore();
      ctx.save();if(e.face>0){ctx.translate(X+w,Y);ctx.scale(-1,1);ctx.drawImage(im,0,0,w,h);if(e.flash>0){ctx.globalAlpha=.4;ctx.drawImage(fr.wh[f],0,0,w,h)}}else{ctx.drawImage(im,X,Y,w,h);if(e.flash>0){ctx.globalAlpha=.4;ctx.drawImage(fr.wh[f],X,Y,w,h)}}ctx.restore();
      if(e.shiny&&((L.tick*6)|0)%3===0){ctx.fillStyle=WH;ctx.fillRect(X+((e.t*37)|0)%Math.max(2,w),Y+((e.t*23)|0)%Math.max(2,h),1,1)}
      if((e.elite||e.hp<e.mhp)&&!(e.engaged&&(e.guardian||e.lair))){const bw=Math.max(14,e.w);ctx.fillStyle=K;ctx.fillRect(X+w/2-bw/2-1,Y-5,bw+2,4);ctx.fillStyle=e.elite?RD:LG;ctx.fillRect(X+w/2-bw/2,Y-4,Math.max(0,bw*e.hp/e.mhp),2)}
      if(e.st===1&&e.sp.ai==='charger'&&((e.t*16)|0)%2===0){ctx.fillStyle=WH;ctx.fillRect(X+w/2-1,Y-9,3,3)}}}
  /* player */
  if(SURF.darkA>.2&&p.dead<=0&&!p.hidden){ctx.globalAlpha=.5*SURF.darkA;ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.strokeRect(Math.round(p.x-cam.x)-.5,Math.round(p.y-cam.y)-.5,p.w+1,p.h+1);ctx.globalAlpha=1}
  if(p.dead<=0&&!p.hidden&&!L.sky(Math.floor((p.x+5)/TS),Math.floor((p.y+8)/TS))){ctx.globalAlpha=.035;ctx.fillStyle=Wd.glow;for(const r_ of [60,46,34,24]){ctx.beginPath();ctx.arc(Math.round(p.x+5-cam.x),Math.round(p.y+8-cam.y),r_,0,TAU);ctx.fill()}ctx.globalAlpha=1}
  if(p.dead<=0&&!p.hidden){
    /* the same spaceman (and costume) as in the hub */
    const mode=p.lad?'climb':!p.on?(p.vy<0?'jump':'fall'):Math.abs(p.vx)>10?'run':'idle',fi=mode==='climb'?(Math.floor(p.lcl||0)%4+4)%4:mode==='run'?Math.floor(p.anim)%4:0,
      X=Math.floor(p.x+p.w/2-5.5-cam.x+.5),Y=Math.floor(p.y+p.h-15-cam.y),lift=mode==='climb'&&fi%2?-1:0,wc=(typeof wornCostume==='function')?wornCostume():null;
    ctx.save();if(p.inv>0)ctx.globalAlpha=.8+.18*Math.sin(SURF.t*9);
    if(wc&&typeof costumeFrames==='function'){ctx.drawImage(costumeFrames(wc)[p.face<0?'l':'r'][fi],Math.floor(p.x+p.w/2-6.5-cam.x+.5),Math.floor(p.y+p.h-22-cam.y)+lift)}
    else ctx.drawImage((p.face<0?SPR.miniL:SPR.mini)[fi],X,Y+lift);
    if(!p.lad){const gx=p.face>0?X+9:X-2,gy=Y+8;ctx.fillStyle='#000';ctx.fillRect(gx,gy,4,3);ctx.fillStyle='#bbbbbb';ctx.fillRect(gx+(p.face>0?0:1),gy+1,3,1);ctx.fillStyle=CY;ctx.fillRect(gx+(p.face>0?3:0),gy+1,1,1)}
    ctx.restore();
    if(p.thrust){const bx=p.face>0?X:X+8,fy=Y+12,len=5+((SURF.t*45|0)%3)*2;ctx.fillStyle=RD;ctx.fillRect(bx-1,fy,5,2);ctx.fillStyle=OR;ctx.fillRect(bx,fy+1,3,len);ctx.fillStyle=YL;ctx.fillRect(bx+1,fy+1,1,len-2);ctx.fillStyle=WH;ctx.fillRect(bx+1,fy,1,3)}
  }
  /* shots */
  for(const b of SURF.bul){const X=Math.floor(b.x-cam.x),Y=Math.floor(b.y-cam.y);ctx.fillStyle=WH;if(b.vy)ctx.fillRect(X,Y-3,1,6);else ctx.fillRect(X-3,Y,7,1);ctx.fillStyle=CY;if(b.vy)ctx.fillRect(X-1,Y-4,3,2);else ctx.fillRect(X-4,Y-1,2,3)}
  for(const b of SURF.eb){const X=Math.floor(b.x-cam.x),Y=Math.floor(b.y-cam.y);ctx.fillStyle=K;ctx.fillRect(X-2,Y-2,5,5);ctx.fillStyle=b.lob?OR:RD;ctx.fillRect(X-1,Y-1,3,3);ctx.fillStyle=YL;ctx.fillRect(X,Y,1,1)}
  for(const f of SURF.fx){ctx.fillStyle=f.c;ctx.fillRect((f.x-cam.x)|0,(f.y-cam.y)|0,f.s,f.s)}
  for(const t of SURF.txt)text(t.s,(t.x-cam.x)|0,(t.y-cam.y)|0,GREEN[3],1);
  featStrikes();
  /* the ship that brings the astronaut and takes the astronaut home */
  if(SURF.cut){const c=SURF.cut,E=u=>u*u*(3-2*u);let sx,sy,flip=true,beam=false;
    if(c.mode==='in'){if(c.t<1.1){const u=E(c.t/1.1);sx=c.hx+(1-u)*260;sy=c.hy-(1-u)*30}else{const u=E(clamp((c.t-1.5)/1.1,0,1));sx=c.hx+u*280;sy=c.hy-u*40;flip=false;beam=c.t<1.5}}
    else{if(c.t<.9){const u=E(c.t/.9);sx=c.hx+(1-u)*260;sy=c.hy-(1-u)*30}else if(c.t<1.7){sx=c.hx;sy=c.hy;beam=true}else{const u=E(clamp((c.t-1.7)/.9,0,1));sx=c.hx+u*280;sy=c.hy-u*40;flip=false}}
    const im=SPR.shipSets[SAVE.ship||0][0],sc=1.15,w=Math.round(im.width*sc),h=Math.round(im.height*sc),X=Math.round(sx-cam.x),Y=Math.round(sy-cam.y);
    if(beam){ctx.globalAlpha=.55;ctx.fillStyle=CY;ctx.fillRect(X-7,Y+h/2,14,Math.max(0,Math.round(c.mode==='in'?(c.hy+16-sy):(p.y+8-sy))+4));ctx.fillStyle=WH;ctx.fillRect(X-2,Y+h/2,4,Math.max(0,Math.round(c.mode==='in'?(c.hy+16-sy):(p.y+8-sy))+4));ctx.globalAlpha=1}
    ctx.save();ctx.imageSmoothingEnabled=false;if(flip){ctx.translate(X+w/2,Y-h/2);ctx.scale(-1,1);ctx.drawImage(im,0,0,w,h)}else ctx.drawImage(im,X-w/2,Y-h/2,w,h);ctx.restore()}
  /* the old beam column is gone */
  if(false){const b=SURF.beam,k=b.mode==='down'?b.t:1-b.t/.8,X=Math.floor(p.x+5-cam.x),Y=Math.floor(p.y+16-cam.y);ctx.globalAlpha=clamp(b.mode==='down'?b.t:b.t/.8,0,1)*.8;ctx.fillStyle=CY;ctx.fillRect(X-9,Y-200,18,206);ctx.fillStyle=WH;ctx.fillRect(X-3,Y-200,6,206);ctx.globalAlpha=1}
  ctx.restore();
  featOverlay();
  hud();
};
function hud(){
  const p=SURF.p,s=sv(),Wd=SURF.W;
  ctx.fillStyle='#000000cc';ctx.fillRect(0,0,VW,14);
  for(let i=0;i<p.mhp;i++){ctx.fillStyle=i<p.hp?RD:'#444';ctx.fillRect(4+i*7,4,5,6);if(i<p.hp){ctx.fillStyle=WH;ctx.fillRect(4+i*7,4,5,1)}}
  ctx.drawImage(SURF.A.coin,58,3);text('GREEN GOLD '+s.green,68,4,GREEN[3],1);text('+'+SURF.visit,68+textW('GREEN GOLD '+s.green,1)+4,4,GREEN[2],1);
  /* progress along the level */
  ctx.fillStyle='#000000aa';ctx.fillRect(4,VH-8,90,5);ctx.fillStyle=GREEN[1];ctx.fillRect(5,VH-7,Math.round(88*clamp(1-Math.hypot(p.x-SURF.L.exit.x,p.y-SURF.L.exit.y)/(SURF.L.dist0||1),0,1)),3);
  {const A=SURF.A,ids=SURF.pieceIds(SURF.idx),n=SURF.piecesFound(),y=p.fuel!=null&&s.jet?27:17;const lw=textW('PIECES '+n+'/6',1)+9;ctx.fillStyle='#000000aa';ctx.fillRect(4,y-1,lw+ids.length*15+2,13);text('PIECES '+n+'/6',6,y+1,n>=6?GREEN[3]:'#bbbbbb',1);
    ids.forEach((id,k)=>ctx.drawImage(s.pieces[id]?A.pieceIcons[id].on:A.pieceIcons[id].off,lw+k*15,y))}
  if(SURF.msg&&SURF.msg[1]>0){const mw=textW(SURF.msg[0],1)+10;ctx.fillStyle='#000000bb';ctx.fillRect(Math.round((VW-mw)/2),37,mw,11);textC(SURF.msg[0],40,YL,1)}
  if(SURF.intro&&!SURF.cut){const it=SURF.intro,A=SURF.A,ids=SURF.pieceIds(SURF.idx),f=ids.filter(k=>s.pieces[k]).length,n=SURF.piecesFound();
    const wrap=(t,w)=>{const o=[];let cur='';for(const wd of t.split(' ')){if((cur+' '+wd).trim().length>w){o.push(cur);cur=wd}else cur=(cur+' '+wd).trim()}if(cur)o.push(cur);return o};
    const hidden=ids.length===1?'ONE PIECE IS HIDDEN IN THIS LEVEL.':'TWO PIECES ARE HIDDEN IN THIS LEVEL.';
    const status=ids.length===1?(f?'THE PIECE FROM THIS LEVEL IS ALREADY FOUND.':'IT IS NOT FOUND YET.'):(f===2?'BOTH ARE ALREADY FOUND.':f===1?'ONE OF THEM IS FOUND. ONE IS STILL WAITING.':'NEITHER IS FOUND YET. THE SECOND IS THE HARDEST HIDING PLACE OF ALL.');
    let lines=[];if(it.first&&SURF.idx===0)lines=lines.concat(wrap('SIX PIECES OF A LUXURY SPACESHIP ARE HIDDEN IN THE SURFACE WORLDS. FIND ALL SIX TO WIN THE SHIP.',58),['']);
    lines=lines.concat(wrap('SHIP PIECES FOUND: '+n+' OF 6. '+hidden+' '+status,58));
    lines=lines.concat([''],wrap('THIS WORLD ALSO HIDES '+SURF.L.secrets.length+' SECRETS: VAULTS, PUZZLES, LORE AND TREASURE. PRESS E TO USE THINGS. PRESS B FOR THE MENU AND MAP.',58));
    const h=lines.length*9+50,y0=Math.max(18,Math.round((VH-h)/2)-8),al=Math.min(1,it.t*3,(9-it.t)*2);
    ctx.globalAlpha=.9*al;ctx.fillStyle='#05031a';ctx.fillRect(16,y0,VW-32,h);ctx.globalAlpha=al;ctx.fillStyle=YL;ctx.fillRect(16,y0,VW-32,1);ctx.fillRect(16,y0+h-1,VW-32,1);ctx.fillStyle='#352879';ctx.fillRect(16,y0+1,VW-32,9);
    textC('THE SHIP PIECE HUNT',y0+3,YL,1);
    lines.forEach((ln,i)=>textC(ln,y0+14+i*9,i===0||ln.startsWith('SHIP PIECES')?WH:'#ccccee',1));
    const iy=y0+14+lines.length*9+3;for(let k=0;k<6;k++){const ic=A.pieceIcons[k],X=Math.round(VW/2-3*44+k*44+15),got=s.pieces[k],here=ids.includes(k);ctx.drawImage(got?ic.on:ic.off,X,iy);
      textC2(PIECE_NAMES[k],X+7,iy+13,got?GREEN[3]:here?YL:'#6c6c8c');if(here&&!got){ctx.fillStyle=YL;ctx.fillRect(X-1,iy-2,16,1);ctx.fillRect(X-1,iy+12,16,1)}}
    textC('PRESS ANY KEY OR TAP TO CLOSE',y0+h-9,'#8888aa',1);ctx.globalAlpha=1}
  if(SURF.banner){const b=SURF.banner,a=Math.min(1,b.t*2),h=b.lines.length*11+12,y0=54;ctx.globalAlpha=.85*a;ctx.fillStyle=K;ctx.fillRect(20,y0,VW-40,h);ctx.globalAlpha=a;ctx.fillStyle=YL;ctx.fillRect(20,y0,VW-40,1);ctx.fillRect(20,y0+h-1,VW-40,1);b.lines.forEach((ln,i)=>textC(ln,y0+7+i*11,i?WH:YL,1));ctx.globalAlpha=1}
  if(SURF.help>0){ctx.fillStyle='#000000cc';ctx.fillRect(0,VH-40,VW,33);const tch=typeof isTouch!=='undefined'&&isTouch;
    if(tch){textC('TOUCH: < > MOVE   JUMP   FIRE   UP AND DOWN FOR LADDERS',VH-37,WH,1);textC('TAP DOWN ON A THIN PLATFORM TO DROP THROUGH',VH-27,YL,1);textC('MENU AND BEAM UP: TOP RIGHT BUTTON',VH-17,'#9ad2e0',1)}
    else{textC('MOVE: ARROWS OR WASD   JUMP: SPACE   FIRE: X, R OR MOUSE',VH-37,WH,1);textC('MENU: B   USE: E   STUCK: G   LADDERS: W/S   DROP: S+SPACE',VH-27,YL,1);textC('GAMEPAD: A JUMP AND USE   X, B OR RB FIRE   START MENU',VH-17,'#9ad2e0',1)}}
  else if(!(typeof isTouch!=='undefined'&&isTouch)&&SURF.t<7){ctx.fillStyle='#000000cc';ctx.fillRect(0,VH-12,VW,12);textC('FIRE: X, R OR MOUSE   USE: E   MENU: B',VH-9,'#bbbbdd',1)}
  if(s.jet){const f=p.fuel==null?1:p.fuel;ctx.fillStyle='#000000aa';ctx.fillRect(4,16,78,9);text('ROCKET',6,17,YL,1);ctx.fillStyle=K;ctx.fillRect(48,17,32,6);ctx.fillStyle=f>.25?CY:RD;ctx.fillRect(49,18,Math.round(30*f),4);ctx.fillStyle=WH;ctx.fillRect(49,18,Math.round(30*f),1)}
  /* on screen buttons */
  const tb=SURF.touchBtns=[];
  const btn=(id,x,y,w,h,label)=>{tb.push({id,x,y,w,h});ctx.fillStyle=SURF.touch[id]?'#ffffff88':'#00000066';ctx.fillRect(x,y,w,h);ctx.fillStyle='#ffffff55';ctx.fillRect(x,y,w,1);ctx.fillRect(x,y,1,h);textC2(label,x+w/2,y+h/2-2,WH)};
  if(typeof isTouch!=='undefined'&&isTouch){btn('u',31,119,28,26,'UP');btn('l',3,145,28,26,'<');btn('r',59,145,28,26,'>');btn('d',31,171,28,26,'DOWN');btn('j',278,150,38,44,'JUMP');btn('f',236,150,38,44,'FIRE')}   // a proper d-pad on the left, JUMP and FIRE on the right
  if(typeof isTouch!=='undefined'&&isTouch)btn('b',VW-52,16,48,14,'MENU');else tb.push({id:'b',x:VW-80,y:0,w:80,h:14});if(typeof isTouch!=='undefined'&&isTouch&&SURF.near&&!SURF.modal)btn('e',204,152,36,40,'USE');
  featHud();
}
/* touch input: pointers can hold several buttons at once */
function ptIn(e){const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*VW,y=(e.clientY-r.top)/r.height*VH;return[x,y]}
function setTouch(e,down){
  if(MODE!=='surface')return false;
  if(down&&SURF.intro&&SURF.intro.t>.6){SURF.intro=null;return true}
  if(SURF.modal&&down){SURF.mouseFire=false;const [mx,my]=ptIn(e);for(const h of (SURF.mh||[]))if(mx>=h.x&&mx<=h.x+h.w&&my>=h.y&&my<=h.y+h.h){h.fn();break}return true}
  const [x,y]=ptIn(e);let hit=null;
  for(const b of (SURF.touchBtns||[]))if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){hit=b.id;break}
  SURF.tp=SURF.tp||{};
  if(down){if(hit){SURF.tp[e.pointerId]=hit;SURF.touch[hit]=1;if(hit==='b'){delete SURF.touch.b;delete SURF.tp[e.pointerId];if(!SURF.cut)openPause()}else if(hit==='e'){SURF.useReq=true;delete SURF.touch.e;delete SURF.tp[e.pointerId]}}
    else{/* a tap on the beacon completes the level */const L=SURF.L,p=SURF.p;if(L&&L.exit&&Math.abs(p.x-L.exit.x)<26)tryExit();const pr=SURF.promptRect;if(pr&&x>=pr.x&&x<=pr.x+pr.w&&y>=pr.y&&y<=pr.y+pr.h)SURF.useReq=true}}
  else{const id=SURF.tp[e.pointerId];if(id){delete SURF.touch[id];delete SURF.tp[e.pointerId]}}
  return true;
}
cv.addEventListener('pointerdown',e=>{if(MODE==='surface'){e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}if(e.pointerType==='mouse'&&e.button===0)SURF.mouseFire=true;setTouch(e,true)}},true);
cv.addEventListener('pointerup',e=>{if(e.pointerType==='mouse')SURF.mouseFire=false;if(MODE==='surface')setTouch(e,false)},true);
addEventListener('blur',()=>{SURF.mouseFire=false});
cv.addEventListener('pointercancel',e=>{SURF.mouseFire=false;if(MODE==='surface')setTouch(e,false)},true);
cv.addEventListener('pointermove',e=>{if(MODE!=='surface')return;const [x,y]=ptIn(e);const id=SURF.tp&&SURF.tp[e.pointerId];if(!id)return;const b=(SURF.touchBtns||[]).find(q=>q.id===id);if(b&&!(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)){delete SURF.touch[id];delete SURF.tp[e.pointerId]}},true);
SURF.WORLDS=WORLDS;SURF.traceBeam=traceBeam;
/* build the pictures for each world while the player is on the hub screens, one world every few seconds, so a visit starts quickly */
{let pk=0;const pw=()=>{if(pk>=5)return;if(MODE==='surface'||document.hidden){setTimeout(pw,4000);return}try{SURF.assets_(pk)}catch(e){}pk++;setTimeout(pw,3500)};setTimeout(pw,9000)}
SURF.buildMap=buildMapCanvas;
})();
