package com.example.shopflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserProfileRequest {

    @NotBlank(message = "Prenom obligatoire")
    private String prenom;

    @NotBlank(message = "Nom obligatoire")
    private String nom;
}
