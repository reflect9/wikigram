// DOM ready function // 

// wikigram content script //

//chrome.extension.sendRequest({}, function(response) {});

$(document).ready(reportOnLoad);

chrome.extension.onMessage.addListener(
	function(request,sender,sendResponse) {
		console.log(request.action);
		if(request.action === 'openWorksheet'){
			wg.init(request.program);
		}
		else if(true) {}
		sendResponse({});
	}
);


function reportOnLoad() {
	chrome.extension.sendRequest({
		action: "reportOnLoad",
		url: $.url().attr('host')
	}, function(responseText,prog) {
		if(responseText=='openWorksheet') {
			wg.init(prog);
		}
	});
}
function backupProgram(prog) {
	chrome.extension.sendRequest({
		program: wg.program
	}, function(responseText) {
		console.log(responseText);
	});
}
function loadURL(url,domResponseHandler) {
	chrome.extension.sendRequest({
		action: "xhttp",
		url: url
	}, function(responseText) {
		var dom= html2dom(responseText).get(0);
		dom.url = url;
		domResponseHandler(dom);
		//console.log(responseText);
		/*Callback function to deal with the response*/
	});
}
function openTab(url) {
	// new tab will be opened with a child widget. 
	// A child widget allows users to explore the HTML, create a set of operations to return a DOM or value
	chrome.extension.sendRequest({
		action: "openTab",
		url: url
	}, function(responseText) {
		console.log(responseText);
	});
}

