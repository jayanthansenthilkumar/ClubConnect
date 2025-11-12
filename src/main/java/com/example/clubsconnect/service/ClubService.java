package com.example.clubsconnect.service;

import com.example.clubsconnect.model.Club;
import com.example.clubsconnect.repository.ClubRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClubService {
    
    @Autowired
    private ClubRepository clubRepository;
    
    public List<Club> getAllClubs() {
        return clubRepository.findAll();
    }
    
    public Optional<Club> getClubById(Long id) {
        return clubRepository.findById(id);
    }
    
    public List<Club> getClubsByCategory(String category) {
        return clubRepository.findByCategory(category);
    }
    
    public List<Club> searchClubs(String name) {
        return clubRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Club createClub(Club club) {
        return clubRepository.save(club);
    }
    
    public Club updateClub(Long id, Club clubDetails) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + id));
        
        club.setName(clubDetails.getName());
        club.setDescription(clubDetails.getDescription());
        club.setCategory(clubDetails.getCategory());
        club.setPresident(clubDetails.getPresident());
        club.setEmail(clubDetails.getEmail());
        club.setPhone(clubDetails.getPhone());
        club.setMeetingSchedule(clubDetails.getMeetingSchedule());
        
        return clubRepository.save(club);
    }
    
    public void deleteClub(Long id) {
        clubRepository.deleteById(id);
    }
}
