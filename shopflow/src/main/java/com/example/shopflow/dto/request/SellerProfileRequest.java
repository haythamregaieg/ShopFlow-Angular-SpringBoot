package com.example.shopflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SellerProfileRequest {

    @NotBlank(message = "Nom de boutique obligatoire")
    private String nomBoutique;

    private String description;
    private String logo;
}