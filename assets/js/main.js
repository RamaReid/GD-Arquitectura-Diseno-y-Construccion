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
        // Sombra "vida": pulso sincronizado con el latido antes del vuelo
        (function(){
          const shadowEl = loaderDiv.querySelector('.petal-shadow');
          const shadowCore = loaderDiv.querySelector('.petal-shadow-core');
          const lifeStyle = document.getElementById('dynamic-shadow-life');
          if (!lifeStyle) {
            let lifeKF = '@keyframes shadowLifeAmbient {\n';
            lifeKF += '  0% { opacity: 0.00; transform: translate(-50%, -50%) translate3d(-6px, 12px, 0px) scale(0.96); filter: blur(10px); }\n';
            lifeKF += '  12.5% { opacity: 0.35; transform: translate(-50%, -50%) translate3d(-8px, 13px, 0px) scale(1.06); filter: blur(14px); }\n';
            lifeKF += '  25% { opacity: 0.18; transform: translate(-50%, -50%) translate3d(-7px, 12px, 0px) scale(0.98); filter: blur(10px); }\n';
            lifeKF += '  50% { opacity: 0.35; transform: translate(-50%, -50%) translate3d(-9px, 14px, 0px) scale(1.06); filter: blur(14px); }\n';
            lifeKF += '  75% { opacity: 0.20; transform: translate(-50%, -50%) translate3d(-7px, 12px, 0px) scale(0.99); filter: blur(10px); }\n';
            lifeKF += '  100% { opacity: 0.18; transform: translate(-50%, -50%) translate3d(-6px, 12px, 0px) scale(0.98); filter: blur(10px); }\n';
            lifeKF += '}\n';
            lifeKF += '@keyframes shadowLifeCore {\n';
            lifeKF += '  0% { opacity: 0.00; transform: translate(-50%, -50%) translate3d(-3px, 7px, 0px) scale(0.94); filter: blur(3px); }\n';
            lifeKF += '  12.5% { opacity: 0.60; transform: translate(-50%, -50%) translate3d(-4px, 8px, 0px) scale(1.02); filter: blur(6px); }\n';
            lifeKF += '  25% { opacity: 0.30; transform: translate(-50%, -50%) translate3d(-3px, 7px, 0px) scale(0.96); filter: blur(3px); }\n';
            lifeKF += '  50% { opacity: 0.60; transform: translate(-50%, -50%) translate3d(-5px, 9px, 0px) scale(1.02); filter: blur(6px); }\n';
            lifeKF += '  75% { opacity: 0.32; transform: translate(-50%, -50%) translate3d(-3px, 7px, 0px) scale(0.96); filter: blur(3px); }\n';
            lifeKF += '  100% { opacity: 0.26; transform: translate(-50%, -50%) translate3d(-3px, 7px, 0px) scale(0.96); filter: blur(3px); }\n';
            lifeKF += '}';
            const styleEl = document.createElement('style');
            styleEl.id = 'dynamic-shadow-life';
            styleEl.textContent = lifeKF;
            document.head.appendChild(styleEl);
          }
          if (shadowEl) shadowEl.style.animation = 'shadowLifeAmbient 1.6s ease-in-out forwards';
          if (shadowCore) shadowCore.style.animation = 'shadowLifeCore 1.6s ease-in-out forwards';
        })();
        
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

            // Animación con easing suave (trayectoria) - un poco más larga para apreciar el arco
            loaderDiv.style.animation = 'moveToHeaderDynamic 2.3s ease-in-out forwards';

            // Activar sombra volumétrica independiente para dar profundidad sin deformar trazos
            const shadowEl = loaderDiv.querySelector('.petal-shadow');
            if (shadowEl) {
              // Generamos un keyframe específico para la sombra con "distancia" variable
              const sSteps = 90;
              let shadowKF = '@keyframes petalShadowDynamic {\n';
              shadowKF += '  0% { opacity: 0.0; transform: translate(-50%, -50%) translate3d(0px, 0px, 0px) scale(1); filter: blur(10px); }\n';
              for (let i = 1; i <= sSteps; i++) {
                const t = i / sSteps;
                const pct = (t * 100).toFixed(2);

                // Distancia base en forma de campana (pico en el medio del vuelo)
                const bell = 1 - 4 * Math.pow(t - 0.5, 2); // [0..1]
                const bellClamped = Math.max(0, bell);
                const peak = 120; // separación máxima mucho mayor (vuelo más alto)

                // "Acercamientos" en puntos intermedios (t ~ 0.33 y 0.67)
                const gauss = (x, m, s) => Math.exp(-0.5 * Math.pow((x - m) / s, 2));
                const dip = 0.85 * gauss(t, 0.33, 0.045) + 0.85 * gauss(t, 0.67, 0.045);
                const sepFactor = Math.max(0, bellClamped * (1 - dip));
                const sep = peak * sepFactor; // distancia final de la sombra

                // Dirección de separación basada en "viento"
                const wind = t * Math.PI * 2.2;
                const dirX = Math.sin(wind * 1.35 + 0.3);
                const dirY = Math.cos(wind * 1.15 - 0.2);
                // Sol desde arriba-derecha: la sombra cae hacia abajo-izquierda (−X, +Y)
                const sunBX = -0.35 * sep;
                const sunBY =  0.55 * sep;
                const ox = sunBX + dirX * sep * 0.5;
                const oy = sunBY + dirY * sep * 0.5;

                // Profundidad y aspecto de la sombra
                const z = 8 + 10 * sepFactor; // ligera variación de Z
                // Más nítida y opaca cuando está más cerca (dip) para remarcar el acercamiento
                const blur = 8 + 24 * sepFactor; // refuerza el blur en el pico para mayor sensación de altura
                const baseOp = 0.22 - 0.08 * (1 - sepFactor) + 0.08 * sepFactor; // ~0.14 en dips, ~0.30 en pico
                const op = Math.min(1.0, baseOp * 3.0); // x2 respecto al ajuste anterior (1.5 -> 3.0), límite 1.0
                const sc = 0.94 + 0.16 * sepFactor; // la sombra se ensancha ligeramente con la distancia

                shadowKF += `  ${pct}% { opacity: ${op.toFixed(2)}; transform: translate(-50%, -50%) translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, ${z.toFixed(1)}px) scale(${sc.toFixed(3)}); filter: blur(${blur.toFixed(1)}px); }\n`;
              }
              shadowKF += '  100% { opacity: 0; transform: translate(-50%, -50%) translate3d(0px, 0px, 0px) scale(1); filter: blur(8px); }\n';
              shadowKF += '}';

              const oldShadow = document.getElementById('dynamic-petal-shadow');
              if (oldShadow) oldShadow.remove();
              const shadowStyle = document.createElement('style');
              shadowStyle.id = 'dynamic-petal-shadow';
              shadowStyle.textContent = shadowKF;
              document.head.appendChild(shadowStyle);

              shadowEl.style.animation = 'petalShadowDynamic 2.3s ease-in-out forwards';
              loaderDiv.addEventListener('animationend', () => {
                shadowEl.style.opacity = '0';
              }, { once: true });
            }

            // Activar sombra núcleo: más cercana y nítida cuando está cerca del suelo, se desvanece cuando está alto
            const shadowCore = loaderDiv.querySelector('.petal-shadow-core');
            if (shadowCore) {
              const cSteps = 90;
              let coreKF = '@keyframes petalShadowCore {\n';
              coreKF += '  0% { opacity: 0.0; transform: translate(-50%, -50%) translate3d(0px, 0px, 0px) scale(1); filter: blur(4px); }\n';
              for (let i = 1; i <= cSteps; i++) {
                const t = i / cSteps;
                const pct = (t * 100).toFixed(2);

                // Altura: inverso de la separación principal (más cerca → más opaco y cerca)
                const bell = 1 - 4 * Math.pow(t - 0.5, 2);
                const bellClamped = Math.max(0, bell);
                const gauss = (x, m, s) => Math.exp(-0.5 * Math.pow((x - m) / s, 2));
                const dip = 0.85 * gauss(t, 0.33, 0.045) + 0.85 * gauss(t, 0.67, 0.045);
                const sepFactor = Math.max(0, bellClamped * (1 - dip)); // 0 = cerca, 1 = lejos
                const heightFactor = 1 - sepFactor; // inverso: 1 = cerca, 0 = lejos

                const wind = t * Math.PI * 2.2;
                const dirX = Math.sin(wind * 1.35 + 0.3);
                const dirY = Math.cos(wind * 1.15 - 0.2);
                // Sombra núcleo más compacta, se separa menos y en la misma dirección del sol
                const coreSep = 18 * sepFactor; // siempre menor que la ambient
                const sunBX = -0.35 * coreSep;
                const sunBY =  0.55 * coreSep;
                const cx = sunBX + dirX * coreSep * 0.3;
                const cy = sunBY + dirY * coreSep * 0.3;

                const cz = 4 + 6 * sepFactor;
                const cblur = 4 + 8 * sepFactor; // nítida cerca, difusa lejos
                const cop = Math.min(0.85, 0.70 * heightFactor); // más opaca cerca, más marcada
                const csc = 0.92 + 0.08 * sepFactor;

                coreKF += `  ${pct}% { opacity: ${cop.toFixed(2)}; transform: translate(-50%, -50%) translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, ${cz.toFixed(1)}px) scale(${csc.toFixed(3)}); filter: blur(${cblur.toFixed(1)}px); }\n`;
              }
              coreKF += '  100% { opacity: 0; transform: translate(-50%, -50%) translate3d(0px, 0px, 0px) scale(1); filter: blur(4px); }\n';
              coreKF += '}';

              const oldCore = document.getElementById('dynamic-petal-shadow-core');
              if (oldCore) oldCore.remove();
              const coreStyle = document.createElement('style');
              coreStyle.id = 'dynamic-petal-shadow-core';
              coreStyle.textContent = coreKF;
              document.head.appendChild(coreStyle);

              shadowCore.style.animation = 'petalShadowCore 2.3s ease-in-out forwards';
              loaderDiv.addEventListener('animationend', () => {
                shadowCore.style.opacity = '0';
              }, { once: true });
            }

            // Generar animación CSS de "papel volando" con múltiples deformaciones
            const logoSvg = loaderDiv.querySelector('svg');
            if (logoSvg) {
              const steps = 90;
              let flyKF = '@keyframes paperFlyDynamic {\n';
              flyKF += '  0% { transform: translate3d(0px, 0px, 0px) rotateX(70deg) rotateY(0deg) rotateZ(0deg) scale3d(0.7, 0.85, 1); filter: blur(0px) drop-shadow(0px 0px 0px rgba(0,0,0,0.0)); }\n';
              
              for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const pct = (t * 100).toFixed(2);
                
                // Levantamiento inicial (0-12%)
                let rx = 70;
                let sy = 0.85, sx = 0.7;
                if (t < 0.12) {
                  const lift = t / 0.12;
                  rx = 70 * (1 - lift);
                  sy = 0.85 + 0.15 * lift;
                  sx = 0.7 + 0.3 * lift;
                }
                
                // Amortiguación final comenzando antes (82-100%) para planeo suave
                const envelope = t < 0.82 ? 1 : 1 - Math.pow((t - 0.82) / 0.18, 1.4);
                
                // Giros y deformaciones orgánicas
                const rz = Math.sin(t * Math.PI * 3.0) * 32 * envelope;
                const ry = Math.sin(t * Math.PI * 2.2 + 0.5) * 68 * envelope;
                const rtx = t < 0.12 ? rx : Math.cos(t * Math.PI * 1.9) * 28 * envelope;
                
                // Escalas asimétricas (simula enrollado)
                const scx = t < 0.12 ? sx : 1 + Math.sin(t * Math.PI * 4.2) * 0.28 * envelope;
                const scy = t < 0.12 ? sy : 1 + Math.cos(t * Math.PI * 3.6 + 0.6) * 0.32 * envelope;
                
                // Blur muy leve durante el movimiento rápido
                const blur = t > 0.18 && t < 0.9 ? Math.sin((t - 0.18) * Math.PI / 0.72) * 0.6 : 0;

                // Profundidad: desplazamiento Z que representa altura durante el viaje
                // El logo empieza alto (centro pantalla), baja y vuelve a subir al header
                // Modelamos la altura real: comienza alto, desciende en el medio, termina alto
                const pathHeight = Math.sin(t * Math.PI * 1.05); // oscila -1..+1
                const z = 80 * pathHeight * envelope; // puede ser negativo (bajo) o positivo (alto)
                // Altura absoluta para efectos (siempre positiva para escala/sombra)
                const absHeight = Math.abs(z);
                // Factor de escala por altura: +20% cuando está más alto (inicio/fin), menos cuando baja
                const heightScale = 1 + 0.20 * absHeight / 80;
                const wind = t * Math.PI * 2.2;
                // Deriva de viento con mayor amplitud, decaimiento cerca del final
                const driftEnv = t < 0.8 ? 1 : 1 - Math.min(1, (t - 0.8) / 0.2);
                let tx = Math.sin(wind * 1.7) * 12 * driftEnv * envelope;
                let ty = Math.cos(wind * 1.2) * 9 * driftEnv * envelope;
                // Micro-planeo: leve ascenso entre 0.86 y 0.98 que se disipa al final
                if (t > 0.86) {
                  const g = 1 - Math.min(1, (t - 0.86) / 0.12);
                  const glideLift = 10 * g * g; // curva cuadrática suave
                  ty -= glideLift;
                }
                const shx = 14 * Math.sin(t * Math.PI * 1.5 + 0.4) * envelope;
                const shy = 9 * Math.cos(t * Math.PI * 1.25 - 0.2) * envelope;
                const sha = 0.18 * (0.7 + 0.3 * envelope);

                // Aplicar heightScale a las escalas asimétricas para refuerzo de perspectiva
                const finalScx = scx * heightScale;
                const finalScy = scy * heightScale;

                flyKF += `  ${pct}% { transform: translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, ${z.toFixed(2)}px) rotateX(${rtx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale3d(${finalScx.toFixed(4)}, ${finalScy.toFixed(4)}, 1); filter: blur(${blur.toFixed(2)}px) drop-shadow(${shx.toFixed(1)}px ${shy.toFixed(1)}px 14px rgba(0,0,0,${sha.toFixed(2)})); }\n`;
              }
              flyKF += '  100% { transform: translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale3d(1, 1, 1); filter: blur(0px) drop-shadow(0px 0px 0px rgba(0,0,0,0)); }\n';
              flyKF += '}';
              
              const oldFly = document.getElementById('dynamic-paper-fly');
              if (oldFly) oldFly.remove();
              const flyStyle = document.createElement('style');
              flyStyle.id = 'dynamic-paper-fly';
              flyStyle.textContent = flyKF;
              document.head.appendChild(flyStyle);
              
              logoSvg.style.animation = 'paperFlyDynamic 2.3s ease-in-out forwards';
            }


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
                // Fallback: si no llega transitionend del header en 1200ms, forzar content-deploy
                let fired = false;
                const forceDeploy = setTimeout(() => {
                  if (fired) return;
                  document.body.classList.add('content-deploy');
                  // Limpieza alineada con la cortina (2.8s)
                  setTimeout(() => {
                    document.body.classList.remove('nav-prepare');
                    document.body.classList.remove('header-prep');
                    document.body.classList.remove('content-prep');
                    clearTimeout(watchdog);
                  }, 2800);
                }, 1200);
                const onHeaderTransitionEnd = (tev) => {
                  // Asegurar que reaccionamos al fin de clip-path del header
                  const prop = tev.propertyName || '';
                  if (prop !== 'clip-path' && prop !== '-webkit-clip-path') return;
                  fired = true;
                  clearTimeout(forceDeploy);
                  document.body.classList.add('content-deploy');
                  // Pseudo-elementos no emiten transitionend: limpiar por tiempo
                  setTimeout(() => {
                    document.body.classList.remove('nav-prepare');
                    document.body.classList.remove('header-prep');
                    document.body.classList.remove('content-prep');
                    clearTimeout(watchdog);
                  }, 2800);
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

  // Atajo para re-ver la intro 3D: Shift+I
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      try { localStorage.removeItem('introSeen'); } catch(err) {}
      window.location.href = 'intro.html';
    }
  });
});
