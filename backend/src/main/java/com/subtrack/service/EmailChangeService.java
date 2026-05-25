package com.subtrack.service;

import com.subtrack.entity.EmailChangeToken;
import com.subtrack.entity.User;
import com.subtrack.repository.EmailChangeTokenRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailChangeService {
  private final UserRepository userRepository;
  private final EmailChangeTokenRepository tokenRepository;
  private final EmailService emailService;

  public void requestEmailChange(Long userId, String newEmail) {
    if (userRepository.existsByEmail(newEmail)) {
      throw new IllegalArgumentException("Email already in use");
    }

    User user = userRepository.findById(userId).orElseThrow();

    EmailChangeToken token = new EmailChangeToken();
    token.setToken(UUID.randomUUID().toString());
    token.setUser(user);
    token.setNewEmail(newEmail);
    token.setExpiresAt(LocalDateTime.now().plusHours(1));
    tokenRepository.save(token);

    emailService.sendEmailChangeConfirmation(newEmail, token.getToken(), newEmail);
  }

  @Transactional
  public void confirmEmailChange(String tokenStr) {
    EmailChangeToken token = tokenRepository.findByToken(tokenStr)
            .filter(EmailChangeToken::isValid)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

    User user = userRepository.findById(token.getUser().getId()).orElseThrow();
    user.setEmail(token.getNewEmail());
    userRepository.save(user);

    token.setUsed(true);
    tokenRepository.save(token);
  }

  @Scheduled(cron = "0 45 3 * * *") // every day at 3:45 AM
  public void cleanupExpiredTokens() {
    tokenRepository.deleteExpiredAndUsed(LocalDateTime.now());
  }
}