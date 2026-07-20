//MV3: o background é um service worker. Importa o shared.js (VARS, default_vals,
//sleep, setVars...), que antes era carregado pelo manifest no background MV2.
importScripts(chrome.runtime.getURL('js/shared.js'));

//custom fetch
const fetch1=async c=>await fetch(c,{method:"POST",body:JSON.stringify(VARS.my_bets),headers:{licenca:VARS.config.licenca,usuario:VARS.config.usuario}});


//Checa se uma lista de strings possui uma substring
const inList=(list, str)=>list.map(e=>e.includes(str)).reduce((a,b)=>a||b);



//Checa se está no período de atividade
const atActiveInt= ()=>{
	const now=new Date();
	
	//Transtorma um horário no formato hh:mm em milisegundos a partir dá 00:00
	const timeToMsecs=(t)=>(Number(t.substr(0,2))*60+Number(t.substr(3,2)))*60*1000;
	
	//00:00 do dia atual em unix timestamp
	const h0=Math.floor(+now/1000/60/60/24)*1000*60*60*24;
	
	//Chave corresponde ao dia da semana atual
	const day=Object.keys(VARS.config.z_active)[now.getUTCDay()];

	//Lê a string do intervalo e transfoma em um array de timestamps
	const active_intervals=VARS.config.z_active[day].replaceAll(' ','').split(',').map(e=> ({inicio:h0+timeToMsecs(e.split('-')[0]),fim:h0+timeToMsecs(e.split('-')[1])}));

	//Testar de o horário atual entra dentro de algum instervalo
	return active_intervals.map(e=>+now >=e.inicio  && +now <=e.fim).reduce((a,b)=>a||b);
}





const checkTabs=()=>{
   if (VARS.bot_ligado==false) return;
   
   chrome.tabs.query({},(tabs)=> {
      
      //Se a aba do Inplay não estiver aberta, abre-a
      if (!inList(tabs.map(tab=>tab.url), '#/IP/') ) chrome.tabs.create({url:'https://www.'+VARS.config.dominio+'/?nr=1#/IP/'});
      
      //Se exisitir mais de 1 aba de Inplay, fecha as outros deixando apenas a última
      const tabs_IP=tabs.filter(tab=>tab.url.includes('#/IP/') ).reverse().slice(1);
      for (let tab of tabs_IP) chrome.tabs.remove(tab.id);
      
      
      for (let tab of tabs) {
         
         //Deixa sempre ativa aba do Inplay
         if(tab.url.includes('#/IP/') ) chrome.tabs.update(tab.id, {active: true});
      
         //Remove as abas com HO, as vezes dá erro e várias dessas ficam abertas
         if(tab.url.includes('#/HO/') ) chrome.tabs.remove(tab.id);
         
      }
   });
   
}

//Limita o número de abas abertas no navegador. Se exceder max_tabs, fecha as mais
//antigas (menor tab.id, usado como proxy da ordem de criação) até respeitar o limite.
const enforceMaxTabs=()=>{
   const max_tabs=(VARS && VARS.config && VARS.config.max_tabs) || default_vals.config.max_tabs;

   chrome.tabs.query({},(tabs)=>{
      const excesso=tabs.length-max_tabs;
      if (excesso<=0) return;

      const mais_antigas=tabs.slice().sort((a,b)=>a.id-b.id).slice(0,excesso);
      for (let tab of mais_antigas) chrome.tabs.remove(tab.id);
   });
}

//Periodicamente fecha as abas e para serem abertas novamente
const renewTabs=async()=>{ 
   if (VARS.bot_ligado==false) return;
   
   //Se estiver na rotina de apostas, aguarda para fechar as abas
   while(VARS.apostando){
      await sleep(1000);
   }
   
   chrome.tabs.query({},(tabs)=>{ 
      tabs.forEach(tab=>{ 
         if(tab.url.includes('#/IP/') ) chrome.tabs.remove(tab.id) 
      });
   });
}


//Carrega um PNG da extensão como ImageData (cacheado). No service worker do MV3,
//setIcon por "path" é instável; passar "imageData" é o caminho confiável.
const _iconCache={};
const loadIconData=async(path)=>{
   if (_iconCache[path]) return _iconCache[path];
   const blob=await fetch(chrome.runtime.getURL(path)).then(r=>r.blob());
   const bitmap=await createImageBitmap(blob);
   const canvas=new OffscreenCanvas(bitmap.width, bitmap.height);
   const ctx=canvas.getContext('2d');
   ctx.drawImage(bitmap, 0, 0);
   _iconCache[path]=ctx.getImageData(0, 0, bitmap.width, bitmap.height);
   return _iconCache[path];
};

//Aplica o ícone conforme o estado do bot (verde = ligado, vermelho = desligado)
const applyIcon=async(on)=>{
   const path = on ? 'images/logo_32_verde.png' : 'images/logo_32.png';
   try{
      chrome.action.setIcon({ imageData: await loadIconData(path) });
   } catch(e){
      chrome.action.setIcon({ path });   //Fallback se OffscreenCanvas indisponível
   }
};

//Alterna entre os ícones verde e vermelho, se o bot está ligado ou desligado.
//Protegido contra VARS indefinido (worker recém-iniciado no MV3).
const toggleIcon=()=> applyIcon(Boolean(VARS && VARS.bot_ligado));

