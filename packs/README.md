# Idlyte art packs

Each planet can bring its own look and cast: background, terrain, foreground weather, enemy sprites and behaviours, hazards, bullet styles and a boss.
A pack is one file, `packs/<name>.js`, a classic script loaded after the game. It fills `PACKS[planetIndex]` (1 asteroid, 2 ice, 3 lava, 4 gas, 5 base; 0 is Open Space and has no pack).
Everything in `index.html` that is declared at top level (functions, `const`s) can be used directly from a pack: `ctx`, `W`, `H`, `TOP`, `BOT`, `mk`, `fromRows`, `shaded`, `dithered`, `polish`, `whiteOf`, `snap64`, `BAYER`, `CHROME`, `PAL`, `text`, `pat`, `rnd(a,b)`, `G`, `P`, `E`, `EB`, `PB`, `FX`, `PK`, `spawn`, `boom`, `enemyShot`, `ebShot`, `ebAim`, `ebRing`, `bossWear`, `loopScale`, `bgT`, `hurtPlayer`, `shake`, `sfxBoom`, `sfxEnemyLaser`, `drawStars`.
Do not edit `index.html` or any other pack. If you need something from the framework, say so in your report.

## File skeleton

```js
PACKS[2]={
  init(){
    // runs once, the first time the planet is flown. Pre-render every sprite here.
    const enemies={}, bullets={};
    return {
      drawBackground(t){ /* ctx is the game canvas, 320x200, already filled black. t = bgT() */ },
      drawMidground(t){ /* optional: over enemies, under ship and shots (dust that hides enemies) */ },
      drawForeground(t){ /* optional: over everything, under the HUD (snow, embers, lightning flash) */ },
      noFG:true,          // optional: hide the default cloud strips at the screen edges
      tick(dt,live){},    // optional: once per update step. timers, eruptions, laser fences. may call hurtPlayer()
      enemies,            // see below
      bullets,            // optional enemy bullet styles
      boss:{ /* see below */ }
    };
  },
  script(sc,h){ /* optional: add or change spawns, see below */ }
};
Object.assign(PLANETS[2],{d:'SHORT DESCRIPTION IN CAPITALS',every:9,waves:[['ring',6,.45]]}); // planet entry: description, wave table
```

## Play area

The canvas is 320x200 and is shown scaled up with hard pixels. Play happens between `TOP` (14) and `BOT` (192). The player ship is about 41x29, flies by itself at x 36 to 150, anywhere vertically. HUD sits over the top bar, the bottom bar, bottom left (x 2 to 76, y 148 to 191), bottom right (level map) and top right (speed buttons), so keep important action out of those corners when you can.

## Enemies

`enemies` is keyed by the game's behaviour types. A level script spawns these types; your pack decides what they look like and how they act:

| type | default behaviour | default size | hp |
|---|---|---|---|
| ring | flies left at 42 px/s, bobs `y=y0+sin(t*3.2+ph)*30`, aimed shot every 2.2 to 4 s | 15x9 | 1 |
| ringR | same, a bit faster, tougher | 20x10 | 2 |
| dart | fast, 120 px/s, tracks the player height for the first 0.9 s | 16x9 | 1 |
| cross | 48 px/s, bounces up and down, aimed shot every 1.8 to 3 s | 13x13 | 3 |
| pod | slow 24 px/s, bobs, 3 way shot every 2.2 to 3.2 s, carries a power-up that drops when it dies | 17x13 | 5 |
| rock | drifting hazard, random height, speed and spin, hurts on contact. `e.big` large (hp 5, 21x21) or small (hp 2, 9x9), `e.spr` picks a sprite | | |

Each entry may have:

```js
cross:{
  frames:[canvas,...], white:[canvas,...], fps:10,   // simplest: pre-rendered frames, white = flash versions (use whiteOf)
  draw(ctx,e,flash){},                               // or draw yourself (e.x, e.y is the centre, e.t is its age in seconds)
  w:15,h:9, hp:2, pts:150, vx:-50,                   // optional overrides of hit box, base hp, score, speed
  init(e,o){},                                       // when spawned. o is the script entry (o.variant, etc). set your own fields on e
  move(e,dt,live){},                                 // REPLACES the default movement and shooting
  update(e,dt,live){},                               // runs AFTER the default movement (phase, heal others, spawn minions)
  onKill(e){}                                        // when it dies
}
```

An enemy `e` has: `x y vx vy w h hp mhp pts type fr t ph y0 flash shootT big spr carry`. Extra flags you may set on it:
`e.immune=true` shots are absorbed and do nothing. `e.hitTest=(e,x,y)=>0|1|multiplier` custom shot hit area (return damage multiplier, 0 = miss). `e.touch=(e,px,py)=>bool` custom contact with the player. Spawn more enemies from a hook with `spawn({type:'dart',y:80})` (it enters at x=W+12; you can set `.x` right after).
Terrain-mounted enemies: compute their y from your own terrain profile using the same clock as the background, `bgT()`, and set `vx` to the terrain scroll speed so they stay put on it.

