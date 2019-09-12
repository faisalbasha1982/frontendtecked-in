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
  var authObj = Api.getCache(Api.AUTHOBJ_KEY);
  var currentTabName = "#tab-manager";
  var emailListString = '';
  var userListString = '';

  $(".tabs-title a").click(function () {
    currentTabName = $(this).attr("data-tab-target");
    if (currentTabName === '#tab-manager') {
      fetchUserToManager();
    } else if (currentTabName === '#tab-notification') {
      fetchEmailUserList();
    }
  });

  /**
   * fecth user that checked upcoming event
   */
  var fetchEmailUserList = function () {
    Api.searchTechnologyUsers({ notifyMeUpcomingEvent: true, verified: true }, function (users) {
      var body = $('.email-table-body');
      if (users.length > 0) $('.email-table .no-records').addClass('display-none');
      body.html('');
      emailListString = '';
      for (var i = 0; i < users.length; i += 1) {
        body.append(getEmailUserRowItem(users[ i ]));
        emailListString += users[ i ].user.email + ';';
        userListString += users[ i ].user._id + ';';
      }
      $('#open-external-email').attr('href', 'mailto:' + emailListString);
    });
  }

  /**
   * fetch manager user
   */
  var fetchUserToManager = function () {
    var query = window.getPostFilterValues();
    query.name = query.content;
    delete query.content;
    Api.searchTechnologyUsers(query, function (users) {
      var body = $('.user-table-body');
      if (users.length > 0) $('.user-table .no-records').addClass('display-none');
      body.html('');
      for (var i = 0; i < users.length; i += 1) {
        body.append(getUserRowItem(users[ i ]));
      }
      $('.send-email').each(function () {
        $(this).unbind('click').click(function () {
          var email = $(this).attr('email');
          Api.sendEmail({
            to: email,
            subject: 'Teckedin.com looks forward to having you on our platform',
            content: "Teckedin.com looks forward to having you on our platform. We are sending this verification email, please check your spam folder, so that you may start using our platform. <br/>Thank you."
          }, function () {
            Api.showSuccessToast("email has been send");
          }, function () {
            Api.showErrorToast("email send failed");
          });
        });
      });
      $('.delete-user').each(function () {
        $(this).unbind('click').click(function () {
          var id = $(this).attr('data-id');
          swal({
            title: 'Are you sure?',
            text: 'All things about this user will be deleted, and you will not be able to recover these!',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
          }).then(function (result) {
            if (result.value) {
              Api.deleteTechnologyUser(id, function () {
                Api.showSuccessToast('user deleted');
                $('.row[data-id="' + id + '"]').remove();
                if (body.children().length === 0) {
                  $('.user-table .no-records').removeClass('display-none');
                }
              }, function (err) {
                Api.showErrorToast(Api.getErrorMessage(err))
              })
            }
          })
        });
      });

      $('.verify-user').each(function () {
        $(this).unbind('click').click(function () {
          var userId = $(this).attr('data-userId');
          var id = $(this).attr('data-id');

          Api.verifyUserManually(userId, function () {
            Api.showSuccessToast('User verified successfully');

            $('.row[data-id="' + id + '"] .verification-status').text('verified');
          }, function (err) {
            Api.showErrorToast(Api.getErrorMessage(err))
          })
        });
      });
    });
  };

  var getEmailUserRowItem = function getEmailUserRowItem(user) {
    return '<div class="row" data-id="' + user._id + '">' +
      '<div class="item flex1">' + user.user.email + '</div>' +
      '<div class="item flex1">' + user.firstName + '</div>' +
      '<div class="item flex1">' + user.lastName + '</div>' +
      '<div class="item flex1">' + user.city + '</div>' +
      '<div class="item flex1">' + (user.state ? user.state.value || 'N/A' : 'N/A') + '</div>' +
      '</div>';
  };

  var getUserRowItem = function getUserRowItem(user) {
    return '<div class="row" data-id="' + user._id + '">' +
      '<div class="item flex1">' + (user.state ? user.state.value || 'N/A' : 'N/A') + '</div>' +
      '<div class="item flex1">' + user.user.email + '</div>' +
      '<div class="item flex1 verification-status">' + (user.user.verified ? 'verified' : ('not verified<br/><br/><a email="' + user.user.email + '" class="send-email" href="javascript:;">Send notification</a><br/><br/><a data-id="' + user._id + '" data-userid="' + user.userId + '" class="verify-user" href="javascript:;">Verify user</a>')) + '</div>' +
      '<div class="item flex1">' + moment(user.user.lastLoginAt).format('ll HH:MM') + '</div>' +
      '<div class="item flex1"><a href="javascript:;" class="delete-user" data-id="' + user._id + '">Delete</a></div>' +
      '</div>';
  };

  var clipboard = new Clipboard('#copy-clipboard', {
    text: function () {
      return emailListString;
    }
  });

  $('#download-tech-user').click(function () {
    Api.downloadExcels('/technologyUsers/download?notifyMeUpcomingEvent=true&verified=true', 'TechUser-' + Date.now() + '.xlsx');
  });

  $('.send-message').each(function () {
    var type = $(this).attr('data-id');
    var modalDialog = $('#modal-send-message');
    $(this).click(function () {
      if (userListString.length === 0) {
        Api.showErrorToast('there no users need to send notification/email');
        return;
      }
      $('.send-title').html('Send ' + type);
      $('.content-title').html(type + ' content');
      $('input[name="subject"]').val('');
      $('textarea[name="content"]').val('');
      $('textarea[name="emails"]').val(emailListString);
      if (type === 'email') {
        $('.input-subject').removeClass('display-none');
      } else {
        $('.input-subject').addClass('display-none');
      }

      modalDialog.modal('show');
      $('.btn-sure-send').unbind('click').click(function () {
        var content = $('textarea[name="content"]').val();
        var subject = $('input[name="subject"]').val();
        var errorMsg = '';
        if (!content || content.length <= 0) {
          errorMsg += 'content cannot be emplty. <br/>';
        }
        if (type === 'email' && (!subject || subject.length <= 0)) {
          errorMsg += 'subject cannot be emplty.';
        }
        if (errorMsg.length > 0) {
          Api.showErrorToast(errorMsg);
          return;
        }

        Api.sendMessageTo({
          type: type,
          recipients: type === 'email' ? emailListString : userListString,
          content: type === 'email' ? content.replace(/\n/g, "<br />") : content,
          subject: subject.length === 0 ? 'null' : subject,
        }, function () {
          modalDialog.modal('hide');
          Api.showSuccessToast(type + ' send succeed');
        }, function (err) {
          Api.showErrorToast(Api.getErrorMessage(err));
        })
      });
    });
  });

  window.fetchPosts = fetchUserToManager;
  window.postFilterOnLoad = function () {
    $('.filter-input').addClass('display-none');
    $('a[data-id="articleLength"]').parent().addClass('display-none');
    $('a[data-id="readingTime"]').parent().addClass('display-none');
    $('a[data-id="createdBy"]').parent().addClass('display-none');
    $('a[data-id="title"]').parent().addClass('display-none');
    $('a[data-id="publishedOn"]').parent().addClass('display-none');

    window.addSortItem("firstName", "First Name");
    window.addSortItem("lastName", "Last Name");
    window.setDefaultSort('firstName');
    window.restoreURLToFilter();
    var root = $('#tab-manager');
    root.find('.post-filter-panel').addClass('display-none');
    $('.show-dropdown-wrapper').show();
    root.find('#post-filter-search').attr('placeholder', 'Search Tech. user by name');
    $('.tabs-title a[data-tab-target="#tab-manager"]').trigger('click');
  };
  clipboard.on('success', function (e) {
    Api.showSuccessToast('email list copied.');
  });
  clipboard.on('error', function (e) {
    Api.showErrorToast(e.message);
  });
})(jQuery);
