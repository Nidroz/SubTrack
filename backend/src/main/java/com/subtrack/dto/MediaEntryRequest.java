package com.subtrack.dto;

import com.subtrack.entity.MediaType;
import com.subtrack.entity.WatchStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
public class MediaEntryRequest {
  @NotNull
  private Long mediaId;

  @NotNull
  private MediaType mediaType;

  @NotNull
  private WatchStatus status;

  private int progress = 0;

  @Min(1)
  @Max(10)
  private Integer score;

  private String notes;
}
