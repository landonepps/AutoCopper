'use strict';

(function () {
  const shopUrl = 'http://www.supremenewyork.com';
  const mobileUrl = 'http://www.supremenewyork.com/mobile';
  const stockUrl = 'http://www.supremenewyork.com/mobile_stock.json';

  const DELAY = 500;
  const CHECK_INTERVAL = 2000;

  let desiredItems = [];
  let desiredSize;
  let searchTabId;
  let itemsAddedToCart = false;

  // rudimentary delay waiting for 10:59 local time
  let d = new Date();
  let dropTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10, 58, 0, 0);
  setTimeout(startSearch, dropTime - d);

  function startSearch() {
    chrome.storage.local.get(['searches', 'options', 'prevLinks', 'searchTabId'], results => {
      let options = results.options;
      let searches = results.searches;

      desiredSize = options.size;
      searchTabId = results.searchTabId;

      for (let i = 0; i < searches.length; i++) {
        if(searches[i].keyword !== "") {
          let itemInfo = {
            productRegex: new RegExp(searches[i].keyword, "i"),
            styleRegex: new RegExp(searches[i].color, "i"),
            productFound: false,
            styleFound: false,
            inCart: false
          }
          desiredItems.push(itemInfo);
        }
      }

      findProducts();
    });
  }

  function findProducts() {
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

        // check that the new items category exists
        if (allItems.length === 0) {
          console.log("Error: no items found");
          return;
        }

        let findStyleCallback = () => {
          let allItemsFound = true;
          for (let searchNum = 0; searchNum < desiredItems.length; searchNum++) {
            // TODO: checking for productFound instead of styleFound
            // means we will continue if products match even if the style wasn't found

            // if an item is not found, try again
            if (!desiredItems[searchNum].productFound) {
              allItemsFound = false;
              tryAgain("Product not found.");
              break;
            }
          }

          if (allItemsFound && !itemsAddedToCart) {
            // prevent this code from being executed twice since findStyleCallback is called from all findStyle()'s
            itemsAddedToCart = true;

            let itm = desiredItems[0];
            addItemToCart(itm.productId, itm.styleId, itm.sizeId, 0, addItemCallback);

            function addItemCallback(nextItemNum) {
              // if the next item is more than the number of desired items
              if (nextItemNum >= desiredItems.length) {
                //we should have added all the items. Time to checkout.
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
                return;
              }

              let itm = desiredItems[nextItemNum];
              // addItemToCart has a delay built in
              addItemToCart(itm.productId, itm.styleId, itm.sizeId, nextItemNum, addItemCallback);
            }
          }
        }

        for (let searchNum = 0; searchNum < desiredItems.length; searchNum++) {
          let search = desiredItems[searchNum];
          // if not already found
          if (!desiredItems[searchNum].productFound) {
            // find the desired item
            for (let i = 0; i < allItems.length; i++) {
              if (search.productRegex.test(allItems[i].name)) {
                desiredItems[searchNum].productFound = true;
                console.log(`Found product: ${allItems[i].name}`);
                console.log(allItems[i]);
                findStyle(allItems[i], searchNum, findStyleCallback);
                break;
              }
            }
          }
        }
      }
    });
  }

  function findStyle(product, searchNum, callback) {
    setTimeout(run, DELAY);

    function run() {
      $.getJSON(`/shop/${product.id}.json`, (data) => {

        console.log(data);

        let search = desiredItems[searchNum];
        let styles = data.styles;

        if (styles === undefined) {
          console.log(`Error: ${product.id}.json doesn't contain array 'styles'`);
          return;
        }

        for (let i = 0; i < styles.length; i++) {
          if (search.styleRegex.test(styles[i].name)) {
            console.log(`Found color: ${styles[i].name}`);

            if (styles[i].sizes === undefined) {
              console.log(`Error: ${styles[i]} doesn't contain 'sizes'`);
              break;
            }

            if (styles[i].sizes.length === 1) {
              console.log(`Only one size: (${styles[i].sizes[0].name}); adding to cart`)
              search.styleFound = true;
              desiredItems[searchNum].productId = product.id;
              desiredItems[searchNum].styleId = styles[i].id;
              desiredItems[searchNum].sizeId = styles[i].sizes[0].id;
              break;
            }

            for (let j = 0; j < styles[i].sizes.length; j++) {
              let size = styles[i].sizes[j];
              if (desiredSize === size.name) {
                console.log(`Found size: ${size.name}`);
                search.styleFound = true;
                desiredItems[searchNum].productId = product.id;
                desiredItems[searchNum].styleId = styles[i].id;
                desiredItems[searchNum].sizeId = size.id;
                break;
              }
            }
          }
        }

        // a style has been found, let caller know
        if (callback) callback();

      });
    }
  }

  function addItemToCart(productId, styleId, sizeId, itemNum, callback) {
    if (productId === undefined || styleId === undefined || sizeId === undefined) {
      callback(itemNum + 1);
      return;
    }

    let url = "/shop/" + productId + "/add.json";

    console.log(`adding prdId: ${productId} styId: ${styleId} szId: ${sizeId} to cart`);

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
            if (data[i].size_id === sizeId.toString()) {
              item = data[i];
              break;
            }
          }

          if (item === undefined) {
            console.log("Error adding item to cart");
            return;
          } else {
            desiredItems[itemNum].inCart = true;
          }

          // item (probably) added, let caller know
          if (callback) callback(itemNum + 1);
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
