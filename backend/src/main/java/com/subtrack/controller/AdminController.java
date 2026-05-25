package com.subtrack.controller;

import com.subtrack.dto.AdminUserResponse;
import com.subtrack.dto.GlobalStatsResponse;
import com.subtrack.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

  private final AdminService adminService;

  @GetMapping("/users")
  public List<AdminUserResponse> getAllUsers() {
    return adminService.getAllUsers();
  }

  @GetMapping("/stats")
  public GlobalStatsResponse getGlobalStats() {
    return adminService.getGlobalStats();
  }

  @DeleteMapping("/users/{id}")
  public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    try {
      adminService.deleteUser(id);
      return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
  }

  @PatchMapping("/users/{id}/promote")
  public ResponseEntity<?> promoteUser(@PathVariable Long id) {
    try {
      adminService.promoteToAdmin(id);
      return ResponseEntity.ok(Map.of("message", "User promoted to admin"));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
  }

  @PatchMapping("/users/{id}/demote")
  public ResponseEntity<?> demoteUser(@PathVariable Long id) {
    try {
      adminService.demoteToUser(id);
      return ResponseEntity.ok(Map.of("message", "User demoted to user"));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
  }

  @DeleteMapping("/cache")
  public ResponseEntity<?> clearCache() {
    adminService.clearMediaCache();
    return ResponseEntity.ok(Map.of("message", "Media cache cleared"));
  }

  @GetMapping("/cache/size")
  public ResponseEntity<?> getCacheSize() {
    return ResponseEntity.ok(Map.of("size", adminService.getMediaCacheSize()));
  }
}