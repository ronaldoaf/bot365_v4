// Aponta os arquivos WASM para dentro da extensão
ort.env.wasm.wasmPaths = chrome.runtime.getURL('js/ort/');


//MV3: mantém o service worker (background) vivo enquanto esta aba estiver aberta,
//para que seus timers (checkTabs, ping, toggleIcon...) continuem rodando.
let _kaPort;
const keepAlive=()=>{
	try{
   _kaPort=chrome.runtime.connect({name:'keepalive'});
   _kaPort.onDisconnect.addListener(keepAlive);   //Reconecta se o worker reiniciar
   }catch(e){
	   
	   location.reload();
   }
};
keepAlive();
setInterval(()=>{
   try{ _kaPort.postMessage('ping'); } catch(e){ keepAlive(); }
}, 20*1000);


//constante para 1 segundo em milisegundos
const sec=1000;

//Funções que calculam a soma e a média dos elementos de um array
const sum=(arr)=>arr.length>0?arr.reduce((a,b)=>a+b):0;
const avg=(arr)=>arr.length>0?sum(arr)/arr.length: 0;

//Converte o handicap do formato 2.5,3.0  para 2.75, por exemplo
const calcHand=(hand_str)=>avg(hand_str.replace(/[\+UO ]/,'').split(',').map(e=>Number(e) ));

//Shorthands $ e $$
const $=(q)=>document.querySelector(q);
const $$=(q)=>[...document.querySelectorAll(q)];


Array.prototype.fText = function(texto) {
    // 'this' refere-se ao próprio NodeList
    return [...this].filter(node => 
        node.innerText && node.innerText.includes(texto)
    );
};

Element.prototype.hasClass =function(classe) { 
	return this.getAttribute('class').split(' ').includes(classe);
};




   
//Tempo máximo de espera pela confirmação de um evento no background
const EVENT_TIMEOUT=15*sec;

