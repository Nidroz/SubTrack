package com.subtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GlobalStatsResponse {
  private long totalUsers;
  private long totalEntries;
  private long totalCachedMedia;
}
