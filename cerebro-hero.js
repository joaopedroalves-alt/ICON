/* ======================================================================
   ICON — MODELO NEURAL 3D DO HERO
   Three.js via CDN (ES Module). Nenhum framework adicional.

   Um cérebro anatômico estilizado é descrito por DOIS hemisférios.
   A superfície possui circunvoluções e sulcos; os neurônios são distribuídos
   SOBRE a superfície e ligados aos vizinhos mais próximos, em 3 dimensões.
   Pontos, dendritos, feixes e sinais de transmissão são geometrias WebGL.

   Este arquivo funciona junto ao novo index.html e index.css.
   O SVG inline no HTML permanece visível se WebGL/CDN não estiver disponível.
   ====================================================================== */
(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const holder = document.querySelector('#brain-model');
  if (!hero || !holder) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Movimento reduzido: alternativa estática, sem carregar motor 3D.
  if (reduceMotion.matches) return;

  const OPTIONS = Object.freeze({
    cdn: 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js',
    dprMaximum: 1.7,
    spinRadiansPerSecond: 0.074,
    mouseSmoothing: 3.0,
    fullNodesPerHemisphere: 1500,
    compactNodesPerHemisphere: 720,
    maxFPScompact: 35,
  });

  let THREE;
  let renderer = null;
  let scene = null;
  let camera = null;
  let brain = null;
  let intersections = null;
  let resizeObserver = null;
  let canvas = null;
  let created = false;
  let loading = false;
  let destroyed = false;
  let visible = false;
  let rafId = 0;
  let lastFrameMs = 0;
  let elapsed = 0;
  let compact = false;
  let pxRatio = 1;
  let neurons = [];
  let neighbors = [];
  let pulses = [];
  let pulseGeometry = null;
  let pulseMaterial = null;
  let nodeMaterial = null;
  let qualityMedia = null;
  const mouse = { x: 0, y: 0, active: false, smoothedX: 0, smoothedY: 0 };

  // Gerador determinístico: mantém a geometria estável entre carregamentos.
  function randomFactory(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = randomFactory(19042026);
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

  /* Uma superfície orgânica bilateral, vista inicialmente de frente.
     x: largura dos dois hemisférios, y: altura, z: profundidade.
     As perturbações harmônicas produzem circunvoluções sem perder o contorno. */
  function brainSurface(side, v, theta) {
    const ring = Math.sqrt(Math.max(0, 1 - v * v));
    const folded =
      0.070 * Math.sin(8.5 * theta + 6.0 * v + 0.6 * Math.sin(10 * v)) +
      0.035 * Math.sin(16.3 * theta - 10.6 * v) +
      0.022 * Math.cos(5.6 * theta + 13.5 * v);
    const gyrus = 1 + folded;
    const lower = 1 - 0.10 * Math.max(0, -v);
    let x = side * (0.585 + 0.548 * ring * Math.cos(theta) * gyrus * lower);
    // Marca a fissura entre os hemisférios sem produzir uma esfera dupla.
    x = side * Math.max(0.055, Math.abs(x));
    const y = 0.94 * v + 0.035 * ring * Math.sin(8 * theta - 7 * v);
    const z = 0.83 * ring * Math.sin(theta) * (1 + folded * 0.85)
      - 0.055 * Math.max(0, -v);
    return { x, y, z, side };
  }

  function generateHemisphere(side, count) {
    const result = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const v = 1 - 2 * (i + 0.5) / count;
      const theta = golden * i + (rng() - 0.5) * 0.15;
      result.push(brainSurface(side, v, theta));
    }
    return result;
  }

  // Linhas profundas e leves alternam tons de ciano, oceano e verde água.
  function addSegments(positions, color, opacity) {
    if (!positions.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity,
      depthWrite: false, depthTest: true, toneMapped: false });
    brain.add(new THREE.LineSegments(geo, mat));
  }

  // Shader para partículas de halo suave, em vez de pixels quadrados.
  function pointMaterial() {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: { uDpr: { value: pxRatio } },
      vertexShader: `
        attribute float aSize;
        attribute float aAlpha;
        attribute vec3 aColor;
        uniform float uDpr;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          vec4 view = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * view;
          gl_PointSize = max(1.5, aSize * uDpr);
          vAlpha = aAlpha;
          vColor = aColor;
        }
      `,
      fragmentShader: `
        precision mediump float;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          float r = length(gl_PointCoord - vec2(0.5)) * 2.0;
          if (r > 1.0) discard;
          float core = exp(-16.0 * r * r);
          float halo = exp(-3.6 * r * r);
          float a = (0.82 * core + 0.24 * halo) * vAlpha;
          gl_FragColor = vec4(vColor, a);
        }
      `
    });
  }

  function makeNetwork(perHemisphere) {
    neurons = [...generateHemisphere(-1, perHemisphere), ...generateHemisphere(1, perHemisphere)];
    neighbors = Array.from({ length: neurons.length }, () => []);
    const lineCyan = [], lineOcean = [], lineMint = [], dendrites = [];
    const edges = [];
    const known = new Set();
    const cell = 0.20;
    const buckets = [new Map(), new Map()];
    const cellkey = (x, y, z) => `${Math.floor(x / cell)}:${Math.floor(y / cell)}:${Math.floor(z / cell)}`;
    for (let i = 0; i < neurons.length; i++) {
      const p = neurons[i];
      const bucket = buckets[p.side < 0 ? 0 : 1];
      const key = cellkey(p.x, p.y, p.z);
      if (!bucket.has(key)) bucket.set(key, []);
      bucket.get(key).push(i);
    }
    function link(a, b) {
      if (a === b) return;
      const id = a < b ? `${a}|${b}` : `${b}|${a}`;
      if (known.has(id)) return;
      known.add(id);
      neighbors[a].push(b);
      neighbors[b].push(a);
      const p = neurons[a], q = neurons[b];
      edges.push([a, b]);
      // Ponto médio ligeiramente desviado: o filamento não parece um arame rígido.
      const mx = (p.x + q.x) / 2 + p.side * 0.008;
      const my = (p.y + q.y) / 2 + 0.006 * (rng() - 0.5);
      const mz = (p.z + q.z) / 2 + 0.009;
      const layers = [lineCyan, lineOcean, lineMint];
      const target = layers[rng() < 0.46 ? 0 : rng() < 0.68 ? 1 : 2];
      target.push(p.x, p.y, p.z, mx, my, mz, mx, my, mz, q.x, q.y, q.z);
    }

    // Indexação espacial evita comparação quadrática de todos os pares.
    neurons.forEach((p, i) => {
      const map = buckets[p.side < 0 ? 0 : 1];
      const cx = Math.floor(p.x / cell), cy = Math.floor(p.y / cell), cz = Math.floor(p.z / cell);
      const candidates = [];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            const list = map.get(`${cx + dx}:${cy + dy}:${cz + dz}`);
            if (!list) continue;
            for (const j of list) {
              if (j === i) continue;
              const q = neurons[j];
              const d2 = (p.x-q.x)**2+(p.y-q.y)**2+(p.z-q.z)**2;
              if (d2 > 0.002 && d2 < 0.046) candidates.push([j,d2]);
            }
          }
        }
      }
      candidates.sort((a,b) => a[1]-b[1]);
      const max = 3 + (rng() < 0.56 ? 1 : 0);
      for (let k = 0, used = 0; k < candidates.length && used < max; k++) {
        if (k > 1 && rng() < 0.12) continue;
        link(i, candidates[k][0]);
        used++;
      }
    });
    addSegments(lineOcean, 0x2c8092, 0.26);
    addSegments(lineCyan, 0x78bbd2, 0.39);
    addSegments(lineMint, 0x83c8b7, 0.33);

    // Traçados orgânicos sobre as dobras, seguindo as coordenadas anatômicas.
    const gyri = [], sulci = [];
    for (const side of [-1, 1]) {
      // Fileiras longitudinais sinuosas.
      for (let track = 0; track < 25; track++) {
        const base = 2 * Math.PI * (track / 25);
        let prev = null;
        for (let i = 0; i <= 76; i++) {
          const t = i / 76;
          const v = -0.93 + 1.86 * t;
          const angle = base + 0.095 * Math.sin(15 * t + track * 1.7)
            + 0.053 * Math.sin(31 * t - track);
          const next = brainSurface(side, v, angle);
          if (prev) gyri.push(prev.x,prev.y,prev.z,next.x,next.y,next.z);
          prev = next;
        }
      }
      // Curvas transversais, menos regulares e mais discretas.
      for (let band = 0; band < 10; band++) {
        const base = -0.82 + 1.64 * (band / 9);
        let prev = null;
        for (let i = 0; i <= 105; i++) {
          const theta = 2 * Math.PI * i / 105;
          const v = clamp(base + 0.045 * Math.sin(5 * theta + band * 1.3), -.97, .97);
          const next = brainSurface(side, v, theta);
          if (prev) sulci.push(prev.x,prev.y,prev.z,next.x,next.y,next.z);
          prev = next;
        }
      }
    }
    addSegments(gyri, 0x74c0c4, 0.29);
    addSegments(sulci, 0x246b7a, 0.24);

    // Ramificações/dendritos curtos saem de neurônios selecionados.
    for (let i = 0; i < neurons.length; i += compact ? 11 : 9) {
      const p = neurons[i];
      const normal = new THREE.Vector3(p.x-p.side*.585, p.y*.85, p.z).normalize();
      let tangent = new THREE.Vector3(rng()-.5, rng()-.5, rng()-.5);
      tangent.addScaledVector(normal, -normal.dot(tangent)).normalize();
      const mid = new THREE.Vector3(p.x,p.y,p.z).addScaledVector(tangent,.046).addScaledVector(normal,.017);
      const end = mid.clone().addScaledVector(tangent,.035).addScaledVector(normal,.013);
      dendrites.push(p.x,p.y,p.z,mid.x,mid.y,mid.z, mid.x,mid.y,mid.z,end.x,end.y,end.z);
      if (rng() < 0.45) {
        const branch = mid.clone().addScaledVector(tangent,.022).add(new THREE.Vector3(0,.025,-.023));
        dendrites.push(mid.x,mid.y,mid.z,branch.x,branch.y,branch.z);
      }
    }
    addSegments(dendrites, 0x83c8b7, 0.40);

    // Fibras no tronco inferior sugerem continuidade das vias neurais.
    const stem = [];
    for (let i = 0; i < 28; i++) {
      const x = (i - 13.5) * .012;
      const z = .12 * Math.sin(i * 2.4);
      stem.push(x, -.76,z, x*.65,-1.04,z*.76, x*.65,-1.04,z*.76,x*.34,-1.23,z*.50);
    }
    addSegments(stem, 0x5faaa9, 0.22);
    return edges;
  }

  function makeNeurons() {
    const xyz = [], sizes = [], alphas = [], colors = [];
    const palette = [0x3a8498,0x56a7b3,0x78bbd2,0x83c8b7,0xa3d7d4].map(c => new THREE.Color(c));
    neurons.forEach(p => {
      xyz.push(p.x,p.y,p.z);
      const c = palette[Math.floor(rng()*palette.length)];
      colors.push(c.r,c.g,c.b);
      sizes.push(rng()<.11 ? 5.6 : 2.2+rng()*2.2);
      alphas.push(.63+rng()*.36);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(xyz,3));
    geometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
    geometry.setAttribute('aAlpha',new THREE.Float32BufferAttribute(alphas,1));
    geometry.setAttribute('aColor',new THREE.Float32BufferAttribute(colors,3));
    nodeMaterial = pointMaterial();
    const points = new THREE.Points(geometry,nodeMaterial);
    points.frustumCulled = false;
    brain.add(points);
  }

  function makePulses(edges) {
    const count = compact ? 24 : 48;
    const positions = new Float32Array(count*3*3);
    const sizes = new Float32Array(count*3);
    const alphas = new Float32Array(count*3);
    const colors = new Float32Array(count*3*3);
    const cols = [0xa1e1de,0x83c8b7,0x8ed4de].map(c => new THREE.Color(c));
    pulses = [];
    for (let i = 0; i < count; i++) {
      const [a,b] = edges[Math.floor(rng()*edges.length)];
      pulses.push({ a,b,t:rng(),delay:rng()*6,speed:.13+rng()*.20,intensity:.52+rng()*.40 });
      const col = cols[Math.floor(rng()*cols.length)];
      for (let j = 0; j < 3; j++) {
        const idx = 3*i+j;
        sizes[idx] = j===0 ? 7.8 : j===1 ? 5.5 : 3.4;
        colors[idx*3] = col.r; colors[idx*3+1] = col.g; colors[idx*3+2] = col.b;
        positions[idx*3] = 100; positions[idx*3+1] = 100; positions[idx*3+2] = 100;
      }
    }
    pulseGeometry = new THREE.BufferGeometry();
    pulseGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
    pulseGeometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
    pulseGeometry.setAttribute('aAlpha',new THREE.BufferAttribute(alphas,1).setUsage(THREE.DynamicDrawUsage));
    pulseGeometry.setAttribute('aColor',new THREE.BufferAttribute(colors,3));
    pulseMaterial = pointMaterial();
    const points = new THREE.Points(pulseGeometry,pulseMaterial);
    points.frustumCulled = false;
    brain.add(points);
  }

  function updatePulses(dt) {
    if (!pulseGeometry) return;
    const pBuffer = pulseGeometry.attributes.position.array;
    const alpha = pulseGeometry.attributes.aAlpha.array;
    for (let i = 0; i < pulses.length; i++) {
      const pulse = pulses[i];
      if (pulse.delay>0) pulse.delay = Math.max(0,pulse.delay-dt);
      else {
        const a = neurons[pulse.a], b = neurons[pulse.b];
        const length = Math.max(.045, Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z));
        pulse.t += (pulse.speed*dt)/length;
        if (pulse.t >= 1) {
          const options = neighbors[pulse.b].filter(id => id!==pulse.a);
          const next = options.length ? options[Math.floor(rng()*options.length)] : pulse.a;
          pulse.a = pulse.b; pulse.b = next; pulse.t = 0;
          if (rng()<.34) pulse.delay = .3+rng()*2.4;
        }
      }
      const a = neurons[pulse.a], b = neurons[pulse.b];
      for (let j = 0; j < 3; j++) {
        const idx = i*3+j;
        const off = idx*3;
        const t = clamp(pulse.t-j*.12,0,1);
        const xx = a.x+(b.x-a.x)*t;
        const yy = a.y+(b.y-a.y)*t;
        const zz = a.z+(b.z-a.z)*t;
        pBuffer[off] = xx; pBuffer[off+1] = yy; pBuffer[off+2] = zz;
        const ramp = Math.max(0,Math.min(1,pulse.t*8,(1-pulse.t)*8));
        alpha[idx] = (pulse.delay>0 || (j>0 && pulse.t<j*.12)) ? 0
          : pulse.intensity * [1,.26,.09][j] * ramp;
      }
    }
    pulseGeometry.attributes.position.needsUpdate = true;
    pulseGeometry.attributes.aAlpha.needsUpdate = true;
  }

  function resize() {
    if (!renderer || !camera || !holder.isConnected) return;
    const w = Math.round(holder.clientWidth), h = Math.round(holder.clientHeight);
    if (w<2 || h<2) return;
    // Enquadramento ortográfico que preserva proporção e evita cortes laterais.
    const aspect = w/h;
    const viewportHeight = Math.max(2.64,2.72/aspect);
    camera.left = -viewportHeight*aspect/2;
    camera.right = viewportHeight*aspect/2;
    camera.top = viewportHeight/2;
    camera.bottom = -viewportHeight/2;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
    if (nodeMaterial) nodeMaterial.uniforms.uDpr.value = pxRatio;
    if (pulseMaterial) pulseMaterial.uniforms.uDpr.value = pxRatio;
  }

  function onPointerMove(event) {
    if (event.pointerType==='touch') return;
    const rect = hero.getBoundingClientRect();
    mouse.x = clamp(((event.clientX-rect.left)/rect.width-.5)*2,-1,1);
    mouse.y = clamp(((event.clientY-rect.top)/rect.height-.5)*2,-1,1);
    mouse.active = true;
  }
  function onPointerLeave() { mouse.active = false; }

  function renderFrame(ms) {
    rafId = 0;
    if (!visible || !created || destroyed || document.hidden) return;
    const dt = lastFrameMs ? Math.min((ms-lastFrameMs)/1000,.055) : 0;
    if (compact && lastFrameMs && dt < 1/OPTIONS.maxFPScompact) {
      rafId = requestAnimationFrame(renderFrame);
      return;
    }
    lastFrameMs = ms;
    elapsed += dt;
    const k = 1-Math.exp(-OPTIONS.mouseSmoothing*dt);
    mouse.smoothedX += ((mouse.active?mouse.x:0)-mouse.smoothedX)*k;
    mouse.smoothedY += ((mouse.active?mouse.y:0)-mouse.smoothedY)*k;
    brain.rotation.y = -.24 + elapsed*OPTIONS.spinRadiansPerSecond + mouse.smoothedX*.36;
    brain.rotation.x = -.09 - mouse.smoothedY*.23 + .025*Math.sin(elapsed*.43);
    brain.rotation.z = .018*Math.sin(elapsed*.32);
    brain.position.y = .023*Math.sin(elapsed*.76);
    updatePulses(dt);
    try {
      renderer.render(scene,camera);
      // Só remove o SVG depois do primeiro frame WebGL bem-sucedido.
      holder.classList.add('is-webgl-ready');
    } catch (error) {
      console.warn('[ICON] Falha ao renderizar cérebro 3D; SVG ativo.',error);
      holder.classList.remove('is-webgl-ready');
      visible=false;
      return;
    }
    rafId = requestAnimationFrame(renderFrame);
  }
  function start() {
    if (!created || !visible || document.hidden || rafId) return;
    lastFrameMs = 0;
    rafId = requestAnimationFrame(renderFrame);
  }
  function stop() { if (rafId) cancelAnimationFrame(rafId); rafId=0; lastFrameMs=0; }
  function onVisibility() { if (document.hidden) stop(); else start(); }

  function disposeScene() {
    stop();
    hero.removeEventListener('pointermove',onPointerMove);
    hero.removeEventListener('pointerleave',onPointerLeave);
    document.removeEventListener('visibilitychange',onVisibility);
    resizeObserver?.disconnect(); intersections?.disconnect();
    window.removeEventListener('resize',resize);
    if (brain) brain.traverse(child => {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) child.material.forEach(m=>m.dispose());
      else child.material?.dispose();
    });
    renderer?.dispose();
    canvas?.remove();
    renderer=null; canvas=null; created=false; destroyed=true;
    holder.classList.remove('is-webgl-ready');
  }

  async function initialize() {
    if (loading || created || destroyed) return;
    loading=true;
    try {
      // Import dinâmico: uma rede bloqueada não impede o restante do site.
      THREE = await import(OPTIONS.cdn);
      if (destroyed || !holder.isConnected) return;
      const test = document.createElement('canvas');
      if (!test.getContext('webgl2') && !test.getContext('webgl')) throw Error('WebGL não disponível');
      compact = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4)
        || (navigator.deviceMemory && navigator.deviceMemory<=4);
      pxRatio = Math.min(devicePixelRatio||1,compact?1.25:OPTIONS.dprMaximum);
      renderer = new THREE.WebGLRenderer({ alpha:true,antialias:!compact,powerPreference:compact?'low-power':'high-performance' });
      renderer.setPixelRatio(pxRatio);
      renderer.setClearColor(0x000000,0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden','true');
      canvas.setAttribute('role','presentation');
      canvas.addEventListener('webglcontextlost',e=>{
        e.preventDefault(); stop(); holder.classList.remove('is-webgl-ready');
      });
      canvas.addEventListener('webglcontextrestored',()=>{ resize(); start(); });
      holder.appendChild(canvas);
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1.4,1.4,1.4,-1.4,.1,20);
      camera.position.set(0,0,6);
      camera.lookAt(0,0,0);
      brain = new THREE.Group();
      scene.add(brain);
      const edges = makeNetwork(compact?OPTIONS.compactNodesPerHemisphere:OPTIONS.fullNodesPerHemisphere);
      makeNeurons();
      makePulses(edges);
      resize();
      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(holder);
      } else window.addEventListener('resize',resize,{passive:true});
      hero.addEventListener('pointermove',onPointerMove,{passive:true});
      hero.addEventListener('pointerleave',onPointerLeave);
      document.addEventListener('visibilitychange',onVisibility);
      created=true;
      start();
    } catch (e) {
      console.warn('[ICON] Exibindo ilustração alternativa. WebGL/Three.js indisponível:',e);
      holder.classList.remove('is-webgl-ready');
      if (renderer) disposeScene();
    } finally {
      loading=false;
    }
  }

  // Renderiza somente quando o HERO está na área visível.
  if ('IntersectionObserver' in window) {
    intersections = new IntersectionObserver(entries=>{
      visible=entries.some(e=>e.isIntersecting);
      if (visible) { if (!created) initialize(); else start(); }
      else stop();
    },{rootMargin:'100px 0px 100px 0px',threshold:0});
    intersections.observe(hero);
  } else { visible=true; initialize(); }

  // Navegação bfcache / descarte da página: sem frames órfãos ou listeners.
  window.addEventListener('pagehide',e=>{ if (e.persisted) stop(); else disposeScene(); });
  window.addEventListener('pageshow',e=>{ if (e.persisted) start(); });
})();
