const fetch1=async c=>await fetch(c,{method:"POST",body:JSON.stringify(VARS.my_bets),headers:{licenca:VARS.config.licenca,usuario:VARS.config.usuario}});




console.log('atualizou');



//Checa se uma lista de strings possui uma substring
const inList=(list, str)=>list.map(e=>e.includes(str)).reduce((a,b)=>a||b);






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
   
   if (msg.command =='stats') await action(async()=>{
      try{
         const stats=await fetch1('https://bot-ao.com/stats.php').then(r=>r.json());
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

(async()=>{
   const MODEL=await fetch1('https://bot-ao.com/model.php').then(r=>r.json());
   chrome.storage.local.set({MODEL}); 
   
   await ping();
   
   setVars();
   
   
})();






setInterval(()=>{
   setVars();
   
   toggleIcon();
   
},1*1000);



setInterval(()=>{
   ping();
   
   checkTabs();

}, 5*1000);


setInterval(renewTabs, 30*60*1000);







