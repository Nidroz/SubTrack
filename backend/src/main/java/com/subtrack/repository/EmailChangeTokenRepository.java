package com.subtrack.repository;

import com.subtrack.entity.EmailChangeToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailChangeTokenRepository extends JpaRepository<EmailChangeToken, Long> {
  Optional<EmailChangeToken> findByToken(String token);

  @Modifying @Transactional
  @Query("DELETE FROM EmailChangeToken t WHERE t.expiresAt < :now OR t.used = true")
  void deleteExpiredAndUsed(@Param("now") LocalDateTime now);
}