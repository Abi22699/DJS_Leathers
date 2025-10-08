document.addEventListener('DOMContentLoaded', () => {

    // --- Header Scroll Effect ---
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Hamburger Menu ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // --- Scroll Fade-in Effect ---
    const fadeInSections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    fadeInSections.forEach(section => {
        observer.observe(section);
    });

    // --- Image Carousel Logic ---
    const carousels = document.querySelectorAll('.carousel');
    const intervalTime = 5000; // 5 seconds for autoplay

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.next');
        const prevButton = carousel.querySelector('.prev');
        const productContainer = carousel.closest('.product-image-container');
        const thumbnails = productContainer.querySelectorAll('.thumbnail');
        
        let currentIndex = 0;
        let slideInterval;

        const moveToSlide = (targetIndex) => {
            if (slides.length === 0) return;
            if (targetIndex >= slides.length) targetIndex = 0;
            if (targetIndex < 0) targetIndex = slides.length - 1;

            track.style.transform = `translateX(-${targetIndex * 100}%)`;
            currentIndex = targetIndex;

            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            const activeThumbnail = Array.from(thumbnails).find(thumb => parseInt(thumb.dataset.slideIndex) === currentIndex);
            if (activeThumbnail) {
                activeThumbnail.classList.add('active');
            }
            // premium entrance animation: add visible class to current slide img
            slides.forEach((s, i) => {
                const img = s.querySelector('img');
                if (!img) return;
                if (i === currentIndex) img.classList.add('visible'); else img.classList.remove('visible');
            });
        };
        
        const startSlideShow = () => {
            stopSlideShow();
            slideInterval = setInterval(() => {
                moveToSlide(currentIndex + 1);
            }, intervalTime);
        };

        const stopSlideShow = () => {
            clearInterval(slideInterval);
        };

        if (nextButton && prevButton) {
            nextButton.addEventListener('click', () => moveToSlide(currentIndex + 1));
            prevButton.addEventListener('click', () => moveToSlide(currentIndex - 1));
        }

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const targetIndex = parseInt(thumb.dataset.slideIndex);
                moveToSlide(targetIndex);
            });
        });

        carousel.addEventListener('mouseenter', stopSlideShow);
        carousel.addEventListener('mouseleave', startSlideShow);

        if (thumbnails.length > 0) {
            thumbnails[0].classList.add('active');
        }
        startSlideShow();
    });

    // -----------------------------------------------------------------
    // --- UPDATED SECTION: Image Popup/Modal for Product Gallery ---
    // -----------------------------------------------------------------
    // This new code block adds the popup functionality for your product images.
    
    // First, we select all the necessary elements from your HTML.
    const modal = document.getElementById("myModal"); // The modal background/container.
    const modalImg = document.getElementById("modalImg"); // The <img> tag inside the modal.
    const productImages = document.querySelectorAll(".product-card-image"); // All clickable product images.
    const closeBtn = document.querySelectorAll(".modal .close"); // The 'x' close button(s).

    // Modal accessibility helpers
    let lastFocusedElement = null;

    const openModal = (img) => {
        if (!modal || !modalImg) return;
        lastFocusedElement = document.activeElement;
        modal.style.display = "block";
        modal.setAttribute('aria-hidden', 'false');
        modalImg.src = img.src;
        // Move focus into modal for keyboard users
        const firstClose = modal.querySelector('.close');
        if (firstClose) firstClose.focus();
        // prevent body scroll while modal open
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        if (!modal) return;
        modal.style.display = "none";
        modal.setAttribute('aria-hidden', 'true');
        // restore focus
        if (lastFocusedElement) lastFocusedElement.focus();
        document.body.style.overflow = '';
    };

    if (modal && modalImg && productImages.length > 0) {

        productImages.forEach(img => {
            img.addEventListener('click', () => openModal(img));
        });

        // Close buttons (there may be more than one page)
        closeBtn.forEach(btn => {
            btn.addEventListener('click', () => closeModal());
        });

        // Click outside to close
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });

        // Keyboard: Escape to close
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
    }

    // -----------------------------------------------------------------
    // --- AJAX submit for inquiry form (Formspree) ---------------------
    // -----------------------------------------------------------------
    const inquiryForm = document.getElementById('inquiry-form');
    const createToast = (msg, isError = false) => {
        let toast = document.createElement('div');
        toast.className = 'inquiry-toast';
        if (isError) toast.classList.add('error');
        toast.setAttribute('role', 'status');
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 50);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(inquiryForm);
            // Basic validation: browser already enforces required, but double-check
            if (!formData.get('name') || !formData.get('email') || !formData.get('message')) {
                createToast('Please complete all required fields.', true);
                return;
            }

            fetch(inquiryForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    createToast('Enquiry submitted — we will be in touch shortly.');
                    inquiryForm.reset();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Submission failed');
                    });
                }
            }).catch(err => {
                console.error('Form submission error', err);
                createToast('Unable to submit enquiry. Please try again later.', true);
            });
        });
    }

    // --- WhatsApp-send button (compose message from form fields) ---
    const waButton = document.getElementById('whatsapp-send');
    if (waButton && inquiryForm) {
        waButton.addEventListener('click', () => {
            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const message = document.getElementById('message')?.value || '';

            if (!name || !email || !message) {
                createToast('Please complete all required fields before sending via WhatsApp.', true);
                return;
            }

            // Build a friendly message
            const lines = [
                `Name: ${name}`,
                `Email: ${email}`,
                `Message: ${message}`
            ];
            const text = encodeURIComponent(lines.join('\n'));
            const waLink = `https://wa.me/919382334159?text=${text}`;
            window.open(waLink, '_blank', 'noopener');
        });
    }
});