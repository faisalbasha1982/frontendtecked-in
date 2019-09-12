/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */

/**
 * the technologyUser user faq pages
 *
 * @author      TCSCODER
 * @version     1.0
 */

var emailAddress = 'support@teckedin.com';

(function ($) {
  
  var offset = 0;
  var bodyId = $("body").attr("id");
  
  /**
   * get faq html node code
   * @param faq the faq entity
   * @return {string}
   */
  var getFaqHtmlContent = function getFaqHtmlContent(faq) {
    return "<li data-expand-collapse=\"expanded\"><div class=\"questions-row\"><div class=\"question\">" + faq.question + "</div><a href=\"javascript:;\" data-expand-trigger class=\"btn btn-expand-collapse\">  <span class=\"icons icon-expand-collapse\"></span></a></div><div class=\"answer\" data-expandable>" + faq.answer + "</div></li>";
  };
  
  $('.email-address').each(function () {
    $(this).html(emailAddress);
    $(this).attr('href', 'mailto:' + emailAddress);
  });
  
  /**
   * fetch FAQ items
   * @param clearList clear the list if is true
   */
  var fetchFAQItems = function (clearList) {
    offset = clearList ? 0 : offset;
    Api.getFAQItems(bodyId === 'page-faq-help-user' ? 'technologyUser' : 'technologyProvider',
      offset, $('.input-search').val(), function (data) {
        if (data.length < Api.defaultLimit) {
          $('.btn-load-more').hide();
        } else {
          $('.btn-load-more').show();
        }
        
        if (clearList) {
          $('.questions-list').html('');
        }
        for (var i = 0; i < data.length; i++) {
          $('.questions-list').append(getFaqHtmlContent(data[ i ]));
        }
      });
  };
  
  $('.input-search').on('input', function () {
    fetchFAQItems(true);
  });
  
  $('.btn-load-more').click(function () {
    offset += Api.defaultLimit;
    fetchFAQItems();
  });
  
  fetchFAQItems();
  
})(jQuery);
