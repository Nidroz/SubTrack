package com.subtrack.service;

import com.subtrack.entity.PasswordResetToken;
import com.subtrack.entity.User;
import com.subtrack.repository.PasswordResetTokenRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
  private final UserRepository userRepository;
  private final PasswordResetTokenRepository tokenRepository;
  private final EmailService emailService;
  private final PasswordEncoder passwordEncoder;

  /**
   * initiates a password reset — always returns success to avoid email enumeration.
   */
  public void requestReset(String email) {
    userRepository.findByEmail(email).ifPresent(user -> {
      PasswordResetToken token = new PasswordResetToken();
      token.setToken(UUID.randomUUID().toString());
      token.setUser(user);
      token.setExpiresAt(LocalDateTime.now().plusHours(1));
      tokenRepository.save(token);
      emailService.sendPasswordResetEmail(user.getEmail(), token.getToken());
    });
  }

  public void resetPassword(String tokenStr, String newPassword) {
    PasswordResetToken token = tokenRepository.findByToken(tokenStr)
            .filter(PasswordResetToken::isValid)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

    User user = token.getUser();
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    token.setUsed(true);
    tokenRepository.save(token);
  }

  @Scheduled(cron = "0 30 3 * * *")
  public void cleanupExpiredTokens() {
    tokenRepository.deleteExpiredAndUsed(LocalDateTime.now());
  }
}