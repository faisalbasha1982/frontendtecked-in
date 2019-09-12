/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the provider common
 *
 * @author      TCSCODER
 * @version     1.0
 */

(function ($) {
  
  Api.needLogin();
  var authObj = Api.getCache(Api.AUTHOBJ_KEY);
  
  /**
   * insert mobile header to pages
   */
  $("body").prepend('<div id="aside-menu"></div>');
  $("#aside-menu").load("/templates/admin-aside-menu.html", function () {
  });
  
  /**
   * insert header to pages
   */
  $(".page-wrapper").prepend('<div id="header-container"></div>');
  $("#header-container").load("/templates/admin-header.html", function () { // load header succeed
    
    $("body").initNavSidePanel();
    
    $(".notifications-wrapper").each(function () {   // notifications
      $(this).initPopups();
      $(this).initNotifications();
    });
    
    $(".btn-logout").click(function () {
      function logout() {
        Api.removeCache(Api.AUTHOBJ_KEY);
        window.location.href = "home.html";
      }
      
      Api.logout(logout, logout);
    });
    // make the current navgate active
    $(".link-" + $("body").attr("id")).each(function () {
      $(this).addClass("active");
      var htmlValue = $(this).html();
      $(".active-page-title").html(htmlValue);
    });
  });
  
})(jQuery);
