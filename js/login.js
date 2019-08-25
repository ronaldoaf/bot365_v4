

function login(){
	
	if(!$('.hm-MobileNavButtons').hasClass('hm-MobileNavButtons-loggedin')) {

		$('.hm-LoggedOutButtons_Login').click();
		$.waitFor('.lm-StandardLogin_Username',function(){
			$('.lm-StandardLogin_Username').val(localStorage['usuario_bet365']);
			$('.lm-StandardLogin_Password').val(localStorage['senha_bet365']);
			$('.lm-Checkbox_Input').addClass('lm-Checkbox_Input-Checked');
			$('.lm-StandardLogin_LoginButton').click();
			
		});

	}

   
   
};


 