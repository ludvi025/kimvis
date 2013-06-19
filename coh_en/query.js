var q = 'querydata=[:find \
 ?test ?model  \
 ?energy-energy-source-value ?energy-energy-source-unit  \
 ?energy-temp-source-value ?energy-temp-source-unit    \
 ?species ?shortname ?spacegroup \
 :where   \
 [?e :test-result.test-extended-id ?test]  \
 [?e :test-result.model-extended-id ?model] \
 [?e :properties ?property1-ref]   \
    [?property1-ref :kim-template-tags "equilibrium-cohesive-energy"] \
    [?e :properties ?property2-ref]  \
  [?property2-ref :kim-template-tags "equilibrium-crystal-structure"]  [?property1-ref :openkim-key.energy ?p1-energy-ref]  \
  [?p1-energy-ref :primitive.cohesive-energy.source-value ?energy-energy-source-value]   \
  [?p1-energy-ref :primitive.cohesive-energy.source-unit ?energy-energy-source-unit]  \
  [?property1-ref :openkim-key.nvt ?p1-nvt-ref]   \
  [?p1-nvt-ref :primitive.equilibrium-ensemble-nvt.temperature.source-value ?energy-temp-source-value]  \
  [?p1-nvt-ref :primitive.equilibrium-ensemble-nvt.temperature.source-unit ?energy-temp-source-unit]   \
  [?property1-ref :openkim-key.crystal-structure ?p1-crystal-ref]    \
  [?p1-crystal-ref :primitive.crystal-structure.short-name ?shortname] \
    [?p1-crystal-ref :primitive.crystal-structure.space-group ?spacegroup] \
  [?p1-crystal-ref :primitive.crystal-structure.wyckoff-site ?p1-crystal-wyckoff-ref] \
  [?p1-crystal-wyckoff-ref :primitive.crystal-structure.wyckoff-site.species ?species]  \
  ]'

  

  
var uri = "https://datalog-search.openkim.org/api/query";
// Keys to be paired with the values returned, the order is important and is specified by the query
var keys = [
'Test',
'Model',
'Cohesive-Energy',
'Cohesive-Energy-Units',
'Temperature', 
'Temperature-Units', 
'Atoms',
'Shortname',
'Spacegroup'
];