## Bullets

`ebShot(x,y,vx,vy,opts)`, `ebAim(x,y,speed,angleOffset,opts)` (aimed at the player), `ebRing(x,y,n,speed,a0,opts)`. `opts` may set: `sty:'name'` (drawn by `bullets.name=(ctx,b)=>{...}`), `ay` gravity, `life` seconds before it vanishes, `hw`,`hh` extra hit size, `pierce:true` (not removed on hit). Always play `sfxEnemyLaser()` or your own sound sparingly: it is rate limited.

## Boss

```js
boss:{
  w:110,h:70,hp:1,     // hit box for generic code, and a multiplier on the standard boss hp (90 x level scaling). Level 1 to 3, G.level; loops G.loop
  init(b){},           // set b.x,b.y, b.in=true (entrance), your fields. b.hitTest / b.touch may be set here
  update(b,dt,live){}, // movement and attacks. b.t is its age. b.in = still entering; set false when in place. live=false: do not attack
  draw(ctx,b,flash){}, // b.x,b.y centre. flash=true: draw the white hit flash. Show damage by b.hp/b.mhp
  onKill(b){}          // optional
}
```

The game handles the boss bar, hp, the explosion and loot when `b.hp<=0`. Call `bossWear(b,live)` from `update` for smoke and debris at damage stages. Make it a real fight: 3 phases by hp (above 66%, 33 to 66%, below 33%), attack patterns that read clearly and can be dodged by an autopilot with `P.y` movement only (the ship flies by itself), at most about 25 enemy bullets alive at once, summons from `spawn()`, and keep the boss mostly at x 150 to 310 so it does not sit on the ship. The ship hits for about 1.4 to 5 damage per second at the start, so the standard 90 hp x scaling gives a 60 to 150 s fight: keep attack density moderate.

Note: ordinary enemies are removed when they leave the left edge (x below -40) or the top and bottom; a boss is never culled, so it may leave the screen and return.

## Mini boss (optional, used by the elite stages)

Halfway through every level (at 43 s) the game spawns a mini boss, `G.mini`, with its own bar labelled ELITE. By default it is the planet's own pod or ringR sprite at double size. A pack can bring its own:

```js
mini:{ w,h,hp:1, init(e){}, update(e,dt,live){}, draw(ctx,e,flash){}, onKill(e){} }   // same contract as boss; e.type is 'mini'
```
Base hp is 26 x level scaling (about a quarter of a boss) times your `hp` multiplier. Like a boss it is never culled when it leaves the screen, may use `e.hitTest` and `e.touch`, and the game gives the loot when it dies. It is not tappable with zap points. Keep it a short, sharp fight of 20 to 40 seconds with its own 2 or 3 attack patterns. Dev: `g.dev.mini()` spawns it, `g.dev.sheet(pl,3,hpFraction)` shows it, and `spawnMini()` is a global.

## Borrowing other packs' bosses (boss rush)

`PACKS[i]` holds each planet's pack definition and `PACKA[i]` its built assets. To reuse another planet's boss: `const A2=PACKA[i]||(PACKA[i]=PACKS[i].init())`, then `A2.boss` has `w,h,hp,init,update,draw,onKill`. Create your own entity object for it (type 'boss' fields `x y hp mhp t flash in pkBoss`), call `A2.boss.init(sub)`, then drive `A2.boss.update(sub,dt,live)` and `A2.boss.draw(ctx,sub,flash)` from your own boss. Planet 0 (Open Space) has no pack: its boss is the global `bossUpdate(b,dt,live)` and `drawBoss(b)` working on an entity with `pkBoss:false`.


## Elite stages: harder and harder, bullet hell

Stages 6 to 9 (sea, desert, cave, city) are end-game and must be clearly harder than stages 1 to 5, and each one harder than the last (6 easiest, 9 the hardest). Raise difficulty with density and pattern, not with unfair surprises: spirals (`ebSpiral` called every 0.1 s with a rotating `a0`), fans (`ebFan`), curtains with a gap (`ebCurtain(x,yTop,yBot,n,vx,gapY,gapH,o)`), aimed rings, crossing lattices, rotating arms. You may have up to about 60 enemy bullets alive on elite stages (the 25 limit above is for stages 1 to 5), but the ship must always have a readable path: gaps at least 40 px high, bullets 3 to 5 px, slow (45 to 75 px/s) for the dense ones, fast only when sparse. Telegraph every big pattern. Level 1 of an elite stage is already tougher than level 3 of stage 5; levels 2 and 3 add more patterns, faster timers, more elites, and an extra boss phase or enrage. Mini bosses get 2 or 3 patterns, bosses 4 or more. A player with a fully maxed ship should be able to win but not casually.

## Level script

