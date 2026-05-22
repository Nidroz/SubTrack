package com.subtrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
  // TODO: TO ADD: recommendation / random (available from jikan api) + user lists (will require user auth and db storage)
  // TODO: in My List, add switches (All / Anime / Manga))
  // TODO: add pages
  // TODO: add anime/manga details page with more info + add to list button (/anime/:id, /manga/:id)
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
