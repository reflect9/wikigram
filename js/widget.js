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
	},
	// update the presentation using current program
	redraw: function() {
		this.updatePalette(wg.program.sheets);
	},
	// delete existing sheets and create new palettes.
	updatePalette: function(sheets) {
		$(this.palette).find("div.wg_sheet").remove();
		_.each(sheets, function(sheet) {
			$(this.palette).append(this.createSheet(sheet));
		},this);
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
		var op_row = $("<div class='wg_cell wg_cell_op' row_id='op'>"+column.operation.description+"</div>").appendTo(col);
		//$(op_row).find(".but").click();
		//var arg_row = $("<div class='wg_cell wg_cell_arg' row_id='arg' contenteditable='true'></div>").appendTo(col);
		_.each(column.row, function(v, i) {
			var row = $("<div class='wg_cell wg_cell_variable' row_id='"+i+"' contenteditable='true'></div>").appendTo(col);
			$(row).text(var2txt(v));
		});
		return col;
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
		this.focus = newFocus;  // update the position of currently focused cell
		$(this.getCell(newFocus).el).attr('focused','true');  // show red highlight
		$(this.getCell(newFocus).el).focus();
		wg.widget.previousCellValue = $(this).text();
	},
	getCellPosition: function(el) {
		var s = $(el).parents(".wg_sheet").myIndex(".wg_sheet");
		var c = $(el).parents(".wg_column").myIndex(".wg_column");
		var r = $(el).myIndex(".wg_cell_variable");
		return  { s: s, c: c, r: r };
	},
	// cell methods
	getCell: function(pos) {
		return {data: wg.program.getVariable(pos),
			el: this.getCellDiv(pos)};
	},
	getCellDiv: function(pos) {
		return this.getColumnDiv(pos).find(".wg_cell[row_id="+pos.r+"]")[0];
	},
	getColumnDiv: function(pos) {
		return this.getSheetDiv(pos).find(".wg_column").eq(pos.c);
	},
	getSheetDiv: function(pos) {
		return $(this.palette).find(".wg_sheet").eq(pos.s);
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
	showOperationDetail: function(opEl) {
		var pos = wg.widget.getCellPosition(opEl);
		// get operation data from wg.prgram using pos
		var op = wg.program.getColumn(pos).operation;
		// create operation detail balloon
		var opContainer = $("<div class='wg_op_container wg_popup'></div>").attr('colID',pos.c).attr('sheetID',pos.s);
		// Info area
		var opInfo = $("<div class='wg_popup_detail_info'></div>").appendTo(opContainer);
			$("<div class='wg_op_label'>OPERATION</div>").appendTo(opInfo);
		var opInfo_title = $("<div class='wg_popup_italic'></div>").text(JSON.stringify(op)).appendTo(opInfo);
			$("<div class='wg_op_label'>INPUT SOURCE</div>").appendTo(opInfo);
		var opInfo_input = $("<div class='wg_op_input wg_popup_italic' contenteditable='true'>Auto</div>").appendTo(opInfo);
			$("<div class='wg_op_label'>ARGUMENT</div>").appendTo(opInfo);
		var opInfo_arg = $("<div class='wg_op_arg wg_popup_italic' contenteditable='true'>...</div>").appendTo(opInfo);
		// Tools and buttons
		var opTools = $("<div class='wg_popup_detail_tools'></div>").appendTo(opContainer);
		var button_infer = $("<button class='btn btn_small btn_infer'>infer</div>");
		var button_copy = $("<button class='btn btn_small btn_copy' disabled>copy</div>");
		var button_paste = $("<button class='btn btn_small btn_paste' disabled>paste</div>");
		opTools.append(button_infer).append(button_copy).append(button_paste);
		// now attach to the column
		$(opContainer).offset({top:0, left:$(opEl).parent().offset().left});
		$(wg.widget.palette).prepend(opContainer);
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
			console.log("Select "+$(this).text()+" that contains "+ wg.program.getVariable(pos));
			wg.widget.focusMove(pos);
			wg.widget.previousCellValue = $(this).text();
		});
		$("#wikigram_palette").on('blur','.wg_cell_variable',function() {
			var newValue = $(this).text();
			if (newValue!=wg.widget.previousCellValue) {
				console.log(wg.widget.previousCellValue + "->" + newValue);
				// update variable
				var nv =txt2var(newValue);
				wg.program.setVariable(wg.widget.getCellPosition(this),nv);
				$(this).text(var2txt(nv));
			}
			//console.log(row[$(this).attr('col_id')][$(this).attr('row_id')]);
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
			wg.widget.cellSelectionBox.hide();
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
			}
		});
		// each column has infer button
		$("#wikigram_palette").on('click','.btn_infer',function() {
			var pos = {	s:$(this).parents(".wg_op_container").attr('sheetID'),
						c:$(this).parents(".wg_op_container").attr('colID')};
			var argument = txt2var($(this).parents(".wg_op_container").find(".wg_op_arg").text());
			var candidateProcedures = wg.program.getColumn(pos).infer(null,null,argument);
			$("#wikigram_palette").find(".wg_op_container").remove();
			wg.widget.showCandidates(pos,candidateProcedures);
		});
		// operation row of each column
		$("#wikigram_palette").on('click','.wg_cell_op',function() {
			// if it's already showing operation detail, remove it.
			if($("#wikigram_palette").find(".wg_op_container").length>0) {
				var existingOpColID = $($("#wikigram_palette").find(".wg_op_container")[0]).attr("colID");
				if(existingOpColID==wg.widget.getCellPosition(this).c) {
					$("#wikigram_palette").find(".wg_op_container").remove();
					$(".wg_sheet").removeClass("noScroll");
				} else {
					$("#wikigram_palette").find(".wg_op_container").remove();
					wg.widget.showOperationDetail(this);
				}
			}
			// otherwise create a new one.
			else {
				wg.widget.showOperationDetail(this);
				$(".wg_sheet").addClass("noScroll");
			}
		});
	}
}