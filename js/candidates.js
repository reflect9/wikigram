/*
 * UI box that shows candidate program inferred by generator.
 * user can choose one of them. A chosen program will call wg.program.insertColumns(candidates).
 * After inserting those columns, it will run the operations to fill in rows of those inserted columns.
 * if user choose another candidate, previously inserted columns are replaced by new ones.
 *
 */
wg.Candidates = function() {
	var popup, infoBox;
	var candidateButtons = [];
	var candidateHolder;
	var candidates;
	var description;
	var pos;  // which sheet and column this candidate belongs to
	this.init = function(candidates,pos) {
		this.pos = pos;
		this.candidates = candidates;
		this.popup = $("<div class='wg_popup'></div>").attr('colID',pos.c).attr('sheetID',pos.s);
		// Info area
		this.infoBox = $("<div class='wg_popup_detail_info'></div>").appendTo(this.popup);
		this.candidateHolder = $("<div class='candidateHolder'></div>").appendTo(this.infoBox);
		this.candidateButtons = _.map(this.candidates, function(proc,i) {
			var btn = $("<span class='candidateBtn badge' candID='"+i+"'></span>")
					.text(proc.title).appendTo(this.candidateHolder);
			$(btn).click($.proxy(this.clickEvent,{pos:this.pos, candidates:this.candidates,candID:i}));
			return btn;
		},this);
		// Tools and buttons
		var tools = $("<div class='wg_popup_detail_tools'></div>").appendTo(this.popup);
		var button_confirm = $("<button class='btn btn_small btn_candidate_confirm'>confirm</div>")
			.click($.proxy(this.confirmEvent,this));
		var button_cancel = $("<button class='btn btn_small btn_candidate_cancel'>cancel</div>")
			.click($.proxy(this.cancelEvent,this));
		tools.append(button_confirm).append(button_cancel);
		return this.popup;
	};
	this.update = function(candidiates) {
		// everytime the column variables update, new set of candidates come in.  
	};
	// candidate button click event
	this.clickEvent = function() {
		wg.program.sheets[this.pos.s].insertColumnsFromOperations(this.pos.c,this.candidates[this.candID]);
		wg.widget.redraw();
	};
	this.cancelEvent = function() {
		// restore the previous column state
		wg.program.sheets[this.pos.s].restoreSnapshot();
		wg.widget.redraw();
		// redraw sheet
		this.close();
	};
	this.confirmEvent = function(chosenCand) {
		// delete 'candidate' signature from all the columns
		_.each(wg.program.sheets[this.pos.s].columns, function(col) {
			col.creatorSignature=null;
		});
		wg.program.sheets.backupColumns = null;
		this.close();
	};
	// closing the wg_popup div
	this.close = function() {
		$(this.popup).remove();
	};
};