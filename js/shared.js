var VARS;

//Defini os valores padrões para as variáveis
const default_vals={
   bot_ligado: false,
   logado: false,
   click_type:false,
   apostando:false,
   balance:0,
   my_bets:[],
   stats:[],
   MODEL:{},
   config:{
      dominio: "365sport365.com",
      goal_diff_min:1.0,
      minimo_indice_para_apostar:0.01,   //min_idx
      percentual_de_kelly:0.6,    //perc_kelly
      maximo_da_banca_por_aposta:0.14,   //max_perc_bank
      aposta_maxima:5000,   //max_bet
      usuario: 'usuario',
      senha: 'senha',
      licenca:'00000000-0000',
      z_active:{
         '1.dom':'00:00-23:59',
         '2.seg':'00:00-23:59',
         '3.ter':'00:00-23:59',
         '4.qua':'00:00-23:59',
         '5.qui':'00:00-23:59',
         '6.sex':'00:00-23:59',
         '7.sab':'00:00-23:59',
      }
   }
};

//Espera por tantos milisegundos
const sleep=(ms)=> new Promise(resolve => setTimeout(resolve, ms));


//Caso a váriavel não esteja  defina, a define com uma valor padrão
const setDefVal=(var_str, def_val)=>{
   chrome.storage.local.get([var_str], (vars)=> {
      if ( vars[var_str]==undefined  ) chrome.storage.local.set({[var_str]: def_val});
   });
};

//Para cada váriavel não definida define-a com seu valor padrão
for( key of Object.keys(default_vals) ) setDefVal(key, default_vals[key]);

//Copia do chrome.storage.local para VARS
const setVars=()=>chrome.storage.local.get(Object.keys(default_vals), (vars)=>VARS=vars);

