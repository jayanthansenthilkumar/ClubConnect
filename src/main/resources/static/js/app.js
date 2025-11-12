const API_URL = 'http://localhost:8080/api';

let clubs = [];
let members = [];
let events = [];
let currentClubId = null;
let currentMemberId = null;
let currentEventId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadClubs();
    loadMembers();
    loadEvents();
});

// Section Navigation
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById(section + '-section').classList.add('active');
    event.target.classList.add('active');
}

// ==================== CLUBS ====================

async function loadClubs() {
    try {
        const response = await fetch(`${API_URL}/clubs`);
        clubs = await response.json();
        displayClubs(clubs);
        populateClubSelects();
    } catch (error) {
        console.error('Error loading clubs:', error);
        alert('Error loading clubs. Please check if the server is running.');
    }
}

function displayClubs(clubsToDisplay) {
    const grid = document.getElementById('clubs-grid');
    grid.innerHTML = '';
    
    clubsToDisplay.forEach(club => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${club.name}</h3>
            <span class="card-category">${club.category}</span>
            <div class="card-info">
                <p><strong>Description:</strong> ${club.description || 'N/A'}</p>
                <p><strong>President:</strong> ${club.president || 'N/A'}</p>
                <p><strong>Email:</strong> ${club.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${club.phone || 'N/A'}</p>
                <p><strong>Meeting:</strong> ${club.meetingSchedule || 'N/A'}</p>
            </div>
            <div class="card-actions">
                <button class="btn btn-edit" onclick="editClub(${club.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteClub(${club.id})">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (clubsToDisplay.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #999;">No clubs found. Add your first club!</p>';
    }
}

function searchClubs() {
    const searchTerm = document.getElementById('club-search').value.toLowerCase();
    const filtered = clubs.filter(club => 
        club.name.toLowerCase().includes(searchTerm) ||
        (club.description && club.description.toLowerCase().includes(searchTerm))
    );
    displayClubs(filtered);
}

async function filterByCategory() {
    const category = document.getElementById('category-filter').value;
    
    if (category === '') {
        displayClubs(clubs);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/clubs/category/${category}`);
        const filtered = await response.json();
        displayClubs(filtered);
    } catch (error) {
        console.error('Error filtering clubs:', error);
    }
}

function showClubModal() {
    currentClubId = null;
    document.getElementById('club-modal-title').textContent = 'Add New Club';
    document.getElementById('club-form').reset();
    document.getElementById('club-id').value = '';
    document.getElementById('club-modal').classList.add('active');
}

function closeClubModal() {
    document.getElementById('club-modal').classList.remove('active');
}

function editClub(id) {
    const club = clubs.find(c => c.id === id);
    if (!club) return;
    
    currentClubId = id;
    document.getElementById('club-modal-title').textContent = 'Edit Club';
    document.getElementById('club-id').value = club.id;
    document.getElementById('club-name').value = club.name;
    document.getElementById('club-description').value = club.description || '';
    document.getElementById('club-category').value = club.category;
    document.getElementById('club-president').value = club.president || '';
    document.getElementById('club-email').value = club.email || '';
    document.getElementById('club-phone').value = club.phone || '';
    document.getElementById('club-schedule').value = club.meetingSchedule || '';
    
    document.getElementById('club-modal').classList.add('active');
}

async function saveClub(event) {
    event.preventDefault();
    
    const club = {
        name: document.getElementById('club-name').value,
        description: document.getElementById('club-description').value,
        category: document.getElementById('club-category').value,
        president: document.getElementById('club-president').value,
        email: document.getElementById('club-email').value,
        phone: document.getElementById('club-phone').value,
        meetingSchedule: document.getElementById('club-schedule').value
    };
    
    try {
        let response;
        if (currentClubId) {
            response = await fetch(`${API_URL}/clubs/${currentClubId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(club)
            });
        } else {
            response = await fetch(`${API_URL}/clubs`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(club)
            });
        }
        
        if (response.ok) {
            closeClubModal();
            loadClubs();
            alert('Club saved successfully!');
        }
    } catch (error) {
        console.error('Error saving club:', error);
        alert('Error saving club');
    }
}

