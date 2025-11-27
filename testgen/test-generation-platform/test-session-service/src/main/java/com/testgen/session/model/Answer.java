package com.testgen.session.model;

import lombok.Data;

@Data
public class Answer {
    private Long questionId;
    private Integer selectedOption;
    private boolean isCorrect;

    public boolean getIsCorrect() {
        return this.isCorrect;
    }
} 