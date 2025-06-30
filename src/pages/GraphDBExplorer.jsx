import React, { useState } from 'react';

const GraphDBExplorer = () => {
  // URI par défaut (tu peux la modifier dynamiquement)
  const [entityURI, setEntityURI] = useState('http://example.org/ifc#Entity_9608');

  const baseURL = 'http://localhost:7200/graph-explore?resource='; // modifie si GraphDB est distant

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Exploration RDF dans GraphDB</h2>

      {/* Champ pour changer dynamiquement l'URI */}
      <div style={{ marginBottom: '1rem' }}>
        <label>URI de l'entité : </label>
        <input
          type="text"
          value={entityURI}
          onChange={(e) => setEntityURI(e.target.value)}
          style={{ width: '60%' }}
        />
        <button onClick={() => window.open(baseURL + encodeURIComponent(entityURI), '_blank')}>
          Ouvrir dans un nouvel onglet
        </button>
      </div>

      {/* Iframe d'exploration intégrée */}
      <iframe
        title="Exploration GraphDB"
        src={baseURL + encodeURIComponent(entityURI)}
        width="100%"
        height="600px"
        frameBorder="0"
      />
    </div>
  );
};

export default GraphDBExplorer;
