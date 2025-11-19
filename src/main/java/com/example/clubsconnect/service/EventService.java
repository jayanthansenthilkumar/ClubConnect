package com.example.clubsconnect.service;

import com.example.clubsconnect.model.Club;
import com.example.clubsconnect.model.Event;
import com.example.clubsconnect.model.Member;
import com.example.clubsconnect.repository.ClubRepository;
import com.example.clubsconnect.repository.EventRepository;
import com.example.clubsconnect.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EventService {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private ClubRepository clubRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private EmailService emailService;
    
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
    
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }
    
    public List<Event> getEventsByClubId(Long clubId) {
        return eventRepository.findByClubId(clubId);
    }
    
    public List<Event> getEventsByStatus(String status) {
        return eventRepository.findByStatus(status);
    }
    
    public Event createEvent(Long clubId, Event event, String createdByUsername) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));
        
        event.setClub(club);
        event.setCreatedBy(createdByUsername);
        event.setApprovalStatus("PENDING");
        
        Event savedEvent = eventRepository.save(event);
        
        // Send email notification to all active members of the club
        try {
            List<Member> members = memberRepository.findByClubId(clubId);
            List<Member> activeMembers = members.stream()
                    .filter(m -> m.getMembershipStatus() == Member.MembershipStatus.ACTIVE)
                    .toList();
            
            if (!activeMembers.isEmpty()) {
                emailService.sendEventCreatedNotification(savedEvent, activeMembers);
            }
        } catch (Exception e) {
            System.err.println("Failed to send event creation notifications: " + e.getMessage());
        }
        
        return savedEvent;
    }
    
    public Event updateEvent(Long id, Event eventDetails) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setEventDate(eventDetails.getEventDate());
        event.setLocation(eventDetails.getLocation());
        event.setStatus(eventDetails.getStatus());
        
        if (eventDetails.getBudget() != null) {
            event.setBudget(eventDetails.getBudget());
        }
        
        if (eventDetails.getActualExpense() != null) {
            event.setActualExpense(eventDetails.getActualExpense());
        }
        
        if (eventDetails.getParticipantsCount() != null) {
            event.setParticipantsCount(eventDetails.getParticipantsCount());
        }
        
        return eventRepository.save(event);
    }
    
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
    
    public Event approveEvent(Long id, String approvedBy) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        event.setApprovalStatus("APPROVED");
        event.setApprovedBy(approvedBy);
        event.setApprovedAt(LocalDateTime.now());
        event.setRejectionReason(null); // Clear any previous rejection reason
        
        Event savedEvent = eventRepository.save(event);
        
        // Send approval notification to all active members
        try {
            List<Member> members = memberRepository.findByClubId(event.getClub().getId());
            List<Member> activeMembers = members.stream()
                    .filter(m -> m.getMembershipStatus() == Member.MembershipStatus.ACTIVE)
                    .toList();
            
            if (!activeMembers.isEmpty()) {
                emailService.sendEventApprovedNotification(savedEvent, activeMembers);
            }
        } catch (Exception e) {
            System.err.println("Failed to send event approval notifications: " + e.getMessage());
        }
        
        return savedEvent;
    }
    
    public Event rejectEvent(Long id, String rejectedBy, String reason) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        event.setApprovalStatus("REJECTED");
        event.setApprovedBy(rejectedBy);
        event.setApprovedAt(LocalDateTime.now());
        event.setRejectionReason(reason);
        
        return eventRepository.save(event);
    }
    
    public Event addPreEventReport(Long id, String report) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        event.setPreEventReport(report);
        return eventRepository.save(event);
    }
    
    public Event addPostEventReport(Long id, String report) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        event.setPostEventReport(report);
        if (event.getStatus().equals("SCHEDULED") || event.getStatus().equals("ONGOING")) {
            event.setStatus("COMPLETED");
        }
        return eventRepository.save(event);
    }
    
    public List<Event> getPendingEvents() {
        return eventRepository.findByApprovalStatus("PENDING");
    }
    
    public List<Event> getUpcomingEvents(Long clubId) {
        return eventRepository.findByClubIdAndEventDateAfterOrderByEventDateAsc(
            clubId, LocalDateTime.now());
    }
    
    public List<Event> getPastEvents(Long clubId) {
        return eventRepository.findByClubIdAndEventDateBeforeOrderByEventDateDesc(
            clubId, LocalDateTime.now());
    }
}
