document.addEventListener('DOMContentLoaded', function() {
    // Hide theme toggle elements
    const themeToggle = document.getElementById('theme-toggle');
    const themePopup = document.querySelector('.theme-popup');
    
    if (themeToggle) themeToggle.style.display = 'none';
    if (themePopup) themePopup.style.display = 'none';
});
