'use strict';

//TODO: when I load the item page from a search tab, I should stop the search

(function() {
  let shopUrl = "http://www.supremenewyork.com";

  if ($(document.body).hasClass("show")) {
    console.log("on item page");

    // we want to stop the search (if running) when an item is loaded
    chrome.storage.local.set({
      isNewSearch: true,
      searchTabId: -1
    });
    addItemToCart();
  }

  function addItemToCart() {
    console.log("addItemToCart()");

    // TODO: Only works with Small Medium Large XLarge
    var sizeOptions = document.querySelectorAll("option");
    var sizeValue;

    // the number of items currently in the cart
    var itemsOriginallyInCart = 0;

    // check if any items in cart
    if ($('#cart.hidden').length === 0) {
      // var itemCountRegex = /([0-9]+) item.*/;
      // itemsOriginallyInCart = Number(itemCountRegex.exec($('#items-count').text())[1]);

      // no need to use regex after all
      itemsOriginallyInCart = parseInt($('#items-count').text());
      console.log(itemsOriginallyInCart);
    }

    chrome.storage.local.get(['options'], results => {
      console.log("getting options");
      var options = results.options;
      if (options !== undefined) {

        // select the desired size
        Array.prototype.forEach.call(sizeOptions, (element, index) => {
          if (element.textContent === options.size) {
            element.selected = true;
            sizeValue = element.value;
          }
        });

        // make sure the correct size is selected
        if (options.addToCartEnabled &&
          $("#size").length != 0 &&
          $("#size").val() === sizeValue) {

          console.log("size matches, check out");
          $('input[type="submit"]').click();

          var cartCheck = setInterval(() => {
            // cart.length will equal 0 if it is no longer hidden
            var cart = $('#cart.hidden');

            // if cart appeared, or the number of items in the cart increased
            if ((itemsOriginallyInCart === 0 && cart.length === 0) ||
              (itemsOriginallyInCart < parseInt($('#items-count').text()))) {
              console.log("added to cart!");
              clearInterval(cartCheck);
              console.log("proceeding to checkout")
              window.location.href = shopUrl + "/checkout";
            } else {
              console.log("not yet added to cart");
            }
          }, 50);
        } else {
          console.log("size not found");
        }
      }
    });
  }
}());
