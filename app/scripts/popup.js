'use strict';

const SEARCH_URL = "http://www.supremenewyork.com/shop/all";

const USER_INFO_FIELDS = ["keyword", "color", "searchEnabled"];
const BLANK_SEARCH = { keyword: "", color: "" };

function hyphenate(text) {
  return text.replace(/([a-z][A-Z])/g, g => {
    return g[0] + '-' + g[1].toLowerCase()
  })
}

function sendMessage(msg, callback) {
  chrome.tabs.query({
    url: ["*://*.supremenewyork.com/*", "*://supremenewyork.com/*"]
  }, function (tabs) {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, msg);
    });
    // we're finished saving, so it's callback time
    if (callback) callback();
  });
}

// Saves options to chrome.storage.local
function save_options(callback) {

  let newOptions = {};

  newOptions["size"] = document.getElementById("size").value;
  newOptions["autofillEnabled"] = document.getElementById("autofill-enabled").checked;
  newOptions["checkoutEnabled"] = document.getElementById("checkout-enabled").checked;
  newOptions["addToCartEnabled"] = document.getElementById("add-to-cart-enabled").checked;

  // save to storage
  chrome.storage.local.set({
    options: newOptions
  }, () => {
    // Can update status msg here to let user know options were saved.
    // sendMessage({ updateHeader: true }, callback);
    if (callback) callback();
  });
}

function restore_options() {
  chrome.storage.local.get(['options'], results => {
    let options = results.options;
    if (options !== undefined) {
      document.getElementById("size").value = options["size"];
      document.getElementById("autofill-enabled").checked = options["autofillEnabled"];
      document.getElementById("checkout-enabled").checked = options["checkoutEnabled"];
      document.getElementById("add-to-cart-enabled").checked = options["addToCartEnabled"];

      build_search_fields();
    }
  });
}

function edit_info() {
  save_options(() => {
    chrome.runtime.openOptionsPage();
  });
}

document.getElementById("size").addEventListener("change", save_options);
document.getElementById("autofill-enabled").addEventListener("change", save_options);
document.getElementById("checkout-enabled").addEventListener("change", save_options);
document.getElementById("add-to-cart-enabled").addEventListener("change", save_options);

document.getElementById('edit-info').addEventListener('click', edit_info);

document.addEventListener('DOMContentLoaded', restore_options);
