const API_BASE_URL = 'http://localhost:8080/api';
let memberData = null;
let token = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    token = localStorage.getItem('memberToken');
    
    if (!token) {
        window.location.href = '/member-login.html';
        return;
    }
    
    loadMemberProfile();
    loadActiveCelebrations();
    loadUpcomingEvents();
    
    // Set up password form
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordChange);
});

async function loadMemberProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/member/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load profile');
        }
        
        memberData = await response.json();
        
        // Update navbar
        document.getElementById('memberName').textContent = memberData.name;
        document.getElementById('clubName').textContent = memberData.club.name;
        
        // Update profile tab
        displayProfile();
    } catch (error) {
        console.error('Error loading profile:', error);
        localStorage.removeItem('memberToken');
        window.location.href = '/member-login.html';
    }
}

function displayProfile() {
    const profileInfo = document.getElementById('profileInfo');
    profileInfo.innerHTML = `
        <div class="profile-info">
            <div class="profile-field">
                <label>Name</label>
                <p>${memberData.name}</p>
            </div>
            <div class="profile-field">
                <label>Email</label>
                <p>${memberData.email}</p>
            </div>
            <div class="profile-field">
                <label>Student ID</label>
                <p>${memberData.studentId}</p>
            </div>
            <div class="profile-field">
                <label>Username</label>
                <p>${memberData.username}</p>
            </div>
            <div class="profile-field">
                <label>Phone</label>
                <p>${memberData.phone || 'N/A'}</p>
            </div>
            <div class="profile-field">
                <label>Department</label>
                <p>${memberData.department || 'N/A'}</p>
            </div>
            <div class="profile-field">
                <label>Club</label>
                <p>${memberData.club.name}</p>
            </div>
            <div class="profile-field">
                <label>Academic Year</label>
                <p>${memberData.academicYear}</p>
            </div>
            <div class="profile-field">
                <label>Role in Club</label>
                <p>${memberData.role || 'Member'}</p>
            </div>
            <div class="profile-field">
                <label>Membership Status</label>
                <p>${memberData.membershipStatus}</p>
            </div>
        </div>
    `;
}

async function loadActiveCelebrations() {
    try {
        const response = await fetch(`${API_BASE_URL}/member/winners/active`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const celebrations = await response.json();
            showFlowerShower(celebrations);
        }
    } catch (error) {
        console.error('Error loading celebrations:', error);
    }
}

function showFlowerShower(celebrations) {
    if (celebrations.length === 0) return;
    
    const container = document.getElementById('celebrationContainer');
    const flowers = ['🌸', '🌺', '🌼', '🌻', '🌷', '🏵️', '💐', '⭐', '✨', '🎉'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const flower = document.createElement('div');
            flower.className = 'flower-shower';
            flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
            flower.style.left = Math.random() * 100 + '%';
            flower.style.animationDelay = Math.random() * 2 + 's';
            flower.style.animationDuration = (Math.random() * 2 + 3) + 's';
            container.appendChild(flower);
            
            setTimeout(() => flower.remove(), 5000);
        }, i * 200);
    }
}

async function loadUpcomingEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/member/events/upcoming`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const events = await response.json();
            displayEvents(events, 'upcomingEvents');
        }
    } catch (error) {
        console.error('Error loading upcoming events:', error);
    }
}

async function loadPastEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/member/events/past`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const events = await response.json();
            displayEvents(events, 'pastEvents', true);
        }
    } catch (error) {
        console.error('Error loading past events:', error);
    }
}

function displayEvents(events, containerId, showDownload = false) {
    const container = document.getElementById(containerId);
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No events found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = events.map(event => {
        const eventDate = new Date(event.eventDate);
        const statusClass = event.status.toLowerCase();
        
        return `
            <div class="event-card">
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${eventDate.toLocaleDateString()} ${eventDate.toLocaleTimeString()}</p>
                <p><strong>Location:</strong> ${event.location || 'TBA'}</p>
                <p>${event.description}</p>
                <span class="event-status status-${statusClass}">${event.status}</span>
                ${showDownload && event.status === 'COMPLETED' ? `
                    <div style="margin-top: 10px;">
                        <button class="btn-download" onclick="downloadReport(${event.id}, 'post')">
                            📄 Download Report
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

async function loadMyAttendance() {
    try {
        const response = await fetch(`${API_BASE_URL}/member/attendance/my`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const attendanceRecords = await response.json();
            displayAttendanceStats(attendanceRecords);
            displayAttendanceList(attendanceRecords);
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

function displayAttendanceStats(records) {
    const stats = {
        present: records.filter(r => r.status === 'PRESENT').length,
        absent: records.filter(r => r.status === 'ABSENT').length,
        late: records.filter(r => r.status === 'LATE').length,
        total: records.length
    };
    
    const statsContainer = document.getElementById('attendanceStats');
    statsContainer.innerHTML = `
        <div class="stat-card">
            <h3>${stats.total}</h3>
            <p>Total Events</p>
        </div>
        <div class="stat-card">
            <h3>${stats.present}</h3>
            <p>Present</p>
        </div>
        <div class="stat-card">
            <h3>${stats.late}</h3>
            <p>Late</p>
        </div>
        <div class="stat-card">
            <h3>${stats.absent}</h3>
            <p>Absent</p>
        </div>
    `;
}

function displayAttendanceList(records) {
    const listContainer = document.getElementById('attendanceList');
    
    if (records.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <p>No attendance records found</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = records.map(record => `
        <div class="attendance-item">
            <div>
                <strong>Event ID: ${record.event.id}</strong>
                <p>${new Date(record.recordedAt).toLocaleDateString()}</p>
            </div>
            <span class="attendance-status status-${record.status.toLowerCase()}">${record.status}</span>
        </div>
    `).join('');
}

async function loadWinners() {
    try {
        const response = await fetch(`${API_BASE_URL}/member/winners/recent`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const winners = await response.json();
            displayWinners(winners);
        }
    } catch (error) {
        console.error('Error loading winners:', error);
    }
}

function displayWinners(winners) {
    const container = document.getElementById('winnersList');
    
    if (winners.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No winners announced yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = winners.map(winner => `
        <div class="winner-card">
            <div class="position">${winner.position}</div>
            <h3>${winner.member.name}</h3>
            <p><strong>Event:</strong> ${winner.event.title}</p>
            <p><strong>Achievement:</strong> ${winner.achievement}</p>
            ${winner.prize ? `<p><strong>Prize:</strong> ${winner.prize}</p>` : ''}
            <p style="font-size: 12px; margin-top: 10px;">
                Announced: ${new Date(winner.announcedAt).toLocaleDateString()}
            </p>
        </div>
    `).join('');
}

async function downloadReport(eventId, type) {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/event/${eventId}/${type}-event`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Event_${eventId}_${type}_Report.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } else {
            alert('Failed to download report');
        }
    } catch (error) {
        console.error('Error downloading report:', error);
        alert('Error downloading report');
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/member/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });
        
        if (response.ok) {
            alert('Password changed successfully');
            document.getElementById('passwordForm').reset();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to change password');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Error changing password');
    }
}

function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    selectedTab.classList.add('active');
    
    // Activate button
    event.target.classList.add('active');
    
    // Load data based on tab
    switch(tabName) {
        case 'upcoming':
            loadUpcomingEvents();
            break;
        case 'past':
            loadPastEvents();
            break;
        case 'attendance':
            loadMyAttendance();
            break;
        case 'winners':
            loadWinners();
            break;
        case 'profile':
            // Profile already loaded
            break;
    }
}

function logout() {
    localStorage.removeItem('memberToken');
    window.location.href = '/member-login.html';
}
