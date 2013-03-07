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
	/*
	 *  Each operation is assigned to a new column which will be inserted into the column list. 
	 */
	this.insertColumnsFromOperations = function(pos,opList) {
		// insert new columns
		_.each(opList.reverse(), function(op) {
			var newColumn = new wg.Column();
			newColumn.setOperation(op);
			this.insertColumnAt(pos, newColumn, "candidate");
		});
	}
	/*
	 *	Called when a new column is inserted inbetween. 
	 *  As operation inference also temporarily adds multiple columns, those added columns have a specific creator code 
	 *  for identification.  
	 */
	this.insertColumnAt = function(pos, column, creator) {
		if(!column) var emptyColumn = wg.Column();
		if(!creator) emptyColumn.creator= creator;
		if(!pos) var pos = 0;
		this.columns.splice(pos,0,column);		
	}
	this.toString = function() {
		return _.map(this.columns, function(c) { return c.toString(); });
	}	
	
	
	
	
	
}
