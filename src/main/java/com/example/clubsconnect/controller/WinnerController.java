package com.example.clubsconnect.controller;

import com.example.clubsconnect.model.Event;
import com.example.clubsconnect.model.EventWinner;
import com.example.clubsconnect.model.Member;
import com.example.clubsconnect.repository.EventRepository;
import com.example.clubsconnect.repository.EventWinnerRepository;
import com.example.clubsconnect.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/winners")
@CrossOrigin(origins = "*")
public class WinnerController {
    
    @Autowired
    private EventWinnerRepository winnerRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<List<EventWinner>> getAllWinners() {
        return ResponseEntity.ok(winnerRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getWinnerById(@PathVariable Long id) {
        return winnerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventWinner>> getWinnersByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(winnerRepository.findByEventId(eventId));
    }
    
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<EventWinner>> getWinnersByMemberId(@PathVariable Long memberId) {
        return ResponseEntity.ok(winnerRepository.findByMemberId(memberId));
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<EventWinner>> getActiveCelebrations() {
        return ResponseEntity.ok(winnerRepository.findActiveCelebrations(LocalDateTime.now()));
    }
    
    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<EventWinner>> getWinnersByClubId(@PathVariable Long clubId) {
        return ResponseEntity.ok(winnerRepository.findByEventClubIdOrderByAnnouncedAtDesc(clubId));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> addWinner(@RequestBody Map<String, Object> winnerData) {
        try {
            Long eventId = Long.valueOf(winnerData.get("eventId").toString());
            Long memberId = Long.valueOf(winnerData.get("memberId").toString());
            String position = winnerData.get("position").toString();
            String achievement = winnerData.getOrDefault("achievement", "").toString();
            String prize = winnerData.getOrDefault("prize", "").toString();
            String announcedBy = winnerData.get("announcedBy").toString();
            
            Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
            
            Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
            
            EventWinner winner = new EventWinner();
            winner.setEvent(event);
            winner.setMember(member);
            winner.setPosition(position);
            winner.setAchievement(achievement);
            winner.setPrize(prize);
            winner.setAnnouncedBy(announcedBy);
            winner.setShowCelebration(true);
            
            // Set celebration to end when the next event starts or after 30 days
            LocalDateTime nextEventDate = eventRepository
                .findByClubIdAndEventDateAfterOrderByEventDateAsc(
                    event.getClub().getId(), 
                    LocalDateTime.now())
                .stream()
                .findFirst()
                .map(Event::getEventDate)
                .orElse(LocalDateTime.now().plusDays(30));
            
            winner.setCelebrationEndsAt(nextEventDate);
            
            EventWinner savedWinner = winnerRepository.save(winner);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedWinner);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Failed to add winner: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> updateWinner(@PathVariable Long id, @RequestBody Map<String, Object> winnerData) {
        try {
            EventWinner winner = winnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Winner not found"));
            
            if (winnerData.containsKey("position")) {
                winner.setPosition(winnerData.get("position").toString());
            }
            if (winnerData.containsKey("achievement")) {
                winner.setAchievement(winnerData.get("achievement").toString());
            }
            if (winnerData.containsKey("prize")) {
                winner.setPrize(winnerData.get("prize").toString());
            }
            if (winnerData.containsKey("showCelebration")) {
                winner.setShowCelebration(Boolean.parseBoolean(winnerData.get("showCelebration").toString()));
            }
            
            EventWinner updatedWinner = winnerRepository.save(winner);
            return ResponseEntity.ok(updatedWinner);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<Void> deleteWinner(@PathVariable Long id) {
        winnerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/toggle-celebration")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> toggleCelebration(@PathVariable Long id) {
        try {
            EventWinner winner = winnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Winner not found"));
            
            winner.setShowCelebration(!winner.getShowCelebration());
            EventWinner updatedWinner = winnerRepository.save(winner);
            
            return ResponseEntity.ok(updatedWinner);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        }
    }
}
