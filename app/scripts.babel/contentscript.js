'use strict';

let shopUrl = "http://www.supremenewyork.com";

// TODO: This is just for testing //

let search = "gucci";
let color = "white";

//   // //   //   // //   //   // //

var itemRegex = new RegExp(search, "i");
var colorRegex = new RegExp(color, "i");

if (window.location.href.indexOf("all") != -1) {
  var links = [];
  $('article a[href]').each(function() {
    links.push($(this).attr('href'));
  });
  searchLinks(links);
}

function searchLinks(links) {
  $(links).each(function(index, link) {
    var request = $.get(link, null, function(data, textStatus) {
      if (data) {
        var name = $(data).find('[itemprop="name"]:first').text();
        if (itemRegex.test(name)) {
          var color = $(data).find('[itemprop="model"]:first').text();
          if (colorRegex.test(color)) {
            console.log(name + " " + color)
            console.log(link);
            window.location = shopUrl + link;
          }
        }
      }
    });
  });
}
