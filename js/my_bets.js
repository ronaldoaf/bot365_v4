$(document).ready(function(){


//Se não estiver numa tela do MyBets, não faz nada
if (!location.hash.includes('MyBets')) return;



console.log('MyBets');

var myBetsList;

//Loope principal
setInterval(function(){
	login();
	
	//Se não estiver no Unsettled, coloca 
	if($('div.myb-MyBetsHeader_Button:contains(Unsettled).myb-MyBetsHeader_ButtonSelected').size()==0) $('div.myb-MyBetsHeader_Button:contains(Unsettled)').click();
	
	
	myBetsList=[];
	
	$('.myb-OpenBetItem').each(function(){  
		//if(!$(this).hasClass('myb-OpenBetItem_Open')) $(this).click();
	
		if ($(this).find('.myb-OpenBetItemInnerView').size()==0) $(this).click();
		
		myBetsList.push({
			mercado: $(this).find('.myb-OpenBetParticipant_MarketDescription').text(),
            match: $(this).find('.myb-OpenBetParticipant_FixtureDescription').clone().children().remove().end().text(),	
			cash_out_return: Number( $(this).find('.myb-CloseBetButtonBase_Return:eq(0)').text() ),
			stake: Number($(this).find('.myb-OpenBetItemInnerView_StakeText').text() ),
			obj: $(this)
		});

	});
	
	myBetsList.sort(function(a,b){
		if(a.mercado+a.match==b.mercado+b.match) return 0;
		return a.mercado+a.match>b.mercado+b.match ? 1 :-1;
	});
	
	//console.log(myBetsList);
	localStorage['myBetsList']=JSON.stringify(myBetsList);
	localStorage['myBetsLastUpdate']=(+new Date());
	
	
	
},1000);


/*
//Se encontrar alguma aposta duplicada tenta fazer o cash out e reiniciar
setInterval(function(){

	
	for(var i=0; i<myBetsList.length-1; i++){		
		if(myBetsList[i].mercado+myBetsList[i].match==myBetsList[i+1].mercado+myBetsList[i+1].match){
			$('.myb-OpenBetItem:contains('+myBetsList[i].mercado+'):contains('+myBetsList[i].match+'):eq(0) .myb-CloseBetButton_Button').click();
			setTimeout(function(){
				$('.myb-OpenBetItem:contains('+myBetsList[i].mercado+'):contains('+myBetsList[i].match+'):eq(0) .myb-CloseBetButton_Button').click();
			},1000);
			break;
			setTimeout(function(){
				location.reload();
			},15000)
		}
	}

},20000);
*/

//Reinicia a aba mybets a cada 3 minutos
setInterval(function(){
    location.reload();
},3*60*1000 );
	
});