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