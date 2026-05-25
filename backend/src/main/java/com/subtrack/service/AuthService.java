package com.subtrack.service;

import com.subtrack.dto.AuthResponse;
import com.subtrack.dto.LoginRequest;
import com.subtrack.dto.RegisterRequest;
import com.subtrack.entity.RefreshToken;
import com.subtrack.entity.Role;
import com.subtrack.entity.User;
import com.subtrack.repository.UserRepository;
import com.subtrack.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;
  private final AuthenticationManager authenticationManager;
  private final TokenService tokenService;

  public AuthResponse login(LoginRequest req) {
    authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
    User user = userRepository.findByUsername(req.getUsername()).orElseThrow();
    String accessToken = jwtUtil.generate(user.getUsername());
    RefreshToken refreshToken = tokenService.createRefreshToken(user);
    return new AuthResponse(accessToken, refreshToken.getToken(), user.getUsername(), jwtUtil.getExpirationMs() / 1000, user.getRole().name());
  }

  public AuthResponse register(RegisterRequest req) {
    if (userRepository.existsByUsername(req.getUsername()))
      throw new IllegalArgumentException("Username already taken");
    if (userRepository.existsByEmail(req.getEmail()))
      throw new IllegalArgumentException("Email already in use");

    User user = new User();
    if (userRepository.count() == 0) {
      user.setRole(Role.ADMIN);
    } else {
      user.setRole(Role.USER);
    }
    user.setUsername(req.getUsername());
    user.setEmail(req.getEmail());
    user.setPassword(passwordEncoder.encode(req.getPassword()));
    userRepository.save(user);

    String accessToken = jwtUtil.generate(user.getUsername());
    RefreshToken refreshToken = tokenService.createRefreshToken(user);
    return new AuthResponse(accessToken, refreshToken.getToken(), user.getUsername(), jwtUtil.getExpirationMs() / 1000, user.getRole().name());
  }

  public AuthResponse refresh(String rawRefreshToken) {
    RefreshToken refreshToken = tokenService.validateRefreshToken(rawRefreshToken);
    User user = refreshToken.getUser();
    // rotate refresh token on each use
    tokenService.revokeRefreshToken(rawRefreshToken);
    RefreshToken newRefreshToken = tokenService.createRefreshToken(user);
    String newAccessToken = jwtUtil.generate(user.getUsername());
    return new AuthResponse(newAccessToken, newRefreshToken.getToken(), user.getUsername(), jwtUtil.getExpirationMs() / 1000, user.getRole().name());
  }

  public void logout(String accessToken, Long userId) {
    // blacklist the current access token
    tokenService.blacklistAccessToken(accessToken);
    tokenService.revokeAllUserTokens(userId);
  }
}