async function deleteClub(id) {
    if (!confirm('Are you sure you want to delete this club? This will also delete all associated members and events.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/clubs/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadClubs();
            loadMembers();
            loadEvents();
            alert('Club deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting club:', error);
        alert('Error deleting club');
    }
}

// ==================== MEMBERS ====================

async function loadMembers() {
    try {
        const response = await fetch(`${API_URL}/members`);
        members = await response.json();
        displayMembers();
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

function displayMembers() {
    const tbody = document.getElementById('members-tbody');
    tbody.innerHTML = '';
    
    members.forEach(member => {
        const club = clubs.find(c => c.id === member.club?.id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.phone || 'N/A'}</td>
            <td>${member.role || 'Member'}</td>
            <td>${club ? club.name : 'N/A'}</td>
            <td>${new Date(member.joinDate).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-edit" onclick="editMember(${member.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteMember(${member.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">No members found. Add your first member!</td></tr>';
    }
}

function populateClubSelects() {
    const memberClubSelect = document.getElementById('member-club');
    const eventClubSelect = document.getElementById('event-club');
    
    [memberClubSelect, eventClubSelect].forEach(select => {
        select.innerHTML = '<option value="">Select Club</option>';
        clubs.forEach(club => {
            const option = document.createElement('option');
            option.value = club.id;
            option.textContent = club.name;
            select.appendChild(option);
        });
    });
}

function showMemberModal() {
    currentMemberId = null;
    document.getElementById('member-modal-title').textContent = 'Add New Member';
    document.getElementById('member-form').reset();
    document.getElementById('member-id').value = '';
    document.getElementById('member-modal').classList.add('active');
}

function closeMemberModal() {
    document.getElementById('member-modal').classList.remove('active');
}

function editMember(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    currentMemberId = id;
    document.getElementById('member-modal-title').textContent = 'Edit Member';
    document.getElementById('member-id').value = member.id;
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-email').value = member.email;
    document.getElementById('member-phone').value = member.phone || '';
    document.getElementById('member-role').value = member.role || '';
    
    // Note: We can't change the club in edit mode for simplicity
    const club = clubs.find(c => c.id === member.club?.id);
    if (club) {
        document.getElementById('member-club').value = club.id;
    }
    
    document.getElementById('member-modal').classList.add('active');
}

async function saveMember(event) {
    event.preventDefault();
    
    const member = {
        name: document.getElementById('member-name').value,
        email: document.getElementById('member-email').value,
        phone: document.getElementById('member-phone').value,
        role: document.getElementById('member-role').value
    };
    
    const clubId = document.getElementById('member-club').value;
    
    if (!clubId) {
        alert('Please select a club');
        return;
    }
    
    try {
        let response;
        if (currentMemberId) {
            response = await fetch(`${API_URL}/members/${currentMemberId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(member)
            });
        } else {
            response = await fetch(`${API_URL}/members/club/${clubId}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(member)
            });
        }
        
        if (response.ok) {
            closeMemberModal();
            loadMembers();
            alert('Member saved successfully!');
        }
    } catch (error) {
        console.error('Error saving member:', error);
        alert('Error saving member');
    }
}

async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/members/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadMembers();
            alert('Member deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting member:', error);
        alert('Error deleting member');
    }
}

// ==================== EVENTS ====================

async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/events`);
        events = await response.json();
        displayEvents();
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

function displayEvents() {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = '';
    
    events.forEach(event => {
        const club = clubs.find(c => c.id === event.club?.id);
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <span class="event-status ${event.status}">${event.status}</span>
            <h3>${event.title}</h3>
            <div class="card-info">
                <p><strong>Description:</strong> ${event.description || 'N/A'}</p>
                <p><strong>Date:</strong> ${new Date(event.eventDate).toLocaleString()}</p>
                <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
                <p><strong>Club:</strong> ${club ? club.name : 'N/A'}</p>
            </div>
            <div class="card-actions">
                <button class="btn btn-edit" onclick="editEvent(${event.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (events.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #999;">No events found. Add your first event!</p>';
    }
}

function showEventModal() {
    currentEventId = null;
    document.getElementById('event-modal-title').textContent = 'Add New Event';
    document.getElementById('event-form').reset();
    document.getElementById('event-id').value = '';
    document.getElementById('event-modal').classList.add('active');
}

function closeEventModal() {
    document.getElementById('event-modal').classList.remove('active');
}

function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    currentEventId = id;
    document.getElementById('event-modal-title').textContent = 'Edit Event';
    document.getElementById('event-id').value = event.id;
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-description').value = event.description || '';
    
    const eventDate = new Date(event.eventDate);
    const formattedDate = eventDate.toISOString().slice(0, 16);
    document.getElementById('event-date').value = formattedDate;
    
    document.getElementById('event-location').value = event.location || '';
    document.getElementById('event-status').value = event.status;
    
    const club = clubs.find(c => c.id === event.club?.id);
    if (club) {
        document.getElementById('event-club').value = club.id;
    }
    
    document.getElementById('event-modal').classList.add('active');
}

async function saveEvent(event) {
    event.preventDefault();
    
    const eventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        eventDate: document.getElementById('event-date').value,
        location: document.getElementById('event-location').value,
        status: document.getElementById('event-status').value
    };
    
    const clubId = document.getElementById('event-club').value;
    
    if (!clubId) {
        alert('Please select a club');
        return;
    }
    
    try {
        let response;
        if (currentEventId) {
            response = await fetch(`${API_URL}/events/${currentEventId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(eventData)
            });
        } else {
            response = await fetch(`${API_URL}/events/club/${clubId}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(eventData)
            });
        }
        
        if (response.ok) {
            closeEventModal();
            loadEvents();
            alert('Event saved successfully!');
        }
    } catch (error) {
        console.error('Error saving event:', error);
        alert('Error saving event');
    }
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/events/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadEvents();
            alert('Event deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
