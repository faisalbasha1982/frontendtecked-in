/**
 * common link resource page
 *
 * @author      TCSCODER
 * @version     1.0
 */

(function ($) {

  var bodyId = $('body').attr('id');
  var isAdminPage = bodyId === 'page-admin-resource' || bodyId === 'page-admin-news';
  var isProvider = bodyId === 'page-provider-resource' || bodyId === 'page-provider-news';
  var belongsTo = bodyId.indexOf('resource') > 0 ? 'resource' : 'news';
  var isResource = belongsTo === 'resource';
  var updateEntity = null;
  var entityMap = {};
  var filterType = isAdminPage ? undefined : (Api.isLoggedIn() ? (isProvider ? 'provider' : 'user') : 'both');

  window.postFilterOnLoad = function () {
    $('.tabs-title a[data-tab-target="#tab-manager"]').trigger('click');
    $('#table-root').load("templates/link-resource-table.html", tableHtmlLoaded);
    $('.post-filter-panel').addClass('display-none');
    $('.show-dropdown-wrapper').show();
    var root = $('#tab-manager');
    root.find('#post-filter-search').attr('placeholder', 'Search by title,description,link');

    $('.filter-input').addClass('display-none');
    $('a[data-id="articleLength"]').parent().addClass('display-none');
    $('a[data-id="readingTime"]').parent().addClass('display-none');
    $('a[data-id="createdBy"]').parent().addClass('display-none');
    $('a[data-id="publishedOn"]').parent().addClass('display-none');
    if (!isResource) {
      window.addSortItem('date', 'Recent Date');
      window.setDefaultSort('date');
    } else {
      window.setDefaultSort('title');
    }
    window.restoreURLToFilter();
  };

  function initAdminPage() {
    $('.create-new-resource').click(function () {
      updateEntity = null;
      $('.dialog-title').html("Create " + (isResource ? 'link resource' : 'news'));
      $('.sure-btn-title').html("Create");
      $('textarea[name="discription"]').val("");
      $('input[name="title"]').val("");
      $('input[name="link"]').val("");
      $("input[name='type'][value='both']").attr("checked", 'checked');
      $('#modal-resource-dialog').modal('show');
    });

    $('.radio-text').each(function () {
      $(this).click(function () {
        $('input[name="type"][value="' + $(this).attr('value') + '"]').trigger('click');
      });
    });

    $('.btn-sure-send').click(function () {
      var description = $('textarea[name="discription"]').val();
      var title = $('input[name="title"]').val();
      var link = $('input[name="link"]').val();
      var type = $("input[name='type']:checked").val();
      var errorMsg = '';

      if (!title || title.length <= 0) {
        errorMsg += 'Title cannot be emplty. <br/>';
      }
      if (!link || link.length <= 0) {
        errorMsg += 'Link cannot be emplty. <br/>';
      }

      if (link.toLowerCase().indexOf('http') < 0) {
        link = 'http://' + link;
      }
      if (errorMsg.length > 0) {
        Api.showErrorToast(errorMsg);
        return;
      }
      if (updateEntity) {
        Api.updateLinkResource(updateEntity._id, {
          title: title,
          link: link,
          type: type,
          description: description
        }, function (entity) {
          $(".row[data-id=\"" + updateEntity._id + "\"] .title").html(entity.title);
          $(".row[data-id=\"" + updateEntity._id + "\"] .link").html("<a href=\"" + entity.link + "\">" + entity.link + "</a>");
          $(".row[data-id=\"" + updateEntity._id + "\"] .description").html(entity.description);
          $(".row[data-id=\"" + updateEntity._id + "\"] .type").html(entity.type);
          entityMap[entity._id] = entity;
          $('#modal-resource-dialog').modal('hide');
          Api.showSuccessToast((isResource ? 'resource' : 'news') + " update succeed");
        }, function (err) {
          Api.showErrorToast(Api.getErrorMessage(err));
        })
      } else {
        Api.createLinkResource({
          title: title, type: type,
          belongsTo: belongsTo,
          link: link, description: description
        }, function (entity) {
          var body = $('.provider-table-body');
          $('.provider-table .no-records').addClass('display-none');
          body.prepend(getEntityItem(entity));
          entityMap[entity._id] = entity;
          updateEditAndDeleteButton();
          $('#modal-resource-dialog').modal('hide');
          Api.showSuccessToast("resource add succeed");
        }, function (err) {
          Api.showErrorToast(Api.getErrorMessage(err));
        })
      }
    });
  }

  function initNoremalUserPage() {
    $('.actions').addClass('display-none');
    $('.type').addClass('display-none');
  }

  function tableHtmlLoaded() {
    if (isAdminPage) {
      initAdminPage();
    } else {
      initNoremalUserPage();
    }
    fetchResourceEntity(true);
  }

  function fetchResourceEntity(clear) {
    var query = window.getPostFilterValues();
    query.belongsTo = belongsTo;
    if (filterType) {
      query.type = filterType;
    }
    Api.searchLinkResource(query, function (entities) {
      var body = $('.provider-table-body');
      if (clear) {
        body.html("");
      }
      if (entities.length > 0) $('.provider-table .no-records').addClass('display-none');
      if (clear && entities.length === 0) $('.provider-table .no-records').removeClass('display-none');

      for (var i = 0; i < entities.length; i += 1) {
        body.append(getEntityItem(entities[i]));
        entityMap[entities[i]._id] = entities[i];
      }
      updateEditAndDeleteButton();
    }, function () {

    })
  }

  function updateEditAndDeleteButton() {
    $('.edit-link').each(function () {
      var that = $(this);
      that.unbind('click').click(function () {
        var id = $(this).attr('data-id');
        updateEntity = entityMap[id];
        if (updateEntity) {
          $('.dialog-title').html("update " + (isResource ? 'link resource' : 'news'));
          $('.sure-btn-title').html("Save");
          $('textarea[name="discription"]').val(updateEntity.description);
          $('input[name="title"]').val(updateEntity.title);
          $('input[name="link"]').val(updateEntity.link);
          $('#modal-resource-dialog').modal('show');
          $('input[name="type"][value="' + updateEntity.type + '"]').attr('checked', 'checked');
        }
      })
    });

    $('.delete-link').each(function () {
      var that = $(this);
      that.unbind('click').click(function () {
        var id = $(this).attr('data-id');
        swal({
          title: 'Are you sure?',
          text: 'All things about this ' + (isResource ? 'resource' : 'news') + ' will be deleted, and you will not be able to recover these!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it'
        }).then(function (result) {
          if (result.value) {
            Api.deleteLinkResource(id, function () {
              $(".row[data-id=\"" + id + "\"]").remove();
              if ($('.provider-table-body').children().length === 0) {
                $('.provider-table .no-records').removeClass('display-none');
              }
              Api.showSuccessToast((isResource ? 'Resource' : 'News') + " delete succeed.");
            }, function (err) {
              Api.showErrorToast(Api.getErrorMessage(err));
            })
          }
        })
      })
    });
  }

  window.fetchPosts = fetchResourceEntity;

  var getEntityItem = function (entity) {
    return '<div class="row" data-id="' + entity._id + '">' +
      '<div class="item flex1 title">' + entity.title + '</div>' +
      '<div class="item flex1 link"><a href="' + entity.link + '" target="_blank">' + entity.link + '</a></div>' +
      '<div class="item flex2 description">' + entity.description + '</div>' +
      '<div class="item flex0-5 type ' + (isAdminPage ? '' : 'display-none') + '">' + entity.type + '</div>' +
      '<div class="item flex0-5 ' + (isAdminPage ? '' : 'display-none') + '"><a href="javascript:;" class="edit-link" data-id="' + entity._id + '">edit</a> /<a href="javascript:;" class="delete-link" data-id="' + entity._id + '">delete</a></div>' +
      '</div>';
  };


  $('.create-new-resource').html(isResource ? 'create new resource' : 'create new news');

})(jQuery);
