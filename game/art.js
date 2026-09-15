/* Render the supplied PNGs unchanged. Source rectangles only select transparent
   sprites / atlas tiles; no recoloring, smoothing, or generated substitutes. */
(() => {
  const E=WeddingEngine,P=Pixel,C=E.CONFIG;
  const sprites={
    // Shared frame dimensions preserve scale and stride; row two begins 526px later.
    groom_run1:[48,32,400,500],groom_run2:[528,32,400,500],groom_run3:[1008,32,400,500],
    groom_run4:[48,558,400,500],groom_run5:[528,558,400,500],groom_run6:[1008,558,400,500],
    groom_jump:[241,161,839,915],groom_jumpdown:[250,189,793,917],
    groomFace:[108,40,270,220],
    bride_waiting:[270,163,834,987],bride_groom_meet:[124,173,1266,853],
    wedding:[372,106,899,892],castle:[12,11,1292,1168],
    ending_ring:[222,105,1120,883],
    ending_cheerup:[152,24,1214,1046],
    ending_kiss:[280,75,1020,925],
    tree:[23,105,1040,1246],flowertree:[33,116,1025,1237],
    treeSmall:[30,472,350,453],treeWide:[427,397,594,528],treeTall:[1066,196,362,729],
    shrub1:[27,523,260,220],shrub2:[314,503,392,240],shrub3:[720,421,348,322],shrub4:[1090,460,341,283],
    rainyRuins:[964,212,478,650],rainyRock:[490,390,466,472],
    rainyBush:[18,500,462,362],
    upperRockSmall:[96,412,566,442],upperRockTall:[798,360,600,494],
    cloud1:[45,245,685,316],cloud2:[758,165,838,402],cloud3:[1650,278,481,272],
    ground:[350,24,145,140],stone:[242,88,145,156],
    slopeUp:[10,20,325,155],slopeDown:[1840,20,325,155],
    upperStone:[242,815,170,105],
    arch1:[296,204,216,225],arch2:[546,204,220,225],
    archWide:[801,204,258,225],wall:[795,28,171,146],wallFlowers:[535,28,225,145],
    railing:[1250,467,270,149],lantern:[1010,440,70,176],
    flowers:[433,644,303,61],banner:[1920,430,116,281],stairs:[666,477,314,139],
    bannerFlowers:[2040,430,111,281],coin:[380,320,494,633],
    mysteryBox:[48,194,110,110],openBox:[48,458,110,110],
    ringItem:[48,103,114,135],ringIcon:[1197,881,70,82],
    heartCoin0:[68,85,360,540],heartCoin1:[540,85,300,540],heartCoin2:[982,85,150,540],
    heartCoin3:[1280,85,300,540],heartCoin4:[1628,85,520,540],
    boxHit0:[248,194,110,110],boxHit1:[370,194,110,110],boxHit2:[490,194,110,110],boxHit3:[610,194,110,110],boxHit4:[732,194,110,110],
    spikes:[700,471,160,102],smallRock:[1444,487,72,70],
    crystals:[1319,603,194,152],stoneSpike:[875,480,48,84],
    petal1:[105,246,211,196],petal2:[481,270,153,154],petal3:[786,246,239,205],petal4:[1166,246,190,194],
    bush1:[48,954,123,57],bush2:[348,944,136,67],bush3:[511,951,149,60],bush4:[1016,941,183,71],bush5:[1223,948,175,64]
  };
  // Shared cells preserve the natural change in silhouette as each petal turns.
  [62,175,282,396,497,612,709,821,918,1012,1114,1213,1310,1394,1474].forEach((center,i)=>{
    sprites['driftPetal'+i]=[center-48,82,96,88];
  });
  // A composed route, not a repeating bridge pattern. All joins share y=211;
  // broad terraces alternate with a few river openings and lead to the entrance.
  let terraceX=1428;
  const terrace=[
    ['wallFlowers',88],['arch1',72],['wall',70],['archWide',88],
    ['wallFlowers',88],['wall',70],
    ['wall',70],['archWide',88],['wallFlowers',88],['wall',78],['arch2',88],['wallFlowers',88],
    ['arch2',72],
    ['wall',70],['wall',70],['wallFlowers',70],
    ['archWide',88],['wallFlowers',88],['wall',70]
  ].map(([name,width])=>{const segment={name,x:terraceX,width};terraceX+=width;return segment;});
  const files=['groom_run','groom_jump','groom_jumpdown','bride_waiting','bride_groom_meet','wedding','ending_ring','ending_kiss','castle','tree','trees','bushy','flowertree','cloud','floor_ground','floor_stone','floor_castle','stage1_back','stage2_back','stage3_back','flower','coin','yoso','mysterybox','ring'];
  files.push('heart_coin','ending_cheerup','stones','stones2');
  const images={},failed=[];
  let settled=0;
  function reportLoading(){window.parent.postMessage({type:'wedding:loading',loaded:++settled,total:files.length,ready:false},'*');}
  const ready=Promise.all(files.map(name=>new Promise(resolve=>{
    const image=new Image();image.onload=()=>{images[name]=image;reportLoading();resolve();};image.onerror=()=>{failed.push(name);reportLoading();resolve();};image.src=`png/${name}.png?v=heart-pink-7`;
  })));
  function sprite(ctx,name,x,feet,height,alpha=1){
    let file=name;
    if(name==='upperRockSmall'||name==='upperRockTall')file='stones2';
    if(name.startsWith('rainy'))file='stones';
    if(name.startsWith('heartCoin'))file='heart_coin';
    if(name==='groomFace')file='groom_run';
    if(name==='ringItem'||name==='ringIcon')file='ring';
    if(['treeSmall','treeWide','treeTall'].includes(name))file='trees';
    if(name.startsWith('shrub'))file='bushy';
    if(['spikes','smallRock','crystals','stoneSpike'].includes(name)||name.startsWith('driftPetal'))file='yoso';
    if(name==='mysteryBox'||name==='openBox'||name.startsWith('boxHit'))file='mysterybox';
    if(name.startsWith('groom_run'))file='groom_run';
    if(name.startsWith('cloud'))file='cloud';
    if(name.startsWith('bush'))file='floor_stone';
    if(name==='ground')file='floor_ground';
    if(['flowers','banner','bannerFlowers','stairs','railing','lantern'].includes(name))file='floor_castle';
    if(name.startsWith('petal'))file='flower';
    const img=images[file],b=sprites[name];if(!img||!b)return;
    const width=height*b[2]/b[3];
    ctx.save();ctx.globalAlpha=alpha;
    ctx.drawImage(img,...b,Math.round(x-width/2),Math.round(feet-height),Math.round(width),Math.round(height));ctx.restore();
  }
  function backdrop(ctx,name,camera,offset,alpha){
    const img=images[name];if(!img||alpha<=0)return;
    // A wide plate drifts slowly; it never wraps, so there is no repeated seam.
    ctx.save();ctx.globalAlpha=alpha;
    ctx.drawImage(img,0,0,img.width,img.height,-camera*.05,offset,640,360);ctx.restore();
  }
  function lettering(ctx,label,x,y,scale=1,color='#fff9ed',center=false){
    P.text(ctx,label,x+1,y+2,'#35415f',scale,center);
    P.text(ctx,label,x,y,color,scale,center);
  }
  function draw(ctx,state,time){
    ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;
    const progress=E.storyProgress(state.distance),camera=Math.round(state.distance),w=E.weather(progress),end=state.mode==='ending';
    const weddingCamera=camera-C.rainExtension,weddingStart=1428+C.rainExtension;
    const destinationCamera=weddingCamera-C.weddingExtension;
    const gardenX=wx=>wx-(wx>=1900?destinationCamera:weddingCamera);
    ctx.fillStyle='#2889ef';ctx.fillRect(0,0,480,270);
    const storm=E.smooth(.40,.58,progress),sunset=E.smooth(.74,.94,progress);
    backdrop(ctx,'stage1_back',camera,-82,1);
    backdrop(ctx,'stage2_back',camera,-53,storm);
    // Sunset's shoreline is higher in the supplied image; align it to the others.
    backdrop(ctx,'stage3_back',camera,-3,sunset);
    for(let i=0;i<6;i++){
      const x=i*153-30-camera*.10;
      sprite(ctx,'cloud'+(i%3+1),x,72+(i%2)*27,18+(i%3)*5,(1-storm)*.95);
    }
    // The wedding entrance is a fixed building along the scrolling route.
    sprite(ctx,'castle',2110-destinationCamera,213,195);
    // Irregular, persistent planting groups share the ground's exact scroll rate.
    // Coordinates stay fixed across frames and replay; the rainy corridor is empty.
    for(const [world,name,height] of [
      [38,'treeTall',112],[91,'treeSmall',79],
      [246,'treeWide',102],[402,'treeTall',118],
      [568,'treeWide',94],[746,'treeTall',108],[861,'treeWide',91],
      [2250,'flowertree',91],[2378,'flowertree',108],[2425,'flowertree',82],[2705,'flowertree',96]
    ]){
      const feet=E.surface(world);if(feet!==null)sprite(ctx,name,world-camera,feet+1,height);
    }
    // A separate foreground pass keeps all four bushes in front of every tree.
    for(const [world,name,height] of [[113,'shrub1',23],[274,'shrub4',25],[593,'shrub2',26],[890,'shrub2',25]]){
      const feet=E.surface(world);if(feet!==null)sprite(ctx,name,world-camera,feet+1,height);
    }
    // Large scenery sits behind the entire two-storey route, at one atlas scale.
    // Ground and platforms are drawn afterward; no decorative pieces sit on top.
    const rainySceneryScale=.21;
    for(const [world,name] of [[1180,'rainyRuins'],[1620,'rainyRock']]){
      sprite(ctx,name,world-camera,C.ground+1,sprites[name][3]*rainySceneryScale,.7);
    }
    // Small, subdued accents behind the upper path; coin silhouettes stay clear.
    for(const [world,name,height] of [[1272,'upperRockSmall',442*.045],[1296,'rainyBush',12],[1498,'upperRockTall',494*.045]]){
      const platform=E.upperPlatforms.find(p=>world>=p.x&&world<p.x+p.w);
      if(platform)sprite(ctx,name,world-camera,platform.top+1,height,.55);
    }
    // All ground atlas pixels use one uniform scale. Extra depth is tiled soil,
    // never a vertically stretched grass block.
    const groundScale=.4,tileW=58;
    for(let wx=Math.floor(camera/tileW)*tileW;wx<camera+522;wx+=tileW){
      const x=wx-camera;
      // Clip each atlas tile to the terrain's exact collision surface and gaps.
      for(let strip=0;strip<tileW;strip+=2){
        const top=E.surface(wx+strip+1);if(top===null||wx+strip>=weddingStart)continue;
        const ramp=(wx+strip>=720&&wx+strip<850)||(wx+strip>=960&&wx+strip<1090);
        ctx.save();ctx.beginPath();ctx.rect(x+strip,top,2,270-top);ctx.clip();
        const materials=[
          ['ground','floor_ground',1],
          ['stone','floor_stone',ramp?0:E.smooth(1090,1200,wx)]
        ];
        for(const [key,file,opacity] of materials){
          const img=images[file];if(!img||opacity<=0)continue;
          ctx.globalAlpha=opacity;
          const [sx,sy,,sh]=sprites[key];
          const soilY=key==='ground'?90:170,soilH=60;
          for(let y=144;y<270;y+=soilH*groundScale){
            ctx.drawImage(img,sx,soilY,145,soilH,x,y,tileW,soilH*groundScale);
          }
          if(!ramp)ctx.drawImage(img,sx,sy,145,sh,x,top,tileW,sh*groundScale);
        }
        ctx.globalAlpha=1;
        ctx.restore();
      }
    }
    if(images.floor_ground){
      for(const [wx,name] of [[720,'slopeUp'],[960,'slopeDown']]){
        const bounds=sprites[name];
        ctx.drawImage(images.floor_ground,...bounds,wx-camera,163,bounds[2]*groundScale,bounds[3]*groundScale);
      }
    }
    for(const platform of E.upperPlatforms){
      const img=images.floor_stone;if(!img)break;
      const tileWidth=sprites.upperStone[2]*groundScale;
      for(let dx=0;dx<platform.w;dx+=tileWidth){
        const width=Math.min(tileWidth,platform.w-dx);
        ctx.drawImage(img,sprites.upperStone[0],sprites.upperStone[1],width/groundScale,sprites.upperStone[3],platform.x+dx-camera,platform.top,width,sprites.upperStone[3]*groundScale);
      }
    }
    // Solid garden terraces, occasional broad arches, then the carpet landing.
    for(const segment of terrace){
      const img=images.floor_castle;if(!img)break;
      const bounds=sprites[segment.name];
      const height=Math.max(59,Math.round(segment.width*bounds[3]/bounds[2]));
      ctx.drawImage(img,...bounds,segment.x-weddingCamera,211,segment.width,height);
    }
    sprite(ctx,'stairs',2050-destinationCamera,270,59);
    for(const [wx,height] of [[1480,27],[1780,30],[2156,32]])sprite(ctx,'railing',gardenX(wx),211,height);
    for(const wx of [1880,2112])sprite(ctx,'lantern',gardenX(wx),211,36);
    // Larger paired standards frame the garden approach and carpet entrance.
    for(const [wx,name,height] of [[1510,'banner',76],[1740,'bannerFlowers',80],[2000,'banner',82],[2200,'bannerFlowers',82]]){
      sprite(ctx,name,gardenX(wx),211,height);
    }
    // The lake in the plates remains visible through the actual gaps.
    // Draw the fixed route's plants; canvas clipping handles entry and exit,
    // including bushes whose centers have already passed the left edge.
    for(const wx of [1450,1760,1930,2150,2290])sprite(ctx,'shrub4',gardenX(wx),212,23);
    // Leave breathing room around the carpet; flower beds frame the terraces.
    for(const [wx,height] of [[1444,14],[1500,11],[1606,16],[1739,15],[1803,12],[1875,16],[1948,13],[2170,18],[2230,13],[2300,16]]){
      sprite(ctx,'flowers',gardenX(wx),213,height);
    }
    for(const wx of [1970,2070,2220,2310])sprite(ctx,'flowers',wx-weddingCamera,213,15);
    sprite(ctx,'bannerFlowers',2160-weddingCamera,211,80);
    sprite(ctx,'railing',2290-weddingCamera,211,30);
    if(!end){
      for(let wx=1240;wx<1580;wx+=34)sprite(ctx,'spikes',wx+17-camera,C.ground,24);
      for(const obstacle of E.obstacles)if(obstacle.x>=1580){
        // Two overlapping crystal clusters share one gameplay collision/hit ID.
        sprite(ctx,obstacle.sprite,obstacle.x-camera-7,C.ground,obstacle.h-4);
        sprite(ctx,obstacle.sprite,obstacle.x-camera+6,C.ground,obstacle.h);
      }
      // Continuous staggered brickwork, matching the supplied clipboard layout.
      for(const brick of state.bricks){
        if(brick.broken)continue;
        const x=brick.x-camera-13,y=brick.bottom-26;
        P.rect(ctx,x,y,26,26,'#4c392e');
        for(let row=0;row<4;row++){
          for(let col=0;col<3;col++){
            const left=col*13-(row%2?6:0),a=Math.max(1,left+1),b=Math.min(25,left+12);
            if(b<=a)continue;
            P.rect(ctx,x+a,y+1+row*6,b-a,5,'#bd873d');
            P.rect(ctx,x+a,y+1+row*6,b-a,1,'#efd18a');
            P.rect(ctx,x+a,y+5+row*6,b-a,1,'#8e5b2b');
          }
        }
      }
      for(const box of state.boxes){
        const x=box.x-camera,age=state.time-box.openedAt;
        const lift=box.opened&&age<.2?Math.sin(age/.2*Math.PI)*4:0;
        const boxPose=!box.opened?'mysteryBox':age<.25?'boxHit'+Math.min(4,Math.floor(age*20)):'openBox';
        sprite(ctx,boxPose,x,box.bottom+1-lift,29);
        if(box.opened&&age<.9&&box.reward==='coin'){
          const y=box.bottom-35-age*25;
          sprite(ctx,'coin',x,y,22);
          lettering(ctx,'+'+box.bonus,x,y+4,1,'#ffe49b',true);
        }
      }
      if(state.ring?.active)sprite(ctx,'ringItem',state.ring.x-camera,state.ring.y,32);
      for(const coin of state.coins)if(!coin.taken&&coin.x-camera>-24&&coin.x-camera<504){
        if(coin.type==='heart')sprite(ctx,'heartCoin'+(Math.floor(state.time*8)%5),coin.x-camera,coin.y+25,50);
        else sprite(ctx,'coin',coin.x-camera,coin.y+11,22);
      }
      state.particles.forEach(p=>{
        ctx.globalAlpha=Math.min(1,Math.max(0,p.life/.3));const size=p.size??2,x=p.x-camera;
        P.rect(ctx,x,p.y,size,size,p.color??'#fff1ac');
        if(p.sparkle){P.rect(ctx,x-size,p.y,size*3,size,p.color);P.rect(ctx,x,p.y-size,size,size*3,p.color);}
      });ctx.globalAlpha=1;
      for(const effect of state.pickupEffects){
        const age=state.time-effect.time,duration=effect.type==='coin'?.45:.75;
        ctx.save();ctx.globalAlpha=Math.min(1,(duration-age)*5);
        lettering(ctx,effect.type==='ring'?'RING GET!':effect.type==='heart'?'HEART GET!':'+1',effect.x-camera,effect.y-18-age*22,1,effect.type==='ring'?'#baf5ff':effect.type==='heart'?'#ffbad5':'#ffe48a',true);
        ctx.restore();
      }
      if(state.mode==='meeting'){
        sprite(ctx,'bride_groom_meet',178,211,57);P.heart(ctx,181,142,2);
      }else{
        let pose='groom_run1';
        if(!state.grounded)pose=state.vy<0?'groom_jump':'groom_jumpdown';
        else if(state.mode==='running')pose='groom_run'+(Math.floor(state.time*12)%6+1);
        if(state.flash<=0||Math.floor(state.time*16)%2===0)sprite(ctx,pose,160,state.y,58);
        const bx=C.distance+202-camera;if(bx<530)sprite(ctx,'bride_waiting',bx,211,57);
      }
      if(state.mode!=='ready'){
        for(let i=0;i<state.lives;i++)sprite(ctx,'groomFace',29+i*29,31,22);
        lettering(ctx,'LIVES',16,35,1);
        const pop=type=>{const age=state.time-state.lastPickup[type];return age>=0&&age<.3?1+.2*Math.sin(age/.3*Math.PI):1;};
        sprite(ctx,'coin',166,29,20*pop('coin'));lettering(ctx,'×'+String(state.score).padStart(2,'0'),181,13,2);
        sprite(ctx,'ringIcon',240,31,22*pop('ring'),state.ringCollected?1:.3);
        for(let i=0;i<state.heartsCollected;i++)sprite(ctx,'heartCoin0',262+i*19,34,28*(i===state.heartsCollected-1?pop('heart'):1));
      }
      if(state.mode==='running'&&state.distance<220)lettering(ctx,'TAP TO JUMP',160,130,1,'#fff9ed',true);
    }else{
      const ending=state.lives===0?'ending_cheerup':state.ringCollected?(state.heartsCollected===3?'ending_kiss':'ending_ring'):'wedding';
      sprite(ctx,images[ending]?ending:'wedding',245,212,81);
      // A compact, double-bordered RPG message panel leaves the castle visible.
      P.rect(ctx,18,39,258,83,'#292737');
      P.rect(ctx,21,42,252,77,'#e9d9c6');
      P.rect(ctx,23,44,248,73,'#292737');
      P.rect(ctx,26,47,242,67,'#383448');
      lettering(ctx,'STAGE CLEAR!',147,53,2,'#ffe4a4',true);
      lettering(ctx,C.coupleNames,147,76,2,'#fff8ef',true);
      lettering(ctx,C.date,147,99,1,'#ffc2d6',true);
      if(state.ringCollected)sprite(ctx,'ringIcon',250,110,22);
      lettering(ctx,'HAPPILY EVER AFTER',147,131,1,'#fff9ed',true);
    }
    if(w.rain>.01){ctx.globalAlpha=w.rain*.6;for(let i=0;i<60*w.rain;i++){
      const x=((i*71-time*85)%520+520)%520,y=(i*47+time*180)%300;
      P.rect(ctx,x,y,1,5,'#b7d7f5');P.rect(ctx,x-1,y+5,1,4,'#b7d7f5');
    }ctx.globalAlpha=1;}
    if(w.warm>0){
      ctx.save();ctx.globalAlpha=w.warm;
      for(let i=0;i<18;i++){
        const x=Math.round(((i*73-time*(9+i%3*2))%560+560)%560-40+Math.sin(time*.8+i)*16);
        const y=Math.round((i*53+time*(9+i%4*2))%330-26);
        const pose=Math.floor(time*(6+i%3)+i*2.7)%15;
        sprite(ctx,'driftPetal'+pose,x,y,16+(i%3)*4,w.warm*(i%3===0?.8:1));
      }
      ctx.restore();
    }
  }
  window.WeddingArt={ready,images,failed,draw};
})();
