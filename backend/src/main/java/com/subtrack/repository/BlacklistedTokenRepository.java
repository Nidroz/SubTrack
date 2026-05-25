package com.subtrack.repository;

import com.subtrack.entity.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {
  boolean existsByTokenHash(String tokenHash);

  @Modifying
  @Transactional
  @Query("DELETE FROM BlacklistedToken bt WHERE bt.expiresAt < :now")
  void deleteExpired(@Param("now") LocalDateTime now);
}
