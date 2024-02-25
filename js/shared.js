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
      minimo_indice_para_apostar:0.02,   //min_idx
      percentual_de_kelly:0.5,    //perc_kelly
      maximo_da_banca_por_aposta:0.12,   //max_perc_bank
      aposta_maxima:10000,   //max_bet
      usuario: 'usuario',
      senha: 'senha',
      licenca:'00000000-0000'
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

