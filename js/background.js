


function includes_list(lista, padrao){
	var contem=false;
	$(lista).each(function(){
		if(this.includes(padrao) ) contem=true;		
	});
	return contem;
	
}



chrome.runtime.onMessage.addListener(function(msg,sender) {
	//Se receber o comando CLICK clica na coordernada (msg.x, msg.y) da aba  com ID sender.tab.id
	if (msg.command=='CLICK'){
		var attached=false;
		chrome.debugger.getTargets(function(targets){
			$(targets).each(function(){
				if( (this.attached) && (this.tabId==sender.tab.id)  ) {
					attached=true;
			    }
			});
		})
		if(!attached) chrome.debugger.attach({tabId:sender.tab.id},'1.2', ()=>void chrome.runtime.lastError);			

		chrome.debugger.sendCommand({tabId:sender.tab.id}, "Input.dispatchMouseEvent", { type: 'mousePressed',  x: msg.x, y: msg.y, button: 'left', clickCount: 1 });
		chrome.debugger.sendCommand({tabId:sender.tab.id}, "Input.dispatchMouseEvent", { type: 'mouseReleased', x: msg.x, y: msg.y, button: 'left', clickCount: 1 });
	}
	if(msg.command=='KEY'){
		chrome.debugger.sendCommand({tabId:sender.tab.id}, 'Input.dispatchKeyEvent', { type: 'keyDown', key: msg.key });
		chrome.debugger.sendCommand({tabId:sender.tab.id}, 'Input.dispatchKeyEvent', { type: 'keyUp',   key: msg.key });
	}
	
	
	//Se Receber o comando RELOAD_MB fecha a aba Mybets
    if (msg.command == "RELOAD_MB") {
		chrome.tabs.query({},function(tabs){
			$(tabs).each(function(){		
				if (this.url.includes('#/MB/') ) chrome.tabs.remove(this.id);
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
			
			//Remove as abas com HO
			$(tabs).each(function(){		
                if (this.url.includes('#/HO/')) chrome.tabs.remove(this.id);
            });	
			
			
			
			
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
    
},10000);

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
    
},60*60*1000);
	
	
});




