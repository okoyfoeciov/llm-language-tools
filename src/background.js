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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "llmVietnameseTranslator") {
    const selectedText = info.selectionText;

    if (selectedText) {
      const message = `Dịch sang tiếng Việt (chỉ trả lời bằng bản dịch, không được đưa thêm bất cứ văn bản nào khác): ` + selectedText;
      const stream = await client.chat.completions.create({
        messages: [{ role: 'user', content: message }],
        model: 'gpt-4o-mini',
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

      // Tạo style cho tooltip
      const style = document.createElement('style');
      style.textContent = `
        .translation-tooltip {
          position: absolute;
          background-color: black;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          z-index: 10000;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          width: 80vw;
          min-height: 100px;
          margin-top: 10px;
          white-space: pre-wrap;
        }
      `;
      document.head.appendChild(style);

      // Tạo tooltip
      const tooltip = document.createElement('div');
      tooltip.id = 'llmVietnameseTranslatorTooltip';
      tooltip.className = 'translation-tooltip';
      tooltip.textContent = translation;

      document.body.appendChild(tooltip);

      // Đặt tooltip tại vị trí gần văn bản đã chọn
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      tooltip.style.top = `${window.scrollY + rect.bottom}px`;
      tooltip.style.left = `${window.scrollX + rect.left}px`;

      // Thêm sự kiện cho việc click ra ngoài để xóa tooltip
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