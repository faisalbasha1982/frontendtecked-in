/**
 * Copyright (C) 2018 TopCoder Inc., All Rights Reserved.
 */

/**
 * the social login page
 *
 * @author      TCSCODER
 * @version     1.0
 */


(function ($) {
  
  let error = Api.getQueryString('error');
  let token = Api.getQueryString('accessToken');
  let email = Api.getQueryString('email');
  
  if (error) {
    if (error === 'exists') {
      $('.tip').html('Our apologies, we are unable to find your facebook information in our database. However, a user with email ' + email + ' already exists. So please use that login to sign in. If you forgot your password, please click on the <a href="forgot_password.html">"forgot password"</a>  button. Thank you.');
    } else {
      $('.tip').html(error);
    }
  } else {
    Api.setCache(Api.AUTHOBJ_KEY, { accessToken: token });
    Api.getCurrent(function () {
      Api.setCache('social-login', true);
    }, function (err) {
      $('.tip').html(Api.getErrorMessage(err));
    })
  }
})(jQuery);
