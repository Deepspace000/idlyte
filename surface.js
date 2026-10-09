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
  rock:['#2a0a3a','#6f3d86',mg,MG],wallc:['#0c0418','#1a0a2e','#2e1450','#6f3d86'],topc:['#2c8a2c','#9ad284','#ccff99'],plat:['#cc44cc','#ffffaa'],mush:1,glow:MG,plant:{leaf:['#2c5a2c','#588d43','#9ad284'],fl:[MG,YL,OR],kind:'jungle'},
  en:[
   {id:'sporeling',n:'SPORELING',ai:'walker',kit:'blob',o:{eyes:'cyclops'},pal:[NV,PU,LP,LV,WH],w:14,h:12,hp:2,spd:22,gold:1},
   {id:'puffcap',n:'PUFFCAP',ai:'dropper',kit:'cap',pal:[BR,TN,OR,YL,WH],w:18,h:14,hp:2,spd:16,gold:2,fly:1},
   {id:'vinesnap',n:'VINESNAP',ai:'turret',kit:'turretk',o:{shape:'plant'},pal:['#102010',GD,GR,LG,PG],w:14,h:20,hp:3,cd:2.2,range:130,bul:{n:1,sp:80},gold:2},
   {id:'glowmoth',n:'GLOWMOTH',ai:'flyer',kit:'wing',o:{wing:'moth'},pal:[PU,LP,LV,CY,WH],w:18,h:12,hp:2,spd:34,gold:2,fly:1,shoot:{cd:2.6,sp:70}},
   {id:'shroombrute',n:'SHROOM BRUTE',ai:'charger',kit:'golem',o:{cap:1,fist:4.2,inset:4},pal:[BR,TN,OR,YL,WH],w:22,h:22,hp:8,spd:18,gold:5}]},
 {n:'CRYSTAL DESERT',sub:'RED SAND, CRUMBLING BRIDGES AND CRYSTAL SPIRES',lw:1240,lh:208,
  sky:['#1c5a8a','#70a4b2','#ffffaa','#ffffff'],skyY:.5,ridge:[['#9a3a3a','#ff7777'],['#ff9966','#ffffaa']],
  rock:['#68372b','#9a3a3a',RD,OR],wallc:['#20080a','#34100e','#5a2418','#9a3a3a'],topc:['#ff9966','#ffffaa','#ffffff'],plat:['#9a3a3a','#ffffaa'],crumble:1,glow:CY,plant:{leaf:['#2c5a2c','#9ad284','#ccff99'],fl:[MG,RD,YL],kind:'desert'},
  en:[
   {id:'dunecrab',n:'DUNE SCORPION',ai:'walker',kit:'crab',o:{shape:'scorpion'},pal:['#2a1008',BR,TN,OR,YL],w:18,h:12,hp:3,spd:26,gold:2},
   {id:'sandskipper',n:'SAND SKIPPER',ai:'hopper',kit:'crab',o:{shape:'hopper'},pal:['#2a1008',rd,RD,OR,YL],w:16,h:16,hp:2,spd:50,gold:2},
   {id:'shardturret',n:'SHARD TURRET',ai:'turret',kit:'turretk',o:{shape:'crystal'},pal:[VI,mg,MG,CY,WH],w:14,h:18,hp:4,cd:1.8,range:150,bul:{n:3,sp:80,sd:.35},gold:3},
   {id:'dustwisp',n:'DUST DEVIL',ai:'flyer',kit:'wing',o:{wing:'wisp'},pal:[BR,TN,OR,YL,WH],w:14,h:20,hp:2,spd:62,gold:2,fly:1},
   {id:'crystalgolem',n:'CRYSTAL GOLEM',ai:'charger',kit:'golem',o:{crystal:1,inset:3,fist:2.2},pal:[VI,mg,MG,CY,WH],w:22,h:24,hp:10,spd:20,gold:6}]},
 {n:'DERELICT STARSHIP',sub:'A CRASHED CARGO SHIP, OVERGROWN WITH GLOWING PLANTS',lw:1400,lh:224,ship:1,
  sky:['#0a0630','#1c1840',VI,BL],skyY:.5,ridge:[['#1c1840','#2a1d52'],['#352879','#4a2f86']],
  rock:['#1c2a4a','#3c5a8a','#70a4b2','#ccffff'],wallc:['#060a14','#0a1220','#101a30','#2c4a6a'],topc:['#6c6c6c','#bbbbbb','#ffffaa'],plat:['#6c6c6c','#9ad2e0'],glow:CY,plant:{leaf:['#1b5a3a','#2c8a2c','#9ad284'],fl:[CY,MG,YL],kind:'ship'},
  en:[
   {id:'cargobot',n:'CARGO BOT',ai:'walker',kit:'droid',pal:[D,GM,YG,YL,WH],w:16,h:16,hp:4,spd:26,gold:2},
   {id:'sparkwisp',n:'SPARK WISP',ai:'dropper',kit:'cap',o:{ghost:1},pal:[VI,cy,CY,WH,WH],w:14,h:14,hp:2,spd:26,gold:2,fly:1},
   {id:'ventcrawler',n:'VENT CRAWLER',ai:'hopper',kit:'crab',o:{shape:'spider'},pal:['#102010',GD,LG,PG,YL],w:14,h:12,hp:3,spd:56,gold:2},
   {id:'wallgun',n:'WALL GUN',ai:'turret',kit:'turretk',o:{shape:'pylon'},pal:[D,GM,rd,OR,YL],w:12,h:24,hp:6,cd:1.8,range:150,bul:{n:2,sp:90,sd:.3},gold:3},
   {id:'loadermech',n:'LOADER MECH',ai:'charger',kit:'golem',o:{mech:1,pad:4.6,fist:3.4},pal:[D,GM,OR,YL,WH],w:26,h:28,hp:14,spd:22,gold:8,shoot:{cd:2.6,sp:80}}]},
 {n:'MAGMA CAVERNS',sub:'LAVA POOLS, FALLING ROCKS AND FIRE BEASTS',lw:1520,lh:240,
  sky:['#0a0200','#2a0a08',rd,OR],skyY:.45,ridge:[['#2a0a08','#68372b'],['#68372b','#ff9966']],cavern:1,
  rock:['#2a0a08','#68372b','#9a3a3a','#ff9966'],wallc:['#05010a','#0a0204','#1c0808','#ff9966'],topc:['#ff9966','#ffffaa','#ffffff'],plat:['#444444','#ff9966'],lava:1,glow:YL,plant:{leaf:['#68372b','#ff9966','#ffffaa'],fl:[YL,RD,WH],kind:'magma'},
  en:[
   {id:'lavaslug',n:'LAVA SLUG',ai:'walker',kit:'blob',o:{slug:1},pal:['#2a0a08',rd,OR,YL,WH],w:22,h:10,hp:4,spd:18,gold:2},
   {id:'ashbat',n:'ASH BAT',ai:'flyer',kit:'wing',o:{wing:'bat'},pal:['#1c0808',D,GM,LL,RD],w:26,h:16,hp:3,spd:44,gold:3,fly:1,shoot:{cd:3,sp:75}},
   {id:'emberspitter',n:'EMBER SPITTER',ai:'lobber',kit:'turretk',o:{shape:'spitter'},pal:[BR,rd,OR,YL,WH],w:22,h:20,hp:5,cd:2.4,range:170,gold:3},
   {id:'magmahopper',n:'MAGMA HOPPER',ai:'hopper',kit:'blob',o:{legs:1,angry:1},pal:['#2a0a08',rd,RD,OR,YL],w:14,h:14,hp:4,spd:60,gold:3},
   {id:'obsidianknight',n:'OBSIDIAN KNIGHT',ai:'charger',kit:'golem',o:{knight:1,inset:8,fist:2.4},pal:[K,'#1c1840',VI,BL,RD],w:20,h:26,hp:14,spd:24,gold:8}]},
 {n:'ALIEN MOTHERSHIP',sub:'A LIVING SHIP: SLIME WALLS, EGG POOLS AND A HIVE GUARD',lw:1680,lh:256,ship:1,
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
 [null,null,null,['#ffaa44',.12],['#ff6622',.2],['#ff6622',.2],['#aa2200',.22],['#ffcc44',.16],['#aa6644',.2],['#ff4400',.14],['#300800',.3],['#ff2200',.18]],
 [null,null,null,['#ff77cc',.16],['#66ff88',.22],['#aaff44',.34],['#cc2266',.22],['#ffaacc',.16],['#aa66ff',.2],['#ff44aa',.16],['#1a0030',.3],['#ff3366',.16]]];
