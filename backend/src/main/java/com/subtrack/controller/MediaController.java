package com.subtrack.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.subtrack.entity.MediaType;
import com.subtrack.repository.UserRepository;
import com.subtrack.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {
  private final MediaService mediaService;
  private final UserRepository userRepository;

  @GetMapping("/search")
  public JsonNode search(
          @RequestParam MediaType type,
          @RequestParam String query,
          @RequestParam(defaultValue = "1") int page
  ) {
    return mediaService.search(type, query, page);
  }

  @GetMapping("/{type}/{id}")
  public JsonNode getById(
          @PathVariable MediaType type,
          @PathVariable Long id
  ) {
    return mediaService.getById(type, id);
  }

  @GetMapping("/{type}/{id}/episodes")
  public JsonNode getEpisodes(
          @PathVariable MediaType type,
          @PathVariable Long id
  ) {
    return mediaService.getEpisodesById(type, id);
  }

  @GetMapping("/random")
  public JsonNode getRandom(
          @RequestParam MediaType type
  ) {
    return mediaService.getRandom(type);
  }

  @GetMapping("/top/airing")
  public JsonNode getTopAiring(
          @RequestParam MediaType type,
          @RequestParam(defaultValue = "1") int page
  ) {
    return mediaService.getTopAiring(type, page);
  }

  @GetMapping("/top/popular")
  public JsonNode getTopPopular(
          @RequestParam MediaType type,
          @RequestParam(defaultValue = "1") int page
  ) {
    return mediaService.getTopPopular(type, page);
  }

  @GetMapping("/{type}/{id}/recommendations")
  public JsonNode getRecommendations(
          @PathVariable MediaType type,
          @PathVariable Long id
  ) {
    return mediaService.getRecommendations(type, id);
  }

  @GetMapping("/recommendations/me")
  public JsonNode getMyRecommendations(@AuthenticationPrincipal UserDetails userDetails) {
    Long userId = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow().getId();
    return mediaService.getListRecommendations(userId);
  }
}
