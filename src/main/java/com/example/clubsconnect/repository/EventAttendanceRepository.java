package com.example.clubsconnect.repository;

import com.example.clubsconnect.model.EventAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventAttendanceRepository extends JpaRepository<EventAttendance, Long> {
    
    List<EventAttendance> findByEventId(Long eventId);
    
    List<EventAttendance> findByMemberId(Long memberId);
    
    Optional<EventAttendance> findByEventIdAndMemberId(Long eventId, Long memberId);
    
    Long countByEventIdAndStatus(Long eventId, EventAttendance.AttendanceStatus status);
}
