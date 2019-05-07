
chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse) {
	//console.log(msg,sender,sendResponse);
	
    if (msg.command == "GET") {		
		$.get(msg.parm1,function(res){				
			chrome.tabs.query({index:sender.tab.index, windowId:sender.tab. windowId}, function(tabs){
				chrome.tabs.sendMessage(tabs[0].id, { command:'GET_RESPONSE', res: res });	
			});
	    });
	}
});




