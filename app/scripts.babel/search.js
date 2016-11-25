'use strict';

(function() {
  let shopUrl = "http://www.supremenewyork.com";
  let newItemsUrl = "http://www.supremenewyork.com/shop/new";

  var itemRegex;
  var colorRegex;
  var isNewSearch;
  var prevLinks;
  var searchTabId;

  if ($(document.body).hasClass("view-all")) {

    console.log("starting search");

    // make sold out tag visible
    $(".sold_out_tag").toggle();

    chrome.storage.local.get(['searchOptions', 'prevLinks', 'isNewSearch', 'searchTabId'], results => {
      var itemOptions = results.searchOptions;
      itemRegex = new RegExp(itemOptions.keyword, "i");
      colorRegex = new RegExp(itemOptions.color, "i");
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
        searchLinks(links);
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
            searchLinks(links);
          });
        }
      } else {
        console.log("error, previous items were not recorded")
      }
    }
  }

  function searchLinks(links) {

    var itemFound = false;
    // keep track of checked links
    var checkedLinkCount = 0;

    $(links).each((index, link) => {
      // get the html
      $.ajax({
        url: link,
        success: (html) => {
          var name = $(html).find('[itemprop="name"]:first').text();
          if (itemRegex.test(name)) {
            var color = $(html).find('[itemprop="model"]:first').text();
            if (colorRegex.test(color)) {
              // if name and color match, then we found it!
              itemFound = true;
              console.log(name + " " + color)
              console.log(link);
              // load the page
              window.location.href = shopUrl + link;
            }
          }

          // we checked a link, so increment the count
          checkedLinkCount++;

          // !! too dangerous to enable this yet !!
          // if we checked all the links and didn't find it, refresh
          // TODO: refresh might cause banning
          if (checkedLinkCount === links.length && itemFound === false) {
            console.log("item not found");
            reloadPage();
          }
        }
      });
    });
  }

  function reloadPage() {
    setTimeout(() => {
      window.location.reload();
    }, 1800 + 200 * Math.random()); //500 + 200 * Math.random());
  }

}());
