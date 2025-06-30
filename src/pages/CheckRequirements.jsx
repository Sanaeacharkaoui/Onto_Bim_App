/*CheckRequirements.jsx*/

import React, { useState } from 'react';
import { Table, GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';

export default function CheckRequirements() {
  const navigate = useNavigate();

  const [mode, setMode] = useState('table');
  const [rule, setRule] = useState('');
  const [results, setResults] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);

  const rules = [
    { id: 'Ouvertures', label: '🔍 Chercher les ouvertures' },
    { id: 'Elements et proprietes', label: '🚪 Identifier les portes et les fenêtres avec leurs dimensions' },
    { id: 'Ouvertures et elements associes', label: '🔗 Chercher les ouvertures et les éléments associés' },
    { id: 'Dalles', label: '🧱 Lister les dalles ' },
    { id: 'Murs', label: '🏗 Lister les murs ' },
    { id: 'Garde-corps', label: '🛡 Lister les garde-corps et leur élément associé' },
    { id: 'Toitures', label: '🏠 Lister les toitures ' },
    { id: 'Toitures avec trémies', label: '🏠 Lister toitures contenant des trémies' },
    { id: 'Toitures avec garde-corps', label: '🛡 Lister les toitures contenant des garde-corps' },
    { id: 'Trémies > 80cm', label: '📏 Lister les trémies ≥ 80cm x 80cm' },
  ];
 //  Fonction d’exécution de la requête
  const handleExecute = () => {
    if (!rule) return;
    setResults([]);
    setColumns([]);
    setLoading(true);
    setHasExecuted(true);

    fetch(`http://127.0.0.1:8000/api/check-requirements?rule=${encodeURIComponent(rule)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const allKeys = new Set();
        data.forEach(obj => Object.keys(obj).forEach(k => allKeys.add(k)));
        setColumns([...allKeys]);
        setResults(data);
      })
      .catch(err => {
        console.error('Erreur vérification:', err);
        setResults([]);
        setColumns([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const convertToGraphData = (data, rule) => {
    const nodes = new Map();
    const links = [];
  
    const addNode = (id, label) => {
      if (!id) return; // ignore les valeurs null
      const name = label || id.split(/[#/]/).pop();
      if (!nodes.has(id)) {
        nodes.set(id, { id, name });
      }
    };
  
    const addLink = (source, target, label) => {
      if (nodes.has(source) && nodes.has(target)) {
        links.push({ source, target, label });
      }
    };
  
    data.forEach((item) => {
      switch (rule) {
        case 'Ouvertures':
          addNode(item.opening);
          break;
  
        case 'Elements et proprietes':
          addNode(item.ouverture);
          if (item.type) {
            addNode(item.type);
            addLink(item.ouverture, item.type, 'type');
          }
          if (item.largeur) {
            addNode(item.largeur);
            addLink(item.ouverture, item.largeur, 'largeur');
          }
          if (item.hauteur) {
            addNode(item.hauteur);
            addLink(item.ouverture, item.hauteur, 'hauteur');
          }

          break;
  
        case 'Ouvertures et elements associes':
          addNode(item.opening);
          addNode(item.associated_element);
          addLink(item.opening, item.associated_element, 'élément associé');
  
          if (item.opening_type) {
            addNode(item.opening_type);
            addLink(item.opening, item.opening_type, "type d'ouverture");
          }
          if (item.element_type) {
            addNode(item.element_type);
            addLink(item.associated_element, item.element_type, "type d'élément");
          }
          break;
  
        case 'Garde-corps':
          addNode(item.gardeCorps);
          if (item.objectType) {
            addNode(item.objectType);
            addLink(item.gardeCorps, item.objectType, 'type');
          }
          if (item.reference) {
            addNode(item.reference);
            addLink(item.gardeCorps, item.reference, 'référence');
          }
          if (item.Hauteur) {
            addNode(item.Hauteur);
            addLink(item.gardeCorps, item.Hauteur, 'hauteur');
          }
          if (item.material) {
            addNode(item.material);
            addLink(item.gardeCorps, item.material, 'matériau');
          }
          if (item.associeA) {
            addNode(item.associeA);
            addLink(item.gardeCorps, item.associeA, 'contenu dans');
            if (item.nom) {
              addNode(item.nom);
              addLink(item.associeA, item.nom, 'nom');
            }
          }
          break;
  
        case 'Dalles':
          addNode(item.slab);
          if (item.slabName) {
            addNode(item.slabName);
            addLink(item.slab, item.slabName, 'nom');
          }
          break;
  
        case 'Murs':
          addNode(item.wall);
          if (item.id) {
            addNode(item.id);
            addLink(item.wall, item.id, 'identifiant');
          }
          break;
  
        case 'Toitures':
          addNode(item.roof);
          if (item.roofName) {
            addNode(item.roofName);
            addLink(item.roof, item.roofName, 'nom');
          }
          break;
  
        case 'Toitures avec trémies':
          addNode(item.Trémie);
          addNode(item.slab);
          addNode(item.Slab_typeLabel);
          addLink(item.slab, item.Trémie, 'contient trémie');
          addLink(item.slab, item.Slab_typeLabel, 'type');
          break;
  
        case 'Toitures avec garde-corps':
          addNode(item.roof);
          addNode(item.railing);
          if (item.roofName) {
            addNode(item.roofName);
            addLink(item.roof, item.roofName, 'nom');
          }
          addLink(item.roof, item.railing, 'a garde-corps');
          break;
  
        case 'Trémies > 80cm':
          addNode(item.opening);
          if (item.width) {
            addNode(item.width);
            addLink(item.opening, item.width, 'largeur');
          }
          if (item.height) {
            addNode(item.height);
            addLink(item.opening, item.height, 'hauteur');
          }
          break;
  
        default:
          // fallback générique
          const baseId = item.id || JSON.stringify(item);
          addNode(baseId);
          Object.entries(item).forEach(([k, v]) => {
            if (typeof v === 'string') {
              addNode(v);
              addLink(baseId, v, k);
            }
          });
      }
    });
  
    return {
      nodes: Array.from(nodes.values()),
      links,
    };
  };
  
//---------------------------------------------
  const displayed = results.filter(r =>
    Object.values(r).some(val => typeof val === 'string' && val.toLowerCase().includes(filter.toLowerCase()))
  );

    return (
      <div className="w-full max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Vérification des exigences
        </h2>

        <div className="flex justify-center space-x-2">
          <button
            title="Table"
            onClick={() => setMode('table')}
            className={`p-2 rounded ${mode === 'table' ? 'bg-[#483EA8] text-white' : 'bg-gray-100'}`}>
            <Table size={20} />
          </button>

          <button
            title="Graphique"
            onClick={() => setMode('graph')}
            className={`p-2 rounded ${mode === 'graph' ? 'bg-[#483EA8] text-white' : 'bg-gray-100'}`}>
            <GitBranch size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={rule}
            onChange={e => setRule(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2">
            <option value="" disabled>Choisissez une exigence…</option>
            {rules.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          
          <button
            disabled={!rule}
            onClick={handleExecute}
            className="bg-[#483EA8] hover:bg-[#3B3690] text-white font-semibold px-6 py-2 rounded disabled:opacity-50"
          >
            EXÉCUTER
          </button>
        </div>
        
        <div className="flex justify-between items-center">
    {loading ? (
      <div className="flex items-center gap-2 text-gray-600 italic">
        …chargement…
      </div>

    ) : hasExecuted ? (
      <span className="text-gray-700 italic">
        {displayed.length}&nbsp;résultat
        {displayed.length !== 1 ? 's' : ''}
        {' '}trouvé
        {displayed.length !== 1 ? 's' : ''}
      </span>
    ) : null}

        <input
          type="text"
          placeholder="Filtrer les résultats"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {mode === 'table' ? (
        <div className="overflow-auto rounded shadow">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-4 py-2 capitalize">{col}</th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {displayed.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {columns.map(col => (
                    <td key={col} className="px-4 py-2 break-words">{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative h-[500px] w-full bg-gray-50 rounded shadow overflow-hidden">

          {results.length > 0 ? (
            <ForceGraph2D
              graphData={convertToGraphData(displayed,rule)}
              
              nodeRelSize={8} 
              nodeAutoColorBy="id"
              linkDirectionalArrowLength={6}
              linkDirectionalArrowRelPos={1}
              nodeCanvasObjectMode={() => 'after'}
              nodeCanvasObject={(node, ctx, gs) => {
                const size = 12 / gs;
                ctx.font = `${size}px Sans-Serif`;
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.name || node.id, node.x, node.y);
              }}
              linkCanvasObjectMode={() => 'after'}
              linkCanvasObject={(link, ctx, gs) => {
                if (!link.label) return;
                const x = (link.source.x + link.target.x) / 2;
                const y = (link.source.y + link.target.y) / 2;
                const size = 10 / gs;
                ctx.font = `${size}px Sans-Serif`;
                ctx.fillStyle = 'gray';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(link.label, x, y - 4);
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              Graphique à venir…
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/security')}
          className="text-[#483EA8] hover:underline"
        >
          Voir les résultats des vérifications
        </button>
        <button
          onClick={() => navigate('/report', {
            state: { rule, results }
          })}
              disabled={!hasExecuted}
              className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold px-4 py-2 rounded disabled:opacity-50"

        >
          VISUALISER LE RAPPORT
        </button>
      </div>
    </div>
  );
}
