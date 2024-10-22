document.addEventListener('DOMContentLoaded', function() {
    const directoryTree = document.getElementById('directoryTree');
    const viewer = document.getElementById('documentViewer');

    // Extension map for languages
    const extensionMap = {
        'js': 'javascript',
        'html': 'htmlmixed',
        'css': 'css',
        'py': 'python',       // Python
        'sh': 'shell',        // Bash
        'md': 'markdown',     // Markdown
    };

    // Function to load code document
    function loadCodeDocument(filePath) {
        fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`)
            .then(response => response.text())
            .then(content => {
                const codeViewer = document.getElementById('codeEditor');
                codeViewer.innerHTML = '';  // Clear previous content

                const extension = filePath.split('.').pop().toLowerCase();
                let mode = extensionMap[extension] || 'text/plain'; // Default to plain text if mode is unknown

                // Initialize CodeMirror
                CodeMirror(codeViewer, {
                    value: content,
                    mode: mode,
                    lineNumbers: true,
                    theme: 'default',  // Adjust to use custom theme if needed
                    lineWrapping: true,
                });

                // Ensure the tab switches to Code Viewer
                document.querySelector('a[href="#codeEditor"]').click();
            })
            .catch(err => console.error('Error loading code document:', err));
    }

    // Function to load text document
    function loadTextDocument(filePath) {
        fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`)
            .then(response => response.text())
            .then(text => {
                viewer.textContent = text;
            })
            .catch(err => console.error('Error loading document:', err));
    }

    // Function to load a PDF
    function loadPDFDocument(filePath) {
        viewer.innerHTML = `<iframe src="${filePath}" width="100%" height="100%"></iframe>`;
    }

    // Fetch and display directory structure recursively
    function renderTree(files, parentElement) {
        const ul = document.createElement('ul');
        files.forEach(file => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = file.name;
            link.href = '#'; // Prevent page reload

            // Handle click to open directory or file
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (file.isDirectory) {
                    const subTree = listItem.querySelector('ul');
                    if (subTree) {
                        subTree.style.display = subTree.style.display === 'none' ? 'block' : 'none';
                    }
                } else {
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    if (fileExtension === 'pdf') {
                        loadPDFDocument(file.path); // Load PDF
                    } else if (['js', 'html', 'css', 'py', 'sh', 'md'].includes(fileExtension)) {
                        loadCodeDocument(file.path);  // Load code files with CodeMirror
                    } else {
                        loadTextDocument(file.path);  // Load plain text
                    }
                }
            });

            listItem.appendChild(link);
            if (file.isDirectory && file.children && file.children.length > 0) {
                renderTree(file.children, listItem);
            }
            ul.appendChild(listItem);
        });
        parentElement.appendChild(ul);
    }

    // Fetch files and directories
    function fetchFiles(path = '') {
        fetch(`/api/files?path=${encodeURIComponent(path)}`)
            .then(res => res.json())
            .then(files => {
                directoryTree.innerHTML = '';  // Clear the tree before rendering
                renderTree(files, directoryTree);  // Render the full tree
            })
            .catch(err => console.error('Error fetching files:', err));
    }

    // Initial fetch for the full directory tree
    fetchFiles();
});
