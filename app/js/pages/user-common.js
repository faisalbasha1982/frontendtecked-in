/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the technologyUser dashboard common script
 * use ajax load into html dom
 * include header
 * @author      TCSCODER
 * @version     1.0
 */


(function ($) {

  Api.needLogin();
  var technologyUser = Api.getCache('technologyUser');
  var authObj = Api.getCache(Api.AUTHOBJ_KEY);

  /**
   * insert mobile header to pages
   */
  $('body').prepend('<div id="aside-menu"></div>');
  $('#aside-menu').load('/templates/user-aside-menu.html', function () {
    // initialize nav-side-panel and its functions depending on browser size
  });

  var getName = function () {
    console.log(authObj, technologyUser);
    if (!technologyUser.firstName || !technologyUser.lastName
      || technologyUser.firstName === '　'
      || technologyUser.lastName === '　')
    {
      return authObj.email.split("@")[0];
    }
    return technologyUser.firstName + ' ' + technologyUser.lastName;
  }

  /**
   * insert header to pages
   */
  $('.page-wrapper').prepend('<div id="header-container"></div>');
  $('#header-container').load('/templates/user-header.html', function () { // load header succeed

    $("body").initNavSidePanel();
    $('.user-name').html(getName());
    $('.user-name').attr('href', '/personal-vault.html?tab=tab-settings')
    $(".notifications-wrapper").each(function () {   // notifications
      $(this).initPopups();
      $(this).initNotifications();
    });

    /**
     * get notifications
     */
    Api.getNotifications({ recipientUserId: authObj._id, statuses: ["new"] }, function (data) { // fetch notifications
      $('.notification-number').html(data.length);
      for (var i = 0; i < data.length; i++) {
        var n = data[i];
        var message = '';
        if (!n.entity) {
          n.entity = { createdBy: {}, category: {} };
        }
        if (n.type === 'newPostByFavouriteProvider') {
          message = 'Your favorite Tech. provider “'
            + n.entity.createdBy.name + '” has added a New content on ' + n.entity.category.name;
        } else if (n.type === 'newPostInFavouriteCategory') {
          message = 'Your favorite Category “'
            + n.entity.category.name + '” has added a New content by ' + n.entity.createdBy.name;
        } else if (n.type === 'updatePostByFavouriteProvider') {
          message = 'Your favorite Tech. provider “'
            + n.entity.createdBy.name + '” has update a content "' + n.entity.title + '"';
        } else if (n.type === 'providerFreezed') {
          message = 'Any content your saved to your personal vault from that provider “'
            + n.entity.name + '” will be deleted within 30 days';
        }
        else if (n.type === 'system') {
          message = 'System Message - ' + n.content;
        }
        else {
          message = 'new message with unkown notification type =' + n.type;
        }

        $('.notifications-list')
          .append('<li data-id="' + n._id + '">' +
            '<p class="notification-txt">' + message + '</p><span class="time">' + $.timeago(n.createdOn) + '</span></li>')
      }
    });

    $('.btn-logout').click(function () {
      function logout() {
        Api.removeCache(Api.AUTHOBJ_KEY);
        window.location.href = "home.html";
      }

      Api.logout(logout, logout);
    });

    // make the current navgate active
    $('.link-' + $("body").attr("id")).each(function () {
      $(this).addClass('active');
      var htmlValue = $(this).html();
      $('.active-page-title').html(htmlValue);
    });
    $('.icon-question-help').click(function () {
      $('#modal-help-dialog input[name="title"]').val('');
      $('#modal-help-dialog textarea[name="content"]').val('');
      $("#modal-help-dialog").modal("show");
    });
  });

  $('.page-wrapper').append('<div id="global-search-box"></div>');
  $('#global-search-box').load('/templates/global-search-box.html', function () {

    var startSearch = function () {
      var searchContent = $('.global-input-search').val();
      if (searchContent && searchContent.length > 0) {
        window.location.href = '/all-content.html?searchContent=' + searchContent;
      }
    };

    $('.global-input-search').keypress(function (event) {
      if (event.key === 'Enter') {
        startSearch();
      }
    });

    $('.global-search-btn').click(function () {
      startSearch();
    });
  });


  $('.page-wrapper').parent().append('<div id="global-help-dialog"></div>');
  $('#global-help-dialog').load('/templates/user-help-dialog.html', function () {
    $('#modal-help-dialog .btn-sure-help-request').click(function () {
      var errorMessage = '';
      var checkNull = function (value, message) {
        if (!value || value.length <= 0) {
          errorMessage += message + '<br/>';
        }
        return value;
      };
      var title = checkNull($('#modal-help-dialog input[name="title"]').val(), 'Title cannot be empty');
      var content = checkNull($('#modal-help-dialog textarea[name="content"]').val(), 'Content cannot be empty');

      if (errorMessage.length > 0) {
        return Api.showErrorToast(errorMessage);
      }
      Api.getTechnologyUser(technologyUser._id, function (tUser) {
        Api.sendEmail({
          subject: 'A Help request from user',
          content: 'Hi Admin: <br/><br/>'
            + 'There is a help request from user ' + tUser.user.email + ' , please reply this asap. <br/><br/>'
            + '<strong>' + title + '</strong><br/><br/>'
            + content,
        }, function () {
          Api.showSuccessToast("Help request has been sent to admin, admin will reply you asap.");
          $("#modal-help-dialog").modal("hide");
        }, function (err) {
          Api.showErrorToast(Api.getErrorMessage(err))
        });
      });
    });
  });

  Api.getCategories(function (data) {
    for (var i = 0; i < data.length; i++) {
      $('li:not(.lessons-learned-list) .nav-menu').append('<a href="all-content.html?catagory=' + data[i]._id + '" class="item">' + data[i].name + '</a>');
      $('.lessons-learned-list .nav-menu').append('<a href="all-content.html?lessonsLearned=true&catagory=' + data[i]._id + '" class="item">' + data[i].name + '</a>');
    }
  });
})(jQuery);
