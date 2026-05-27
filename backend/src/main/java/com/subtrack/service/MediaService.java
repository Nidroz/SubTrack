package com.subtrack.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.subtrack.entity.ContentFilter;
import com.subtrack.entity.MediaCache;
import com.subtrack.entity.MediaType;
import com.subtrack.entity.UserMedia;
import com.subtrack.media.MediaProviderRegistry;
import com.subtrack.repository.MediaCacheRepository;
import com.subtrack.repository.UserMediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * delegates media lookups to the appropriate provider via the registry,
 * and handles caching transparently.
 */
@Service
@RequiredArgsConstructor
public class MediaService {
  private final MediaProviderRegistry registry;
  private final MediaCacheRepository mediaCacheRepository;
  private final UserMediaRepository userMediaRepository;

  @Cacheable(value = "media-search", key = "#mediaType + ':' + #query + ':' + #page + ':' + #limit + ':' + #filter")
  public JsonNode search(MediaType mediaType, String query, int page, int limit, ContentFilter filter) {
    return registry.getProvider(mediaType).search(query, page, limit, filter);
  }

  public JsonNode getById(MediaType mediaType, Long id) {
    // check cache first, skip the api call if we already have metadata
    Optional<MediaCache> cached = mediaCacheRepository.findByMalIdAndMediaType(id, mediaType);
    if (cached.isPresent()) {
      return toJsonNode(cached.get());
    }
    JsonNode response = registry.getProvider(mediaType).getById(id);
    if (response != null && response.has("data")) {
      cacheMedia(response.path("data"), mediaType);
    }
    return response;
  }

  public JsonNode getEpisodesById(MediaType mediaType, Long id) {
    return registry.getProvider(mediaType).getEpisodes(id);
  }

  @Cacheable(value = "media-random", key = "#mediaType")
  public JsonNode getRandom(MediaType mediaType) {
    return registry.getProvider(mediaType).getRandom();
  }

  @Cacheable(value = "media-top-airing", key = "#mediaType + ':' + #page + ':' + #limit + ':' + #filter")
  public JsonNode getTopAiring(MediaType mediaType, int page, int limit, ContentFilter filter) {
    return registry.getProvider(mediaType).getTopAiring(page, limit, filter);
  }

  @Cacheable(value = "media-top-popular", key = "#mediaType + ':' + #page + ':' + #limit + ':' + #filter")
  public JsonNode getTopPopular(MediaType mediaType, int page, int limit, ContentFilter filter) {
    return registry.getProvider(mediaType).getTopPopular(page, limit, filter);
  }

  public JsonNode getRecommendations(MediaType mediaType, Long id) {
    return registry.getProvider(mediaType).getRecommendations(id);
  }

  public JsonNode getListRecommendations(Long userId, MediaType type) {
    List<UserMedia> entries = userMediaRepository.findByUserIdOrderByUpdatedAtDesc(userId)
            .stream()
            .filter(entry -> entry.getMediaType() == type)  // filter by requested type
            .limit(3)
            .toList();

    if (entries.isEmpty()) return new ObjectMapper().createObjectNode();

    ObjectMapper mapper = new ObjectMapper();
    ArrayNode combined = mapper.createArrayNode();
    for (UserMedia entry : entries) {
      JsonNode recs = registry.getProvider(entry.getMediaType()).getRecommendations(entry.getMediaId());
      if (recs != null && recs.has("data")) {
        recs.get("data").forEach(r -> {
          if (combined.size() < 12) combined.add(r);
        });
      }
    }
    ObjectNode result = mapper.createObjectNode();
    result.set("data", combined);
    return result;
  }

  // evict random cache every 5 min so Surprise me stays fresh
  @Scheduled(fixedDelay = 5 * 60 * 1000)
  @CacheEvict(value = "media-random", allEntries = true)
  public void evictRandomCache() {}

  private void cacheMedia(JsonNode data, MediaType mediaType) {
    MediaCache cache = new MediaCache();
    cache.setMalId(data.path("mal_id").asLong());
    cache.setMediaType(mediaType);
    cache.setTitle(data.path("title").asText(null));
    cache.setTitleEnglish(nullableText(data, "title_english"));
    cache.setSynopsis(nullableText(data, "synopsis"));
    cache.setImageUrl(data.path("images").path("jpg").path("large_image_url").asText(
            data.path("images").path("jpg").path("image_url").asText(null)
    ));
    cache.setEpisodes(data.path("episodes").isNull() ? null : data.path("episodes").asInt());
    cache.setChapters(data.path("chapters").isNull() ? null : data.path("chapters").asInt());
    cache.setScore(data.path("score").isNull() ? null : data.path("score").asDouble());
    cache.setStatus(nullableText(data, "status"));
    cache.setGenres(buildGenresJson(data));
    mediaCacheRepository.save(cache);
  }

  private JsonNode toJsonNode(MediaCache cache) {
    ObjectMapper mapper = new ObjectMapper();
    ObjectNode node = mapper.createObjectNode();
    node.put("mal_id", cache.getMalId());
    node.put("title", cache.getTitle());
    node.put("title_english", cache.getTitleEnglish());
    node.put("synopsis", cache.getSynopsis());

    ObjectNode images = mapper.createObjectNode();
    ObjectNode jpg = mapper.createObjectNode();
    jpg.put("image_url", cache.getImageUrl());
    jpg.put("large_image_url", cache.getImageUrl());
    images.set("jpg", jpg);
    node.set("images", images);

    if (cache.getEpisodes() != null) node.put("episodes", cache.getEpisodes());
    else node.putNull("episodes");
    if (cache.getScore() != null) node.put("score", cache.getScore());
    else node.putNull("score");
    node.put("status", cache.getStatus());
    node.put("genres", cache.getGenres());
    node.put("cached", true);
    return node;
  }

  private String buildGenresJson(JsonNode data) {
    StringBuilder sb = new StringBuilder("[");
    data.path("genres").forEach(g -> {
      if (sb.length() > 1) sb.append(",");
      sb.append("\"").append(g.path("name").asText()).append("\"");
    });
    return sb.append("]").toString();
  }

  private String nullableText(JsonNode node, String field) {
    JsonNode jsonNode = node.path(field);
    return (jsonNode.isNull() || jsonNode.isMissingNode()) ? null : jsonNode.asText();
  }
}
