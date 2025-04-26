/* eslint-disable @typescript-eslint/no-unused-vars */
import JSZip from 'jszip';
import { getProjectSourceApiUrl } from './func';
import Cookies from 'js-cookie';

/**
 * Finds the first <button> element containing a <span class="hidden md:flex">Publish</span>
 * @returns {HTMLButtonElement|null}
 */
export function findPublishButton(): HTMLButtonElement | null {
  return (
    Array.from(document.querySelectorAll('button')).find(btn => {
      const span = btn.querySelector('span.hidden.md\\:flex') as HTMLSpanElement;

      // Check if the span exists and contains the text 'Publish'
      return span?.innerText.trim() === 'Publish';
    }) || null
  );
}

/**
 * Extracts clean code text from a CodeMirror editor component with multiple extraction strategies
 * @returns {string} The extracted code as plain text
 */
function extractCodeFromEditor() {
  try {
    // Try to find CodeMirror editor content
    const editorContent = document.querySelector('.cm-content') as HTMLDivElement;
    if (!editorContent) {
      console.warn('❌ No CodeMirror editor content found');
      return '';
    }

    // Strategy 1: Extract using innerText if available (most reliable for large content)
    // This preserves whitespace and line breaks while being more efficient
    const innerTextContent = editorContent.innerText as string;
    if (innerTextContent && innerTextContent.trim().length > 0) {
      console.log('📋 Extracted code using innerText strategy');
      return innerTextContent;
    }

    // Strategy 2: Process line by line
    const codeLines = [] as string[];
    const lines = editorContent.querySelectorAll('.cm-line') as NodeListOf<HTMLDivElement>;

    if (lines.length === 0) {
      console.warn('⚠️ No code lines found in editor');
      return '';
    }

    // Process each line with a more robust approach
    lines.forEach((line, index) => {
      try {
        // Try innerText first (more reliable)
        const lineText = line.innerText;
        if (lineText !== undefined) {
          codeLines.push(lineText);
          return;
        }

        // Fallback to textContent if innerText isn't working
        const textContent = line.textContent;
        if (textContent) {
          codeLines.push(textContent);
          return;
        }

        // Last resort: manually extract text from child nodes
        const extractedText = Array.from(line.childNodes)
          .map(node => node.textContent || '')
          .join('');
        codeLines.push(extractedText);
      } catch (lineError) {
        console.warn(`⚠️ Error extracting line ${index}:`, lineError);
        // Add empty line to preserve line numbers
        codeLines.push('');
      }
    });

    console.log('📋 Extracted code using line-by-line strategy');
    return codeLines.join('\n');
  } catch (error) {
    console.error('❌ Error extracting code:', error);

    // Fallback strategy for any errors: try to get entire textContent
    try {
      const editor = document.querySelector('.cm-editor');
      if (editor) {
        console.log('📋 Using fallback extraction strategy');
        return editor.textContent || '';
      }
    } catch (fallbackError) {
      console.error('❌ Fallback extraction also failed:', fallbackError);
    }

    return '';
  }
}

/**
 * Fetches the project source code listing from the API
 * @returns {Promise<Object>} The API response as JSON
 */
// async function fetchSourceCode(token: string): Promise<object> {
//   const headers = {
//     Authorization: `Bearer ${token}`,
//     Accept: 'application/json',
//   };

//   const API_URL = getProjectSourceApiUrl();

//   if (!API_URL) {
//     throw new Error('Project source API URL is not available');
//   }
//   const response = await fetch(API_URL, { headers });

//   if (!response.ok) {
//     throw new Error(`Failed to fetch source code: ${response.status}`);
//   }

//   return await response.json();
// }

/**
 * Creates a zip file from the API response and triggers a download
 * @param {Object} response - The API response containing files array
 * @returns {Promise<void>}
 */
async function createAndDownloadZip(response: { files: any[] }): Promise<void> {
  try {
    // Assuming JSZip is already loaded via manifest.json
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip library is not available. Make sure it is included in your extension.');
    }

    const zip = new JSZip();
    const files = response.files || [];

    for (const file of files) {
      const name = file.name;

      if (file.binary) {
        // Placeholder empty file for binary entries
        zip.file(name, '');
      } else {
        // Text file
        const contents = file.contents || '';
        zip.file(name, contents);
      }
    }

    // Generate the zip file as a blob
    const blob = await zip.generateAsync({ type: 'blob' });

    // Create a download URL and trigger download
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    const pageTitle = document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'source_code';
    downloadLink.download = `${pageTitle}.zip`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);

    console.log(`📦 Created zip with ${files.length} files`);
  } catch (error) {
    console.error('❌ Download failed:', error);
    throw error;
  }
}

