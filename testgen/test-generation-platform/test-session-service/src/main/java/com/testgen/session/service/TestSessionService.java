package com.testgen.session.service;

import com.testgen.session.model.Answer;
import com.testgen.session.model.TestSession;
import com.testgen.session.repository.TestSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class TestSessionService {

    private final TestSessionRepository sessionRepository;

    public TestSession createSession(TestSession session) {
        // Check if there's an unfinished session for the same student and test
        List<TestSession> existingSessions = sessionRepository.findByStudentIdAndTestId(
            session.getStudentId(), 
            session.getTestId()
        );
        
        boolean hasUnfinishedSession = existingSessions.stream()
            .anyMatch(s -> !s.isFinished());
            
        if (hasUnfinishedSession) {
            throw new IllegalStateException("Cannot create new session: there is already an unfinished session for this student and test");
        }

        if (session.getAnswers() == null) {
            session.setAnswers(Collections.emptyList());
        }
        return sessionRepository.save(session);
    }

    public TestSession getSession(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public List<TestSession> getSessionsByStudentId(Long studentId) {
        return sessionRepository.findByStudentId(studentId);
    }

    public List<TestSession> getSessionsByStudentIdAndTestId(Long studentId, Long testId) {
        return sessionRepository.findByStudentIdAndTestId(studentId, testId);
    }

    public List<TestSession> getSessionsByTestId(Long testId) {
        return sessionRepository.findByTestId(testId);
    }

    public TestSession updateSession(Long id, TestSession session) {
        TestSession existingSession = getSession(id);
        existingSession.setAnswers(session.getAnswers());
        
        // Calculate score
        int correctAnswers = (int) session.getAnswers().stream()
                .filter(answer -> answer.getIsCorrect())
                .count();
        int totalQuestions = session.getAnswers().size();
        int score = (int) ((double) correctAnswers / totalQuestions * 100);
        existingSession.setScore(score);
        return sessionRepository.save(existingSession);
    }

    public TestSession finishSession(Long id, List<Answer> answers) {
        TestSession session = getSession(id);
        
        // Calculate score based on correct answers
        int correctAnswers = (int) answers.stream()
                .filter(answer -> answer.getIsCorrect())
                .count();
        int totalQuestions = answers.size();
        int score = totalQuestions > 0 ? (correctAnswers * 100) / totalQuestions : 0;
        session.setAnswers(answers);
        session.setScore(score);
        session.setEndTime(LocalDateTime.now());
        session.setFinished(true);
        return sessionRepository.save(session);
    }

    public TestSession getCurrentSession(Long studentId, Long testId) {
        List<TestSession> sessions = sessionRepository.findByStudentIdAndTestId(studentId, testId);
        return sessions.stream()
                .filter(session -> !session.isFinished())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active session found for student " + studentId + " and test " + testId));
    }
} 