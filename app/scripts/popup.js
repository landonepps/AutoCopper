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

function save_searches(callback) {
  chrome.storage.local.get(['searches'], results => {

    let searches = results.searches;
    if (searches === undefined) searches = [BLANK_SEARCH];

    let numSearches = searches.length;

    searches = [];

    for (let i = 0; i < numSearches; i++) {
      let keywordId = "keyword-" + i.toString();
      let colorId = "color-" + i.toString();

      let search = {
        keyword: document.getElementById(keywordId).value,
        color: document.getElementById(colorId).value
      }

      searches.push(search);
    }

    chrome.storage.local.set({
      searches: searches
    }, () => {
      if (callback) callback();
    })
  });
}

function build_search_fields() {
  chrome.storage.local.get(['searches'], results => {

    let searches = results.searches;
    if (searches === undefined) searches = [BLANK_SEARCH];

    let searchFields = document.getElementById("search-fields");
    searchFields.innerHTML = "";

    for (let i = 0; i < searches.length; i++) {
      let keywordId = "keyword-" + i.toString();
      let colorId = "color-" + i.toString();

      let searchElement = document.createElement('div');
      searchElement.className = "form-group";
      searchElement.innerHTML = `<div class="row">
          <label for="${keywordId}" class="col-xs-3 col-form-label col-form-label-sm">Keyword</label>
          <div class="col-xs-9">
            <input class="form-control form-control-sm" id="${keywordId}" type="text" value="${searches[i].keyword}">
          </div>
        </div>
        <div class="row">
          <label for="${colorId}" class="col-xs-3 col-form-label col-form-label-sm">Color</label>
          <div class="col-xs-9">
            <input class="form-control form-control-sm" id="${colorId}" type="text" value="${searches[i].color}">
          </div>
        </div>`;
      searchFields.appendChild(searchElement);
      document.getElementById(keywordId).addEventListener("change", save_searches);
      document.getElementById(colorId).addEventListener("change", save_searches);
    }
  });
}

function add_search_field() {
  chrome.storage.local.get(['searches'], results => {
    let searches = results.searches;
    if (searches === undefined) {
      searches = [BLANK_SEARCH];
    }
    searches.push(BLANK_SEARCH);

    chrome.storage.local.set({
      searches: searches
    }, () => {
      build_search_fields();
      console.log("search fields: " + searches.length);
    });
  });
}

function remove_search_field() {
  chrome.storage.local.get(['searches'], results => {
    let searches = results.searches;
    if (searches === undefined) {
      searches = [BLANK_SEARCH];
    } else if (searches.length > 1) {
      searches.pop();
    }

    chrome.storage.local.set({
      searches: searches
    }, () => {
      build_search_fields();
      console.log("search fields: " + searches.length);
    })
  });
}

// TODO: put in a warning if checkout enabled
function start_search() {

  // search can't be clicked twice
  document.getElementById('search').removeEventListener('click', start_search);

  // make sure to save the searches first
  save_searches(() => {
    // the save the options
    save_options(() => {
    chrome.tabs.create({
      url: SEARCH_URL,
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
document.getElementById('search').addEventListener('click', start_search);
document.getElementById('add-search-field').addEventListener('click', add_search_field);
document.getElementById('remove-search-field').addEventListener('click', remove_search_field);

document.addEventListener('DOMContentLoaded', restore_options);
