//Logger do content script. Encaminha a mensagem ao background (que a exibe no
//console da extensão) e também imprime no console da própria página.
//Substitui o antigo override global de console.log, evitando efeitos colaterais.
const logger = {
   info: (data) => {
      chrome.runtime.sendMessage({ command: 'log', data });
      console.log(data);
   },

   //Loga erro, persiste no histórico (chrome.storage.local.errors) e dispara notificação no background
   error: (data) => {
      chrome.runtime.sendMessage({ command: 'log', data });
      console.error(data);

      const entry={ data: String(data), timestamp: +new Date() };
      chrome.storage.local.get(['errors'], ({errors=[]})=>{
         errors=[...errors, entry].slice(-50);
         chrome.storage.local.set({errors});
      });

      chrome.runtime.sendMessage({ command: 'notify', data: String(data) });
   },
};
