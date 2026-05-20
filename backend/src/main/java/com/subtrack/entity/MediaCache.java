package com.subtrack.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "media_cache")
@Getter
@Setter
@NoArgsConstructor
public class MediaCache {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long malId;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private MediaType mediaType;

  private String title;
  private String titleEnglish;

  @Column(columnDefinition = "TEXT")
  private String synopsis;

  private String imageUrl;
  private Integer episodes;
  private Integer chapters;
  private String status;

  // stored as a json array string e.g. ["Action","Drama"]
  private String genres;

  private Double score;

  private LocalDateTime cachedAt = LocalDateTime.now();
}
