package com.example.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productNom;
    private String productImage;
    private BigDecimal prixUnitaire;
    private Integer quantite;
    private BigDecimal sousTotal;
}