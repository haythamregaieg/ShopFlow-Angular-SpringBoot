package com.example.shopflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank(message = "Rue obligatoire")
    private String rue;
    @NotBlank(message = "Ville obligatoire")
    private String ville;
    @NotBlank(message = "Code postal obligatoire")
    private String codePostal;
    @NotBlank(message = "Pays obligatoire")
    private String pays;
    private boolean principal;
}
