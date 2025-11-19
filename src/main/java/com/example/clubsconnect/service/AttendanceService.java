package com.example.clubsconnect.service;

import com.example.clubsconnect.model.Event;
import com.example.clubsconnect.model.EventAttendance;
import com.example.clubsconnect.model.Member;
import com.example.clubsconnect.repository.EventAttendanceRepository;
import com.example.clubsconnect.repository.EventRepository;
import com.example.clubsconnect.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AttendanceService {
    
    @Autowired
    private EventAttendanceRepository attendanceRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    public List<EventAttendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }
    
    public Optional<EventAttendance> getAttendanceById(Long id) {
        return attendanceRepository.findById(id);
    }
    
    public List<EventAttendance> getAttendanceByEventId(Long eventId) {
        return attendanceRepository.findByEventId(eventId);
    }
    
    public List<EventAttendance> getAttendanceByMemberId(Long memberId) {
        return attendanceRepository.findByMemberId(memberId);
    }
    
    public EventAttendance markAttendance(Long eventId, Long memberId, 
            EventAttendance.AttendanceStatus status, String recordedBy) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + memberId));
        
        // Check if attendance already exists
        Optional<EventAttendance> existingAttendance = 
                attendanceRepository.findByEventIdAndMemberId(eventId, memberId);
        
        EventAttendance attendance;
        if (existingAttendance.isPresent()) {
            attendance = existingAttendance.get();
            attendance.setStatus(status);
        } else {
            attendance = new EventAttendance();
            attendance.setEvent(event);
            attendance.setMember(member);
            attendance.setStatus(status);
        }
        
        attendance.setRecordedBy(recordedBy);
        
        if (status == EventAttendance.AttendanceStatus.PRESENT || 
            status == EventAttendance.AttendanceStatus.LATE) {
            if (attendance.getCheckInTime() == null) {
                attendance.setCheckInTime(LocalDateTime.now());
            }
        }
        
        return attendanceRepository.save(attendance);
    }
    
    public EventAttendance checkOut(Long attendanceId) {
        EventAttendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        
        attendance.setCheckOutTime(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }
    
    public EventAttendance updateAttendanceRemarks(Long attendanceId, String remarks) {
        EventAttendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        
        attendance.setRemarks(remarks);
        return attendanceRepository.save(attendance);
    }
    
    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }
    
    public Long getAttendanceCount(Long eventId, EventAttendance.AttendanceStatus status) {
        return attendanceRepository.countByEventIdAndStatus(eventId, status);
    }
}
