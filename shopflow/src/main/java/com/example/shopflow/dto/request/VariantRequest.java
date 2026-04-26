package com.example.shopflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class VariantRequest {
    private String nom;
    private String taille;
    private String couleur;
    @NotNull
    @Min(0)
    private Integer stock;
    @NotNull
    @Min(0)
    private BigDecimal prixDelta;
    private String sku;
}
