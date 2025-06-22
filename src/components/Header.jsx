import React from 'react';
import {
  ArrowLeft,
  Search,
  ChevronDown,
  UserCircle,
} from 'lucide-react'; // Icônes de la barre

// Composant Header = barre du haut de l'interface
export default function Header({ title = 'Accueil' }) {
  return (
    <header className="flex items-center justify-between h-16 bg-[rgba(103,103,103,0.54)] px-8">
      {/* Partie gauche : flèche de retour + titre */}
      <div className="flex items-center space-x-4">
        <button>
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-medium text-gray-800">{title}</h1>
      </div>

      {/* Centre : champ de recherche */}
      <div className="flex-1 flex justify-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-80 h-10 bg-white border border-gray-200 rounded-full px-4 pr-10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Icône recherche intégrée dans le champ */}
          <Search
            size={16}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Partie droite : utilisateur + flèche */}
      <div className="flex items-center space-x-2">
        <UserCircle size={55.04} style={{ color: 'var(--md-sys-on-surface-variant)' }} />
        <ChevronDown size={16} className="text-gray-500" />
      </div>
    </header>
  );
}
