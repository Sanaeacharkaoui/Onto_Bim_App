# backend/converter.py

import ifcopenshell  # lire et manipuler des fichiers IFC
from rdflib import Graph, Namespace, URIRef, Literal
from rdflib.namespace import RDF

# Définition des namespaces
IFCOWL = Namespace("http://ifcowl.openbimstandards.org/IFC2X3_TC1#")
EX     = Namespace("http://example.org/ifc#")

def ifc_to_rdf(ifc_file, rdf_output):
    """
    Lit un fichier IFC et le convertit en RDF/XML.
    """
    # 1) Lecture du modèle IFC et création du graphe RDF
    model = ifcopenshell.open(ifc_file)
    g = Graph()
    g.bind("ifc", IFCOWL)
    g.bind("ex", EX)

    # 2) Boucle sur toutes les entités IFC
    for entity in model:
        entity_type = entity.is_a()
        entity_id   = f"Entity_{entity.id()}"
        entity_uri  = URIRef(f"{EX}{entity_id}")

        # type de l’entité
        g.add((entity_uri, RDF.type, IFCOWL[entity_type]))

        # attributs (liés, simples, tuples…)
        try:
            for name, val in entity.get_info().items():
                if isinstance(val, ifcopenshell.entity_instance):
                    uri2 = URIRef(f"{EX}Entity_{val.id()}")
                    g.add((entity_uri, IFCOWL[name], uri2))
                elif isinstance(val, (int, float, str)):
                    g.add((entity_uri, IFCOWL[name], Literal(val)))
                elif isinstance(val, tuple):
                    for i, v in enumerate(val):
                        g.add((entity_uri, IFCOWL[f"{name}_{i}"], Literal(v)))
        except Exception as e:
            print(f"Error on {entity_type}#{entity.id()}: {e}")

    # 3) Propriétés IFC (IfcRelDefinesByProperties)
    for rel in model.by_type("IfcRelDefinesByProperties"):
        if hasattr(rel, "RelatedObjects") and hasattr(rel, "RelatingPropertyDefinition"):
            pset = rel.RelatingPropertyDefinition
            if pset.is_a("IfcPropertySet"):
                for obj in rel.RelatedObjects:
                    subj = URIRef(f"{EX}Entity_{obj.id()}")
                    for prop in pset.HasProperties:
                        val = None
                        if hasattr(prop, "NominalValue"):
                            val = prop.NominalValue.wrappedValue
                        elif hasattr(prop, "EnumerationValues"):
                            val = ",".join(str(v.wrappedValue) for v in prop.EnumerationValues)
                        if val is not None:
                            g.add((subj, IFCOWL[prop.Name], Literal(val)))

    # 4) Matériaux (IfcRelAssociatesMaterial)
    for rel in model.by_type("IfcRelAssociatesMaterial"):
        if hasattr(rel, "RelatedObjects") and hasattr(rel, "RelatingMaterial"):
            mat = rel.RelatingMaterial
            for obj in rel.RelatedObjects:
                subj = URIRef(f"{EX}Entity_{obj.id()}")
                mat_u = URIRef(f"{EX}Material_{mat.id()}")
                g.add((subj, IFCOWL["hasMaterial"], mat_u))
                if hasattr(mat, "Name"):
                    g.add((mat_u, IFCOWL["name"], Literal(mat.Name)))

    # 5) Ouvertures (IfcRelVoidsElement)
    for rel in model.by_type("IfcRelVoidsElement"):
        if hasattr(rel, "RelatingBuildingElement") and hasattr(rel, "RelatedOpeningElement"):
            subj = URIRef(f"{EX}Entity_{rel.RelatingBuildingElement.id()}")
            obj  = URIRef(f"{EX}Entity_{rel.RelatedOpeningElement.id()}")
            g.add((subj, IFCOWL["hasOpening"], obj))

    # 6) Structures spatiales (IfcRelContainedInSpatialStructure)
    for rel in model.by_type("IfcRelContainedInSpatialStructure"):
        if hasattr(rel, "RelatedElements") and hasattr(rel, "RelatingStructure"):
            parent = URIRef(f"{EX}Entity_{rel.RelatingStructure.id()}")
            for elem in rel.RelatedElements:
                euri = URIRef(f"{EX}Entity_{elem.id()}")
                g.add((euri, IFCOWL["containedIn"], parent))

    # 7) Éléments spatiaux (IfcSpatialStructureElement)
    for spatial in model.by_type("IfcSpatialStructureElement"):
        uri = URIRef(f"{EX}Entity_{spatial.id()}")
        g.add((uri, RDF.type, IFCOWL[spatial.is_a()]))
        if hasattr(spatial, "LongName"):
            g.add((uri, IFCOWL["longName"], Literal(spatial.LongName)))

    # 8) Points géométriques (IfcCartesianPoint)
    for pt in model.by_type("IfcCartesianPoint"):
        pu = URIRef(f"{EX}Point_{pt.id()}")
        g.add((pu, RDF.type, IFCOWL["IfcCartesianPoint"]))
        if hasattr(pt, "Coordinates"):
            for i, c in enumerate(pt.Coordinates):
                g.add((pu, IFCOWL[f"coord_{i}"], Literal(c)))

    # 9) Sérialisation finale
    g.serialize(destination=rdf_output, format="xml")
    print(f"RDF file saved to {rdf_output}")

# Permet de tester la conversion en CLI
if __name__ == "__main__":
    ifc_to_rdf(
        r"C:\chemin\vers\Projet2.ifc",
        r"C:\chemin\vers\Projet2.rdf"
    )
