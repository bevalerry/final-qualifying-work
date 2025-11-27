package com.testgen.session.repository;

import com.testgen.session.model.TestSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestSessionRepository extends JpaRepository<TestSession, Long> {
    List<TestSession> findByStudentId(Long studentId);
    List<TestSession> findByStudentIdAndTestId(Long studentId, Long testId);
    List<TestSession> findByTestId(Long testId);
} 