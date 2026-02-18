console.log("Website loaded successfully.");

// Greeting Function based on time of day
function greetUser() {
    let now = new Date();
    let hour = now.getHours();
    let greeting;

    if (hour >= 5 && hour < 12) {
        greeting = "Good Morning!";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon!";
    } else if (hour >= 17 && hour < 21) {
        greeting = "Good Evening!";
    } else {
        greeting = "Good Night!";
    }

    console.log(greeting);
}

// Live Digital Clock Function
function updateClock() {
    const clockElement = document.getElementById('digitalClock');
    const dateElement = document.getElementById('digitalDate');
    
    if (clockElement) {
        let now = new Date();
        
        // Format time
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        
        // Add leading zeros
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        
        // Display time
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        
        // Format and display date
        if (dateElement) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }
}

// ===== FORM VALIDATION & SPAM FILTERING =====

// Global variables for spam filtering
let submitTimes = []; // Rate limiting: stores timestamps of recent submissions
let formLoadTime = null; // Time-based filtering: records when form loads

// Spam keyword list
const spamWords = ["free money", "buy now", "click here", "subscribe", "promo", 
                   "lottery", "winner", "congratulations", "claim now", "limited time"];

// Rate Limiting: Max 3 submissions per minute
function isRateLimited() {
    const now = Date.now();
    // Keep only submissions from the last 60 seconds
    submitTimes = submitTimes.filter(time => now - time < 60000);
    
    // If already 3 submissions, block
    if (submitTimes.length >= 3) {
        return true;
    }
    
    // Otherwise, record this submission
    submitTimes.push(now);
    return false;
}

// Time-based Filtering: Detect submissions faster than 2 seconds
function isTooFast() {
    if (!formLoadTime) return false;
    const submitTime = Date.now();
    const secondsTaken = (submitTime - formLoadTime) / 1000;
    return secondsTaken < 2;
}

// Spam Keyword Detection
function containsSpam(message) {
    const lowerMessage = message.toLowerCase();
    return spamWords.some(word => lowerMessage.includes(word));
}

// Show error message for specific field
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + '-error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    if (inputElement) {
        inputElement.classList.add('input-error');
    }
}

// Clear error message for specific field
function clearError(fieldId) {
    const errorElement = document.getElementById(fieldId + '-error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    if (inputElement) {
        inputElement.classList.remove('input-error');
    }
}

// Real-time validation for inputs
function setupRealTimeValidation() {
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const messageField = document.getElementById('message');
    
    // Name validation
    if (nameField) {
        nameField.addEventListener('input', function() {
            clearError('name');
            if (this.value.length > 0 && this.value.length < 2) {
                showError('name', 'Name must be at least 2 characters');
            } else if (this.value.length > 100) {
                showError('name', 'Name must not exceed 100 characters');
            }
        });
    }
    
    // Email validation
    if (emailField) {
        emailField.addEventListener('input', function() {
            clearError('email');
            if (this.value.length > 0 && !this.value.includes('@')) {
                showError('email', 'Invalid email address');
            } else if (this.value.length > 0) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.value)) {
                    showError('email', 'Please enter a valid email address');
                }
            }
        });
    }
    
    // Message validation
    if (messageField) {
        messageField.addEventListener('input', function() {
            clearError('message');
            const length = this.value.length;
            if (length > 0 && length < 10) {
                showError('message', `Message must be at least 10 characters (${length}/10)`);
            } else if (length > 1000) {
                showError('message', 'Message must not exceed 1000 characters');
            }
        });
    }
}

// Form Handling
function setupFormHandler() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        // Record form load time for time-based filtering
        formLoadTime = Date.now();
        
        // Setup real-time validation
        setupRealTimeValidation();
        
        contactForm.addEventListener('submit', function(e) {
            // Clear all previous errors
            clearError('name');
            clearError('email');
            clearError('message');
            
            // Retrieve form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            const honeypot = document.querySelector('input[name="_honey"]').value;
            
            // SPAM FILTERING CHECK 1: Honeypot
            if (honeypot) {
                console.warn('Spam detected! Honeypot field filled.');
                e.preventDefault();
                alert('Spam detected. Form submission blocked.');
                return false;
            }
            
            // SPAM FILTERING CHECK 2: Rate Limiting
            if (isRateLimited()) {
                console.warn('Rate limit exceeded.');
                e.preventDefault();
                alert('Too many submissions. Please wait a minute before trying again.');
                return false;
            }
            
            // SPAM FILTERING CHECK 3: Time-based Filtering
            if (isTooFast()) {
                console.warn('Submission too fast - potential bot detected.');
                e.preventDefault();
                alert('Submission was too fast. Please take your time to fill out the form.');
                return false;
            }
            
            // SPAM FILTERING CHECK 4: Spam Keyword Detection
            if (containsSpam(message)) {
                console.warn('Spam keywords detected in message.');
                showError('message', 'Your message contains blocked spam keywords.');
                e.preventDefault();
                alert('Your message contains blocked spam keywords. Please revise your message.');
                return false;
            }
            
            // COMPREHENSIVE VALIDATION: Email format check
            if (!email.includes('@')) {
                showError('email', 'Enter a valid email');
                e.preventDefault();
                alert('Enter a valid email address.');
                return false;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('email', 'Please enter a valid email address');
                e.preventDefault();
                alert('Please enter a valid email address.');
                return false;
            }
            
            // COMPREHENSIVE VALIDATION: Name length check
            if (name.length < 2) {
                showError('name', 'Name must be at least 2 characters');
                e.preventDefault();
                alert('Name must be at least 2 characters.');
                return false;
            }
            
            if (name.length > 100) {
                showError('name', 'Name must not exceed 100 characters');
                e.preventDefault();
                alert('Name is too long. Maximum 100 characters allowed.');
                return false;
            }
            
            // COMPREHENSIVE VALIDATION: Message length check
            if (message.length < 10) {
                showError('message', 'Message must be at least 10 characters');
                e.preventDefault();
                alert('Message must be at least 10 characters.');
                return false;
            }
            
            if (message.length > 1000) {
                showError('message', 'Message must not exceed 1000 characters');
                e.preventDefault();
                alert('Message is too long. Maximum 1000 characters allowed.');
                return false;
            }
            
            // Print values to console (for debugging/lab requirements)
            console.log('=== Form Submission ===');
            console.log('Name:', name);
            console.log('Email:', email);
            console.log('Message:', message);
            console.log('Submitted at:', new Date().toLocaleString());
            console.log('Form passed all validation checks');
            console.log('Form will be submitted to FormSubmit service');
            console.log('======================');
            
            // USER FEEDBACK: Success message
            console.log('✓ All validations passed. Submitting form...');
            
            // Allow form to submit naturally to FormSubmit
            // Form will submit to the action URL specified in the HTML
        });
    }
}


