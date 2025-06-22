// src/pages/GraphDBExplorer.jsx
import React, { useEffect, useRef } from 'react';
import { useLocation }           from 'react-router-dom';

export default function GraphDBExplorer() {
  const { state }       = useLocation();
  const initialSubject  = state?.subjectIRI;    // tu peux passer null ou undefined
  const containerRef    = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1) Crée le web component <visual-graph>
    const vg = document.createElement('visual-graph');
    vg.setAttribute('base-url',   'http://localhost:7200');
    vg.setAttribute('repository', 'my_ontology');
    if (initialSubject) {
      vg.setAttribute('resource', initialSubject);
    }
    vg.style.width  = '100%';
    vg.style.height = '100%';

    // 2) Monte-le dans le DOM
    container.appendChild(vg);

    // 3) cleanup à la destruction du composant
    return () => {
      if (container.contains(vg)) container.removeChild(vg);
    };
  }, [initialSubject]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
}
