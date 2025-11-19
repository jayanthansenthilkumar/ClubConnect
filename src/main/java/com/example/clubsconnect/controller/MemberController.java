package com.example.clubsconnect.controller;

import com.example.clubsconnect.model.Member;
import com.example.clubsconnect.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {
    
    @Autowired
    private MemberService memberService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<List<Member>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id) {
        return memberService.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/club/{clubId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<List<Member>> getMembersByClubId(@PathVariable Long clubId) {
        return ResponseEntity.ok(memberService.getMembersByClubId(clubId));
    }
    
    @PostMapping("/club/{clubId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> createMember(@PathVariable Long clubId, @RequestBody Member member, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            Member createdMember = memberService.createMember(clubId, member, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMember);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR', 'CLUB_PRESIDENT')")
    public ResponseEntity<?> updateMember(@PathVariable Long id, @RequestBody Member member) {
        try {
            Member updatedMember = memberService.updateMember(id, member);
            return ResponseEntity.ok(updatedMember);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_COORDINATOR')")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
}
