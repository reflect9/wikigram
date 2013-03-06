/*	It allows users to extract data from any web pages by selection  	
 */ 
 
wg.inspector = {
	flag_inspect: 	false,
	selectionBox: null,
	toggle: 		function() {
		if(!wg.inspector.flag_inspect) {
			wg.inspector.on();
		} 
		else wg.inspector.off();
	},
	on : function() {
		$('body').on('mouseover','*:not(".wikigram_container, .wikigram_container *")',function(e) {
			if(!wg.inspector.selectionBox) selectionBox = new wg.SelectionBox();
			e.stopPropagation();
			wg.inspector.selectionBox.highlight(e.target);
		});
		$('body').on('mouseout','*:not(".wikigram_container, .wikigram_container *")',function(e) {
			e.stopPropagation();
			wg.inspector.selectionBox.hide();
		});
		$('body').on('click','*:not(".wikigram_container, .wikigram_container *")',function (e) {
			e.preventDefault();
			e.stopPropagation();
			wg.widget.selectElement(e.target);	// add to el_selected
		});
		$('body').on('mousedown','*:not(".wikigram_container, .wikigram_container *")',function (e) {
			e.preventDefault();
			e.stopPropagation();
		});
		$(wg.widget.btn_inspect).addClass("btn-active");
		wg.inspector.flag_inspect = true;
		wg.inspector.selectionBox = new wg.SelectionBox();
	}, 
	off : function() {
		$('body').off('mouseover');
		$('body').off('mouseout');
		$('body').off('click');
		$('body').off('mousedown');
		$(wg.widget.btn_inspect).removeClass("btn-active");
		wg.inspector.flag_inspect = false;
		wg.inspector.selectionBox.destroy();
		
	},
}
