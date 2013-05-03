/*   GENEARTOR
 *		GenerateProcedure:
	 *		I= input variable. array of values or HTMLelements
	 *		O: output variable. array of values or HTMLelements
	 *		C: clues. array of values
	 *		Returns a list of programs that can create O from I
 */

wg.test = {
	'sum': function() {
		var context = [
			new wg.Node([1,2,3], null),
			new wg.Node(["a","b","c"], null)
		];
		var output = new wg.Node([6], null);
		var gen = new wg.Generator();
		wg.language = new wg.Language();
		var graph = gen.GenerateGraph(context,output);
		return graph;
	},
	'manyWaysToDoIt': function() {
		var context = [
			new wg.Node([1,2,3], null),
			new wg.Node(["a","b","c"], null),
			new wg.Node([1,1,1], null)
		];
		var output = new wg.Node([3], null);
		var gen = new wg.Generator();
		wg.language = new wg.Language();
		var graph = gen.GenerateGraph(context,output);
		return graph;
	},
	'calcTwoStep': function() {
		var context = [
			new wg.Node([1,2,3,4,5,6,7,8,9,10], null),
			new wg.Node([3], null)
		];
		var output = new wg.Node([9,18,27], null);
		var gen = new wg.Generator();
		wg.language = new wg.Language();
		var graph = gen.GenerateGraph(context,output);
		return graph;
	},
	'concat': function() {
		var context = [
			new wg.Node([1,2,3], null),
			new wg.Node(["a","b","c"], null)
		];
		var output = new wg.Node(["abc"], null);
		var gen = new wg.Generator();
		wg.language = new wg.Language();
		var graph = gen.GenerateGraph(context,output);
		return graph;
	},
	'count': function() {
		var context = [
			new wg.Node([1,2,3], null),
			new wg.Node(["a","b","c"], null),
			new wg.Node([3,2,1], null),
			new wg.Node(["a"], null),
			new wg.Node([6], null)
		];
		var output = new wg.Node([3], null);
		var gen = new wg.Generator();
		wg.language = new wg.Language();
		var graph = gen.GenerateGraph(context,output);
		return graph;
	},
	'multiply': function() {
		var context = [
			new wg.Node([1,2,3], null),
			new wg.Node(["a","b","c"], null),
			new wg.Node([2], null),
			new wg.Node(["a"], null),
			new wg.Node([6], null)
		];
		var output = new wg.Node([12], null);
		var gen = new wg.Generator();
		wg.language = new wg.Language();
		var graph = gen.GenerateGraph(context,output);
		return graph;
	},
	'filterByString': function() {
		var context = [
			new wg.Node(["abcde","abdeas","ghfgh","qerqwer23413","1345"], null),
			// new wg.Node(["a","b","c"], null),
			new wg.Node(["13"], null),
			// new wg.Node(["a"], null),
			new wg.Node([6], null)
		];
		var output = new wg.Node(["qerqwer23413","1345"], null);
		var gen = new wg.Generator();
		wg.language = new wg.Language();
		var graph = gen.GenerateGraph(context,output);
		return graph;
	},
	'filterAndJoin': function() {
		var context = [
			new wg.Node(["cardSharing","cardTool","dont Worry"], null),
			new wg.Node(["card"], null),
			new wg.Node(["Aha:"], null)
		];
		var output = new wg.Node(["Aha:cardSharing","Aha:cardTool"], null);
		var gen = new wg.Generator();
		wg.language = new wg.Language();
		var graph = gen.GenerateGraph(context,output);
		return graph;
	},
	'stringJoinTwoStep': function() {
		var context = [
			new wg.Node(["a","b","c"], null),
			new wg.Node(["a","b","c"], null),
			new wg.Node(["1","2","3"], null),
			new wg.Node([" "], null),
			new wg.Node([6], null)
		];
		var output = new wg.Node(["a 1","b 1","c 1"], null);
		var gen = new wg.Generator();
		wg.language = new wg.Language();
		var graph = gen.GenerateGraph(context,output);
		return graph;
	}
};


