(function(){
  const canvas = document.getElementById('introCanvas');
  const fade = document.getElementById('fade');
  if (!canvas) return;

  let renderer, scene, camera, mesh, startTime, rafId;
  let originalPositions = null;
  const clock = new THREE.Clock();

  const textureUrl = 'assets/img/LogoGD.svg';

  function init(){
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    resize();
    renderer.setClearColor(0x0a0a0a, 1);

    scene = new THREE.Scene();

    const fov = 25;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 2000);
    camera.position.set(0, 0, 600);

    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    const texLoader = new THREE.TextureLoader();
    texLoader.load(textureUrl, (texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy?.() || 1;

      // Plano con muchas subdivisiones para deformar como "papel"
      const baseW = 420;   // tamaño base en px del plano (ancho)
      const baseH = 340;   // tamaño base en px del plano (alto)
      const geom = new THREE.PlaneGeometry(baseW, baseH, 80, 60);
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
      mesh = new THREE.Mesh(geom, mat);
      scene.add(mesh);

      originalPositions = geom.attributes.position.array.slice();
      startTime = performance.now();
      animate();
    });

    window.addEventListener('resize', resize);
    window.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape') endIntro(300);
    });
  }

  function resize(){
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(dpr);
    if (camera) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  function deformPaper(t){
    if (!mesh || !originalPositions) return;
    const positions = mesh.geometry.attributes.position.array;
    const count = positions.length / 3;

    // Parámetros de deformación (tiempo en segundos)
    const time = t;
    const bend = 0.6 + 0.4*Math.sin(time*1.8);     // enrollado lateral
    const waveAmp = 16 * (0.6 + 0.4*Math.cos(time*1.2)); // ondulación
    const waveFreq = 3.2;
    const twist = 0.35*Math.sin(time*1.6);         // torsión

    for (let i=0;i<count;i++){
      const i3 = i*3;
      const ox = originalPositions[i3+0];
      const oy = originalPositions[i3+1];
      const oz = originalPositions[i3+2];

      const nx = ox / 210; // normalizado aprox.
      const ny = oy / 170;

      // Enrollado (curvatura en Z dependiente de X)
      const bendZ = bend * (nx*nx) * 40;

      // Onda (Z dependiente de Y y tiempo)
      const waveZ = Math.sin(ny*waveFreq + time*3.4) * waveAmp * (1 - Math.abs(nx)*0.5);

      // Torsión (rotación XY por distancia al centro)
      const dist = Math.sqrt(nx*nx + ny*ny);
      const ang = twist * dist;
      const cosA = Math.cos(ang);
      const sinA = Math.sin(ang);
      const tx = ox*cosA - oy*sinA;
      const ty = ox*sinA + oy*cosA;

      positions[i3+0] = tx;
      positions[i3+1] = ty;
      positions[i3+2] = oz + bendZ + waveZ;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
  }

  function flightPath(tNorm){
    // Curva simple con easing: inicio centro → desplazamiento en arco hacia arriba-izquierda
    const ease = (x)=> x<0.5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2;
    const tt = ease(tNorm);

    const w = window.innerWidth;
    const h = window.innerHeight;
    // Posición de destino (simula ir hacia donde estaría el header)
    const start = { x: 0, y: 0 };
    const end = { x: -w*0.35, y: -h*0.28 };

    // Arco con pequeña elevación
    const ctrl = { x: -w*0.1, y: -h*0.45 };

    // Interpolación cuadrática (Bezier) en 2D
    const x = (1-tt)*(1-tt)*start.x + 2*(1-tt)*tt*ctrl.x + tt*tt*end.x;
    const y = (1-tt)*(1-tt)*start.y + 2*(1-tt)*tt*ctrl.y + tt*tt*end.y;

    return { x, y };
  }

  function animate(){
    const t = (performance.now() - startTime) / 1000; // segundos totales

    // Fases: 0-2.4s (formación), 2.4-5.0s (vuelo), 5.0-5.6 (aplanado y fade), redirección
    if (mesh){
      if (t < 2.4){
        // Formación: elevarse desde plano, deformación intensa
        deformPaper(t*1.1);
        mesh.rotation.x = THREE.MathUtils.degToRad(60 - 60*(t/2.4)); // de 60° a 0°
        mesh.rotation.y = THREE.MathUtils.degToRad(15*Math.sin(t*2.0));
        mesh.rotation.z = THREE.MathUtils.degToRad(8*Math.sin(t*3.0));
        mesh.position.set(0, 0, 0);
        const s = 0.9 + 0.1*Math.sin(t*2.2);
        mesh.scale.set(s, s, 1);
      } else if (t < 5.0){
        // Vuelo: trayectoria y deformación amortiguada
        const tf = (t - 2.4) / (5.0 - 2.4);
        deformPaper(2.4 + tf*2.0);
        const p = flightPath(tf);
        mesh.position.set(p.x, p.y, 0);
        const env = 1 - Math.pow(tf, 1.2);
        mesh.rotation.x = THREE.MathUtils.degToRad(10*env);
        mesh.rotation.y = THREE.MathUtils.degToRad(65*env*Math.sin(t*1.6));
        mesh.rotation.z = THREE.MathUtils.degToRad(30*env*Math.sin(t*1.9));
        const s = 1.0 + 0.05*Math.sin(t*2.6)*env;
        mesh.scale.set(s, s, 1);
      } else if (t < 5.6){
        // Aplanado y fade-out
        const tf = (t - 5.0) / 0.6;
        deformPaper(5.0 - tf*2.0); // reducir suavemente
        mesh.position.lerp(new THREE.Vector3(-window.innerWidth*0.35, -window.innerHeight*0.28, 0), tf);
        mesh.rotation.set(0,0,0);
        mesh.scale.lerp(new THREE.Vector3(1,1,1), tf);
        if (fade && tf > 0.2) fade.classList.add('show');
      } else {
        endIntro();
        return;
      }
    }

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  function endIntro(delay=800){
    try{ if (rafId) cancelAnimationFrame(rafId); } catch(e){}
    setTimeout(()=>{ 
      try { localStorage.setItem('introSeen', '1'); } catch(e) {}
      window.location.href = 'index.html'; 
    }, delay);
  }

  init();
})();
