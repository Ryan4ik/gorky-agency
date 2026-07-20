// JavaScript for GORKY SMM Agency website

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initCanvasBackground();
    initCard3DTilt();
    initNicheModal();
    initNewsModal();
    initStatsCounter();
    initContactForm();
    initScrollSequence();
    initStormTabs();
});

/* ==========================================
   HEADER SCROLL EFFECT
   ========================================== */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ==========================================
   MOBILE MENU DRAWER
   ========================================== */
function initMobileMenu() {
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    function toggleMenu() {
        burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
    
    burger.addEventListener('click', toggleMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

/* ==========================================
   INTERACTIVE CANVAS PARTICLES
   ========================================== */
function initCanvasBackground() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = Math.min(60, Math.floor((width * height) / 25000)); // Dynamic particle density
    const connectionDistance = 140;
    
    const mouse = {
        x: null,
        y: null,
        radius: 180
    };
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 3 + 2; // Slightly larger particles (2px to 5px)
            
            // Randomly select one of our theme neon colors
            const colors = ['#3120d8', '#ffffff', '#6e5eff'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Boundary checks
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;
            
            // Mouse interaction (gravity orbit & distance keeper)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const ux = dx / (dist || 1);
                    const uy = dy / (dist || 1);
                    
                    // Orbit force (sideways perpendicular speed)
                    const orbitSpeed = 1.8;
                    this.x += -uy * force * orbitSpeed;
                    this.y += ux * force * orbitSpeed;
                    
                    // Distance keeping: pull in if far, push out if too close (target distance: 60px)
                    const targetDist = 60;
                    if (dist > targetDist) {
                        const pullForce = (dist - targetDist) / (mouse.radius - targetDist);
                        this.x -= ux * pullForce * 1.5;
                        this.y -= uy * pullForce * 1.5;
                    } else {
                        const pushForce = (targetDist - dist) / targetDist;
                        this.x += ux * pushForce * 2.0;
                        this.y += uy * pushForce * 2.0;
                    }
                }
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.5;
            ctx.fill();
        }
    }
    
    // Create particle array
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function resolveCollisions() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = p1.radius + p2.radius + 4; // safety gap
                
                if (dist < minDist) {
                    const overlap = minDist - dist;
                    const ux = dx / (dist || 1);
                    const uy = dy / (dist || 1);
                    
                    // Push apart
                    p1.x -= ux * overlap * 0.5;
                    p1.y -= uy * overlap * 0.5;
                    p2.x += ux * overlap * 0.5;
                    p2.y += uy * overlap * 0.5;
                    
                    // Bounce velocities
                    const tempVx = p1.vx;
                    const tempVy = p1.vy;
                    p1.vx = p1.vx * -0.5 + p2.vx * 0.5;
                    p1.vy = p1.vy * -0.5 + p2.vy * 0.5;
                    p2.vx = p2.vx * -0.5 + tempVx * 0.5;
                    p2.vy = p2.vy * -0.5 + tempVy * 0.5;
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid lines background decoration
        drawTechGrid();
        
        // Resolve particle overlaps
        resolveCollisions();
        
        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        // Connect particles
        drawConnections();
        
        requestAnimationFrame(animate);
    }
    
    function drawTechGrid() {
        if (mouse.x === null || mouse.y === null) return; // Invisible by default
        
        const radius = 250; // Radius of illumination
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
        grad.addColorStop(0, '#3120d8');
        grad.addColorStop(0.3, 'rgba(49, 32, 216, 0.6)');
        grad.addColorStop(1, 'rgba(49, 32, 216, 0)');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        
        const gridSize = 80;
        
        // Optimisation: only draw lines near the mouse coordinate boundary box
        const startX = Math.max(0, Math.floor((mouse.x - radius) / gridSize) * gridSize);
        const endX = Math.min(width, Math.ceil((mouse.x + radius) / gridSize) * gridSize);
        const startY = Math.max(0, Math.floor((mouse.y - radius) / gridSize) * gridSize);
        const endY = Math.min(height, Math.ceil((mouse.y + radius) / gridSize) * gridSize);
        
        for (let x = startX; x <= endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }
        for (let y = startY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
    }
    
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < connectionDistance) {
                    const alpha = (1 - (dist / connectionDistance)) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = '#3120d8';
                    ctx.globalAlpha = alpha;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
            
            // Connect to mouse
            if (mouse.x !== null && mouse.y !== null) {
                const p = particles[i];
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < mouse.radius - 40) {
                    const alpha = (1 - (dist / (mouse.radius - 40))) * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = '#ffffff';
                    ctx.globalAlpha = alpha;
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1.0;
    }
    
    animate();
}

/* ==========================================
   3D CARD TILT EFFECT
   ========================================== */
function initCard3DTilt() {
    // Only apply tilt on larger desktop screens
    if (window.innerWidth < 1024) return;
    
    const cards = document.querySelectorAll('[data-tilt]');
    const nicheCards = document.querySelectorAll('.niche-card');
    
    const applyTilt = (cardList) => {
        cardList.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                
                // Calculate position relative to card boundaries
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Convert to percentage values (-0.5 to 0.5)
                const xc = ((x / rect.width) - 0.5);
                const yc = ((y / rect.height) - 0.5);
                
                // Rotation factors (modify for stronger/weaker tilts)
                const rotateX = yc * -12; // tilt angle
                const rotateY = xc * 12;
                
                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                
                // Handle moving border glow for niche cards if present
                const glow = card.querySelector('.card-border-glow');
                if (glow) {
                    const xPercent = (x / rect.width) * 100;
                    const yPercent = (y / rect.height) * 100;
                    glow.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(49, 32, 216, 0.4) 0%, transparent 60%)`;
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                
                const glow = card.querySelector('.card-border-glow');
                if (glow) {
                    glow.style.background = 'transparent';
                }
            });
        });
    };
    
    applyTilt(cards);
    applyTilt(nicheCards);
}

/* ==========================================
   NICHE DETAILS MODAL INTERACTION
   ========================================== */
function initNicheModal() {
    const cards = document.querySelectorAll('.niche-card');
    const modal = document.getElementById('niche-modal');
    const modalBody = modal.querySelector('.modal-body');
    const modalClose = modal.querySelector('.modal-close');
    const modalOverlay = modal.querySelector('.modal-overlay');
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Get content from the card
            const titleText = card.querySelector('.niche-title').innerText;
            const iconSvg = card.querySelector('.niche-icon').outerHTML;
            const detailedContent = card.querySelector('.card-detail-content').innerHTML;
            const shortDesc = card.querySelector('.niche-short').innerText;
            
            // Build modal structure
            modalBody.innerHTML = `
                <h3>${iconSvg} ${titleText}</h3>
                <p>${shortDesc}</p>
                ${detailedContent}
            `;
            
            // Open modal
            modal.classList.add('active');
            document.body.classList.add('no-scroll');
        });
    });
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
    
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================
   BLOG & NEWS DETAILS MODAL INTERACTION
   ========================================== */
function initNewsModal() {
    const cards = document.querySelectorAll('.news-card');
    const modal = document.getElementById('niche-modal');
    const modalBody = modal.querySelector('.modal-body');
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Get image src and alt from the clicked card
            const imageSrc = card.querySelector('.news-image').src;
            const imageAlt = card.querySelector('.news-image').alt;
            
            // Get content from the card
            const detailedContent = card.querySelector('.article-full-content').innerHTML;
            
            // Build modal structure with full-width image on top
            modalBody.innerHTML = `
                <div class="modal-article-image-wrapper">
                    <img src="${imageSrc}" class="modal-article-image" alt="${imageAlt}">
                    <div class="modal-article-image-overlay"></div>
                </div>
                <div class="modal-article-body-content">
                    ${detailedContent}
                </div>
            `;
            
            // Open modal
            modal.classList.add('active');
            document.body.classList.add('no-scroll');
        });
    });
}

/* ==========================================
   SCROLL-TRIGGER STATS COUNTER
   ========================================== */
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-num');
    
    const countUp = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const duration = 2000; // Animation duration in ms
        const startTime = performance.now();
        
        const updateCount = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // EaseOutQuad function for smoother deceleration
            const easeProgress = progress * (2 - progress);
            const currentVal = Math.floor(easeProgress * target);
            
            // Format number with spaces (e.g. 50 000 instead of 50000)
            element.innerText = currentVal.toLocaleString('ru-RU');
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.innerText = target.toLocaleString('ru-RU');
            }
        };
        
        requestAnimationFrame(updateCount);
    };
    
    // Setup intersection observer
    const observerOptions = {
        threshold: 0.5, // trigger when 50% of the element is visible
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target); // make sure it runs only once
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => {
        observer.observe(stat);
    });
}

/* ==========================================
   CONTACT FORM / TERMINAL SUBMISSION
   ========================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('success-message');
    const resetBtn = document.querySelector('.btn-reset-form');
    const submitBtn = form.querySelector('.btn-submit');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.setAttribute('disabled', 'true');
        
        // Gather input values
        const name = document.getElementById('form-name').value;
        const project = document.getElementById('form-project').value;
        const link = document.getElementById('form-link').value || 'Не указана';
        const contact = document.getElementById('form-contact').value;
        const message = document.getElementById('form-message').value || 'Без описания';

        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('github.io');

        if (isLocal) {
            // Local testing: send directly to Telegram (requires VPN in RF, but doesn't require PHP backend)
            const tgToken = '8758324822:AAECnS2-pm588P6UhTBVcsIWI-l_wsTvarw';
            const tgChatId = '-1003895176653';
            const text = `<b>🔔 Новая заявка на аудит! (ЛОКАЛЬНО)</b>\n\n<b>👤 Имя:</b> ${name}\n<b>🎮 Проект:</b> ${project}\n<b>🔗 Ссылка:</b> ${link}\n<b>📱 Контакты:</b> ${contact}\n<b>💬 Задача:</b> ${message}`;

            fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: tgChatId,
                    text: text,
                    parse_mode: 'HTML'
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Telegram API error');
                }
                return response.json();
            })
            .then(data => {
                form.style.display = 'none';
                successMsg.classList.add('active');
                console.log("MARKETING TERMINAL: (Local) Payload successfully transmitted via Telegram API.");
            })
            .catch(error => {
                console.error("MARKETING TERMINAL ERROR: Local transmission failed.", error);
                alert("Ошибка локальной отправки! Пожалуйста, убедитесь, что у вас включен VPN (так как провайдеры в РФ блокируют прямой доступ к серверам Telegram API с компьютера).");
            })
            .finally(() => {
                submitBtn.classList.remove('loading');
                submitBtn.removeAttribute('disabled');
            });
        } else {
            // Production: send request to our backend send.php proxy script (works without VPN)
            fetch('send.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    project: project,
                    link: link,
                    contact: contact,
                    message: message
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Server returned error status');
                }
                return response.json();
            })
            .then(data => {
                form.style.display = 'none';
                successMsg.classList.add('active');
                console.log("MARKETING TERMINAL: Payload successfully processed and sent via send.php.");
            })
            .catch(error => {
                console.error("MARKETING TERMINAL ERROR: Transmission failed.", error);
                alert("Ошибка отправки! Пожалуйста, попробуйте еще раз.");
            })
            .finally(() => {
                submitBtn.classList.remove('loading');
                submitBtn.removeAttribute('disabled');
            });
        }
    });
    
    resetBtn.addEventListener('click', () => {
        // Reset form inputs
        form.reset();
        
        // Switch views
        successMsg.classList.remove('active');
        form.style.display = 'flex';
    });
}

/* ==========================================
   SCROLL-DRIVEN JPG SEQUENCE BACKGROUND
   ========================================== */
function initScrollSequence() {
    const canvas = document.getElementById('sequence-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    const frameCount = 81; // Total frames in sequence (109240 to 109320)
    const startFrame = 109240; // Starting frame number in the files
    const images = [];
    let loadedCount = 0;
    let sequenceActive = false;
    
    // Configurable sequence naming and path
    // Naming convention: Gorky_Digital_[0040-0120].exr Render_109240.jpg etc.
    const getFrameUrl = (index) => {
        const fileNum = startFrame + index - 1;
        return `assets/sequence/Gorky_Digital_[0040-0120].exr Render_${fileNum}.jpg`;
    };
    
    // Preload all frames
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
            loadedCount++;
            
            // If the first frame loaded successfully, make sure we show it
            if (i === 1) {
                sequenceActive = true;
                canvas.style.opacity = '1';
                heroSection.classList.remove('fallback-bg');
                requestAnimationFrame(drawCurrentFrame);
            }
            
            // If all frames loaded, print debug log
            if (loadedCount === frameCount) {
                console.log(`SEQUENCE: Preloaded all ${frameCount} frames.`);
            }
        };
        img.onerror = () => {
            // Silence frame errors to degrade gracefully
            // If frame 1 fails, the canvas stays opacity 0, fallback image remains visible
            if (i === 1) {
                console.warn("SEQUENCE: First frame failed to load. Falling back to static image.");
            }
        };
        images.push(img);
    }
    
    // Map scroll position of the hero section to sequence frame index
    function drawCurrentFrame() {
        if (!sequenceActive) return;
        
        // Calculate scroll progress within hero section
        const heroHeight = heroSection.offsetHeight;
        const scrollY = window.scrollY;
        
        // Scroll fraction clamped between 0 and 1
        const scrollFraction = Math.min(1, Math.max(0, scrollY / heroHeight));
        
        // Convert to frame index (0 to frameCount - 1)
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );
        
        const img = images[frameIndex];
        if (img && img.complete && img.naturalWidth !== 0) {
            drawCoverImage(img);
        }
    }
    
    // Draw image onto canvas maintaining aspect ratio (background-size: cover logic)
    function drawCoverImage(img) {
        const canvasWidth = canvas.width = window.innerWidth;
        const canvasHeight = canvas.height = heroSection.offsetHeight;
        
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        
        const imgRatio = imgWidth / imgHeight;
        const canvasRatio = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, x, y;
        
        if (canvasRatio > imgRatio) {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgRatio;
            x = 0;
            y = (canvasHeight - drawHeight) / 2;
        } else {
            drawWidth = canvasHeight * imgRatio;
            drawHeight = canvasHeight;
            x = (canvasWidth - drawWidth) / 2;
            y = 0;
        }
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
    }
    
    // Listen to scroll and resize events
    window.addEventListener('scroll', () => {
        if (sequenceActive) {
            requestAnimationFrame(drawCurrentFrame);
        }
    });
    
    window.addEventListener('resize', () => {
        if (sequenceActive) {
            requestAnimationFrame(drawCurrentFrame);
        }
    });
}

/* ==========================================
   CYBER ARENA STORM CASE TABS
   ========================================== */
function initStormTabs() {
    const tabBtns = document.querySelectorAll('.storm-tab-btn');
    const tabContents = document.querySelectorAll('.storm-tab-content');
    
    if (!tabBtns.length) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-storm-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(`storm-tab-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}



