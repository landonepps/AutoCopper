'use strict';

let searchUrl = "http://www.supremenewyork.com/mobile";

var userInfoFields = ["keyword", "color", "searchEnabled"];

function hyphenate(text) {
  return text.replace(/([a-z][A-Z])/g, g => {
    return g[0] + '-' + g[1].toLowerCase()
  })
}

// TODO: probably should not save the search fields as well (though maybe it doesn't matter)
// Saves options to chrome.storage.local
function save_options(callback) {

  // save can't be clicked again while saving
  document.getElementById('save').removeEventListener('click', save_options);

  var newOptions = {};

  newOptions["keyword"] = document.getElementById("keyword").value;
  newOptions["color"] = document.getElementById("color").value;
  newOptions["size"] = document.getElementById("size").value;
  newOptions["autofillEnabled"] = document.getElementById("autofill-enabled").checked;
  newOptions["checkoutEnabled"] = document.getElementById("checkout-enabled").checked;
  newOptions["addToCartEnabled"] = document.getElementById("add-to-cart-enabled").checked;

  // save to storage
  chrome.storage.local.set({
    options: newOptions,
    // we want to reset the search if the options changed
    isNewSearch: true
  }, () => {
    // Update status to let user know options were saved.
    var oldText = document.getElementById("save").textContent;
    $('#save').addClass('btn-success').text("Saved!");
    setTimeout(() => {
      $('#save').removeClass('btn-success').text(oldText);
      // allow clicking save again
      document.getElementById('save').addEventListener('click', save_options);
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

    // we're finished saving, so it's callback time
    callback();
  });
}

function restore_options() {
  chrome.storage.local.get(['options'], results => {
    var options = results.options;
    if (options != undefined) {
      document.getElementById("keyword").value = options["keyword"];
      document.getElementById("color").value = options["color"];
      document.getElementById("size").value = options["size"];
      document.getElementById("autofill-enabled").checked = options["autofillEnabled"];
      document.getElementById("checkout-enabled").checked = options["checkoutEnabled"];
      document.getElementById("add-to-cart-enabled").checked = options["addToCartEnabled"];
    }
  });
}

function edit_info() {
  save_options(() => {
    chrome.runtime.openOptionsPage()
  });
}

// TODO: put in a warning if checkout enabled
function start_search() {

  // search can't be clicked twice
  document.getElementById('search').removeEventListener('click', start_search);

  // make sure to save the options first
  save_options(() => {
    chrome.tabs.create({
      url: searchUrl,
      index: 0,
      active: false
    }, tab => {
      chrome.storage.local.set({
        searchTabId: tab.id
      }, () => {
        chrome.tabs.update(tab.id, {
          active: true
        });
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('edit-info').addEventListener('click', edit_info);
document.getElementById('search').addEventListener('click', start_search);
