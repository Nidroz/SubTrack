package com.subtrack.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * in-memory cache config using Caffeine.
 * top/popular lists cached 10 min, search results 5 min.
 * avoids hammering Jikan (rate limit: 3 req/sec, 60 req/min).
 */
@EnableCaching
@Configuration
public class CacheConfig {
  private static final int MAX_LIMIT_JIKAN_PROVIDERS = 25;  // max items per page for search results (Jikan limit), for providers

  public CacheManager cacheManager() {
    CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager();
    caffeineCacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(10, TimeUnit.MINUTES) // default expiration (10 min)
            .maximumSize(200) // max 200 entries in cache
    );
    return caffeineCacheManager;
  }

  public static int getMaxLimitJikanProviders() {
    return MAX_LIMIT_JIKAN_PROVIDERS;
  }
}
