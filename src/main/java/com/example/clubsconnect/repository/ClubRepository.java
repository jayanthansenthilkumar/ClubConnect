package com.example.clubsconnect.repository;

import com.example.clubsconnect.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    List<Club> findByCategory(String category);
    List<Club> findByNameContainingIgnoreCase(String name);
}
