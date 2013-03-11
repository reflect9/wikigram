/*
 * wg.operation is a unit of programmable piece in wg 
 *   it accepts an input vector and returns output. 
 */

wg.Operation = function() {
	this.title = "empty";
	this.procedure = null;
	this.init = function(op) {
		if(op) {
			this.procedure = op;
			this.title = op.type;
		}
		return this;
	};
	this.run = function(I, A) {
		return wg.runner.run(I,this.procedure,A);
	};
};
/*
 * wg.runner is a general purpose runner for a pair of an input and an operation
 */
wg.runner = {
	/*
	 *	top-level function  
	 */
	run: function(I,procedure) {
		if(procedure.type=='Select') {
			return this.select(I,procedure.query);
		} else if(procedure.type=='Transform') {
			return this.transform(I,procedure.expression);
		} else if(procedure.type=='Create') {
			//return this.create(I,op.operation);
		}
	},
	select: function(I,query) {
		if(query.type=="PositionQuery") {
			// for each input that is DOM element, it runs the position query
			var siblings = _.map(_.filter(I,isDom),function(i) {
				if (query.path==="") return $(i);
				else return $.makeArray($(i).find(query.path));
			});
			return _.flatten(siblings,true);  // flatten a single level
		} else if(query.type=="Attribute") {
			return _.map(I, function(el) { return el.attr(query.key); });
		} else{
			return [];
		}
	},
	transform: function(I, expr) {
		if(expr.type=="Filter") {
			return _.filter(I,expr.pred);
		} else if(expr.type=="Aggregate") {
			return [_.reduce(I,expr.expr,expr.init)];
		} else if(expr.type=="Map") {
			return this.map(I,expr);  // run operation (match,replace,replaceWithin) with regex
		} else if(expr.type=="Sort") {
			return (expr.direction=="asc")? I.sort() : I.sort().reverse();
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
