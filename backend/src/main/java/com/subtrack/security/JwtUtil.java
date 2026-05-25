package com.subtrack.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.HexFormat;

@Component
public class JwtUtil {
  @Value("${app.jwt.secret}")
  private String secret;

  @Value("${app.jwt.expiration-ms}")
  private long expirationMs;

  private SecretKey key() {
    return Keys.hmacShaKeyFor(secret.getBytes());
  }

  public String generate(String username) {
    return Jwts.builder()
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(key())
            .compact();
  }

  public String extractUsername(String token) {
    return Jwts.parser()
            .verifyWith(key()).build()
            .parseSignedClaims(token)
            .getPayload().getSubject();
  }

  public Date extractExpiration(String token) {
    return Jwts.parser()
            .verifyWith(key()).build()
            .parseSignedClaims(token)
            .getPayload().getExpiration();
  }

  public boolean isValid(String token) {
    try {
      Jwts.parser().verifyWith(key()).build().parseSignedClaims(token);
      return true;
    } catch (JwtException e) {
      return false;
    }
  }

  public long getExpirationMs() {
    return expirationMs;
  }

  /** sha-256 hash of the token — stored in blacklist instead of raw token */
  public String hash(String token) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] bytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(bytes);
    } catch (Exception e) {
      throw new RuntimeException("Failed to hash token", e);
    }
  }
}