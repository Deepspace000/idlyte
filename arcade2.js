/* ===== arcade games 2 to 5: Block Breaker, Star Runner, Street Brawler, Grand Prix =====
   Classic script, loaded after the game. Uses the game's globals (ctx, W, H, text, UI, PAD, SAVE, beep, toast, AR, MODE).
   AR holds the running game: {g2:id, score, lives, state:'play'|'over', cd, t, ...}. arcadeExit() pays the prize. */
const ARC2=(function(){
const GAMES=[
 {id:'brk',n:'BLOCK BREAKER',d:'BOUNCE THE BALL AND SMASH EVERY BLOCK. LEFT AND RIGHT MOVE, FIRE LAUNCHES.'},
 {id:'shm',n:'STAR RUNNER',d:'A SIDEWAYS SHOOT EM UP. ARROWS FLY, HOLD FIRE TO SHOOT. GRAB POWER-UPS.'},
 {id:'fgt',n:'STREET BRAWLER',d:'ONE ON ONE FIGHTING. Z PUNCH, X KICK, DOWN+Z FIREBALL, HOLD BACK TO BLOCK.'},
 {id:'rac',n:'GRAND PRIX',d:'FORMULA ONE RACING. UP SPEEDS UP, DOWN BRAKES, REACH CHECKPOINTS FOR TIME.'}];
const PC=['#ff7777','#ff9966','#b8c76f','#9ad284','#70a4b2','#6c5eb5','#cc99ff'];
const held=k=>!!UI.keys[k];
const LEFT=()=>held('arrowleft')||held('a')||PAD.x<0,RIGHT=()=>held('arrowright')||held('d')||PAD.x>0,UP=()=>held('arrowup')||held('w')||PAD.y<0,DOWN=()=>held('arrowdown')||held('s')||PAD.y>0;
const FIREH=()=>held(' ')||held('z')||held('enter')||held('e')||held('x');
const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x|0,y|0,w|0,h|0)};
const rnd=(a,b)=>a+Math.random()*(b-a);
let ptr=null;
function ptrX(e){const r=cv.getBoundingClientRect();return (e.clientX-r.left)/r.width*W}
cv.addEventListener('pointermove',e=>{if(MODE==='arcade'&&AR&&AR.g2)ptr=ptrX(e)});
cv.addEventListener('pointerdown',e=>{if(MODE==='arcade'&&AR&&AR.g2)ptr=ptrX(e)});

/* Star Runner: drag a finger or the mouse anywhere to move the ship. keys and the on-screen arrows still work. */
const SD={on:false,tid:null,id:null,x:0,y:0};
function sdActive(){return MODE==='arcade'&&AR&&AR.g2==='shm'&&AR.state==='play'}
function sdMove(cx,cy){const r=cv.getBoundingClientRect(),A=AR;A.x=Math.max(14,Math.min(190,A.x+(cx-SD.x)*W/r.width));A.y=Math.max(26,Math.min(166,A.y+(cy-SD.y)*H/r.height));SD.x=cx;SD.y=cy}
document.addEventListener('pointerdown',e=>{if(!sdActive()||e.pointerType==='touch'||(e.target.closest&&e.target.closest('button')))return;SD.on=true;SD.tid=null;SD.id=e.pointerId;SD.x=e.clientX;SD.y=e.clientY},true);
document.addEventListener('pointermove',e=>{if(SD.on&&SD.tid===null&&e.pointerId===SD.id&&sdActive())sdMove(e.clientX,e.clientY)});
document.addEventListener('pointerup',e=>{if(SD.on&&SD.tid===null&&e.pointerId===SD.id)SD.on=false});
document.addEventListener('touchstart',e=>{if(!sdActive()||(e.target.closest&&e.target.closest('button')))return;const t=e.changedTouches[0];SD.on=true;SD.tid=t.identifier;SD.x=t.clientX;SD.y=t.clientY;e.preventDefault()},{passive:false,capture:true});
document.addEventListener('touchmove',e=>{if(!SD.on||SD.tid===null||!sdActive())return;for(const t of e.changedTouches)if(t.identifier===SD.tid){sdMove(t.clientX,t.clientY);e.preventDefault()}},{passive:false});
document.addEventListener('touchend',e=>{if(SD.on&&SD.tid!==null)for(const t of e.changedTouches)if(t.identifier===SD.tid)SD.on=false});
document.addEventListener('touchcancel',()=>{if(SD.tid!==null)SD.on=false});
function base(A){
  AR=A;A.g2=A.g2;A.score=0;A.lives=A.lives||3;A.state='play';A.t=0;A.cd=10;A.fx=[];A.pops=[];A.fire=0;return A;
}
function start(id){
  if(id==='brk')return brk.start();if(id==='shm')return shm.start();if(id==='fgt')return fgt.start();if(id==='rac')return rac.start();
}
function hud(A,title,extra){
  rect(0,0,W,14,'#000');rect(0,13,W,1,'#352879');
  text('SCORE',4,4,'#70a4b2',1);text(String(A.score|0).padStart(5,'0'),26,4,'#fff',1);
  text('HI',84,4,'#b8c76f',1);text(String(Math.max(SAVE['arcadeHi_'+A.g2]||0,A.score|0)).padStart(5,'0'),96,4,'#fff',1);
  text(title,150,4,'#9ad284',1);if(extra)text(extra,214,4,'#ff7777',1);
  uiBtn(280,1,36,12,()=>{if(A.state==='over')arcadeExit();else{A.state='over';A.cd=10}},(f)=>{rect(280,1,36,12,f?'#ff7777':'#6c5eb5');textC2('QUIT',298,4,'#fff')});
}
function overlay(A,msg,sub){
  rect(60,70,200,50,'#000');rect(60,70,200,1,'#6c5eb5');rect(60,119,200,1,'#6c5eb5');rect(60,70,1,50,'#6c5eb5');rect(259,70,1,50,'#6c5eb5');
  textC(msg,78,'#ff7777',2);textC(sub,100,'#ffffff',1);
  textC('CONTINUE IN '+Math.ceil(A.cd)+'   FIRE = CONTINUE (1 CREDIT)',110,'#70a4b2',1);
}
function lose(A){A.state='over';A.cd=10;beep(150,.5,'sawtooth',.05)}
function boom(A,x,y,n,c){A.fx.push({x:x-3,y:y-3,vx:0,vy:0,t:.08,c:'#ffffff',big:1});for(let i=0;i<(n||8);i++){const a=Math.random()*6.28,s=rnd(20,90);A.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:rnd(.3,.7),c:c||['#ffffff','#b8c76f','#ff9966','#ff7777'][i%4]})}}
function fxUpdate(A,dt){for(const f of A.fx){f.t-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt}A.fx=A.fx.filter(f=>f.t>0)}
function fxDraw(A){for(const f of A.fx){if(f.big)rect(f.x,f.y,7,7,f.c);else rect(f.x,f.y,f.t>.4?3:2,f.t>.4?3:2,f.c)}}
function addScore(A,n,x,y){A.score+=n;if(x!==undefined)A.pops.push({x,y,t:.7,s:String(n)});const k='arcadeHi_'+A.g2}
function popsDraw(A,dt,col){for(const p of A.pops){p.t-=dt;text(p.s,p.x|0,(p.y-(0.7-p.t)*14)|0,col||'#ffffff',1)}A.pops=A.pops.filter(p=>p.t>0)}
function over(A,dt,fire){A.cd-=dt;if(A.cd<=0)arcadeExit()}
function cont(A){
  if((SAVE.credits||0)<1){toast('NO CREDITS LEFT');return false}
  SAVE.credits--;save();A.state='play';A.cd=10;A.lives=3;return true;
}

