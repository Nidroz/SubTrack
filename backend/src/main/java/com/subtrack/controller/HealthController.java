package com.subtrack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * lightweight health check endpoint.
 * used by UptimeRobot to keep the Render free tier awake (no cold start).
 */
@RestController
public class HealthController {
  @GetMapping("/api/health")
  public ResponseEntity<String> health() {
    return ResponseEntity.ok("OK");
  }
}
