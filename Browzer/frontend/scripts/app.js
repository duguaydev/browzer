document.addEventListener('DOMContentLoaded', function() {
    const directoryTree = document.getElementById('directoryTree');
    const viewer = document.getElementById('documentViewer');

    // Function to load a text document
    function loadTextDocument(filePath) {
        fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`)
            .then(response => response.text())
            .then(text => {
                viewer.textContent = text;  // Display the text content
                document.querySelector('a[href="#documentViewer"]').click(); // Switch to text viewer
            })
            .catch(err => console.error('Error loading document:', err));
    }

    // Function to load a code document and apply CodeMirror
    function loadCodeDocument(filePath) {
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
                    theme: 'default',  // Use the custom theme name from CSS
                    lineWrapping: true,
                    indentUnit: 4,  // Indentation
                });

                // Switch to Code Viewer tab
                document.querySelector('a[href="#codeEditor"]').click();
            })
            .catch(err => console.error('Error loading code document:', err));
    }
   
    // Function to load a PDF into the document viewer
    function loadPDFDocument(filePath) {
        viewer.innerHTML = `<iframe src="${filePath}" width="100%" height="100%"></iframe>`;
        document.querySelector('a[href="#pdfViewer"]').click(); // Switch to PDF viewer
    }

    // Fetch and display directory structure recursively
    function renderTree(files, parentElement) {
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
                    } else if (['js', 'html', 'css', 'py', 'sh', 'md'].includes(fileExtension)) {
                        loadCodeDocument(file.path);  // Load code files with syntax highlighting
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
