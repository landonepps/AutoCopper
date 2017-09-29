console.log("mobile-atc.js");
let loadCheck = setInterval(() => {
  let itemElements = $("li.selectable");
  if(itemElements.length!==0) {
    clearInterval(loadCheck);

    chrome.storage.local.get(['options', 'searches'], results => {
      console.log("getting options");
      var searches = results.searches;
      var options = results.options;
      console.log(options);
      console.log(searches);

      itemElements.each((i, el) => {
        let itemName = $(el).find("span.name").text();
      });
    });
  }
}, 100 );
