package com.example.clubsconnect.controller;

import com.example.clubsconnect.model.Event;
import com.example.clubsconnect.repository.EventRepository;
import com.example.clubsconnect.service.PDFService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    @Autowired
    private PDFService pdfService;
    
    @Autowired
    private EventRepository eventRepository;
    
    @GetMapping("/event/{eventId}/pre-event")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> downloadPreEventReport(@PathVariable Long eventId) {
        try {
            Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
            
            byte[] pdfBytes = pdfService.generatePreEventReport(event);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                "PreEvent_" + event.getTitle().replaceAll("\\s+", "_") + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to generate pre-event report: " + e.getMessage());
        }
    }
    
    @GetMapping("/event/{eventId}/post-event")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> downloadPostEventReport(@PathVariable Long eventId) {
        try {
            Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
            
            byte[] pdfBytes = pdfService.generatePostEventReport(event);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                "PostEvent_" + event.getTitle().replaceAll("\\s+", "_") + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to generate post-event report: " + e.getMessage());
        }
    }
}
