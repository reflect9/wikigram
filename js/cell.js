wg.Cell = {
	init: function(value,index) {
		var row = $("<div class='wg_cell wg_cell_variable' row_id='"+index+"'></div>");
		$(row).html(var2cell(value));
		$(row).attr('contenteditable',true);
		return row;
	},
	dragEndEventHandler: function(e) {
		console.log(e.target);
		//$(e.target).append($(this.ui.helper).html());
		$(e.target).after($(wg.widget.dragHelper).html());
		wg.widget.dragHelper = null;
		document.removeEventListener('mouseup',arguments.callee);
	}

};