/* ================= BLOCK BREAKER ================= */
const brk={
  start(){const A=base({g2:'brk'});A.level=1;A.px=160;A.pw=38;A.pu=[];A.wide=0;A.slow=0;this.layout(A);this.reset(A);return A},
  layout(A){
    A.br=[];const L=A.level;
    for(let r=0;r<7;r++)for(let c=0;c<13;c++){
      let on=true;
      if(L%4===2)on=(r+c)%2===0;else if(L%4===3)on=c>=r&&c<13-r;else if(L%4===0)on=(c%3)!==1||r%2===0;
      if(on)A.br.push({x:4+c*24,y:24+r*9,r,hp:(r<2&&L>1)?2:1,a:true});
    }
  },
  reset(A){A.balls=[{x:A.px,y:176,vx:0,vy:0,stuck:true}];A.slow=0},
  tick(A,dt){
    if(A.state==='over'){over(A,dt);return}
    fxUpdate(A,dt);const sp=LEFT()?-1:RIGHT()?1:0;
    if(sp)A.px+=sp*210*dt;else if(ptr!==null&&Math.abs(ptr-A.px)>1)A.px+=Math.sign(ptr-A.px)*Math.min(Math.abs(ptr-A.px),320*dt);
    A.px=Math.max(A.pw/2+2,Math.min(W-A.pw/2-2,A.px));
    if(A.wide>0){A.wide-=dt;A.pw=56}else A.pw=38;if(A.slow>0)A.slow-=dt;
    const base=(120+A.level*9)*(A.slow>0?.7:1);
    for(const b of A.balls){
      if(b.stuck){b.x=A.px;b.y=176;continue}
      const n=Math.ceil(base*dt/2);for(let s=0;s<n;s++){
        b.x+=b.vx*dt/n;b.y+=b.vy*dt/n;
        if(b.x<3){b.x=3;b.vx=Math.abs(b.vx)}if(b.x>W-3){b.x=W-3;b.vx=-Math.abs(b.vx)}if(b.y<17){b.y=17;b.vy=Math.abs(b.vy)}
        if(b.vy>0&&b.y>=178&&b.y<=184&&Math.abs(b.x-A.px)<=A.pw/2+2){const o=(b.x-A.px)/(A.pw/2);const a=o*1.05;const v=base;b.vx=Math.sin(a)*v;b.vy=-Math.cos(a)*v;b.y=177;beep(420,.04,'square',.03)}
        for(const k of A.br){if(!k.a)continue;if(b.x>k.x-2&&b.x<k.x+25&&b.y>k.y-2&&b.y<k.y+9){
          k.hp--;if(k.hp<=0){k.a=false;addScore(A,(7-k.r)*10,k.x,k.y);boom(A,k.x+11,k.y+4,4,PC[k.r%7]);if(Math.random()<.14)A.pu.push({x:k.x+11,y:k.y,k:'WMSL'[Math.floor(Math.random()*4)]})}
          beep(300+k.r*60,.05,'square',.03);
          const cx=k.x+11.5,cy=k.y+4.5;if(Math.abs(b.x-cx)/12>Math.abs(b.y-cy)/5)b.vx*=-1;else b.vy*=-1;break}}
      }
      if(b.y>H)b.dead=true;
    }
    A.balls=A.balls.filter(b=>!b.dead);
    for(const p of A.pu){p.y+=60*dt;if(p.y>=176&&p.y<=186&&Math.abs(p.x-A.px)<A.pw/2+6){p.got=true;
      if(p.k==='W')A.wide=12;else if(p.k==='S')A.slow=10;else if(p.k==='L')A.lives=Math.min(5,A.lives+1);else if(p.k==='M'){const b=A.balls[0];if(b&&!b.stuck){A.balls.push({x:b.x,y:b.y,vx:-b.vx,vy:b.vy},{x:b.x,y:b.y,vx:b.vy*.5,vy:-Math.abs(b.vx)-60})}}
      addScore(A,50);beep(900,.1,'square',.04)}}
    A.pu=A.pu.filter(p=>!p.got&&p.y<H);
    if(!A.balls.length){A.lives--;boom(A,A.px,180,10);if(A.lives<=0)lose(A);else this.reset(A)}
    if(!A.br.some(k=>k.a)){A.level++;addScore(A,500);A.pu=[];this.layout(A);this.reset(A);toast('BLOCKS CLEARED! LEVEL '+A.level)}
  },
  fire(A){const b=A.balls.find(q=>q.stuck);if(b){b.stuck=false;const a=rnd(-.4,.4);b.vx=Math.sin(a)*130;b.vy=-Math.cos(a)*130;beep(600,.06,'square',.03)}},
  draw(A,dt){
    for(const s of STARS){if(s.l===2)continue;ctx.fillStyle=s.c;ctx.fillRect(s.x|0,s.y|0,1,1)}
    for(let y=14;y<H;y+=6)rect(0,y,W,3,'#0a0a1e');
    rect(0,14,3,H-14,'#352879');rect(W-3,14,3,H-14,'#352879');rect(0,14,1,H-14,'#6c5eb5');rect(W-1,14,1,H-14,'#6c5eb5');rect(0,14,W,2,'#352879');
    for(const k of A.br){if(!k.a)continue;const c=PC[k.r%7];rect(k.x+1,k.y,22,7,c);rect(k.x+1,k.y,22,2,'#ffffffaa');rect(k.x+1,k.y,1,7,'#ffffff77');rect(k.x+1,k.y+5,22,2,'#00000077');rect(k.x+22,k.y,1,7,'#00000099');if(k.hp>1){rect(k.x+3,k.y+2,18,2,'#ffffff55');rect(k.x+1,k.y,22,1,'#ffffff')}}
    for(const p of A.pu){rect(p.x-6,p.y-3,12,7,'#000');rect(p.x-5,p.y-2,10,5,{W:'#70a4b2',M:'#cc99ff',S:'#b8c76f',L:'#ff7777'}[p.k]);text(p.k,p.x-2,p.y-2,'#fff',1)}
    const pw=A.pw;rect(A.px-pw/2,184,pw,5,'#959595');rect(A.px-pw/2,184,pw,1,'#ffffff');rect(A.px-pw/2,185,pw,1,'#bbbbbb');rect(A.px-pw/2,188,pw,1,'#444');rect(A.px-pw/2,184,3,5,'#ff7777');rect(A.px+pw/2-3,184,3,5,'#ff7777');rect(A.px-pw/2,184,3,1,'#ffffff');rect(A.px+pw/2-3,184,3,1,'#ffffff');
    for(const b of A.balls){b.tr=b.tr||[];b.tr.push(b.x,b.y);if(b.tr.length>12)b.tr.splice(0,2);
      for(let i=0;i<b.tr.length;i+=4){const g=i/b.tr.length;rect(b.tr[i]-1,b.tr[i+1]-1,3,3,g<.4?'#352879':g<.75?'#70a4b2':'#9ad2e0')}
      rect(b.x-2,b.y-2,4,4,'#ffffff');rect(b.x-2,b.y-2,1,1,'#9ad2e0');rect(b.x+1,b.y+1,1,1,'#bbbbbb')}
    fxDraw(A);popsDraw(A,dt,'#b8c76f');
    for(let i=0;i<A.lives-1;i++){rect(8+i*16,190,12,4,'#bbbbbb');rect(8+i*16,190,12,1,'#ffffff');rect(8+i*16,193,12,1,'#444');rect(8+i*16,190,2,4,'#ff7777');rect(18+i*16,190,2,4,'#ff7777')}
    text('X'+Math.max(0,A.lives-1),W-20,191,'#ffffff',1);
    hud(A,'LEVEL '+A.level,A.wide>0?'WIDE':A.slow>0?'SLOW':'');
    if(A.balls.some(b=>b.stuck)&&A.state==='play')textC('FIRE TO LAUNCH',150,'#ffffff',1);
    if(A.state==='over')overlay(A,'GAME OVER','SCORE '+(A.score|0));
  }
};

