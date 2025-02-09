chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "llmVietnameseTranslator",
        title: "Dịch",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "llmVietnameseTranslator") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["src/main.bundle.js"],
        });
    }
});
