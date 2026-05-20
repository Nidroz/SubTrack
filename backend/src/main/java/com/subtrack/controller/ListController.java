package com.subtrack.controller;

import com.subtrack.dto.MediaEntryRequest;
import com.subtrack.dto.StatsResponse;
import com.subtrack.entity.MediaType;
import com.subtrack.entity.UserMedia;
import com.subtrack.entity.WatchStatus;
import com.subtrack.repository.UserRepository;
import com.subtrack.service.ListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class ListController {
  private final ListService listService;
  private final UserRepository userRepository;

  // resolve authenticated username: database user id
  private Long userId(UserDetails userDetails) {
    return userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new IllegalArgumentException("User not found"))
            .getId();
  }

  @GetMapping("/stats")
  public StatsResponse getStats(@AuthenticationPrincipal UserDetails userDetails) {
    return listService.getStats(userId(userDetails));
  }

  @GetMapping
  public List<UserMedia> getList(
          @AuthenticationPrincipal UserDetails userDetails,
          @RequestParam(required = false) MediaType mediaType,
          @RequestParam(required = false) WatchStatus status) {
    return listService.getList(userId(userDetails), mediaType, status);
  }

  @PostMapping
  public ResponseEntity<UserMedia> addEntry(
          @AuthenticationPrincipal UserDetails userDetails,
          @Valid @RequestBody MediaEntryRequest mediaEntryRequest
  ) {
    return ResponseEntity.ok(listService.addEntry(userId(userDetails), mediaEntryRequest));
  }

  @PutMapping("/{entryId}")
  public ResponseEntity<UserMedia> updateEntry(
          @AuthenticationPrincipal UserDetails userDetails,
          @PathVariable Long entryId,
          @Valid @RequestBody MediaEntryRequest mediaEntryRequest
  ) {
    return ResponseEntity.ok(listService.updateEntry(userId(userDetails), entryId, mediaEntryRequest));
  }

  @DeleteMapping("/{entryId}")
  public ResponseEntity<Void> deleteEntry(
          @AuthenticationPrincipal UserDetails userDetails,
          @PathVariable Long entryId
  ) {
    listService.deleteEntry(userId(userDetails), entryId);
    return ResponseEntity.noContent().build();
  }
}
