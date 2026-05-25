package com.subtrack.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class ProfileStatsResponse {
  private long total;
  private long watching;
  private long completed;
  private long planToWatch;
  private long dropped;
  private long onHold;
  private Double avgScore;

  // by type
  private long totalAnime;
  private long totalManga;

  // estimated time (episodes * 24min average)
  private long estimatedMinutes;

  private Map<Integer, Long> scoreDistribution;

  private List<String> topGenres;
}