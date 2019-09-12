/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */
/**
 * provider dashboard page
 *
 * @author      TCSCODER
 * @version     1.0
 */


(function ($) {
  Api.needLogin();
  var expiresDays = 0.01;
  var currentTabName = "#tab-manager";
  var providersMap = {};
  $(".tabs-title a").click(function () {
    currentTabName = $(this).attr("data-tab-target");
    if (currentTabName === '#tab-manager') {
      fetchProviderToManager();
    }
  });

  /**
   * fetch manager user
   */
  var fetchProviderToManager = function () {
    var query = window.getPostFilterValues();
    Api.searchTechnologyProvider(query, function (providers) {
      var body = $('.provider-table-body');
      if (providers.length > 0) $('.provider-table .no-records').addClass('display-none');
      body.html('');
      for (var i = 0; i < providers.length; i += 1) {
        var p = providers[ i ];
        body.append(getProviderRowItem(p));
        providersMap[ p._id ] = p;
      }

      $('.delete-provider').each(function () {
        $(this).unbind('click').click(function () {
          deleteProvider($(this).attr('data-id'));
        });
      });

      $('.freeze-provider').each(function () {
        $(this).unbind('click').click(function () {
          freezeOrUnfreezeProvider($(this).attr('data-id'));
        });
      });
    });
  };

  var deleteProvider = function (providerId) {
    var provider = providersMap[ providerId ];
    if (!provider) return;
    var body = $('.provider-table-body');
    var leftDays = getLeftDay(provider.freezedAt);
    console.log(leftDays, provider.freezed, !provider.freezed || leftDays < expiresDays);
    if ((!provider.freezed || leftDays <= expiresDays) && false) {
      swal({
        text: 'Admin only can delete provider that alreay freezed and freeze days > ' + expiresDays,
        type: 'error',
      })
    } else {
      swal({
        title: 'Are you sure?',
        text: 'All things about this provider will be deleted, and you will not be able to recover these!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then(function (result) {
        if (result.value) {
          Api.deleteTechnologyProvider(providerId, function () {
            $(".row[data-id=\"" + providerId + "\"]").remove();
            if (body.children().length === 0) {
              $('.provider-table .no-records').removeClass('display-none');
            }
            Api.showSuccessToast('provider delete succeed');
          }, function (err) {
            Api.showErrorToast(Api.getErrorMessage(err));
          });
        }
      })
    }
  };
  var freezeOrUnfreezeProvider = function (providerId) {
    var provider = providersMap[ providerId ];
    if (!provider) return;
    var ele = $(".freeze-provider[data-id=\"" + providerId + "\"]");
    var eleRoot = $(".row[data-id=\"" + providerId + "\"]");
    if (!provider.freezed) {
      var leftDays = getLeftDay(provider.user.lastLoginAt);
      if (leftDays <= expiresDays && false) {
        swal({
          text: 'Admin only can freeze provider that offline days > ' + expiresDays,
          type: 'error',
        })
      } else {
        swal({
          title: 'Are you sure?',
          text: 'freeze this provider,all things about this provider will be hidden in teckedin !',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, freeze it!',
          cancelButtonText: 'No, keep it'
        }).then(function (result) {
          if (result.value) {
            Api.updateTechnologyProvider(providerId, { freezed: true }, function () {
              provider.freezed = true;
              provider.freezedAt = new Date();
              eleRoot.find('.freezed').html('true');
              eleRoot.find('.freezed-days').html('0.00');
              ele.html('unfreeze');
              Api.showSuccessToast('provider freezed succeed.')
            }, function (err) {
              Api.showErrorToast(Api.getErrorMessage(err));
            });
          }
        })
      }
    } else {
      swal({
        title: 'Are you sure?',
        text: 'unfreeze this provider, all things about this provider will be display in teckedin !',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, unfreeze it!',
        cancelButtonText: 'No, keep it'
      }).then(function (result) {
        if (result.value) {

          Api.updateTechnologyProvider(providerId, { freezed: false }, function () {
            provider.freezed = false;
            provider.freezedAt = null;
            eleRoot.find('.freezed').html('false');
            eleRoot.find('.freezed-days').html('N/A');
            ele.html('freeze');
            Api.showSuccessToast('provider unfreeze succeed.')
          }, function (err) {
            Api.showErrorToast(Api.getErrorMessage(err));
          });

        }
      })
    }
  };


  window.fetchPosts = fetchProviderToManager;
  window.postFilterOnLoad = function () {
    $('.filter-input').addClass('display-none');
    $("a[data-id='articleLength']").parent().addClass('display-none');
    $("a[data-id='readingTime']").parent().addClass('display-none');
    $("a[data-id='createdBy']").parent().addClass('display-none');
    $("a[data-id='title']").parent().addClass('display-none');
    $("a[data-id='publishedOn']").parent().addClass('display-none');

    window.addSortItem("email", "Email");
    window.addSortItem("name", "Provider Name");
    window.setDefaultSort('email');
    window.restoreURLToFilter();
    var root = $('#tab-manager');
    root.find('.post-filter-panel').addClass('display-none');
    $('.show-dropdown-wrapper').show();
    root.find('#post-filter-search').attr('placeholder','Search Tech. provider by name or email');
    $('.tabs-title a[data-tab-target="#tab-manager"]').trigger('click');
  };

  /**
   * deep find value by path
   * @param obj the obj
   * @param path the path
   */
  var deepFind = function (obj, path) {
    var paths = path.split('.')
      , current = obj
      , i;

    for (i = 0; i < paths.length; ++i) {
      if (current[ paths[ i ] ] == undefined) {
        return undefined;
      } else {
        current = current[ paths[ i ] ];
      }
    }
    return current;
  };

  var getLeftDay = function (t) {
    if (!t) return -1;
    var today = new Date();
    var date_to_reply = new Date(t);
    var timeinmilisec = today.getTime() - date_to_reply.getTime();
    return timeinmilisec / (1000 * 60 * 60 * 24);
  };

  var getDateString = function (t) {
    if (!t) return 'N/A';
    return moment(t).format('ll HH:MM');
  };

  var getProviderRowItem = function getProviderRowItem(provider) {
    var loginDays = getLeftDay(provider.user.lastLoginAt);
    var freezeDays = getLeftDay(provider.freezedAt);
    return "<div class=\"row\" data-id=\"" + provider._id + "\">" +
      "<div class=\"item flex1\">" + provider.name + "</div>" +
      "<div class=\"item flex1\">" + (deepFind(provider, 'contactInformation.email') || 'N/A') + "</div>" +
      "<div class=\"item flex0-5\">" + (loginDays < 0 ? 'N/A' : loginDays.toFixed(2)) + "</div>" +
      "<div class=\"item flex0-5 freezed\">" + provider.freezed + "</div>" +
      "<div class=\"item flex0-5 freezed-days\">" + (freezeDays < 0 ? 'N/A' : freezeDays.toFixed(2)) + "</div>" +
      "<div class=\"item flex1\">  <a href=\"javascript:;\" class=\"freeze-provider\" data-id=\"" + provider._id + "\">\n" + (provider.freezed ? 'unfreeze' : 'freeze') + "</a> /  <a href=\"javascript:;\" class=\"delete-provider\" data-id=\"" + provider._id + "\">delete</a></div>" +
      "</div>";
  };
})(jQuery);
