'use strict';

let shopUrl = "http://www.supremenewyork.com";

if ($(document.body).hasClass("show")) {
  console.log("on item page");
  addItemToCart();
}

function addItemToCart() {
  console.log("addItemToCart()");

  // TODO: Only works with Small Medium Large XLarge
  var sizeOptions = document.querySelectorAll("option");
  var sizeValue;

  chrome.storage.local.get(['searchOptions'], results => {
    console.log(sizeOptions);
    console.log("getting item options");
    var itemOptions = results.searchOptions;
    if (itemOptions !== undefined) {

      // select the desired size
      Array.prototype.forEach.call(sizeOptions, (element, index) => {
        if (element.textContent === itemOptions.size) {
          element.selected = true;
          sizeValue = element.value;
        }
      });

      // make sure the correct size is selected
      if ($("#size").val() === sizeValue) {
        console.log("size matches, check out");
        $('input[type="submit"]').click();

        var cartCheck = setInterval(() => {
          var cart = $('#cart.hidden');

          if (cart.length === 0) {
            console.log("added to cart!");
            clearInterval(cartCheck);
            console.log("proceeding to checkout")
            window.location.href = shopUrl + "/checkout";
          } else {
            // console.log("not yet added to cart");
          }
        }, 20);
      } else {
        console.log("size not found");
      }
    }
  });
}
