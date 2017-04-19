'use strict';

(function () {
  const shopUrl = 'http://www.supremenewyork.com';
  const mobileUrl = 'http://www.supremenewyork.com/mobile';
  const stockUrl = 'http://www.supremenewyork.com/mobile_stock.json';

  const DELAY = 150;
  const CHECK_INTERVAL = 1500;

  let itemRegex;
  let colorRegex;
  let desiredSize;
  let searchTabId;

  // rudimentary delay waiting for 11:00 local time
  let d = new Date();
  let dropTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 11, 0, 0, 0);
  // if (dropTime - d > 0) {
  //   // if it's not already past 11 today
  //   console.log(dropTime - d);
  // setTimeout(startSearch, dropTime - d);
  // } else {
  //   // wait till 11 tomorrow.
  //   dropTime = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 11, 0, 0, 0);
  //   setTimeout(startSearch, dropTime - d);
  // }
  setTimeout(startSearch, dropTime - d);

  function startSearch() {
    chrome.storage.local.get(['options', 'prevLinks', 'searchTabId'], results => {
      let options = results.options;
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
          console.log("Error: json object doesn't contain 'products_and_categories'");
          return;
        }

        let allItems = [];
        Object.keys(data.products_and_categories).forEach((key, index) => {
          let category = data.products_and_categories[key];
          if (Array.isArray(category)) {
            allItems = allItems.concat(category);
          }
        });

        let isFound = false;

        // check that the new items category exists
        if (allItems.length === 0) {
          console.log("Error: no items found");
          return;
        }

        // find the desired item
        for (let i = 0; i < allItems.length; i++) {
          if (itemRegex.test(allItems[i].name)) {
            isFound = true;
            console.log(`Found product: ${allItems[i].name}`);
            console.log(allItems[i]);
            findItem(allItems[i]);
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

        console.log(data);

        let styles = data.styles;
        let isFound = false;

        if (styles === undefined) {
          console.log(`Error: ${product.id}.json doesn't contain array 'styles'`);
          return;
        }

        for (let i = 0; i < styles.length; i++) {
          if (colorRegex.test(styles[i].name)) {
            console.log(`Found color: ${styles[i].name}`);

            if (styles[i].sizes === undefined) {
              console.log(`Error: ${styles[i]} doesn't contain 'sizes'`);
              break;
            }

            if (styles[i].sizes.length === 1) {
              console.log(`Only one size: (${styles[i].sizes[0].name}); adding to cart`)
              isFound = true;
              addItemToCart(product.id, styles[i].id, styles[i].sizes[0].id);
              break;
            }

            for (let j = 0; j < styles[i].sizes.length; j++) {
              let size = styles[i].sizes[j];
              if (desiredSize === size.name) {
                console.log(`Found size: ${size.name}`);
                isFound = true;
                addItemToCart(product.id, styles[i].id, size.id);
                break;
              }
            }
          }
        }
      });
    }
  }

  function addItemToCart(productId, styleId, sizeId) {
    let url = "/shop/" + productId + "/add.json";

    setTimeout(run, DELAY);

    function run() {
      $.ajax({
        type: "POST",
        url: url,
        data: {
          size: sizeId,
          style: styleId,
          qty: 1
        },
        dataType: "json",
        success: function (data) {
          let item;
          for (let i = 0; i < data.length; i++) {
            console.log(typeof data[i].size_id);
            console.log(typeof sizeId);
            if (data[i].size_id === sizeId.toString()) {
              item = data[i];
              break;
            }
          }

          if (item === undefined) {
            console.log("Error adding item to cart");
            return;
          }

          // great, now lets get access to the Supreme.app object
          // let hackCode = `let o = {
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
          // let script = document.createElement('script');
          // script.textContent = hackCode;
          // (document.head || document.documentElement).appendChild(script);
          // script.remove();

          // we want to stop the search when the item is added
          chrome.storage.local.set({
            searchTabId: -1
          }, () => {
            // load normal checkout page
            setTimeout(() => {
              window.location.href = shopUrl + "/checkout"
            }, DELAY);
            // for mobile checkout (need to wait until checkout button appears)
            // setTimeout(() => {window.location.href = mobileUrl + "#checkout"}, DELAY);
          });
        },
        error: function () {
          console.log("Error adding item to cart")
        }
      });
    }
  }

  function tryAgain(msg) {

    console.log(`${msg ? msg + " " : ""}Trying again in ${CHECK_INTERVAL}ms`);
    setTimeout(startSearch, CHECK_INTERVAL);
  }
}());
