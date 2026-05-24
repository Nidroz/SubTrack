package com.subtrack.media;

import com.fasterxml.jackson.databind.JsonNode;
import com.subtrack.entity.MediaType;

/**
 * strategy interface for external media api providers.
 * implement this to add a new source (e.g. AniList, Kitsu).
 */
public interface MediaProvider {
  MediaType supports(); // media type this provider handles.
  JsonNode search(String query, int page);
  JsonNode getById(Long id);
  JsonNode getEpisodes(Long id);
  JsonNode getRandom();
  JsonNode getTopAiring(int page);
  JsonNode getTopPopular(int page);
  JsonNode getRecommendations(Long id);
}
