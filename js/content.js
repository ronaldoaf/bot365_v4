console.log2=console.log;
console.log=(data)=>{
   chrome.runtime.sendMessage({command:'log', data:data});
   console.log2(data);
}
//constante para 1 segundo em milisegundos
const sec=1000;

//Funções que calculam a soma e a média dos elementos de um array
const sum=(arr)=>arr.length>0?arr.reduce((a,b)=>a+b):0;
const avg=(arr)=>arr.length>0?sum(arr)/arr.length: 0;

//Converte o handicap do formato 2.5,3.0  para 2.75, por exemplo
const calcHand=(hand_str)=>avg(hand_str.replace(/[\+UO ]/,'').split(',').map(e=>Number(e) ));

//Shorthands $ e $$
const $=(q)=>document.querySelector(q);
const $$=(q)=>document.querySelectorAll(q);





const hardswish= (x)=>x<-3?0:(x>3?x: x*(x+3)/6);
const doublehardswish = (x)=>0.05+hardswish(hardswish(x));
const silu=(x)=>x/(1 + Math.exp(-x));
const clamp=(x)=>Math.tanh(1*(x))*0.3+0.01;
const silu_clamp=(x)=>clamp( silu(x) );

//Funcões de ativação não lineares
const funcs_=(f)=>({
   tanh: Math.tanh,
   hardswish,
   doublehardswish,
   clamp,
   silu_clamp,
})[f];
console.log(funcs_);
   
//Funcão genérica envia os eventos do contentScript o backgroundScript
const sendEvent=async(ev, input)=>{
   
   //Gera um uuid para cada evento a ser enviado
   const uuid=crypto.randomUUID();
   let completed=false;
   input['uuid']=uuid;
   
   //Envia o evento com o input( os paramentros do evento)
   chrome.runtime.sendMessage({command:ev, data:input});
   
   //Aguarda até a variável uuid ser preenchida com true
   while(!completed){
      await sleep(100);
      chrome.storage.local.get([uuid], v=>completed=v[uuid] ); 
   }
   
   //Remove a váriavel uuid  depois da conclusão evento
   chrome.storage.local.remove([uuid] ); 
}


//Todos os eventos possíveis 
const sendClick=async(input)=>await sendEvent('click', input);
const sendMove=async(input)=>await sendEvent('move', input);
const sendScroll=async(input)=>await sendEvent('scroll', input);
const sendType=async(input)=>await sendEvent('type', input);


//Move o cursor para centro da janela
const moveToCenterOfWindow=async()=>{
   const {screenX,screenY,outerWidth,outerHeight}=window;
   const x=screenX+outerWidth/2;
   const y=screenX+outerHeight/2;
   
   await sendMove({x,y});
}


//Aguarda até um elemento existir ou dar o timeout
const waitFor=async(el, timeout=20*sec)=>{
   const interval=100;
   let sum_interval=0
   while(el==null) {
      await sleep(interval);
      sum_interval+=interval;
      if (sum_interval>=timeout) break;
   }
   //Sempre retorna o elemento, senão existir será null
   return el;
}


//Shorthands $ e $$ para os elementos
Element.prototype.$ =function(q) { return this.querySelector(q)  };
Element.prototype.$$=function(q) { return this.querySelectorAll(q) };


const adjustBrower=()=>{
   if ( window.navigator.userAgent.includes('Chrome') ) return {aX:0, aY:-11};
   if ( window.navigator.userAgent.includes('Firefox') ) return {aX:1, aY:-5};
   return {aX:0, aY:0};
}

//Adiciona o evento rclick (click pelo nodejs) a todos os elementos
Element.prototype.rclick = async function(shift=[0,0,0,0]){
   
   //Ajuste de posição do navegador, 
   const {aX,aY}=adjustBrower();
   
   //Ajuste para não usar toda área do objecto
   const [sx1,sy1,sx2,sy2]=shift;
   
   //wX e wY, são a posição da janela do navegador em relação a tela
   const [wX, wY] = [window.screenX, window.screenY];
   
   //dX e dY diferença entre as medidas externas e internas da janela
   const [dX, dY] = [window.outerWidth - window.innerWidth, window.outerHeight - window.innerHeight];

   //eX, eY são a posição do elemento a ser clicado em relação a janela
   const rect = this.getBoundingClientRect();
   const [eX, eY] = [rect.left, rect.top];

   //Define as coordenadas da área do objeto em relação a tela, dados todos os ajustes
   const x1 = Math.ceil(eX + wX + dX / 2 + aX)+sx1;  //ajustar  
   const y1 = Math.ceil(eY + wY + dY+ aY)+sy1;
   const x2 = x1 + this.offsetWidth - 1 + sx2;
   const y2 = y1 + this.offsetHeight - 1 + sy2;

   //Envia a área para a função que faz o click pelo backgroundScript
   await sendClick({ x1,y1, x2,y2});

};


