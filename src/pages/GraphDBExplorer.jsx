/*GraphDBExplorer.jsx*/

import React, { useState } from 'react';

const GraphDBExplorer = () => {
  const baseURL = 'http://localhost:7200/resource?uri=http:%2F%2Fwww.mergedonto.fr&role=context';
  const graphURL = baseURL 

  return (
    <div style={{ width: '80vw', margin: 0, padding: 0, backgroundColor: '#fff' }}>
      <div style={{ padding: '1rem 2rem' }}>
        <h2 className="flex-1 text-center text-xl font-semibold" style={{ marginBottom: '0.05rem' }}>Exploration des données du modèle</h2>

{/*        <button
          onClick={() => window.open(graphURL, '_blank')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#483EA8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Ouvrir dans un nouvel onglet
        </button>*/}
      </div>

      <iframe
  title="Exploration GraphDB"
  src={graphURL}
  className="w-full h-[700px] bg-gray-100 border-none -mt-2"
/>

    </div>
  );
};

export default GraphDBExplorer;
