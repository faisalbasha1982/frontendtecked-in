/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the home page
 *
 * @author      TCSCODER
 * @version     1.0
 */


(function ($) {

  $.fn.initHomePage = function () {


    /******* show login modal after specified time *******/
    setTimeout(function () {
      $("#modal-home-login").modal("show");
    }, HOME_SHOW_LOGIN_MODAL_TIME);


    /******* how it works section *******/
    (function (head) {
      // re-intialize how it works section on browser resize
      $(window).on("resize", function () {
        initHowitWorks();
      });

      // make how it works section in tab navigation for smaller widths
      var initHowitWorks = function () {
        if (isLessThanBreakpoint({ breakpoint: BREAKPOINTS.medium })) {
          head.attr("data-tabs", "how-it-works").initTabsNavigation();
        } else {
          head.removeAttr("data-tabs");
        }
      };

      initHowitWorks();
    })($(this).find("[data-section='how-it-works'] .section-content"));


    /******* popuular content section *******/
    (function (head) {

      $(window).on("resize", function () {
        head.find(".content-feed-list").slick("unslick");
        initSlickCarousel();
      });

      var initSlickCarousel = function () {

        var defaultSettings = {
          infinite: true,
          prevArrow: "<button class='btn-prev'><span class='icons icon-prev'></span></button>",
          nextArrow: "<button class='btn-next'><span class='icons icon-next'></span></button>"
        };

        var slickSettings = {};

        if (isLessThanBreakpoint({ breakpoint: BREAKPOINTS.small })) {
          slickSettings = $.extend(defaultSettings, { rows: 1, slidesPerRow: 1 });

        } else {
          if (isLessThanBreakpoint({ breakpoint: BREAKPOINTS.medium }) && !isLessThanBreakpoint({ breakpoint: BREAKPOINTS.small })) {
            slickSettings = $.extend(defaultSettings, { rows: 2, slidesPerRow: 2 });

          } else {
            slickSettings = $.extend(defaultSettings, { rows: 2, slidesPerRow: 3 });
          }
        }
        head.find(".content-feed-list").slick(slickSettings);
      };

      initSlickCarousel();

    })($(this).find("[data-section='popular-content'] .section-content"));


    /******* testimonials section *******/
    (function (head) {

      head.find(".testimonial-list").slick({
        inifnite: false,
        arrows: false,
        dots: true,
        slidesToShow: 2,
        slidesToScroll: 2,
        responsive: [
          {
            breakpoint: BREAKPOINTS.medium,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]
      });

    })($(this).find("[data-section='testimonials'] .section-content"));

    var scrollingEffect = function (head) {
      if (!head || !head.offset()) {
        return;
      }
      var categoriesTop = head.offset().top;
      head.find(".bg-image").css("height", head.outerHeight());

      $(window).on("scroll", function () {
        if ($(window).scrollTop() > categoriesTop) {
          head.addClass("fixed-bg");
        } else {
          head.removeClass("fixed-bg");
        }
      });

    };

    /******* scrolling effect for categories section *******/
    (function (head) {
      scrollingEffect(head.find("[data-section='categories']"));
      scrollingEffect(head.find(".main-content .signup-section"));
      $(window).on("resize", function () {
        scrollingEffect(head.find("[data-section='categories']"));
        scrollingEffect(head.find(".main-content .signup-section"));
      });
    })($(this));
  };

  /**
   * get content node html code
   * @param post the post content entity
   * @return {string}
   */
  var getPostHtml = function getPostHtml(post) {
    return '<li>  ' +
      '<div class="content-feed-box">' +
      '<div class="bg-image">' +
      '<img src="' + (post.imagePath || './img/thumb-feed-default.jpg') + '" alt="thumbnail" />' +
      '</div>' +
      '<div class="feed-content">' +
      '<a href="./content-details_non-logged-in.html?id=' + post._id + '" class="feed-name">' + post.title + '</a>      <p class="tech-provider-name">' + post.createdBy.name + '</p>' +
      '<p class="feed-txt">' + post.content.getDescription() + '</p>' +
      '<div class="date-views-row">' +
      '<div class="date"><span class="icons icon-calendar"></span><span>' + moment(post.publishedOn).format('ll') + '</span></div>' +
      '<div class="views">' +
      '<span class="icons icon-views"></span>' +
      '<span>' + post.viewTimes + ' Views</span></div></div></div></div></li>';
  };

  Api.getCategories(function (data) {
    for (let i = 0; i < data.length; i += 1) {
      $('.categories-list').append('<li><span class="icon-wrapper">' +
        '<span class="icons ' + data[i].iconPath + '"></span></span>' +
        '<span class="category-name">' + data[i].name + '</span></li>');
    }
  });
  /**
   * fetch contents
   */
  Api.getPosts({ limit: 3, sortBy: 'viewTimes' }, function (rsp) {
    var data = rsp.items;
    $('.content-feed-list').html('');
    for (var i = 0; i < data.length; i += 1) {
      $('.content-feed-list')
        .append(getPostHtml(data[ i ]));
    }

    $("body").initHomePage();
  });
})
(jQuery);
