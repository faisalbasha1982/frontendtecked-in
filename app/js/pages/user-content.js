/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the all content page
 * @author      TCSCODER
 * @version     1.0
 */


/******* all content page functions *******/
(function ($) {
  var offset = 0;

  /**
   * fecth post contents
   * @param clear clear list if clear is true
   * @param action what trigger post update
   */
  var fetchPosts = function (clear, action) {
    var query = getPostFilterValues();
    if (Api.updateOffsetAndLimitByAction(offset, query, clear, action)) {
      offset = query.offset;
    }
    Api.getPosts(query, function (rsp) {
      if (clear) {
        $(".content-feed-box").each(function () {
          $(this).remove();
        });
      }

      var data = rsp.items;
      Api.hideOrShowMoreBtn(rsp.totalCount, query.offset, query.limit, $(".btn-load-more"));
      for (var i = 0; i < data.length; i += 1) {
        $(".content-feed-list").append(Api.getUserPostItemHtml(data[ i ]));
      }
    });
  };


  $.fn.initAllContentPage = function () {

    // category filter expand collapse on less than default breakpoint
    var categoryFilterWrapper = $(this).find(".category-filter-wrapper");

    categoryFilterWrapper.on("click", ".heading-row", function () {
      categoryFilterWrapper.toggleClass("is-open");
    });

    // close category filter on click outside
    $("body").on("click", function (e) {
      if (!$(e.target).closest(".category-filter-wrapper").is(categoryFilterWrapper)) {
        categoryFilterWrapper.removeClass("is-open");
      }
    });

    // master check - all function
    categoryFilterWrapper.on("change", "input[type=checkbox]", function () {
      var masterCheck = categoryFilterWrapper.find(".master-check");
      if ($(this).closest(".master-check").length > 0) {
        if ($(this).prop("checked")) {
          masterCheck.siblings("li").each(function () {
            $(this).find("input").prop("checked", false);
          });
        }
      } else {
        if ($(this).prop("checked")) {
          masterCheck.find("input").prop("checked", false);
        }
      }
    });
  };

  $(".btn-load-more").click(function () {
    offset += Api.defaultLimit;
    fetchPosts();
  });

  Api.getAppStatistics({},function (app) {
    $('#provider-number').html(app.totalProvider);
    $('#user-number').html(app.totalUser+100);
    $('#post-number').html(app.totalPost);
  });

  window.postFilterOnLoad = function () {
    var searchContent = Api.getQueryString("searchContent");
    var catagory = Api.getQueryString('catagory');
    if (searchContent && searchContent.length > 0) {
      $("#post-filter-search").val(searchContent);
    }
    if (catagory) {
      $('input[data-id="' + catagory + '"]').attr('checked', "true");
    }
    fetchPosts(true);
  };

  $("body").initAllContentPage();
  window.fetchPosts = fetchPosts;
})(jQuery);
