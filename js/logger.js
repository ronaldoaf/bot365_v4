//Logger do content script. Encaminha a mensagem ao background (que a exibe no
//console da extensão) e também imprime no console da própria página.
//Substitui o antigo override global de console.log, evitando efeitos colaterais.
const logger = {
   info: (data) => {
      chrome.runtime.sendMessage({ command: 'log', data });
      console.log(data);
   },
};
