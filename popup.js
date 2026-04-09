
function countPages(text) {
  if (!text) return 0;
  return (text.match(/--- PAGE BREAK ---/g) || []).length + 1;
}

function render(text) {
  const main = document.getElementById('main');
  document.getElementById('charCount').textContent = text ? text.length.toLocaleString() : '0';
  document.getElementById('pageCount').textContent = text ? countPages(text) : '0';

  if (!text) {
    main.innerHTML = `
      <div class="empty-state">
        <div class="icon">📚</div>
        <div>No text collected yet.</div>
        <div>Go to Cengage MindTap and skim<br>through the ebook using the slider.</div>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div class="text-area-wrap">
      <textarea id="textOutput" readonly></textarea>
    </div>
    <div class="actions">
      <button class="btn-copy" id="copyBtn">Copy All Text</button>
      <button class="btn-clear" id="clearBtn">Clear</button>
    </div>
  `;

  document.getElementById('textOutput').value = text;

  document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(text).then(() => {
      showStatus('✓ Copied to clipboard!');
    });
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Clear all collected text?')) {
      chrome.storage.local.set({ extractedText: '' }, () => {
        showStatus('✓ Cleared.');
        render('');
      });
    }
  });
}

function showStatus(msg) {
  const el = document.getElementById('status');
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 2000);
}

chrome.storage.local.get(['extractedText'], (result) => {
  render(result.extractedText || '');
});