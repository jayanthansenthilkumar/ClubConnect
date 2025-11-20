package com.example.clubsconnect.service;

import com.example.clubsconnect.model.User;
import com.example.clubsconnect.repository.UserRepository;
import com.example.clubsconnect.security.MemberDetailsImpl;
import com.example.clubsconnect.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AccessControlService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Check if current user is authenticated
     */
    public boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal());
    }
    
    /**
     * Check if current user is a system admin
     */
    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
    
    /**
     * Check if current user is a club coordinator
     */
    public boolean isCoordinator() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CLUB_COORDINATOR"));
    }
    
    /**
     * Check if current user is a club president
     */
    public boolean isPresident() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CLUB_PRESIDENT"));
    }
    
    /**
     * Check if current user is a member
     */
    public boolean isMember() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MEMBER"));
    }
    
    /**
     * Check if current user has access to a specific club
     * Admins can access all clubs
     * Coordinators, presidents, and members can only access their own club
     */
    public boolean canAccessClub(Long clubId) {
        if (!isAuthenticated()) {
            return false;
        }
        
        // Admins can access all clubs
        if (isAdmin()) {
            return true;
        }
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth.getPrincipal();
        
        // Check for User (Coordinator/President)
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            User user = userRepository.findById(userDetails.getId()).orElse(null);
            if (user != null && user.getClub() != null) {
                return user.getClub().getId().equals(clubId);
            }
        }
        
        // Check for Member
        if (principal instanceof MemberDetailsImpl) {
            MemberDetailsImpl memberDetails = (MemberDetailsImpl) principal;
            return memberDetails.getClubId().equals(clubId);
        }
        
        return false;
    }
    
    /**
     * Check if current user can create events
     * Only admins, coordinators, and presidents can create events
     */
    public boolean canCreateEvent() {
        return isAdmin() || isCoordinator() || isPresident();
    }
    
    /**
     * Check if current user can approve events
     * Only admins and coordinators can approve events
     */
    public boolean canApproveEvent() {
        return isAdmin() || isCoordinator();
    }
    
    /**
     * Check if current user can manage members
     * Only admins, coordinators, and presidents can manage members
     */
    public boolean canManageMembers() {
        return isAdmin() || isCoordinator() || isPresident();
    }
    
    /**
     * Check if current user can delete members
     * Only admins and coordinators can delete members
     */
    public boolean canDeleteMembers() {
        return isAdmin() || isCoordinator();
    }
    
    /**
     * Check if current user can create/update attendance
     * Only admins, coordinators, and presidents can manage attendance
     */
    public boolean canManageAttendance() {
        return isAdmin() || isCoordinator() || isPresident();
    }
    
    /**
     * Check if current user can manage winners
     * Only admins, coordinators, and presidents can manage winners
     */
    public boolean canManageWinners() {
        return isAdmin() || isCoordinator() || isPresident();
    }
    
    /**
     * Get the club ID of the current authenticated user
     * Returns null if user is not associated with a club or is a member
     */
    public Long getCurrentUserClubId() {
        if (!isAuthenticated()) {
            return null;
        }
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth.getPrincipal();
        
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            User user = userRepository.findById(userDetails.getId()).orElse(null);
            if (user != null && user.getClub() != null) {
                return user.getClub().getId();
            }
        }
        
        if (principal instanceof MemberDetailsImpl) {
            MemberDetailsImpl memberDetails = (MemberDetailsImpl) principal;
            return memberDetails.getClubId();
        }
        
        return null;
    }
    
    /**
     * Get the current authenticated username
     */
    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return null;
    }
}
