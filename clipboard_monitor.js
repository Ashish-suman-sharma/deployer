import { exec } from 'child_process';

let previousClipboardContent = '';

function checkClipboard() {
  exec('powershell Get-Clipboard', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error reading clipboard: ${err}`);
      return;
    }
    const currentClipboardContent = stdout.trim();
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
  });
}

setInterval(checkClipboard, 1000);