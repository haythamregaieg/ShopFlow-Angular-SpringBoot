package com.example.shopflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentOrderDto {
    private Long id;
    private String numeroCommande;
    private BigDecimal totalTTC;
    private String statut;
    private LocalDateTime dateCommande;
}
