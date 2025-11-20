package com.example.clubsconnect.repository;

import com.example.clubsconnect.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);
    
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, Long entityId);
    
    List<AuditLog> findByClubIdOrderByTimestampDesc(Long clubId);
    
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
    
    List<AuditLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);
    
    List<AuditLog> findByStatusOrderByTimestampDesc(AuditLog.ActionStatus status);
}
