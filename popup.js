// Popup script for YouTube Prank Extension (Always Active)
document.addEventListener('DOMContentLoaded', function() {
    const statusElement = document.getElementById('status');
    const statusText = document.getElementById('statusText');
    
    // Check if elements exist
    if (!statusElement || !statusText) {
        console.error('Required elements not found:', {
            statusElement: !!statusElement,
            statusText: !!statusText
        });
        return;
    }
    
    // Always show as active since it can't be disabled
    if (statusElement) statusElement.className = 'status active';
    if (statusText) statusText.textContent = 'Prank Always Active �';
    
    // Get current status when popup opens (just for confirmation)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        
        if (tab && tab.url && tab.url.includes('youtube.com')) {
            chrome.tabs.sendMessage(tab.id, {action: 'getStatus'}, function(response) {
                if (chrome.runtime.lastError) {
                    // Content script might not be loaded yet, but still show as active
                    if (statusText) {
                        statusText.textContent = 'Prank Always Active 😈';
                    }
                    return;
                }
                
                // Always show as active regardless of response
                if (statusText) {
                    statusText.textContent = 'Prank Always Active 😈';
                }
            });
        } else {
            if (statusText) {
                statusText.textContent = 'Navigate to YouTube';
            }
        }
    });
});
