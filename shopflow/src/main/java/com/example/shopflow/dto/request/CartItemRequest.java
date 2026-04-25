package com.example.shopflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {

    @NotNull(message = "Product ID obligatoire")
    private Long productId;

    private Long variantId;

    @NotNull
    @Min(value = 1, message = "Quantite minimum 1")
    private Integer quantite;
}