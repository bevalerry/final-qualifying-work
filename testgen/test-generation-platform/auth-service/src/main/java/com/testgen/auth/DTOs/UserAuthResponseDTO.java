package com.testgen.auth.DTOs;

import com.testgen.auth.model.User.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserAuthResponseDTO {
  private Long id;
  private String token;
  private String username;
  private Role role;
}