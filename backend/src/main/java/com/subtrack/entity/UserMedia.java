package com.subtrack.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_media", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "media_type", "media_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class UserMedia {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "media_id", nullable = false)
  private Long mediaId;

  @Column(name = "media_type", nullable = false)
  @Enumerated(EnumType.STRING)
  private MediaType mediaType;

  private int progress = 0;

  private int score;

  @Column(columnDefinition = "TEXT")
  private String notes;

  private LocalDateTime updatedAt = LocalDateTime.now();

  @PreUpdate
  public void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