/* ================= STAR RUNNER (horizontal shoot em up) ================= */
const shm={
  start(){const A=base({g2:'shm'});A.x=40;A.y=100;A.st=[];for(let i=0;i<90;i++){const l=i%3;A.st.push({x:Math.random()*W,y:16+Math.random()*160,l})}A.scroll=0;A.pb=[];A.en=[];A.eb=[];A.pu=[];A.wave=1;A.spawnT=1;A.wt=0;A.wpn=1;A.invT=1.5;A.boss=null;A.bgx=0;return A},
  tick(A,dt){
    if(A.state==='over'){over(A,dt);return}
    A.t+=dt;fxUpdate(A,dt);A.wt+=dt;if(A.invT>0)A.invT-=dt;
    let dx=(RIGHT()?1:0)-(LEFT()?1:0),dy=(DOWN()?1:0)-(UP()?1:0);A.x=Math.max(14,Math.min(190,A.x+dx*100*dt));A.y=Math.max(26,Math.min(166,A.y+dy*100*dt));
    A.fire-=dt;if(A.fire<=0){A.fire=.16;const w=A.wpn;   // guns fire all the time, so a touch screen needs no fire button
      A.pb.push({x:A.x+12,y:A.y,vx:260,vy:0});if(w>=2){A.pb.push({x:A.x+8,y:A.y-5,vx:260,vy:-30},{x:A.x+8,y:A.y+5,vx:260,vy:30})}if(w>=3){A.pb.push({x:A.x+6,y:A.y-8,vx:240,vy:-70},{x:A.x+6,y:A.y+8,vx:240,vy:70})}beep(1100,.04,'square',.025)}
    for(const b of A.pb){b.x+=b.vx*dt;b.y+=b.vy*dt}A.pb=A.pb.filter(b=>b.x<W+4&&b.y>14&&b.y<H);
    // waves: enemies for 22s then a boss
    if(!A.boss){A.spawnT-=dt;
      if(A.spawnT<=0){const k=Math.floor(rnd(0,4)),n=A.wave;A.spawnT=Math.max(.55,1.5-n*.1);
        if(k===0){for(let i=0;i<5;i++)A.en.push({k:'ring',x:W+10+i*18,y:60+Math.random()*10+ (i%2)*0,y0:rnd(40,160),hp:1,t:i*.3,pts:100,w:16,h:9})}
        else if(k===1){const y=rnd(30,175);for(let i=0;i<4;i++)A.en.push({k:'dart',x:W+10+i*14,y,hp:1,t:0,pts:150,w:16,h:9})}
        else if(k===2)A.en.push({k:'cross',x:W+10,y:rnd(40,160),vy:rnd(-40,40),hp:3,t:0,pts:200,w:13,h:13});
        else A.en.push({k:'pod',x:W+10,y:rnd(40,160),hp:4,t:0,pts:300,w:17,h:13,carry:true})}
      if(A.wt>22){A.boss={x:W+60,y:100,hp:60+A.wave*25,mhp:60+A.wave*25,t:0,sh:2};A.en.length=0;toast('WARNING')}}
    for(const e of A.en){e.t+=dt;
      if(e.k==='ring'){e.x-=50*dt;e.y=e.y0+Math.sin(e.t*3)*30}else if(e.k==='dart'){e.x-=(110+A.wave*5)*dt;if(e.x>110)e.y+=Math.sign(A.y-e.y)*30*dt}
      else if(e.k==='cross'){e.x-=45*dt;e.y+=e.vy*dt;if(e.y<28||e.y>178)e.vy*=-1}else{e.x-=28*dt}
      if(e.k!=='dart'&&e.k!=='pod'||e.k==='pod'){e.sh=(e.sh||rnd(1,3))-dt;if(e.sh<=0&&e.x<W-20&&e.x>60){e.sh=rnd(1.8,3.4)-A.wave*.1;const a=Math.atan2(A.y-e.y,A.x-e.x),s=70+A.wave*4;A.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s})}}}
    const B=A.boss;if(B){B.t+=dt;if(B.x>250)B.x-=40*dt;B.y=100+Math.sin(B.t*.9)*52;B.sh-=dt;if(B.sh<=0&&B.x<=250){B.sh=.9;for(let i=-2;i<=2;i++){const a=Math.PI+i*.22+Math.sin(B.t)*.1;A.eb.push({x:B.x-26,y:B.y,vx:Math.cos(a)*90,vy:Math.sin(a)*90})}}}
    for(const b of A.eb){b.x+=b.vx*dt;b.y+=b.vy*dt}A.eb=A.eb.filter(b=>b.x>-6&&b.x<W+6&&b.y>10&&b.y<H+6);
    // hits on enemies
    const hitE=(e,w,h,dmg)=>{e.hp-=dmg;beep(500,.03,'square',.02);if(e.hp<=0&&!e.dead){e.dead=1;boom(A,e.x,e.y,8);addScore(A,e.pts,e.x,e.y);if(e.carry||Math.random()<.07)A.pu.push({x:e.x,y:e.y,k:Math.random()<.2?'L':'P'})}};
    for(const b of A.pb){for(const e of A.en){if(!e.dead&&Math.abs(b.x-e.x)<e.w/2+3&&Math.abs(b.y-e.y)<e.h/2+2){b.x=999;hitE(e,e.w,e.h,1);break}}
      if(B&&Math.abs(b.x-B.x)<24&&Math.abs(b.y-B.y)<30){b.x=999;B.hp--;if(B.hp<=0){boom(A,B.x,B.y,40);addScore(A,3000+A.wave*500,B.x,B.y);A.boss=null;A.wave++;A.wt=0;A.eb.length=0;toast('WAVE '+A.wave);A.pu.push({x:B.x,y:B.y,k:'L'})}}}
    A.en=A.en.filter(e=>!e.dead&&e.x>-20);
    for(const p of A.pu){p.x-=30*dt;if(Math.abs(p.x-A.x)<12&&Math.abs(p.y-A.y)<10){p.got=true;if(p.k==='P')A.wpn=Math.min(3,A.wpn+1);else A.lives=Math.min(5,A.lives+1);addScore(A,100);beep(1200,.1,'square',.04)}}A.pu=A.pu.filter(p=>!p.got&&p.x>-8);
    // player hit
    if(A.invT<=0){let hit=false;for(const b of A.eb)if(Math.abs(b.x-A.x)<8&&Math.abs(b.y-A.y)<5){hit=true;b.x=-99}
      for(const e of A.en)if(Math.abs(e.x-A.x)<e.w/2+9&&Math.abs(e.y-A.y)<e.h/2+5)hit=true;
      if(B&&Math.abs(B.x-A.x)<26&&Math.abs(B.y-A.y)<30)hit=true;
      if(hit){A.lives--;boom(A,A.x,A.y,16);A.wpn=Math.max(1,A.wpn-1);A.invT=2;A.x=40;A.y=100;if(A.lives<=0)lose(A)}}
  },
  draw(A,dt){
    A.scroll+=dt*60;
    for(const s of A.st){s.x-=(14+s.l*30)*dt*(A.state==='over'?.3:1);if(s.x<0){s.x+=W;s.y=16+Math.random()*160}ctx.fillStyle=['#444444','#959595','#ffffff'][s.l];ctx.fillRect(s.x|0,s.y|0,s.l===2?2:1,1)}
    {const sc=A.scroll;for(let x=0;x<W;x+=4){const wx=Math.floor((x+sc)/4);const hh=6+((wx*7919)%11)+Math.round(4*Math.sin(wx*.21));rect(x,H-hh,4,hh,'#1c1840');rect(x,H-hh,4,2,'#352879');if(wx%5===0)rect(x+1,H-hh-3,2,3,'#6c5eb5')}
      for(let x=0;x<W;x+=3){const wx=Math.floor((x+sc*1.8)/3);if((wx*31)%9===0)rect(x,H-4,2,2,'#6f3d86')}}
    for(const p of A.pu){rect(p.x-5,p.y-4,10,8,'#000');rect(p.x-4,p.y-3,8,6,p.k==='P'?'#ff9966':'#ff7777');text(p.k,p.x-2,p.y-2,'#fff',1)}
    for(const e of A.en){const fr=SPR[e.k==='ring'?'ring':e.k==='dart'?'dart':e.k==='cross'?'cross':'pod'];const f=fr[Math.floor(A.t*8)%fr.length];ctx.drawImage(f,(e.x-f.width/2)|0,(e.y-f.height/2)|0)}
    const B=A.boss;if(B){const x=B.x,y=B.y;rect(x-26,y-30,52,60,'#222');rect(x-24,y-28,48,56,'#6c6c6c');rect(x-24,y-28,48,6,'#bbbbbb');rect(x-30,y-8,10,16,'#ff7777');rect(x-14,y-12,28,24,'#444');rect(x-10,y-8,20,16,Math.floor(A.t*6)%2?'#ff7777':'#9a3a3a');rect(x-4,y-3,8,6,'#fff');
      rect(x-26,y-34,52,3,'#000');rect(x-26,y-34,52*B.hp/B.mhp,3,'#ff7777')}
    for(const b of A.pb){rect(b.x-4,b.y-1,7,2,'#b8c76f');rect(b.x+1,b.y-1,3,2,'#ffffff');rect(b.x-8,b.y,4,1,'#6f4f25')}
    for(const b of A.eb){rect(b.x-2,b.y-2,5,5,'#9a3a3a');rect(b.x-1,b.y-1,3,3,'#ff7777');rect(b.x,b.y,1,1,'#fff')}
    if(A.state!=='over'&&(A.invT<=0||Math.floor(A.t*14)%2)){const x=A.x|0,y=A.y|0,fl=Math.floor(A.t*20)%3;
      rect(x-17-fl*2,y-1,5+fl*2,3,'#ff9966');rect(x-15-fl,y,3+fl,1,'#ffffaa');rect(x-13,y-1,2,3,'#ffffff');
      rect(x-12,y-6,12,3,'#6c6c6c');rect(x-12,y-6,12,1,'#bbbbbb');rect(x-12,y+3,12,3,'#6c6c6c');rect(x-12,y+5,12,1,'#444444');
      rect(x-11,y-3,22,6,'#959595');rect(x-11,y-3,22,1,'#ffffff');rect(x-11,y-2,20,1,'#bbbbbb');rect(x-11,y+2,22,1,'#444444');
      rect(x+9,y-2,5,4,'#bbbbbb');rect(x+13,y-1,3,2,'#ffffff');rect(x+16,y,1,1,'#ffffff');
      rect(x+1,y-4,7,3,'#70a4b2');rect(x+2,y-4,3,1,'#ffffff');rect(x-6,y-1,5,2,'#444444');rect(x-10,y-1,2,2,'#ff7777')}
    fxDraw(A);popsDraw(A,dt);
    for(let i=0;i<A.lives-1;i++){rect(6+i*12,18,9,3,'#bbbbbb');rect(6+i*12,18,9,1,'#ffffff');rect(11+i*12,16,3,2,'#70a4b2')}
    hud(A,'WAVE '+A.wave,'GUN '+A.wpn);
    if(A.t<6&&A.state==='play')textC('DRAG TO FLY. YOUR GUNS FIRE BY THEMSELVES.',BOT-14,Math.floor(A.t*3)%2?'#ffffff':'#70a4b2',1);
    if(A.state==='over')overlay(A,'GAME OVER','SCORE '+(A.score|0));
  }
};

