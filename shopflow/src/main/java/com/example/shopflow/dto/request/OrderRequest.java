package com.example.shopflow.dto.request;

import lombok.Data;

@Data
public class OrderRequest {

    private Long addressId;
    private String adresseTexte;
    private String ville;
    private String codePostal;
    private String pays;
}