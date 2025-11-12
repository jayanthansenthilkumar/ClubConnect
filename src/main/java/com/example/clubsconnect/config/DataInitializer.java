package com.example.clubsconnect.config;

import com.example.clubsconnect.model.Club;
import com.example.clubsconnect.model.Event;
import com.example.clubsconnect.model.Member;
import com.example.clubsconnect.model.User;
import com.example.clubsconnect.repository.ClubRepository;
import com.example.clubsconnect.repository.EventRepository;
import com.example.clubsconnect.repository.MemberRepository;
import com.example.clubsconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private ClubRepository clubRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (clubRepository.count() == 0) {
            System.out.println("Initializing sample data...");
            
            Club techClub = new Club();
            techClub.setName("Tech Innovation Club");
            techClub.setDescription("A club for technology enthusiasts and innovators");
            techClub.setCategory("Technology");
            techClub.setPresident("John Doe");
            techClub.setEmail("tech@clubsconnect.com");
            techClub.setPhone("123-456-7890");
            techClub.setMeetingSchedule("Every Friday 5 PM");
            techClub = clubRepository.save(techClub);
            
            Club sportsClub = new Club();
            sportsClub.setName("Basketball Club");
            sportsClub.setDescription("For basketball lovers and players");
            sportsClub.setCategory("Sports");
            sportsClub.setPresident("Jane Smith");
            sportsClub.setEmail("basketball@clubsconnect.com");
            sportsClub.setPhone("123-456-7891");
            sportsClub.setMeetingSchedule("Every Tuesday and Thursday 6 PM");
            sportsClub = clubRepository.save(sportsClub);
            
            Club artsClub = new Club();
            artsClub.setName("Creative Arts Society");
            artsClub.setDescription("Exploring creativity through various art forms");
            artsClub.setCategory("Arts");
            artsClub.setPresident("Alice Johnson");
            artsClub.setEmail("arts@clubsconnect.com");
            artsClub.setPhone("123-456-7892");
            artsClub.setMeetingSchedule("Every Wednesday 4 PM");
            artsClub = clubRepository.save(artsClub);
            
            Member member1 = new Member();
            member1.setName("Bob Wilson");
            member1.setEmail("bob@example.com");
            member1.setPhone("555-0001");
            member1.setRole("Vice President");
            member1.setClub(techClub);
            memberRepository.save(member1);
            
            Member member2 = new Member();
            member2.setName("Carol Davis");
            member2.setEmail("carol@example.com");
            member2.setPhone("555-0002");
            member2.setRole("Treasurer");
            member2.setClub(techClub);
            memberRepository.save(member2);
            
            Member member3 = new Member();
            member3.setName("David Brown");
            member3.setEmail("david@example.com");
            member3.setPhone("555-0003");
            member3.setRole("Team Captain");
            member3.setClub(sportsClub);
            memberRepository.save(member3);
            
            Event event1 = new Event();
            event1.setTitle("Hackathon 2025");
            event1.setDescription("24-hour coding competition");
            event1.setEventDate(LocalDateTime.now().plusDays(15));
            event1.setLocation("Tech Building Room 301");
            event1.setStatus("SCHEDULED");
            event1.setClub(techClub);
            eventRepository.save(event1);
            
            Event event2 = new Event();
            event2.setTitle("Basketball Tournament");
            event2.setDescription("Inter-club basketball competition");
            event2.setEventDate(LocalDateTime.now().plusDays(7));
            event2.setLocation("Main Sports Hall");
            event2.setStatus("SCHEDULED");
            event2.setClub(sportsClub);
            eventRepository.save(event2);
            
            Event event3 = new Event();
            event3.setTitle("Art Exhibition");
            event3.setDescription("Showcase of student artwork");
            event3.setEventDate(LocalDateTime.now().plusDays(30));
            event3.setLocation("Gallery Hall");
            event3.setStatus("SCHEDULED");
            event3.setClub(artsClub);
            eventRepository.save(event3);
            
            System.out.println("Sample clubs, members, and events created!");
        }
        
        // Initialize default users if none exist
        if (userRepository.count() == 0) {
            System.out.println("Initializing default users...");
            
            // Create Overall Club Head
            User overallHead = new User();
            overallHead.setUsername("admin");
            overallHead.setEmail("admin@clubsconnect.com");
            overallHead.setPassword(passwordEncoder.encode("admin123"));
            overallHead.setFullName("Admin User");
            overallHead.setRole(User.UserRole.OVERALL_CLUB_HEAD);
            overallHead.setPhoneNumber("999-999-9999");
            overallHead.setDepartment("Administration");
            overallHead.setActive(true);
            userRepository.save(overallHead);
            
            // Create Club Coordinators for each club
            Club techClub = clubRepository.findByCategory("Technology").stream().findFirst().orElse(null);
            if (techClub != null) {
                User techCoordinator = new User();
                techCoordinator.setUsername("tech_coordinator");
                techCoordinator.setEmail("coordinator@techclub.com");
                techCoordinator.setPassword(passwordEncoder.encode("tech123"));
                techCoordinator.setFullName("Tech Coordinator");
                techCoordinator.setRole(User.UserRole.CLUB_COORDINATOR);
                techCoordinator.setClub(techClub);
                techCoordinator.setPhoneNumber("111-111-1111");
                techCoordinator.setDepartment("Technology");
                techCoordinator.setActive(true);
                userRepository.save(techCoordinator);
                
                // Create Club President for Tech Club
                User techPresident = new User();
                techPresident.setUsername("john_doe");
                techPresident.setEmail("john@techclub.com");
                techPresident.setPassword(passwordEncoder.encode("president123"));
                techPresident.setFullName("John Doe");
                techPresident.setRole(User.UserRole.CLUB_PRESIDENT);
                techPresident.setClub(techClub);
                techPresident.setPhoneNumber("123-456-7890");
                techPresident.setDepartment("Computer Science");
                techPresident.setActive(true);
                userRepository.save(techPresident);
            }
            
            Club sportsClub = clubRepository.findByCategory("Sports").stream().findFirst().orElse(null);
            if (sportsClub != null) {
                User sportsCoordinator = new User();
                sportsCoordinator.setUsername("sports_coordinator");
                sportsCoordinator.setEmail("coordinator@sportsclub.com");
                sportsCoordinator.setPassword(passwordEncoder.encode("sports123"));
                sportsCoordinator.setFullName("Sports Coordinator");
                sportsCoordinator.setRole(User.UserRole.CLUB_COORDINATOR);
                sportsCoordinator.setClub(sportsClub);
                sportsCoordinator.setPhoneNumber("222-222-2222");
                sportsCoordinator.setDepartment("Physical Education");
                sportsCoordinator.setActive(true);
                userRepository.save(sportsCoordinator);
                
                // Create Club President for Sports Club
                User sportsPresident = new User();
                sportsPresident.setUsername("jane_smith");
                sportsPresident.setEmail("jane@sportsclub.com");
                sportsPresident.setPassword(passwordEncoder.encode("president123"));
                sportsPresident.setFullName("Jane Smith");
                sportsPresident.setRole(User.UserRole.CLUB_PRESIDENT);
                sportsPresident.setClub(sportsClub);
                sportsPresident.setPhoneNumber("123-456-7891");
                sportsPresident.setDepartment("Sports Management");
                sportsPresident.setActive(true);
                userRepository.save(sportsPresident);
            }
            
            Club artsClub = clubRepository.findByCategory("Arts").stream().findFirst().orElse(null);
            if (artsClub != null) {
                User artsCoordinator = new User();
                artsCoordinator.setUsername("arts_coordinator");
                artsCoordinator.setEmail("coordinator@artsclub.com");
                artsCoordinator.setPassword(passwordEncoder.encode("arts123"));
                artsCoordinator.setFullName("Arts Coordinator");
                artsCoordinator.setRole(User.UserRole.CLUB_COORDINATOR);
                artsCoordinator.setClub(artsClub);
                artsCoordinator.setPhoneNumber("333-333-3333");
                artsCoordinator.setDepartment("Fine Arts");
                artsCoordinator.setActive(true);
                userRepository.save(artsCoordinator);
                
                // Create Club President for Arts Club
                User artsPresident = new User();
                artsPresident.setUsername("alice_johnson");
                artsPresident.setEmail("alice@artsclub.com");
                artsPresident.setPassword(passwordEncoder.encode("president123"));
                artsPresident.setFullName("Alice Johnson");
                artsPresident.setRole(User.UserRole.CLUB_PRESIDENT);
                artsPresident.setClub(artsClub);
                artsPresident.setPhoneNumber("123-456-7892");
                artsPresident.setDepartment("Visual Arts");
                artsPresident.setActive(true);
                userRepository.save(artsPresident);
            }
            
            System.out.println("Default users created!");
            System.out.println("=== Login Credentials ===");
            System.out.println("Overall Club Head: admin / admin123");
            System.out.println("Tech Coordinator: tech_coordinator / tech123");
            System.out.println("Tech President: john_doe / president123");
            System.out.println("Sports Coordinator: sports_coordinator / sports123");
            System.out.println("Sports President: jane_smith / president123");
            System.out.println("Arts Coordinator: arts_coordinator / arts123");
            System.out.println("Arts President: alice_johnson / president123");
            System.out.println("========================");
        }
    }
}
