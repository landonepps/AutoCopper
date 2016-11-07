'use strict';

chrome.webNavigation.onCompleted.addListener((e) => {
  injectScripts(e);
}, {
  url: [{
    hostSuffix: "supremenewyork.com"
  }]
});

chrome.webNavigation.onHistoryStateUpdated.addListener((e) => {
  injectScripts(e);
}, {
  url: [{
    hostSuffix: "supremenewyork.com"
  }]
});

function injectScripts(e) {
  console.log("injecting scripts in " + e.url);
  // load jquery
  chrome.tabs.executeScript(e.tabId, {
    file: "libs/js/jquery/jquery.min.js",
    runAt: "document_end"
  }, () => {
    // then load sjcl
    chrome.tabs.executeScript(e.tabId, {
      file: "libs/js/sjcl/sjcl.js",
      runAt: "document_end"
    }, () => {
      // then load header
      chrome.tabs.executeScript(e.tabId, {
        file: "scripts/header.js",
        runAt: "document_end"
      }, () => {
        // load the desired scripts

        if (e.url.indexOf("/all") != -1 || e.url.indexOf("/new") != -1) {
          // if at view all page
          chrome.tabs.executeScript(e.tabId, {
            file: "scripts/viewall.js",
            runAt: "document_end"
          });
        } else if (e.url.indexOf("shop/") != -1) {
          // if at item page
          chrome.tabs.executeScript(e.tabId, {
            file: "scripts/item.js",
            runAt: "document_end"
          });
        } else if (e.url.indexOf("/checkout") != -1) {
          chrome.tabs.executeScript(e.tabId, {
            // if at checkout page
            file: "scripts/checkout.js",
            runAt: "document_end"
          });
        }
      });
    });
  });
}
