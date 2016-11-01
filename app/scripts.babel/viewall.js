'use strict';

let shopUrl = "http://www.supremenewyork.com";

var itemRegex;
var colorRegex;

if ($(document.body).hasClass("view-all")) {

  console.log("on view all page");

  // make sold out tag visible
  $(".sold_out_tag").toggle();

  chrome.storage.local.get(['searchOptions'], results => {
    var itemOptions = results.searchOptions;
    if (itemOptions.searchEnabled === true) {
      console.log("searchEnabled = " + itemOptions.searchEnabled);
      itemRegex = new RegExp(itemOptions.keyword, "i");
      colorRegex = new RegExp(itemOptions.color, "i");
      searchLinks();
    }
  });
}

function searchLinks() {
  console.log("searchLinks()");

  var itemFound = false;
  var links = [];
  $('article a[href]').each((i, element) => {
    links.push($(element).attr('href'));
  });

  // keep track of checked links
  var checkedLinkCount = 0;

  $(links).each((index, link) => {
    // get the html
    $.ajax({
      url: link,
      success: (html) => {
        var name = $(html).find('[itemprop="name"]:first').text();
        if (itemRegex.test(name)) {
          var color = $(html).find('[itemprop="model"]:first').text();
          if (colorRegex.test(color)) {
            // if name and color match, then we found it!
            itemFound = true;
            console.log(name + " " + color)
            console.log(link);
            // load the page
            window.location.href = shopUrl + link;
          }
        }

        // we checked a link, so increment the count
        checkedLinkCount++;

        // if we checked all the links and didn't find it, refresh
        // TODO: refresh might cause banning
        // if (checkedLinkCount === links.length && itemFound === false) {
        //   console.log("item not found");
        //   setTimeout(() => {
        //     window.location.reload()
        //   }, 100 + 100 * Math.random());
        // }
      }
    });
  });
}
