wg.Stage=function() {
	this.el=null;
	this.html="";
	this.currentEnhancement=null;
	this.setEnhancement = function(enh) {
		this.currentEnhancement = enh;
	};
	this.attachEventListeners=function() {
		$(this.el).on("click",".button_create_node",function() {
			var procID = $(this).parents(".wg_procedure").attr("procID");
			var proc = wg.panel.stage.currentEnhancement.getProcedureDefinition(procID);
			proc.addNode();
			wg.redraw();
			// $(this).hide();
			// $(this).parent().find(".nodeDetail").show();
		});
		$(this.el).on("click",".button_create_procedure",function() {
			var enhancement = wg.panel.stage.currentEnhancement;
			enhancement.addProcedure();
			wg.redraw();
			// $(this).hide();
			// $(this).parent().find(".nodeDetail").show();
		});
		// $(this.el).on("click",".wg_node",function() {
		// 	// select node and show detail and edit features in tools. 
		// 	$(".wg_node").removeAttr("selected");
		// 	$(this).attr("selected",true);
		// 	var nodeID = $(this).attr("nodeID");
		// 	var node = wg.panel.stage.currentEnhancement.getNode(nodeID);
		// 	wg.panel.tool.setNode(node);
		// });
		$("span.link_node",this.el).tipsy({
			title: function() {
				// show values of the linked node 
				var nodeID = $(this).text();
				var node = wg.panel.stage.currentEnhancement.getNode(nodeID);
				var nodeValues = (node)? node.getV_text().slice(0,15).join("<br>"): "...";
				return nodeValues;
			},
			gravity: 's',
			html:true, delayIn: 500, delayOut: 500
		});
		// when node is clicked
		$("li.wg_node",this.el).click(function() {
			var nodeEl = $(this);
			var nodeID = $(this).attr("nodeID");
			var node = wg.panel.stage.currentEnhancement.getNode(nodeID);
			var wasActive = $(nodeEl).attr("wasActive");
			if(!wasActive || wasActive==='false') { // open node
				$(nodeEl).attr("wasActive",true);
				$(".valueList",nodeEl).attr("contenteditable","true");
				$(".valueList",nodeEl).attr("mode","multiline");
				wg.inspector.on();
				wg.panel.tool.setNode(node);
			} else {	// close node
				$(nodeEl).attr("wasActive",false);
				wg.inspector.off();
				// update new node value, and redraw tool panel 
				// node.setV($(nodeEl).html())



				//TBD


				$(".valueList",nodeEl).attr("contenteditable","false");
				$(".valueList",nodeEl).attr("mode","inline");
			}
		});
						


		// update enhancement title after modified
		$(this.el).on("blur","h4#wg_current_enhancement_title", function() {
			wg.panel.stage.currentEnhancement.title = $(this).text();
			wg.redraw();
		});
		// update procedure title after unfocused
		$(this.el).on("blur",".wg_procedure_title", function() {
			var procID = $(this).parents(".wg_procedure").attr("procID");
			var proc = wg.panel.stage.currentEnhancement.getProcedureDefinition(procID);
			proc.id = $(this).text();
			wg.redraw();
		});
		// DIV or IMG values are connected to highlighting elements on the page
		$(this.el).on("mouseover",".valueList[mode='multiline'] .cellButton",function() {
			var nodeID = $(this).parents(".wg_node").attr("nodeID");
			var vIndex = $(this).parent().myIndex("span.value");
			var node = wg.panel.stage.currentEnhancement.getNode(nodeID);
			var value = node.V[vIndex];
			// console.log(vIndex);
			if(isDom(value)) {
				wg.highlightElement(value,{scroll:true});
			}
		});
		$(this.el).on("click",".valueList",function() {
			event.stopPropagation();
		});
		$(this.el).on("mouseout",".valueList[mode='multiline'] .cellButton",function() {
			wg.unhighlightElement();
		});
		// prevent scrolling parent elements when scrolling valuelist  
		$(this.el).on("mouseover",".valueList[mode='multiline']",function(){
			$(".stageContainer").css('overflow','hidden');
			$("body").css('overflow','hidden');
		});
		$(this.el).on("mouseout",".valueList[mode='multiline']",function(){
			$(".stageContainer").css('overflow','scroll');
			$("body").css('overflow','scroll');
		});



		// $("span.link_node",this.el).click(function() {
		// 	var container = $(".stageContainer")[0];
		// 	var nodeID = $(this).text();
		// 	var nodeEl = $("li.wg_node[nodeID='"+nodeID+"']")[0];
		// 	if(nodeEl) {
		// 		scrollTo(container, nodeEl);
		// 	}
		// });
	};
	this.redraw=function() {
		this.html=Mustache.render(wg.templates.stage, this.currentEnhancement);
		this.el=$(this.html);
		this.attachEventListeners();
	};
};