//Adiciona o evento rscroll (scroll pelo nodejs) a todos os elementos
Element.prototype.rscroll = async function(){
   await moveToCenterOfWindow();
   
   const eH=this.getBoundingClientRect().height;  //Altura do elemento
   const wH=window.innerHeight;  //Altura da janela 
   
   //dist é a distância do objeto ao centro da janela, no eixo Y
   let dist=this.getBoundingClientRect().y - wH/2;
   
   //Enquanto a dist maior a 1/4  da altura da janela faz o scroll
   while(Math.abs(dist)>wH/4 ){
      
      //Se a janela "scrollou" até o limite, para dar scroll
      if( 
         ((dist<0) && (window.scrollY==0))  ||
         ((dist>0) && (window.scrollY==window.scrollMaxY)) 
      ) break;
      
      //Desloca a scrollbar exatamente 1/2 da altura da janela
      await sendScroll({y: Math.sign(dist) * wH/2 });
      
      //Recalcula a distância do objeto ao centro da janela, no eixo Y
      dist=this.getBoundingClientRect().y - wH/2;
   }
  
};


//Rotina que a realiza o login 
const doLogin=async()=>{
   //Clicka no botão "Log in"
   await $('.hm-MainHeaderRHSLoggedOutNarrow_Login').rclick();
   
   //Aguarda surgir o campo para digitar o usuário, se não aparecer interrompe a rotina
   if( !(await waitFor($('.slm2-e'))) ) return;
   await sleep(2*sec);
   console.log('foi');
   
   //Se já existir um usuário no campo (aparecendo um "X" )
   if ( $('.slm2-ad') ){
      
      //Clica no "X" para limpar o campo
      await $('.slm2-ad').rclick();
   } else{
      
      //Se já estiver limpo clica no campo usuário para habilitar a ditigitação
      await $('[placeholder="Username or email address"]').rclick();
   }
   await sleep(0.5*sec);
   
   //Digita o usuário
   await sendType({str:`'${VARS.config.usuario}'` });
   await sleep(1*sec);
   
   //Clica no campo da senha
   await $('[placeholder="Password"]').rclick();
   await sleep(0.5*sec);
   
   //Digita a senha
   await sendType({str:`'${VARS.config.senha}'` });
   await sleep(0.5*sec);
   
   //Clica no botão login
   await $('.slm2-09').rclick();
   
   //Aguarda 5 segundos
   await sleep(5*sec);
   
   //Se acontecer falha de login, desliga o bot para não ficar em looop
   if ( $('.slm2-2d') ){
      chrome.storage.local.set({bot_ligado:false});
      alert("Deu Merda no Login!!!\n\n\n O bot foi desligado");15
   }
   
   chrome.storage.local.set({logado: true } );
   
};


 const getBalance=async()=>{
   //Procura por números, remove os pontos e as vírgulas e divide por 100
   const balance=Number(/[0-9.,]+/.exec( $('.hm-Balance').innerText )[0].replace(/[.,]/g,'') )/100; 
   chrome.storage.local.set({balance});
   VARS.balance=balance;
 };

const updateMyBets=()=>{
   //Remove as apostas com mais de 60 minutos
   VARS.my_bets=VARS.my_bets.filter(e=>e.timestamp>new Date()-60*60*1000);
   chrome.storage.local.set({my_bets:  VARS.my_bets } );
}
   
//Envia o evento para baixar as stats
const getStats=async()=> await sendEvent('stats',{});

