/*	It allows users to extract data from any web pages by selection
 */
wg.inspector = {
	flag_inspect: false,
	selectionBox: null,
	hoveredElement: null,
	toggle: function() {
		if(!wg.inspector.flag_inspect) {
			wg.inspector.on();
		}
		else wg.inspector.off();
	},
	on : function() {
		if(!wg.inspector.flag_inspect) {
			document.addEventListener('mousemove', wg.inspector.onMouseMove, true);
			document.addEventListener('mouseover', wg.inspector.onMouseOver, true);
			document.addEventListener('mousedown', wg.inspector.onMouseDown, true);
			document.addEventListener('click', wg.inspector.onMouseClick, true);
			$(wg.widget.btn_inspect).addClass("btn-active");
			wg.inspector.flag_inspect = true;
			wg.inspector.selectionBox = new wg.SelectionBox();
		}
	},
	off : function() {
		if(wg.inspector.flag_inspect) {
			document.removeEventListener('mousemove', this.onMouseMove, true);
			document.removeEventListener('mouseover', this.onMouseOver, true);
			document.removeEventListener('mousedown', this.onMouseDown, true);
			document.removeEventListener('click', this.onMouseClick, true);
			// $('body').off('mouseover');
			// $('body').off('mouseout');
			// $('body').off('click');
			// $('body').off('mousedown');
			$(wg.widget.btn_inspect).removeClass("btn-active");
			wg.inspector.flag_inspect = false;
			if(wg.inspector.selectionBox) wg.inspector.selectionBox.destroy();
		}
	},
	createHighlighter: function() {
		wg.inspector.selectionBox = new wg.SelectionBox();
	},
	destroyHighlighter: function() {
		if (wg.inspector.selectionBox) {
			wg.inspector.selectionBox.destroy();
			delete wg.inspector.selectionBox;
		}
	},
	highlight: function(el) {
		if (!wg.inspector.selectionBox)
			wg.inspector.createHighlighter();
		wg.inspector.hoveredElement = el;
		wg.inspector.selectionBox.highlight(el);
	},
	unhighlight: function() {
		wg.inspector.hoveredElement = null;
		if (wg.inspector.selectionBox)
			wg.inspector.selectionBox.hide();
	},
	onMouseOver: function(e) {
		if (wg.inspector.belongsToPallette(e.target)) {
			wg.inspector.unhighlight();
			return true;
		}
		e.preventDefault();
		e.stopPropagation();
		wg.inspector.highlight(e.target);
	},
	onMouseMove: function(e) {
		if (wg.inspector.belongsToPallette(e.target)) {
			wg.inspector.unhighlight();
			return true;
		}
		e.preventDefault();
		e.stopPropagation();
		wg.inspector.highlight(e.target);
	},
	onMouseDown: function(e) {
		if (!wg.inspector.belongsToPallette(e.target)) {
			e.preventDefault();
			e.stopPropagation();
			wg.widget.selectElement(e.target);
			return false;
		}
	},
  /**
    * When the user clicks the mouse
    */
	onMouseClick: function(e) {
		if (!wg.inspector.belongsToPallette(e.target)) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	},	
	belongsToPallette: function(el) {
		var $el = $(el);
		var parent = $el.closest('.wikigram_container');
		if (parent.length !== 0)
			return true;
		return false;
	}
}
