package com.subtrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

@Getter
@Setter
public class LoginRequest {
  @NotBlank
  private String username;

  @NotBlank
  private String password;
}
