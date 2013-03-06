


window.addEventListener('load', function() {
	init();
});


function init() {
	console.log("adding background page listeners.");
	// when browserAction button is clicked
	chrome.browserAction.onClicked.addListener(function() {
		chrome.tabs.getSelected(null, function(tab) {
			console.log("send message openWorksheet");
			chrome.tabs.sendMessage(tab.id, {name: "openWorksheet"},function() {});	
		});
	});
	
	// 
	chrome.extension.onRequest.addListener(
		function(request, sender, sendResponse) {
			console.log(request.name);
		}
	);
}





