package com.example.clubsconnect.dto;

import com.example.clubsconnect.model.User.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private UserRole role;
    private Long clubId;
    private String clubName;
    
    public LoginResponse(String token, Long id, String username, String email, 
                        String fullName, UserRole role, Long clubId, String clubName) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.clubId = clubId;
        this.clubName = clubName;
    }
}
