from fastapi import APIRouter, HTTPException
from SPARQLWrapper import SPARQLWrapper, JSON

router = APIRouter()

# Adresse du dépôt GraphDB
GRAPHDB_URL = "http://localhost:7200/repositories/my_ontology"

# Dictionnaire des requêtes SPARQL
SPARQL_QUERIES = {
    "Ouvertures": """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>
        SELECT ?opening WHERE {
            ?opening rdf:type ifc:IfcOpeningElement .
        }
    """,

    "Elements et proprietes": """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>
        SELECT ?ouverture ?type ?largeur ?hauteur WHERE {
            ?ouverture rdf:type ?type .
            FILTER(?type = ifc:IfcWindow || ?type = ifc:IfcDoor)
            OPTIONAL { ?ouverture ifc:OverallWidth ?largeur . }
            OPTIONAL { ?ouverture ifc:OverallHeight ?hauteur . }
        }
    """,

    "Ouvertures et elements associes": """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>
        SELECT ?opening ?opening_type ?associated_element ?element_type WHERE {
            ?opening rdf:type ifc:IfcOpeningElement .
            OPTIONAL { ?opening rdf:type ?opening_type . }
            ?rel rdf:type ifc:IfcRelVoidsElement .
            ?rel ifc:RelatedOpeningElement ?opening .
            ?rel ifc:RelatingBuildingElement ?associated_element .
            ?associated_element rdf:type ?element_type .
            FILTER(?element_type IN (
                ifc:IfcWall, ifc:IfcWallStandardCase,
                ifc:IfcSlab, ifc:IfcRoof
            ))
        }
    """,

    "Dalles": """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>
        SELECT ?slab ?slabName WHERE {
            ?slab rdf:type ifc:IfcSlab .
            OPTIONAL { ?slab ifc:Name ?slabName . }
        }
    """,

    "Murs": """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>
        SELECT ?wall ?id WHERE {
            { ?wall rdf:type ifc:IfcWall . }
            UNION
            { ?wall rdf:type ifc:IfcWallStandardCase . }
            OPTIONAL { ?wall ifc:id ?id . }
        }
    """,

    "Garde-corps": """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>
        SELECT ?railing WHERE {
            ?railing rdf:type ifc:IfcRailing .
        }
    """,

    "Toitures": """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>
        SELECT ?roof ?roofName WHERE {
            ?roof rdf:type ifc:IfcRoof .
            OPTIONAL { ?roof ifc:Name ?roofName . }
        }
    """,

    "Toitures avec trémies": """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>
        SELECT ?roof ?roofName ?opening WHERE {
            ?opening rdf:type ifc:IfcOpeningElement .
            ?opening ifc:hasOpening ?roof .
            ?roof rdf:type ifc:IfcRoof .
            OPTIONAL { ?roof ifc:Name ?roofName . }
        }
    """,

    "Toitures avec garde-corps": """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>
        SELECT ?roof ?roofName ?railing WHERE {
            ?railing rdf:type ifc:IfcRailing .
            ?railing ifc:containedIn ?roof .
            ?roof rdf:type ifc:IfcRoof .
            OPTIONAL { ?roof ifc:Name ?roofName . }
        }
    """,

    "Trémies > 80cm": """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT ?opening ?width ?height WHERE {
            ?opening rdf:type ifc:IfcOpeningElement .
            OPTIONAL { ?opening ifc:OverallWidth ?width . }
            OPTIONAL { ?opening ifc:OverallHeight ?height . }
            FILTER(
                xsd:float(?width) >= 0.8 &&
                xsd:float(?height) >= 0.8
            )
        }
    """,
}

@router.get("/api/check-requirements")
def check_requirements(rule: str):
    if rule not in SPARQL_QUERIES:
        raise HTTPException(status_code=400, detail=f"Règle inconnue : {rule}")

    sparql = SPARQLWrapper(GRAPHDB_URL)
    sparql.setQuery(SPARQL_QUERIES[rule])
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        output = []
        for result in results["results"]["bindings"]:
            entry = {key: val["value"] for key, val in result.items()}
            output.append(entry)
        return output
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur SPARQL : {e}")
