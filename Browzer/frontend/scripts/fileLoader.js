export function loadTextDocument(filePath) {
    fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`)
        .then(response => response.text())
        .then(text => {
            viewer.textContent = text;  // Display the text content
        })
        .catch(err => console.error('Error loading document:', err));
}

// Function to load a code document and apply CodeMirror
export function loadCodeDocument(filePath) {
    fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`)
        .then(response => response.text())
        .then(content => {
            const codeViewer = document.getElementById('codeEditor');
            codeViewer.innerHTML = '';  // Clear previous content

            // Initialize CodeMirror in the codeViewer
            const editor = CodeMirror(codeViewer, {
                value: content,
                mode: 'javascript',  // Set a default mode like JavaScript (can be changed)
                lineNumbers: true,
                theme: 'default',
                lineWrapping: true,
                indentUnit: 4,  // Indentation
            });

            // Ensure the tab switches to Code Viewer
            document.querySelector('a[href="#codeEditor"]').click();
        })
        .catch(err => console.error('Error loading code document:', err));
}

// Function to load a PDF into the document viewer
export function loadPDFDocument(filePath) {
    viewer.innerHTML = `<iframe src="${filePath}" width="100%" height="100%"></iframe>`;
}