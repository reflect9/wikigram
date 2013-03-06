// DOM ready function // 

// wikigram content script //

chrome.extension.sendRequest({}, function(response) {});




var browserActionEvent = function() {
	console.log("browserActionEvent");
	if($(".wikigram_container").length>0) {
		
	} else {
		open();	
	}
	
}

var test = function(Out) {
	var I = $.makeArray($("html"));
	var O = Out;
	var Q = GenerateProcedure(I,O,"");
	$.each(Q, function(i,q) {
		var siblings = _.filter($(q["q_rep"]),function(s,si) {
			return $(s).fingerprint()==q.f_rep;
		});
		console.log(q);
		$.each(siblings, function(j,s) {
			var leafNodes;
			if(q.q_leaf!=" ") leafNodes = $(s).find(q["q_leaf"]);
			else leafNodes = $(s);
			$.each(leafNodes, function(Li,l) { 
				console.log(j+"["+Li+"]:"+l.innerText); 
			});
		});
		console.log(siblings);
		console.log(siblings.length);
		console.log("----");
		//$("*").css("border","0px").css("color","black");
	});
}

function initialize() {
	
}


// temporary function that opens the worksheet of wikiGram 
var open = 


var initVariables = function(col,row) {
	var newVar={};
	for(ic in _.range(col)) {
		newVar[ic]={};
		for(ir in _.range(row)) {
			newVar[ic][ir]=undefined;
		}
	}
	variables = newVar;
	variables[0][0]=$("body")[0];
	updateTable(col,row);
}

var updateTable = function(col,row) {
	for(ci in _.range(col)) {
		for(ri in _.range(row)) {
			$(".wg_cell[col_id='"+ci+"'][row_id='"+ri+"']").text($(variables[ci][ri]).text());		
		}
	}	
}

var resetWg = function() {
	initVariables(num_cols,num_rows);
};

/*
 * infer : for the column, find an operation to get the column from the previous one. 
 */
var repSelectList = []; var leafSelectList = [];
var infer = function() {
	var ci = parseInt($(this).parent().attr("col_id"));
	console.log(ci);
	var inputVector = _.filter(variables[ci-1],function(v) { return v; });
	var outputVector = _.filter(variables[ci],function(v) { return v; });
	var argumentVector = $.parseJSON($("wg_cell_arg[col_id='"+ci+"'][row_id='arg']").text());
	argumentVector = (argumentVector)? argumentVector:[ ];
	var inferredProgram = GenerateProcedure(inputVector,outputVector,argumentVector);
	console.log(inferredProgram);
	operations[ci] = inferredProgram;
	var op_list = $(".wg_cell_op[col_id='"+ci+"'] > .op_list_inferred");
	$(op_list).empty();
	_.each(inferredProgram, function(p,i) {
		var op= $("<a ci='"+ci+"' oi='"+i+"'>["+i+"]</div>").appendTo(op_list);
		$(op).click(function() {    
			runProgram($(this).attr('ci'),$(this).attr('oi'));	
		});
		// define hovering event of each operation
		$(op).hover(function() {
			var operation = operations[$(this).attr('ci')][$(this).attr('oi')];
			// if the operation is selection query
			if('q_rep' in operation) {
				var repList = $(operation['q_rep']);
				_.each(repList, function(e) {
					var newSelection = new SelectionBox();
					newSelection.highlight(e);
					repSelectList.push(newSelection);
					var leafList = $(e).find(operation['q_leaf']);
					_.each(leafList, function(leaf) {
						var newSelection = new SelectionBox(1,'#FF9999');
						newSelection.highlight(leaf);
						leafSelectList.push(newSelection);
					},this);
				});
			}
			// if the operation is transform query
			
			
		}, function() {
			_.each(repSelectList, function(l) { l.destroy(); });
			_.each(leafSelectList, function(l) { l.destroy(); });
			repSelectList = [];  leafSelectList=[];
		});
		
	},this);
	
	
}

var runProgram = function(ci,oi) {
	var op = operations[ci][oi];
	console.log(op);
	// if op is selection query
	if('q_rep' in op) {
		var repList = $(op['q_rep']);
		_.each(repList, function(rep,ri) {
			var leafNode = (op['q_leaf']!=" ")?$(rep).find(op['q_leaf'])[0] : $(rep);
			variables[ci][ri] = leafNode;
			$(selectCell(ci,ri)).text("<"+$(leafNode).prop("tagName")+">"+$(leafNode).text());		
		},this);
	}
}

/*	It allows users to extract data from any web pages by selection  	
 */ 
