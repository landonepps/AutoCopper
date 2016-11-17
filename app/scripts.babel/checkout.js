'use strict';

let shopUrl = "http://www.supremenewyork.com";

if ($(document.body).hasClass("checkout_page")) {
  console.log("on checkout page");
  checkout();
}

// TODO: rename options and searchOptions
function checkout() {
  console.log("filling out form");

  chrome.storage.local.get(['options', 'searchOptions'], results => {

    var userInfo = results.options;
    var options = results.searchOptions;

    if (options.autofillEnabled === true) {

      userInfo["card"] = sjcl.decrypt( /* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */ , userInfo["card"]);
      userInfo["cvv"] = sjcl.decrypt( /* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */ , userInfo["cvv"]);

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
      } else {
        console.log("checkout info not set");
      }

      // TODO: detect when checkout failed and don't continue refreshing
      if (options !== undefined) {
        if (options.checkoutEnabled === true) {
          console.log("completing checkout");
          $("input[name*=commit]").click();
        }
      }
    }
  });
}
