

function login(){
	
	if(!$('.hm-MobileNavButtons').hasClass('hm-MobileNavButtons-loggedin')) {

		$('.hm-LoggedOutButtons_Login').click();
		$.waitFor('.lm-StandardLogin_Username',function(){
			$('.lm-StandardLogin_Username').val('gislene_cris');
			$('.lm-StandardLogin_Password').val('rr842135');
			$('.lm-Checkbox_Input').addClass('lm-Checkbox_Input-Checked');
			$('.lm-StandardLogin_LoginButton').click();
			
		});

	}

   
   
};


 