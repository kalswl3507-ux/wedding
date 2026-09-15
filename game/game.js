(() => {
  'use strict';
  const E=WeddingEngine,P=Pixel,C=E.CONFIG;
  const canvas=document.getElementById('game'),ctx=canvas.getContext('2d',{alpha:false});
  ctx.imageSmoothingEnabled=false;
  const startScreen=document.getElementById('startScreen'),endScreen=document.getElementById('endScreen');
  const announcement=document.getElementById('announcement'),instruction=document.getElementById('instruction');
  const muteButton=document.getElementById('muteButton');
  // The same bitmap lettering is used by Canvas and HTML controls, offline.
  function pixelLabel(element,label,width=180,scale=2){
    const graphic=document.createElement('canvas');graphic.width=width;graphic.height=7*scale+4;
    graphic.className='pixel-label';graphic.setAttribute('aria-hidden','true');
    const ink=graphic.getContext('2d');ink.imageSmoothingEnabled=false;
    P.text(ink,label,width/2+1,3,'#303047',scale,true);
    P.text(ink,label,width/2,1,'#fff1d7',scale,true);
    element.setAttribute('aria-label',label);element.replaceChildren(graphic);
  }
  pixelLabel(document.getElementById('restartButton'),'PLAY AGAIN',150);
  pixelLabel(muteButton,'SOUND OFF',110);
  let state=E.create(),accumulator=0,last=0,sceneTime=0,endingAnnounced=false;
  const audio={muted:true,unlocked:false,context:null,music:null,tracks:{}};
  function unlockAudio(){
    if(audio.unlocked)return;
    audio.unlocked=true;
    try{const AC=window.AudioContext||window.webkitAudioContext;if(AC)audio.context=new AC();}catch{}
    // Optional audio never blocks the game. Synthesized effects work without files.
    ['jump','coin','stage','ending'].forEach(name=>{
      const track=new Audio(`assets/audio/${name}.mp3`);track.preload='none';audio.tracks[name]=track;
      track.addEventListener('error',()=>{delete audio.tracks[name];},{once:true});
    });
    audio.music=new Audio('assets/audio/music.mp3');audio.music.loop=true;audio.music.volume=.2;
    audio.music.addEventListener('error',()=>{audio.music=null;},{once:true});
    if(!audio.muted)playMusic();
  }
  function playMusic(){if(audio.music&&!audio.muted)audio.music.play().catch(()=>{});}
  function synth(name){
    if(!audio.context||audio.muted)return;
    const ac=audio.context;
    const notes=name==='ring'?[660,880,1320]:name==='heart'?[784,988,1175]:name==='coin'?[880,1320]:name==='ending'?[523,659,784,1047]:name==='stage'?[392,523]:[300,510];
    notes.forEach((freq,i)=>{const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+i*.09;o.type='square';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.025,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.13);});
  }
  function sound(name){
    if(audio.muted||!audio.unlocked)return;
    const track=audio.tracks[name];
    if(track){track.currentTime=0;track.volume=.25;track.play().catch(()=>{delete audio.tracks[name];synth(name);});}
    else synth(name);
  }
  muteButton.addEventListener('click',()=>{
    audio.muted=!audio.muted;unlockAudio();
    pixelLabel(muteButton,audio.muted?'SOUND OFF':'SOUND ON',110);muteButton.setAttribute('aria-pressed',String(audio.muted));muteButton.setAttribute('aria-label',audio.muted?'소리 켜기':'소리 끄기');
    if(audio.muted){audio.music?.pause();audio.context?.suspend();Object.values(audio.tracks).forEach(t=>t.pause());}
    else{audio.context?.resume().catch(()=>{});playMusic();synth('coin');}
  });
  let assetsReady=false;
  const startButton=document.getElementById('startButton');
  startButton.disabled=true;pixelLabel(startButton,'LOADING...');
  WeddingArt.ready.then(()=>{assetsReady=true;startButton.disabled=false;pixelLabel(startButton,'TAP TO START');if(WeddingArt.failed.length)document.getElementById('instruction').textContent='일부 이미지를 불러오지 못했어요. 새로고침해 주세요.';window.parent.postMessage({type:'wedding:loading',loaded:1,total:1,ready:true,failed:WeddingArt.failed.length},'*');});
  function begin(){
    if(!assetsReady)return;
    unlockAudio();if(state.mode!=='ready')return;
    E.start(state);startScreen.hidden=true;endScreen.hidden=true;
    announcement.textContent='모험 시작! 화면을 누르면 점프합니다. 넘어져도 계속 달립니다.';
    canvas.focus({preventScroll:true});
  }
  function restart(){
    state=E.create();accumulator=0;last=0;sceneTime=0;endingAnnounced=false;
    if(audio.music){audio.music.currentTime=0;playMusic();}
    instruction.textContent='화면을 톡! 누르면 점프해요';begin();
  }
  document.getElementById('startButton').addEventListener('click',begin);
  document.getElementById('restartButton').addEventListener('click',restart);
  // Exactly one pointer path: no synthetic-click + touch double jumps.
  function tap(event){
    if(event.isPrimary===false||event.button>0)return;
    if(event.target instanceof Element && event.target.closest('button'))return;
    event.preventDefault();unlockAudio();
    if(state.mode==='ready')begin();else if(state.mode==='running')E.jump(state);
  }
  const frame=document.getElementById('gameFrame');
  if(window.PointerEvent)frame.addEventListener('pointerdown',tap);
  else{frame.addEventListener('touchstart',tap,{passive:false});frame.addEventListener('mousedown',e=>{if(!('ontouchstart'in window))tap(e);});}
  window.addEventListener('keydown',event=>{
    if(event.code!=='Space'&&event.code!=='ArrowUp')return;
    if(event.target instanceof Element && event.target.closest('button,input,textarea,select'))return;
    event.preventDefault();if(event.repeat)return;
    unlockAudio();if(state.mode==='ready')begin();else if(state.mode==='running')E.jump(state);
  });
  document.addEventListener('visibilitychange',()=>{
    last=0;accumulator=0;
    if(document.hidden){audio.music?.pause();audio.context?.suspend();}
    else if(!audio.muted){audio.context?.resume().catch(()=>{});playMusic();}
  });
  function draw(){ WeddingArt.draw(ctx,state,sceneTime); }
  function events(){
    for(const event of state.events){
      if(['jump','coin','heart','ring','stage','ending'].includes(event))sound(event);
      if(event==='ring')announcement.textContent='다이아 링을 획득했어요!';
      if(event==='heart')announcement.textContent=`하트 코인 ${state.heartsCollected}개 획득!`;
      if(event==='stage')announcement.textContent=E.stages[state.stage];
      if(event==='ending'&&!endingAnnounced){
        endingAnnounced=true;endScreen.hidden=false;
        instruction.textContent='우리의 다음 모험이 시작됩니다 ♥';
        announcement.textContent=`스테이지 클리어! 코인 ${state.score}개. 2027년 1월 10일, 최호진과 김채나의 결혼식에 초대합니다.`;
      }
    }
    state.events.length=0;
  }
  function loop(now){
    if(!document.hidden){
      const dt=last?Math.min((now-last)/1000,.1):0;last=now;sceneTime+=dt;accumulator+=dt;
      while(accumulator>=1/120){E.step(state,1/120);accumulator-=1/120;}
      events();draw();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
