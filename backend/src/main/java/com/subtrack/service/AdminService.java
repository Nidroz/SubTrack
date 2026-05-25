package com.subtrack.service;

import com.subtrack.dto.AdminUserResponse;
import com.subtrack.dto.GlobalStatsResponse;
import com.subtrack.entity.Role;
import com.subtrack.entity.User;
import com.subtrack.repository.MediaCacheRepository;
import com.subtrack.repository.UserMediaRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

  private final UserRepository userRepository;
  private final UserMediaRepository userMediaRepository;
  private final MediaCacheRepository mediaCacheRepository;
  private final TokenService tokenService;

  public List<AdminUserResponse> getAllUsers() {
    return userRepository.findAll().stream()
            .map(u -> new AdminUserResponse(
                    u.getId(),
                    u.getUsername(),
                    u.getEmail(),
                    u.getRole().name(),
                    u.getCreatedAt(),
                    userMediaRepository.countByUserId(u.getId())
            ))
            .toList();
  }

  public GlobalStatsResponse getGlobalStats() {
    long totalUsers = userRepository.count();
    long totalEntries = userMediaRepository.count();
    long totalCachedMedia = mediaCacheRepository.count();
    return new GlobalStatsResponse(totalUsers, totalEntries, totalCachedMedia);
  }

  @Transactional
  public void deleteUser(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    tokenService.revokeAllUserTokens(userId);
    userMediaRepository.deleteAllByUserId(userId);
    userRepository.delete(user);
  }

  @Transactional
  public void promoteToAdmin(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    user.setRole(Role.ADMIN);
    userRepository.save(user);
  }

  @Transactional
  public void demoteToUser(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    user.setRole(Role.USER);
    userRepository.save(user);
  }

  public void clearMediaCache() {
    mediaCacheRepository.deleteAll();
  }

  public long getMediaCacheSize() {
    return mediaCacheRepository.count();
  }
}