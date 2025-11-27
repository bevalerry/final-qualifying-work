package com.testgen.processing.controller;

import com.testgen.processing.model.TestGenerationRequest;
import com.testgen.processing.service.LectureProcessingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/process")
@RequiredArgsConstructor
public class LectureProcessingController {

    private final LectureProcessingService processingService;

    @PostMapping
    public ResponseEntity<Void> processLecture(@RequestBody TestGenerationRequest request) {
        processingService.processLecture(request);
        return ResponseEntity.ok().build();
    }
} 