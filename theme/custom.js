// Add feature boxes to key features
document.addEventListener('DOMContentLoaded', function() {
    const features = document.querySelectorAll('.content ul li strong');
    features.forEach(feature => {
        const li = feature.parentElement;
        if (li && li.parentElement && li.parentElement.previousElementSibling && 
            li.parentElement.previousElementSibling.textContent.includes('Key Features')) {
            li.classList.add('feature-box');
        }
    });
});

// Add path boxes to learning paths
document.addEventListener('DOMContentLoaded', function() {
    const paths = document.querySelectorAll('.content ol li a');
    paths.forEach(path => {
        const li = path.parentElement;
        if (li && li.parentElement && li.parentElement.previousElementSibling && 
            li.parentElement.previousElementSibling.textContent.includes('Learning Path')) {
            li.classList.add('path-box');
        }
    });
});

// Add styling to ASCII diagrams
document.addEventListener('DOMContentLoaded', function() {
    const asciiBlocks = document.querySelectorAll('pre code.language-ascii');
    asciiBlocks.forEach(block => {
        block.parentElement.classList.add('ascii-diagram');
    });
});

// Add copy button to code blocks
document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        
        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(block.textContent).then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            });
        });
        
        block.parentElement.insertBefore(copyButton, block);
    });
});

// Add collapsible sections
document.addEventListener('DOMContentLoaded', function() {
    const h2s = document.querySelectorAll('h2');
    h2s.forEach(h2 => {
        const content = [];
        let sibling = h2.nextElementSibling;
        while (sibling && sibling.tagName !== 'H2') {
            content.push(sibling);
            sibling = sibling.nextElementSibling;
        }
        
        if (content.length > 0) {
            const collapseButton = document.createElement('button');
            collapseButton.className = 'collapse-button';
            collapseButton.innerHTML = '▼';
            h2.insertBefore(collapseButton, h2.firstChild);
            
            collapseButton.addEventListener('click', function() {
                content.forEach(el => {
                    el.style.display = el.style.display === 'none' ? '' : 'none';
                });
                collapseButton.innerHTML = collapseButton.innerHTML === '▼' ? '▶' : '▼';
            });
        }
    });
});

// Add smooth scrolling to anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Add table of contents floating menu
document.addEventListener('DOMContentLoaded', function() {
    const content = document.querySelector('.content');
    if (!content) return;
    
    const headings = content.querySelectorAll('h2, h3');
    if (headings.length === 0) return; // Don't create TOC if no headings
    
    const toc = document.createElement('div');
    toc.className = 'floating-toc';
    toc.innerHTML = '<h3>On this page</h3>';
    
    const tocList = document.createElement('ul');
    headings.forEach(heading => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        a.className = heading.tagName.toLowerCase();
        li.appendChild(a);
        tocList.appendChild(li);
    });
    
    toc.appendChild(tocList);
    content.insertBefore(toc, content.firstChild);
});

// Add feature boxes to key features
document.addEventListener('DOMContentLoaded', function() {
    const features = document.querySelectorAll('.content ul li strong');
    features.forEach(feature => {
        const li = feature.parentElement;
        if (li && li.parentElement && li.parentElement.previousElementSibling && 
            li.parentElement.previousElementSibling.textContent.includes('Key Features')) {
            li.classList.add('feature-box');
        }
    });
});

// Add path boxes to learning paths
document.addEventListener('DOMContentLoaded', function() {
    const paths = document.querySelectorAll('.content ol li a');
    paths.forEach(path => {
        const li = path.parentElement;
        if (li && li.parentElement && li.parentElement.previousElementSibling && 
            li.parentElement.previousElementSibling.textContent.includes('Learning Path')) {
            li.classList.add('path-box');
        }
    });
});

// Add styling to ASCII diagrams
document.addEventListener('DOMContentLoaded', function() {
    const asciiBlocks = document.querySelectorAll('pre code.language-ascii');
    asciiBlocks.forEach(block => {
        block.parentElement.classList.add('ascii-diagram');
    });
});