package com.subtrack.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_change_tokens")
@Getter @Setter @NoArgsConstructor
public class EmailChangeToken {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String token;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  // new email to switch to after confirmation
  @Column(nullable = false)
  private String newEmail;

  @Column(nullable = false)
  private LocalDateTime expiresAt;

  private boolean used = false;
  private LocalDateTime createdAt = LocalDateTime.now();

  public boolean isValid() {
    return !used && LocalDateTime.now().isBefore(expiresAt);
  }
}