//Envia o evento para baixar o Model
const getModel=async()=> await sendEvent('model',{});

 
//Checa dse já foi apostasdo
const jaFoiApostado=(home,away)=>VARS.my_bets.map(b=>b.home_v_away).includes(`${home} v ${away}` );







             
const calcIndex=(pos)=>{
   const fixture=$$('.ovm-Fixture')[pos];
   
   //Se odds estiver suspensa retorna -1
   if (fixture.$$('.ovm-ParticipantStackedCentered_Suspended').length >0 ) return -1;
   
   
   const home=fixture.$$('.ovm-FixtureDetailsTwoWay_TeamName')[0].innerText;
   const away=fixture.$$('.ovm-FixtureDetailsTwoWay_TeamName')[1].innerText;
   const goalline=calcHand(fixture.$$('.ovm-ParticipantStackedCentered_Handicap')[2].innerText); 
   
   const oddsO=Number(fixture.$$('.ovm-ParticipantStackedCentered_Odds')[2].innerText); 
   const oddsU=Number(fixture.$$('.ovm-ParticipantStackedCentered_Odds')[3].innerText); 
   
   //Procura a stat corresponde a esse jogo
   const stats=VARS.stats.filter(e=>e.home==home && e.away==away);
   
   //Se não encontrar a stats correspodente retorna -1
   if (stats.length==0) return -1;
   
   const {gH,gA,cH,cA,daH,daA,sH,sA,soH,soA,sfH,sfA,handicap,W,gl_0,ah_0}=stats[0];
   
   const [s_g, s_c, s_da, s_s, s_so, s_sf] = [gH+gA, cH+cA, daH+daA, sH+sA, soH+soA, sfH+sfA];
   const [d_g, d_c, d_da, d_s, d_so, d_sf] = [gH-gA, cH-cA, daH-daA, sH-sA, soH-soA, sfH-sfA].map(e=>Math.abs(e));
   
   const [L1, M1]= [ Math.log(1+s_s), Math.log(1+s_so) ];
   
   const hand=Math.abs(handicap);
   const goal_diff=goalline-s_g;
   
   const hand0=Math.abs(ah_0);
   const gg=gl_0/goal_diff;
   const edge=1/(1/oddsO+1/oddsU);
   
   const ps=stats[0].ps.filter(e=>e.gl==goalline);
   if (ps.length) {
      const min_tc_ps=VARS.tc_ps[Math.round(VARS.config.min_ps_perc*100)];      
      if( oddsU/ps[0].ou < min_tc_ps ) return -0.99;
   }
   
   //Filtra por goal_diff
   if(goal_diff<VARS.config.goal_diff_min) return -1;
   
   if (oddsU<1.70) return -1;
   if (goal_diff<1) return -1;

   
   //Faz a médias dos modelos MODEL
   const avgModel = (MODEL, input_data) => {
      //const evalModel = (model, X) => (X = model["0.weight"].map(((x, a) => x.map(((x, a) => x * X[a])).reduce(((x, a) => x + a)) + model["0.bias"][a])), X = X.map((e => funcs_(model["1.func"])(e))), X = model["2.weight"].map(((x, a) => x.map(((x, a) => x * X[a])).reduce(((x, a) => x + a)) + model["2.bias"][a])), X = X.map((e => funcs_(model["3.func"])(e))), X[0]);
      const evalModel = (model, X) => (X = model["0.weight"].map(((x, a) => x.map(((x, a) => x * X[a])).reduce(((x, a) => x + a)) + model["0.bias"][a])), X = X.map((e => silu(e))), X = model["2.weight"].map(((x, a) => x.map(((x, a) => x * X[a])).reduce(((x, a) => x + a)) + model["2.bias"][a])), X = X.map((e => silu_clamp(e))), X[0]);

      return X = MODEL.scale.map((x => (input_data[x.name] - x.min) / (x.max - x.min))), MODEL.models.map((x => evalModel(x, X))).reduce(((x, a) => x + a)) / MODEL.models.length
   };
       
   const input_data = {
		s_g,
		s_c,
		s_s,
		d_g, 
		d_da, 
		d_s, 
		goal_diff,
		oddsU,
		W,
		hand, 
		gg, 
		L1
    };

   const  idx = avgModel(VARS.MODEL, input_data);
   
   return idx

}

//Lista todos os que está em 45:00 e calcula o índice para apostar
const getMatchList=()=>[...$$('.ovm-Fixture')].map((e,i)=>({
      pos:i,
      timer:e.$('.ovm-FixtureDetailsTwoWay_Timer, .ovm-InPlayTimer').innerText,
      home:e.$$('.ovm-FixtureDetailsTwoWay_TeamName')[0].innerText,
      away:e.$$('.ovm-FixtureDetailsTwoWay_TeamName')[1].innerText,
   })).filter(e=>e.timer=='45:00')
      .map(e=>({home:e.home, away:e.away, pos:e.pos, idx:calcIndex(e.pos) }))
      .sort((a,b)=>b.idx-a.idx);
      //.sort((a,b)=>a.pos-b.pos);
      


