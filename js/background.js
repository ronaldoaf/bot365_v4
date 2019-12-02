function includes_list(lista, padrao){
	var contem=false;
	$(lista).each(function(){
		if(this.includes(padrao) ) contem=true;		
	});
	return contem;
	
}






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
            if (!includes_list(tab_urls, '#/IP/') ) chrome.tabs.create({url:'https://www.'+config.dominio+'/?nr=1#/IP/'});
            //if (!includes_list(tab_urls, 'MyBets') ) chrome.tabs.create({url:'https://mobile.365sport365.com/#type=MyBets;key=;ip=1;lng=1'});
            
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
                //this.url.includes('#/IP/') ||
                this.url.includes('#/IP/') 
                ) chrome.tabs.remove(this.id);
            });	
            
        });		
    }		
    
},30*60*1000);
	
	
	

	
	
	
});




