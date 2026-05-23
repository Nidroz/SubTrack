package com.subtrack.service;

import com.subtrack.dto.ListEntryResponse;
import com.subtrack.dto.MediaEntryRequest;
import com.subtrack.dto.PagedResponse;
import com.subtrack.dto.StatsResponse;
import com.subtrack.entity.MediaCache;
import com.subtrack.entity.MediaType;
import com.subtrack.entity.User;
import com.subtrack.entity.UserMedia;
import com.subtrack.entity.WatchStatus;
import com.subtrack.repository.MediaCacheRepository;
import com.subtrack.repository.UserMediaRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ListService {
  private final UserMediaRepository userMediaRepository;
  private final UserRepository userRepository;
  private final MediaCacheRepository mediaCacheRepository;
  private final MediaService mediaService;

  public PagedResponse<ListEntryResponse> getList(
          Long userId, MediaType mediaType, WatchStatus status,
          int page, int size, String sortBy, String sortDir) {

    Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;

    // map frontend sort keys to entity fields
    String sortField = switch (sortBy) {
      case "status" -> "status";
      default       -> "updatedAt";
    };

    Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
    Page<UserMedia> raw = userMediaRepository.findByFilters(userId, mediaType, status, pageable);

    Page<ListEntryResponse> enriched = raw.map(um -> {
      MediaCache cache = mediaCacheRepository
              .findByMalIdAndMediaType(um.getMediaId(), um.getMediaType())
              .orElse(null);
      return new ListEntryResponse(um, cache);
    });

    return new PagedResponse<>(enriched);
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