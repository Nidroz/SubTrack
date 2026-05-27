package com.subtrack.media;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.Set;

public class ProviderUtils {
  private static final Set<String> EXPLICIT_GENRES = Set.of(
          "Hentai", "Ecchi", "Erotica", "Adult Cast", "Adult Themes"
  );

  // keep only items that have (keepExplicit=true) or don't have (keepExplicit=false) explicit genres
  public static JsonNode filterByGenre(JsonNode result, boolean keepExplicit) {
    ObjectMapper mapper = new ObjectMapper();
    ArrayNode filtered = mapper.createArrayNode();
    result.get("data").forEach(item -> {
      boolean hasExplicit = false;
      JsonNode genres = item.path("genres");
      if (!genres.isMissingNode()) {
        for (JsonNode genre : genres) {
          if (EXPLICIT_GENRES.contains(genre.path("name").asText())) {
            hasExplicit = true;
            break;
          }
        }
      }
      if (hasExplicit == keepExplicit) filtered.add(item);
    });
    ObjectNode out = mapper.createObjectNode();
    out.set("data", filtered);
    // preserve pagination if present
    if (result.has("pagination")) out.set("pagination", result.get("pagination"));
    return out;
  }
}