/**
 * Attaches Copy and Download buttons immediately after the given Publish button
 * @param {HTMLButtonElement|null} publishBtn
 */
export function attachButtons(publishBtn: HTMLButtonElement | null) {
  if (!publishBtn || publishBtn.dataset.buttonsAttached) return;
  publishBtn.dataset.buttonsAttached = 'true';

  // --- Copy Button ---
  // now the DOM is fully parsed
  const copyBtn = document.getElementById('lvb-copy-btn') as HTMLButtonElement | null;

  if (!copyBtn) {
    console.error('❌ could not find #lvb-copy-btn');
    return;
  }
  // const copyBtn = window.document.getElementById('lvb-copy-btn') as (HTMLButtonElement);
  // const copyBtn = document.createElement('button');
  // copyBtn.type = 'button';
  // copyBtn.textContent = 'Copy';
  // copyBtn.className = `inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none bg-affirmative text-affirmative-foreground hover:opacity-80 shadow-black/50 h-7 rounded-md px-3 py-2 gap-1.5`;
  // copyBtn && copyBtn.addEventListener('click', () =>
  //   // handleCopyClick(copyBtn)
  //   console.log('Copy button clicked'),
  // );

  // --- Download Button ---
  const downloadBtn = document.createElement('button');
  downloadBtn.type = 'button';
  downloadBtn.setAttribute('aria-label', 'Download project code');
  downloadBtn.className = `inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none bg-affirmative text-affirmative-foreground hover:opacity-80 shadow-black/50 h-7 rounded-md px-3 py-2 gap-1.5`;
  const labelSpan = document.createElement('span');
  labelSpan.className = 'hidden md:flex';
  labelSpan.textContent = 'Download code';
  downloadBtn.appendChild(labelSpan);
  downloadBtn.addEventListener(
    'click',
    () => handleDownloadClick(),
    // console.log('Download button clicked'),
  );

  // Insert buttons after the Publish button
  const container = publishBtn.parentElement;
  container?.insertBefore(copyBtn, publishBtn.nextSibling);
  container?.insertBefore(downloadBtn, copyBtn.nextSibling);
  console.log('✅ Copy and Download buttons attached after Publish');

  // function updateExtensionButtons() {
  //   const enabled = document.querySelector('button[aria-label="Code viewer"]')?.getAttribute('aria-pressed') === 'true';
  //   copyBtn.disabled = !enabled;
  //   // downloadBtn.disabled = !enabled
  // }

  // // initialize state
  // updateExtensionButtons();

  // // watch for clicks (attributes update after click)
  // document.querySelector('button[aria-label="Code viewer"]')?.addEventListener('click', () => {
  //   // next tick, the aria-pressed attribute will have flipped
  //   setTimeout(updateExtensionButtons, 0);
  // });

  // Initial disable if no CodeMirror editor present
  copyBtn.disabled = !document.querySelector('.cm-editor');

  // (Optional) Watch for editor being added/removed to re‐enable/disable
  const editorObserver = new MutationObserver(() => {
    const hasEditor = !!document.querySelector('.cm-editor');
    copyBtn.disabled = !hasEditor;
  });
  editorObserver.observe(document.body, { childList: true, subtree: true });
}

/**
 * Fetches the project source code listing from the API
 * @returns {Promise<Object>} The API response as JSON
 */
