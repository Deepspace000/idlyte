/* THE DEEP BEYOND, stages 4 and 5 (planets 23 and 24), for the luxury big ships: 23 THE GHOST FLEET and 24 THE LAST GATE. Needs packs/big.js and packs/bigthemes3.js. */
(function(){
'use strict';
const B=window.BIGKIT,{px,cnv,mod,clamp,rng,ell,poly,thick,line,rampAt,darken,K,NV,VI,BL,PU,LP,LV,mg,MG,rd,BR,TN,OR,YG,YL,GR,GD,LG,PG,cy,CY,D,GM,LM,LL,WH,RD}=B;
const {waves,dk,prism,rockSet,mkPack3,warnText}=B.H;
const TAU=Math.PI*2,PI=Math.PI,KIT=B.KIT;
const ghostify=(im,a)=>cnv(im.width,im.height,g=>{g.globalAlpha=a;g.drawImage(im,0,0)});

/* =============== 23 THE GHOST FLEET =============== */
const GH=['#0a1a20','#1c4a58','#4a9aa8','#bff0e8',WH],GHD=[K,'#0a1a20','#1c3a48','#2a6a78','#9ae0d8'],BONE=['#2a3a3a','#6a8a8a','#bfe0d8','#e8fff8',WH];
KIT.ghostring=function(g,f,w,h,o){const cx=w/2,cy0=h/2,R=Math.min(w,h)/2-2;
  for(let i=0;i<70;i++){const a=i/70*TAU;for(let k=0;k<4;k++)px(g,rampAt(o.pal,.85-k*.2+Math.sin(a*2+f)*.08,i,k),cx+Math.cos(a)*(R-k),cy0+Math.sin(a)*(R-k))}
  for(let q=0;q<3;q++){const a=f*.8+q*2.09;ell(g,cx+Math.cos(a)*(R-1),cy0+Math.sin(a)*(R-1),2.6,2.6,[CY,WH,WH])}
  px(g,RD,cx-3,cy0-1,2,2);px(g,RD,cx+1,cy0-1,2,2);
};
KIT.skullwedge=function(g,f,w,h,o){const cy0=h/2;
  for(let i=0;i<3;i++){const x0=w*.5+i*7,j=((f+i)&1)?3:-3;poly(g,[[x0,cy0-5+i*4],[w-1,cy0+j+i*3-6],[x0+6,cy0+1+i*4]],[o.pal[1],o.pal[2],o.pal[3]])}
  poly(g,[[1,cy0],[w*.3,cy0-h*.46],[w*.54,cy0-h*.34],[w*.54,cy0+h*.34],[w*.3,cy0+h*.46]],BONE);
  poly(g,[[w*.16,cy0-4],[w*.28,cy0-5],[w*.28,cy0-1]],[K,K,RD]);poly(g,[[w*.34,cy0-5],[w*.46,cy0-4],[w*.34,cy0-1]],[K,K,RD]);
  for(let i=0;i<4;i++)px(g,K,w*.1+i*4,cy0+4+(i&1),1,3);
};
KIT.wisp=function(g,f,w,h,o){const cy0=h/2,r=h*.34;
  for(let i=0;i<w*.55;i++){const x=w*.4+i,y=cy0+Math.sin(i*.35-f*1.57)*(2+i*.08),th=Math.max(1,Math.round(r*1.6*(1-i/(w*.55))));for(let k=0;k<th;k++)if(((i+k+f)&1)===0)px(g,k<th*.4?o.pal[2]:o.pal[1],x,y-th/2+k)}
  ell(g,w*.34,cy0,r*1.15,r,o.pal);px(g,K,w*.34-r*.6,cy0-2,3,4);px(g,K,w*.34+1,cy0-2,3,4);px(g,K,w*.34-r*.5,cy0+3,5,1);
};
KIT.galleon=function(g,f,w,h,o){const by=h*.62;
  for(const mx of [w*.38,w*.62]){thick(g,BONE[1],mx,by-2,mx,h*.08,2);const sw=Math.sin(f*1.57)*1.5;poly(g,[[mx-8+sw,h*.14],[mx+8+sw,h*.14],[mx+6,by-8],[mx-6,by-8]],[o.pal[1],o.pal[2],o.pal[3],WH]);g.clearRect(mx-4,h*.28,3,4);g.clearRect(mx+2,h*.4,4,3)}
  poly(g,[[1,by-6],[w*.18,by+6],[w*.8,by+7],[w-3,by-9],[w-3,by-2],[w*.82,by+11],[w*.2,by+11]],o.pal);
  for(let i=0;i<5;i++)px(g,K,w*.2+i*7,by,3,3);px(g,BONE[4],w-5,by-12,2,3);
  ell(g,3,by-9,3,3,[OR,YL,WH]);for(let i=0;i<4;i++)px(g,CY,w*.22+i*8+((f+i)&1),by+9,2,1);
};
KIT.banshee=function(g,f,w,h,o){const cy0=h/2;
  for(let i=0;i<7;i++){const yy=cy0+(i-3)*h*.1;g.fillStyle=i&1?o.pal[3]:o.pal[2];for(let k=0;k<w*.55;k++)if((k+i+f)%3)g.fillRect(Math.round(w*.4+k),Math.round(yy+Math.sin(k*.4-f*1.5+i)*1.6*k/(w*.4)),1,1)}
  ell(g,w*.3,cy0,w*.2,h*.42,BONE);px(g,K,w*.2,cy0-3,3,4);px(g,K,w*.3,cy0-3,3,4);px(g,K,w*.22,cy0+3,w*.12,[2,3,2,3][f]);px(g,RD,w*.21,cy0-2,1,1);px(g,RD,w*.31,cy0-2,1,1);
};
KIT.lantern=function(g,f,w,h,o){const cx=w/2,cy0=h/2+1;
  poly(g,[[cx-9,4],[cx+9,4],[cx+5,0],[cx-5,0]],GHD);ell(g,cx,1,4,3,[K,GHD[2],GHD[3]]);
  poly(g,[[cx-12,cy0-10],[cx+12,cy0-10],[cx+14,cy0+10],[cx-14,cy0+10]],[K,'#0a1a20',GH[1],GH[2]]);
  ell(g,cx,cy0,9,10,[GH[1],GH[3],WH,WH]);const fl=[0,2,-1,1][f];ell(g,cx+fl*.3,cy0+1,4,5+(fl>0?1:0),[CY,WH,WH]);
  for(const s of [-1,1]){thick(g,GHD[3],cx+s*13,cy0-10,cx+s*13,cy0+10,2)}poly(g,[[cx-15,cy0+10],[cx+15,cy0+10],[cx+11,h-1],[cx-11,h-1]],GHD);
  for(let i=0;i<8;i++){const a=i/8*TAU+f*.2;px(g,CY,cx+Math.cos(a)*(w/2-1),cy0+Math.sin(a)*(h/2-3),1,1)}
};
KIT.coffin=function(g,f,w,h,o){const cy0=h/2;
  px(g,CY,w-4,cy0-7,3,3);px(g,CY,w-4,cy0+4,3,3);if(f&1){px(g,WH,w-5,cy0-6,2,1);px(g,WH,w-5,cy0+5,2,1)}
  poly(g,[[1,cy0],[w*.22,cy0-h*.42],[w-6,cy0-h*.36],[w-6,cy0+h*.36],[w*.22,cy0+h*.42]],o.pal);
  poly(g,[[w*.3,cy0-h*.3],[w*.78,cy0-h*.26],[w*.78,cy0+h*.26],[w*.3,cy0+h*.3]],[o.pal[0],o.pal[1],o.pal[2]]);
  px(g,MG,w*.5-1,cy0-8,3,16);px(g,MG,w*.5-6,cy0-3,13,3);px(g,WH,w*.5,cy0-3,1,3);
  for(let i=0;i<3;i++){px(g,BONE[2],4+i*3,cy0-2+((f+i)&1),2,2)}px(g,RD,7,cy0-1,2,1);
  for(const s of [-1,1])for(let i=0;i<3;i++){const x=w*.34+i*w*.17;px(g,BONE[3],x,cy0+s*h*.38-1,2,3);px(g,YL,x,cy0+s*h*.38-2-(((f+i)&1)),1,1)}
};
function cruiserBody(g,w,h){const cy0=h/2;
  poly(g,[[1,cy0+4],[w*.12,cy0-6],[w*.5,cy0-h*.22],[w-4,cy0-h*.16],[w-4,cy0+h*.2],[w*.5,cy0+h*.3],[w*.12,cy0+h*.22]],GH);
  poly(g,[[w*.45,cy0-h*.22],[w*.5,cy0-h*.46],[w*.72,cy0-h*.46],[w*.76,cy0-h*.18]],[GH[0],GH[1],GH[2],GH[3]]);
  for(let i=0;i<6;i++){g.clearRect(w*.16+i*w*.1,cy0-2,5,5)}for(let i=0;i<5;i++)px(g,YG,w*.18+i*w*.1,cy0+8,3,2);line(g,WH,w*.12,cy0-6,w*.5,cy0-h*.22);
  for(let i=0;i<3;i++){ell(g,w*.24+i*w*.2,cy0-h*.2,7,5,GH);thick(g,K,w*.24+i*w*.2-3,cy0-h*.2,w*.24+i*w*.2-17,cy0-h*.2+2,3)}
  ell(g,w*.28,cy0+2,7,8,[K,'#1c4a58',CY,WH]);px(g,K,w*.28-3,cy0-1,6,3);
  thick(g,BONE[2],w*.62,cy0-h*.46,w*.62,6,2);poly(g,[[w*.62,6],[w*.62+16,9],[w*.62+14,17],[w*.62,15]],[BONE[1],BONE[3]]);
  for(let i=0;i<4;i++)px(g,CY,w-3,cy0-10+i*7,3,3);
}
function admiralBoss(g,w,h){const cy0=h/2;
  poly(g,[[2,cy0+14],[w*.06,cy0-8],[w*.55,cy0-h*.24],[w-6,cy0-h*.18],[w-4,cy0+h*.18],[w*.5,cy0+h*.34],[w*.08,cy0+h*.26]],GH);
  poly(g,[[w*.5,cy0-h*.24],[w*.56,cy0-h*.44],[w*.8,cy0-h*.44],[w*.84,cy0-h*.2]],[GH[0],GH[1],GH[2],GH[3]]);
  poly(g,[[w*.58,cy0-h*.44],[w*.62,cy0-h*.5],[w*.76,cy0-h*.5],[w*.8,cy0-h*.44]],GHD);
  for(let i=0;i<4;i++)px(g,CY,w*.6+i*8,cy0-h*.4,3,3);
  for(const [mx,top] of [[w*.3,cy0-h*.5],[w*.46,cy0-h*.47],[w*.92,cy0-h*.38]]){thick(g,BONE[2],mx,cy0-h*.2,mx,top,3);poly(g,[[mx-10,top+4],[mx+10,top+4],[mx+8,cy0-h*.26],[mx-8,cy0-h*.26]],[GH[1],GH[2],GH[3],WH]);for(let q=0;q<3;q++)g.clearRect(mx-6+q*5,top+8+q*3,3,5)}
  for(let i=0;i<9;i++){g.clearRect(w*.1+i*w*.075,cy0-6,6,7);px(g,CY,w*.1+i*w*.075+1,cy0+6,4,1)}
  for(let i=0;i<4;i++){ell(g,w*.2+i*w*.12,cy0-h*.22,8,6,GH);thick(g,BONE[1],w*.2+i*w*.12-3,cy0-h*.22+1,w*.2+i*w*.12-22,cy0-h*.22+4,4)}
  for(let i=0;i<3;i++){ell(g,w*.24+i*w*.14,cy0+h*.3,7,5,GH);thick(g,K,w*.24+i*w*.14-3,cy0+h*.3,w*.24+i*w*.14-19,cy0+h*.3-2,3)}
  ell(g,w*.38,cy0-1,14,14,[K,'#6a0a4a',mg,MG]);ell(g,w*.38,cy0-1,10,10,BONE);px(g,K,w*.38-6,cy0-7,5,6);px(g,K,w*.38+1,cy0-7,5,6);px(g,K,w*.38-3,cy0+2,7,3);for(let i=0;i<4;i++)px(g,BONE[0],w*.38-3+i*2,cy0+2,1,3);px(g,MG,w*.38-5,cy0-5,2,2);px(g,MG,w*.38+2,cy0-5,2,2);
  poly(g,[[w*.34,cy0-12],[w*.38,cy0-18],[w*.42,cy0-12]],[YL,YL,WH]);
  for(let i=0;i<14;i++)px(g,GH[3],w*.1+((i*43)%(w*.8)),cy0+((i*17)%14)-4,2,1);
  thick(g,BONE[1],w*.14,cy0+h*.26,w*.1,h-6,2);ell(g,w*.1,h-6,4,4,BONE);
  poly(g,[[w*.3,cy0+h*.3],[w*.36,cy0+h*.46],[w*.46,cy0+h*.4],[w*.5,cy0+h*.3]],GHD);
  for(let i=0;i<4;i++)px(g,CY,w-3,cy0-12+i*8,3,4);
  line(g,WH,w*.06,cy0-8,w*.55,cy0-h*.24);line(g,CY,w*.55,cy0-h*.24,w-6,cy0-h*.18);
}
const GHOSTF={
  bullets:{orb:['orb',GH[1],CY,WH],wisp:['big',GH[1],CY,WH],needle:['needle',CY,WH],shard:['shard',GH[2],WH,CY],dot:['dot',CY]},
  en:{
    ring:{kit:'ghostring',w:30,h:30,o:{pal:GH},hp:1.7,pts:190,vx:-46,mv:'sine',mvp:{a:38,f:2.4},at:'aim',atp:{n:3,sd:.5,sp:84,s:'orb',cd:2.3}},
    ringR:{kit:'galleon',w:48,h:40,o:{pal:GH},hp:3.6,pts:320,vx:-36,mv:'sine',mvp:{a:22,f:1.4},at:'aim',atp:{n:5,sd:1,sp:78,s:'shard',cd:2.7}},
    dart:{kit:'skullwedge',w:44,h:22,o:{pal:GH},hp:2.1,pts:220,vx:-165,mv:'dive',mvp:{track:1.3,sp:66},at:false},
    cross:{kit:'lantern',w:34,h:38,o:{pal:GH},hp:6,pts:400,vx:-30,mv:'bounce',mvp:{vy:24},at:'ring',atp:{n:12,sp:54,s:'wisp',cd:2.8}},
    pod:{kit:'coffin',w:56,h:34,o:{pal:GH},hp:10,pts:630,vx:-22,mv:'drift',mvp:{a:8},at:'aim',atp:{n:9,sd:1.5,sp:70,s:'orb',cd:3}}
  },
  rim:'#d8fff8',
  rock:()=>rockSet((g,s,a)=>{const c=s/2;poly(g,[[c+Math.cos(a)*s*.42,c+Math.sin(a)*s*.42],[c+Math.cos(a+2.2)*s*.4,c+Math.sin(a+2.2)*s*.4],[c+Math.cos(a+3.6)*s*.3,c+Math.sin(a+3.6)*s*.3],[c+Math.cos(a+5)*s*.44,c+Math.sin(a+5)*s*.44]],GH);line(g,GHD[1],c+Math.cos(a)*s*.3,c+Math.sin(a)*s*.3,c-Math.cos(a)*s*.2,c-Math.sin(a)*s*.2);px(g,CY,c,c)},22,11),
  mini:{w:122,h:78,hp:2,x:228,bob:36,debris:[CY,WH,GH[2]],build:cruiserBody,core:{x:-28,y:2,w:20,h:22},muz:[[-.46,0],[-.3,-.2],[-.3,.2]],
    phases:[[{a:'fan',n:5,sd:1,sp:78,cd:1.6,s:'orb',m:0},{a:'arcs',n:6,sp:64,sd:1.2,cd:4,s:'wisp',m:0}],
            [{a:'fan',n:7,sd:1.2,sp:82,cd:1.4,s:'orb',m:1},{a:'fan',n:7,sd:1.2,sp:82,cd:1.4,s:'orb',m:2,at:.7},{a:'arcs',n:8,sp:66,sd:1.4,cd:3.4,s:'wisp',m:0}],
            [{a:'fan',n:9,sd:1.4,sp:86,cd:1.2,s:'orb',m:1},{a:'fan',n:9,sd:1.4,sp:86,cd:1.2,s:'orb',m:2,at:.6},{a:'arcs',n:9,sp:70,sd:1.6,cd:3,s:'wisp',m:0},{a:'gapring',n:20,sp:50,cd:4.2,s:'orb',m:0}]]},
  boss:{w:214,h:140,hp:3.2,x:222,bob:26,charge:10,chargeDist:100,debris:[CY,WH,GH[2],GH[3]],build:admiralBoss,core:{x:-22,y:-1,w:30,h:30},boom:50,
    deco(c,b,f){if(f)return;const k=stepAt(b.t,2)%3,x=(b.x-22)|0,y=b.y|0;c.fillStyle=k?'#ff77ff':'#ffffff';for(let i=0;i<12;i++){const a=i/12*TAU+b.t*.4;c.fillRect((x+Math.cos(a)*(20+k))|0,(y+Math.sin(a)*(20+k))|0,2,2)}},
    muz:[[-.4,-.16],[-.4,.26],[-.1,0]],
    phases:[[{a:'fan',n:7,sd:1.2,sp:78,cd:1.8,s:'orb',m:0},{a:'fan',n:7,sd:1.2,sp:78,cd:1.8,s:'orb',m:1,at:.9},{a:'arcs',n:7,sp:66,sd:1.3,cd:3.8,s:'wisp',m:2},{a:'gapring',n:22,sp:48,cd:4.4,s:'orb',m:2}],
            [{a:'fan',n:9,sd:1.4,sp:82,cd:1.5,s:'orb',m:0},{a:'fan',n:9,sd:1.4,sp:82,cd:1.5,s:'orb',m:1,at:.7},{a:'arcs',n:9,sp:70,sd:1.5,cd:3.2,s:'wisp',m:2},{a:'gapring',n:26,sp:52,cd:3.6,s:'orb',m:2},{a:'corners',n:5,sd:.6,sp:74,cd:4.4,s:'shard'},{a:'sweep',arc:2.6,cnt:22,sp:68,cd:6,s:'needle',m:2}],
            [{a:'fan',n:11,sd:1.6,sp:86,cd:1.3,s:'orb',m:0},{a:'arcs',n:11,sp:74,sd:1.7,cd:2.8,s:'wisp',m:2},{a:'gapring',n:28,sp:56,cd:3,s:'wisp',m:2},{a:'corners',n:7,sd:.8,sp:78,cd:3.6,s:'shard'},{a:'sweep',arc:3.2,cnt:28,gap:.07,sp:72,cd:5,s:'needle',m:2,mirror:1},{a:'tickring',n:14,cnt:3,sp:56,cd:6,s:'orb',m:2},{a:'summon',type:'ring',n:4,cd:8},{a:'summon',type:'dart',n:4,cd:9.5}]]},
  wrap(A){const d=A.boss.draw;A.boss.draw=(c,b,f)=>{const a0=c.globalAlpha;c.globalAlpha=a0*(.8+.18*Math.sin(b.t*.9));d(c,b,f);c.globalAlpha=a0};
    const m=A.mini.draw;A.mini.draw=(c,b,f)=>{const a0=c.globalAlpha;c.globalAlpha=a0*(.8+.18*Math.sin(b.t*1.1));m(c,b,f);c.globalAlpha=a0}},
  tick(dt,live){if(!live||G.boss||G.mini)return;const t=bgT(),per=Math.floor(t/21),ph=t-per*21;if(ph>=9&&ph<16){const v=Math.floor((ph-9)/1.4),sx=GHOSTF.shipX(ph);if(GHOSTF.vol!==per*10+v&&sx<W&&sx>40){GHOSTF.vol=per*10+v;const y=GHOSTF.shipY(per);for(let k=-1;k<=1;k++)ebShot(sx-30,y+k*9,-72,k*9,{sty:'wisp'})}}},
  vol:-1,shipX:ph=>W+90-(ph-9)/7*(W+300),shipY:per=>TOP+30+((per*61+20)%110),
  fg(t){if(G.boss||G.mini)return;const per=Math.floor(t/21),ph=t-per*21;if(ph>=6.5&&ph<9)warnText('PHANTOM SHIP',t);
    if(ph>=9&&ph<16){const im=GHOSTF.shipImg||(GHOSTF.shipImg=ghostify(B.fin(cnv(150,60,g=>{poly(g,[[1,36],[20,46],[110,46],[148,22],[148,32],[116,54],[24,54]],GH);thick(g,BONE[1],50,38,50,4,3);thick(g,BONE[1],100,38,100,8,3);poly(g,[[36,6],[64,6],[60,34],[40,34]],GH);poly(g,[[84,10],[116,10],[112,34],[88,34]],GH);for(let i=0;i<8;i++)g.clearRect(14+i*13,40,5,5)})),.34));
      ctx.drawImage(im,GHOSTF.shipX(ph)|0,GHOSTF.shipY(per)-30)}},
  scene:K_=>({seed:23,angles:[0,.4,.1,-.5,.3,0,.5,-.3],sky:['#02080a','#061418','#0e2a30','#1c4a58'],skyFn:(x,y)=>.08+y/200*.3+.14*Math.exp(-Math.pow((x-80)/110,2)-Math.pow((y-110)/70,2)),stars:[GH[2],GH[3],WH,WH],
    layers:[
      {z:'bg',t:'clouds',ramp:['#02080a','#0e2a30',GH[1],GH[2]],seed:231,vx:6,alpha:.4,thr:.5,fx:.02,fy:.08},
      {z:'bg',t:'objs',n:5,vx:8,seed:232,list:[ghostify(shipFar(210,80,1),.55),ghostify(shipFar(170,64,2),.55),ghostify(shipFar(250,92,3),.6)],lights:CY},
      {z:'mid',t:'objs',n:6,vx:22,seed:233,list:[ghostify(shipFar(86,34,4),.55),ghostify(shipFar(66,28,5),.55)],lights:WH},
      {z:'mid',t:'objs',n:8,vx:30,seed:234,list:[glowOrb(4),glowOrb(6),glowOrb(3)],lights:WH},
      {z:'fg',t:'objs',n:2,vx:80,seed:236,list:[darken(shipFar(220,80,7),.7)]},
      {z:'fg',t:'clouds',ramp:['#02080a','#0e2a30',GH[1]],seed:235,vx:46,alpha:.3,thr:.55},
      {z:'fg',t:'streak',n:18,vx:70,len:4,cols:[CY,GH[3],WH],seed:25}]}),
  script(sc,h){waves(h,[[3,'ring',8,.4,60,0],[8,'dart',6,.33,40,26],[13,'ringR',4,1.1,70,36],[18,'cross',3,1.5,50,45],[24,'ring',9,.32,120,0],[30,'pod',1,0,100,0],[33,'dart',7,.3,45,20],
    [39,'ringR',5,1,60,28],[44,'cross',4,1.3,50,40],[49,'ring',10,.28,100,0],[55,'pod',2,2,70,60],[60,'dart',8,.26,40,18],[65,'ringR',5,.9,60,26],[71,'cross',5,1.1,60,32],[76,'ring',11,.25,80,0]])}
};
function shipFar(w,hh,seed){const r=rng(seed);return B.fin(cnv(w,hh,g=>{const c=hh*.55;poly(g,[[0,c],[w*.1,c-hh*.3],[w*.8,c-hh*.32],[w,c-hh*.05],[w,c+hh*.1],[w*.8,c+hh*.3],[w*.1,c+hh*.3]],GH);
  poly(g,[[w*.35,c-hh*.3],[w*.45,c-hh*.5],[w*.62,c-hh*.5],[w*.7,c-hh*.3]],GH);thick(g,BONE[1],w*.3,c-hh*.3,w*.3,2,2);thick(g,BONE[1],w*.55,c-hh*.5,w*.55,0,2);
  for(let i=0;i<7;i++)g.clearRect(w*.1+r()*w*.75,c-hh*.15+r()*hh*.25,3+r()*5,3);for(let i=0;i<8;i++)px(g,CY,w*.1+r()*w*.8,c-hh*.2+r()*hh*.4,1,1)}))}
function glowOrb(r){return cnv(r*4,r*4,g=>{for(let k=3;k>=0;k--){g.globalAlpha=.1+(3-k)*.13;ell(g,r*2,r*2,r+k*r*.5,r+k*r*.5,[GH[1],GH[2],GH[3]])}g.globalAlpha=1;ell(g,r*2,r*2,r*.5,r*.5,[CY,WH,WH])})}

/* =============== 24 THE LAST GATE =============== */
const GLD=['#2a1a00','#7a5410','#c89a28','#ffd866',WH],OBS=[K,'#120a1c','#2a1e3c','#4a3a6a','#8a7ab0'];
KIT.seal=function(g,f,w,h,o){const cx=w/2,cy0=h/2,r=Math.min(w,h)/2-3;
  ell(g,cx,cy0,r,r,GLD);ell(g,cx,cy0,r*.72,r*.72,OBS);
  for(let i=0;i<8;i++){const a=i/8*TAU+f*.2;thick(g,GLD[3],cx+Math.cos(a)*r*.72,cy0+Math.sin(a)*r*.72,cx+Math.cos(a)*r*.55,cy0+Math.sin(a)*r*.55,1)}
  ell(g,cx,cy0,r*.32,r*.32,[K,rd,OR,YL]);px(g,K,cx-1+((f&1)?0:1),cy0-2,2,4);
  for(let i=0;i<3;i++){const a=i/3*TAU-f*.3;px(g,WH,cx+Math.cos(a)*(r+1),cy0+Math.sin(a)*(r+1),1,1)}
};
KIT.sentinel=function(g,f,w,h,o){const cx=w/2,cy0=h/2,R=Math.min(w,h)/2-6;
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4+f*.15;prism(g,cx+Math.cos(a)*R*.7,cy0+Math.sin(a)*R*.7,7,5,a,[GLD[1],GLD[2],GLD[3],GLD[3],WH])}
  const pts=[];for(let i=0;i<8;i++){const a=i/8*TAU+PI/8;pts.push([cx+Math.cos(a)*R,cy0+Math.sin(a)*R])}
  poly(g,pts,GLD);const pts2=pts.map(q=>[cx+(q[0]-cx)*.78,cy0+(q[1]-cy0)*.78]);poly(g,pts2,OBS);
  ell(g,cx,cy0,R*.36,R*.36,[K,'#0a4a6a',CY,WH]);px(g,K,cx-1+((f&1)?0:1),cy0-2,2,4);
};
KIT.idol=function(g,f,w,h,o){const cx=w*.55,cy0=h/2,fl=[0,3,5,3][f];
  for(const s of [-1,1])for(let i=0;i<4;i++){const l=h*.46-i*3;poly(g,[[cx-2,cy0+s*(3+i*2)],[cx+12+i*3,cy0+s*(l*.5+ (i?0:0)+fl*(1-i*.15))],[cx+22,cy0+s*(l+fl-i*2)],[cx+8,cy0+s*(4+i*3)]],i&1?GLD:[GLD[1],GLD[2],GLD[3],GLD[4]],s>0)}
  poly(g,[[cx-8,cy0],[cx-4,cy0-8],[cx+8,cy0-6],[cx+12,cy0],[cx+8,cy0+6],[cx-4,cy0+8]],OBS);
  ell(g,cx-10,cy0,7,8,GLD);px(g,K,cx-13,cy0-3,3,2);px(g,K,cx-9,cy0-3,3,2);px(g,RD,cx-12,cy0-3,1,1);px(g,K,cx-12,cy0+2,4,1);
  poly(g,[[cx-16,cy0-8],[cx-10,cy0-13],[cx-4,cy0-8]],GLD);
};
KIT.spear=function(g,f,w,h,o){const cy0=h/2;
  for(const s of [-1,1])poly(g,[[w-12,cy0],[w-2,cy0+s*h*.5],[w-3,cy0+s*3]],OBS,s>0);
  poly(g,[[1,cy0],[w*.2,cy0-h*.4],[w*.36,cy0],[w*.2,cy0+h*.4]],GLD);line(g,WH,3,cy0,w*.3,cy0);px(g,WH,1,cy0-1,2,2);
  thick(g,OBS[3],w*.3,cy0,w-6,cy0,2);for(let i=0;i<4;i++)px(g,GLD[3],w*.4+i*7,cy0-1,2,3);
  for(let i=0;i<3;i++){thick(g,GLD[2],w-6,cy0,w-1,cy0+(i-1)*3+((f+i)&1),1)}px(g,RD,w*.3,cy0-1,1,1);
};
KIT.obelisk=function(g,f,w,h,o){const cx=w/2,cy0=h/2,a0=f*.2;
  for(let i=0;i<4;i++){const a=a0+i*PI/2,l=w/2-3;prism(g,cx,cy0,l,9,a,i&1?OBS:[OBS[0],OBS[1],OBS[2],OBS[3],OBS[4]]);const ex=cx+Math.cos(a)*l,ey=cy0+Math.sin(a)*l;px(g,GLD[3],ex-1,ey-1,3,3)}
  ell(g,cx,cy0,7,7,GLD);ell(g,cx,cy0,3,3,[rd,OR,YL,WH]);
};
KIT.ark=function(g,f,w,h,o){const by=h-3;
  px(g,CY,w-3,by-6,3,3);px(g,YL,w-3,by-5,1,1);
  for(let i=0;i<4;i++){const ww=w-4-i*11,hh=7;poly(g,[[(w-ww)/2-2,by-i*hh],[(w+ww)/2-2,by-i*hh],[(w+ww)/2-2,by-i*hh-hh],[(w-ww)/2-2,by-i*hh-hh]],i===3?GLD:OBS);for(let q=0;q<ww/6;q++)px(g,GLD[2],(w-ww)/2+q*6,by-i*hh-hh+2,2,1)}
  ell(g,w/2-2,by-31,4,4,[K,rd,OR,YL]);px(g,K,w/2-3,by-32,2,3);
  px(g,GLD[3],3,by-3,3,2);ell(g,w/2-2,by-16,4,4,[K,'#0a4a6a',CY,WH]);for(let i=0;i<w-8;i+=3)px(g,CY,4+i,h-1,2,1);
};
function guardianBody(g,w,h){const cx=w*.42,cy0=h/2,R=h*.44;
  for(let i=0;i<72;i++){const a=i/72*TAU;thick(g,i%9<4?GLD[2]:GLD[3],cx+Math.cos(a)*R,cy0+Math.sin(a)*R,cx+Math.cos(a)*(R-9),cy0+Math.sin(a)*(R-9),2)}
  for(let i=0;i<6;i++){const a=i/6*TAU+PI/6;poly(g,[[cx+Math.cos(a-.22)*(R-9),cy0+Math.sin(a-.22)*(R-9)],[cx+Math.cos(a+.22)*(R-9),cy0+Math.sin(a+.22)*(R-9)],[cx+Math.cos(a+.15)*(R+3),cy0+Math.sin(a+.15)*(R+3)],[cx+Math.cos(a-.15)*(R+3),cy0+Math.sin(a-.15)*(R+3)]],OBS)}
  ell(g,cx,cy0,R-11,R-11,[K,OBS[1],OBS[2]]);ell(g,cx,cy0,R*.36,R*.36,[K,rd,OR,YL,WH]);px(g,K,cx-3,cy0-R*.2,6,R*.4);
  poly(g,[[w*.78,cy0-8],[w-4,cy0-10],[w-4,cy0+10],[w*.78,cy0+8]],OBS);poly(g,[[cx+R*.7,cy0-4],[w*.8,cy0-4],[w*.8,cy0+4],[cx+R*.7,cy0+4]],OBS);
  for(const s of [-1,1]){poly(g,[[cx-R*.2,cy0+s*R],[cx+R*.5,cy0+s*(R+8)],[cx+R*.7,cy0+s*(R+2)]],GLD,s>0);thick(g,K,cx-R*.2,cy0+s*(R+3),cx-R*.5,cy0+s*(R+3),3)}
}
const VIOL=['#14102a','#2a1e5a','#4a3a8a','#6a5aaa','#8a7ad0'];
function wardenBoss(g,w,h){const cy0=h/2,gx=w*.3,T=16,ax=gx+w*.23,oy0=38,oy1=h-38,rx=30;
  poly(g,[[gx-16,h-3],[gx-16,T+30],[gx+8,T],[gx+w*.5,T],[gx+w*.62,T+30],[gx+w*.62,h-3]],VIOL);                                  // the gate wall
  for(const x0 of [gx-26,gx+w*.58]){poly(g,[[x0,h-1],[x0,T+20],[x0+14,T+20],[x0+14,h-1]],GLD);for(let i=0;i<9;i++)px(g,GLD[0],x0+3,T+26+i*(h*.78/9),8,1)}
  for(let i=0;i<6;i++){const x=gx-4+i*((w*.62+4)/5.4);line(g,VIOL[3],x,T+34,x,h-8);line(g,VIOL[0],x+1,T+34,x+1,h-8)}
  for(let i=0;i<5;i++){const x=gx+12+i*((w*.5-16)/4);poly(g,[[x-6,T+3],[x,0],[x+6,T+3]],GLD)}                                  // a crown of spikes
  for(const s of [-1,1]){poly(g,[[gx-16,cy0+s*(h*.3)],[3,cy0+s*(h*.46)],[12,cy0+s*(h*.2)]],GLD,s>0)}                              // gold blades
  poly(g,[[ax-rx-5,oy1+3],[ax-rx-5,oy0+rx],[ax+rx+5,oy0+rx],[ax+rx+5,oy1+3]],GLD);
  for(let i=0;i<=20;i++){const a=PI+i/20*PI,x=ax+Math.cos(a)*(rx+5),y=oy0+rx+Math.sin(a)*(rx+5);thick(g,i%3?GLD[3]:GLD[2],x,y,x,y,6)}   // the golden arch
  poly(g,[[ax-rx,oy1],[ax-rx,oy0+rx],[ax+rx,oy0+rx],[ax+rx,oy1]],[K,'#3a0a08',rd]);ell(g,ax,oy0+rx,rx,rx,[K,'#3a0a08',rd]);
  ell(g,ax,cy0,17,17,[K,'#6a1a08',OR,YL,WH]);ell(g,ax,cy0,8,8,[YL,WH,WH]);                                                         // what is behind the doors
  for(let i=0;i<4;i++){ell(g,7+i*2,cy0-48+i*32,7,7,GLD);thick(g,K,4+i*2,cy0-48+i*32,0,cy0-48+i*32,3)}
  for(let i=0;i<6;i++)px(g,GLD[3],gx+w*.1+i*14,h-14,6,2);
}
const GATE={
  bullets:{orb:['orb',GLD[1],GLD[3],WH],bolt:['needle',OR,YL],holy:['big',rd,OR,YL],shard:['shard',OBS[3],GLD[3],WH],dot:['dot',YL]},
  en:{
    ring:{kit:'seal',w:30,h:30,o:{},hp:1.8,pts:200,vx:-46,mv:'sine',mvp:{a:36,f:3.2},at:'aim',atp:{n:3,sd:.45,sp:88,s:'bolt',cd:2.2}},
    ringR:{kit:'sentinel',w:42,h:42,o:{},hp:3.8,pts:330,vx:-36,mv:'sine',mvp:{a:24,f:1.5},at:'aim',atp:{n:5,sd:1,sp:82,s:'orb',cd:2.6}},
    dart:{kit:'spear',w:48,h:20,o:{},hp:2.2,pts:230,vx:-170,mv:'dive',mvp:{track:1.2,sp:66},at:false},
    cross:{kit:'obelisk',w:38,h:38,o:{},hp:6.2,pts:410,vx:-30,mv:'bounce',mvp:{vy:26},at:'spiral',atp:{n:6,sp:62,s:'holy',cd:2.4}},
    pod:{kit:'ark',w:58,h:42,o:{},hp:10.5,pts:650,vx:-22,mv:'drift',mvp:{a:8},at:'aim',atp:{n:9,sd:1.5,sp:74,s:'shard',cd:3}}
  },
  rim:'#ffd866',
  rock:()=>rockSet((g,s,a)=>{const c=s/2,q=[[1,1],[-1,1],[-1,-1],[1,-1]].map(([x,y])=>{const px_=x*s*.3,py_=y*s*.3;return[c+px_*Math.cos(a)-py_*Math.sin(a),c+px_*Math.sin(a)+py_*Math.cos(a)]});poly(g,q,OBS);line(g,GLD[3],q[0][0],q[0][1],q[1][0],q[1][1]);line(g,GLD[2],q[1][0],q[1][1],q[2][0],q[2][1]);px(g,GLD[3],c,c)},22,11),
  mini:{w:122,h:92,hp:2.1,x:226,bob:34,debris:[GLD[2],GLD[3],OBS[3]],build:guardianBody,core:{x:-24,y:0,w:24,h:30},muz:[[-.46,0],[-.2,-.4],[-.2,.4]],
    deco(c,b,f){if(f)return;const x=(b.x-b.w*.08)|0,y=b.y|0,a=b.t*.7;c.fillStyle=blinkAt(b.t,2)?'#ffffaa':'#ff9966';c.fillRect(x-3,y-3,6,6);c.fillStyle='#ffd866';for(let i=0;i<6;i++)c.fillRect((x+Math.cos(a+i*1.047)*40)|0,(y+Math.sin(a+i*1.047)*40)|0,2,2)},
    phases:[[{a:'fan',n:5,sd:1,sp:80,cd:1.6,s:'bolt',m:0},{a:'gapring',n:20,sp:50,cd:4.2,s:'holy',m:0}],
            [{a:'fan',n:7,sd:1.2,sp:84,cd:1.4,s:'bolt',m:0},{a:'gapring',n:22,sp:54,cd:3.4,s:'holy',m:0},{a:'corners',n:4,sd:.5,sp:76,cd:4.6,s:'shard'}],
            [{a:'fan',n:9,sd:1.4,sp:88,cd:1.2,s:'bolt',m:0},{a:'gapring',n:24,sp:56,cd:3,s:'holy',m:0},{a:'corners',n:5,sd:.6,sp:80,cd:4,s:'shard'},{a:'sweep',arc:2.4,cnt:20,sp:72,cd:6,s:'bolt',m:0}]]},
  boss:{w:224,h:156,hp:3.4,x:222,bob:22,charge:10,chargeDist:100,debris:[GLD[2],GLD[3],OBS[3],WH],build:wardenBoss,core:{x:7,y:0,w:44,h:50},boom:56,
    deco(c,b,f){if(f)return;const p=b.hp/b.mhp,W2=b.w-2,H2=b.h-2,x0=(b.x-b.w/2)|0,y0=(b.y-b.h/2)|0,ax=x0+1+W2*.3+W2*.23,oy0=y0+1+38,oy1=y0+1+H2-38,half=(oy1-oy0)/2,open=p>.66?0:p>.33?(.66-p)/.33:1,dh=half*(1-open*.85),rx=30;
      for(const s of [-1,1]){const yy=s<0?oy0:oy1-dh;c.fillStyle='#3a2e6a';c.fillRect((ax-rx)|0,yy|0,rx*2,dh|0);c.fillStyle='#5a4a9a';c.fillRect((ax-rx)|0,yy|0,rx,dh|0);
        c.fillStyle='#ffd866';c.fillRect((ax-rx)|0,(s<0?yy+dh-2:yy)|0,rx*2,2);for(let i=0;i<4;i++)c.fillRect((ax-rx+6+i*14)|0,(yy+dh/2-3)|0,2,6)}
      if(open<.2){const k=stepAt(b.t,2)%3;c.fillStyle=k?'#ffd866':'#ffffff';c.fillRect(ax-5|0,(b.y-5)|0,10,10);c.fillStyle='#14102a';c.fillRect(ax-1|0,(b.y-2)|0,3,10);c.fillStyle='#ff9966';c.fillRect(ax-7|0,(b.y-1)|0,2,2);c.fillRect(ax+6|0,(b.y-1)|0,2,2);c.fillStyle='#ffd866';for(let i=0;i<8;i++){const a=i/8*TAU+PI/8;for(let q=9;q<15;q+=2)c.fillRect((ax+Math.cos(a)*q)|0,(b.y+Math.sin(a)*q)|0,2,2)}}
      else{const k=stepAt(b.t,2)%3;c.fillStyle=k?'#ffffaa':'#ffffff';const r=20+k*2;for(let i=0;i<16;i++){const a=i/16*TAU;c.fillRect((ax+Math.cos(a)*r)|0,(b.y+Math.sin(a)*r)|0,2,2)}}},
    muz:[[-.46,-.3],[-.46,.3],[-.1,0]],
    phases:[[{a:'fan',n:7,sd:1.2,sp:80,cd:1.8,s:'bolt',m:0},{a:'fan',n:7,sd:1.2,sp:80,cd:1.8,s:'bolt',m:1,at:.9},{a:'corners',n:5,sd:.6,sp:76,cd:4.4,s:'shard'},{a:'gapring',n:22,sp:48,cd:4.4,s:'holy',m:2}],
            [{a:'fan',n:9,sd:1.4,sp:84,cd:1.5,s:'bolt',m:0},{a:'fan',n:9,sd:1.4,sp:84,cd:1.5,s:'bolt',m:1,at:.7},{a:'corners',n:6,sd:.7,sp:80,cd:3.8,s:'shard'},{a:'gapring',n:26,sp:52,cd:3.6,s:'holy',m:2},{a:'sweep',arc:2.8,cnt:24,sp:70,cd:5.6,s:'bolt',m:2},{a:'curtain',n:12,sp:72,gap:34,cd:5,s:'orb'}],
            [{a:'fan',n:11,sd:1.6,sp:88,cd:1.2,s:'bolt',m:0},{a:'fan',n:11,sd:1.6,sp:88,cd:1.2,s:'bolt',m:1,at:.6},{a:'corners',n:7,sd:.8,sp:84,cd:3.2,s:'shard'},{a:'gapring',n:30,sp:56,cd:3,s:'holy',m:2},{a:'sweep',arc:3.4,cnt:30,gap:.07,sp:74,cd:4.8,s:'bolt',m:2,mirror:1},{a:'tickring',n:16,cnt:4,sp:58,cd:5.6,s:'orb',m:2},{a:'curtain',n:13,sp:76,gap:30,cd:4.2,s:'orb'},{a:'lance',n:12,sp:180,w:.7,cd:4.6,s:'bolt'},{a:'summon',type:'ringR',n:3,cd:8},{a:'summon',type:'dart',n:5,cd:6.5}]]},
  tick(dt,live){if(!live||G.boss||G.mini)return;const t=bgT(),per=Math.floor(t/13),ph=t-per*13;if(ph>=11&&GATE.fired!==per){GATE.fired=per;const xc=GATE.wallX(per),gy=GATE.gapY(per);for(let y=TOP+5;y<BOT-3;y+=9){if(Math.abs(y-gy)<24)continue;ebShot(xc,y,-24,0,{sty:'bolt',life:2.6})}}},
  fired:-1,wallX:per=>170+((per*53)%80),gapY:per=>TOP+40+((per*37)%100),
  fg(t){if(G.boss||G.mini)return;const per=Math.floor(t/13),ph=t-per*13;if(ph>=9.2&&ph<11&&blinkAt(t,3)){const xc=GATE.wallX(per)|0,gy=GATE.gapY(per);ctx.fillStyle='#ffd866';for(let y=TOP+5;y<BOT-3;y+=9){if(Math.abs(y-gy)<24)continue;ctx.fillRect(xc-1,y,2,4)}warnText('GATE WALL',t)}},
  scene:K_=>({seed:24,angles:[0,.6,0,-.6,.3,0,-.3,.8],sky:['#05030a','#120a1c','#2a1a2c','#4a3a2a'],skyFn:(x,y)=>.08+y/200*.28+.18*Math.exp(-Math.pow((x-230)/80,2)-Math.pow((y-90)/60,2)),stars:[GLD[2],GLD[3],WH,WH],
    layers:[
      {z:'bg',t:'clouds',ramp:['#05030a','#2a1a00',GLD[1],GLD[2]],seed:241,vx:5,alpha:.34,thr:.52,fx:.02,fy:.07},
      {z:'bg',t:'objs',n:1,vx:3,seed:242,list:[darken(gateRing(70),.4)],pos:[[200,64]]},
      {z:'bg',t:'objs',n:5,vx:10,seed:243,list:[darken(pillar(24,150,1),.3),darken(pillar(18,120,2),.3),darken(monolith(34,90),.3)],lights:YL},
      {z:'bg',t:'objs',n:7,vx:16,seed:247,list:[darken(pillar(14,70,4),.65),darken(monolith(18,50),.65)]},
      {z:'mid',t:'objs',n:6,vx:24,seed:244,list:[stairs(40,22),monolith(14,34),stairs(28,16)],lights:YL},
      {z:'mid',t:'streak',n:14,vx:80,len:5,cols:[GLD[2],GLD[3],WH],seed:26},
      {z:'fg',t:'objs',n:2,vx:80,seed:245,list:[darken(pillar(30,170,3),.6)]},
      {z:'fg',t:'clouds',ramp:['#05030a','#2a1a00',GLD[1]],seed:246,vx:44,alpha:.24,thr:.58}]}),
  script(sc,h){waves(h,[[3,'ring',8,.38,60,0],[8,'dart',7,.32,40,24],[13,'ringR',4,1.1,70,36],[18,'cross',4,1.4,50,40],[24,'ring',9,.3,120,0],[30,'pod',1,0,100,0],[33,'dart',8,.28,45,18],
    [39,'ringR',5,1,60,28],[44,'cross',5,1.2,50,36],[49,'ring',10,.26,100,0],[55,'pod',2,2,70,60],[60,'dart',9,.24,40,16],[65,'ringR',6,.85,60,24],[71,'cross',5,1.1,60,32],[76,'ring',11,.24,80,0],[79,'pod',1,0,100,0]])}
};
function pillar(w,h,seed){return B.fin(cnv(w,h,g=>{poly(g,[[1,h],[3,6],[w-3,6],[w-1,h]],OBS);px(g,OBS[4],4,6,2,h-8);poly(g,[[0,6],[2,0],[w-2,0],[w,6]],GLD);for(let i=0;i<h/10;i++)px(g,GLD[2],w/2-3,12+i*10,6,2)}))}
function monolith(w,h){return B.fin(cnv(w,h,g=>{poly(g,[[w*.2,h],[0,h*.2],[w*.5,0],[w,h*.2],[w*.8,h]],OBS);line(g,OBS[4],w*.5,1,w*.5,h);px(g,GLD[3],w*.5-1,h*.4,3,5)}))}
function stairs(w,h){return B.fin(cnv(w,h,g=>{for(let i=0;i<4;i++){poly(g,[[i*w/5,h-i*h/4],[w,h-i*h/4],[w,h-(i+1)*h/4],[i*w/5,h-(i+1)*h/4]],i===3?GLD:OBS)}}))}
function gateRing(r){return cnv(r*2+16,r*2+16,g=>{const c=r+8;for(let k=0;k<7;k++)for(let i=0;i<240;i++){const a=i/240*TAU;px(g,rampAt([GLD[0],GLD[1],GLD[2],GLD[3],WH],.35+.35*Math.sin(a*2)+(k===3?.3:0),i,k),c+Math.cos(a)*(r-k*2),c+Math.sin(a)*(r-k*2),2,2)}
  ell(g,c,c,r-16,r-16,[K,'#120a1c','#3a0a08']);for(let i=0;i<12;i++){const a=i/12*TAU;px(g,WH,c+Math.cos(a)*(r-3),c+Math.sin(a)*(r-3),2,2)}})}

PACKS[23]=mkPack3(GHOSTF);PACKS[24]=mkPack3(GATE);
})();
