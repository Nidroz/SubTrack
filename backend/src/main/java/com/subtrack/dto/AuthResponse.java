package com.subtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
  private String accessToken;
  private String refreshToken;
  private String username;
  // access token TTL in seconds for frontend convenience
  private long expiresIn;
}