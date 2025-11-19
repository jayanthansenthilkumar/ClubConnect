package com.example.clubsconnect.controller;

import com.example.clubsconnect.model.Club;
import com.example.clubsconnect.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin(origins = "*")
public class ClubController {
    
    @Autowired
    private ClubService clubService;
    
    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Club> getClubById(@PathVariable Long id) {
        return clubService.getClubById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Club>> getClubsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(clubService.getClubsByCategory(category));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Club>> searchClubs(@RequestParam String name) {
        return ResponseEntity.ok(clubService.searchClubs(name));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Club> createClub(@RequestBody Club club) {
        Club createdClub = clubService.createClub(club);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdClub);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<Club> updateClub(@PathVariable Long id, @RequestBody Club club) {
        try {
            Club updatedClub = clubService.updateClub(id, club);
            return ResponseEntity.ok(updatedClub);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClub(@PathVariable Long id) {
        clubService.deleteClub(id);
        return ResponseEntity.noContent().build();
    }
}
