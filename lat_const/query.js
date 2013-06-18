var q_tr = 'querydata=[:find ?test ?model \
    	?temp-source-value ?temp-source-unit    \
       ?species ?shortname ?a ?b ?c ?alpha ?beta ?gamma ?spacegroup \
 :where   \
  [?e :test-result.test-extended-id ?test]   \
  [?e :test-result.model-extended-id ?model]   \
  [?e :properties ?property1-ref]   \
  [?property1-ref :kim-template-tags "equilibrium-crystal-structure"]   \
   \
  [?property1-ref :openkim-key.crystal-structure ?p1-crystal-ref]   \
  [?p1-crystal-ref :primitive.crystal-structure.short-name ?shortname]   \
  [?p1-crystal-ref :primitive.crystal-structure.space-group ?spacegroup] \
  [?p1-crystal-ref :primitive.crystal-structure.a.source-value ?a]   \
  [?p1-crystal-ref :primitive.crystal-structure.b.source-value ?b]   \
  [?p1-crystal-ref :primitive.crystal-structure.c.source-value ?c]   \
  [?p1-crystal-ref :primitive.crystal-structure.alpha.source-value ?alpha]   \
  [?p1-crystal-ref :primitive.crystal-structure.beta.source-value ?beta]   \
  [?p1-crystal-ref :primitive.crystal-structure.gamma.source-value ?gamma]   \
  [?p1-crystal-ref :primitive.crystal-structure.wyckoff-site ?p1-crystal-wyckoff-ref]   \
  [?p1-crystal-wyckoff-ref :primitive.crystal-structure.wyckoff-site.species ?species]   \
	   \
	[?property1-ref :openkim-key.nvt ?p1-nvt-ref]   \
	[?p1-nvt-ref :primitive.equilibrium-ensemble-nvt.temperature.source-value  ?temp-source-value]   \
	[?p1-nvt-ref :primitive.equilibrium-ensemble-nvt.temperature.source-unit ?temp-source-unit] ]';
	
var q_rd = 'querydata=[:find ?rd \
       ?a ?b ?c  \
       ?alpha ?beta ?gamma   \
       ?crystal-temp-source-value ?crystal-temp-source-unit   \
       ?crystal-pressure-source-value ?crystal-pressure-source-unit   \
       ?comments   \
       ?source-citation   \
       ?shortname ?species ?spacegroup ?unit \
 :where   \
  [?e :reference-data.short-id ?rd]   \
  [?e :reference-data.comments ?comments]   \
  [?e :reference-data.source-citation ?source-citation]   \
   \
  [?e :properties ?property1-ref]   \
  [?property1-ref :kim-template-tags "equilibrium-crystal-structure"]   \
   \
  [?property1-ref :openkim-key.npt ?p1-npt-ref]   \
  [?p1-npt-ref :primitive.equilibrium-ensemble-npt.pressure.source-value  ?crystal-pressure-source-value]   \
  [?p1-npt-ref :primitive.equilibrium-ensemble-npt.pressure.source-unit  ?crystal-pressure-source-unit]   \
  [?p1-npt-ref :primitive.equilibrium-ensemble-npt.temperature.source-value  ?crystal-temp-source-value]   \
  [?p1-npt-ref :primitive.equilibrium-ensemble-npt.temperature.source-unit  ?crystal-temp-source-unit]   \
   \
  [?property1-ref :openkim-key.crystal-structure ?p1-cs-ref]   \
  [?p1-cs-ref :primitive.crystal-structure.a.source-value ?a]   \
  [?p1-cs-ref :primitive.crystal-structure.a.source-unit ?unit]  \
  [?p1-cs-ref :primitive.crystal-structure.b.source-value ?b]   \
  [?p1-cs-ref :primitive.crystal-structure.c.source-value ?c]   \
  [?p1-cs-ref :primitive.crystal-structure.alpha.source-value ?alpha]   \
  [?p1-cs-ref :primitive.crystal-structure.beta.source-value ?beta]   \
  [?p1-cs-ref :primitive.crystal-structure.gamma.source-value ?gamma]   \
  [?p1-cs-ref :primitive.crystal-structure.space-group ?spacegroup]   \
  [?p1-cs-ref :primitive.crystal-structure.short-name ?shortname]   \
  [?p1-cs-ref :primitive.crystal-structure.wyckoff-site ?p1-crystal-wyckoff-ref]   \
  [?p1-crystal-wyckoff-ref :primitive.crystal-structure.wyckoff-site.species ?species]   \
  ]';   
	
var uri = "https://datalog-search.openkim.org/api/query";

// Keys to be paired with the values returned, the order is important 
var keys_tr = [
'Test',
'Model',
'Temperature', 
'Temperature-Units', 
'Atoms',
'Shortname',
'a',
'b',
'c',
'alpha',
'beta',
'gamma',
'Spacegroup'
];

var keys_rd = [
'RD',
'a',
'b',
'c',
'alpha',
'beta',
'gamma',
'Temperature',
'Temperature-Units',
'Pressure',
'Pressure-Units',
'Comments',
'Source',
'Shortname',
'Atoms',
'Spacegroup',
'Unit'
];

