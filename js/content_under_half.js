var CONFIG;

const DIVISOR=0.75;
//const REDUTOR=0.80;



$.waitFor=function(elemento, func, timeout=15000){
	var cont=0;
	var loopWait=setInterval(function(){
		if( $(elemento).size()==1){
			clearInterval(loopWait);
			func();
		}
		cont=+100;
		if (cont>=timeout) clearInterval(loopWait);
	},100);	
	
};




function verificaSenhaSalva(){
    if((localStorage.senha_bet365==undefined) || (localStorage.senha_bet365=='') ){
        
        $('body').html('<center><br><div style="font-size:18px; border:1px solid"><br><p>Digite o seu usuário da Bet365</p><br><input id="usuario" /><br><p>Digite a sua senha da Bet365</p><br><input id="senha" /><button id="salvar_senha">Salvar</button><br><br></div></center>');
        $('#salvar_senha').click(function(){
              localStorage.senha_bet365=$('#senha').val();
			  localStorage.usuario_bet365=$('#usuario').val();
              //location.reload();
		      //chrome.runtime.sendMessage({command:'RELOAD'});	
			  
        });
    }
}






$(function(){
setTimeout(function(){
    verificaSenhaSalva();
},15000);



//Se não estiver numa tela de Goalline não faz nada
if (!location.hash.includes('#/IP/')) return;

//$.getScript('https://bot-ao.com/bet365_bot_regressao.js?' + ( +new Date() ) );








/*
function removeDiacritics(a){changes||(changes=defaultDiacriticsRemovalMap);for(var b=0;b<changes.length;b++)a=a.replace(changes[b].letters,changes[b].base);return a}var defaultDiacriticsRemovalMap=[{base:"A",letters:/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},{base:"AA",letters:/[\uA732]/g},{base:"AE",letters:/[\u00C6\u01FC\u01E2]/g},{base:"AO",letters:/[\uA734]/g},{base:"AU",letters:/[\uA736]/g},{base:"AV",letters:/[\uA738\uA73A]/g},{base:"AY",letters:/[\uA73C]/g},{base:"B",letters:/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},{base:"C",letters:/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},{base:"D",letters:/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},{base:"DZ",letters:/[\u01F1\u01C4]/g},{base:"Dz",letters:/[\u01F2\u01C5]/g},{base:"E",letters:/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},{base:"F",letters:/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},{base:"G",letters:/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},{base:"H",letters:/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},{base:"I",letters:/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},{base:"J",letters:/[\u004A\u24BF\uFF2A\u0134\u0248]/g},{base:"K",letters:/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},{base:"L",letters:/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},{base:"LJ",letters:/[\u01C7]/g},{base:"Lj",letters:/[\u01C8]/g},{base:"M",letters:/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},{base:"N",letters:/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},{base:"NJ",letters:/[\u01CA]/g},{base:"Nj",letters:/[\u01CB]/g},{base:"O",letters:/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},{base:"OI",letters:/[\u01A2]/g},{base:"OO",letters:/[\uA74E]/g},{base:"OU",letters:/[\u0222]/g},{base:"P",letters:/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},{base:"Q",letters:/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},{base:"R",letters:/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},{base:"S",letters:/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},{base:"T",letters:/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},{base:"TZ",letters:/[\uA728]/g},{base:"U",letters:/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},{base:"V",letters:/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},{base:"VY",letters:/[\uA760]/g},{base:"W",letters:/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},{base:"X",letters:/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},{base:"Y",letters:/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},{base:"Z",letters:/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},{base:"a",letters:/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},{base:"aa",letters:/[\uA733]/g},{base:"ae",letters:/[\u00E6\u01FD\u01E3]/g},{base:"ao",letters:/[\uA735]/g},{base:"au",letters:/[\uA737]/g},{base:"av",letters:/[\uA739\uA73B]/g},{base:"ay",letters:/[\uA73D]/g},{base:"b",letters:/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},{base:"c",letters:/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},{base:"d",letters:/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},{base:"dz",letters:/[\u01F3\u01C6]/g},{base:"e",letters:/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},{base:"f",letters:/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},{base:"g",letters:/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},{base:"h",letters:/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},{base:"hv",letters:/[\u0195]/g},{base:"i",letters:/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},{base:"j",letters:/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},{base:"k",letters:/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},{base:"l",letters:/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},{base:"lj",letters:/[\u01C9]/g},{base:"m",letters:/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},{base:"n",letters:/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},{base:"nj",letters:/[\u01CC]/g},{base:"o",letters:/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},{base:"oi",letters:/[\u01A3]/g},{base:"ou",letters:/[\u0223]/g},{base:"oo",letters:/[\uA74F]/g},{base:"p",letters:/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},{base:"q",letters:/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},{base:"r",letters:/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},{base:"s",letters:/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},{base:"t",letters:/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},{base:"tz",letters:/[\uA729]/g},{base:"u",letters:/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},{base:"v",letters:/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},{base:"vy",letters:/[\uA761]/g},{base:"w",letters:/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},{base:"x",letters:/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},{base:"y",letters:/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},{base:"z",letters:/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}],changes;

function ns(texto){
	return removeDiacritics(texto.toLowerCase());
}
*/



verificaSenhaSalva();











var time_;




bot={};

window.bot=bot;
bot.apostando_agora=false;



bot.stake=function(percent_da_banca){
	myBetsList=JSON.parse(localStorage['myBetsList']);
    
    var soma=0;
	/*
	$(myBetsList).each(function(){
		soma+=this.cash_out_return;		
	});
	*/
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

bot.jogoLive = function (home,away){
	var ahSel=function(selObj){
	   var arr_ah=selObj.find('.ip-Participant_OppName').text().split(',');

	   var s=0;
	   $(arr_ah).each(function(i,e){ s+=Number(e); });
	   return s/$(arr_ah).size();
	};	
   
	jogo=-1;
	$('div.ipe-ParticipantCouponFixtureName_Participant ').each(function(i,e){ 
		if( 
			($(e).find('.ipe-ParticipantCouponFixtureName_TeamName:eq(0)').html()==home)  && 
			($(e).find('.ipe-ParticipantCouponFixtureName_TeamName:eq(1)').html()==away )
		){
			//saida=i;
			jogo={
					market: $(e).parents('.ipe-Market')
			};
				   
		}		
		
	});
	if (jogo==-1) return jogo;
	
	jogo.selecoes=$(jogo.market).find('.ip-Participant ');
	jogo.numJogos=$(jogo.market).find('.ipe-ParticipantCouponFixtureName_Participant').size();
	
	$(jogo.market).find('.ipe-ParticipantCouponFixtureName_Participant').each(function(i,e){ 
		if( 
			($(e).find('.ipe-ParticipantCouponFixtureName_TeamName:eq(0)').html()==home)  && 
			($(e).find('.ipe-ParticipantCouponFixtureName_TeamName:eq(1)').html()==away )
		){
			jogo.positionInMarket=i;
			jogo.posSelsJogo=[jogo.positionInMarket, jogo.positionInMarket+jogo.numJogos];
			jogo.selHome=$(jogo.market).find('.ip-Participant').eq(jogo.posSelsJogo[0]);
			jogo.selAway=$(jogo.market).find('.ip-Participant').eq(jogo.posSelsJogo[1]);	
		}
	});
	jogo.tempo=Number($(jogo.market).find('.ipe-ParticipantCouponFixtureName_Timer').eq(jogo.positionInMarket).text().split(':')[0]);
	
	jogo.gH_atual=Number($(jogo.market).find('.ipe-ParticipantCouponFixtureName_Team1Score').eq(jogo.positionInMarket).text());
	jogo.gA_atual=Number($(jogo.market).find('.ipe-ParticipantCouponFixtureName_Team2Score').eq(jogo.positionInMarket).text());
	
	jogo.AH_Home=ahSel(jogo.selHome);
	jogo.AH_Away=ahSel(jogo.selAway);
	
	jogo.odds_Over=Number(jogo.selHome.find('.ip-Participant_OppOdds').text()); 
	jogo.odds_Under=Number(jogo.selAway.find('.ip-Participant_OppOdds').text()); 
	
	
	return jogo;
};

bot.jaFoiApostado=function(home,away){
	myBetsList=JSON.parse(localStorage['myBetsList']);
	
	var retorno=false;
	$(myBetsList).each(function(){		
		if ( (this.match==home+' v '+away) && (this.mercado.includes('Goal Line'))    )  retorno=true;
		
	});
	return retorno;
	
    

};




bot.digitaStake=function(valor){
	if( $('.qbs-NumberButton').size()==0 ) $('.qbs-StakeBox_StakeAmount').click();
	$.waitFor('.qbs-Keypad',function(){
		var delay=0;
		for(var i=1; i<=8; i++ ) {
			setTimeout(function(){	
			$('.qbs-DeleteButton').tap();
			},delay);
			
			delay+=100;
		}
		var lista_teclas=(''+valor).split('');
		lista_teclas.push('Done');
		console.log( lista_teclas);
		$(lista_teclas).each(function(i,e){
			delay+=200;
			setTimeout(function(){
				$('.qbs-Keypad div:contains('+e+') ').tap();
			},delay);
		});
		delay+=2000;
		setTimeout(function(){
			$('.qbs-AcceptButton, .qbs-PlaceBetButton').click();
			//$.waitFor('.qbs-PlaceBetButton:contains(Refer)',function(){
			//	$('.qbs-PlaceBetButton').click();
			//});
		},delay);	
	});
}

bot.apostar=function(selObj, percent_da_banca){ 
	bot.apostando_agora=true;
	selObj.click();
	$.waitFor('.qb-StakeBox', function(){
        //Usa os creditos
        if( $('.qb-UseBetCredits_CheckBox:not(.qb-UseBetCredits_CheckBox-selected)').size()>0 ) $('.qb-UseBetCredits_CheckBox').click();
		bot.digitaStake(bot.stake(percent_da_banca));
	});

};







//---Toda vez que as estatisticas do arquivo JSON forem carregadas
bot.onLoadStats=function(response){

   bot.apostando_agora=false;
   //bot.lista_de_apostas=[];
   

   var jogos=eval(response);


   //Se o flag bot.apostando_agora estiver true, não tenta aposta
   //if(bot.apostando_agora) return;
    
    
    var anota_apostas=[];
   //Para jogo no cupom
   
   //bot.fila_de_apostas=[];

   $('.ipe-ParticipantCouponFixtureName_Participant').each(function(i,e){

	   var home=$(e).find('.ipe-ParticipantCouponFixtureName_TeamName:eq(0)').text();
	   var away=$(e).find('.ipe-ParticipantCouponFixtureName_TeamName:eq(1)').text();
	   

	   $(jogos).each(function(ii,jogo){			   
			 if (bot.apostando_agora) return;
		   
			 if(  (ns(jogo.home)==ns(home)) && (ns(jogo.away)==ns(away)) ){
				   
                   //console.log(jogo.tempo);
				   //Se a aba myBets não foi atualiza nos últimos 2 segundos sai;
				   if( ( +new Date() ) - Number(localStorage.myBetsLastUpdate) >2000) return;
				   
				   //Senão estiver no half time sai
                   if( jogo.time != 'half') return;   
                     
                  
                   //Se quase não tiver ataque perigosos sai, porque pode ser um jogo com erro nos dados
                   if( (jogo.daHf+jogo.daAf )<5) return;  
                                   
                   //Se já houve aposta nesse jogo sai.
				   if( bot.jaFoiApostado(home,away) ) return;   
                   
				   
                   
				   //Se o elemento DOM da linha do jogo 
				   jogo_selecionado=bot.jogoLive(home,away);
                   
                   if( jogo_selecionado.tempo != 45) return; 
                   
					j=jogo;
                    j_sel=jogo_selecionado;
                    
					//Aposta no Under
					goalline=jogo_selecionado.AH_Away;
                    
                     var probUnder=1.0/j_sel.odds_Under/(1.0/j_sel.odds_Under + 1.0/j_sel.odds_Over);
		
               
                    s_g=j.gh+j.ga;
                    s_c=j.ch+j.ca;
                    s_da=j.dah+j.daa;
                    s_s=j.sh+j.sa;
                    d_g=Math.abs(j.gh-j.ga);
                    d_c=Math.abs(j.ch-j.ca);
                    d_da=Math.abs(j.dah-j.daa);
                    d_s=Math.abs( j.sh-j.sa);
					s_r=j.rh+j.ra;
                    goal=goalline;
                    goal_diff=goalline-s_g;
                    oddsU=1.0*j_sel.odds_Under;
					oddsO=1.0*j_sel.odds_Over;
                    probU=probUnder;
                    probU_diff=Math.abs( probUnder-0.5 );
                    mod0=Number(goalline%1==0);
                    mod25=Number(goalline%1==0.25);
                    mod50=Number(goalline%1==0.50);
                    mod75=Number(goalline%1==0.75);
                    
        
                    //eval(localStorage.FORMULA2);
	               

				   plU_por_odds=(d_g==0)&&(goal_diff>=1.5) ? 1*(-0.008731998*s_g + -0.005027927*s_c + -0.0005261647*s_da + -0.008349259*s_s + -1.610932e-05*d_da + -0.004080577*d_c + 0.1214133*goal_diff + 0.2064024*oddsU + -0.1924175*probU_diff + -0.02602331*mod75 -0.4113046) : -1;
				   
				   
				   console.log(jogo.home,plU_por_odds);
				   plO_por_odds=-1;
				   
				   
                   console.log([home, away, plU_por_odds, plO_por_odds]);
                    

                    //Se o não atingir o indice mínimo não aposta
                    //if( (plU_por_odds <  CONFIG.minimo_indice_para_apostar) && (plO_por_odds <  CONFIG.minimo_indice_para_apostar)	  ) return;
                    
                    if (plO_por_odds >=  CONFIG.minimo_indice_para_apostar) {
						var percent_da_banca=plO_por_odds;              
						if (percent_da_banca >  CONFIG.maximo_da_banca_por_aposta) percent_da_banca=CONFIG.maximo_da_banca_por_aposta;
						percent_da_banca*=CONFIG.percentual_de_kelly;
						bot.apostar(jogo_selecionado.selHome, percent_da_banca );
						return;
					}	
					

                    if (plU_por_odds >= CONFIG.minimo_indice_para_apostar) {
						var percent_da_banca=plU_por_odds;              
						if (percent_da_banca >  CONFIG.maximo_da_banca_por_aposta) percent_da_banca=CONFIG.maximo_da_banca_por_aposta;
						percent_da_banca*=CONFIG.percentual_de_kelly;
						bot.apostar(jogo_selecionado.selAway, percent_da_banca );
						return;
                    }
					
				
					
					
			 }
             
             
	   });
   });



   
   
};  





//---A cada 30 segundos
setInterval(function(){		
    console.log('on30segs');
     


    //Faz um ajax para o arquivo JSONP "http://aposte.me/live/stats.js  que executará a função bot.onLoadStats()"
    $.getScript(localStorage.bot365_new==='1'? 'https://bot-ao.com/stats_new.3.18.js' : 'https://bot-ao.com/stats.3.18.js', function(){
        bot.onLoadStats(localStorage.stats);
        //Pega o valor da banca disponível
        $.get('https://mobile.365sport365.com/balancedataapi/pullbalance?rn='+(+new Date()+'&y=ktq'),function(res){ 
            bot.balance=Number(res.split('$')[2]); 
        });
        
    });
         
    

   
},30000);





//Loop Principal repete todos os comandos a cada 1 segund
setInterval(function(){
	
	//Senão estiver logado, loga
	//login();
	
	//Se não tiver no GoalLine clica no GoalLine
	if(!$('.ipe-MarketSelectorBar_Btn:contains(Goal Line)').hasClass('ipe-MarketSelectorBar_Selected') ) $('.ipe-MarketSelectorBar_Btn:contains(Goal Line)').click();
	
	CONFIG=JSON.parse(localStorage.config);
    

	//Abre os mercados colapsados
	$('.ipe-Market:not(:has(.ipe-MarketContainer ))').each(function(i,e){ $(e).click() })
	//bot.interativo();
	
	
	//Se o quickBet fica em suspenso, não se pode apostar e clica no Cancel X, para fechar o
	if( $('.qb-QuickBetModule').hasClass('qb-QuickBetModule_ChangeSuspended') ) $('.qb-MessageContainer_IndicationMessage:contains(Cancel)').click();
	if( $('.qb-QuickBetModule').hasClass('qb-QuickBetModule_PlacedNoneAus') )  $('.qb-MessageContainer_IndicationMessage:contains(Cancel)').click();
	if( $('.qb-QuickBetModule').hasClass('qb-QuickBetModule_ChangeOdds') ) $('.qb-PlaceBetButton ').click();
	
    if( $('.qb-QuickBetModule').hasClass('qb-QuickBetModule_PlaceBetFailed') )  {
		if ( ($('.qb-Header_MainText:contains("available maximum")').size()>0) ){
			var stake_max=Number( $('.qb-Header_MainText:contains("available maximum")').text().split('of ')[1] );
			if (stake_max>0) {
				bot.digitaStake(stake_max);
			}
			else{
				$('.qb-MessageContainer_IndicationMessage:contains(Cancel)').click();
			}
		}
		else {
			$('.qb-MessageContainer_IndicationMessage:contains(Cancel)').click();	
		}
	}

},2000);







//A cada 15 minutos recarrega a pagina
window.setInterval(function(){
    window.location.reload();
},15*60*1000);


});
