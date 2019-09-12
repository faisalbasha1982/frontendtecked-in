/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */
/**
 * the singup page
 *
 * @author      TCSCODER
 * @version     1.0
 */



(function ($) {
  var errorMessage = '';
  var currentUserType = "tech-user"; // default selected user
  var onStep = 1; // default step
  var techUser = {};
  var techProvider = {};
  var currentCountry = null;
  var currentState = null;
  var tmpAuthObj = {};
  var states = {};
  var win = null;
  var checkSocialTimer = null;
  /**
   * check the value is null or not
   * @param value the value
   * @param message the error message
   * @return {*}
   */
  var checkNull = function (value, message) {
    if (!value || value.length <= 0) {
      errorMessage += message + '<br/>';
    }
    return value;
  };
  /**
   * validate Email
   * @param email the email address
   */
  var validateEmail = function (email) {
    if (!Api.validateEmail(email)) {
      errorMessage += '- Email invalid <br/>';
    }
  }
  var validatePhoneNumber = function (phone) {
    if (!Api.validatePhoneNumber(phone)) {
      errorMessage += '- Phone Number invalid <br/>';
    }
  }
  /**
   * check two values equal or not
   * @param value1 the first value
   * @param value2 the second value
   * @param message the error message
   */
  var checkEqual = function (value1, value2, message) {
    if (value1 !== value2) {
      errorMessage += message + '<br/>';
    }
  }
  /**
   * sign up , create account
   * @param scb the callback when request end
   */
  var signup = function (scb) {
    errorMessage = '';
    var password = $('input[name="password"]').val();
    var confirmPassword = $('input[name="confirm-password"]').val();
    var user = {};
    user.email = checkNull($('input[name="email"]').val(), '- Email is Required');
    checkNull(password, '- Password is Required');
    user.password = checkNull(confirmPassword, '- Confirm password is Required');
    validateEmail(user.email);
    checkEqual(password, confirmPassword, '- Confirm password invalid');

    if (currentUserType === "tech-user") {
      techUser.firstName = '　';
      techUser.lastName = '　';
      techUser.country = checkNull(currentCountry, '- Country is Required');
      techUser.state = checkNull(currentState, '- State is Required');
    }

    if (errorMessage.length > 0) {
      Api.showErrorToast(errorMessage);
    } else {
      Api.signup(user.email, user.username, user.password, function (data) {
        tmpAuthObj = data;
        var msg = 'Create account succeed, email has been send your mailbox, please check your verification email.';
        if (currentUserType === "tech-user") { // create tech user directly
          techUserRegister(function () {
            $('.fav-category-checkbox').prop('checked', false);
            scb(); // tech user created succeed
            Api.showSuccessToast(msg, 8 * 1000);
          });
        } else {
          Api.showSuccessToast(msg, 10 * 1000);
          scb();
        }
      }, function (err) {
        Api.showErrorToast(Api.getErrorMessage(err));
      });
    }
  };
  /**
   * the step 2 info check
   * @param scb the callback when succeed
   */
  var personOrProviderInfo = function (scb) {
    errorMessage = '';
    if (currentUserType === "tech-user") {

    } else {
      techProvider = { address: {}, contactInformation: {} };
      techProvider.name = checkNull($('input[name="provider-name"]').val(), '- Provider Name is Required');
      techProvider.address.street = checkNull($('input[name="street"]').val(), '- Address is Required');
      techProvider.address.postalCode = checkNull($('input[name="postalCode"]').val(), '- PostalCode is Required');
      techProvider.address.countryObj = checkNull(currentCountry, '- Country is Required');
      techProvider.address.stateObj = checkNull(currentState, '- State is Required');
      techProvider.address.locality = checkNull($('input[name="locality"]').val(), '- City is Required');
      techProvider.contactInformation.phone = checkNull($('input[name="phone"]').val(), '- Phone is Required');
      validatePhoneNumber(techProvider.contactInformation.phone);
      techProvider.contactInformation.email = tmpAuthObj.email;
      techProvider.contactInformation.website = checkNull($('input[name="website"]').val(), '- Website is Required');
      techProvider.description = checkNull($('textarea[name="provider-description"]').val(), '- Description is Required');
    }
    if (errorMessage.length > 0) {
      Api.showErrorToast(errorMessage);
    } else {
      scb();
    }
  };
  /**
   * create tech user
   * @param scb the callback when succeed
   */
  var techUserRegister = function (scb) {
    var categories = [];
    $('input:checked').each(function () {
      var cid = $(this).attr('data-id');
      if (cid) {
        categories.push(cid);
      }
    });
    if (categories.length <= 0) {
      Api.showErrorToast("Please select at least one technology interest.");
      return;
    }
    Api.request('POST', '/technologyUsers', Api.getHeaders(true, tmpAuthObj.accessToken), techUser, function (data) {
      techUser = data;
      updateTechUserCategories(techUser._id, scb);
    }, function (err) {
      Api.showErrorToast(Api.getErrorMessage(err));
    });
  };

  var updateTechUserCategories = function (techUserId, scb) {
    var categories = [];
    $('input:checked').each(function () {
      var cid = $(this).attr('data-id');
      if (cid) {
        categories.push(cid);
      }
    });
    if (categories.length <= 0) {
      Api.showErrorToast("Please select at least one technology interest.");
      return;
    }
    var createRequestNumber = 0;
    for (var i = 0; i < categories.length; i++) {
      Api.request('POST', '/favouriteCategories', Api.getHeaders(true, tmpAuthObj.accessToken), {
        category: categories[i],
        user: techUserId
      }, function () {
        createRequestNumber += 1;
        if (createRequestNumber >= categories.length) {
          scb();
        }
      });
    }
  };
  var uploadImage = function (id, token, cb) {
    var images = $('.input-file-select');
    if (images && images[ 0 ].files.length > 0) {
      Api.uploadImage('/technologyProviders/' + id + '/upload', images[ 0 ].files[ 0 ], function () {
        Api.showSuccessToast('provider image upload succeed');
        cb();
      }, function () {
        cb();
      }, token);
    } else {
      cb();
    }
  }
  /**
   * create tech provider
   * @param scb the callback when succeed
   */
  var techProviderRegister = function (scb) {
    Api.request('POST', '/technologyProviders', Api.getHeaders(true, tmpAuthObj.accessToken), techProvider, function (provider) {
      Api.showSuccessToast('Technology Provider create succeed!');
      uploadImage(provider._id, tmpAuthObj.accessToken, function () {
        setTimeout(function () {
          scb();
        }, 2000);
      });
    }, function (err) {
      Api.showErrorToast(Api.getErrorMessage(err));
    });
  };
  /******* signup page functions *******/
  $.fn.initSignupPage = function () {
    var signupForm = $(this).find(".signup-form");
    var signupStepsWrapper = signupForm.find(".signup-steps-wrapper");
    var updateStep2 = function () {
      $('.techUser-step2-input').css('display', currentUserType === "tech-provider" ? 'none' : '');
      $('.techProvider-step2-input').css('display', currentUserType === "tech-provider" ? '' : 'none');
    };
    $('.techProvider-step2-input').css('display', 'none');
    $('.input-file-select').on("change", function () {
      if ($(this)[ 0 ].files.length <= 0) {
        $('input[name="attachment-name"]').val('');
      } else {
        $('input[name="attachment-name"]').val($(this)[ 0 ].files[ 0 ].name);
      }
    });
    // change currentuser trying to signup
    signupForm.on("change", ".radio-login-user-type input[type=radio]", function () {
      currentUserType = $(this).attr("value");
      signupForm.find(".signup-steps-wrapper").attr("data-user-type", currentUserType);
      $('div[data-step="2"] .step-title,#step2-title')
        .html(currentUserType === 'tech-provider' ? 'Provider Info' : 'Technology Interests');
      // change right button text if the new user is tech-user and was on step 2
      if (onStep === 2) {
        if (currentUserType === "tech-provider") {
          signupForm.find(".buttons-row .btn-right span").text("Register");
        }
        else {
          signupForm.find(".buttons-row .btn-right span").text("Complete");
        }
      }
      // change right button text and go to step 2 if the new user is tech-provider and was on step 3
      if (currentUserType === "tech-provider" && onStep === 3) {
        stepBack();
        signupForm.find(".buttons-row .btn-left").css('visibility', 'hidden');
        signupForm.find(".buttons-row .btn-right span").text("Register");
      }
      updateStep2();
    });
    // show current in progress steps content
    var showCurrentStepContent = function () {
      signupStepsWrapper.find(".signup-steps-content [data-step]").hide();
      signupStepsWrapper.find(".signup-steps-content [data-step=" + onStep + "]").show();
    };
    // go one step back
    var stepBack = function () {
      onStep--;
      // update step progress
      signupStepsWrapper.find(".signup-steps-progress .in-progress")
        .removeClass("in-progress")
        .prev().toggleClass("is-complete in-progress");
      // show new step content
      showCurrentStepContent();
    };
    // go one step forward
    var stepForward = function () {
      onStep++;
      // update step progress
      signupStepsWrapper.find(".signup-steps-progress .in-progress")
        .toggleClass("in-progress is-complete")
        .next().addClass("in-progress");
      // show new step content
      showCurrentStepContent();
    };
    // on click left button
    signupForm.on("click", ".buttons-row .btn-left", function () {
      switch (onStep) {
        case 1:
          window.location.href = "home.html";
          break;
        case 2:
          stepBack();
          $(this).find("span").text("Cancel");
          $(this).siblings(".btn-left").css('visibility', 'hidden');
          break;
        case 3:
          $(this).css('visibility', 'hidden');
        default:
          stepBack();
          $(this).siblings(".btn-right").find("span").text("Next");
      }
    });

    var loginSucceed = function () {
      var that = $('.buttons-row .btn-right');
      stepForward();
      that.siblings(".btn-left").css('visibility', 'hidden');
      if (currentUserType === "tech-provider") {
        that.find("span").text("Register");
      }
      $('input[name="user-type"]').attr('disabled', 'true');
    };

    // on click right button
    signupForm.on("click", ".buttons-row .btn-right", function () {
      var that = $(this);
      if (onStep > 1) {
        that.siblings(".btn-left").find("span").text("Previous");
      }
      switch (onStep) {
        case 1: // create user
          signup(function () {
            loginSucceed();
            if (currentUserType === "tech-user") {
              that.find("span").text("Complete");
            }
          });
          break;
        case 2:
          if (currentUserType === "tech-user") {
            personOrProviderInfo(function () {
              Api.request('DELETE', '/favouriteCategories?userId=' + techUser._id, Api.getHeaders(true, tmpAuthObj.accessToken), {}, function () {
                updateTechUserCategories(techUser._id, function () {
                  Api.showSuccessToast("Technology User create succeed!");
                  setTimeout(function () {
                    window.location.href = "login.html";
                  }, 2000)
                });
              }, function (err) {
                Api.showErrorToast(Api.getErrorMessage(err));
              });
            });
          } else {
            personOrProviderInfo(function () {
              techProviderRegister(function () {
                window.location.href = "home.html";
              });
            });
          }
          break;
        case 3:
          break;
      }
    });

    var doCheckSocailLogin = function () {
      var socalLogin = Api.getCache("social-login");
      if (socalLogin) {
        tmpAuthObj = Api.getCache(Api.AUTHOBJ_KEY);
        var firstName = '';
        var lastName = '';
        if (tmpAuthObj.facebookAuth) {
          firstName = tmpAuthObj.facebookAuth.firstName || '';
          lastName = tmpAuthObj.facebookAuth.lastName || '';
        } else if (tmpAuthObj.googleAuth) {
          firstName = tmpAuthObj.googleAuth.firstName || '';
          lastName = tmpAuthObj.googleAuth.lastName || '';
        }
        $('input[name="first-name"]').val(firstName);
        $('input[name="last-name"]').val(lastName);
        loginSucceed();
        Api.setCache("social-login", false);
      }
    };

    function openInNewTab(url) {
      Api.setCache('social-from', 'singup');
      win = window.open(url, '_blank');
      win.focus();
    }

    $('.facebook').click(function () {
      openInNewTab(Api.BACKEND_HOST + '/auth/facebook');
    });

    $('.google').click(function () {
      openInNewTab(Api.BACKEND_HOST + '/auth/google');
    });

    doCheckSocailLogin();

    function socalLoginSuccess() {
      clearInterval(checkSocialTimer);
      var authObj = Api.getCache(Api.AUTHOBJ_KEY);
      if (win) {
        win.close();
      }
      if (authObj.entityId) { // to register
        Api.showErrorToast("user already complete sing up, cannot sing up again");
      } else {
        doCheckSocailLogin();
      }
    }

    checkSocialTimer = setInterval(function () {
      var login = Api.getCache("social-login");
      var authObj = Api.getCache(Api.AUTHOBJ_KEY);
      if (login && authObj) {
        socalLoginSuccess();
      }
    }, 500); // 500ms check
  };

  Api.getCategories(function (data) {
    for (var i = 0; i < data.length; i += 1) {
      $(".tech-interests-list").append(
        '<li><label class="checkbox"><input class="fav-category-checkbox" checked data-id="' +
        data[ i ]._id + '" id="my-fav-category-' +
        data[ i ]._id + '" type="checkbox"/>' +
        '<span class="icon-checkbox"><span class="icons icon-tick"></span></span><span class="checkbox-label">' +
        data[ i ].name + '</span><span class="icon-category ' + data[ i ].iconPath + '"></span>' +
        '</label></li>'
      );
    }
  });
  var $countries = $('.countries-select2');
  var $states = $('.states-select2');
  $countries.select2({ placeholder: 'Country *', });
  $states.select2({ placeholder: 'State *', });

  $countries.on("select2:select", function (e) {
    currentCountry = e.params.data.id;
    updateStates()
  });

  $states.on("select2:select", function (e) { currentState = e.params.data.id; });
  /**
   * set countries
   */
  Api.getCountries(function (data) {
    for (var i = 0; i < data.length; i++) {
      $countries.append(
        '<option value="' + data[ i ]._id + '">' + data[ i ].value + "</option>"
      );
    }
    $countries.val(data[ 0 ]._id);
    currentCountry = data[ 0 ]._id;
    currentCountry = data[ 0 ]._id;
    Api.getStates(function (data) {
      for (var i = 0; i < data.length; i++) {
        var item = states[ data[ i ].country ] || [];
        item.push(data[ i ]);
        states[ data[ i ].country ] = item;
      }
      updateStates();
    });
  });

  function updateStates() {
    var stateArr = states[ currentCountry ];
    if (!stateArr || stateArr.length <= 0) return;
    currentState = null;
    $states.html('<option></option>');
    for (var i = 0; i < stateArr.length; i += 1) {
      $states.append(
        '<option value="' + stateArr[ i ]._id + '">' + stateArr[ i ].value + "</option>"
      );
    }
  }

  $("body").initSignupPage();
})
(jQuery);


