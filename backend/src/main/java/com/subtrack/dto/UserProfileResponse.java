package com.subtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserProfileResponse {
  private Long id;
  private String username;
  private String email;
  private LocalDateTime createdAt;
  private String avatarUrl;
}
