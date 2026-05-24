package com.subtrack.media;

import com.fasterxml.jackson.databind.JsonNode;
import com.subtrack.entity.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * jikan v4 provider for anime data.
 */
@Component
public class JikanAnimeProvider extends AbstractMediaProvider {
  private static final String BASE = "https://api.jikan.moe/v4";

  public JikanAnimeProvider(WebClient webClient) {
    super(webClient);
  }

  @Override
  public MediaType supports() {
    return MediaType.ANIME;
  }

  @Override
  public JsonNode search(String query, int page) {
    String url = UriComponentsBuilder.fromHttpUrl(BASE)
            .path("/anime")
            .queryParam("q", query)
            .queryParam("page", page)
            .queryParam("limit", 12)
            .toUriString();
    return get(url);
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
  public JsonNode getTopAiring(int page) {
    String url = UriComponentsBuilder.fromHttpUrl(BASE)
            .path("/top/anime")
            .queryParam("filter", "airing")
            .queryParam("page", page)
            .queryParam("limit", 12)
            .toUriString();
    return get(url);
  }

  @Override
  public JsonNode getTopPopular(int page) {
    String url = UriComponentsBuilder.fromHttpUrl(BASE)
            .path("/top/anime")
            .queryParam("filter", "bypopularity")
            .queryParam("page", page)
            .queryParam("limit", 12)
            .toUriString();
    return get(url);
  }

  @Override
  public JsonNode getRecommendations(Long id) {
    return get(BASE + "/anime/" + id + "/recommendations");
  }
}
