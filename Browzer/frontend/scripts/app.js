document.addEventListener('DOMContentLoaded', function() {
    const directoryTree = document.getElementById('directoryTree');
    const viewer = document.getElementById('documentViewer');

    function displayFileName(fileName) {
        document.getElementById('fileName').textContent = `${fileName}`;
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
    function renderTree(files, parentElement) {
        const ul = document.createElement('ul');

        files.forEach(file => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = file.name;
            link.href = '#';  // Prevent page reload

            // Handle click to open directory or file
            // Inside the renderTree function
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (file.isDirectory) {
                    // Handle directory behavior
                } else {
                    // Determine the file type
                    const fileExtension = file.name.split('.').pop().toLowerCase();

                    if (fileExtension === 'pdf') {
                        loadPDFDocument(file.path);  // Load PDF files
                    } else if (['js', 'html', 'css', 'py', 'sh', 'md'].includes(fileExtension)) {
                        loadCodeDocument(file.path);  // Load code files with syntax highlighting
                    } else {
                        loadTextDocument(file.path);  // Load other text files
                    }

                    // Add this to call file details API and display info
                    displayFileDetails(file.path);
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