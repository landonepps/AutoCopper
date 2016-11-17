'use strict';

var optionData = ["lastName", "firstName", "email", "phone",
                  "state", "city", "address", "zip",
                  "cardType", "card", "expMonth", "expYear", "cvv"];


var date = new Date()
var startYear = date.getFullYear(),
    endYear = startYear + 10,
    expYearSelect = document.getElementById('exp-year');

for (var i = startYear; i <= endYear; i++){
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    expYearSelect.appendChild(opt);
}

function hyphenate(text) {
  return text.replace(/([a-z][A-Z])/g, g => {
    return g[0] + '-' + g[1].toLowerCase();
  })
}

// Saves options to chrome.storage.local
function save_options() {
  var newOptions = {};
  optionData.forEach((item, index) => {
    newOptions[item] = document.getElementById(hyphenate(item)).value;
  })

  // encrypt card data
  newOptions["card"] = sjcl.encrypt(/* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, newOptions["card"], {mode: "gcm"});
  newOptions["cvv"] = sjcl.encrypt(/* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, newOptions["cvv"], {mode: "gcm"});

  // save to storage
  chrome.storage.local.set({options: newOptions}, () => {
    // Update status to let user know options were saved.
    var oldText = document.getElementById("save").textContent;
    $('#save').addClass('btn-success').text("Saved!");
    setTimeout(() => {
      $('#save').removeClass('btn-success').text(oldText);
    }, 1000);
  });
}

function restore_options() {
  chrome.storage.local.get(['options'], results => {
    var options = results.options;

    options["card"] = sjcl.decrypt(/* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, options["card"]);
    options["cvv"] = sjcl.decrypt(/* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, options["cvv"]);

    for (var index in options) {
      document.getElementById(hyphenate(index)).value = options[index];
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
