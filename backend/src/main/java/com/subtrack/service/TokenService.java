package com.subtrack.service;

import com.subtrack.entity.BlacklistedToken;
import com.subtrack.entity.RefreshToken;
import com.subtrack.entity.User;
import com.subtrack.repository.BlacklistedTokenRepository;
import com.subtrack.repository.RefreshTokenRepository;
import com.subtrack.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {
  private final RefreshTokenRepository refreshTokenRepository;
  private final BlacklistedTokenRepository blacklistedTokenRepository;
  private final JwtUtil jwtUtil;

  @Value("${app.jwt.refresh-expiration-days:30}")
  private int refreshExpirationDays;

  // refresh tokens
  public RefreshToken createRefreshToken(User user) {
    RefreshToken token = new RefreshToken();
    token.setToken(UUID.randomUUID().toString());
    token.setUser(user);
    token.setExpiresAt(LocalDateTime.now().plusDays(refreshExpirationDays));
    return refreshTokenRepository.save(token);
  }

  public RefreshToken validateRefreshToken(String token) {
    return refreshTokenRepository.findByToken(token)
            .filter(RefreshToken::isValid)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired refresh token"));
  }

  public void revokeRefreshToken(String token) {
    refreshTokenRepository.findByToken(token).ifPresent(rt -> {
      rt.setRevoked(true);
      refreshTokenRepository.save(rt);
    });
  }

  public void revokeAllUserTokens(Long userId) {
    refreshTokenRepository.revokeAllByUserId(userId);
  }

  // access token blacklist
  public void blacklistAccessToken(String accessToken) {
    if (!jwtUtil.isValid(accessToken)) return;
    BlacklistedToken bt = new BlacklistedToken();
    bt.setTokenHash(jwtUtil.hash(accessToken));
    bt.setExpiresAt(jwtUtil.extractExpiration(accessToken)
            .toInstant()
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime());
    blacklistedTokenRepository.save(bt);
  }

  public boolean isAccessTokenBlacklisted(String token) {
    return blacklistedTokenRepository.existsByTokenHash(jwtUtil.hash(token));
  }

  @Scheduled(cron = "0 0 3 * * *")  // run daily at 3am
  public void cleanupExpiredTokens() {
    LocalDateTime now = LocalDateTime.now();
    refreshTokenRepository.deleteExpiredAndRevoked(now);
    blacklistedTokenRepository.deleteExpired(now);
  }
}