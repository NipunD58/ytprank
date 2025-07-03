// YouTube Ad Prank Extension - Content Script (Always Active)
(function() {
    'use strict';
    
    console.log('YouTube Prank Extension loaded - Always Active Mode');
    
    let observer;
    
    // Function to hide skip button during ads
    function hideSkipButton() {
        const skipButtons = document.querySelectorAll(
            '.ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton'
        );
        
        skipButtons.forEach(button => {
            button.style.display = 'none !important';
            button.style.visibility = 'hidden !important';
            button.style.opacity = '0 !important';
        });
    }
    
    // Function to hide volume controls
    function hideVolumeControls() {
        const volumeControls = document.querySelectorAll(
            '.ytp-volume-area, .ytp-volume-panel, .ytp-mute-button, .ytp-volume-slider'
        );
        
        volumeControls.forEach(control => {
            control.style.display = 'none !important';
            control.style.visibility = 'hidden !important';
            control.style.opacity = '0 !important';
        });
    }
    
    // Function to hide play/pause controls during ads
    function hidePlayPauseControls() {
        if (!isAdPlaying()) return;
        
        const playPauseControls = document.querySelectorAll(
            '.ytp-play-button, .ytp-pause-button, .ytp-large-play-button, .ytp-big-mode .ytp-play-button'
        );
        
        playPauseControls.forEach(control => {
            control.style.display = 'none !important';
            control.style.visibility = 'hidden !important';
            control.style.opacity = '0 !important';
            control.style.pointerEvents = 'none !important';
        });
        
        // Also disable clicking on the video itself during ads
        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoElement.style.pointerEvents = 'none !important';
        }
    }
    
    // Function to disable keyboard and mouse controls during ads
    function disableKeyboardControls(event) {
        // Block common volume control keys
        const blockedKeys = [
            'ArrowUp', 'ArrowDown', // Volume up/down
            'KeyM', // Mute
            'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 
            'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9' // Number keys for volume
        ];
        
        // Block play/pause keys during ads
        if (isAdPlaying()) {
            const adBlockedKeys = [
                'Space', // Spacebar to pause
                'KeyK', // K key to pause
                'ArrowLeft', 'ArrowRight', // Seek controls
                'KeyJ', 'KeyL', // 10 second skip
                'KeyF', // Fullscreen
                'KeyT', // Theater mode
                'KeyI', // Miniplayer
                'KeyC', // Captions
                'Comma', 'Period' // Frame by frame
            ];
            
            if (adBlockedKeys.includes(event.code)) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return false;
            }
        }
        
        if (blockedKeys.includes(event.code)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }
    
    // Function to disable mouse clicks on video during ads
    function disableVideoClicks(event) {
        if (!isAdPlaying()) return;
        
        // Block all mouse interactions on video during ads
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
    }
    
    // Function to check if an ad is currently playing
    function isAdPlaying() {
        const adIndicators = document.querySelectorAll(
            '.ytp-ad-text, .ytp-ad-player-overlay, .ytp-ad-skip-button-container, .ad-showing'
        );
        return adIndicators.length > 0;
    }
    
    // Main function to apply all hiding effects
    function applyPrankEffects() {
        // Always hide volume controls
        hideVolumeControls();
        
        // Hide play/pause controls during ads
        hidePlayPauseControls();
        
        // Hide skip button during ads
        if (isAdPlaying()) {
            hideSkipButton();
        }
        
        // Also hide other potential ad skip elements
        const adSkipElements = document.querySelectorAll(
            '[class*="skip"], [class*="Skip"], [id*="skip"], [id*="Skip"]'
        );
        
        adSkipElements.forEach(element => {
            const parent = element.closest('.ytp-ad-skip-button-container, .ytp-ad-player-overlay');
            if (parent) {
                element.style.display = 'none !important';
                element.style.visibility = 'hidden !important';
                element.style.opacity = '0 !important';
            }
        });
    }
    
    // Function to start the prank (always active)
    function startPrank() {
        console.log('Starting YouTube prank - always active mode');
        
        // Add keyboard event listener to prevent volume controls and play/pause during ads
        document.addEventListener('keydown', disableKeyboardControls, true);
        
        // Add mouse event listeners to prevent clicking on video during ads
        document.addEventListener('click', disableVideoClicks, true);
        document.addEventListener('mousedown', disableVideoClicks, true);
        document.addEventListener('mouseup', disableVideoClicks, true);
        
        // Create mutation observer to watch for DOM changes
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    applyPrankEffects();
                    // Re-apply video click blocking for new video elements
                    const videos = document.querySelectorAll('video');
                    videos.forEach(video => {
                        video.addEventListener('click', disableVideoClicks, true);
                        video.addEventListener('mousedown', disableVideoClicks, true);
                        video.addEventListener('mouseup', disableVideoClicks, true);
                    });
                }
            });
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Apply effects immediately
        applyPrankEffects();
        
        // Apply effects periodically to catch any missed elements
        setInterval(applyPrankEffects, 1000);
    }
    
    // Listen for messages from popup (only for status requests)
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'getStatus') {
            sendResponse({active: true}); // Always active
        }
    });
    
    // Wait for page to load then start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPrank);
    } else {
        startPrank();
    }
    
    // Also start when navigating to new videos (YouTube SPA)
    let currentUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== currentUrl) {
            currentUrl = location.href;
            setTimeout(startPrank, 1000); // Delay to let YouTube load
        }
    }).observe(document, {subtree: true, childList: true});
    
})();
