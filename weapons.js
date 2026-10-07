'use strict';
/* Exotic and emergent weapons. One exotic weapon is fitted at a time and fires by itself beside the main guns.
   Every weapon EVOLVES: kills made with it (kept in the save) unlock new forms, and every evolution also grows a random MUTATION
   (piercing, arcing, explosive, burning, seeking, splitting) that is kept for good, so each save ends up with its own version. */
window.WX=(function(){
  const TH=[0,150,600,2000];                       // kills needed for forms 0 to 3
  const TRAITS={
    pierce:['PIERCING','SHOTS PASS THROUGH MORE ENEMIES'],
    chain:['ARCING','HITS JUMP TO NEARBY ENEMIES'],
    blast:['EXPLOSIVE','HITS BURST IN A SMALL BLAST'],
    burn:['BURNING','ENEMIES KEEP TAKING DAMAGE'],
    homing:['SEEKING','SHOTS CURVE TOWARDS ENEMIES'],
    split:['SPLITTING','HITS SHATTER INTO FRAGMENTS']};
  const DEFS=[
    {id:'lance',n:'PLASMA LANCE',price:8000,eng:1,forms:['PLASMA LANCE','ION LANCE','NOVA LANCE','SUN LANCE'],d:'SLOW BOLTS THAT CUT THROUGH EVERYTHING.'},
    {id:'arc',n:'ARC CASTER',price:12000,eng:2,forms:['ARC CASTER','STORM CASTER','TEMPEST','THUNDER GOD'],d:'LIGHTNING THAT JUMPS FROM ENEMY TO ENEMY.'},
    {id:'rail',n:'RAILGUN',price:20000,eng:3,forms:['RAILGUN','HEAVY RAIL','LANCE RAIL','SINGULARITY'],d:'CHARGES, THEN FIRES A BEAM ACROSS THE SCREEN.'},
    {id:'seed',n:'LIVING SEED',price:30000,eng:3,forms:['LIVING SEED','SPOREPOD','HIVEMIND','LEVIATHAN'],d:'A SEED THAT BURSTS INTO HOMING SPORES AND GROWS.'},
    {id:'nova',n:'NOVA CORE',price:50000,eng:3,forms:['NOVA CORE','PULSE CORE','STAR CORE','SUPERNOVA'],d:'KILLS CHARGE IT. THEN IT RELEASES A RING OF FIRE.'}];
  const BY={};for(const d of DEFS)BY[d.id]=d;
  let FXW=[];
  const sv=()=>{const s=SAVE.wx||(SAVE.wx={});s.own=s.own||{};s.xp=s.xp||{};s.mut=s.mut||{};if(s.eq===undefined)s.eq=null;return s};
  const formOf=id=>{const x=sv().xp[id]||0;let f=0;for(let i=0;i<TH.length;i++)if(x>=TH[i])f=i;return f};
  const eq=()=>{const s=sv();return s.eq&&BY[s.eq]?s.eq:null};
  const powerOf=id=>(1+formOf(id))*7;
  function pr(id){const s=sv();return ((s.mut[id]||[]).map(t=>TRAITS[t][0]).join(' ')||'NONE')}

  /* ---- damage with credit ---- */
  function dealt(e,amt,id){
    if(!e||e.dead||e.immune||amt<=0)return;
    e.hp-=amt;e.flash=.07;e.wxk=id;
    if(e.hp<=0){e.dead=1;killEnemy(e)}
  }
  const live=()=>E.filter(e=>!e.dead&&e.x<W-4&&e.x>-10&&e.y>TOP-10&&e.y<BOT+10);
  function bolt(x0,y0,x1,y1,col,t){
    const pts=[[x0,y0]],n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/9));
    for(let i=1;i<n;i++){const k=i/n;pts.push([x0+(x1-x0)*k+rnd(-4,4),y0+(y1-y0)*k+rnd(-4,4)])}
    pts.push([x1,y1]);FXW.push({k:'bolt',pts,c:col||'#9ad2e0',t:t||.18,t0:t||.18});
  }
  function ring(x,y,r,col,t){FXW.push({k:'ring',x,y,r,c:col,t:t||.25,t0:t||.25})}

  /* ---- bullets ---- */
  function bullet(id,o){
    const s=sv(),b=Object.assign({wx:id,hs:new Set(),pierce:0,ch:0,bl:0,bn:0,sp:0,hom:0,age:0,depth:0},o);
    for(const t of (s.mut[id]||[])){
      if(t==='pierce')b.pierce+=2;else if(t==='chain')b.ch+=1;else if(t==='blast')b.bl=Math.max(b.bl,16);
      else if(t==='burn')b.bn=1;else if(t==='homing')b.hom=1;else if(t==='split')b.sp+=2}
    PB.push(b);return b;
  }
  function chain(e,b){
    let from=e;const used=new Set([e]);
    for(let i=0;i<b.ch;i++){
      let tg=null,bd=78;
      for(const q of live()){if(used.has(q)||q.immune)continue;const d=Math.hypot(q.x-from.x,q.y-from.y);if(d<bd){bd=d;tg=q}}
      if(!tg)break;used.add(tg);
      bolt(from.x,from.y,tg.x,tg.y,'#bde8ff',.2);dealt(tg,b.dmg*Math.pow(.7,i+1),b.wx);from=tg;
    }
  }
  function blast(x,y,r,dmg,id,skip){
    ring(x,y,r,'#ffaa55',.22);
    for(const q of live()){if(q===skip)continue;if(Math.hypot(q.x-x,q.y-y)<r+q.w/2)dealt(q,dmg,id)}
  }
  function burst(b){
    const f=formOf(b.wx),n=[3,5,7,9][f],maxD=[0,0,1,2][f];
    for(let i=0;i<n;i++){
      const a=(i/(n-1||1)-.5)*2.2+(Math.random()-.5)*.3,sp=120+Math.random()*50;
      bullet('seed',{x:b.x,y:b.y,vx:Math.cos(a)*sp+40,vy:Math.sin(a)*sp,dmg:b.dmg*.42,hom:f>=1?1:b.hom,life:1.5,spore:1,depth:b.depth+1,seed:b.depth+1<=maxD?1:0,sp:0,w:2});
    }
    FXW.push({k:'puff',x:b.x,y:b.y,t:.2,t0:.2});
  }
  function hit(b,e,hm){
    const dmg=b.dmg*hm;
    dealt(e,dmg,b.wx);b.hs.add(e);
    FX.push({x:b.x+3,y:b.y,vx:rnd(-30,30),vy:rnd(-30,30),life:.15,c:'#ffffff',s:1});
    if(b.bn&&!e.dead)e.wxBurn={t:3,d:Math.max(.3,dmg*.35),id:b.wx,tk:0};
    if(b.ch>0)chain(e,b);
    if(b.bl>0)blast(b.x,b.y,b.bl,dmg*.5,b.wx,e);
    if(b.sp>0&&!b.frag){for(let i=0;i<b.sp;i++){const a=(i-(b.sp-1)/2)*.7;bullet(b.wx,{x:b.x,y:b.y,vx:Math.cos(a)*190,vy:Math.sin(a)*190,dmg:dmg*.3,frag:1,life:.8,w:2,hom:b.hom})}}
    if(b.seed)burst(b);
    if(b.pierce>0)b.pierce--;else b.dead=1;
  }
  function up(b,dt){
    b.age+=dt;
    if(b.hom){let tg=null,bd=1e9;for(const e of E){if(e.dead||e.x<b.x-6)continue;const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<bd){bd=d;tg=e}}
      if(tg){const sp=Math.hypot(b.vx,b.vy)||1,want=Math.atan2(tg.y-b.y,tg.x-b.x),cur=Math.atan2(b.vy,b.vx);let da=want-cur;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;const na=cur+Math.max(-1,Math.min(1,da))*dt*(b.spore?7:5);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp}}
    if(b.life&&b.age>b.life){if(b.seed)burst(b);b.dead=1}
    if(b.kind==='seed'&&!b.dead&&(b.x>150+formOf('seed')*8||b.age>1.4)){burst(b);b.dead=1}
  }

  /* ---- weapons ---- */
  function fireLance(f,d){
    const mk=dy=>bullet('lance',{x:P.x+shk(16),y:P.y+dy,vx:260,vy:0,dmg:d*3.2*(1+.55*f),pierce:[3,6,99,99][f],len:10+f*4,w:2+(f>=1?1:0)+(f>=3?1:0),bl:f>=2?14:0,f});
    if(f>=3){mk(-6);mk(6)}else mk(0);
  }
  function fireArc(f,d){bullet('arc',{x:P.x+shk(16),y:P.y,vx:320,vy:0,dmg:d*1.2*(1+.25*f),ch:2+f*2,len:6,w:2,f})}
  function fireRail(f,d){
    const hh=3+f*3,dmg=d*10*(1+.6*f);
    FXW.push({k:'beam',x:P.x+shk(16),y:P.y,hh,f,t:.3,t0:.3});
    for(const e of E){if(e.dead||e.x<P.x||e.x>W+20)continue;
      const hm=e.hitTest?e.hitTest(e,e.x,P.y):(Math.abs(P.y-e.y)<e.h/2+hh?1:0);
      if(hm>0){dealt(e,dmg*hm,'rail');FX.push({x:e.x,y:P.y,vx:rnd(-40,40),vy:rnd(-40,40),life:.2,c:'#ffffff',s:2});
        if(sv().mut.rail&&sv().mut.rail.includes('burn')&&!e.dead)e.wxBurn={t:3,d:Math.max(.3,dmg*.12),id:'rail',tk:0}}}
    shake=Math.max(shake,.08);
  }
  function fireSeed(f,d){bullet('seed',{x:P.x+shk(16),y:P.y,vx:160,vy:0,dmg:d*1.5*(1+.3*f),seed:1,kind:'seed',w:3,f})}
  function fireNova(f,d){
    const n=[10,16,24,32][f],clr=[0,45,65,90][f];
    for(let i=0;i<n;i++){const a=i/n*6.283;bullet('nova',{x:P.x,y:P.y,vx:Math.cos(a)*190,vy:Math.sin(a)*190,dmg:d*2.4*(1+.3*f),pierce:[0,1,3,99][f],life:1.2,w:2,f})}
    ring(P.x,P.y,clr||30,'#ff99cc',.4);
    if(clr)EB=EB.filter(b=>Math.hypot(b.x-P.x,b.y-P.y)>clr);
    shake=Math.max(shake,.12);
  }
  const FIRE={lance:fireLance,arc:fireArc,rail:fireRail,seed:fireSeed};
  const CD={lance:1.15,arc:.5,rail:2.6,seed:1.3};

  /* ---- run state ---- */
  function st(){if(G.wx&&G.wx.g===G)return G.wx;G.wx={g:G,cd:1,en:0,strike:3,xpRun:0};FXW=[];return G.wx}
  function tick(dt){
    const id=eq();if(!id||!G||G.state!=='play'||!P)return;
    const s=st(),f=formOf(id),d=G.stats.dmg,fr=1+Math.max(0,G.stats.fire-1.4)*.2;
    for(const e of E){if(e.wxBurn){const b=e.wxBurn;b.tk-=dt;b.t-=dt;if(b.tk<=0){b.tk=.5;dealt(e,b.d,b.id)}if(b.t<=0||e.dead)e.wxBurn=null}}
    if(id==='nova'){const need=[12,10,8,6][f];if(s.en>=need&&E.length){s.en=0;fireNova(f,d)}}
    else{s.cd-=dt;if(s.cd<=0&&E.length){s.cd=CD[id]/fr;FIRE[id](f,d)}}
    if(id==='arc'&&f>=2){s.strike-=dt;if(s.strike<=0){s.strike=f>=3?1.6:3;const c=live().filter(e=>!e.immune);for(let i=0;i<(f>=3?3:2)&&c.length;i++){const e=c.splice(Math.floor(Math.random()*c.length),1)[0];bolt(e.x+rnd(-6,6),TOP,e.x,e.y,'#ffffff',.3);dealt(e,d*4,'arc')}}}
  }

  /* ---- evolution ---- */
  function onKill(e){
    const id=eq();if(!id||!G||!G.wx)return;
    const s=st();if(s.en!==undefined&&id==='nova')s.en+=e.type==='boss'?10:e.type==='mini'?5:1;
    if(e.wxk!==id)return;
    const S=sv(),w=e.type==='boss'?25:e.type==='mini'?10:1,f0=formOf(id);
    S.xp[id]=(S.xp[id]||0)+w;const f1=formOf(id);
    if(f1>f0){
      const have=S.mut[id]||(S.mut[id]=[]),keys=Object.keys(TRAITS),fresh=keys.filter(k=>!have.includes(k)),pool=fresh.length?fresh:keys,t=pool[Math.floor(Math.random()*pool.length)];
      have.push(t);G.msg='EVOLVED: '+BY[id].forms[f1];G.msgT=3;
      if(typeof toast==='function')toast(BY[id].forms[f1]+' GAINED '+TRAITS[t][0]);
      ring(P.x,P.y,50,'#ffffff',.5);save();
    }
  }

  /* ---- drawing ---- */
  function line(x0,y0,x1,y1,c){const n=Math.max(1,Math.round(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));ctx.fillStyle=c;for(let i=0;i<=n;i++)ctx.fillRect((x0+(x1-x0)*i/n)|0,(y0+(y1-y0)*i/n)|0,1,1)}
  function draw(b){
    const x=b.x|0,y=b.y|0,id=b.wx;
    if(id==='lance'){const L=b.len,c=['#9ad2e0','#70a4b2','#ffddaa','#ffffaa'][b.f||0];
      ctx.fillStyle='#352879';ctx.fillRect(x-L-6,y,6,1);ctx.fillStyle=c;ctx.fillRect(x-L,y-b.w,L+4,b.w*2+1);ctx.fillStyle='#fff';ctx.fillRect(x-L+3,y-1,L,3);ctx.fillRect(x+3,y-b.w-1,1,b.w*2+3)}
    else if(id==='arc'){ctx.fillStyle='#bde8ff';ctx.fillRect(x-4,y-1,8,3);ctx.fillStyle='#fff';ctx.fillRect(x-2,y,5,1);ctx.fillStyle='#70a4b2';ctx.fillRect(x-8,y+(Math.floor(b.x/3)%2?-1:1),4,1)}
    else if(id==='seed'){const p=Math.floor(b.age*10)%2;
      if(b.spore){ctx.fillStyle=p?'#b8c76f':'#9ad284';ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle='#fff';ctx.fillRect(x,y,1,1)}
      else{ctx.fillStyle='#2c5a2c';ctx.fillRect(x-4,y-3,8,7);ctx.fillStyle='#9ad284';ctx.fillRect(x-3,y-2,6,5);ctx.fillStyle=p?'#ffffaa':'#b8c76f';ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle='#fff';ctx.fillRect(x,y,1,1)}}
    else if(id==='nova'){ctx.fillStyle='#ff99cc';ctx.fillRect(x-2,y-2,5,5);ctx.fillStyle='#fff';ctx.fillRect(x-1,y-1,3,3)}
    else{ctx.fillStyle='#ffffff';ctx.fillRect(x-1,y-1,3,3)}
  }
  function drawFx(dt){
    FXW=FXW.filter(f=>(f.t-=dt)>0);
    for(const f of FXW){
      const k=f.t/f.t0;
      if(f.k==='bolt'){for(let i=1;i<f.pts.length;i++)line(f.pts[i-1][0],f.pts[i-1][1],f.pts[i][0],f.pts[i][1],k>.5?'#ffffff':f.c)}
      else if(f.k==='ring'){const r=f.r*(1-k*.6),n=Math.max(10,Math.round(r*1.4));ctx.fillStyle=k>.5?'#ffffff':f.c;for(let i=0;i<n;i++){const a=i/n*6.283;ctx.fillRect((f.x+Math.cos(a)*r)|0,(f.y+Math.sin(a)*r)|0,1,1)}}
      else if(f.k==='beam'){const h=f.hh*k+1,y=f.y|0,x0=f.x|0,c=['#70a4b2','#9ad2e0','#ffddaa','#ffffff'][f.f||0];
        ctx.fillStyle=c;ctx.fillRect(x0,(y-h-1)|0,W-x0,(h*2+3)|0);ctx.fillStyle='#fff';ctx.fillRect(x0,(y-h/2)|0,W-x0,Math.max(1,h)|0)}
      else if(f.k==='puff'){ctx.fillStyle='#ffffaa';for(let i=0;i<6;i++){const a=i/6*6.283,r=(1-k)*8+2;ctx.fillRect((f.x+Math.cos(a)*r)|0,(f.y+Math.sin(a)*r)|0,2,2)}}
    }
    const id=eq();
    if(id==='nova'&&G.wx&&G.wx.g===G){const f=formOf(id),need=[12,10,8,6][f],q=Math.min(1,G.wx.en/need),n=Math.round(q*12);ctx.fillStyle='#ff99cc';for(let i=0;i<n;i++){const a=i/12*6.283-1.57;ctx.fillRect((P.x+Math.cos(a)*shk(15))|0,(P.y+Math.sin(a)*shk(15))|0,1,1)}}
  }

  /* ---- shop ---- */
  function shopRows(rows){
    const S=sv(),cur=eq(),base=shipPowerRaw()-(cur?powerOf(cur):0);
    for(const d of DEFS){
      const own=S.own[d.id],need=(SAVE.crew.eng||0)<d.eng;
      if(!own){
        rows.push({ic:'wx_'+d.id,f:0,n:d.n,d:need?'NEEDS ENGINEER LV '+d.eng+': '+d.d:'EXOTIC. '+d.d+' IT EVOLVES THE MORE IT KILLS.',r:need?'LOCKED':String(d.price),ok:!need&&SAVE.coins>=d.price,pw:need?null:[shipPowerRaw(),base+7],
          fn:()=>{if(SAVE.coins<d.price){toast('NOT ENOUGH GOLD');return}SAVE.coins-=d.price;S.own[d.id]=1;S.eq=d.id;toast('BOUGHT AND FITTED '+d.n);checkUnlocks();save()}});
      }else{
        const f=formOf(d.id),x=S.xp[d.id]||0,fitted=cur===d.id,nx=f<3?'NEXT FORM AT '+TH[f+1]+' KILLS':'FULLY EVOLVED';
        rows.push({ic:'wx_'+d.id,f,n:d.forms[f]+(fitted?'  (FITTED)':''),d:x+' KILLS. '+nx+'. MUTATIONS: '+pr(d.id),r:fitted?'':'FIT',ok:!fitted,pw:fitted?null:[shipPowerRaw(),base+powerOf(d.id)],
          fn:()=>{S.eq=d.id;toast(d.forms[f]+' FITTED');save()}});
      }
    }
    if(cur)rows.push({n:'REMOVE EXOTIC WEAPON',d:'GO BACK TO THE STANDARD GUNS ONLY.',r:'',ok:true,fn:()=>{S.eq=null;toast('EXOTIC WEAPON REMOVED');save()}});
  }


  /* ---- exotic shields: bought in levels (max 3) in the armour shop, all of them can be fitted at once ---- */
  const SHD=[
    {id:'layered',n:'LAYERED PLATING',base:15000,mul:2.4,eng:2,d:'THE SHIELD BLOCKS 2 MORE HITS PER LEVEL.',unit:'+2 HITS'},
    {id:'reflect',n:'MIRROR SHIELD',base:25000,mul:2.4,eng:3,d:'A BLOCKED HIT THROWS NEARBY ENEMY BULLETS BACK AT THEM.',unit:'WIDER BLAST'},
    {id:'novash',n:'NOVA SHIELD',base:40000,mul:2.4,eng:3,d:'WHEN THE SHIELD BREAKS IT EXPLODES, WIPING BULLETS AND HURTING ENEMIES.',unit:'BIGGER NOVA'},
    {id:'regen',n:'REGEN FIELD',base:30000,mul:2.4,eng:3,d:'RAISES A SMALL SHIELD AGAIN BY ITSELF EVERY FEW SECONDS.',unit:'FASTER'}];
  const SBY={};for(const d of SHD)SBY[d.id]=d;
  const sl=id=>(sv().sh&&sv().sh[id])||0;
  const shPrice=id=>Math.round(SBY[id].base*Math.pow(SBY[id].mul,sl(id))/50)*50;
  function shieldRows(rows,pwNow){
    const S=sv();S.sh=S.sh||{};
    for(const d of SHD){
      const l=sl(d.id),mx=l>=3,need=(SAVE.crew.eng||0)<d.eng,p=shPrice(d.id);
      rows.push({ic:'sh_'+d.id,f:Math.max(0,l-1),n:d.n+'  LV '+l+'/3',d:need?'NEEDS ENGINEER LV '+d.eng+': '+d.d:d.d,r:mx?'MAX':need?'LOCKED':String(p),ok:!mx&&!need&&SAVE.coins>=p,
        pw:(mx||need)?null:[shipPowerRaw(),shipPowerRaw()+4],
        fn:()=>{if(SAVE.coins<p){toast('NOT ENOUGH GOLD');return}SAVE.coins-=p;S.sh[d.id]=l+1;toast(d.n+' LEVEL '+(l+1));checkUnlocks();save()}});
    }
  }
  function shieldPower(){return 4*SHD.reduce((a,d)=>a+sl(d.id),0)}
  function shieldHits(){return 2*sl('layered')}
  /* called from hurtPlayer when the shield absorbed a hit; broke = it has just run out of hits */
  function shieldHit(broke){
    const d=G.stats.dmg,r=sl('reflect');
    if(r){const rad=44+r*22;ring(P.x,P.y,rad,'#9ad2e0',.35);
      const keep=[];for(const b of EB){if(Math.hypot(b.x-P.x,b.y-P.y)<rad){PB.push({x:b.x,y:b.y,vx:210,vy:(b.y-P.y)*.6,dmg:d*(1+r),lv:2})}else keep.push(b)}EB=keep}
    const n=sl('novash');
    if(broke&&n){const rad=[0,70,110,999][n];ring(P.x,P.y,Math.min(rad,150),'#ff99cc',.5);EB=EB.filter(b=>Math.hypot(b.x-P.x,b.y-P.y)>rad);
      for(const e of live())if(Math.hypot(e.x-P.x,e.y-P.y)<rad+20)dealt(e,d*5*n,'novash');shake=Math.max(shake,.3)}
  }
  function shieldTick(dt){
    const l=sl('regen');if(!l||G.state!=='play')return;
    const s=st();s.rg=(s.rg||0)+dt;
    if(s.rg>=[0,22,15,9][l]){s.rg=0;if(P.shield<=0){P.shield=5+l*2;P.shHit=1+Math.floor(l/2)+shieldHits()/2|0;G.msg='REGEN SHIELD';G.msgT=1;ring(P.x,P.y,22,'#9ad2e0',.3)}}
  }

  return {shieldRows,shieldPower,shieldHits,shieldHit,shieldTick,SHD,DEFS,TH,TRAITS,sv,eq,formOf,power:()=>{const id=eq();return id?powerOf(id):0},powerOf,tick,up,hit,onKill,draw,drawFx,shopRows,
    label:()=>{const id=eq();return id?BY[id].forms[formOf(id)]:''},
    /* dev: WX.give('arc',700) buys the weapon, fits it and sets its kills */
    give(id,xp){const S=sv();S.own[id]=1;S.eq=id;if(xp!=null)S.xp[id]=xp;return formOf(id)}};
})();
