  import React, { useEffect, useState, useRef } from 'react';
  import { useLocation } from 'react-router-dom';
  import * as $rdf from 'rdflib';
  import ForceGraph2D from 'react-force-graph-2d';
  import { LayoutGrid, Share2 } from 'lucide-react';

  export default function ExploreData() {
    const { state } = useLocation();
    const mergedBlob = state?.file;

    const [triplets, setTriplets]       = useState([]);
    const [filtered, setFiltered]       = useState([]);
    const [visibleCount, setVisibleCount] = useState(100);
    const [search, setSearch]           = useState('');
    const [view, setView]               = useState('table');
    const storeRef                      = useRef(null);
    const expandedRef                   = useRef(new Set());
    const fgRef                         = useRef();
    const [graphData, setGraphData]     = useState({ nodes: [], links: [] });

    // Pour fusionner nœuds de même label
    const seenLabelsRef = useRef(new Set());
    const labelToUriRef = useRef({});

    // Exclure les liens owl:equivalentClass redondants
    const shouldIncludeLink = (s, p, o) =>
      !(p.endsWith('equivalentClass') && s.split(/[#/]/).pop() === o.split(/[#/]/).pop());

    // Toujours récupérer l’URI sous forme de string
    const normalizeUri = x => {
      if (typeof x === 'string') return x;
      if (x && typeof x.id === 'string') return x.id;
      if (x && typeof x.value === 'string') return x.value;
      return String(x);
    };

    // Utilitaire pour passer d'une liste de triplets à nodes+links
    const buildGraph = tripletsList => {
      seenLabelsRef.current.clear();
      labelToUriRef.current = {};
      const nodes = [];
      const links = [];
      const seenLinks = new Set();

      function addNode(rawUri) {
        const uri = normalizeUri(rawUri);
        const label = uri.split(/[#/]/).pop();
        if (!seenLabelsRef.current.has(label)) {
          seenLabelsRef.current.add(label);
          labelToUriRef.current[label] = uri;
          nodes.push({ id: uri, name: label });
        }
      }

      tripletsList.forEach(({ subject, predicate, object }) => {
        const s = normalizeUri(subject);
        const o = normalizeUri(object);
        if (!shouldIncludeLink(s, predicate, o)) return;

        const predLabel = predicate.split(/[#/]/).pop();
        const key = `${s}->${o}::${predLabel}`;
        if (seenLinks.has(key)) return;
        seenLinks.add(key);

        addNode(s);
        addNode(o);

        // Utiliser toujours la chaîne string pour source/target
        links.push({
          source: labelToUriRef.current[s.split(/[#/]/).pop()],
          target: labelToUriRef.current[o.split(/[#/]/).pop()],
          label: predLabel
        });
      });

      return { nodes, links };
    };

    // Lecture et parse du RDF
    useEffect(() => {
      if (!mergedBlob) return;
      const reader = new FileReader();
      reader.onload = () => {
        const rdfXml = reader.result;
        const store = $rdf.graph();
        try {
          $rdf.parse(rdfXml, store, window.location.origin, 'application/rdf+xml');
        } catch (err) {
          console.error('Erreur parsing RDF/XML :', err);
          return;
        }
        storeRef.current = store;

        const all = store.statementsMatching().map(st => ({
          subject:   st.subject.value,
          predicate: st.predicate.value,
          object:    st.object.value
        }));
        console.log('📑 Total triplets chargés :', all.length);

        const ontology = all.filter(t =>
          t.subject.includes('feriel.moalla') ||
          t.predicate.includes('feriel.moalla') ||
          t.object.includes('feriel.moalla')
        );
        const rest = all.filter(t => !ontology.includes(t));
        const sorted = [...ontology, ...rest];

        setTriplets(sorted);
        setFiltered(sorted);
        setVisibleCount(100);

        const start = sorted.find(t =>
          t.subject.toLowerCase().includes('ifcbuildingelement')
        )?.subject;
        if (!start) return;

        const related = sorted.filter(t =>
          t.subject === start || t.object === start
        );
        setGraphData(buildGraph(related));
        expandedRef.current.clear();
      };
      reader.onerror = e => console.error('Erreur FileReader :', e);
      reader.readAsText(mergedBlob);
    }, [mergedBlob]);

    // Filtre par texte
    useEffect(() => {
      const q = search.toLowerCase();
      const res = triplets.filter(({ subject, predicate, object }) =>
        [subject, predicate, object].some(v => v.toLowerCase().includes(q))
      );
      setFiltered(res);
      setVisibleCount(100);
    }, [search, triplets]);

    const handleScroll = e => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setVisibleCount(v => Math.min(v + 100, filtered.length));
      }
    };

    // Double-clic → graphe autour
    const handleRowDoubleClick = subject => {
      const store = storeRef.current;
      if (!store) return;
      const out = store.statementsMatching($rdf.sym(subject), undefined, undefined);
      const inb = store.statementsMatching(undefined, undefined, $rdf.sym(subject));
      const rel = [...out, ...inb].map(st => ({
        subject: st.subject.value,
        predicate: st.predicate.value,
        object: st.object.value
      }));
      setFiltered(rel);
      setVisibleCount(100);
      setGraphData(buildGraph(rel));
      expandedRef.current.clear();
    };

    // Clic nœud → expansion
    const handleNodeClick = node => {
      if (!node.id.startsWith('http')) return;
      const store = storeRef.current;
      if (!store || expandedRef.current.has(node.id)) return;
      expandedRef.current.add(node.id);

      const out = store.statementsMatching($rdf.sym(node.id), undefined, undefined);
      const inb = store.statementsMatching(undefined, undefined, $rdf.sym(node.id));
      const rel = [...out, ...inb].map(st => ({
        subject: st.subject.value,
        predicate: st.predicate.value,
        object: st.object.value
      }));

      // On conserve les liens existants en string
      const existing = graphData.links.map(l => ({
        subject: l.source,
        predicate: l.label,
        object: l.target
      }));
      setGraphData(buildGraph([...existing, ...rel]));
    };

    if (!mergedBlob) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Aucun fichier chargé. Revenez à l’étape d’import.
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barre d’outils */}
        <div className="flex-none h-16 bg-white px-6 flex items-center space-x-4 shadow">
          <h1 className="flex-1 text-center text-xl font-semibold">
            Exploration des données du modèle
          </h1>
          <button
            onClick={() => setView('table')}
            className={`p-2 rounded ${view === 'table' ? 'bg-gray-200' : ''}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setView('graph')}
            className={`p-2 rounded ${view === 'graph' ? 'bg-gray-200' : ''}`}
          >
            <Share2 size={18} />
          </button>
          <input
            type="text"
            placeholder="Filtrer les résultats"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ml-4 px-3 py-2 border rounded w-64"
          />
        </div>

        {/* Contenu */}
        <div className="flex-1 p-6 bg-gray-50 overflow-hidden">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {view === 'table' ? (
              <div className="flex flex-col bg-white rounded-lg shadow overflow-hidden">
                <div className="sticky top-0 bg-gray-100 z-10">
                  <table className="w-full text-sm table-auto border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border">Sujet</th>
                        <th className="p-2 border">Prédicat</th>
                        <th className="p-2 border">Objet</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div
                  className="flex-1 max-h-[500px] overflow-y-auto"
                  onScroll={handleScroll}
                >
                  <table className="w-full text-sm table-auto border-collapse">
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-gray-500">
                            Aucun triplet à afficher.
                          </td>
                        </tr>
                      ) : (
                        filtered.slice(0, visibleCount).map((t, i) => (
                          <tr
                            key={i}
                            onDoubleClick={() => handleRowDoubleClick(t.subject)}
                            className="hover:bg-gray-50 cursor-pointer"
                          >
                            <td className="p-2 border break-words">
                              {t.subject}
                            </td>
                            <td className="p-2 border break-words">
                              {t.predicate}
                            </td>
                            <td className="p-2 border break-words">
                              {t.object}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-2 text-center text-gray-500 border-t">
                  Affichage des {Math.min(visibleCount, filtered.length)} premiers résultats sur {filtered.length}.
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
                <ForceGraph2D
                  ref={fgRef}
                  graphData={graphData}
                  nodeAutoColorBy="id"
                  linkDirectionalArrowLength={4}
                  linkDirectionalArrowRelPos={1}
                  onNodeClick={handleNodeClick}
                  nodeCanvasObjectMode={() => 'after'}
                  nodeCanvasObject={(node, ctx, gs) => {
                    const size = 12 / gs;
                    ctx.font = `${size}px Sans-Serif`;
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(node.name, node.x, node.y);
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
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
