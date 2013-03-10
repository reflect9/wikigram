/*
 *  wg.sheet is a collection of columns.
 *  each column is a column that contains idiosyncratic variables,
 *  and a set of candidate operations and a selected operation.
 *
 */
wg.Sheet = function() {
	this.created = false;
	this.columns = [];
	this.backupColumns = null;	// shallow copy of this.columns
	defaultOptions = {
		cols:30
	};
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
	};
	this.remove = function(indexToRemove) {
		this.columns = _.filter(this.columns, function(vec,i) { return i!= indexToRemove; },this);
	};
	this.append = function(column) {
		if(column) this.columns.push(column);
		else {
			var nv = new wg.Column();
			nv.init();
			this.columns.push(nv);
		}
	};
	
	/*
	 *  Each operation is assigned to a new column which will be inserted into the column list.
	 */
	this.insertColumnsFromOperations = function(colIndexToInsertAt,opList) {
		console.log("insertColumns from candidate operations");
		// insert new columns
		this.deleteColumnsByCandidate();
		_.each(opList.reverse(), function(op) {
			console.log(op);
			var newColumn = new wg.Column().init();
			newColumn.setOperation(op);
			this.insertColumnAt(colIndexToInsertAt, newColumn, "candidate");
		},this);
	};
	this.deleteColumnsByCreator = function(creatorSign) {
		return _.filter(this.columns, function(column) {
			return (column.creator!==creatorSign);
		});
	};
	this.deleteColumnsByCandidate = function() {
		this.deleteColumnsByCreator("candidate");
	};
	// for situations when it needs to revert the change of columns
	this.createSnapshot = function() {
		this.backupColumns = _.clone(this.columns);
	};
	/*
	 *	Called when a new column is inserted inbetween.
	 *  As operation inference also temporarily adds multiple columns, those added columns have a specific creatorSignature code
	 *  for identification.
	 */
	this.insertColumnAt = function(colIndexToInsertAt, column, creatorSignature) {
		if(!column) column = wg.Column().init();
		if(!creatorSignature) column.creatorSignature= creatorSignature;
		if(!colIndexToInsertAt || colIndexToInsertAt<0) colIndexToInsertAt = 0;
		this.columns.splice(colIndexToInsertAt,0,column);
	};
	this.toString = function() {
		return _.map(this.columns, function(c) { return c.toString(); });
	};
};