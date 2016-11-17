'use strict';

let newItemsUrl = "http://www.supremenewyork.com/shop/new";

var optionData = ["keyword", "color", "searchEnabled"];

function hyphenate(text) {
  return text.replace(/([a-z][A-Z])/g, g => {
    return g[0] + '-' + g[1].toLowerCase()
  })
}

// TODO: probably should not save the search fields as well (though maybe it doesn't matter)
// Saves options to chrome.storage.local
function save_options() {
  var newOptions = {};

  newOptions["keyword"] = document.getElementById("keyword").value;
  newOptions["color"] = document.getElementById("color").value;
  newOptions["size"] = document.getElementById("size").value;
  newOptions["autofillEnabled"] = document.getElementById("autofill-enabled").checked;
  newOptions["checkoutEnabled"] = document.getElementById("checkout-enabled").checked;
  newOptions["addToCartEnabled"] = document.getElementById("add-to-cart-enabled").checked;

  // save to storage
  chrome.storage.local.set({
    searchOptions: newOptions
  }, () => {
    // Update status to let user know options were saved.
    var oldText = document.getElementById("save").textContent;
    $('#save').addClass('btn-success').text("Saved!");
    setTimeout(() => {
      $('#save').removeClass('btn-success').text(oldText);
    }, 1000);
  });

  chrome.tabs.query({
    url: ["*://*.supremenewyork.com/*", "*://supremenewyork.com/*"]
  }, function(tabs) {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        updateHeader: true
      });
    });
  });
}

function restore_options() {
  chrome.storage.local.get(['searchOptions'], results => {
    var searchOptions = results.searchOptions;
    if (searchOptions != undefined) {
      document.getElementById("keyword").value = searchOptions["keyword"];
      document.getElementById("color").value = searchOptions["color"];
      document.getElementById("size").value = searchOptions["size"];
      document.getElementById("autofill-enabled").checked = searchOptions["autofillEnabled"];
      document.getElementById("checkout-enabled").checked = searchOptions["checkoutEnabled"];
      document.getElementById("add-to-cart-enabled").checked = searchOptions["addToCartEnabled"];
    }
  });
}

function edit_info() {
  chrome.runtime.openOptionsPage();
}

// TODO: put in a warning if checkout enabled
function start_search() {
  document.getElementById('search').removeEventListener('click', start_search);
  save_options();
  chrome.tabs.create({
    url: newItemsUrl,
    index: 0,
    active: false
  }, tab => {
    chrome.runtime.sendMessage({
      startSearch: true,
      tabId: tab.id
    }, response => {
      if (response.success === true) {
        chrome.tabs.update(tab.id, {active: true});
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('edit-info').addEventListener('click', edit_info);
document.getElementById('search').addEventListener('click', start_search);
