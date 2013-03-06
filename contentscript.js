// DOM ready function // 

// wikigram content script //

//chrome.extension.sendRequest({}, function(response) {});


chrome.extension.onMessage.addListener(
	function(request,sender,sendResponse) {
		console.log(request.name);
		if(request.name === 'openWorksheet'){
			wg.init();
		} 
		else if(true) {}
		sendResponse({});
	}
);

