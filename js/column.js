/*
 * wg.vector is a list of variables that can contain DOM element, Number, String, and Boolean.
 * 		 
 * 
 */

wg.Column = function() {
	this.sheet = null;
	this.row = [];
	this.sourceColumn = null;
	this.operation = null; 
	this.candidateOperations = [];  // 
	this.arguments = []; // arguments can be a list of values
	
	this.init = function() {
		this.row = _.map(_.range(50), function() { return null; });
		this.type = null;
	}; 
	
	this.infer = function() {
		// use sourcecolumn and current row to infer candidateOperations
		var input = $(this.prev().row).trimArray();
		var output = $(this.row).trimArray();
		var argument = this.arguments;
		var inferredPrograms = wg.generator.GenerateProcedure(input,output,argument);
		// inferredPrograms have 'type' and 'program'(array)	
		this.candidateOperations = inferredPrograms;
		// tell widget to show this column's candidates
		var pos = {s:wg.program.sheets.indexOf(this.sheet),  c:this.sheet.columns.indexOf(this), r:null};
		wg.widget.showCandidates(pos);
	}
	this.prev = function() {
		var myIndex = this.sheet.columns.indexOf(this);
		if(myIndex>0) return this.sheet.columns[myIndex-1];
	}
	this.next = function() {
		var myIndex = this.sheet.columns.indexOf(this);
		if(myIndex<this.sheet.columns.length-1) return this.sheet.columns[myIndex+1];
	}
	this.setOperation = function(op) {
		this.operation = op;
	}
	this.run = function() {
		this.row = this.operation.run(this.sourceColumn.row);
	}
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
		return [this.arguments,this.row];
	}
};
