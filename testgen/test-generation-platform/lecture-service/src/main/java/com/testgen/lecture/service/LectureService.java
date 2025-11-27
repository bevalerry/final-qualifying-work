package com.testgen.lecture.service;

import com.testgen.lecture.model.Lecture;
import com.testgen.lecture.repository.LectureRepository;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.SetBucketPolicyArgs;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.ServerException;
import io.minio.errors.XmlParserException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LectureService {

    private final LectureRepository lectureRepository;
    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucketName;

    @PostConstruct
    public void initBucket() {
        try {
            boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build());
            if (!exists) {
                minioClient.makeBucket(
                    MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build());
                String publicReadPolicy = """
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": "*",
                            "Action": ["s3:GetObject"],
                            "Resource": ["arn:aws:s3:::%s/*"]
                        }
                    ]
                }
                """.formatted(bucketName);
                minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                        .bucket(bucketName)
                        .config(publicReadPolicy)
                        .build());
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize MinIO bucket", e);
        }
    }

    public Lecture createLecture(Lecture lecture, MultipartFile file) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String filePath = "lectures/" + fileName;

            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(filePath)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );

            lecture.setFilePath(filePath);
            lecture.setFileName(file.getOriginalFilename());
            lecture.setCreatedAt(LocalDateTime.now());
            lecture.setUpdatedAt(LocalDateTime.now());

            return lectureRepository.save(lecture);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    public Lecture getLecture(Long id) {
        return lectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));
    }

    public List<Lecture> getLecturesByTeacherId(Long teacherId) {
        return lectureRepository.findByTeacherId(teacherId);
    }

    public Page<Lecture> getAllLectures(Pageable pageable) {
        return lectureRepository.findAll(pageable);
    }

    public Lecture updateLecture(Long id, Lecture lecture) {
        Lecture existingLecture = getLecture(id);
        existingLecture.setTitle(lecture.getTitle());
        existingLecture.setDescription(lecture.getDescription());
        existingLecture.setUpdatedAt(LocalDateTime.now());
        return lectureRepository.save(existingLecture);
    }

    public void deleteLecture(Long id, Long userId, String role) {
        Lecture lecture = getLecture(id);

        if ("STUDENT".equals(role)) {
            throw new SecurityException("Студент не может удалять лекции");
        }

        if ("TEACHER".equals(role) && !lecture.getTeacherId().equals(userId)) {
            throw new SecurityException("Вы можете удалять только свои лекции");
        }

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(lecture.getFilePath())
                            .build()
            );
            lectureRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении лекции", e);
        }
    }
} 