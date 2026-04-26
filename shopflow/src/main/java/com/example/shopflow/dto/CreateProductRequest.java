package com.example.shopflow.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateProductRequest {
    private Long sellerId;
    private String nom;
    private String description;
    private BigDecimal prix;
    private BigDecimal prixPromo;
    private Integer stock;
    private List<Long> categoryIds;
    private String images; // comma-separated URLs or filenames for now
}
