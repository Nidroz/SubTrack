package com.subtrack.entity;

public enum ContentFilter {
  SAFE,   // sfw=true — no explicit content
  ALL,    // no filter
  NSFW    // explicit only (search: rating=rx, discover: genre-based)
}
