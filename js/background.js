const fetch1=async c=>await fetch(c,{method:"POST",body:JSON.stringify(VARS.my_bets),headers:{licenca:VARS.config.licenca,usuario:VARS.config.usuario}});




console.log('atualizou');



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


//Alterna entre os ícones verde e vermelho, se o bot está ligado ou desligado
const toggleIcon=()=>{
   if (VARS.bot_ligado) {
      chrome.browserAction.setIcon({path: 'images/logo_32_verde.png'});
   } else{
      chrome.browserAction.setIcon({path: 'images/logo_32.png'});   
   }
   
}

//=========================================================================================================
chrome.runtime.onMessage.addListener(async(msg,sender)=>{
   if (msg.command =='log') console.log(msg.data);   
  
  
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
         const stats=await fetch1('https://bot-ao.com/stats.php').then(r=>r.json());
         chrome.storage.local.set({stats}); 
      } catch(e){
         console.log(e);
      }
   });
   if (msg.command =='model') await action(async()=>{
      try{
         const MODEL=await fetch1('https://bot-ao.com/model_new.php').then(r=>r.json());
         chrome.storage.local.set({MODEL}); 
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
   
},1*1000);



setInterval(()=>{
   ping();
   
   //Se estiver no periodo de atividade checa as abas
   if( atActiveInt() ) checkTabs();

}, 5*1000);


//A cada 30 segundos fecha as abas para serem reaberta depois
setInterval(renewTabs, 30*60*1000);







