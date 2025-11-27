package com.testgen.test.controller;

import com.testgen.test.model.Test;
import com.testgen.test.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;

    @GetMapping("/{id}")
    public ResponseEntity<Test> getTest(@PathVariable Long id) {
        return ResponseEntity.ok(testService.getTest(id));
    }

    @GetMapping("/lecture/{lectureId}")
    public ResponseEntity<Test> getTestByLectureId(@PathVariable Long lectureId) {
        return ResponseEntity.ok(testService.getTestByLectureId(lectureId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable Long id) {
        testService.deleteTest(id);
        return ResponseEntity.ok().build();
    }
} 