/* ================= STREET BRAWLER ================= */
const FPAL=[
 {gi:'#ffffff',gi2:'#bbbbbb',band:'#ff7777',skin:'#d8a878',pants:'#ffffff',hair:'#000000',n:'RYU-KEN'},
 {gi:'#ff7777',gi2:'#9a3a3a',band:'#ffffff',skin:'#9a6759',pants:'#68372b',hair:'#000000',n:'RED DRAGON'},
 {gi:'#70a4b2',gi2:'#3c6a78',band:'#b8c76f',skin:'#d8a878',pants:'#352879',hair:'#6f4f25',n:'BLUE WOLF'},
 {gi:'#588d43',gi2:'#2c5a2c',band:'#000000',skin:'#9a6759',pants:'#444444',hair:'#bbbbbb',n:'GREEN VIPER'},
 {gi:'#6f3d86',gi2:'#2a1a40',band:'#ff9966',skin:'#d8a878',pants:'#000000',hair:'#ff7777',n:'DARK MASTER'}];
const GY=170;
function mkF(x,face,pal,ai){return {x,y:GY,vy:0,face,hp:100,st:'idle',t:0,pal,ai,hitT:0,atk:null,cool:0,fb:0,ko:false,blocking:false,jumping:false,crouch:false,stun:0,wins:0}}
const fgt={
  start(){const A=base({g2:'fgt'});A.lives=1;A.stage=1;A.p=mkF(90,1,FPAL[0],false);A.o=null;A.shots=[];this.round(A,true);return A},
  round(A,first){
    const ov=Math.min(4,A.stage-1);A.o=mkF(230,-1,FPAL[1+ov%4],true);A.o.lvl=A.stage;A.p.x=90;A.p.hp=100;A.o.hp=100;A.p.st=A.o.st='idle';A.p.ko=A.o.ko=false;A.p.atk=A.o.atk=null;A.p.y=A.o.y=GY;A.shots=[];A.rt=60;A.intro=1.6;A.rnum=(A.p.wins||0)+(A.o.wins||0)+1;A.rend=0;
    if(first){A.p.wins=0;A.o.wins=0}
  },
  doAtk(f,type){
    if(f.atk||f.stun>0||f.ko||f.cool>0)return;
    const D={punch:{dur:.28,on:.08,off:.18,reach:24,dmg:8,hi:1},kick:{dur:.4,on:.12,off:.26,reach:30,dmg:12,hi:0},fire:{dur:.45,on:.2,off:.25,reach:0,dmg:0}}[type];
    f.atk={type,t:0,hit:false,...D};f.st=type;beep(type==='kick'?260:340,.06,'sawtooth',.03);
  },
  tick(A,dt){
    if(A.state==='over'){over(A,dt);return}
    A.t+=dt;fxUpdate(A,dt);const p=A.p,o=A.o;
    if(A.intro>0){A.intro-=dt;return}
    if(A.rend>0){A.rend-=dt;if(A.rend<=0){if(A.p.wins>=2){A.stage++;addScore(A,1000+Math.round(A.rt)*20,160,80);A.p.wins=0;A.o.wins=0;this.round(A,true)}else if(A.o.wins>=2){lose(A)}else this.round(A,false)}return}
    A.rt-=dt;
    // player input
    const dirx=(RIGHT()?1:0)-(LEFT()?1:0);
    if(!p.ko&&p.stun<=0&&!p.atk){
      p.crouch=DOWN()&&p.y>=GY;
      p.blocking=dirx!==0&&Math.sign(dirx)!==p.face&&p.y>=GY&&!p.crouch;
      if(!p.crouch&&!p.blocking&&dirx&&p.y>=GY){p.x+=dirx*72*dt;p.st='walk'}else if(p.y>=GY)p.st=p.crouch?'crouch':p.blocking?'block':'idle';
      if(UP()&&p.y>=GY&&!p.crouch){p.vy=-210}
    }
    for(const f of [p,o]){
      f.t+=dt;if(f.cool>0)f.cool-=dt;if(f.stun>0){f.stun-=dt;if(f.stun<=0&&!f.ko)f.st='idle'}
      f.vy+=620*dt;f.y+=f.vy*dt;if(f.y>=GY){f.y=GY;f.vy=0}else if(!f.ko&&!f.atk&&f.stun<=0)f.st='jump';
      if(f.atk){f.atk.t+=dt;if(f.atk.t>=f.atk.dur){f.atk=null;f.cool=.08;f.st='idle'}}
    }
    // facing
    if(!p.atk&&p.y>=GY)p.face=o.x>=p.x?1:-1;if(!o.atk&&o.y>=GY&&!o.ko)o.face=p.x>=o.x?1:-1;
    p.x=Math.max(20,Math.min(W-20,p.x));o.x=Math.max(20,Math.min(W-20,o.x));
    if(Math.abs(p.x-o.x)<18){const push=(18-Math.abs(p.x-o.x))/2;if(p.x<o.x){p.x-=push;o.x+=push}else{p.x+=push;o.x-=push}}
    this.ai(A,dt);
    // attacks connect
    for(const [a,d] of [[p,o],[o,p]]){if(!a.atk||a.atk.hit||a.atk.t<a.atk.on||a.atk.t>a.atk.off)continue;
      if(a.atk.type==='fire'){a.atk.hit=true;A.shots.push({x:a.x+a.face*16,y:a.y-26,vx:a.face*150,own:a===p,t:3});continue}
      const reach=a.atk.reach,hx=a.x+a.face*(10+reach/2);
      const hy=a.atk.type==='kick'?a.y-16:a.y-34,dy0=d.y-(d.crouch?20:44),dy1=d.y;
      if(Math.abs(hx-d.x)<reach/2+8&&hy>dy0-4&&hy<dy1+4&&!d.ko){a.atk.hit=true;this.hurt(A,a,d,a.atk.dmg)}}
    for(const s of A.shots){s.x+=s.vx*dt;s.t-=dt;const d=s.own?o:p;if(Math.abs(s.x-d.x)<12&&d.y-s.y<44&&d.y-s.y>-2&&!d.ko){s.t=0;this.hurt(A,s.own?p:o,d,14,true)}}
    A.shots=A.shots.filter(s=>s.t>0&&s.x>0&&s.x<W);
    if(!o.ko&&!p.ko&&A.rt<=0){A.rt=0;const w=p.hp>=o.hp?p:o;(w===p?o:p).hp=0;this.ko(A,w===p?o:p)}
  },
  hurt(A,a,d,dmg,proj){
    const block=d.blocking&&Math.sign(d.face)===-Math.sign(a.x-d.x)*-1&&d.y>=GY;
    const fac=(d.face===(a.x>d.x?1:-1));
    if(d.blocking&&fac){dmg=Math.max(1,Math.round(dmg*.2));beep(200,.05,'square',.03);d.x+=a.face*3;boom(A,d.x,d.y-30,2,'#bbbbbb')}
    else{if(d.crouch&&a.atk&&a.atk.hi)dmg=Math.round(dmg*.5);d.stun=.3;d.st='hit';d.atk=null;d.x+=a.face*8;beep(110,.08,'sawtooth',.05);boom(A,d.x,d.y-30,5,'#ffffff')}
    d.hp=Math.max(0,d.hp-dmg);if(a===A.p)addScore(A,dmg*5);
    if(d.hp<=0)this.ko(A,d);
  },
  ko(A,d){d.ko=true;d.st='ko';d.vy=-140;d.stun=9;A.rend=2.2;const w=d===A.p?A.o:A.p;w.wins++;beep(90,.6,'sawtooth',.06)},
  ai(A,dt){
    const o=A.o,p=A.p;if(o.ko||o.stun>0||p.ko)return;const L=A.stage,dx=p.x-o.x,dist=Math.abs(dx);
    o.ait=(o.ait||0)-dt;o.blocking=false;
    if(o.atk)return;
    if(p.atk&&dist<46&&Math.random()<.5+L*.06&&o.y>=GY){o.blocking=true;o.st='block';return}
    if(o.ait>0&&o.aiMove){o.x+=o.aiMove*68*dt;o.st=o.aiMove?'walk':'idle';return}
    o.ait=rnd(.15,.5)-Math.min(.2,L*.03);o.aiMove=0;
    if(dist>46)o.aiMove=Math.sign(dx);
    else if(dist<28&&Math.random()<.3)o.aiMove=-Math.sign(dx);
    else{const r=Math.random();if(r<.4+L*.04){this.doAtk(o,r<.22?'punch':'kick')}else if(r<.5&&o.y>=GY)o.vy=-200;else if(dist>60&&r<.55)this.doAtk(o,'fire')}
  },
  fire(A,gx){
    if(A.state==='over'||A.intro>0||A.rend>0)return;const p=A.p;
    if(DOWN())this.doAtk(p,'fire');else if(gx!==undefined&&gx>=160)this.doAtk(p,'kick');else this.doAtk(p,'punch');
  },
  key(A,k){if(k==='x')this.doAtk(A.p,'kick');else if(k==='z'||k===' '||k==='enter'||k==='e'){if(DOWN())this.doAtk(A.p,'fire');else this.doAtk(A.p,'punch')}},
  drawF(f,A,sil){
    const P=f.pal,fx=f.x|0,fy=f.y|0,s=f.face,st=f.st;
    const lie=f.ko&&f.y>=GY;
    const R=(dx,dy,w,h,c)=>{rect(fx+(s>0?dx:-dx-w),fy+dy,w,h,sil?'#000000':c)};
    if(!sil){ctx.fillStyle='#00000088';ctx.fillRect(fx-14,GY-1,28,3);ctx.fillRect(fx-10,GY+2,20,1)}
    if(lie){if(sil)return;rect(fx-22,fy-8,44,8,P.gi);rect(fx-24,fy-9,10,8,P.skin);rect(fx-24,fy-10,10,3,P.hair);rect(fx+14,fy-5,10,4,P.pants);return}
    const crouch=f.crouch||st==='crouch',air=f.y<GY-2;
    const by=crouch?-8:0;
    // legs
    if(st==='kick'&&f.atk){const e=f.atk.t<f.atk.on?.4:1;R(2,by-24,10+14*e|0,5,P.pants);R(0,by-20,6,12,P.pants);R(0,by-4,6,4,P.skin)}
    else if(air){R(0,by-16,5,8,P.pants);R(6,by-18,5,8,P.pants);R(0,by-9,5,3,P.skin);R(6,by-11,5,3,P.skin)}
    else if(crouch){R(-2,by-12,14,6,P.pants);R(-2,by-6,5,6,P.skin);R(7,by-6,5,6,P.skin)}
    else{const w=st==='walk'?(Math.floor(f.t*8)%2)*3:0;R(-4-w,by-22,6,20,P.pants);R(3+w,by-22,6,20,P.pants);R(-4-w,by-3,7,3,P.skin);R(3+w,by-3,7,3,P.skin)}
    // torso
    const lean=st==='hit'?-3:st==='block'?-2:0;
    R(-5+lean,by-38,13,17,P.gi);R(-5+lean,by-38,13,3,P.gi2);R(-5+lean,by-24,13,3,P.band);
    // head
    R(-3+lean,by-48,9,10,P.skin);R(-3+lean,by-50,9,4,P.hair);R(-3+lean,by-47,10,2,P.band);R(3+lean,by-44,2,2,'#000');
    // arms
    if(st==='punch'&&f.atk){const e=f.atk.t<f.atk.on?.4:1;R(4,by-37,6+Math.round(16*e),5,P.gi);R(10+Math.round(16*e),by-37,5,5,P.skin)}
    else if(st==='fire'&&f.atk){R(4,by-38,10,6,P.gi);R(14,by-39,6,8,P.skin)}
    else if(st==='block'){R(3,by-44,6,12,P.gi);R(3,by-46,5,4,P.skin)}
    else if(st==='hit'){R(-8,by-36,5,10,P.gi)}
    else{R(4,by-36,6,5,P.gi);R(8,by-32,6,6,P.gi);R(12,by-34,4,4,P.skin)}
  },
  draw(A,dt){
    // background: night city, crowd, floor
    rect(0,14,W,GY-14,'#1c1840');for(let i=0;i<18;i++)rect((i*47+10)%W,22+(i*31)%40,1,1,'#ffffff');
    for(let i=0;i<9;i++){const bh=40+((i*37)%50),bx=i*38-4;rect(bx,GY-bh-30,34,bh+30,'#352879');for(let j=0;j<bh/8;j++)for(let k=0;k<4;k++)if(((i*7+j*3+k)%3)===0)rect(bx+4+k*7,GY-bh-24+j*8,4,4,'#b8c76f')}
    rect(0,GY,W,H-GY,'#6f4f25');rect(0,GY,W,2,'#9a6759');for(let x=0;x<W;x+=22)rect(x,GY+8,12,1,'#68372b');for(let x=0;x<W;x+=40)rect(x,GY+18,18,1,'#68372b');
    for(let i=0;i<24;i++){const cx=i*14+4,bob=Math.sin(A.t*4+i)>0.4?1:0;rect(cx,GY-14-bob,6,8,['#ff7777','#70a4b2','#b8c76f','#cc99ff'][i%4]);rect(cx+1,GY-19-bob,4,5,'#d8a878')}
    rect(0,GY-6,W,6,'#222');
    const fs=[A.p,A.o].sort((a,b)=>a.y-b.y);for(const f of fs){ctx.save();for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1]]){ctx.translate(ox,oy);this.drawF(f,A,true);ctx.translate(-ox,-oy)}ctx.restore();this.drawF(f,A)}
    for(const s of A.shots){rect(s.x-5,s.y-4,10,8,'#70a4b2');rect(s.x-3,s.y-2,6,4,'#ffffff');rect(s.x-s.vx*.04,s.y-1,6,2,'#70a4b255')}
    fxDraw(A);popsDraw(A,dt);
    // bars
    rect(0,0,W,14,'#000');rect(0,13,W,1,'#352879');
    const bar=(x,w,hp,rev,col)=>{rect(x,3,w,7,'#444');rect(x+1,4,w-2,5,'#222');const fw=Math.round((w-2)*hp/100);rect(rev?x+w-1-fw:x+1,4,fw,5,col);rect(rev?x+w-1-fw:x+1,4,fw,1,'#ffffff55')};
    A.p.tr=Math.max(A.p.hp,(A.p.tr===undefined?A.p.hp:A.p.tr)-.5);A.o.tr=Math.max(A.o.hp,(A.o.tr===undefined?A.o.hp:A.o.tr)-.5);
    bar(4,118,A.p.tr,false,'#ff7777');bar(198,118,A.o.tr,true,'#ff7777');
    bar(4,118,A.p.hp,false,A.p.hp>30?'#b8c76f':'#ff9966');bar(198,118,A.o.hp,true,A.o.hp>30?'#b8c76f':'#ff9966');
    textC2(String(Math.ceil(A.rt)).padStart(2,'0'),160,4,'#fff');
    text(A.p.pal.n,6,12,'#ffffff',1);textR(A.o.pal.n,314,12,'#ffffff',1);
    for(let i=0;i<2;i++){rect(124+i*8,5,5,5,i<A.p.wins?'#b8c76f':'#444');rect(190-i*8,5,5,5,i<A.o.wins?'#b8c76f':'#444')}
    uiBtn(0,0,0,0,()=>{},()=>{});
    uiBtn(280,34,36,10,()=>{if(A.state==='over')arcadeExit();else{A.state='over';A.cd=10}},(f)=>{rect(280,34,36,10,f?'#ff7777':'#6c5eb5');textC2('QUIT',298,36,'#fff')});
    text('SCORE '+String(A.score|0).padStart(5,'0'),6,21,'#70a4b2',1);textC2('STAGE '+A.stage,160,16,'#9ad284');
    if(A.intro>0)textC(A.intro>.6?'ROUND '+A.rnum:'FIGHT!',90,'#ffffff',2);
    if(A.rend>0)textC(A.p.ko?'YOU LOSE':A.o.ko?(A.p.wins>=2?'YOU WIN!':'K.O.!'):'TIME UP',90,'#ff7777',2);
    if(A.state==='over')overlay(A,'GAME OVER','SCORE '+(A.score|0));
  }
};

