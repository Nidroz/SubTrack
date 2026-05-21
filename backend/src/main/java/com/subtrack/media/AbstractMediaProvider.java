package com.subtrack.media;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.NullNode;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * base class with shared webclient helpers for concrete providers.
 */
public abstract class AbstractMediaProvider implements MediaProvider {
  private final WebClient webClient;

  protected AbstractMediaProvider(WebClient webClient) {
    this.webClient = webClient;
  }

  /** blocking get — returns null on 4xx/5xx instead of throwing. */
  protected JsonNode get(String uri) {
    return webClient.get()
            .uri(uri)
            .retrieve()
            .bodyToMono(JsonNode.class)
            .onErrorReturn(NullNode.getInstance())
            .block();
  }
}
