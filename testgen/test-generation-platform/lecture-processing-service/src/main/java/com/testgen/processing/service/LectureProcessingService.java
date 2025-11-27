package com.testgen.processing.service;

import com.testgen.processing.model.TestGenerationRequest;
import io.minio.MinioClient;
import io.minio.GetObjectArgs;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.testgen.processing.config.RabbitConfig;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LectureProcessingService {

    @Autowired
    @Qualifier("insecureRestTemplate")
    private RestTemplate restTemplate;

    private final MinioClient minioClient;
    private final RabbitTemplate rabbitTemplate;

    private final String bucketName = "lectures";
    private final String exchange = RabbitConfig.TEST_EXCHANGE;
    private final String routingKey = RabbitConfig.TEST_QUEUE;

    public void processLecture(TestGenerationRequest request) {
        try {
            String content = getFileContent(request.getFilePath());
            String generatedTest = generateQuestions(request.getLectureId(), content);
            rabbitTemplate.convertAndSend(exchange, routingKey, generatedTest);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process lecture", e);
        }
    }

    private String getFileContent(String filePath) throws Exception {
        byte[] fileBytes;
        try (InputStream stream = minioClient.getObject(
                GetObjectArgs.builder().bucket(bucketName).object(filePath).build())) {
            fileBytes = stream.readAllBytes();
        }

        if (filePath.endsWith(".pdf")) {
            try (PDDocument document = PDDocument.load(fileBytes)) {
                return new PDFTextStripper().getText(document);
            }
        } else if (filePath.endsWith(".doc")) {
            try (HWPFDocument doc = new HWPFDocument(new ByteArrayInputStream(fileBytes));
                 WordExtractor extractor = new WordExtractor(doc)) {
                return extractor.getText();
            }
        } else if (filePath.endsWith(".docx")) {
            try (XWPFDocument docx = new XWPFDocument(new ByteArrayInputStream(fileBytes))) {
                return docx.getParagraphs().stream()
                        .map(p -> p.getText())
                        .collect(Collectors.joining("\n"));
            }
        }

        throw new IllegalArgumentException("Unsupported file format: " + filePath);
    }

    private String generateQuestions(Long lectureId, String lectureText) {
        final String GIGACHAT_API_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";
        final String AUTH_TOKEN = getAccessToken();

        String systemPrompt = """
        Ты — генератор вопросов. Верни ТОЛЬКО JSON в таком формате:
        {
          "questions": [
            {
              "text": "Вопрос по тексту",
              "options": ["Ответ 1", "Ответ 2", "Ответ 3", "Ответ 4"],
              "correctAnswer": <<индекс правильного ответа - тип int, от 0 до 3>>
            }
          ]
        }
        Никаких комментариев, только чистый JSON!""";

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode payload = mapper.createObjectNode();
        payload.put("model", "GigaChat");
        payload.put("temperature", 0.1);
        payload.put("max_tokens", 2000);

        ObjectNode systemMessage = mapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);

        ObjectNode userMessage = mapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.put("content", "Сгенерируй 10 вопросов на основе текста:\n" + lectureText);

        payload.putArray("messages").add(systemMessage).add(userMessage);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(AUTH_TOKEN);
        headers.set("Accept", "application/json");

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    GIGACHAT_API_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(payload.toString(), headers),
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseBody = mapper.readTree(response.getBody());
                String questionsJson = responseBody.path("choices").get(0)
                        .path("message").path("content").asText();

                JsonNode parsed = mapper.readTree(questionsJson);
                ArrayNode questionsArray = (ArrayNode) parsed.path("questions");

                ArrayNode validated = mapper.createArrayNode();
                for (JsonNode question : questionsArray) {
                    if (
                            question.has("correctAnswer") &&
                                    question.get("correctAnswer").isInt() &&
                                    question.has("options") &&
                                    question.get("options").isArray()
                    ) {
                        int index = question.get("correctAnswer").asInt();
                        int optionsSize = question.get("options").size();
                        if (index >= 0 && index < optionsSize) {
                            validated.add(question);
                        }
                    }
                }

                ObjectNode result = mapper.createObjectNode();
                result.put("lectureId", lectureId);
                result.set("questions", validated);

                return mapper.writerWithDefaultPrettyPrinter()
                        .writeValueAsString(result);
            } else {
                throw new RuntimeException("API error: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to call API", e);
        }
    }

    public static String getAccessToken() {
        String authUrl = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
        String scope = "GIGACHAT_API_PERS";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        headers.set("Accept", "application/json");
        headers.set("RqUID", UUID.randomUUID().toString());
        headers.set("Authorization", "Basic ODE0ZGMyMjgtYzdkNi00OWQyLWI0ZjAtZjEzMjAyMDczYWRhOjAzZjg3OGMwLWUzZmItNDQzOC1hNjFkLTIzNGRlNGI3NGE3Yw==");

        String body = "scope=" + scope;

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.exchange(
                authUrl,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
        );

        return (String) response.getBody().get("access_token");
    }
}