/*
 * wg.operation is a unit of programmable piece in wg 
 *   it accepts an input vector and returns output. 
 */

wg.Operation = function(type, desc, expr) {
	this.type = (type)? type: "empty";
	this.description = (desc)? desc: "empty";
	this.expr = (expr)? expr: null;
	this.run = function(I, A) {
		return wg.runner.run(I,this,A);
	};
};
/*
 * wg.runner is a general purpose runner for a pair of an input and an operation
 */
wg.runner = {
	/*
	 *	top-level function  
	 */
	run: function(I,op) {
		if(op.type=='Select') {
			return this.select(I,op.expr);
		} else if(op.type=='Transform') {
			return this.transform(I,op.expr);
		} else if(op.type=='Create') {
			return this.create(I,op.expr);
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
	}
};
