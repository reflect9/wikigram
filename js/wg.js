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
	loaders: [],
	/*
	 *  Initialize wikigram worksheet
	 */
	init: function(prog) {
		// initialize program
		console.log("wg created");
		if(prog) {
			this.program = prog;
		} else {
			this.program = new this.Program();
			this.program.init();
		}
		console.log("wg program initiated");
		this.program.setVariable({s:0,c:0,r:0},$("html")[0]);
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