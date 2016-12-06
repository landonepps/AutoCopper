'use strict';

var userInfoFields = ["lastName", "firstName", "email", "phone",
                  "state", "city", "address", "zip",
                  "cardType", "card", "expMonth", "expYear", "cvv"];

var regionInfo = {
  "japan": {
    "states": ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県",
    "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県",
    "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県",
    "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県",
    "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
    "fields": []
  },
  "americas": {
    "states": ["AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM",
    "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
    "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI",
    "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY"],
    "fields": []
  }
}


var date = new Date()
var startYear = date.getFullYear(),
    endYear = startYear + 10,
    expYearSelect = document.getElementById('exp-year');

for (var i = startYear; i <= endYear; i++){
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    expYearSelect.appendChild(opt);
}

var stateSelect = document.getElementById('state');
var region = "japan";

regionInfo[region].states.forEach(state => {
    var opt = document.createElement('option');
    opt.value = state;
    opt.innerHTML = state;
    stateSelect.appendChild(opt);
});

function hyphenate(text) {
  return text.replace(/([a-z][A-Z])/g, g => {
    return g[0] + '-' + g[1].toLowerCase();
  })
}

// Saves options to chrome.storage.local
function save_options() {
  var newUserInfo = {};
  userInfoFields.forEach((item, index) => {
    newUserInfo[item] = document.getElementById(hyphenate(item)).value;
  })

  // TODO: mangle doesn't work as of implementing the new yeoman generator
  // encrypt card data
  newUserInfo["card"] = sjcl.encrypt(/* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, newUserInfo["card"], {mode: "gcm"});
  newUserInfo["cvv"] = sjcl.encrypt(/* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, newUserInfo["cvv"], {mode: "gcm"});

  // save to storage
  chrome.storage.local.set({userInfo: newUserInfo}, () => {
    // Update status to let user know options were saved.
    var oldText = document.getElementById("save").textContent;
    $('#save').addClass('btn-success').text("Saved!");
    setTimeout(() => {
      $('#save').removeClass('btn-success').text(oldText);
    }, 1000);
  });
}

function restore_options() {
  chrome.storage.local.get(['userInfo'], results => {
    var userInfo = results.userInfo;
    if (userInfo === undefined) return;

    userInfo["card"] = sjcl.decrypt(/* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, userInfo["card"]);
    userInfo["cvv"] = sjcl.decrypt(/* @mangle */ 'vSfxY4tKkguBqGCH2U7eA2rm' /* @/mangle */, userInfo["cvv"]);

    for (var index in userInfo) {
      document.getElementById(hyphenate(index)).value = userInfo[index];
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
