package com.example.clubsconnect.controller;

import com.example.clubsconnect.model.AuditLog;
import com.example.clubsconnect.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
public class AuditLogController {
    
    @Autowired
    private AuditLogService auditLogService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }
    
    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<List<AuditLog>> getAuditLogsByUser(@PathVariable String username) {
        return ResponseEntity.ok(auditLogService.getLogsByUser(username));
    }
    
    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<List<AuditLog>> getAuditLogsForEntity(
            @PathVariable String entityType, 
            @PathVariable Long entityId) {
        return ResponseEntity.ok(auditLogService.getLogsForEntity(entityType, entityId));
    }
    
    @GetMapping("/club/{clubId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<List<AuditLog>> getAuditLogsByClub(@PathVariable Long clubId) {
        return ResponseEntity.ok(auditLogService.getLogsByClub(clubId));
    }
    
    @GetMapping("/action/{action}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<List<AuditLog>> getAuditLogsByAction(@PathVariable String action) {
        return ResponseEntity.ok(auditLogService.getLogsByAction(action));
    }
    
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<List<AuditLog>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(auditLogService.getLogsByDateRange(start, end));
    }
    
    @GetMapping("/failed")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<List<AuditLog>> getFailedAuditLogs() {
        return ResponseEntity.ok(auditLogService.getFailedLogs());
    }
}
