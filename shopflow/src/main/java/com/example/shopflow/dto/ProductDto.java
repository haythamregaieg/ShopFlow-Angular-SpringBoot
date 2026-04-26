package com.example.shopflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Long id;
    private Long sellerId;
    private String nom;
    private String description;
    private BigDecimal prix;
    private BigDecimal prixPromo;
    private Integer stock;
    private List<String> categories;
    private String images;
    private LocalDateTime dateCreation;
}
