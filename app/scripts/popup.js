'use strict';

const SEARCH_URL = "http://www.supremenewyork.com/shop/all";

const FIELDS = ["size", "category", "keyword", "keycolor"];
const OPTIONS = ["autofill", "checkout", "atc"];
// const BLANK_SEARCH = { keyword: "", color: "" };

// function hyphenate(text) {
//   return text.replace(/([a-z][A-Z])/g, g => {
//     return g[0] + '-' + g[1].toLowerCase()
//   })
// }

function sendMessage(msg, callback) {
  chrome.tabs.query({
    url: ["*://*.supremenewyork.com/*", "*://supremenewyork.com/*"]
  }, function (tabs) {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, msg);
    });
    // we're finished saving, so it's callback time
    if (typeof callback === "function") callback();
  });
}

// Saves options to chrome.storage.local
function save_options(callback) {

  let newOptions = {};

  FIELDS.forEach( (field, i) => {
    newOptions[field] = document.getElementById(field).value;
  });

  OPTIONS.forEach((option, i) => {
    newOptions[option] = document.getElementById(option).checked;
  });

  // save to storage
  chrome.storage.local.set({
    options: newOptions
  }, () => {
    // Can update status msg here to let user know options were saved.
    // sendMessage({ updateHeader: true }, callback);
    if (typeof callback === "function") callback();
  });
}

function restore_options() {
  chrome.storage.local.get(['options'], results => {
    let options = results.options;
    if (options !== undefined) {

      FIELDS.forEach( (field, i) => {
        document.getElementById(field).value = options[field];
      });

      OPTIONS.forEach((option, i) => {
        document.getElementById(option).checked = options[option];
      });
    }
  });
}

function edit_info() {
  save_options(() => {
    chrome.runtime.openOptionsPage();
  });
}

FIELDS.forEach( (field, i) => {
  document.getElementById(field).addEventListener("change", save_options);
});

OPTIONS.forEach((option, i) => {
  document.getElementById(option).addEventListener("change", save_options);
});

document.getElementById('edit-info').addEventListener('click', edit_info);

document.addEventListener('DOMContentLoaded', restore_options);
