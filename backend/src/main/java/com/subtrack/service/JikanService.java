package com.subtrack.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.subtrack.entity.MediaCache;
import com.subtrack.entity.UserMedia.MediaType;
import com.subtrack.repository.MediaCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class JikanService {
  private static final String BASE_URL = "https://api.jikan.moe/v4";
  private final MediaCacheRepository mediaCacheRepository;
  private final RestTemplate restTemplate;

  public void searchAnime() {

  }
}