/* ================= GRAND PRIX (formula one racing) ================= */
const SEG=40;
function curveAt(z){const s=Math.floor(z/SEG)%48;
  const T=[0,0,0,0,.6,.9,.9,.6,0,0,-.7,-1,-1,-.7,0,0,0,0,.4,.7,0,-.4,-.7,0,0,.5,1,1.2,1,.5,0,0,-.5,-.9,-1.1,-.9,-.5,0,0,0,.8,.8,0,-.8,-.8,0,0,0];
  return T[s]}
const rac={
  start(){const A=base({g2:'rac'});A.lives=1;A.pos=0;A.sp=0;A.x=0;A.time=45;A.cp=1;A.cars=[];A.crash=0;A.sky=0;A.lap=0;A.dist=0;
    for(let i=0;i<14;i++)A.cars.push({z:300+i*260+Math.random()*120,x:rnd(-.7,.7),sp:rnd(70,150),c:['#ff7777','#70a4b2','#b8c76f','#cc99ff','#ff9966'][i%5]});return A},
  tick(A,dt){
    if(A.state==='over'){over(A,dt);return}
    A.t+=dt;fxUpdate(A,dt);
    if(A.crash>0){A.crash-=dt;A.sp*=Math.max(0,1-dt*2.5)}
    else{const acc=UP()||FIREH();if(acc)A.sp=Math.min(300,A.sp+(A.sp<180?90:50)*dt);else A.sp=Math.max(0,A.sp-30*dt);if(DOWN())A.sp=Math.max(0,A.sp-190*dt)}
    const steer=(RIGHT()?1:0)-(LEFT()?1:0);
    const stp=ptr!==null&&!steer&&MODE==='arcade'&&AR===A&&Math.abs(A.ptrSteer||0)>0?A.ptrSteer:0;
    A.x+=steer*dt*1.5*(A.sp/300+.15)-curveAt(A.pos+10)*dt*(A.sp/300)*1.1;
    if(Math.abs(A.x)>1.05){A.sp=Math.max(55,A.sp-120*dt)}A.x=Math.max(-1.6,Math.min(1.6,A.x));
    A.pos+=A.sp*dt*1.7;A.dist+=A.sp*dt*1.7;
    A.time-=dt;if(A.time<=0){A.time=0;lose(A)}
    A.score=Math.floor(A.dist/12);
    if(A.pos>A.cp*3200){A.cp++;A.time+=22;toast('CHECKPOINT! +22 SECONDS');addScore(A,500);beep(1000,.2,'square',.05)}
    for(const c of A.cars){c.z+=c.sp*dt*1.7;const rel=c.z-A.pos;if(rel<-60){c.z=A.pos+3000+Math.random()*600;c.x=rnd(-.75,.75);c.sp=rnd(70,150+A.cp*10)}
      if(A.crash<=0&&rel>-8&&rel<14&&Math.abs(c.x-A.x)<.3){A.crash=1.1;A.sp=Math.min(A.sp,c.sp*.6);boom(A,160,165,14);beep(80,.4,'sawtooth',.06)}}
  },
  draw(A,dt){
    const HZ=82;
    // sky and mountains
    for(let y=14;y<HZ;y++){ctx.fillStyle=y<40?'#352879':y<58?'#6c5eb5':y<72?'#ff7777':'#ff9966';ctx.fillRect(0,y,W,1)}
    rect(210,50,26,26,'#b8c76f');rect(212,52,22,22,'#ffffaa');
    const sx=-(A.pos*.01+curveAt(A.pos)*A.t*0)%W;for(let i=0;i<9;i++){const mx=((i*60+sx)%(W+60)+W+60)%(W+60)-30,mh=18+((i*29)%24);for(let k=0;k<mh;k++)rect(mx-mh+k,HZ-k,2*(mh-k),1,k>mh-6?'#bbbbbb':'#352879')}
    rect(0,HZ-1,W,2,'#1c1840');
    // road
    let dxAcc=0,cx=W/2-A.x*34;
    for(let y=H-1;y>=HZ;y--){
      const t=(y-HZ+1)/(H-HZ),depth=1/t,wz=A.pos+depth*34;
      dxAcc+=curveAt(wz)*.9*(1/(depth*depth))*3.0;
      const half=Math.max(2,t*(158)),x0=cx-half*A.x*.0+dxAcc*(1)*6-(A.x*half*.55);
      const band=Math.floor(wz/(SEG*.5))%2;
      ctx.fillStyle=band?'#2c5a2c':'#588d43';ctx.fillRect(0,y,W,1);
      const rl=half+Math.max(1,t*9);ctx.fillStyle=band?'#ff7777':'#ffffff';ctx.fillRect((W/2+x0-W/2)|0,y,0,0);
      const cxr=W/2+dxAcc*6-A.x*half*.55*0+0;
      const left=cxr-rl,right=cxr+rl;
      ctx.fillRect(left|0,y,(right-left)|0,1);
      ctx.fillStyle=band?'#444444':'#555555';ctx.fillRect((cxr-half)|0,y,(half*2)|0,1);
      if(Math.floor(wz/(SEG*.25))%4===0&&t>.05){ctx.fillStyle='#ffffff';ctx.fillRect((cxr-1)|0,y,Math.max(1,t*3)|0,1)}
      if(Math.floor(wz/SEG)%8===0&&t>.04){ctx.fillStyle=band?'#ffffff':'#000000';ctx.fillRect((cxr-half)|0,y,(half*2)|0,1)}
      A._rowx=A._rowx||[];A._rowx[y]=[cxr,half]
    }
    // cars
    const vis=A.cars.filter(c=>c.z-A.pos>6&&c.z-A.pos<1800).sort((a,b)=>b.z-a.z);
    for(const c of vis){const depth=(c.z-A.pos)/34,y=Math.round(HZ+(H-HZ)/Math.max(1.05,depth));if(y>=H||y<HZ)continue;const rw=A._rowx[y];if(!rw)continue;
      const sc=(y-HZ)/(H-HZ),x=rw[0]+c.x*rw[1]*.9,w=Math.max(3,sc*34),h=Math.max(2,sc*14);this.car(x,y,w,h,c.c,false)}
    // player car
    const jig=A.crash>0?Math.sin(A.t*40)*3:0;
    this.car(W/2+(A.x*0)+jig+((RIGHT()?1:0)-(LEFT()?1:0))*3,H-10,40,18,'#ff7777',true);
    if(A.sp>20&&A.crash<=0){for(let i=0;i<3;i++)rect(W/2-20+Math.random()*40,H-2,2,1,'#6c6c6c')}
    fxDraw(A);popsDraw(A,dt);
    hud(A,'GRAND PRIX','');
    rect(4,16,76,22,'#000a');text('SPEED '+Math.round(A.sp)+' KMH',7,19,'#fff',1);text('TIME '+Math.ceil(A.time),7,29,A.time<10?'#ff7777':'#b8c76f',1);
    text('CHECKPOINT '+A.cp,220,16,'#70a4b2',1);
    if(A.state==='over')overlay(A,'TIME UP','SCORE '+(A.score|0));
  },
  car(x,y,w,h,c,me){
    x=x|0;y=y|0;w=Math.max(4,w|0);h=Math.max(3,h|0);
    const R=(dx,dy,ww,hh,col)=>rect(x+dx*w,y-dy*h,Math.max(1,ww*w),Math.max(1,hh*h),col);
    R(-.5,.62,.2,.62,'#111111');R(.3,.62,.2,.62,'#111111');R(-.5,.62,.2,.12,'#6c6c6c');R(.3,.62,.2,.12,'#6c6c6c');
    R(-.34,.5,.68,.34,c);R(-.34,.5,.68,.08,'#ffffff55');R(-.2,.86,.4,.4,c);R(-.2,.86,.4,.1,'#ffffff55');
    R(-.1,.96,.2,.22,'#ffffff');R(-.06,.92,.12,.12,'#222222');
    R(-.46,1.08,.92,.2,me?'#bbbbbb':c);R(-.46,1.08,.92,.05,'#ffffff');R(-.5,1.08,.06,.34,'#222222');R(.44,1.08,.06,.34,'#222222');
    R(-.12,.16,.24,.12,'#ff9966');
  }
};

const GM={brk,shm,fgt,rac};
return {GAMES,start,
  tick(A,dt){const g=GM[A.g2];g.tick(A,dt)},
  draw(A,dt){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);GM[A.g2].draw(A,dt)},
  fire(A,gx){if(A.state==='over'){if(A.cd<8.8)cont(A);return}const g=GM[A.g2];if(g.fire)g.fire(A,gx)},
  key(A,k){if(k==='escape'||k==='q'||k==='backspace'){if(A.state==='over')arcadeExit();else{A.state='over';A.cd=10}return}
    const g=GM[A.g2];if(A.state==='over'){if(k===' '||k==='enter'||k==='z'||k==='x'||k==='e')ARC2.fire(A);return}
    if(g.key)g.key(A,k);else if(k===' '||k==='enter'||k==='z'||k==='x'||k==='e'||k==='arrowup'||k==='w')this.fire(A)}};
})();
let 
