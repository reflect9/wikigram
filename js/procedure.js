wg.Procedure = function(opList) {
	this.operations = (opList)? ((_.isArray(opList))? opList: [opList]):[];
	this.title = (opList)? _.reduce(this.operations, function(memo,op) { return memo+">"+op.description; },"")  : "empty";
};