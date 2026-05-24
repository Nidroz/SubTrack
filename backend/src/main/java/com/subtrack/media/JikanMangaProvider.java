package com.subtrack.media;

import com.fasterxml.jackson.databind.JsonNode;
import com.subtrack.entity.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * jikan v4 provider for manga data.
 */
@Component
public class JikanMangaProvider extends AbstractMediaProvider {
  private static final String BASE = "https://api.jikan.moe/v4";

  public JikanMangaProvider(WebClient webClient) {
    super(webClient);
  }

  @Override
  public MediaType supports() {
    return MediaType.MANGA;
  }

  @Override
  public JsonNode search(String query, int page) {
    String url = UriComponentsBuilder.fromHttpUrl(BASE)
            .path("/manga")
            .queryParam("q", query)
            .queryParam("page", page)
            .queryParam("limit", 12)
            .toUriString();
    return get(url);
  }

  @Override
  public JsonNode getById(Long id) {
    return get(BASE + "/manga/" + id);
  }

  @Override
  public JsonNode getEpisodes(Long id) {
    // manga has no episodes, return empty node
    return get(BASE + "/manga/" + id + "/chapters");
  }

  @Override
  public JsonNode getRandom() {
    return get(BASE + "/random/manga");
  }

  @Override
  public JsonNode getTopAiring(int page) {
    String url = UriComponentsBuilder.fromHttpUrl(BASE)
            .path("/top/manga")
            .queryParam("filter", "publishing")
            .queryParam("page", page)
            .queryParam("limit", 12)
            .toUriString();
    return get(url);
  }

  @Override
  public JsonNode getTopPopular(int page) {
    String url = UriComponentsBuilder.fromHttpUrl(BASE)
            .path("/top/manga")
            .queryParam("filter", "bypopularity")
            .queryParam("page", page)
            .queryParam("limit", 12)
            .toUriString();
    return get(url);
  }

  @Override
  public JsonNode getRecommendations(Long id) {
    return get(BASE + "/manga/" + id + "/recommendations");
  }
}
