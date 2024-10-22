#!/bin/bash

# Define project name (you can pass this as a parameter or hard-code it)
PROJECT_NAME=Browzer

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: ./create_project.sh Browzer"
  exit 1
fi

# Create main project directory
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Create backend directory and setup
mkdir -p backend/routes
cd backend

# Initialize Node.js and install basic packages
npm init -y
npm install express cors fs os

# Create app.js
cat <<EOL > app.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, '../frontend')));

// API for system status (simplified example)
app.get('/api/system-status', (req, res) => {
    const cpuUsage = os.loadavg(); // 1, 5, and 15 minute average CPU load
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    res.json({ cpuUsage, freeMemory, totalMemory });
});

// API to browse files (simplified example)
app.get('/api/files', (req, res) => {
    const dirPath = req.query.path || path.join(__dirname, '../');
    fs.readdir(dirPath, (err, files) => {
        if (err) return res.status(500).send('Error reading directory');
        res.json(files);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
EOL

# Go back to project root
cd ..

# Create frontend directory structure
mkdir -p frontend/{styles,scripts,assets}

# Create HTML, CSS, and JS files
cat <<EOL > frontend/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Browser</title>
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="styles/styles.css">
</head>
<body>
    <header class="sticky-top bg-dark text-white">
        <nav class="navbar">
            <div class="container-fluid">
                <span class="navbar-brand mb-0 h1">File Browser</span>
            </div>
        </nav>
    </header>

    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <aside class="col-3 bg-light sidebar">
                <div id="directoryTree">
                    <!-- Directory Tree will load here -->
                </div>
            </aside>

            <!-- Main Content -->
            <main class="col-9">
                <div class="row">
                    <div class="col-md-6" id="viewer">
                        <!-- Viewer.js content -->
                    </div>
                    <div class="col-md-6" id="editor">
                        <!-- CodeMirror editor -->
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Status Bar -->
    <footer class="fixed-bottom bg-dark text-white d-flex justify-content-between px-3">
        <span>System Status: Good</span>
    </footer>

    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="scripts/app.js"></script>
</body>
</html>
EOL

# Create basic CSS file
cat <<EOL > frontend/styles/styles.css
/* Custom styles */
body {
    margin: 0;
    padding: 0;
}
.sidebar {
    padding: 10px;
}
EOL

# Create basic JS file
cat <<EOL > frontend/scripts/app.js
document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display system status
    fetch('/api/system-status')
        .then(res => res.json())
        .then(data => {
            console.log('System Status:', data);
            // Update the status bar
            document.querySelector('footer span').textContent = \`CPU: \${data.cpuUsage[0]}%, Memory Free: \${data.freeMemory}\`;
        });

    // Fetch directory structure
    fetch('/api/files')
        .then(res => res.json())
        .then(files => {
            const directoryTree = document.getElementById('directoryTree');
            directoryTree.innerHTML = files.map(file => \`<li>\${file}</li>\`).join('');
        });
});
EOL

# Create the .env file
cat <<EOL > .env
PORT=3000
EOL

# Create README.md
cat <<EOL > README.md
# $PROJECT_NAME

## Project setup
- Backend: Node.js (Express)
- Frontend: HTML5, Bootstrap 5, CSS3, JavaScript
EOL

echo "Project directory structure created successfully!"
