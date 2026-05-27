package com.subtrack.media;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.subtrack.config.CacheConfig;
import com.subtrack.entity.ContentFilter;
import com.subtrack.entity.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Set;

/**
 * jikan v4 provider for anime data.
 */
@Component
public class JikanAnimeProvider extends AbstractMediaProvider {
  private static final String BASE = "https://api.jikan.moe/v4";
  private static final int MAX_LIMIT_JIKAN_PROVIDERS = CacheConfig.getMaxLimitJikanProviders(); // Jikan max limit per page for search results

  public JikanAnimeProvider(WebClient webClient) {
    super(webClient);
  }

  @Override
  public MediaType supports() {
    return MediaType.ANIME;
  }

  @Override
  public JsonNode search(String query, int page, int limit, ContentFilter filter) {
    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(BASE + "/anime")
            .queryParam("q", query)
            .queryParam("page", page)
            .queryParam("limit", Math.min(limit, 25));
    if (filter == ContentFilter.SAFE) builder.queryParam("sfw", true);
    if (filter == ContentFilter.NSFW) builder.queryParam("rating", "rx");
    return get(builder.toUriString());
  }

  @Override
  public JsonNode getById(Long id) {
    return get(BASE + "/anime/" + id);
  }

  @Override
  public JsonNode getEpisodes(Long id) {
    return get(BASE + "/anime/" + id + "/episodes");
  }

  @Override
  public JsonNode getRandom() {
    return get(BASE + "/random/anime");
  }

  @Override
  public JsonNode getTopAiring(int page, int limit, ContentFilter filter) {
    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(BASE + "/top/anime")
            .queryParam("filter", "airing")
            .queryParam("page", page)
            .queryParam("limit", Math.min(limit, 25));
    // top endpoints only support sfw, not rating=rx
    if (filter == ContentFilter.SAFE) builder.queryParam("sfw", true);
    if (filter == ContentFilter.NSFW) builder.queryParam("rating", "rx");
    JsonNode result = get(builder.toUriString());
    // NSFW: filter to keep only explicit genres
    if (filter == ContentFilter.NSFW && result != null && result.has("data")) {
      return ProviderUtils.filterByGenre(result, true);
    }
    // SAFE: already filtered by Jikan sfw param
    return result;
  }

  @Override
  public JsonNode getTopPopular(int page, int limit, ContentFilter filter) {
    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(BASE + "/top/anime")
            .queryParam("filter", "bypopularity")
            .queryParam("page", page)
            .queryParam("limit", Math.min(limit, 25));
    if (filter == ContentFilter.SAFE) builder.queryParam("sfw", true);
    if (filter == ContentFilter.NSFW) builder.queryParam("rating", "rx");
    JsonNode result = get(builder.toUriString());
    if (filter == ContentFilter.NSFW && result != null && result.has("data")) {
      return ProviderUtils.filterByGenre(result, true);
    }
    return result;
  }

  @Override
  public JsonNode getRecommendations(Long id) {
    return get(BASE + "/anime/" + id + "/recommendations");
  }
}
