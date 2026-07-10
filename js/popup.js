const $=(q)=>document.querySelector(q);

chrome.storage.local.get(['errors'], ({errors=[]})=>{
   const el=$('#erros');
   el.innerHTML = errors.length==0
      ? 'Nenhum erro registrado.'
      : errors.slice(-10).reverse().map(e=> `<div>${new Date(e.timestamp).toLocaleString()} — ${e.data}</div>`).join('');
});

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


//---------- Bateria de teste dos seletores (js/selector-check.js) ----------

//Escapa HTML de textos vindos da página (nomes de time etc.)
const esc=(s)=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const ICONE={ 'OK':'✅', 'FALHOU':'❌', 'PULADO':'⏭️', 'INFO':'ℹ️' };

//Monta o relatório agrupado; o title de cada linha mostra o seletor CSS testado
const renderTeste=(results, hash)=>{
   const falhas=results.filter(r=>r.status=='FALHOU').length;
   const oks=results.filter(r=>r.status=='OK').length;

   let html=`<div style="font-weight:bold; margin-bottom:4px;">`+
      (falhas==0 ? `✅ Nenhuma falha` : `❌ ${falhas} falha(s)`)+
      ` — ${oks} OK — tela: ${esc(hash)}</div>`;

   let grupo='';
   for (const r of results){
      if (r.grupo!=grupo){
         grupo=r.grupo;
         html+=`<div style="font-weight:bold; margin-top:6px;">${esc(grupo)}</div>`;
      }
      const cor=r.status=='FALHOU' ? 'color:#c00;' : (r.status=='PULADO' ? 'color:#888;' : '');
      html+=`<div style="${cor}" title="${esc(r.seletor)}">${ICONE[r.status]||''} ${esc(r.nome)}${r.detalhe?' — '+esc(r.detalhe):''}</div>`;
   }
   $('#resultado_teste').innerHTML=html;
};

document.addEventListener('DOMContentLoaded', ()=>{

   //Seções recolhíveis: clicar no título mostra/oculta o conteúdo e gira a setinha
   document.querySelectorAll('.secao-titulo').forEach(titulo=>{
      titulo.onclick=()=>{
         const secao=document.getElementById(titulo.dataset.secao);
         const aberta=secao.style.display!='none';
         secao.style.display=aberta?'none':'block';
         titulo.querySelector('.seta').textContent=aberta?'▸':'▾';
      };
   });

   $('#testar').onclick=()=>{
      const out=$('#resultado_teste');
      out.innerHTML='Testando...';

      //Procura a aba da bet365 (prioriza a aba ativa, se for uma delas)
      chrome.tabs.query({url:'https://www.bet365.bet.br/*'}, (tabs)=>{
         if (!tabs || tabs.length==0){
            out.innerHTML='Nenhuma aba da bet365 aberta.';
            return;
         }
         const tab=tabs.filter(t=>t.active)[0] || tabs[0];

         chrome.tabs.sendMessage(tab.id, {command:'check_selectors'}, (resp)=>{
            if (chrome.runtime.lastError || !resp){
               out.innerHTML='Sem resposta da página. Recarregue a aba da bet365 (F5) e tente de novo.';
               return;
            }
            if (!resp.ok){
               out.innerHTML='Erro ao rodar o teste: '+esc(resp.error);
               return;
            }
            renderTeste(resp.results, resp.hash);
         });
      });
   };
});
