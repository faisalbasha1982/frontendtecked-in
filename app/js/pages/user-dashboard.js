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
  var technologyUser = Api.getCache('technologyUser');
  var myCategoryFeedOffset = 0;
  var recentPostsOffset = 0;
  var recommendedOffset = 0;
  var currentTabName = '#tab-category-feed';
  /**
   * save post
   */
  var savePostFunc = function () {
    var that = $(this);
    Api.createSavePost({
        post: $(this).attr('data-id'),
        user: technologyUser._id, status: 'active', expirationOption: 'oneYear'
      },
      function () {
        that.addClass('display-none');
        Api.showSuccessToast('This item has been saved to your personal vault');
      }, function (err) {
        Api.showErrorToast(Api.getErrorMessage(err));
      })
  };
  /**
   * fetch post contents by my categories
   * @param clear clear list if clear is true
   * @param action what trigger post update
   */
  var fetchMyCategoryFeed = function (clear, action) {
    var categoryIds = [];
    // get my categories
    Api.getFavouriteCategories({ userId: technologyUser._id }, function (categories) {
      for (var i = 0; i < categories.length; i++) {
        categoryIds.push(categories[ i ].category._id);
      }
      var query = window.getPostFilterValues();
      if (!query.categoryIds || query.categoryIds.length <= 0)
        query.categoryIds = JSON.stringify(categoryIds);
      query.offset = myCategoryFeedOffset;
      if (Api.updateOffsetAndLimitByAction(myCategoryFeedOffset, query, clear, action)) {
        myCategoryFeedOffset = query.offset;
      }
      query.fetchSave = true;
      Api.getPosts(query, function (rsp) {
        var posts = rsp.items;
        if (clear) $('.fav-post-list').html('');
        Api.hideOrShowMoreBtn(rsp.totalCount, query.offset, query.limit, $('.fav-btn-more'));
        for (var i = 0; i < posts.length; i += 1) {
          $('.fav-post-list').append(getPostItemHtml(posts[i]));
          $('.btn-save[data-id="' + posts[i]._id + '"]').unbind('click').click(savePostFunc);
        }
      }, null, true);
    });
  };
  $('.fav-btn-more').click(function () {
    myCategoryFeedOffset += Api.defaultLimit;
    fetchMyCategoryFeed();
  });
  /**
   * fetch recent posts
   * @param clear clear list if clear is true
   * @param action what trigger post update
   */
  var fetchRecentPosts = function (clear, action) {
    var postIds = [];
    // get my categories
    Api.getPostViews({ technologyUserId: technologyUser._id, limit: 0 }, function (views) {
      for (var i = 0; i < views.length; i += 1) {
        postIds.push(views[ i ].post._id);
      }
      var query = window.getPostFilterValues();
      query.postIds = Api.unique(postIds);
      query.offset = recentPostsOffset;
      query.limit = Api.defaultLimit;
      query.fetchSave = true;
      if (Api.updateOffsetAndLimitByAction(recentPostsOffset, query, clear, action)) {
        recentPostsOffset = query.offset;
      }
      Api.getPosts(query, function (rsp) {
        if (clear) $('.recent-posts-list').html('');
        var posts = rsp.items;
        Api.hideOrShowMoreBtn(rsp.totalCount, query.offset, query.limit, $('.recent-load-more'))
        for (var i = 0; i < posts.length; i += 1) {
          $('.recent-posts-list').append(getPostItemHtml(posts[i]));
          $('.btn-save[data-id="' + posts[i]._id + '"]').unbind('click').click(savePostFunc);
        }
      }, null, true);
    });
  };
  $('.recent-load-more').click(function () {
    recentPostsOffset += Api.defaultLimit;
    fetchRecentPosts();
  });
  window.postFilterOnLoad = function () {
  }
  /**
   * fetch recommonded posts
   * @param clear clear list if clear is true
   * @param action what trigger post update
   */
  var fetchRecommondPosts = function (clear, action) {
    var query = window.getPostFilterValues();
    if (Api.updateOffsetAndLimitByAction(recommendedOffset, query, clear, action)) {
      recommendedOffset = query.offset;
    }
    query.fetchSave = true;
    Api.getRecommendedContents(technologyUser._id, query, function (rsp) {
      if (clear) $('.recommended-posts-list').html('');
      var posts = rsp.items;
      Api.hideOrShowMoreBtn(rsp.totalCount, query.offset, query.limit, $('.recommended-btn-more'));
      for (var i = 0; i < posts.length; i += 1) {
        $('.recommended-posts-list').append(getPostItemHtml(posts[i]));
        $('.btn-save[data-id="' + posts[i]._id + '"]').unbind('click').click(savePostFunc);
      }
    });
  };
  $('.recommended-btn-more').click(function () {
    recommendedOffset += Api.defaultLimit;
    fetchRecommondPosts();
  });
  /**
   * filter post
   * @param clear clear list if clear is true
   * @param action what trigger post update
   */
  window.fetchPosts = function (clear, action) {
    if (currentTabName === '#tab-category-feed') {
      fetchMyCategoryFeed(clear, action);
    } else if (currentTabName === '#tab-recommended-content') {
      fetchRecommondPosts(clear, action);
    } else if (currentTabName === '#tab-recently-read') {
      fetchRecentPosts(clear, action);
    }
  };
  $('.tabs-title a').click(function () {
    window.resetPostFilter();
    currentTabName = $(this).attr('data-tab-target');
    window.fetchPosts(true);
  });
  /**
   * get post content html code
   * @param post the post entity
   * @return {string}
   */
  var getPostItemHtml = function getPostItemHtml(post) {
    var catagoryLink = 'all-content.html?catagory=' + post.category._id;
    var saveBtn = '<a href="javascript:;" class="btn btn-save" data-id="' + post._id + '">Save</a>';
    return '<li class="content-feed-box">' + (post.saved ? '' : saveBtn) +
      ('<div class="bg-image"><img src="' + (post.imagePath || './img/thumb-feed-default.jpg') + '" alt="thumbnail"/></div>' +
        '<div class="feed-content"><a href="./content-details_user.html?id=' + post._id + '" class="feed-name">' + post.title + '</a>' +
        '<p class="tech-provider-name">' + post.createdBy.name + '</p><p class="feed-txt">' + post.content.getDescription() + '</p>' +
        '<p class="time-to-read"><span class="time"><span>' + post.readingTime + ' </span>min</span> read</p>' +
        '<div class="date-views-row">' +
        '<div class="date">    <span class="icons icon-calendar"></span>    ' +
        '<span>' + moment(post.publishedOn).format('ll') + '</span>  ' +
        '</div> ' +
        '<div class="views">    ' +
        '<span class="icons icon-views"></span>    ' +
        '<span>' + Api.getViews(post.viewTimes) + '</span>  ' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="category-details"><span class="icons icon-category"></span><span>Category :</span><a href="' + catagoryLink + '" class="category-name">' + post.category.name + '</a>' +
        '</div>' +
        '</li>');
  };
  Api.getTechnologyUserStatistics(technologyUser._id, function (data) {
    $('.categories-number').html(data.numberOfFavouriteCategories);
    $('.read-number').html(data.numberOfReadPosts);
    $('.providers-number').html(data.numberOfFavouriteProviders);
    $('.contents-number').html(data.numberOfSavedPosts);
  });
  fetchMyCategoryFeed(true);
})(jQuery);
