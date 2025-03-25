window.addEventListener('load', (event) => {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            themeVariables: {
                primaryColor: '#4a9eff',
                primaryTextColor: '#fff',
                primaryBorderColor: '#3182ce',
                lineColor: '#333333',
                secondaryColor: '#f687b3',
                tertiaryColor: '#f6f8fa',
                textColor: '#2d3748',
                mainBkg: '#ffffff',
                nodeBorder: '#ccd7e0',
                clusterBkg: '#f8fafc',
                clusterBorder: '#e2e8f0',
                defaultLinkColor: '#333333'
            },
            flowchart: {
                curve: 'linear',
                padding: 15,
                useMaxWidth: true,
                htmlLabels: true,
                diagramPadding: 8,
                arrowMarkerAbsolute: true,
                nodeSpacing: 50,
                rankSpacing: 50
            }
        });
    } else {
        console.error('Mermaid not loaded');
    }
}); 