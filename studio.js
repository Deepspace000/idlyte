'use strict';
/* MUSIC STUDIO: a piece of the mission music is made from a seed (the same seed always gives the same piece).
   Ten minutes of it are shown as a whole chord progression, any chord can be changed (root and type), the result can be listened to,
   and exported as a WAV file (rendered offline) or a MIDI file. Opened from Settings in the station menu. */
const QUALS=[
 ['maj',[0,4,7]],['min',[0,3,7]],['sus4',[0,5,7]],['sus2',[0,2,7]],['dim',[0,3,6]],['aug',[0,4,8]],
 ['maj7',[0,4,7,11]],['m7',[0,3,7,10]],['7',[0,4,7,10]],['m7b5',[0,3,6,10]],['dim7',[0,3,6,9]],['m(maj7)',[0,3,7,11]],['6',[0,4,7,9]],['m6',[0,3,7,9]],
 ['7sus4',[0,5,7,10]],['maj7#5',[0,4,8,11]],['7#5',[0,4,8,10]],['7b5',[0,4,6,10]],['add9',[0,2,4,7]],
 ['maj9',[0,2,4,7,11]],['maj13',[0,2,4,7,9,11]],['maj7#11',[0,4,6,7,11]],['maj9#11',[0,2,4,6,7,11]],['6/9',[0,2,4,7,9]],
 ['m9',[0,2,3,7,10]],['m11',[0,2,3,5,7,10]],['m13',[0,2,3,7,9,10]],
 ['9',[0,2,4,7,10]],['13',[0,2,4,7,9,10]],['7b9',[0,1,4,7,10]],['7#9',[0,3,4,7,10]],['7#11',[0,4,6,7,10]],['7b13',[0,4,7,8,10]],['alt',[0,1,4,6,8,10]],['9sus4',[0,2,5,7,10]]];
const QKEY={};QUALS.forEach((q,i)=>{if(QKEY[q[1].join()]===undefined)QKEY[q[1].join()]=i});
const SCOPES=['THIS BAR','SECTION','WHOLE PIECE'];
const PRESETS=[['I IV V I',[0,3,4,0]],['I V vi IV',[0,4,5,3]],['ii V I I',[1,4,0,0]],['i VI III VII',[0,5,2,6]],['i iv V i',[0,3,4,0]],['I vi IV V',[0,5,3,4]],['i VII VI V',[0,6,5,4]],['CIRCLE OF FIFTHS',[0,3,6,2,5,1,4,0]]];
const KINDTAG={left:'<5TH',right:'5TH>',parallel:'PAR',relative:'REL',augmented:'AUG',tritone:'TRI',mediant:'MED',chromatic:'CHR',shiftUp:'+m3',shiftDown:'-M3',dim7:'DIM',hard:'LIFT'};
const STU={ready:false,seed:1,start:0,len:260,edits:{},bars:[],events:[],plan:[],cur:0,scroll:0,scope:0,preset:0,busy:'',busyT:0,typing:false,seedTxt:'',pad:false,voice:3,pv:null,playBar:-1,msgT:0,msg:''};
const stuBarDur=()=>60/104*4;

