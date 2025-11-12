package com.example.clubsconnect;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
@SpringBootApplication
@EnableJpaRepositories
public class ClubsconnectApplication {
	public static void main(String[] args) {
		SpringApplication.run(ClubsconnectApplication.class, args);
		System.out.println("========================================");
		System.out.println("ClubsConnect Application Started!");
		System.out.println("Access the application at: http://localhost:8080");
		System.out.println("========================================");
	}
}