const $=(q)=>document.querySelector(q);

chrome.storage.local.get(['config','bot_ligado','click_type'], VARS=> {
   
   //Se deixa checkado se o bot estiver ligado
   $('#cmn-toggle-1').checked=VARS.bot_ligado;
   
   //Preenche a textarea com JSON da configuração
   $('#config').value=JSON.stringify(VARS.config,null,4);

   //Se o usuario e senha forem alterados esconde o aviso
   if ((VARS.config.usuario!='usuario') && (VARS.config.senha!='senha')) $('#aviso1').style.display='none';
   
   //Esconde o aviso da falta de funcionamento do clickType
   if(VARS.click_type) $('#aviso2').style.display='none';
   
   //Esconde o aviso da licença se essa for alterada
   if (VARS.config.licenca!='00000000-0000') $('#aviso3').style.display='none';
   
   //Preeche a váriavel do bot_ligado conforme o valor do checkbox
   $("#cmn-toggle-1").onchange=(event)=> chrome.storage.local.set( {bot_ligado: event.target.checked} );
   
   //Ao clicar botão salva a configuração
   $('#salva').onclick=()=>{
      chrome.storage.local.set( {config:JSON.parse( $('#config').value) }) ;
      location.reload();
   }
});
