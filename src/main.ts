import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { open, save } from '@tauri-apps/api/dialog';

const textarea = document.getElementById('centered-textarea') as HTMLElement;
const wordCountDisplay = document.getElementById('word-count') as HTMLElement;
const toggleButtons = document.getElementById('toggle-buttons') as HTMLElement;
const editableButtons = document.getElementById('editable-buttons') as HTMLElement;
  
toggleButtons.addEventListener('click', function() {
    editableButtons.classList.toggle('hide');
});

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

document.getElementById('open-btn')?.addEventListener('click', async () => {
    const selectedPath: any = await open({ multiple: false, directory: false });
    if (selectedPath) {
        const content = await readTextFile(selectedPath);
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
    const content = (textarea as HTMLElement).innerText;
    if (currentFilePath) {
        await writeTextFile(currentFilePath, content);
    }
}

async function saveFileAs(): Promise<void> {
    const content = (textarea as HTMLElement).innerText;
    const savePath = await save({
        filters: [{
            name: 'Text File',
            extensions: ['txt']
        }]
    })
    if (savePath) {
        currentFilePath = savePath;
        await writeTextFile(savePath, content, { dir: BaseDirectory.Document });
    }
}


function adjustPadding() {
    const viewportHeight = window.innerHeight;
  
    // Calculate if content is taller than the viewport
    if (textarea.scrollHeight > viewportHeight/2) {
      textarea.style.paddingBottom = '500px'; // Adjust as needed
    } else {
      textarea.style.paddingBottom = '0px';
    }
  }
  
  // Adjust padding on content changes and window resize
textarea?.addEventListener('input', adjustPadding);
window.addEventListener('resize', adjustPadding);
  
// Initial adjustment
setInterval(() => {
    adjustPadding();
    updateWordCounter();
}, 500)


// handle toggling theme
document.getElementById('theme-toggle')?.addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
});

function updateWordCounter() {
    const text = textarea.innerText.trim();
    const words = text.split(/\s+/).filter(function(n) { return n !== '' });
    wordCountDisplay.textContent = `${words.length} Words written`;
}