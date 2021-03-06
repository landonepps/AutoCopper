// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'

'use strict';

const libs = ["libs/jquery.min.js", "libs/sjcl.js"];

chrome.webNavigation.onCompleted.addListener((e) => {
  console.log("normal load")
  injectScripts(e.tabId, getScripts(e));
}, {
  url: [{
    hostSuffix: "supremenewyork.com"
  }]
});

chrome.webNavigation.onHistoryStateUpdated.addListener((e) => {
  console.log("pushState load:" + e.url);
  // only inject the scripts if the current url is the same as the transition
  // I don't know why this event is fired twice, but this only injects on the second one
  chrome.tabs.get(e.tabId, (tab) => {
    if (e.url === tab.url) injectScripts(e.tabId, getScripts(e));
  });
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

    Promise.all(scripts.map(file => new Promise((resolve, reject) => {
      chrome.tabs.executeScript(tabId, {
        file: file,
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

  if (e.url.indexOf("/mobile") != -1) {
    // if at mobile page
    scripts.push("scripts/mobile-atc.js");
  } else if (e.url.indexOf("/all") != -1 || e.url.indexOf("/new") != -1) {
    // if at view all page
    scripts.push("scripts/viewall.js");
  } else if (e.url.indexOf("shop/") != -1) {
    // if at item page
    scripts.push("scripts/item.js");
  } else if (e.url.indexOf("/checkout") != -1) {
    // if at checkout page
    scripts.push("scripts/checkout.js");
  }

  // // then load header
  // scripts.push("scripts/header.js");

  return scripts;
}
