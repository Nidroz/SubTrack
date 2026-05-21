package com.subtrack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AppConfig {
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
}
