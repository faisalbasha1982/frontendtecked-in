/******* GLOBAL VARIABLES AND FUCNTIONS *******/
var BREAKPOINTS = {
  verySmall: "375",
  small: "768",
  medium: "992",
  large: "1200"
};

var DEFAULT_BREAKPPOINT = BREAKPOINTS.medium;
var HOME_SHOW_LOGIN_MODAL_TIME = 100000; //10 seconds

String.prototype.stripHTML = function () {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = this;
  return tmp.textContent || tmp.innerText || "";
};


String.prototype.trunc = String.prototype.trunc ||
  function (m) {
    return (this.length > m)
      ? this.trim().substring(0, m).split(" ").slice(0, -1).join(" ") + "..."
      : this;
  };

String.prototype.getDescription = function () {
  return this.stripHTML().trunc(150);
};

/**
 * encode javascript code to normal text
 * @param str t
 */
function htmlEncodeJQ ( str ) {
  return $('<span/>').text( str ).html();
}

/**
 * decode normal text to html code
 * @param str
 */
function htmlDecodeJQ ( str ) {
  return $('<span/>').html( str ).text();
}

/*
 * returns true if browser window width is less than a specified width -- with DEFAULT_BREAKPOINT as default
 * @param {type} options
 * @returns {MediaQueryList.matches|Boolean}
 */
function isLessThanBreakpoint(options) {
  var defaults = {
    breakpoint: DEFAULT_BREAKPPOINT
  };

  var opts = $.extend(defaults, options);
  return $(window).width() < opts.breakpoint;
}


/******* modal functions *******/
(function ($) {
  $.fn.modal = function (option) {
    var modal = $(this);
    switch (option) {
      case "show":
        $("body").attr("data-modal-open", "is-open");
        modal.attr("data-modal", "is-open");
        break;
      case "hide":
        $("body").attr("data-modal-open", "is-closed");
        modal.attr("data-modal", "is-closed");
        break;
    }
  };
})(jQuery);

/******* show password hint when clicked on eye icon *******/
(function ($) {
  $.fn.passwordHint = function () {
    var wrapper = $(this).closest(".input-password-wrapper");
    var inputElement = wrapper.find("input[type=password]");
    var showPassword = false;
    wrapper.on("click", ".icon-password", function () {
      if (showPassword) {
        inputElement.attr("type", "password");
      } else {
        inputElement.attr("type", "text");
      }
      showPassword = !showPassword;
      inputElement.focus();
    });
  };
})(jQuery);

/******* intialize page modals *******/
(function () {

  $.fn.initModals = function () {

    // open modals on trigger
    $("body").on("click", "[data-modal-trigger]", function () {
      var target = $(this).attr("data-modal-trigger");
      $(target).modal("show");
    });

    // close modals
    $("body").on("click", "[data-modal] [data-close-modal]", function () {
      $(this).closest("[data-modal]").modal("hide");
    });

    // close modal on click outside of it
    $("body").on("click", "[data-modal='is-open']", function (e) {
      if (!$(e.target).closest(".modal").length > 0) {
        $(this).modal("hide");
      }
    });

  };
})(jQuery);


/******* intialize nav side panel *******/
(function ($) {

  $.fn.initNavSidePanel = function () {

    var isOpen = false;
    var toggleBtn = $("#main-header .js-toggle-sidebar");

    toggleBtn.on("click", function () {
      isOpen = !isOpen;
      $("body").attr("data-nav-side-panel", isOpen);
    });

    // close popup on click outside
    $(".page-wrapper").on("click", function (e) {
      if (!$(e.target).closest(".js-toggle-sidebar").is(toggleBtn)) {
        isOpen = false;
        $("body").attr("data-nav-side-panel", isOpen);
      }
    });

  };
})(jQuery);


/******* intialize dropdown functions  *******/
(function ($) {

  $.fn.initDropdown = function () {

    var dropdown = $(this);
    var dropdownBtn = dropdown.find(".btn-dropdown");
    var dropdownMenu = dropdown.find(".dropdown-menu");

    // toggle dropdown on clicking dropdown button
    dropdownBtn.on("click", function () {
      dropdown.toggleClass("is-open");
    });

    // update selected option
    dropdownMenu.on("click", "li:not(.selected-option)", function () {
      var selectedOption = $(this).find("a").text();

      // update dropdown menu
      dropdownMenu.find(".selected-option").removeClass("selected-option");
      $(this).addClass("selected-option");

      //update dropdown button
      dropdownBtn.find(".selected-option").removeClass("placeholder").text(selectedOption);

      // close dropdown
      dropdown.removeClass("is-open");

      // trigger a change event on the dropdown
      dropdown.trigger("change");
    });

    // close dropdown on click outside
    $("body").on("click", function (e) {
      if (!$(e.target).closest(".dropdown").is(dropdown)) {
        dropdown.removeClass("is-open");
      }
    });
  };
})(jQuery);


/******* implements expand collapse of sections *******/
(function ($) {

  $.fn.expandCollapse = function () {

    var head = $(this);
    var currentState = head.attr("data-expand-collapse");

    // expand/collapse on clicking triggers
    currentState = (currentState === "expanded") ? "collapsed" : "expanded";
    head.attr("data-expand-collapse", currentState);

  };
})(jQuery);


