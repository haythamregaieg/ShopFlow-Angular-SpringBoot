package com.example.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String prenom;
    private String nom;
    private String role;
    private boolean actif;
}