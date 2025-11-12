package com.example.clubsconnect.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;
    
    private String location;
    
    private String status; // SCHEDULED, ONGOING, COMPLETED, CANCELLED
    
    @Column(name = "approval_status")
    private String approvalStatus; // PENDING, APPROVED, REJECTED
    
    @Column(name = "created_by")
    private String createdBy; // Username of creator
    
    @Column(name = "approved_by")
    private String approvedBy; // Username of approver
    
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;
    
    @Column(name = "pre_event_report", length = 2000)
    private String preEventReport;
    
    @Column(name = "post_event_report", length = 2000)
    private String postEventReport;
    
    @Column(name = "participants_count")
    private Integer participantsCount;
    
    @Column(name = "budget")
    private Double budget;
    
    @Column(name = "actual_expense")
    private Double actualExpense;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    @JsonIgnore
    private Club club;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "SCHEDULED";
        }
        if (approvalStatus == null) {
            approvalStatus = "PENDING";
        }
    }
}
