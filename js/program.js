/*
 * wg.Program contains row and operations of an enhancement
 *     it's independent from UI widget.  It can run on background.
 */
wg.Program = function() {
	this.sheets = [];	// a program may have multiple sheets shown top-to-bottom (like sound recording tracks)
	/*
	 *  initialization
	 */
	this.init = function() {
		this.sheets = [];
		this.addSheet();
	};
	this.load = function(definition) {
	};
	/*
	 * delete all row and operations
	 */
	this.reset = function() {
	};
	this.setVariable = function(pos,value) {
		var column = this.sheets[pos.s].columns[pos.c];
		column.row[pos.r] = value;
		column.inferAll();	// updates in/outbound operation candidates of the column 
	};
	this.getVariable = function(pos) {
		return this.sheets[pos.s].columns[pos.c].row[pos.r];
	};
	this.setArgument = function(pos,value) {
		this.sheets[pos.s].columns[pos.c].args = value;
	};
	this.getArgument = function(pos) {
		return (pos)? this.sheets[pos.s].columns[pos.c].args: null;
	};
	this.getColumn = function(pos) {
		return (pos)? this.sheets[pos.s].columns[pos.c]: null;
	};
	this.getRow = function(pos) {
		return (pos)? $(this.sheets[pos.s].columns[pos.c].row).trimArray() : [];
	};
	this.clearCandidate = function() {
		_.each(this.sheets, function(sh) {
			_.each(sh.columns, function(col) {
				col.creatorSignature=null;
			});
		});
	};
	// pos and row for all columns
	// for generator to create input candidates
	this.getAllRows = function() {
		var allData = _.map(this.sheets, function(s,si) {
			var a = _.map(s.columns, function(c,ci) {
				var validRows = $(c.row).trimArray();
				if(validRows==[]) return null;
				else return {pos:{s:si,c:ci,r:0},row:validRows};
			});
			return a;
		});
		return _.filter(_.flatten(allData),function(obj){return obj.row.length>0;});
	};
	// returns a list of operations from all the columns 
	this.getOperations = function(pos) {
		pos= (pos)? pos:{s:0,r:0,c:0};
		var nonEmptyColumns = _.filter(this.sheets[pos.s].columns, function(col,i) {
			return i>0 && col.operation.description!==".";
		});
		var opList = _.map(nonEmptyColumns, function(col) {
			return col.operation;
		});
		return opList;
	};
	// creates multiple columns from the operation list and insert them at the pos
	this.insertOperations = function(pos,opList) {
		this.sheets[pos.s].insertColumnsFromOperations(pos.c+1,opList);
	};
	/*
	 * create an empty sheet at the bottom
	 */
	this.addSheet = function() {
		var ns = new wg.Sheet();
		ns.init();
		this.sheets.push(ns);
	};
	/*
	 * remove a sheet from sheets
	 */
	this.removeSheet = function(indexToRemove) {
		this.sheets = _.filter(this.sheets, function(s,i) { return i!=indexToRemove; },this);
		this.redraw();
	};
	this.toString = function() {
		return _.map(this.sheets, function(s) { return s.toString(); });
	};
};