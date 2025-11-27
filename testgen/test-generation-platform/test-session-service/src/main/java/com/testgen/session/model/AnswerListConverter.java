package com.testgen.session.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.List;

@Converter
public class AnswerListConverter implements AttributeConverter<List<Answer>, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<Answer> answers) {
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (Exception e) {
            throw new RuntimeException("Error converting answers to JSON", e);
        }
    }

    @Override
    public List<Answer> convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<Answer>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Error converting JSON to answers", e);
        }
    }
} 