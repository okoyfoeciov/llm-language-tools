import OpenAI from "openai";

const client = new OpenAI({
    apiKey:
        "YOUR_API_KEY",
    dangerouslyAllowBrowser: true,
});

const selectedText = window.getSelection().toString();

if (selectedText) {
    const message =
        `Dịch sang tiếng Việt (chỉ trả lời bằng bản dịch, không đưa thêm bất cứ văn bản nào khác; hãy dịch tự nhiên và thoát nghĩa: ` +
        selectedText.replaceAll(/\n\n/g, '\n').replaceAll(/\n/g, '\n\n');
    const stream = await client.chat.completions.create({
        messages: [{ role: "user", content: message }],
        model: "gpt-4o",
        stream: true,
    });

    let index = 0;
    for await (const chunk of stream) {
        showTooltip(chunk.choices[0]?.delta?.content || "", index);
        index++;
    }
}

function showTooltip(translation, index) {
    if (document.getElementById("llmVietnameseTranslatorTooltip")) {
        document.getElementById("llmVietnameseTranslatorTooltip").innerHTML +=
            translation;
        return;
    }

    if (index > 0) {
        return;
    }

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    let container = range.startContainer;
    if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement;
    }

    const computedStyle = window.getComputedStyle(container);

    const style = document.createElement("style");
    style.textContent = `
          .translation-tooltip {
            position: absolute;
            background-color: #212121;
            color: #ececec;
            padding: 0px 0px;
            border-radius: 0px;
            z-index: 10000;
            font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            width: ${rect.width}px;
            top: ${window.scrollY + rect.bottom}px;
            left: ${window.scrollX + rect.left}px;
            font-size: ${computedStyle.fontSize};
            line-height: ${computedStyle.lineHeight};
            text-align: left;
            margin: 0px;
            white-space: pre-wrap;
          }
        `;
    document.head.appendChild(style);

    const tooltip = document.createElement("div");
    tooltip.id = "llmVietnameseTranslatorTooltip";
    tooltip.className = "translation-tooltip";
    tooltip.innerHTML = translation;

    document.body.appendChild(tooltip);

    const handleClickOutside = (event) => {
        if (!tooltip.contains(event.target)) {
            tooltip.remove();
            document.removeEventListener("click", handleClickOutside);
        }
    };

    document.addEventListener("click", handleClickOutside);
}
