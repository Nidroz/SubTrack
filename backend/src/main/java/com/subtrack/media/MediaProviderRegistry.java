package com.subtrack.media;

import com.subtrack.entity.MediaType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Resolves the right MediaProvider for a given MediaType.
 * All @Component providers are auto-registered via spring injection.
 */
@Component
public class MediaProviderRegistry {
  private final Map<MediaType, MediaProvider> providers;

  public MediaProviderRegistry(List<MediaProvider> providerList) {
    this.providers = providerList.stream()
            .collect(Collectors.toMap(MediaProvider::supports, Function.identity()));
  }

  public MediaProvider getProvider(MediaType mediaType) {
    MediaProvider provider = providers.get(mediaType);
    if (provider == null) {
      throw new IllegalArgumentException("No provider registered  for media type: " + mediaType);
    }
    return provider;
  }
}
