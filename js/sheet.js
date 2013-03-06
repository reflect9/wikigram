/*
 *  wg.sheet is a collection of columns.  
 * 	each column is a column that contains idiosyncratic variables, 
 * 		and a set of candidate operations and a selected operation.      
 * 
 */

wg.Sheet = function() {
	this.created = false;
	this.columns = [];
	
	defaultOptions = {
		cols:30,
	}
	
	this.init = function(options) {
		if (!options) options = defaultOptions;  // use default if no option is provided
		// create column columns
		this.columns = _.map(_.range(options.cols), function() { 
			var nc= new wg.Column(); 
			nc.init(); 
			nc.sheet = this;
			return nc; 
		},this);
		this.created= true;
	}
	
	this.remove = function(indexToRemove) {
		this.columns = _.filter(this.columns, function(vec,i) { return i!= indexToRemove; },this);
	}
	this.append = function(column) {
		if(column) this.columns.push(column);
		
		else {
			var nv = new wg.Column();
			nv.init(); 
			this.columns.push(nv);
		}
	}
	this.toString = function() {
		return _.map(this.columns, function(c) { return c.toString(); });
	}	
	
	
	
	
	
}
