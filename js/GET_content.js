
var LAST_GET_RESPONSE;


function GET(url, func_response){
	LAST_GET_RESPONSE='';
	chrome.runtime.sendMessage({command:'GET', parm1:url });
	timeout=10000;
	interval=100
	var t=setInterval(function(){
		if (timeout<=0) clearInterval(t);		
		
		if (LAST_GET_RESPONSE!='') { 
			clearInterval(t);
			func_response(LAST_GET_RESPONSE);
		}
		
		timeout-=interval;		
	},interval);
	
}



chrome.runtime.onMessage.addListener(function(msg) {
    if (msg.command == "GET_RESPONSE") {		
		LAST_GET_RESPONSE=msg.res;
	}
});