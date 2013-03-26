/*
 * wg.vector is a list of variables that can contain DOM element, Number, String, and Boolean.
 *
 *
 */
wg.Column = function() {
	this.sheet = null;
	this.row = [];
	this.inputPos = null;
	this.operation = null;
	this.candidateOperations = [];  //
	this.creatorSignature = null;
	this.args = []; // args can be a list of values
	this.init = function() {
		this.row = _.map(_.range(50), function() { return null; });
		this.operation = new wg.Operation();
		this.type = null;
		return this;
	};
	this.infer = function(i,o,a) {
		var inferredProcedures = wg.generator.GenerateProcedure(i,o,a);
		this.candidateOperations = inferredProcedures;
		console.log(inferredProcedures);
		return inferredProcedures;
	};
	this.inferInOp = function() {
		var i = $(this.prev().row).trimArray();
		var o = $(this.row).trimArray();
		var a = this.args;
		return this.infer(i,o,a);
	};
	this.inferOutOp = function(){
		var i = $(this.row).trimArray();
		var o = $(this.next().row).trimArray();
		var a = this.args;
		return this.infer(i,o,a);
	};
	this.getPos = function() {
		var mySheetIndex = wg.program.sheets.indexOf(this.sheet);
		var myColumnIndex = this.sheet.columns.indexOf(this);
		return {s:mySheetIndex, c:myColumnIndex };
	};
	this.prev = function() {
		var myIndex = this.sheet.columns.indexOf(this);
		if(myIndex>0) return this.sheet.columns[myIndex-1];
	};
	this.next = function() {
		var myIndex = this.sheet.columns.indexOf(this);
		if(myIndex<this.sheet.columns.length-1) return this.sheet.columns[myIndex+1];
	};
	this.setOperation = function(op) {
		this.operation = new wg.Operation(op.type,op.description,op.expr);
	};
	this.run = function() {
		// apply the operation to get the result
		var I = (this.inputPos)? wg.program.sheets[this.inputPos.s].columns[this.inputPos.c].row : this.prev().row;
		var result = this.operation.run(getContentAtTop(I), getContentAtTop(this.args), this.getPos());
		// extend the result to have at least 50 rows
		return mergeList(result, _.map(_.range(50), function() { return null; }));
	};
	this.push = function(v) {
		this.row.push(v);
	};
	this.pop = function(v) {
		return this.row.pop();
	};
	this.getLength = function() {
		return this.row.length;
	};
	this.toString = function() {
		return {operation: this.operation,
				inputPos: this.inputPos,
				row: _.filter(_.map(this.row, function(r) {
					if(!r) return null;
					return (isDom(r))? {
						type:"dom",
						url:$.url().attr("source"),
						html:r.outerHTML
					} :   {
						type:"variable",
						value:r
					};
				}), function(n) { return n; })
		};
	};
};
