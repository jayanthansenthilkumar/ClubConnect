package com.example.clubsconnect.controller;

import com.example.clubsconnect.dto.LoginRequest;
import com.example.clubsconnect.dto.LoginResponse;
import com.example.clubsconnect.model.Event;
import com.example.clubsconnect.model.EventWinner;
import com.example.clubsconnect.model.Member;
import com.example.clubsconnect.repository.EventWinnerRepository;
import com.example.clubsconnect.security.JwtUtils;
import com.example.clubsconnect.service.AttendanceService;
import com.example.clubsconnect.service.EventService;
import com.example.clubsconnect.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/member")
@CrossOrigin(origins = "*")
public class MemberAuthController {
    
    @Autowired
    private MemberService memberService;
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    private AttendanceService attendanceService;
    
    @Autowired
    private EventWinnerRepository winnerRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Optional<Member> memberOpt = memberService.findByUsername(loginRequest.getUsername());
            
            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
            }
            
            Member member = memberOpt.get();
            
            if (!passwordEncoder.matches(loginRequest.getPassword(), member.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
            }
            
            if (member.getMembershipStatus() != Member.MembershipStatus.ACTIVE) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Your membership is not active"));
            }
            
            // Generate JWT token for member
            String token = jwtUtils.generateTokenFromUsername(member.getUsername());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("username", member.getUsername());
            response.put("name", member.getName());
            response.put("email", member.getEmail());
            response.put("clubId", member.getClub().getId());
            response.put("clubName", member.getClub().getName());
            response.put("role", "MEMBER");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Optional<Member> memberOpt = memberService.findByUsername(username);
            
            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Member not found"));
            }
            
            return ResponseEntity.ok(memberOpt.get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Unauthorized"));
        }
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String token,
                                           @RequestBody Map<String, String> passwordData) {
        try {
            String username = extractUsernameFromToken(token);
            Optional<Member> memberOpt = memberService.findByUsername(username);
            
            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Member not found"));
            }
            
            Member member = memberOpt.get();
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (!passwordEncoder.matches(oldPassword, member.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Current password is incorrect"));
            }
            
            member.setPassword(passwordEncoder.encode(newPassword));
            memberService.updateMember(member.getId(), member);
            
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to change password"));
        }
    }
    
    @GetMapping("/events/upcoming")
    public ResponseEntity<?> getUpcomingEvents(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Optional<Member> memberOpt = memberService.findByUsername(username);
            
            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Member not found"));
            }
            
            Member member = memberOpt.get();
            List<Event> upcomingEvents = eventService.getUpcomingEvents(member.getClub().getId());
            
            // Filter only approved events
            List<Event> approvedEvents = upcomingEvents.stream()
                .filter(e -> "APPROVED".equals(e.getApprovalStatus()))
                .toList();
            
            return ResponseEntity.ok(approvedEvents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch events"));
        }
    }
    
    @GetMapping("/events/past")
    public ResponseEntity<?> getPastEvents(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Optional<Member> memberOpt = memberService.findByUsername(username);
            
            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Member not found"));
            }
            
            Member member = memberOpt.get();
            List<Event> pastEvents = eventService.getPastEvents(member.getClub().getId());
            
            return ResponseEntity.ok(pastEvents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch past events"));
        }
    }
    
    @GetMapping("/attendance/my")
    public ResponseEntity<?> getMyAttendance(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Optional<Member> memberOpt = memberService.findByUsername(username);
            
            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Member not found"));
            }
            
            Member member = memberOpt.get();
            return ResponseEntity.ok(attendanceService.getAttendanceByMemberId(member.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch attendance"));
        }
    }
    
    @GetMapping("/winners/active")
    public ResponseEntity<?> getActiveCelebrations(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Optional<Member> memberOpt = memberService.findByUsername(username);
            
            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Member not found"));
            }
            
            Member member = memberOpt.get();
            
            // Get active celebrations for the club
            List<EventWinner> allWinners = winnerRepository.findActiveCelebrations(LocalDateTime.now());
            List<EventWinner> clubWinners = allWinners.stream()
                .filter(w -> w.getEvent().getClub().getId().equals(member.getClub().getId()))
                .toList();
            
            return ResponseEntity.ok(clubWinners);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch winners"));
        }
    }
    
    @GetMapping("/winners/recent")
    public ResponseEntity<?> getRecentWinners(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Optional<Member> memberOpt = memberService.findByUsername(username);
            
            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Member not found"));
            }
            
            Member member = memberOpt.get();
            List<EventWinner> winners = winnerRepository.findByEventClubIdOrderByAnnouncedAtDesc(
                member.getClub().getId());
            
            return ResponseEntity.ok(winners);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch winners"));
        }
    }
    
    private String extractUsernameFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtils.getUsernameFromJwtToken(token);
    }
}
