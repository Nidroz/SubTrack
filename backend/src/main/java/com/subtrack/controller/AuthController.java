package com.subtrack.controller;

import com.subtrack.dto.AuthResponse;
import com.subtrack.dto.LoginRequest;
import com.subtrack.dto.RefreshRequest;
import com.subtrack.dto.RegisterRequest;
import com.subtrack.repository.UserRepository;
import com.subtrack.service.AuthService;
import com.subtrack.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;
  private final UserRepository userRepository;
  private final PasswordResetService passwordResetService;

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
    try {
      return ResponseEntity.ok(authService.register(registerRequest));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
    try {
      return ResponseEntity.ok(authService.login(loginRequest));
    } catch (Exception e) {
      return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
    }
  }

  @PostMapping("/refresh")
  public ResponseEntity<?> refresh(@Valid @RequestBody RefreshRequest refreshRequest) {
    try {
      return ResponseEntity.ok(authService.refresh(refreshRequest.getRefreshToken()));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
    }
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(
          @RequestHeader("Authorization") String authHeader,
          @AuthenticationPrincipal UserDetails userDetails) {
    String token = authHeader.substring(7);
    Long userId = userRepository.findByUsername(userDetails.getUsername()).orElseThrow().getId();
    authService.logout(token, userId);
    return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
    // always return 200 to avoid email enumeration
    passwordResetService.requestReset(body.get("email"));
    return ResponseEntity.ok(Map.of("message", "If this email exists, a reset link has been sent."));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
    try {
      passwordResetService.resetPassword(body.get("token"), body.get("newPassword"));
      return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
  }

}