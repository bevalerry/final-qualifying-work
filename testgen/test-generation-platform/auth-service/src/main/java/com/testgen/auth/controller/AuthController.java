package com.testgen.auth.controller;

import com.testgen.auth.DTOs.UserAuthResponseDTO;
import com.testgen.auth.model.User;
import com.testgen.auth.security.JwtTokenProvider;
import com.testgen.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        authService.register(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<UserAuthResponseDTO> login(@RequestBody User user) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        User authorizedUser = authService.findByUsername(user.getUsername());
        UserAuthResponseDTO userAuthResponseDTO = new UserAuthResponseDTO(
            authorizedUser.getId(),
            jwt,
            authorizedUser.getUsername(),
            authorizedUser.getRole()
        );
        return ResponseEntity.ok(userAuthResponseDTO);
    }

    @GetMapping("/refresh")
    public ResponseEntity<UserAuthResponseDTO> refresh(@RequestHeader("Authorization") String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        if (!tokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }
        System.out.println(token);

        String jwt = tokenProvider.getUpdatedExpirationDateToken(token);
        String username = tokenProvider.getUsernameFromToken(token);
        User user = authService.findByUsername(username);
        UserAuthResponseDTO refreshResponseDTO = new UserAuthResponseDTO(
            user.getId(),
            jwt,
            user.getUsername(),
            user.getRole()
        );

        return ResponseEntity.ok(refreshResponseDTO);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }
} 