/* a level is one long journey made of set pieces: rolling ground, bridges over chasms, halls, forests, lakes, mountains,
   stairs, ruins and towers, with mazes, caves and nooks underneath, and a few very tall peaks and very deep abysses */
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
      for(const bx of [.78,.87,.96]){const d=Math.abs(xx-bx*LW);if(d<13)T+=Math.round(80*Math.min(1,(13-d)/2))}}
    else if(idx===3){T=165+30*(bbN.fbm(xx*.006,7,3)-.5)*2;if(f<.05)T=40+(T-40)*sstepf(f/.05);if(f>.95)T=Math.max(60,T-(f-.95)/.05*100)}
    else{const e=Math.sqrt(Math.max(0,1-Math.pow((f-.5)/.5,2)));T=60+215*e+16*(bbN.fbm(xx*.02,9,2)-.5)}
    return el+T};
  const FK=[{cw:46,ch:30,k:'cave'},{cw:50,ch:32,k:'cave'},{cw:48,ch:28,k:'deck'},{cw:52,ch:34,k:'cave'},{cw:44,ch:36,k:'hex'}][idx];
  const rooms=[],ports=[],byRow={};
  {const Y0=SURF-Math.round(upMax)+36,nj=Math.ceil((LH-Y0)/FK.ch)+1;
   const dk=idx===0?['shroom','bush','weed']:idx===1?['spire','bush','weed']:idx===2?['crate','pillar','porthole']:idx===3?['spire','bush','pillar']:['egg','shroom','rib'];
   for(let j=0;j<nj;j++){const y1=Y0+j*FK.ch;if(y1>LH-16)break;
    let skipI=-99;
    for(let i=-1;i<Math.ceil(LW/FK.cw)+1;i++){
      if(i===skipI)continue;
      const off=(FK.k==='hex'&&j%2)?FK.cw/2:0,cx0=Math.round(i*FK.cw+FK.cw/2+off+rn(-3,3));
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
      const nest=FK.k==='hex'&&R()<.3,flood=(idx===2||idx===4||idx===0)&&j>0&&R()<.22&&!nest,lavaP=idx===3&&R()<.34;
      if(flood){for(let q=0;q<w;q++)for(let y=y1-4;y<y1;y++)if(G(x0+q,y)===0)S(x0+q,y,10)}
      else if(lavaP){const lw_=rn(4,6),lx=cx+rn(-6,2);for(let q=0;q<lw_;q++)S(lx+q,y1-1,4)}
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
   for(const e of edges){const ra=fd(e.a),rb=fd(e.b),join=ra!==rb;if(!join&&R()>.28)continue;if(join)par.set(ra,rb);
     if(e.t==='h'){const y1=e.a.y1;for(let xx=e.a.cx;xx<=e.b.cx;xx++){for(let y=y1-5;y<y1;y++){const t=G(xx,y);if(t===1)S(xx,y,0)}if(G(xx,y1)!==1&&G(xx,y1)!==7)S(xx,y1,1)}}
     else{const xs=e.x;for(let y=e.a.y1;y<e.b.y1;y++){S(xs,y,7);S(xs+1,y,0)}}}}
  /* a shaft from the surface to some of the top rooms, with a ladder */
  for(const r of rooms){if(R()>.3)continue;if(rooms.some(q=>q.i===r.i&&q.j<r.j&&Math.abs(q.cx-r.cx)<6))continue;const xs=r.cx+rn(-6,6);const t=top[xs];if(t<0||t>=r.yt-3||rh[xs]>0&&false)continue;
    let clear=true;for(let y=t;y<r.yt;y++)if(G(xs,y)!==1&&y>t||G(xs+1,y)!==1&&y>t){clear=false;break}if(!clear||G(xs,t-1)!==0)continue;
    for(let y=t;y<=r.y1-1;y++){S(xs,y,7);if(y>t&&y<r.yt)S(xs+1,y,0)}}
  L.fillerPorts=ports;
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
  for(let it=0;it<2;it++){const A=analyzeLevel(L,{noUps:true});let bad=0;
    for(const p of ports){const k=p.y*LW+p.x;if(A.F[k])continue;let best=null,bd=1e9;
      for(let dy=-46;dy<=46;dy++){const y=p.y+dy;if(y<3||y>=LH-2)continue;for(let dx=-46;dx<=46;dx++){const xx=p.x+dx;if(xx<2||xx>=LW-2)continue;const q=y*LW+xx;if(A.F[q]&&A.st[q]&&g[q]!==10){const d=Math.abs(dx)+Math.abs(dy)*1.6;if(d<bd){bd=d;best=[xx,y]}}}}
      if(!best)continue;bad++;const [vx,vy]=best,stp=vx>=p.x?1:-1;
      for(let xx=p.x;xx!==vx+stp;xx+=stp){for(let y=p.y-4;y<=p.y;y++){const t=G(xx,y);if(t===1||t===6)S(xx,y,0)}if(G(xx,p.y+1)===0)S(xx,p.y+1,1)}
      for(let y=Math.min(p.y,vy);y<=Math.max(p.y,vy);y++){const t=G(vx,y);if(t===0||t===1||t===2||t===6||t===10)S(vx,y,7)}L.repairs++}
    if(!bad)break}
  L.dist0=Math.hypot(L.start.x-L.exit.x,L.start.y-L.exit.y)||1;
  fixTraps(L);
  /* every ship piece must be reachable with the rocket pack: if not, give it a ledge and a ladder tunnel to the nearest reachable floor */
  if(L.shipPieces.length){let AP=analyzeLevel(L,{pack:true}),fixed=0;
    for(const sp of L.shipPieces){const px=Math.round(sp.x/TS),py=Math.round(sp.y/TS);let ok=false;for(let dy=-3;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(AP.F[(py+dy)*LW+px+dx])ok=true;if(ok)continue;
      for(let q=-1;q<=1;q++)if(G(px+q,py+1)!==1)S(px+q,py+1,2);
      let best=null,bd=1e9;for(let dy=-60;dy<=60;dy++){const y=py+dy;if(y<3||y>=LH-2)continue;for(let dx=-60;dx<=60;dx++){const xx=px+dx,q=y*LW+xx;if(xx>2&&xx<LW-2&&AP.F[q]&&AP.st[q]&&g[q]!==10){const d=Math.abs(dx)+Math.abs(dy)*1.5;if(d<bd){bd=d;best=[xx,y]}}}}
      if(!best)continue;const [vx,vy]=best,stp=vx>=px?1:-1;
      for(let xx=px;xx!==vx+stp;xx+=stp){for(let y=py-4;y<=py;y++){const t=G(xx,y);if(t===1||t===6)S(xx,y,0)}if(G(xx,py+1)===0)S(xx,py+1,1)}
      for(let y=Math.min(py,vy);y<=Math.max(py,vy);y++){const t=G(vx,y);if(t===0||t===1||t===2||t===6||t===10)S(vx,y,7)}fixed++}
    if(fixed){L.pieceFix=fixed;fixTraps(L)}}
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

/* paint one 256 by 256 pixel chunk of the ground */
function bakeChunk(L,idx,ci,cj){
  const A=SURF.A,Wd=WORLDS[idx],LW=L.LW,LH=L.LH,g=L.g,M=8,CHH=CHW,HH=CHH+2*M,W2=CHW+2*M,X0=ci*CHW-M,Y0=cj*CHH-M;
  if(!A.shade){A.NZ=B.mkNoise(200+idx);A.shade=mkGround(idx,A.NZ);A.back=mkBack(idx,A.NZ);A.stamps=mkStamps(idx,Wd)}
  const NZ=A.NZ,shade=A.shade,back=A.back,DEEPT=C32(['#14042a','#3a0a10','#02040c','#4a1006','#10020e'][idx]);
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
        if(dL[i]===0)col=mix32(col,WH32,.3);else if(dL[i]===1)col=mix32(col,WH32,.1);
        if(dR[i]===0)col=mix32(col,K32,.4);else if(dR[i]===1)col=mix32(col,K32,.15);
        if(dD[i]===0)col=mix32(col,K32,.45);
        if(dU[i]===0&&idx!==1&&idx!==2)col=mix32(col,WH32,.18);
        if(dp>.12)col=mix32(col,DEEPT,Math.min(.5,(dp-.12)*.7));
        {const zt=ZT[(ty-ty0t)*TW+(tx-tx0t)];if(zt)col=mix32(col,zt[0],zt[1]*.45)}
      }else{
        const nb=(c>0&&mask[i-1])||(c<W2-1&&mask[i+1])||(y>0&&mask[i-W2])||(y<HH-1&&mask[i+W2]),nb2=false;
        if(nb)col=K32;
        else if(tx>=0&&tx<LW&&ty<LH&&g[ty*LW+tx]!==1&&!L.sky(tx,ty)){
          col=back(wx,wy);const zt=ZT[(ty-ty0t)*TW+(tx-tx0t)];if(zt)col=mix32(col,zt[0],zt[1]*.9);
          {const zn=zz[(ty-ty0t)*TW+(tx-tx0t)];if(zn===6||zn===8){if((wy&15)===0||((wx+((wy>>4)&1)*8)&15)===0)col=mix32(col,K32,.3)}else if(zn===7){if(((wx>>4)&3)===0)col=mix32(col,K32,.28);else if(((wx>>4)&3)===1)col=mix32(col,WH32,.06)}else if(zn===3){if(((wx+wy)>>3&1)===0)col=mix32(col,WH32,.07)}else if(zn===10&&hh(wx,wy,79)>.992)col=WH32;else if(zn===4&&hh(wx,wy,77)>.985)col=C32(LG);else if(zn===5&&hh(wx,wy,78)>.99)col=C32(CY)}
          let ao=0;for(let k=2;k<=3;k++){if((c>=k&&mask[i-k])||(c<W2-k&&mask[i+k])||(y>=k&&mask[i-k*W2])||(y<HH-k&&mask[i+k*W2]))ao++}
          if(ao)col=mix32(col,K32,ao>1?.5:.3);
          if(dp>.1)col=mix32(col,DEEPT,Math.min(.6,(dp-.1)*.9));
          if(idx>=2)col=((col&0xffffff)|(((nb2?255:178))<<24))>>>0}
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
    if(intr&&h<.075){let u=0;while(ty-u-1>0&&g[(ty-u-1)*LW+tx]===1&&u<4)u++;
      if(u>=2){const im=ST.inner[(h2*ST.inner.length)|0];stamp(im,tx*TS+4-im.width/2+((hh(tx,ty,7)*6-3)|0),ty*TS+4-im.height/2)}}
    else if(h>.93&&g[(ty-1)*LW+tx]===0&&g[ty*LW+tx-1]===1&&g[ty*LW+tx+1]===1){const im=ST.near[(h2*ST.near.length)|0];stamp(im,tx*TS+4-im.width/2,ty*TS+2)}
    else if(h>.80&&h<.9&&g[(ty+1)*LW+tx]===0&&ST.ceil.length&&ty+1<LH){const im=ST.ceil[(h2*ST.ceil.length)|0];stamp(im,tx*TS+4-im.width/2,ty*TS+7)}
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
window.SURF=SURF;SURF.gen=genLevel;SURF.bake=(L,i,ci,cj)=>bakeChunk(L,i,ci,cj);SURF.analyze=analyzeLevel;
function sv(){SAVE.surf=SAVE.surf||{};const s=SAVE.surf;s.done=s.done||[0,0,0,0,0];s.green=s.green||0;s.seen=s.seen||{};s.reward=s.reward||0;s.kills=s.kills||0;s.cp=s.cp||{};s.pieces=s.pieces||[0,0,0,0,0,0];s.intro=s.intro||{};if(s.lay!==3){s.cp={};s.lay=3}   // the levels were rebuilt much bigger, so old beam pad positions no longer fit
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
  a.deco=mkDeco(idx,Wd);
  a.skyobj=cnv(110,60,g=>{
    if(idx===0){ell(g,55,30,22,22,[VI,PU,mg,MG,WH]);for(let i=0;i<110;i++){const an=i/110*TAU;if(Math.sin(an)>0||Math.abs(Math.cos(an))>.4)px(g,i%2?YL:OR,55+Math.cos(an)*38,30+Math.sin(an)*9,2,1)}}
    else if(idx===1){ell(g,36,28,16,16,[OR,YL,WH,WH]);ell(g,82,38,8,8,[RD,OR,YL,WH])}
    else{}});
  a.pieceIcons=mkPieceIcons();
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
  SURF.visit=0;SURF.t=0;SURF.msg=[WORLDS[idx].n,3];SURF.beam=null;SURF.done=0;SURF.help=10;
  SURF.srow=null;SURF.guard=null;SURF.touch={};SURF.fireDown=false;
  SURF.intro={t:0,first:!s.intro[idx]};s.intro[idx]=1;SURF.pieceBanner=null;
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
  const jump=!!(k[' ']||k.w||k.k||k.arrowup||T.j||(PAD.prev&&PAD.prev.A)),fire=!!(k.x||k.j||k.z||k.r||k.enter||k.control||T.f||SURF.mouseFire||(PAD.prev&&(PAD.prev.X||PAD.prev.B||PAD.prev.RB||PAD.prev.RT)));
  const up=!!(k.arrowup||k.w||k.i||T.u||PAD.y<0),down=!!(k.arrowdown||k.s||T.d||PAD.y>0);
  const jumpB=!!(k[' ']||k.k||T.j||(PAD.prev&&PAD.prev.A));
  return{l,r,jump,jumpB,fire,up,down}
}
/* ---------------- update ---------------- */
SURF.key=function(k){
  if(k==='b'||k==='escape'||k==='t'){SURF.beamUp();return}
  if(k==='g'){const p=SURF.p;if(p&&p.dead<=0&&SURF.t-(SURF.rt||-9)>3){SURF.rt=SURF.t;const cp=sv().cp[SURF.idx];p.x=cp?cp.x:SURF.L.start.x;p.y=(cp?cp.y-16:SURF.L.start.y);p.vx=p.vy=0;p.ride=null;p.inv=1;SURF.msg=['BACK AT THE LAST BEAM PAD',1.6]}return}
  if(k==='enter'||k==='e'){const L=SURF.L,p=SURF.p;if(L.exit&&Math.abs(p.x-L.exit.x)<20&&Math.abs(p.y+8-L.exit.y)<24)tryExit()}
};
function tryExit(){
  const L=SURF.L,s=sv();
  if(SURF.done)return;
  if(SURF.guard&&SURF.guard.hp>0){SURF.msg=['THE GUARDIAN BLOCKS THE BEACON',2.2];return}
  SURF.done=1;L.exit.open=1;s.done[SURF.idx]=1;const bonus=40+SURF.idx*30;s.green+=bonus;SURF.visit+=bonus;
  SURF.msg=['LEVEL CLEAR  +'+bonus+' GREEN GOLD',3.5];delete s.cp[SURF.idx];
  for(let i=0;i<30;i++)SURF.fx.push({x:L.exit.x+9,y:L.exit.y-14,vx:rnd(-60,60),vy:rnd(-110,-20),life:1.2,c:GREEN[i%5],s:2});
  SURF.endT=3.2;
  if(s.done.every(v=>v)&&SURF.piecesFound()<6){const n=SURF.piecesFound();SURF.banner={t:8,lines:['YOU ARE MISSING SHIP PIECES:',n+' OF 6 FOUND.','SEARCH THE LEVELS FOR THE REST.']};SURF.endT=7}
  save();
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
    const sp=p.inW?58:82;let ax=(I.r?1:0)-(I.l?1:0);if(beamed)ax=0;
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
    p.inW=tile(Math.floor((p.x+p.w/2)/TS),Math.floor((p.y+10)/TS))===10;
    if(p.inW&&!p.lad){   // swimming: slow, floaty, hold jump to rise
      p.vy+=(I.jump?-520:130)*dt;if(p.vy>46)p.vy=46;if(p.vy<-78)p.vy=-78;p.vx*=1-dt*2.4;
      if(Math.random()<dt*7)SURF.fx.push({x:p.x+p.w/2+rnd(-3,3),y:p.y+3,vx:rnd(-6,6),vy:-30,life:.9,c:'#d0ffff',s:1,b:1})}
    else if(!p.lad){p.vy+=430*dt;if(p.vy>320)p.vy=320}
    /* wind lifts */
    for(const u of L.ups)if(p.x+p.w>u.x&&p.x<u.x+u.w&&p.y+p.h>u.y&&p.y<u.y+u.h){p.vy-=900*dt;if(p.vy<-95)p.vy=-95}
    p.jb-=dt;p.coy-=dt;
    if(p.drop>0)p.drop-=dt;
    /* S and jump together: drop down through a thin platform, a lift or the top of a ladder */
    const dEdge=I.down&&!p.dprev;p.dprev=I.down;
    if(((I.jump&&I.down&&!p.jumpHeld)||(SURF.touch&&SURF.touch.d&&dEdge))&&!beamed&&!p.lad&&p.on){
      const fx=Math.floor((p.x+p.w/2)/TS),fy=Math.floor((p.y+p.h+1)/TS),ft=tile(fx,fy);
      if(ft===2||ft===9||ft===7||p.ride){p.drop=.3;p.on=false;p.ride=null;p.y+=2;p.vy=40;p.jumpHeld=true;p.jb=0;p.coy=0;try{sfxTone(400,160,.1,'square',.02,{att:.002})}catch(e){}}}
    if(I.jump&&!p.jumpHeld&&!beamed&&!p.lad){p.jb=.12}
    if(!I.jump)p.jumpHeld=false;
    if(p.jb>0&&(p.on||p.coy>0)){p.vy=p.inW?-120:-222;p.on=false;p.coy=0;p.jb=0;p.jumpHeld=true;try{sfxTone(260,520,.12,'square',.02,{att:.002})}catch(e){}}
    if(p.sp>0)p.sp-=dt;
    if(!I.jump&&p.vy<-90&&!p.on&&!p.lad&&!(p.sp>0))p.vy*=1-dt*9;   // let go to hop short
    /* rocket pack: press jump again in the air and hold it. Fuel comes back on the ground or a ladder. */
    p.thrust=false;
    if(p.on||p.lad){p.jarm=false;if(p.fuel==null)p.fuel=1;p.fuel=Math.min(1,p.fuel+dt*1.4)}
    else{if(!I.jump)p.jarm=true;if(p.fuel==null)p.fuel=1;
      if(s.jet&&I.jump&&p.jarm&&p.fuel>0&&!beamed&&!p.inW){p.thrust=true;p.vy-=900*dt;if(p.vy<-105)p.vy=-105;p.fuel=Math.max(0,p.fuel-dt*.5);
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
    for(const sp of (L.shipPieces||[]))if(!s.pieces[sp.id]&&Math.abs(p.x+5-sp.x)<14&&Math.abs(p.y+8-sp.y)<16){s.pieces[sp.id]=1;const n=SURF.piecesFound();
      SURF.banner={t:7,lines:['SHIP PIECE FOUND: '+PIECE_NAMES[sp.id],'('+n+' OF 6)',n>=6?'ALL SIX PIECES FOUND! FINISH ALL FIVE WORLDS TO CLAIM THE SHIP.':'KEEP LOOKING. THE REST ARE HIDDEN IN THE OTHER WORLDS.']};
      try{sfxTone(400,1600,.7,'triangle',.06,{att:.005});setTimeout(()=>{try{sfxTone(800,1800,.4,'sine',.05,{att:.005})}catch(e){}},220)}catch(e){}shakeS=.2;
      for(let i=0;i<40;i++)SURF.fx.push({x:sp.x,y:sp.y,vx:rnd(-110,110),vy:rnd(-150,-10),life:1.1,c:[WH,YL,CY,MG][i%4],s:2});save()}
    for(const c of L.checks)if(!c.on&&Math.abs(p.x+5-c.x)<16&&Math.abs(p.y+16-c.y)<18){c.on=1;s.cp[SURF.idx]={x:c.x,y:c.y};SURF.msg=['BEAM PAD SAVED',1.6];for(let i=0;i<10;i++)SURF.fx.push({x:c.x,y:c.y-4,vx:rnd(-30,30),vy:rnd(-90,-20),life:.7,c:CY,s:2});p.safe={x:p.x,y:p.y}}
    for(const c of L.chests)if(!c.open&&Math.abs(p.x+5-(c.x+7))<14&&Math.abs(p.y+8-(c.y+5))<18){c.open=1;try{sfxTone(500,1200,.3,'triangle',.04,{att:.005})}catch(e){}
      for(let i=0;i<Math.min(12,c.v);i++)L.coins.push({x:c.x+7,y:c.y,v:Math.ceil(c.v/Math.min(12,c.v)),vx:rnd(-50,50),vy:rnd(-130,-60),loose:1})}
    let anyGone=false;
    for(const c of L.coins){
      if(!c.loose&&(Math.abs(p.x+5-c.x)>24||Math.abs(p.y+8-c.y)>24))continue;
      if(c.loose){c.vy+=300*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;if(hitsSolid(c.x-2,c.y,4,4)){c.vy=-c.vy*.3;c.vx*=.6;c.y-=2}}
      const dx=p.x+5-c.x,dy=p.y+8-c.y;if(!c.gone&&dx*dx+dy*dy<150){c.gone=1;anyGone=true;s.green+=c.v;SURF.visit+=c.v;SURF.txt.push({x:c.x,y:c.y,t:.8,s:'+'+c.v});try{beep(900+Math.random()*200,.05,'square',.03)}catch(e){}}}
    if(anyGone)L.coins=L.coins.filter(c=>!c.gone);
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
  if(!SURF.guard&&Math.abs(p.x-L.exit.x)<300&&Math.abs(p.y-L.exit.y)<200){const e=addEnemy(4,L.guardian.x,L.guardian.y-SURF.W.en[4].h*1.7,true);e.guardian=1;SURF.guard=e;SURF.msg=['THE GUARDIAN',2.5]}
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
  for(const f of SURF.fx){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=(f.b?-60:120)*dt}SURF.fx=SURF.fx.filter(f=>f.life>0);
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
  if(e.guardian&&SURF.idx===0&&!s.jet){s.jet=1;SURF.p.fuel=1;SURF.banner={t:8,lines:['YOU GOT A ROCKET PACK!','PRESS JUMP AGAIN IN THE AIR','AND HOLD IT TO FLY.','NOW YOU CAN EXPLORE FURTHER.']};shakeS=.3;try{sfxTone(300,1400,.6,'triangle',.05,{att:.005})}catch(e3){}
    for(let i=0;i<40;i++)SURF.fx.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:rnd(-110,110),vy:rnd(-150,-10),life:1.1,c:[WH,YL,OR,CY][i%4],s:2});save()}
  const key=SURF.idx+'_'+e.k;s.seen[key]=(s.seen[key]||0)+1;
  const n=Math.max(1,Math.round(sp.gold*(e.elite?4:1)));
  for(let i=0;i<Math.min(8,n);i++)SURF.L.coins.push({x:e.x+e.w/2,y:e.y+e.h/2,v:Math.ceil(n/Math.min(8,n)),vx:rnd(-60,60),vy:rnd(-120,-40),loose:1});
  for(let i=0;i<14;i++)SURF.fx.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:rnd(-80,80),vy:rnd(-100,20),life:.5,c:sp.pal[(i%3)+2],s:2});
}
function ebul(x,y,vx,vy,o){SURF.eb.push(Object.assign({x,y,vx,vy,life:2.4},o||{}))}
function aimBullets(e,n,sp,sd){const p=SURF.p,ox=e.x+e.w/2,oy=e.y+e.h*.4,a0=Math.atan2(p.y+8-oy,p.x+5-ox);for(let i=0;i<n;i++){const a=a0+(n>1?(i/(n-1)-.5)*(sd||.4):0);ebul(ox,oy,Math.cos(a)*sp,Math.sin(a)*sp)}try{sfxEnemyLaser()}catch(e2){}}
function updateEnemy(e,dt){
  if(e.guardian)dt*=.75;   // the guardian moves, charges and fires a quarter slower
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
  /* the background: a cave wall always, with the sky laid over it where the camera looks out at open air */
  const cxT=clamp(Math.floor((cam.x+VW/2)/TS),0,L.LW-1),cyT=clamp(Math.floor((cam.y+VH/2)/TS),0,L.LH-1);
  const skyT=L.sky(cxT,cyT)?1:0;
  SURF.skyK=SURF.skyK==null?skyT:SURF.skyK+(skyT-SURF.skyK)*.07;const sk=SURF.skyK;
  {ctx.fillStyle=(Wd.wallc||Wd.rock)[0];ctx.fillRect(0,0,VW,VH);const wi=A.wall,ox=-Math.floor(mod(cam.x*.45,128)),oy=-Math.floor(mod(cam.y*.45,96));for(let y=oy;y<VH;y+=96)for(let x=ox;x<VW;x+=128)ctx.drawImage(wi,x,y)}
  if(A.ribs){const f=.68,ox=-Math.floor(mod(cam.x*f,200)),oy=-Math.floor(mod(cam.y*f*.5,200));ctx.globalAlpha=Wd.cavern?.55:.7;for(let x=ox;x<VW;x+=200)for(let y=oy;y<VH;y+=200)ctx.drawImage(A.ribs,x,y);ctx.globalAlpha=1}
  const cxs=clamp(Math.floor((cam.x+VW/2)/TS),0,L.LW-1),sr0=L.surf[cxs]>=0?L.surf[cxs]:(SURF.srow==null?L.skyRow:SURF.srow);SURF.srow=SURF.srow==null?sr0:SURF.srow+(sr0-SURF.srow)*.05;const srow=SURF.srow;
  const horizon=clamp(150-(cam.y-(srow*TS-100))*.35,100,230);
  if(sk>.02){ctx.globalAlpha=sk;ctx.drawImage(A.sky,0,0);
    const alt=(srow*TS-(cam.y+VH/2))/TS,hk=clamp((alt-30)/110,0,1);
    if(SURF.idx<2){ctx.drawImage(A.skyobj,Math.floor(190-cam.x*.03),Math.floor(10-cam.y*.04));ctx.fillStyle=Wd.glow;for(let i=0;i<22;i++){const sx=mod(i*47-L.tick*(6+i%5),VW+20),sy=mod(i*31+Math.sin(L.tick*.7+i)*12,110)+4;ctx.globalAlpha=.5*sk;ctx.fillRect(sx|0,sy|0,2,2);ctx.globalAlpha=sk}}
    if(A.cloud&&SURF.idx<2)for(let i=0;i<4;i++){const c=A.cloud[i%3],sp=3+i*1.6,cxx=Math.floor(mod(i*131-L.tick*sp-cam.x*.06,VW+160))-80,cyy=Math.floor(14+((i*37)%50)-(cam.y-(srow*TS-100))*.05);ctx.globalAlpha=.55*sk;ctx.drawImage(c,cxx,cyy);ctx.globalAlpha=sk}
    if(SURF.idx===2||SURF.idx===4){ctx.fillStyle='#ffffff';for(let i=0;i<70;i++){const sx=mod(i*47.7-cam.x*.04*(1+i%3),VW),sy=mod(i*29.3-cam.y*.03*(1+i%3),VH),tw=.4+.6*Math.abs(Math.sin(L.tick*1.5+i));ctx.globalAlpha=sk*tw*(i%5?.5:1);ctx.fillRect(sx|0,sy|0,1+(i%7===0),1)}ctx.globalAlpha=sk;
      const px_=Math.floor(220-cam.x*.02),py_=Math.floor(40-cam.y*.02);ell2(ctx,px_,py_,30,SURF.idx===2?['#1c1840','#3c5a8a','#70a4b2','#ccffff']:['#3a0a38','#8a3aa6','#ff77ff','#ffccff'])}
    for(let l=0;l<3;l++){if(SURF.idx===2||SURF.idx===4)break;const img=A.far[l],f=[.1,.22,.38][l],ox=-Math.floor(mod(cam.x*f,320)),oy=Math.floor(horizon-img.height+[2,14,28][l]);
      for(let x=ox;x<VW;x+=320)ctx.drawImage(img,x,oy)}
    {const f=.5,span=A.decor.length*130;for(let i=0;i<A.decor.length*3;i++){const d=A.decor[i%A.decor.length],wx=i*130+((i*37)%50),x=Math.floor(wx-cam.x*f),y=Math.floor(horizon-d.height+16-(cam.y-(srow*TS-100))*.1);
      const xx=mod(x+60,span+VW)-60;if(xx>-d.width&&xx<VW)ctx.drawImage(d,xx,y)}}
    if(hk>0){const gr=ctx.createLinearGradient(0,0,0,VH);gr.addColorStop(0,'#02020e');gr.addColorStop(1,'#0c1040');ctx.globalAlpha=hk*.8*sk;ctx.fillStyle=gr;ctx.fillRect(0,0,VW,VH);ctx.fillStyle='#fff';for(let i=0;i<90;i++){const sx=mod(i*53.1-cam.x*.03,VW),sy=mod(i*37.7-cam.y*.02,VH);ctx.globalAlpha=hk*sk*(.3+.7*Math.abs(Math.sin(L.tick*1.3+i)));ctx.fillRect(sx|0,sy|0,1+(i%9===0),1)}}
    for(const c of L.clouds){const im=A.cloud&&A.cloud[c.s%3];if(!im)continue;const X=Math.floor(VW/2+(c.x-(cam.x+VW/2))*.7-im.width/2),Y=Math.floor(VH/2+(c.y-(cam.y+VH/2))*.7);if(X<-im.width||X>VW||Y<-30||Y>VH)continue;ctx.globalAlpha=.55*sk;ctx.drawImage(im,X,Y)}
    ctx.globalAlpha=1}
  /* each kind of room tints the light, and eases from one tint to the next */
  {const zn=L.zoneName(cxT,cyT),zi=zn?ZNAMES.indexOf(zn):0,tt=ZTW[SURF.idx][zi]||['#000000',0],pc=C32(tt[0]);
    const z=SURF.ztc=SURF.ztc||[0,0,0,0],tr=[pc&255,(pc>>>8)&255,(pc>>>16)&255,tt[1]];for(let k=0;k<4;k++)z[k]+=(tr[k]-z[k])*.04;
    SURF.zn=zn;if(z[3]>.01){ctx.globalAlpha=Math.min(.5,z[3]*.9);ctx.fillStyle='rgb('+(z[0]|0)+','+(z[1]|0)+','+(z[2]|0)+')';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}}
  /* tiles */
  const T=A.tiles,x0=Math.floor(cam.x/TS),x1=Math.min(L.LW-1,x0+41),y0=Math.floor(cam.y/TS),y1=Math.min(L.LH-1,y0+26);
  const tf=Math.floor(L.tick*3)%2;
  /* the painted ground */
  {const NCX=Math.floor((L.LW*TS-1)/CHW),NCY=Math.floor((L.LH*TS-1)/CHW),c0=Math.max(0,Math.floor(cam.x/CHW)),c1=Math.min(NCX,Math.floor((cam.x+VW)/CHW)),j0=Math.max(0,Math.floor(cam.y/CHW)),j1=Math.min(NCY,Math.floor((cam.y+VH)/CHW));
    const CH=L.chunks=L.chunks||{};
    for(let cj=j0;cj<=j1;cj++)for(let ci=c0;ci<=c1;ci++){const key=ci+cj*4096;if(!CH[key])CH[key]=bakeChunk(L,SURF.idx,ci,cj);CH[key].u=L.tick;ctx.drawImage(CH[key],Math.floor(ci*CHW-cam.x),Math.floor(cj*CHW-cam.y))}
    /* bake one neighbour a frame so scrolling never stalls, and forget chunks far behind */
    pre:for(let r=1;r<=2;r++)for(let cj=j0-r;cj<=j1+r;cj++)for(let ci=c0-r;ci<=c1+r;ci++){if(ci<0||cj<0||ci>NCX||cj>NCY)continue;const key=ci+cj*4096;if(!CH[key]){CH[key]=bakeChunk(L,SURF.idx,ci,cj);CH[key].u=L.tick;break pre}}
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
    else if(t===3)im=T.spikeA?T.spikeA[tf]:T.spike;else if(t===4){im=T.lava[Math.floor(L.tick*4)%4];if(ty>0&&L.g[(ty-1)*L.LW+tx]!==4){ctx.globalAlpha=.25+.07*Math.sin(L.tick*3+tx);ctx.fillStyle=OR;ctx.fillRect(X,Y-5,8,5);ctx.globalAlpha=.12;ctx.fillRect(X-2,Y-11,12,6);ctx.globalAlpha=1}}else if(t===5)im=T.spring;
    else if(t===6){const c=L.crum[ty*L.LW+tx];im=T.crumble;if(c&&c.state==='shake')ctx.globalAlpha=.6+.4*Math.sin(L.tick*60)}
    if(im){ctx.drawImage(im,X,Y);ctx.globalAlpha=1}
    if(t===6){const gl=L.g[ty*L.LW+tx-1],gr=L.g[ty*L.LW+tx+1],gu=ty>0?L.g[(ty-1)*L.LW+tx]:1,gd=ty<L.LH-1?L.g[(ty+1)*L.LW+tx]:1;ctx.fillStyle=K;if(gl===0)ctx.fillRect(X,Y,1,8);if(gr===0)ctx.fillRect(X+7,Y,1,8);if(gu===0)ctx.fillRect(X,Y-1,8,1);if(gd===0)ctx.fillRect(X,Y+7,8,1)}
    if(t===1){const h=((tx*73856093)^(ty*19349663))>>>0,sw=Math.floor(L.tick*1.5+h%7)%2;
      const zi=L.zmap[(ty>>6)*L.cols+((tx/96)|0)],ship=SURF.idx===2||SURF.idx===4,fz=ship?(zi===4?1:zi===1?.8:zi===5?.5:.1):(zi===4||zi===1?1:zi===5?.8:zi===2?.5:zi===3?.6:zi===9||zi===10?.5:.3);
      const cl=(((tx>>2)*2654435761)>>>0)%100,prob=(cl<55?85:10)*fz;
      if(ty>0&&L.g[(ty-1)*L.LW+tx]===0&&h%100<prob){const pl=A.plants.top[h%A.plants.top.length];ctx.drawImage(pl,X+4-(pl.width>>1)+sw,Y-pl.height+1)}
      else if(ty<L.LH-1&&L.g[(ty+1)*L.LW+tx]===0&&h%100<44){const pl=A.plants.hang[h%A.plants.hang.length];ctx.drawImage(pl,X+2+sw,Y+7)}}
  }
  if(Wd.lava){const gy=VH-80;for(let i=0;i<16;i++){ctx.globalAlpha=.03+i*.009;ctx.fillStyle=i<8?'#9a3a3a':'#ff9966';ctx.fillRect(0,gy+i*5,VW,5)}ctx.globalAlpha=1}
  for(const gl of L.glows){const X=gl.x*TS-cam.x,Y=gl.y*TS-cam.y,W=gl.w*TS,H=gl.h*TS;if(X>VW||X+W<0||Y>VH||Y+H<0)continue;const pu=.5+.5*Math.sin(L.tick*2+gl.x);ctx.globalAlpha=(gl.hint?.1:.07)+(gl.hint?.1:.05)*pu;ctx.fillStyle=gl.c;ctx.fillRect(X|0,Y|0,W,H);ctx.globalAlpha=(gl.hint?.12:.05)*pu;ctx.fillRect((X-4)|0,(Y-4)|0,W+8,H+8);ctx.globalAlpha=1}
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
  /* laser gates */
  for(const gt of (L.gates||[])){for(let j=0;j<gt.h;j++){const X=Math.floor(gt.x*TS-cam.x),Y=Math.floor((gt.y+j)*TS-cam.y);if(gt.on){ctx.drawImage(T.gate[tf],X,Y)}else{ctx.fillStyle=D;ctx.fillRect(X+3,Y,2,8)}}}
  /* wind */
  for(const u of L.ups){ctx.fillStyle='#ffffff55';for(let i=0;i<10;i++){const wx=u.x+8+((i*13)%(u.w-8)),wy=u.y+u.h-((L.tick*80+i*37)%u.h);ctx.fillRect((wx-cam.x)|0,(wy-cam.y)|0,1,3)}}
  /* lifts */
  for(const q of L.lifts){const X=Math.floor(q.x-cam.x),Y=Math.floor(q.y-cam.y);ctx.fillStyle=K;ctx.fillRect(X-1,Y,q.w+2,7);ctx.fillStyle=Wd.plat[0];ctx.fillRect(X,Y,q.w,5);ctx.fillStyle=Wd.plat[1];ctx.fillRect(X,Y,q.w,1);ctx.fillStyle=YL;for(let k=2;k<q.w-2;k+=6)ctx.fillRect(X+k,Y+2,2,1);ctx.fillStyle=D;ctx.fillRect(X+q.w/2-1,Y+5,2,2)}
  /* checkpoints */
  for(const c of L.checks){if(c.x<cam.x-20||c.x>cam.x+VW+20||c.y<cam.y-40||c.y>cam.y+VH+40)continue;const X=Math.floor(c.x-cam.x),Y=Math.floor(c.y-cam.y);ctx.fillStyle=K;ctx.fillRect(X-8,Y-2,16,3);ctx.fillStyle=c.on?CY:GM;ctx.fillRect(X-7,Y-2,14,2);if(c.on){ctx.fillStyle='#9ad2e044';ctx.fillRect(X-5,Y-30,10,28);ctx.fillStyle=WH;for(let i=0;i<4;i++)ctx.fillRect(X-4+((L.tick*30+i*9)%9),Y-4-((L.tick*40+i*11)%26),1,2)}}
  /* the beacon */
  {const e=L.exit,X=Math.floor(e.x-cam.x),Y=Math.floor(e.y-cam.y);ctx.drawImage(A.beacon,X,Y-28);const open=!(SURF.guard&&SURF.guard.hp>0);ctx.fillStyle=open?GREEN[3]:RD;ctx.fillRect(X+8,Y-24+((L.tick*8|0)%2),2,2);
    if(open&&!SURF.done&&Math.abs(p.x-e.x)<24){textC2('PRESS ENTER OR TAP THE BEACON',X+9,Y-38,YL)}}
  /* chests */
  for(const c of L.chests){if(c.x<cam.x-16||c.x>cam.x+VW+16||c.y<cam.y-12||c.y>cam.y+VH+12)continue;const im=A.chest[c.open?1:0];ctx.drawImage(im,Math.floor(c.x-cam.x),Math.floor(c.y-cam.y))}
  /* ship pieces glow where they lie */
  for(const sp of (L.shipPieces||[])){if(sv().pieces[sp.id])continue;const X=Math.floor(sp.x-cam.x),Y=Math.floor(sp.y-cam.y);if(X<-30||X>VW+30||Y<-30||Y>VH+30)continue;const ic=A.pieceIcons[sp.id],pu=.5+.5*Math.sin(L.tick*3.2),bob=Math.round(Math.sin(L.tick*2.4)*1.5);
    ctx.globalAlpha=.1+.07*pu;ctx.fillStyle='#ffffcc';ctx.fillRect(X-2,Y-60,4,60);ctx.globalAlpha=.08+.06*pu;ctx.fillRect(X-5,Y-60,10,60);
    ctx.globalAlpha=.2+.16*pu;ctx.fillStyle='#ffffaa';ctx.beginPath();ctx.arc(X,Y,22+pu*4,0,TAU);ctx.fill();ctx.globalAlpha=.9;ctx.fillStyle=WH;for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1]])ctx.drawImage(ic.off,X-7+ox,Y-6+bob+oy);ctx.globalAlpha=1;ctx.globalAlpha=.2+.12*pu;ctx.fillStyle=WH;ctx.beginPath();ctx.arc(X,Y,9,0,TAU);ctx.fill();ctx.globalAlpha=1;
    ctx.drawImage(ic.on,X-11,Y-9+bob,ic.w*1.6,ic.h*1.6);const a=L.tick*2.2;for(let k=0;k<4;k++){const aa=a+k*1.57,r=11+3*Math.sin(L.tick*4+k);ctx.fillStyle=k&1?YL:WH;ctx.fillRect(Math.round(X+Math.cos(aa)*r),Math.round(Y+Math.sin(aa)*r*.8),1,1)}
    if(((L.tick*5)|0)%6===0){ctx.fillStyle=WH;ctx.fillRect(X+6,Y-8,1,3);ctx.fillRect(X+5,Y-7,3,1)}}
  /* coins */
  for(const c of L.coins){if(c.x<cam.x-8||c.x>cam.x+VW+8||c.y<cam.y-8||c.y>cam.y+VH+8)continue;const X=Math.floor(c.x-cam.x-3),Y=Math.floor(c.y-cam.y-3+Math.sin(L.tick*4+c.x)*1),w=(Math.floor(L.tick*6+c.x)%4)===0?5:7;ctx.drawImage(A.coin,X,Y)}
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
  ctx.fillStyle='#000000aa';ctx.fillRect(4,VH-8,90,5);ctx.fillStyle=GREEN[1];ctx.fillRect(5,VH-7,Math.round(88*clamp(1-Math.hypot(p.x-SURF.L.exit.x,p.y-SURF.L.exit.y)/(SURF.L.dist0||1),0,1)),3);
  {const A=SURF.A,ids=SURF.pieceIds(SURF.idx),n=SURF.piecesFound(),y=p.fuel!=null&&s.jet?27:17;ctx.fillStyle='#000000aa';ctx.fillRect(4,y-1,40+ids.length*15,13);text('SHIP '+n+'/6',6,y+1,n>=6?GREEN[3]:'#bbbbbb',1);
    ids.forEach((id,k)=>ctx.drawImage(s.pieces[id]?A.pieceIcons[id].on:A.pieceIcons[id].off,40+k*15,y))}
  if(SURF.msg&&SURF.msg[1]>0)textC(SURF.msg[0],40,YL,1);
  if(SURF.intro&&!SURF.cut){const it=SURF.intro,A=SURF.A,ids=SURF.pieceIds(SURF.idx),f=ids.filter(k=>s.pieces[k]).length,n=SURF.piecesFound();
    const wrap=(t,w)=>{const o=[];let cur='';for(const wd of t.split(' ')){if((cur+' '+wd).trim().length>w){o.push(cur);cur=wd}else cur=(cur+' '+wd).trim()}if(cur)o.push(cur);return o};
    const hidden=ids.length===1?'ONE PIECE IS HIDDEN IN THIS LEVEL.':'TWO PIECES ARE HIDDEN IN THIS LEVEL.';
    const status=ids.length===1?(f?'THE PIECE FROM THIS LEVEL IS ALREADY FOUND.':'IT IS NOT FOUND YET.'):(f===2?'BOTH ARE ALREADY FOUND.':f===1?'ONE OF THEM IS FOUND. ONE IS STILL WAITING.':'NEITHER IS FOUND YET. THE SECOND IS THE HARDEST HIDING PLACE OF ALL.');
    let lines=[];if(it.first&&SURF.idx===0)lines=lines.concat(wrap('SIX PIECES OF A LUXURY SPACESHIP ARE HIDDEN IN THE SURFACE WORLDS. FIND ALL SIX TO WIN THE SHIP.',58),['']);
    lines=lines.concat(wrap('SHIP PIECES FOUND: '+n+' OF 6. '+hidden+' '+status,58));
    const h=lines.length*9+50,y0=Math.max(18,Math.round((VH-h)/2)-8),al=Math.min(1,it.t*3,(9-it.t)*2);
    ctx.globalAlpha=.9*al;ctx.fillStyle='#05031a';ctx.fillRect(16,y0,VW-32,h);ctx.globalAlpha=al;ctx.fillStyle=YL;ctx.fillRect(16,y0,VW-32,1);ctx.fillRect(16,y0+h-1,VW-32,1);ctx.fillStyle='#352879';ctx.fillRect(16,y0+1,VW-32,9);
    textC('THE SHIP PIECE HUNT',y0+3,YL,1);
    lines.forEach((ln,i)=>textC(ln,y0+14+i*9,i===0||ln.startsWith('SHIP PIECES')?WH:'#ccccee',1));
    const iy=y0+14+lines.length*9+3;for(let k=0;k<6;k++){const ic=A.pieceIcons[k],X=Math.round(VW/2-3*44+k*44+15),got=s.pieces[k],here=ids.includes(k);ctx.drawImage(got?ic.on:ic.off,X,iy);
      textC2(PIECE_NAMES[k],X+7,iy+13,got?GREEN[3]:here?YL:'#6c6c8c');if(here&&!got){ctx.fillStyle=YL;ctx.fillRect(X-1,iy-2,16,1);ctx.fillRect(X-1,iy+12,16,1)}}
    textC('PRESS ANY KEY OR TAP TO CLOSE',y0+h-9,'#8888aa',1);ctx.globalAlpha=1}
  if(SURF.banner){const b=SURF.banner,a=Math.min(1,b.t*2),h=b.lines.length*11+12,y0=54;ctx.globalAlpha=.85*a;ctx.fillStyle=K;ctx.fillRect(20,y0,VW-40,h);ctx.globalAlpha=a;ctx.fillStyle=YL;ctx.fillRect(20,y0,VW-40,1);ctx.fillRect(20,y0+h-1,VW-40,1);b.lines.forEach((ln,i)=>textC(ln,y0+7+i*11,i?WH:YL,1));ctx.globalAlpha=1}
  if(SURF.help>0){ctx.fillStyle='#000000cc';ctx.fillRect(0,VH-40,VW,33);const tch=typeof isTouch!=='undefined'&&isTouch;
    if(tch){textC('TOUCH: < > MOVE   JUMP   FIRE   UP AND DOWN FOR LADDERS',VH-37,WH,1);textC('TAP DOWN ON A THIN PLATFORM TO DROP THROUGH',VH-27,YL,1);textC('BEAM UP: TOP RIGHT BUTTON',VH-17,'#9ad2e0',1)}
    else{textC('MOVE: ARROWS OR WASD   JUMP: SPACE   FIRE: X, R OR MOUSE',VH-37,WH,1);textC('BEAM UP: B   STUCK: G   LADDERS: W/S   S+SPACE: DROP DOWN',VH-27,YL,1);textC('GAMEPAD: A JUMP   X, B OR RB FIRE   START BEAM UP',VH-17,'#9ad2e0',1)}}
  else if(!(typeof isTouch!=='undefined'&&isTouch)){textC('FIRE: X, R OR MOUSE   BEAM UP: B',VH-9,'#6c6c6c',1)}
  if(s.jet){const f=p.fuel==null?1:p.fuel;ctx.fillStyle='#000000aa';ctx.fillRect(4,16,78,9);text('ROCKET',6,17,YL,1);ctx.fillStyle=K;ctx.fillRect(48,17,32,6);ctx.fillStyle=f>.25?CY:RD;ctx.fillRect(49,18,Math.round(30*f),4);ctx.fillStyle=WH;ctx.fillRect(49,18,Math.round(30*f),1)}
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
  if(down&&SURF.intro&&SURF.intro.t>.6){SURF.intro=null;return true}
  const [x,y]=ptIn(e);let hit=null;
  for(const b of (SURF.touchBtns||[]))if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){hit=b.id;break}
  SURF.tp=SURF.tp||{};
  if(down){if(hit){SURF.tp[e.pointerId]=hit;SURF.touch[hit]=1;if(hit==='b')SURF.beamUp()}
    else{/* a tap on the beacon completes the level */const L=SURF.L,p=SURF.p;if(L&&L.exit&&Math.abs(p.x-L.exit.x)<26)tryExit()}}
  else{const id=SURF.tp[e.pointerId];if(id){delete SURF.touch[id];delete SURF.tp[e.pointerId]}}
  return true;
}
cv.addEventListener('pointerdown',e=>{if(MODE==='surface'){e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}if(e.pointerType==='mouse'&&e.button===0)SURF.mouseFire=true;setTouch(e,true)}},true);
cv.addEventListener('pointerup',e=>{if(e.pointerType==='mouse')SURF.mouseFire=false;if(MODE==='surface')setTouch(e,false)},true);
addEventListener('blur',()=>{SURF.mouseFire=false});
cv.addEventListener('pointercancel',e=>{SURF.mouseFire=false;if(MODE==='surface')setTouch(e,false)},true);
cv.addEventListener('pointermove',e=>{if(MODE!=='surface')return;const [x,y]=ptIn(e);const id=SURF.tp&&SURF.tp[e.pointerId];if(!id)return;const b=(SURF.touchBtns||[]).find(q=>q.id===id);if(b&&!(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)){delete SURF.touch[id];delete SURF.tp[e.pointerId]}},true);
SURF.WORLDS=WORLDS;
})();
