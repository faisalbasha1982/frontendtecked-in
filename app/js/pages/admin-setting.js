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
  
  $('.tabs-title a[data-tab-target="#tab-settings"]').trigger('click');
  
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
})(jQuery);
