var query_tr_singlevals = 'querydata=[:find \
			?test ?model \
		    ?a ?b ?c ?units  \
		    ?alpha ?beta ?gamma  \
		    ?shortname ?spacegroup ?species \
		    :where \
		  [?e :test-result.test-extended-id ?test] \
		  [?e :test-result.model-extended-id ?model] \
		 \
		  [?e :properties ?property1-ref] \
		  [?property1-ref :kim-template-tags "equilibrium-crystal-structure"] \
		 \
		  [?property1-ref :openkim-key.crystal-structure ?p1-cs-ref] \
		  [?p1-cs-ref :primitive.crystal-structure.short-name ?shortname] \
		  [?p1-cs-ref :primitive.crystal-structure.a.source-value ?a] \
		  [?p1-cs-ref :primitive.crystal-structure.b.source-value ?b] \
		  [?p1-cs-ref :primitive.crystal-structure.c.source-value ?c] \
		  [?p1-cs-ref :primitive.crystal-structure.c.source-unit ?units]  \
		  [?p1-cs-ref :primitive.crystal-structure.alpha.source-value ?alpha] \
		  [?p1-cs-ref :primitive.crystal-structure.beta.source-value ?beta] \
		  [?p1-cs-ref :primitive.crystal-structure.gamma.source-value ?gamma] \
		  [?p1-cs-ref :primitive.crystal-structure.space-group ?spacegroup]   \
		\
		  [?p1-cs-ref :primitive.crystal-structure.wyckoff-site ?ecs-cs-wy] \
		  [?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.species ?species] \
		  ]';
		  
		var query_tr_multivals = 'querydata=[:find \
			?test ?model \
			?code    ?species    ?x ?y ?z \
			:where \
			[?e :test-result.test-extended-id ?test] \
		  [?e :test-result.model-extended-id ?model] \
		 \
		  [?e :properties ?property1-ref] \
		  [?property1-ref :kim-template-tags "equilibrium-crystal-structure"] \
		 \
		  [?property1-ref :openkim-key.crystal-structure ?p1-cs-ref] \
		  [?p1-cs-ref :primitive.crystal-structure.wyckoff-site ?ecs-cs-wy] \
		  [?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.code ?code] \
		  [?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.species ?species] \
		  [?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.fract-x.source-value ?x] \
		  [?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.fract-y.source-value ?y] \
		  [?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.fract-z.source-value ?z] ]\
		';

		var query_rd_singlevals = 'querydata=[:find 
			?rd 
			?a ?b ?c ?units 
			?alpha ?beta ?gamma   
			?shortname ?spacegroup ?species
			:where  
			[?e :reference-data.short-id ?rd] 
			
			[?e :properties ?property1-ref]  
			[?property1-ref :kim-template-tags "equilibrium-crystal-structure"]  
			
			[?property1-ref :openkim-key.crystal-structure ?p1-cs-ref]  
			[?p1-cs-ref :primitive.crystal-structure.short-name ?shortname] 
			[?p1-cs-ref :primitive.crystal-structure.a.source-value ?a]  
			[?p1-cs-ref :primitive.crystal-structure.b.source-value ?b]  
			[?p1-cs-ref :primitive.crystal-structure.c.source-value ?c]  
			[?p1-cs-ref :primitive.crystal-structure.c.source-unit ?units]  
			[?p1-cs-ref :primitive.crystal-structure.alpha.source-value ?alpha]  
			[?p1-cs-ref :primitive.crystal-structure.beta.source-value ?beta]  
			[?p1-cs-ref :primitive.crystal-structure.gamma.source-value ?gamma]  
			[?p1-cs-ref :primitive.crystal-structure.space-group ?spacegroup]    
			
		    [?p1-cs-ref :primitive.crystal-structure.wyckoff-site ?ecs-cs-wy]  
		    [?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.species ?species] 
			]';

		  var query_rd_multivals = 'querydata=[:find \
		    ?rd \
		    ?code    ?species    ?x ?y ?z  \
			:where\
			[?e :reference-data.short-id ?rd] \
			\
			[?e :properties ?property1-ref]  \
			[?property1-ref :kim-template-tags "equilibrium-crystal-structure"]  \
			\
			[?property1-ref :openkim-key.crystal-structure ?p1-cs-ref]  \
		    [?p1-cs-ref :primitive.crystal-structure.wyckoff-site ?ecs-cs-wy]  \
			[?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.code ?code]  \
			[?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.species ?species]  \
			[?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.fract-x.source-value ?x]  \
			[?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.fract-y.source-value ?y]  \
			[?ecs-cs-wy :primitive.crystal-structure.wyckoff-site.fract-z.source-value ?z]  \
			]';
		  
		var uri = "https://datalog-search.openkim.org/api/query";
		  
		  var keys_tr_singlevals = [
		  'Test',
		  'Model',
		  'a','b','c', 'units',
		  'alpha',
		  'beta',
		  'gamma',
		  'shortname',
		  'spacegroup',
		  'species'
			];
		  
		  var keys_tr_multivals = [
		  'Test',
		  'Model',
		  'code',
		  'species',
		  'fract_x','fract_y','fract_z'
		  ];
		  
		  var keys_rd_singlevals = [
		  'RD',
		  'a','b','c', 'units',
		  'alpha',
		  'beta',
		  'gamma',
		  'shortname',
		  'spacegroup',
		  'species'
			];
		  var keys_rd_multivals = [
		  'RD',
		  'code',
		  'species',
		  'fract_x','fract_y','fract_z'
			];