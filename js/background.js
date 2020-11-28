


function includes_list(lista, padrao){
	var contem=false;
	$(lista).each(function(){
		if(this.includes(padrao) ) contem=true;		
	});
	return contem;
	
}



chrome.runtime.onMessage.addListener(function(msg) {
    if (msg.command == "RELOAD") {
		chrome.tabs.query({},function(tabs){
			$(tabs).each(function(){		
				if (
					//this.url.includes('#/IP/') || 
					this.url.includes('#/IP/') 
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

var config;
$(document).ready(function(){

tab_urls=[];

//A cada 1 segundo verifica se as abas estão abetas
setInterval(function(){		
    chrome.storage.sync.get('bot_ligado', function(obj) { 
        bot_ligado=obj.bot_ligado;
    });		
    if (bot_ligado){
        
        
        chrome.storage.sync.get('config', function(obj) { 
            config=obj.config;
        });	

        chrome.browserAction.setIcon({path: 'images/logo_32_verde.png'});
        tab_urls=[];
        chrome.tabs.query({},function(tabs){			
            $(tabs).each(function(){
                tab_urls.push(this.url);		
            });	
			//Se a aba do Inplay não estiver aberta, abre-a
            if (!includes_list(tab_urls, '#/IP/') ) chrome.tabs.create({url:'https://www.'+config.dominio+'/?nr=1#/IP/'});
			
			//Se já estiver aberta verfica a do MyBets
			if (includes_list(tab_urls, '#/IP/') ) {
				if (!includes_list(tab_urls, '#/MB/') ) chrome.tabs.create({url:'https://www.'+config.dominio+'/?nr=1#/MB/'});
			}
        });
		
		
		chrome.tabs.query({},function(tabs){
			$(tabs).each(function(){
				var tab_id=this.id;
				if (this.url.includes('#/IP/')) {

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
    
},4000);

console.log('atualizou');
//A cada 30 minutos fecha as abas para a reabertura automatica
setInterval(function(){
    console.log('entrou no setInterval');
    if (bot_ligado){
        chrome.tabs.query({},function(tabs){			
            $(tabs).each(function(){		
                if (
                this.url.includes('#/IP/') ||
                this.url.includes('#/MB/') 
                ) chrome.tabs.remove(this.id);
            });	
            
        });		
    }		
    
},5*60*1000);
	
	
});




