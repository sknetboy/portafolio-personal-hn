// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const skillBars = document.querySelectorAll('.skill-progress');
const contactForm = document.getElementById('contactForm');

// Initialize API client
const api = new ApiClient();

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Animate skill bars when they come into view
const animateSkillBars = () => {
    skillBars.forEach(bar => {
        const rect = bar.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && !bar.classList.contains('animated')) {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
            bar.classList.add('animated');
        }
    });
};

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll');
            
            // Animate skill bars if this is the skills section
            if (entry.target.classList.contains('skills')) {
                setTimeout(animateSkillBars, 300);
            }
        }
    });
}, observerOptions);

// Observe sections for animations
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    observer.observe(section);
});

// Animate elements on scroll
window.addEventListener('scroll', () => {
    animateSkillBars();
});

// Contact form handling
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            showNotification('Por favor, completa todos los campos.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Por favor, ingresa un email válido.', 'error');
            return;
        }
        
        try {
            // Submit to backend API
            const contactData = { name, email, subject, message };
            await api.createContact(contactData);
            showNotification('¡Mensaje enviado correctamente! Te contactaré pronto.', 'success');
            contactForm.reset();
        } catch (error) {
            console.error('Error sending contact:', error);
            showNotification('Error al enviar el mensaje. Por favor, inténtalo de nuevo.', 'error');
        }
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close functionality
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 50);
        }, 1000);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add hover effects to project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    });
});

// Add click effect to buttons
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add active link styles
const navStyle = document.createElement('style');
navStyle.textContent = `
    .nav-link.active {
        color: #2563eb !important;
    }
    
    .nav-link.active::after {
        width: 100% !important;
    }
`;
document.head.appendChild(navStyle);

// Lazy loading for images (if any are added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Video Upload Functionality
const uploadArea = document.getElementById('uploadArea');
const videoUpload = document.getElementById('videoUpload');
const uploadBtn = document.getElementById('uploadBtn');
const videoTitle = document.getElementById('videoTitle');
const projectName = document.getElementById('projectName');
const repositoryUrl = document.getElementById('repositoryUrl');
const projectDescription = document.getElementById('projectDescription');
const techTags = document.getElementById('techTags');

let selectedVideo = null;

// Upload area click handler
if (uploadArea) {
    uploadArea.addEventListener('click', () => {
        videoUpload.click();
    });
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('video/')) {
            handleVideoSelection(files[0]);
        } else {
            showNotification('Por favor, selecciona un archivo de video válido.', 'error');
        }
    });
}

// Video file input handler
if (videoUpload) {
    videoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            handleVideoSelection(file);
        } else {
            showNotification('Por favor, selecciona un archivo de video válido.', 'error');
        }
    });
}

// Handle video selection
function handleVideoSelection(file) {
    selectedVideo = file;
    
    // Create video preview
    const videoPreview = document.createElement('div');
    videoPreview.className = 'video-preview';
    
    const video = document.createElement('video');
    video.controls = true;
    video.src = URL.createObjectURL(file);
    
    const videoInfo = document.createElement('div');
    videoInfo.className = 'video-preview-info';
    videoInfo.innerHTML = `
        <strong>Archivo seleccionado:</strong> ${file.name}<br>
        <strong>Tamaño:</strong> ${(file.size / (1024 * 1024)).toFixed(2)} MB<br>
        <strong>Tipo:</strong> ${file.type}
    `;
    
    videoPreview.appendChild(video);
    videoPreview.appendChild(videoInfo);
    
    // Replace upload content with preview
    const uploadContent = uploadArea.querySelector('.upload-content');
    uploadContent.style.display = 'none';
    
    // Remove existing preview if any
    const existingPreview = uploadArea.querySelector('.video-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    uploadArea.appendChild(videoPreview);
    
    // Enable form validation
    validateUploadForm();
}

// Form validation
function validateUploadForm() {
    const isValid = selectedVideo && 
                   videoTitle.value.trim() && 
                   projectName.value.trim() && 
                   projectDescription.value.trim();
    
    uploadBtn.disabled = !isValid;
}

// Add event listeners for form validation
if (videoTitle) videoTitle.addEventListener('input', validateUploadForm);
if (projectName) projectName.addEventListener('input', validateUploadForm);
if (projectDescription) projectDescription.addEventListener('input', validateUploadForm);
if (repositoryUrl) repositoryUrl.addEventListener('input', validateUploadForm);
if (techTags) techTags.addEventListener('input', validateUploadForm);

// Upload button handler
if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
        if (!selectedVideo) {
            showNotification('Por favor, selecciona un video primero.', 'error');
            return;
        }
        
        // Simulate upload process
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        
        // Simulate upload delay
        setTimeout(() => {
            addNewProject();
            resetUploadForm();
            showNotification('¡Proyecto agregado exitosamente!', 'success');
        }, 2000);
    });
}