const apostar=async(pos, stake)=>{
   //Seta na varíavel que a rotina de apostas começou
   chrome.storage.local.set({apostando:  true } );   
   
   //Seleciona o jogo objeto com a odd ser apostado, a partir da posição (pos) jogo na lista de jogos
    const sel=$$('.ovm-Fixture')[pos].$$('.gl-Participant_General')[3];
   
   //Extrai as informações de goalline e odds que vamos apostar
   const gl=calcHand(sel.$('.ovm-ParticipantStackedCentered_Handicap').innerText); 
   const odds=Number(sel.$('.ovm-ParticipantStackedCentered_Odds').innerText); 


   //Dá scroll a tela até chegar no no objeto
   await sel.rscroll();
   await sleep(0.5*sec);
   
   //Recalcula o stake, for alterado para menos, cancela aposta
   const stake_calc=stakeVal(calcIndex(pos));
   if ( stake_calc < stake ){
      await $('.bss-RemoveButton ').rclick();
      console.log('As condições foram alteradas cancelando a aposta');
      await sleep(0.5*sec);
      return 1;
   }
   
   
   //Clica no objeto selecionado
   await sel.rclick();
   
   
   //Aguarda até surgir o StakeInput, onde vamos digitar o valor da aposta
   const stake_input=await waitFor( $('.bsf-StakeBox_StakeInput') );
   await sleep(1*sec);
   
   //Clica no StakeInput, para habilitar a digitação
   await $('.bsf-StakeBox_StakeInput').rclick([0,0,-75,0]); //x2 shift -75
   await sleep(0.5*sec);
   
   //Faz a digitação do valor a ser  apostado (stake)
   await sendType({str:`'${stake}'` });
   await sleep(1*sec);
  

   //Se o checkbox de Free bet estiver visivel cria nele
   const credits_checkbox=$$('.bsc-BetCreditsHeader_CheckBox')[0];
   if(credits_checkbox){
      if ( credits_checkbox.getBoundingClientRect().y<$('.bsf-StakeBox').getBoundingClientRect().y-1  ) {
         if (credits_checkbox.classList.contains('bsc-BetCreditsHeader_CheckBox-selected')==false ){
            await credits_checkbox.rclick();
            await sleep(1*sec);
         }
      }
   }
   
   //Caso as condições se alterarem e o botão AcceptButton surgir, clica no "X" (RemoveButton) e cancela a aposta 
   if (!$('.bsf-AcceptButton').classList.contains('Hidden') ){
      await $('.bss-RemoveButton ').rclick();
      await sleep(0.5*sec);
      return 1;
   }
   
   //Finalmente clica no PlaceBet para submeter aposata
   await $('.bsf-PlaceBetButton').rclick();
   await sleep(5*sec);
   
   //Aguarda até aparecer o visistinho verde, indicando que aposta foi realizada com sucesso
   const rec=await waitFor($('.bss-ReceiptContent_Tick'));
   if (!rec) {    
      //Se não aparecer vistinho, log erro e interrompe a rotina
      console.log('Ocorreu erro, aposta não foi detectada com sucesso');
      return 1;
   }
   await sleep(1*sec);

   
   //Extrai a descrição do jogo da aposta feita
   const home_v_away=$('.bss-NormalBetItem_FixtureDescription').innerText;
   
   const tipo='u';
   
   //Adiciona a variável my_bets para controle do que já foi apostado
   VARS.my_bets.push({
      home_v_away,
      stake,
      gl,
      odds,
      tipo,
      timestamp: +new Date(),
   });
   chrome.storage.local.set({my_bets:  VARS.my_bets } );
   
   
   //Finaliza a rotina clicando no botão Done 
   $('.bss-ReceiptContent_Done').rclick();
   await sleep(1*sec);
  
   
}

