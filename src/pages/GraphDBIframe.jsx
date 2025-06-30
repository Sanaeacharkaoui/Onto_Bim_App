// src/pages/GraphDBIframe.jsx
import React from 'react';

export default function GraphDBIframe() {
  return (
    <div className="flex-1 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-center mb-4">
        Interface GraphDB intégrée
      </h1>
      <iframe
        src="http://localhost:7200"
        title="GraphDB Workbench"
        width="100%"
        height="800px"
        style={{ border: '1px solid #ccc', borderRadius: '8px' }}
      />
    </div>
  );
}
