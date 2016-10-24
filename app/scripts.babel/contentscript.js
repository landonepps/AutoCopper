'use strict';

// make sold out tag visible
$(".sold_out_tag").toggle();

let shopUrl = "http://www.supremenewyork.com";

var itemRegex;
var colorRegex;

chrome.storage.local.get(['searchOptions'], results => {
  var itemOptions = results.searchOptions;

  if ($(document.body).hasClass("view-all")) {
    console.log("on view all page");
    if (itemOptions.searchEnabled === true) {
      console.log("searchEnabled = " + itemOptions.searchEnabled);
      itemRegex = new RegExp(itemOptions.keyword, "i");
      colorRegex = new RegExp(itemOptions.color, "i");
      searchLinks();
    }
  }

  if ($(document.body).hasClass("show")) {
    console.log("on item page");

    // select desired size
    // TODO: Only works with Small Medium Large XLarge
    var sizeOptions = document.querySelectorAll("option");
    var sizeValue;

    Array.prototype.forEach.call(sizeOptions, (element, index) => {
      if (element.textContent === itemOptions.size) {
        element.selected = true;
        sizeValue = element.value;
      }
    });

    if ($("#size").val() === sizeValue) {
      console.log("size matches, check out");
      $('input[type="submit"]').click();

      var cartCheck = setInterval(() => {
        var cart = $('#cart.hidden');

        console.log(cart.length)
        if (cart.length === 0) {
          console.log("cart here");
          clearInterval(cartCheck);
          window.location.href = shopUrl + "/shop/cart";
        } else {
          console.log("cart not loaded yet");
        }
      }, 10);
    }
  }
});


// if on item page


function searchLinks() {
  console.log("searchLinks()");

  var itemFound = false;
  var links = [];
  $('article a[href]').each(() => {
    links.push($(this).attr('href'));
  });

  // keep track of checked links
  var checkedLinkCount = 0;

  $(links).each((index, link) => {
    // get the html
    var request = $.get(link, null, (html, textStatus) => {
      if (html) {
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
        if (checkedLinkCount === links.length && itemFound === false) {
          console.log("item not found");
          setTimeout(() => {
            window.location.reload()
          }, 100 + 100 * Math.random());
        }
      }
    });
  });
}