const stakeVal=(idx)=>{
   
   //Arredonda um número para o múltiplo mais próximo de 1, 2 ou 5, dependendo da ordem de grandeza do número.
   const round125=(x)=>{
      const lx=Math.log10(x);
      const e=Math.floor(lx);
      const m=lx-e < Math.log10(2) ? 1 : (lx-e < Math.log10(5) ? 2 : 5);
      const s=10**(e-1)*m;
      return Math.floor((x+s/10)/s)*s;
   };
   
   //Carrega as configurações de aposta 
   const {minimo_indice_para_apostar, percentual_de_kelly, maximo_da_banca_por_aposta, aposta_maxima} = VARS.config;
   
   //Só abrevia os nomes das váriais para o código ficar mais limpo
   const [min_idx, perc_kelly, max_perc_bank, max_bet]=[minimo_indice_para_apostar, percentual_de_kelly, maximo_da_banca_por_aposta, aposta_maxima]
   
   //Percent da banca é idx vezes o kelly, limitado pela váriavel maximo_da_banca_por_aposta
   const perc_bank=Math.min(idx*perc_kelly, max_perc_bank);
   
   //A soma dos stakes das apostas que estão rodando no momento
   const total_in_bets=sum(VARS.my_bets.map(e=>e.stake));
   
   //Soma do banca com os stakes que estão rodando 
   const total_bank=VARS.balance + total_in_bets;
   
   //O stake será a percentual calculado vezes a banca total, limitado pela aposta_maxima
   return Math.min(round125(perc_bank*total_bank),max_bet);
   
}

const preReq=async()=>{
   
   //Se não estiver na tela do Soccer, força para entrar nessa tela
   if(location.hash!="#/IP/B1") {
      location.hash="#/IP/B1"; 
      await sleep(5*sec);
   }
   
   //Aceita os cookies
   const cookie_accept=$('.ccm-CookieConsentPopup_Accept');
   if (cookie_accept) await cookie_accept.rclick();
   
 
   //Ao aparecer alguma oferta de Free Bet, clica para ignorar
   const free_bet_close_button=$('.pm-FreeBetsPushGraphicCloseButton');
   if( free_bet_close_button ) await free_bet_close_button.rclick();
   
   //Ao aparecer as informações sobre o último login, clica para continuar
   const last_login_button=$('.llr-5');
   if( last_login_button ) await last_login_button.rclick();
   
   
   
   //Deixa no mercado Asian Lines
   if ($('.ovm-ClassificationMarketSwitcherDropdownButton_Text').innerText!='Asian Lines') {
	   await $('.ovm-ClassificationMarketSwitcherDropdownButton_Text').rclick();
	   await $$('.ovm-ClassificationMarketSwitcherDropdownItem')[3].rclick();  
   }	
   

   
};




const main=async()=>{
   
   
   
   await getBalance();
   
   await getStats();
   
   await updateMyBets();
   
   const matches=await getMatchList();
   
   console.log(matches);
   
   //Seleciona os jogos para apostar e ordena de aleatória
   const sels=matches
               .filter(e=>e.idx>VARS.config.minimo_indice_para_apostar)
               .filter(e=>!jaFoiApostado(e.home, e.away))
               .sort(a=>Math.random()-0.5);
   
   //Seleciona o primeiro da lista
   if (sels.length==0) return;
   const {pos, idx, home, away}=sels[0];
   
   
   const stake=stakeVal(idx);
   
   console.log(`Aposta: ${home} v ${away}, val:${stake}`);
   await apostar( pos, stake);
   
   //Indica que a rotina de apostas terminou
   chrome.storage.local.set({apostando:  false } );
   
}






(async()=>{
   
   await getModel();
   
   
   //Loop a cada 10 segundos
   while(true) try{
   
      //Seta as váriaveis
      await setVars();
      
      await sleep(10*1000)
      
      //Se não estiver na tela o Inplay  não faz nada
      if ( !location.hash.includes('#/IP') )  continue;
      
      
      
      
      //Verifica o balance existe indicando que está logado
      chrome.storage.local.set({logado: Boolean( $('.hm-Balance') ) } );
      
      //Se o bot_ligado desligado, não faz nada 
      if(!VARS.bot_ligado) continue;
      
      console.log('Loop Principal');
   
      //Aguarda a página estar complementamente carregada
      await waitFor( $('.ovm-CompetitionList') );
 
 
      //Se não logado tenta fazer o login
      if (!VARS.logado) await doLogin();
      
      //Se não logado mas faz mais nada
      if(!VARS.logado) continue;
      
      
      
      await preReq();
       
       
      await main();
      

   } 
   catch(e){ console.log(e) }
    
})();  
 