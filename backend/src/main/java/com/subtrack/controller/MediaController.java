package com.subtrack.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {
  // TODO: wait the implemention of the strategy pattern for different media types (anime, manga, etc.)
}
