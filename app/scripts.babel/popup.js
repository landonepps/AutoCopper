'use strict';

var optionData = ["keyword", "color", "searchEnabled"];

function hyphenate(text) {
  return text.replace(/([a-z][A-Z])/g, function (g) { return g[0] + '-' + g[1].toLowerCase() })
}

// Saves options to chrome.storage.local
function save_options() {
  var newOptions = {};

  newOptions["keyword"] = document.getElementById("keyword").value;
  newOptions["color"] = document.getElementById("color").value;
  newOptions["searchEnabled"] = document.getElementById("search-enabled").checked;

  // save to storage
  chrome.storage.local.set({searchOptions: newOptions}, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function(){
      status.textContent = '';
    }, 1000);
  });
}

function restore_options() {
  chrome.storage.local.get(['searchOptions'], function(results) {
    var options = results.searchOptions;

    document.getElementById("keyword").value = options["keyword"];
    document.getElementById("color").value = options["color"];
    document.getElementById("search-enabled").checked = options["searchEnabled"];
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
