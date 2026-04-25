package com.example.shopflow.dto.request;

import com.example.shopflow.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Mot de passe obligatoire")
    @Size(min = 8, message = "Mot de passe minimum 8 caracteres")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._#^()\\-+=]).{8,}$",
            message = "Mot de passe faible : min 8, majuscule, minuscule, chiffre, symbole"
    )
    private String motDePasse;

    @NotBlank(message = "Prenom obligatoire")
    private String prenom;

    @NotBlank(message = "Nom obligatoire")
    private String nom;

    private Role role = Role.CUSTOMER;
    private String nomBoutique;
    private String logoBoutique;
    private String descriptionBoutique;
}