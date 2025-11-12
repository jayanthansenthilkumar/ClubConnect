package com.example.clubsconnect.service;

import com.example.clubsconnect.dto.LoginRequest;
import com.example.clubsconnect.dto.LoginResponse;
import com.example.clubsconnect.dto.SignupRequest;
import com.example.clubsconnect.model.Club;
import com.example.clubsconnect.model.User;
import com.example.clubsconnect.repository.ClubRepository;
import com.example.clubsconnect.repository.UserRepository;
import com.example.clubsconnect.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ClubRepository clubRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String clubName = null;
        Long clubId = null;
        if (user.getClub() != null) {
            clubId = user.getClub().getId();
            clubName = user.getClub().getName();
        }
        
        return new LoginResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                clubId,
                clubName
        );
    }
    
    @Transactional
    public User signup(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFullName(signupRequest.getFullName());
        user.setRole(signupRequest.getRole());
        user.setPhoneNumber(signupRequest.getPhoneNumber());
        user.setDepartment(signupRequest.getDepartment());
        user.setActive(true);
        
        if (signupRequest.getClubId() != null) {
            Club club = clubRepository.findById(signupRequest.getClubId())
                    .orElseThrow(() -> new RuntimeException("Club not found"));
            user.setClub(club);
        }
        
        return userRepository.save(user);
    }
    
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
