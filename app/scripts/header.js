'use strict';

(function () {

  var header;

  addHeader();

  function addHeader() {
    var oldHeader = document.getElementById("autocopper-header");
    if (oldHeader) return;

    header = document.createElement('div');
    header.innerHTML = '<div id="autocopper-title">AutoCopper</div>';
    header.id = "autocopper-header";
    document.body.insertBefore(header, document.body.firstChild);

    updateMessage();

    var times = 5;
    var keepHeader = () => {
      times = times - 1;
      var oldHeader = document.getElementById("autocopper-header");
      if (!oldHeader) addHeader();
      console.log("header checked");
      if (times > 0) setTimeout(keepHeader, 1000);
    }
    setTimeout(keepHeader, 1000)
  }

  function updateMessage() {
    console.log("setting update message");
    chrome.storage.local.get(['userInfo', 'options'], results => {

      var userInfo = results.userInfo;
      var options = results.options;

      var alerts = [];

      if (options.searchEnabled === true) {
        alerts.push(["Search:", options.keyword + " in " + options.color]);
      }

      if (options.addToCartEnabled === true) {
        alerts.push(["Add to Cart: ", options.size]);
      }

      if (options.autofillEnabled === true) {
        alerts.push(["Fill Checkout Info: ", "Enabled"]);
      }

      if (options.checkoutEnabled === true) {
        header.classList.add("purchase");
        alerts.push(["Complete Purchase:", "Enabled"]);
      } else {
        header.classList.remove("purchase");
      }

      if (alerts.length > 0) {
        var tableLocation = header.firstChild.nextSibling;
        var alertTable = document.createElement('table');
        alertTable.id = "autocopper-alert";

        alerts.forEach(alert => {
          var tr = document.createElement('tr');
          var tdLeft = document.createElement('td');
          tdLeft.className = "alert-left";
          tdLeft.innerHTML = alert[0];
          var tdRight = document.createElement('td');
          tdRight.className = "alert-right"
          tdRight.innerHTML = alert[1];

          tr.appendChild(tdLeft);
          tr.appendChild(tdRight);
          alertTable.appendChild(tr);
        });

        // insert table
        header.insertBefore(alertTable, tableLocation);
      }
    });
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.updateHeader) {
      console.log("got update message")
      addHeader();
    }
  });
}());
