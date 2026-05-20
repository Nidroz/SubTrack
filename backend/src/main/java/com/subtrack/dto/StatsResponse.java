package com.subtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StatsResponse {
  private long total;
  private long watching;
  private long completed;
  private double avgScore;
}
