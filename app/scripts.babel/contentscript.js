'use strict';

// make sold out tag visible
$(".sold_out_tag").toggle();

let shopUrl = "http://www.supremenewyork.com";

var itemRegex;
var colorRegex;

if ($(document.body).hasClass("view-all")) {
  console.log("on view all page");

  chrome.storage.local.get(['searchOptions'], results => {
    var itemOptions = results.searchOptions;
    if (itemOptions.searchEnabled === true) {
      console.log("searchEnabled = " + itemOptions.searchEnabled);
      itemRegex = new RegExp(itemOptions.keyword, "i");
      colorRegex = new RegExp(itemOptions.color, "i");
      searchLinks();
    }
  });
} else if ($(document.body).hasClass("show")) {
  console.log("on item page");
  addItemToCart();
} else if (window.location.href.indexOf("checkout") !== -1) {
  console.log("on checkout page");
  checkout();
}

function addItemToCart() {
  console.log("addItemToCart()");

  // select desired size
  // TODO: Only works with Small Medium Large XLarge
  var sizeOptions = document.querySelectorAll("option");
  var sizeValue;

  chrome.storage.local.get(['searchOptions'], results => {
    var itemOptions = results.searchOptions;
    if (itemOptions !== undefined) {
      Array.prototype.forEach.call(sizeOptions, (element, index) => {
        if (element.textContent === itemOptions.size) {
          element.selected = true;
          sizeValue = element.value;
        }

        if ($("#size").val() === sizeValue) {
          console.log("size matches, check out");
          $('input[type="submit"]').click();

          var cartCheck = setInterval(() => {
            var cart = $('#cart.hidden');

            console.log(cart.length)
            if (cart.length === 0) {
              console.log("cart here");
              clearInterval(cartCheck);
              window.location.href = shopUrl + "/checkout";
            } else {
              console.log("cart not loaded yet");
            }
          }, 10);
        }
      });
    }
  });
}

function checkout() {
  console.log("checkout()");

  chrome.storage.local.get(['options', 'searchOptions'], results => {
    var userInfo = results.options;
    var options = results.searchOptions;

    userInfo["card"] = sjcl.decrypt(/* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, userInfo["card"]);
    userInfo["cvv"] = sjcl.decrypt(/* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, userInfo["cvv"]);

    if (userInfo !== undefined) {
      $("input[id*='last']").val(userInfo.lastName)
      $("input[id*='first']").val(userInfo.firstName)
      $("input[id*='email']").val(userInfo.email)
      $("input[id*='tel']").val(userInfo.phone)
      // TODO The space needs to be removed for other regions
      $("select[id*='state']").val(" " + userInfo.state)
      $("input[id*='city']").val(userInfo.city)
      $("input[id*='addr']").val(userInfo.address)
      $("input[id*='zip']").val(userInfo.zip)
      $("select[id*='type']").val(userInfo.cardType);
      $("input[id*='cnb']").val(userInfo.card);
      $("select[id*='month']").val(userInfo.expMonth);
      $("select[id*='year']").val(userInfo.expYear);
      $("input[id*='vval'],input[id*='verif']").val(userInfo.cvv);
      $("input[id*='terms']").prop('checked', true);

      var event = new UIEvent("change", {
        "view": window,
        "bubbles": true,
        "cancelable": true
      });

      // trigger change event to update mask (unmask().mask("9999 9999..."))
      document.getElementById("credit_card_type").dispatchEvent(event);
    }

    // TODO: detect when checkout failed and don't continue refreshing
    if (options !== undefined) {
      if (options.checkoutEnabled === true) {
        console.log("completing checkout")
        $("input[name*=commit]").click();
      }
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
