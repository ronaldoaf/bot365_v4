

function login(){
	
   if ( $('.hm-LoginPrompt_Fail').css('display')=='block' ){
      //Falha no Login
   }else{
      if($('.mmhdr-UserInfo_UserName').text()==''){
         $('.hm-HeaderLinkLogin_Launcher').click();
         $('#PopUp_UserName').val(localStorage['usuario_bet365']);
         $('#PopUp_Password').val(localStorage['senha_bet365']);
         $('#PopUp_KML').val('on');
         $('#LogInPopUpBttn').click();
      }
   }
   
   $('.pcm-OfferPasscodeDialog .pcm-GreyFullButton').each(function(){ $(this).click() } );
   
   
};


 