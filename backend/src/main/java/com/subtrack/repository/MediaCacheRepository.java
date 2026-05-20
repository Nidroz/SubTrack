package com.subtrack.repository;

import com.subtrack.entity.MediaCache;
import com.subtrack.entity.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MediaCacheRepository extends JpaRepository<MediaCache, Long> {
  Optional<MediaCache> findByMailAndMediaType(Long malId, MediaType mediaType);
}
