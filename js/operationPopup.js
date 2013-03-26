/*  
	Popup for each column.  It shows candidates of operations that satisfy
	current column variables as output with a set of input (all the columns). 
	By selecting a candidate operation, user can run it and get the outcome, and later undo it. 

*/

wg.OperationPopup = function() {
	this.tools = null;
	this.popupContainer = null;
	this.previewColumn = null;
	this.inPopup = null;	this.outPopup = null;
	this.pos = null;
	this.inCand = [];
	this.outCand = [];

	this.init = function(pos) {
		// remove existing operation details
		$(".wg_popup_container").remove();
		// show operation details
		this.pos = pos;
		//this.currentOperation = wg.program.getColumn(pos).operation;
		this.popupContainer = $("<div class='wg_popup_container'></div>").attr('colID',pos.c).attr('sheetID',pos.s);
		this.inPopup = $("<div class='wg_popup' direction='in'></div>").appendTo(this.popupContainer);
		this.outPopup = $("<div class='wg_popup' direction='out'></div>").appendTo(this.popupContainer);
		// var inContainer = $("<div class='opContainer'></div>").appendTo(this.popup);
		// var outContainer = $("<div class='opContainer'></div>").appendTo(this.popup);
		// var inOpDiv = $("<div class='wg_popup_operation' direction='in'></div>").appendTo(this.inPopup);
		// var outOpDiv = $("<div class='wg_popup_operation' direction='out'></div>").appendTo(this.outPopup);
			$(this.inPopup).append("<div class='wg_op_label'>INBOUND OPERATIONS</div><div class='wg_op_candidates'></div>");
			$(this.outPopup).append("<div class='wg_op_label'>OUTBOUND OPERATIONS</div><div class='wg_op_candidates'></div>");
		/* ADD ARROWS */
		$("<div class='wg_popup_arrow'></div>").css("bottom",-25).css("right",54).appendTo(this.inPopup);
		$("<div class='wg_popup_arrow'></div>").css("bottom",-25).css("left",65).appendTo(this.outPopup);

		/* TOOLS  */
		// this.tools = $("<div class='wg_popup_tools'></div>").appendTo(this.popup);
		//var button_run = $("<button class='btn btn_small btn_run'>run</div>").appendTo(this.tools);
		//var button_infer = $("<button class='btn btn_small btn_infer'>infer</div>").appendTo(this.tools);
		//var button_copy = $("<button class='btn btn_small btn_copy' disabled>copy</div>").appendTo(this.tools);
		//var button_paste = $("<button class='btn btn_small btn_paste' disabled>paste</div>").appendTo(this.tools);
		// var button_insert = $("<button class='btn btn_small btn_insert'>insert</div>").appendTo(this.tools);
		// var button_delete = $("<button class='btn btn_small btn_remove'>remove</div>").appendTo(this.tools);
		//$(wg.widget.palette).prepend(this.popup);
		wg.widget.locatePopup();
		return this;
	};
	this.updateBoth = function(inCand, outCand) {
		this.update(inCand,'in');
		this.update(outCand,'out');
	};
	// clean and add candidate operations to either in/outbound popup 
	this.update = function(candidates, d) {
		var targetDiv;
		if(d=='in') {
			this.inCand = candidates;			target = $(this.inPopup).find(".wg_op_candidates");
		} else {
			this.outCand = candidates;			target = $(this.outPopup).find(".wg_op_candidates");
		}
		for (var i in candidates) {
			var cand = candidates[i];
			var candDiv = $("<div class='candidateBox'></div>");
			var but = $("<div class='candidateBtn badge' candID="+i+"></div>").text(cand.title)
				.click($.proxy(this.opClickEvent,{pos:this.pos, candidate:cand, direction:d}))
				.hover($.proxy(this.opPreview,{pos:this.pos, candidate:cand, direction:d}),
						this.clearOpPreview)
				.appendTo(candDiv);
			var preview = $("<div class='candidatePreview'>example input and output</div>").appendTo(candDiv);
			$(target).append(candDiv);
		}
	};
	// show preview of the operation.  creates a floating DIV over the original output column
	this.opPreview = function() {
		var sheet = wg.program.sheets[this.pos.s];
		var colIndexOfInput = (this.direction=='in')? this.pos.c-1 : this.pos.c;
		var previewResult = sheet.previewProcedure(colIndexOfInput,this.candidate);
		this.previewColumn = $("<div class=''></div>")
	};
	this.clearOpPreview = function() {
		this.previewColumn = null;

	};
	// candidate button click event
	this.opClickEvent = function() {
		if(this.direction=='in') {
			wg.program.sheets[this.pos.s].insertColumnsFromOperations(this.pos.c,this.candidate);
		} else {
			wg.program.sheets[this.pos.s].insertColumnsFromOperations(this.pos.c+1,this.candidate);
		}
		wg.widget.redraw();
	};
	// this.close = function() {
	// 	$(this.popupContainer).remove();
	// };
};