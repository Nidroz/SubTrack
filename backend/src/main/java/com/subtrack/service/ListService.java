package com.subtrack.service;

import com.subtrack.dto.ListEntryResponse;
import com.subtrack.dto.MediaEntryRequest;
import com.subtrack.dto.StatsResponse;
import com.subtrack.entity.*;
import com.subtrack.repository.MediaCacheRepository;
import com.subtrack.repository.UserMediaRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListService {
  private final UserMediaRepository userMediaRepository;
  private final UserRepository userRepository;
  private final MediaCacheRepository mediaCacheRepository;
  private final MediaService mediaService;

  public List<ListEntryResponse> getList(Long userId, MediaType mediaType, WatchStatus watchStatus) {
    List<UserMedia> entries;
    if (mediaType != null && watchStatus != null) {
      entries = userMediaRepository.findByUserIdAndMediaTypeAndStatusOrderByUpdatedAtDesc(userId, mediaType, watchStatus);
    } else if (mediaType != null) {
      entries = userMediaRepository.findByUserIdAndMediaTypeOrderByUpdatedAtDesc(userId, mediaType);
    } else if (watchStatus != null) {
      entries = userMediaRepository.findByUserIdAndStatusOrderByUpdatedAtDesc(userId, watchStatus);
    } else {
      entries = userMediaRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }
    return entries.stream().map(userMedia -> {
      MediaCache cache = mediaCacheRepository.findByMalIdAndMediaType(userMedia.getMediaId(), userMedia.getMediaType())
              .orElse(null);
      return new ListEntryResponse(userMedia, cache);
    }).toList();
  }

  public UserMedia addEntry(Long userId, MediaEntryRequest mediaEntryRequest) {
    User user = userRepository.getReferenceById(userId);
    // pre-populate cache so the list can display title/image immediately
    mediaService.getById(mediaEntryRequest.getMediaType(), mediaEntryRequest.getMediaId());

    UserMedia entry = new UserMedia();
    entry.setUser(user);
    entry.setMediaId(mediaEntryRequest.getMediaId());
    entry.setMediaType(mediaEntryRequest.getMediaType());
    entry.setStatus(mediaEntryRequest.getStatus());
    entry.setProgress(mediaEntryRequest.getProgress());
    entry.setScore(mediaEntryRequest.getScore());
    entry.setNotes(mediaEntryRequest.getNotes());
    return userMediaRepository.save(entry);
  }

  public UserMedia updateEntry(Long userId, Long entryId, MediaEntryRequest mediaEntryRequest) {
    UserMedia entry = userMediaRepository.findByIdAndUserId(entryId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Entry not found or not owned by user !"));
    entry.setStatus(mediaEntryRequest.getStatus());
    entry.setProgress(mediaEntryRequest.getProgress());
    entry.setScore(mediaEntryRequest.getScore());
    entry.setNotes(mediaEntryRequest.getNotes());
    return userMediaRepository.save(entry);
  }

  public void deleteEntry(Long userId, Long entryId) {
    UserMedia entry = userMediaRepository.findByIdAndUserId(entryId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Entry not found or not owned by user !"));
    userMediaRepository.delete(entry);
  }

  public StatsResponse getStats(Long userId) {
    long totalEntries = userMediaRepository.countByUserId(userId);
    long watchingEntries = userMediaRepository.countByUserIdAndStatus(userId, WatchStatus.WATCHING);
    long completedEntries = userMediaRepository.countByUserIdAndStatus(userId, WatchStatus.COMPLETED);
    Double avgScore = userMediaRepository.avgScoreByUserId(userId);
    return new StatsResponse(totalEntries, watchingEntries, completedEntries, avgScore != null ? avgScore : 0.0);
  }
}