package com.testgen.session.controller;

import com.testgen.session.model.Answer;
import com.testgen.session.model.TestSession;
import com.testgen.session.service.TestSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-sessions")
@RequiredArgsConstructor
public class TestSessionController {

    private final TestSessionService sessionService;

    @PostMapping
    public ResponseEntity<TestSession> createSession(@RequestBody TestSession session) {
        return ResponseEntity.ok(sessionService.createSession(session));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestSession> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSession(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TestSession>> getSessionsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(sessionService.getSessionsByStudentId(studentId));
    }

    @GetMapping("/student_and_test/{studentId}/{testId}")
    public ResponseEntity<List<TestSession>> getSessionsByStudentIdAndTestId(@PathVariable Long studentId, @PathVariable Long testId) {
        return ResponseEntity.ok(sessionService.getSessionsByStudentIdAndTestId(studentId, testId));
    }

    @GetMapping("/test/{testId}")
    public ResponseEntity<List<TestSession>> getSessionsByTestId(@PathVariable Long testId) {
        return ResponseEntity.ok(sessionService.getSessionsByTestId(testId));
    }

    @GetMapping("/current/{studentId}/{testId}")
    public ResponseEntity<TestSession> getCurrentSession(@PathVariable Long studentId, @PathVariable Long testId) {
        try {
            return ResponseEntity.ok(sessionService.getCurrentSession(studentId, testId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestSession> updateSession(@PathVariable Long id, @RequestBody TestSession session) {
        return ResponseEntity.ok(sessionService.updateSession(id, session));
    }

    @PutMapping("finish/{id}")
    public ResponseEntity<TestSession> finishSessionEarly(@PathVariable Long id, @RequestBody List<Answer> answers) {
        System.out.println(answers);
        return ResponseEntity.ok(sessionService.finishSession(id, answers));
    }
} 