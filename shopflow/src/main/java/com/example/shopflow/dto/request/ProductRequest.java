package com.example.shopflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {

    @NotBlank(message = "Nom obligatoire")
    private String nom;

    private String description;

    @NotNull
    @Positive(message = "Prix doit etre positif")
    private BigDecimal prix;

    private BigDecimal prixPromo;

    @NotNull
    @PositiveOrZero(message = "Stock doit etre positif ou zero")
    private Integer stock;

    private String images;
    private List<Long> categoryIds;
    private BigDecimal fraisLivraisonLocal;
    private BigDecimal fraisLivraisonInternational;
}
