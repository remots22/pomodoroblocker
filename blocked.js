chrome.storage.local.get("lang", function(result) {
  if (result.lang === 1) {
    document.getElementById("blockedImg").src = "mine6pi.gif";
  }
});
