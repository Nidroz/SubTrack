package com.subtrack.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ProfileUpdateRequest {
  @Size(min = 3, max = 30)
  private String username;

  // base64 encoded avatar image (optional)
  private String avatarBase64;

  private Boolean allowExplicit;

}