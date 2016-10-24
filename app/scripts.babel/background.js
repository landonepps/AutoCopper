'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ("url" in changeInfo) {
    console.log(changeInfo.url);
    // chrome.tabs.executeScript(tabId, {
    //   file: "contentscript.js",
    //   runAt: "document_end"
    // })
  }
});