// ===== HIDDEN ANIMATION FEATURE: BOUNCING BALL =====
let animationActive = false;
let animationInterval = null;

function setupBouncingBall() {
    const logoTrigger = document.getElementById('logoTrigger');
    const animationContainer = document.getElementById('animationContainer');
    const ball = document.getElementById('bouncingBall');
    const closeBtn = document.getElementById('closeAnimation');
    
    if (!logoTrigger || !animationContainer || !ball) return;
    
    // Ball physics variables
    let x = 100;
    let y = 100;
    let velocityX = 5;
    let velocityY = 3;
    const gravity = 0.5;
    const bounce = 0.8;
    const ballSize = 50;
    
    // Logo click event to start animation
    logoTrigger.addEventListener('click', function() {
        if (!animationActive) {
            animationActive = true;
            animationContainer.style.display = 'block';
            
            console.log('Easter egg discovered!');
            
            // Reset ball position
            x = Math.random() * (window.innerWidth - ballSize);
            y = 100;
            velocityX = (Math.random() - 0.5) * 10;
            velocityY = 0;
            
            // Start bouncing animation
            startBouncing();
        }
    });
    
    // Close button event
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            stopAnimation();
        });
    }
    
    function startBouncing() {
        animationInterval = setInterval(() => {
            // Apply gravity
            velocityY += gravity;
            
            // Update position
            x += velocityX;
            y += velocityY;
            
            // Get ball position using getBoundingClientRect()
            let ballPosition = ball.getBoundingClientRect();
            
            // Log position every 30 frames (reduce console spam)
            if (Math.random() < 0.03) {
                console.log(`Ball Position - Left: ${ballPosition.left.toFixed(2)}px, Top: ${ballPosition.top.toFixed(2)}px, Right: ${ballPosition.right.toFixed(2)}px, Bottom: ${ballPosition.bottom.toFixed(2)}px`);
            }
            
            // Boundary collision detection
            const maxX = window.innerWidth - ballSize;
            const maxY = window.innerHeight - ballSize;
            
            // Bounce off walls (left and right)
            if (x <= 0) {
                x = 0;
                velocityX = Math.abs(velocityX) * bounce;
                console.log('🔵 Ball bounced off LEFT wall!');
            } else if (x >= maxX) {
                x = maxX;
                velocityX = -Math.abs(velocityX) * bounce;
                console.log('🔵 Ball bounced off RIGHT wall!');
            }
            
            // Bounce off floor and ceiling
            if (y <= 0) {
                y = 0;
                velocityY = Math.abs(velocityY) * bounce;
                console.log('🔵 Ball bounced off CEILING!');
            } else if (y >= maxY) {
                y = maxY;
                velocityY = -Math.abs(velocityY) * bounce;
                console.log('🔵 Ball bounced off FLOOR!');
                
                // Add friction when bouncing on floor
                velocityX *= 0.95;
            }
            
            // Apply the position to the ball
            ball.style.left = x + 'px';
            ball.style.top = y + 'px';
            
            // Add rotation effect
            ball.style.transform = `rotate(${x + y}deg)`;
            
        }, 20); // Update every 20ms for smooth animation
    }
    
    function stopAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        animationActive = false;
        animationContainer.style.display = 'none';
        console.log('Animation stopped.');
    }
}


// ===== LOAD CONTACT POPUP PARTIAL =====
function loadContactPopup() {
    fetch('partials/contact-popup.html')
        .then(response => response.text())
        .then(html => {
            // Create a container div and insert the contact popup HTML
            const container = document.createElement('div');
            container.innerHTML = html;
            document.body.appendChild(container);
            
            // Setup form handler after popup is loaded
            setupFormHandler();
        })
        .catch(error => {
            console.error('Error loading contact popup:', error);
        });
}


// Initialize on page load
window.addEventListener('load', function() {
    // Load contact popup (common to all pages)
    loadContactPopup();
    
    // Show greeting dialog
    greetUser();
    
    // Start clock
    updateClock();
    setInterval(updateClock, 1000); // Update every second
    
    // Setup hidden bouncing ball animation
    setupBouncingBall();
});