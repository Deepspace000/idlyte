/* SURFACE TRANSPORTER: a platformer sub game. You control a spacewalker with a laser gun and a big jump.
   Five alien worlds, scrolling sideways, with ground, lifts, stairs, towers and caves above and below the surface.
   Gold found here is GREEN GOLD, a separate currency kept in SAVE.surf.green. Needs packs/big.js for the drawing helpers. */
(function(){
'use strict';
const B=window.BIGKIT,{px,cnv,ell,poly,thick,line,rng,rampAt,fin,mod,clamp}=B;
const TS=8,VW=320,VH=200,PI=Math.PI,TAU=PI*2;
const K='#000000',NV='#1c1840',VI='#352879',BL='#6c5eb5',PU='#6f3d86',LP='#8a5aa6',LV='#cc99ff',mg='#cc44cc',MG='#ff77ff',rd='#9a3a3a',BR='#68372b',TN='#9a6759',OR='#ff9966',YG='#b8c76f',YL='#ffffaa',GR='#588d43',GD='#2c5a2c',LG='#9ad284',PG='#ccff99',cy='#70a4b2',CY='#9ad2e0',D='#444444',GM='#6c6c6c',LM='#959595',LL='#bbbbbb',WH='#ffffff',RD='#ff7777';
const GREEN=['#2c5a2c','#588d43','#9ad284','#ccff99','#ffffff'];   // green gold: its own colour everywhere
const rgb=(a,b)=>a+Math.floor(Math.random()*(b-a+1));

/* ---------------- the five worlds ---------------- */
const WORLDS=[
 {n:'FUNGAL JUNGLE',sub:'GIANT MUSHROOMS, SPRING CAPS AND ROOT CAVES',lw:560,
  sky:['#2a0a5a','#6f3d86',mg,OR],skyY:.55,ridge:[['#4a1a6a','#8a3aa6'],['#8a3aa6','#ff77ff']],
  rock:['#2a0a3a','#6f3d86',mg,MG],topc:['#2c8a2c','#9ad284','#ccff99'],plat:['#cc44cc','#ffffaa'],mush:1,glow:MG,plant:{leaf:['#2c5a2c','#588d43','#9ad284'],fl:[MG,YL,OR],kind:'jungle'},
  en:[
   {id:'sporeling',n:'SPORELING',ai:'walker',kit:'blob',o:{eyes:'cyclops'},pal:[NV,PU,LP,LV,WH],w:14,h:12,hp:2,spd:22,gold:1},
   {id:'puffcap',n:'PUFFCAP',ai:'dropper',kit:'cap',pal:[BR,TN,OR,YL,WH],w:18,h:14,hp:2,spd:16,gold:2,fly:1},
   {id:'vinesnap',n:'VINESNAP',ai:'turret',kit:'turretk',o:{shape:'plant'},pal:['#102010',GD,GR,LG,PG],w:14,h:20,hp:3,cd:2.2,range:130,bul:{n:1,sp:80},gold:2},
   {id:'glowmoth',n:'GLOWMOTH',ai:'flyer',kit:'wing',o:{wing:'moth'},pal:[PU,LP,LV,CY,WH],w:18,h:12,hp:2,spd:34,gold:2,fly:1,shoot:{cd:2.6,sp:70}},
   {id:'shroombrute',n:'SHROOM BRUTE',ai:'charger',kit:'golem',o:{cap:1,fist:4.2,inset:4},pal:[BR,TN,OR,YL,WH],w:22,h:22,hp:8,spd:18,gold:5}]},
 {n:'CRYSTAL DESERT',sub:'RED SAND, CRUMBLING BRIDGES AND CRYSTAL SPIRES',lw:620,
  sky:['#1c5a8a','#70a4b2','#ffffaa','#ffffff'],skyY:.5,ridge:[['#9a3a3a','#ff7777'],['#ff9966','#ffffaa']],
  rock:['#68372b','#9a3a3a',RD,OR],topc:['#ff9966','#ffffaa','#ffffff'],plat:['#9a3a3a','#ffffaa'],crumble:1,glow:CY,plant:{leaf:['#2c5a2c','#9ad284','#ccff99'],fl:[MG,RD,YL],kind:'desert'},
  en:[
   {id:'dunecrab',n:'DUNE SCORPION',ai:'walker',kit:'crab',o:{shape:'scorpion'},pal:['#2a1008',BR,TN,OR,YL],w:18,h:12,hp:3,spd:26,gold:2},
   {id:'sandskipper',n:'SAND SKIPPER',ai:'hopper',kit:'crab',o:{shape:'hopper'},pal:['#2a1008',rd,RD,OR,YL],w:16,h:16,hp:2,spd:50,gold:2},
   {id:'shardturret',n:'SHARD TURRET',ai:'turret',kit:'turretk',o:{shape:'crystal'},pal:[VI,mg,MG,CY,WH],w:14,h:18,hp:4,cd:1.8,range:150,bul:{n:3,sp:80,sd:.35},gold:3},
   {id:'dustwisp',n:'DUST DEVIL',ai:'flyer',kit:'wing',o:{wing:'wisp'},pal:[BR,TN,OR,YL,WH],w:14,h:20,hp:2,spd:62,gold:2,fly:1},
   {id:'crystalgolem',n:'CRYSTAL GOLEM',ai:'charger',kit:'golem',o:{crystal:1,inset:3,fist:2.2},pal:[VI,mg,MG,CY,WH],w:22,h:24,hp:10,spd:20,gold:6}]},
 {n:'DERELICT STARSHIP',sub:'A CRASHED CARGO SHIP, OVERGROWN WITH GLOWING PLANTS',lw:700,ship:1,
  sky:['#0a0630','#1c1840',VI,BL],skyY:.5,ridge:[['#1c1840','#2a1d52'],['#352879','#4a2f86']],
  rock:['#1c2a4a','#3c5a8a','#70a4b2','#ccffff'],wallc:['#060a14','#0a1220','#101a30','#2c4a6a'],topc:['#6c6c6c','#bbbbbb','#ffffaa'],plat:['#6c6c6c','#9ad2e0'],glow:CY,plant:{leaf:['#1b5a3a','#2c8a2c','#9ad284'],fl:[CY,MG,YL],kind:'ship'},
  en:[
   {id:'cargobot',n:'CARGO BOT',ai:'walker',kit:'droid',pal:[D,GM,YG,YL,WH],w:16,h:16,hp:4,spd:26,gold:2},
   {id:'sparkwisp',n:'SPARK WISP',ai:'dropper',kit:'cap',o:{ghost:1},pal:[VI,cy,CY,WH,WH],w:14,h:14,hp:2,spd:26,gold:2,fly:1},
   {id:'ventcrawler',n:'VENT CRAWLER',ai:'hopper',kit:'crab',o:{shape:'spider'},pal:['#102010',GD,LG,PG,YL],w:14,h:12,hp:3,spd:56,gold:2},
   {id:'wallgun',n:'WALL GUN',ai:'turret',kit:'turretk',o:{shape:'pylon'},pal:[D,GM,rd,OR,YL],w:12,h:24,hp:6,cd:1.8,range:150,bul:{n:2,sp:90,sd:.3},gold:3},
   {id:'loadermech',n:'LOADER MECH',ai:'charger',kit:'golem',o:{mech:1,pad:4.6,fist:3.4},pal:[D,GM,OR,YL,WH],w:26,h:28,hp:14,spd:22,gold:8,shoot:{cd:2.6,sp:80}}]},
 {n:'MAGMA CAVERNS',sub:'LAVA POOLS, FALLING ROCKS AND FIRE BEASTS',lw:760,
  sky:['#0a0200','#2a0a08',rd,OR],skyY:.45,ridge:[['#2a0a08','#68372b'],['#68372b','#ff9966']],cavern:1,
  rock:['#2a0a08','#68372b','#9a3a3a','#ff9966'],wallc:['#05010a','#0a0204','#1c0808','#ff9966'],topc:['#ff9966','#ffffaa','#ffffff'],plat:['#444444','#ff9966'],lava:1,glow:YL,plant:{leaf:['#68372b','#ff9966','#ffffaa'],fl:[YL,RD,WH],kind:'magma'},
  en:[
   {id:'lavaslug',n:'LAVA SLUG',ai:'walker',kit:'blob',o:{slug:1},pal:['#2a0a08',rd,OR,YL,WH],w:22,h:10,hp:4,spd:18,gold:2},
   {id:'ashbat',n:'ASH BAT',ai:'flyer',kit:'wing',o:{wing:'bat'},pal:['#1c0808',D,GM,LL,RD],w:26,h:16,hp:3,spd:44,gold:3,fly:1,shoot:{cd:3,sp:75}},
   {id:'emberspitter',n:'EMBER SPITTER',ai:'lobber',kit:'turretk',o:{shape:'spitter'},pal:[BR,rd,OR,YL,WH],w:22,h:20,hp:5,cd:2.4,range:170,gold:3},
   {id:'magmahopper',n:'MAGMA HOPPER',ai:'hopper',kit:'blob',o:{legs:1,angry:1},pal:['#2a0a08',rd,RD,OR,YL],w:14,h:14,hp:4,spd:60,gold:3},
   {id:'obsidianknight',n:'OBSIDIAN KNIGHT',ai:'charger',kit:'golem',o:{knight:1,inset:8,fist:2.4},pal:[K,'#1c1840',VI,BL,RD],w:20,h:26,hp:14,spd:24,gold:8}]},
 {n:'ALIEN MOTHERSHIP',sub:'A LIVING SHIP: SLIME WALLS, EGG POOLS AND A HIVE GUARD',lw:840,ship:1,
  sky:['#0a0630','#352879',mg,CY],skyY:.5,ridge:[['#1c1840','#6c5eb5'],['#6c5eb5','#ff77ff']],
  rock:['#3a0a38','#8a3aa6',mg,MG],wallc:['#100210','#1c0420','#2a0a2a','#8a3aa6'],topc:['#9a3a3a','#ff77ff','#ffffaa'],plat:['#6f3d86','#ffffaa'],glow:PG,plant:{leaf:['#3a0a38','#cc44cc','#ff77ff'],fl:[PG,YL,CY],kind:'hive'},
  en:[
   {id:'hivebug',n:'HIVE BEETLE',ai:'walker',kit:'crab',o:{shape:'beetle'},pal:['#3a0a38',PU,mg,MG,YL],w:18,h:12,hp:5,spd:30,gold:3},
   {id:'stinger',n:'STINGER',ai:'flyer',kit:'wing',o:{wing:'wasp'},pal:['#3a0a38',mg,MG,PG,WH],w:18,h:12,hp:4,spd:40,gold:3,fly:1,shoot:{cd:2,sp:85}},
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
function ellp(g,cx,cy0,rx,ry,pal){ell(g,cx,cy0,rx,ry,pal)}
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
    T.spikeA=[0,1].map(f=>cnv(8,8,g=>{px(g,D,0,6,8,2);let y=5;for(let i=0;i<8;i++){y=clamp(y+((i+f)%3===0?-3:(i+f)%3===1?2:1),1,6);px(g,CY,i,y,1,2);px(g,WH,i,y,1,1)}}));
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
    {r1:GR,r2:GD,r3:LG,run:TN,run2:BR,acc:MG},{r1:'#b8884a',r2:BR,r3:YL,run:OR,run2:BR,acc:YL},{r1:LM,r2:D,r3:WH,run:LL,run2:GM,acc:YL},{r1:'#2a2a2a',r2:K,r3:rd,run:OR,run2:rd,acc:YL},{r1:LV,r2:PU,r3:WH,run:LL,run2:LP,acc:PG}][wi];
   const ladder=top=>cnv(8,8,g=>{
     px(g,LD.r1,0,0,1,8);px(g,LD.r2,1,0,1,8);px(g,LD.r1,6,0,1,8);px(g,LD.r2,7,0,1,8);
     if(wi===0){for(let j=0;j<8;j+=2){px(g,LD.r3,0,j,1,1);px(g,LD.r3,7,j+1,1,1)}px(g,LD.r1,-1,3);px(g,LD.acc,7,6)}
     if(wi===2){px(g,LD.r3,0,0,1,8);px(g,LD.r3,6,0,1,8)}
     if(wi===4){for(const y0 of [0,4]){px(g,LD.r3,0,y0,2,2);px(g,LD.r3,6,y0,2,2)}}
     for(const y0 of [1,5]){px(g,LD.run,1,y0,6,2);px(g,LD.run2,1,y0+1,6,1);px(g,LD.r3,1,y0,6,1);if(wi===3){px(g,YL,2,y0,2,1)}if(wi===4){px(g,LD.run,0,y0,1,2);px(g,LD.run,7,y0,1,2)}}
     if(wi===0)px(g,LD.acc,3,5,1,1);if(wi===1)px(g,K,3,2,1,1);if(wi===2){px(g,LD.acc,1,3,1,1);px(g,LD.acc,6,7,1,1)}
     if(top){px(g,K,0,0,8,1);px(g,LD.run,0,1,8,1);px(g,LD.r3,0,1,8,1);px(g,LD.acc,2,0,1,1);px(g,LD.acc,5,0,1,1)}});
   T.ladder=[ladder(false),ladder(true)];
   const PL=[{hi:PG,top:LG,mid:GR,m2:BR,low:TN,dk:'#2a0a2a'},{hi:YL,top:'#ffffcc',mid:OR,m2:RD,low:rd,dk:BR},{hi:LL,top:LM,mid:GM,m2:D,low:D,dk:K},{hi:OR,top:'#2a2a2a',mid:'#1c0808',m2:'#2a0a08',low:'#1c0808',dk:rd},{hi:LV,top:LP,mid:PU,m2:'#3a0a38',low:'#3a0a38',dk:K}][wi];
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
   if(wi!==2){const SP=[[VI,mg,MG,WH],[BL,cy,CY,WH],0,[rd,OR,YL,WH],[PU,LV,LL,WH]][wi];
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
function mkDecor(W_,idx){
  const out=[],r=rng(55+idx);
  if(idx===0)for(let i=0;i<4;i++){const h=18+((r()*24)|0);out.push(cnv(28,h+14,g=>{thick(g,[BL,PU,LP][i%3],14,h+14,14,12,5);ell(g,14,10,13,9,[VI,PU,LP,[LV,MG,PG,OR][i%4],WH]);for(let k=0;k<4;k++)px(g,WH,6+k*5,6+(k%2)*3,2,2)}))}
  else if(idx===1)for(let i=0;i<4;i++){const h=26+((r()*30)|0);out.push(cnv(20,h,g=>{poly(g,[[2,h],[10,0],[18,h]],[VI,mg,MG,WH]);poly(g,[[0,h],[4,h*.5],[8,h]],[VI,mg,MG])}))}
  else if(idx===2)for(let i=0;i<4;i++){const w=40+((r()*40)|0);out.push(cnv(w,26,g=>{poly(g,[[0,8],[w,8],[w*.8,24],[w*.2,20]],[BR,TN,OR,'#b8884a']);px(g,GR,0,6,w,3);px(g,LG,0,6,w,1);for(let k=0;k<5;k++)px(g,WH,4+k*8,5,2,2)}))}
  else if(idx===3)for(let i=0;i<3;i++){const h=40+((r()*30)|0);out.push(cnv(60,h,g=>{poly(g,[[0,h],[26,0],[34,0],[60,h]],['#1c0808','#3a1a14',BR,rd]);px(g,OR,27,0,6,3);px(g,YL,29,0,2,2);for(let k=0;k<5;k++)px(g,rd,10+k*8,h*.5+(k%2)*4,2,6)}))}
  else for(let i=0;i<4;i++){const h=30+((r()*36)|0);out.push(cnv(24,h,g=>{poly(g,[[2,h],[2,6],[8,0],[18,6],[22,h]],['#0a0630','#1c1840',VI,BL]);for(let k=0;k<6;k++)px(g,k%2?mg:cy,5+(k%3)*5,6+k*((h-10)/6),2,2)}))}
  return out;
}

/* ---------------- level generation ---------------- */
function genLevel(idx){
  const Wd=WORLDS[idx],Pm=PARAM[idx],R=rng(9100+idx*977),rn=(a,b)=>a+Math.floor(R()*(b-a+1));
  const LW=Wd.lw,LH=64,SURF=20,g=new Uint8Array(LW*LH);
  const L={idx,LW,LH,g,lifts:[],coins:[],chests:[],spawns:[],checks:[],ups:[],springs:[],exit:null,bgRow:new Int16Array(LW),crum:{},tick:0};
  const S=(x,y,t)=>{if(x>=0&&x<LW&&y>=0&&y<LH)g[y*LW+x]=t};
  const rect=(x,y,w,h,t)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)S(x+i,y+j,t)};
  const top=new Int16Array(LW).fill(SURF),floorAt=new Int16Array(LW);       // top: surface row of each column, or -1 over a chasm
  const feats=[],cavezones=[],plats=[];
  let x=0,cyc=SURF;
  const flat=n=>{for(let i=0;i<n&&x<LW-30;i++)top[x++]=cyc};
  /* the level is a run of sections, each with its own mix of terrain, so it never repeats for long */
  const SECW={open:{flat:2,stairs:2,hill:2,mound:4,springs:5,floaters:1,tower:1,spikes:1,dropoff:1},maze:{cavezone:6,flat:1,mound:1,hill:1},
    chasm:{gap:2,floaters:3,liftgap:3,bridge:4,crumble:2,lava:3,updraft:2,gates:2,flat:1},climb:{ladderwall:4,cliff:3,tower:3,mezz:3,stairs:2,hill:2,dropoff:2,springs:3,flat:1},
    hazard:{spikes:4,gates:3,gap:2,crumble:2,lava:2,flat:1,floaters:1,bridge:2},nook:{nook:4,flat:1,mound:2,hill:1,spikes:1},final:{flat:3,tower:2,stairs:1,mound:1}};
  const NEWK={bridge:1,spikes:1,ladderwall:1,nook:1,dropoff:1,secretzone:1};
  const secKinds={};for(const t in SECW){const o={};for(const k in SECW[t])if(k in Pm.wt||NEWK[k]||k==='flat'||k==='stairs')o[k]=SECW[t][k];secKinds[t]=Object.entries(o)}
  const nSec=Math.max(6,Math.round((LW-100)/80)),finalX=LW-34-64,secLen=(finalX-14)/nSec,order=['open'];
  {const base=['chasm','maze','climb','hazard','nook'];while(order.length<nSec){const b=base.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[b[i],b[j]]=[b[j],b[i]]}for(const t of b){if(order.length<nSec&&t!==order[order.length-1])order.push(t)}}}
  L.sections=order;L.secLen=secLen;L.kinds=[];
  const pickW=()=>{const e=secKinds[x>=finalX?'final':order[Math.min(nSec-1,Math.max(0,Math.floor((x-14)/secLen)))]],t=e.reduce((s,q)=>s+q[1],0);let v=R()*t;for(const [k,w] of e){v-=w;if(v<=0)return k}return 'flat'};
  const ladders=[],nooks=[],mezzR=[];let secretAt=null;
  const coinArc=(x0,y0,n,hgt)=>{for(let i=0;i<n;i++)L.coins.push({x:(x0+i)*TS+4,y:(y0-Math.sin(i/(n-1||1)*PI)*hgt)*TS,v:1})};
  const spawn=(type,sx,sy)=>L.spawns.push({type,x:sx,y:sy,t:0,e:null});
  const groundSpawns=(x0,n,y)=>{const c=Math.max(0,Math.round(n/9*Pm.dens));for(let k=0;k<c;k++){const sx=x0+2+Math.floor(R()*(n-4)),t=R();spawn(t<.4?0:t<.6?3:t<.8?1:t<.95?2:4,sx*TS,y*TS)}};
  /* the start */
  flat(14);L.start={x:3*TS,y:(SURF-2)*TS};L.checks.push({x:5*TS,y:SURF*TS,on:0});
  let lastCheck=5,dryDir=1;
  while(x<LW-34){
    let kind=pickW();const x0=x;if(idx===0&&!secretAt&&x>LW*.48&&x<LW-150)kind='secretzone';L.kinds.push({k:kind,x:x0});
    if(kind==='flat'){const n=rn(6,12);flat(n);groundSpawns(x0,n,cyc-1);
      if(!Wd.ship&&!Wd.cavern&&n>=9&&R()<.6){feats.push({x:x0+2,y:cyc-6,t:1,w:n-4,h:2});for(let i=x0+3;i<x0+n-3;i+=2)L.coins.push({x:i*TS+4,y:(cyc-8)*TS,v:1})}}
    else if(kind==='stairs'||kind==='hill'){
      const up=kind==='hill'||(R()<.5&&cyc>13),st=rn(3,6),sw=rn(2,3);
      for(let s=0;s<st&&x<LW-34;s++){cyc+=up?-1:1;cyc=clamp(cyc,11,26);for(let k=0;k<sw;k++)top[x++]=cyc}
      if(kind==='hill'){flat(rn(4,7));for(let s=0;s<st&&x<LW-34;s++){cyc+=1;cyc=clamp(cyc,11,26);for(let k=0;k<sw;k++)top[x++]=cyc}}
      groundSpawns(x0,x-x0,cyc-1);
    }
    else if(kind==='gap'||kind==='crumble'||kind==='lava'){
      const n=kind==='gap'?rn(3,Pm.gapMax):rn(8,14),fl=cyc+9;
      const gx=x;for(let i=0;i<n;i++){top[x++]=-1;floorAt[x-1]=fl}
      if(kind==='crumble'){for(let i=0;i<n;i++)feats.push({x:gx+i,y:cyc,t:6})}
      else if(kind==='lava'){for(let i=0;i<n;i++)feats.push({x:gx+i,y:fl-1,t:4});for(let i=1;i<n-1;i+=4)plats.push({x:gx+i,y:cyc-1+(i%3===0?-1:0),w:3})}
      else{for(let i=0;i<n;i++)feats.push({x:gx+i,y:fl-1,t:Wd.lava?4:3});coinArc(gx,cyc-2,n,3)}
      flat(2);
    }
    else if(kind==='floaters'||kind==='liftgap'||kind==='gates'||kind==='updraft'){
      const n=kind==='floaters'?rn(16,24):rn(18,26),fl=cyc+12,gx=x;
      for(let i=0;i<n;i++){top[x++]=-1;floorAt[x-1]=fl}
      for(let i=0;i<n;i++)feats.push({x:gx+i,y:fl-1,t:3});
      if(kind==='floaters'||kind==='gates'){let px0=gx+1,py=cyc;while(px0<gx+n-3){const w=rn(3,5);plats.push({x:px0,y:py,w});coinArc(px0,py-2,w,1);if(R()<.4)spawn(rn(0,1)?3:1,px0*TS+8,(py-2)*TS);px0+=w+rn(3,4);py=clamp(py+rn(-2,2),cyc-4,cyc+3)}
        plats.push({x:gx+n-4,y:cyc,w:3});
        if(kind==='gates')for(let i=gx+3;i<gx+n-3;i+=7)L.gates=(L.gates||[]).concat([{x:i,y:cyc-7,h:6}])}
      else if(kind==='liftgap'){L.lifts.push({x:gx*TS+4,y:(cyc)*TS-2,w:24,axis:'h',a:gx*TS+4,b:(gx+n-3)*TS,sp:34,ph:R()*6});coinArc(gx,cyc-3,n,2)}
      else{L.ups.push({x:(gx+Math.floor(n/2)-2)*TS,y:(cyc-(Wd.ship?9:14))*TS,w:5*TS,h:((Wd.ship?9:14)+12)*TS});plats.push({x:gx+Math.floor(n/2)-3,y:cyc-(Wd.ship?9:14),w:7});plats.push({x:gx+1,y:cyc,w:3});plats.push({x:gx+n-4,y:cyc,w:3});L.chests.push({x:(gx+Math.floor(n/2))*TS,y:(cyc-(Wd.ship?10:15))*TS,open:0,v:6+idx*3})}
      flat(2);
    }
    else if(kind==='springs'){
      const n=rn(10,16),gx=x;for(let i=0;i<n;i++)top[x++]=cyc;
      feats.push({x:gx+2,y:cyc,t:5});plats.push({x:gx+4,y:cyc-9,w:5},{x:gx+9,y:cyc-14,w:4});L.chests.push({x:(gx+10)*TS,y:(cyc-15)*TS,open:0,v:5+idx*3});groundSpawns(gx,n,cyc-1);
    }
    else if(kind==='cliff'&&cyc<15){flat(5);cyc=Math.min(27,cyc+rn(6,10));flat(rn(6,10));groundSpawns(x0+4,x-x0-4,cyc-1)}
    else if(kind==='cliff'){
      const hgt=rn(8,12),bx=x;flat(6);
      const nc=clamp(cyc-hgt,8,30);L.lifts.push({x:(bx+3)*TS,y:cyc*TS,w:24,axis:'v',a:(nc)*TS,b:cyc*TS,sp:30,ph:R()*6});
      const od=cyc;cyc=nc;L.cliffs=(L.cliffs||[]).concat([{x:bx+4,from:od,to:nc}]);
      for(let i=0;i<4;i++)top[x++]=cyc;
      flat(rn(4,8));groundSpawns(x0+4,x-x0-4,cyc-1);
    }
    else if(kind==='tower'){
      const n=rn(10,14),tx=x+Math.floor(n/2)-2,th=Wd.ship||Wd.cavern?rn(6,9):rn(9,13);for(let i=0;i<n;i++)top[x++]=cyc;
      feats.push({x:tx,y:cyc-th,t:1,w:4,h:th});
      let py=cyc-3,side=0;for(;;){plats.push({x:side?tx-8:tx-4,y:py,w:4});if(py<=cyc-th+3)break;py-=3;side^=1}
      L.chests.push({x:(tx+1)*TS,y:(cyc-th)*TS-10,open:0,v:5+idx*3});spawn(2,(tx+2)*TS,(cyc-th-1)*TS);groundSpawns(tx-6,14,cyc-1);
    }
    else if(kind==='mound'){
      const n=rn(14,22),hgt=rn(4,8);for(let i=0;i<n&&x<LW-34;i++)top[x++]=cyc-Math.round(hgt*Math.sin(i/(n-1)*PI));
      groundSpawns(x0,x-x0,cyc-hgt-1);
    }
    else if(kind==='mezz'){
      const n=rn(26,34),gx=x;for(let i=0;i<n;i++)top[x++]=cyc;mezzR.push([gx,gx+n]);
      for(let k=0;k<7;k++)feats.push({x:gx+2+k*2,y:cyc-1-k,t:1,w:2,h:k+1});
      feats.push({x:gx+16,y:cyc-8,t:1,w:n-18,h:2});
      for(let i=gx+18;i<gx+n-3;i+=3)L.coins.push({x:i*TS+4,y:(cyc-10)*TS,v:1});
      L.chests.push({x:(gx+n-8)*TS,y:(cyc-8)*TS-10,open:0,v:5+idx*3});spawn(R()<.5?0:3,(gx+22)*TS,(cyc-9)*TS);groundSpawns(gx+14,n-16,cyc-1);
    }
    else if(kind==='cavezone'){
      const n=rn(38,52),zx=x;for(let i=0;i<n;i++)top[x++]=cyc;cavezones.push({x:zx,n,s:cyc,deep:idx>=1&&cyc<=24&&R()<.5});groundSpawns(zx,n,cyc-1);
    }
    else if(kind==='bridge'){
      const n=rn(14,22),fl=cyc+11,gx=x;for(let i=0;i<n;i++){top[x++]=-1;floorAt[x-1]=fl}
      for(let i=0;i<n;i++)feats.push({x:gx+i,y:fl-1,t:Wd.lava?4:3});
      for(let i=1;i<n-1;){const run=rn(4,8);for(let k=0;k<run&&i<n-1;k++,i++)plats.push({x:gx+i,y:cyc,w:1,c:Wd.crumble&&R()<.4});i+=rn(2,3)}
      for(let i=2;i<n-2;i+=4)L.coins.push({x:(gx+i)*TS+4,y:(cyc-3)*TS,v:1});
      spawn(3,(gx+Math.floor(n/2))*TS,(cyc-4)*TS);if(n>18)spawn(1,(gx+4)*TS,(cyc-4)*TS);
      flat(2);
    }
    else if(kind==='spikes'){
      const n=rn(18,28),gx=x;for(let i=0;i<n;i++)top[x++]=cyc;
      for(let i=4;i<n-5;i+=rn(4,7)){const w=rn(2,3);for(let k=0;k<w;k++)feats.push({x:gx+i+k,y:cyc-1,t:3});coinArc(gx+i-1,cyc-2,w+2,3);i+=w}
      groundSpawns(gx,n,cyc-1);
    }
    else if(kind==='ladderwall'&&cyc>=19){
      const hgt=rn(9,14),nc=clamp(cyc-hgt,9,30);flat(5);const lx=x-1,od=cyc;cyc=nc;
      ladders.push({x:lx,y0:nc,y1:od-1});for(let i=0;i<4;i++)top[x++]=cyc;
      flat(rn(5,9));groundSpawns(x0+4,x-x0-4,cyc-1);if(R()<.5)L.chests.push({x:(lx+2)*TS,y:cyc*TS-10,open:0,v:4+idx*2});
    }
    else if(kind==='ladderwall'||kind==='dropoff'){
      flat(5);const hgt=rn(6,11);cyc=Math.min(27,cyc+hgt);flat(rn(6,10));groundSpawns(x0+4,x-x0-4,cyc-1);
    }
    else if(kind==='nook'){
      const n=rn(16,22),gx=x;for(let i=0;i<n;i++)top[x++]=cyc;groundSpawns(gx,n,cyc-1);nooks.push({x:gx+Math.floor(n/2),s:cyc});
    }
    else if(kind==='secretzone'){
      const n=28,gx=x;for(let i=0;i<n;i++)top[x++]=cyc;secretAt={x:gx+14,s:cyc};groundSpawns(gx,n,cyc-1);
    }
    /* a beam pad every so often on flat ground */
    if(x-lastCheck>46&&x<LW-40&&top[x-1]===cyc&&top[x-3]===cyc){L.checks.push({x:(x-2)*TS,y:cyc*TS,on:0});lastCheck=x}
  }
  /* the end: flat ground and the beacon */
  for(;x<LW;x++)top[x]=cyc;
  L.exit={x:(LW-14)*TS,y:cyc*TS,open:0};L.endRow=cyc;
  /* fill the ground */
  for(let cx=0;cx<LW;cx++){
    if(top[cx]>=0){for(let y=top[cx];y<LH;y++)S(cx,y,y===top[cx]?1:1);L.bgRow[cx]=top[cx]}
    else{for(let y=floorAt[cx];y<LH;y++)S(cx,y,1);L.bgRow[cx]=floorAt[cx]}
  }
  if(Wd.ship||Wd.cavern){   // the hull or the cavern roof, with walls at both ends
    const nzr=B.mkNoise(120+idx);let lastTop=SURF;const lt=new Int16Array(LW);for(let cx=0;cx<LW;cx++){if(top[cx]>=0)lastTop=top[cx];lt[cx]=lastTop}
    const tmin=cx=>{let m=99;for(let i=-12;i<=12;i++){const c=cx+i;if(c>=0&&c<LW&&lt[c]<m)m=lt[c]}return m};
    for(let cx=0;cx<LW;cx++){const hh=Wd.ship?14:13+Math.round(nzr.fbm(cx*.06,5,2)*9),ce=tmin(cx)-hh;for(let y=0;y<=ce;y++)S(cx,y,1);
      if(Wd.cavern&&cx>20&&R()<.22){const sl=rn(1,4);for(let j=1;j<=sl;j++)S(cx,ce+j,1)}}   // stalactites
    for(let y=0;y<LH;y++){S(0,y,1);S(1,y,1);S(LW-1,y,1);S(LW-2,y,1)}
    L.ceiling=true;
  }
  for(const f of feats){if(f.w){rect(f.x,f.y,f.w,f.h,1)}else S(f.x,f.y,f.t)}
  for(const p of plats)for(let i=0;i<p.w;i++)if(T0(g,LW,LH,p.x+i,p.y)===0)S(p.x+i,p.y,p.c?6:2);
  if(Wd.ship){for(let cx=34;cx<LW-40;cx+=rn(26,40)){let flat=true;for(let i=-3;i<=5;i++)if(top[cx+i]!==top[cx]||top[cx+i]<0)flat=false;
      if(!flat||mezzR.some(r=>cx>=r[0]-2&&cx<=r[1]+2))continue;let ce=0;while(ce<LH&&g[ce*LW+cx]===1&&ce<top[cx]-3)ce++;rect(cx,ce,2,(top[cx]-5)-ce,1);rect(cx-1,top[cx]-6,4,1,1);L.coins.push({x:(cx+1)*TS,y:(top[cx]-3)*TS,v:1})}}
  /* caves under the flat zones, each with a lift in the shaft at both ends */
  for(const z of cavezones){
    const s=z.s,t1=s+(z.deep?12:8),x1=z.x+1,x2=z.x+z.n-2;
    rect(x1,t1,x2-x1,5,0);                                    // the tunnel
    for(let cx=x1;cx<x2;cx++)L.bgRow[cx]=Math.min(L.bgRow[cx],s+1);
    const shaft=(sx,rowTop,rowBot)=>{rect(sx,rowTop,3,rowBot-rowTop,0);L.lifts.push({x:sx*TS-4,y:rowBot*TS,w:32,axis:'v',a:rowTop*TS,b:rowBot*TS,sp:26,ph:R()*6})};
    shaft(z.x+3,s,t1+5);shaft(z.x+z.n-6,s,t1+5);
    /* pillars, ledges and spikes inside */
    for(let cx=x1+8;cx<x2-8;cx+=rn(7,10)){const qq=R();if(qq<.35){rect(cx,t1+3,2,2,1)}else if(qq<.6){rect(cx,t1,2,2,1)}else{for(let i=0;i<3;i++)S(cx+i,t1+2,2)}if(R()<.4&&idx>0)S(cx+4,t1+4,3)}
    for(let cx=x1+10;cx<x2-10;cx+=rn(6,9))L.coins.push({x:cx*TS+4,y:(t1+3)*TS,v:1},{x:(cx+1)*TS+4,y:(t1+3)*TS,v:1});
    const nest=Math.round(Pm.dens*3);for(let k=0;k<nest;k++){const sx=rn(x1+10,x2-10);spawn([0,3,4,1][k%4],sx*TS,(t1+3)*TS)}
    L.chests.push({x:(x2-3)*TS,y:(t1+4)*TS,open:0,v:6+idx*3});
    if(idx>=2&&z.n>44){   // a second level of tunnel, reached by a lift in the floor of the first
      const t2=t1+13,mid=Math.floor((x1+x2)/2);
      rect(x1+4,t2,x2-x1-8,5,0);shaft(mid,t1+5,t2+5);
      for(let cx=x1+9;cx<x2-9;cx+=rn(6,9))L.coins.push({x:cx*TS+4,y:(t2+3)*TS,v:2});
      for(let k=0;k<Pm.caves;k++){spawn([4,2,3,0][k%4],rn(x1+8,x2-8)*TS,(t2+3)*TS)}
      L.chests.push({x:(x2-6)*TS,y:(t2+4)*TS,open:0,v:12+idx*4});
    }
  }
  if(Wd.ship){for(let cx=28;cx<LW-36;cx+=rn(8,14)){let ok=true;const len=rn(8,14);for(let i=0;i<len;i++)if(top[cx+i]<0||top[cx+i]!==top[cx])ok=false;
      if(!ok)continue;const y1=top[cx]-5;for(let i=0;i<len;i++)if(T0(g,LW,LH,cx+i,y1)===0)S(cx+i,y1,2);for(let i=2;i<len-2;i+=3)L.coins.push({x:(cx+i)*TS+4,y:(y1-2)*TS,v:1});
      if(R()<.5)spawn([0,3,1][rn(0,2)],(cx+3)*TS,(y1-1)*TS)}}
  /* ladders up cliffs, secret nooks (a narrow shaft down to a hidden room) and the jetpack chamber */
  for(const ld of ladders)for(let yy=ld.y0;yy<=ld.y1;yy++){const t=T0(g,LW,LH,ld.x,yy);if(t===0||t===2)S(ld.x,yy,7)}
  for(const nk of nooks){const cx=nk.x,s0=nk.s,dep=rn(7,11),w=rn(8,11),x0n=cx-Math.floor(w/2);
    rect(cx,s0,2,dep,0);rect(x0n,s0+dep,w,4,0);
    for(let i=1;i<w-1;i+=2)L.coins.push({x:(x0n+i)*TS+4,y:(s0+dep+3)*TS,v:1+(idx>>1)});
    L.chests.push({x:(x0n+w-3)*TS,y:(s0+dep+4)*TS-10,open:0,v:8+idx*3});
    if(R()<.6)spawn([0,3,1][rn(0,2)],(x0n+2)*TS,(s0+dep+3)*TS)}
  if(secretAt){const cx=secretAt.x,s0=secretAt.s,dep=12;
    rect(cx,s0,2,dep,0);rect(cx-13,s0+dep,28,5,0);
    for(let i=0;i<5;i++)S(cx-7+i*3,s0+dep+2,2);
    L.jet={x:(cx-11)*TS+4,y:(s0+dep+4)*TS-12};
    L.chests.push({x:(cx+9)*TS,y:(s0+dep+5)*TS-10,open:0,v:14});
    for(let i=0;i<8;i++)L.coins.push({x:(cx-8+i*2)*TS+4,y:(s0+dep+4)*TS-4,v:2});
    spawn(0,(cx+4)*TS,(s0+dep+4)*TS);spawn(3,(cx-3)*TS,(s0+dep+4)*TS)}
  /* swiss cheese: round holes through the ground, tunnels between them, and pits and shafts you can climb out of */
  {const blobs=[],nb=Math.floor(LW/1.9);
    const nzc=B.mkNoise(70+idx);
    for(let k=0;k<nb;k++){
      const cx=rn(12,LW-14),rx=rn(2,6),ry=rn(2,5);let ok=true;
      for(let i=-rx-2;i<=rx+2;i++){const c=cx+i;if(c<0||c>=LW||top[c]<0||Math.abs(top[c]-top[cx])>3){ok=false;break}}
      if(!ok)continue;
      const s=top[cx],cyb=s+rn(4,26);if(cyb+ry+3>=LH-2)continue;
      let bad=false;for(const z of cavezones)if(cx+rx+3>z.x&&cx-rx-3<z.x+z.n&&cyb+ry>z.s+5)bad=true;
      if(bad||cx<22||cx>LW-26)continue;
      for(let j=-ry-1;j<=ry+1;j++)for(let i=-rx-1;i<=rx+1;i++){const d=(i*i)/(rx*rx)+(j*j)/(ry*ry)+(nzc.vn(cx+i*.7,cyb+j*.7)-.5)*.5;if(d<1&&T0(g,LW,LH,cx+i,cyb+j)===1)S(cx+i,cyb+j,0)}
      blobs.push({cx,cy:cyb,rx,ry,s});
    }
    /* tunnels between near neighbours */
    for(let i=1;i<blobs.length;i++){const a=blobs[i-1],b=blobs[i];if(Math.abs(a.cx-b.cx)<24&&Math.abs(a.cy-b.cy)<9&&R()<.65){
      const x0b=Math.min(a.cx,b.cx),x1b=Math.max(a.cx,b.cx);let okt=true;for(let c=x0b;c<=x1b;c++)if(top[c]<0)okt=false;
      if(okt){rect(x0b,a.cy,x1b-x0b+1,2,0);const y0b=Math.min(a.cy,b.cy),y1b=Math.max(a.cy,b.cy);rect(b.cx,y0b,2,y1b-y0b+2,0)}}}
    /* pits and shafts you can climb out of: ledges every few rows, coins and sometimes a chest at the bottom */
    for(const b of blobs){
      const depth=b.cy-b.ry-b.s;
      if(R()<.38&&depth<=13){
        rect(b.cx-1,b.s,3,depth+1,0);
        let sideL=0;for(let y=b.s+3;y<b.cy-b.ry+1;y+=4){S(b.cx+(sideL?-1:0),y,2);S(b.cx+(sideL?0:1),y,2);sideL^=1}
        for(let i=0;i<3+rn(0,3);i++)L.coins.push({x:(b.cx+rn(-b.rx+1,b.rx-1))*TS+4,y:(b.cy+b.ry-1)*TS,v:1});
        if(R()<.3)L.chests.push({x:(b.cx)*TS,y:(b.cy+b.ry)*TS-10,open:0,v:4+idx*2});
        if(R()<.5)spawn([0,3,1][rn(0,2)],b.cx*TS,(b.cy+b.ry-1)*TS);
      }
    }
    /* small craters in the surface */
    for(let c=26;c<LW-30;c+=rn(7,13)){if(top[c]>=0&&top[c+4]===top[c]&&top[c-2]===top[c]&&R()<.8){const rx=rn(2,4),ry=rn(2,4);let clear=true;for(let i=-rx-1;i<=rx+1;i++)if(T0(g,LW,LH,c+i,top[c]-1)!==0||T0(g,LW,LH,c+i,top[c])!==1)clear=false;if(!clear)continue;for(let j=-1;j<=ry;j++)for(let i=-rx;i<=rx;i++){const d=(i*i)/(rx*rx)+(j*j)/(ry*ry)+(nzc.vn(c+i*.8,top[c]+j*.8)-.5)*.6;if(d<1&&T0(g,LW,LH,c+i,top[c]+j)===1)S(c+i,top[c]+j,0)}}}
  }
  /* coins along the ground, on the surface */
  for(let cx=16;cx<LW-30;cx+=rn(6,12))if(top[cx]>=0&&R()<.8)L.coins.push({x:cx*TS+4,y:(top[cx]-2)*TS,v:1});
  fixTraps(L);
  /* the guardian at the end */
  L.guardian={x:(LW-20)*TS,y:(cyc-1)*TS};
  L.top=top;L.cave=cavezones;
  return L;
}

/* ---------------- reachability: can the astronaut always get out of anywhere they can fall into? ---------------- */
/* A cell graph. A node is a cell where the astronaut can stand (two cells of air with support below) or hang on a ladder.
   Edges: walking, a one tile step up, falling, jumping (clear L shaped path, up to 5 rows up), ladders, lift ends and springs. */
function analyzeLevel(L){
  const LW=L.LW,LH=L.LH,g=L.g,N=LW*LH;
  const T=(x,y)=>x<0||x>=LW?1:y<0?0:y>=LH?1:g[y*LW+x];
  const pa=(x,y)=>{const t=T(x,y);return t===0||t===2||t===7};
  const virt=new Uint8Array(N),lad=new Uint8Array(N),st=new Uint8Array(N);
  for(const q of L.lifts){
    if(q.axis==='v'){const r0=Math.ceil(q.a/TS)-1,r1=Math.ceil(q.b/TS)-1;
      for(let c=Math.floor(q.x/TS);c<=Math.floor((q.x+q.w-1)/TS);c++){if(c<0||c>=LW)continue;virt[r0*LW+c]=virt[r1*LW+c]=1}}
    else{const r=Math.ceil(q.y/TS)-1;for(const px_ of [q.a,q.b])for(let c=Math.floor(px_/TS);c<=Math.floor((px_+q.w-1)/TS);c++){if(c>=0&&c<LW)virt[r*LW+c]=1}}}
  for(const u of L.ups)for(let y=Math.floor(u.y/TS);y<Math.floor((u.y+u.h)/TS);y++)for(let x=Math.floor(u.x/TS);x<Math.floor((u.x+u.w)/TS);x++)if(x>=0&&x<LW&&y>=0&&y<LH&&pa(x,y))lad[y*LW+x]=1;
  const sup=(x,y)=>{const t=T(x,y);return t===1||t===2||t===5||t===6||(t===7&&T(x,y-1)!==7)};
  for(let y=2;y<LH-1;y++)for(let x=0;x<LW;x++){const i=y*LW+x;
    if(T(x,y)===7)lad[i]=1;
    if(pa(x,y)&&pa(x,y-1)&&(sup(x,y+1)||virt[i]))st[i]=1}
  const node=i=>st[i]||lad[i];
  const out=new Map(),inn=new Map(),add=(a,b)=>{if(a===b)return;let o=out.get(a);if(!o)out.set(a,o=[]);o.push(b);let n=inn.get(b);if(!n)inn.set(b,n=[]);n.push(a)};
  const fall=(x2,y,from)=>{for(let r=y;r<LH-1;r++){if(!pa(x2,r))return;if(st[r*LW+x2]){add(from,r*LW+x2);return}}};
  for(let y=2;y<LH-1;y++)for(let x=0;x<LW;x++){
    const i=y*LW+x;if(!node(i))continue;
    if(st[i]||lad[i]){   // moving sideways works from any node
      for(const d of [-1,1]){const x2=x+d;if(x2<0||x2>=LW)continue;const j=y*LW+x2;
        if(node(j)&&pa(x2,y))add(i,j);
        else if(st[i]&&st[j-LW]&&pa(x,y-2))add(i,j-LW);
        else if(pa(x2,y)&&pa(x2,y-1))fall(x2,y,i)}}
    if(lad[i]){const iu=i-LW,id=i+LW;if(y>2&&node(iu)&&pa(x,y-1))add(i,iu);if(node(id)&&pa(x,y+1))add(i,id)}
    if(st[i]&&T(x,y)!==7&&T(x,y+1)===7){add(i,i+LW)}
    if(!st[i])continue;
    const sp=T(x,y+1)===5,rise=sp?14:6;
    for(let dy=-12;dy<=rise;dy++){const y2=y-dy;if(y2<2||y2>=LH-1)continue;
      const dxm=dy>=0?(sp?7:[7,7,6,5,4,3,3][Math.min(dy,6)]):Math.min(8,7+Math.floor(-dy*.34));
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
    const lip=c([PG,LG,GR,GD]),soil=c(['#2a0a2a','#5a2236',BR,'#9a5a59']),deep=c(['#1c0a34','#2e1050','#4a1a6a','#6f3d86']),mg_=C32(mg),MG_=C32(MG),LV_=C32(LV),CY_=C32(CY),BR_=C32(BR);
    return (wx,wy,dU,dD,dL,dR)=>{
      const n=NZ.fbm(wx*.06,wy*.08,2),f=hh(wx,wy,1),lipD=2+((NZ.vn(wx*.35,7)*3.4)|0),dd=dU+(n-.5)*9;
      let col;
      if(dU<lipD)col=lip[Math.min(3,dU+(f>.7?1:0))];
      else if(dd<12)col=ramp32(soil,.12+n*.8+.16*Math.sin(wy*.5+n*5),wx,wy);
      else col=ramp32(deep,.05+n*.85+.2*Math.sin(wy*.33+n*4),wx,wy);
      if(dU>=lipD+1){
        const r=Math.abs(NZ.vn(wx*.05+9,wy*.06)-.5);
        if(r<.016)col=(wx+wy)&1?MG_:mg_;else if(r<.026&&f>.5)col=mg_;
        const r2=Math.abs(NZ.vn(wx*.11,wy*.1+4)-.5);if(r2<.01&&dd>10)col=LV_;
        if(f>.992)col=WH32;else if(f>.975)col=MG_;else if(f<.02)col=C32('#10051c');
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
  if(idx===2){
    const steel=c(['#0a1220','#1c2a4a','#2c4a6a','#3c5a8a','#70a4b2']),CY_=C32(CY),WH_=C32('#ccffff'),YL_=C32(YL),K_=K32,BR_=C32(BR),rd_=C32(rd),GR_=C32(GR),LG_=C32(LG),GD_=C32(GD),D_=C32('#222222'),LL_=C32(LL),GM_=C32(GM);
    return (wx,wy,dU,dD,dL,dR)=>{
      const f=hh(wx,wy,3),lx=wx&15,ly=wy&15,cx=wx>>4,cy_=wy>>4,pt=hh(cx,cy_,5),n=NZ.vn(wx*.1,wy*.1);
      /* top deck: grating, hazard dashes, moss */
      const mossD=Math.floor(NZ.vn(wx*.17,3)*4.2)-.6;
      if(dU<mossD)return dU<1?LG_:dU<2?GR_:GD_;
      if(dU===0)return LL_;
      if(dU===1)return ((wx>>2)&1)?YL_:D_;
      if(dU===2)return D_;
      let v=.5+n*.22;
      if(lx<1||ly<1)v=.1;else if(lx<2||ly<2)v=.78;else if(lx>14||ly>14)v=.22;
      let col=ramp32(steel,v,wx,wy);
      if((lx===3||lx===12)&&(ly===3||ly===12))col=WH_;                            // rivets
      if(pt<.2&&lx>3&&lx<13&&ly>3&&ly<13)col=(ly&1)?K_:ramp32(steel,.3,wx,wy);   // vent slits
      else if(pt>.88&&ly>5&&ly<10&&lx>0)col=(((lx+ly)>>1)&1)?YL_:K_;             // hazard stripe
      else if(pt>.7&&pt<.76&&ly>6&&ly<9)col=ly===7?CY_:WH_;                      // glowing conduit
      else if(pt>.5&&pt<.54&&(lx-8)*(lx-8)+(ly-8)*(ly-8)<16)col=((lx-8)*(lx-8)+(ly-8)*(ly-8)<9)?K_:ramp32(steel,.4,wx,wy); // hatch
      const rs=NZ.vn(wx*.6,wy*.025+5);if(rs>.7&&f>.5&&dU>3)col=f>.8?rd_:BR_;                                 // rust streaks
      const ms=NZ.vn(wx*.12+40,wy*.14);if(ms>.74&&dU<30&&f>.35)col=ms>.82?LG_:GR_;                            // moss patches
      if(dD<1&&f>.4)col=D_;
      return col};
  }
  if(idx===3){
    const bas=c(['#2a0e0c','#4a1a14','#6a2a1c','#9a4a30','#d0784a']),OR_=C32(OR),YL_=C32(YL),WH_=C32(WH),rd_=C32(rd),BR_=C32(BR),RD_=C32(RD),D_=C32('#2a0a08');
    return (wx,wy,dU,dD,dL,dR)=>{
      const n=NZ.fbm(wx*.07,wy*.09,2),f=hh(wx,wy,4);
      if(dU<2)return dU?rd_:(f>.5?OR_:RD_);
      if(dU<3&&f>.4)return BR_;
      let col=ramp32(bas,.1+n*.85+.14*Math.sin(wy*.45+n*4),wx,wy);
      const r=Math.abs(NZ.vn(wx*.06+2,wy*.07)-.5)+Math.abs(NZ.vn(wx*.13,wy*.12+8)-.5)*.35;
      if(r<.02)col=(wx&1)?WH_:YL_;else if(r<.034)col=OR_;else if(r<.05)col=rd_;else if(r<.07&&f>.35)col=BR_;
      if(f>.994)col=YL_;else if(f>.98)col=BR_;
      if(dD<2&&dU>4)col=(dD<1&&f>.55)?OR_:rd_;
      return col};
  }
  /* hive */
  const fl=c(['#1a041c','#2c0a30','#4a1450',PU,'#9a3a9a']),PG_=C32(PG),MG_=C32(MG),mg_=C32(mg),LV_=C32(LV),cyn=C32(CY),WH_=C32(WH);
  return (wx,wy,dU,dD,dL,dR)=>{
    const n=NZ.fbm(wx*.07,wy*.08,2),f=hh(wx,wy,6);
    if(dU===0)return PG_;
    if(dU===1)return f>.4?MG_:mg_;
    let v=.2+n*.75;
    const q=NZ.vn(wx*.07+(Math.sin(wy*.06)*3),wy*.07),rib=(q*9)%1;if(rib<.12)v+=.35;else if(rib>.9)v-=.2;
    let col=ramp32(fl,v,wx,wy);
    const r=Math.abs(NZ.vn(wx*.045+11,wy*.05)-.5);if(r<.014&&dU>2)col=(wx&1)?PG_:LV_;
    if(f>.996)col=cyn;else if(f>.985)col=mg_;
    if(dD<2&&f>.3)col=dD?mg_:PG_;
    return col};
}

/* dark back wall inside caves and tunnels */
function mkBack(idx,NZ){
  const c=a=>a.map(C32);
  if(idx===0){const r=c(['#0c0418','#14082a','#1e0c3a','#2a1048']),G=C32(MG),B_=C32('#3a1230'),CYn=C32(CY);
    return (wx,wy)=>{const n=NZ.fbm(wx*.05,wy*.06,2),f=hh(wx,wy,11);let col=ramp32(r,.1+n*.8,wx,wy);
      const rt=NZ.vn(wx*.22,wy*.012+3);if(rt>.74&&f>.3)col=B_;
      if(f>.992)col=G;else if(f>.988)col=CYn;return col}}
  if(idx===1){const r=c(['#20080a','#34100e','#4a1c14','#68372b']),cr=C32('#1a0606'),YLd=C32('#9a6759');
    return (wx,wy)=>{const n=NZ.fbm(wx*.05,wy*.08,2),f=hh(wx,wy,12);const w=wy+NZ.vn(wx*.03,3)*6;let col=ramp32(r,.18+n*.5+Math.sin(w*.4)*.14,wx,wy);
      if(Math.abs(NZ.vn(wx*.08,wy*.1)-.5)<.01)col=cr;if(f>.99)col=YLd;return col}}
  if(idx===2){const r=c(['#060a14','#0a1220','#101a30','#1c2a4a']),CYd=C32('#2c5a7a'),line=C32('#1c2a4a'),LGd=C32('#1b5a3a');
    return (wx,wy)=>{const n=NZ.fbm(wx*.06,wy*.06,2),f=hh(wx,wy,13);let col=ramp32(r,.15+n*.6,wx,wy);
      if((wx&15)===0||(wy&15)===0)col=line;if((wx&15)===8&&(wy&15)===8)col=CYd;
      if(NZ.vn(wx*.1+20,wy*.1)>.8&&f>.4)col=LGd;return col}}
  if(idx===3){const r=c(['#080204','#140608','#240c0c','#381410']),g1=C32('#6a2414'),g2=C32('#ff9966');
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

/* paint one 256 pixel wide chunk of the ground */
function bakeChunk(L,idx,ci){
  const A=SURF.A,Wd=WORLDS[idx],LW=L.LW,LH=L.LH,g=L.g,H=LH*TS,M=8,W2=CHW+2*M,X0=ci*CHW-M;
  if(!A.shade){A.NZ=B.mkNoise(200+idx);A.shade=mkGround(idx,A.NZ);A.back=mkBack(idx,A.NZ);A.stamps=mkStamps(idx,Wd)}
  const NZ=A.NZ,shade=A.shade,back=A.back;
  const sol=(tx,ty)=>tx<0||tx>=LW?(ty>=LH||Wd.ship||Wd.cavern||(ty>=0&&g[ty*LW+(tx<0?0:LW-1)]===1)):ty>=LH?true:ty<0?(Wd.ship||Wd.cavern):g[ty*LW+tx]===1;
  const mask=new Uint8Array(W2*H),dU=new Uint8Array(W2*H),dD=new Uint8Array(W2*H),dL=new Uint8Array(W2*H),dR=new Uint8Array(W2*H);
  const tx0=Math.floor(X0/TS),tx1=Math.floor((X0+W2-1)/TS);
  for(let ty=0;ty<LH;ty++)for(let tx=tx0;tx<=tx1;tx++){
    if(!sol(tx,ty))continue;
    const aU=!sol(tx,ty-1),aD=!sol(tx,ty+1),aL=!sol(tx-1,ty),aR=!sol(tx+1,ty);
    for(let j=0;j<TS;j++)for(let i=0;i<TS;i++){
      if((i===0&&j===0&&aU&&aL)||(i===7&&j===0&&aU&&aR)||(i===0&&j===7&&aD&&aL)||(i===7&&j===7&&aD&&aR))continue;
      const c=tx*TS+i-X0;if(c<0||c>=W2)continue;mask[(ty*TS+j)*W2+c]=1}
    /* ragged hanging edge under ceilings */
    if(aD&&ty+1<LH&&g[(ty+1)*LW+tx]===0)for(let i=0;i<TS;i++){const wx=tx*TS+i,c=wx-X0;if(c<0||c>=W2)continue;const b=Math.max(0,Math.round(NZ.vn(wx*.3,ty*3.1)*4.6-1.2));for(let j=0;j<b;j++)mask[((ty+1)*TS+j)*W2+c]=1}
  }
  for(let c=0;c<W2;c++)for(let y=0;y<H;y++){const i=y*W2+c;if(mask[i]){dU[i]=y>0&&mask[i-W2]?Math.min(255,dU[i-W2]+1):0}}
  for(let c=0;c<W2;c++)for(let y=H-1;y>=0;y--){const i=y*W2+c;if(mask[i]){dD[i]=y<H-1?(mask[i+W2]?Math.min(255,dD[i+W2]+1):0):99}}
  for(let y=0;y<H;y++){const r=y*W2;for(let c=0;c<W2;c++){const i=r+c;if(mask[i])dL[i]=c>0&&mask[i-1]?Math.min(255,dL[i-1]+1):0}
    for(let c=W2-1;c>=0;c--){const i=r+c;if(mask[i])dR[i]=c<W2-1&&mask[i+1]?Math.min(255,dR[i+1]+1):0}}
  const out=new Uint32Array(CHW*H),litC=C32(Wd.glow||WH),isLava=!!Wd.lava;
  for(let y=0;y<H;y++){const ty=y>>3;
    for(let c=M;c<M+CHW;c++){const i=y*W2+c,wx=X0+c,tx=wx>>3;let col=0;
      if(mask[i]){
        col=shade(wx,y,dU[i],dD[i],dL[i],dR[i]);
        /* edge light and shade: light from the upper left */
        if(dL[i]===0)col=mix32(col,WH32,.3);else if(dL[i]===1)col=mix32(col,WH32,.1);
        if(dR[i]===0)col=mix32(col,K32,.4);else if(dR[i]===1)col=mix32(col,K32,.15);
        if(dD[i]===0)col=mix32(col,K32,.45);
        if(dU[i]===0&&idx!==1&&idx!==2)col=mix32(col,WH32,.18);
      }else{
        /* outline just outside the ground */
        const nb=(c>0&&mask[i-1])||(c<W2-1&&mask[i+1])||(y>0&&mask[i-W2])||(y<H-1&&mask[i+W2]);
        if(nb)col=K32;
        else if(tx>=0&&tx<LW&&ty<LH&&g[ty*LW+tx]!==1&&ty>L.bgRow[tx]+1){
          col=back(wx,y);
          /* shadow close to the walls */
          let ao=0;for(let k=2;k<=3;k++){if((c>=k&&mask[i-k])||(c<W2-k&&mask[i+k])||(y>=k&&mask[i-k*W2])||(y<H-k&&mask[i+k*W2]))ao++}
          if(ao)col=mix32(col,K32,ao>1?.5:.3)}
        else if(tx>=0&&tx<LW&&ty<LH&&g[ty*LW+tx]===0&&Wd.ship&&!(Wd.plant&&Wd.plant.kind==='hive')&&(tx%14===0)){
          const lx=wx&7;col=lx===0||lx===7?C32('#0a1220'):lx===1?C32('#3c5a8a'):lx===6?C32('#101a30'):C32('#1c2a4a');if((y&15)===3&&lx>1&&lx<6)col=litC}
      }
      out[y*CHW+c-M]=col}}
  const cv_=cnv(CHW,H,()=>{}),cx=cv_.getContext('2d'),id=new ImageData(new Uint8ClampedArray(out.buffer),CHW,H);cx.putImageData(id,0,0);
  /* buried things */
  const ST=A.stamps,ox=ci*CHW,stamp=(im,x,y)=>cx.drawImage(im,Math.round(x-ox),Math.round(y));
  const ta=Math.floor(ox/TS)-4,tb=Math.floor((ox+CHW)/TS)+4;
  for(let tx=Math.max(2,ta);tx<=Math.min(LW-3,tb);tx++)for(let ty=1;ty<LH-1;ty++){
    if(g[ty*LW+tx]!==1)continue;
    const h=hh(tx,ty,idx+40),h2=hh(tx,ty,idx+90);
    let intr=true;for(let j=-1;j<=1&&intr;j++)for(let i=-1;i<=1;i++)if(g[(ty+j)*LW+tx+i]!==1){intr=false;break}
    if(intr&&h<.075){let u=0;while(ty-u-1>0&&g[(ty-u-1)*LW+tx]===1&&u<4)u++;
      if(u>=2){const im=ST.inner[(h2*ST.inner.length)|0];stamp(im,tx*TS+4-im.width/2+((hh(tx,ty,7)*6-3)|0),ty*TS+4-im.height/2)}}
    else if(h>.93&&g[(ty-1)*LW+tx]===0&&g[ty*LW+tx-1]===1&&g[ty*LW+tx+1]===1){const im=ST.near[(h2*ST.near.length)|0];stamp(im,tx*TS+4-im.width/2,ty*TS+2)}   // roots and bits under the surface
    else if(h>.80&&h<.9&&g[(ty+1)*LW+tx]===0&&ST.ceil.length&&ty+1<LH){const im=ST.ceil[(h2*ST.ceil.length)|0];stamp(im,tx*TS+4-im.width/2,ty*TS+7)}   // hanging from ceilings
  }
  /* props standing on the surface */
  for(let tx=Math.max(14,ta);tx<=Math.min(LW-20,tb);tx++){
    const h=hh(tx,3,idx+200);if(h>.07)continue;
    const ty=L.top?L.top[tx]:-1;if(ty<0)continue;
    let ok=true;for(let i=-3;i<=3;i++)if(L.top[tx+i]!==ty)ok=false;
    if(!ok||g[(ty-1)*LW+tx]!==0||g[ty*LW+tx]!==1)continue;
    const im=ST.props[(hh(tx,5,idx)*ST.props.length)|0];stamp(im,tx*TS+4-im.width/2,ty*TS+2-im.height)}
  return cv_;
}

/* ---------------- state ---------------- */
const SURF={on:false,L:null,W:null,assets:{}};
window.SURF=SURF;SURF.gen=genLevel;SURF.bake=(L,i,ci)=>bakeChunk(L,i,ci);SURF.analyze=analyzeLevel;
function sv(){SAVE.surf=SAVE.surf||{};const s=SAVE.surf;s.done=s.done||[0,0,0,0,0];s.green=s.green||0;s.seen=s.seen||{};s.reward=s.reward||0;s.kills=s.kills||0;s.cp=s.cp||{};return s}
SURF.state=sv;
SURF.unlocked=i=>{const s=sv();return i===0?true:!!s.done[i-1]};
SURF.allDone=()=>sv().done.every(v=>v);
SURF.assets_=idx=>{
  if(SURF.assets[idx])return SURF.assets[idx];
  const Wd=WORLDS[idx],a={};
  a.tiles=mkTiles(Wd);a.plants=mkPlants(Wd);a.decor=mkDecor(Wd,idx);a.player=SURF.player||(SURF.player=mkPlayer());
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
  if(Wd.ship||Wd.cavern)a.wall=cnv(128,96,g=>{
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
  a.skyobj=cnv(110,60,g=>{
    if(idx===0){ell(g,55,30,22,22,[VI,PU,mg,MG,WH]);for(let i=0;i<110;i++){const an=i/110*TAU;if(Math.sin(an)>0||Math.abs(Math.cos(an))>.4)px(g,i%2?YL:OR,55+Math.cos(an)*38,30+Math.sin(an)*9,2,1)}}
    else if(idx===1){ell(g,36,28,16,16,[OR,YL,WH,WH]);ell(g,82,38,8,8,[RD,OR,YL,WH])}
    else{}});
  a.jet=fin(cnv(12,16,g=>{px(g,D,1,3,4,9);px(g,GM,1,3,1,9);px(g,LL,2,3,1,9);px(g,D,7,3,4,9);px(g,GM,7,3,1,9);px(g,LL,8,3,1,9);px(g,RD,1,2,4,1);px(g,RD,7,2,4,1);px(g,BR,4,5,4,2);px(g,TN,4,5,4,1);px(g,K,2,12,2,2);px(g,K,8,12,2,2);px(g,OR,2,13,2,2);px(g,YL,2,13,2,1);px(g,OR,8,13,2,2);px(g,YL,8,13,2,1);px(g,CY,5,8,2,2);px(g,WH,5,8,1,1)}));
  a.coin=cnv(7,7,g=>{ell(g,3.5,3.5,3,3,GREEN);px(g,WH,2,2,1,1)});
  a.chest=[cnv(14,10,g=>{poly(g,[[0,3],[14,3],[14,10],[0,10]],[BR,TN,OR]);poly(g,[[0,0],[14,0],[14,4],[0,4]],[BR,OR,YL]);px(g,GREEN[3],6,3,2,3);px(g,K,0,3,14,1)}),
    cnv(14,10,g=>{poly(g,[[0,5],[14,5],[14,10],[0,10]],[BR,TN,OR]);px(g,GREEN[2],2,0,10,5);px(g,GREEN[4],4,1,2,2);px(g,GREEN[3],8,2,2,2)})];
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
  SURF.visit=0;SURF.t=0;SURF.msg=[WORLDS[idx].n,3];SURF.beam=null;SURF.done=0;SURF.help=6;
  SURF.guard=null;SURF.touch={};SURF.fireDown=false;
  L.spawns.forEach(sp=>{sp.e=null;sp.t=0});
  L.chests.forEach(c=>c.open=0);
  for(const c of L.checks)c.on=(cp&&Math.abs(c.x-cp.x)<4)?1:0;
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
const solidT=t=>t===1||t===6;
function hitsSolid(x,y,w,h){const L=SURF.L,x0=Math.floor(x/TS),x1=Math.floor((x+w-.01)/TS),y0=Math.floor(y/TS),y1=Math.floor((y+h-.01)/TS);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const t=tile(tx,ty);if(solidT(t))return true}return false}
/* ---------------- input ---------------- */
function inp(){
  const k=UI.keys,T=SURF.touch||{};
  const l=!!(k.arrowleft||k.a||T.l||PAD.x<0),r=!!(k.arrowright||k.d||T.r||PAD.x>0);
  const jump=!!(k[' ']||k.w||k.k||k.arrowup||T.j||(PAD.prev&&PAD.prev.A)),fire=!!(k.x||k.j||k.z||k.enter||k.control||T.f||(PAD.prev&&(PAD.prev.X||PAD.prev.B)));
  const up=!!(k.arrowup||k.i||T.u||PAD.y<0),down=!!(k.arrowdown||k.s||T.d||PAD.y>0);
  const jumpB=!!(k[' ']||k.k||T.j||(PAD.prev&&PAD.prev.A));
  return{l,r,jump,jumpB,fire,up,down}
}
/* ---------------- update ---------------- */
SURF.key=function(k){
  if(k==='b'||k==='escape'||k==='t'){SURF.beamUp();return}
  if(k==='r'){const p=SURF.p;if(p&&p.dead<=0&&SURF.t-(SURF.rt||-9)>3){SURF.rt=SURF.t;const cp=sv().cp[SURF.idx];p.x=cp?cp.x:SURF.L.start.x;p.y=(cp?cp.y-16:SURF.L.start.y);p.vx=p.vy=0;p.ride=null;p.inv=1;SURF.msg=['BACK AT THE LAST BEAM PAD',1.6]}return}
  if(k==='enter'||k==='e'){const L=SURF.L,p=SURF.p;if(L.exit&&Math.abs(p.x-L.exit.x)<20&&Math.abs(p.y+8-L.exit.y)<24)tryExit()}
};
function tryExit(){
  const L=SURF.L,s=sv();
  if(SURF.done)return;
  if(SURF.guard&&SURF.guard.hp>0){SURF.msg=['THE GUARDIAN BLOCKS THE BEACON',2.2];return}
  SURF.done=1;L.exit.open=1;s.done[SURF.idx]=1;const bonus=40+SURF.idx*30;s.green+=bonus;SURF.visit+=bonus;
  SURF.msg=['LEVEL CLEAR  +'+bonus+' GREEN GOLD',3.5];delete s.cp[SURF.idx];
  for(let i=0;i<30;i++)SURF.fx.push({x:L.exit.x+9,y:L.exit.y-14,vx:rnd(-60,60),vy:rnd(-110,-20),life:1.2,c:GREEN[i%5],s:2});
  SURF.endT=3.2;save();
}
SURF.beamUp=function(){
  if(SURF.cut&&SURF.cut.mode==='out')return;const p=SURF.p;
  SURF.cut={mode:'out',t:0,hx:p.x+5,hy:Math.max(12,p.y-64),py0:p.y,px0:p.x};try{sfxTone(300,700,.5,'sine',.04,{att:.01})}catch(e){}
};
function leave(){
  SURF.on=false;MODE='hub';HUB.screen='transporter';UI.focus=0;save(true);
}
SURF.tick=function(dt){
  dt=Math.min(dt,1/30);const L=SURF.L,p=SURF.p,s=sv();
  SURF.t+=dt;L.tick+=dt;
  if(SURF.msg&&SURF.msg[1]>0)SURF.msg[1]-=dt;if(SURF.help>0)SURF.help-=dt;
  if(SURF.cut){const c=SURF.cut;c.t+=dt;
    if(c.mode==='in'){if(!c.dropped&&c.t>=1.1){c.dropped=1;p.hidden=false;p.x=c.hx-5;p.y=c.hy+10;p.vx=p.vy=0;try{sfxTone(500,200,.3,'sine',.03,{att:.005})}catch(e){}}if(c.t>=2.7)SURF.cut=null}
    else{if(c.t>.9&&c.t<1.7){const u=(c.t-.9)/.8,e=u*u*(3-2*u);p.x=c.px0+(c.hx-5-c.px0)*e;p.y=c.py0+(c.hy+10-c.py0)*e}
      if(c.t>=1.7)p.hidden=true;if(c.t>=2.7){leave();return}}}
  if(SURF.endT>0){SURF.endT-=dt;if(SURF.endT<=0){SURF.beamUp()}}
  const I=inp(),beamed=false,locked=!!(SURF.cut&&(SURF.cut.mode==='out'||!SURF.cut.dropped));
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
    const sp=82;let ax=(I.r?1:0)-(I.l?1:0);if(beamed)ax=0;
    /* ladders: grab with up or down, climb with up and down, jump to let go */
    const lcx=Math.floor((p.x+p.w/2)/TS),onL=tile(lcx,Math.floor((p.y+8)/TS))===7,belowL=tile(lcx,Math.floor((p.y+p.h+1)/TS))===7;
    if(!p.lad){if((I.up&&onL)||(I.down&&(onL||(p.on&&belowL)))){p.lad=true;p.vy=0;p.on=false;if(!onL)p.y+=5;p.jb=0;p.jumpHeld=true}}
    else if(!onL&&!(I.down&&belowL)){
      const rt=Math.floor((p.y+p.h-1)/TS);
      if(I.up&&tile(lcx,rt)===7&&tile(lcx,rt-1)!==7){p.y=rt*TS-p.h;p.vy=0;p.on=true;p.lad=false;p.coy=.09}   // climbed out onto the top rung
      else p.lad=false}
    if(p.lad){
      p.vx=ax*38;if(ax)p.face=ax;
      p.vy=I.up?-64:I.down?64:0;p.lcl=(p.lcl||0)+(p.vy?dt*8:0);
      if(!ax)p.x+=((lcx*TS+4-p.w/2)-p.x)*Math.min(1,dt*14);
      if(I.jumpB&&!p.lj){p.lad=false;p.vy=-175;p.jb=0;p.jumpHeld=true;p.vx=ax*80;try{sfxTone(260,520,.1,'square',.02,{att:.002})}catch(e){}}
      p.lj=I.jumpB;
    }else{p.vx+=((ax*sp)-p.vx)*Math.min(1,dt*(p.on?14:7));if(ax)p.face=ax;p.lj=I.jumpB}
    if(p.ride){p.x+=p.ride.dx;p.y+=p.ride.dy}
    if(!p.lad){p.vy+=430*dt;if(p.vy>320)p.vy=320}
    /* wind lifts */
    for(const u of L.ups)if(p.x+p.w>u.x&&p.x<u.x+u.w&&p.y+p.h>u.y&&p.y<u.y+u.h){p.vy-=900*dt;if(p.vy<-95)p.vy=-95}
    p.jb-=dt;p.coy-=dt;
    if(I.jump&&!p.jumpHeld&&!beamed&&!p.lad){p.jb=.12}
    if(!I.jump)p.jumpHeld=false;
    if(p.jb>0&&(p.on||p.coy>0)){p.vy=-222;p.on=false;p.coy=0;p.jb=0;p.jumpHeld=true;try{sfxTone(260,520,.12,'square',.02,{att:.002})}catch(e){}}
    if(p.sp>0)p.sp-=dt;
    if(!I.jump&&p.vy<-90&&!p.on&&!p.lad&&!(p.sp>0))p.vy*=1-dt*9;   // let go to hop short
    /* jetpack: press jump again in the air and hold it. Fuel comes back on the ground or a ladder. */
    p.thrust=false;
    if(p.on||p.lad){p.jarm=false;if(p.fuel==null)p.fuel=1;p.fuel=Math.min(1,p.fuel+dt*1.0)}
    else{if(!I.jump)p.jarm=true;if(p.fuel==null)p.fuel=1;
      if(s.jet&&I.jump&&p.jarm&&p.fuel>0&&!beamed){p.thrust=true;p.vy-=900*dt;if(p.vy<-100)p.vy=-100;p.fuel=Math.max(0,p.fuel-dt*.95);
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
      for(let ty=ty0;ty<=ty1;ty++){for(let tx=Math.floor(p.x/TS);tx<=Math.floor((p.x+p.w-.01)/TS);tx++){const t=tile(tx,ty);if((t===2||t===9||(t===7&&!p.lad&&tile(tx,ty-1)!==7))&&botOld<=ty*TS+1&&botNew>=ty*TS){const yy=ty*TS-p.h;if(!land||yy<land.y)land={y:yy,k:'t'}}}}
      for(const q of L.lifts){if(p.x+p.w>q.x&&p.x<q.x+q.w){const top=q.y;if(botOld<=top+3+(q.dy>0?q.dy:0)&&botNew>=top-2){const yy=top-p.h;if(!land||yy<land.y)land={y:yy,k:'l',q}}}}
      if(hitsSolid(p.x+(p.lad?2:0),ny,p.lad?p.w-4:p.w,p.h)){const ty=Math.floor((ny+p.h)/TS);const yy=ty*TS-p.h;if(!land||yy<land.y)land={y:yy,k:'s'}}
      if(land){p.y=land.y;p.vy=0;p.on=true;p.coy=.09;if(land.q)p.ride=land.q;
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
    for(const yy of [cyT,cyH]){const t=tile(cxT,yy);if(t===3&&p.inv<=0){hurt(1,true)}else if(t===4){hurt(PARAM[SURF.idx].dmg,true)}}
    if(p.y>L.LH*TS-10)hurt(1,true);
    if(p.inv>0)p.inv-=dt;
    /* gates */
    for(const gt of (L.gates||[])){const on=((L.tick*.6+gt.x)%2)<1;gt.on=on;if(on&&p.x+p.w>gt.x*TS&&p.x<gt.x*TS+8&&p.y+p.h>gt.y*TS&&p.y<(gt.y+gt.h)*TS&&p.inv<=0)hurt(1,false)}
    /* fire */
    p.fire-=dt;
    if(I.fire&&p.fire<=0&&!beamed){p.fire=.2;const up=I.up&&!I.l&&!I.r?1:0,dir=p.face;
      SURF.bul.push({x:p.x+p.w/2+dir*8,y:p.y+(up?2:7),vx:up?0:dir*260,vy:up?-260:0,life:.7,d:1});try{sfxLaser()}catch(e){}}
    /* checkpoints and chests and coins */
    if(L.jet&&!s.jet&&Math.abs(p.x+5-L.jet.x)<12&&Math.abs(p.y+8-L.jet.y)<16){s.jet=1;p.fuel=1;SURF.msg=['JETPACK FOUND. IN THE AIR, PRESS JUMP AGAIN AND HOLD IT TO FLY',5];shakeS=.15;
      try{sfxTone(300,1400,.5,'triangle',.05,{att:.005})}catch(e){}
      for(let i=0;i<30;i++)SURF.fx.push({x:L.jet.x,y:L.jet.y,vx:rnd(-90,90),vy:rnd(-130,-10),life:.9,c:[WH,YL,OR,CY][i%4],s:2});save()}
    for(const c of L.checks)if(!c.on&&Math.abs(p.x+5-c.x)<16&&Math.abs(p.y+16-c.y)<18){c.on=1;s.cp[SURF.idx]={x:c.x,y:c.y};SURF.msg=['BEAM PAD SAVED',1.6];for(let i=0;i<10;i++)SURF.fx.push({x:c.x,y:c.y-4,vx:rnd(-30,30),vy:rnd(-90,-20),life:.7,c:CY,s:2});p.safe={x:p.x,y:p.y}}
    for(const c of L.chests)if(!c.open&&Math.abs(p.x+5-(c.x+7))<14&&Math.abs(p.y+8-(c.y+5))<18){c.open=1;try{sfxTone(500,1200,.3,'triangle',.04,{att:.005})}catch(e){}
      for(let i=0;i<Math.min(12,c.v);i++)L.coins.push({x:c.x+7,y:c.y,v:Math.ceil(c.v/Math.min(12,c.v)),vx:rnd(-50,50),vy:rnd(-130,-60),loose:1})}
    for(const c of L.coins){
      if(c.loose){c.vy+=300*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;if(hitsSolid(c.x-2,c.y,4,4)){c.vy=-c.vy*.3;c.vx*=.6;c.y-=2}}
      const dx=p.x+5-c.x,dy=p.y+8-c.y;if(!c.gone&&dx*dx+dy*dy<150){c.gone=1;s.green+=c.v;SURF.visit+=c.v;SURF.txt.push({x:c.x,y:c.y,t:.8,s:'+'+c.v});try{beep(900+Math.random()*200,.05,'square',.03)}catch(e){}}}
    L.coins=L.coins.filter(c=>!c.gone);
  }
  /* spawners: enemies in view and farm respawns */
  for(const sp of L.spawns){
    const dx=Math.abs(sp.x-(p.x+5));
    if(sp.e&&sp.e.hp<=0){sp.e=null;sp.t=PARAM[SURF.idx].resp*(.7+Math.random()*.6)}
    if(!sp.e){sp.t-=dt;
      if(sp.t<=0&&dx<200){const cam=SURF.cam,on=sp.x>cam.x-20&&sp.x<cam.x+VW+20;
        if(!sp.once||!on){sp.once=1;const e=addEnemy(sp.type,sp.x,sp.y+TS-SURF.W.en[sp.type].h);sp.e=e;e.sp_=sp}}}
  }
  /* the guardian shows up when you get near the end */
  if(!SURF.guard&&p.x>L.exit.x-260){const e=addEnemy(4,L.guardian.x,L.guardian.y-SURF.W.en[4].h*1.7,true);e.guardian=1;SURF.guard=e;SURF.msg=['THE GUARDIAN',2.5]}
  /* enemies */
  for(const e of SURF.en){updateEnemy(e,dt)}
  SURF.en=SURF.en.filter(e=>{if(e.hp>0&&Math.abs(e.x-p.x)<520)return true;if(e.hp<=0)return false;if(e.sp_){e.sp_.e=null;e.sp_.t=0}return false});
  /* bullets */
  for(const b of SURF.bul){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(hitsSolid(b.x-1,b.y-1,2,2))b.life=0;
    for(const e of SURF.en)if(e.hp>0&&b.life>0&&Math.abs(b.x-(e.x+e.w/2))<e.w/2+2&&Math.abs(b.y-(e.y+e.h/2))<e.h/2+2){b.life=0;e.hp-=b.d;e.flash=.08;
      if(e.hp<=0)killEnemy(e);for(let i=0;i<3;i++)SURF.fx.push({x:b.x,y:b.y,vx:rnd(-40,40),vy:rnd(-40,40),life:.2,c:CY,s:1})}}
  SURF.bul=SURF.bul.filter(b=>b.life>0);
  for(const b of SURF.eb){b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.ay)b.vy+=b.ay*dt;b.life-=dt;if(hitsSolid(b.x-1,b.y-1,2,2))b.life=0;
    if(p.dead<=0&&Math.abs(b.x-(p.x+5))<6&&Math.abs(b.y-(p.y+8))<9&&b.life>0){b.life=0;hurt(PARAM[SURF.idx].dmg,false)}}
  SURF.eb=SURF.eb.filter(b=>b.life>0);
  /* particles */
  for(const f of SURF.fx){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=120*dt}SURF.fx=SURF.fx.filter(f=>f.life>0);
  for(const t of SURF.txt){t.t-=dt;t.y-=18*dt}SURF.txt=SURF.txt.filter(t=>t.t>0);
  /* camera */
  const cam=SURF.cam,tx=clamp(p.x+5-VW/2+p.face*28,0,L.LW*TS-VW),ty=clamp(p.y-VH*.58,0,L.LH*TS-VH);
  cam.x+=(tx-cam.x)*Math.min(1,dt*5);cam.y+=(ty-cam.y)*Math.min(1,dt*4);
};
function hurt(n,respawn){
  const p=SURF.p;if(p.inv>0&&!respawn||p.dead>0)return;
  if(SURF.cut&&SURF.cut.mode==='out')return;
  p.hp-=n;p.inv=1;shakeS=.25;try{sfxBoom(8,false)}catch(e){}
  for(let i=0;i<10;i++)SURF.fx.push({x:p.x+5,y:p.y+8,vx:rnd(-70,70),vy:rnd(-90,10),life:.5,c:RD,s:2});
  if(p.hp<=0){const cp=sv().cp[SURF.idx];p.safe=cp?{x:cp.x,y:cp.y-16}:{x:SURF.L.start.x,y:SURF.L.start.y};p.dead=1.1;SURF.msg=['YOU WERE BEAMED BACK TO THE LAST PAD',1.6];for(let i=0;i<20;i++)SURF.fx.push({x:p.x+5,y:p.y+8,vx:rnd(-90,90),vy:rnd(-120,10),life:.9,c:i%2?WH:CY,s:2})}
  else if(respawn){p.x=p.safe.x;p.y=p.safe.y;p.vx=p.vy=0;p.ride=null}
}
let shakeS=0;
function killEnemy(e){
  const s=sv(),sp=e.sp;sv();s.kills++;try{sfxBoom(10,e.elite)}catch(e2){}
  const key=SURF.idx+'_'+e.k;s.seen[key]=(s.seen[key]||0)+1;
  const n=Math.max(1,Math.round(sp.gold*(e.elite?4:1)));
  for(let i=0;i<Math.min(8,n);i++)SURF.L.coins.push({x:e.x+e.w/2,y:e.y+e.h/2,v:Math.ceil(n/Math.min(8,n)),vx:rnd(-60,60),vy:rnd(-120,-40),loose:1});
  for(let i=0;i<14;i++)SURF.fx.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:rnd(-80,80),vy:rnd(-100,20),life:.5,c:sp.pal[(i%3)+2],s:2});
}
function ebul(x,y,vx,vy,o){SURF.eb.push(Object.assign({x,y,vx,vy,life:2.4},o||{}))}
function aimBullets(e,n,sp,sd){const p=SURF.p,ox=e.x+e.w/2,oy=e.y+e.h*.4,a0=Math.atan2(p.y+8-oy,p.x+5-ox);for(let i=0;i<n;i++){const a=a0+(n>1?(i/(n-1)-.5)*(sd||.4):0);ebul(ox,oy,Math.cos(a)*sp,Math.sin(a)*sp)}try{sfxEnemyLaser()}catch(e2){}}
function updateEnemy(e,dt){
  const sp=e.sp,p=SURF.p,L=SURF.L;e.t+=dt;if(e.flash>0)e.flash-=dt;if(e.hp<=0)return;
  const dx=(p.x+5)-(e.x+e.w/2),dy=(p.y+8)-(e.y+e.h/2),near=Math.abs(dx)<260;
  if(!near&&!e.guardian)return;
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
  else if(ai==='flyer'){e.y=e.y0+Math.sin(e.t*2.2)*14;const tx=Math.sign(dx)*Math.min(spd,Math.abs(dx)*.6);e.x+=tx*dt*.7;e.face=dx>0?1:-1;
    if(sp.shoot){e.cd-=dt;if(e.cd<=0&&Math.abs(dx)<150){e.cd=sp.shoot.cd;aimBullets(e,1,sp.shoot.sp)}}
    e.y0+=((p.y-16)-e.y0)*dt*.4}
  else if(ai==='diver'){if(e.st===0){e.y=e.y0+Math.sin(e.t*2)*6;e.x+=Math.sign(dx)*30*dt;e.face=dx>0?1:-1;if(Math.abs(dx)<50&&dy>10){e.st=1;e.t2=0}}
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

/* ---------------- drawing ---------------- */
SURF.draw=function(){
  const L=SURF.L,A=SURF.A,Wd=SURF.W,p=SURF.p,cam=SURF.cam;
  let sx=0,sy0=0;if(shakeS>0){shakeS-=1/60;sx=(Math.random()-.5)*3;sy0=(Math.random()-.5)*3}
  ctx.save();ctx.translate(sx|0,sy0|0);
  if(!Wd.ship&&!Wd.cavern&&A.skyobj&&(SURF.idx<2)){}
  if(Wd.ship||Wd.cavern){ctx.fillStyle=(Wd.wallc||Wd.rock)[0];ctx.fillRect(0,0,VW,VH);const wi=A.wall,ox=-Math.floor(mod(cam.x*.45,128)),oy=-Math.floor(mod(cam.y*.45,96));for(let y=oy;y<VH;y+=96)for(let x=ox;x<VW;x+=128)ctx.drawImage(wi,x,y)}else ctx.drawImage(A.sky,0,0);
  /* far layers move slower than the ground */
  if(!Wd.ship&&!Wd.cavern&&SURF.idx<2){ctx.drawImage(A.skyobj,Math.floor(190-cam.x*.03),Math.floor(10-cam.y*.04));ctx.fillStyle=Wd.glow;for(let i=0;i<22;i++){const sx=mod(i*47-L.tick*(6+i%5),VW+20),sy=mod(i*31+Math.sin(L.tick*.7+i)*12,110)+4;ctx.globalAlpha=.5;ctx.fillRect(sx|0,sy|0,2,2);ctx.globalAlpha=1}}
  const horizon=clamp(150-(cam.y-(20*TS-100))*.35,100,230);
  if(!Wd.ship&&!Wd.cavern){
    if(A.cloud)for(let i=0;i<4;i++){const c=A.cloud[i%3],sp=3+i*1.6,cxx=Math.floor(mod(i*131-L.tick*sp-cam.x*.06,VW+160))-80,cyy=Math.floor(14+((i*37)%50)-(cam.y-(20*TS-100))*.05);ctx.globalAlpha=.55;ctx.drawImage(c,cxx,cyy);ctx.globalAlpha=1}
    for(let l=0;l<3;l++){const img=A.far[l],f=[.1,.22,.38][l],ox=-Math.floor(mod(cam.x*f,320)),oy=Math.floor(horizon-img.height+[2,14,28][l]);
      for(let x=ox;x<VW;x+=320)ctx.drawImage(img,x,oy)}}
  if(A.ribs){const f=.68,ox=-Math.floor(mod(cam.x*f,200)),oy=-Math.floor(mod(cam.y*f*.5,200));ctx.globalAlpha=Wd.cavern?.55:.7;for(let x=ox;x<VW;x+=200)for(let y=oy;y<VH;y+=200)ctx.drawImage(A.ribs,x,y);ctx.globalAlpha=1}
  /* decor in the middle distance */
  if(!Wd.ship&&!Wd.cavern){const f=.5,span=A.decor.length*130;for(let i=0;i<A.decor.length*3;i++){const d=A.decor[i%A.decor.length],wx=i*130+((i*37)%50),x=Math.floor(wx-cam.x*f),y=Math.floor(horizon-d.height+16-(cam.y-(20*TS-100))*.1);
    const xx=mod(x+60,span+VW)-60;if(xx>-d.width&&xx<VW)ctx.drawImage(d,xx,y)}}
  /* tiles */
  const T=A.tiles,x0=Math.floor(cam.x/TS),x1=Math.min(L.LW-1,x0+41),y0=Math.floor(cam.y/TS),y1=Math.min(L.LH-1,y0+26);
  const tf=Math.floor(L.tick*3)%2;
  /* the painted ground */
  {const c0=Math.max(0,Math.floor(cam.x/CHW)),c1=Math.min(Math.floor((L.LW*TS-1)/CHW),Math.floor((cam.x+VW)/CHW));L.chunks=L.chunks||[];
    for(let ci=c0;ci<=c1;ci++){if(!L.chunks[ci])L.chunks[ci]=bakeChunk(L,SURF.idx,ci);ctx.drawImage(L.chunks[ci],Math.floor(ci*CHW-cam.x),-Math.floor(cam.y))}
    const nx=c1+1,pv=c0-1;if(nx<=Math.floor((L.LW*TS-1)/CHW)&&!L.chunks[nx])L.chunks[nx]=bakeChunk(L,SURF.idx,nx);else if(pv>=0&&!L.chunks[pv])L.chunks[pv]=bakeChunk(L,SURF.idx,pv)}
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    const t=L.g[ty*L.LW+tx],X=Math.floor(tx*TS-cam.x),Y=Math.floor(ty*TS-cam.y);
    if(t===0)continue;
    let im;
    if(t===2){const l=L.g[ty*L.LW+tx-1]===2,r=L.g[ty*L.LW+tx+1]===2;im=T.platV[l?(r?2:3):(r?1:0)]}else if(t===7)im=T.ladder[(ty>0&&L.g[(ty-1)*L.LW+tx]===7)?0:1];
    else if(t===3)im=T.spikeA?T.spikeA[tf]:T.spike;else if(t===4){im=T.lava[Math.floor(L.tick*4)%4];if(ty>0&&L.g[(ty-1)*L.LW+tx]!==4){ctx.globalAlpha=.25+.07*Math.sin(L.tick*3+tx);ctx.fillStyle=OR;ctx.fillRect(X,Y-5,8,5);ctx.globalAlpha=.12;ctx.fillRect(X-2,Y-11,12,6);ctx.globalAlpha=1}}else if(t===5)im=T.spring;
    else if(t===6){const c=L.crum[ty*L.LW+tx];im=T.crumble;if(c&&c.state==='shake')ctx.globalAlpha=.6+.4*Math.sin(L.tick*60)}
    if(im){ctx.drawImage(im,X,Y);ctx.globalAlpha=1}
    if(t===6){const gl=L.g[ty*L.LW+tx-1],gr=L.g[ty*L.LW+tx+1],gu=ty>0?L.g[(ty-1)*L.LW+tx]:1,gd=ty<L.LH-1?L.g[(ty+1)*L.LW+tx]:1;ctx.fillStyle=K;if(gl===0)ctx.fillRect(X,Y,1,8);if(gr===0)ctx.fillRect(X+7,Y,1,8);if(gu===0)ctx.fillRect(X,Y-1,8,1);if(gd===0)ctx.fillRect(X,Y+7,8,1)}
    if(t===1){const h=((tx*73856093)^(ty*19349663))>>>0,sw=Math.floor(L.tick*1.5+h%7)%2;
      const cl=(((tx>>2)*2654435761)>>>0)%100,prob=cl<55?85:10;
      if(ty>0&&L.g[(ty-1)*L.LW+tx]===0&&h%100<prob){const pl=A.plants.top[h%A.plants.top.length];ctx.drawImage(pl,X+4-(pl.width>>1)+sw,Y-pl.height+1)}
      else if(ty<L.LH-1&&L.g[(ty+1)*L.LW+tx]===0&&h%100<44){const pl=A.plants.hang[h%A.plants.hang.length];ctx.drawImage(pl,X+2+sw,Y+7)}}
  }
  if(Wd.lava){const gy=VH-80;for(let i=0;i<16;i++){ctx.globalAlpha=.03+i*.009;ctx.fillStyle=i<8?'#9a3a3a':'#ff9966';ctx.fillRect(0,gy+i*5,VW,5)}ctx.globalAlpha=1}
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
  /* laser gates */
  for(const gt of (L.gates||[])){for(let j=0;j<gt.h;j++){const X=Math.floor(gt.x*TS-cam.x),Y=Math.floor((gt.y+j)*TS-cam.y);if(gt.on){ctx.drawImage(T.gate[tf],X,Y)}else{ctx.fillStyle=D;ctx.fillRect(X+3,Y,2,8)}}}
  /* wind */
  for(const u of L.ups){ctx.fillStyle='#ffffff55';for(let i=0;i<10;i++){const wx=u.x+8+((i*13)%(u.w-8)),wy=u.y+u.h-((L.tick*80+i*37)%u.h);ctx.fillRect((wx-cam.x)|0,(wy-cam.y)|0,1,3)}}
  /* lifts */
  for(const q of L.lifts){const X=Math.floor(q.x-cam.x),Y=Math.floor(q.y-cam.y);ctx.fillStyle=K;ctx.fillRect(X-1,Y,q.w+2,7);ctx.fillStyle=Wd.plat[0];ctx.fillRect(X,Y,q.w,5);ctx.fillStyle=Wd.plat[1];ctx.fillRect(X,Y,q.w,1);ctx.fillStyle=YL;for(let k=2;k<q.w-2;k+=6)ctx.fillRect(X+k,Y+2,2,1);ctx.fillStyle=D;ctx.fillRect(X+q.w/2-1,Y+5,2,2)}
  /* checkpoints */
  for(const c of L.checks){const X=Math.floor(c.x-cam.x),Y=Math.floor(c.y-cam.y);ctx.fillStyle=K;ctx.fillRect(X-8,Y-2,16,3);ctx.fillStyle=c.on?CY:GM;ctx.fillRect(X-7,Y-2,14,2);if(c.on){ctx.fillStyle='#9ad2e044';ctx.fillRect(X-5,Y-30,10,28);ctx.fillStyle=WH;for(let i=0;i<4;i++)ctx.fillRect(X-4+((L.tick*30+i*9)%9),Y-4-((L.tick*40+i*11)%26),1,2)}}
  /* the beacon */
  {const e=L.exit,X=Math.floor(e.x-cam.x),Y=Math.floor(e.y-cam.y);ctx.drawImage(A.beacon,X,Y-28);const open=!(SURF.guard&&SURF.guard.hp>0);ctx.fillStyle=open?GREEN[3]:RD;ctx.fillRect(X+8,Y-24+((L.tick*8|0)%2),2,2);
    if(open&&!SURF.done&&Math.abs(p.x-e.x)<24){textC2('PRESS ENTER OR TAP THE BEACON',X+9,Y-38,YL)}}
  /* chests */
  for(const c of L.chests){const im=A.chest[c.open?1:0];ctx.drawImage(im,Math.floor(c.x-cam.x),Math.floor(c.y-cam.y))}
  /* the jetpack, waiting on a stone */
  if(L.jet&&!sv().jet){const jx=Math.floor(L.jet.x-cam.x),jy=Math.floor(L.jet.y-cam.y),bob=Math.sin(L.tick*3)*2;
    ctx.fillStyle=K;ctx.fillRect(jx-9,jy+12,18,4);ctx.fillStyle=GM;ctx.fillRect(jx-8,jy+12,16,2);ctx.fillStyle=LL;ctx.fillRect(jx-8,jy+12,16,1);
    ctx.globalAlpha=.18+.08*Math.sin(L.tick*4);ctx.fillStyle=YL;ctx.beginPath();ctx.arc(jx,jy+bob+4,14,0,TAU);ctx.fill();ctx.globalAlpha=.12;ctx.beginPath();ctx.arc(jx,jy+bob+4,20,0,TAU);ctx.fill();ctx.globalAlpha=1;
    ctx.drawImage(A.jet,jx-7,jy-6+Math.round(bob));ctx.fillStyle=WH;for(let k=0;k<5;k++){const a=L.tick*2+k*1.26;ctx.fillRect(Math.round(jx+Math.cos(a)*12),Math.round(jy+4+Math.sin(a)*9),1,1)}}
  /* coins */
  for(const c of L.coins){const X=Math.floor(c.x-cam.x-3),Y=Math.floor(c.y-cam.y-3+Math.sin(L.tick*4+c.x)*1),w=(Math.floor(L.tick*6+c.x)%4)===0?5:7;ctx.drawImage(A.coin,X,Y)}
  /* enemies */
  for(const e of SURF.en){if(e.hp<=0)continue;const fr=A.en[e.k],f=Math.floor(e.t*7)%4,im=(e.flash>0?fr.wh:fr.fr)[f];
    const w=Math.round(im.width*e.sc),h=Math.round(im.height*e.sc),X=Math.floor(e.x+e.w/2-w/2-cam.x),Y=Math.floor(e.y+e.h-h+1-cam.y);
    if(e.x-cam.x>-40&&e.x-cam.x<VW+40){
      ctx.save();ctx.globalAlpha=.4;{const wi=fr.wh[f];if(e.face>0){ctx.translate(X+w,Y);ctx.scale(-1,1);for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1]])ctx.drawImage(wi,ox,oy,w,h);ctx.scale(-1,1);ctx.translate(-(X+w),-Y)}else for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1]])ctx.drawImage(wi,X+ox,Y+oy,w,h)}ctx.restore();
      ctx.save();if(e.face>0){ctx.translate(X+w,Y);ctx.scale(-1,1);ctx.drawImage(im,0,0,w,h)}else ctx.drawImage(im,X,Y,w,h);ctx.restore();
      if(e.elite||e.hp<e.mhp){const bw=Math.max(14,e.w);ctx.fillStyle=K;ctx.fillRect(X+w/2-bw/2-1,Y-5,bw+2,4);ctx.fillStyle=e.elite?RD:LG;ctx.fillRect(X+w/2-bw/2,Y-4,Math.max(0,bw*e.hp/e.mhp),2)}
      if(e.st===1&&e.sp.ai==='charger'&&((e.t*16)|0)%2===0){ctx.fillStyle=WH;ctx.fillRect(X+w/2-1,Y-9,3,3)}}}
  /* player */
  if(p.dead<=0&&!p.hidden){
    const S=A.player,mode=p.lad?'climb':!p.on?(p.vy<0?'jump':'fall'):Math.abs(p.vx)>10?'run':'idle',fr=S[mode][Math.floor(mode==='climb'?(p.lcl||0):p.anim)%S[mode].length],X=Math.floor(p.x+p.w/2-8-cam.x),Y=Math.floor(p.y+p.h-18+1-cam.y);
    if(!(p.inv>0&&((SURF.t*14)|0)%2===0)){ctx.save();if(p.face<0){ctx.translate(X+16,Y);ctx.scale(-1,1);ctx.drawImage(fr,0,0)}else ctx.drawImage(fr,X,Y);ctx.restore()}
    if(p.thrust){const bx=p.face>0?X+1:X+12,fy=Y+14,len=5+((SURF.t*45|0)%3)*2;ctx.fillStyle=RD;ctx.fillRect(bx-1,fy,5,2);ctx.fillStyle=OR;ctx.fillRect(bx,fy+1,3,len);ctx.fillStyle=YL;ctx.fillRect(bx+1,fy+1,1,len-2);ctx.fillStyle=WH;ctx.fillRect(bx+1,fy,1,3)}
  }
  /* shots */
  for(const b of SURF.bul){const X=Math.floor(b.x-cam.x),Y=Math.floor(b.y-cam.y);ctx.fillStyle=WH;if(b.vy)ctx.fillRect(X,Y-3,1,6);else ctx.fillRect(X-3,Y,7,1);ctx.fillStyle=CY;if(b.vy)ctx.fillRect(X-1,Y-4,3,2);else ctx.fillRect(X-4,Y-1,2,3)}
  for(const b of SURF.eb){const X=Math.floor(b.x-cam.x),Y=Math.floor(b.y-cam.y);ctx.fillStyle=K;ctx.fillRect(X-2,Y-2,5,5);ctx.fillStyle=b.lob?OR:RD;ctx.fillRect(X-1,Y-1,3,3);ctx.fillStyle=YL;ctx.fillRect(X,Y,1,1)}
  for(const f of SURF.fx){ctx.fillStyle=f.c;ctx.fillRect((f.x-cam.x)|0,(f.y-cam.y)|0,f.s,f.s)}
  for(const t of SURF.txt)text(t.s,(t.x-cam.x)|0,(t.y-cam.y)|0,GREEN[3],1);
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
  hud();
};
function hud(){
  const p=SURF.p,s=sv(),Wd=SURF.W;
  ctx.fillStyle='#000000cc';ctx.fillRect(0,0,VW,14);
  for(let i=0;i<p.mhp;i++){ctx.fillStyle=i<p.hp?RD:'#444';ctx.fillRect(4+i*7,4,5,6);if(i<p.hp){ctx.fillStyle=WH;ctx.fillRect(4+i*7,4,5,1)}}
  ctx.drawImage(SURF.A.coin,58,3);text('GREEN GOLD '+s.green,68,4,GREEN[3],1);text('+'+SURF.visit,68+textW('GREEN GOLD '+s.green,1)+4,4,GREEN[2],1);
  textR(Wd.n+'  '+(SURF.idx+1)+'/5',VW-4,4,'#bbbbbb',1);
  /* progress along the level */
  ctx.fillStyle='#000000aa';ctx.fillRect(4,VH-8,90,5);ctx.fillStyle=GREEN[1];ctx.fillRect(5,VH-7,Math.round(88*clamp(p.x/(SURF.L.LW*TS),0,1)),3);
  if(SURF.msg&&SURF.msg[1]>0)textC(SURF.msg[0],40,YL,1);
  if(SURF.help>0){ctx.fillStyle='#000000aa';ctx.fillRect(0,VH-31,VW,24);textC('MOVE: ARROWS OR A D   JUMP: SPACE   FIRE: X   BEAM UP: B   STUCK: R',VH-18,WH,1);textC('LADDERS: PRESS UP OR DOWN NEXT TO ONE',VH-28,YL,1)}
  if(s.jet){const f=p.fuel==null?1:p.fuel;ctx.fillStyle='#000000aa';ctx.fillRect(4,16,52,9);text('JET',6,17,YL,1);ctx.fillStyle=K;ctx.fillRect(24,17,30,6);ctx.fillStyle=f>.25?CY:RD;ctx.fillRect(25,18,Math.round(28*f),4);ctx.fillStyle=WH;ctx.fillRect(25,18,Math.round(28*f),1)}
  /* on screen buttons */
  const tb=SURF.touchBtns=[];
  const btn=(id,x,y,w,h,label)=>{tb.push({id,x,y,w,h});ctx.fillStyle=SURF.touch[id]?'#ffffff88':'#00000066';ctx.fillRect(x,y,w,h);ctx.fillStyle='#ffffff55';ctx.fillRect(x,y,w,1);ctx.fillRect(x,y,1,h);textC2(label,x+w/2,y+h/2-2,WH)};
  if(typeof isTouch!=='undefined'&&isTouch){btn('l',4,152,36,40,'<');btn('r',44,152,36,40,'>');btn('j',282,152,34,40,'JUMP');btn('f',244,152,34,40,'FIRE');btn('u',244,126,34,22,'UP');btn('d',282,126,34,22,'DOWN')}
  btn('b',VW-52,16,48,14,'BEAM UP');
}
/* touch input: pointers can hold several buttons at once */
function ptIn(e){const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*VW,y=(e.clientY-r.top)/r.height*VH;return[x,y]}
function setTouch(e,down){
  if(MODE!=='surface')return false;
  const [x,y]=ptIn(e);let hit=null;
  for(const b of (SURF.touchBtns||[]))if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){hit=b.id;break}
  SURF.tp=SURF.tp||{};
  if(down){if(hit){SURF.tp[e.pointerId]=hit;SURF.touch[hit]=1;if(hit==='b')SURF.beamUp()}
    else{/* a tap on the beacon completes the level */const L=SURF.L,p=SURF.p;if(L&&L.exit&&Math.abs(p.x-L.exit.x)<26)tryExit()}}
  else{const id=SURF.tp[e.pointerId];if(id){delete SURF.touch[id];delete SURF.tp[e.pointerId]}}
  return true;
}
cv.addEventListener('pointerdown',e=>{if(MODE==='surface'){e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}setTouch(e,true)}},true);
cv.addEventListener('pointerup',e=>{if(MODE==='surface')setTouch(e,false)},true);
cv.addEventListener('pointercancel',e=>{if(MODE==='surface')setTouch(e,false)},true);
cv.addEventListener('pointermove',e=>{if(MODE!=='surface')return;const [x,y]=ptIn(e);const id=SURF.tp&&SURF.tp[e.pointerId];if(!id)return;const b=(SURF.touchBtns||[]).find(q=>q.id===id);if(b&&!(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)){delete SURF.touch[id];delete SURF.tp[e.pointerId]}},true);
SURF.WORLDS=WORLDS;
})();
