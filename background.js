chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "llmVietnameseTranslator",
    title: "Dịch",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "llmVietnameseTranslator") {
    const selectedText = info.selectionText;

    if (selectedText) {
      const apiKey = ""; // Thay bằng API key của bạn.
      const apiUrl = "https://api.openai.com/v1/chat/completions";

      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: `Dịch sang tiếng Việt (chỉ trả lời bằng bản dịch, không được đưa thêm bất cứ văn bản nào khác): ${selectedText}` }]
        })
      })
        .then(response => response.json())
        .then(data => {
          const translation = data.choices[0]?.message?.content || "Không thể dịch được.";
          showTooltip(tab.id, translation);
        })
        .catch(err => {
          console.error("Error calling OpenAI API:", err);
          showTooltip(tab.id, "Lỗi khi gọi API: " + err);
        });
    }
  }
});

function showTooltip(tabId, translation) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (translation) => {
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
          max-width: 80vw;
          margin-top: 10px;
          white-space: pre-wrap;
        }
      `;
      document.head.appendChild(style);

      // Tạo tooltip
      const tooltip = document.createElement('div');
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
    args: [translation]
  });
}
