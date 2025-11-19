package com.example.clubsconnect.service;

import com.example.clubsconnect.model.Event;
import com.example.clubsconnect.model.Member;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@clubconnect.com}")
    private String fromEmail;
    
    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the transaction
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }
    
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send HTML email to " + to + ": " + e.getMessage());
        }
    }
    
    @Async
    public void sendEventCreatedNotification(Event event, List<Member> members) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String eventDate = event.getEventDate().format(formatter);
        
        String subject = "New Event: " + event.getTitle();
        
        for (Member member : members) {
            String htmlBody = buildEventCreatedEmail(member.getName(), event.getTitle(), 
                event.getDescription(), eventDate, event.getLocation());
            
            try {
                sendHtmlEmail(member.getEmail(), subject, htmlBody);
            } catch (MessagingException e) {
                System.err.println("Failed to send event notification to " + member.getEmail());
            }
        }
    }
    
    @Async
    public void sendEventApprovedNotification(Event event, List<Member> members) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String eventDate = event.getEventDate().format(formatter);
        
        String subject = "Event Approved: " + event.getTitle();
        
        for (Member member : members) {
            String htmlBody = buildEventApprovedEmail(member.getName(), event.getTitle(), 
                eventDate, event.getLocation());
            
            try {
                sendHtmlEmail(member.getEmail(), subject, htmlBody);
            } catch (MessagingException e) {
                System.err.println("Failed to send event approval notification to " + member.getEmail());
            }
        }
    }
    
    @Async
    public void sendMemberWelcomeEmail(Member member, String temporaryPassword) {
        String subject = "Welcome to " + member.getClub().getName() + " - ClubConnect";
        
        String htmlBody = buildWelcomeEmail(member.getName(), member.getClub().getName(), 
            member.getUsername(), temporaryPassword);
        
        try {
            sendHtmlEmail(member.getEmail(), subject, htmlBody);
        } catch (MessagingException e) {
            System.err.println("Failed to send welcome email to " + member.getEmail());
        }
    }
    
    @Async
    public void sendEventReminderNotification(Event event, List<Member> members) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String eventDate = event.getEventDate().format(formatter);
        
        String subject = "Reminder: " + event.getTitle() + " - Tomorrow!";
        
        for (Member member : members) {
            String htmlBody = buildEventReminderEmail(member.getName(), event.getTitle(), 
                eventDate, event.getLocation());
            
            try {
                sendHtmlEmail(member.getEmail(), subject, htmlBody);
            } catch (MessagingException e) {
                System.err.println("Failed to send event reminder to " + member.getEmail());
            }
        }
    }
    
    private String buildEventCreatedEmail(String memberName, String eventTitle, 
            String description, String eventDate, String location) {
        return "<html><body style='font-family: Arial, sans-serif;'>" +
               "<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;'>" +
               "<h2 style='color: #2c3e50;'>New Event Announcement</h2>" +
               "<p>Dear " + memberName + ",</p>" +
               "<p>A new event has been created in your club:</p>" +
               "<div style='background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
               "<h3 style='color: #3498db; margin-top: 0;'>" + eventTitle + "</h3>" +
               "<p><strong>Description:</strong> " + description + "</p>" +
               "<p><strong>Date & Time:</strong> " + eventDate + "</p>" +
               "<p><strong>Location:</strong> " + location + "</p>" +
               "</div>" +
               "<p>We look forward to seeing you there!</p>" +
               "<p>Best regards,<br>ClubConnect Team</p>" +
               "</div></body></html>";
    }
    
    private String buildEventApprovedEmail(String memberName, String eventTitle, 
            String eventDate, String location) {
        return "<html><body style='font-family: Arial, sans-serif;'>" +
               "<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;'>" +
               "<h2 style='color: #27ae60;'>Event Approved ✓</h2>" +
               "<p>Dear " + memberName + ",</p>" +
               "<p>Great news! The following event has been approved:</p>" +
               "<div style='background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
               "<h3 style='color: #27ae60; margin-top: 0;'>" + eventTitle + "</h3>" +
               "<p><strong>Date & Time:</strong> " + eventDate + "</p>" +
               "<p><strong>Location:</strong> " + location + "</p>" +
               "</div>" +
               "<p>Mark your calendar and don't miss out!</p>" +
               "<p>Best regards,<br>ClubConnect Team</p>" +
               "</div></body></html>";
    }
    
    private String buildWelcomeEmail(String memberName, String clubName, 
            String username, String temporaryPassword) {
        return "<html><body style='font-family: Arial, sans-serif;'>" +
               "<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;'>" +
               "<h2 style='color: #3498db;'>Welcome to " + clubName + "!</h2>" +
               "<p>Dear " + memberName + ",</p>" +
               "<p>Congratulations! You have been added as a member of <strong>" + clubName + "</strong>.</p>" +
               "<p>Your login credentials for the ClubConnect member portal:</p>" +
               "<div style='background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
               "<p><strong>Username:</strong> " + username + "</p>" +
               "<p><strong>Temporary Password:</strong> " + temporaryPassword + "</p>" +
               "</div>" +
               "<p style='color: #e74c3c;'><strong>Important:</strong> Please change your password after your first login.</p>" +
               "<p>Through the member portal, you can:</p>" +
               "<ul>" +
               "<li>View upcoming events</li>" +
               "<li>Check past event details and winners</li>" +
               "<li>Track your attendance</li>" +
               "<li>Download event reports</li>" +
               "</ul>" +
               "<p>Welcome aboard!</p>" +
               "<p>Best regards,<br>ClubConnect Team</p>" +
               "</div></body></html>";
    }
    
    private String buildEventReminderEmail(String memberName, String eventTitle, 
            String eventDate, String location) {
        return "<html><body style='font-family: Arial, sans-serif;'>" +
               "<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;'>" +
               "<h2 style='color: #e67e22;'>Event Reminder 🔔</h2>" +
               "<p>Dear " + memberName + ",</p>" +
               "<p>This is a friendly reminder about the upcoming event:</p>" +
               "<div style='background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
               "<h3 style='color: #e67e22; margin-top: 0;'>" + eventTitle + "</h3>" +
               "<p><strong>Date & Time:</strong> " + eventDate + "</p>" +
               "<p><strong>Location:</strong> " + location + "</p>" +
               "</div>" +
               "<p>Don't forget to attend!</p>" +
               "<p>Best regards,<br>ClubConnect Team</p>" +
               "</div></body></html>";
    }
}
