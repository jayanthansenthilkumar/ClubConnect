package com.example.clubsconnect.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @JsonIgnore
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String fullName;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    @ManyToOne
    @JoinColumn(name = "club_id")
    private Club club;
    
    @Column(name = "academic_year")
    private String academicYear; // e.g., "2024-2025"
    
    @Column(name = "student_id", unique = true)
    private String studentId; // Unique student identifier
    
    @Column(nullable = false)
    private Boolean active = true;
    
    private String phoneNumber;
    
    private String department;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum UserRole {
        ADMIN,                  // System admin - can do anything
        CLUB_COORDINATOR,       // Coordinates specific club activities, can approve events
        CLUB_PRESIDENT,         // Leads a specific club, can create events and add members
        MEMBER                  // Club member - can view events and their details
    }
}
