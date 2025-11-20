package com.example.clubsconnect.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String action; // e.g., "EVENT_APPROVED", "MEMBER_CREATED", "WINNER_ANNOUNCED"
    
    @Column(nullable = false)
    private String entityType; // e.g., "Event", "Member", "Attendance"
    
    @Column(nullable = false)
    private Long entityId; // ID of the affected entity
    
    @Column(nullable = false)
    private String performedBy; // Username of person who performed the action
    
    @Column(nullable = false)
    private String userType; // "USER" or "MEMBER"
    
    @Column(length = 1000)
    private String details; // Additional details about the action
    
    private String ipAddress; // IP address of the request
    
    @Column(name = "club_id")
    private Long clubId; // Related club if applicable
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ActionStatus status; // SUCCESS or FAILURE
    
    private String errorMessage; // If action failed, store error message
    
    public enum ActionStatus {
        SUCCESS,
        FAILURE
    }
}
