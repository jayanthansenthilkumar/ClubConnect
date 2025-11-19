package com.example.clubsconnect.service;

import com.example.clubsconnect.model.Club;
import com.example.clubsconnect.model.Member;
import com.example.clubsconnect.repository.ClubRepository;
import com.example.clubsconnect.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MemberService {
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private ClubRepository clubRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = CHAR_LOWER.toUpperCase();
    private static final String NUMBER = "0123456789";
    private static final String SPECIAL_CHAR = "!@#$%";
    private static final String PASSWORD_CHARS = CHAR_LOWER + CHAR_UPPER + NUMBER + SPECIAL_CHAR;
    private static final SecureRandom random = new SecureRandom();
    
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }
    
    public Optional<Member> getMemberById(Long id) {
        return memberRepository.findById(id);
    }
    
    public List<Member> getMembersByClubId(Long clubId) {
        return memberRepository.findByClubId(clubId);
    }
    
    public Member createMember(Long clubId, Member member, String currentUserUsername) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));
        
        // Check if student already exists in ANY club
        if (memberRepository.existsByStudentId(member.getStudentId())) {
            Optional<Member> existingMember = memberRepository.findByStudentId(member.getStudentId());
            if (existingMember.isPresent()) {
                Member existing = existingMember.get();
                throw new RuntimeException("Student already exists in " + existing.getClub().getName() + 
                    " with status: " + existing.getMembershipStatus() + 
                    ". Cannot add to multiple clubs in the same academic year.");
            }
        }
        
        // Check if email already exists
        if (memberRepository.existsByEmail(member.getEmail())) {
            throw new RuntimeException("Email already exists in the system");
        }
        
        // Generate unique username
        String username = generateUniqueUsername(member.getName(), member.getStudentId());
        member.setUsername(username);
        
        // Generate temporary password
        String temporaryPassword = generateTemporaryPassword();
        member.setPassword(passwordEncoder.encode(temporaryPassword));
        
        // Set membership status to ACTIVE
        if (member.getMembershipStatus() == null) {
            member.setMembershipStatus(Member.MembershipStatus.ACTIVE);
        }
        
        member.setClub(club);
        Member savedMember = memberRepository.save(member);
        
        // Send welcome email with login credentials
        try {
            emailService.sendMemberWelcomeEmail(savedMember, temporaryPassword);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
            // Don't fail the transaction if email fails
        }
        
        return savedMember;
    }
    
    public Member updateMember(Long id, Member memberDetails) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + id));
        
        member.setName(memberDetails.getName());
        
        // Check if email is being changed and if new email already exists
        if (!member.getEmail().equals(memberDetails.getEmail())) {
            if (memberRepository.existsByEmail(memberDetails.getEmail())) {
                throw new RuntimeException("Email already exists in the system");
            }
            member.setEmail(memberDetails.getEmail());
        }
        
        member.setPhone(memberDetails.getPhone());
        member.setRole(memberDetails.getRole());
        member.setDepartment(memberDetails.getDepartment());
        
        if (memberDetails.getMembershipStatus() != null) {
            member.setMembershipStatus(memberDetails.getMembershipStatus());
        }
        
        return memberRepository.save(member);
    }
    
    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }
    
    public Optional<Member> findByUsername(String username) {
        return memberRepository.findByUsername(username);
    }
    
    public Optional<Member> findByEmail(String email) {
        return memberRepository.findByEmail(email);
    }
    
    public Optional<Member> findByStudentId(String studentId) {
        return memberRepository.findByStudentId(studentId);
    }
    
    private String generateUniqueUsername(String name, String studentId) {
        // Generate username from name and student ID
        String baseName = name.toLowerCase()
                .replaceAll("[^a-z0-9]", "")
                .substring(0, Math.min(name.length(), 6));
        
        String baseUsername = baseName + studentId.substring(Math.max(0, studentId.length() - 4));
        String username = baseUsername;
        int counter = 1;
        
        // Ensure uniqueness
        while (memberRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
    
    private String generateTemporaryPassword() {
        StringBuilder password = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            int randomIndex = random.nextInt(PASSWORD_CHARS.length());
            password.append(PASSWORD_CHARS.charAt(randomIndex));
        }
        return password.toString();
    }
}