var flag_inspect=false;
var focused_cell = null;
var toggleInspect = function() {  if(flag_inspect) inspector("off"); else inspector("on");  };
var inspector = function(sw) {
	if(sw=="on") {
		$('body').on('mouseover','*:not(".wikigram_container, .wikigram_container *")',function(e) {
			if(!selectionBox) selectionBox = new SelectionBox();
			e.stopPropagation();
			selectionBox.highlight(e.target);
			//count++; 
		});
		$('body').on('mouseout','*:not(".wikigram_container, .wikigram_container *")',function(e) {
			e.stopPropagation();
			//$(e.target).removeClass("shadow_blue");
			selectionBox.hide();
			//count++; 
		});
		$('body').on('click','*:not(".wikigram_container, .wikigram_container *")',function (e) {
			e.preventDefault();
			e.stopPropagation();
			//$(e.target).attr("inspector_selected",true);
			selectElement(e.target);	// add to el_selected
		});
		flag_inspect = true;
		selectionBox = SelectionBox();
	} else {
		$('body').off('mouseover');
		$('body').off('mouseout');
		$('body').off('click');
		selectionBox.destroy();
		flag_inspect = false;
	}
};
var focusMove = function(col_id,row_id) {
	$(".wg_cell").removeAttr('focused');
	var selectedCell = selectCell(col_id,row_id); 
	focused_cell = selectedCell;
	console.log("cell (col:"+col_id+", row:"+row_id+") focused.");
	$(selectedCell).attr('focused','true');
}
var focusMoveNextCell = function() {
	var cur_row = $(focused_cell).attr("row_id");
	var cur_col = $(focused_cell).attr("col_id");
	focusMove(cur_col,""+(parseInt(cur_row)+1));
}
/*
 *  when user clicks a DOM element, it stores the element in the currently focused cell
 */
var selectElement = function(el) {
	if(!focused_cell) return;
	var ci = $(focused_cell).attr("col_id"); var ri = $(focused_cell).attr("row_id");
	console.log("element "+$(el).attr("class") + " selected."); 
	variables[ci][ri] = el;
	$(selectCell(ci,ri)).text($(el).text());
	focusMoveNextCell();
}
var selectCell = function(ci,ri) {
	return $(".wg_cell[col_id='"+ci+"'][row_id='"+ri+"']")[0];
}	




/*   GENEARTOR
 * 
 */


/* GenerateProcedure:
 * 		I: input variable. array of values or HTMLelements
 * 		O: output variable. array of values or HTMLelements
 * 		C: clues. array of values
 * 		Returns a list of programs that can create O from I 
 */
var GenerateProcedure = function(I,O,C) {
	var P;	// a set of program found
	if(isDomList(I)) {  // if I a DOM list
		P={type:'Select',program: GenerateSelect(I,O)};
	} else { // I is a variableList
		if(isDomList(O)){
			// only OUTPUT is nodeType
			P={type:'Create', program: GenerateCreate(I,O)};
		} else P={type:'Transform', program: GenerateTransform(I,O,C)};
	}
	return P;
}

var GenerateSelect = function(I,O) {
	var Q={}; // key: output index,  value: query object
	$.each(O, function(oi,o) {
		var D_leaf;	// array of all leaf nodes matching with o
		if(_.isString(o) || _.isNumber(o)) {	// it it looks for string or number variable
			D_leaf = $.makeArray($("*:contains('"+o+"')"));	
			D_leaf = _.filter(D_leaf, function(d) {
				return ($(d).justtext().indexOf(o)!=-1);
			});
		} else if(o.nodeType) { // if the output looking for is DOM element
			D_leaf = [o];
		}
		$.each(D_leaf, function(dli,d_leaf) {
			var D_rep = $(d_leaf).add($.makeArray($(d_leaf).parents()));
			// for each d, create path for it and its siblings
			$.each(D_rep, function(di,d_rep) {
				// first, check whether D_rep has many siblings having similar fingerprint of their strucutre
				if(["HTML","BODY"].indexOf($(d_rep).prop("tagName"))!=-1) return;
				var q_rep, q_leaf, q_attr;
				var f_rep = $(d_rep).fingerprint();
				var d_sib = _.filter($(d_rep).parent().children(), function(child) {
					return $(child).fingerprint()==f_rep;
				},this);
				// check D_rep is i-th element among D_sib
				if($(d_sib).index(d_rep)==oi) {
					// q_rep is the path from I to d_sib
					q_rep = $(d_rep).pathWithClass();
					// q_leaf is the path from q_rep to d_leaf
					if($(d_leaf).fingerprint()==$(d_rep).fingerprint()) { // if d_rep is the leaf node, 
						q_leaf = " ";
					} else {
						q_leaf = $(d_leaf).leafNodePath(d_rep);
					} 
					// q_attr is the attribute key of d_leaf for getting o
					q_attr = "text";
					if(!(oi in Q)) Q[oi] = [];
					Q[oi].push({type:"PositionQuery", "q_rep":q_rep,"f_rep":f_rep,"q_leaf":q_leaf,"q_attr":q_attr,"num_siblings":d_sib.length});
				}
			});	// each D_rep
		});	// each D_leaf
	}); // each O
	// Q[index of output][q1,q2,q3] -->  Q[q1 which appears in all the output]
	var qDict = {};
	_.each(Q, function(qList,i) {
		_.each(qList, function(q, j) {
			var qStr = JSON.stringify(q);
			if(!(qStr in qDict)) qDict[qStr]=0;
			qDict[qStr] = qDict[qStr]+1;
		},this);
	},this);
	var qList_valid = [];
	_.each(qDict, function(num,qStr) { if(num==O.length) qList_valid.push($.parseJSON(qStr)); }, this);
	return qList_valid;
}

