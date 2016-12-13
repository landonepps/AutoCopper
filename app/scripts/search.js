'use strict';

(function() {
  var shopUrl = 'http://www.supremenewyork.com';
  var mobileUrl = 'http://www.supremenewyork.com/mobile';
  var stockUrl = 'http://www.supremenewyork.com/mobile_stock.json?c=1';

  let DELAY = 0;

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
            findColorSize(newItems[i]);
            break;
          }
        }
      }
    });
  }

  function findColorSize(product) {
    setTimeout(run, DELAY);
    function run() {
      $.getJSON(`/shop/${product.id}.json`, (data) => {
        var colors = data.styles;
        if (colors === undefined) {
          console.log(`Error: ${product.id}.json doesn't contain 'styles'`);
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
                addItemToCart(data, colors[i], colors[i].sizes[j]);
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
            isNewSearch: true,
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
}());
