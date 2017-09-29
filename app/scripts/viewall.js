'use strict';

(function () {
  if ($(document.body).hasClass("view-all")) {

    console.log("viewall.js");

    var timesToRepeat = 10;
    var keepChanging = () => {
      // make sold out tag visible
      $(".sold_out_tag").show();

      timesToRepeat = timesToRepeat - 1;
      if (timesToRepeat > 0) setTimeout(keepChanging, 1000);
    }
    setTimeout(keepChanging, 1000)


  }
}());
