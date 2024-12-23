chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "llmVietnameseTranslator",
        title: "Dịch",
        //   id: "[slow]llmVietnameseTranslator",
        //   title: "Dịch (chậm)",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "llmVietnameseTranslator") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["src/gpt4omini.bundle.js"],
        });
    }

    if (info.menuItemId === "[slow]llmVietnameseTranslator") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["src/gpt4o.bundle.js"],
        });
    }
});
