'use strict';

// make sold out tag visible
$(".sold_out_tag").toggle();

var password = 'vSfxY4tKkguBqGCH2U7eA2rm';

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

  chrome.storage.local.get(['options'], results => {
    var options = results.options;

    options["card"] = sjcl.decrypt(password, options["card"]);
    options["cvv"] = sjcl.decrypt(password, options["cvv"]);

    if (options !== undefined) {
      $("input[id*='last']").val(options.lastName)
      $("input[id*='first']").val(options.firstName)
      $("input[id*='email']").val(options.email)
      $("input[id*='tel']").val(options.phone)
      // TODO The space needs to be removed for other regions
      $("select[id*='state']").val(" " + options.state)
      $("input[id*='city']").val(options.city)
      $("input[id*='addr']").val(options.address)
      $("input[id*='zip']").val(options.zip)
      // TODO card name lowercase (should give dropdown instead of type in)
      $("input[id*='type']").val(options.cardType);
      $("input[id*='cnb']").val(options.card);
      // TODO no zero in front of month = not working (form validation?)
      $("select[id*='month']").val(options.expMonth);
      $("select[id*='year']").val(options.expYear);
      $("input[id*='vval'],input[id*='verif']").val(options.cvv);
      // document.getElementById("cart-vval").value = options.cvv;
      $("input[id*='terms']").prop('checked', true);

      var event = new UIEvent("change", {
        "view": window,
        "bubbles": true,
        "cancelable": true
      });

      // trigger change event to update mask (unmask().mask("9999 9999..."))
      document.getElementById("credit_card_type").dispatchEvent(event);
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