(function ($) {

  /**
   * initalize popup function
   * @param dontCloseOutSide it will don't close while click outside if dontCloseOutSide is true
   */
  $.fn.initPopups = function (dontCloseOutSide) {

    var popupWrapper = $(this);
    var popupTrigger = popupWrapper.find("[data-popup-trigger]");

    popupTrigger.on("click", function () {
      popupWrapper.toggleClass("is-open");
    });

    // close popup on clicking close icon or any other button
    popupWrapper.on("click", "[data-close-popup]", function () {
      popupWrapper.removeClass("is-open");
    });

    // close popup on click outside
    if (!dontCloseOutSide)
      $("body").on("click", function (e) {

        // ignore selecte2 event
        if ($(e.target).attr('class') === 'select2-search__field') {
          return;
        }
        if (!$(e.target).closest("[data-popup]").is(popupWrapper)
          && !$(e.target).closest(".ui-datepicker").length > 0) {
          popupWrapper.removeClass("is-open");
        }
      });
  };
})(jQuery);


/******* intialize tabs navigation *******/
(function ($) {

  $.fn.initTabsNavigation = function () {

    var tabs = $(this).attr("data-tabs");
    var tabsNav = $(this).find("[data-tabs-navigation=" + tabs + "]");
    var tabsContent = $(this).find("[data-tabs-content=" + tabs + "]");

    // navigating tabs
    tabsNav.on("click", "[data-tab-target]:not(.is-active)", function () {

      // change active tab nav
      tabsNav.find(".is-active").removeClass("is-active");
      $(this).addClass("is-active");

      // show new active tab
      var target = $(this).attr("data-tab-target");
      tabsContent.children(".is-active").removeClass("is-active");
      tabsContent.children(target).addClass("is-active");
    });
  };
})(jQuery);


/******* initialize filter panel functions *******/
(function ($) {

  $.fn.initFilterPanel = function () {

    var filterPanel = $(this);

    //reset button
    filterPanel.on("click", ".btn-reset", function () {
      // reset checkboxes
      filterPanel.find("input[type=checkbox]").prop("checked", false);
      filterPanel.find(".filter-states-list").val(null).trigger('change');
      filterPanel.find("input[id=search-state]").val('');
      filterPanel.find("input[id=search-product]").val('');
      filterPanel.find("input[id=search-service]").val('');
      filterPanel.find("input[id=additionalOffice]").val('');
    });


    // master check - all function
    filterPanel.on("change", "[data-sub-filter='category'] input[type=checkbox]", function () {
      var masterCheck = filterPanel.find("[data-sub-filter='category'] .master-check");
      if ($(this).closest(".master-check").length > 0) {
        if ($(this).prop("checked")) {
          masterCheck.siblings("li").each(function () {
            $(this).find("input").prop("checked", false);
          });
        }
      } else {
        if ($(this).prop("checked")) {
          masterCheck.find("input").prop("checked", false);
        }
      }
    });

    // initialize datepicker on date range input elements
    // filterPanel.find("[data-sub-filter='published-date'] input[type=text]").datepicker({
    //   dateFormat: "yy-mm-dd"
    // });
  };
})(jQuery);


/******* initialize notifications panel functions *******/
(function ($) {
  $.fn.initNotifications = function () {
    var notificationsWrapper = $(this);
    // clear notifications on clicking clear button
    notificationsWrapper.on("click", ".btn-clear", function () {
      var number = parseInt(notificationsWrapper.find(".btn-notification .number").text());
      $('.notifications-list li').each(function () {
        var notificationId = $(this).attr('data-id');
        Api.updateNotifications(notificationId, { status: 'read' }, function () {
          $('.notifications-list li[data-id="' + notificationId + '"]').remove();
          number -= 1;
          notificationsWrapper.find(".btn-notification .number").text(number);
        });
      })
    });
  };
})(jQuery);


// init page modals
$("body").initModals();


// initialze dropdown functions on dropdowns
$(".dropdown").each(function () {
  $(this).initDropdown();
});

// imlpement expand-collapse sections
$("body").on("click", "[data-expand-collapse] [data-expand-trigger]", function () {
  $(this).closest("[data-expand-collapse]").expandCollapse();
});

// intialize passowrd hint functions on password fields
$(".input-password-wrapper input[type=password]").each(function () {
  $(this).passwordHint();
});


// intialize tabs navigation
$("[data-tabs]").each(function () {
  $(this).initTabsNavigation();
});

// initialize filter panel functions
$(".filter-panel").each(function () {
  $(this).initFilterPanel();
});


setTimeout(function () {
  $('.page-wrapper').append('<div id="footer-container"></div>');
  $('#footer-container').load('/templates/footer.html');
}, 200);

(function($) {
  var head = $($('head')[0]);
  head.append('<link rel="icon" type="image/x-icon" href="favicon.ico"/>');
  head.append('<link rel="shortcut icon" type="image/x-icon" href="favicon.ico"/>');
})($);
