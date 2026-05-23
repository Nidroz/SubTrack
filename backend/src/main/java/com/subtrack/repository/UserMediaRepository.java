package com.subtrack.repository;

import com.subtrack.entity.MediaType;
import com.subtrack.entity.UserMedia;
import com.subtrack.entity.WatchStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserMediaRepository extends JpaRepository<UserMedia, Long> {

  @Query("SELECT um FROM UserMedia um WHERE um.user.id = :userId AND (:mediaType IS NULL OR um.mediaType = :mediaType) AND (:status IS NULL OR um.status = :status)")
  Page<UserMedia> findByFilters(
          @Param("userId") Long userId,
          @Param("mediaType") MediaType mediaType,
          @Param("status") WatchStatus status,
          Pageable pageable
  );

  Optional<UserMedia> findByIdAndUserId(Long id, Long userId);
  long countByUserId(Long userId);
  long countByUserIdAndStatus(Long userId, WatchStatus status);

  @Query("SELECT AVG(u.score) FROM UserMedia u WHERE u.user.id = :userId AND u.score IS NOT NULL")
  Double avgScoreByUserId(@Param("userId") Long userId);
}