package com.subtrack.controller;

import com.subtrack.dto.ChangePasswordRequest;
import com.subtrack.dto.ProfileStatsResponse;
import com.subtrack.dto.UserProfileResponse;
import com.subtrack.repository.UserRepository;
import com.subtrack.service.EmailChangeService;
import com.subtrack.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
  private final ProfileService profileService;
  private final UserRepository userRepository;
  private final EmailChangeService emailChangeService;

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

  @PatchMapping("/password")
  public ResponseEntity<?> changePassword(
          @AuthenticationPrincipal UserDetails userDetails,
          @Valid @RequestBody ChangePasswordRequest changePasswordRequest
  ) {
    try {
      profileService.changePassword(userId(userDetails), changePasswordRequest);
      return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
  }

  @PostMapping("/email/change")
  public ResponseEntity<?> requestEmailChange(
          @AuthenticationPrincipal UserDetails userDetails,
          @RequestBody Map<String, String> body) {
    try {
      emailChangeService.requestEmailChange(userId(userDetails), body.get("newEmail"));
      return ResponseEntity.ok(Map.of("message", "Confirmation email sent to " + body.get("newEmail")));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
  }

  @PostMapping("/email/confirm")
  public ResponseEntity<?> confirmEmailChange(@RequestBody Map<String, String> body) {
    try {
      emailChangeService.confirmEmailChange(body.get("token"));
      return ResponseEntity.ok(Map.of("message", "Email updated successfully"));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
  }
}
