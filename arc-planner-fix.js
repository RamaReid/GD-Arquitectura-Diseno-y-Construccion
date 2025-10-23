// Reemplazo para el segmento 3 en computeTangentArcWithBoth
// Buscar la sección "Para el último arco (P3->P4)" y reemplazar con:

if(segmentIndex === 3){
  // Sale vertical arriba desde P3, llega horizontal desde izquierda a P4
  // Transición suave de vertical a horizontal dentro del rectángulo
  
  // Desde P3: subir verticalmente una buena distancia para hacer una curva amplia
  controlDist1 = Math.abs(dy) * 0.55;
  
  // Desde P4: venir horizontalmente desde la izquierda, distancia moderada
  controlDist2 = Math.abs(dx) * 0.55;
  
  // Calcular posiciones tentativas
  const c1x_temp = p1.x + tx1 * controlDist1;
  const c1y_temp = p1.y + ty1 * controlDist1;
  const c2x_temp = p2.x - tx2 * controlDist2;
  const c2y_temp = p2.y - ty2 * controlDist2;
  
  // Aplicar límites: C1 no pasa la vertical de P4, C2 no pasa la horizontal de P4
  const c1x = Math.min(c1x_temp, p2.x - 1); // dejar 1px de margen
  const c1y = c1y_temp;
  
  const c2x = c2x_temp;
  const c2y = Math.max(c2y_temp, p2.y); // no bajar más que P4
  
  return {
    path: ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  };
}