async function fetchSourceCode(): Promise<{
  files: Array<{
    name: string;
    contents?: string;
    binary: boolean;
  }>;
} | null> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_SESSION_ID' }, async response => {
      if (!response?.success) {
        reject(new Error('Failed to get session-id cookie'));
        return;
      }

      const token = response.token;
      if (!token) {
        reject(new Error('Session token not found'));
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        };

        const API_URL = getProjectSourceApiUrl();
        if (!API_URL) {
          throw new Error('Project source API URL is not available');
        }

        const response = await fetch(API_URL, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch source code: ${response.status}`);
        }

        const data = await response.json();
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Handles the download button click event
 * @returns {Promise<void>}
 */
export async function handleDownloadClick(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const button = document.createElement('button') as HTMLButtonElement;
    const span = button.querySelector('span');
    const originalText = span?.textContent || 'Download code';

    try {
      if (span) span.textContent = 'Downloading...';
      button.disabled = true;

      const data = await fetchSourceCode();
      if (!data) {
        throw new Error('No data received from API');
      }
      await createAndDownloadZip(data);

      if (span) span.textContent = 'Downloaded!';
      resolve();
    } catch (error) {
      console.error('❌ Download failed:', error);
      if (span) span.textContent = 'Failed';
      reject(error);
    } finally {
      setTimeout(() => {
        if (span) span.textContent = originalText;
        button.disabled = false;
      }, 1500);
    }
  });
}

/**
 * Handles the copy button click event
 * Extracts code from CodeMirror and copies to clipboard */

export function handleCopyClick(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // find element by role
    const filename = getSelectedTabFileName();
    if (!filename) {
      console.warn('❌ No file selected in tablist');
      reject(new Error('No file selected in tablist'));
      return;
    }

    // resolve();
    try {
      const codeSource = await fetchSourceCode();

      const files = codeSource?.files || [];
      const file = files.filter(f => f.binary === false).find(file => file.name === filename);
      if (!file) {
        throw new Error(`File not found: ${filename}`);
      }

      // console.log('🖱️ filename', filename);

      const codeText = file.contents || '';
      // Extract code from CodeMirror editor with timeout protection
      // const extractionPromise = new Promise((resolve, reject) => {
      //   const timeout = setTimeout(() => {
      //     reject(new Error('Code extraction timed out'));
      //   }, 3000);

      //   try {
      //     const codeText = extractCodeFromEditor();
      //     clearTimeout(timeout);
      //     resolve(codeText);
      //   } catch (err) {
      //     clearTimeout(timeout);
      //     reject(err);
      //   }
      // });

      // const codeText = (await extractionPromise) as string;

      // if (!codeText || codeText.trim().length === 0) {
      //   throw new Error('No code content found to copy');
      // }

      // console.log(`📋 Copying ${codeText.length} chars of code: ${codeText.substring(0, 50)}...`);

      // Use clipboard API with timeout protection
      const clipboardPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Clipboard operation timed out'));
        }, 2000);

        navigator.clipboard
          .writeText(codeText)
          .then(() => {
            clearTimeout(timeout);
            resolve();
          })
          .catch(err => {
            clearTimeout(timeout);
            reject(err);
          });
      });

      await clipboardPromise;
      resolve();
    } catch (err) {
      console.error('❌ Copy failed:', err);
      reject(err);
    }
  });
}

/**
 * Get the filename of the currently selected tab.
 *
 * @param {string|HTMLElement} tablistSelector  A CSS selector or the <div role="tablist"> element itself.
 * @returns {string|null}  The text of the selected tab, or null if none.
 */
export function getSelectedTabFileName(tablistSelectorValue?: string | HTMLElement): string | null {
  // resolve element
  const tablistSelector = tablistSelectorValue || (document.querySelector('div[role="tablist"]') as HTMLDivElement);

  const container = typeof tablistSelector === 'string' ? document.querySelector(tablistSelector) : tablistSelector;
  if (!container) {
    console.warn('Tablist container not found:', tablistSelector);
    return null;
  }

  // find the active tab button
  const activeTab = container.querySelector('[role="tab"][aria-selected="true"], [role="tab"][data-state="active"]');
  if (!activeTab) return null;

  // grab the inner <span> if present, otherwise fall back to button text
  const span = activeTab.querySelector('span');
  return span?.textContent?.trim() ?? activeTab.textContent?.trim() ?? '';
}

// function getLovableSessionId() {
//     return new Promise((resolve, reject) => {
//       chrome.cookies.get(
//         { url: 'https://lovable.dev', name: 'lovable-session-id.id' },
//         cookie => {
//           if (chrome.runtime.lastError) {
//             return reject(chrome.runtime.lastError);
//           }
//           if (!cookie) {
//             return reject(new Error('lovable-session-id.id cookie not found'));
//           }
//           resolve(cookie.value);
//         }
//       );
//     });
//   }
