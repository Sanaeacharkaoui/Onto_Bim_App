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
    { id: 'Elements et proprietes', label: '🚪Identifier les portes et les fenêtres avec leurs dimensions' },
    { id: 'Ouvertures et elements associes', label: '🔗 Chercher les ouvertures et les éléments associés' },
    { id: 'Dalles', label: '🧱 Lister les dalles ' },
    { id: 'Murs', label: '🏗 Lister les murs ' },
    { id: 'Garde-corps', label: '🛡 Lister les garde-corps' },
    { id: 'Toitures', label: '🏠 Lister les toitures ' },
    { id: 'Toitures avec trémies', label: '🏠 Toitures contenant des trémies' },
    { id: 'Toitures avec garde-corps', label: '🛡 Toitures contenant des garde-corps' },
    { id: 'Trémies > 80cm', label: '📏 Trémies ≥ 80cm x 80cm' },
  ];

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
      if (!id || typeof id !== "string") return;
      const name = label || id.split(/[#/]/).pop();
      nodes.set(id, { id, name });
    };
  
    const addLink = (source, target, label) => {
      if (nodes.has(source) && nodes.has(target)) {
        links.push({ source, target, label });
      }
    };
  
    data.forEach((item) => {
      if (rule === "Ouvertures et elements associes") {
        const { opening, associated_element, opening_type, element_type } = item;
        addNode(opening);
        addNode(associated_element);
        addLink(opening, associated_element, "élément associé");
  
        if (opening_type) {
          addNode(opening_type);
          addLink(opening, opening_type, "type d'ouverture");
        }
  
        if (element_type) {
          addNode(element_type);
          addLink(associated_element, element_type, "type d'élément");
        }
  
      } else if (rule === "Garde-corps") {
        const { gardeCorps, objectType, reference, Hauteur, material, associeA, nom } = item;
        addNode(gardeCorps);
  
        if (objectType) addNode(objectType);
        if (reference) addNode(reference);
        if (Hauteur) addNode(Hauteur, `Hauteur: ${Hauteur}`);
        if (material) addNode(material);
        if (associeA) addNode(associeA);
        if (nom) addNode(nom, nom);
  
        if (objectType) addLink(gardeCorps, objectType, "type");
        if (reference) addLink(gardeCorps, reference, "référence");
        if (Hauteur) addLink(gardeCorps, Hauteur, "hauteur");
        if (material) addLink(gardeCorps, material, "matériau");
        if (associeA) addLink(gardeCorps, associeA, "associé à");
        if (associeA && nom) addLink(associeA, nom, "nom");
      }
  
      // D'autres règles...
    });
  
    return {
      nodes: Array.from(nodes.values()),
      links,
    };
  };
  
  

 
  

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
          className={`p-2 rounded ${mode === 'table' ? 'bg-[#483EA8] text-white' : 'bg-gray-100'}`}
        >
          <Table size={20} />
        </button>
        <button
          title="Graphique"
          onClick={() => setMode('graph')}
          className={`p-2 rounded ${mode === 'graph' ? 'bg-[#483EA8] text-white' : 'bg-gray-100'}`}
        >
          <GitBranch size={20} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={rule}
          onChange={e => setRule(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
        >
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
            <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Chargement en cours…
          </div>
        ) : hasExecuted && displayed.length === 0 ? (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded border border-red-300 italic">
            🚨 Aucun élément trouvé. Vérifiez si la règle est respectée ou si les données sont incomplètes.
          </div>
        ) : (
          <span>{displayed.length} résultats trouvés</span>
        )}
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
        <div className="h-[500px] bg-gray-50 rounded shadow">
          {results.length > 0 ? (
            <ForceGraph2D
graphData={convertToGraphData(displayed, rule)}
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
          className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold px-4 py-2 rounded"
        >
          VISUALISER LE RAPPORT
        </button>
      </div>
    </div>
  );
}
