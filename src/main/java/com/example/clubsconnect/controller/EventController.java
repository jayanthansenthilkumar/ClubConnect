package com.example.clubsconnect.controller;

import com.example.clubsconnect.model.Event;
import com.example.clubsconnect.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {
    
    @Autowired
    private EventService eventService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<Event>> getEventsByClubId(@PathVariable Long clubId) {
        return ResponseEntity.ok(eventService.getEventsByClubId(clubId));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Event>> getEventsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(eventService.getEventsByStatus(status));
    }
    
    @PostMapping("/club/{clubId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<Event> createEvent(@PathVariable Long clubId, @RequestBody Event event, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            Event createdEvent = eventService.createEvent(clubId, event, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        try {
            Event updatedEvent = eventService.updateEvent(id, event);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<Event> approveEvent(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try {
            String approvedBy = data.get("approvedBy");
            Event approvedEvent = eventService.approveEvent(id, approvedBy);
            return ResponseEntity.ok(approvedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<Event> rejectEvent(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try {
            String rejectedBy = data.get("rejectedBy");
            String reason = data.getOrDefault("reason", "");
            Event rejectedEvent = eventService.rejectEvent(id, rejectedBy, reason);
            return ResponseEntity.ok(rejectedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/pre-report")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<Event> addPreEventReport(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try {
            String report = data.get("report");
            Event updatedEvent = eventService.addPreEventReport(id, report);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/post-report")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<Event> addPostEventReport(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try {
            String report = data.get("report");
            Event updatedEvent = eventService.addPostEventReport(id, report);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/pending-approval")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<List<Event>> getPendingEvents() {
        return ResponseEntity.ok(eventService.getPendingEvents());
    }
}
