function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function updateRules() {
  chrome.storage.local.get(["blocklist", "whitelist", "blockEnabled", "whitelistEnabled"], function(data) {
    const bList = data.blocklist || [];
    const wList = data.whitelist || [];
    const wEnabled = data.whitelistEnabled === true;
    const bEnabled = !wEnabled && (data.blockEnabled === undefined ? true : data.blockEnabled);
    const blockedURL = chrome.runtime.getURL("blocked.html");
    chrome.declarativeNetRequest.getDynamicRules(function(rules) {
      const ruleIds = rules.map(r => r.id);
      chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds, addRules: [] }, function() {
        let newRules = [];
        let ruleId = 1;
        if (wEnabled) {
          newRules.push({
            id: ruleId++,
            priority: 1,
            action: { type: "redirect", redirect: { url: blockedURL } },
            condition: { regexFilter: "^https?://.*$", resourceTypes: ["main_frame"] }
          });
          wList.forEach(function(entry) {
            const d = entry.replace(/^https?:\/\/(www\.)?/i, "");
            const ed = escapeRegExp(d);
            const regex = "^https?://(?:[^/]+\\.)*" + ed + "(?::[0-9]+)?(?:/.*)?$";
            newRules.push({
              id: ruleId++,
              priority: 2,
              action: { type: "allow" },
              condition: { regexFilter: regex, resourceTypes: ["main_frame"] }
            });
          });
        } else if (bEnabled) {
          bList.forEach(function(entry) {
            const d = entry.replace(/^https?:\/\/(www\.)?/i, "");
            const ed = escapeRegExp(d);
            const regex = "^https?://(?:[^/]+\\.)*" + ed + "(?::[0-9]+)?(?:/.*)?$";
            newRules.push({
              id: ruleId++,
              priority: 1,
              action: { type: "redirect", redirect: { url: blockedURL } },
              condition: { regexFilter: regex, resourceTypes: ["main_frame"] }
            });
          });
        }
        chrome.declarativeNetRequest.updateDynamicRules({ addRules: newRules });
      });
    });
  });
}
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === "local" && (changes.blocklist || changes.whitelist || changes.blockEnabled || changes.whitelistEnabled))
    updateRules();
});
updateRules();
