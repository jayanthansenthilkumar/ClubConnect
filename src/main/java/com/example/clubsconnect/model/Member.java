package com.example.clubsconnect.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "members", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email"),
    @UniqueConstraint(columnNames = "student_id"),
    @UniqueConstraint(columnNames = "username")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String studentId; // Unique student identifier
    
    @Column(nullable = false, unique = true, length = 100)
    private String username; // Generated username for login
    
    @JsonIgnore
    @Column(nullable = false)
    private String password; // Hashed password for member login
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    private String phone;
    
    private String role; // Role within the club (e.g., "Member", "Vice President")
    
    @Column(name = "academic_year", nullable = false)
    private String academicYear; // e.g., "2024-2025"
    
    @Column(name = "membership_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private MembershipStatus membershipStatus;
    
    @Column(name = "department")
    private String department;
    
    @Column(name = "join_date")
    private LocalDateTime joinDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    @JsonIgnore
    private Club club;
    
    @PrePersist
    protected void onCreate() {
        joinDate = LocalDateTime.now();
        if (membershipStatus == null) {
            membershipStatus = MembershipStatus.ACTIVE;
        }
    }
    
    public enum MembershipStatus {
        ACTIVE,      // Currently active member
        INACTIVE,    // No longer active
        PENDING      // Membership pending approval
    }
}
