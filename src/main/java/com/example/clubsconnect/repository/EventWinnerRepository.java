package com.example.clubsconnect.repository;

import com.example.clubsconnect.model.EventWinner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventWinnerRepository extends JpaRepository<EventWinner, Long> {
    
    List<EventWinner> findByEventId(Long eventId);
    
    List<EventWinner> findByMemberId(Long memberId);
    
    @Query("SELECT w FROM EventWinner w WHERE w.showCelebration = true AND " +
           "(w.celebrationEndsAt IS NULL OR w.celebrationEndsAt > :now)")
    List<EventWinner> findActiveCelebrations(LocalDateTime now);
    
    List<EventWinner> findByEventClubIdOrderByAnnouncedAtDesc(Long clubId);
}