var GenerateTransform = function(Vin,Vout,Vargs) {
	var T = [];  // candidate transformations
	if(Vin.length==Vout.length) {
		// if Vout can be a permutation of Vin, then generatePermutation
		if(isPermutation(Vin,Vout)) {
			T= _.union(T,GeneratePermutation(Vin,Vout,Vargs));
		} 
		// find map 
		T=_.union(T,GenerateMap(Vin,Vout,Vargs));
	} else if(Vin.length>Vout.length) {
		// filter or aggregate
		if(Vout.length==1) T.push(GenerateAggrExpr(Vin,Vout,Vargs));
		T= _.union(T,GeneratePredicate(Vin,Vout,Vargs));
	} 
	return T;
}


var GenerateMap = function(Vin,Vout,Vargs) { // both values, and lengths are same
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
}

var GenerateStringExpr = function(Vin,Vout,Vargs) {
	// it tries to extract the Vout from Vin using Vargs
	// one case is that Vargs is the string constant token that the extraction starts with or before
	console.log("GenerateStringExpr");
	var Rargs = GenerateRegex(Vargs);
	Rargs =  _.union(Rargs,RegexProduct(Rargs));  // add combinatoric regexp using arguments 
	var Rout = GenerateRegex(Vout);
	var validExpr = []; // array to return 
	// try match, substring, remove on Vin to create Vout
	var candidateExpr = [
		function(el) { return el.match(this.reg);  },  function(el) { return el.replace(this.reg,"");  },
		function(el) { 
			var rr = new RegExp(".*"+this.reg.source+".*");
			console.log("[["+rr.source+"]] "+ el.replace(rr,"$1"));
			return el.replace(rr,"$1"); 
		}   
	];
	// now try candidateMapExpr and return all that output Vout. 
	_.each(candidateExpr, function(expr) {	// try every candidate
		_.each(Rargs, function(reg) {
			console.log(reg.source + ":" + _.map(Vin, expr,{'reg':reg}).join("  ,  "));
			if(isSameArray(_.map(Vin, expr,{'reg':reg}),Vout,"ALLOW_PARTIAL_OUTPUT")) validExpr.push({'type':'StringExpr','expr':expr,'reg':reg}); 
		},this);
	},this);
	return validExpr;
}

