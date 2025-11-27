package com.testgen.profile.service;

import com.testgen.profile.model.Profile;
import com.testgen.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    public Profile createProfile(Profile profile) {
        return profileRepository.save(profile);
    }

    public Profile getProfile(Long id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    public Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }

    public Profile updateProfileByUserId(Long userId, Profile profile) {
        Profile existing = profileRepository.findByUserId(userId)
                .orElse(new Profile()); // ← если не найден, создаём

        existing.setUserId(userId);
        existing.setFirstName(profile.getFirstName());
        existing.setLastName(profile.getLastName());
        existing.setMiddleName(profile.getMiddleName());
        existing.setBirthDate(profile.getBirthDate());
        existing.setEmail(profile.getEmail());
        existing.setPhone(profile.getPhone());
        existing.setBio(profile.getBio());

        return profileRepository.save(existing);
    }


    public void deleteProfile(Long id) {
        profileRepository.deleteById(id);
    }
} 