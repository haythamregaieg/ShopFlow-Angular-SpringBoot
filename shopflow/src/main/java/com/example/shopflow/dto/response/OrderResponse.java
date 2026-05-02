package com.example.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String numeroCommande;
    private String statut;
    private String customerNom;
    private String customerPrenom;
    private String customerEmail;
    private String telephone;
    private AddressResponse adresseLivraison;
    private BigDecimal sousTotal;
    private String couponCode;
    private BigDecimal remise;
    private BigDecimal fraisLivraison;
    private BigDecimal totalTTC;
    private BigDecimal montantRembourse;
    private boolean isNewStatus;
    private LocalDateTime dateCommande;
    private List<OrderItemResponse> lignes;
}
