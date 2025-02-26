document.addEventListener('DOMContentLoaded', function() {
    // Hide theme toggle elements
    const themeToggle = document.getElementById('theme-toggle');
    const themePopup = document.querySelector('.theme-popup');
    
    if (themeToggle) themeToggle.style.display = 'none';
    if (themePopup) themePopup.style.display = 'none';
    
    // Mobile sidebar improvements
    if (window.innerWidth <= 1100) {
        const body = document.body;
        
        // IMPORTANT: Only get existing elements, don't create duplicates
        const menuToggle = document.querySelector('#menu-bar-toggle'); // Use querySelector instead of getElementById
        const sidebar = document.querySelector('.sidebar');
        
        console.log('Sidebar element found:', sidebar); // Debug logging
        
        // Remove any existing event listeners to prevent duplicates
        if (menuToggle) {
            const newMenuToggle = menuToggle.cloneNode(true);
            menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
        }
        
        // Clean up any existing overlays to prevent duplicates
        const existingOverlays = document.querySelectorAll('.sidebar-overlay');
        existingOverlays.forEach(overlay => {
            overlay.parentNode.removeChild(overlay);
        });
        
        // Create single overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        // Exit early if no sidebar exists
        if (!sidebar) {
            console.error('Sidebar element not found');
            return;
        }
        
        // Force sidebar to be visible in DOM but hidden via transform
        sidebar.style.display = 'block'; 
        
        // Clean toggle function that properly shows sidebar
        function toggleSidebar(event) {
            if (event) event.preventDefault();
            
            console.log('Toggle sidebar called'); // Debug logging
            
            if (sidebar.classList.contains('visible')) {
                sidebar.classList.remove('visible');
                body.classList.remove('sidebar-visible');
                console.log('Sidebar hidden'); // Debug logging
            } else {
                sidebar.classList.add('visible');
                body.classList.add('sidebar-visible');
                console.log('Sidebar shown'); // Debug logging
            }
        }
        
        // Attach click handler to menu toggle
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleSidebar);
        } else {
            // Create menu toggle only if it doesn't exist
            const newMenuToggle = document.createElement('button');
            newMenuToggle.id = 'menu-bar-toggle';
            newMenuToggle.innerHTML = '☰';
            newMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
            document.body.appendChild(newMenuToggle);
            
            newMenuToggle.addEventListener('click', toggleSidebar);
        }
        
        // Make sure overlay closes sidebar when clicked
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('visible');
            body.classList.remove('sidebar-visible');
        });
        
        // Add swipe gestures
        let touchStartX = 0;
        let touchEndX = 0;
        
        // Check for passive support
        let supportsPassive = false;
        try {
            window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
                get: function () { supportsPassive = true; }
            }));
        } catch(e) {}
        
        // Swipe right to open sidebar (more sensitive)
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, supportsPassive ? { passive: true } : false);
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, supportsPassive ? { passive: true } : false);
        
        function handleSwipe() {
            const swipeDistance = touchEndX - touchStartX;
            // More sensitive - smaller required distance and larger edge area
            if (touchStartX < 50 && swipeDistance > 40) {
                sidebar.classList.add('visible');
                body.classList.add('sidebar-visible');
            }
            // Swipe left to close (when sidebar is open)
            else if (sidebar.classList.contains('visible') && swipeDistance < -40) {
                sidebar.classList.remove('visible');
                body.classList.remove('sidebar-visible');
            }
        }
        
        // Close sidebar when clicking links
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 1100) {
                    setTimeout(() => {
                        sidebar.classList.remove('visible');
                        body.classList.remove('sidebar-visible');
                    }, 150);
                }
            });
        });
        
        // Make sure the sidebar is initially hidden
        sidebar.classList.remove('visible');
        body.classList.remove('sidebar-visible');
        
        // Double-check z-index to ensure proper layering
        if (sidebar) sidebar.style.zIndex = '99999';
        if (overlay) overlay.style.zIndex = '99998';
        if (menuToggle) menuToggle.style.zIndex = '100000';
    }
});
