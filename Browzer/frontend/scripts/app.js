document.addEventListener('DOMContentLoaded', function() {
    const directoryTree = document.getElementById('directoryTree');
    const viewer = document.getElementById('documentViewer');

    function displayFileName(fileName) {
        const fileNameElement = document.getElementById('fileName');
        const terminalBtn = document.getElementById('openTerminalBtn');
    
        fileNameElement.textContent = `${fileName}`;
    
        // Show "Open in Terminal" button for code or document files only
        const ext = fileName.split('.').pop().toLowerCase();
        if (['js', 'html', 'css', 'py', 'sh', 'md'].includes(ext)) {
            terminalBtn.style.display = 'inline';  // Show button
        } else {
            terminalBtn.style.display = 'none';  // Hide button for other types like PDFs
        }
    }    

    // Function to load a text document
    function loadTextDocument(filePath) {
        displayFileName(filePath.split('/').pop()); // Get filename
        fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`)
            .then(response => response.text())
            .then(text => {
                viewer.innerHTML = `<pre><code>${text}</code></pre>`;  // Display the text content in preformatted code block
                document.querySelector('a[href="#documentViewer"]').click(); // Switch to text viewer
            })
            .catch(err => console.error('Error loading document:', err));
    }

    document.addEventListener('DOMContentLoaded', function () {
        const directoryTree = document.getElementById('directoryTree');
    
        // Search buttons
        const searchFilesBtn = document.getElementById('searchFilesBtn');
        const searchDirsBtn = document.getElementById('searchDirsBtn');
    
        // Search function
        function search(query, type) {
            fetch(`/api/search?query=${encodeURIComponent(query)}&type=${type}`)
                .then(res => res.json())
                .then(results => {
                    directoryTree.innerHTML = '';  // Clear tree before rendering
                    if (results.length > 0) {
                        renderTree(results, directoryTree);
                    } else {
                        console.log('No results found');
                    }
                })
                .catch(err => console.error('Error fetching search results:', err));
        }
    
        // Event listeners for buttons
        searchFilesBtn.addEventListener('click', function () {
            const query = document.getElementById('searchInput').value;
            search(query, 'files');
        });
    
        searchDirsBtn.addEventListener('click', function () {
            const query = document.getElementById('searchInput').value;
            search(query, 'directories');
        });
    });

    function storeActiveFilePath(filePath) {
        fetch('/api/store-file-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath })
        })
        .then(response => {
            if (!response.ok) {
                console.error('Failed to store file path');
            }
        })
        .catch(err => console.error('Error storing file path:', err));
    }
    
    function openInTerminal() {
        fetch('/api/get-file-path')
            .then(response => response.json())
            .then(data => {
                const filePath = data.filePath;
                // Now use this file path to open in terminal
                document.getElementById('terminalIframe').src = `/terminal?file=${encodeURIComponent(filePath)}`;
                document.getElementById('terminalPane').style.display = 'block';
            })
            .catch(err => console.error('Error opening terminal:', err));
    }    
    
    document.getElementById('openTerminalBtn').addEventListener('click', openInTerminal);
    
    function openInTerminal() {
        const activeFilePath = getActiveFilePath();  // Retrieve active file
        fetch('/api/open-terminal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath: activeFilePath }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('terminalIframe').src = `http://localhost:3000/terminal?file=${encodeURIComponent(activeFilePath)}`;
                document.getElementById('terminalPane').style.display = 'block';  // Show terminal pane
            } else {
                console.error('Failed to open terminal:', data.error);
            }
        })
        .catch(err => console.error('Error opening terminal:', err));
    }

    function getActiveFilePath() {
        const activeFileElement = document.querySelector('#fileName');  // Assuming this is where the active file is shown
        return activeFileElement ? activeFileElement.textContent : null;
    }
    
    function openInTerminal() {
        const filePath = getActiveFilePath();
        if (!filePath) {
            console.error('No active file to open in terminal');
            return;
        }
    
        fetch('/api/open-terminal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: filePath })
        })
        .then(response => {
            if (response.ok) {
                console.log('Opened terminal successfully');
            } else {
                console.error('Failed to open terminal');
            }
        })
        .catch(err => console.error('Error opening terminal:', err));
    }
    
    // Function to load a code document and apply CodeMirror
    function loadCodeDocument(filePath) {
        displayFileName(filePath.split('/').pop()); // Get filename
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
        displayFileName(filePath.split('/').pop()); // Get filename
        const pdfViewerContainer = document.getElementById('pdfViewer');
        pdfViewerContainer.innerHTML = '';  // Clear previous content
    
        // Add parameters to hide everything except the PDF content
        const fileUrl = `/api/file-content?path=${encodeURIComponent(filePath)}#toolbar=0&scrollbar=1&navpanes=0&statusbar=0&view=FitH`;
    
        const iframe = document.createElement('iframe');
        iframe.src = fileUrl;
        iframe.style.border = 'none';  // Remove borders
        iframe.style.width = '100%';
        iframe.style.height = '70vh';
        iframe.style.backgroundColor = 'transparent';  // Transparent background
        pdfViewerContainer.appendChild(iframe);
    
        // Switch to PDF Viewer tab
        document.querySelector('a[href="#pdfViewer"]').click();
    }   
    
    // Fetch and display directory structure recursively
    function renderTree(files, parentElement, level = 0) {
        files.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            if (a.name.startsWith('.') && !b.name.startsWith('.')) return 1;
            if (!a.name.startsWith('.') && b.name.startsWith('.')) return -1;
            return a.name.localeCompare(b.name);
        });
    
        const ul = document.createElement('ul');
        ul.style.paddingLeft = `${5 * level}px`;
    
        files.forEach(file => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            
            // Using Nerd Font icons
            link.innerHTML = file.isDirectory ? `<i class="nf nf-cod-folder"></i> ${file.name}` : `<i class="nf nf-cod-fileD"></i> ${file.name}`;
            link.href = '#';
    
            if (level > 0) {
                link.classList.add('small-font');
            }
    
            link.addEventListener('click', (e) => {
                e.preventDefault();
    
                if (file.isDirectory) {
                    const subTree = listItem.querySelector('ul');
                    if (subTree) {
                        subTree.style.display = subTree.style.display === 'none' ? 'block' : 'none';
                    } else {
                        const newSubTree = document.createElement('ul');
                        renderTree(file.children, newSubTree, level + 1);
                        listItem.appendChild(newSubTree);
                    }
                } else {
                    displayFileDetails(file.path);
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    if (fileExtension === 'pdf') {
                        loadPDFDocument(file.path);
                    } else if (['js', 'html', 'css', 'py', 'sh', 'md'].includes(fileExtension)) {
                        loadCodeDocument(file.path);
                    } else {
                        loadTextDocument(file.path);
                    }
                }
            });
    
            listItem.appendChild(link);
    
            if (file.isDirectory && file.children && file.children.length > 0) {
                renderTree(file.children, listItem, level + 1);
            }
    
            ul.appendChild(listItem);
        });
    
        parentElement.appendChild(ul);
    }
    
    function displayFileDetails(filePath) {
        fetch(`/api/file-info?path=${encodeURIComponent(filePath)}`)
            .then(response => response.json())
            .then(fileDetails => {
                document.getElementById('filePath').textContent = fileDetails.path;
                document.getElementById('fileNameDetail').textContent = fileDetails.name;
                document.getElementById('fileSize').textContent = fileDetails.size;
                document.getElementById('creationDate').textContent = new Date(fileDetails.creationDate).toLocaleString();
                document.getElementById('lastAccess').textContent = new Date(fileDetails.lastAccess).toLocaleString();
                document.getElementById('fileOwner').textContent = fileDetails.owner;
            })
            .catch(err => console.error('Error fetching file details:', err));
    }    
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        else if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
        else return `${(bytes / 1048576).toFixed(2)} MB`;
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

     // Function to handle search input
     searchInput.addEventListener('input', function(event) {
        const query = event.target.value;

        if (query.length > 1) {
            fetch(`/api/search?query=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(results => {
                    directoryTree.innerHTML = '';  // Clear previous results
                    if (results.length > 0) {
                        renderTree(results, directoryTree);d
                    } else {
                        console.log('No results found');
                    }
                })
                .catch(err => console.error('Error fetching search results:', err));
        }
    });

    // Initial fetch for the full directory tree
    fetchFiles();
});