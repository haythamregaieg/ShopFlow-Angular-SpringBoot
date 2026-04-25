package com.example.shopflow.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {

    @NotNull(message = "Adresse de livraison obligatoire")
    private Long addressId;
}