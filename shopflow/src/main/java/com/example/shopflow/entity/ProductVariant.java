package com.example.shopflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Generic name (optional)
    private String nom; // e.g., 'Size M', 'Color Red'
    // Specific attributes used by cart/order code
    private String taille;
    private String couleur;
    private Integer stock;
    private BigDecimal prix;
    private BigDecimal prixDelta;
    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
}

