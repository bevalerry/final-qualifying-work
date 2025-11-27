package com.testgen.processing.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String TEST_QUEUE = "test.queue";
    public static final String TEST_EXCHANGE = "test-generation";

    @Bean
    public DirectExchange testGenerationExchange() {
        return new DirectExchange(TEST_EXCHANGE);
    }

    @Bean
    public Queue testQueue() {
        return new Queue(TEST_QUEUE, true);
    }

    @Bean
    public Binding testQueueBinding(Queue testQueue, DirectExchange testGenerationExchange) {
        return BindingBuilder.bind(testQueue).to(testGenerationExchange).with(TEST_QUEUE);
    }
} 