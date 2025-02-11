document.addEventListener("DOMContentLoaded", function() {
  const tabContainer = document.querySelector(".tabs"),
    tabContents = document.querySelectorAll(".tab"),
    clearBtn = document.getElementById("clearAllButton");
  function updateFooter() {
    const a = document.querySelector(".tabs li.active a").getAttribute("href");
    clearBtn.style.display = (a === "#global" || a === "#reverse") ? "block" : "none";
  }
  tabContainer.addEventListener("click", function(e) {
    if (e.target && e.target.tagName.toLowerCase() === "a") {
      e.preventDefault();
      document.querySelectorAll(".tabs li").forEach(el => el.classList.remove("active"));
      tabContents.forEach(el => el.classList.remove("active"));
      const parent = e.target.parentElement;
      parent.classList.add("active");
      document.querySelector(e.target.getAttribute("href")).classList.add("active");
      updateFooter();
    }
  });
  const blocklistUl = document.getElementById("blocklist"),
    addSiteBtn = document.getElementById("addSiteButton"),
    siteInput = document.getElementById("siteInput"),
    blockToggle = document.getElementById("blockToggle");
  function loadBlocklist() {
    chrome.storage.local.get(["blocklist", "blockEnabled"], function(data) {
      const list = data.blocklist || [];
      blockToggle.checked = data.blockEnabled === undefined ? true : data.blockEnabled;
      updateList(blocklistUl, list);
    });
  }
  function addDomainToBlocklist(d) {
    chrome.storage.local.get("blocklist", function(data) {
      let list = data.blocklist || [];
      if (!list.includes(d)) {
        list.push(d);
        chrome.storage.local.set({ blocklist: list }, loadBlocklist);
      }
    });
  }
  const whitelistUl = document.getElementById("whitelist"),
    addWhitelistBtn = document.getElementById("addWhitelistButton"),
    whitelistInput = document.getElementById("whitelistInput"),
    whitelistToggle = document.getElementById("whitelistToggle");
  function loadWhitelist() {
    chrome.storage.local.get(["whitelist", "whitelistEnabled"], function(data) {
      const list = data.whitelist || [];
      whitelistToggle.checked = data.whitelistEnabled === undefined ? false : data.whitelistEnabled;
      updateList(whitelistUl, list);
    });
  }
  function addDomainToWhitelist(d) {
    chrome.storage.local.get("whitelist", function(data) {
      let list = data.whitelist || [];
      if (!list.includes(d)) {
        list.push(d);
        chrome.storage.local.set({ whitelist: list }, loadWhitelist);
      }
    });
  }
  function updateList(el, list) {
    el.innerHTML = "";
    list.forEach((d, i) => {
      const li = document.createElement("li");
      li.textContent = d;
      const btn = document.createElement("button");
      btn.textContent = "-";
      btn.addEventListener("click", function() {
        removeDomain(el, i);
      });
      li.appendChild(btn);
      el.appendChild(li);
    });
  }
  function removeDomain(el, i) {
    if (el === blocklistUl) {
      chrome.storage.local.get("blocklist", function(data) {
        let list = data.blocklist || [];
        list.splice(i, 1);
        chrome.storage.local.set({ blocklist: list }, loadBlocklist);
      });
    } else if (el === whitelistUl) {
      chrome.storage.local.get("whitelist", function(data) {
        let list = data.whitelist || [];
        list.splice(i, 1);
        chrome.storage.local.set({ whitelist: list }, loadWhitelist);
      });
    }
  }
  function normalizeDomain(d) {
    let domain;
    try {
      if (!/^https?:\/\//i.test(d)) d = "http://" + d;
      const url = new URL(d);
      domain = url.hostname;
    } catch(e) {
      domain = d;
    }
    return domain.replace(/^www\./i, "");
  }
  addSiteBtn.addEventListener("click", function() {
    const d = siteInput.value.trim();
    if (d) {
      const norm = normalizeDomain(d);
      addDomainToBlocklist(norm);
      siteInput.value = "";
    }
  });
  siteInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") addSiteBtn.click();
  });
  blockToggle.addEventListener("change", function() {
    if (blockToggle.checked) {
      chrome.storage.local.set({ blockEnabled: true, whitelistEnabled: false }, function() {
        whitelistToggle.checked = false;
      });
    } else {
      chrome.storage.local.set({ blockEnabled: false });
    }
  });
  addWhitelistBtn.addEventListener("click", function() {
    const d = whitelistInput.value.trim();
    if (d) {
      const norm = normalizeDomain(d);
      addDomainToWhitelist(norm);
      whitelistInput.value = "";
    }
  });
  whitelistInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") addWhitelistBtn.click();
  });
  whitelistToggle.addEventListener("change", function() {
    if (whitelistToggle.checked) {
      chrome.storage.local.set({ whitelistEnabled: true, blockEnabled: false }, function() {
        blockToggle.checked = false;
      });
    } else {
      chrome.storage.local.set({ whitelistEnabled: false });
    }
  });
  clearBtn.addEventListener("click", function() {
    const a = document.querySelector(".tabs li.active a").getAttribute("href");
    if (a === "#global") {
      chrome.storage.local.set({ blocklist: [] }, loadBlocklist);
    } else if (a === "#reverse") {
      chrome.storage.local.set({ whitelist: [] }, loadWhitelist);
    }
  });
  function loadLanguage() {
    chrome.storage.local.get("lang", function(data) {
      let lang = data.lang;
      if (lang === undefined) lang = 0;
      updateLanguageUI(lang);
    });
  }
  function updateLanguageUI(lang) {
    if (lang === 0) {
      langEng.classList.add("active-lang");
      langEng.classList.remove("inactive-lang");
      langEst.classList.add("inactive-lang");
      langEst.classList.remove("active-lang");
    } else {
      langEst.classList.add("active-lang");
      langEst.classList.remove("inactive-lang");
      langEng.classList.add("inactive-lang");
      langEng.classList.remove("active-lang");
    }
  }
  const langEng = document.getElementById("langEng"),
    langEst = document.getElementById("langEst");
  langEng.addEventListener("click", function() {
    chrome.storage.local.set({ lang: 0 }, function() { updateLanguageUI(0); });
  });
  langEst.addEventListener("click", function() {
    chrome.storage.local.set({ lang: 1 }, function() { updateLanguageUI(1); });
  });
  loadBlocklist();
  loadWhitelist();
  loadLanguage();
  updateFooter();
});
