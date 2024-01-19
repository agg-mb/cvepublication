/* Path to data */
const DATA_FILE = "./data.json";  // Relative path to data.json file

/* Automatic scrolling */
const dashboard = document.getElementById('dashboard');
let scrollDirection = 1; // 1 for downward, -1 for upward
const scrollSpeed = 1; // Adjust for faster or slower scroll

/* Fetch data */
fetch(DATA_FILE)
    .then(response => response.json())
    .then(data => {
        displayData(data);
    })
    .catch(error => {
        console.error('Error fetching the CVE data:', error);
    });

/* Display the data */
function displayData(data) {
const vulnerabilitiesArray = data.vulnerabilities || [];
const now = new Date();
const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
const twentyFourHoursAgoFormatted = twentyFourHoursAgo.toISOString().split('T')[0];


const todaysHighScoreVulnerabilities = vulnerabilitiesArray.filter(vulnerability => {
    if (!vulnerability.cve.published) {
        return false; // Skip this entry if 'published' property is missing or null
    }
    const publishedDateFormatted = vulnerability.cve.published.split('T')[0];
    
    // Filtering for the last 24 hours and baseScore >= 5.0
    const cvssMetrics = vulnerability.cve.metrics && Array.isArray(vulnerability.cve.metrics.cvssMetricV31) && vulnerability.cve.metrics.cvssMetricV31.length > 0 ? vulnerability.cve.metrics.cvssMetricV31[0] : null;

    if (!cvssMetrics) {
        return false;
    }

    const baseScore = parseFloat(cvssMetrics.cvssData.baseScore);
    return publishedDateFormatted >= twentyFourHoursAgoFormatted && baseScore >= 5.0;
});


    // Sorting the vulnerabilities by baseScore from highest to lowest
    todaysHighScoreVulnerabilities.sort((a, b) => {
        const scoreA = a.cve.metrics.cvssMetricV31.length > 0 ? a.cve.metrics.cvssMetricV31[0].cvssData.baseScore : 0;
        const scoreB = b.cve.metrics.cvssMetricV31.length > 0 ? b.cve.metrics.cvssMetricV31[0].cvssData.baseScore : 0;
        return scoreB - scoreA; // For descending order
    });

    const dashboard = document.getElementById('dashboard');

    function sanitizeHTML(str) {
        var temp = document.createElement('div');
        temp.innerHTML = str;
    
        // Allowable tags and attributes
        var safe_tags = ['a', 'b', 'i', 'em', 'strong', 'p', 'ul', 'li', 'h1', 'h2', 'h3', 'br', 'span'];
        var safe_attrs = ['href', 'title', 'style', 'target', 'rel'];
    
        // Remove script tags and event handlers
        var elements = temp.getElementsByTagName('*');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            for (var j = element.attributes.length - 1; j >= 0; j--) {
                var attribute = element.attributes[j];
                if (safe_attrs.indexOf(attribute.name.toLowerCase()) === -1 || attribute.name.startsWith('on')) {
                    element.removeAttribute(attribute.name);
                }
            }
            if (safe_tags.indexOf(element.tagName.toLowerCase()) === -1) {
                element.parentNode.replaceChild(document.createTextNode(element.outerHTML), element);
            }
        }
        return temp.innerHTML; // return sanitized HTML
    }
    
    let content = '';

    // Generating the content
    todaysHighScoreVulnerabilities.forEach(vulnerability => {
        let referencesLinks = '';
        let description = (vulnerability.cve.descriptions.length > 0) ? vulnerability.cve.descriptions[0].value : "No description available";
        //let source = (vulnerability.cve.metrics.cvssMetricV31.length > 0) ? vulnerability.cve.metrics.cvssMetricV31[0].source : "No source available";
        let baseScore = (vulnerability.cve.metrics.cvssMetricV31.length > 0) ? vulnerability.cve.metrics.cvssMetricV31[0].cvssData.baseScore : "No score available";
        let publishedDate = vulnerability.cve.published.split('T')[0];
        let vendor = vulnerability.vendor || "Vendor information not available";
        
        // Check if the references field exists and has content
        if (vulnerability.cve.references && vulnerability.cve.references.length > 0) {
            vulnerability.cve.references.forEach(reference => {
                if (reference.url) {
                    referencesLinks += `<a href="${reference.url}" target="_blank" rel="noopener noreferrer">${reference.url}</a><br>`;
                }
            });
        }
    
        content += `
        <div class="cve-entry">
            <h2>${vulnerability.cve.id}</h2>
            <p><strong>Base Score:</strong> ${baseScore}</p>
            <p><strong>Vendor:</strong> ${vendor}</p>
            <p><strong>Published Date:</strong> ${publishedDate}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>References:</strong><br>${referencesLinks}</p>
        </div>
        `;
    });
    dashboard.innerHTML = sanitizeHTML(content);
}

/* Automatically scrolling */
function autoScroll() {
    if (dashboard.scrollHeight <= dashboard.clientHeight) {
        // If all content is visible, no need to scroll
        return;
    }

    // Check if we've scrolled to the bottom
    if (dashboard.scrollTop + dashboard.clientHeight >= dashboard.scrollHeight) {
        scrollDirection = -1;
    }
    // Check if we've scrolled back to the top
    else if (dashboard.scrollTop === 0) {
        scrollDirection = 1;
    }

    dashboard.scrollTop += scrollSpeed * scrollDirection;
}

setInterval(autoScroll, 100); // Adjust interval for faster or slower scroll

function refreshPage() {
    window.location.reload();
}

setTimeout(refreshPage, 900000); // 900000 milliseconds = 15 minutes
