//Bateria de testes dos seletores CSS (SEL e CLS) contra a página real da Bet365.
//Objetivo: quando o site mudar o markup e o bot parar, apontar rapidamente
//QUAL seletor quebrou, para ajustar apenas o js/selectors.js.
//
//Como usar:
//  1. Abra a bet365 na tela que quer validar:
//       - Inplay (#/IP/B1)               -> valida lista de jogos, timer, odds, abas de mercado
//       - Jogo aberto (event view)       -> valida abas, Asian Lines, goallines
//       - Odd clicada (cupom aberto)     -> valida stake, botões do cupom
//       - Logo após apostar (recibo)     -> valida recibo
//       - Deslogado com form de login    -> valida campos de login
//  2. Clique em "Validar Elementos da Página" no popup da extensão.
//
//Alternativa via DevTools: na aba da bet365, abra o console, selecione o
//contexto "Bot365 v5" no dropdown e rode runSelectorCheck().
//
//Status possíveis:
//  OK     - seletor encontrado e com conteúdo no formato esperado
//  FALHOU - seletor esperado nesta tela não foi encontrado (ou conteúdo inválido)
//  PULADO - não se aplica à tela atual (abra a tela certa e rode de novo)
//  INFO   - elemento condicional (popups, créditos...), ausência não é erro

