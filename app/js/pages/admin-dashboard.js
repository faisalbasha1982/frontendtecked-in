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
  var authObj = Api.getCache(Api.AUTHOBJ_KEY);
  var technologyProvider = Api.getCache("technologyProvider");
  var currentTabName = "#tab-all-contents";
  var allPostOffset = 0;

  /**
   * fetch posts
   * @param clear clear list if clear is true
   */
  var fetchPosts = function (clear) {
    var listContainer = null;
    var moreBtn = null;
    var query = {};
    listContainer = $(".all-contents-table-body");
    moreBtn = $(".all-btn-more");
    allPostOffset = clear ? 0 : allPostOffset;
    query.offset = allPostOffset;
    if (moreBtn === null || listContainer === null) {
      return;
    }
    var filterQuery = window.getPostFilterValues();
    for (var key in filterQuery) {
      query[ key ] = filterQuery[ key ];
    }
    Api.getPosts(query, function (rsp) {
      var posts = rsp.items;
      if (posts.length > 0) $('.all-contents-table .no-records').addClass('display-none');
      if (clear) {
        listContainer.html("");
      }
      Api.hideOrShowMoreBtn(rsp.totalCount, query.offset, query.limit, moreBtn);
      for (var i = 0; i < posts.length; i += 1) {
        listContainer.append(getContentRow(posts[ i ]));
        $("a[data-id=\"" + posts[i]._id + "\"]").unbind('click').click(function () {
          var id = $(this).attr('data-id');
          swal({
            title: 'Are you sure?',
            text: 'You will not be able to recover this content!',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
          }).then(function (result) {
            if (result.value) {
              Api.removePost(id, function () {
                Api.showSuccessToast('content deleted');
                $(".row[data-id=\"" + id + "\"]").remove();
              }, function (err) {
                Api.showErrorToast(Api.getErrorMessage(err))
              })
            }
          })
        });
      }
    });
  };

  $(".all-btn-more").click(function () {
    allPostOffset += Api.defaultLimit;
    fetchPosts(false);
  });

  window.fetchPosts = fetchPosts;
  window.postFilterOnLoad = function () {
    $('.filter-input').addClass('display-none');
    $('a[data-id="articleLength"]').parent().addClass('display-none');
    $('a[data-id="readingTime"]').parent().addClass('display-none');
    $('a[data-id="createdBy"]').parent().addClass('display-none');
    window.addSortItem("viewTimes", "View Times");
    window.restoreURLToFilter();
    $('.tabs-title a[data-tab-target="' + currentTabName + '"]').trigger('click');
    $('.show-dropdown-wrapper').show();
  };

  $(".tabs-title a").click(function () {
    currentTabName = $(this).attr("data-tab-target");
    fetchPosts(true);
  });

  Api.getAppStatistics({}, function (app) {
    $('.long-txt').html(app.totalProvider);
    $('.short-txt').html(app.totalProvider);
    $('.color-blue').html(app.totalUser);
    $('.color-orange').html(app.totalPost);
  });

  var getContentRow = function (content) {
    return '<div class="row" data-id="' + content._id + '">' +
      '<div class="item flex4">' + content.title + '</div>' +
      '<div class="item flex1">' + content.category.name + '</div>' +
      '<div class="item flex1">' + content.createdBy.name + '</div>' +
      '<div class="item flex1">' + content.status + '</div>' +
      '<div class="item flex1">' + moment(content.publishedOn).format('ll HH:mm') + '</div>' +
      '<div class="item flex1"><a href="javascript:;" data-id="' + content._id + '">delete</a></div>' +
      '</div>';
  };
})(jQuery);
