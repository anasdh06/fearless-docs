/* Fearless — Liquid Void background engine */
(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mouse spotlight ---------- */
  var spotlight = document.querySelector('.spotlight');
  window.addEventListener('pointermove', function(e){
    if(!spotlight) return;
    spotlight.style.setProperty('--mx', e.clientX + 'px');
    spotlight.style.setProperty('--my', e.clientY + 'px');
  }, { passive:true });

  if(reduceMotion) return;

  /* ---------- liquid flow canvas (purple -> blue blobs) ---------- */
  var lc = document.getElementById('liquid-canvas');
  var lctx = lc.getContext('2d');
  var blobs = [];
  var mouse = { x: innerWidth/2, y: innerHeight/2 };

  function resize(){
    lc.width = innerWidth; lc.height = innerHeight;
    pc.width = innerWidth; pc.height = innerHeight;
  }

  function initBlobs(){
    blobs = [];
    var n = innerWidth < 700 ? 4 : 7;
    for(var i=0;i<n;i++){
      blobs.push({
        x: Math.random()*innerWidth,
        y: Math.random()*innerHeight,
        r: 140 + Math.random()*220,
        vx: (Math.random()-0.5)*0.35,
        vy: (Math.random()-0.5)*0.35,
        hueMix: Math.random(),
        phase: Math.random()*Math.PI*2
      });
    }
  }

  var t = 0;
  function drawLiquid(){
    t += 0.006;
    lctx.clearRect(0,0,lc.width,lc.height);
    lctx.globalCompositeOperation = 'lighter';
    blobs.forEach(function(b, i){
      b.x += b.vx; b.y += b.vy;
      var wob = Math.sin(t*2 + b.phase) * 30;
      if(b.x < -b.r) b.x = lc.width + b.r;
      if(b.x > lc.width + b.r) b.x = -b.r;
      if(b.y < -b.r) b.y = lc.height + b.r;
      if(b.y > lc.height + b.r) b.y = -b.r;

      var dx = mouse.x - b.x, dy = mouse.y - b.y;
      var dist = Math.sqrt(dx*dx+dy*dy);
      var pull = Math.max(0, 1 - dist/500) * 0.15;

      var grad = lctx.createRadialGradient(
        b.x + wob*0.2, b.y + wob*0.2, 0,
        b.x, b.y, b.r
      );
      var c1 = mixColor(b.hueMix, 0.55 + pull);
      var c2 = mixColor(b.hueMix, 0.05);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      lctx.fillStyle = grad;
      lctx.beginPath();
      lctx.arc(b.x + wob, b.y - wob*0.6, b.r, 0, Math.PI*2);
      lctx.fill();
    });
    lctx.globalCompositeOperation = 'source-over';
  }

  function mixColor(mix, alpha){
    var p = [123,44,255], bl = [0,175,255];
    var r = Math.round(p[0] + (bl[0]-p[0])*mix);
    var g = Math.round(p[1] + (bl[1]-p[1])*mix);
    var bch = Math.round(p[2] + (bl[2]-p[2])*mix);
    return 'rgba('+r+','+g+','+bch+','+alpha+')';
  }

  /* ---------- floating particles ---------- */
  var pc = document.getElementById('particle-canvas');
  var pctx = pc.getContext('2d');
  var particles = [];

  function initParticles(){
    particles = [];
    var n = innerWidth < 700 ? 30 : 60;
    for(var i=0;i<n;i++){
      particles.push({
        x: Math.random()*innerWidth,
        y: Math.random()*innerHeight,
        r: 0.6 + Math.random()*1.8,
        vy: -(0.15 + Math.random()*0.35),
        vx: (Math.random()-0.5)*0.15,
        a: 0.2 + Math.random()*0.5,
        hue: Math.random() > 0.5 ? '123,44,255' : '0,175,255'
      });
    }
  }

  function drawParticles(){
    pctx.clearRect(0,0,pc.width,pc.height);
    particles.forEach(function(p){
      p.x += p.vx; p.y += p.vy;
      if(p.y < -10) { p.y = innerHeight + 10; p.x = Math.random()*innerWidth; }
      if(p.x < -10) p.x = innerWidth + 10;
      if(p.x > innerWidth+10) p.x = -10;
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      pctx.fillStyle = 'rgba('+p.hue+','+p.a+')';
      pctx.shadowBlur = 8;
      pctx.shadowColor = 'rgba('+p.hue+',0.8)';
      pctx.fill();
    });
  }

  window.addEventListener('pointermove', function(e){
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive:true });

  window.addEventListener('resize', function(){
    resize(); initBlobs(); initParticles();
  });

  resize(); initBlobs(); initParticles();

  function loop(){
    drawLiquid();
    drawParticles();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
