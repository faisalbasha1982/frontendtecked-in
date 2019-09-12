/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the forgot password page
 *
 * @author      TCSCODER
 * @version     1.0
 */


(function ($) {
  var step = 1;
  var forgotEmail = '';


  /**
   * goto step 2, send reset password request
   */
  var gotoResetPassword = function () {
    $('.step-1').hide();
    $('.step-2').show();
  };

  /**
   * goto step1 , send email to user
   */
  var gotoForgotPassword = function () {
    $('.step-1').show();
    $('.step-2').hide();
  };

  $('#send-fpt-btn').click(function () {
    var email = $('input[name="email"]').val();

    var errorMessage = '';
    if (!email || email.length <= 0) {
      errorMessage = '- Email cannot be emplty. <br/>';
    }
    if (!Api.validateEmail(email)) {
      errorMessage = '- Email invalid. <br/>';
    }
    if (errorMessage.length > 0) {
      Api.showErrorToast(errorMessage);
      return;
    }
    forgotEmail = email;
    Api.initiateForgotPassword(email, function () {
      Api.showSuccessToast('Forgot password email send succeed, please check it.');
      gotoResetPassword();
    }, function (err) {
      Api.showErrorToast(Api.getErrorMessage(err));
    });
  });

  $('.resend').click(function () {
    gotoForgotPassword();
  });

  $('#reset-password-btn').click(function () {
    var errorMessage = '';
    var checkNull = function (value, message) {
      if (!value || value.length <= 0) {
        errorMessage += message + '<br/>';
      }
      return value;
    };


    var forgotPasswordToken = checkNull($('input[name="token"]').val(), '- Token cannot be empty.');
    var newPassword = checkNull($('input[name="new-password"]').val(), '- new password cannot be empty.');
    var confrimPassword = checkNull($('input[name="confirm-password"]').val(), '- confirm password cannot be empty.');

    if (newPassword !== confrimPassword) {
      errorMessage += '- newPassword must equal confirmPassword. <br/>';
    }
    if (errorMessage.length > 0) {
      Api.showErrorToast(errorMessage);
      return;
    }

    Api.changeForgotPassword({  // reset password
      email: forgotEmail,
      forgotPasswordToken: forgotPasswordToken,
      newPassword: newPassword
    }, function () {
      Api.showSuccessToast('password reset succeed');
      setTimeout(function () {
        window.location.href = "login.html";
      }, 1000);
    }, function (err) {
      Api.showErrorToast(Api.getErrorMessage(err));
    })

  });

  gotoForgotPassword();
})(jQuery);



