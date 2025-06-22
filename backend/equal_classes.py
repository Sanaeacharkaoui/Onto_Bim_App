from rdflib import Graph, Namespace, OWL

# 1) Chargez le graphe fusionné
g = Graph()
g.parse("temp_Test1_merged.rdf", format="application/rdf+xml")

# 2) Déclarez vos namespaces
SEC = Namespace("http://www.semanticweb.org/feriel.moalla/ontologies/2024/1/untitled-ontology-21/")
IFC = Namespace("http://ifcowl.openbimstandards.org/IFC2X3_TC1#")

# 3) Affichez chaque équivalence
print("Classes communes (owl:equivalentClass) :")
for subj, obj in g.subject_objects(OWL.equivalentClass):
    # on ôte le préfixe pour ne garder que le local-name
    sec_class = str(subj).replace(str(SEC), "")
    ifc_class = str(obj).replace(str(IFC), "")
    print(f"  • {sec_class}  <=>  {ifc_class}")
