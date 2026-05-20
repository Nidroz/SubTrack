package com.subtrack.repository;

import com.subtrack.entity.MediaType;
import com.subtrack.entity.UserMedia;
import com.subtrack.entity.WatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserMediaRepository extends JpaRepository<UserMedia, Long> {
  List<UserMedia> findByUserIdOrderByUpdatedAtDesc(Long userId);

  List<UserMedia> findByUserIdAndMediaTypeOrderByUpdatedAtDesc(Long userId, MediaType mediaType);

  List<UserMedia> findByUserIdAndStatusOrderByUpdatedAtDesc(Long userId, WatchStatus status);

  List<UserMedia> findByUserIdAndMediaTypeAndStatusOrderByUpdatedAtDesc(
          Long userId, MediaType mediaType, WatchStatus status);

  Optional<UserMedia> findByIdAndUserId(Long id, Long userId);

  long countByUserId(Long userId);

  long countByUserIdAndStatus(Long userId, WatchStatus status);

  @Query("SELECT AVG(u.score) FROM UserMedia u WHERE u.user.id = :userId AND u.score IS NOT NULL")
  Double avgScoreByUserId(@Param("userId") Long userId);
}
