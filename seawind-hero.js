(function(){
  window.__seawindHeroLoaded = true;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover:hover)').matches;
  var useCursor = !reduced && canHover;
  var isMobile = window.innerWidth < 760;

  var heroWrap = document.getElementById('heroWrap');
  if(heroWrap){
    /* ---------- hero stat counters (scoped to the hero only) ---------- */
    function animateCount(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '+';
      var start = null, dur = 1400;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min(1, (ts-start)/dur);
        var eased = 1 - Math.pow(1-p, 3);
        el.textContent = Math.round(target*eased) + suffix;
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    heroWrap.querySelectorAll('[data-count]').forEach(function(el){
      if(reduced){ el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix')||'+'); }
      else { setTimeout(function(){ animateCount(el); }, 1150); }
    });

    /* ---------- glass card tilt inside the hero ---------- */
    if(useCursor){
      heroWrap.querySelectorAll('.frame.glass').forEach(function(card){
        var rX = 0, rY = 0, tX = 0, tY = 0, raf = null;
        function apply(){
          rX += (tX-rX)*0.12; rY += (tY-rY)*0.12;
          card.style.transform = 'perspective(1200px) rotateX(' + rX + 'deg) rotateY(' + rY + 'deg) translateZ(0)';
          if(Math.abs(tX-rX)>0.01 || Math.abs(tY-rY)>0.01){ raf = requestAnimationFrame(apply); }
          else { raf = null; }
        }
        card.addEventListener('mousemove', function(e){
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left)/r.width - 0.5;
          var py = (e.clientY - r.top)/r.height - 0.5;
          tX = py*-2.6; tY = px*3.4;
          card.classList.add('tilt-active');
          if(!raf) raf = requestAnimationFrame(apply);
        });
        card.addEventListener('mouseleave', function(){
          tX = 0; tY = 0; card.classList.remove('tilt-active');
          if(!raf) raf = requestAnimationFrame(apply);
        });
      });
    }

    /* ---------- scroll rig: pinned scene reveal ---------- */
    var scenes = {
      s1: document.getElementById('scene1'),
      s2: document.getElementById('scene2'),
      s3: document.getElementById('scene3')
    };

    function heroProgress(){
      if(reduced) return 0;
      var rect = heroWrap.getBoundingClientRect();
      var total = heroWrap.offsetHeight - window.innerHeight;
      if(total <= 0) return 0;
      var scrolled = -rect.top;
      return Math.max(0, Math.min(1, scrolled/total));
    }

    function band(p, start, peakStart, peakEnd, end){
      if(p < start || p > end) return 0;
      if(p >= peakStart && p <= peakEnd) return 1;
      if(p < peakStart) return (p-start)/(peakStart-start);
      return 1-(p-peakEnd)/(end-peakEnd);
    }

    function applyScene(el, op){
      if(!el) return;
      el.style.opacity = op;
      el.style.transform = 'translateY(' + ((1-op)*36) + 'px)';
      el.style.pointerEvents = op > 0.35 ? 'auto' : 'none';
    }

    var heroP = 0;
    function updateScenes(){
      heroP = heroProgress();
      if(reduced){
        applyScene(scenes.s1, 1);
        applyScene(scenes.s2, 0);
        applyScene(scenes.s3, 0);
        return;
      }
      applyScene(scenes.s1, band(heroP, 0, 0, 0.14, 0.24));
      applyScene(scenes.s2, band(heroP, 0.30, 0.40, 0.62, 0.74));
      applyScene(scenes.s3, band(heroP, 0.78, 0.88, 1.0, 1.0));
    }
    updateScenes();
    window.addEventListener('scroll', updateScenes, {passive:true});
  }

  if(reduced){ return; } /* everything below is motion: skip entirely */

  /* ---------- three.js immersive ocean ---------- */
  var canvas = document.getElementById('scene');
  if(!canvas || typeof THREE === 'undefined'){ return; }

  var w = window.innerWidth, h2 = window.innerHeight;
  var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  renderer.setSize(w,h2);
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, w/h2, 0.1, 500);
  camera.position.set(0, 22, 46);

  var camPath = [
    {pos:new THREE.Vector3(0,22,46), look:new THREE.Vector3(0,-2,-20)},
    {pos:new THREE.Vector3(0,9,16),  look:new THREE.Vector3(0,-6,-34)},
    {pos:new THREE.Vector3(0,28,58), look:new THREE.Vector3(0,1,-8)}
  ];

  /* ---------- water shader ---------- */
  var waterVert = [
    "uniform float uTime;",
    "uniform float uIntensity;",
    "uniform vec2 uRipple;",
    "uniform float uRippleStrength;",
    "varying vec3 vNormal;",
    "varying vec3 vPos;",
    "varying vec2 vUv;",
    "void main(){",
    "  vUv = uv;",
    "  vec3 pos = position;",
    "  float px = pos.x;",
    "  float pz = pos.y;",
    "  vec2 D1 = normalize(vec2(1.0,0.6));",
    "  vec2 D2 = normalize(vec2(-0.7,0.9));",
    "  vec2 D3 = normalize(vec2(0.3,-1.0));",
    "  vec2 D4 = normalize(vec2(-1.0,-0.2));",
    "  vec2 D5 = normalize(vec2(0.85,-0.4));",
    "  float L1=38.0; float L2=22.0; float L3=14.0; float L4=8.0; float L5=4.2;",
    "  float Q1=0.42; float Q2=0.32; float Q3=0.25; float Q4=0.18; float Q5=0.12;",
    "  float A1=1.6*uIntensity; float A2=1.0*uIntensity; float A3=0.55*uIntensity; float A4=0.3*uIntensity; float A5=0.14*uIntensity;",
    "  float S1=1.0; float S2=1.4; float S3=1.9; float S4=2.6; float S5=3.4;",
    "  float w1=6.2831853/L1; float w2=6.2831853/L2; float w3=6.2831853/L3; float w4=6.2831853/L4; float w5=6.2831853/L5;",
    "  float th1 = w1*(D1.x*px+D1.y*pz) + uTime*S1;",
    "  float th2 = w2*(D2.x*px+D2.y*pz) + uTime*S2;",
    "  float th3 = w3*(D3.x*px+D3.y*pz) + uTime*S3;",
    "  float th4 = w4*(D4.x*px+D4.y*pz) + uTime*S4;",
    "  float th5 = w5*(D5.x*px+D5.y*pz) + uTime*S5;",
    "  pos.x += Q1*A1*D1.x*cos(th1) + Q2*A2*D2.x*cos(th2) + Q3*A3*D3.x*cos(th3) + Q4*A4*D4.x*cos(th4) + Q5*A5*D5.x*cos(th5);",
    "  pos.y += Q1*A1*D1.y*cos(th1) + Q2*A2*D2.y*cos(th2) + Q3*A3*D3.y*cos(th3) + Q4*A4*D4.y*cos(th4) + Q5*A5*D5.y*cos(th5);",
    "  float heightSum = A1*sin(th1)+A2*sin(th2)+A3*sin(th3)+A4*sin(th4)+A5*sin(th5);",
    "  pos.z += heightSum;",
    "  vec3 n = vec3(0.0,0.0,1.0);",
    "  n.x -= D1.x*w1*A1*cos(th1) + D2.x*w2*A2*cos(th2) + D3.x*w3*A3*cos(th3) + D4.x*w4*A4*cos(th4) + D5.x*w5*A5*cos(th5);",
    "  n.y -= D1.y*w1*A1*cos(th1) + D2.y*w2*A2*cos(th2) + D3.y*w3*A3*cos(th3) + D4.y*w4*A4*cos(th4) + D5.y*w5*A5*cos(th5);",
    "  n.z -= Q1*w1*A1*sin(th1) + Q2*w2*A2*sin(th2) + Q3*w3*A3*sin(th3) + Q4*w4*A4*sin(th4) + Q5*w5*A5*sin(th5);",
    "  float dx = px - uRipple.x;",
    "  float dy = pz - uRipple.y;",
    "  float rad = 70.0;",
    "  float bump = uRippleStrength*exp(-(dx*dx+dy*dy)/rad);",
    "  pos.z += bump;",
    "  n.x += bump*2.0*dx/rad;",
    "  n.y += bump*2.0*dy/rad;",
    "  vNormal = normalize((modelMatrix*vec4(normalize(n),0.0)).xyz);",
    "  vPos = (modelMatrix*vec4(pos,1.0)).xyz;",
    "  gl_Position = projectionMatrix*modelViewMatrix*vec4(pos,1.0);",
    "}"
  ].join("\n");

  var waterFrag = [
    "precision highp float;",
    "varying vec3 vNormal;",
    "varying vec3 vPos;",
    "varying vec2 vUv;",
    "uniform vec3 uCamPos;",
    "uniform vec3 uSunDir;",
    "uniform vec3 uColorShallow;",
    "uniform vec3 uColorDeep;",
    "uniform vec3 uFogColor;",
    "uniform float uFogNear;",
    "uniform float uFogFar;",
    "uniform float uIntensity;",
    "uniform float uTime;",
    "float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }",
    "float vnoise(vec2 p){",
    "  vec2 i=floor(p); vec2 f=fract(p);",
    "  float a=hash(i); float b=hash(i+vec2(1.0,0.0)); float c=hash(i+vec2(0.0,1.0)); float d=hash(i+vec2(1.0,1.0));",
    "  vec2 u=f*f*(3.0-2.0*f);",
    "  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;",
    "}",
    "float fbm(vec2 p){",
    "  float v=0.0; float amp=0.5;",
    "  for(int i=0;i<4;i++){ v += amp*vnoise(p); p *= 2.02; amp *= 0.5; }",
    "  return v;",
    "}",
    "void main(){",
    "  vec3 Nmacro = normalize(vNormal);",
    "  vec2 bp = vUv*vec2(240.0,200.0) + vec2(uTime*0.55, uTime*0.4);",
    "  float e = 0.6;",
    "  float hL = fbm(bp - vec2(e,0.0));",
    "  float hR = fbm(bp + vec2(e,0.0));",
    "  float hD = fbm(bp - vec2(0.0,e));",
    "  float hU = fbm(bp + vec2(0.0,e));",
    "  vec3 microN = vec3((hL-hR)*1.6, (hD-hU)*1.6, 1.0);",
    "  vec3 N = normalize(Nmacro + vec3(microN.x, microN.y, 0.0)*0.16*(0.5+uIntensity*0.5));",
    "  vec3 V = normalize(uCamPos - vPos);",
    "  float NdotV = clamp(dot(N,V), 0.0, 1.0);",
    "  float F0 = 0.02;",
    "  float fresnel = F0 + (1.0-F0)*pow(1.0-NdotV, 5.0);",
    "  float heightF = clamp((vPos.y+2.0)/5.0, 0.0, 1.0);",
    "  vec3 base = mix(uColorDeep, uColorShallow, heightF);",
    "  float caustic = fbm(vUv*vec2(9.0,9.0) + uTime*0.045);",
    "  base += uColorShallow*(caustic-0.5)*0.09;",
    "  vec3 skyZenith = vec3(0.55,0.72,0.86);",
    "  vec3 skyHorizon = vec3(0.95,0.97,0.97);",
    "  vec3 skyCol = mix(skyZenith, skyHorizon, pow(NdotV,0.6));",
    "  vec3 col = mix(base, skyCol, clamp(fresnel,0.0,1.0));",
    "  vec3 H = normalize(V+uSunDir);",
    "  float NdotH = max(dot(N,H),0.0);",
    "  float specCore = pow(NdotH, 260.0)*2.2;",
    "  float specHalo = pow(NdotH, 24.0)*0.3;",
    "  col += vec3(1.0,0.98,0.9)*(specCore+specHalo);",
    "  float steep = 1.0-clamp(Nmacro.y,0.0,1.0);",
    "  float foamMask = smoothstep(0.16,0.5,steep);",
    "  float streak = fbm(vUv*vec2(6.0,26.0) + vec2(uTime*0.03, uTime*0.11));",
    "  foamMask *= 0.4+0.8*streak;",
    "  float bubbles = fbm(vUv*vec2(65.0,65.0) + uTime*0.18);",
    "  bubbles = smoothstep(0.5,0.72,bubbles);",
    "  foamMask = clamp(foamMask*(0.5+uIntensity*0.9) + foamMask*bubbles*0.55, 0.0, 1.0);",
    "  col = mix(col, vec3(0.98,0.99,0.99), foamMask*0.85);",
    "  float dist = length(vPos-uCamPos);",
    "  float fogF = smoothstep(uFogNear,uFogFar,dist);",
    "  col = mix(col, uFogColor, fogF);",
    "  gl_FragColor = vec4(col,1.0);",
    "}"
  ].join("\n");

  var waterUniforms = {
    uTime: {value:0},
    uIntensity: {value:0.6},
    uRipple: {value:new THREE.Vector2(0,-10)},
    uRippleStrength: {value:0},
    uCamPos: {value: camera.position.clone()},
    uSunDir: {value: new THREE.Vector3(0.35,0.62,0.32).normalize()},
    uColorShallow: {value: new THREE.Color(0.30,0.54,0.86)},
    uColorDeep: {value: new THREE.Color(0.0,0.10,0.24)},
    uFogColor: {value: new THREE.Color(0.965,0.976,0.976)},
    uFogNear: {value: 34},
    uFogFar: {value: 118}
  };
  var waterMat = new THREE.ShaderMaterial({
    vertexShader: waterVert,
    fragmentShader: waterFrag,
    uniforms: waterUniforms,
    side: THREE.DoubleSide
  });

  var wSegX = isMobile ? 90 : 190;
  var wSegZ = isMobile ? 70 : 150;
  var waterGeo = new THREE.PlaneGeometry(210, 170, wSegX, wSegZ);
  var waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI/2;
  waterMesh.position.set(0, 0, -18);
  scene.add(waterMesh);

  /* ---------- wind: fine mist points ---------- */
  function dotTexture(){
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,255,255,0.9)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,64,64);
    return new THREE.CanvasTexture(c);
  }
  var mistTex = dotTexture();
  var mistCount = isMobile ? 90 : 240;
  var mistGeo = new THREE.BufferGeometry();
  var mistPos = new Float32Array(mistCount*3);
  var mistSeed = new Float32Array(mistCount*3);
  for(var i=0;i<mistCount;i++){
    var depth = -70+Math.random()*110;
    mistPos[i*3]   = -180+Math.random()*360;
    mistPos[i*3+1] = 2+Math.random()*22;
    mistPos[i*3+2] = depth;
    mistSeed[i*3]   = 8+Math.random()*16;
    mistSeed[i*3+1] = Math.random()*Math.PI*2;
    mistSeed[i*3+2] = 0.4+ (depth+70)/110*0.9;
  }
  mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos,3));
  var mistMat = new THREE.PointsMaterial({
    map:mistTex, size: isMobile?2.2:2.8, transparent:true, opacity:0.5,
    blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true, color:0xFFFFFF
  });
  var mistPoints = new THREE.Points(mistGeo, mistMat);
  scene.add(mistPoints);

  /* ---------- wind: gust streak lines ---------- */
  var windGroup = new THREE.Group();
  scene.add(windGroup);
  var streaks = [];
  var streakCount = isMobile ? 6 : 12;
  for(var s=0;s<streakCount;s++){
    var sdepth = -60+Math.random()*90, sy = 5+Math.random()*18;
    var curvePts = [];
    for(var p=0;p<6;p++){ curvePts.push(new THREE.Vector3(p*9, Math.sin(p*1.3)*0.7, 0)); }
    var curve = new THREE.CatmullRomCurve3(curvePts);
    var samples = curve.getPoints(20);
    var arr = [];
    samples.forEach(function(v){ arr.push(v.x,v.y,v.z); });
    var sgeo = new THREE.BufferGeometry();
    sgeo.setAttribute('position', new THREE.Float32BufferAttribute(arr,3));
    var tint = s%2===0 ? 0x0056CA : 0x0A0E14;
    var smat = new THREE.LineBasicMaterial({color:tint, transparent:true, opacity:0.22});
    var sline = new THREE.Line(sgeo, smat);
    sline.position.set(-120-Math.random()*80, sy, sdepth);
    windGroup.add(sline);
    streaks.push({mesh:sline, baseSpeed:7+Math.random()*9, depthFactor:0.4+(sdepth+60)/90*0.9});
  }

  /* ---------- ripple raycast ---------- */
  var raycaster = new THREE.Raycaster();
  var rayPlane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
  var mouseNDC = new THREE.Vector2(0,-0.2);
  var hasPointer = false;
  var rippleTargetX = 0, rippleTargetY = -10, rippleX = 0, rippleY = -10;
  var rippleStrengthTarget = 0;

  if(useCursor){
    window.addEventListener('mousemove', function(e){
      mouseNDC.x = (e.clientX/window.innerWidth)*2-1;
      mouseNDC.y = -(e.clientY/window.innerHeight)*2+1;
      hasPointer = true;
      rippleStrengthTarget = 2.4;
    });
  }

  function resize(){
    w = window.innerWidth; h2 = window.innerHeight;
    camera.aspect = w/h2; camera.updateProjectionMatrix();
    renderer.setSize(w,h2);
  }
  window.addEventListener('resize', resize);

  /* ---------- scroll-driven params ---------- */
  var lastScrollY = window.scrollY;
  var gust = 0;
  var tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();

  function lerpCam(p){
    var seg, localT;
    if(p <= 0.5){ seg = 0; localT = p/0.5; } else { seg = 1; localT = (p-0.5)/0.5; }
    var eased = localT<0.5 ? 2*localT*localT : 1-Math.pow(-2*localT+2,2)/2;
    var from = camPath[seg], to = camPath[seg+1];
    tmpA.copy(from.pos).lerp(to.pos, eased);
    tmpB.copy(from.look).lerp(to.look, eased);
    camera.position.copy(tmpA);
    camera.lookAt(tmpB);
    waterUniforms.uCamPos.value.copy(tmpA);
  }

  var clock = new THREE.Clock();
  function render(){
    var t = clock.getElapsedTime();
    var p = heroP;

    var storm = Math.max(0, Math.sin(Math.PI*Math.min(p,1)));
    var intensity = 0.55 + storm*0.95;

    var scrollY = window.scrollY;
    var vel = Math.abs(scrollY - lastScrollY);
    lastScrollY = scrollY;
    gust = gust*0.9 + Math.min(vel*0.02, 1.4);

    var windStrength = 0.6 + intensity*0.5 + gust;

    waterUniforms.uTime.value = t;
    waterUniforms.uIntensity.value = intensity;

    var fogMix = storm;
    waterUniforms.uFogColor.value.setRGB(
      0.965 - fogMix*0.18, 0.976 - fogMix*0.19, 0.976 - fogMix*0.13
    );
    waterUniforms.uFogNear.value = 30 - fogMix*8;
    waterUniforms.uFogFar.value = 118 - fogMix*30;

    lerpCam(p);

    if(useCursor && hasPointer){
      raycaster.setFromCamera(mouseNDC, camera);
      var hit = new THREE.Vector3();
      if(raycaster.ray.intersectPlane(rayPlane, hit)){
        rippleTargetX = hit.x;
        rippleTargetY = -hit.z;
      }
    } else {
      rippleStrengthTarget *= 0.98;
    }
    rippleX += (rippleTargetX - rippleX)*0.08;
    rippleY += (rippleTargetY - rippleY)*0.08;
    waterUniforms.uRipple.value.set(rippleX, rippleY);
    waterUniforms.uRippleStrength.value += (rippleStrengthTarget - waterUniforms.uRippleStrength.value)*0.1;

    var mp = mistGeo.attributes.position.array;
    for(var i=0;i<mistCount;i++){
      var speed = mistSeed[i*3]*(0.5+windStrength*0.6)*mistSeed[i*3+2];
      mp[i*3] += speed*0.016;
      mp[i*3+1] += Math.sin(t*0.6+mistSeed[i*3+1])*0.01;
      if(mp[i*3] > 190){
        mp[i*3] = -190;
        mp[i*3+1] = 2+Math.random()*22;
      }
    }
    mistGeo.attributes.position.needsUpdate = true;
    mistMat.opacity = 0.35 + windStrength*0.14;

    streaks.forEach(function(st){
      st.mesh.position.x += st.baseSpeed*st.depthFactor*(0.6+windStrength*0.6)*0.016;
      if(st.mesh.position.x > 130){ st.mesh.position.x = -190; }
    });

    updateScenes();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
})();
