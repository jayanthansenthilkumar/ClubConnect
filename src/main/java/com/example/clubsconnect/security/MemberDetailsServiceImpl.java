package com.example.clubsconnect.security;

import com.example.clubsconnect.model.Member;
import com.example.clubsconnect.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Member not found with username: " + username));
        
        return MemberDetailsImpl.build(member);
    }
}