/* a name for every piece, made from its seed: mostly sci-fi, now and then quirky */
function pieceName(seed){
  let a=((seed|0)*2654435761)>>>0;const r=()=>{a=(Math.imul(a,1664525)+1013904223)>>>0;return a/4294967296},pick=l=>l[Math.floor(r()*l.length)];
  const ADJ=['Silent','Neon','Cryo','Slow','Binary','Hollow','Distant','Amber','Quiet','Solar','Lunar','Ghost','Velvet','Crystal','Faint','Orbital','Radiant','Static','Drifting','Midnight','Ionised','Polar','Weightless','Sapphire'];
  const NOUN=['Orbit','Signal','Horizon','Transit','Nebula','Beacon','Drift','Lullaby','Voyage','Aurora','Relay','Meridian','Eclipse','Echo','Airlock','Pulsar','Comet','Satellite','Probe','Colony','Gateway','Observatory','Starlight','Hyperspace'];
  const PLACE=['Andromeda','Kepler','Titan','Europa','Proxima','Vega','Ganymede','Cassini','Sirius','Io','Triton','Orion','Callisto','Lyra','Pleiades','Mira'];
  const QUIRK=['My Toaster Is On Mars','Please Do Not Feed The Nebula','Gravity Is Optional','A Moderately Large Comet','Space Hamster Blues','The Polite Robots Apologise','Elevator Music For Black Holes','Lost Luggage In Orbit','Seven Tiny Moons','The Captain Forgot The Password','Slightly Haunted Airlock','Waltz For A Confused Satellite','Aliens Borrowed My Umbrella','Tea Time At Zero G','The Cat Has Left The Station','Mild Turbulence Ahead','Beep Boop Bossa Nova','Nobody Ordered This Planet'];
  const roll=r();
  if(roll<.16)return pick(QUIRK);
  if(roll<.46)return pick(ADJ)+' '+pick(NOUN);
  if(roll<.66)return pick(NOUN)+' Of '+pick(PLACE);
  if(roll<.82)return pick(PLACE)+' '+(2+Math.floor(r()*98))+pick(['b','c','d','','']);
  if(roll<.92)return pick(['Return To','Beyond','Last Light Over','Letters From','Night Shift At'])+' '+pick(PLACE);
  return pick(ADJ)+' '+pick(NOUN)+' '+pick(['In D','No. 9','Suite','Reprise','(Slow Version)']);
}
const stuSlug=()=>pieceName(STU.seed).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/* a name for any set of chord tones: a known quality if there is one, otherwise worked out from the intervals (third, fifth, seventh, then 9, 11, 13 and alterations) */
function qualityName(tones){
  const q=QKEY[tones.join()];if(q!==undefined)return QUALS[q][0];
  const has=x=>tones.includes(x),M3=has(4),m3=has(3),s4=has(5)&&!M3&&!m3,s2=has(2)&&!M3&&!m3&&!s4;
  const b5=has(6)&&!has(7),a5=has(8)&&!has(7)&&!M3?false:has(8)&&!has(7);
  const maj7=has(11),b7=has(10),dim7=has(9)&&m3&&b5;
  let n='';
  const ext=has(9)&&(maj7||b7)?'13':has(5)&&(M3||m3)&&(maj7||b7)?'11':has(2)&&(maj7||b7)?'9':'';
  if(dim7)return 'dim7'+(has(2)?'(9)':'');
  if(m3&&b5&&b7)n='m7b5';else if(m3)n=(maj7?'m(maj7)':b7?'m':'m')+(ext||(b7?'7':''));else if(M3)n=maj7?'maj'+(ext||'7'):b7?(ext||'7'):(has(9)?'6':'maj');else if(s4)n='7sus4';else if(s2)n='sus2';
  if(m3&&!b5&&b7&&ext)n='m'+ext;
  if(m3&&maj7&&ext)n='m(maj'+ext+')';
  if(!maj7&&!b7&&!m3&&M3&&has(9)&&has(2))n='6/9';
  if(has(8)&&M3&&!has(7))n=(maj7?'maj7':'7')+'#5';
  const alt=[];
  if(has(1)&&!has(2))alt.push('b9');if(has(3)&&M3)alt.push('#9');if(has(6)&&has(7)&&(M3||m3))alt.push('#11');if(has(8)&&has(7))alt.push('b13');if(b5&&M3&&b7)alt.push('b5');
  return n+alt.join('')||'?';
}
function chordName(ch){
  const base=KEYN[((ch.root%12)+12)%12]+qualityName(ch.tones);
  return ch.bass!==undefined&&ch.bass!==ch.root?base+'/'+KEYN[ch.bass]:base;
}
function studioBuild(){
  const keep=ARP,st=arpNewState(STU.seed);
  ARP=st;st.sink=[];st.rec=[];st.edits=STU.edits;st.padOverride=STU.pad;st.startVoice=STU.voice;
  try{arpNewCycle();const bd=stuBarDur();for(let i=0;i<STU.start+STU.len;i++)arpBar(i*bd)}finally{ARP=keep}
  STU.bars=st.rec.slice(STU.start);STU.plan=st.plan;
  STU.events=st.sink.filter(e=>e.t>=STU.start*stuBarDur()-1e-6).sort((a,b)=>a.t-b.t);
  STU.cur=Math.max(0,Math.min(STU.bars.length-1,STU.cur));
}
function studioInit(){
  STU.ready=true;STU.edits={};
  const sv=SAVE.studio;
  if(sv){STU.seed=sv.seed;STU.start=sv.start|0}else{STU.seed=1+Math.floor(Math.random()*999998);STU.start=0}
  STU.voice=mus.wave|0;STU.pad=false;STU.cur=0;STU.scroll=0;studioBuild();
}
function studioNewSeed(seed,start){
  studioStop();STU.seed=Math.max(1,seed|0)%1000000||1;STU.start=start|0;STU.edits={};STU.cur=0;STU.scroll=0;studioBuild();
  STU.seedHist=(STU.seedHist||[]);STU.seedHist.push(STU.seed);
}
function stuFlash(t){STU.msg=t;STU.msgT=3}

