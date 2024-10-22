import { loadTextDocument, loadCodeDocument, loadPDFDocument } from './fileLoader.js';

export function renderTree(files, parentElement) {
    const ul = document.createElement('ul');

    files.forEach(file => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');

        link.textContent = file.name;
        link.href = '#';  // Prevent page reload

        // Handle click to open directory or file
        link.addEventListener('click', (e) => {
            e.preventDefault();

            if (file.isDirectory) {
                // Toggle display of subdirectories
                const subTree = listItem.querySelector('ul');
                if (subTree) {
                    subTree.style.display = subTree.style.display === 'none' ? 'block' : 'none';
                }
            } else {
                // Determine file type by extension and load accordingly
                const fileExtension = file.name.split('.').pop().toLowerCase();

                if (fileExtension === 'pdf') {
                    loadPDFDocument(file.path);  // Load PDF files
                } else if (['js', 'html', 'css', 'py'].includes(fileExtension)) {
                    loadCodeDocument(file.path, fileExtension);  // Load code files with syntax highlighting
                } else {
                    loadTextDocument(file.path);  // Load other text files
                }
            }
        });

        listItem.appendChild(link);

        // If it's a directory, render its children recursively
        if (file.isDirectory && file.children && file.children.length > 0) {
            renderTree(file.children, listItem);  // Recursive call
        }

        ul.appendChild(listItem);
    });

    parentElement.appendChild(ul);
}
