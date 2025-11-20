package com.example.clubsconnect.config;

import com.example.clubsconnect.security.AuthEntryPointJwt;
import com.example.clubsconnect.security.AuthTokenFilter;
import com.example.clubsconnect.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;
    
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - no authentication required
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/member/login").permitAll()
                .requestMatchers("/", "/login", "/clubconnect", "/member-login", "/member-portal").permitAll()
                .requestMatchers("/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
                .requestMatchers("/api/clubs", "/api/clubs/**").permitAll()
                .requestMatchers("/api/events", "/api/events/**").permitAll()
                
                // Club endpoints - role-based access
                .requestMatchers("/api/clubs/*/").hasAnyRole("ADMIN", "CLUB_COORDINATOR", "CLUB_PRESIDENT", "MEMBER")
                .requestMatchers("/api/clubs").hasAnyRole("ADMIN", "CLUB_COORDINATOR", "CLUB_PRESIDENT", "MEMBER")
                .requestMatchers("/api/clubs/category/**").hasAnyRole("ADMIN", "CLUB_COORDINATOR", "CLUB_PRESIDENT", "MEMBER")
                .requestMatchers("/api/clubs/search").hasAnyRole("ADMIN", "CLUB_COORDINATOR", "CLUB_PRESIDENT", "MEMBER")
                
                // Event endpoints - role-based access
                .requestMatchers("/api/events/pending-approval").hasAnyRole("ADMIN", "CLUB_COORDINATOR")
                .requestMatchers("/api/events/*/approve").hasAnyRole("ADMIN", "CLUB_COORDINATOR")
                .requestMatchers("/api/events/*/reject").hasAnyRole("ADMIN", "CLUB_COORDINATOR")
                
                // Member portal endpoints - member access only
                .requestMatchers("/api/member/profile").hasRole("MEMBER")
                .requestMatchers("/api/member/change-password").hasRole("MEMBER")
                .requestMatchers("/api/member/events/**").hasRole("MEMBER")
                .requestMatchers("/api/member/attendance/**").hasRole("MEMBER")
                .requestMatchers("/api/member/winners/**").hasRole("MEMBER")
                
                // All other API endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                
                // Any other request
                .anyRequest().permitAll()
            );
        
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