/* ---- editing ---- */
function stuCurChord(){const b=STU.bars[STU.cur];return b?b.ch:null}
function stuApply(mut){
  const b=STU.bars[STU.cur];if(!b)return;
  const orig=b.ch,sig=orig.root+'|'+orig.tones.join(),targets=[];
  STU.bars.forEach((x,i)=>{
    if(STU.scope===0){if(i===STU.cur)targets.push(x)}
    else if(STU.scope===1){if(x.si===b.si&&(x.ch.root+'|'+x.ch.tones.join())===sig)targets.push(x)}
    else if((x.ch.root+'|'+x.ch.tones.join())===sig)targets.push(x)});
  for(const x of targets){
    const c=x.ch,nr=mut.root!==undefined?mut.root:c.root,qi=mut.q!==undefined?mut.q:(QKEY[c.tones.join()]!==undefined?QKEY[c.tones.join()]:6);
    STU.edits[x.bn]={root:((nr%12)+12)%12,tones:QUALS[((qi%QUALS.length)+QUALS.length)%QUALS.length][1].slice()};
  }
  studioBuild();
}
function stuRoot(d){const c=stuCurChord();if(c)stuApply({root:c.root+d})}
function stuType(d){const c=stuCurChord();if(!c)return;const q=QKEY[c.tones.join()];stuApply({q:(q!==undefined?q:6)+d})}
function stuReset(){const b=STU.bars[STU.cur];if(!b)return;delete STU.edits[b.bn];studioBuild();stuFlash('BAR RESET')}
function stuPreset(){
  const b=STU.bars[STU.cur];if(!b)return;const sec=STU.plan[b.si],pr=PRESETS[STU.preset%PRESETS.length];
  STU.bars.forEach(x=>{if(x.si!==b.si)return;const idx=x.bar;if(idx>=sec.bars-2)return;
    STU.edits[x.bn]=arpChord(sec.key,pr[1][idx%pr[1].length],sec.minor)});
  stuFlash('PRESET '+pr[0]+' APPLIED TO THE SECTION');STU.preset++;studioBuild();
}

/* ---- listening ---- */
function studioStop(){
  const pv=STU.pv;if(!pv)return;
  clearInterval(pv.timer);try{for(const o of [pv.out,pv.bassOut,pv.padOut])o.gain.setTargetAtTime(0,AC.currentTime,.08);const os=[pv.out,pv.bassOut,pv.padOut];setTimeout(()=>{for(const o of os){try{o.disconnect()}catch(e){}}},1500)}catch(e){}
  STU.pv=null;STU.playBar=-1;
}
function studioPlay(){
  studioStop();
  if(!AC||AC.state!=='running'||!mus.in){stuFlash('CLICK OR PRESS A KEY IN THE GAME FIRST SO SOUND CAN START');return}
  const out=AC.createGain(),dl=AC.createDelay(2),fb=AC.createGain(),wet=AC.createGain();
  dl.delayTime.value=60/104*.75;fb.gain.value=.36;wet.gain.value=.3;out.connect(mus.in);out.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(mus.in);
  // bass dry to the master, pad into a long reverb
  const bassOut=AC.createGain();bassOut.connect(mus.gain);
  const padOut=AC.createGain(),pcv=AC.createConvolver(),sr0=AC.sampleRate,pl=Math.floor(sr0*4.2),pir=AC.createBuffer(2,pl,sr0);for(let c=0;c<2;c++){const d=pir.getChannelData(c);for(let i=0;i<pl;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/pl,2.2)}
  pcv.buffer=pir;const pw=AC.createGain(),pd=AC.createGain();pw.gain.value=.95;pd.gain.value=.22;padOut.connect(pcv);pcv.connect(pw);pw.connect(mus.gain);padOut.connect(pd);pd.connect(mus.gain);
  const bd=stuBarDur(),from=(STU.start+STU.cur)*bd;let idx=0;while(idx<STU.events.length&&STU.events[idx].t<from-1e-6)idx++;
  STU.pv={out,bassOut,padOut,t0:AC.currentTime+.25,from,idx,end:0,timer:setInterval(studioPvTick,150)};
}
function studioPvTick(){
  const pv=STU.pv;if(!pv||!AC)return;
  const now=AC.currentTime;
  while(pv.idx<STU.events.length){
    const e=STU.events[pv.idx],ts=e.t-pv.from+pv.t0;if(ts>now+2.2)break;pv.idx++;if(ts<now-.05)continue;
    if(e.pad)arpPad(ts,e.m,e.d,e.v,pv.padOut);else if(e.bass)arpBass(ts,e.m,e.d,e.v,pv.bassOut);else arpNote(ts,e.m,e.d,e.v,pv.out,undefined,e.vc);
  }
  const pb=Math.floor((now-pv.t0)/stuBarDur())+((pv.from/stuBarDur())|0)-STU.start;
  STU.playBar=pb>=0&&pb<STU.bars.length?pb:-1;
  if(pv.idx>=STU.events.length){pv.end=(pv.end||0)+1;if(pv.end>40)studioStop()}
}

