package com.subtrack.repository;

import com.subtrack.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
  Optional<RefreshToken> findByToken(String token);

  @Modifying @Transactional
  @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.user.id = :userId")
  void revokeAllByUserId(@Param("userId") Long userId);

  @Modifying @Transactional
  @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now OR rt.revoked = true")
  void deleteExpiredAndRevoked(@Param("now") LocalDateTime now);
}