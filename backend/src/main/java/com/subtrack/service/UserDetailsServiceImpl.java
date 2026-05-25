package com.subtrack.security;

import com.subtrack.entity.User;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

  private final UserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    System.out.println(">>> LOADING USER: " + username);
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> {
              System.out.println(">>> USER NOT FOUND: " + username);
              return new UsernameNotFoundException("User not found: " + username);
            });
    System.out.println(">>> USER FOUND: " + username);

    String authority = "ROLE_" + user.getRole().name();
    return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())
            .authorities(new SimpleGrantedAuthority(authority))
            .build();
  }
}