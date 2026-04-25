package com.example.shopflow.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {

    private Long addressId;
    private String adresseTexte;
    private String ville;
    private String codePostal;
    private String pays;
}