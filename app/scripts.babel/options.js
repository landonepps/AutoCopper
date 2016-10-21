'use strict';

var password = 'vSfxY4tKkguBqGCH2U7eA2rm'
var optionData = ["lastName", "firstName", "email", "phone",
                  "state", "city", "address", "zip",
                  "cardType", "card", "expMonth", "expYear", "cvv"];

function hyphenate(text) {
  return text.replace(/([a-z][A-Z])/g, function (g) {
    return g[0] + '-' + g[1].toLowerCase()
  })
}

// Saves options to chrome.storage.local
function save_options() {
  var newOptions = {};
  optionData.forEach(function (item, index) {
    newOptions[item] = document.getElementById(hyphenate(item)).value;
  })

  // encrypt card data
  newOptions["card"] = sjcl.encrypt(password, newOptions["card"], {mode : 'gcm'});

  // save to storage
  chrome.storage.local.set({options: newOptions}, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function(){
      status.textContent = '';
    }, 1000);
  });
}

function restore_options() {
  chrome.storage.local.get(['options'], function(results) {
    var options = results.options;

    options["card"] = sjcl.decrypt(password, options["card"]);

    for (var index in options) {
      document.getElementById(hyphenate(index)).value = options[index];
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
