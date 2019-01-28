const jsonPrefix = "/shop/"
let options = {};

console.log("mobile-atc.js");
let loadCheck = setInterval(() => {
  let itemElements = $("li.selectable");
  if (itemElements.length !== 0) {
    clearInterval(loadCheck);

    chrome.storage.local.get(['options'], results => {
      console.log("getting extension options");
      options = results.options;
      // console.log(options);

      let isItemFound = false;

      for (let i = 0; i < itemElements.length && !isItemFound; i++) {
        let el = itemElements[i];
        let itemName = $(el).find("span.name").text().toLowerCase();
        if (itemName.indexOf(options.keyword.toLowerCase()) !== -1) {
          console.log("item found:", itemName);
          isItemFound = true;
          itemElements[i].click();
          break;
        }
      }

      let isColorFound = false;

      if (isItemFound) {
        let productPageCheck = setInterval(() => {
          let addr = window.location.href;
          if (addr.indexOf("products/") === -1) return;

          clearInterval(productPageCheck);
          let productId = /products\/([0-9]+)/.exec(addr)[1];
          console.log("product id: ", productId);
          $.getJSON(`/shop/${productId}.json`, (data) => {
            let colorways = data["styles"];
            for (let i = 0; i < colorways.length; i++) {
              let colorName = colorways[i].name;
              console.log(colorName);
              console.log(colorways[i].id);
              if (colorName.toLowerCase().indexOf(options.keycolor.toLowerCase()) !== -1) {
                isColorFound = true;
                $(`#style-${colorways[i].id} img`).click();
                break;
              }
            }
            // selects size even if color isn't found
            selectSize();
          })
        }, 100);
      }
    });
  }
}, 100);

function selectSize() {
  console.log("hey")
  let selectElements = $("select");

  if (selectElements.size > 1) {
    console.warn("more than one element");
  }

  $("select option").each((i, el) => {
    // console.log($(el).text());
    // console.log(options.size);
    if ($(el).text() === options.size) {
      // console.log($(el).text());
      console.log($(el).val());
      $("select").val($(el).val());
    }
  })
}
