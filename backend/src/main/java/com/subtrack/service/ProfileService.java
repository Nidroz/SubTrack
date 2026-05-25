package com.subtrack.service;

import com.subtrack.dto.ChangePasswordRequest;
import com.subtrack.dto.ProfileStatsResponse;
import com.subtrack.dto.ProfileUpdateRequest;
import com.subtrack.dto.UserProfileResponse;
import com.subtrack.entity.MediaType;
import com.subtrack.entity.User;
import com.subtrack.entity.UserMedia;
import com.subtrack.entity.WatchStatus;
import com.subtrack.repository.UserMediaRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {
  private final UserRepository userRepository;
  private final UserMediaRepository userMediaRepository;
  private final PasswordEncoder passwordEncoder;

  public UserProfileResponse getProfile(Long userId) {
    User user = userRepository.findById(userId).orElseThrow();
    return new UserProfileResponse(user.getId(), user.getUsername(), user.getEmail(), user.getCreatedAt(), user.getAvatarUrl());
  }

  public ProfileStatsResponse getStats(Long userId) {
    List<UserMedia> all = userMediaRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    long total = all.size();
    long watching = count(all, WatchStatus.WATCHING);
    long completed = count(all, WatchStatus.COMPLETED);
    long planToWatch = count(all, WatchStatus.PLAN_TO_WATCH);
    long onHold = count(all, WatchStatus.ON_HOLD);
    long dropped = count(all, WatchStatus.DROPPED);
    long totalAnime = all.stream().filter(entry -> entry.getMediaType() == com.subtrack.entity.MediaType.ANIME).count();
    long totalManga = all.stream().filter(entry -> entry.getMediaType() == com.subtrack.entity.MediaType.MANGA).count();
    // TODO: add here a new total if new media types are added in the future

    Double avgScore = all.stream()
            .filter(entry -> entry.getScore() != null)
            .mapToInt(UserMedia::getScore)
            .average()
            .orElse(0.0);

    // estimate: progress episodes * 24 min average (for anime)
    long estimatedMinutes = all.stream()
            .filter(e -> e.getMediaType() == MediaType.ANIME)
            .mapToLong(e -> (long) e.getProgress() * 24)
            .sum();
    // score distribution
    Map<Integer, Long> scoreDistribution = all.stream()
            .filter(e -> e.getScore() != null)
            .collect(Collectors.groupingBy(UserMedia::getScore, Collectors.counting()));

    // top genres from notes field (we store genres as json string in cache)
    // for now return empty, would need a join with media_cache
    List<String> topGenres = List.of();
    return ProfileStatsResponse.builder()
            .total(total).watching(watching).completed(completed)
            .planToWatch(planToWatch).dropped(dropped).onHold(onHold)
            .avgScore(avgScore).totalAnime(totalAnime).totalManga(totalManga)
            .estimatedMinutes(estimatedMinutes)
            .scoreDistribution(scoreDistribution)
            .topGenres(topGenres)
            .build();
  }

  public void changePassword(Long userId, ChangePasswordRequest changePasswordRequest) {
    User user = userRepository.findById(userId).orElseThrow();
    if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
      throw new IllegalArgumentException("Current password is incorrect");
    }
    user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
    userRepository.save(user);
  }

  private long count(List<UserMedia> list, WatchStatus status) {
    return list.stream().filter(entry -> entry.getStatus() == status).count();
  }

  public void updateProfile(Long userId, ProfileUpdateRequest profileUpdateRequest) {
    User user = userRepository.findById(userId).orElseThrow();
    if (profileUpdateRequest.getUsername() != null && !profileUpdateRequest.getUsername().isBlank()) {
      // check username not taken by another user
      userRepository.findByUsername(profileUpdateRequest.getUsername()).ifPresent(existing -> {
        if (!existing.getId().equals(userId)) {
          throw new IllegalArgumentException("Username already taken");
        }
      });
      user.setUsername(profileUpdateRequest.getUsername());
    }
    if (profileUpdateRequest.getAvatarBase64() != null && !profileUpdateRequest.getAvatarBase64().isBlank()) {
      // store as data URL directly — no external service needed
      user.setAvatarUrl(profileUpdateRequest.getAvatarBase64());
    }
    userRepository.save(user);
  }
}
