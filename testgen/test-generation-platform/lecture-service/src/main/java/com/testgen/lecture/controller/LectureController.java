package com.testgen.lecture.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testgen.lecture.model.Lecture;
import com.testgen.lecture.service.LectureService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/lectures")
@RequiredArgsConstructor
public class LectureController {

    private final LectureService lectureService;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Lecture> createLecture(
            @RequestPart("lecture") String lecture,
            @RequestPart("file") MultipartFile file) throws JsonProcessingException {
        try {
            Lecture lectureObject = objectMapper.readValue(lecture, Lecture.class);
            return ResponseEntity.ok(lectureService.createLecture(lectureObject, file));
        } catch (JsonMappingException e) {
            e.printStackTrace();
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lecture> getLecture(@PathVariable Long id) {
        return ResponseEntity.ok(lectureService.getLecture(id));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Lecture>> getLecturesByTeacherId(@PathVariable Long teacherId) {
        return ResponseEntity.ok(lectureService.getLecturesByTeacherId(teacherId));
    }

    @GetMapping
    public ResponseEntity<Page<Lecture>> getAllLectures(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(lectureService.getAllLectures(pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lecture> updateLecture(@PathVariable Long id, @RequestBody Lecture lecture) {
        return ResponseEntity.ok(lectureService.updateLecture(id, lecture));
    }

    @DeleteMapping("/{id}/secure")
    public ResponseEntity<Void> deleteLectureSecure(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role
    ) {
        lectureService.deleteLecture(id, userId, role);
        return ResponseEntity.noContent().build();
    }
} 