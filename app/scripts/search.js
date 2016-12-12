'use strict';

(function() {
  var shopUrl = 'http://www.supremenewyork.com';
  var mobileUrl = 'http://www.supremenewyork.com/mobile';
  var stockUrl = 'http://www.supremenewyork.com/mobile_stock.json?c=1';

  var itemRegex;
  var colorRegex;
  var desiredSize;
  var isNewSearch;
  var searchTabId;

  chrome.storage.local.get(['options', 'prevLinks', 'isNewSearch', 'searchTabId'], results => {
    var options = results.options;
    itemRegex = new RegExp(options.keyword, "i");
    colorRegex = new RegExp(options.color, "i");
    desiredSize = options.size;
    isNewSearch = results.isNewSearch;
    searchTabId = results.searchTabId;
    startSearch();
  });

  function startSearch() {
    console.log("starting search");

    $.getJSON(stockUrl, (data) => {
      if (data.products_and_categories !== undefined) {

        // TODO: Allow searching for items that aren't new
        var newItems = data.products_and_categories.new;

        if (newItems === undefined) {
          console.log("Error: JSON object doesn't contain 'new' category");
          return;
        }

        for (var i = 0; i < newItems.length; i++) {
          if (itemRegex.test(newItems[i].name)) {
            console.log(`Found item: ${newItems[i].name}`);
            findColorSize(newItems[i].id);
            break;
          }
        }
      }
    });
  }

  function findColorSize(productId) {
    $.getJSON(`/shop/${productId}.json`, (data) => {
      var colors = data.styles;
      if (colors === undefined) {
        console.log(`Error: ${productId}.json doesn't contain 'styles'`);
        return;
      }

      for (var i = 0; i < colors.length; i++) {
        if (colorRegex.test(colors[i].name)) {
          console.log(`Found color: ${colors[i].name}`);
          if (colors[i].sizes === undefined) {
            console.log(`Error: ${colors[i]} doesn't contain 'sizes'`);
            break;
          }
          for (var j = 0; j < colors[i].sizes.length; j++) {
            if (desiredSize === colors[i].sizes[j].name) {
              console.log(`Found size: ${colors[i].sizes[j].name}`);
              addItemToCart(productId, colors[i].id, colors[i].sizes[j].id);
            }
          }
        }
      }

    });
  }

  function addItemToCart(productId, colorId, sizeId) {
    var url = "/shop/" + productId + "/add.json";
    $.ajax({
      type: "POST",
      url: url,
      data: {
        size: sizeId,
        qty: 1
      },
      dataType: "json",
      success: function(data) {
        var item;
        for(var i = 0; i < data.length; i++) {
          if (data[i].size_id === sizeId) {
            item = data[i];
            break;
          }
        }

        if (item === undefined) {
          console.log("Error adding item to cart");
          return;
        }

        // we want to stop the search when the item is added
        chrome.storage.local.set({
          // isNewSearch: true,
          // searchTabId: -1
        }, () => {
          console.log(window);
          console.log(window.Supreme);
          window.Supreme.app.cart.trigger("itemAdded");
          window.Supreme.app.cart.trigger("doneModifyingCart");
          // window.location.href = shopUrl + "/checkout";
        });
      },
      error: function() {
        console.log("Error adding item to cart")
      }
    })
  }
}());