/* ---- export: WAV rendered offline, and MIDI ---- */
function stuDownload(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},5000)}
/* the WAV is rendered offline in 30 second pieces (each with a tail for the reverb that is added into the next piece), so the page stays responsive
   and never has to hold ten minutes of audio graph at once. mono, 32 kHz, 16 bit */
async function studioWav(){
  if(STU.busy)return;
  studioStop();
  const sr=32000,bd=stuBarDur(),t0=STU.start*bd,total=STU.len*bd,SEG=30,TAIL=9,nSeg=Math.ceil(total/SEG);
  const nOut=Math.ceil((total+TAIL)*sr),mix=new Float32Array(nOut);
  STU.busy='RENDERING';STU.busyT=0;STU.busyN='0/'+nSeg;const tm=setInterval(()=>{STU.busyT+=.5},500);
  try{
    const sorted=STU.events;let ei=0;
    // the reverb impulses are made once and reused by every piece
    let sd=12345;const irLen=Math.floor(sr*2.4),ir1=new Float32Array(irLen);for(let i=0;i<irLen;i++){sd=(sd*1103515245+12345)&0x7fffffff;ir1[i]=((sd/0x7fffffff)*2-1)*Math.pow(1-i/irLen,2.6)}
    sd=777;const pl=Math.floor(sr*4.2),ir2=new Float32Array(pl);for(let i=0;i<pl;i++){sd=(sd*1103515245+12345)&0x7fffffff;ir2[i]=((sd/0x7fffffff)*2-1)*Math.pow(1-i/pl,2.2)}
    for(let sg=0;sg<nSeg;sg++){
      await new Promise(r=>setTimeout(r,30));
      const a=t0+sg*SEG,b=a+SEG,X=new OfflineAudioContext(1,Math.ceil((SEG+TAIL)*sr),sr);
      const master=X.createGain();master.connect(X.destination);
      const out=X.createGain(),mi=X.createGain();
      const d1=X.createDelay(2),f1=X.createGain(),w1=X.createGain();d1.delayTime.value=60/104*.75;f1.gain.value=.36;w1.gain.value=.3;
      out.connect(mi);out.connect(d1);d1.connect(f1);f1.connect(d1);d1.connect(w1);w1.connect(mi);mi.connect(master);
      const c1=X.createConvolver(),b1=X.createBuffer(1,irLen,sr);b1.getChannelData(0).set(ir1);c1.buffer=b1;const cw=X.createGain();cw.gain.value=.6;mi.connect(c1);c1.connect(cw);cw.connect(master);
      const d2=X.createDelay(1),f2=X.createGain(),w2=X.createGain();d2.delayTime.value=.32;f2.gain.value=.3;w2.gain.value=.26;mi.connect(d2);d2.connect(f2);f2.connect(d2);d2.connect(w2);w2.connect(master);
      const bassOut=X.createGain();bassOut.connect(master);
      const padOut=X.createGain(),c2=X.createConvolver(),b2=X.createBuffer(1,pl,sr);b2.getChannelData(0).set(ir2);c2.buffer=b2;const pw=X.createGain(),pd=X.createGain();pw.gain.value=.95;pd.gain.value=.22;
      padOut.connect(c2);c2.connect(pw);pw.connect(master);padOut.connect(pd);pd.connect(master);
      let used=0;
      for(let i=0;i<sorted.length;i++){
        const e=sorted[i];if(e.t<a-1e-6||e.t>=b-1e-6)continue;used++;
        const ts=Math.max(0,e.t-a);
        if(e.pad)arpPad(ts,e.m,e.d,e.v,padOut,X);else if(e.bass)arpBass(ts,e.m,e.d,e.v,bassOut,X);else arpNote(ts,e.m,e.d,e.v,out,X,e.vc);
      }
      const buf=await X.startRendering(),data=buf.getChannelData(0),off=Math.round(sg*SEG*sr);
      for(let i=0;i<data.length&&off+i<nOut;i++)mix[off+i]+=data[i];
      STU.busyN=(sg+1)+'/'+nSeg;
    }
    let pk=0;for(let i=0;i<nOut;i+=5)pk=Math.max(pk,Math.abs(mix[i]));
    const sc=pk>0?.89/pk:1,n=nOut,wav=new DataView(new ArrayBuffer(44+n*2));
    const ws=(o,s2)=>{for(let i=0;i<s2.length;i++)wav.setUint8(o+i,s2.charCodeAt(i))};
    ws(0,'RIFF');wav.setUint32(4,36+n*2,true);ws(8,'WAVE');ws(12,'fmt ');wav.setUint32(16,16,true);wav.setUint16(20,1,true);wav.setUint16(22,1,true);wav.setUint32(24,sr,true);wav.setUint32(28,sr*2,true);wav.setUint16(32,2,true);wav.setUint16(34,16,true);ws(36,'data');wav.setUint32(40,n*2,true);
    for(let i=0;i<n;i++){const v=Math.max(-1,Math.min(1,mix[i]*sc));wav.setInt16(44+i*2,v<0?v*32768:v*32767,true)}
    stuDownload(new Blob([wav],{type:'audio/wav'}),'idlyte-'+stuSlug()+'-'+STU.seed+'.wav');
    stuFlash('WAV SAVED: '+Math.round(total)+' SECONDS');
  }catch(err){stuFlash('WAV FAILED: '+(err&&err.message||err))}
  clearInterval(tm);STU.busy='';
}
function studioMidi(){
  const tpq=480,bd=stuBarDur(),t0=STU.start*bd,spt=60/104/tpq,evs=[];
  const vlq=n=>{const b=[n&127];n>>=7;while(n>0){b.unshift((n&127)|128);n>>=7}return b};
  const add=(tick,order,bytes)=>evs.push({tick,order,bytes});
  const ch0={a:0,p:1,b:2};
  for(const e of STU.events){
    const tk=Math.round((e.t-t0)/spt);if(tk<0)continue;
    const note=Math.max(0,Math.min(127,Math.round(e.m+MUSTR))),len=Math.max(40,Math.round(Math.min(e.d,e.k==='p'?e.d:4)*(e.k==='a'?.9:.95)/spt)),c=ch0[e.k]||0;
    const vel=e.k==='p'?46:e.k==='b'?84:Math.max(36,Math.min(118,Math.round(e.v/.05*82)));
    add(tk,1,[0x90|c,note,vel]);add(tk+len,0,[0x80|c,note,0]);
  }
  STU.bars.forEach((b,i)=>{const nm=chordName(b.ch),tx=Array.from(nm).map(x=>x.charCodeAt(0));add(Math.round(i*bd/spt),-1,[0xFF,0x06,tx.length].concat(tx))});
  evs.sort((a,b)=>a.tick-b.tick||a.order-b.order);
  const tr=[];
  const nameBytes=Array.from(pieceName(STU.seed)+' (seed '+STU.seed+')').map(x=>x.charCodeAt(0));
  tr.push(0,0xFF,0x03,nameBytes.length,...nameBytes);
  tr.push(0,0xFF,0x51,3,0x08,0xCF,0x1B);   // 104 bpm = 576923 microseconds per beat
  tr.push(0,0xC0,81,0,0xC1,89,0,0xC2,38);
  let last=0;for(const e of evs){tr.push(...vlq(e.tick-last),...e.bytes);last=e.tick}
  tr.push(0,0xFF,0x2F,0);
  const hdr=[0x4D,0x54,0x68,0x64,0,0,0,6,0,0,0,1,tpq>>8,tpq&255],th=[0x4D,0x54,0x72,0x6B,(tr.length>>24)&255,(tr.length>>16)&255,(tr.length>>8)&255,tr.length&255];
  stuDownload(new Blob([new Uint8Array(hdr.concat(th,tr))],{type:'audio/midi'}),'idlyte-'+stuSlug()+'-'+STU.seed+'.mid');
  stuFlash('MIDI SAVED');
}

