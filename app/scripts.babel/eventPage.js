'use strict';

var libs = ["libs/js/jquery/jquery.min.js", "libs/js/sjcl/sjcl.js"];

chrome.webNavigation.onCompleted.addListener((e) => {
  injectScripts(e.tabId, getScripts(e));
}, {
  url: [{
    hostSuffix: "supremenewyork.com"
  }]
});

chrome.webNavigation.onHistoryStateUpdated.addListener((e) => {
  injectScripts(e.tabId, getScripts(e));
}, {
  url: [{
    hostSuffix: "supremenewyork.com"
  }]
});


// TODO: I (probably) don't need this message anymore
// but I think it is possible that the page finishes loading before
// the searchTabId is saved
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.search === true) {
    console.log("received message to search");

    // var scripts = libs.concat(["scripts/search.js"]);
    // injectScripts(request.tabId, scripts);

    sendResponse({
      success: true
    });
  }
});

function injectScripts(tabId, scripts) {
  // if it's the search tab, add the search script
  chrome.storage.local.get(["searchTabId"], results => {
    var searchTabId = results.searchTabId;

    if (searchTabId === tabId) {
      scripts.push("scripts/search.js");
    }

    console.log("injecting scripts " + scripts.join(","));

    Promise.all(scripts.map(res => new Promise((resolve, reject) => {
      chrome.tabs.executeScript(tabId, {
        file: res,
        runAt: "document_end"
      }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      })
    })));
  });
}

function getScripts(e) {
  var scripts = libs.slice();

  if (e.url.indexOf("/all") != -1 || e.url.indexOf("/new") != -1) {
    // if at view all page
    scripts.push("scripts/viewall.js");
  } else if (e.url.indexOf("shop/") != -1) {
    // if at item page
    scripts.push("scripts/item.js");
  } else if (e.url.indexOf("/checkout") != -1) {
    // if at checkout page
    scripts.push("scripts/checkout.js");
  }

  // then load header
  scripts.push("scripts/header.js");

  return scripts;
}
