import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api';
import { open, save } from '@tauri-apps/api/dialog';

const textarea = document.getElementById('centered-textarea') as HTMLElement;
const wordAmount = document.getElementById('word-amount') as HTMLElement;
const title = document.getElementById('document-title') as HTMLElement;

let currentFilePath: any = null;

// handle opening files with the open-with function on windows
async function handleStartupFile() {
    try {
        const args: any = await invoke('tauri', { __tauriModule: 'Process', message: 'cliArgs' });   
        console.log(args); 
        if (args && args.length > 1) {
            const filePath = args[1];
            const content = await readTextFile(filePath);
            textarea.innerText = content;
            currentFilePath = filePath;
        }
    } catch (err) {
        console.error("error reading startup file:", err);
    }
}

function getFileName(filePath: string) {
    // Split the filePath by '/' (for Unix/Linux) or '\\' (for Windows)
    const parts = filePath.split(/[/\\]/);
    // Return the last part, which should be the file name
    return parts.pop();
}

// saving files with ctrl + s (will save as or simply save wheter a file is open or not)
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

// open button listener
document.getElementById('open-btn')?.addEventListener('click', async () => {
    const selectedPath: any = await open({ multiple: false, directory: false });
    if (selectedPath) {
        const content = await readTextFile(selectedPath);
        textarea.innerText = content;
        currentFilePath = selectedPath;
        title.innerText = getFileName(selectedPath) || '';
    }
});

// save button listener
document.getElementById('save-btn')?.addEventListener('click', async () => {
    if (!currentFilePath) {
        await saveFileAs();
    } else {
        await saveFile();
    }
});

// save as button listener
document.getElementById('save-as-btn')?.addEventListener('click', async () => {
    await saveFileAs();
});

// create file button listener 
document.getElementById('new-file-btn')?.addEventListener('click', createNewFile);

async function saveFile(): Promise<void> {
    const content = (textarea as HTMLElement).innerText;
    if (currentFilePath) {
        await writeTextFile(currentFilePath, content);
        title.innerText = getFileName(currentFilePath) || '';
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

        title.innerText = getFileName(currentFilePath) || '';
    }
}

function createNewFile() {
    textarea.innerText = ''; // Clear the textarea
    currentFilePath = null; // Reset the current file path
    title.innerText = 'Untitled'; // Reset the document title
    wordAmount.innerText = '0'; // Reset the word count
}

function adjustPadding() {
    const viewportHeight = window.innerHeight;
  
    // Calculate if content is taller than the viewport
    if (textarea.scrollHeight > viewportHeight/2) {
      textarea.style.paddingBottom = '400px'; // Adjust as needed
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

    if (currentFilePath) {
        saveFile();
    }
}, 500)

// handle toggling theme
document.getElementById('theme-toggle')?.addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
});

function updateWordCounter() {
    const text = textarea.innerText.trim();
    const words = text.split(/\s+/).filter(function(n) { return n !== '' });
    wordAmount.innerText = `${words.length}`;
}

window.addEventListener('DOMContentLoaded', handleStartupFile);

// formatting
document.getElementById('bold-btn')?.addEventListener('click', () => applyFormatting('bold'));
document.getElementById('header-btn')?.addEventListener('click', () => applyFormatting('formatBlock', '<h2>'));
document.getElementById('list-btn')?.addEventListener('click', () => applyFormatting('insertUnorderedList'));

function applyFormatting(command: string, value = '') {
    document.execCommand(command, false, value);
}
  