'use strict';

(function() {
  var shopUrl = 'http://www.supremenewyork.com';
  var mobileUrl = 'http://www.supremenewyork.com/mobile';
  var stockUrl = 'http://www.supremenewyork.com/mobile_stock.json?c=1';

  let DELAY = 0;
  let INTERVAL = 5000;

  var itemRegex;
  var colorRegex;
  var desiredSize;
  var searchTabId;

  startSearch();

  function startSearch() {
    chrome.storage.local.get(['options', 'prevLinks', 'searchTabId'], results => {
      var options = results.options;
      itemRegex = new RegExp(options.keyword, "i");
      colorRegex = new RegExp(options.color, "i");
      desiredSize = options.size;
      searchTabId = results.searchTabId;
      findProduct();
    });
  }

  function findProduct() {
    $.ajax({
      dataType: "json",
      url: stockUrl,
      ifModified: true,
      success: (data, textStatus, xhr) => {
        // first check if the file has changed
        if (xhr.status === 304) {
          tryAgain("Store not updated.");
          return;
        }

        // make sure JSON object is formatted correctly.
        if (!data || !data.products_and_categories) {
          console.log("Error: unexpected data format.");
          return;
        }

        // TODO: Allow searching for items that aren't new
        var newItems = data.products_and_categories.new;
        var isFound = false;

        // check that the new items category exists
        if (newItems === undefined) {
          console.log("Error: JSON object doesn't contain 'new' category");
          return;
        }

        // find the desired item
        for (var i = 0; i < newItems.length; i++) {
          if (itemRegex.test(newItems[i].name)) {
            isFound = true;
            console.log(`Found product: ${newItems[i].name}`);
            findItem(newItems[i]);
            break;
          }
        }

        // if not found, try again
        if (!isFound) {
          tryAgain("Product not found.");
        }
      }
    });
  }

  function findItem(product) {
    setTimeout(run, DELAY);

    function run() {
      $.getJSON(`/shop/${product.id}.json`, (data) => {

        var colors = data.styles;
        var isFound = false;

        if (colors === undefined) {
          console.log(`Error: ${product.id}.json doesn't contain array 'styles'`);
          return;
        }

        for (var i = 0; i < colors.length; i++) {
          if (colorRegex.test(colors[i].name)) {
            console.log(`Found color: ${colors[i].name}`);

            if (colors[i].sizes === undefined) {
              console.log(`Error: ${colors[i]} doesn't contain 'sizes'`);
              break;
            }

            if (colors[i].sizes.length === 1) {
              console.log(`Only one size: (${colors[i].sizes[0].name}); adding to cart`)
              isFound = true;
              addItemToCart(data, colors[i], colors[i].sizes[0]);
              break;
            }

            for (var j = 0; j < colors[i].sizes.length; j++) {
              if (desiredSize === colors[i].sizes[j].name) {
                console.log(`Found size: ${colors[i].sizes[j].name}`);
                isFound = true;
                addItemToCart(data, colors[i], colors[i].sizes[j]);
                break;
              }
            }
          }
        }
      });
    }
  }

  function addItemToCart(productInfo, colorInfo, sizeInfo) {
    var url = "/shop/" + productInfo.id + "/add.json";

    setTimeout(run, DELAY);

    function run() {
      $.ajax({
        type: "POST",
        url: url,
        data: {
          size: sizeInfo.id,
          qty: 1
        },
        dataType: "json",
        success: function(data) {
          var item;
          for (var i = 0; i < data.length; i++) {
            if (data[i].size_id === sizeInfo.id) {
              item = data[i];
              break;
            }
          }

          if (item === undefined) {
            console.log("Error adding item to cart");
            return;
          }

          // great, now lets get access to the Supreme.app object
          // var hackCode = `var o = {
          //   apparel: ${productInfo.apparel},
          //   can_buy_multiple: ${productInfo.can_buy_multiple},
          //   canada_blocked: ${productInfo.canada_blocked},
          //   cod_blocked: ${productInfo.cod_blocked},
          //   handling: ${productInfo.handling},
          //   id: ${item.size_id},
          //   name: "${sizeInfo.name}",
          //   no_free_shipping: ${productInfo.no_free_shipping},
          //   purchasable_qty: ${productInfo.purchasable_qty},
          //   qty: 1, // currently only supports buying one
          //   stock_level: ${sizeInfo.stock_level},
          //   style: {
          //     additional_images: ${colorInfo.additional.length > 0 ? colorInfo.additional : "[]"},
          //     description: ${colorInfo.description},
          //     id: ${item.style_id},
          //     image_url: "${colorInfo.image_url_hi}",
          //     initialPhotoIndex: 0,
          //     lower_res_zoom: "${colorInfo.image_url}",
          //     name: "${colorInfo.name}",
          //     product: null,
          //     product_id: "${item.product_id}",
          //     sizes: null,
          //     swatch_url: "${colorInfo.swatch_url_hi}",
          //     zoomed_url: "${colorInfo.mobile_zoomed_url_hi}"
          //   }
          // }
          // localStorage.setItem(o.id, JSON.stringify(o));
          // Supreme.app.cart.getSizeFromLocalStorage(o.id);
          // localStorage.setItem(o.id + "_qty", 1); // only support adding 1 item
          // Supreme.app.cart.trigger("itemAdded")`;
          // var script = document.createElement('script');
          // script.textContent = hackCode;
          // (document.head || document.documentElement).appendChild(script);
          // script.remove();

          // we want to stop the search when the item is added
          chrome.storage.local.set({
            searchTabId: -1
          }, () => {
            // for normal checkout
            setTimeout(() => {
              window.location.href = shopUrl + "/checkout"
            }, DELAY);
            // for mobile checkout (wait until checkout button appears)
            // setTimeout(() => {window.location.href = mobileUrl + "#checkout"}, DELAY);
          });
        },
        error: function() {
          console.log("Error adding item to cart")
        }
      });
    }
  }

  function tryAgain(msg) {

    console.log(`${msg ? msg + " " : ""}Trying again in ${INTERVAL}ms`);
    setTimeout(startSearch, INTERVAL);
  }
}());
