import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: "", // YOUR OPENAI API KEY
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "llmVietnameseTranslator",
    title: "Dịch",
    contexts: ["selection"]
  });
});

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.contextMenus.create({
//     id: "[slow]llmVietnameseTranslator",
//     title: "Dịch (chậm)",
//     contexts: ["selection"]
//   });
// });

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "llmVietnameseTranslator" || info.menuItemId === "[slow]llmVietnameseTranslator") {
    const selectedText = info.selectionText;
    const model = info.menuItemId === "llmVietnameseTranslator" ? "gpt-4o-mini": "gpt-4o"

    if (selectedText) {
      const message = `Dịch sang tiếng Việt (chỉ trả lời bằng bản dịch, không đưa thêm bất cứ văn bản nào khác; hãy dịch tự nhiên và thoát nghĩa): ` + selectedText;
      const stream = await client.chat.completions.create({
        messages: [{ role: 'user', content: message }],
        model: model,
        stream: true,
      });

      let index = 0;
      for await (const chunk of stream) {
        showTooltip(tab.id, chunk.choices[0]?.delta?.content || '',index);
        index++;
      }
    }
  }
});

function showTooltip(tabId, translation, index) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (translation, index) => {
      if (document.getElementById('llmVietnameseTranslatorTooltip')) {
        document.getElementById('llmVietnameseTranslatorTooltip').textContent += translation;
        return
      }

      if (index > 0) {
        return 
      }

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      let container = range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement;
      }

      const computedStyle = window.getComputedStyle(container)

      const style = document.createElement('style');
      style.textContent = `
        .translation-tooltip {
          position: absolute;
          background-color: #212121;
          color: #ececec;
          padding: 0px 0px;
          border-radius: 0px;
          z-index: 10000;
          min-height: 100px;
          font-family: Noto Sans, sans-serif, Arial, sans-serif, Helvetica, sans-serif;
          width: ${computedStyle.width};
          font-size: ${computedStyle.fontSize};
          line-height: ${computedStyle.lineHeight};
          margin-top: 0px;
          white-space: pre-wrap;
        }
      `;
      document.head.appendChild(style);

      const tooltip = document.createElement('div');
      tooltip.id = 'llmVietnameseTranslatorTooltip';
      tooltip.className = 'translation-tooltip';
      tooltip.textContent = translation;

      document.body.appendChild(tooltip);

      tooltip.style.top = `${window.scrollY + rect.bottom}px`;
      tooltip.style.left = `${window.scrollX + rect.left}px`;

      const handleClickOutside = (event) => {
        if (!tooltip.contains(event.target)) {
          tooltip.remove();
          document.removeEventListener('click', handleClickOutside);
        }
      };

      document.addEventListener('click', handleClickOutside);
    },
    args: [translation, index]
  });
}
