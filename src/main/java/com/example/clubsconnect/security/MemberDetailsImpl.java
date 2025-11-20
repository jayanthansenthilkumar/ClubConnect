package com.example.clubsconnect.security;

import com.example.clubsconnect.model.Member;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Data
@AllArgsConstructor
public class MemberDetailsImpl implements UserDetails {
    
    private Long id;
    private String username;
    private String email;
    private String name;
    private Long clubId;
    
    @JsonIgnore
    private String password;
    
    private Member.MembershipStatus membershipStatus;
    
    public static MemberDetailsImpl build(Member member) {
        return new MemberDetailsImpl(
                member.getId(),
                member.getUsername(),
                member.getEmail(),
                member.getName(),
                member.getClub().getId(),
                member.getPassword(),
                member.getMembershipStatus()
        );
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Members always have ROLE_MEMBER authority
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_MEMBER")
        );
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return membershipStatus == Member.MembershipStatus.ACTIVE;
    }
}
