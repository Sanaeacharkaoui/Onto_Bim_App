OntoBIM App:

Une application web pour convertir une maquette IFC en RDF, la fusionner avec une ontologie métier, puis exécuter des vérifications de règles de sécurité via SPARQL.

⚙️ Prérequis:

Node.js (v16+) et npm (installés ensemble) — https://nodejs.org

Python (v3.10+) et pip — https://python.org

GraphDB (version gratuite) avec un dépôt nommé my_ontology :
http://localhost:7200/repositories/my_ontology

📥 Récupération du code source:

Téléchargement ZIP:

Sur GitHub, cliquez sur Code ▾ → Download ZIP

Décompressez l’archive

Ouvrez un terminal dans l'IDE et accédez au dossier extrait :

cd /chemin/vers/onto-bim-app

🚀 Installation des dépendances:

Backend (FastAPI + Python)

cd backend
# Créez et activez un virtualenv
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows
.venv\Scripts\activate

# Installez les librairies Python
pip install -r requirements.txt   # installe les dépendances Python

Frontend (React + npm)

cd frontend
npm install       # installe les dépendances JS

▶️ Lancer l’application:

1. Démarrer GraphDB

Veillez à ce que GraphDB soit actif sur localhost:7200

2. Lancer le backend

cd backend
uvicorn server:app --reload --host 127.0.0.1 --port 8000


3. Lancer le frontend

cd onto-bim-app
npm start

Application disponible sur : http://localhost:3000

📂 Structure du projet:

onto-bim-app/
├── backend/                  # FastAPI + scripts de conversion et fusion
│   ├── converter.py
│   ├── merged.py
│   ├── requirements.txt
│   └── server.py
│
├── frontend/                 # React + composants + pages
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
├── ontologie.ttl             # Ontologie métier (Turtle)
└── README.md

🔗 Endpoints exposés:

POST /api/convert-ifc : conversion IFC → RDF fusionné (merged.rdf)

GET /api/check-requirements?rule=<Règle> : exécution SPARQL 

🔧 Workflow rapide:

Importer un fichier .ifc

Conversion + fusion ontologie

Télécharger automatiquement merged.rdf

Charger ce RDF dans GraphDB

Sélectionner une règle et cliquer «EXÉCUTER»

Afficher les résultats (tableau ou graphe)

Générer et consulter le rapport

Questions 

Pourquoi installer Node.js ? npm (gestionnaire de paquets) est inclus avec Node.js pour lancer et gérer le frontend.

Faut-il relancer npm install ou pip install à chaque redémarrage ? Non, seulement lorsqu’on télécharge pour la première fois, ou si package.json/requirements.txt change.

