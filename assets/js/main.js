document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // LOADER Y TRANSICIONES ENTRE PÁGINAS
  // ============================================
  const loader = document.querySelector('.loader-overlay');
  const loaderDiv = document.querySelector('.loader');
  // Preparar estados: nav comprimido, header y contenido listos para desplegarse en secuencia
  if (loader) {
    document.body.classList.add('nav-prepare');
    document.body.classList.add('header-prep');
    document.body.classList.add('content-prep');
  }
  
  // Secuencia de animación al cargar
  window.addEventListener('load', () => {
    if (loader && loaderDiv) {
      // Fase 1: Animación completa del logo (~2.8s)
      setTimeout(() => {
        // Fase 2: Latido del corazón (2 latidos, ~1.6s)
        loaderDiv.classList.add('heartbeat');
        
        setTimeout(() => {
          // Fase 3: Calcular posición exacta y mover logo al header siguiendo el camino planificado
          const logoHeader = document.querySelector('.brand img');
          if (logoHeader) {
            const loaderRect = loaderDiv.getBoundingClientRect();
            const logoRect = logoHeader.getBoundingClientRect();

            // Centros inicial (PI) y final (PF)
            const pi = { x: loaderRect.left + loaderRect.width/2, y: loaderRect.top + loaderRect.height/2 };
            const pf = { x: logoRect.left + logoRect.width/2, y: logoRect.top + logoRect.height/2 };

            // Unidades de retícula (4 divisiones X, 3 divisiones Y)
            const dx = Math.abs(pf.x - pi.x);
            const dy = Math.abs(pf.y - pi.y);
            const unitX = dx >= 1 ? dx / 4 : 0;
            const unitY = dy >= 1 ? dy / 3 : 0;

            // Puntos de referencia (mismo criterio que el planner)
            const p0 = { x: pi.x, y: pi.y };
            const p1 = { x: pi.x + (-1.682)*unitX, y: pi.y + (1)*unitY };
            const p2 = { x: pi.x, y: Math.max(0, window.innerHeight - 5) }; // borde inferior visible
            const p3 = { x: pi.x + 3*unitX, y: pi.y };
            const p35 = { x: pi.x, y: pf.y + 0.25*unitY };
            const p4 = { x: pf.x, y: pf.y };

            const pts = [p0, p1, p2, p3, p35, p4];

            // Construcción del path (Bézier + arco circular P3→P35)
            function cubicSegment(p1, p2, t1, t2){
              const dx = p2.x - p1.x; const dy = p2.y - p1.y;
              const chord = Math.hypot(dx, dy);
              if (chord < 1) return ` L ${p2.x} ${p2.y}`;
              const n1 = Math.hypot(t1.x, t1.y) || 1;
              const n2 = Math.hypot(t2.x, t2.y) || 1;
              const c1x = p1.x + (t1.x/n1) * chord * 0.5;
              const c1y = p1.y + (t1.y/n1) * chord * 0.5;
              const c2x = p2.x - (t2.x/n2) * chord * 0.5;
              const c2y = p2.y - (t2.y/n2) * chord * 0.5;
              return ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
            }

            function arcP3toP35(p3, p35){
              const dx = p35.x - p3.x; const dy = p35.y - p3.y;
              const chord = Math.hypot(dx, dy);
              const R = chord * 0.75; // radio reducido
              const sweep = 0; const largeArc = 0;
              return ` A ${R} ${R} 0 ${largeArc} ${sweep} ${p35.x} ${p35.y}`;
            }

            // Tangentes por tramo (como en planner)
            const tangentsExit = [
              {x: 1, y: 0},  // P0 sale horizontal derecha
              {x: 0, y: 1},  // P1 sale vertical abajo
              {x: 1, y: 0},  // P2 sale horizontal derecha
              {x: 0, y: -1}, // P3 sale vertical arriba
              {x: 1, y: 0},  // P35 sale horizontal derecha
              null
            ];

            function arrivalTangent(i){
              switch(i){
                case 0: return {x:0,y:1};    // llega a P1 vertical abajo
                case 1: return {x:1,y:0};    // llega a P2 horizontal
                case 2: return {x:0,y:-1};   // llega a P3 vertical arriba
                case 3: return {x:1,y:0};    // llega a P35 horizontal
                case 4: return {x:1,y:0};    // llega a P4 horizontal
                default: return {x:1,y:0};
              }
            }

            let d = `M ${p0.x} ${p0.y}`;
            // Segmento personalizado P35→P4 para mayor armonía
            function bezierP35toP4(p1, p2){
              const margin = 1;
              const dxAbs = Math.max(margin, Math.abs(p2.x - p1.x));
              const dyAbs = Math.max(margin, Math.abs(p1.y - p2.y));
              const dir = Math.sign(p2.x - p1.x) || 1;

              const t1x = 0.382; // proporciones armónicas
              const t2x = 0.618;
              const c1yOffset = dyAbs * 0.20;
              const c2yOffset = dyAbs * 0.30;

              let c1x = p1.x + dir * (dxAbs * t1x);
              let c1y = p1.y + c1yOffset;
              let c2x = p2.x - (dxAbs * t2x);
              let c2y = p2.y + c2yOffset;

              if(dir > 0){
                c1x = Math.max(c1x, p1.x + margin);
                c2x = Math.min(c2x, p2.x - margin);
                if(c1x > c2x) c1x = Math.max(p1.x + margin, c2x - margin*0.5);
              } else {
                c1x = Math.min(c1x, p1.x - margin);
                c2x = Math.max(c2x, p2.x + margin);
                if(c1x < c2x) c1x = Math.min(p1.x - margin, c2x + margin*0.5);
              }
              return ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
            }

            for (let i=0; i<pts.length-1; i++){
              const a = pts[i];
              const b = pts[i+1];
              if (i === 3){
                d += arcP3toP35(a, b);
              } else if (i === 4){
                d += bezierP35toP4(a, b);
              } else {
                d += cubicSegment(a, b, tangentsExit[i], arrivalTangent(i));
              }
            }

            // Crear un SVG path temporal para muestrear posiciones
            const svgNS = 'http://www.w3.org/2000/svg';
            const tempSvg = document.createElementNS(svgNS, 'svg');
            const tempPath = document.createElementNS(svgNS, 'path');
            tempPath.setAttribute('d', d);
            tempSvg.appendChild(tempPath);
            document.body.appendChild(tempSvg);

            const total = tempPath.getTotalLength();
            const steps = 120; // suavidad
            const scaleTarget = logoRect.width / loaderRect.width;

            let keyframesContent = '@keyframes moveToHeaderDynamic {\n';
            keyframesContent += '  0% { transform: translate(0, 0) scale(1); }\n';
            for (let i=1; i<steps; i++){
              const t = i/steps;
              const p = tempPath.getPointAtLength(total * t);
              // Offset relativo al origen (PI) para usar translate desde 0,0
              const x = p.x - pi.x;
              const y = p.y - pi.y;
              const s = 1 + (scaleTarget - 1) * t;
              keyframesContent += `  ${(t*100).toFixed(2)}% { transform: translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)}); }\n`;
            }
            keyframesContent += `  100% { transform: translate(${(pf.x - pi.x).toFixed(2)}px, ${(pf.y - pi.y).toFixed(2)}px) scale(${scaleTarget.toFixed(4)}); }\n`;
            keyframesContent += '}';

            // Limpiar temporal y aplicar estilos
            document.body.removeChild(tempSvg);
            const keyframesStyle = document.createElement('style');
            keyframesStyle.id = 'dynamic-loader-animation';
            keyframesStyle.textContent = keyframesContent;
            const oldStyle = document.getElementById('dynamic-loader-animation');
            if (oldStyle) oldStyle.remove();
            document.head.appendChild(keyframesStyle);

            // Animación con easing suave
            loaderDiv.style.animation = 'moveToHeaderDynamic 2s ease-in-out forwards';

            // Watchdog/fallback: si algo falla y no llega el evento, revelamos todo igual
            const safeFinalize = () => {
              document.body.classList.add('header-deploy');
              document.body.classList.add('page-loaded');
              document.body.classList.add('content-deploy');
              document.body.classList.remove('nav-prepare','header-prep','content-prep');
              loader.classList.add('hidden');
            };
            const watchdog = setTimeout(safeFinalize, 5000); // 5s después de iniciar el movimiento

            // Disparar despliegue del header exactamente al terminar la animación del logo
            const onMoveEnd = (ev) => {
              if (ev.animationName !== 'moveToHeaderDynamic') return;
              // Fase 4.1: Despliegue del header (izquierda→derecha) y habilitar visibilidad general
              document.body.classList.add('header-deploy');
              document.body.classList.add('page-loaded');
              // Comenzar a desvanecer el overlay para que el despliegue del header sea visible
              loader.classList.add('hidden');

              // Al terminar el despliegue del header, desplegar contenido (top-left → bottom-right)
              const headerEl = document.querySelector('header');
              if (headerEl) {
                const onHeaderTransitionEnd = (tev) => {
                  // Asegurar que reaccionamos al fin de clip-path del header
                  const prop = tev.propertyName || '';
                  if (prop !== 'clip-path' && prop !== '-webkit-clip-path') return;
                  document.body.classList.add('content-deploy');
                  // Limpieza simple sin esperar eventos del contenido
                  setTimeout(() => {
                    document.body.classList.remove('nav-prepare');
                    document.body.classList.remove('header-prep');
                    document.body.classList.remove('content-prep');
                    clearTimeout(watchdog);
                  }, 200);
                };
                headerEl.addEventListener('transitionend', onHeaderTransitionEnd, { once: true });
              } else {
                // Fallback si no encontramos header: desplegar contenido tras 1s
                setTimeout(() => {
                  document.body.classList.add('content-deploy');
                  const finalizeCleanup = () => {
                    document.body.classList.remove('nav-prepare');
                    document.body.classList.remove('header-prep');
                    document.body.classList.remove('content-prep');
                    clearTimeout(watchdog);
                  };
                  setTimeout(finalizeCleanup, 1200);
                }, 1000);
              }
            };
            loaderDiv.addEventListener('animationend', onMoveEnd, { once: true });
          }
          
        }, 1600);
      }, 2800);
    }
  });

  // Interceptar clicks en enlaces internos para transición suave
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    
    // Verificar si es un enlace interno (no ancla, no externo, no descarga)
    if (link && 
        link.href && 
        link.href.indexOf(window.location.origin) === 0 &&
        !link.href.includes('#') &&
        !link.target &&
        !link.hasAttribute('download') &&
        !link.classList.contains('no-transition')) {
      
      e.preventDefault();
      const targetUrl = link.href;
      
      // Mostrar loader
      if (loader) {
        loader.classList.remove('hidden');
      }
      
      // Fade out del contenido
      document.body.classList.remove('page-loaded');
      
      // Navegar después de la animación
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 300);
    }
  });

  // ============================================
  // FOOTER: AÑO DINÁMICO
  // ============================================
  const yearSpan = document.querySelector('[data-current-year]');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ============================================
  // MOBILE NAV TOGGLE (HAMBURGUESA)
  // ============================================
  const navToggle = document.querySelector('.nav-toggle');
  const navbar = document.querySelector('.navbar');
  const primaryNav = document.getElementById('primary-nav');
  
  if (navToggle && navbar && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });
  }
});
