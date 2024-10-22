document.addEventListener('DOMContentLoaded', function() {
    const themeSelector = document.getElementById('theme-selector');
    let themes = {};

    // Fetch and store the color palettes from the JSON file
    fetch('/themes/color-palettes.json')  // Adjust the path to color-palettes.json if needed
        .then(response => response.json())
        .then(data => {
            themes = data.themes;

            // Default theme name should be Nordic Pink
            const defaultThemeName = 'Nordic Pink';

            // Check if a theme is stored in localStorage
            const savedThemeName = localStorage.getItem('selectedTheme');

            // Find the selected or default theme (default to Nordic Pink if none is saved)
            const themeToApply = themes.find(t => t.name === savedThemeName) || themes.find(t => t.name === defaultThemeName);

            // Apply the saved theme or the default theme (Nordic Pink)
            applyTheme(themeToApply);

            // Set the dropdown to the saved theme, or default to Nordic Pink
            themeSelector.value = savedThemeName || defaultThemeName;
        })
        .catch(error => console.error('Error fetching themes:', error));

    // Event listener for theme selection
    themeSelector.addEventListener('change', (event) => {
        const selectedThemeName = event.target.value;
        const selectedTheme = themes.find(t => t.name === selectedThemeName);

        if (selectedTheme) {
            applyTheme(selectedTheme);

            // Save the selected theme to localStorage
            localStorage.setItem('selectedTheme', selectedThemeName);
        }
    });
    
    // Function to apply the selected theme
    function applyTheme(theme) {
        // Set the special colors (background, foreground, cursor)
        document.documentElement.style.setProperty('--background-color', theme.special.background);
        document.documentElement.style.setProperty('--text-color', theme.special.foreground);
        document.documentElement.style.setProperty('--cursor-color', theme.special.cursor);
    
        // Set the color palette (color0 - color15)
        for (let i = 0; i <= 15; i++) {
            document.documentElement.style.setProperty(`--color${i}`, theme.colors[`color${i}`]);
        }
    
        // General and additional variables
        document.documentElement.style.setProperty('--header-background-color', theme.colors.color0);
        document.documentElement.style.setProperty('--header-text-color', theme.colors.color7);
        
        document.documentElement.style.setProperty('--footer-background-color', theme.colors.color1);
        document.documentElement.style.setProperty('--footer-text-color', theme.colors.color15);
        
        document.documentElement.style.setProperty('--accent-color', theme.colors.color1);
        document.documentElement.style.setProperty('--highlight-color', theme.colors.color6);
        
        document.documentElement.style.setProperty('--button-background-color', theme.colors.color4);
        document.documentElement.style.setProperty('--button-text-color', theme.colors.color7);
    
        // Borders and lines
        document.documentElement.style.setProperty('--border-color', theme.colors.color3);
        document.documentElement.style.setProperty('--input-border-color', theme.colors.color5);
        document.documentElement.style.setProperty('--input-bg-color', theme.colors.color0);
    
        // Links
        document.documentElement.style.setProperty('--link-color', theme.colors.color2);
        document.documentElement.style.setProperty('--link-hover-color', theme.colors.color9);
    
        // Sidebar
        document.documentElement.style.setProperty('--sidebar-background-color', theme.colors.color0);
        document.documentElement.style.setProperty('--sidebar-text-color', theme.colors.color8);
    
        // Modals
        document.documentElement.style.setProperty('--modal-background-color', theme.colors.color5);
        document.documentElement.style.setProperty('--modal-text-color', theme.colors.color7);
        document.documentElement.style.setProperty('--modal-border-color', theme.colors.color4);
    
        // Notifications and Alerts
        document.documentElement.style.setProperty('--notification-background-color', theme.colors.color1);
        document.documentElement.style.setProperty('--notification-text-color', theme.colors.color7);
        
        document.documentElement.style.setProperty('--alert-background-color', theme.colors.color9);
        document.documentElement.style.setProperty('--alert-text-color', theme.colors.color15);
    }
    
});
