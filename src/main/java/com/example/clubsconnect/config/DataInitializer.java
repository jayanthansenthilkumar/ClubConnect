package com.example.clubsconnect.config;

import com.example.clubsconnect.model.Club;
import com.example.clubsconnect.model.Event;
import com.example.clubsconnect.model.Member;
import com.example.clubsconnect.repository.ClubRepository;
import com.example.clubsconnect.repository.EventRepository;
import com.example.clubsconnect.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
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
            
            System.out.println("Sample data initialized successfully!");
        }
    }
}