//Funcão genérica envia os eventos do contentScript o backgroundScript.
//O timeout é obrigatório: antes, se o background nunca marcasse o uuid como true
//(servidor de cliques em localhost:1313 fora do ar, ou service worker MV3
//encerrado no meio do await), este while rodava para sempre e o bot congelava
//no ponto exato em que estava - tipicamente no clique/digitação do betslip.
const sendEvent=async(ev, input, timeout=EVENT_TIMEOUT)=>{

   //Gera um uuid para cada evento a ser enviado
   const uuid=crypto.randomUUID();
   let completed=false;
   input['uuid']=uuid;

   //Envia o evento com o input( os paramentros do evento)
   chrome.runtime.sendMessage({command:ev, data:input});

   const t0=Date.now();

   //Aguarda até a variável uuid ser preenchida com true
   while(!completed){
      await sleep(100);

      //Promisificado: o callback do get resolvia fora do ciclo do while e podia
      //ler um valor defasado
      completed=await new Promise(r=>chrome.storage.local.get([uuid], v=>r(v[uuid]===true) ));

      //Em vez de travar, lança o erro para a rotina de aposta abortar e o loop
      //principal recomeçar limpo
      if (!completed && Date.now()-t0>timeout){
         chrome.storage.local.remove([uuid] );
         throw new Error(`Timeout de ${timeout/sec}s no evento '${ev}': o background nao confirmou (servidor de cliques fora do ar?)`);
      }
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


//Aguarda até um elemento existir ou dar o timeout.
//IMPORTANTE: passe o SELETOR (string) ou uma função, nunca o elemento já resolvido.
//Chamar waitFor($(sel)) congela o valor: o argumento é avaliado uma única vez, o
//while nunca reconsulta o DOM e a função vira um sleep de 20s que devolve null.
const waitFor=async(target, timeout=20*sec)=>{
   const interval=100;

   //Aceita seletor, função ou elemento (compatibilidade)
   const resolve = typeof target=='string'   ? ()=>$(target)
                 : typeof target=='function' ? target
                 : ()=>target;

   let el=resolve();
   let sum_interval=0
   while(el==null) {
      await sleep(interval);
      sum_interval+=interval;
      el=resolve();
      if (sum_interval>=timeout) break;
   }
   //Sempre retorna o elemento, senão existir será null
   return el;
}

// Verifica se o elemento está totalmente dentro do viewport
const isInView=(el)=>{
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Verifica se dois retângulos (DOMRect) se sobrepõem
const rectsOverlap=(r1,r2)=>!(
   r1.right<=r2.left || r1.left>=r2.right ||
   r1.bottom<=r2.top || r1.top>=r2.bottom
);


//Shorthands $ e $$ para os elementos
Element.prototype.$ =function(q) { return this.querySelector(q)  };
Element.prototype.$$=function(q) { return [...this.querySelectorAll(q)] };


const adjustBrower=()=>{
   if ( window.navigator.userAgent.includes('Chrome') ) return {aX:0, aY:-8};
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
   
   const wH=window.innerHeight;  //Altura da janela
   
   //Limite inferior do scroll. window.scrollMaxY é propriedade EXCLUSIVA do Firefox:
   //no Chrome ela é undefined, a comparação nunca era verdadeira e o loop abaixo
   //podia rolar para sempre num alvo que não consegue ser centralizado (elemento
   //fixo/sticky ou no rodapé da página) - travando o bot antes mesmo do betslip.
   const maxScrollY=()=>Math.max(0, document.documentElement.scrollHeight - wH);

   //dist é a distância do objeto ao centro da janela, no eixo Y
   let dist=this.getBoundingClientRect().y - wH/2;

   //Enquanto a dist maior a 1/4  da altura da janela faz o scroll
   let voltas=0;
   while(Math.abs(dist)>wH/4 ){

      //Se a janela "scrollou" até o limite, para dar scroll
      if(
         ((dist<0) && (window.scrollY<=0))  ||
         ((dist>0) && (window.scrollY>=maxScrollY()))
      ) break;

      const scroll_antes=window.scrollY;

      //Desloca a scrollbar exatamente 1/2 da altura da janela
      await sendScroll({y: Math.sign(dist) * wH/2 });

      //Se a página não se moveu (elemento fixo, scroll bloqueado por overlay),
      //insistir não adianta e só trava o bot
      if (window.scrollY==scroll_antes) break;

      //Trava de segurança contra qualquer outro caso de não convergência
      if (++voltas>20) break;

      //Recalcula a distância do objeto ao centro da janela, no eixo Y
      dist=this.getBoundingClientRect().y - wH/2;
   }

   //O vídeo flutuante da transmissão (.lv-LiveVideoModule-1) fica fixo no canto
   //superior direito da tela e pode acabar cobrindo o alvo depois do scroll acima.
   //Se isso acontecer, continua dando scroll para trás (empurra o alvo para baixo,
   //para fora do vídeo) até o alvo ficar livre para o clique
   const video=$(SEL.liveVideoModule);
   if (video){
      let tries=0;
      while ( rectsOverlap(this.getBoundingClientRect(), video.getBoundingClientRect()) && tries<10 && window.scrollY>0 ){
         await sendScroll({y: -wH/8});
         tries++;
      }
   }

};


//Rotina que a realiza o login 
const doLogin=async()=>{
   //Clicla no botão "Log in"
   await [...$$('button')].filter(e=>e.innerText=='Log In')[0].rclick();
   
   //Aguarda surgir o campo para digitar o usuário, se não aparecer interrompe a rotina
   if( !(await waitFor( SEL.usernameInput )) ) return;
   
   const input_username=$(SEL.usernameInput);
   const box_login=input_username.parentNode.parentNode.parentNode;
   
   await sleep(1*sec);
   logger.info('foi');
   
   //Se já existir um usuário no campo (aparecendo um "X" )
   if ( input_username.nextElementSibling ){
      
      //Clica no "X" para limpar o campo
      await input_username.nextElementSibling.rclick();
   } else{
      
      //Se já estiver limpo clica no campo usuário para habilitar a ditigitação
      await input_username.rclick();
   }
   await sleep(1*sec);
   
   //Digita o usuário
   await sendType({str:`'${VARS.config.usuario}'` });
   await sleep(1*sec);
   
   //Clica no campo da senha
   await $(SEL.passwordInput).rclick();
   await sleep(0.5*sec);
   
   //Digita a senha
   await sendType({str:`'${VARS.config.senha}'` });
   await sleep(0.5*sec);
   
   //Clica no botão login
   await [...$$(SEL.loginSubmit)].filter(e=>e.innerText=='Log In')[0].rclick();
   
   //Aguarda 5 segundos
   await sleep(3*sec);
   
   //Se acontecer falha de login, desliga o bot para não ficar em looop
   if ( [...box_login.querySelectorAll('div')].filter(e=>e.innerText.includes('Your details were not recognised')).length>0 ){
      chrome.storage.local.set({bot_ligado:false});
      alert("Deu Merda no Login!!!\n\n\n O bot foi desligado");
   }
   
   chrome.storage.local.set({logado: true } );
   
};


 const getBalance=async()=>{
   //Procura por números, remove os pontos e as vírgulas e divide por 100
   const balance=Number(/[0-9.,]+/.exec( $$(SEL.balance).fText('$')[0].innerText )[0].replace(/[.,]/g,'') )/100; 
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

 
//Checa dse já foi apostasdo
const jaFoiApostado=(home,away)=>VARS.my_bets.map(b=>b.home_v_away).includes(`${home} v ${away}` );



//Cria a sessão ONNX de cada modelo uma única vez e a reutiliza (cacheada por aba).
//Antes a sessão era recriada a cada fixture, recarregando o model.onnx em cada loop.
//Cada modelo (model.onnx, model_gl.onnx, model_gl0.onnx) tem sua própria sessão
//cacheada, indexada pelo nome do arquivo.
const _sessionPromises = {};
const getSession = (modelFile) => {
   if (!_sessionPromises[modelFile]) {
      const modelUrl = chrome.runtime.getURL(modelFile);
      _sessionPromises[modelFile] = fetch(modelUrl)
         .then(r => r.arrayBuffer())
         .then(buf => ort.InferenceSession.create(buf))
         .catch(e => { _sessionPromises[modelFile] = null; throw e; });  //Permite nova tentativa se falhar
   }
   return _sessionPromises[modelFile];
};

//Fila que serializa as inferências. A InferenceSession do ONNX não suporta
//session.run() concorrente sobre a mesma sessão (causa "memory access out of
//bounds" no WASM). Como getMatchList chama os modelos em paralelo (Promise.all),
//encadeamos as execuções para rodar uma de cada vez. A fila é compartilhada por
//todos os modelos para garantir que apenas um session.run() rode por vez.
let _runQueue = Promise.resolve();
const runModel = (modelFile, X) => {
   const run = async () => {
      const session = await getSession(modelFile);
      const inputTensor = new ort.Tensor('float32', Float32Array.from(X), [1, X.length]);
      const results = await session.run({ float_input: inputTensor });
      return results.variable.cpuData[0];
   };

   //Enfileira: a próxima inferência só começa após a anterior terminar.
   const result = _runQueue.then(run);
   _runQueue = result.catch(() => {});  //Mantém a fila viva mesmo se uma falhar
   return result;
}

//Consome o model.onnx
const calcModel = (X) => {
   //X=[s_g,s_c,s_da,s_s,d_g,d_c,d_da,d_s,oddsU,goal_diff,hand,W,gl_0]
   return runModel('model.onnx', X);
}


const calcGoalDiff=(oo,ou)=>{
	const d=(1/oo)/(1/oo+1/ou)-0.5;
	if (d<-0.07) return -0.5;
	if (d>=-0.07 && d<-0.025) return -0.25;
	if (d>=-0.025 && d<0.025) return 0;
	if (d>=0.025 && d<0.07) return 0.25;
	return 0.5;
}

//Consome o model_gl.onnx
const calcModelGl = (X) => {
   //X=[oodsO, diff_gl, (goal-s_g) ]
   return runModel('model_gl.onnx', X);
}





             
const calcIndex=async(pos)=>{
   const fixture=$$(SEL.fixture)[pos];
   
   //Se odds estiver suspensa retorna -1
   if (fixture.$$(SEL.suspended).length >0 ) return -1;
   
   
   const home=fixture.$$(SEL.teamName)[0].innerText;
   const away=fixture.$$(SEL.teamName)[1].innerText;
   const goal=calcHand(fixture.$$(SEL.handicap)[0].innerText);

   const oddsO=Number(fixture.$$(SEL.odds)[0].innerText);
   const oddsU=Number(fixture.$$(SEL.odds)[1].innerText);

   //Procura a stat corresponde a esse jogo
   const stats=VARS.stats.filter(e=>e.home==home && e.away==away);
   
   //Se não encontrar a stats correspodente retorna -1
   if (stats.length==0) return -1;
   
   const {gH,gA,cH,cA,daH,daA,sH,sA,W,gl_0}=stats[0];

   const [s_g, s_c, s_da, s_s] = [gH+gA, cH+cA, daH+daA, sH+sA];
   const [d_g, d_c, d_da, d_s] = [gH-gA, cH-cA, daH-daA, sH-sA].map(e=>Math.abs(e));
   
   
   const diff_gl=calcGoalDiff(oddsO,oddsU);

   const goalline=goal+diff_gl;
   const oddsU_calc=await calcModelGl([oddsO, diff_gl, (goal-s_g) ]);

   const goal_diff=goalline-s_g;

   const hand=0;
   const X=[s_g,s_c,s_da,s_s,d_g,d_c,d_da,d_s,oddsU_calc,goal_diff,hand,W,gl_0];
   
   const idx=await calcModel(X);
   
   return idx;

}

//Lista todos os que está em 45:00 e calcula o índice para apostar
const getMatchList=async()=>{
   const fixtures=[...$$(SEL.fixture)].map((e,i)=>({
      pos:i,
      timer:e.$(SEL.timer).innerText,
      home:e.$$(SEL.teamName)[0].innerText,
      away:e.$$(SEL.teamName)[1].innerText,
   })).filter(e=>e.timer=='45:00');

   const results=await Promise.all(
      fixtures.map(async e=>({home:e.home, away:e.away, pos:e.pos, idx:await calcIndex(e.pos)}))
   );

   return results.sort((a,b)=>b.idx-a.idx);
};





const calcIndex2=async(home,away,goalline,oddsU)=>{
   //Procura a stat corresponde a esse jogo
   const stats=VARS.stats.filter(e=>e.home==home && e.away==away);
   
   //Se não encontrar a stats correspodente retorna -1
   if (stats.length==0) return -1;
   
   const {gH,gA,cH,cA,daH,daA,sH,sA,W,gl_0}=stats[0];

   const [s_g, s_c, s_da, s_s] = [gH+gA, cH+cA, daH+daA, sH+sA];
   const [d_g, d_c, d_da, d_s] = [gH-gA, cH-cA, daH-daA, sH-sA].map(e=>Math.abs(e));
   
   const hand=0.25;
   
   const goal_diff=goalline-s_g;
   
   const X=[s_g,s_c,s_da,s_s,d_g,d_c,d_da,d_s,oddsU,goal_diff,hand,W,gl_0];
   
   const idx=await calcModel(X);
   
   return idx
}



//Lê o valor que está de fato dentro do StakeInput, normalizado para número
const lerStake=()=>{
   const input=$(SEL.stakeInput);
   if (!input) return NaN;
   const txt=String(input.value!=null ? input.value : input.innerText || '');
   return Number( txt.replace(/[^0-9.,]/g,'').replace(/\.(?=.*[.,])/g,'').replace(',','.') );
};

//Digita o stake no betslip e CONFIRMA que o valor realmente entrou no campo.
//Sem essa confirmação o bot seguia para o PlaceBet com o campo vazio sempre que o
//clique errava o alvo (campo fora do viewport, área de clique invertida, foco
//roubado por um popup) - exatamente o sintoma de "não digita o valor no betslip".
const typeStake=async(stake)=>{

   for (let tentativa=1; tentativa<=3; tentativa++){

      const input=$(SEL.stakeInput);
      if (!input) throw new Error('StakeInput não encontrado no betslip');

      //As coordenadas do rclick são calculadas a partir do getBoundingClientRect:
      //com o campo fora do viewport o cursor vai parar fora da janela e a
      //digitação se perde em outro lugar da tela
      if (!isInView(input)){
         await input.rscroll();
         await sleep(0.5*sec);
      }

      //Campo sem dimensão (betslip recolhido/oculto) gera área de clique degenerada
      if (input.offsetWidth<=0 || input.offsetHeight<=0) throw new Error('StakeInput sem dimensão (betslip oculto ou recolhido)');

      //O shift -75 encolhe a área clicável pela direita para não acertar o botão
      //de limpar. Só é aplicável se sobrar largura: em campos estreitos ele
      //invertia a área (x2<x1) e o clique caía fora do input
      const shift_x2 = input.offsetWidth>90 ? -75 : 0;

      await input.rclick([0,0,shift_x2,0]);
      await sleep(0.5*sec);

      //Faz a digitação do valor a ser  apostado (stake)
      await sendType({str:`'${stake}'` });
      await sleep(1*sec);

      //Lê de volta o campo: só segue adiante se o valor bateu
      if (lerStake()==Number(stake)) return true;

      logger.info(`Stake não entrou no betslip (tentativa ${tentativa}/3): esperado ${stake}, campo="${$(SEL.stakeInput) ? $(SEL.stakeInput).value : 'sem campo'}", largura=${input.offsetWidth}, naTela=${isInView(input)}`);

      //Limpa o que tiver sobrado antes de tentar de novo
      await sendEvent('backspace', {n:12});
      await sleep(0.5*sec);
   }

   throw new Error(`Não foi possível digitar o stake ${stake} no betslip após 3 tentativas`);
};


const apostar2=async(pos, home, away)=>{
   //Seta na varíavel que a rotina de apostas começou, com timestamp para o watchdog do background
   chrome.storage.local.set({apostando: true, apostando_since: +new Date() } );

   //Registra em que ponto da rotina o bot está. Serve para dois fins:
   //1) se travar, a última etapa registrada em chrome.storage.local.etapa_aposta
   //   diz exatamente onde foi (antes só havia silêncio);
   //2) reinicia o relógio do watchdog de 90s, que assim mede "parado" e não
   //   "demorado" - uma aposta lenta mas progredindo não é mais abortada.
   const etapa=(nome)=>{
      logger.info(`[aposta ${home} v ${away}] ${nome}`);
      chrome.storage.local.set({ etapa_aposta:{ nome, home, away, timestamp:+new Date() }, apostando_since:+new Date() });
   };

   etapa('abrindo o jogo');

   const fixture=$$(SEL.fixture)[pos];
   if (!fixture) throw new Error(`Fixture na posição ${pos} sumiu da lista (${home} v ${away})`);

   //Dá scroll até o jogo e clica nele para abrir todas as opções de aposta
   const teams_wrapper=fixture.$(SEL.teamsWrapper);
   if (!teams_wrapper) throw new Error(`TeamsWrapper não encontrado em ${home} v ${away}`);

   await teams_wrapper.rscroll();
   await sleep(1*sec);

   //Re-consulta depois do scroll: a lista do Inplay é virtualizada e pode trocar o nó
   const teams_wrapper2=fixture.$(SEL.teamsWrapper) || teams_wrapper;
   await teams_wrapper2.rclick();

   await sleep(5*sec);
   etapa('carregando os mercados');

   //Espera carregar os mercados
   if ( !(await waitFor( SEL.gridHeaderMarketTabs )) ) throw new Error(`Mercados não carregaram (${SEL.gridHeaderMarketTabs}) em ${home} v ${away}`);

   //Identifica a aba Asian Lines. Nem todo jogo oferece esse mercado: sem o guard,
   //o [0].parentElement estourava TypeError e a aposta morria aqui
   const asian_lines_link=$$(SEL.gridHeaderTabLink).filter(e=>e.innerText=='Asian Lines')[0];
   if (!asian_lines_link) throw new Error(`Aba "Asian Lines" indisponível em ${home} v ${away}`);
   const asian_lines_tab=asian_lines_link.parentElement;

   //Se a aba Asian Lines não estiver na tela, clica a seta para fazer o scroll e colocar na tela
   if(!isInView(asian_lines_tab)) await $(SEL.eventNavRightArrow).rclick();
   await sleep(1*sec);

   //Se a aba Asian Lines não estiver selecionada, clica nela para selecionar
   if ( !asian_lines_tab.hasClass(CLS.gridHeaderTabLinkSelected) ) await asian_lines_tab.rclick();

   etapa('avaliando as goallines');

   //Identifica o grupo com os mercados goalline
   const market_group_goalline=$$(SEL.marketGroupPod)[1];
   if (!market_group_goalline) throw new Error(`Grupo de mercados goalline não encontrado em ${home} v ${away}`);

   //Goallines disponíveis
   const goallines=market_group_goalline.$$(SEL.participantLabel).map(e=>calcHand(e.innerText) );

   //Testa cada goalline e calcula o índice de cada uma.
   //Antes o melhor índice era acumulado em variáveis compartilhadas dentro do
   //Promise.all: como há await entre a leitura e a escrita, duas goallines podiam
   //ler o mesmo best_idx e a melhor se perder. Agora o vencedor é escolhido depois
   //que todas terminam.
   const candidatos=await Promise.all(goallines.map(async (goalline, i) => {
      const oddsO=Number(market_group_goalline.$$(SEL.participantOddsOnly)[i].innerText);
      const oddsU=Number(market_group_goalline.$$(SEL.participantOddsOnly)[goallines.length+i].innerText);

      const d=Math.abs( (1/oddsO)/(1/oddsO+1/oddsU) -0.5);

      if (d>=0.075) return null;

      return { i, idx: await calcIndex2(home,away,goalline,oddsU) };
   }));

   const melhor=candidatos.filter(e=>e).sort((a,b)=>b.idx-a.idx)[0];

   //Se nenhuma goalline passou no filtro de equilíbrio (d<0.075), não há o que
   //apostar. Sem esse guard, best_i ficava undefined e o acesso ao array devolvia
   //undefined, estourando TypeError no rscroll - a aposta morria antes do betslip.
   if (!melhor){
      logger.info(`Nenhuma goalline equilibrada (d<0.075) em ${home} v ${away}, aposta cancelada`);
      return 1;
   }

   const best_idx=melhor.idx;
   const best_i=melhor.i;

   //Calcula o stake
   const stake=stakeVal(best_idx);

   //Seleciona o elemento alvo da aposta (odds do Under da melhor goalline)
   const sel=market_group_goalline.$$(SEL.participantOddsOnly)[goallines.length+best_i];
   if (!sel) throw new Error(`Odds do Under da goalline ${goallines[best_i]} não encontrada em ${home} v ${away}`);

   etapa(`clicando na odd (goalline ${goallines[best_i]}, idx ${best_idx.toFixed(4)}, stake ${stake})`);
   await sel.rscroll();
   await sleep(0.5*sec);
   await sel.rclick();
   await sleep(0.5*sec);

   //Aguarda até surgir o StakeInput, onde vamos digitar o valor da aposta.
   //Passa o seletor (e não o elemento) para o waitFor reconsultar o DOM de verdade
   etapa('aguardando o betslip abrir');
   if ( !(await waitFor( SEL.stakeInput )) ) throw new Error(`Betslip não abriu (${SEL.stakeInput}) em ${home} v ${away} - clique na odd não registrou`);
   await sleep(1*sec);

   //Clica no StakeInput e digita o stake, conferindo que o valor entrou no campo
   etapa(`digitando o stake ${stake}`);
   await typeStake(stake);

   //Se o checkbox de Free bet estiver visivel cria nele
   const credits_checkbox=$$(SEL.creditsCheckbox)[0];
   const stake_box=$(SEL.stakeBox);
   if(credits_checkbox && stake_box){
      if ( credits_checkbox.getBoundingClientRect().y<stake_box.getBoundingClientRect().y-1  ) {
         if (credits_checkbox.classList.contains(CLS.creditsCheckboxSelected)==false ){
            await credits_checkbox.rclick();
            await sleep(1*sec);
         }
      }
   }

   //Caso as condições se alterarem e o botão AcceptButton surgir, clica no "X" (RemoveButton) e cancela a aposta
   const accept_button=$(SEL.acceptButton);
   if ( accept_button && !accept_button.classList.contains(CLS.hidden) ){
      logger.info(`Odds/disponibilidade mudaram em ${home} v ${away}, aposta cancelada`);
      const remove_button=$(SEL.removeButton);
      if (remove_button) await remove_button.rclick();
      await sleep(0.5*sec);
      return 1;
   }

   //Reconfere o stake logo antes de submeter: entre a digitação e o PlaceBet o
   //betslip pode ser recarregado pelo site e limpar o campo
   if (lerStake()!=Number(stake)) throw new Error(`Stake sumiu do betslip antes do PlaceBet (esperado ${stake}) em ${home} v ${away}`);

   //Finalmente clica no PlaceBet para submeter aposata
   const place_bet=$(SEL.placeBetButton);
   if (!place_bet) throw new Error(`Botão PlaceBet não encontrado em ${home} v ${away}`);

   etapa('clicando no PlaceBet');
   await place_bet.rclick();
   await sleep(15*sec);

   //Aguarda até aparecer o visistinho verde, indicando que aposta foi realizada com sucesso
   etapa('aguardando o recibo');
   const rec=await waitFor(SEL.receiptTick);
   if (!rec) {
      //Se não aparecer vistinho, log erro e interrompe a rotina
      logger.error(`Ocorreu erro, aposta não foi detectada com sucesso em ${home} v ${away} (stake no campo: "${$(SEL.stakeInput) ? $(SEL.stakeInput).value : 'betslip ausente'}")`);
      chrome.runtime.sendMessage({command:'freeze'});
      return 1;
   }
   await sleep(1*sec);
   etapa('aposta confirmada');

   //Extrai as informações da aposta feita. Os campos do recibo podem não estar
   //renderizados: sem os guards, um TypeError aqui perdia o registro de uma
   //aposta que JÁ foi feita, e o bot poderia repeti-la no jogo
   const home_v_away=$(SEL.betFixtureDescription) ? $(SEL.betFixtureDescription).innerText : `${home} v ${away}`;
   const tipo='u';
   const odds=$(SEL.oddsDropdownLabel) ? Number($(SEL.oddsDropdownLabel).innerText) : 0;
   const gl=goallines[best_i];

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
   const done=$(SEL.receiptDone);
   if (done) await done.rclick();
   await sleep(1*sec);

   await sleep(5*sec);
   chrome.storage.local.set({apostando:  false } );

   //Volta para tela principal
   location.hash='#/IP/B1';
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
   const {percentual_de_kelly, maximo_da_banca_por_aposta, aposta_maxima} = VARS.config;

   //Só abrevia os nomes das váriais para o código ficar mais limpo
   const [perc_kelly, max_perc_bank, max_bet]=[percentual_de_kelly, maximo_da_banca_por_aposta, aposta_maxima]
   
   //Percent da banca é idx vezes o kelly, limitado pela váriavel maximo_da_banca_por_aposta
   const perc_bank=Math.min(idx*perc_kelly, max_perc_bank);
   
   //A soma dos stakes das apostas que estão rodando no momento
   const total_in_bets=sum(VARS.my_bets.map(e=>e.stake));
   
   //Soma do banca com os stakes que estão rodando 
   const total_bank=VARS.balance + total_in_bets;
   
   //O stake será a percentual calculado vezes a banca total, limitado pela aposta_maxima
   const stake=Math.min(round125(perc_bank*total_bank),max_bet);

   //Garante o stake mínimo de R$0.50
   return Math.max(stake, 0.5);

}

const preReq=async()=>{
   
   //Se estiver apostando não faz nada
   if (VARS.apostando) return;
   
   //Se não estiver na tela do Soccer, força para entrar nessa tela
   if(location.hash!="#/IP/B1") {
      location.hash="#/IP/B1"; 
      await sleep(5*sec);
   }
   
   //Aceita os cookies
   const cookie_accept=$(SEL.cookieAccept);
   if (cookie_accept) await cookie_accept.rclick();
   
 
   //Ao aparecer alguma oferta de Free Bet, clica para ignorar
   const free_bet_close_button=$(SEL.freeBetClose);
   if( free_bet_close_button ) await free_bet_close_button.rclick();

   //Se o betslip ficar travado mostrando "mudança de preço/disponibilidade" (AcceptButton
   //visível), fecha clicando no X (RemoveButton) para destravar o loop principal
   const accept_button=$(SEL.acceptButton);
   if ( accept_button && !accept_button.classList.contains(CLS.hidden) ){
      const remove_button=$(SEL.removeButton);
      if (remove_button) await remove_button.rclick();
      await sleep(0.5*sec);
   }

   //Ao aparecer as informações sobre o último login, clica para continuar
   const last_login_button=[...$$(SEL.lastLogin)].filter(e=>e.innerText=='Continue')[0];
   if( last_login_button ) await last_login_button.rclick();
   
   
   
   //Deixa no mercado Match Goals
   const match_goals_tab=$$(SEL.marketSwitcherItem).fText('Match Goals')[0];
   if (!match_goals_tab.hasClass(CLS.marketSwitcherItemActive) ) await match_goals_tab.rclick();

   

   
};







const main=async()=>{
   
   
   
   await getBalance();
   
   
   await getStats();
   
   
   await updateMyBets();
   
   const matches=await getMatchList();
   
   logger.info(matches);
   
   //Seleciona os jogos para apostar e ordena de aleatória
   const sels=matches
               .filter(e=>e.idx>VARS.config.minimo_indice_para_apostar)
               .filter(e=>!jaFoiApostado(e.home, e.away))
               .sort(a=>Math.random()-0.5);
   
   //Seleciona o primeiro da lista
   if (sels.length==0) return;
   const {pos, idx, home, away}=sels[0];

   logger.info(`Aposta: ${home} v ${away}, idx:${idx}`);
   
   try{
		await apostar2( pos, home, away);
   } catch(err){
	   //Inclui a última etapa alcançada: é o que diz em que ponto a rotina parou
	   const etapa_atual=await new Promise(r=>chrome.storage.local.get(['etapa_aposta'], v=>r(v.etapa_aposta)));
	   const onde=etapa_atual ? ` [parou em: ${etapa_atual.nome}]` : '';
	   logger.error(`Erro na aposta ${home} v ${away}: ${err && err.message ? err.message : err}${onde}`);

	   //Limpa o betslip: uma aposta abortada deixa a seleção pendurada e o
	   //próximo ciclo abriria o cupom já sujo, digitando o stake no lugar errado
	   try{
	      const remove_button=$(SEL.removeButton);
	      if (remove_button) await remove_button.rclick();
	   } catch(e){ logger.info(`Não foi possível limpar o betslip: ${e}`); }
   }
   //Indica que a rotina de apostas terminou
   chrome.storage.local.set({apostando:  false } );
   
}






(async()=>{
   
   //Loop a cada 10 segundos
   while(true) try{
   
      //Seta as váriaveis
      await setVars();
      
      await sleep(10*1000)
      
      //Se não estiver na tela o Inplay  não faz nada
      if ( !location.hash.includes('#/IP') )  continue;
      
      
      
      
      //Verifica o balance existe indicando que está logado, estiver o Saldo com $
      chrome.storage.local.set({logado: Boolean( $$(SEL.balance).fText('$')[0] ) } );
      
      //Se o bot_ligado desligado, não faz nada 
      if(!VARS.bot_ligado) continue;
      
      logger.info('Loop Principal');
   
      //Aguarda a página estar complementamente carregada
      await waitFor( SEL.competitionList );
 
 
      //Se não logado tenta fazer o login
      if (!VARS.logado) await doLogin();
      
      //Se não logado mas faz mais nada
      if(!VARS.logado) continue;
      
      
      
      await preReq();
       
       
      await main();
      

   } 
   catch(e){ logger.info(e) }
    
})();  
 