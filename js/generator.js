/*   GENEARTOR
 * 		GenerateProcedure:
	 * 		I: input variable. array of values or HTMLelements
	 * 		O: output variable. array of values or HTMLelements
	 * 		C: clues. array of values
	 * 		Returns a list of programs that can create O from I
 */
wg.Generator = function() {
	this.GenerateProcedureWithUnknownInput = function(candidateI,O,C) {
		// this will run GenerateProcedure for each candidateI and return all
		// having valid result
	};
	// (TBD) GenerateMultiStepProcedure
	this.GenerateProcedure = function(I,O,A) {
		var P;	// candidate programs, where a program is sequential sub-procedure
		if(isDomList(I)) {  // if I a DOM list
			return GenerateSelect(I,O);
		} else { // I is a variableList
			if(isDomList(O)){
				// only OUTPUT is nodeType
				P=[{type:'Create', operation: GenerateCreate(I,O), description:"Create a new DOM element."}];
			} else P=[{type:'Transform', operation: GenerateTransform(I,O,A),description:"Transform input to output."}];
		}
		return P;
	};
	/*
	 *  GenerateSelect : finding output DOM within input DOM
	 *    I: Input DOM(s) to find O within.
	 *    O: Output DOM that we are looking for.
	 */
	GenerateSelect= function(I,O) {
		var Q={}; // key: output index,  value: query object
		if(isDomList(O)) {
			// both I and O are Dom and I contains O
			if($(I[0]).containsAll(O)) return GeneratePositionQuery(I[0],O);
			else return GeneratePositionQuery(I,O);
		} else {
			// if output is a variable list
			return GenerateAttribute(I,O);
		}
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
		if(pathToAncester!=="") proc.push({type:"Select",query:{type:"PositionQuery",path:pathToAncester},description:"Select a set elements from DOM."});
		if(pathFromRepToLeaf[0]!=="") proc.push({type:"Select",query:{type:"PositionQuery",path:pathFromRepToLeaf[0]},description:"Select a set elements from DOM."});
		console.log(proc);
		return [proc];
	};
	// extract output variables from DOM elements.
	GenerateAttribute = function(I,O) {
		// 1:n _ provided output examples are from the first input element
		// 1:1   each output examples are from the matching row of the input elements
		var eachInputHasEachOutput = true;
		var validAttributes = [];
		var candidateAttributes = [
			{type:"text", expr:function(el) { return $(el).text(); }},
			{type:"href", expr:function(el) { return $(el).attr('href'); }},
			{type:"src", expr:function(el) { return $(el).attr('src'); }}
		];
		_.each(candidateAttributes, function(cand,candIndex) {
			var extracted = _.map(I, cand.expr);
			_.each(O, function(o,oi) {
				if(extracted[oi].indexOf(o)==-1) eachInputHasEachOutput=false;
			});
			if(eachInputHasEachOutput) validAttributes.push(cand);
		});
		return validAttributes;
	};
	GenerateTransform= function(Vin,Vout,Vargs) {
		var T = [];  // candidate transformations
		if(Vin.length==Vout.length) {
			// if Vout can be a permutation of Vin, then generatePermutation
			if(isPermutation(Vin,Vout)) {
				T= _.union(T,GenerateSort(Vin,Vout,Vargs));
			}
			// find map
			T=_.union(T,GenerateMap(Vin,Vout,Vargs));
		} else if(Vin.length>Vout.length) {
			// filter or aggregate
			if(Vout.length==1) T.push(GenerateAggregate(Vin,Vout,Vargs));
			T= _.union(T,GeneratePredicate(Vin,Vout,Vargs));
		}
		return T;
	};
	GenerateFilter= function(Vin,Vout,Vargs) {
		var validFilter=[];
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
				if (isSameArray(filteredIn,Vout)) validFilter.push({'type':"Filter",'pred':pred});
			},this);
		return validFilter;
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
		if(isSameArray(Vin.sort(),Vout)) validSort.push({'type':'Sort','direction':'asc'});
		if(isSameArray(Vin.sort().reverse(),Vout)) validSort.push({'type':'Sort','direction':'desc'});
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
			if(isSameArray(_.map(Vin, oper),Vout)) validExpr.push({'type':'ArithExpr','oper':oper});
		},this);
		return validExpr;
	};
	GenerateCreate= function(Vin,Vout) {
	};
	GenerateRegex= function(stringList) {
		// for now, just treat everything as constant
		return _.map(stringList,function(str) { return (_.isRegExp(str))? str: new RegExp(str,"g"); });
	};
};