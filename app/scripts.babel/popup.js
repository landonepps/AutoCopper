'use strict';

var optionData = ["keyword", "color", "searchEnabled"];

function hyphenate(text) {
  return text.replace(/([a-z][A-Z])/g, g => {
    return g[0] + '-' + g[1].toLowerCase()
  })
}

// Saves options to chrome.storage.local
function save_options() {
  var newOptions = {};

  newOptions["keyword"] = document.getElementById("keyword").value;
  newOptions["color"] = document.getElementById("color").value;
  newOptions["size"] = document.getElementById("size").value;
  newOptions["searchEnabled"] = document.getElementById("search-enabled").checked;
  newOptions["checkoutEnabled"] = document.getElementById("checkout-enabled").checked;

  // save to storage
  chrome.storage.local.set({ searchOptions: newOptions }, () => {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 1000);
  });
}

function restore_options() {
  chrome.storage.local.get(['searchOptions'], results => {
    var searchOptions = results.searchOptions;
    if (searchOptions != undefined) {
      document.getElementById("keyword").value = searchOptions["keyword"];
      document.getElementById("color").value = searchOptions["color"];
      document.getElementById("size").value = searchOptions["size"];
      document.getElementById("search-enabled").checked = searchOptions["searchEnabled"];
      document.getElementById("checkout-enabled").checked = searchOptions["checkoutEnabled"];
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
