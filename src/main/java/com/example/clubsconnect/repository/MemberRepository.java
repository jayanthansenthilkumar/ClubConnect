package com.example.clubsconnect.repository;

import com.example.clubsconnect.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findByClubId(Long clubId);
    Optional<Member> findByEmail(String email);
    Optional<Member> findByStudentId(String studentId);
    Optional<Member> findByUsername(String username);
    List<Member> findByClubIdAndAcademicYear(Long clubId, String academicYear);
    boolean existsByEmail(String email);
    boolean existsByStudentId(String studentId);
    boolean existsByUsername(String username);
}
