/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the provider detail page
 *
 * @author      TCSCODER
 * @version     1.0
 */

(function ($) {
  var technologyProvider = Api.getCache("technologyProvider");
  var id = Api.getQueryString("id");
  var isSelf = false;
  var offset = 0;
  var dataRole = $("body").attr("data-role");
  var errorMessage = '';
  var currentCountry = null;
  var currentState = null;
  var states = {};
  var statesMap = {};
  var countries = {};

  var tab = Api.getQueryString('tab');

  if (technologyProvider) {
    isSelf = !id || technologyProvider._id === id;
  }

  var updateStateAndCountry = function (tProvider) {
    var $countrieSelect2 = $('.countries-select2');
    /**
     * set countries
     */
    Api.getCountries(function (data) {
      currentCountry = data[ 0 ]._id;
      countries = {};
      $countrieSelect2.html('<option/>');
      for (var i = 0; i < data.length; i++) {
        countries[ data[ i ]._id ] = data[ i ];
        $countrieSelect2.append("<option value=\"" + data[i]._id + "\">" + data[i].value + "</option>");
      }
      if (tProvider.address && tProvider.address.countryObj && tProvider.address.countryObj._id) {
        currentCountry = tProvider.address.countryObj._id;
        $countrieSelect2.val(tProvider.address.countryObj._id).trigger('change');
      }

      Api.getStates(function (data) {
        statesMap = {};
        for (var i = 0; i < data.length; i++) {
          var item = statesMap[ data[ i ].country ] || [];
          item.push(data[ i ]);
          statesMap[ data[ i ].country ] = item;
        }
        updateStates(tProvider);
      });
    });
  };

  function updateStates(tProvider) {
    tProvider = tProvider || technologyProvider;
    var data = statesMap[ currentCountry ];
    if (!data || data.length <= 0) return;
    var $stateSelect2 = $('.states-select2');
    states = {};
    currentState = null;
    $stateSelect2.html('<option/>');
    for (var i = 0; i < data.length; i++) {
      states[ data[ i ]._id ] = data[ i ];
      $stateSelect2.append("<option value=\"" + data[i]._id + "\">" + data[i].value + "</option>");
    }
    if (tProvider.address && tProvider.address.stateObj && tProvider.address.stateObj._id) {
      currentState = tProvider.address.stateObj._id;
      $stateSelect2.val(tProvider.address.stateObj._id).trigger('change');
    }
  }

  /**
   * update provider info in UI
   * @param provider
   */
  var updateInfo = function (provider) {
    var getFullUrl = function (url) {
      if(url.toLowerCase().indexOf('http') === 0){
        return url;
      }
      return 'http://' + url;
    };
    updateStateAndCountry(provider);
    $("#description").html(Api.replaceEnter(provider.description));

    $("#locality").html(provider.address.locality);
    $("#street").html(provider.address.street + '');
    $("#country").html(provider.address.countryObj.value || 'N/A');
    $("#state").html(provider.address.stateObj.value || 'N/A');
    $("#zipCode").html(provider.address.postalCode);
    $("#phone").html(provider.contactInformation.phone);
    $("#customerServiceCommittment").html(provider.customerServiceCommittment || 'N/A');
    $("#yearInBusiness").html(provider.yearInBusiness || 'N/A');
    $("#productsOffered").html(provider.productsOffered || 'N/A');
    $("#servicesOffered").html(provider.servicesOffered || 'N/A');
    $("#certifications").html(provider.certifications || 'N/A');
    $("#additionalOffice").html(provider.additionalOffice || 'N/A');
    $("#website").html(provider.contactInformation.website);
    $("#website").attr("href", getFullUrl(provider.contactInformation.website));
    $(".provider-name").html(provider.name + (provider.freezed ? ' - (freezed)' : ''));
    if (provider.logoPath) {
      $(".provider-logo img").attr("src", provider.logoPath);
    }
    if (isSelf) {
      $('.edit-btn').show();
    } else {
      $('.upload-provider-img-container').hide();
      $('#tab-provider-setting').hide();
      $('li a[data-tab-target="#tab-provider-setting"]').hide();
    }
    $(".registered-on .date").html(moment(provider.createdOn).format("ll"));
  };


  /**
   * check the value is null or not
   * @param value the value
   * @param message the error message
   * @return {*}
   */
  var checkNull = function (value, message) {
    if (!value || value.length <= 0) {
      if (message) {
        errorMessage += message + '<br/>';
      }
    }
    return value;
  };

  /**
   * validate Email
   * @param email the email address
   */
  var validateEmail = function (email) {
    if (!Api.validateEmail(email)) {
      errorMessage += '- Email invalid. <br/>';
    }
  }

  /**
   * validate phone
   * @param phone the phone number
   */
  var validatePhoneNumber = function (phone) {
    if (!Api.validatePhoneNumber(phone)) {
      errorMessage += '- Phone Number invalid. <br/>';
    }
  };

  /**
   * update provider info
   */
  var updateProviderInfo = function () {
    errorMessage = '';
    var p = { address: {}, contactInformation: {}, description: '' };
    p.address.street = checkNull($('div[data-input="street"] input').val(), '- Street cannot be empty.');
    p.address.locality = checkNull($('div[data-input="locality"] input').val(), '- City cannot be empty.');

    p.address.countryObj = checkNull(currentCountry, '- Country cannot be empty.');
    p.address.stateObj = checkNull(currentState, '- State cannot be empty.');

    p.address.postalCode = checkNull($('div[data-input="postalCode"] input').val(), '- PostalCode cannot be empty.');
    p.contactInformation.email = checkNull($('div[data-input="email"] input').val(), '- Email cannot be empty.');
    validateEmail(p.contactInformation.email);
    p.contactInformation.website = checkNull($('div[data-input="website"] input').val(), '- Website cannot be empty.');
    p.contactInformation.phone = checkNull($('div[data-input="phone"] input').val(), '- Phone cannot be empty.');
    validatePhoneNumber(p.contactInformation.phone);

    p.name = checkNull($('div[data-input="name"] input').val(), 'Company name cannot be empty');
    p.yearInBusiness = checkNull($('div[data-input="yearInBusiness"] input').val());
    p.customerServiceCommittment = checkNull($('div[data-input="customerServiceCommittment"] textarea').val());
    p.productsOffered = checkNull($('div[data-input="productsOffered"] textarea').val());
    p.servicesOffered = checkNull($('div[data-input="servicesOffered"] textarea').val());
    p.certifications = checkNull($('div[data-input="certifications"] textarea').val());
    p.additionalOffice = checkNull($('div[data-input="additionalOffice"] textarea').val());
    p.description = checkNull($('div[data-input="description"] textarea').val());


    if (errorMessage.length > 0) {
      Api.showErrorToast(errorMessage);
      return;
    }

    Api.updateTechnologyProvider(id, p, function () {
      technologyProvider.address = p.address;
      technologyProvider.contactInformation = p.contactInformation;
      technologyProvider.description = p.description;
      technologyProvider.yearInBusiness = p.yearInBusiness;
      technologyProvider.productsOffered = p.productsOffered;
      technologyProvider.customerServiceCommittment = p.customerServiceCommittment;
      technologyProvider.certifications = p.certifications;
      technologyProvider.additionalOffice = p.additionalOffice;
      technologyProvider.servicesOffered = p.servicesOffered;
      technologyProvider.name = p.name;
      if (p.address.countryObj) {
        technologyProvider.address.countryObj = countries[ p.address.countryObj ];
      }
      if (p.address.stateObj) {
        technologyProvider.address.stateObj = states[ p.address.stateObj ];
      }


      Api.setCache('technologyProvider', technologyProvider);
      updateInfo(technologyProvider);
      $('.view-mode').show();
      $('.edit-mode').hide();
      $('body,html').animate({ scrollTop: 120 }, 200);
      Api.showSuccessToast('provider information update succeed.');
    }, function (err) {
      Api.showErrorToast(Api.getErrorMessage(err));
    })
  };


  if (id) {
    Api.getTechnologyProvider(id, function (tProvider) {
      updateInfo(tProvider);
    }, function (err) {
      Api.showErrorToast(Api.getErrorMessage(err));
      $(".tabs").html("");
      $(".tabs").append("<br/><br/><br/><h1>404, TechnologyProvider not exist.</h1><br/><br/><br/>");
    });
  } else {
    id = technologyProvider._id;
    updateInfo(technologyProvider);
  }


  /**
   * fetch posts
   * @param clear clear list if clear is true
   * @param action what trigger post update
   */
  var fetchPosts = function (clear, action) {

    var query = window.getPostFilterValues();
    query.technologyProviderId = id;
    if (Api.updateOffsetAndLimitByAction(offset, query, clear, action)) {
      offset = query.offset;
    }
    if (isSelf) {
      query.statuses = JSON.stringify(['draft','published','scheduled']);
    }

    Api.getPosts(query, function (rsp) {
      var posts = rsp.items;
      if (clear) {
        $(".content-feed-list").html("");
      }
      Api.hideOrShowMoreBtn(rsp.totalCount, query.offset, query.limit, $(".btn-load-more"));
      for (var i = 0; i < posts.length; i += 1) {
        $(".content-feed-list").append(Api.getProviderPostHtml(posts[ i ], dataRole));
      }
    });
  };

  window.fetchPosts = fetchPosts;
  $(".btn-load-more").click(function () {
    offset += Api.defaultLimit;
    fetchPosts(false);
  });

  $('.edit-btn').click(function () {
    var provider = technologyProvider;
    $('.view-mode').hide();
    $('.edit-mode').show();
    $('div[data-input="name"] input').val(provider.name);
    $('div[data-input="yearInBusiness"] input').val(provider.yearInBusiness);
    $('div[data-input="street"] input').val(provider.address.street);
    $('div[data-input="locality"] input').val(provider.address.locality);


    if (provider.address && provider.address.countryObj && provider.address.countryObj._id) {
      currentState = provider.address.countryObj._id;
      $('.countries-select2').val(provider.address.countryObj._id).trigger('change');
    }
    if (provider.address && provider.address.stateObj && provider.address.stateObj._id) {
      currentState = provider.address.stateObj._id;
      $('.states-select2').val(provider.address.stateObj._id).trigger('change');
    }

    $('div[data-input="postalCode"] input').val(provider.address.postalCode);
    $('div[data-input="email"] input').val(provider.contactInformation.email);
    $('div[data-input="website"] input').val(provider.contactInformation.website);
    $('div[data-input="phone"] input').val(provider.contactInformation.phone);
    $('div[data-input="customerServiceCommittment"] textarea').val(provider.customerServiceCommittment);
    $('div[data-input="productsOffered"] textarea').val(provider.productsOffered);
    $('div[data-input="servicesOffered"] textarea').val(provider.servicesOffered);
    $('div[data-input="certifications"] textarea').val(provider.certifications);
    $('div[data-input="additionalOffice"] textarea').val(provider.additionalOffice);
    $('div[data-input="description"] textarea').val(provider.description);
  });

  $('.btn-upload-provider').click(function () {
    $('.upload-provider-img').trigger('click');
  });

  // upload image
  $('.upload-provider-img').change(function () {
    var files = $(this)[ 0 ].files;
    if (files.length <= 0) {
      return;
    }
    var file = files[ 0 ];
    if (file) {
      var img = new Image();
      img.src = window.URL.createObjectURL(file);
      img.onload = function () {
        uploadProviderImage(file);
      }
    }
  });

  var uploadProviderImage = function (file) {
    Api.uploadImage('/technologyProviders/' + technologyProvider._id + '/upload', file, function (data) {
      Api.setCache('technologyProvider', data);
      technologyProvider = data;
      if (data.logoPath) {
        $(".provider-logo img").attr("src", data.logoPath);
      }
    }, function (err) {
      Api.showErrorToast(Api.getErrorMessage(err));
    });
  };


  $('.btn-save').click(function () {
    updateProviderInfo();
  });

  $('.btn-cancel').click(function () {
    $('.view-mode').show();
    $('.edit-mode').hide();
    $('body,html').animate({ scrollTop: 120 }, 200);
  });


  Api.getgetTechnologyProviderStatistics(id, function (data) {
    $(".number-of-posts").html(data.numberOfPosts);
    $(".short-txt").html(Api.numberToKString(data.totalReadingTime, true));
    $(".long-txt").html(Api.numberToKString(data.totalReadingTime));

  });

  window.postFilterOnLoad = function () {
    $('.filter-input').addClass('display-none');
    $('a[data-id="createdBy"]').parent().addClass('display-none');
    $(".search-filter-sort-row-wrapper .container").removeClass("container");

    if (tab) {
      $('a[data-tab-target="#' + tab + '"]').trigger('click');
    }
  };

  fetchPosts(true);
  $('.countries-select2').select2({ placeholder: 'County*' });
  $('.states-select2').select2({ placeholder: 'State*' });
  $('.countries-select2').on("select2:select", function (e) {
    currentCountry = e.params.data.id;
    updateStates();
  });
  $('.states-select2').on("select2:select", function (e) { currentState = e.params.data.id; });

  $('.btn-change-password').click(function () {
    var currentPassword = $("input[name='current-password']").val();
    var newPassword = $("input[name='new-password']").val();
    var confrimPassword = $("input[name='confirm-new-password']").val();
    if (currentPassword.length === 0 || newPassword.length === 0 || newPassword !== confrimPassword) {
      Api.showErrorToast('current password cannot be blank or new password must equal confrim password.');
    } else if (newPassword === currentPassword) {
      Api.showErrorToast('new password cannot equal old password.');
    } else {
      Api.updatePassword(currentPassword, newPassword, function () {
        Api.showSuccessToast('update password succeed!');
      }, function (err) {
        Api.showErrorToast(Api.getErrorMessage(err));
      })
    }
  });

  $('.website-link').click(function () {
    Api.onWebsiteClick(id, function () {

    }, function () {

    });
  });
})(jQuery);
