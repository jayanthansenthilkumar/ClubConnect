package com.example.clubsconnect.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"event_id", "member_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventAttendance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    @JsonIgnore
    private Member member;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;
    
    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;
    
    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;
    
    @Column(length = 500)
    private String remarks;
    
    @CreationTimestamp
    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt;
    
    @Column(name = "recorded_by")
    private String recordedBy; // Username of person who recorded attendance
    
    public enum AttendanceStatus {
        PRESENT,
        ABSENT,
        LATE,
        EXCUSED
    }
}