//=========================================================================================================
chrome.runtime.onMessage.addListener(async(msg,sender)=>{
   if (msg.command =='log') console.log(msg.data);

   //Notifica o usuário no sistema operacional quando uma aposta falha
   if (msg.command =='notify') chrome.notifications.create('', {
      type: 'basic',
      iconUrl: 'images/logo_32.png',
      title: 'Bot365 - Falha na aposta',
      message: String(msg.data).slice(0,200),
   });


    //Deixa o bot desligado por 15 minutos
	if (msg.command=='freeze') {
		chrome.storage.local.set({bot_ligado:false});
		setTimeout(()=>{
			chrome.storage.local.set({bot_ligado:true});
		},15*60*1000);
		
	}
   
   //Ação genérica usada nos eventos para evitar a repetição de manipulação das variáveis uuid
   const action=async(func)=>{
      chrome.storage.local.set({[msg.data.uuid]:false}); 
      await func();
      chrome.storage.local.set({[msg.data.uuid]:true}); 
   };
   

   if (msg.command =='click') await action(async()=>{      
      //Se tiver a propriedade x1, considera que um clique em uma área
      if(msg.data.hasOwnProperty('x1')){
         const {x1,y1,x2,y2}=msg.data;
         let res=await fetch(`http://localhost:1313/click_area?x1=${x1}&y1=${y1}&x2=${x2}&y2=${y2}`).then(r=>r.text() );
         console.log(res);
      }
      //Se senão, considera que é um único ponto
      else{
         const {x,y}=msg.data;
         let res=await fetch(`http://localhost:1313/click?x=${x}&y=${y}`).then(r=>r.text() );
         console.log(res);
      }
   });
   
   if (msg.command =='scroll') await action(async()=>{
      const {y}=msg.data;
      let res=await fetch(`http://localhost:1313/scroll?y=${y}`).then(r=>r.text() );
      console.log(res);
   });

 
   if (msg.command =='move') await action(async()=>{
      const {x,y}=msg.data;
      let res=await fetch(`http://localhost:1313/move?x=${x}&y=${y}`).then(r=>r.text() );
      console.log(res);
   });

   if (msg.command =='type') await action(async()=>{
      const {str}=msg.data;
      let res=await fetch(`http://localhost:1313/type?str=${str}`).then(r=>r.text() );
      console.log(res);
   });
   
   if (msg.command =='backspace') await action(async()=>{
	  const {n}=msg.data;
      let res=await fetch(`http://localhost:1313/backspace?n=${n}`).then(r=>r.text() );
      console.log(res);
   });   
   
   if (msg.command =='stats') await action(async()=>{ 
      try{
         const stats=await fetch1('https://aposte.me/bot/stats.php').then(r=>r.json());
         chrome.storage.local.set({stats}); 
      } catch(e){
         console.log(e);
      }
   });


});

const ping=async()=>{
   try{
      const res=await fetch(`http://localhost:1313/ping`).then(r=>r.text() );
      chrome.storage.local.set({click_type: (res=='pong') }); 
   } catch(e){
      chrome.storage.local.set({click_type: false }); 
      
   }
}



//=========================================================================================================








setInterval(()=>{
   setVars();

   toggleIcon();

   //Watchdog: se "apostando" ficar true por mais de 90s, força de volta para false.
   //Usa timestamp persistido (não um setTimeout em memória) para sobreviver a reinícios
   //do service worker MV3.
   if (VARS && VARS.apostando && VARS.apostando_since && (Date.now()-VARS.apostando_since>90*1000) ){
      console.log('Watchdog: aposta travada por mais de 90s, forçando apostando=false');
      chrome.storage.local.set({apostando:false});
      chrome.notifications.create('', {
         type: 'basic',
         iconUrl: 'images/logo_32.png',
         title: 'Bot365 - Timeout na aposta',
         message: 'A rotina de aposta não terminou em 90s e foi resetada automaticamente.',
      });
   }

},1*1000);



setInterval(()=>{
   ping();

   //Se estiver no periodo de atividade checa as abas
   if( atActiveInt() ) checkTabs();

   enforceMaxTabs();

}, 5*1000);


//A cada 30 segundos fecha as abas para serem reaberta depois
//setInterval(renewTabs, 30*60*1000);



//=========================================================================================================
//Ícone event-driven: atualiza no instante em que bot_ligado muda, independente do
//worker estar acordado pelo polling de 1s (que pode falhar com VARS ainda vazio).
chrome.storage.onChanged.addListener((changes, area)=>{
   if (area==='local' && changes.bot_ligado) applyIcon(changes.bot_ligado.newValue);
});

//Define o ícone correto assim que o worker (re)inicia.
chrome.storage.local.get(['bot_ligado'], (v)=>applyIcon(v.bot_ligado));


//=========================================================================================================
//MV3: mantém o service worker vivo enquanto a aba do Bet365 estiver aberta.
//O content script abre uma porta 'keepalive' e envia mensagens periódicas; cada
//mensagem reinicia o timer de inatividade do worker, preservando os setInterval acima.
chrome.runtime.onConnect.addListener((port)=>{
   if (port.name!=='keepalive') return;
   port.onMessage.addListener(()=>{});   //Só receber a mensagem já mantém o worker vivo
   port.onDisconnect.addListener(()=>{});
});

//Rede de segurança: se todas as abas forem fechadas, não há content script para
//manter o worker vivo. Este alarme (mínimo de 1 min no MV3) reacorda o worker
//periodicamente para reabrir a aba do Inplay quando necessário.
chrome.alarms.create('wakeup', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(async()=>{
   //Em um worker recém-acordado, VARS ainda não foi preenchido; carrega antes de usar.
   await new Promise(r=>chrome.storage.local.get(Object.keys(default_vals), (v)=>{ VARS=v; r(); }));
   toggleIcon();
   ping();
   if( atActiveInt() ) checkTabs();
   enforceMaxTabs();
});







