chrome.commands.onCommand.addListener(async (command) => {
    if (command === "dich") {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                files: ["./src/dich.bundle.js"],
                injectImmediately: true,
            }
        );

        return;
    }

    if (command === "explainMeaning") {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                files: ["./src/explainMeaning.bundle.js"],
                injectImmediately: true,
            }
        );
        return;
    }

    if (command === "showPronunciation") {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        function getSelectedText() {
            return window.getSelection().toString().trim();
        }

        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                func: getSelectedText,
                injectImmediately: true,
            },
            (injectionResults) => {
                for (const { result } of injectionResults) {
                    const url = result
                        ? `https://www.merriam-webster.com/dictionary/${encodeURIComponent(
                            result
                        )}`
                        : "https://www.merriam-webster.com";
                    chrome.windows.create({
                        url: url,
                        focused: true,
                        incognito: true,
                        state: "maximized",
                    });
                }
            }
        );
    }
});

chrome.windows.onCreated.addListener(async (window) => {
    if (!window.incognito) {
        return
    }

    try {
        let tabs = await chrome.storage.local.get(null)
        let currentTabs = await chrome.tabs.query({
            windowType: "normal"
        })

        for (const [id, url] of Object.entries(tabs)) {
            if (currentTabs?.some(cTab => cTab.id === id && cTab.incognito) || false) {
                continue
            }

            await chrome.tabs.create(
                {
                    url: url,
                    windowId: window.id,
                }
            )

            await chrome.storage.local.remove(id.toString())
        }
    } catch (error) {
        sendNotification(error.message)
    }
}, {
    windowTypes: ['normal']
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!tab.incognito) {
        return
    }

    if (!changeInfo.url || changeInfo.url.startsWith("chrome://")) {
        return
    }

    try {
        await chrome.storage.local.set({ [tabId.toString()]: changeInfo.url })
    } catch (error) {
        sendNotification(error.message)
    }
})

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    if (removeInfo.isWindowClosing) {
        return
    }

    try {
        if (!(await chrome.storage.local.getKeys()).includes(tabId.toString())) {
            return
        }
        await chrome.storage.local.remove(tabId.toString())
    } catch (error) {
        sendNotification(error.message)
    }
})

function sendNotification(message) {
    chrome.notifications.create("",
        {
            message: message,
            requireInteraction: true,
            title: "Restore tabs",
            type: "basic",
            iconUrl: "./error.webp"
        })
}