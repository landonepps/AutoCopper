'use strict';

(function() {
  let shopUrl = "http://www.supremenewyork.com";

  if ($(document.body).hasClass("checkout_page")) {
    console.log("on checkout page");
    checkout();
  }

  function checkout() {
    console.log("filling out form");

    chrome.storage.local.get(['userInfo', 'options'], results => {

      var userInfo = results.userInfo;
      var options = results.options;

      if (options.autofillEnabled === true) {

        userInfo["card"] = sjcl.decrypt( /* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */ , userInfo["card"]);
        userInfo["cvv"] = sjcl.decrypt( /* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */ , userInfo["cvv"]);

        if (userInfo !== undefined) {
          if ($(document.body).hasClass("japan")) {
            // TODO I should add a dropdown for state in the options page
            $("select[id*='state']").val(" " + userInfo.state)
            $("input[id*='last']").val(userInfo.lastName)
            $("input[id*='first']").val(userInfo.firstName)
          } else {
            $("select[id*='state']").val(userInfo.state)
            $("input[id*='name']").val(userInfo.firstName + " " + userInfo.lastName)
              // terms is checked, but in the us store, we need to make it appear so
            $(".terms .icheckbox_minimal").addClass("checked");
            // TODO need 2nd address for america (maybe more for europe/CA?)
            // $("input[id*='oba3']").val(userInfo.address)
          }
          $("input[id*='email']").val(userInfo.email)
          $("input[id*='tel']").val(userInfo.phone)
          $("input[id*='city']").val(userInfo.city)
          $("input[id*='addr'],input[id='bo']").val(userInfo.address)
          $("input[id*='zip']").val(userInfo.zip)
          $("select[id*='type']").val(userInfo.cardType);
          $("input[id*='cnb']").val(userInfo.card);
          $("select[id*='month']").val(userInfo.expMonth);
          $("select[id*='year']").val(userInfo.expYear);
          $("input[id*='vval'],input[id*='verif']").val(userInfo.cvv);
          $("input[id*='terms']").prop('checked', true);

          var changeEvent = new UIEvent("change", {
            "view": window,
            "bubbles": true,
            "cancelable": true
          });

          var pasteEvent = new UIEvent("paste", {
            "view": window,
            "bubbles": true,
            "cancelable": true
          });

          // trigger change event to update mask (unmask().mask("9999 9999..."))
          document.getElementById("credit_card_type").dispatchEvent(changeEvent);
          document.getElementById("order_tel").dispatchEvent(pasteEvent);

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
}());
