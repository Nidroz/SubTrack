package com.subtrack.config;

import com.subtrack.entity.ContentFilter;
import com.subtrack.entity.MediaType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistrar;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig implements WebMvcConfigurer {
  /**
   * shared webclient instance — providers call external apis from the server side,
   * so there are no cors concerns here.
   */
  @Bean
  public WebClient webClient() {
    return WebClient.builder()
            .codecs(c -> c.defaultCodecs().maxInMemorySize(2 * 1024 * 1024)) // 2MB buffer
            .build();
  }

  @Override
  public void addFormatters(FormatterRegistry registry) {
    registry.addConverter(String.class, MediaType.class,
            source -> MediaType.valueOf(source.toUpperCase()));
    registry.addConverter(String.class, ContentFilter.class,
            source -> ContentFilter.valueOf(source.toUpperCase()));
  }
}
