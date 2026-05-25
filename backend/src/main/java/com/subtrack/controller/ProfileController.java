package com.subtrack.controller;

import com.subtrack.dto.ChangePasswordRequest;
import com.subtrack.dto.ProfileStatsResponse;
import com.subtrack.dto.UserProfileResponse;
import com.subtrack.repository.UserRepository;
import com.subtrack.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
  private final ProfileService profileService;
  private final UserRepository userRepository;

  private Long userId(UserDetails userDetails) {
    return userRepository.findByUsername(userDetails.getUsername()).orElseThrow().getId();
  }

  @GetMapping
  public UserProfileResponse getProfile(@AuthenticationPrincipal UserDetails userDetails) {
    return profileService.getProfile(userId(userDetails));
  }

  @GetMapping("/stats")
  public ProfileStatsResponse getStats(@AuthenticationPrincipal UserDetails userDetails) {
    return profileService.getStats(userId(userDetails));
  }

  public ResponseEntity<?> changePassword(
          @AuthenticationPrincipal UserDetails userDetails,
          @Valid @RequestBody ChangePasswordRequest changePasswordRequest
  ) {
    try {
      profileService.changePassword(userId(userDetails), changePasswordRequest);
      return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    } catch (IllegalArgumentException error) {
      return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
    }
  }
}
