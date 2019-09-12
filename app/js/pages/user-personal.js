/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */
/**
 * the user person page
 *
 * @author      TCSCODER
 * @version     1.0
 */

(function ($) {
  var technologyUser = Api.getCache('technologyUser');
  var authObj = Api.getCache(Api.AUTHOBJ_KEY);
  var savePostsoffset = 0;
  var currentTabTarget = '#tab-saved-content';
  var currentSortName = 'createdOn';
  var savePostSortList = [
    { value: 'createdOn', label: 'Date created' },
    { value: 'createdBy', label: 'Tech. Provider' },
    { value: 'title', label: 'Article Title' },
    ];
  var favTechSortList = [ { value: 'createdOn', label: 'Date created' }, {
    value: 'provider',
    label: 'Tech. provider'
  } ];
  var activitySortList = [ { value: 'createdOn', label: 'Date created' },
    { value: 'activityName', label: 'Activity Name' } ];
  /**
   * fetch save posts
   * @param clear clear list if clear is true
   */
  var fetchSavePosts = function (clear) {
    savePostsoffset = clear ? 0 : savePostsoffset;
    const limit = 20;
    var query = {
      offset: savePostsoffset, limit: limit, technologyUserId: technologyUser._id,
      sortBy: currentSortName
    };
    $.extend(query, getFilterDateRange());
    $.extend(query, getFilterStatus());
    var searchInput = $('.input-search').val();
    if (searchInput && searchInput.length > 0) {
      query.keywords = searchInput;
    }
    Api.getPostSaves(query, function (data) {
      if (clear) $('.saved-content-list').html('');
      data.length < limit ? $('.btn-load-more').hide() : $('.btn-load-more').show();
      for (var i = 0; i < data.length; i++) $('.saved-content-list').append(getSavePostItemHtml(data[ i ]));
    })
  };
  /**
   * upload user photo
   * @param img
   */
  var updateUserProfileImage = function (img) {
    if (img) {
      $('.stats-banner-wrapper').css({
        'background': 'url(' + img + ') center no-repeat',
        'background-size': 'cover'
      });
    }
  }
  /**
   * fectch Favourite Providerss
   * @param clear clear list if clear is true
   */
  var fectchFavouriteProviderss = function (clear) {
    var query = { technologyUserId: technologyUser._id, sortBy: currentSortName };
    $.extend(query, getFilterDateRange());
    var searchInput = $('.input-search').val();
    if (searchInput && searchInput.length > 0) {
      query.provider = searchInput;
    }
    Api.getFavouriteTechnologyProviders(query, function (data) {
      if (clear) $('.tech-providers-list').html('');
      for (var i = 0; i < data.length; i++) $('.tech-providers-list').append(getFavProviderItemHtml(data[ i ]));
    });
  }
  /**
   * filter activities by local conditions
   * @param items the activities
   * @return {Array}
   */
  var filterActivities = function (items) {
    var dateRange = getFilterDateRange();
    var newItems = [];
    var filterByKeyword = function (item) {
      var seachInput = $('.input-search').val();
      if (seachInput && seachInput.length > 0) {
        switch (item.key) {
          case 'user':
            return false;
          case 'postSave': {
            return Api.fuzzingMatchString(item.entity.post.title, seachInput)
              || Api.fuzzingMatchString(item.entity.post.content, seachInput);
          }
          case 'favTechProvider': {
            return Api.fuzzingMatchString(item.entity.provider.name, seachInput)
              || Api.fuzzingMatchString(item.entity.provider.description, seachInput);
          }
          case 'favCategory': {
            return Api.fuzzingMatchString(item.entity.category.name, seachInput);
          }
        }
      }
      return true;
    };
    for (var i = 0; i < items.length; i += 1) {
      var item = items[ i ];
      if (
        (!dateRange.createdOnStart || new Date(dateRange.createdOnStart) <= new Date(item.entity.createdOn))
        && (!dateRange.createdOnEnd || new Date(dateRange.createdOnEnd) >= new Date(item.entity.createdOn))
        && filterByKeyword(item)
      ) {
        newItems.push(item);
      }
    }
    return newItems;
  };
  /**
   * fecth my activities
   */
  var fetchActivities = function () {
    var requests = {
      user: [ technologyUser ],
      postSave: false,
      favCategory: false,
      favTechProvider: false,
    };
    var items = [];
    var updateUI = function () {
      for (var key in requests) {
        if (!requests[ key ]) return;
      }
      for (var key in requests) {
        for (var i = 0; i < requests[ key ].length; i += 1) {
          items.push({
            key: key,
            entity: requests[ key ][ i ]
          });
        }
      }
      items = filterActivities(items);
      items.sort(function (a, b) {
        if (currentSortName === 'createdOn') {
          return a.entity.createdOn < b.entity.createdOn;
        } else {
          return a.key < b.key;
        }
      });
      $('.your-activity-list').html('');
      for (var i = 0; i < items.length; i += 1) {
        $('.your-activity-list').append(getActivityItemHtml(items[ i ]));
      }
    };
    Api.getPostSaves({ technologyUserId: technologyUser._id }, function (data) {
      requests.postSave = data;
      updateUI();
    });
    Api.getFavouriteCategories({ userId: technologyUser._id }, function (data) {
      requests.favCategory = data;
      updateUI();
    });
    Api.getFavouriteTechnologyProviders({ technologyUserId: technologyUser._id }, function (data) {
      requests.favTechProvider = data;
      updateUI();
    })
  };
  /**
   * get tech user Statistics
   */
  var getTechnologyUserStatistics = function () {
    Api.getTechnologyUserStatistics(technologyUser._id, function (data) {
      $('.categories-number').html(data.numberOfFavouriteCategories);
      $('.contents-number').html(data.numberOfSavedPosts);
    });
  }
  /**
   * get filter date range
   * @return {{}}
   */
  var getFilterDateRange = function () {
    var query = {};
    var startDate = $('#startDate').val();
    var endDate = $('#endDate').val();
    if (startDate && startDate.length === 10) {
      query[ 'createdOnStart' ] = startDate;
    }
    if (endDate && endDate.length === 10) {
      query[ 'createdOnEnd' ] = endDate;
    }
    return query;
  };
  /**
   * get filter statuses
   */
  var getFilterStatus = function () {
    var statuses = [];
    $('input:checked[name="filter-checkbox"]').each(function () {
      statuses.push($(this).attr('data-id'));
    });
    if (statuses.length > 0 && statuses[ 0 ] !== 'all') {
      return { statuses: JSON.stringify(statuses) };
    }
    return {};
  };
  /**
   * build sort list
   * @param items sort items
   */
  var buildSortList = function (items) {
    $('.dropdown-sort-by-wrapper').css('display', (!items || items.length <= 0) ? 'none' : '');
    var sortList = $('.dropdown-menu ul');
    sortList.html('');
    for (var i = 0; i < items.length; i += 1) {
      sortList
        .append('<li><a class="sort-item" href="javascript:;" data-id="${items[ i ].value}">' + items[ i ].label + '</a></li>');
    }
    var name = items[ 0 ].value;
    $('.dropdown-menu ul li').removeClass('selected-option');
    var sortNode = $("a[data-id=\"" + name + "\"]");
    $('.selected-option').html(sortNode.html());
    sortNode.parent().addClass('selected-option');
    currentSortName = name;
    $('.sort-item').each(function () {
      $(this).off('click').on('click', function () {
        currentSortName = $(this).attr('data-id');
        fetchItemsByFilterUpdate();
      });
    });
  }
  /**
   * fetch items if filter update
   */
  var fetchItemsByFilterUpdate = function () {
    if (currentTabTarget === '#tab-saved-content') {
      fetchSavePosts(true);
    } else if (currentTabTarget === '#tab-fav-tech-providers') {
      fectchFavouriteProviderss(true);
    } else if (currentTabTarget === '#tab-activity') {
      fetchActivities(true);
    }
  }
  $('.btn-filter-action').click(function () {
    fetchItemsByFilterUpdate();
  });
  $('.input-search').on('input', function () {
    fetchItemsByFilterUpdate();
  });
  $('.tabs-title a').each(function () {
    $(this).click(function () {
      currentTabTarget = $(this).attr('data-tab-target');
      var inputSearch = $('.input-search');
      $('.buttons-row .btn-reset').trigger('click');
      if (currentTabTarget === '#tab-saved-content') {
        inputSearch.attr('placeholder', 'Search by word, phrase or shared by');
        fetchSavePosts(true);
        buildSortList(savePostSortList);
      } else if (currentTabTarget === '#tab-fav-tech-providers') {
        inputSearch.attr('placeholder', 'Search by Tech. provider name or description');
        fectchFavouriteProviderss(true);
        buildSortList(favTechSortList);
      } else if (currentTabTarget === '#tab-activity') {
        inputSearch.attr('placeholder', 'Search by word or phrase');
        buildSortList(activitySortList);
        fetchActivities(true);
      }
      $('.search-filter-sort-row-wrapper').css('display', currentTabTarget === '#tab-settings' ? 'none' : '');
      $('#save-statues').css('display', currentTabTarget === '#tab-saved-content' ? '' : 'none');
      inputSearch.val('');
    })
  });
  $('a[data-tab-target="#tab-saved-content"]').trigger('click');
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
  $('.btn-cover-photo').click(function () {
    $(this).next().trigger('click');
  });
  $('.upload-user-img').change(function () {
    Api.uploadImage('/technologyUsers/' + technologyUser._id + '/upload', $(this)[ 0 ].files[ 0 ], function (data) {
      Api.setCache('technologyUser', data);
      technologyUser = data;
      updateUserProfileImage(technologyUser.userPhotoPath);
    }, function () {
    });
  });
  $('.email').html(authObj.email);
  $('.save-post-btn-more').click(function () {
    savePostsoffset += Api.defaultLimit;
    fetchSavePosts();
  });
  Api.getCategories(function (data) {
    for (var i = 0; i < data.length; i += 1) {
      $('.tech-interests-list').append('<li>  <label class="checkbox">' +
        '<input class="fav-category-checkbox" data-id="' + data[ i ]._id + '" id="my-fav-category-' + data[ i ]._id + '" type="checkbox"/>' +
        '<span class="icon-checkbox"><span class="icons icon-tick"></span></span>' +
        '<span class="checkbox-label">' + data[ i ].name + '</span>    <span class="icon-category ' + data[ i ].iconPath + '"></span>  </label></li>');
    }
    Api.getFavouriteCategories({ userId: technologyUser._id }, function (favData) {
      for (var i = 0; i < favData.length; i++) {
        $('#my-fav-category-' + favData[ i ].category._id).prop('checked', true);
        $('#my-fav-category-' + favData[ i ].category._id).attr('fav-data-id', favData[ i ]._id);
      }
    });
    $('.fav-category-checkbox').each(function () {
      var checkbox = $(this);
      checkbox.click(function () {
        var checked = checkbox.prop('checked');
        var categoryId = checkbox.attr('data-id');
        if (checked) {
          Api.createFavouriteCategories(technologyUser._id, categoryId, function (data) {
            Api.showSuccessToast('mark favourite category succeed!');
            $('#my-fav-category-' + categoryId).attr('fav-data-id', data._id);
            getTechnologyUserStatistics();
          }, function (err) {
            checkbox.prop('checked', false);
            Api.showErrorToast(Api.getErrorMessage(err));
          });
        } else {
          Api.removeFavouriteCategories(checkbox.attr('fav-data-id'), function (data) {
            Api.showSuccessToast('remove favourite category succeed!');
            getTechnologyUserStatistics();
          }, function (err) {
            checkbox.prop('checked', true);
            Api.showErrorToast(Api.getErrorMessage(err));
          });
        }
      });
    });
  });
  /**
   * initPersonalVaultPage
   */
  $.fn.initPersonalVaultPage = function () {
    // for saved content tab
    var initSavedContentTab = function (head) {

      // enable drag drop and rearrange list items
      head.find("[data-sortable]").sortable({
        zIndex: 50,
        cursor: "move",
        distance: 10,
        handle: head.find("[data-sortable] li .content-title")
      });
      // remove list item
      head.on("click", ".btn-remove", function () {
        var that = $(this);
        Api.removeSavePost(that.attr('data-id'), function () {
          Api.showSuccessToast('remove succeed!');
          that.closest("li").remove();
          getTechnologyUserStatistics();
        }, function (err) {
          Api.showErrorToast(Api.getErrorMessage(err));
        });
      });
    };
    // for favorite tech provider tab
    var initFavTechProvidersTab = function (head) {
      // remove list item
      head.on("click", ".btn-remove", function () {
        var that = $(this);
        Api.removeFavouriteTechnologyProviders(that.attr('data-id'), function () {
          Api.showSuccessToast('remove succeed!');
          that.closest("li").remove();
        }, function (err) {
          Api.showErrorToast(Api.getErrorMessage(err));
        });
      });
    };
    $('.toggle-switch input[type="checkbox"]').each(function () {
      var that = $(this);
      var dataType = that.attr('data-type');
      $(this).prop('checked', technologyUser[ dataType ]);
      $(this).on('change', function () {
        var value = that.prop('checked');
        var body = {};
        body[ dataType ] = value;
        Api.updateTechnologyUser(technologyUser._id, body, function () {
          Api.showSuccessToast('update notification setting succeed!');
          technologyUser[ dataType ] = value;
          Api.setCache('technologyUser', technologyUser);
        }, function (err) {
          that.prop('checked', !value);
          Api.showErrorToast(Api.getErrorMessage(err));
        });
      });
    });
    initSavedContentTab($(this).find("#tab-saved-content"));
    initFavTechProvidersTab($(this).find("#tab-fav-tech-providers"));
  };
  /**
   * get fav provider html
   * @param favProvider
   * @return {string}
   */
  var getFavProviderItemHtml = function (favProvider) {
    var categories = '';
    for (var i = 0; i < favProvider.categories.length; i += 1) {
      categories += favProvider.categories[ i ].name + ',';
    }
    if (categories.length > 0) {
      categories = categories.substring(0, categories.length - 1);
    }
    return '<li>  <a href="javascript:;" data-id="' + favProvider._id + '" class="btn btn-remove">Remove</a>  ' +
      '<div class="provider-logo">' +
      '<div class="img-container"><img src="' + favProvider.provider.logoPath + '" alt="logo"/></div>  </div>  ' +
      '<div class="provider-details">' +
      '<a href="./tech-provider-details_user.html?id=' + favProvider.provider._id + '"     class="provider-name">' + favProvider.provider.name + '</a>    ' +
      '<div class="categories"><p class="label-txt"><span class="icons icon-category"></span><span>Categories :</span></p>      <p class="categories-list">' + categories + '</p>    ' +
      '</div>' + '<p class="about-provider">' +
      ' <strong>About Us :</strong> ' + Api.replaceEnter(favProvider.provider.description) + '    </p>' +
      '<div class="favorited-details">' +
      '<span class="icons icon-calendar"></span>      Favorited on : ' + moment(favProvider.createdOn).format('ll')
      + '</div>  ' +
      '</div></li>';
  };
  /**
   * get save post item html codes
   * @param savePost the savePost entity
   * @return {string}
   */
  var getSavePostItemHtml = function getSavePostItemHtml(savePost) {
    var attachmentName = 'none';
    if (savePost.post.attachmentPath) {
      var attachmenPathTemp = savePost.post.attachmentPath.split('-');
      attachmentName = '<a href="' + savePost.post.attachmentPath + '">' + attachmenPathTemp[attachmenPathTemp.length - 1] + '</a>';
    }
    return '<li data-expand-collapse="collapsed">' +
      '<div class="content-heading-row">  ' +
      '<a href="'+'content-details_user.html?id='+savePost.post._id+'" class="content-title">' + savePost.post.title + '</a>  ' +
      '<div><a href="javascript:;" data-id="' + savePost._id + '" class="btn-remove">Remove</a>    ' +
      '<a href="javascript:;" class="btn-details" data-expand-trigger><span class="when-expanded">Hide </span>Details</a> ' +
      ' </div></div><div data-expandable>  <div class="post-details-wrapper">    <div class="bg-image">     ' +
      ' <img src="' + (savePost.post.imagePath || './img/thumb-feed-default.jpg') + '" alt="image" />    </div>  ' +
      '  <div class="post-details">      <p class="provider-name">' + savePost.post.createdBy.name + '</p> ' +
      '<p class="post-description">' + savePost.post.content.getDescription() + '      </p> ' +
      '</div></div>  <div class="content-details">   ' +
      '<ul><li data-key="date">        <p class="key">Date</p>        <p class="value">' + moment(savePost.post.createdOn).format('ll') + '</p>      </li>      <li data-key="saved-date">        <p class="key">Saved Date</p>        <p class="value">' + moment(savePost.createdOn).format('ll') + '</p>      </li>      <li data-key="save-time-period">        <p class="key">Save Time Period</p>        <p class="value">' + savePost.expirationOption + '</p>      </li>      <li data-key="status">        <p class="key">Status</p>        <p class="value">' + savePost.status + '</p>      </li>      <li data-key="sharedBy">        <p class="key">Shared by</p>        <p class="value">' + (savePost.sharedBy || 'N/A') + '</p>      </li>    </ul>    <ul>      <li data-key="keyword">        <p class="key">Keyword</p>        <p class="value">' + savePost.keywords.join(',') + '</p>      </li>      <li data-key="description">        <p class="key">Description</p>        <p class="value">          ' + savePost.post.content.getDescription() + '        </p>      </li>      <li data-key="attachment">        <p class="key">Attachment</p>        <p class="value">          ' + attachmentName + '        </p>      </li>    </ul>  </div></div></li>\n    ';
  };
  /**
   * get active item html
   * @param entity the activity item
   */
  var getActivityItemHtml = function (item) {
    var dateFormat = function dateFormat() {
      return moment(item.entity.createdOn).format('DD MMM YYYY, LT');
    };
    switch (item.key) {
      case 'user': {
        return '<li><span class="colored-dot"></span><p class="activity-date">' + dateFormat() + '</p><p class="activity-description">You have created account on teckedin.com as a Technology user</p></li>';
      }
      case 'postSave': {
        return '<li data-activity="saved-post"><span class="colored-dot"></span><p class="activity-date">' + dateFormat() + '</p><p class="activity-description"><strong>Saved</strong> Article on ' + item.entity.post.title + '.</p><div class="post-details-wrapper">  <div class="bg-image">    <img src="' + (item.entity.post.imagePath || './img/thumb-feed-default.jpg') + '" alt="image" />  </div>  <div class="post-details">    <a href="./content-details_user.html?id=' + item.entity.post._id + '"     class="content-name">' + item.entity.post.title + '</a>    <p class="provider-name">' + item.entity.post.createdBy.name + '</p>    <p class="post-description">' + item.entity.post.content.getDescription() + '    </p>  </div></div></li>';
      }
      case 'favTechProvider': {
        return '<li data-activity="favorited-provider"><span class="colored-dot"></span><p class="activity-date">' + dateFormat() + '</p><p class="activity-description"><strong>Favorited</strong> a Technical Provider.</p><div class="provider-details-wrapper">  <div class="provider-logo">    <img class="img-container" src="' + (item.entity.provider.logoPath || './img/provider-logos/provider-logo-default.png') + '" alt="image" />  </div>  <div class="provider-details">    <a href="./tech-provider-details_user.html?id=' + item.entity.provider._id + '"     class="provider-name">' + item.entity.provider.name + '</a>    <p class="technology-name">Technology Used</p>    <p class="about-provider">      <strong>About :</strong> ' + item.entity.provider.description + '    </p>  </div></div></li>';
      }
      case 'favCategory': {
        return '<li><span class="colored-dot"></span><p class="activity-date">' + dateFormat() + '</p><p class="activity-description">You <strong>Favorited</strong> a category named <strong>' + item.entity.category.name + '</strong></p></li>';
      }
    }
  };

  updateUserProfileImage(technologyUser.userPhotoPath);
  $("body").initPersonalVaultPage();
  getTechnologyUserStatistics();
  $("[data-popup]").each(function () {
    $(this).initPopups(true);
  });
  var destTab = Api.getQueryString('tab');
  if (destTab) {
    $('a[data-tab-target="#'+destTab+'"]').trigger('click');
  }
})(jQuery);
