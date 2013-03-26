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
		this.sheets[pos.s].columns[pos.c].row[pos.r] = value;
	};
	this.getVariable = function(pos) {
		return this.sheets[pos.s].columns[pos.c].row[pos.r];
	};
	this.setArgument = function(pos,value) {
		this.sheets[pos.s].columns[pos.c].args = value;
	};
	this.getArgument = function(pos) {
		return this.sheets[pos.s].columns[pos.c].args;
	};
	this.getColumn = function(pos) {
		return this.sheets[pos.s].columns[pos.c];
	};
	this.clearCandidate = function() {
		_.each(this.sheets, function(sh) {
			_.each(sh.columns, function(col) {
				col.creatorSignature=null;
			});
		});
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