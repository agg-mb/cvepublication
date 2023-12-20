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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    const todaysHighScoreVulnerabilities = vulnerabilitiesArray.filter(vulnerability => {
        const publishedDate = new Date(vulnerability.cve.published);
        const baseScore = parseFloat(vulnerability.cve.metrics.cvssMetricV31.cvssData.baseScore);
        return publishedDate >= today && baseScore >= 8.0;
    });
    
    // Sorting the recent vulnerabilities by published from newest to oldest
    recentVulnerabilities.sort((a, b) => {
        const dateA = new Date(a.published);
        const dateB = new Date(b.published);
        return dateB - dateA; // For descending order
    });

    const dashboard = document.getElementById('dashboard');
    let content = '<h1>Security Vulnerabilities (Score > 8.0) published on ${currentDate}</h1>';

    // Generating the content
    recentVulnerabilities.forEach(vulnerability => {
        let referencesLinks = '';
        
        // Check if the references field exists and has content
        if (vulnerability.cve.references) {
            // Use regex to extract all URLs
            const urls = vulnerability.cve.references.match(/https?:\/\/[^\s,]+/g);
            
            if (urls) {
                urls.forEach(url => {
                    referencesLinks += `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a><br>`;
                });
            }
        }
    
        content += `
            <div class="cve-entry">
                <h2>${vulnerability.cve.id}</h2>
                <p><strong>Source:</strong>${vulnerability.cve.metrics.cvssMetricV31.source}</p>
                <p><strong>Published Date:</strong> ${vulnerability.cve.published}</p>
                <p><strong>Description:</strong> ${vulnerability.cve.descriptions.value}</p>
                <p><strong>References:</strong><br>${referencesLinks}</p>
            </div>
        `;
    });
    dashboard.innerHTML = content;
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
