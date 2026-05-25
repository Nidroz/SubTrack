package com.subtrack.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * handles all outgoing emails — runs async to not block request threads.
 */
@Service
@RequiredArgsConstructor
public class EmailService {
  private final JavaMailSender mailSender;

  @Value("${app.mail.from}")
  private String from;

  @Value("${app.frontend.url}")
  private String frontendUrl;

  @Async
  public void sendPasswordResetEmail(String to, String token) {
    String link = frontendUrl + "/reset-password?token=" + token;
    String subject = "Reset your SubTrack password";
    String body = """
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #e85d75;">SubTrack</h2>
                    <p>You requested a password reset. Click the button below to set a new password.</p>
                    <a href="%s" style="display: inline-block; background: #e85d75; color: white;
                        padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Reset password
                    </a>
                    <p style="color: #888; font-size: 13px; margin-top: 24px;">
                        This link expires in 1 hour. If you didn't request this, ignore this email.
                    </p>
                </div>
                """.formatted(link);
    send(to, subject, body);
  }

  @Async
  public void sendEmailChangeConfirmation(String to, String token, String newEmail) {
    String link = frontendUrl + "/confirm-email?token=" + token;
    String subject = "Confirm your new SubTrack email";
    String body = """
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #e85d75;">SubTrack</h2>
                    <p>You requested to change your email to <strong>%s</strong>.</p>
                    <p>Click the button below to confirm this change.</p>
                    <a href="%s" style="display: inline-block; background: #e85d75; color: white;
                        padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Confirm new email
                    </a>
                    <p style="color: #888; font-size: 13px; margin-top: 24px;">
                        This link expires in 1 hour. If you didn't request this, ignore this email.
                    </p>
                </div>
                """.formatted(newEmail, link);
    send(to, subject, body);
  }

  private void send(String to, String subject, String htmlBody) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(from);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(htmlBody, true);
      mailSender.send(message);
    } catch (Exception e) {
      // log but don't propagate — email failure shouldn't crash the request
      System.err.println("Failed to send email to " + to + ": " + e.getMessage());
    }
  }
}