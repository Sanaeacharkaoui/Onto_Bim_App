// src/pages/ConvertToRDF.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function ConvertToRDF() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const file = state?.file;

  const [status, setStatus] = useState('pending');       // 'pending' | 'success' | 'error'
  const [mergedBlob, setMergedBlob] = useState(null);
  const [progress, setProgress] = useState(0);
  const [waitMsg, setWaitMsg] = useState(false);         // Message supplémentaire si > 95% trop longtemps

  // Redirection si aucun fichier
  useEffect(() => {
    if (!file) navigate('/import', { replace: true });
  }, [file, navigate]);

  // Simule la progression de la barre de chargement
  useEffect(() => {
    if (status !== 'pending') return;

    const interval = setInterval(() => {
      setProgress(prev => (prev < 95 ? prev + 1 : prev));
    }, 120);

    const waitTimeout = setTimeout(() => {
      if (progress >= 95) setWaitMsg(true);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(waitTimeout);
    };
  }, [status, progress]);

  // Lancement du backend
  useEffect(() => {
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    fetch('http://127.0.0.1:8000/api/convert-ifc', {
      method: 'POST',
      body: form,
      headers: { Accept: 'application/rdf+xml' },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur conversion IFC: ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        setMergedBlob(blob);
        setProgress(100);
        setStatus('success');
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
      });
  }, [file]);

  // Téléchargement automatique dès que mergedBlob est prêt
  useEffect(() => {
    if (status === 'success' && mergedBlob) {
      const url = URL.createObjectURL(mergedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.rdf';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [status, mergedBlob]);

  // === Chargement ===
  if (status === 'pending') {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-6 text-center text-gray-900">
          Conversion en cours
        </h2>
        <p className="text-center text-gray-700 mb-4">
          Votre fichier est en cours de conversion. Veuillez patienter…
        </p>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-center text-gray-500 mt-2">{progress}%</p>
        {progress >= 95 && (
          <p className="text-xs text-center text-gray-400 italic mt-2 animate-pulse">
            Finalisation du traitement{waitMsg && '… Cela peut prendre quelques secondes supplémentaires'}
          </p>
        )}
      </div>
    );
  }

  // === Erreur ===
  if (status === 'error') {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-6 text-center text-red-600">
          Conversion échouée
        </h2>
        <p className="text-center text-gray-700 mb-6">
          Une erreur est survenue. Vérifiez votre fichier et réessayez.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // === SUCCESS ===
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-6 text-center text-gray-900">
        Conversion & fusion réussies
      </h2>
      <div className="flex justify-center mb-4">
        <CheckCircle2 size={48} className="text-green-500" />
      </div>
      <p className="text-center text-gray-800 mb-8">
        Votre modèle IFC a été converti en RDF et fusionné avec l’ontologie de sécurité.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/security', { state: { file: mergedBlob } })}
          className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-2 rounded-lg transition-shadow"
        >
          Vérifier les exigences de sécurité
        </button>
        <button
          onClick={() => navigate('/explore', { state: { file: mergedBlob } })}
          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 rounded-lg transition-shadow"
        >
          Explorer les données du modèle
        </button>
      </div>
    </div>
  );
}
