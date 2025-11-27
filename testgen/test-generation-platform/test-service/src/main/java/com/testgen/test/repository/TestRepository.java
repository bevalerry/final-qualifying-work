package com.testgen.test.repository;

import com.testgen.test.model.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TestRepository extends JpaRepository<Test, Long> {
    Optional<Test> findByLectureId(Long lectureId);
} 