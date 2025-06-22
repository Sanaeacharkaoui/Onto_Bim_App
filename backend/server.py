# server.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os

from converter import ifc_to_rdf
from merged import merge_ifc_and_ontology
from requirements import router as req_router


app = FastAPI()

# 1) CORS pour autoriser votre front (React en localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# inclure les endpoints de vérification
app.include_router(req_router)

# 2) Endpoint POST pour la conversion + fusion
@app.post("/api/convert-ifc")
async def convert_ifc_endpoint(file: UploadFile = File(...)):
    # Vérifier l’extension
    if not file.filename.lower().endswith(".ifc"):
        raise HTTPException(400, "Seuls les fichiers .ifc sont acceptés")

    # Chemins temporaires
    tmp_ifc    = f"temp_{file.filename}"
    tmp_rdf    = tmp_ifc.replace(".ifc", ".rdf")
    merged_rdf = tmp_ifc.replace(".ifc", "_merged.rdf")

    # 3) Sauvegarde du fichier IFC uploadé côté serveur
    with open(tmp_ifc, "wb") as f:
        contents = await file.read()
        f.write(contents)

    # 4) Conversion IFC → RDF/XML
    try:
        ifc_to_rdf(tmp_ifc, tmp_rdf)
    except Exception as e:
        raise HTTPException(500, f"Erreur de conversion IFC→RDF : {e}")

    # 5) Fusion avec l'ontologie métier (Turtle)
    try:
        merge_ifc_and_ontology(
            ifc_rdf_path=tmp_rdf,
            ontology_ttl_path="ontologie.ttl",  # chemin vers votre ontologie métier
            output_path=merged_rdf
        )
    except Exception as e:
        raise HTTPException(500, f"Erreur de fusion des graphes : {e}")

    # 6) Renvoi du RDF fusionné
    return FileResponse(
        path=merged_rdf,
        media_type="application/rdf+xml",
        filename=os.path.basename(merged_rdf)
    )
