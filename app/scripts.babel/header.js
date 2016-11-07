var oldHeader = document.getElementById("autocopper-header");
if (oldHeader != undefined) {
  document.body.removeChild(oldHeader);
}

var header = document.createElement('div');
header.innerHTML = "AutoCopper Activated";
header.id = "autocopper-header";
document.body.insertBefore(header, document.body.firstChild);

updateMessage();

function updateMessage() {
  chrome.storage.local.get(['options', 'searchOptions'], results => {
    var oldAlert = document.getElementById("autocopper-alert");
    if (oldAlert != undefined) {
      document.body.removeChild(oldAlert);
    }

    var userInfo = results.options;
    var options = results.searchOptions;


    var alerts = [];

    if (options.searchEnabled === true) {
      alerts.push(["Search:", options.keyword + " in " + options.color]);
    }

    if (options.addToCartEnabled === true) {
      alerts.push(["Auto Add to Cart: ", options.size]);
    }

    if (options.checkoutEnabled === true) {
      alerts.push(["Auto-checkout:", "Enabled"]);
    }

    if (alerts.length > 0) {
      var tableLocation = document.body.firstChild.nextSibling;
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
      document.body.insertBefore(alertTable, tableLocation);
    }
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("got update message")
    if (request.updateHeader === true) {
      updateMessage();
    }
  });
