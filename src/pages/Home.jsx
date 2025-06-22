import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  // Récupère la fonction pour naviguer entre les routes
  const navigate = useNavigate();

  return (
    // Conteneur principal centré verticalement et horizontalement
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      {/* Titre d’accueil */}
      <h2 className="text-xl font-medium text-gray-900">
        Bienvenue sur l’outil de vérification des exigences de sécurité 
      </h2>

      {/* Bouton qui redirige vers la page d’import */}
      <button
        onClick={() => navigate('/import')}
        className="bg-[#483EA8] hover:bg-[#3B3690] text-white font-bold px-12 py-3 rounded-md transition-shadow"
      >
        COMMENCER
      </button>
    </div>
  );
}
