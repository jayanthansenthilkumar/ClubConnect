package com.example.clubsconnect.controller;

import com.example.clubsconnect.model.EventAttendance;
import com.example.clubsconnect.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {
    
    @Autowired
    private AttendanceService attendanceService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<List<EventAttendance>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> getAttendanceById(@PathVariable Long id) {
        return attendanceService.getAttendanceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<List<EventAttendance>> getAttendanceByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEventId(eventId));
    }
    
    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> attendanceData,
                                            @RequestHeader("Authorization") String token) {
        try {
            Long eventId = Long.valueOf(attendanceData.get("eventId").toString());
            Long memberId = Long.valueOf(attendanceData.get("memberId").toString());
            String status = attendanceData.get("status").toString();
            String recordedBy = attendanceData.get("recordedBy").toString();
            
            EventAttendance.AttendanceStatus attendanceStatus = 
                EventAttendance.AttendanceStatus.valueOf(status);
            
            EventAttendance attendance = attendanceService.markAttendance(
                eventId, memberId, attendanceStatus, recordedBy);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(attendance);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Failed to mark attendance: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> checkOut(@PathVariable Long id) {
        try {
            EventAttendance attendance = attendanceService.checkOut(id);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/remarks")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> updateRemarks(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try {
            String remarks = data.get("remarks");
            EventAttendance attendance = attendanceService.updateAttendanceRemarks(id, remarks);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/event/{eventId}/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> getAttendanceStats(@PathVariable Long eventId) {
        Map<String, Long> stats = Map.of(
            "present", attendanceService.getAttendanceCount(eventId, EventAttendance.AttendanceStatus.PRESENT),
            "absent", attendanceService.getAttendanceCount(eventId, EventAttendance.AttendanceStatus.ABSENT),
            "late", attendanceService.getAttendanceCount(eventId, EventAttendance.AttendanceStatus.LATE),
            "excused", attendanceService.getAttendanceCount(eventId, EventAttendance.AttendanceStatus.EXCUSED)
        );
        return ResponseEntity.ok(stats);
    }
}
