/**
 * wg
 * top-level object of Wikigram extension
 *
 * Copyright (c) 2013 Tak Yeon Lee
 */
var wg = {
	status: false,
	selectedElement: null,
	hoveredElement: null,
	selectionStatus: false,
	selectionBox: null,
	generator:null,
	language:null,
	sample:null,
	program: null,
	tab: null,
	loaders: [],
	/*
	 *  Initialize wikigram worksheet
			prog : initial content of worksheet operations. will be used when loading predefined or existing program 
			tabInfo :	widget UI and how the progrm would work depends on whether the tab is 'master' or 'child'
						'master' tabs can have something like run/save functionalities.
						'child' tabs will have 'save&close' to return the procedure back to it's master tab.
	 */
	init: function(prog, tabInfo) {
		// initialize program
		console.log("wg created");
		// initialize generator
		//console.log("generator created");
		this.generator = new wg.Generator();
		if(prog) {
			this.program = prog;
		} else {
			this.program = new this.Program();
			this.program.init();
		}
		this.tab = tabInfo;
		//console.log("wg program initiated");
		this.program.setVariable({s:0,c:0,r:0},$("html")[0]);
		// initialize widget UI
		//console.log("widget initiated");
		this.widget.init(this.program.sheets);
	},
	/*
	 *  Reset
	 */
	reset: function() {
		wg.init();
	},
	/**
	 * Open / close wg
	 */
	toggle: function() {
		if (this.status === true)
			this.close();
		else
			this.open();
	},
	open: function() {
		this.status = true;
		this.widget.open();
		this.enableSelection();
	},
	close: function() {
		this.status = false;
		this.widget.close();
		this.disableSelection();
	},
	/*	
		send current operations to the master worksheet
	*/
	save: function() {
		var opList = wg.program.getOperations({s:0, c:0, r:0});
		if(opList && opList!==[] && wg.tab.from && wg.tab.targetColumnPosition) {
			returnSubProcedure(opList,wg.tab.from,wg.tab.targetColumnPosition);
		}
	},
	toString: function() {
		return this.program.toString();
	}
};