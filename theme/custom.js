document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Utility function to check if we're on mobile
        function isMobile() {
            return window.innerWidth <= 1100;
        }
        
        // Elements
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-bar-toggle, .icon-button.menu-toggle');
        
        if (!sidebar || !menuToggle) {
            console.error('Critical elements not found');
            return;
        }
        
        // Setup initial state
        if (isMobile()) {
            document.body.classList.remove('sidebar-visible');
            sidebar.style.transform = 'translateX(-100%)';
        }
        
        // Add close button to sidebar
        let closeBtn = sidebar.querySelector('.sidebar-close-button');
        if (!closeBtn) {
            closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.className = 'sidebar-close-button';
            closeBtn.setAttribute('aria-label', 'Close sidebar');
            sidebar.insertBefore(closeBtn, sidebar.firstChild);
        }
        
        // Create overlay if it doesn't exist
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }
        
        // Lock state variable
        let isAnimating = false;
        
        // Function to show sidebar
        function showSidebar() {
            if (isAnimating) return;
            isAnimating = true;
            
            document.body.classList.add('sidebar-visible');
            sidebar.style.transform = 'translateX(0)';
            
            if (isMobile()) {
                const content = document.querySelector('.content');
                if (content) {
                    content.style.transform = 'translateX(80%)';
                }
                overlay.style.display = 'block';
                setTimeout(() => { overlay.style.opacity = '1'; }, 10);
            }
            
            setTimeout(() => { isAnimating = false; }, 300);
        }
        
        // Function to hide sidebar
        function hideSidebar() {
            if (isAnimating) return;
            isAnimating = true;
            
            document.body.classList.remove('sidebar-visible');
            sidebar.style.transform = 'translateX(-100%)';
            
            if (isMobile()) {
                const content = document.querySelector('.content');
                if (content) {
                    content.style.transform = 'none';
                }
                overlay.style.opacity = '0';
                setTimeout(() => { overlay.style.display = 'none'; }, 300);
            }
            
            setTimeout(() => { isAnimating = false; }, 300);
        }
        
        // Toggle sidebar function
        function toggleSidebar(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (document.body.classList.contains('sidebar-visible')) {
                hideSidebar();
            } else {
                showSidebar();
            }
        }
        
        // Event listeners
        menuToggle.addEventListener('click', toggleSidebar);
        closeBtn.addEventListener('click', hideSidebar);
        overlay.addEventListener('click', hideSidebar);
        
        // Resize handler
        window.addEventListener('resize', () => {
            // Reset any transform on the content on resize
            const content = document.querySelector('.content');
            if (content && !isMobile()) {
                content.style.transform = 'none';
            }
            
            // Hide sidebar in mobile view, show it in desktop view
            if (isMobile()) {
                if (document.body.classList.contains('sidebar-visible')) {
                    content.style.transform = 'translateX(80%)';
                } else {
                    content.style.transform = 'none';
                }
            }
        });
        
        console.log('Enhanced navigation system initialized');
    }, 300);

    setTimeout(() => {
        // Completely rebuild sidebar navigation
        const rebuildSidebarNavigation = () => {
            console.log('Rebuilding sidebar navigation...');
            
            // Get all chapter items
            const chapterItems = document.querySelectorAll('.sidebar .chapter-item');
            
            // Process each item
            chapterItems.forEach(item => {
                // Make item a flex container to keep elements on the same line
                item.style.display = 'flex';
                item.style.flexWrap = 'nowrap';
                item.style.alignItems = 'center';
                item.style.width = '100%';
                
                // Check if it has children
                const hasChildren = item.querySelector('.section') !== null;
                
                // Remove any existing classes that might interfere
                item.classList.remove('has-sub');
                
                if (hasChildren) {
                    // Add our custom class
                    item.classList.add('has-sub');
                    
                    // Check if it should be expanded
                    const shouldBeExpanded = 
                        item.classList.contains('expanded') || 
                        item.querySelector('a.active') !== null ||
                        item.querySelector('.section a.active') !== null;
                    
                    if (shouldBeExpanded) {
                        item.classList.add('expanded');
                    } else {
                        item.classList.remove('expanded');
                    }
                    
                    // Get the section element
                    const section = item.querySelector('.section');
                    
                    // Fix the section structure - ensure horizontal alignment
                    if (section) {
                        // Remove existing event listeners by cloning
                        const newSection = section.cloneNode(true);
                        section.parentNode.replaceChild(newSection, section);
                        
                        // Make the section a flex container
                        newSection.style.display = 'flex';
                        newSection.style.alignItems = 'center';
                        newSection.style.width = '100%';
                        newSection.style.justifyContent = 'space-between';
                        
                        // Make sure there's no overflow causing horizontal scrollbars
                        newSection.style.overflow = 'hidden';
                        
                        // Add event listener to toggle expansion
                        newSection.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Toggle expanded state
                            if (item.classList.contains('expanded')) {
                                item.classList.remove('expanded');
                            } else {
                                item.classList.add('expanded');
                            }
                        });
                    }
                }
                
                // Fix any potential horizontal overflow issues
                item.style.overflow = 'hidden';
                
                // Ensure consistent font styling
                const links = item.querySelectorAll('a');
                links.forEach(link => {
                    link.style.fontFamily = 'var(--font-sans)';
                    link.style.fontSize = '0.9em';
                    
                    // Ensure links are inline elements
                    link.style.display = 'inline-flex';
                    link.style.alignItems = 'center';
                });
                
                // Fix specifically for toggle links
                const toggleLink = item.querySelector('a.toggle');
                if (toggleLink) {
                    toggleLink.style.marginLeft = 'auto'; // Push to the right side
                }
            });
            
            // Fix any remaining horizontal scrollbars in the sidebar
            const sidebarScrollbox = document.querySelector('.sidebar-scrollbox');
            if (sidebarScrollbox) {
                sidebarScrollbox.style.overflowX = 'hidden';
            }
            
            console.log('Sidebar navigation rebuilt');
        };
        
        // Run immediately
        rebuildSidebarNavigation();
        
        // Also run after a short delay to catch any dynamic changes
        setTimeout(rebuildSidebarNavigation, 500);
        
        // Run when the window is resized
        window.addEventListener('resize', () => {
            setTimeout(rebuildSidebarNavigation, 200);
        });
        
    }, 500);

    // Add this function to your existing JavaScript file
    function enhanceMobileToggles() {
        // Only apply on mobile devices
        if (window.innerWidth <= 1100) {
            console.log("Enhancing mobile toggles...");
            
            // Get all chapter items
            const chapterItems = document.querySelectorAll('.sidebar .chapter-item');
            
            chapterItems.forEach(item => {
                // Check if it has children and needs a toggle
                const hasChildren = item.querySelector('.section') !== null;
                
                if (hasChildren) {
                    // Get or create the toggle element
                    let toggleElement = item.querySelector('.custom-toggle');
                    
                    if (!toggleElement) {
                        toggleElement = document.createElement('span');
                        toggleElement.className = 'custom-toggle';
                        toggleElement.innerHTML = '▶';
                        
                        // Get the first link element
                        const linkElement = item.querySelector('a');
                        if (linkElement) {
                            linkElement.insertBefore(toggleElement, linkElement.firstChild);
                        }
                    }
                    
                    // Update toggle state
                    if (item.classList.contains('expanded')) {
                        toggleElement.classList.add('expanded');
                    } else {
                        toggleElement.classList.remove('expanded');
                    }
                    
                    // Add tap/click handler specific for mobile
                    toggleElement.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Toggle expanded state
                        if (item.classList.contains('expanded')) {
                            item.classList.remove('expanded');
                            toggleElement.classList.remove('expanded');
                        } else {
                            item.classList.add('expanded');
                            toggleElement.classList.add('expanded');
                        }
                    }, { passive: false });
                }
            });
        }
    }

    // Call this function when needed
    document.addEventListener('DOMContentLoaded', function() {
        // Initial call with delay
        setTimeout(enhanceMobileToggles, 500);
        
        // Call on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 1100) {
                setTimeout(enhanceMobileToggles, 200);
            }
        });
        
        // Call after any sidebar state change
        document.body.addEventListener('click', function(e) {
            if (e.target.closest('.sidebar-toggler, #sidebar-toggle-button')) {
                setTimeout(enhanceMobileToggles, 300);
            }
        });
    });
});
