package com.example.clubsconnect.repository;

import com.example.clubsconnect.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByClubId(Long clubId);
    List<Event> findByStatus(String status);
    List<Event> findByApprovalStatus(String approvalStatus);
}
