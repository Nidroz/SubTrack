package com.subtrack.entity;

public class UserMedia {
  public enum MediaType {
    ANIME, MANGA
  }

  private Long id;
  private User user;
  private MediaType mediaType;
  private Long mediaId; // ID from Jikan API
  private String title;
  private String status; // e.g., "Watching", "Completed", "Plan to Watch"
  private Integer score;

  // Getters and setters omitted for brevity
}
