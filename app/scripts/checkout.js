'use strict';

jQuery.extend(
  jQuery.expr[':'].containsCI = function (a, i, m) {
    //-- faster than jQuery(a).text()
    var sText = (a.textContent || a.innerText || "");
    var zRegExp = new RegExp(m[3], 'i');
    return zRegExp.test(sText);
  }
);

(function () {
  const shopUrl = "http://www.supremenewyork.com";
  const DELAY = 1700;

  function fillInfo(selector, data) {
    return {
      selector: selector,
      data: data
    }
  }

  if ($(document.body).hasClass("checkout_page")) {
    console.log("on checkout page");
    checkout();
  }

  function checkout() {
    console.log("filling out form");

    chrome.storage.local.get(['userInfo', 'options'], results => {

      var userInfo = results.userInfo;
      var options = results.options;

      // decrypt the card number and cvv
      userInfo["card"] = sjcl.decrypt( /* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, userInfo["card"]);
      userInfo["cvv"] = sjcl.decrypt( /* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, userInfo["cvv"]);

      var fills = {
        "jp": [
          fillInfo("label:containsCI('名') ~ input", userInfo.lastName),
          fillInfo("label:containsCI('名') ~ input ~ input", userInfo.firstName),
          fillInfo("label:containsCI('メール') ~ input", userInfo.email),
          fillInfo("label:containsCI('電話') ~ input", userInfo.phone),
          fillInfo("label:containsCI('県') ~ select", " " + userInfo.state),
          fillInfo("label:containsCI('市') ~ input", userInfo.city),
          fillInfo("label:containsCI('住') ~ input", userInfo.address),
          fillInfo("label:containsCI('郵便') ~ input", userInfo.zip),
          fillInfo("label:containsCI('方法') ~ select", userInfo.cardType),
          fillInfo("div:containsCI('カード') ~ input", userInfo.card),
          fillInfo("label:containsCI('有') ~ select", userInfo.expMonth),
          fillInfo("label:containsCI('有') ~ select ~ select", userInfo.expYear),
          fillInfo(":containsCI('cvv') ~ input", userInfo.cvv)
        ],
        "am": [
          fillInfo("label:containsCI('name') ~ input", userInfo.firstName + " " + userInfo.lastName),
          fillInfo("label:containsCI('email') ~ input", userInfo.email),
          fillInfo("label:containsCI('tel') ~ input", userInfo.phone),
          fillInfo("label:containsCI('state') ~ select", userInfo.state),
          fillInfo("label:containsCI('city') ~ input", userInfo.city),
          fillInfo("label:containsCI('addr') ~ input", userInfo.address),
          fillInfo("label:containsCI('zip') ~ input", userInfo.zip),
          fillInfo("label:containsCI('typ') ~ select", userInfo.cardType),
          fillInfo("div:containsCI('num') ~ input", userInfo.card),
          fillInfo("label:containsCI('exp') ~ select", userInfo.expMonth),
          fillInfo("label:containsCI('exp') ~ select ~ select", userInfo.expYear),
          fillInfo(":containsCI('cvv') ~ input", userInfo.cvv)
        ]
      }

      if (options.autofillEnabled === true) {
        if (userInfo !== undefined) {
          // check the terms and conditions box
          $(".terms .icheckbox_minimal").addClass("checked");
          $("input[id*='terms']").prop('checked', true);

          // if ($(document.body).hasClass("japan")) {
          //   for (var i = 0; i < fills.jp.length; i++) {
          //     $(fills.jp[i].selector).val(fills.jp[i].data);
          //   }
          // } else {
          //   // TODO need 2nd address for america (maybe more for europe/CA?)
          //   for (var i = 0; i < fills.am.length; i++) {
          //     $(fills.am[i].selector).val(fills.am[i].data);
          //   }
          // }
          var countryCode;
          if ($(document.body).hasClass("japan")) {
            countryCode = "jp";
          } else {
            countryCode = "am";
          }

          for (var i = 0; i < fills[countryCode].length; i++) {
            $(fills[countryCode][i].selector).val(fills[countryCode][i].data);
          }

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
          var cardTypeID;
          if (countryCode = "jp") {
            cardTypeID = $(fills[countryCode][8].selector).attr('id');
          } else { //if (countryCode = "am") {
            cardTypeID = $(fills[countryCode][7].selector).attr('id');
          }
          var cardTypeField = document.getElementById(cardTypeID);
          if (cardTypeField) cardTypeField.dispatchEvent(changeEvent);

          var telId;
          if (countryCode = "jp") {
            telId = $(fills[countryCode][3].selector).attr('id');
          } else { //if (countryCode = "am") {
            telId = $(fills[countryCode][2].selector).attr('id');
          }
          var telField = document.getElementById(telId);
          if (telField) telField.dispatchEvent(pasteEvent);

        } else {
          console.log("checkout info not set");
        }

        // TODO: detect when checkout failed and don't continue refreshing
        if (options !== undefined) {
          console.log("seeing if checkout enabled");
          if (options.checkoutEnabled === true) {
            console.log("checkout enabled");
            setTimeout(() => {
              console.log("completing checkout");
              $("input[name*=commit]").click();
            }, DELAY);
          }
        }
      }
    });
  }
}());