var GeneratePredicate = function(Vin,Vout,Vargs) {
	var validPredicates=[];
	if(_.isString(Vin[0])){  // String case : check Vin contains or not contains the Varg
		var Rargs = GenerateRegex(Vargs);
		var candidatePredicates = [
			function(el) { return _.filter(Rargs, function(reg) { return (el.match(reg)!=null); },this).length>0; },	// Vin[i] that matches with at least one regex of Vargs 
			function(el) { return _.filter(Rargs, function(reg) { return (el.match(reg)!=null); },this).length==0; }   	// Vin[i] that matches with no regex of Vargs
		];
	} else if(_.isNumber(Vin[0])) {	// Number case
		var arg = Vargs[0];
		var candidatePredicates = [		// try arithmetic comparison operators
			function(el) { return el > arg; }, function(el) { return el < arg; }, function(el) { return el == arg; }, function(el) { return el <= arg; },
			function(el) { return el >= arg; }, function(el) { return el != arg; }, function(el) { return el % arg==0; } 
		];
	} else if(_.isBoolean(Vin[0])) {	// Boolean case is useful to filter true/false cases 
		var candidatePredicates = [  
			function(el) { return el; },   function(el) { return !el; }	
		];
	}
	// now try candidatePredicates and return all that output Vout. 
	_.each(candidatePredicates, function(pred) {
			var filteredIn = _.filter(Vin, pred);
			if (isSameArray(filteredIn,Vout)) validPredicates.push({'type':"Filter",'expr':pred}); 
		},this);
	return validPredicates;
}
var GenerateAggrExpr = function(Vin,Vout,Vargs) {
	var validExpr = [];
	console.log("generateAggrexpr");
	var reg = GenerateRegex(Vargs);
	if(_.isString(Vin[0])) {
		if(_.isNumber(Vout[0]) && Vout.length==1) {
			var candidateAggrExpr = [ 
				function(memo, el, i, list) { return ((el.match(reg[0]))? memo+1 : memo); }, // count strings containing reg
				function(memo, el, i, list) { return (!(el.match(reg[0]))? memo+1 : memo); } // count strings not containing reg
	 		];
	 		_.each(candidateAggrExpr, function(expr) {
	 			if(_.reduce(Vin, expr, 0)==Vout[0]) validExpr.push({'type':'reduceFromZero','expr':expr}); 
	 		},this);
		} else if(_.isString(Vout[0]) && Vout.length==1) {
			var candidateAggrExpr = [
				function(memo, el, i, list) { return memo + ","+el; },   // [a,b,c] --> "a,b,c"
				function(memo, el, i, list) { return memo + el; },    // [a,b,c] --> "abc"
				function(memo, el, i, list) { return memo + Vargs[0] + el; }    // [a,b,c]&["-"] --> "a-b-c"
			];	
			_.each(candidateAggrExpr, function(expr) {
				if(_.reduce(Vin, expr, "")==Vout[0]) validExpr.push({'type':'Concatenate','expr':expr});
			},this);
		}
	} else if(_.isNumber(Vin[0])) {
		if(_.isNumber(Vout[0]) && Vout.length==1) {
			var candidateAggrExpr = [
				function(memo, el, i, list) { return memo + el; }, // sum
				function(memo, el, i, list) { return memo + 1; }, // count
				function(memo, el, i, list) { return memo + Vargs[0]; }, // weighted sum 
				function(memo, el, i, list) { return memo + (el/list.length); }, // avg
			];	
			_.each(candidateAggrExpr, function(expr) {
	 			if(_.reduce(Vin, expr, 0)==Vout[0]) validExpr.push({'type':'reduceFromZero','expr':expr}); 
	 		},this);
		}
	} else if(_.isBoolean(Vin[0])) {
		if(_.isNumber(Vout[0]) && Vout.length==1) {
			var candidateAggrExpr = [
				function(memo, el, i, list) { return (el)? memo+1: memo; }, // count true 
				function(memo, el, i, list) { return (!el)? memo+1: memo; }, // count false 
			];	
			_.each(candidateAggrExpr, function(expr) {
	 			if(_.reduce(Vin, expr, 0)==Vout[0]) validExpr.push({'type':'reduceFromZero','expr':expr}); 
	 		},this);
		}
	}
	return validExpr;
}
var GeneratePermutation = function(Vin,Vout,Vargs) {
	var validExpr = [];
	if(isSameArray(Vin.sort(),Vout)) validExpr.push({'type':'Sort','direction':'asc'});
	if(isSameArray(Vin.sort().reverse(),Vout)) validExpr.push({'type':'Sort','direction':'desc'});
	return validExpr; 
}
var GenerateArithExpr = function(Vin,Vout,Vargs) {
	console.log("GenerateArithExpr");
	var validExpr = [];
	var arg = Vargs[0];
	var candidateExpr = [		// try arithmetic operators
			function(el) { return el + arg; }, function(el) { return el - arg; }, function(el) { return el * arg; }, function(el) { return el / arg; },
			function(el) { return el ^ arg; }, function(el) { return el % arg; }  
		];
	_.each(candidateExpr, function(expr) {	// try every candidate 
	 			if(isSameArray(_.map(Vin, expr),Vout)) validExpr.push({'type':'ArithExpr','expr':expr}); 
	 		},this);
	return validExpr;
	
}
var GenerateCreate = function(Vin,Vout) {
	
}
var GenerateRegex = function(stringList) {
	// for now, just treat everything as constant
	return _.map(stringList,function(str) { return (_.isRegExp(str))? str: new RegExp(str,"g"); });	
}






