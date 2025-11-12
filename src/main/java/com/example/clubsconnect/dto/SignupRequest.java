package com.example.clubsconnect.dto;

import com.example.clubsconnect.model.User.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private UserRole role;
    private Long clubId;
    private String phoneNumber;
    private String department;
}
