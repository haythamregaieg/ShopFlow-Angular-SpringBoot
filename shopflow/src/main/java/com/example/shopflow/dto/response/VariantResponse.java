package com.example.shopflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantResponse {
    private Long id;
    private Long productId;
    private String nom;
    private String taille;
    private String couleur;
    private Integer stock;
    private BigDecimal prixDelta;
    private String sku;
}
