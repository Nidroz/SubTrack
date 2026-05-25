package com.subtrack.config;

import com.subtrack.entity.Role;
import com.subtrack.entity.User;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * creates a default admin account on startup if it doesn't already exist.
 * credentials are configurable via application.properties.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Value("${app.admin.username:admin}")
  private String adminUsername;

  @Value("${app.admin.email:admin@subtrack.dev}")
  private String adminEmail;

  @Value("${app.admin.password:admin1234}")
  private String adminPassword;

  @Override
  public void run(String... args) {
    if (userRepository.existsByUsername(adminUsername)) return;

    User admin = new User();
    admin.setUsername(adminUsername);
    admin.setEmail(adminEmail);
    admin.setPassword(passwordEncoder.encode(adminPassword));
    admin.setRole(Role.ADMIN);
    userRepository.save(admin);

    System.out.println(">>> DEFAULT ADMIN CREATED: " + adminUsername);
  }
}