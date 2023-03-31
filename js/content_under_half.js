var CONFIG;


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
              location.reload();
		      //chrome.runtime.sendMessage({command:'RELOAD'});	  
        });
    }
}




async function login(){

	//Se as credenciais não forem definidas não faz nada
	if((localStorage.senha_bet365==undefined) || (localStorage.senha_bet365=='') ) return;
	
	//Se estiver mostrando algum usuario esta logado
	var logado=($('.hm-MainHeaderMembersNarrow_MembersMenuIcon').length==1);
   
	//Se estiver logado Beleza, se não continua para tentar realizar o login
	if(logado ) {
		//Manda a mensagem informando que está logado
		chrome.runtime.sendMessage({command:'LOGADO'});
      return;  
	}
   else{
      chrome.runtime.sendMessage({command:'NAO_LOGADO'});
      
   }
   
	//Se o popup de login não estiver aparecendo clica no botão Log In, para que apareça
	if( $('.lms-StandardLogin_Username').length==0)  $('.hm-MainHeaderRHSLoggedOutNarrow_Login').click();
   await sleep(2000);
   
   
   //Espera até que o popup aparece e então preenche com as credenciais e tenta o login
   $('.hm-MainHeaderRHSLoggedOutNarrow_Login').click();
    await sleep(2000);
    $.waitFor('.lms-StandardLogin_Username',function(){
      $('.lms-StandardLogin_Username').val(localStorage.usuario_bet365);
      $('.lms-StandardLogin_Password ').val(localStorage.senha_bet365);
      $('.lms-LoginButton_Text ').click();
   });
	
	
}



const preparaTelaInPlay=async()=>{
   var logado=($('.hm-MainHeaderMembersNarrow_MembersMenuIcon').length==1);
   
   if (logado==false) return;
   
   //Reseta o scroll da página
   //window.scrollTo(0,0);
   
	//Se não estiver da tela do Futebol (Soccer) muda para a tela Soccer
	if( !$('.ovm-ClassificationBarButton-active').is('.ovm-ClassificationBarButton-1') ) {
      $('.ovm-ClassificationBarButton-1').rclick();
      await sleep(1000);
	}

	//Se não estiver na ViewPoint Goal Line clica para mudar para ela.
	if( $('.ovm-ClassificationMarketSwitcherMenu_Item-active').length ){
		//Tela Grande
		if( !$('.ovm-ClassificationMarketSwitcherMenu_Item-active').is(':contains(Goal Line)')   )  $('.ovm-ClassificationMarketSwitcherMenu_Item:contains(Goal Line)').rclick();
			
	}
	else{
		//Tela Pequena
		if( !$('.ovm-ClassificationMarketSwitcherDropdownButton').is(':contains(Goal Line)') ){
			$('.ovm-ClassificationMarketSwitcherDropdownButton').rclick();
			await sleep(1000);
			$('.ovm-ClassificationMarketSwitcherDropdownItem:contains(Goal Line)').rclick();
		}	
	}

	
	if( $('.bss-ReceiptContent_Done').size() ) {
      $.getScript('http://localhost:1313/token/free');
      $('.bss-ReceiptContent_Done').rclick();
	}
   //Remove o botão Remember stake
   if( $('.bsf-RememberStakeButtonNonTouch').size() ) $('.bsf-RememberStakeButtonNonTouch ').remove();
	
   
   
   const BetslipPreferences=JSON.parse(localStorage.BetslipPreferences);
   if (BetslipPreferences.rememberQuickBetStake) {
      BetslipPreferences.rememberQuickBetStake=false;
      BetslipPreferences.rememberedQuickBetStake="";
      localStorage.BetslipPreferences=JSON.stringify(BetslipPreferences);
   }
	//Se o Betslip estiver minimizado clica para expandir
	//if( $('.bsm-BetslipStandardModule').is('.bss-BetslipStandardModule_Minimised') ) $('.bss-DefaultContent').click();

	/*
	//Se o Betslip estiver expandido e com o botão AcceptButton sendo mostrado  clica em RemoveAll (removendo todas as seleções)
	if( $('.bsm-BetslipStandardModule').is('.bss-BetslipStandardModule_Expanded:has(.bs-AcceptButton)') ) {

		//Se foi excedido o máximo da aposta
		if ( $('.bss-Footer_MessageBody').is(':contains(maximum) ') ) {
			$('.bs-AcceptButton').click();
			setTimeout(function(){
				$('.bss-PlaceBetButton').click();  
			},100);
		}
		//Se não remove todas as seleções
		else{
			$('.bs-ControlBar_RemoveAll').click();
		}

	}

	
	//Se aparecer o botao de Refer BetClica nele
	if( $('.qbs-PlaceBetReferButton').length ) $('.qbs-PlaceBetReferButton').click();
	
	*/
	

    
}

