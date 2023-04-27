chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { url: changeInfo.url }, (response) =>
      console.log(response)
    );
  }
});
