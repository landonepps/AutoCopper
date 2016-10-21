'use strict';

// make sold out tag visible
$(".sold_out_tag").toggle();

let shopUrl = "http://www.supremenewyork.com";

// var itemRegex, colorRegex;

chrome.storage.local.get(['searchOptions'], function(results) {
  var options = results.searchOptions;

  if (options.searchEnabled === true) {
    var itemRegex = new RegExp(options.keyword, "i");
    var colorRegex = new RegExp(options.color, "i");

    if (window.location.href.indexOf("all") != -1) {
      var links = [];
      $('article a[href]').each(function() {
        links.push($(this).attr('href'));
      });
      searchLinks(links, itemRegex, colorRegex);
    }
  }
});

function searchLinks(links, itemRegex, colorRegex) {
  $(links).each(function(index, link) {
    var request = $.get(link, null, function(data, textStatus) {
      if (data) {
        var name = $(data).find('[itemprop="name"]:first').text();
        if (itemRegex.test(name)) {
          var color = $(data).find('[itemprop="model"]:first').text();
          if (colorRegex.test(color)) {
            console.log(name + " " + color)
            console.log(link);
            window.location = shopUrl + link;
          }
        }
      }
    });
  });
}