// Add new project to the grid
function addNewProject() {
    const projectsGrid = document.querySelector('.projects-grid');
    const techTagsArray = techTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    
    // Generate a random icon class
    const icons = ['fas fa-code', 'fas fa-database', 'fas fa-cogs', 'fas fa-chart-line', 'fas fa-mobile-alt', 'fas fa-globe'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    
    projectCard.innerHTML = `
        <div class="project-icon">
            <i class="${randomIcon}"></i>
        </div>
        <div class="project-video">
            <video controls>
                <source src="${URL.createObjectURL(selectedVideo)}" type="${selectedVideo.type}">
                Tu navegador no soporta el elemento de video.
            </video>
            <div class="video-info">
                <span class="video-name">${videoTitle.value}</span>
            </div>
        </div>
        <h4>${projectName.value}</h4>
        <p>${projectDescription.value}</p>
        <div class="project-tech">
            ${techTagsArray.map(tag => `<span>${tag}</span>`).join('')}
        </div>
        ${repositoryUrl.value ? `
        <div class="project-links">
            <a href="${repositoryUrl.value}" target="_blank" class="project-link">
                <i class="fab fa-github"></i> Repositorio
            </a>
        </div>
        ` : ''}
    `;
    
    // Add animation
    projectCard.style.opacity = '0';
    projectCard.style.transform = 'translateY(20px)';
    
    projectsGrid.appendChild(projectCard);
    
    // Animate in
    setTimeout(() => {
        projectCard.style.transition = 'all 0.5s ease';
        projectCard.style.opacity = '1';
        projectCard.style.transform = 'translateY(0)';
    }, 100);
    
    // Add hover effects to the new card
    projectCard.addEventListener('mouseenter', () => {
        projectCard.style.transform = 'translateY(-10px) scale(1.02)';
        projectCard.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    });
    
    projectCard.addEventListener('mouseleave', () => {
        projectCard.style.transform = 'translateY(0) scale(1)';
        projectCard.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    });
}

// Reset upload form
function resetUploadForm() {
    selectedVideo = null;
    videoUpload.value = '';
    videoTitle.value = '';
    projectName.value = '';
    repositoryUrl.value = '';
    projectDescription.value = '';
    techTags.value = '';
    
    // Reset upload area
    const uploadContent = uploadArea.querySelector('.upload-content');
    const videoPreview = uploadArea.querySelector('.video-preview');
    
    if (uploadContent) uploadContent.style.display = 'block';
    if (videoPreview) videoPreview.remove();
    
    // Reset button
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar Proyecto';
}

// Create videos directory notification
function createVideosDirectory() {
    // This would typically be handled by the backend
    // For demo purposes, we'll just show a notification
    console.log('Videos directory would be created on the server');
}

// Enhanced project card interactions
function enhanceProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const video = card.querySelector('video');
        
        if (video) {
            // Pause video when card is not hovered
            card.addEventListener('mouseleave', () => {
                video.pause();
            });
            
            // Add click to play/pause functionality
            video.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }
    });
}

// Load featured projects from API
async function loadFeaturedProjects() {
    try {
        const projects = await api.getFeaturedProjects();
        const projectsContainer = document.querySelector('.projects-grid');
        
        if (projectsContainer && projects.length > 0) {
            // Clear existing projects (keep the upload section)
            const uploadSection = projectsContainer.querySelector('.project-upload');
            projectsContainer.innerHTML = '';
            
            // Add projects from API
            projects.forEach(project => {
                const projectCard = createProjectCard(project);
                projectsContainer.appendChild(projectCard);
            });
            
            // Re-add upload section if it exists
            if (uploadSection) {
                projectsContainer.appendChild(uploadSection);
            }
        }
    } catch (error) {
        console.error('Error loading featured projects:', error);
    }
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const technologies = Array.isArray(project.technologies) 
        ? project.technologies 
        : (project.technologies ? project.technologies.split(',').map(t => t.trim()) : []);
    
    card.innerHTML = `
        <div class="project-content">
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tech">
                    ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${project.github_url}" target="_blank" class="btn btn-outline">
                        <i class="fab fa-github"></i> Ver Código
                    </a>
                    ${project.live_url ? `<a href="${project.live_url}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Ver Demo
                    </a>` : ''}
                </div>
            </div>
            <div class="project-video">
                <iframe width="300" height="200" src="${project.video_url}" 
                        title="${project.title}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
                <div class="video-info">
                    <span class="video-name">${project.title}</span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Initialize enhanced project cards on page load
window.addEventListener('load', () => {
    enhanceProjectCards();
    loadFeaturedProjects();
});

// Console message for developers
console.log(`
%c👋 ¡Hola! Soy Jose Luis Castro
%c🚀 Desarrollador Backend Java & Científico de Datos
%c💾 Especialista en Oracle SQL, MySQL y PostgreSQL
%c📧 ¿Interesado en trabajar juntos? ¡Contáctame!
`,
'color: #2563eb; font-size: 16px; font-weight: bold;',
'color: #6b7280; font-size: 14px;',
'color: #059669; font-size: 14px; font-weight: bold;',
'color: #10b981; font-size: 14px; font-weight: bold;'
);