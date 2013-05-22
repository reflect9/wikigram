/**
 * wg
 * top-level object of Wikigram extension
 *
 * Copyright (c) 2013 Tak Yeon Lee
 */
wg = {
	templates:{},
	enhancements:[],

	init: function(tabInfo) {
		wg.generator= new wg.Generator();
		wg.language= new wg.Language();
		wg.panel= new wg.Panel();
		if(tabInfo) wg.tab = tabInfo;
		async.series([
			wg.loadTemplates,
			wg.loadEnhancements,
			wg.redraw
		]);
	},
	redraw: function() {
		wg.panel.redraw();
	},
	loadTemplates: function(callback) {
		async.series([
			function(callbackLoadFile) {
				loadFile('template/panel-template.html',function(temp) {
					wg.templates.panel=temp;
					callbackLoadFile(null,true);
				});
			},
			function(callbackLoadFile) {
				loadFile('template/stage-template.html',function(temp) {
					wg.templates.stage=temp;
					callbackLoadFile(null,true);
				});
			},
			function(callbackLoadFile) {
				loadFile('template/nav-template.html',function(temp) {
					wg.templates.nav=temp;
					callbackLoadFile(null,true);
				});
			},
			function(callbackLoadFile) {
				loadFile('template/tool-template.html',function(temp) {
					wg.templates.tool=temp;
					callbackLoadFile(null,true);
				});
			}
		], function(err,result) {
			callback(null,true);
		});
	},
	loadEnhancements: function(callback) {
		var listOfEnhancementData = wg.SampleEnhancements;  // just for now. 
		wg.enhancements = _.map(listOfEnhancementData, function(enhData) {
			var nE = new wg.Enhancement();
			nE.load(enhData);
			return nE;
		});
		var defaultEnhancement = wg.enhancements[0];
		wg.panel.stage.setEnhancement(defaultEnhancement);
		callback(null,true);
	},
	getEnhancement: function(enhID) {
		return _.find(wg.enhancements, function(enh){return enhID==enh.id;});
	},
	openEnhancement: function(enhID) {
		var enh = wg.getEnhancement(enhID);
		wg.panel.stage.setEnhancement(enh);
		// updated selectedness of the enhancement
		_.each(wg.enhancements, function(enh){ enh.selected=false; });
		enh.selected=true;
		// 
		wg.redraw();
	},
	createEnhancement: function() {
		console.log("create method run");
		var nE = new wg.Enhancement();   nE.reset();	wg.enhancements.push(nE);
		wg.redraw();
	},
	reset: function() {
		wg.init();
	},
	toggle: function() {
		if (wg.status === true)
			wg.close();
		else
			wg.open();
	},
	/*	
		send current operations to the master worksheet
	*/
	save: function() {
		console.error("TBD:not implemented");
		// var opList = wg.program.getOperations({s:0, c:0, r:0});
		// if(opList && opList!==[] && wg.tab.from && wg.tab.targetColumnPosition) {
		//	returnSubProcedure(opList,wg.tab.from,wg.tab.targetColumnPosition);
		// }
	},
	toString: function() {
		console.error("TBD:not implemented");
		// return wg.program.toString();
	},
	/*
		Scroll the page to show el at the center, and show highlight box
	*/
	highlightElement: function(el,options) {
		if(options && options.scroll) {
			// scroll the page to show the element
			scrollToElement($('body'),el,{duration:200,marginTop:50});
		}
		// create highlightBox if not exist, and run
		if(!wg.elementHighlightBox) wg.elementHighlightBox = new wg.SelectionBox(2,"blue");
		wg.elementHighlightBox.highlight(el);
	},
	unhighlightElement: function(el,options) {
		wg.elementHighlightBox.hide();
	}



};