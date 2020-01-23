var CONFIG;

var DIVISOR=0.75;
//const REDUTOR=0.80;



//Função que manipula uma variável que a bet365 guarda configurações do ambiente
$.storageItem=function(chave, valor){
    var StorageItems=JSON.parse(localStorage['ns_weblib_util.StorageItems']);
    if(valor!==undefined){
        StorageItems[chave]=valor;
        localStorage['ns_weblib_util.StorageItems']=JSON.stringify(StorageItems);
    }
    return StorageItems[chave];
};


function verificaSenhaSalva(){
    if((localStorage.senha_bet365==undefined) || (localStorage.senha_bet365=='') ){
        
        $('body').html('<center><br><div style="font-size:18px; border:1px solid"><br><p>Digite o seu usuário da Bet365</p><br><input id="usuario" /><br><p>Digite a sua senha da Bet365</p><br><input id="senha" /><button id="salvar_senha">Salvar</button><br><br></div></center>');
        $('#salvar_senha').click(function(){
              localStorage.senha_bet365=$('#senha').val();
			  localStorage.usuario_bet365=$('#usuario').val();
              //location.reload();
		      chrome.runtime.sendMessage({command:'RELOAD'});	
			  
        });
    }
}




function login(){
	//Se as credenciais não forem definidas não faz nada
	if((localStorage.senha_bet365==undefined) || (localStorage.senha_bet365=='') ) return;
	
	//Se estiver mostrando algum usuario esta logado
	var logado=($('.hm-UserName_UserNameShown').text()!='');
	
	//Se estiver logado Beleza !!!
	if(logado )return;  
	
	//Senão estiver tenta logar
	$('.hm-Login_UserNameWrapper .hm-Login_InputField').val(localStorage.usuario_bet365);
	$('.hm-Login_PasswordWrapper .hm-Login_InputField').val(localStorage.senha_bet365);
	$('.hm-Login_LoginBtn').click();
	
}


function preparaTelaInPlay(){
	//Se não estiver da tela do Futebol (Soccer) muda para a tela Soccer
	if( !$('.ipo-ClassificationBarButtonBase_Selected').is('.ipo-ClassificationBarButtonBase_Selected-1') ) $('.ipo-ClassificationBarButtonBase:contains(Soccer)').click();
	
	//Se não estiver fechado a tela do video, clica para fechar
	if( !$('.lv-ClosableTabView').is('.lv-ClosableTabView_Closed') ) $('.lv-ClosableTabView_Button').click();

	//Se não estiver na ViewPoint Full Time Asians clica para mudar para ela.
	if($('.ipo-InPlayClassificationMarketSelectorDropDown_Button').is(':not(:contains(Full Time Asians))') ) {
		$('.ipo-InPlayClassificationMarketSelectorDropdownLabelContainer').click(); 
		$('.lul-DropDownItem_Label:contains("Full Time Asians")').click();
	}
	
	//Se MyBets nao estiver selecionado seleciona
	if(!$('.bw-BetslipHeader_Item:contains(My Bets)').is('.bw-BetslipHeader_Item-active') ) $('.bw-BetslipHeader_Item:contains(My Bets)').click();
	
    
	//Coloca no MyBets Unsettled senão estiver
	if( $('.mbr-MyBetsHeaderRhs_ButtonSelected:contains(Unsettled)').length==0) $('.mbr-MyBetsHeaderRhs_Button:contains(Unsettled)').click();
    
}

function myBets(){
    myBetsList=[];
    
    if( $('.mbr-OpenBetItemRhs').length==0) return;
    
    $('.mbr-OpenBetItemRhs').each(function(){
        if( !$(this).is('.mbr-OpenBetItemRhs_DefaultExpanded') ) $(this).find('.mbr-OpenBetItemHeaderRhs_BetDetailsContainer').click(); 
        
		myBetsList.push({
            home_v_away: $(this).find('.mbr-OpenBetParticipantRhs_FixtureDescriptionText').text(),
			stake: Number(/[0-9^.]+/.exec($(this).find('.mbr-OpenBetItemRhsDetails_StakeText').text())[0])
		});
    });  
    
	localStorage.myBetsList=JSON.stringify(myBetsList);
	localStorage.myBetsLastUpdate=(+new Date());
    
}



function inicializa(){
    
    //Atualiza a Regressão dinamicamente
    $.getScript('https://bot-ao.com/bet365_bot_regressao.js');

    //Coloca bo Modo QuickBet
    if( $.storageItem('quickBetEnabled')==false) {
        $.storageItem('quickBetEnabled', true);
        location.reload();
    }

    //Se myBetList não existir cria
    if( localStorage.myBetsList==undefined ) localStorage.myBetsList='[{"home_away":"A v B","stake":0}]';


    //Verifica se as credenciais estão definidas
    $(function(){
        setTimeout(function(){
            verificaSenhaSalva();
        },10000);
    });

}



