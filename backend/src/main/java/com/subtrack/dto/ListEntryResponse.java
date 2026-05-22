package com.subtrack.dto;

import com.subtrack.entity.MediaType;
import com.subtrack.entity.UserMedia;
import com.subtrack.entity.WatchStatus;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * flat response dto combining UserMedia + MediaCache fields.
 * avoids exposing JPA entities directly to the client.
 */
@Getter
public class ListEntryResponse {

  private final Long id;
  private final Long mediaId;
  private final MediaType mediaType;
  private final WatchStatus status;
  private final int progress;
  private final Integer score;
  private final String notes;
  private final LocalDateTime updatedAt;

  // from media_cache
  private final String title;
  private final String titleEnglish;
  private final String imageUrl;
  private final Integer episodes;
  private final Integer chapters;
  private final Double apiScore;
  private final String genres;

  public ListEntryResponse(UserMedia um, com.subtrack.entity.MediaCache cache) {
    this.id          = um.getId();
    this.mediaId     = um.getMediaId();
    this.mediaType   = um.getMediaType();
    this.status      = um.getStatus();
    this.progress    = um.getProgress();
    this.score       = um.getScore();
    this.notes       = um.getNotes();
    this.updatedAt   = um.getUpdatedAt();

    if (cache != null) {
      this.title        = cache.getTitle();
      this.titleEnglish = cache.getTitleEnglish();
      this.imageUrl     = cache.getImageUrl();
      this.episodes     = cache.getEpisodes();
      this.chapters     = cache.getChapters();
      this.apiScore     = cache.getScore();
      this.genres       = cache.getGenres();
    } else {
      this.title = this.titleEnglish = this.imageUrl = this.genres = null;
      this.episodes = this.chapters = null;
      this.apiScore = null;
    }
  }
}