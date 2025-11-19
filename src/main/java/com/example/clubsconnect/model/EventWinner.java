package com.example.clubsconnect.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_winners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventWinner {
    
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
    private String position; // e.g., "1st Place", "2nd Place", "Winner", "Runner Up"
    
    @Column(length = 500)
    private String achievement; // Description of what they won for
    
    @Column(length = 500)
    private String prize; // Details of prize/recognition
    
    @CreationTimestamp
    @Column(name = "announced_at", nullable = false, updatable = false)
    private LocalDateTime announcedAt;
    
    @Column(name = "celebration_ends_at")
    private LocalDateTime celebrationEndsAt; // When the flower shower celebration ends
    
    @Column(name = "show_celebration", nullable = false)
    private Boolean showCelebration = true; // Whether to show celebration animation
    
    @Column(name = "announced_by")
    private String announcedBy; // Username of person who announced the winner
    
    @PrePersist
    protected void onCreate() {
        if (showCelebration == null) {
            showCelebration = true;
        }
    }
}
