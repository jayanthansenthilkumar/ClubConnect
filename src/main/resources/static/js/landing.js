// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.toggle('ri-menu-line');
        icon.classList.toggle('ri-close-line');
    });
}

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            // Close mobile menu if open
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn?.querySelector('i');
            if (icon) {
                icon.classList.add('ri-menu-line');
                icon.classList.remove('ri-close-line');
            }
            
            // Scroll to section
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Update active link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

// Scroll to top button
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for animation
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Load clubs data
async function loadClubs() {
    const clubsGrid = document.getElementById('clubsGrid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/clubs`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch clubs');
        }
        
        const clubs = await response.json();
        
        if (clubs.length === 0) {
            clubsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="ri-inbox-line" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-secondary);">No clubs available yet</h3>
                    <p style="color: var(--text-light);">Check back later for updates!</p>
                </div>
            `;
            return;
        }
        
        // Update hero stats
        document.getElementById('hero-clubs').textContent = clubs.length + '+';
        
        // Count total members across all clubs
        let totalMembers = 0;
        clubs.forEach(club => {
            if (club.memberCount) totalMembers += club.memberCount;
        });
        if (totalMembers > 0) {
            document.getElementById('hero-members').textContent = totalMembers + '+';
        }
        
        clubsGrid.innerHTML = clubs.map(club => `
            <div class="club-card" data-category="${club.category || 'Other'}">
                <div class="club-header">
                    <div class="club-icon">
                        <i class="${getClubIcon(club.category)}"></i>
                    </div>
                    <div class="club-info">
                        <h3>${club.name}</h3>
                        <span class="club-category">${club.category || 'General'}</span>
                    </div>
                </div>
                <p class="club-description">${club.description || 'Join us to explore and grow together!'}</p>
                <div class="club-stats">
                    <div class="club-stat">
                        <i class="ri-team-line"></i>
                        <span>${club.memberCount || 0}</span>
                        <small>Members</small>
                    </div>
                    <div class="club-stat">
                        <i class="ri-calendar-event-line"></i>
                        <span>${club.eventCount || 0}</span>
                        <small>Events</small>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Setup category filter
        setupClubFilter();
        
    } catch (error) {
        console.error('Error loading clubs:', error);
        clubsGrid.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="ri-error-warning-line" style="font-size: 4rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-primary);">Unable to load clubs</h3>
                <p style="color: var(--text-secondary);">Please try again later</p>
            </div>
        `;
    }
}

// Get club icon based on category
function getClubIcon(category) {
    const icons = {
        'Sports': 'ri-basketball-line',
        'Technology': 'ri-code-line',
        'Arts': 'ri-palette-line',
        'Academic': 'ri-book-line',
        'Social': 'ri-team-line',
        'Music': 'ri-music-line',
        'Dance': 'ri-user-star-line',
        'Drama': 'ri-movie-line'
    };
    return icons[category] || 'ri-community-line';
}

// Setup club category filter
function setupClubFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clubCards = document.querySelectorAll('.club-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            
            // Filter clubs
            clubCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Load upcoming events
async function loadUpcomingEvents() {
    const eventsGrid = document.getElementById('upcomingEventsGrid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/clubs`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const clubs = await response.json();
        
        // Get all events from all clubs
        let allEvents = [];
        for (const club of clubs) {
            try {
                const eventsResponse = await fetch(`${API_BASE_URL}/events/club/${club.id}`);
                if (eventsResponse.ok) {
                    const events = await eventsResponse.json();
                    allEvents = allEvents.concat(events.map(e => ({...e, clubName: club.name})));
                }
            } catch (err) {
                console.error(`Error fetching events for club ${club.id}:`, err);
            }
        }
        
        // Filter upcoming events
        const now = new Date();
        const upcomingEvents = allEvents
            .filter(event => {
                const eventDate = new Date(event.eventDate);
                return eventDate > now && event.approvalStatus === 'APPROVED';
            })
            .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
            .slice(0, 6);
        
        if (upcomingEvents.length === 0) {
            eventsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="ri-calendar-line" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-secondary);">No upcoming events</h3>
                    <p style="color: var(--text-light);">Stay tuned for exciting events!</p>
                </div>
            `;
            return;
        }
        
        // Update hero stats
        document.getElementById('hero-events').textContent = upcomingEvents.length + '+';
        
        eventsGrid.innerHTML = upcomingEvents.map(event => `
            <div class="event-card">
                <img src="${getEventImage(event.title)}" alt="${event.title}" class="event-image">
                <div class="event-content">
                    <span class="event-badge">${event.status || 'SCHEDULED'}</span>
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <i class="ri-calendar-line"></i>
                            <span>${formatDate(event.eventDate)}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="ri-map-pin-line"></i>
                            <span>${event.location || 'TBA'}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="ri-team-line"></i>
                            <span>${event.participantsCount || 'Open'} participants</span>
                        </div>
                    </div>
                    <p class="event-description">${truncateText(event.description || 'Join us for an amazing event!', 100)}</p>
                    <div class="event-footer">
                        <span class="event-club">${event.clubName}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading upcoming events:', error);
        eventsGrid.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="ri-error-warning-line" style="font-size: 4rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-primary);">Unable to load events</h3>
                <p style="color: var(--text-secondary);">Please try again later</p>
            </div>
        `;
    }
}

// Load past events
async function loadPastEvents() {
    const eventsGrid = document.getElementById('pastEventsGrid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/clubs`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const clubs = await response.json();
        
        // Get all events from all clubs
        let allEvents = [];
        for (const club of clubs) {
            try {
                const eventsResponse = await fetch(`${API_BASE_URL}/events/club/${club.id}`);
                if (eventsResponse.ok) {
                    const events = await eventsResponse.json();
                    allEvents = allEvents.concat(events.map(e => ({...e, clubName: club.name})));
                }
            } catch (err) {
                console.error(`Error fetching events for club ${club.id}:`, err);
            }
        }
        
        // Filter past events
        const now = new Date();
        const pastEvents = allEvents
            .filter(event => {
                const eventDate = new Date(event.eventDate);
                return eventDate < now && event.status === 'COMPLETED';
            })
            .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
            .slice(0, 6);
        
        if (pastEvents.length === 0) {
            eventsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="ri-calendar-check-line" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-secondary);">No past events</h3>
                    <p style="color: var(--text-light);">Events history will appear here</p>
                </div>
            `;
            return;
        }
        
        eventsGrid.innerHTML = pastEvents.map(event => `
            <div class="event-card">
                <img src="${getEventImage(event.title)}" alt="${event.title}" class="event-image">
                <div class="event-content">
                    <span class="event-badge completed">${event.status}</span>
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <i class="ri-calendar-line"></i>
                            <span>${formatDate(event.eventDate)}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="ri-map-pin-line"></i>
                            <span>${event.location || 'Campus'}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="ri-team-line"></i>
                            <span>${event.participantsCount || '0'} attended</span>
                        </div>
                    </div>
                    <p class="event-description">${truncateText(event.description || 'A successful event!', 100)}</p>
                    <div class="event-footer">
                        <span class="event-club">${event.clubName}</span>
                        <i class="ri-trophy-line" style="color: var(--accent-color); font-size: 1.25rem;"></i>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading past events:', error);
        eventsGrid.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="ri-error-warning-line" style="font-size: 4rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-primary);">Unable to load events</h3>
                <p style="color: var(--text-secondary);">Please try again later</p>
            </div>
        `;
    }
}

// Get event image based on title/category
function getEventImage(title) {
    const keywords = {
        'tech': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
        'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop',
        'music': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=400&fit=crop',
        'art': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop',
        'workshop': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
        'conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
        'competition': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop',
        'seminar': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop',
        'cultural': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop'
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [keyword, image] of Object.entries(keywords)) {
        if (lowerTitle.includes(keyword)) {
            return image;
        }
    }
    
    return 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Contact form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Show success message (you can integrate with backend later)
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// Newsletter form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input').value;
        alert(`Thank you for subscribing with ${email}!`);
        newsletterForm.reset();
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadClubs();
    loadUpcomingEvents();
    loadPastEvents();
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});
