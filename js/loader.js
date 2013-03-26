wg.Loader = function(url, pos) {
	this.url = url;
	this.state = 'initialized';
	this.pos = {s:pos.s, c:pos.c, r:pos.r};
	this.run = function() {
		this.state = 'running';
		loadURL(this.url,this.callback);
	};
	this.callback = $.proxy(function(dom) {
		this.state = 'finished';
		console.log("target pos: "+pos.r);
		wg.program.setVariable(this.pos, dom);
		wg.widget.redraw();
		this.destroy();
	},this);
	this.destroy = function() {
		wg.loaders = _.filter(wg.loaders, function(l) {  return l.state!='finished'; });
	};
};