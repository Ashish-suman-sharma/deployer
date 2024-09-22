import clipboardy from 'clipboardy';
import { exec } from 'child_process';

let previousClipboardContent = '';

function checkClipboard() {
  const currentClipboardContent = clipboardy.readSync();
  if (currentClipboardContent !== previousClipboardContent) {
    previousClipboardContent = currentClipboardContent;
    console.log('Clipboard content changed. Closing Chrome browser...');
    exec('taskkill /IM chrome.exe /F', (err, stdout, stderr) => {
      if (err) {
        console.error(`Error closing Chrome: ${err}`);
        return;
      }
      console.log('Chrome browser closed.');
    });
  }
}

setInterval(checkClipboard, 1000);