package com.subtrack.service;

import com.subtrack.dto.AuthResponse;
import com.subtrack.dto.LoginRequest;
import com.subtrack.dto.RegisterRequest;
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

  public AuthResponse login(LoginRequest loginRequest) {
    String username = loginRequest.getUsername();
    authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, loginRequest.getPassword())
    );
    String token = jwtUtil.generateToken(username);
    return new AuthResponse(token, username);
  }

  public AuthResponse register(RegisterRequest registerRequest) {
    if (userRepository.existsByUsername(registerRequest.getUsername())) {
      throw new RuntimeException("Username already taken !");
    }
    if (userRepository.existsByEmail(registerRequest.getEmail())) {
      throw new RuntimeException("Email already in use !");
    }
    User user = new User();
    user.setUsername(registerRequest.getUsername());
    user.setEmail(registerRequest.getEmail());
    user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
    userRepository.save(user);
    return new AuthResponse(jwtUtil.generateToken(user.getUsername()), user.getUsername());
  }
}
