# backend/test_graphdb_query.py

from SPARQLWrapper import SPARQLWrapper, JSON

# Adresse du dépôt GraphDB (le nom doit être exact)
sparql = SPARQLWrapper("http://localhost:7200/repositories/my_ontology")

# Exemple de requête : chercher les trémies
sparql.setQuery("""
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX ifc: <http://ifcowl.openbimstandards.org/IFC2X3_TC1#>

    SELECT ?opening
    WHERE {
        ?opening rdf:type ifc:IfcOpeningElement .
    }
""")

# Format de réponse
sparql.setReturnFormat(JSON)

# Lancer la requête et afficher les résultats
try:
    results = sparql.query().convert()
    print("\n🔍 Résultats SPARQL :")
    for result in results["results"]["bindings"]:
        print("➡️", result["opening"]["value"])
except Exception as e:
    print("❌ Erreur :", e)