`script(sc,h)` runs after the shared script and the planet's `waves` are built. `sc` is the spawn list (`{t,type,y,...}` sorted by `t` afterwards). `h.add(t,type,n,gap,y0,dy,opts)` adds n spawns; `h.vwave(t,type,n,cy)`; `h.level` 1 to 3; `h.LEN` is the level length (86 s, the boss comes after). You can push your own entries such as `{t:30,type:'pod',y:100,variant:1}`, or filter `sc`.

## Hazards and the autopilot (important)

The ship flies itself. Its autopilot (`aiThink` in index.html) only avoids what exists as an entity in `E` (it uses `e.x,e.y,e.vx,e.vy,e.w,e.h`) and bullets in `EB` (it predicts their straight path using `vx,vy`). A hazard that is only drawn, or only checked inside your `tick`, will NOT be avoided and will feel unfair.
So: anything that can hurt the ship must be an entity in `E` (spawn it as type `rock` with your own `draw`, `touch`, `w`, `h`, and flags such as `e.hazard=true`) or a bullet in `EB`. Laser fences, falling ice, lava bombs, eruption rocks and similar things should be modelled that way, with a clear telegraph (a glow or flicker for about 1 second) before they become dangerous, and always leave a gap the ship can reach.
Bullets that curve (gravity `ay`) are predicted as straight lines by the autopilot, so keep the gravity gentle or give them long, readable arcs.

## Performance

Build every sprite and strip once in `init()`. In the per-frame functions use `drawImage` of pre-rendered canvases and a small number of `fillRect`s (a few hundred at most). Avoid `getImageData`/`putImageData` per frame, avoid allocating arrays or closures per frame, and cap particles (about 60).

## Art style

- Pixel art for a Commodore 64 look: hard edges, no anti-aliasing, black outlines, dithering with the 4x4 `BAYER` matrix, a limited palette. Prefer the game's colours: `#000000 #1c1840 #352879 #6c5eb5 #6f3d86 #8a5aa6 #cc99ff #cc44cc #ff77ff #9a3a3a #68372b #9a6759 #ff9966 #b8c76f #ffffaa #588d43 #2c5a2c #9ad284 #ccff99 #70a4b2 #9ad2e0 #444444 #6c6c6c #959595 #bbbbbb #ffffff`.
- Sprites are lit from the upper left, shaded in 3 to 5 steps, with a bright rim on top edges. Run `polish(canvas)` on finished sprites for the game's edge shading.
- Enemy sprites about 14 to 24 pixels wide; big creatures up to 40. Bosses roughly 90 to 150 wide. Give every enemy 2 to 6 animation frames. Bright enough to read against your background: the player has to see bullets and enemies at a glance.
- Backgrounds: at least 3 parallax layers, scrolling right to left by `t`. Draw terrain along the top and bottom edges with `drawImage` of pre-rendered strips; do not run per-pixel loops per frame. Keep per-frame work small (the game runs at x16 speed on phones).
- Every planet should feel different from the others in colour, shape language and motion.
- No text on screen from packs. No em dashes anywhere, including comments.

## Testing (browser pane, dev server `http://localhost:8303/idlyte/index.html?v=N`, change N to reload fresh)

Open your own tab (tabs_create), never reuse another tab. In the page console (javascript_tool):

```js
const g=window.__g;
g.dev.sheet(2,0);                // contact sheet of all enemy sprites, then take a screenshot
g.dev.sheet(2,1,1);              // the boss at full health; sheet(2,1,0.4) damaged; sheet(2,1,1,true) flash
g.dev.zoom(2,'cross');            // overlay: one enemy type's frames enlarged to inspect the pixels, then screenshot (g.dev.zoom(2,'boss',0.5) the boss, g.dev.zoom() removes it)
g.dev.sheet(2,2,30);             // the whole scene at t=30 s (background, midground, foreground, no HUD)
g.dev.run(2,1);                  // start planet 2, level 1 with a tough ship; then:
g.dev.step(20); g.dev.show();    // advance 20 s of game time, draw one frame and freeze; screenshot
g.dev.boss(); g.dev.step(5); g.dev.show();   // spawn the boss and watch it
```
The pane throttles animation frames, so always use `g.dev.show()` or `g.dev.sheet(...)` to draw, then take the screenshot. Call `g.dev.run()` again to unfreeze. Check the console for errors (read_console_messages) and run long simulations (`g.dev.step(120)`) to be sure nothing throws.


## Flashing and blinking

The player can choose FLASHING EFFECTS: REDUCED (default) or NORMAL. Do not write your own fast on/off timers such as `Math.floor(t*16)%2`. Use `blinkAt(t,16)` (an on/off wave that REDUCED limits to 4 steps a second; pass a third number for a lower cap, for example `blinkAt(t,12,2)` for big areas) and `stepAt(t,n,cap)` for stepping counters. Test `fxReduced()` for anything that flashes the whole screen or a large area, and fade it with `ctx.globalAlpha` instead of switching it on and off. Full screen flashes go through `G.flashT`, which index.html limits to 2 a second and 25% white.
