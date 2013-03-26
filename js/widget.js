/*
 * wg.widget
 *
 * worksheet data table UI and event handling
 */
wg.widget = {
	container: null,
	content: null,
	toolbar: null,
	palette: null,
	showPopup: true,
	previousCellValue: null,
	btn_inspect: null,
	cellSelectionBox: null,			// highlight box for highlighting DOM of the cell content
	candidateBox:null,				// floating UI box for showing candidate operations for one column
	focus: {s:null,c:null,r:null},	// focused cell's sheet, column, row id
	// Initialize widget UI
	init: function(sheets) {
		if(!sheets) {   sheets = [new wg.Sheet()];   sheets[0].init();  }
		if(this.container) $(this.container).remove();
		this.container= $("<div class='wikigram_container'></div>").appendTo("body");
		this.content = $("<div id='wikigram_content'></div></div>").appendTo(this.container);
		// create toolbar
		this.toolbar = $("<div id='wikigram_toolbar'></div>").appendTo(this.content);
		// append toolbar buttons
		this.btn_inspect = $("<button class='btn' id='but_inspect'>inspect</button>").appendTo(this.toolbar).click(wg.inspector.toggle);
		this.btn_reset = $("<button class='btn' id='but_reset'>reset</button>").appendTo(this.toolbar).click(wg.reset);
		// create data table
		this.palette = $("<div id='wikigram_palette'></div>").appendTo(this.content);
		this.updatePalette(sheets);
		if(wg.inspector.flag_inspect) wg.inspector.off();
		this.attachEventHandlers();
		// add additional blank space at the end of body
		$("body").append("<div class='placeholder' style='display:block; height:340px; width:100%;'></div>");
	},
	// update the presentation using current program
	redraw: function() {
		this.updatePalette(wg.program.sheets);
	},
	// delete existing sheets and create new palettes.
	updatePalette: function(sheets) {
		//backupProgram(wg.program);  // backup the program to the background.js
		$(this.palette).find("div.wg_sheet").remove();
		_.each(sheets, function(sheet) {
			$(this.palette).append(this.createSheet(sheet));
		},this);
		$(".wg_sheet").scroll(function(e) {
			wg.widget.locatePopup();
		});
	},
	updateColumn: function(pos) {
		// change the column DIV, assuming that the column data is updated
		var colDiv = this.getColumnDiv(pos);
		var colData = wg.program.sheets[pos.s].columns[pos.c];
		$(colDiv).before(this.createColumn(colData));
		$(colDiv).remove();
	},
	// return DIV of a sheet element (looks like a single track of garageband)
	createSheet: function(sheet) {
		var sheetElement = $("<div class='wg_sheet'></div>");
		var sheetHeader = $("<div class='wg_sheet_header'></div>").appendTo(sheetElement);
		var columnContainer = $("<div class='wg_sheet_columns'></div>").appendTo(sheetElement);
		_.each(sheet.columns, function(column,ci) {
			$(columnContainer).append(this.createColumn(column));
		},this);
		return sheetElement;
	},
	// return DIV of the column representing the column
	createColumn: function(column) {
		var col = $("<div class='wg_column'></div>");
		var header = $("<div class='wg_cell wg_cell_header' row_id='header'></div>").appendTo(col);
		var tools = $("<div class='wg_cell_tools'></div>").appendTo(header);
		$(tools).append($("<i class='icon-plus icon'></i>"))
				.append($("<i class='icon-remove icon'></i>"));
		$(tools).find("i").hide();
		//$(op_row).find(".but").click();
		//var arg_row = $("<div class='wg_cell wg_cell_arg' row_id='arg' contenteditable='true'></div>").appendTo(col);
		_.each(column.row, function(v, i) {
			var newCell = wg.Cell.init(v,i);

			$(col).append(newCell);
		});
		return col;
	},
	setFocus: function(pos) {
		wg.widget.focus = pos;
		wg.widget.showOperationPopup(pos);
		$(".wg_column").attr('focused',false);
		$(wg.widget.getColumnDiv(pos)).attr('focused',true);
		wg.inspector.on();
		//wg.widget.cellSelectionBox.highlight(this.getCell(pos).el);
	},
	unsetFocus: function() {
		$(".wg_column").attr('focused',false);
	},
	// focus-related methods
	focusMove: function(directionOrPosition) {
		this.unselectAll();
		var newFocus;
		// case of position
		if(_.isObject(directionOrPosition)) {
			newFocus = directionOrPosition;
		} else {
			if(directionOrPosition=='up')	newFocus = {s:this.focus.s, c:this.focus.c, r:this.focus.r-1};
			if(directionOrPosition=='down')	newFocus = {s:this.focus.s, c:this.focus.c, r:this.focus.r+1};
			if(directionOrPosition=='right')  newFocus = {s:this.focus.s, c:this.focus.c+1, r:this.focus.r};
			if(directionOrPosition=='left')  newFocus = {s:this.focus.s, c:this.focus.c-1, r:this.focus.r};
			// force new focus within the boundary
			var focusedSheet = wg.program.sheets[this.focus.s];
			newFocus.c = Math.max(0,newFocus.c);
			newFocus.c = Math.min(focusedSheet.columns.length-1,newFocus.c);
			newFocus.r = Math.max(0,newFocus.r);
			newFocus.r = Math.min(focusedSheet.columns[this.focus.c].row.length-1,newFocus.r);
		}
		// actual operation of setting focus
		wg.widget.setFocus(newFocus);  // update the position of currently focused cell
		$(this.getCell(newFocus).el).attr('focused','true');  // show red highlight
		$(this.getCell(newFocus).el).focus();
		wg.widget.previousCellValue = $(this.getCell(newFocus).el).text();
	},
	getCellPosition: function(el) {
		var s = $(el).parents(".wg_sheet").myIndex(".wg_sheet");
		var c = $(el).parents(".wg_column").myIndex(".wg_column");
		var r;
		if($(el).hasClass("wg_cell_variable"))
			r = $(el).myIndex(".wg_cell_variable");
		else
			r = null;
		return  { s: s, c: c, r: r };
	},
	// cell methods
	getCell: function(pos) {
		return {data: wg.program.getVariable(pos),
			el: this.getCellDiv(pos)};
	},
	getCellDiv: function(pos) {
		return $(this.getColumnDiv(pos)).find(".wg_cell[row_id="+pos.r+"]")[0];
	},
	getColumnDiv: function(pos) {
		return $(this.getSheetDiv(pos)).find(".wg_column").eq(pos.c)[0];
	},
	getSheetDiv: function(pos) {
		return $(this.palette).find(".wg_sheet").eq(pos.s)[0];
	},
	unselectAll: function() {
		$(".wg_cell").removeAttr('focused');
	},
	/*
	 *  when user clicks a DOM element, it stores the element in the currently focused cell
	 */
	selectElement: function(el) {
		wg.program.setVariable(this.focus,el);
		// update cellElement text
		this.updateColumn(this.focus);
		this.focusMove("down");
	},
	/*
	*shows a pop-up of a single column's operation detail.
	*/
	showOperationPopup: function(pos) {
		wg.program.sheets[pos.s].createSnapshot();
		wg.program.clearCandidate();
		var opPopup = new wg.OperationPopup().init(pos);
		opPopup.popupContainer.css("visibility",(wg.widget.showPopup)? "visible":"hidden");
		$(wg.widget.palette).prepend(opPopup.popupContainer);
		// call generator to infer in/outbound op candidates
		var inboundCandidates =wg.program.getColumn(pos).inferInOp();
		var outboundCandidates =wg.program.getColumn(pos).inferOutOp();
		opPopup.updateBoth(inboundCandidates,outboundCandidates);
		// update position of the popup
		wg.widget.locatePopup();
	},
	/*
	*	Update positions of .wg_popup to its column .wg_sheet is scrolled.  
	*/
	locatePopup: function() {
		var popup_containers = $(".wg_popup_container");
		_.each(popup_containers, function(op) {
			var pos = {s:$(op).attr('sheetID'), c:$(op).attr('colID'), r:null};
			var columnDiv = wg.widget.getColumnDiv(pos);
			$(op).offset({top:$(op).parent().offset().top-$(op).height()-4, left:$(columnDiv).offset().left+($(columnDiv).width())-($(op).width()/2)});
		});

	},
	/*
	 * UI for selecting among candidate operations  
	 *   called after one column's candidates have been changed .
	 */
	showCandidates: function(pos,candidates) {
		wg.program.sheets[pos.s].createSnapshot();  // save current columns 
		var columnDiv = wg.widget.getColumnDiv(pos);
		// popup is a container for candidate selection UI
		var candidateWidget = new wg.Candidates().init(candidates,pos);
		$(candidateWidget).offset({top:0, left:$(columnDiv).offset().left});
		$(wg.widget.palette).prepend(candidateWidget);
	},
	attachEventHandlers: function() {
		// mouse events to cells
		$("#wikigram_palette").on('mousedown','.wg_cell_variable',function() {
			var pos = wg.widget.getCellPosition(this);
			if(wg.widget.focus.c==pos.c && wg.widget.focus.r==pos.r && wg.widget.focus.s==pos.s) {
				wg.widget.showPopup = !wg.widget.showPopup;
				console.log(wg.widget.showPopup);
			}
			console.log("Select "+$(this).text()+" that contains "+ wg.program.getVariable(pos));
			wg.widget.focusMove(pos);
			wg.widget.previousCellValue = $(this).text();
			//wg.inspector.on();
		});
		$("#wikigram_palette").on('blur','.wg_cell_variable',function() {
			var newValue = $(this).text();
			if (newValue!=wg.widget.previousCellValue) {
				console.log(wg.widget.previousCellValue + "   ->   " + newValue);
				// update variable
				var nv =txt2var(newValue);
				wg.program.setVariable(wg.widget.getCellPosition(this),nv);
				$(this).text(var2txt(nv));
			}
			//wg.inspector.off(); // automatically off inspector
			//console.log(row[$(this).attr('col_id')][$(this).attr('row_id')]);
		});
		$("#wikigram_palette").on('mouseover','.cellButton', function() {
			var pos = wg.widget.getCellPosition($(this).parents(".wg_cell_variable"));
			var data = wg.widget.getCell(pos).data;
			$(this).draggable({
				cursor: "move",
				cursorAt: { top:10, left: -20 },
				zIndex:	2000000001,	appendTo: "body",
				helper: function( event ) {
					return $("<div class='dragHelper'></div>").html($(data).clone());
				},
				start: function(event, ui) {
					wg.inspector.off();
					wg.widget.dragHelper = ui.helper;
					document.addEventListener('mouseup',wg.Cell.dragEndEventHandler,false);
				},
				stop: function(event,ui) {
					//document.removeEventListener('mouseup',$.proxy(wg.Cell.dragEndEventHandler,{ui:ui}),true);
				}
			});
		});

		// argument box
		// $("#wikigram_palette").on('blur','.wg_cell_arg',function() {
		//	var newValue = txt2var($(this).text());
		//	wg.program.setArgument(wg.widget.getCellPosition(this),newValue);
		//	$(this).text(var2txt(newValue));
		// });
		// showing seletionbox around the DOM of the cell content
		$("#wikigram_palette").on('mouseover','.wg_cell_variable',function() {
			if(!wg.widget.cellSelectionBox) wg.widget.cellSelectionBox = new wg.SelectionBox(2,"red");
			var pos = wg.widget.getCellPosition(this);
			var v = wg.widget.getCell(pos).data;
			if(v && v.nodeType!==null && v.nodeType!==undefined) {
				wg.widget.cellSelectionBox.highlight(v);
			}
		});
		$("#wikigram_palette").on('mouseout','.wg_cell',function() {
			if(wg.widget.cellSelectionBox) wg.widget.cellSelectionBox.hide();
		});
		// move around table using keypads
		$("#wikigram_palette").on('keydown','.wg_cell',function(e) {
			if(e.keyCode == 37) { //left
				wg.widget.focusMove('left');
			} else if(e.keyCode == 38) { //up
				wg.widget.focusMove('up');
			}  else if(e.keyCode == 39) { //right
				wg.widget.focusMove('right');
			}  else if(e.keyCode == 40) { //down
				wg.widget.focusMove('down');
			} else {
				return;
			}
			e.preventDefault();
			e.stopPropagation();
		});
		/*
			BUTTONS OF EACH COLUMN and OPERATION
		*/
		// INFER
		$("#wikigram_palette").on('click','.btn_infer',function() {
			var pos = {	s:$(this).parents(".wg_popup_container").attr('sheetID'),
						c:$(this).parents(".wg_popup_container").attr('colID')};
			var argument = txt2var($(this).parents(".wg_popup_container").find(".wg_op_arg").text());
			var candidateProcedures = wg.program.getColumn(pos).infer(null,null,argument);
			$("#wikigram_palette").find(".wg_popup").remove();
			wg.widget.showCandidates(pos,candidateProcedures);
		});
		// RESET COLUMN
		$("#wikigram_palette").on('click','.btn_reset',function() {
			var pos = {	s:$(this).parents(".wg_popup_container").attr('sheetID'),
						c:$(this).parents(".wg_popup_container").attr('colID')};
			wg.program.sheets[pos.s].removeColumn(pos.c);
			wg.program.sheets[pos.s].insertColumnAt(pos.c);
			wg.widget.redraw();
		});
		// REMOVE COLUMN
		$("#wikigram_palette").on('click','.icon-remove',function() {
			// var pos = {	s:$(this).parents(".wg_popup_container").attr('sheetID'),
			//			c:$(this).parents(".wg_popup_container").attr('colID')};
			var pos = wg.widget.getCellPosition(this);
			wg.program.sheets[pos.s].removeColumn(pos.c);
			wg.widget.redraw();
		});
		// INSERT COLUMN
		$("#wikigram_palette").on('click','.icon-plus',function() {
			// var pos = {	s:$(this).parents(".wg_popup_container").attr('sheetID'),
			//			c:$(this).parents(".wg_popup_container").attr('colID')};
			var pos = wg.widget.getCellPosition(this);
			wg.program.sheets[pos.s].insertColumnAt(pos.c);
			wg.widget.redraw();
		});
		$("#wikigram_palette").on('mouseover','.wg_column',function() {
			$(this).find(".wg_cell_tools").find("i").show();
		});
		$("#wikigram_palette").on('mouseout','.wg_column',function() {
			$(this).find(".wg_cell_tools").find("i").hide();
		});


		/*
			CELL EVENTS
		*/
		// operation row of each column
		$("#wikigram_palette").on('click','.wg_cell_header',function() {
			// wg.widget.showOperationPopup(wg.widget.getCellPosition(this));
			wg.widget.setFocus(wg.widget.getCellPosition(this));
		});
		// assign backspace button press event on wg_cell
		$('html').keydown(function(e) {
			if($(document.activeElement).hasClass("wg_cell_variable") &&
				//$(document.activeElement).attr("contenteditable")!==true &&
				(e.keyCode === 8 || e.keyCode === 46)   ) {
				wg.program.setVariable(wg.widget.focus,null);
				wg.widget.updateColumn(wg.widget.focus);
				wg.widget.focusMove(wg.widget.focus);
				return false;
			} else return true;
		});


	}
}