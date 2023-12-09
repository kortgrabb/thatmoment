import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';
import { open, save } from '@tauri-apps/api/dialog';

let currentFilePath: any = null;

document.addEventListener('keydown', async function(event) {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      if (!currentFilePath) {
        await saveFileAs();
      } else {
        await saveFile();
      }
    }
});

document.getElementById('centered-textarea')?.addEventListener('paste', (e) => {
    e.preventDefault();

    const clipText = e.clipboardData?.getData('text');

    document.execCommand('insertText', false, clipText);
})

document.getElementById('open-btn')?.addEventListener('click', async () => {
    const selectedPath: any = await open({ multiple: false, directory: false });
    if (selectedPath) {
        const content = await readTextFile(selectedPath);
        const textarea = document.getElementById('centered-textarea') as HTMLElement;
        textarea.innerText = content;
        currentFilePath = selectedPath;
    }
});

document.getElementById('save-btn')?.addEventListener('click', async () => {
    if (!currentFilePath) {
        await saveFileAs();
    } else {
        await saveFile();
    }
});

document.getElementById('save-as-btn')?.addEventListener('click', async () => {
    await saveFileAs();
});

async function saveFile(): Promise<void> {
    const content = (document.getElementById('centered-textarea') as HTMLElement).innerText;
    if (currentFilePath) {
        await writeTextFile(currentFilePath, content);
    }
}

async function saveFileAs(): Promise<void> {
    const content = (document.getElementById('centered-textarea') as HTMLElement).innerText;
    const savePath = await save();
    if (savePath) {
        currentFilePath = savePath;
        await writeTextFile(savePath, content);
    }
}


function adjustPadding() {
    const textarea: any = document.getElementById('centered-textarea');
    const viewportHeight = window.innerHeight;
  
    // Calculate if content is taller than the viewport
    if (textarea.scrollHeight > viewportHeight/2) {
      textarea.style.paddingBottom = '500px'; // Adjust as needed
    } else {
      textarea.style.paddingBottom = '0px';
    }
  }
  
  // Adjust padding on content changes and window resize
document.getElementById('centered-textarea')?.addEventListener('input', adjustPadding);
window.addEventListener('resize', adjustPadding);
  
// Initial adjustment
setInterval(() => {
    adjustPadding();
}, 500)