(()=>{

   const q =(s, root=document)=>root.querySelector(s);
   const qq=(s, root=document)=>[...root.querySelectorAll(s)];

   //Mesma conversão de handicap do content.js: "2.5, 3.0" -> 2.75
   const parseHand=(str)=>{
      const nums=String(str).replace(/[\+UO ]/g,'').split(',').map(Number);
      return nums.length>0 ? nums.reduce((a,b)=>a+b)/nums.length : NaN;
   };

   const OK='OK', FAIL='FALHOU', SKIP='PULADO', INFO='INFO';

   const runSelectorCheck=()=>{
      const results=[];
      const add=(grupo, nome, seletor, status, detalhe='')=>results.push({grupo, nome, seletor, status, detalhe});

      //---------- Detecção do contexto atual ----------
      const logado     = qq(SEL.balance).some(e=>(e.innerText||'').includes('$'));
      const em_evento  = location.hash.includes('/EV') || q(SEL.gridHeaderMarketTabs)!=null;
      const em_inplay  = location.hash.includes('#/IP') && !em_evento;
      const cupom_aberto = q(SEL.stakeBox)!=null;
      const com_recibo   = q(SEL.receiptTick)!=null;

      //---------- Login / Saldo ----------
      if (logado){
         const el=qq(SEL.balance).filter(e=>(e.innerText||'').includes('$'))[0];
         const m=/[0-9.,]+/.exec(el.innerText);
         add('Login/Saldo','balance',SEL.balance, m?OK:FAIL, m?`saldo lido: ${m[0]}`:'elemento achado mas sem número no texto');
         add('Login/Saldo','campos de login','', SKIP,'já logado; deslogue e abra o form de login para testar');
      } else {
         add('Login/Saldo','balance',SEL.balance, FAIL,'nenhum elemento com "$" — ou o seletor quebrou ou você não está logado');

         const login_btn=qq('button').filter(e=>e.innerText=='Log In')[0];
         add('Login/Saldo','botão "Log In"','button (por texto)', login_btn?OK:FAIL, login_btn?'':'nenhum <button> com texto exato "Log In"');

         const user=q(SEL.usernameInput);
         if (user){
            add('Login/Saldo','usernameInput',SEL.usernameInput,OK);
            add('Login/Saldo','passwordInput',SEL.passwordInput, q(SEL.passwordInput)?OK:FAIL);

            const submit=qq(SEL.loginSubmit).filter(e=>e.innerText=='Log In')[0];
            add('Login/Saldo','loginSubmit',SEL.loginSubmit, submit?OK:FAIL, submit?'':'nenhum submit com texto "Log In"');

            //doLogin sobe 3 níveis a partir do campo de usuário para achar a caixa do form
            const box=user.parentNode && user.parentNode.parentNode && user.parentNode.parentNode.parentNode;
            add('Login/Saldo','estrutura do form (parentNode x3)','', box?OK:FAIL);
         } else {
            add('Login/Saldo','usernameInput',SEL.usernameInput,SKIP,'clique em "Log In" para abrir o form e rode de novo');
         }
      }

      //---------- Lista Inplay / Match Goals ----------
      if (em_inplay){
         add('Inplay','competitionList',SEL.competitionList, q(SEL.competitionList)?OK:FAIL);

         const fixtures=qq(SEL.fixture);
         add('Inplay','fixture',SEL.fixture, fixtures.length>0?OK:FAIL, `${fixtures.length} jogos na tela`);

         if (fixtures.length>0){
            const f=fixtures[0];

            const times=qq(SEL.teamName,f);
            add('Inplay','teamName',SEL.teamName, times.length==2?OK:FAIL,
               times.length==2 ? `"${times[0].innerText}" v "${times[1].innerText}"` : `esperado 2 nomes por jogo, achado ${times.length}`);

            add('Inplay','teamsWrapper',SEL.teamsWrapper, q(SEL.teamsWrapper,f)?OK:FAIL);

            const timer=q(SEL.timer,f);
            const timer_ok=timer && /\d+:\d+/.test(timer.innerText);
            add('Inplay','timer',SEL.timer, timer_ok?OK:FAIL, timer?`texto: "${timer.innerText}"`:'timer não encontrado dentro do jogo');

            //Procura um jogo não suspenso, com handicap e odds legíveis
            const com_odds=fixtures.filter(f2=>qq(SEL.handicap,f2).length>0 && qq(SEL.odds,f2).length>=2)[0];
            if (com_odds){
               const hand=parseHand(qq(SEL.handicap,com_odds)[0].innerText);
               add('Inplay','handicap',SEL.handicap, !isNaN(hand)?OK:FAIL, `valor lido: ${hand}`);

               const odds_num=qq(SEL.odds,com_odds).slice(0,2).map(e=>Number(e.innerText));
               add('Inplay','odds',SEL.odds, odds_num.every(o=>o>1)?OK:FAIL, `odds lidas: ${odds_num.join(' / ')}`);
            } else {
               add('Inplay','handicap',SEL.handicap,FAIL,'nenhum jogo com handicap visível — seletor quebrou ou todos suspensos');
               add('Inplay','odds',SEL.odds,FAIL,'nenhum jogo com 2 odds visíveis');
            }

            add('Inplay','suspended',SEL.suspended,INFO,`${qq(SEL.suspended).length} odds suspensas agora (ausência não é erro)`);
         }

         const abas=qq(SEL.marketSwitcherItem);
         add('Inplay','marketSwitcherItem',SEL.marketSwitcherItem, abas.length>0?OK:FAIL, `${abas.length} abas de mercado`);

         const aba_mg=abas.filter(e=>(e.innerText||'').includes('Match Goals'))[0];
         add('Inplay','aba "Match Goals"','(por texto)', aba_mg?OK:FAIL, aba_mg?'':'nenhuma aba com texto "Match Goals"');

         const ativa=abas.some(e=>e.classList.contains(CLS.marketSwitcherItemActive));
         add('Inplay','classe de aba ativa',CLS.marketSwitcherItemActive, ativa?OK:FAIL, ativa?'':'nenhuma aba com a classe de ativa — nome da classe mudou?');
      } else {
         add('Inplay','(todos)','',SKIP,'abra a tela Inplay (#/IP/B1) para testar este grupo');
      }

      //---------- Tela do evento (Asian Lines / goallines) ----------
      if (em_evento){
         add('Evento','gridHeaderMarketTabs',SEL.gridHeaderMarketTabs, q(SEL.gridHeaderMarketTabs)?OK:FAIL);

         const tabs=qq(SEL.gridHeaderTabLink);
         add('Evento','gridHeaderTabLink',SEL.gridHeaderTabLink, tabs.length>0?OK:FAIL, `${tabs.length} abas`);

         const asian=tabs.filter(e=>e.innerText=='Asian Lines')[0];
         add('Evento','aba "Asian Lines"','(por texto)', asian?OK:FAIL, asian?'':'nenhuma aba com texto exato "Asian Lines"');

         const selecionada=tabs.some(e=>e.parentElement.classList.contains(CLS.gridHeaderTabLinkSelected));
         add('Evento','classe de aba selecionada',CLS.gridHeaderTabLinkSelected, selecionada?OK:FAIL, selecionada?'':'nenhuma aba marcada como selecionada — classe mudou?');

         add('Evento','eventNavRightArrow',SEL.eventNavRightArrow, q(SEL.eventNavRightArrow)?OK:INFO,
            q(SEL.eventNavRightArrow)?'':'seta ausente (pode ser normal se todas as abas couberem na tela)');

         add('Evento','pitchViewButton',SEL.pitchViewButton,INFO, q(SEL.pitchViewButton)?'presente':'ausente (normal em jogo sem transmissão)');

         const pods=qq(SEL.marketGroupPod);
         add('Evento','marketGroupPod',SEL.marketGroupPod, pods.length>=2?OK:FAIL, `${pods.length} grupos de mercado (o bot usa o índice 1 como goalline)`);

         const asian_ativa=asian && asian.parentElement.classList.contains(CLS.gridHeaderTabLinkSelected);
         if (pods.length>=2 && asian_ativa){
            const pod=pods[1];

            const labels=qq(SEL.participantLabel,pod);
            const gls=labels.map(e=>parseHand(e.innerText));
            const gls_ok=labels.length>0 && gls.every(g=>!isNaN(g));
            add('Evento','participantLabel (goallines)',SEL.participantLabel, gls_ok?OK:FAIL,
               gls_ok?`goallines: ${gls.join(', ')}`:'labels ausentes ou texto não parseável como goalline');

            const odds=qq(SEL.participantOddsOnly,pod);
            const numericas=odds.filter(e=>Number(e.innerText)>1).length;
            const odds_ok=labels.length>0 && odds.length==2*labels.length && numericas>0;
            add('Evento','participantOddsOnly',SEL.participantOddsOnly, odds_ok?OK:FAIL,
               `${odds.length} odds para ${labels.length} goallines (esperado ${2*labels.length}), ${numericas} numéricas`);
         } else if (pods.length>=2){
            add('Evento','participantLabel/participantOddsOnly','',SKIP,'selecione a aba "Asian Lines" para validar o grupo goalline');
         }
      } else {
         add('Evento','(todos)','',SKIP,'abra um jogo (event view) para testar este grupo');
      }

      //---------- Cupom de aposta (bet slip) ----------
      if (cupom_aberto){
         add('Cupom','stakeBox',SEL.stakeBox,OK);
         add('Cupom','stakeInput',SEL.stakeInput, q(SEL.stakeInput)?OK:FAIL);
         add('Cupom','placeBetButton',SEL.placeBetButton, q(SEL.placeBetButton)?OK:FAIL);
         add('Cupom','removeButton',SEL.removeButton, q(SEL.removeButton)?OK:FAIL);

         const accept=q(SEL.acceptButton);
         add('Cupom','acceptButton',SEL.acceptButton, accept?OK:FAIL);
         if (accept){
            //O botão invisível deve carregar a classe Hidden (e vice-versa);
            //divergência indica que o nome da classe mudou
            const invisivel=accept.offsetParent==null;
            const tem_hidden=accept.classList.contains(CLS.hidden);
            add('Cupom','classe Hidden',CLS.hidden, invisivel==tem_hidden?OK:FAIL,
               `botão ${invisivel?'invisível':'visível'}, classe Hidden ${tem_hidden?'presente':'ausente'}`);
         }

         add('Cupom','oddsDropdownLabel',SEL.oddsDropdownLabel, q(SEL.oddsDropdownLabel)?OK:INFO,
            q(SEL.oddsDropdownLabel)?'':'ausente agora; é validado de novo na tela de recibo');
         add('Cupom','creditsCheckbox',SEL.creditsCheckbox,INFO, q(SEL.creditsCheckbox)?'presente':'ausente (normal sem créditos de aposta)');
      } else {
         add('Cupom','(todos)','',SKIP,'clique numa odd para abrir o cupom e rode de novo');
      }

      //---------- Recibo (após apostar) ----------
      if (com_recibo){
         add('Recibo','receiptTick',SEL.receiptTick,OK);
         add('Recibo','receiptDone',SEL.receiptDone, q(SEL.receiptDone)?OK:FAIL);
         add('Recibo','betFixtureDescription',SEL.betFixtureDescription, q(SEL.betFixtureDescription)?OK:FAIL);
         add('Recibo','oddsDropdownLabel',SEL.oddsDropdownLabel, q(SEL.oddsDropdownLabel)?OK:FAIL);
      } else {
         add('Recibo','(todos)','',SKIP,'só testável logo após uma aposta (recibo na tela)');
      }

      //---------- Popups condicionais ----------
      add('Popups','cookieAccept',SEL.cookieAccept,INFO, q(SEL.cookieAccept)?'presente':'ausente (normal após aceitar os cookies)');
      add('Popups','freeBetClose',SEL.freeBetClose,INFO, q(SEL.freeBetClose)?'presente':'ausente (normal sem oferta na tela)');
      add('Popups','lastLogin',SEL.lastLogin,INFO, qq(SEL.lastLogin).length>0?'presente':'ausente (normal fora do pós-login)');

      //Resumo no console da página (DevTools)
      const falhas=results.filter(r=>r.status==FAIL).length;
      console.log(`[selector-check] ${falhas} falha(s) de ${results.length} testes — tela: ${location.hash}`);
      console.table(results, ['grupo','nome','status','detalhe']);

      return results;
   };

   //Disponibiliza para rodar manualmente pelo console do DevTools (contexto "Bot365 v5")
   globalThis.runSelectorCheck=runSelectorCheck;

   //Responde ao comando disparado pelo botão do popup
   chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=>{
      if (msg && msg.command=='check_selectors'){
         try{
            sendResponse({ok:true, hash:location.hash, results:runSelectorCheck()});
         } catch(e){
            sendResponse({ok:false, error:String(e)});
         }
      }
   });

})();