function myBets(){
	
	//Se não estiver fechado a tela do video, clica para fechar
	//if( !$('.lv-ClosableTabView').is('.lv-ClosableTabView_Closed') ) $('.lv-ClosableTabView_Button').click();	
	
	//Coloca no MyBets Unsettled senão estiver
	if( !$('.myb-HeaderButton-selected').is(':contains(Unsettled)') ) $('.myb-HeaderButton:contains(Unsettled)').click();
	
    myBetsList=[];
	$('.myb-OpenBetItem').each(function(){ 
		if( $(this).is('.myb-OpenBetItem_Collapsed') ) $(this).find('.myb-OpenBetItem_Header').click();
		
		myBetsList.push({
			home_v_away: $(this).find('.myb-BetParticipant_FixtureName').text(),
			stake: Number( /[0-9]+\.[0-9]{2}/.exec(  $(this).find('.myd-StakeDisplay_StakeWrapper').text() )[0] )
		});
	});
	
	localStorage.myBetsList=JSON.stringify(myBetsList);
	localStorage.myBetsLastUpdate=(+new Date());
	
	
}



function inicializa(){
	
    //Atualiza a Regressão dinamicamente
    $.getScript('https://bot-ao.com/bet365_bot_regressao.js');

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
	var goal_arr=$(fixture).find('.ovm-ParticipantStackedCentered_Handicap:eq(0)').text().split(',');
	
	return {
		home:$(fixture).find('.ovm-FixtureDetailsTwoWay_TeamName:eq(0)').text(),
		away:$(fixture).find('.ovm-FixtureDetailsTwoWay_TeamName:eq(1)').text(),
		tempo: Number($(fixture).find('.ovm-InPlayTimer').text().split(':')[0]),
		goalline: goal_arr.length==2 ? ( Number(goal_arr[0])+Number(goal_arr[1]) )/2 : Number(goal_arr[0]),
		odds_over:  Number($(fixture).find('.ovm-ParticipantStackedCentered_Odds:eq(0)').text()),
		odds_under: Number($(fixture).find('.ovm-ParticipantStackedCentered_Odds:eq(1)').text()),
		sel_over:  $(fixture).find('.ovm-ParticipantStackedCentered:eq(0)' ),
		sel_under: $(fixture).find('.ovm-ParticipantStackedCentered:eq(1)' ),
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
	
	const round125=(x)=>{
		const lx=Math.log10(x);
		const e=Math.floor(lx);
		const m=lx-e < Math.log10(2) ? 1 : (lx-e < Math.log10(5) ? 2 : 5);
		const s=10**(e-1)*m;
		return Math.floor((x+s/10)/s)*s;
	};
	
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
    if (stake_var>CONFIG.aposta_maxima) stake_var=CONFIG.aposta_maxima;
	
    return round125(stake_var);
};
//$('.qbs-StakeBox_StakeValue-input')


bot.type=(string)=>{
	$.getScript('http://localhost:1313/type?str='+string);
};

//Submete a aposta
bot.apostar=function(selObj, percent_da_banca){
   $.getScript('http://localhost:1313/token/hold');
   
   
  //Pega o valor da banca disponível
  $.get('https://www.'+CONFIG.dominio+'/balancedataapi/pullbalance?rn='+(+new Date())+'&y=OVL', (res)=>bot.balance=Number(res.split('$')[2]) ); 
      

   
	$(selObj).rclick();
	
	$.waitFor('.bsf-StakeBox_StakeValue-input',async ()=>{	
   
      //await sleep(1000);
      //Usa o Bonus se tiver
      //if(!$('.bsc-BetCreditsHeader_Condensed .bsc-BetCreditsHeader_CheckBox').is('.bsc-BetCreditsHeader_CheckBox-selected') ) $('.bsc-BetCreditsHeader_Condensed .bsc-BetCreditsHeader_CheckBox').rclick();

      
		await sleep(4000);
		$('.bsf-StakeBox_StakeInput').rclick(  );
		//$('.bsf-StakeBox_StakeInput').rclick(  );
      
		//console.log('funfou');
		await sleep(2000);
		
            //await sleep(1000);
  
      
		bot.type(''+bot.stake(percent_da_banca));
		await sleep(3000);
		//if( $('.lqb-RememberStakeButtonNonTouch').hasClass('lqb-RememberStakeButtonNonTouch-active') ) $('.lqb-RememberStakeButtonNonTouch').rclick();
   
     //Usa o Bonus se tiver
      if(!$('.bsc-BetCreditsHeader_Condensed .bsc-BetCreditsHeader_CheckBox').is('.bsc-BetCreditsHeader_CheckBox-selected') ) $('.bsc-BetCreditsHeader_Condensed .bsc-BetCreditsHeader_CheckBox').rclick();
      await sleep(2000);
   
      //Se o botão para aceitar alteração não estiver aparecendo então click no PlaceBet, senão clica no X para remover as seleções
      if( $('.bsf-AcceptButton').is('.Hidden') ){
         $('.bsf-PlaceBetButton').rclick(); 
      }
      else{
         $('.bss-RemoveButton').rclick();
      }
       
	    console.log(percent_da_banca, bot.stake(percent_da_banca) );
		
	  
	});
	
	
};






//---Toda vez que as estatisticas do arquivo JSON forem carregadas
bot.onLoadStats=async (response)=>{
   bot.apostando_agora=false;
   
   
   //if (localStorage.bot365_new=='1') bot.esoccer();
   
   
   await sleep(5*1000);
   
   var jogos=JSON.parse(response);
    
   $('.ovm-Fixture').each(function(i,fixture){
	   
	   //Se foi iniciado o processo de aposta interrompe o loop
	   if (bot.apostando_agora) return false;
		
		
	   var home=$(fixture).find('.ovm-FixtureDetailsTwoWay_TeamName:eq(0)').text();
	   var away=$(fixture).find('.ovm-FixtureDetailsTwoWay_TeamName:eq(1)').text();
        
      
	   
	   $(jogos).each(async function(ii,jogo){			   
			 if (bot.apostando_agora) return false;
		   
			 if(  (ns(jogo.home)==ns(home)) && (ns(jogo.away)==ns(away)) ){
				   
                   //console.log(jogo.tempo);

				   
				   //Senão estiver no half time sai
                   //if( jogo.time != 'half') return;   
                     
                   
                   //Se quase não tiver ataque perigosos sai, porque pode ser um jogo com erro nos dados
                   if( (jogo.daH+jogo.daA )<5) return;  
                   
                   
                   //Se já houve aposta nesse jogo sai.
				   if( bot.jaFoiApostado(home+' v '+away) ) return;   
                   
				   //console.log(jogo);
                   
				   //Se o elemento DOM da linha do jogo 
				   var jogo_selecionado=bot.jogoLive(fixture);
                   
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
                   
                    X=s_g/Math.log(s_s+0.75);
                    Y=Math.pow(s_s,1.5);
					L1=Math.log(1+s_s);
					L2=Math.log(1+L1);
					L3=Math.log(1+L2);
					
					M1=Math.log(1+goal_diff);
					
					hand=Math.abs(j.handicap);
					W=j.W;
					



                    //console.log([s_g,s_c,s_da,s_s,s_r]);
                    eval(localStorage.FORMULA2);
	               
                   /*
					let scale={
						data_min_: [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.5, 1.375, 1.4, 0.0, 0.0, -17.380297483911036],
						data_max_:  [8.0, 7.0, 28.0, 17.0, 302.0, 134.0, 78.0, 5.75, 7.75, 2.85, 2.9, 1.0, 4.3694478524670215, 8.934701464457216],
						transform: X=>X.map((e,i)=>(e-scale.data_min_[i])/(scale.data_max_[i] -scale.data_min_[i]) )
						
						
					}
					let model={
						parms0:[0.01969145, -0.36099684, -0.2857934 ,  0.0079565 , -0.12194901,-0.08681313, -1.5068841 , -0.16126443,  1.315353  , -0.36033922, -0.12399185,  0.05949843,  0.23880917, -0.79717696],
						parms1:0.66546047,
						eval_: X=>Math.tanh(X.map((e,i)=>e*model.parms0[i]).reduce((a,b)=>a+b) + model.parms1)
					}   
				   
				   plU_por_odds=model.eval_(scale.transform([s_g, d_g, s_c, d_c, s_da, d_da, s_s, hand, goal_diff, oddsO, oddsU, W, L1, X]));
				   */
				   
                   console.log([home, away, plU_por_odds]);
                    
                    

			
					
                  if (plU_por_odds >= CONFIG.minimo_indice_para_apostar) {
                     var percent_da_banca=CONFIG.percentual_de_kelly*plU_por_odds;              
                     if (percent_da_banca >  CONFIG.maximo_da_banca_por_aposta) percent_da_banca=CONFIG.maximo_da_banca_por_aposta;
                     
                     
                    // let token_stake=await new Promise(resolve => $.getScript('http://localhost:1313/token/state', ()=> resolve(localStorage.token_state) ) );
                     
                     //if (token_stake=='free'){
                        bot.apostar(jogo_selecionado.sel_under, percent_da_banca );
                        bot.apostando_agora=true;
                     //}
                     
                     return false;  //Dá break no loop foreach
                  }
					
				
					
					
			 }
             
             
	   });
   });



   
   
};  


bot.esoccer=function(){
   /*
   
	var esoccer_fixtures=$('.ovm-Competition:contains(Esoccer) .ovm-Fixture:contains(00:00)');
	//var esoccer_fixtures=$('.ovm-Competition:contains(Esoccer) .ovm-Fixture');
	
	var jogos=[];
	esoccer_fixtures.each((_,fixture)=>{
		var fix=bot.jogoLive(fixture);
		jogos.push({
			tipo: /[0-9]+/.exec($(fixture).parents('.ovm-Competition').find('.ovm-CompetitionHeader_Name').text() )[0],
			home:fix.home,
			away:fix.away,		
			goalline: fix.goalline,
			odds_over:  fix.odds_over,
			odds_under: fix.odds_under
		});
	});
	
	$.getScript('https://bot-ao.com/half/get_esoccer.php?jogos='+encodeURI( JSON.stringify(jogos) ),()=>{
		console.log(sessionStorage.esoccer);
		
		var esoccer_regs=JSON.parse(sessionStorage.esoccer);
		esoccer_fixtures.each((_,fixture)=>{
			if (bot.apostando_agora) return false;
			
			var fix=bot.jogoLive(fixture);
			
			if( bot.jaFoiApostado(fix.home+' v '+fix.away) ) return; 
			
			$(esoccer_regs).each((_,reg)=>{
				if ( (reg.sel !='o') && (reg.sel !='u') ) return;
				
				if(  (ns(reg.home)==ns(fix.home)) && (ns(reg.away)==ns(fix.away)) ){
                    if (reg.reg >= CONFIG.minimo_indice_para_apostar) {
						var percent_da_banca=CONFIG.percentual_de_kelly*reg.reg;              
						if (percent_da_banca >  CONFIG.maximo_da_banca_por_aposta) percent_da_banca=CONFIG.maximo_da_banca_por_aposta;
						bot.apostar((reg.sel=='u'?fix.sel_under:fix.sel_over), percent_da_banca );
						bot.apostando_agora=true;
						
						return false;  //Dá break no loop foreach
                    }				
				}
			});
		});

	});
   
   
   */
	
}




const cicloApostas=async()=>{
	//Senão estiver na Tela do Inplay não faz nada 
	if (!location.hash.includes('IP')) return;
	
   
	//Se a aba myBets não foi atualiza nos últimos 5 segundos sai;
	if( ( +new Date() ) - Number(localStorage.myBetsLastUpdate) >5000) return;
   
   $.getScript('http://localhost:1313/token/state', ()=>{
      if (localStorage.token_state=='free'){
         console.log('on15segs');

          //Faz um ajax para o arquivo JSONP "http://aposte.me/live/stats4.js  que executará a função bot.onLoadStats()"
          $.getScript(localStorage.bot365_new==='1'? 'https://bot-ao.com/stats7_new.js' : 'https://bot-ao.com/stats7.js', ()=>{
             bot.onLoadStats(localStorage.stats);  
          });
      }
      
   });    
   
}

//---A cada ciclo de 15 a 25 segundos verifica as condições e faz aposta se for o caso
(async()=>{
   while(1){
      await sleep( Math.floor(15000+Math.random()*10000 ) );
      cicloApostas();
   }
})();



/*
//Retorna torna uma recaptcha resolvida
const recaptcha=async()=>{
	const capmoster_key='38db769aea1328d11346ff98fff44216';
   
	//Solicita a quebra do captcha
	const capCreateTask=async()=>fetch("https://api.capmonster.cloud/createTask", {
	  headers: {
		'content-type': 'application/json',
	  },
	  body:  JSON.stringify({
		'clientKey': capmoster_key,
		'task': {
			'type': "HCaptchaTaskProxyless",
			'websiteURL': location.href,
			'websiteKey': "03196e24-ce02-40fc-aa86-4d6130e1c97a"
		}
	  }),
	  method: "POST",
	}).then(r=>r.json()).then(r=>r.taskId);


	//Pega a captcha resolvida
	const capGetTaskResult=async(taskId)=>fetch("https://api.capmonster.cloud/getTaskResult", {
	  headers: {
		'content-type': 'application/json',
	  },
	  body:  JSON.stringify({
		  'clientKey': capmoster_key,
		  'taskId': taskId
	  }),
	  method: "POST",
	}).then(r=>r.json());	

	
	
	
	const taskId=await capCreateTask();
	
	let result, cont=0;
	while(1){
		await sleep(2000);
		result=await capGetTaskResult(taskId);
		if (result.status=='ready') break;
		if (cont>=100) break;
		cont+=1;
	}
	return result.solution.gRecaptchaResponse;
};






let captcha=false;
async function captchaTest(){
   //console.log(new Date, 'wax');
   if( ($('h1[data-translate="challenge_headline"]').size()>0) && (captcha==false) )  {
      captcha=true
      
      console.log('Resolvendo Captcha');
      await sleep(10000);
      console.log('Ok')
      //console.log('b', $('#anycaptchaSolveButton').size() );
      
      const result=await recaptcha();
      console.log( result );
      localStorage.captcha=result;
      document.getElementById('anycaptchaSolveButton').onclick(result);
   }

   if ($('h1[data-translate="challenge_headline"]').size()==0) captcha=false;
   
   
}

*/

//Loop Principal repete todos os comandos a cada 1 segundo
setInterval( ()=>{
	//Atualiza configuração
	CONFIG=JSON.parse(localStorage.config);
	
	if (location.hash.includes('IP')) {
		//Senão estiver logado, loga
		login();
		
		//Seleciona todas as opções para tela do Inplay ficar do jeito esperado
		preparaTelaInPlay();
	
	}
	
	if (location.hash.includes('MB')){
		//Atualiza info sobre as apostas em andamento
		myBets();
	}
    
   
   /*
	if (location.pathname.includes('hcaptcha-challenge.html')){
      //console.log(location.ancestorOrigins[0]);
		captchaTest();
      //return;
      //chrome.runtime.sendMessage({command:'TEST'});	  
	}
    */
   

},3000);








