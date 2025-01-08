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
      dominio: "bet365.bet.br",
      goal_diff_min:1.0,
      minimo_indice_para_apostar:0.01,   //min_idx
      min_ps_perc:0.5,
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
   },
   tc_ps:[1.0952903, 1.0775862, 1.0669125, 1.0599209, 1.0544581, 1.0501909, 1.0465725, 1.0433175, 1.0405257, 1.0382956,
          1.035503,  1.0341262, 1.0319207, 1.0303377, 1.0289366, 1.0277778, 1.0260677, 1.0247052, 1.0238466, 1.022211, 
          1.0212647, 1.0204082, 1.0195975, 1.0180337, 1.0174419, 1.0168507, 1.0160428, 1.0150963, 1.0140845, 1.0133333,
          1.012987,  1.0121951, 1.0113269, 1.0105205, 1.010101,  1.0092744, 1.0084926, 1.0077242, 1.0071392, 1.0067992,
          1.0058309, 1.0050963, 1.0044978, 1.0039041, 1.0034904, 1.0032103, 1.0024752, 1.0016518, 1.00058,   1, 
          1,         0.9994524, 0.9989754, 0.998004,  0.9975369, 0.9967672, 0.9962806, 0.9956356, 0.9952229, 0.9950249,
          0.9942439, 0.9933775, 0.9928296, 0.9924623, 0.991832,  0.9910148, 0.9903382, 0.989961,  0.9895547, 0.9887335,
          0.9879254, 0.9871668, 0.986168,  0.9858812, 0.9854015, 0.9846547, 0.9834123, 0.982594,  0.9821896, 0.981642, 
          0.9803922, 0.9792949, 0.9782609, 0.9777228, 0.9761905, 0.975,     0.9736842, 0.9722962, 0.9708738, 0.9689922, 
          0.9674907, 0.9651163, 0.9629168, 0.9600337, 0.9561448, 0.9516491, 0.9455794, 0.9363086, 0.9207806, 0.7758621],
             
   
   
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

