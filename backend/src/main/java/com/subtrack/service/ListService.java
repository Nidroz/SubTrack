package com.subtrack.service;

import com.subtrack.dto.MediaEntryRequest;
import com.subtrack.dto.StatsResponse;
import com.subtrack.entity.MediaType;
import com.subtrack.entity.User;
import com.subtrack.entity.UserMedia;
import com.subtrack.entity.WatchStatus;
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

  public List<UserMedia> getList(Long userId, MediaType mediaType, WatchStatus watchStatus) {
    if (mediaType != null && watchStatus != null) {
      return userMediaRepository.findByUserIdAndMediaTypeAndStatusOrderByUpdatedAtDesc(userId, mediaType, watchStatus);
    }
    if (mediaType != null) {
      return userMediaRepository.findByUserIdAndMediaTypeOrderByUpdatedAtDesc(userId, mediaType);
    }
    if (watchStatus != null) {
      return userMediaRepository.findByUserIdAndStatusOrderByUpdatedAtDesc(userId, watchStatus);
    }
    return userMediaRepository.findByUserIdOrderByUpdatedAtDesc(userId);
  }

  public UserMedia addEntry(Long userId, MediaEntryRequest mediaEntryRequest) {
    User user = userRepository.getReferenceById(userId);
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