/*   GENEARTOR
 *		GenerateProcedure:
	 *		I: input variable. array of values or HTMLelements
	 *		O: output variable. array of values or HTMLelements
	 *		C: clues. array of values
	 *		Returns a list of programs that can create O from I
 */
wg.Generator = function() {
	this.GenerateProcedureWithUnknownInput = function(candidateI,O,C) {
		// this will run GenerateProcedure for each candidateI and return all
		// having valid result
	};
	this.GenerateProcedure = function(I,O,A) {
		if(O===null || O.length===0) {
			return GenerateProcedureWithoutOutput(I,A);
		} else {
			return GenerateProcedureWithOutput(I,O,A);
		}
	};
	GenerateProcedureWithoutOutput = function(I,A) {
		var P=[]; // candidate programs
		if(isDomList(I)) {
			// DOM -> select/attribute(text|href|src), attach
			P.push(GenerateAttribute(I,[],A));
		} else {
			// variables/string(URL form) -> create
			P.push(GenerateCreate(I,[],A));
		}
		return _.flatten(P);
	};
	// (TBD) GenerateMultiStepProcedure
	GenerateProcedureWithOutput = function(I,O,A) {
		var Ps;	// candidate programs, where a program is sequential sub-procedure
		if(isDomList(I)) {  // if I a DOM list
			return GenerateSelect(I,O);
		} else { // I is a variableList
			if(isDomList(O)){
				// only OUTPUT is nodeType
				return GenerateCreate(I,O,A);
			} else Ps= new wg.Procedure([new wg.Operation('Transform',"Transform input to output.",GenerateTransform(I,O,A))]);
		}
		return Ps;
	};
	/*
	 *  GenerateSelect : finding output DOM within input DOM
	 *    I: Input DOM(s) to find O within.
	 *    O: Output DOM that we are looking for.
	 */
	GenerateSelect= function(I,O) {
		var P = [];
		if(isDomList(O)) {
			// both I and O are Dom and I contains O
			if(containsAll(I[0],O)) P.push(GeneratePositionQuery(I[0],O));
			else P.push(GeneratePositionQuery(I,O));
		} else {
			// if output is a variable list
			P.push(GenerateAttribute(I,O));
		}
		return P;
	};
	// finding position query: extracting a list of output Dom from a single input Dom
	GeneratePositionQuery = function(I,O) {
		var commonAncester = getCommonAncestorMultiple(O);
		var pathToAncester = $(commonAncester).pathWithNth(I);
		// collect paths from anscester's children to output nodes
		var pathFromRepToLeaf = _.uniq(_.map(O, function(o,i) {
			return $(o).leafNodePath(commonAncester);
		}));
		if(pathFromRepToLeaf.length>1) return [];
		// now creates two step selection queries
		var proc = [];
		if(pathToAncester!=="") proc.push(new wg.Operation("Select","Select DOM element",{type:"PositionQuery",path:pathToAncester}));
		if(pathFromRepToLeaf[0]!=="") proc.push(new wg.Operation("Select","Select DOM element",{type:"PositionQuery",path:pathFromRepToLeaf[0]}));
		console.log(proc);
		return new wg.Procedure(proc);
	};
	// extract output variables from DOM elements.
	GenerateAttribute = function(I,O,A) {
		// 1:n _ provided output examples are from the first input element
		// 1:1   each output examples are from the matching row of the input elements
		var validAttributes = [];
		var candidateAttributes = [
			{type:"text", func:function(el) { return $(el).text(); }, constraint: function(I,O,A){return true;}},
			{type:"href", func:function(el) { return $(el).attr('href'); }, constraint: function(I,O,A){return true;}},
			{type:"src", func:function(el) { return $(el).attr('src');}, constraint: function(I,O,A){return true;}}
		];
		_.each(candidateAttributes, function(cand,candIndex) {
			if(O) {
				var extracted = _.map(I, cand.func);
				if(isCorrectResult(I,extracted)) validAttributes.push(cand);
			} else {
				if(cand.constraint(I,O,C)) validAttributes.push(cand);
			}
		});
		var procedures = _.map(validAttributes, function(attr) {
			return new wg.Procedure(new wg.Operation("Select", "Extract "+attr.type+" attribute", {type:"Attribute",expr:attr}));
		});
		return procedures;
	};
	GenerateTransform= function(Vin,Vout,Vargs) {
		var validExpr = [];  // candidate transformations
		if(Vin.length==Vout.length) {
			// if Vout can be a permutation of Vin, then generatePermutation
			if(isPermutation(Vin,Vout)) {
				validExpr= _.union(validExpr,GenerateSort(Vin,Vout,Vargs));
			}
			// find map
			validExpr=_.union(validExpr,GenerateMap(Vin,Vout,Vargs));
		} else if(Vin.length>Vout.length) {
			// filter or aggregate
			if(Vout.length==1) _.union(validExpr, GenerateAggregate(Vin,Vout,Vargs));
			validExpr= _.union(validExpr,GenerateFilter(Vin,Vout,Vargs));
		}
		return validExpr;
	};
	GenerateFilter= function(Vin,Vout,Vargs) {
		var validExpr=[];
		var candidatePredicates;
		if(_.isString(Vin[0])){  // String case : check Vin contains or not contains the Varg
			var Rargs = GenerateRegex(Vargs);
			candidatePredicates = [
				function(el) { return _.filter(Rargs, function(reg) { return (el.match(reg)!==null); },this).length>0; },	// Vin[i] that matches with at least one regex of Vargs
				function(el) { return _.filter(Rargs, function(reg) { return (el.match(reg)!==null); },this).length===0; }	// Vin[i] that matches with no regex of Vargs
			];
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
		return validExpr;
	};
	GenerateAggregate= function(Vin,Vout,Vargs) {
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
		return validAggregate;
	};
	GenerateMap= function(Vin,Vout,Vargs) { // both values, and lengths are same
		// is input String?
		console.log("GenerateMap");
		if(_.isString(Vin[0])){
			if(_.isString(Vout[0])){
				// both in and out are string, same length, then find stringManipulation using arguments
				return {type:'Map', expr: GenerateStringExpr(Vin,Vout,Vargs)};
			} else if(true) {
				// when only input is string, do something else
			}
		}
		else if(_.isNumber(Vin[0])){
			if(_.isNumber(Vout[0])){
				// if both are numbers
				return {type:'Map', expr: GenerateArithExpr(Vin,Vout,Vargs)};
			}
		}
	};
	GenerateSort= function(Vin,Vout,Vargs) {
		var validSort = [];
		if(isSameArray(Vin.sort(),Vout)) validSort.push({'type':'Sort','expr':function(l) {return l.sort();}  });
		if(isSameArray(Vin.sort().reverse(),Vout)) validSort.push({'type':'Sort','expr':function(l) {return l.sort().reverse();}});
		return validSort;
	};
	GenerateStringExpr= function(Vin,Vout,Vargs) {
		// it tries to extract the Vout from Vin using Vargs
		// one case is that Vargs is the string constant token that the extraction starts with or before
		console.log("GenerateStringExpr");
		var Rargs = GenerateRegex(Vargs);
		Rargs =  _.union(Rargs,RegexProduct(Rargs));  // add combinatoric regexp using arguments
		var Rout = GenerateRegex(Vout);
		var validExpr = []; // array to return
		// try match, substring, remove on Vin to create Vout
		var candidateOper = [
			function(el) { return el.match(this.reg);  },  function(el) { return el.replace(this.reg,"");  },
			function(el) {
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
	GenerateArithExpr= function(Vin,Vout,Vargs) {
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
	GenerateCreate= function(Vin,Vout,Vargs) {
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
			return new wg.Procedure(new wg.Operation('Create',p.description,p));
		});
	};
	GenerateRegex= function(stringList) {
		// for now, just treat everything as constant
		return _.map(stringList,function(str) { return (_.isRegExp(str))? str: new RegExp(str,"g"); });
	};
};