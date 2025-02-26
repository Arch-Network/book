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
});
