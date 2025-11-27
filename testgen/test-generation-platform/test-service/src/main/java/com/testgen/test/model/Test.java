package com.testgen.test.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;

import java.util.List;

@Entity
@Table(name = "tests")
@Data
@NoArgsConstructor
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long lectureId;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private List<Question> questions;

    public record Question(
        Integer id,
        String text,
        List<String> options,
        Integer correctAnswer
    ) {}
}