//Exexuta a funções assim que a página é carregadoa
inicializa();





bot={};

window.bot=bot;
bot.apostando_agora=false;

//Extrai informações jogo a partir da Fixture(Linha que tem a linhas formações sobre o jogo tela do inplay)
bot.jogoLive=function(fixture){
    //console.log(fixture);
	var goal_arr=$(fixture).find('.ipo-MainMarketRenderer:eq(2) .gll-ParticipantCentered_Handicap:eq(0)').text().split(' ')[2].split(',');
	
	return {
		tempo: Number($(fixture).find('.ipo-InPlayTimer').text().split(':')[0]),
		goalline: goal_arr.length==2 ? ( Number(goal_arr[0])+Number(goal_arr[1]) )/2 : Number(goal_arr[0]),
		odds_over:  Number($(fixture).find('.gll-ParticipantCentered_BlankName:eq(5) .gll-ParticipantCentered_Odds').text()),
		odds_under: Number($(fixture).find('.gll-ParticipantCentered_BlankName:eq(6) .gll-ParticipantCentered_Odds').text()),
		sel_under: $(fixture).find('.ipo-MainMarketRenderer:eq(2) .gll-ParticipantCentered_BlankName:eq(1)' )
	};
}


//Verifica se já vou aposta  no jogo
bot.jaFoiApostado=function(home_v_away){
	myBetsList=JSON.parse(localStorage['myBetsList']);
	
	var retorno=false;
	$(myBetsList).each(function(){
		if( this.home_v_away==home_v_away ) retorno=true;
	});
	return retorno;
};


//Calucla o stake a partir do percentual da banca 
bot.stake=function(percent_da_banca){
	myBetsList=JSON.parse(localStorage.myBetsList);
    
    var soma=0;

	var soma_stakes=0;
	$(myBetsList).each(function(){
		soma_stakes+=this.stake;		
	});
	
	
	soma=soma_stakes*CONFIG.redutor;
	
	soma+=bot.balance; 
	
    var stake_var=Number((soma*percent_da_banca).toFixed(2));
    if (stake_var<0.5) stake_var=0.5;
	
    return stake_var;
};


//Submete a aposta
bot.apostar=function(selObj, percent_da_banca){
	selObj.click();
    $.waitFor('.qb-QuickBetStake_InputField',function(){
      $('.qb-QuickBetStake_InputField').sendkeys('{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}'+bot.stake(percent_da_banca) );
	  $('.qb-QuickBetModule :contains(Place Bet)').click();
	});
};







