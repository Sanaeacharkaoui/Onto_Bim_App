// src/utils/reportGenerator.js

export function generateReport(rule, results) {
  const now = new Date().toLocaleString();

  const base = {
    date: now,
    total: results.length,
  };

  switch (rule) {
    case 'Toitures avec trémies':
      return {
        ...base,
        title: 'Présence de trémies dans les toitures',
        description: 'Vérifie si des trémies sont présentes dans les toitures du bâtiment.',
        passed: results.length > 0,
        details: results.length > 0
          ? results.map(r => ({
              status: 'success',
              message: `✅ Trémie trouvée : ${r.Trémie} associée à ${r.slab} (${r.Slab_typeLabel})`
            }))
          : [{
              status: 'warning',
              message: '⚠️ Aucune trémie détectée dans les toitures. Ajoutez-les si nécessaire.'
            }]
      };
      case 'Elements et proprietes':
        return {
          ...base,  
          title: 'Ouvertures et leurs dimensions',
          description: 'Affiche les portes et fenêtres, accompagnées de leur hauteur et largeur.',
          passed: results.length > 0,
          details: results.map((r) => ({
            status: 'success',
            message: `🚪 ${r.type?.split('#').pop()} ${r.ouverture} - largeur: ${r.largeur || 'N/A'} - hauteur: ${r.hauteur || 'N/A'}`
          }))
        };
  
    case 'Garde-corps':
      return {
        ...base,
        title: 'Analyse des garde-corps',
        description: 'Vérifie que chaque garde-corps a des attributs complets.',
        passed: results.every(r => r.Hauteur),
        details: results.length > 0
          ? results.map(r => ({
              status: r.Hauteur ? 'success' : 'warning',
              message: r.Hauteur
                ? `🟢 Garde-corps ${r.gardeCorps} a une hauteur de ${r.Hauteur}`
                : `⚠️ Garde-corps ${r.gardeCorps} n’a pas de hauteur définie`
            }))
          : [{
              status: 'error',
              message: '❌ Aucun garde-corps trouvé dans le modèle.'
            }]
      };

    case 'Trémies > 80cm':
      return {
        ...base,
        title: 'Contrôle des trémies dangereuses',
        description: 'Détecte les trémies de grande taille (≥ 80 cm) pouvant poser un risque.',
        passed: results.length === 0, // ✅ Conforme si aucune trémie large
        details: results.length > 0
          ? results.map(r => ({
              status: 'error',
              message: `❌ Trémie dangereuse détectée : ${r.opening} (${r.width} x ${r.height})`
            }))
          : [{
              status: 'success',
              message: '✅ Aucune trémie ≥ 80cm détectée. Le modèle respecte la consigne.'
            }]
      };

    case 'Toitures avec garde-corps':
      return {
        ...base,
        title: 'Vérification des garde-corps sur les toitures',
        description: 'Vérifie si les toitures sont protégées par des garde-corps.',
        passed: results.length > 0,
        details: results.length > 0
          ? results.map(r => ({
              status: 'success',
              message: `✅ Garde-corps ${r.railing} présent sur la toiture ${r.roofName || r.roof}`
            }))
          : [{
              status: 'error',
              message: '❌ Aucune toiture n’a de garde-corps. Cela représente un risque de chute.'
            }]
      };

    case 'Ouvertures':
      return {
        ...base,
        title: 'Vérification des ouvertures',
        description: 'Liste les ouvertures détectées dans le modèle.',
        passed: results.length > 0,
        details: results.map(r => ({
          status: 'info',
          message: `🔍 Ouverture trouvée : ${r.opening}`
        }))
      };

      case 'Ouvertures et elements associes':
    return {
    ...base,
    title: 'Ouvertures et éléments associés',
    description: 'Vérifie les ouvertures présentes dans le modèle BIM et leurs éléments associés.',
    passed: results.length > 0,
    details: results.map(r => {
      const openingId = r.opening?.split('_').pop();
      const elementId = r.associated_element?.split('_').pop();
      const openingType = r.opening_type?.split('#').pop();
      const elementType = r.element_type?.split('#').pop();

      return {
        status: 'success',
        message: `✅ Ouverture **${openingType}** (ID: ${openingId}) associée à l’élément **${elementType}** (ID: ${elementId})`
      };
    })
  };
case 'Dalles':
  return {
    ...base,
    title: 'Liste des dalles détectées',
    description: 'Affiche les dalles présentes dans le modèle BIM, avec leurs noms et identifiants.',
    passed: results.length > 0,
    details: results.map(r => {
      const slabId = r.slab?.split('_').pop(); // extrait juste le numéro de l'URI
      const slabName = r.slabName || 'Nom inconnu';

      return {
        status: 'success',
        message: `🧱 Dalle **${slabName}** (ID: ${slabId})`
      };
    })
  };
  case 'Murs':
  return {
    ...base,
    title: 'Liste des murs détectés',
    description: 'Affiche les murs présents dans le modèle avec leurs identifiants uniques.',
    passed: results.length > 0,
    details: results.map(r => {
      const id = r.id || r.wall?.split('_').pop(); // id explicite ou extrait de l'URI
      return {
        status: 'success',
        message: `🧱 Mur détecté : ID ${id}`
      };
    })
  };
case 'Toitures':
  return {
    ...base,
    title: 'Liste des toitures détectées',
    description: 'Affiche les toitures présentes dans le modèle BIM avec leurs noms et identifiants.',
    passed: results.length > 0,
    details: results.map(r => {
      const roofId = r.roof?.split('_').pop();
      const roofName = r.roofName || 'Nom inconnu';
      return {
        status: 'success',
        message: `🏠 Toiture **${roofName}** (ID: ${roofId})`
      };
    })
  };
      

    default:
      return {
        ...base,
        title: `Rapport générique - ${rule}`,
        description: 'Résultats sans traitement personnalisé.',
        passed: results.length > 0,
        details: results.length > 0
          ? results.map((r, i) => ({
              status: 'info',
              message: JSON.stringify(r, null, 2)
            }))
          : [{
              status: 'warning',
              message: 'ℹ️ Aucune donnée détectée. Aucun traitement personnalisé défini.'
            }]
      };
  }
}
