# backend/merged.py

import os
from rdflib import Graph, Namespace, URIRef
from rdflib.namespace import OWL, RDF
from converter import ifc_to_rdf

# — Espaces de noms corrigés —
IFCOWL = Namespace("http://ifcowl.openbimstandards.org/IFC2X3_TC1#")
# Notez le slash final, pas de dièse ! 
SEC_NAMESPACE = "http://www.semanticweb.org/feriel.moalla/ontologies/2024/1/untitled-ontology-21/"
SEC           = Namespace(SEC_NAMESPACE)

def merge_ifc_and_ontology(ifc_rdf_path: str,
                           ontology_ttl_path: str = "ontologie.ttl",
                           output_path: str = "merged.rdf") -> None:
    """
    1) Charge votre RDF/XML issu de converter.ifc_to_rdf
    2) Charge l’ontologie sécurité (Turtle)
    3) Injecte owl:equivalentClass & rdf:type métier
    4) Sérialise le graphe fusionné en RDF/XML
    """
    # Vérification des fichiers
    if not os.path.isfile(ifc_rdf_path):
        raise FileNotFoundError(f"RDF introuvable : {ifc_rdf_path}")
    if not os.path.isfile(ontology_ttl_path):
        raise FileNotFoundError(f"Ontologie introuvable : {ontology_ttl_path}")

    # Lecture des graphes
    g = Graph()
    g.parse(ifc_rdf_path,    format="application/rdf+xml")
    g.parse(ontology_ttl_path, format="turtle")

    # Debug : lister les classes détectées
    sec_classes = [
        c for c in g.subjects(RDF.type, OWL.Class)
        if str(c).startswith(SEC_NAMESPACE)
    ]
    print(f"[DEBUG] Classes sécurité ({len(sec_classes)}):")
    for c in sec_classes:
        print(" ", c)

    # Injection sémantique
    added_eq = 0
    added_tp = 0
    for sec_cls in sec_classes:
        local = sec_cls.split(SEC_NAMESPACE)[-1]  # ex. "IfcOpeningElement"
        ifc_cls = IFCOWL[local]
        for inst in g.subjects(RDF.type, ifc_cls):
            g.add((sec_cls, OWL.equivalentClass, ifc_cls))
            added_eq += 1
            g.add((inst, RDF.type, sec_cls))
            added_tp += 1

    print(f"[DEBUG] equivalentClass ajoutés: {added_eq}")
    print(f"[DEBUG] types métier ajoutés: {added_tp}")

    # Sérialisation finale
    g.serialize(destination=output_path, format="application/rdf+xml")
    print(f"Fusion sémantique OK → {output_path}")