//---Toda vez que as estatisticas do arquivo JSON forem carregadas
bot.onLoadStats=function(response){

   bot.apostando_agora=false;
   
   var jogos=JSON.parse(response);
    
   $('.ipo-Fixture').each(function(i,fixture){

	   var home=$(fixture).find('.ipo-TeamStack_TeamWrapper:eq(0)').text();
	   var away=$(fixture).find('.ipo-TeamStack_TeamWrapper:eq(1)').text();
        
      

	   $(jogos).each(function(ii,jogo){			   
			 if (bot.apostando_agora) return;
		   
			 if(  (ns(jogo.home)==ns(home)) && (ns(jogo.away)==ns(away)) ){
				   
                   //console.log(jogo.tempo);
				   //Se a aba myBets não foi atualiza nos últimos 2 segundos sai;
				   //if( ( +new Date() ) - Number(localStorage.myBetsLastUpdate) >2000) return;
				   
				   //Senão estiver no half time sai
                   //if( jogo.time != 'half') return;   
                     
                   
                   //Se quase não tiver ataque perigosos sai, porque pode ser um jogo com erro nos dados
                   if( (jogo.daH+jogo.daA )<5) return;  
                   
                   
                   //Se já houve aposta nesse jogo sai.
				   if( bot.jaFoiApostado(home+' v '+away) ) return;   
                   
				   //console.log(jogo);
                   
				   //Se o elemento DOM da linha do jogo 
				   jogo_selecionado=bot.jogoLive(fixture);
                   
                   if( jogo_selecionado.tempo != 45) return; 
                   
					j=jogo;
                    j_sel=jogo_selecionado;
                    
					//Aposta no Under
					goalline=jogo_selecionado.goalline;
                    
                    var probUnder=1.0/j_sel.odds_under/(1.0/j_sel.odds_under + 1.0/j_sel.odds_over);
		
               
                    s_g=j.gH+j.gA;
                    s_c=j.cH+j.cA;
                    s_da=j.daH+j.daA;
                    s_s=j.sH+j.sA;
                    d_g=Math.abs(j.gH-j.gA);
                    d_c=Math.abs(j.cH-j.cA);
                    d_da=Math.abs(j.daH-j.daA);
                    d_s=Math.abs( j.sH-j.sA);
					s_r=j.sr;
                    goal=goalline;
                    goal_diff=goalline-s_g;
                    oddsU=1.0*j_sel.odds_under;
					oddsO=1.0*j_sel.odds_over;
                    probU=probUnder;
                    probU_diff=Math.abs( probUnder-0.5 );
                    mod0=Number(goalline%1==0);
                    mod25=Number(goalline%1==0.25);
                    mod50=Number(goalline%1==0.50);
                    mod75=Number(goalline%1==0.75);
                   

                    if (mod0)  DIVISOR=0.7;
                    if (mod25) DIVISOR=0.5;
                    if (mod50) DIVISOR=0.6;
                    if (mod75) DIVISOR=0.6;
                    
                    eval(localStorage.FORMULA2);
	               
                   
				   //plU_por_odds=(d_g==0)&&(goal_diff>=1.5) ? 1*(-0.008731998*s_g + -0.005027927*s_c + -0.0005261647*s_da + -0.008349259*s_s + -1.610932e-05*d_da + -0.004080577*d_c + 0.1214133*goal_diff + 0.2064024*oddsU + -0.1924175*probU_diff + -0.02602331*mod75 -0.4113046) : -1;
                   
                   //plU_por_odds=1*(-0.008731998*s_g + -0.005027927*s_c + -0.0005261647*s_da + -0.008349259*s_s + -1.610932e-05*d_da + -0.004080577*d_c + 0.1214133*goal_diff + 0.2064024*oddsU + -0.1924175*probU_diff + -0.02602331*mod75 -0.4113046);
				   
				   //console.log(jogo.home,plU_por_odds);
				   plO_por_odds=-1;
				   
				   
                   console.log([home, away, plU_por_odds, plO_por_odds]);
                    

                    //Se o não atingir o indice mínimo não aposta
                    //if( (plU_por_odds <  CONFIG.minimo_indice_para_apostar) && (plO_por_odds <  CONFIG.minimo_indice_para_apostar)	  ) return;
                    
					

                    if (plU_por_odds >= CONFIG.minimo_indice_para_apostar) {
						var percent_da_banca=CONFIG.percentual_de_kelly*plU_por_odds/DIVISOR;              
						if (percent_da_banca >  CONFIG.maximo_da_banca_por_aposta) percent_da_banca=CONFIG.maximo_da_banca_por_aposta;
						bot.apostar(jogo_selecionado.sel_under, percent_da_banca );
						return;
                    }
					
				
					
					
			 }
             
             
	   });
   });



   
   
};  





//---A cada 30 segundos
setInterval(function(){		
    console.log('on30segs');
     
    //Clica no Live do My Bets só para dar uma atualizada na lista
    $('.mbr-MyBetsHeaderRhs_Button:contains(Live)').click();
    
    
    //Faz um ajax para o arquivo JSONP "http://aposte.me/live/stats4.js  que executará a função bot.onLoadStats()"
    $.getScript(localStorage.bot365_new==='1'? 'https://bot-ao.com/stats4_new.js' : 'https://bot-ao.com/stats4.js', function(){
        bot.onLoadStats(localStorage.stats);
        //Pega o valor da banca disponível
        $.get('https://www.'+CONFIG.dominio+'/balancedataapi/pullbalance?rn=1',function(res){ 
            bot.balance=Number(res.split('$')[2]); 
        });
        
    });
      
    
},30000);


//Loop Principal repete todos os comandos a cada 1 segund
setInterval(function(){
	//Atualiza configuração
	CONFIG=JSON.parse(localStorage.config);
	
	//Senão estiver logado, loga
	login();
	
	//Seleciona todas as opções para tela do Inplay ficar do jeito esperado
	preparaTelaInPlay();

    //Atualiza info sobre as apostas em andamento
    myBets();
    
	
	//  $('.stk.bs-Stake_TextBox').val('1.50')
	//  $('.bs-Btn.bs-BtnHover').click()
	
	
	// .ipo-Fixture
    

	//Abre os mercados colapsados
	//$('.ipe-Market:not(:has(.ipe-MarketContainer ))').each(function(i,e){ $(e).click() })
	//bot.interativo();
	
	


},1000);







//A cada 15 minutos recarrega a pagina
window.setInterval(function(){
    window.location.reload();
},15*60*1000);



