package com.testgen.lecture.repository;

import com.testgen.lecture.model.Lecture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LectureRepository extends JpaRepository<Lecture, Long> {
    List<Lecture> findByTeacherId(Long teacherId);
    Page<Lecture> findAll(Pageable pageable);
} 