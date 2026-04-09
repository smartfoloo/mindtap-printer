
let lastSliderWidth = null;
let observer = null;

function getIframe() {
  return document.getElementById('1_NB_Main_IFrame');
}

function extractTextFromIframe() {
  const iframe = getIframe();
  if (!iframe) return null;

  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc || !doc.body) return null;
    return doc.body.innerText.trim();
  } catch (e) {
    console.warn('MindTap Extractor: Could not access iframe content', e);
    return null;
  }
}

function onSliderChange() {
  setTimeout(() => {
    const text = extractTextFromIframe();
    if (!text) return;

    chrome.storage.local.get(['extractedText'], (result) => {
      const existing = result.extractedText || '';
      const separator = existing ? '\n\n--- PAGE BREAK ---\n\n' : '';
      const updated = existing + separator + text;
      chrome.storage.local.set({ extractedText: updated });
    });
  }, 1500);
}

function watchSlider(doc) {
  const fillDiv = doc.querySelector('.rangeSlider__fill');
  if (!fillDiv) return false;

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const newWidth = fillDiv.style.width;
        if (newWidth !== lastSliderWidth) {
          lastSliderWidth = newWidth;
          onSliderChange();
        }
      }
    }
  });

  observer.observe(fillDiv, { attributes: true });
  console.log('MindTap Extractor: Watching slider for page changes.');
  return true;
}

function init() {
  const iframe = getIframe();
  if (!iframe) {
    setTimeout(init, 2000);
    return;
  }

  const tryWatch = () => {
    let iframeDoc;
    try {
      iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    } catch (e) {
      setTimeout(tryWatch, 2000);
      return;
    }

    if (!iframeDoc || !iframeDoc.body) {
      setTimeout(tryWatch, 2000);
      return;
    }

    const found = watchSlider(iframeDoc);
    if (!found) setTimeout(tryWatch, 2000);
  };

  if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
    tryWatch();
  } else {
    iframe.addEventListener('load', tryWatch);
    tryWatch();
  }
}

init();