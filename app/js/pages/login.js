/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the login page script
 *
 * @author      TCSCODER
 * @version     1.0
 */


(function ($) {
  $.fn.initLoginPage = function () {
    var checkSocialTimer = null;

    var loginForm = $(this).find(".login-form");

    function loginFailed(message) {
      $(".error-message").html(message);
      $('#resend-verification-code').unbind('click').click(function () {
        resendVerificationCode();
      });
      loginForm.addClass("login-error");
    }

    function resendVerificationCode() {
      var username = loginForm.find(".input-username").val();
      Api.sendVerificationEmail(username.trim(), function () {
        Api.showSuccessToast('verification email has been send to your email box, please check.');
      }, function () {
        Api.showErrorToast('send verification email failed, please contact admin.');
      })
    }


    var notVerified = 'your email is not verified, try to <a href="javascript:;" id="resend-verification-code">resend the verification email.</a>';
    var loginSuccess = function (authObj) {
      if (!authObj.verified) {
        loginFailed(notVerified);
      } else {
        // var nextUrl = Api.getQueryString("next");
        var destUrl = (authObj.type === "technologyUser" ? "dashboard_user.html" : "dashboard_provider.html");
        if (authObj.type === "technologyUser") {
          Api.getTechnologyUser(authObj.entityId, function (tUser) {
            Api.setCache("technologyUser", tUser);
            Api.setCache("technologyProvider", null);
            window.location.href = destUrl;
          }, function () {
            loginFailed("TechnologyUser not exist!");
          });
        } else if (authObj.type === "technologyProvider") {
          Api.getTechnologyProvider(authObj.entityId, function (tUser) {
            if (tUser.freezed) {
              loginFailed('your account already freezed, please contact admin for help.')
              return;
            }
            Api.setCache("technologyProvider", tUser);
            Api.setCache("technologyUser", null);
            window.location.href = destUrl;
          }, function () {
            loginFailed("TechnologyProvider not exist!");
          });
        } else if (authObj.type === "admin") {
          window.location.href = 'dashboard_admin.html';
        }
      }
    };
    // click login button
    loginForm.on("click", ".btn-login", function () {
      var username = loginForm.find(".input-username").val();
      var password = loginForm.find(".input-password").val();
      /**
       * send login request to backend
       */
      Api.login(username, password, function (authObj) {loginSuccess(authObj)},
        function (err) {
          loginFailed(err.status === 403 ? notVerified : "Incorrect username or password!");
        });
    });

    // remove error message when user starts typing again
    loginForm.on("keydown", ".user-input input", function () {
      loginForm.removeClass("login-error");
    });

    var win = null;

    function openInNewTab(url) {
      Api.setCache('social-from', 'login');
      win = window.open(url, '_blank');
      win.focus();
    }

    $('.facebook').click(function () {
      openInNewTab(Api.BACKEND_HOST + '/auth/facebook');
    });
    $('.google').click(function () {
      openInNewTab(Api.BACKEND_HOST + '/auth/google');
    });

    function socalLoginSuccess() {
      clearInterval(checkSocialTimer);
      var authObj = Api.getCache(Api.AUTHOBJ_KEY);
      if (!authObj.entityId) { // to register
        if (win) {
          win.close();
        }
        window.location = "signup.html"
      } else {
        loginSuccess(authObj);
        if (win) {
          Api.setCache("social-login", false);
          win.close();
        }
      }
    }

    checkSocialTimer = setInterval(function () {
      var login = Api.getCache("social-login");
      var authObj = Api.getCache(Api.AUTHOBJ_KEY);
      if (login && authObj) {
        socalLoginSuccess();
      }
    }, 1000); // 500ms check
  };

})(jQuery);

$("body").initLoginPage();
