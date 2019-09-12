/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the search result provider page
 *
 * @author      TCSCODER
 * @version     1.0
 */

/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the technologyUser dashboard page
 *
 * @author      TCSCODER
 * @version     1.0
 */


(function ($) {


  const technologyUser = Api.getCache('technologyUser');
  var searchOffset = 0;

  /**
   * fetch posts in seach pages
   * @param clear clear list if clear is true
   * @param action what trigger post update
   */
  var fetchSearchPost = function (clear,action) {

    var query = window.getPostFilterValues();
    if (Api.updateOffsetAndLimitByAction(searchOffset, query, clear, action)) {
      searchOffset = query.offset;
    }
    Api.getPosts(query, function (rsp) {
      var posts = rsp.items;
      if (clear) $('.content-feed-list').html('');
      Api.hideOrShowMoreBtn(rsp.totalCount, query.offset, query.limit, $('.btn-load-more'));
      for (var i = 0; i < posts.length; i += 1) {
        $('.content-feed-list').append(Api.getUserPostItemHtml(posts[ i ], 'provider'));
      }
    });
  };
  $('.btn-load-more').click(function () {
    searchOffset += Api.defaultLimit;
    fetchSearchPost();
  });

  Api.getAppStatistics({},function (app) {
    $('#provider-number').html(app.totalProvider);
    $('#user-number').html(app.totalUser+100);
    $('#post-number').html(app.totalPost);
  });

  window.fetchPosts = fetchSearchPost;
  window.postFilterOnLoad = function () {
    var searchContent = Api.getQueryString('searchContent');
    var catagory = Api.getQueryString('catagory');
    if (searchContent && searchContent.length > 0) {
      $('#post-filter-search').val(searchContent);
    }
    if (catagory) {
      $("input[data-id='" + catagory + "']").attr('checked', "true");
    }
    fetchSearchPost(true);
  };

})(jQuery);