wg.Node = function(V,P,id) {
	this.V = (V)?V:[];
	this.P = (P)?P:[];
	this.id = (id)?id:makeid();
};

wg.Generator = function() {
	/*	a typical multistep inference
		input: I is the input of the first operation
				O is the output of the final operation
				A is optional
	*	output: a procedure that has multi-step operations
	*/
	this.maxInferenceSteps = 3;
	// this.maxContextNodes = 20;

	// ContextNodes : potential input and argument nodes.
	// OutputNode: a single node (or null) of the desired end-state 
	this.GenerateGraph = function(ContextNodes,OutputNode) {
		// a Node has V and P[], and id. 
		//		data is an array of data
		//		operations is an operation that contains,
		//			inputNodes: a list of input nodes,
		//			expr: the expression
		// a Node may have multiple operations 
		// _.each(ContextNodes, function(node){
		//	node.tokens=this.maxInferenceSteps;
		// },this);
		var i = 0;
		while(true) {// start generating new nodes from context nodes
			console.log("Round "+i+" starts");
			// create all combinations of (inputNode,argNode)
			var IAList = chooseInputArgNodes(ContextNodes);
			var emptyNode = new wg.Node();
			emptyNode.id = emptyNode.id+"_empty";
			_.each(IAList, function(IA) {
				var nI=IA[0]; var nA=IA[1]; var nO=OutputNode;
				// console.log("Inference start----------");
				// 1. try each (nI,nA,nO) to check whether the outputNode is reachable 
				// add the result procedure to the OutputNode's operation
				var OperationReachingOutput = this.GenerateProcedureForGraph(nI,nO,nA,wg.language.Operation);
				if(OperationReachingOutput && OperationReachingOutput.length>0) {
					OutputNode.P = _.without(_.union(OutputNode.P,OperationReachingOutput),null);
				}
				// 2. try each (nI,nA,[]) to create intermediate nodes
				var Ps = this.GenerateProcedureForGraph(nI,emptyNode,nA,wg.language.Operation);
				_.each(_.without(Ps,null), function(p) {
					var newValue = wg.language.evaluate(nI,nA,p);
					if(_.filter(ContextNodes, function(existingNode) {
						return isSameArray(existingNode.V,newValue);
					}).length===0) {
						ContextNodes.push(new wg.Node(wg.language.evaluate(nI,nA,p),[p]));
					}
				});
			},this);
			console.log("Round "+i+" is over");
			console.log(_.map(ContextNodes,function(node){ return node.V.join(",");}));
			if(OutputNode.P.length>0 || i>=this.maxInferenceSteps) break;
			else i++;
		}
		console.log("********************* END RESULT");
		console.log(ContextNodes);
		console.log(OutputNode);
		console.log("*********************");
		// return ContextNodes;
		// now get the paths to reach OutputNode
		// var pathToOutput = PathFromGraph(ContextNodes, OutputNode);
		var resultGraph = new wg.Graph(ContextNodes);
		if(resultGraph.sanityCheck()===false) {
			console.error("some references in the graph is broken.");
		}
		if(OutputNode.P===null) { // if no path found, then return paths to all the intermediate nodes
			return resultGraph;
		} else { // if 1 or more paths found, then return paths to the output node
			resultGraph.addNode(OutputNode);
			return resultGraph.getSubGraph(OutputNode.id);
		}

	};


	// it returns P[] which also contains links to input and arg nodes
	this.GenerateProcedureForGraph = function(nI,nO,nA,L) {
		// console.log("[GenerateProcedureForGraph]\t:");
		// console.log(nI,nO,nA,L);
		if(!L.constraint(nI,nO,nA)) return null;
		var Op=null;
		if(L.expr!==null) {  // if L is not leafnode of the language tree, then dig deeper
			Op = _.map(L.expr, function(e) {
				return this.GenerateProcedureForGraph(nI,nO,nA,e);
			},this);
		} else { // if L is a leaf, then return a new array of operations
			Op = L.generateOperation(nI,nO,nA);
		}
		Op = _.flatten(_.without(Op,null));  // remove null operations
		// if(L.type=="Operation" && Op!==null) {
			// console.log("Inference finished for a set of IOA");
			// console.log(nI.V,nO.V,nA.V);
			// console.log(_.map(Op, function(p){return p.type;}));
		// }
		return Op;
	};

	this.GenerateProcedureWithUnknownInput = function(O) {
		// generate possible input 
		var availableRows = [];
		availableRows.push(wg.program.getAllRows());
		var Ps = [];
		_.each(availableRows, function(iCand) {
			_.each(availableRows, function(aCand) {
				if(!isSameObject(aCand.pos,iCand.pos)) {
					Ps.push(GenerateProcedure(iCand,O,aCand));
				}
			});
		});
		return _.flatten(Ps);
	};
	this.GenerateProcedure = function(I,O,A) {
		var Ps=[];
		if(O===null || O.length===0) {
			Ps.push(GenerateProcedureNoOutput(I,A));
		} else {
			Ps.push(GenerateProcedureOutput(I,O,A));
		}
		return _.flatten(Ps);
	};
	this.GenerateProcedureNoOutput = function(I,A) {
		var Ps=[]; // candidate programs
		if(isDomList(I)) {
			// DOM -> select/attribute(text|href|src), attach
			if(A.length===0) Ps.push(GenerateAttribute(I,[],A));
		} else if(I.length>0) {
			// variables/string(URL form) -> create
			if(A.length===0) Ps.push(GenerateCreate(I,[],A));
		}
		return Ps;
	};
	// (TBD) GenerateMultiStepProcedure
	this.GenerateProcedureOutput = function(I,O,A) {
		var Ps = [];	// candidate programs, where a program is sequential sub-procedure
		if(isDomList(I)) {  // if I a DOM list
			if(A.length===0) Ps.push(GenerateSelect(I,O));
			if(isDomList(O)){
				if(A && A.length>0)
				Ps.push(GenerateAttach(I,O,A));
			}
		} else { // I is a variableList
			if(isDomList(O)){
				// only OUTPUT is nodeType
				if(A.length===0) Ps.push(GenerateCreate(I,O,A));
			} else {
				Ps.push(GenerateTransform(I,O,A));
			}
		}
		return Ps;
	};
	/*
	 *  GenerateSelect : finding output DOM within input DOM
	 *    I: Input DOM(s) to find O within.
	 *    O: Output DOM that we are looking for.
	 */
	this.GenerateSelect= function(I,O) {
		var P = [];
		if(isDomList(O)) {
			// both I and O are Dom and I contains O
			if(containsAll(I[0],O)) P.push(GeneratePosition(I[0],O));
			else P.push(GeneratePosition(I,O));
		} else {
			// if output is a variable list
			P.push(GenerateAttribute(I,O));
		}
		return P;
	};
	// finding position query: extracting a list of output Dom from a single input Dom
	this.GeneratePosition = function(I,O) {
		var commonAncester = getCommonAncestorMultiple(O);
		// check whether all the output elements are within the input dom
		if(commonAncester!==I && $(commonAncester).parents().hasElement(I)===false) return []; // if Input does not contain
		// find two step paths 1. Input->CommonAncester,  2. CommonAncester->O
		var pathToAncester = $(commonAncester).pathWithNth(I);
		// collect paths from anscester's children to output nodes
		var pathFromRepToLeaf = _.uniq(_.map(O, function(o,i) {
			return $(o).leafNodePath(commonAncester);
		}));
		if(pathFromRepToLeaf.length>1) return [];
		// now creates two step selection queries
		var proc = [];
		var path = pathToAncester+" "+pathFromRepToLeaf[0];
		if(pathToAncester!=="") proc.push(new wg.Operation({type:"Select",description:"Select DOM element",expr:{type:"PositionQuery",path:path}}));
		//if(pathFromRepToLeaf[0]!=="") proc.push(new wg.Operation({type:"Select",description:"Select DOM element",expr:{type:"PositionQuery",path:pathFromRepToLeaf[0]}}));
		console.log(proc);
		return [new wg.Procedure(proc)];
	};
	// extract output variables from DOM elements.
	this.GenerateAttribute = function(I,O,A) {
		// 1:n _ provided output examples are from the first input element
		// 1:1   each output examples are from the matching row of the input elements
		var validAttributes = [];
		var candidateAttributes = [
			{type:"text", func:function(el) { return $(el).text(); }, constraint: function(I,O,A){return true;}},
			{type:"href", func:function(el) { return str2Url($(el).attr('href')); }, constraint: function(I,O,A){ return hasAttribute(I,'href'); }},
			{type:"src", func:function(el) { return $(el).attr('src');}, constraint: function(I,O,A){return hasAttribute(I,'src'); }}
		];
		_.each(candidateAttributes, function(cand,candIndex) {
			if(O) {
				var extracted = _.map(I, cand.func);
				if(isCorrectResult(extracted,O)) validAttributes.push(cand);
			} else {
				if(cand.constraint(I,O,C)) validAttributes.push(cand);
			}
		});
		var Ps = _.map(validAttributes, function(attr) {
			return new wg.Procedure(new wg.Operation({type:"Select",description:"Extract "+attr.type+" attribute", expr:{type:"Attribute",expr:attr}}));
		});
		return Ps;
	};
	this.GenerateTransform= function(Vin,Vout,Vargs) {
		var Ps = [];  // candidate transformations
		if(Vin.length==Vout.length) {
			// if Vout can be a permutation of Vin, then generatePermutation
			if(Vargs.length===0 && isPermutation(Vin,Vout)) {
				Ps.push(GenerateSort(Vin,Vout,Vargs));
			}
			// find map
			Ps.push(GenerateMap(Vin,Vout,Vargs));
		} else if(Vin.length>Vout.length) {
			// filter or aggregate
			if(Vout.length==1) Ps.push(GenerateAggregate(Vin,Vout,Vargs));
			Ps.push(GenerateFilter(Vin,Vout,Vargs));
		}
		return Ps;
	};
	this.GenerateFilter= function(Vin,Vout,Vargs) {
		var validExpr=[];
		var candidatePredicates;
		if(_.isString(Vin[0])){  // String case : check Vin contains or not contains the Varg
			candidatePredicates=[];
			// var Rargs = GenerateRegex(Vargs);
			// candidatePredicates = [
			// 	function(el) { return _.filter(Rargs, function(reg) { return (el.match(reg)!==null); },this).length>0; },	// Vin[i] that matches with at least one regex of Vargs
			// 	function(el) { return _.filter(Rargs, function(reg) { return (el.match(reg)!==null); },this).length===0; }	// Vin[i] that matches with no regex of Vargs
			// ];
		} else if(_.isNumber(Vin[0])) {	// Number case
			var arg = Vargs[0];
			candidatePredicates = [		// try arithmetic comparison operators
				function(el) { return el > arg; }, function(el) { return el < arg; }, function(el) { return el === arg; }, function(el) { return el <= arg; },
				function(el) { return el >= arg; }, function(el) { return el != arg; }, function(el) { return el % arg===0; }
			];
		} else if(_.isBoolean(Vin[0])) {	// Boolean case is useful to filter true/false cases
			candidatePredicates = [
				function(el) { return el; },   function(el) { return !el; }
			];
		}
		// now try candidatePredicates and return all that output Vout.
		_.each(candidatePredicates, function(pred) {
				var filteredIn = _.filter(Vin, pred);
				if (isSameArray(filteredIn,Vout)) validExpr.push({'type':"Filter",'expr':pred});
			},this);
		var Ps = _.map(validExpr, function(expr) {
			return new wg.Procedure(new wg.Operation({type:"Transform",description:"Filter input by...",expr:expr}));
		});
		return Ps;
	};
	this.GenerateAggregate= function(Vin,Vout,Vargs) {
		var validAggregate = [];
		console.log("generateAggrexpr");
		var candidateAggrExpr;
		var reg = GenerateRegex(Vargs);
		if(_.isString(Vin[0])) {
			if(_.isNumber(Vout[0]) && Vout.length==1) {
				candidateAggrExpr = [
					function(memo, el, i, list) { return ((el.match(reg[0]))? memo+1 : memo); }, // count strings containing reg
					function(memo, el, i, list) { return (!(el.match(reg[0]))? memo+1 : memo); } // count strings not containing reg
				];
				_.each(candidateAggrExpr, function(expr) {
					if(_.reduce(Vin, expr, 0)==Vout[0]) validAggregate.push({'type':'Aggregate','init':0,'expr':expr});
				},this);
			} else if(_.isString(Vout[0]) && Vout.length==1) {
				candidateAggrExpr = [
					function(memo, el, i, list) { return memo + ","+el; },   // [a,b,c] --> "a,b,c"
					function(memo, el, i, list) { return memo + el; },    // [a,b,c] --> "abc"
					function(memo, el, i, list) { return memo + Vargs[0] + el; }    // [a,b,c]&["-"] --> "a-b-c"
				];
				_.each(candidateAggrExpr, function(expr) {
					if(_.reduce(Vin, expr, "")==Vout[0]) validAggregate.push({'type':'Aggregate','init':"",'expr':expr});
				},this);
			}
		} else if(_.isNumber(Vin[0])) {
			if(_.isNumber(Vout[0]) && Vout.length==1) {
				candidateAggrExpr = [
					function(memo, el, i, list) { return memo + el; }, // sum
					function(memo, el, i, list) { return memo + 1; }, // count
					function(memo, el, i, list) { return memo + Vargs[0]; }, // weighted sum
					function(memo, el, i, list) { return memo + (el/list.length); } // avg
				];
				_.each(candidateAggrExpr, function(expr) {
					if(_.reduce(Vin, expr, 0)==Vout[0]) validAggregate.push({'type':'Aggregate','init':0,'expr':expr});
				},this);
			}
		} else if(_.isBoolean(Vin[0])) {
			if(_.isNumber(Vout[0]) && Vout.length==1) {
				candidateAggrExpr = [
					function(memo, el, i, list) { return (el)? memo+1: memo; }, // count true
					function(memo, el, i, list) { return (!el)? memo+1: memo; } // count false
				];
				_.each(candidateAggrExpr, function(expr) {
					if(_.reduce(Vin, expr, 0)==Vout[0]) validAggregate.push({'type':'Aggregate','init':0,'expr':expr});
				},this);
			}
		}
		var Ps = _.map(validAggregate, function(expr) {
			return new wg.Procedure(new wg.Operation({type:"Transform",description:"Aggregate input", expr:expr}));
		});
		return Ps;
	};
	this.GenerateMap= function(Vin,Vout,Vargs) { // both in and out are values, and lengths are same
		// is input String?
		console.log("GenerateMap");
		var validExpr = [];
		if(_.isString(Vin[0])){
			if(_.isString(Vout[0]) && Vin[0].indexOf(Vout[0]!==-1)){
				// both in and out are string, same length, and I contains O
				// then find stringManipulation using arguments
				validExpr.push({type:'Map', expr: GenerateStringExpr(Vin,Vout,Vargs)});
			} else if(true) {
				// when only input is string, do something else
			}
		}
		else if(_.isNumber(Vin[0])){
			if(_.isNumber(Vout[0])){
				// if both are numbers
				validExpr.push({type:'Map', expr: GenerateArithExpr(Vin,Vout,Vargs)});
			}
		}
		var Ps = _.map(validExpr, function(expr) {
			return new wg.Procedure(new wg.Operation({type:"Transform",description:"Convert input to output", expr:expr}));
		});
		return Ps;
	};
	this.GenerateSort= function(Vin,Vout,Vargs) {
		var validSort = [];
		if(isSameArray(Vin.sort(),Vout)) validSort.push({'type':'Sort','expr':function(l) {return l.sort();}  });
		if(isSameArray(Vin.sort().reverse(),Vout)) validSort.push({'type':'Sort','expr':function(l) {return l.sort().reverse();}});
		var Ps = _.map(validSort, function(expr) {
			return new wg.Procedure(new wg.Operation({type:"Transform",description:"Sort input", expr:expr}));
		});
		return Ps;
	};
	this.GenerateStringExpr= function(Vin,Vout,Vargs) {
		return [];
		// it tries to extract the Vout from Vin using Vargs
		// one case is that Vargs is the string constant token that the extraction starts with or before
		console.log("GenerateStringExpr");
		//var Rargs = GenerateRegex(Vargs);
		//Rargs =  _.union(Rargs,RegexProduct(Rargs));  // add combinatoric regexp using arguments
		//var Rout = GenerateRegex(Vout);
		var validExpr = []; // array to return
		// try match, substring, remove on Vin to create Vout
		var candidateOper = [
			function(el) { return el.match(this.reg);  },			// find matching substrings
			function(el) { return el.replace(this.reg,"");  },		// remove matching substrings
			function(el) {											// replace matching substrings
				var rr = new RegExp(".*"+this.reg.source+".*");
				console.log("[["+rr.source+"]] "+ el.replace(rr,"$1"));
				return el.replace(rr,"$1");
			}
		];
		// now try candidateMapOper and return all that output Vout.
		_.each(candidateOper, function(oper) {	// try every candidate
			_.each(Rargs, function(reg) {
				console.log(reg.source + ":" + _.map(Vin, oper,{'reg':reg}).join("  ,  "));
				if(isSameArray(_.map(Vin, oper,{'reg':reg}),Vout,"ALLOW_PARTIAL_OUTPUT")) validExpr.push({'type':'StringExpr','oper':oper,'reg':reg});
			},this);
		},this);
		return validExpr;
	};
	this.GenerateArithExpr= function(Vin,Vout,Vargs) {
		console.log("GenerateArithExpr");
		var validExpr = [];
		var arg = Vargs[0];
		var candidateOperators = [		// try arithmetic operators
				function(el) { return el + arg; }, function(el) { return el - arg; }, function(el) { return el * arg; }, function(el) { return el / arg; },
				function(el) { return el ^ arg; }, function(el) { return el % arg; }
			];
		_.each(candidateOperators, function(oper) {	// try every candidate
			if(isSameArray(_.map(Vin, oper),Vout)) validExpr.push({'type':'ArithExpr','expr':oper});
		},this);
		return validExpr;
	};
	// from variables to DOM.  
	this.GenerateCreate= function(Vin,Vout,Vargs) {
		// for now we assume Vout is empty. It's hard to provide exact examples for creating DOM 
		var P=[];
		var candidateP = [
			{type:"load", description:"Load a web page from URL", func:function(vIn) { return $(vIn).getURL;  }, constraint: function(i,o,a) { return isURL(i); }},
			{type:"image",description:"Create an image tag from URL", func:function(vIn) { return $("<img></img>").attr('src',vIn); }, constraint: function(i,o,a) { return isSrc(i); }},
			{type:"text",description:"Create a paragraph from text", func:function(vIn) { return $("<p></p>").text(vIn); }, constraint: function(i,o,a) { return true; }}
		];
		var validP = _.filter(candidateP, function(p) {
			return p.constraint(Vin,Vout,Vargs);
		});
		return _.map(validP, function(p){
			return new wg.Procedure(new wg.Operation({type:'Create',description:p.description,expr:p}));
		});
	};
	// Vin is a DOM list that was attached to a list of DOM elements on the page. 
	this.GenerateAttach= function(I,O,A) {
		var P=[];
		// check constraints : each Vout element.html contains Vin.outerHTML
		if(!isOutputContainInput(I,O)) return [];
		else {
			// call GeneratePosition to get the list of target DOMs
			//GeneratePosition()
			var candidateP = [
				{	type: "attach",
					description: "Attach input DOM after argument DOM",
					func:function(vIn,vArg) {
						var toBeAttached = $("<span class='attached'></span>").append(vIn);
						return $(toBeAttached).after(vArg);
					},
					constraint: function(i,o,a) {
						if(	o.innerHTML.indexOf(i.outerHTML)!==-1  &&
							o.innerHTML.indexOf(a.outerHTML)!==-1) return true;
						else return false;
					}
				}
			];
			var validP = _.filter(candidateP, function(p) {
				return p.constraint(I,O,A);
			});
			return _.map(validP, function(p){
				return new wg.Procedure(
						new wg.Operation({type:'Create',description:p.description, expr:p})
					);
			});

		}
		// 

	};
	this.GenerateRegex= function(stringList) {
		// for now, just treat everything as constant
		return _.map(stringList,function(str) { return (_.isRegExp(str))? str: new RegExp(str,"g"); });
	};


	// Evaluate = function(nI,op) {
	// 	if(op.type=="Select:Position") {
	// 		return _.flatten(_.map(_.filter(I,isDom),function(i) {
	// 			if (op.expr.path==="") return $(i);
	// 			else return $.makeArray($(i).find(op.expr.path));
	// 		}),true);
	// 	} else if(op.type=="Select:Attribute") {
	// 		return _.map(I, op.expr.expr.func);
	// 	} else if(op.type=="Transform:Filter") {
	// 		return _.filter(I,op.expr.op.expr);
	// 	} else if(op.type=="Transform:Aggregate") {
	// 		return [_.reduce(I,op.expr.op.expr,op.expr.init)];
	// 	} else if(op.type=="Transform:Map:StringExpr") {
	// 		return _.map(I,op.expr.oper,{'reg':op.expr.reg});
	// 	} else if(op.type=="Transform:Map:ArithExpr") {
	// 		return _.map(I, op.expr.oper);
	// 	} else if(op.expr.type=="Sort") {
	// 				return op.expr.expr(I);
	// 			}
	// 		} else if(op.type=='Create') {
	// 			if(expr.type=="load") {
	// 				// initiate a new loader. return a uniq token back
	// 				// loading URL only the top 15 
	// 				var limitedI = _.filter(I, function(i,iIndex) { return iIndex<15; });
	// 				var result = _.map(limitedI, function(i,iIndex) {
	// 					if(pos) {
	// 						pos['r'] = iIndex;
	// 						var newLoader = new wg.Loader(i,pos);
	// 						wg.loaders.push(newLoader);
	// 						newLoader.run();
	// 					}
	// 					var waitSign = "";
	// 					return waitSign;
	// 				});
	// 				return result;
	// 			} else if(expr.type=="image") {
	// 				return _.map(I, function(i) {
	// 					return $("<img class='img_cell'></img>").attr("src",i).get(0);
	// 				});
	// 			} else if(expr.type=="text") {
	// 				return _.map(I, function(i) {
	// 					return $("<span></span>").text(i).get(0);
	// 				});
	// 			} else if(expr.type=="attach") {
	// 				return;
	// 			}
	// 		}
	// }	// ENd OF EVALUATE


};






