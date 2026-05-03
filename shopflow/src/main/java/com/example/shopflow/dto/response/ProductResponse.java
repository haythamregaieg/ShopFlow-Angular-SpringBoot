package com.example.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String nom;
    private String description;
    private BigDecimal prix;
    private BigDecimal prixPromo;
    private Integer stock;
    private String images;
    private boolean actif;
    private LocalDateTime dateCreation;
    private String sellerNom;
    private List<String> categories;
    private List<Long> categoryIds;
    private List<CategoryInfo> categoryDetails;
    private Double noteMoyenne;
    private BigDecimal fraisLivraisonLocal;
    private BigDecimal fraisLivraisonInternational;
    private boolean promotion;
    private Integer pourcentageRemise;

    @Data
    @Builder
    public static class CategoryInfo {
        private Long id;
        private String nom;
        private Long parentId;
        private String parentNom;
    }
}
