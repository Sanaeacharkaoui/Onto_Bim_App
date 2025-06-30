/*sidebar.jsxt*/

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';  // <- on importe useNavigate et useLocation
import {
  Home,
  ShieldCheck,
  FileText,
  CheckCircle,
  Settings2,
  FolderSearch,
} from 'lucide-react'; // Icônes
import { ReactComponent as Logo } from '../assets/logo.svg'; // Ton logo personnalisé

// Composant Sidebar = menu vertical à gauche
export function Sidebar({ activeIndex = 0 }) {
  const navigate = useNavigate();           // Hook pour naviguer
  const { pathname, state } = useLocation();       // Hook pour lire l'URL actuelle

  // Liste des onglets du menu avec leur label, icône et route associée
  const menu = [
    { label: 'Accueil', Icon: Home,       path: '/'         },
    { label: 'Convertir en modèle de vérification', Icon: Settings2, path: '/convert' },
    { label: 'Vérifier les exigences de sécurité',  Icon: ShieldCheck,  path: '/security' },
    { label: 'Résultats des vérifications',          Icon: CheckCircle,   path: '/results'  },
    { label: 'Visualiser le Rapport',                Icon: FileText,      path: '/report'   },
    { label: 'Explorez',                             Icon: FolderSearch,  path: '/explore'  },
  ];

  // On recalculera activeIndex automatiquement si on le souhaite
  // (sinon vous pouvez le passer depuis MainLayout)
  // let activeIndex = 0; // si vous préférez overridez via prop

  return (
    <aside className="w-64 bg-[rgba(103,103,103,0.54)] h-screen px-6 py-8 flex flex-col">
      {/* Logo positionné en haut */}
      <div className="flex items-center mb-6 mt-[-10px] ml-[-10px]">
        <Logo className="w-[140px] h-[45px]" />
      </div>

      {/* Affichage des boutons du menu */}
      <nav className="flex-1">
        {menu.map((item, idx) => {
  const isActive = idx === activeIndex;        // Détecte si l'onglet est actif
  const isDone   = idx <  activeIndex;         // Détecte s'il est "terminé" (avant l'actif)
  const isLocked = idx >  activeIndex;         // Détecte s'il est "verrouillé" (après l'actif)
  // Couleurs :
  // - actif    → icône + texte blanc
  // - done     → icône et texte noirs
  // - locked   → icône + texte gris light
  const color = isActive
     ? '#FFFFFF'
    : isDone
      ? 'rgba(0,0,0,0.8)'
      : 'rgba(9,9,10,0.5)';

          // Agrandir visuellement certaines icônes qui paraissent petites
          const isSmallIcon =
            item.label === 'Convertir en modèle de vérification' ||
            item.label === 'Vérifier les exigences de sécurité';

          return (
            <button
              key={item.label}
              // 1) On désactive uniquement les onglets verrouillés
              disabled={isLocked}
              // 2) On navigue sur click si ce n'est pas verrouillé
              onClick={() => {
                if (!isLocked) navigate(item.path);
              }}
              className={`
                flex items-center w-full px-4 py-3 mb-[30px] rounded-lg transition-colors focus:outline-none
                 ${isActive
         ? 'bg-[rgba(96,90,90,0.6)]'       /* fond violet fris actif */
         : isDone
           ?  ''                   /* fond gris onglets précédents */
           : 'opacity-50 pointer-events-none' /* fond gris clair + désactivé */
       }
              `}
            >
              {/* Affichage de l'icône */}
              <item.Icon
                size={20}
                color={color}
                className={isSmallIcon ? 'scale-[1.25]' : ''}
              />

              {/* Texte de l'onglet */}
              <span
                className={`ml-3 text-sm leading-tight ${
                  isActive
           ? 'text-white font-bold'      /* actif = blanc bold */
           : isDone
             ? 'text-gray-900 font-medium' /* done = noir medium */
             : 'text-[rgba(9,9,10,0.5)]'   /* locked = gris light */
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
