package com.example.clubsconnect.service;

import com.example.clubsconnect.model.Event;
import com.example.clubsconnect.model.EventAttendance;
import com.example.clubsconnect.repository.EventAttendanceRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PDFService {
    
    @Autowired
    private EventAttendanceRepository attendanceRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
    
    public byte[] generatePreEventReport(Event event) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                float yPosition = 750;
                float margin = 50;
                float fontSize = 12;
                
                // Title
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Pre-Event Report");
                contentStream.endText();
                yPosition -= 30;
                
                // Event Details
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Event: " + event.getTitle());
                contentStream.endText();
                yPosition -= 25;
                
                contentStream.setFont(PDType1Font.HELVETICA, fontSize);
                
                // Date
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Date: " + event.getEventDate().format(DATE_FORMATTER));
                contentStream.endText();
                yPosition -= 20;
                
                // Location
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Location: " + (event.getLocation() != null ? event.getLocation() : "TBA"));
                contentStream.endText();
                yPosition -= 20;
                
                // Club
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Club: " + event.getClub().getName());
                contentStream.endText();
                yPosition -= 20;
                
                // Status
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Status: " + event.getStatus());
                contentStream.endText();
                yPosition -= 30;
                
                // Description
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, fontSize);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Description:");
                contentStream.endText();
                yPosition -= 20;
                
                contentStream.setFont(PDType1Font.HELVETICA, fontSize);
                if (event.getDescription() != null) {
                    String[] descLines = wrapText(event.getDescription(), 80);
                    for (String line : descLines) {
                        contentStream.beginText();
                        contentStream.newLineAtOffset(margin, yPosition);
                        contentStream.showText(line);
                        contentStream.endText();
                        yPosition -= 15;
                    }
                }
                yPosition -= 15;
                
                // Pre-Event Report Details
                if (event.getPreEventReport() != null && !event.getPreEventReport().isEmpty()) {
                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, fontSize);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Pre-Event Analysis:");
                    contentStream.endText();
                    yPosition -= 20;
                    
                    contentStream.setFont(PDType1Font.HELVETICA, fontSize);
                    String[] reportLines = wrapText(event.getPreEventReport(), 80);
                    for (String line : reportLines) {
                        contentStream.beginText();
                        contentStream.newLineAtOffset(margin, yPosition);
                        contentStream.showText(line);
                        contentStream.endText();
                        yPosition -= 15;
                    }
                }
                yPosition -= 15;
                
                // Budget Information
                if (event.getBudget() != null) {
                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, fontSize);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Budget Information:");
                    contentStream.endText();
                    yPosition -= 20;
                    
                    contentStream.setFont(PDType1Font.HELVETICA, fontSize);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Allocated Budget: $" + String.format("%.2f", event.getBudget()));
                    contentStream.endText();
                    yPosition -= 20;
                }
                
                // Footer
                yPosition = 50;
                contentStream.setFont(PDType1Font.HELVETICA_OBLIQUE, 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Generated on: " + LocalDateTime.now().format(DATE_FORMATTER));
                contentStream.endText();
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    public byte[] generatePostEventReport(Event event) throws IOException {
        List<EventAttendance> attendances = attendanceRepository.findByEventId(event.getId());
        
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                float yPosition = 750;
                float margin = 50;
                float fontSize = 12;
                
                // Title
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Post-Event Report");
                contentStream.endText();
                yPosition -= 30;
                
                // Event Details
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Event: " + event.getTitle());
                contentStream.endText();
                yPosition -= 25;
                
                contentStream.setFont(PDType1Font.HELVETICA, fontSize);
                
                // Date
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Date: " + event.getEventDate().format(DATE_FORMATTER));
                contentStream.endText();
                yPosition -= 20;
                
                // Location
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Location: " + (event.getLocation() != null ? event.getLocation() : "TBA"));
                contentStream.endText();
                yPosition -= 20;
                
                // Club
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Club: " + event.getClub().getName());
                contentStream.endText();
                yPosition -= 30;
                
                // Attendance Statistics
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, fontSize);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Attendance Statistics:");
                contentStream.endText();
                yPosition -= 20;
                
                contentStream.setFont(PDType1Font.HELVETICA, fontSize);
                long presentCount = attendanceRepository.countByEventIdAndStatus(event.getId(), EventAttendance.AttendanceStatus.PRESENT);
                long absentCount = attendanceRepository.countByEventIdAndStatus(event.getId(), EventAttendance.AttendanceStatus.ABSENT);
                long lateCount = attendanceRepository.countByEventIdAndStatus(event.getId(), EventAttendance.AttendanceStatus.LATE);
                
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Total Participants: " + (event.getParticipantsCount() != null ? event.getParticipantsCount() : attendances.size()));
                contentStream.endText();
                yPosition -= 18;
                
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Present: " + presentCount);
                contentStream.endText();
                yPosition -= 18;
                
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Absent: " + absentCount);
                contentStream.endText();
                yPosition -= 18;
                
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Late: " + lateCount);
                contentStream.endText();
                yPosition -= 30;
                
                // Financial Summary
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, fontSize);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Financial Summary:");
                contentStream.endText();
                yPosition -= 20;
                
                contentStream.setFont(PDType1Font.HELVETICA, fontSize);
                if (event.getBudget() != null) {
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Allocated Budget: $" + String.format("%.2f", event.getBudget()));
                    contentStream.endText();
                    yPosition -= 18;
                }
                
                if (event.getActualExpense() != null) {
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Actual Expense: $" + String.format("%.2f", event.getActualExpense()));
                    contentStream.endText();
                    yPosition -= 18;
                    
                    if (event.getBudget() != null) {
                        double variance = event.getBudget() - event.getActualExpense();
                        contentStream.beginText();
                        contentStream.newLineAtOffset(margin, yPosition);
                        contentStream.showText("Variance: $" + String.format("%.2f", variance) + 
                            (variance >= 0 ? " (Under Budget)" : " (Over Budget)"));
                        contentStream.endText();
                        yPosition -= 25;
                    }
                }
                
                // Post-Event Analysis
                if (event.getPostEventReport() != null && !event.getPostEventReport().isEmpty()) {
                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, fontSize);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Post-Event Analysis:");
                    contentStream.endText();
                    yPosition -= 20;
                    
                    contentStream.setFont(PDType1Font.HELVETICA, fontSize);
                    String[] reportLines = wrapText(event.getPostEventReport(), 80);
                    for (String line : reportLines) {
                        if (yPosition < 100) break; // Prevent overflow
                        contentStream.beginText();
                        contentStream.newLineAtOffset(margin, yPosition);
                        contentStream.showText(line);
                        contentStream.endText();
                        yPosition -= 15;
                    }
                }
                
                // Footer
                yPosition = 50;
                contentStream.setFont(PDType1Font.HELVETICA_OBLIQUE, 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Generated on: " + LocalDateTime.now().format(DATE_FORMATTER));
                contentStream.endText();
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    private String[] wrapText(String text, int maxCharsPerLine) {
        if (text == null || text.isEmpty()) {
            return new String[0];
        }
        
        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();
        StringBuilder result = new StringBuilder();
        
        for (String word : words) {
            if (line.length() + word.length() + 1 > maxCharsPerLine) {
                result.append(line).append("\n");
                line = new StringBuilder(word);
            } else {
                if (line.length() > 0) {
                    line.append(" ");
                }
                line.append(word);
            }
        }
        
        if (line.length() > 0) {
            result.append(line);
        }
        
        return result.toString().split("\n");
    }
}
