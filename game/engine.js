/* Pure simulation, also usable by the offline test page. No network or DOM. */
(function (root) {
  'use strict';
  const CONFIG = { width:480, height:270, ground:211, speed:100, distance:2850, rainExtension:600, weddingExtension:500, gravity:600, jumpVelocity:-280,
    groomName:'HOJIN', coupleNames:'CHAE NA ♥ HO JIN', date:'2027.01.10' };
  const gaps = [{x:425,w:34},{x:916,w:44},{x:1670,w:34},{x:1350+CONFIG.rainExtension,w:38}];
  const platforms = [
    {x:850,w:66,h:48,stair:true}
  ];
  const obstacles=[
    {x:1240,w:42,h:24,sprite:'spikes'},
    {x:1540,w:24,h:22,sprite:'smallRock'},
    {x:1800,w:82,h:64,sprite:'crystals'}
  ];
  // One-way platforms: pass underneath or jump through, land only from above.
  const upperPlatforms=[{x:1240,w:184,top:135},{x:1462,w:118,top:135}];
  function support(x,feet){
    const upper=upperPlatforms.find(p=>x>=p.x&&x<p.x+p.w&&Math.abs(feet-p.top)<1);
    return upper?upper.top:surface(x);
  }
  const stages = ['TO OUR WEDDING','FOREST PATH','RAINY ROAD','HAPPILY EVER AFTER'];
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const smooth = (a,b,n) => { const t=clamp((n-a)/(b-a),0,1); return t*t*(3-2*t); };
  // Insert additional road during full rain; retain every other scene's timing.
  function storyProgress(distance){
    const hold=1137.5;
    const rainExtra=Math.min(CONFIG.rainExtension,Math.max(0,distance-hold));
    const weddingExtra=Math.min(CONFIG.weddingExtension,Math.max(0,distance-(1610+CONFIG.rainExtension)));
    return (distance-rainExtra-weddingExtra)/1750;
  }
  function weather(progress) {
    return { rain:smooth(.44,.65,progress)*(1-smooth(.75,.91,progress)), warm:smooth(.77,.98,progress), forest:smooth(.16,.36,progress) };
  }
  function surface(x) {
    if(gaps.some(g=>x>g.x&&x<g.x+g.w)) return null;
    if(x>=720&&x<850)return CONFIG.ground-(x-720)*48/130;
    if(x>=960&&x<=1090)return CONFIG.ground-48+(x-960)*48/130;
    const platform=platforms.find(p=>x>=p.x&&x<=p.x+p.w);
    return CONFIG.ground-(platform?platform.h:0);
  }
  function create() {
    const coins=[];
    for(let i=0;i<Math.floor((CONFIG.distance-100)/57);i++) {
      const x=260+i*57;
      if(obstacles.some(o=>Math.abs(x-o.x)<75)||(x>=850&&x<=1000)||(x>=1240&&x<=1580))continue;
      coins.push({x,y: i%5===3?151:(surface(x)??CONFIG.ground)-30,taken:false});
    }
    // Coin arcs cue a jump before each rainy-road obstacle.
    for(const {x:center} of obstacles){
      for(const [dx,y] of [[-42,175],[0,151],[42,175]]){
        const x=center+dx;if(x>=1240&&x<=1580)continue;
        coins.push({x,y,taken:false});
      }
    }
    for(const [x,y] of [[891,103],[917,76],[943,95],[969,157]])coins.push({x,y,taken:false});
    for(const [x,y] of [[1260,100],[1290,100],[1360,92],[1390,92],[1480,100],[1510,100],[1540,100]])coins.push({x,y,taken:false});
    // First two heart coins wait in the world; the third is released by a box.
    for(const [x,y] of [[1000,110],[1540,64]]){
      // Reserve a clear horizontal pocket around each larger collectible.
      for(let i=coins.length-1;i>=0;i--)if(Math.abs(coins[i].x-x)<56)coins.splice(i,1);
      coins.push({x,y,type:'heart',taken:false});
    }
    // Regular coins follow their local walking surface at a constant clearance.
    for(const coin of coins){
      if(coin.type==='heart')continue;
      const upper=upperPlatforms.find(p=>coin.x>=p.x&&coin.x<p.x+p.w);
      const gap=gaps.find(g=>coin.x>g.x&&coin.x<g.x+g.w);
      let top=upper?upper.top:surface(coin.x)??(gap?surface(gap.x-.01):CONFIG.ground);
      for(const obstacle of obstacles){
        if(Math.abs(coin.x-obstacle.x)<=obstacle.w/2+8)top=Math.min(top,CONFIG.ground-obstacle.h);
      }
      coin.y=top-30;
    }
    const boxes=[600,652,704,2400,2452,2504,2556,2608].map(x=>({x,bottom:133,opened:false,openedAt:0,reward:x===2608?'heartCoin':'coin',bonus:x===2608?0:3}));
    boxes.push({x:1360,bottom:72,opened:false,openedAt:0,reward:'ring',bonus:0});
    const bricks=[];
    for(const [first,count] of [[600,3],[2400,5]]){
      bricks.push({x:first-52,bottom:133},{x:first-26,bottom:133});
      for(let i=0;i<count;i++)bricks.push({x:first+i*52+26,bottom:133});
    }
    for(const x of [1282,1308,1334])bricks.push({x,bottom:72});
    for(const brick of bricks)brick.broken=false;
    return { mode:'ready', distance:0, x:160, y:CONFIG.ground, vy:0, grounded:true, time:0, stage:0, score:0,boxes,bricks,ring:null,ringCollected:false,
      lives:3, heartsCollected:0, slow:0, flash:0, meetTime:0, coins, particles:[], pickupEffects:[],lastPickup:{coin:-99,heart:-99,ring:-99}, hits:new Set(), events:[] };
  }
  function pickup(s,type,x,y){
    s.lastPickup[type]=s.time;
    s.pickupEffects.push({type,x,y,time:s.time});
    const special=type!=='coin',color=type==='heart'?'#ffbad5':type==='ring'?'#baf5ff':'#ffe48a';
    for(let i=0;i<(special?10:6);i++){
      const angle=i*Math.PI*2/(special?10:6),speed=special?58:40;
      s.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-25,life:special?.6:.35,gravity:45,size:special?3:2,color,sparkle:true});
    }
  }
  function start(s) { if(s.mode==='ready') { s.mode='running'; s.events.push('start'); } }
  function jump(s) {
    if(s.mode!=='running'||!s.grounded) return false;
    // Lower-road jumps can reach the upper route throughout the spike corridor,
    // including after missing its entrance. Upper-platform jumps stay small.
    const upperEntry=s.x>=1185&&s.x<1580&&s.y>=200;
    const onUpper=upperPlatforms.some(p=>s.x>=p.x&&s.x<p.x+p.w&&Math.abs(s.y-p.top)<1);
    const crystalJump=obstacles.some(o=>o.sprite==='crystals'&&s.x>=o.x-110&&s.x<=o.x+o.w/2)&&s.y>=200;
    s.vy=onUpper?-190:upperEntry?-345:crystalJump?-355:CONFIG.jumpVelocity;
    s.grounded=false; s.events.push('jump'); return true;
  }
  function bump(s,id) {
    if(s.hits.has(id)) return;
    s.hits.add(id); s.lives=Math.max(0,s.lives-1); s.slow=.28; s.flash=.65; s.events.push('bump');
  }
  function step(s,dt) {
    dt=clamp(dt,0,1/30);
    if(s.mode==='ready') return;
    s.time+=dt;
    for(const p of s.particles) { p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=(p.gravity??90)*dt; p.life-=dt; }
    s.particles=s.particles.filter(p=>p.life>0);
    s.pickupEffects=s.pickupEffects.filter(p=>s.time-p.time<(p.type==='coin'?.45:.75));
    if(s.mode==='ending') return;
    if(s.mode==='meeting') { s.meetTime+=dt; if(s.meetTime>=1.1) { s.mode='ending'; s.events.push('ending'); } return; }
    s.slow=Math.max(0,s.slow-dt); s.flash=Math.max(0,s.flash-dt);
    const oldX=s.x,oldFeet=s.y,oldHead=s.y-54;
    s.distance=Math.min(CONFIG.distance,s.distance+CONFIG.speed*(s.slow>0?.65:1)*dt);
    s.x=160+s.distance;
    // Follow grounded slopes in both directions without hops or speed changes.
    if(s.grounded&&((s.x>=720&&s.x<=916)||(s.x>=960&&s.x<=1091))){
      const oldGround=surface(oldX),newGround=surface(s.x);
      if(oldGround!==null&&newGround!==null&&Math.abs(oldFeet-oldGround)<2)s.y=newGround;
    }
    const stage=Math.min(3,Math.floor(storyProgress(s.distance)*4));
    if(stage!==s.stage) { s.stage=stage; s.events.push('stage'); }
    // Missed gaps cause damage, but never synthesize a jump input.
    gaps.forEach((g,i)=>{
      const edge=surface(g.x-.01)??CONFIG.ground;
      if(oldX<g.x&&s.x>=g.x&&s.y>edge-10) {
        bump(s,'gap'+i); s.grounded=false;
      }
    });
    // A missed raised ledge gently lifts the runner onto it.
    platforms.forEach((p,i)=>{
      const top=CONFIG.ground-p.h;
      if(p.stair){
        // Small steps are climbed at full speed without an involuntary hop.
        if(oldX<p.x&&s.x>=p.x&&s.y>top){s.y=top;s.vy=0;s.grounded=true;}
        return;
      }
      if(oldX+9<p.x&&s.x+9>=p.x&&s.y>top+2) {
        bump(s,'ledge'+i); s.y=top; s.vy=0; s.grounded=true;
      }
    });
    if(s.grounded){
      for(const p of upperPlatforms){
        if(oldX<p.x&&s.x>=p.x&&oldFeet>=p.top&&oldFeet-p.top<=8){s.y=p.top;}
      }
    }
    const floor=s.grounded?support(s.x,s.y):surface(s.x);
    if(s.grounded&&(floor===null||floor>s.y+1)) s.grounded=false;
    if(!s.grounded) {
      s.vy+=CONFIG.gravity*dt; s.y+=s.vy*dt;
      if(s.vy>=0){
        const landings=upperPlatforms.filter(p=>s.x>=p.x&&s.x<p.x+p.w&&oldFeet<=p.top+1&&s.y>=p.top).map(p=>p.top);
        if(floor!==null&&s.y>=floor)landings.push(floor);
        if(landings.length){s.y=Math.min(...landings);s.vy=0;s.grounded=true;}
      }
    }
    if(s.y>CONFIG.ground+24) { s.y=CONFIG.ground+24; s.vy=0; }
    if(s.x>=1240&&s.x<1580&&s.y>=187)bump(s,'spikeBed');
    for(let i=0;i<obstacles.length;i++){
      const o=obstacles[i];
      if(o.x<1580)continue; // These old individual hazards are replaced by the spike bed.
      // Inset the collision box from transparent edges and decorative spikes.
      // Use a narrow torso/foot area rather than the full running stride.
      const halfWidth=o.w/2-22,top=CONFIG.ground-o.h+4;
      if(!s.hits.has('obstacle'+i)&&s.x+6>=o.x-halfWidth&&oldX-6<=o.x+halfWidth&&s.y-3>top&&s.y-50<CONFIG.ground){
        bump(s,'obstacle'+i);
      }
    }
    // Only an upward head strike opens a box; walking past never blocks progress.
    const overhead=[...s.boxes,...s.bricks].sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x));
    for(const box of overhead){
      if(!box.opened&&!box.broken&&s.vy<0&&oldHead>=box.bottom&&s.y-54<=box.bottom&&box.x>=oldX-20&&box.x<=s.x+20){
        if(s.bricks.includes(box)){
          box.broken=true;s.y=box.bottom+54;s.vy=65;s.events.push('brick');
          for(let i=0;i<6;i++)s.particles.push({x:box.x+(i%3-1)*7,y:box.bottom-18+Math.floor(i/3)*8,vx:(i%3-1)*65,vy:-105-Math.floor(i/3)*30,life:.65,gravity:480,size:5,color:i%2?'#bd873d':'#efd18a'});
          continue;
        }
        box.opened=true;box.openedAt=s.time;s.score+=box.bonus;
        if(box.reward==='ring')s.ring={x:box.x+8,y:box.bottom-30,vx:78,vy:-65,active:true};
        if(box.reward==='heartCoin')s.coins.push({x:box.x+8,y:box.bottom-42,type:'heart',taken:false,moving:true,vx:78,vy:-65});
        s.y=box.bottom+54;s.vy=65;s.events.push('coin');
        for(let i=0;i<8;i++)s.particles.push({x:box.x,y:box.bottom-12,vx:(i-3.5)*15,vy:-70,life:.4});
      }
    }
    if(s.ring?.active){
      const ring=s.ring,oldRingY=ring.y;
      ring.x+=ring.vx*dt;ring.vy+=360*dt;ring.y+=ring.vy*dt;
      if(ring.vy>=0){
        const tops=upperPlatforms.filter(p=>ring.x>=p.x&&ring.x<p.x+p.w&&oldRingY<=p.top+1&&ring.y>=p.top).map(p=>p.top);
        const ground=surface(ring.x);if(ground!==null&&oldRingY<=ground+1&&ring.y>=ground)tops.push(ground);
        if(tops.length){ring.y=Math.min(...tops);ring.vy=0;}
      }
      if(Math.abs(ring.x-s.x)<28&&ring.y>s.y-54&&ring.y-32<s.y+3){
        ring.active=false;s.ringCollected=true;s.events.push('ring');
        pickup(s,'ring',ring.x,ring.y-16);
      }
      if(ring.y>320||ring.x<s.x-240)ring.active=false;
    }
    // Swept horizontal range avoids missed coins at slower frame rates.
    for(const coin of s.coins) {
      if(coin.moving&&!coin.taken){
        // Keep the box reward within reach while it falls, even during slowdown.
        // Opening the box still shows a real item; contact awards it without another jump.
        coin.x=s.x+10;coin.vy+=360*dt;coin.y+=coin.vy*dt;
        const floor=surface(coin.x);
        if(floor!==null&&coin.y>=floor-20){coin.y=floor-20;coin.vy=0;}
      }
      if(!coin.taken && coin.x>=oldX-14 && coin.x<=s.x+14 && coin.y>s.y-43 && coin.y<s.y+3) {
        coin.taken=true; s.score++; s.events.push(coin.type==='heart'?'heart':'coin');
        if(coin.type==='heart')s.heartsCollected++;
        pickup(s,coin.type==='heart'?'heart':'coin',coin.x,coin.y);
      }
    }
    if(s.distance>=CONFIG.distance) { s.y=CONFIG.ground; s.vy=0; s.grounded=true; s.mode='meeting'; s.events.push('meeting'); }
  }
  root.WeddingEngine={CONFIG,gaps,platforms,upperPlatforms,obstacles,stages,clamp,smooth,storyProgress,weather,surface,create,start,jump,step};
})(globalThis);
