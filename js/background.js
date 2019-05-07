function includes_list(lista, padrao){
	var contem=false;
	$(lista).each(function(){
		if(this.includes(padrao) ) contem=true;		
	});
	return contem;
	
}


chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
    for(var i=0; i < details.requestHeaders.length; ++i){
        if(details.requestHeaders[i].name === "User-Agent"){
            details.requestHeaders[i].value = "Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.137 Mobile Safari/537.36";

            break;
        }
    }
    return {requestHeaders: details.requestHeaders};
}, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);









chrome.runtime.onMessage.addListener(function(msg) {
    if (msg.command == "RELOAD") {
		chrome.tabs.query({},function(tabs){
			$(tabs).each(function(){		
				if (
					this.url.includes('Goalline') ||
					this.url.includes('MyBets') 
				) chrome.tabs.reload(this.id);
			});	
		});
	}
	
    if (msg.command == "SALVA_CONFIG") {
		chrome.storage.sync.set({config:JSON.parse(msg.parm1)  });
		//console.log(JSON.parse(msg.parm1));
	}
	
	
	
	
});






var bot_ligado;

$(document).ready(function(){
	
    tab_urls=[];
	
	//A cada 1 segundo verifica se as abas estão abetas
	setInterval(function(){		
		chrome.storage.sync.get('bot_ligado', function(obj) { 
			bot_ligado=obj.bot_ligado;
		});		
		if (bot_ligado){
			chrome.browserAction.setIcon({path: 'images/logo_32_verde.png'});
			tab_urls=[];
			chrome.tabs.query({},function(tabs){			
				$(tabs).each(function(){
					tab_urls.push(this.url);		
				});	
				if (!includes_list(tab_urls, 'Goalline') ) chrome.tabs.create({url:'https://mobile.365sport365.com/#type=Coupon;key=151014714C1_1_3;Goalline'});
				if (!includes_list(tab_urls, 'MyBets') ) chrome.tabs.create({url:'https://mobile.365sport365.com/#type=MyBets;key=;ip=0;lng=1'});
				
			});
			
			chrome.tabs.query({},function(tabs){
			$(tabs).each(function(){
				var tab_id=this.id;
				if (this.url.includes('151014714C1_1_3')) {
					chrome.storage.sync.get('config', function (result) {  
						config=result.config;
						chrome.tabs.executeScript(tab_id, {code:"localStorage.config='"+JSON.stringify(config)+"'"});
					});					
				}
			});
		});	


			
		}
		else{
			chrome.browserAction.setIcon({path: 'images/logo_32.png'});		
		}
		
	},1000)
	
	console.log('atualizou');
	//A cada 30 minutos fecha as abas para a reabertura automatica
	setInterval(function(){
		console.log('entrou no setInterval');
		if (bot_ligado){
			chrome.tabs.query({},function(tabs){			
				$(tabs).each(function(){		
					if (
					this.url.includes('Goalline') ||
					this.url.includes('MyBets') 
					) chrome.tabs.remove(this.id);
				});	
				
			});		
		}		
		
	},30*60*1000);
	
	
	

	
	
	
});




