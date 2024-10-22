document.addEventListener('DOMContentLoaded', function() {
    const directoryTree = document.getElementById('directoryTree');
    const viewer = document.getElementById('documentViewer');
    const searchInput = document.getElementById('searchInput'); // Reference to search input

    function displayFileName(fileName) {
        document.getElementById('fileName').textContent = `${fileName}`;
    }

    function loadTextDocument(filePath) {
        displayFileName(filePath.split('/').pop());
        fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`)
            .then(response => response.text())
            .then(text => {
                viewer.innerHTML = `<pre><code>${text}</code></pre>`;
                document.querySelector('a[href="#documentViewer"]').click();
            })
            .catch(err => console.error('Error loading document:', err));
    }

    // Function to load a code document and apply CodeMirror
    function loadCodeDocument(filePath) {
        displayFileName(filePath.split('/').pop());
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
                    indentUnit: 4,
                });

                document.querySelector('a[href="#codeEditor"]').click();
            })
            .catch(err => console.error('Error loading code document:', err));
    }

    // Function to load a PDF into the document viewer
    function loadPDFDocument(filePath) {
        displayFileName(filePath.split('/').pop());
        const pdfViewerContainer = document.getElementById('pdfViewer');
        pdfViewerContainer.innerHTML = '';  // Clear previous content

        const fileUrl = `/api/file-content?path=${encodeURIComponent(filePath)}#toolbar=0&scrollbar=1&navpanes=0&statusbar=0&view=FitH`;

        const iframe = document.createElement('iframe');
        iframe.src = fileUrl;
        iframe.style.border = 'none';
        iframe.style.width = '100%';
        iframe.style.height = '70vh';
        iframe.style.backgroundColor = 'transparent';
        pdfViewerContainer.appendChild(iframe);

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
            link.innerHTML = file.isDirectory ? `<i class="nf nf-fa-folder"></i> ${file.name}` : `<i class="nf nf-md-file"></i> ${file.name}`;
            link.href = '#';
    
            if (level > 0) {
                link.classList.add('small-font');
            }
    
            link.addEventListener('click', (e) => {
                e.preventDefault();
    
                if (file.isDirectory) {
                    // Toggle the directory's display immediately upon click
                    if (listItem.querySelector('ul')) {
                        listItem.querySelector('ul').style.display = listItem.querySelector('ul').style.display === 'none' ? 'block' : 'none';
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
 
    // Fetch and display file details
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

    // Handle search input
    searchInput.addEventListener('input', function(event) {
        const query = event.target.value;

        if (query.length > 1) {
            fetch(`/api/search?query=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(results => {
                    directoryTree.innerHTML = '';
                    if (results.length > 0) {
                        renderTree(results, directoryTree);
                    } else {
                        console.log('No results found');
                    }
                })
                .catch(err => console.error('Error fetching search results:', err));
        }
    });

    fetchFiles(); // Fetch initial directory structure
});
