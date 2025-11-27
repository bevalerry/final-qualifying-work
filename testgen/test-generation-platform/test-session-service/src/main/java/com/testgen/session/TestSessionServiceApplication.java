package com.testgen.session;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class TestSessionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TestSessionServiceApplication.class, args);
    }
} 