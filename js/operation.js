/*
 * wg.operation is a unit of programmable piece in wg 
 * 		it accepts an input vector and returns output. 
 */

wg.Operation = function() {
	this.description = null;
	this.procedure = null;
	
	this.init = function(op) {
		this.procedure = (op&&op.procedure)? op.procedure : "";
		this.description = (op&&op.description)? op.description : "";
	}
	
	this.run = function(I) {
		return wg.runner.run(I,this.argument);
	};
	
}

/*
 * 	wg.runner is a general purpose runner for a pair of an input and an operation
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
			var siblings = $(I).find(query.path);
			// also can extend to check the fingerprint. (TBD)
			return $.makeArray(siblings); // it returns a list of DOM elements selected by JQuery  
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
	
	
}
