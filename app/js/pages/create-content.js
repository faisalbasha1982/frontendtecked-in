/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * create content page
 *
 * @author      TCSCODER
 * @version     1.0
 */


/******* create content page functions *******/
(function ($) {
  var allCategories = {};
  var currentCategory = {};
  var scheduleTime = Date.now();
  var scheduleOption = 'immediately';
  var technologyProvider = Api.getCache('technologyProvider');
  var savedPost = null;
  var id = Api.getQueryString('id');
  var needShowSuccessModal = null;
  var wattingUploadCount = 0;
  var oneDayTime = 1000 * 60 * 60 * 24;
  var PostScheduleOptionTime = {
    immediately: 0,
    threeDays: oneDayTime * 3,
    oneWeek: oneDayTime * 7,
    twoWeeks: oneDayTime * 7 * 2,
    threeWeeks: oneDayTime * 7 * 3,
    oneMonth: oneDayTime * 30,
  };
  /**
   * show succeed modal
   * @param id the modal id
   */
  var showSucceedModal = function(id){
    if (!id) return;
    if(wattingUploadCount <= 0){
      $(id).modal('show');
      needShowSuccessModal = null;
    }else{
      needShowSuccessModal = id;
    }
  };
  /**
   * show watting dialog
   */
  var showWaittingModal = function () {
    wattingUploadCount += 1;
    $('#modal-waitting-upload').modal('show');
  };
  /**
   * close upload waitting dialog
   */
  var closeWaittingModal = function () {
    wattingUploadCount -= 1;
    if(wattingUploadCount <= 0){
      wattingUploadCount = 0;
      $('#modal-waitting-upload').modal('hide');
      showSucceedModal(needShowSuccessModal);
    }
  };

  /**
   * create or update content to backend
   * @param draft the draft
   * @param scb the callback when request end
   */
  var save = function (draft, scb) {
    var post = { createdBy: technologyProvider._id };
    var errorMessage = '';

    var checkNull = function (value, message) {
      if (!value || value.toString().trim().length <= 0) {
        errorMessage += message;
      }
      return htmlEncodeJQ(value);
    };

    post.title = checkNull($('input[name="title"]').val(), '- Title is Required. <br/>');
    post.readingTime = checkNull($('input[name="readingTime"]').val(), '- Reading Time is Required. <br/>');
    post.category = checkNull(currentCategory._id, '- Category is Required. <br/>');
    var originContent = CKEDITOR.instances.editor.getData();
    post.content = checkNull(originContent.getDescription().replace(/&nbsp;/g, ''), '- Content is Required. <br/>');
    post.content = originContent;
    var keywords = $('input[name="keywords"]').val();
    if (keywords && keywords.length > 0)
      post.keywords = keywords.split(',');
    post.status = draft ? 'draft' : 'published';
    post.videoUrl = $('input[name="video"]').val();
    post.scheduleOption = scheduleOption;
    post.scheduleTime = scheduleTime;
    post.caseStudy = $('input[name="case-study"]').prop('checked');
    post.lessonsLearned = $('input[name="lessons-learned"]').prop('checked');
    if (!draft) {
      post.publishedOn = new Date();
    }

    if (post.readingTime) {
      checkNull(parseFloat(post.readingTime) > 0, '- Reading Time must be greater than 0 <br/>');
      checkNull(parseFloat(post.readingTime) < 180, '- Reading Time must be less than 3 hours (180 minutes) <br/>');
    }


    if (errorMessage.length > 0) {
      Api.showErrorToast(errorMessage);
    } else {
      if (savedPost) {  // update content
        Api.updatePost(savedPost._id, post, function (p) {
          Api.showSuccessToast('saved succeed.');
          updateToPublishMode(p);
          scb();
        }, function (err) {
          Api.showErrorToast(Api.getErrorMessage(err));
        })
      } else {   // create content
        Api.createPost(post, function (data) {
          savedPost = data;
          updateToPublishMode(data);
          Api.showSuccessToast('saved succeed.');
          scb();
        }, function (err) {
          Api.showErrorToast(Api.getErrorMessage(err));
        })
      }
    }
  };

  /**
   * upload image
   */
  var uploadImage = function () {
    var fileSelectWrapper = $("[data-input='image-upload']");
    var browseUploadButton = fileSelectWrapper.find(".btn-browse-upload");
    var selectedImageWrapper = fileSelectWrapper.find(".selected-image");

    // if selected file and not upload
    if (browseUploadButton.html() === 'Upload' && selectedImageWrapper.is(':hidden')) {
      browseUploadButton.trigger('click');
    }
  };

  /**
   * upload attachment
   */
  var uploadAttachment = function () {
    var attachments = $('input[type=file][name=attachment]');
    if (attachments && attachments[ 0 ].files.length > 0) {
      showWaittingModal();
      Api.uploadImage('/posts/' + savedPost._id + '/upload?type=attachment', attachments[ 0 ].files[ 0 ], function (updatedPost) {
        Api.showSuccessToast('attachment upload succeed.');
        $('input[name="attachment-name"]').val(Api.getFileNameByUrl(updatedPost.attachmentPath));
        // clear attachment file
        attachments.after(attachments.clone().val(""));
        attachments.remove();
        closeWaittingModal();
      }, function (err) {
        closeWaittingModal();
        Api.showErrorToast(Api.getErrorMessage(err));
      });
    }
  };

  var updateToPublishMode = function (post) {
    if(post.status === 'published'){  // Editable fields are: Title, Image and Keywords
      // $('input[name="readingTime"]').attr('disabled', true).addClass('disabled');
      // $('.content-editor-wrapper').addClass('disabled').trumbowyg('disable');
      // $('input[name="attachment"]').attr('disabled', true).addClass('disabled');
      // $('input[name="attachment-name"]').attr('disabled', true).addClass('disabled');
      // $('.btn-dropdown').attr('disabled', true).addClass('disabled');
      // $('.btn-dropdown').unbind('click');
      // $('input[name="video"]').attr('disabled', true).addClass('disabled');
      $('.btn-save-as-draft').addClass('display-none');
    }
  };
  /**
   * fetch post to edit
   */
  var fetchPost = function () {
    if (id) {
      $('.current-page').html('Update Content');

      Api.getPost(id, function (post) {
        $('input[name="title"]').val(htmlDecodeJQ(post.title));
        $('input[name="readingTime"]').val(post.readingTime);
        CKEDITOR.instances.editor.setData(post.content);
        $('input[name="keywords"]').val(post.keywords);
        $('input[name="video"]').val(post.videoUrl);
        currentCategory = allCategories[ post.category._id ];
        updateToPublishMode(post);

        function setDropdownValue() {

        }

        // set category
        $("a[data-id=\"" + post.category._id + "\"]").trigger('click');
        // set schedule
        if (!post.scheduleOption || !post.scheduleTime) {
          $('a[data-id="immediately"]').trigger('click'); // set immediately as default
        } else {
          $("a[data-id=\"" + post.scheduleOption + "\"]").trigger('click');
          scheduleTime = post.scheduleTime;
          $('.schedule-time').html(moment(scheduleTime).format("LL LT"));
        }

        //set image
        if (post.imagePath) {
          $(".selected-image").show();
          $(".selected-image img").attr('src', post.imagePath);
          $('input[name="image-name"]').val(Api.getFileNameByUrl(post.imagePath));
        }

        if (post.attachmentPath) {
          $('input[name="attachment-name"]').val(Api.getFileNameByUrl(post.attachmentPath));
        }

        if(post.caseStudy === 'true'){
          $('input[name="case-study"]').trigger('click');
        }

        if(post.lessonsLearned === 'true'){
          $('input[name="lessons-learned"]').trigger('click');
        }

        savedPost = post;
      }, function (err) {
        $(".no-content").show();
        $('.create-content-form').hide();
        Api.showErrorToast(Api.getErrorMessage(err));
      })
    }
  };

  /**
   * set categories
   */
  Api.getCategories(function (categories) {
    for (var i = 0; i < categories.length; i += 1) {
      allCategories[ categories[ i ]._id ] = categories[ i ];
      $('.dropdown-menu-category ul')
        .append('<li><a href="javascript:;" data-id="' +
          categories[i]._id +
          '">' +
          categories[i].name +
          "</a></li>");
    }
    $('.dropdown-menu-category ul li a').click(function () {
      currentCategory = allCategories[ $(this).attr('data-id') ];
    });
    fetchPost();
  });

  $('.btn-save-as-draft').click(function () {
    save(true, function () {
      uploadImage();
      uploadAttachment();
      showSucceedModal('#modal-confirm-save-as-draft');
    });
  });
  $('.btn-post').click(function () {
    save(false, function () {
      uploadImage();
      uploadAttachment();
      showSucceedModal('#modal-confirm-post');
    })
  });
  $.fn.initCreateContentPage = function () {

    var createContentForm = $(this).find(".create-content-form");
    /******* file select - show image *******/
    var fileSelectWrapper = createContentForm.find("[data-input='image-upload']");
    var browseUploadButton = fileSelectWrapper.find(".btn-browse-upload");
    /******* Case Study and Lessons Learned checkboxes *******/
    var lessonsLearnedCheckBox = createContentForm.find("[data-input='lessons-learned']");
    var caseStudyCheckBox = createContentForm.find("[data-input='case-study']");
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

    //trigger file upload when click on browse button
    browseUploadButton.on("click", function () {
      fileSelectWrapper.find("input[type=file]").trigger("click");
    });
    fileSelectWrapper.on("change", "input[type=file][name=attachment]", function () {
      if ($(this)[ 0 ].files.length <= 0) {
        $('input[name="attachment-name"]').val('');
      } else {
        $('input[name="attachment-name"]').val($(this)[ 0 ].files[ 0 ].name);
        if(savedPost){
          uploadAttachment();
        }
      }
    });

    $('.selected-image img').click(function () {
      window.open($(this).attr('src'), "_blank");
    });


    // show selected image
    fileSelectWrapper.on("change", "input[type=file][name=image]", function () {
      var input = this;
      browseUploadButton.text("Upload");
      var selectedImageWrapper = fileSelectWrapper.find(".selected-image");
      selectedImageWrapper.hide();
      if ($(this)[ 0 ].files.length <= 0) {
        $('input[name="image-name"]').val('');
        browseUploadButton.text("Select");
        return;
      } else {
        $('input[name="image-name"]').val($(this)[ 0 ].files[ 0 ].name);
      }
      browseUploadButton.off("click").on("click", function () {
        if (!savedPost) {
          Api.showErrorToast('You must save content first!');
          return;
        }
        if (input.files && input.files[ 0 ]) {
          showWaittingModal();
          Api.uploadImage('/posts/' + savedPost._id + '/upload?type=image', input.files[ 0 ], function (updatedPost) {
            Api.showSuccessToast('image upload succeed.');
            selectedImageWrapper.find("img").attr('src', updatedPost.imagePath);
            $('input[name="image-name"]').val(Api.getFileNameByUrl(updatedPost.imagePath));
            selectedImageWrapper.show();
            closeWaittingModal();
          }, function (err) {
            Api.showErrorToast(Api.getErrorMessage(err));
            closeWaittingModal();
          });
        }
      });
      if(savedPost){
        uploadImage();
      }
    });
    /******* content editor *******/
    CKEDITOR.replace('editor',{});
  };


  $('.btn-preview').click(function () {
    var title = $('input[name="title"]').val();
    var readingTime = $('input[name="readingTime"]').val();
    var content = CKEDITOR.instances.editor.getData();

    if (title) {
      $('#preview-title').html(title);
    }
    if (readingTime) {
      $("#preview-reading-time").html(readingTime + " min read");
    }

    if (currentCategory) {
      $('#preview-category').html(currentCategory.name);
    }
    if (content) {
      $('#preview-content').html(content.replace(/<a /g,'<a target="_blank" '));
    }

    const images = $('input[type=file][name=image]');
    if (images && images[ 0 ].files.length > 0) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $(".content-banner-image").css(
          "background",
          "url(" + e.target.result + ") center no-repeat"
        );
      };
      reader.readAsDataURL(images[ 0 ].files[ 0 ]);
    } else {
      var imgSrc = $('.selected-image img').attr('src');
      if (imgSrc !== '#') {
        $(".content-banner-image").css(
          "background",
          "url(" + imgSrc + ") center no-repeat"
        );
      }
    }
    if(!savedPost){
      $('#preview-alert-dialog').modal('show');
    }else{
      window.open('content-details_provider.html?mode=preview&id='+savedPost._id,'_blank');
    }
    // $('#modal-preview-post').modal('show');
  });

  $('.schedule-dropdown-item').each(function () {
    $(this).click(function () {
      var option = $(this).attr('data-id');
      scheduleOption = option;
      scheduleTime = PostScheduleOptionTime[option] + Date.now();
      $('.schedule-time').html(moment(scheduleTime).format("LL LT"));
    });

  });

  $('.content-editor-wrapper').html('');
  $("body").initCreateContentPage();

  if (!id) {
    $('a[data-id="immediately"]').trigger('click');
  }
})(jQuery);
