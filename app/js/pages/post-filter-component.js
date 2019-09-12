/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the post filter components
 *
 * @author      TCSCODER
 * @version     1.0
 */
(function ($) {

  var currentSortName = 'publishedOn';
  var currentLimit = 'top-50';

  /**
   * get content filter values ,
   * because other page need use so i put it in window
   * @return {} filter values
   */
  window.getPostFilterValues = function () {

    // sort
    const query = {
      sortBy: currentSortName,
      limit: parseInt(currentLimit.split('-')[ 1 ]),
    };

    // add input query
    function addSearchQuery(value, key) {
      if (value && value.length > 0) {
        query[ key ] = value;
      }
    }

    // search content
    addSearchQuery($('#post-filter-search').val(), 'content');
    addSearchQuery($('.filter-states-list').val(), 'state');
    addSearchQuery($('#search-product').val(), 'product');
    addSearchQuery($('#search-service').val(), 'service');
    addSearchQuery($('#additionalOffice').val(), 'additionalOffice');
    query.caseStudy = $('input[name="case-study"]').prop('checked');
    query.lessonsLearned = $('input[name="lessons-learned"]').prop('checked');
    // categories
    var categoryIds = [];
    $("input:checked").each(function () {
      categoryIds.push($(this).attr('data-id'));
    });
    if (categoryIds.length > 0 && categoryIds[ 0 ] !== 'all') {
      query[ 'categoryIds' ] = categoryIds;
    }
    return query;
  };


  /**
   * inject params to url
   */
  function updateURL() {
    var filters = window.getPostFilterValues();
    var params = '';
    for(let key in filters){
      var val = filters[key];
      if (typeof val === 'object') {
        params += key + '=' + val.join(',') + "&";
      }else{
        params += key + '=' + val + "&";
      }
    }
    params = params.length > 0 ? params.substr(0, params.length - 1) : params;
    var newUrl = window.location.href;
    newUrl = newUrl.split('?')[0] + ('?' + params);
    window.history.pushState(null, null, newUrl);
  }

  /**
   * restore url to filter panel
   */
  window.restoreURLToFilter = function () {
    if (Api.getQueryString("categoryIds")) {
      var ids = Api.getQueryString("categoryIds").split(',');
      for (let i = 0; i < ids.length; i++) {
        $("input[data-id='" + ids[i] + "']").attr('checked', "true");
      }
    }
    if (Api.getQueryString("content")) {
      $('#post-filter-search').val(Api.getQueryString("content"));
    }

    if (Api.getQueryString("lessonsLearned")) {
      $("input[name='lessons-learned']").attr('checked', "true");
    }

    if(Api.getQueryString("sortBy")){
      window.setDefaultSort(Api.getQueryString("sortBy"));
    }

    if (Api.getQueryString("limit")) {
      window.setDefaultLimit(Api.getQueryString("limit"));
    }
  };

  window.getLimit = function () {
    return currentLimit ? parseInt(currentLimit.split('-')[1]) : Api.defaultLimit;
  };

  /**
   * reset content filter values
   */
  window.resetPostFilter = function () {
    $('.btn-reset').trigger('click');
    $('#post-filter-search').val('');
  };

  /**
   * set content default sort name
   * @param name
   */
  window.setDefaultSort = function (name) {
    $('.filter-sortby .sort-dropdown-ul li').removeClass('selected-option');
    var sortNode = $('a[data-id="' + name + '"]');
    $('.filter-sortby .sort-selected-option').html(sortNode.html());
    sortNode.parent().addClass('selected-option');
    currentSortName = name;
  };

  /**
   * window set default limit
   * @param name
   */
  window.setDefaultLimit = function (name) {
    $('.filter-limit .show-dropdown-ul li').removeClass('selected-option');
    var sortNode = $('a[data-id="top-' + name + '"]');
    $('.filter-limit .selected-option').html(sortNode.html());
    sortNode.parent().addClass('selected-option');
    currentLimit = 'top-' + name;
  };

  /**
   * add sort item
   * @param name the sort value
   * @param label the sort name
   */
  window.addSortItem = function (name, label) {
    $('.sort-dropdown-ul')
      .append('<li><a class="sort-name" data-id="' + name + '" href="javascript:;">&nbsp;' + label + '&nbsp;</a></li>');
  };


  $('#post-filter-container').load('/templates/post-filter.html', function () {
    var $stateFilterSelecte2 = $('.filter-states-list');
    $stateFilterSelecte2.select2({placeholder:'State'});

    /******* Case Study and Lessons Learned checkboxes *******/
    var lessonsLearnedCheckBox = $("[name='lessons-learned']");
    var caseStudyCheckBox = $("[name='case-study']");
    /**
     * This function will be triggered when one of checkboxes (Lessons Learned and Case Study) changed.
     * If both checkboxes are checked, unchecks automatically the other one.
     * @param {Event} evt Change Event
     */
    var onCheckBoxChange = function (evt) {
      if (evt.target.checked) {
        const nameOfOtherCheckBox = evt.target.name === 'lessons-learned' ? 'case-study' : 'lessons-learned';
        $(`input[name="${nameOfOtherCheckBox}"]`).prop('checked', false);
      }
    }

    // only one of checkboxes (Case Study and Lessons Learned) can be checked at the same time
    lessonsLearnedCheckBox.on("change", onCheckBoxChange);
    caseStudyCheckBox.on("change", onCheckBoxChange);

    setDefaultLimit(parseInt(currentLimit.split('-')[1]));
    Api.getStates(function (data) {
      for (var i = 0; i < data.length; i++) {
        $stateFilterSelecte2.append("<option value=\"" + data[i]._id + "\">" + data[i].value + "</option>");
      }
    });

    $(".post-filter-sortby").each(function () {
      $(this).initDropdown();
    });

    $(".post-filter-panel").each(function () {
      $(this).initPopups(false);
      $(this).initFilterPanel();
    });

    $('.btn-filter-action').click(function () {
      updateURL();
      window.fetchPosts(true);
    });

    $('#post-filter-search').on('input', function () {
      updateURL();
      window.fetchPosts(true);
    });

    Api.getCategories(function (data) {
      for (var i = 0; i < data.length; i += 1) {
        $('.filter-categories-list')
          .append('<li><label class="checkbox">' +
            '<input data-id="' + data[i]._id + '" class="category-checkbox" type="checkbox"/>' +
            '<span class="icon-checkbox"></span>' +
            '<span class="checkbox-label">' + data[i].name + '</span></label></li>');
      }
      window.restoreURLToFilter();
      if (window.postFilterOnLoad) {
        // $('.show-dropdown-wrapper').hide();
        window.postFilterOnLoad();

        $('.sort-dropdown-ul .sort-name').each(function () {
          $(this).click(function () {
            currentSortName = $(this).attr('data-id');
            updateURL();
            window.fetchPosts(true, 'sort');  // update posts by sort
          });
        });

        $('.show-dropdown-ul .sort-name').each(function () {
          $(this).click(function () {
            currentLimit = $(this).attr('data-id');
            updateURL();
            window.fetchPosts(true);
          });
        });
      }
    });
  });
})(jQuery);
