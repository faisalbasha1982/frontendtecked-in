/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */
/**
 * the content detail page
 *
 * @author      TCSCODER
 * @version     1.0
 */
(function () {
  var authObj = Api.getCache(Api.AUTHOBJ_KEY);
  var technologyUser = Api.getCache('technologyUser');
  var technologyProvider = Api.getCache('technologyProvider');
  var currentSaveExpiration = 'oneYear';
  var pageId = $('body').attr('id');
  var isNotLogin = pageId === 'page-content-details-non-loggedin';
  var errorMessage = '';
  var pageMode = Api.getQueryString('mode');

  if (!authObj) {
    setTimeout(function () {
      $("#modal-home-login").modal("show");
    }, 10 * 1000);
  }
  /**
   * when load post from backend done
   * @param post
   */
  var loadPostDone = function (post) {
    var name = currentSaveExpiration;
    $('.dropdown-menu ul li').removeClass('selected-option');
    var sortNode = $('a[data-id="' + name + '"]');
    $('.selected-option').html(sortNode.html());
    $('.btn-edit').css('visibility', 'hidden');
    $('.btn-publish').css('visibility', 'hidden');
    sortNode.parent().addClass('selected-option');
    currentSaveExpiration = name;
    // select currentSaveExpiration
    $('.time-dropdown-item').click(function () {
      currentSaveExpiration = $(this).attr('data-id');
    });
    $('.time-dropdown-item[data-id="oneYear"]').trigger('click');
    if (authObj) {

      // tech user
      if (authObj.type === 'technologyUser') {

        //create post view
        Api.createPostViews(Api.getQueryString('id'), technologyUser._id, function () {
        }, function () {
        });
        //check the category is fav or not
        Api.getFavouriteTechnologyProviders({
          technologyProviderId: post.createdBy._id,
          technologyUserId: technologyUser._id
        }, function (data) {
          if (data.length > 0) {
            $('#btn-add-favorites').addClass("is-favorite");
            $('#btn-add-favorites').attr('data-id', data[0]._id);
            $('.add-favorites-txt').html('Remove from Favorites');
          } else {
          }
        });
        //check this content saved or not
        Api.getPostSaves({
          technologyUserId: technologyUser._id,
          postIds: [Api.getQueryString('id')]
        }, function (data) {
          if (data.length > 0) {
            $('.btn-save-to-vault').addClass('disabled');
            $('.btn-save-txt').html('Already saved');
          }
        });
        Api.getSubscribes({user: technologyUser._id, post: Api.getQueryString('id')}, function (data) {
          if (data.length > 0) {
            $('.btn-subscribe').addClass('disabled');
            $('.btn-subscribe').html('Subscribed')
          }
        })
      } else {  // tech Provider
        $('.btn-save-to-vault').addClass('display-none');
        $('#btn-add-favorites').addClass('display-none');
        $('#btn-request-info').addClass('display-none');
        $('.btn-subscribe').addClass('display-none');
        $('.btn-email').addClass('display-none');
        if (post.createdBy._id === technologyProvider._id && pageMode !== 'preview') {
          $('.btn-edit').css('visibility', '');
          if (post.status === 'draft' || post.status === 'scheduled') {
            $('.btn-publish').css('visibility', '');
          }
        }
      }
    }
    if (isNotLogin) { // not login user
      $('#btn-add-favorites').addClass('disabled');
      $('.btn-save-to-vault').addClass('disabled');
      $('.btn-email').addClass('disabled');
      $('.btn-subscribe').addClass('disabled');
      $('#btn-request-info').addClass('disabled');
    }
    if (post.status === 'draft') {  // disable send email btn if status = draft
      $('.btn-email').addClass('disabled');
      $('.btn-subscribe').addClass('disabled');
    }
    $('.btn-save-to-vault').click(function () {
      if ($(this).hasClass('disabled')) {
        return;
      }
      if (isNotLogin) {
        $('#modal-home-login').modal('show');
        return;
      }
      if ($(this).hasClass('disabled')) {
        return;
      }
      $('#modal-save-to-vault').modal('show');
    });
    $('#btn-add-favorites').click(function () {
      if ($(this).hasClass('disabled')) {
        return;
      }
      var that = $(this);
      var btnTxt = $('.add-favorites-txt');
      if ($(this).hasClass("is-favorite")) {  //mark or remove fav category
        Api.removeFavouriteTechnologyProviders(that.attr('data-id'), function () {  // remove
          Api.showSuccessToast('remove favorite provider succeed.');
          that.removeClass('is-favorite');
          btnTxt.html('Add Provider to Favorites');
        }, function (err) {
          Api.showErrorToast(Api.getErrorMessage(err));
        });
      } else {
        Api.createFavouriteTechnologyProviders({ //mark
          provider: post.createdBy._id,
          user: technologyUser._id
        }, function (data) {
          that.addClass('is-favorite');
          that.attr('data-id', data._id);
          Api.showSuccessToast('mark favorite provider succeed.');
          btnTxt.html('Remove from Favorites');
        }, function () {
          Api.showErrorToast(Api.getErrorMessage(err));
        });
      }
    });
    $('.btn-send-email').click(function () {
      //send email to tech user email address
      if ($(this).hasClass('disabled')) {
        return;
      }
      var sendEmails = [];
      if ($('#email-to-myself').prop('checked')) {
        sendEmails.push(authObj.email);
      } else {
        var val = htmlEncodeJQ($('#email-addresses').val()).trim();
        if (val.length <= 0) {
          Api.showErrorToast("email addresses cannot be null.");
          return;
        }
        var emails = val.split(',');
        for (var i = 0; i < emails.length; i++) {
          var newEmail = emails[i].trim();
          if (newEmail.length <= 0) {
            continue;
          }
          if (!Api.validateEmail(newEmail)) {
            Api.showErrorToast("email " + newEmail + " not a validate email.");
            return;
          }
          sendEmails.push(newEmail);
        }
        if (sendEmails.length <= 0) {
          Api.showErrorToast("email addresses cannot be empty.");
          return;
        }
      }
      Api.sendPostEmail(Api.getQueryString('id'), JSON.stringify(sendEmails), Api.getHost(), function () {
        Api.showSuccessToast('send content succeed.');
        $('#modal-email-post').modal('hide');
      }, function (err) {
        Api.showErrorToast(Api.getErrorMessage(err));
      });
    });
    $('#email-to-myself').change(function () {
      var value = $(this).prop('checked');
      if (value) {
        $('#email-to-others').prop('checked', false);
        $('#email-addresses').hide();
      }
    });
    $('#email-to-others').change(function () {
      var value = $(this).prop('checked');
      if (value) {
        $('#email-to-myself').prop('checked', false);
        $('#email-addresses').show();
      }
    });
    $('.btn-email').click(function () {
      if ($(this).hasClass('disabled')) {
        return;
      }
      $('#email-to-myself').prop('checked', true);
      $('#email-to-others').prop('checked', false);
      $('#email-addresses').val('');
      $('#email-addresses').hide();
      $('#modal-email-post').modal('show');
    });
    $('.btn-subscribe').click(function () {
      if ($(this).hasClass('disabled')) {
        return;
      }
      $('#modal-subscribe').modal('show');
    })
    $('.btn-sure-subscribe').click(function () {
      Api.createSubscribe(post._id, function () {
        Api.showSuccessToast('subscribe succeed.');
        $('#modal-subscribe').modal('hide');
        $('.btn-subscribe').addClass('disabled');
        $('.btn-subscribe').html('Subscribed');
      }, function (err) {
        Api.showErrorToast(Api.getErrorMessage(err));
      })
    });
    $('.btn-publish').click(function () {
      var that = $(this);
      Api.updatePost(post._id, {status: 'published', publishedOn: new Date()}, function () {
        Api.showSuccessToast('content publish succeed.');
        that.css('visibility', 'hidden');
      }, function (err) {
        Api.showErrorToast(Api.getErrorMessage(err));
      })
    });
    $('.btn-edit').click(function () {
      window.location.href = "/create-content.html?id=" + post._id;
    });
    $('.feed-name').html(post.title);
    $('.tech-provider-name').html(post.createdBy.name);
    $('.feed-txt').html(post.content.getDescription());
    $('.reading-time').html(post.readingTime + ' min read');
    $('.content-title').html(post.title);
    $('.category-name').html(post.category.name);

    if (!authObj) {
      $('.category-name').click(function () {
        $("#modal-home-login").modal("show");
      })
    } else {
      if (authObj.type === 'technologyUser') {
        $('.category-name').attr('href', 'all-content.html?catagory=' + post.category._id);
      } else {
        $('.category-name').attr('href', 'search-result_provider.html?catagory=' + post.category._id);
      }
    }


    $('.viewTimes').html(Api.getViews(post.viewTimes));
    $('.published-time').html(moment(post.publishedOn).format('ll'));
    $('#provider-logo').attr('src', post.createdBy.logoPath);
    $('.provider-name').html(post.createdBy.name);
    $('.about-provider .txt').html(Api.replaceEnter(post.createdBy.description));
    var userRole = authObj ? authObj.type === 'technologyUser' ? 'user' : 'provider' : 'user';
    $('.provider-details a').attr('href', './tech-provider-details_' + userRole + '.html?id=' + post.createdBy._id);
    if (post.attachmentPath) {
      var fileExtenions = post.attachmentPath.split('.');
      var extentions = "mp4,avi,mov,mpeg,mpg";
      var fileExtension = fileExtenions[fileExtenions.length - 1];
      if (extentions.indexOf(fileExtension.toLowerCase()) >= 0) {
        $('.section-3').append(addVideo(post.attachmentPath));
      } else {
        $('.section-3').append(addAttachment(post.attachmentPath));
      }
    }

    if (post.videoUrl && post.videoUrl.length > 0
      && (
        post.videoUrl.toLowerCase().indexOf('https://www.youtube.com') === 0
        || post.videoUrl.toLowerCase().indexOf('youtu.be') > 0
      ))
    {
      $('.section-3').append(addExternLinkVideo(post.videoUrl));
    }
    if (post.imagePath) {
      $('.popup-img').attr('src', post.imagePath);
      $('.content-banner-image').css({
        'background': 'url(' + post.imagePath + ') center no-repeat',
        'background-size': 'cover'
      });
    }
    $(".btn-save").click(function () {  // save content
      var keywords = htmlEncodeJQ($('#keywords').val());
      keywords = (!keywords || keywords.length === 0) ? [] : keywords.split(',');
      var shareEmail = $('#share-email').val();
      if (shareEmail && shareEmail.length > 0) {
        if (!Api.validateEmail(shareEmail)) {
          Api.showErrorToast("email address is invalid");
          return;
        }
      }
      Api.createSavePost({
        post: Api.getQueryString('id'), expirationOption: currentSaveExpiration,
        email: shareEmail,
        user: technologyUser._id, status: 'active', keywords: keywords
      }, function () {
        $('.btn-save-to-vault').addClass('disabled');
        $('.btn-save-txt').html('Already saved');
        Api.showSuccessToast('save content succeed');
        $('#modal-save-to-vault').modal('hide');
      }, function (err) {
        Api.showErrorToast(Api.getErrorMessage(err));
      })
    });

    /**
     * check the value is null or not
     * @param value the value
     * @param message the error message
     * @return {*}
     */
    var checkNull = function (value, message) {
      if (!value || value.length <= 0) {
        if (message) {
          errorMessage += message + '<br/>';
        }
      }
      return htmlEncodeJQ(value);
    };

    $('.btn-sure-request').click(function () {
      var obj = {};
      obj.content = $('textarea[name="content"]').val();
      obj.other = $('textarea[name="other"]').val();
      obj.phone = $('input[name="phone"]').val();
      obj.post = Api.getQueryString('id');
      errorMessage = '';

      if (obj.phone && obj.phone.length > 0) {
        checkNull(Api.validatePhoneNumber(obj.phone), 'Phone number invalid.');
      }
      checkNull(obj.content, 'looking for content is required.');

      if (errorMessage.length > 0) {
        Api.showErrorToast(errorMessage);
        return;
      }

      Api.createRequest(obj, function () {
        Api.showSuccessToast('request information succeed.');
        $('#modal-request-info').modal('hide');
      }, function (err) {
        Api.showErrorToast(Api.getErrorMessage(err));
      });
    });

    $('#btn-request-info').click(function () {
      if ($(this).hasClass('disabled')) {
        return;
      }
      $('textarea[name="content"]').val('');
      $('textarea[name="other"]').val('');
      $('input[name="phone"]').val('');
      $('#modal-request-info').modal('show');
    });
    $('.post-content').append(post.content.replace(/((?:m(?:in|ax)-)?width)\s*(\:\s?|=)\s*(['"\0])?\s*([1-9]\d{3,}|5[3-9][0-9]|[6-9][0-9]{2})(\s*(cm|in|mm|pc|pt|px|q)|(?!%|vw|vh|vmin|vmax|em|ex|ch|rem))[ ]*/gi, '$1$2100%').replace(/<a /g, '<a target="_blank" '));
    adjustContentImages();
    var categories = '';
    for (var i = 0; i < post.createdBy.categories.length; i += 1) {
      categories += post.createdBy.categories[i].name + ',';
    }
    if (categories.length > 0) {
      categories = categories.substring(0, categories.length - 1);
    }
    $('.categories').html(categories);
  };

  /**
   * auto resize the image in the rich text
   */
  var adjustContentImages = function () {
    var rootNode = $('.post-content');
    var width = rootNode.width();
    rootNode.find('img').each(function () {
      var w = $(this).attr('width');
      var h = $(this).attr('height');
      if (w) { // have width
        if (w.indexOf('%') > 0) { // percent
          $(this).removeAttr('height');
        } else {
          w = parseFloat(w);
          h = parseFloat(h);
          var r = h / w;
          if(isNaN(w) || isNaN(h) ){
            $(this).attr('width', '100%');
            $(this).removeAttr('height');
          }else{
            w = Math.min(w, width);
            $(this).attr('width', w);
            $(this).attr('height', r * w);
          }
        }
      } else {  // check width
        $(this).attr('width', '100%');
        $(this).removeAttr('height');
      }
    });
  };
  /**
   * add attachment
   * @param attachmentUrl the attachment url
   * @return {string}
   */
  var addAttachment = function addAttachment(attachmentUrl) {
    return '<div class="attachment-download"><h4>Attachment download:</h4><a target="_blank" href="' + attachmentUrl + '">' + attachmentUrl + '</a> </div>';
  };
  /**
   * add extern video player
   * @param videoUrl the video url
   * @return {string}
   */
  var addExternLinkVideo = function addExternLinkVideo(videoUrl) {
    var id = null;
    if (videoUrl.toLowerCase().indexOf("youtu.be") > 0) {
      var parts = videoUrl.split('/');
      if (parts.length > 1) {
        id = parts[parts.length - 1];
      }
    } else {
      id = videoUrl.split('=')[1];
    }
    if (!id) {
      return '<div/>';
    }
    var width = $('.content-details-wrapper').width();
    var vw = Math.min(480, width);
    var vh = vw * 320 / 480;
    return '<div class="video-container"><h4>Content video:</h4>' +
      '<iframe width="' + vw + 'px" height="' + vh + 'px" allowfullscreen="true" src="https://www.youtube.com/embed/' + id + '?autoplay=1&controls=2&playsinline=1&enablejsapi=1" frameborder="0"/> </div>';
  };

  /**
   * add video player
   * @param videoUrl the video url
   * @return {string}
   */
  var addVideo = function addVideo(videoUrl) {
    return '<div class="video-container"><h4>Content video:</h4>' +
      '<video id="my-player" class="video-js video-player" preload="auto" controls data-setup="{}"> ' +
      ' <source src="' + videoUrl + '"/></video>' +
      '</div>';
  };

  Api.getPost(Api.getQueryString('id'), function (post) {
    $('.main-content-wrapper').load('/templates/content-details.html', function () {
      loadPostDone(post);
    });
    Api.getPosts({
      categoryIds: JSON.stringify([post.category._id]),
      excludedPostIds: JSON.stringify([post._id]),
      limit: 3,
      offset: 0
    }, function (rsp) {
      var relateContents = rsp.items;
      var userRole = authObj ? authObj.type === 'technologyUser' ? 'user' : 'provider' : 'not_login';
      for (var i = 0; i < relateContents.length; i++) {
        $('.content-feed-list').append(Api.getUserPostItemHtml(relateContents[i], userRole));
      }
    });
  }, function (err) {
    $('.main-content-wrapper').append('<div class="container"><h1>404, This content looks not exist!</h1></div>');
    Api.showErrorToast(Api.getErrorMessage(err));
  }, 'view');
})(jQuery);
