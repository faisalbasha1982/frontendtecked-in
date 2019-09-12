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
  var currentTabName = "#tab-my-posts";
  var myPostOffset = 0;
  var mostPostOffset = 0;
  var newestPostOffset = 0;
  /**
   * fetch posts
   * @param clear clear list if clear is true
   */
  var fetchPosts = function (clear) {
    var listContainer = null;
    var moreBtn = null;
    var query = { technologyProviderId: technologyProvider._id, statuses: ['published', 'draft', 'scheduled'] };
    listContainer = $("#most-content-feed-list");
    moreBtn = $(".most-btn-more");
    mostPostOffset = clear ? 0 : mostPostOffset;
    query.offset = mostPostOffset;
    if (moreBtn === null || listContainer === null) {
      return;
    }
    var filterQuery = window.getPostFilterValues();
    for (var key in filterQuery) {
      query[ key ] = filterQuery[ key ];
    }
    Api.getPosts(query, function (rsp) {
      var posts = rsp.items;
      if (clear) {
        listContainer.html("");
      }
      Api.hideOrShowMoreBtn(rsp.totalCount, query.offset, query.limit, moreBtn);
      for (var i = 0; i < posts.length; i += 1) {
        listContainer.append(Api.getProviderPostHtml(posts[ i ], "provider"));
      }
    });
  };
  //download subscribers
  $('#download-subscribers').click(function () {
    Api.downloadSubscribes({ provider: technologyProvider._id }, function (data, textStatus, jqxhr) {
      Api.showSuccessToast('download succeed.');
    }, function (err) {
      Api.showErrorToast(Api.getErrorMessage(err));
    });
  });

  //download request
  $('#download-request').click(function () {
    Api.downloadRequests({ provider: technologyProvider._id }, function (data, textStatus, jqxhr) {
      Api.showSuccessToast('download succeed.');
    }, function (err) {
      Api.showErrorToast(Api.getErrorMessage(err));
    });
  });

  $(".my-btn-more").click(function () {
    myPostOffset += Api.defaultLimit;
    fetchPosts(false);
  });
  $(".most-btn-more").click(function () {
    mostPostOffset += Api.defaultLimit;
    fetchPosts(false);
  });
  $(".newest-btn-more").click(function () {
    newestPostOffset += Api.defaultLimit;
    fetchPosts(false);
  });
  $(".tabs-title a").click(function () {
    currentTabName = $(this).attr("data-tab-target");
    if (!currentTabName || currentTabName.length <= 0) {
      return;
    }
    var inputSearch = $('.input-search');
    if (currentTabName === '#tab-my-posts') {
      inputSearch.attr('placeholder', 'Search content');
    } else {
      inputSearch.attr('placeholder', 'Search Provider posts');
    }
    if (currentTabName === "#tab-most-read") {
      window.setDefaultSort("viewTimes");
    } else {
      window.setDefaultSort("publishedOn");
    }
    fetchPosts(true);
  });
  window.fetchPosts = fetchPosts;
  window.postFilterOnLoad = function () {
    $('.filter-input').addClass('display-none');
    $('a[data-id="articleLength"]').parent().addClass('display-none');
    $('a[data-id="readingTime"]').parent().addClass('display-none');
    $('a[data-id="createdBy"]').parent().addClass('display-none');
    window.addSortItem("viewTimes", "View Times");
    window.restoreURLToFilter();
    $('.tabs-title a[data-tab-target="#tab-most-read"]').trigger('click');
    // $('.tabs-title a[data-tab-target="#tab-subscribers"]').trigger('click');
    // $('.tabs-title a[data-tab-target="#tab-requests"]').trigger('click');

    $('.show-dropdown-wrapper').show();
  };

  $(".provider-logo img").hide();
  Api.getgetTechnologyProviderStatistics(technologyProvider._id, function (data) {
    $(".provider-name").html(technologyProvider.name);
    $(".number-of-posts").html(data.numberOfPosts + " Posts");
    $(".number-of-state .stat-value").html(data.numberOfState);
    $(".registered-on .date").html(moment(technologyProvider.createdOn).format("ll"));
    $(".number-of-click .stat-value").html(data.numberOfWebClick);

    if (technologyProvider.logoPath) {
      $(".provider-logo").prepend('<img src="' + technologyProvider.logoPath + '" alt="logo"/>')
    }


    $(".short-txt").html(data.numberOfSubscribers);
    $(".long-txt").html(data.numberOfSubscribers);
    $(".number-of-favorite .color-orange").html(data.numberOfFavorites);
    $(".stat-active-users .color-blue").html(data.usersOnPosts);
  });
  Api.getSubscribes({ provider: technologyProvider._id }, function (users) {
    if (users.length > 0) $('.subscribers-table .no-records').addClass('display-none');
    for (let i = 0; i < users.length; i += 1) {
      $('.subscribers-table').append(getSubscribeRow(users[ i ]));
    }
  }, function (err) {
    Api.showErrorToast(Api.getErrorMessage(err));
  });

  Api.getRequest({ provider: technologyProvider._id }, function (requests) {
    if (requests.length > 0) $('.requests-table .no-records').addClass('display-none');
    for (let i = 0; i < requests.length; i += 1) {
      $('.requests-table').append(getRequestRow(requests[ i ]));
    }
  }, function (err) {
    Api.showErrorToast(Api.getErrorMessage(err));
  });

  /**
   * get getSubscribe row html values
   * @param user the subscribe
   */
  var getSubscribeRow = function (user) {
    if (!user) return '';
    return "<div class='row'>" +
      "<div class='item'>" + user.name + "</div>" +
      "<div class='item'><a href='mailto:" + user.email + "'>" + user.email + "</a></div>" +
      "<div class='item'>" + user.city + "</div>" +
      "<div class='item'>" + user.state + "</div>" +
      "</div>";
  }

  /**
   * get Request row html values
   * @param user the subscribe
   */
  var getRequestRow = function (request) {
    var user = request.user;
    if (!user) return '';
    return '<div class="row">' +
      '<div class="item"><span class="item__title">Requestor Name :</span>' + user.firstName + ' ' + user.lastName + '</div>' +
      '<div class="item"><span class="item__title">Requestor Phone :</span>' + (request.phone || user.phone) + '</div>' +
      '<div class="item flex3"><span class="item__title">Request Content :</span>' + request.content + '</div>' +
      '<div class="item"><span class="item__title">Other contact :</span>' + (request.other || 'N/A') + '</div>' +
      '<div class="item"><span class="item__title">City :</span>' + (user.city || 'N/A') + '</div>' +
      '<div class="item"><span class="item__title">State :</span>' + (user.state ? user.state.value || 'N/A' : 'N/A') + '</div>' +
      '</div>';
  }
})(jQuery);