///////////////////////////////////////////////////////////////////////////
// HELPER METHODS ///
///////////////////////////////////////////////////////////////////////////
jQuery.fn.justtext = function() {
    return $(this).clone()
            .children()
            .remove()
            .end()
            .text();
};
jQuery.fn.fingerprint = function() {
	var  childrenPrint = "";
	if($(this).children().length>0) 
		var childrenPrint = "["+ _.reduce($(this).children(), function(memo,child) {
			return memo + "," + $(child).fingerprint(); 
		},"") +"]";
	return $(this).prop("tagName")+childrenPrint;
}
jQuery.fn.pathWithClass = function() {
	return _.reduce($(this).parents(), function(memo,p) { 
			return $(p).tagNth()+" > "+memo;  
	},$(this).prop("tagName"));
}
jQuery.fn.leafNodePath = function(d_rep) {
	return _.reduce($(this).parentsUntil(d_rep), function(memo, p) {
		return $(p).tagClassNth()+" "+memo;
	},$(this).tagClassNth());
}
jQuery.fn.path = function() {
	return _.reduce($(this).parents(), function(memo,p) { 
			return $(p).tag()+" "+memo;  
	},"");
}
jQuery.fn.tagClassNth = function() {
	var tag = $(this).prop("tagName");
	if ($(this).attr("class"))  var cls = "."+$(this).attr("class").trim().replace(/\s+/g,"."); 
	else var cls="";
	var siblings = $(this).parent().children();
	if(siblings.length>1) {
		var nth = ":nth-child("+(siblings.index(this)+1)+")";	
	} else nth = "";
	return tag+cls+nth;		
}
jQuery.fn.tagNth = function() {
	var tag = $(this).prop("tagName");
	//if ($(this).attr("class"))  var cls = "."+$(this).attr("class").trim().replace(/\s+/g,"."); 
	//else var cls="";
	var siblings = $(this).parent().children();
	if(siblings.length>1) {
		var nth = ":nth-child("+(siblings.index(this)+1)+")";	
	} else nth = "";
	return tag+nth;		
}
jQuery.fn.tagAndClass = function() {
	var q = $(this).prop("tagName");
	if ($(this).attr("class")) q = q+"."+$(this).attr("class").trim().replace(/\s+/g,".");
	return q;
}
jQuery.fn.tag = function() {
	var q = $(this).prop("tagName");
	return q;
}
var RegexProduct = function(rlist) {
	var resultReg=[];  var rL = _.union(rlist,/^/);  var rR = _.union(rlist,/$/); 
	for(var i in rL) {
		for(var j in rR) {
			if(rL[i]==rR[j]) continue;
			resultReg.push(new RegExp(rL[i].source+"(.*)"+rR[j].source,"g"));
		}
	}
	return _.uniq(resultReg);
}
var isDomList = function(list) {
	return (list[0].nodeType!=null);	
}
var isValueList = function(list) {
	return (list[0].nodeType==null);	
}

var isSameArray = function(a1, a2, option) {
	var aa1=a1; var aa2=a2;
	if(option=="ALLOW_PARTIAL_OUTPUT") { aa1 = a1.slice(0,a2.length); aa2=a2; }
	if(aa1.length != aa2.length) return false;
	for(var i=0;i<aa1.length;i++) {
		if(aa1[i]!=aa2[i]) return false;
	}
	return true;
}
var isPermutation = function(a1, a2) {
	if(a1.length != a2.length) return false;
	var a2c = a2.slice(0);
	for(var i=0;i<a1.length;i++) {
		if(a2c.indexOf(a1[i])==-1) return false;
		a2c = remove(a2c,a1[i]);
	}
	if (a2c.length>0) return false;
	return true;
}
var remove = function(list, removeItem) {	
	return jQuery.grep(list, function(value) {
	  return value != removeItem;
	});
}				
var obj2text = function(obj) {
	var objType = getType(obj);
	if (objType=='array') {
		return _.map(obj, obj2text).join(", ");
	} else {
		if(objType=='element') return dom2text(obj);
		else if(objType=='function') return 'function';
		else return JSON.stringify(obj);
	}
}
var dom2text = function(dom) {
	return $(dom).text();
	//return $("<div>").append($(dom).clone()).remove().html();
}
var str2value = function(str) {
	var list = str.replace(/\"/g,"").split(",");
	parsedList = _.map(list, function(e) {
		e = $.trim(e);
		if(_.isNaN(parseFloat(e))) return e;
		else return parseFloat(e);
	}); 
	return parsedList;
}
if(typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}
var makeid = function() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 5; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

