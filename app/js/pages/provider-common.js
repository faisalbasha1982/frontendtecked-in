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
  var technologyProvider = Api.getCache("technologyProvider");

  /**
   * insert mobile header to pages
   */
  $("body").prepend('<div id="aside-menu"></div>');
  $("#aside-menu").load("/templates/provider-aside-menu.html", function () {
  });

  /**
   * insert header to pages
   */
  $(".page-wrapper").prepend('<div id="header-container"></div>');
  $("#header-container").load("/templates/provider-header.html", function () { // load header succeed

    $("body").initNavSidePanel();
    $("#user-name").html(technologyProvider.name);
    $("#user-name-aside").html(technologyProvider.name);

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

  $(".page-wrapper").append('<div id="global-search-box"></div>');
  $("#global-search-box").load("/templates/global-search-box.html", function () {

    var startSearch = function () {
      var searchContent = $('.global-input-search').val();
      if (searchContent && searchContent.length > 0) {
        window.location.href = 'search-result_provider.html?searchContent=' + searchContent;
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
})(jQuery);
