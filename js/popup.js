
$(document).ready(function() {
	chrome.storage.sync.get('bot_ligado', function(obj) { 
		
		if (obj.bot_ligado==true) $('#cmn-toggle-1').prop('checked', true);
	

	});
	

	$("#cmn-toggle-1").change(function() {
		if(this.checked) {
			chrome.storage.sync.set({bot_ligado: true});
			//chrome.browserAction.setIcon({32: 'images/logo_32_verde.png'});
		}
		else{
			chrome.storage.sync.set({bot_ligado: false});
			//chrome.browserAction.setIcon({32: 'images/logo_32.png'});
		}
	});
	
	
	
	$('#apaga').click(function(){
		chrome.tabs.query({},function(tabs){
			$(tabs).each(function(){		
				if (this.url.includes('151014714C1_1_3')) chrome.tabs.executeScript(this.id, {code:"localStorage.removeItem('usuario_bet365');  localStorage.removeItem('senha_bet365');  "});
			});
		});	

		setTimeout(function(){
			chrome.runtime.sendMessage({command:'RELOAD'});			
		},1000);
			
		
	});
	
	var config;
	
	chrome.storage.sync.get('config', function (result) {  
		
		if ($.isEmptyObject(result)) {			
			config={		
				minimo_indice_para_apostar:0.02,
				percentual_de_kelly:0.50,
				maximo_da_banca_por_aposta:0.15
			};		
			chrome.storage.sync.set({config:config});		
			
		} else{
			config=result.config;	
		}

		$('#config').val(JSON.stringify(config,null,4)  );
	});
	
	
	
	$('#salva').click(function(){
		console.log('foi');
		chrome.runtime.sendMessage({command:'SALVA_CONFIG', parm1: $('#config').val()  });
	});	
	
});
