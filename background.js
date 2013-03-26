
// shared wg.program 
var program = null;
var tabs = {};

window.addEventListener('load', function() {
	init();
});


function init() {
	console.log("adding background page listeners.");
	// when browserAction button is clicked
	chrome.browserAction.onClicked.addListener(function() {
		chrome.tabs.getSelected(null, function(tab) {
			console.log("send message openWorksheet");
			tabs[tab.id] = {
				host : $.url(tab.url).attr('host'),	// domain url
				role : "master",	// 'master' or 'child'
				from : null		// a tab object that the tab is opened from
			};
			chrome.tabs.sendMessage(tab.id, {action: "openWorksheet", program:program },function() {});
		});
	});
	chrome.extension.onRequest.addListener(
		function(request, sender, callback) {
			console.log(request.action);
			// loading cross-domain web page within the worksheet (not opening a new tab)
			if(request.action == "xhttp") {
				var xhttp = new XMLHttpRequest(),
						method = request.method ? request.method.toUpperCase() : 'GET';
				xhttp.onreadystatechange = function() {
					if(xhttp.readyState == 4){
						callback(xhttp.responseText);
						xhttp.onreadystatechange = xhttp.open = xhttp.send = null;
						xhttp = null;
					}
				};
				if (method == 'POST') {
					xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					xhttp.setRequestHeader("Content-length", request.data.length);
				}
				xhttp.open(method, request.url, true);
				xhttp.send(request.data);
			} // end of cross domain loading
			// deprecated
			if(request.action == "reportOnLoad") {
				console.log("New Tab Loaded---------");
				console.log(request);
				console.log(sender);
				console.log("-------- New Tab Loaded");
				var activeHosts = _.map(tabs, function(t) { return t.host; });
				if(tabs[sender.tab.id]) {
					callback("openWorksheet",null);
				}
			}
			// 
			if(request.action == "openChildPage") {
				chrome.tabs.create({'url': request.url, active:true, index:sender.tab.index+1}, function(tab) {
					tabs[tab.id] = {host : $.url(tab.url).attr('host')};
					//chrome.tabs.sendMessage(tab.id, {action: "openWorksheet", program:program },function() {});
				});
			}
		}
	);
}

function loadURL(url) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			// JSON.parse does not evaluate the attacker's scripts.
			var resp = $(xhr.responseText);
			console.log(resp);
		}
	};
	xhr.send();
}

function openTab(url) {

}


// function HTMLParser(aHTMLString){
//   var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null),
// 	body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
//   html.documentElement.appendChild(body);
//   body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
// 	.getService(Components.interfaces.nsIScriptableUnescapeHTML)
// 	.parseFragment(aHTMLString, false, null, body));
//   return body;
// }

