/*
 * UI box that shows candidate program inferred by generator.
 * user can choose one of them. A chosen program will call wg.program.insertColumns(candidates).
 * After inserting those columns, it will run the operations to fill in rows of those inserted columns. 
 * if user choose another candidate, previously inserted columns are replaced by new ones.    
 * 
 */

wg.Candidate = function() {
	var bgBox;
	var candidateButtons = [];
	var candidateHolder;
	var description;
	
	this.init = function(data,candEl, containerEl) {
		this.bgBox = $("<div class='candidateBox'></div>");
		this.candidateHolder = $("<div class='candidateHolder'></div>").appendTo(this.bgBox);
		this.candidateButtons = _.map(data, function(cand,candIndex) {
			var btn = $("<span class='candidateBtn badge' cID='"+candIndex+"'></span>")
					.text(candIndex).appendTo(this.candidateHolder);
			$(btn).click(function() {
				console.log(data);
			},this);
			return btn;
		},this);
		this.description = $("<div class='candidateDescription'></div>").appendTo(this.bgBox);
		$(this.bgBox).hide().appendTo(containerEl).show('fast');
	}
	
	
}
