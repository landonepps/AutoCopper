'use strict';

(function() {
  let shopUrl = "http://www.supremenewyork.com/";

  var itemRegex;
  var colorRegex;
  var itemSelector = '[itemprop="name"]:first';
  var colorSelector = '[itemprop="model"]:first';
  var isNewSearch;
  var prevLinks;
  var searchTabId;

  if ($(document.body).hasClass("view-all")) {

    console.log("starting search");

    chrome.storage.local.get(['options', 'prevLinks', 'isNewSearch', 'searchTabId'], results => {
      var options = results.options;
      itemRegex = new RegExp(options.keyword, "i");
      colorRegex = new RegExp(options.color, "i");
      prevLinks = results.prevLinks;
      isNewSearch = results.isNewSearch;
      searchTabId = results.searchTabId;
      searchItems();
    });
  }

  function searchItems() {
    console.log("search()");

    var links = [];
    $('article a[href]').each((i, element) => {
      links.push($(element).attr('href'));
    });

    var sortedLinks = links.slice(0).sort();

    console.log("is new search: " + isNewSearch);

    if (isNewSearch === true) {
      chrome.storage.local.set({
        isNewSearch: false,
        prevLinks: sortedLinks
      }, () => {
        startSearch(links);
      });
    } else {
      if (prevLinks != undefined) {
        if (sortedLinks.length === prevLinks.length &&
          sortedLinks.every((v, i) => v === prevLinks[i])) {
          console.log("items haven't dropped yet");
          reloadPage();
        } else {
          console.log("drop detected!");
          chrome.storage.local.set({
            isNewSearch: false,
            prevLinks: sortedLinks
          }, () => {
            startSearch(links);
          });
        }
      } else {
        console.log("error, previous items were not recorded")
      }
    }
  }

  function startSearch(links) {

    var linkRegex = /([^\/]+)\/([^\/]+)$/;

    // object to group links
    // { itemId: {colorId: link } }
    var linksObj = {};

    // construct the 2D array-like object
    links.forEach(link => {
      var match = linkRegex.exec(link);
      var itemId = match[1];
      var colorId = match[2];
      if (!(itemId in linksObj)) {
        // create object if it doesn't exist
        linksObj[itemId] = {};
      }
      // add link to existing object
      linksObj[itemId][colorId] = link;
    });

    var itemFound = false;
    var colorwayFound = false;
    var itemsChecked = 0;

    console.log(linksObj);

    // TODO this isn't perfect.
    // I load one page twice to check the item and color separately
    // I check all the pages even if the item was found first
    // IDEA maybe I can cache the picture link? If the picture is the same, I don't have to reload the page
    // IDEA maybe I can cache the HTML and check the cache first before loading the page
    Object.entries(linksObj).forEach(([itemId, colorIdsObj]) => {

      var firstItem = colorIdsObj[Object.keys(colorIdsObj)[0]];

      if (itemFound === false) {
        checkLink(firstItem, itemRegex, itemSelector, result => {
          if (result === true) {
            itemFound = true;
            var colorsChecked = 0;
            Object.entries(colorIdsObj).forEach(([colorId, link]) => {
              if (colorwayFound === false) {
                checkLink(link, colorRegex, colorSelector, result => {
                  if (result === true) {
                    colorwayFound = true;
                    console.log("item found");
                    window.location.href = shopUrl + link;
                  } else {
                    // this isn't the color we're looking for
                    colorsChecked++;
                    if (colorwayFound === false &&
                      colorsChecked >= Object.keys(colorIdsObj).length) {
                      console.log("item not found");
                      reloadPage();
                    }
                  }
                });
              }
            });
          } else {
            // this isn't the item we're looking for
            itemsChecked++;
            if (itemFound === false &&
              itemsChecked >= Object.keys(linksObj).length) {
              console.log("item not found");
              reloadPage();
            }
          }
        });
      }
    });
  }

  function checkLink(link, regex, selector, callback) {
    loadLink(link, (err, html) => {
      // TODO check if I need error handling here (/ if this code works)
      // if (err) {
      //   console.error(err);
      //   return
      // }

      checkHtml(html, regex, selector, callback);
    });
  }

  function checkHtml(html, regex, selector, callback) {
    var name = $(html).find(selector).text();
    console.log("checked " + name);
    callback(regex.test(name));
  }

  function loadLink(link, callback) {

    // IDEA instead of only loading one at a time, I should try two or more
    // delay loading the link, if already loading another link
    if (loadLink.loadingLink >= 5) {
      setTimeout(() => {
        console.log("link loading... we gotta wait.")
        loadLink(link, callback);
      }, 100);
      return;
    }

    // we're loading a link
    loadLink.loadingLink = loadLink.loadingLink + 1 || 1;
    console.log("loading ", link);

    // create a new GET request
    var xhr = new XMLHttpRequest();
    // TODO I really would like to be able to do this synchronously
    xhr.open("GET", link);
    // set the request headers to be the same as the Chrome browser
    xhr.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
    xhr.setRequestHeader("Upgrade-Insecure-Requests", "1");
    xhr.onload = () => {
      // we're done loading the link
      loadLink.loadingLink = loadLink.loadingLink - 1;
      if (xhr.status === 200) {
        callback(null, xhr.responseText);
      } else {
        callback(new Error("Unable to load link: " + link));
      }
    };
    xhr.send();
  }

  function reloadPage() {
    setTimeout(() => {
      window.location.reload();
    }, 1500 + 500 * Math.random()); //500 + 200 * Math.random());
  }

}());
