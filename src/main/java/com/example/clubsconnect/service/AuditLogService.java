package com.example.clubsconnect.service;

import com.example.clubsconnect.model.AuditLog;
import com.example.clubsconnect.repository.AuditLogRepository;
import com.example.clubsconnect.security.MemberDetailsImpl;
import com.example.clubsconnect.security.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    /**
     * Log a successful action
     */
    public void logSuccess(String action, String entityType, Long entityId, String details, Long clubId) {
        log(action, entityType, entityId, details, clubId, AuditLog.ActionStatus.SUCCESS, null);
    }
    
    /**
     * Log a failed action
     */
    public void logFailure(String action, String entityType, Long entityId, String details, Long clubId, String errorMessage) {
        log(action, entityType, entityId, details, clubId, AuditLog.ActionStatus.FAILURE, errorMessage);
    }
    
    /**
     * Create and save an audit log entry
     */
    private void log(String action, String entityType, Long entityId, String details, Long clubId, 
                     AuditLog.ActionStatus status, String errorMessage) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setDetails(details);
            auditLog.setClubId(clubId);
            auditLog.setStatus(status);
            auditLog.setErrorMessage(errorMessage);
            
            // Get current user information
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                auditLog.setPerformedBy(auth.getName());
                
                Object principal = auth.getPrincipal();
                if (principal instanceof UserDetailsImpl) {
                    auditLog.setUserType("USER");
                } else if (principal instanceof MemberDetailsImpl) {
                    auditLog.setUserType("MEMBER");
                } else {
                    auditLog.setUserType("SYSTEM");
                }
            } else {
                auditLog.setPerformedBy("SYSTEM");
                auditLog.setUserType("SYSTEM");
            }
            
            // Get IP address from request
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                auditLog.setIpAddress(getClientIpAddress(request));
            }
            
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Don't fail the main operation if audit logging fails
            System.err.println("Failed to create audit log: " + e.getMessage());
        }
    }
    
    /**
     * Get the client's IP address from the request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };
        
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * Get audit logs by user
     */
    public List<AuditLog> getLogsByUser(String username) {
        return auditLogRepository.findByPerformedByOrderByTimestampDesc(username);
    }
    
    /**
     * Get audit logs for a specific entity
     */
    public List<AuditLog> getLogsForEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }
    
    /**
     * Get audit logs for a specific club
     */
    public List<AuditLog> getLogsByClub(Long clubId) {
        return auditLogRepository.findByClubIdOrderByTimestampDesc(clubId);
    }
    
    /**
     * Get audit logs by action type
     */
    public List<AuditLog> getLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByTimestampDesc(action);
    }
    
    /**
     * Get audit logs within a date range
     */
    public List<AuditLog> getLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(start, end);
    }
    
    /**
     * Get failed audit logs
     */
    public List<AuditLog> getFailedLogs() {
        return auditLogRepository.findByStatusOrderByTimestampDesc(AuditLog.ActionStatus.FAILURE);
    }
    
    /**
     * Get all audit logs
     */
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }
}
