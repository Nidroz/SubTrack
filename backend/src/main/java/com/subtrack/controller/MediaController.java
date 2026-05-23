package com.subtrack.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.subtrack.entity.MediaType;
import com.subtrack.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {
  private final MediaService mediaService;

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
}
