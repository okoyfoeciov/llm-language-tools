import { GoogleGenAI } from "@google/genai";


export async function show(prompt, name, zIndex) {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
        const message =
            prompt +
            selectedText.replaceAll(/\n\n/g, '\n').replaceAll(/\n/g, '\n\n');

        try {
            const stream = await new GoogleGenAI({
                apiKey: await (await fetch("http://localhost:52473/google-ai-studio-api-key")).text()
            }).models.generateContentStream({
                model: "gemini-2.0-flash",
                contents: message,
            });

            let index = 0;
            for await (const chunk of stream) {
                showTooltip(chunk.text || "", index, name, zIndex);
                index++;
            }
        } catch (error) {
            alert(error)
        }
    }
}

function showTooltip(content, index, name, zIndex) {
    if (document.getElementById(name + "Tooltip")) {
        document.getElementById(name + "Tooltip").innerHTML +=
            content;
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
          .${name}-tooltip {
            position: absolute;
            background-color: #212121;
            color: #ececec;
            padding: 0px 0px;
            border-radius: 0px;
            z-index: ${zIndex};
            font-family: Noto Sans, sans-serif, Arial, sans-serif, Helvetica, sans-serif;
            width: ${rect.width}px;
            top: ${window.scrollY + rect.bottom}px;
            left: ${window.scrollX + rect.left}px;
            font-size: ${computedStyle.fontSize};
            line-height: ${computedStyle.lineHeight};
            margin: 0px;
            white-space: pre-wrap;
          }
        `;
    document.head.appendChild(style);

    const tooltip = document.createElement("div");
    tooltip.id = name + "Tooltip";
    tooltip.className = `${name}-tooltip`;
    tooltip.innerHTML = content;

    document.body.appendChild(tooltip);

    const handleClickOutside = (event) => {
        if (!tooltip.contains(event.target)) {
            tooltip.remove();
            document.removeEventListener("click", handleClickOutside);
        }
    };

    document.addEventListener("click", handleClickOutside);
}
