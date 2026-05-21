package com.subtrack.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.subtrack.entity.MediaType;
import com.subtrack.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {
  private final MediaService mediaService;

  @GetMapping("/search")
  public JsonNode search(
          @RequestParam MediaType mediaType,
          @RequestParam String query,
          @RequestParam int page
  ) {
    return mediaService.search(mediaType, query, page);
  }

  @GetMapping("/{mediaType}/{id}")
  public JsonNode getById(
          @PathVariable MediaType mediaType,
          @PathVariable Long id
  ) {
    return mediaService.getById(mediaType, id);
  }

  @GetMapping("/{mediaType}/{id}/episodes")
  public JsonNode getEpisodes(
          @PathVariable MediaType mediaType,
          @PathVariable Long id
  ) {
    return mediaService.getEpisodesById(mediaType, id);
  }
}
