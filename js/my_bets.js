$(document).ready(function(){


//Se não estiver numa tela do MyBets, não faz nada
if (!location.hash.includes('#/MB/')) return;



console.log('MyBets');

var myBetsList;



//Loope principal
setInterval(function(){
	//login();
	
	
	//Se não estiver no Unsettled, coloca 
	//if(!$(':contains(Unsettled)').is('.mbl-MyBetsHeaderLhs_ButtonSelected ')) $(':contains(Unsettled)').click();
	//$(':contains(Unsettled)').click();
	myBetsList=[];
	
	$('.mbl-OpenBetItemLhs ').each(function(){  
		//Expande se nao estiver
		if( !$(this).is('.mbl-OpenBetItemLhs_DefaultExpanded') ) $(this).find('.mbl-OpenBetItemHeaderLhs ').click();
	
		//if ($(this).find('.myb-OpenBetItemInnerView').size()==0) $(this).click();
		
		myBetsList.push({
            home: $(this).find('.mbl-SoccerOpenBetParticipantLhs_HomeTeamName').text(),
			away: $(this).find('.mbl-SoccerOpenBetParticipantLhs_AwayTeamName').text()
		});

	});
	
	
	console.log(myBetsList);
	localStorage.myBetsList=JSON.stringify(myBetsList);
	localStorage.myBetsLastUpdate=(+new Date());
	
	
	
},1000);






//Reinicia a aba mybets a cada 3 minutos
setInterval(function(){
    location.reload();
},3*60*1000 );
	

	
	
	
});