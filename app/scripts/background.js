import 'chromereload/devonly';

'use strict';

var libs = ["libs/jquery.min.js", "libs/sjcl.js"];

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

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    if (details.requestHeaders) {
      for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'User-Agent') {
          details.requestHeaders[i].value = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) Mobile/14B100';
          break;
        }
      }
      return { requestHeaders: details.requestHeaders };
    }
  },
  {urls: ["*://*.supremenewyork.com/mobile*"]},
  ["blocking", "requestHeaders"]
);

function injectScripts(tabId, scripts) {
  // if it's the search tab, add the search script
  chrome.storage.local.get(["searchTabId"], results => {
    var searchTabId = results.searchTabId;

    if (tabId === searchTabId) {
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
  // TODO: we might not need the item page anymore
  // } else if (e.url.indexOf("shop/") != -1) {
  //   // if at item page
  //   scripts.push("scripts/item.js");
  } else if (e.url.indexOf("/checkout") != -1) {
    // if at checkout page
    scripts.push("scripts/checkout.js");
  }

  // then load header
  scripts.push("scripts/header.js");

  return scripts;
}
