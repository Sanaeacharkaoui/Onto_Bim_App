import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { CloudUpload } from 'lucide-react';

/**
 * ImportI FC Component
 * gère un wizard en 4 étapes pour importer un fichier IFC:
 * 1) Sélection de fichier
 * 2) Erreur de format
 * 3) Simulation de progression
 * 4) Confirmation de succès + navigation vers conversion
 */
export default function ImportIFC() {
  const navigate = useNavigate(); // Hook pour changer de route

  // --- États internes ---
  const [step, setStep] = useState(1);      // numéro d'étape (1 à 4)
  const [file, setFile] = useState(null);   // objet File sélectionné
  const [error, setError] = useState('');   // message d'erreur si format incorrect
  const [progress, setProgress] = useState(0); // pourcentage de progression simulée

  // --- Configuration de la dropzone ---
  const {
    getRootProps,   // props à étaler sur le container de drop
    getInputProps,  // props à étaler sur l'input file (invisible)
    isDragActive,   // true si un fichier est en train d'être glissé au-dessus
    open,           // fonction qui lance manuellement la fenêtre de sélection
  } = useDropzone({
    onDrop: useCallback((accepted, rejected) => {
      // 1) Si un fichier non-IFC est déposé, on passe à l'étape d'erreur
      if (rejected.length) {
        setError('Seuls les fichiers IFC sont acceptés. Veuillez importer un autre au bon format.');
        setStep(2);
        return;
      }
      // 2) Fichier accepté, on stocke l'objet et on démarre la progression
      const f = accepted[0];
      setFile(f);
      setError('');
      setStep(3);
      setProgress(0);

      // 3) Simule la progression toutes les 300ms jusqu'à 100%
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            if (f.size === 0) {
              setError("Le fichier est vide. Veuillez importer un fichier IFC valide.");
              setStep(2);
            } else {
              setStep(4);
            }
            
           
            return 100;
          }
          return p + 20;
        });
      }, 300);
    }, []),
    accept: { 'application/octet-stream': ['.ifc'] },
    maxFiles: 1,
    multiple: false,
    noClick: true,    // empêche l'ouverture automatique lors d'un clic sur la zone
    noKeyboard: true, // empêche l'ouverture avec la touche Enter sur la zone
  });

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">

      {/* --- Étape 1 : Sélection du fichier --- */}
      {step === 1 && (
        <>  {/* Fragment car plusieurs éléments */}
          <h2 className="text-lg font-semibold mb-6 text-center text-gray-900">
            Importez votre maquette BIM pour commencer
          </h2>

          {/* Zone de drop */}
          <div
            {...getRootProps()}  // étale getRootProps() ici
            className={
              `border-2 border-dashed border-[#483EA8]
               rounded-xl h-48 flex flex-col items-center justify-center mb-6
               cursor-pointer transition-colors
               ${isDragActive ? 'bg-[#F0F0FF]' : 'bg-white'}`
            }
          >
            <input {...getInputProps()} />  {/* input file caché */}
            <CloudUpload size={48} className="text-[#483EA8] mb-2" />
            <p className="text-sm text-gray-600 text-center">
              Glissez-déposez un fichier IFC<br />
              <span className="italic text-gray-500">(.IFC uniquement)</span>
            </p>
          </div>

          {/* Bouton pour ouvrir la fenêtre de sélection manuellement */}
          <button
            onClick={open} // lance open() fourni par useDropzone
            className="w-full bg-[#483EA8] hover:bg-[#3B3690]
                       text-white font-semibold py-3 rounded-lg
                       transition-shadow"
          >
            IMPORTER UN FICHIER
          </button>
        </>
      )}

      {/* --- Étape 2 : Erreur de format --- */}
      {step === 2 && (
        <>
          {/* Même UI qu'à l'étape 1 pour pouvoir retenter de déposer */}
          <h2 className="text-lg font-semibold mb-6 text-center text-gray-900">
            Erreur d'import
          </h2>
          <div
            {...getRootProps()}
            className={
              `border-2 border-dashed border-[#483EA8]
               rounded-xl h-48 flex flex-col items-center justify-center mb-6
               cursor-pointer transition-colors
               ${isDragActive ? 'bg-[#F0F0FF]' : 'bg-white'}`
            }
          >
            <input {...getInputProps()} />
            <CloudUpload size={48} className="text-[#483EA8] mb-2" />
            <p className="text-sm text-gray-600 text-center">
              Glissez-déposez un fichier IFC<br />
              <span className="italic text-gray-500">(.IFC uniquement)</span>
            </p>
          </div>
          <button
            onClick={open}
            className="w-full bg-[#483EA8] hover:bg-[#3B3690]
                       text-white font-semibold py-3 rounded-lg mb-2 transition-shadow"
          >
            IMPORTER UN FICHIER
          </button>
          {/* Affichage du message d'erreur sous le bouton */}
          <p className="text-red-500 text-sm text-center">
            ⚠ {error}
          </p>
        </>
      )}

      {/* --- Étape 3 : Simulation de progression --- */}
      {step === 3 && (
        <>
          <h2 className="text-lg font-semibold mb-4 text-center text-gray-900">
            Importation en cours…
          </h2>
          {/* Affiche le nom du fichier */}
          <p className="mb-4 text-gray-700 text-center">{file.name}</p>
          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-[#483EA8] h-2 rounded-full"
              style={{ width: `${progress}%` }} // style inline pour la largeur
            />
          </div>
          <p className="text-sm text-gray-600 text-center">{progress}%</p>
          <button
            disabled
            className="w-full bg-[#483EA8] text-white font-semibold py-3 rounded-lg opacity-50 cursor-not-allowed"
          >
            CONVERTIR EN MODÈLE DE VÉRIFICATION
          </button>
        </>
      )}

      {/* --- Étape 4 : Succès --- */}
      {step === 4 && (
        <>
          <h2 className="text-lg font-semibold mb-4 text-center text-green-600">
            Importation réussie
          </h2>
          <p className="mb-6 text-gray-800 text-center">
            Fichier importé : <strong>{file.name}</strong>
          </p>
          {/* Bouton final pour passer à la conversion */}
          <button
            onClick={() => navigate('/convert', { state: { file } })}
            className="w-full bg-[#483EA8] hover:bg-[#3B3690]
                       text-white font-semibold py-3 rounded-lg
                       transition-shadow"
          >
            CONVERTIR EN MODÈLE DE VÉRIFICATION
          </button>
        </>
      )}
    </div>
  );
}
