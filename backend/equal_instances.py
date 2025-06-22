# equal_instances.py
from rdflib import Graph, Namespace
from rdflib.namespace import RDF, OWL

# 1) Chargez le graphe fusionné
g = Graph()
g.parse("temp_Test1_merged.rdf", format="application/rdf+xml")

# 2) Déclarez vos namespaces
SEC = Namespace("http://www.semanticweb.org/feriel.moalla/ontologies/2024/1/untitled-ontology-21/")
IFC = Namespace("http://ifcowl.openbimstandards.org/IFC2X3_TC1#")

# 3) Pour chaque equivalentClass, listez les instances typées
print("Instances IFC typées selon la sécurité (10 attendues) :")
for sec_cls, ifc_cls in g.subject_objects(OWL.equivalentClass):
    for inst in g.subjects(RDF.type, ifc_cls):
        print("  ", inst)
