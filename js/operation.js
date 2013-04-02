/*
 * wg.operation is a unit of programmable piece in wg 
 *   it accepts an input vector and returns output. 
 */

wg.Operation = function(type, desc, expr) {
	this.type = (type)? type: ".";
	this.description = (desc)? desc: ".";
	this.inputPos = "prev"; // "prev" or pos object
	this.argPos = null; // null or "pprev" or pos object
	this.expr = (expr)? expr: null;
	this.run = function(pos) {
		var iP = (this.inputPos=="prev")? {s:pos.s, c:pos.c-1, r:0}: this.inputPos;
		var aP = (this.argPos=="prev")? {s:pos.s, c:pos.c-1, r:0}: this.argPos;
		var I = wg.program.getRow(iP);
		var A = wg.program.getRow(aP);
		return wg.runner.run(I,this,A, pos);
	};
	this.printOut = function() {
		return this;
	};
};
/*
 * wg.runner is a general purpose runner for a pair of an input and an operation
 */
wg.runner = {
	/*
	 *	top-level function  
	 */
	run: function(I,op, a, pos) {
		if(op.type=='Select') {
			return this.select(I,op.expr);
		} else if(op.type=='Transform') {
			return this.transform(I,op.expr);
		} else if(op.type=='Create') {
			return this.create(I,op.expr, a, pos);
		}
	},
	select: function(I,ex) {
		if(ex.type=="PositionQuery") {
			// for each input that is DOM element, it runs the position query
			var siblings = _.map(_.filter(I,isDom),function(i) {
				if (ex.path==="") return $(i);
				else return $.makeArray($(i).find(ex.path));
			});
			return _.flatten(siblings,true);  // flatten a single level
		} else if(ex.type=="Attribute") {
			return _.map(I, ex.expr.func);
		} else{
			return [];
		}
	},
	transform: function(I, ex) {
		if(ex.type=="Filter") {
			return _.filter(I,ex.expr);
		} else if(ex.type=="Aggregate") {
			return [_.reduce(I,ex.expr,ex.init)];
		} else if(ex.type=="Map") {
			return this.map(I,ex);  // run operation (match,replace,replaceWithin) with regex
		} else if(ex.type=="Sort") {
			return ex.expr(I);
		}
	},
	map: function(I, expr) {
		if(expr.type=="StringExpr") {
			return _.map(I,expr.oper,{'reg':expr.reg});
		} else if(expr.type=="ArithExpr") {
			return _.map(I, expr.oper);
		}
	},
	create: function(I, expr, a, pos) {
		if(expr.type=="load") {
			// initiate a new loader. return a uniq token back
			// loading URL only the top 15 
			var limitedI = _.filter(I, function(i,iIndex) { return iIndex<15; });
			var result = _.map(limitedI, function(i,iIndex) {
				if(pos) {
					pos['r'] = iIndex;
					var newLoader = new wg.Loader(i,pos);
					wg.loaders.push(newLoader);
					newLoader.run();
				}
				var waitSign = "";
				return waitSign;
			});
			return result;
		} else if(expr.type=="image") {
			return _.map(I, function(i) {
				return $("<img class='img_cell'></img>").attr("src",i).get(0);
			});
		} else if(expr.type=="text") {
			return _.map(I, function(i) {
				return $("<span></span>").text(i).get(0);
			});
		}
	}
};