/* ---- the screen ---- */
function studioKey(k){
  if(!STU.ready)return false;
  if(/^[0-9]$/.test(k)){if(!STU.typing){STU.typing=true;STU.seedTxt=''}if(STU.seedTxt.length<6)STU.seedTxt+=k;return true}
  if(STU.typing){
    if(k==='backspace'){STU.seedTxt=STU.seedTxt.slice(0,-1);return true}
    if(k==='enter'||k==='e'){STU.typing=false;if(STU.seedTxt)studioNewSeed(+STU.seedTxt,0);return true}
    if(k==='escape'){STU.typing=false;return true}
  }
  const n=STU.bars.length;
  if(k==='arrowright'||k==='d'){STU.cur=Math.min(n-1,STU.cur+1);return true}
  if(k==='arrowleft'||k==='a'){STU.cur=Math.max(0,STU.cur-1);return true}
  if(k==='arrowdown'||k==='s'){STU.cur=Math.min(n-1,STU.cur+8);return true}
  if(k==='arrowup'||k==='w'){STU.cur=Math.max(0,STU.cur-8);return true}
  if(k==='pagedown'){STU.cur=Math.min(n-1,STU.cur+48);return true}
  if(k==='pageup'){STU.cur=Math.max(0,STU.cur-48);return true}
  if(k===']'){stuType(1);return true}
  if(k==='['){stuType(-1);return true}
  if(k==='.'){stuRoot(1);return true}
  if(k===','){stuRoot(-1);return true}
  if(k==='r'){stuReset();return true}
  if(k==='t'){STU.scope=(STU.scope+1)%3;return true}
  if(k==='p'){stuPreset();return true}
  if(k===' '){if(STU.pv)studioStop();else studioPlay();return true}
  return false;
}
function studioRows(){
  // two rows of eight bars for each section
  const rows=[];let i=0;
  while(i<STU.bars.length){
    const si=STU.bars[i].si;let j=i;while(j<STU.bars.length&&STU.bars[j].si===si)j++;
    for(let a=i,r=0;a<j;a+=8,r++)rows.push({si,from:a,to:Math.min(j,a+8),first:r===0});
    i=j;
  }
  return rows;
}
function drawStudio(){
  if(!STU.ready)studioInit();
  // every time the studio is opened the pad starts switched off (the sequencer alone); it can be turned on with the PAD button
  {const nw=performance.now();if(STU.lastDraw&&nw-STU.lastDraw>600&&STU.pad){STU.pad=false;studioBuild()}STU.lastDraw=nw}
  const dt=1/60;if(STU.msgT>0)STU.msgT-=dt;
  ctx.fillStyle=pat('#000000');ctx.fillRect(0,14,W,H-14);
  box(14,18,292,172,'#000','#6c5eb5');
  ctx.fillStyle='#352879';ctx.fillRect(15,19,290,13);
  text('MUSIC STUDIO',20,22,'#8f84d6',1);
  text(fitText(pieceName(STU.seed).toUpperCase(),150),76,22,'#ffffaa',1);
  const tm=Math.round(STU.len*stuBarDur());textR(Math.floor(tm/60)+' MIN '+STU.bars.length+' BARS',284,22,'#b8c76f',1);
  const btn=(x,y,w,h,label,fn,on,dis)=>uiBtn(x,y,w,h,dis?()=>{}:fn,(f)=>{ctx.fillStyle=dis?'#222':on?'#2c5a2c':f?'#6c5eb5':'#352879';ctx.fillRect(x,y,w,h);ctx.fillStyle=dis?'#333':'#8f84d6';ctx.fillRect(x,y,w,1);text(label,x+((w-textW(label,1))>>1),y+((h-5)>>1)+1,dis?'#666':'#fff',1)});
  // row A: the seed
  const rowRegistered=[];
  text('SEED',20,37,'#bbbbbb',1);
  uiBtn(44,34,50,11,()=>{STU.typing=true;STU.seedTxt=''},()=>{ctx.fillStyle='#000';ctx.fillRect(44,34,50,11);ctx.fillStyle=STU.typing?'#ffffff':'#6c5eb5';ctx.fillRect(44,34,50,1);ctx.fillRect(44,44,50,1);ctx.fillRect(44,34,1,11);ctx.fillRect(93,34,1,11);
    text(STU.typing?STU.seedTxt+(Math.floor(performance.now()/400)%2?'_':''):String(STU.seed),48,37,STU.typing?'#ffffaa':'#9ad284',1)});
  btn(97,34,26,11,'NEW',()=>studioNewSeed(1+Math.floor(Math.random()*999998),0));
  btn(125,34,12,11,'-',()=>studioNewSeed(STU.seed-1,0));
  btn(139,34,12,11,'+',()=>studioNewSeed(STU.seed+1,0));
  btn(153,34,36,11,'SAVED',()=>{if(SAVE.studio){studioNewSeed(SAVE.studio.seed,SAVE.studio.start);stuFlash('LOADED THE PIECE SAVED FROM A MISSION')}else stuFlash('NO PIECE SAVED YET. USE SAVE THIS PIECE IN THE MISSION MENU')});
  btn(192,34,60,11,'VOICE '+fitText(ARPW[STU.voice].n,36),()=>{STU.voice=(STU.voice+1)%ARPW.length;studioBuild()});
  btn(254,34,44,11,'PAD '+(STU.pad?'ON':'OFF'),()=>{STU.pad=!STU.pad;studioBuild()},STU.pad);
  // row B: listen and export
  btn(20,48,34,11,STU.pv?'STOP':'PLAY',()=>{if(STU.pv)studioStop();else studioPlay()},!!STU.pv,!!STU.busy);
  btn(56,48,34,11,'WAV',()=>{studioWav()},false,!!STU.busy);
  btn(92,48,34,11,'MIDI',()=>studioMidi(),false,!!STU.busy);
  btn(128,48,64,11,'CLEAR EDITS',()=>{STU.edits={};studioBuild();stuFlash('ALL CHANGES CLEARED')},false,!!STU.busy);
  const ne=Object.keys(STU.edits).length;
  text(STU.busy?STU.busy+' '+(STU.busyN||'')+'  '+STU.busyT.toFixed(0)+' S':(STU.msgT>0?STU.msg:(ne?ne+' BARS CHANGED':'PIECE '+STU.seed+' AS GENERATED')),196,51,STU.busy?'#ffaa66':STU.msgT>0?'#ffffaa':'#70a4b2',1);
  // the progression
  const rows=studioRows(),vis=7,cur=STU.bars[STU.cur];
  let curRow=0;rows.forEach((r,i)=>{if(STU.cur>=r.from&&STU.cur<r.to)curRow=i});
  const follow=STU.playBar>=0?STU.playBar:STU.cur;let fr=0;rows.forEach((r,i)=>{if(follow>=r.from&&follow<r.to)fr=i});
  if(fr<STU.scroll)STU.scroll=fr;if(fr>=STU.scroll+vis)STU.scroll=fr-vis+1;STU.scroll=Math.max(0,Math.min(Math.max(0,rows.length-vis),STU.scroll));
  ctx.fillStyle='#0d0b1e';ctx.fillRect(16,62,288,vis*9+3);
  for(let k=0;k<vis;k++){
    const r=rows[STU.scroll+k];if(!r)break;const y=64+k*9,sec=STU.plan[r.si];
    if(r.first){text(KEYN[sec.key]+(sec.minor?'M':''),18,y+2,sec.minor?'#9ad2e0':'#ffffaa',1)}
    else text(KINDTAG[sec.kind]||'',18,y+2,'#6c6c6c',1);
    if(r.first&&false)0;
    for(let a=r.from;a<r.to;a++){
      const b=STU.bars[a],x=44+(a-r.from)*32,sel=a===STU.cur,pl=a===STU.playBar,edited=STU.edits[b.bn]!==undefined;
      const part=b.bar>=sec.bars-2?'tail':b.bar<4?'a':b.bar<4+sec.explore.length?'x':'b';
      uiBtn(x,y,31,9,()=>{STU.cur=a},()=>{
        ctx.fillStyle=sel?'#4d40a8':pl?'#2c5a2c':part==='x'?'#1e1648':part==='tail'?'#2a1c18':'#14102a';ctx.fillRect(x,y,31,9);
        if(sel){ctx.fillStyle=Math.floor(performance.now()/300)%2?'#ffffff':'#9a8fe0';ctx.fillRect(x,y,31,1);ctx.fillRect(x,y+8,31,1);ctx.fillRect(x,y,1,9);ctx.fillRect(x+30,y,1,9)}
        text(fitText(chordName(b.ch),29),x+2,y+2,edited?'#b8c76f':sel?'#ffffff':'#bbbbbb',1);
        if(b.ped!==undefined){ctx.fillStyle='#ff9966';ctx.fillRect(x+29,y+1,1,1)}
        if(edited){ctx.fillStyle='#b8c76f';ctx.fillRect(x,y+8,31,1)}
      });
    }
  }
  // scroll hints and mouse wheel
  if(STU.scroll>0)text('^',298,64,'#ffffff',1);if(STU.scroll+vis<rows.length)text('v',298,64+vis*9-6,'#ffffff',1);
  STU.maxScroll=Math.max(0,rows.length-vis);
  // the chord changer
  ctx.fillStyle='#14102a';ctx.fillRect(16,129,288,60);ctx.fillStyle='#352879';ctx.fillRect(16,129,288,1);
  if(cur){
    const sec=STU.plan[cur.si],part=cur.bar>=sec.bars-2?'LEADS TO THE NEXT KEY':cur.bar<4?'STRONG CHORDS':cur.bar<4+sec.explore.length?'EXPLORING':'STRONG CHORDS';
    text('BAR '+(cur.bn+1)+'   SECTION '+(cur.si+1)+' OF '+STU.plan.filter(x=>x.ready&&x.bars).length+'   '+KEYN[sec.key]+(sec.minor?' MINOR':' MAJOR')+'   '+part,20,133,'#70a4b2',1);
    const nm=chordName(cur.ch);text(nm,20,143,'#ffffff',2);
    const qi=QKEY[cur.ch.tones.join()];
    text('NOTES '+cur.ch.tones.map(x=>KEYN[(cur.ch.root+x)%12]).join(' '),20+Math.max(60,textW(nm,2)+10),147,'#959595',1);
    text('ROOT',20,164,'#bbbbbb',1);
    btn(42,161,12,11,'<',()=>stuRoot(-1));text(KEYN[cur.ch.root],58,164,'#ffffaa',1);btn(76,161,12,11,'>',()=>stuRoot(1));
    text('TYPE',98,164,'#bbbbbb',1);
    btn(120,161,12,11,'<',()=>stuType(-1));text(qualityName(cur.ch.tones),136,164,'#ffffaa',1);btn(176,161,12,11,'>',()=>stuType(1));
    text('CHANGE',194,164,'#bbbbbb',1);
    btn(222,161,76,11,SCOPES[STU.scope],()=>{STU.scope=(STU.scope+1)%3});
    btn(20,175,56,11,'RESET BAR',()=>stuReset());
    btn(80,175,92,11,'PRESET '+fitText(PRESETS[STU.preset%PRESETS.length][0],48),()=>stuPreset());
    text('KEYS: ARROWS, [ ] TYPE, , . ROOT',178,178,'#6c6c6c',1);
  }
  uiBtn(288,19,16,13,()=>{studioStop();if(MODE==='studio'){MODE='tset';UI.focus=0}else HUB.screen=null},(f)=>{ctx.fillStyle=f?'#ff7777':'#6c5eb5';ctx.fillRect(290,21,12,9);text('X',294,23,'#fff',1)});
  UI.nrows=UI.list.length-1;if(UI.focus>=UI.list.length)UI.focus=0;
}
