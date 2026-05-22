package com.subtrack.service;

import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
  private final UserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    System.out.println(">>> LOADING USER: " + username);

    return userRepository.findByUsername(username)
            .map(user -> {
              System.out.println(">>> USER FOUND: " + user.getUsername());
              return User.withUsername(user.getUsername())
                      .password(user.getPassword())
                      .roles("USER")
                      .build();
            })
            .orElseThrow(() -> {
              System.out.println(">>> USER NOT FOUND: " + username);
              return new UsernameNotFoundException("User not found: " + username);
            });
  }
}
