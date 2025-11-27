package com.testgen.test.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testgen.test.model.Test;
import com.testgen.test.repository.TestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestService {

    private static final String TEST_QUEUE = "test.queue";

    @Value("${rabbitmq.queue}")
    private String exchange;

    private final TestRepository testRepository;
    private final ObjectMapper objectMapper;

    public Test getTest(Long id) {
        return testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));
    }

    public Test getTestByLectureId(Long lectureId) {
        return testRepository.findByLectureId(lectureId)
                .orElseThrow(() -> new RuntimeException("Test not found"));
    }

    public void deleteTest(Long id) {
        testRepository.deleteById(id);
    }

    @RabbitListener(queues = TEST_QUEUE)
    public void handleTestCreation(String testJson) {
        try {
            Test test = objectMapper.readValue(testJson, Test.class);
            testRepository.save(test);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process test creation", e);
        }
    }
} 