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
	program: null,
	/*
	 *  Initialize wikigram worksheet
	 */
	init: function() {
		// initialize program
		console.log("wg created");
		this.program = new this.Program();
		console.log("wg program initiated");
		this.program.init();
		var pos = {s:0,c:0,r:0};
		this.program.setVariable(pos,$("body")[0]);
		// initialize generator
		console.log("generator created");
		this.generator = new wg.Generator();
		// initialize widget UI
		console.log("widget initiated");
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
	toString: function() {
		return this.program.toString();
	}
};