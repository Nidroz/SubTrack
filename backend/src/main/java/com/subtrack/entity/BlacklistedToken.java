package com.subtrack.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "blacklisted_tokens")
@Getter @Setter @NoArgsConstructor
public class BlacklistedToken {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // store token hash instead of raw token for security
  @Column(nullable = false, unique = true)
  private String tokenHash;

  @Column(nullable = false)
  private LocalDateTime expiresAt;

  private LocalDateTime blacklistedAt = LocalDateTime.now();
}