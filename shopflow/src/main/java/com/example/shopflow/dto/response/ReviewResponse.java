package com.example.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long customerId;
    private String customerNom;
    private String customerPrenom;
    private String customerEmail;
    private Long productId;
    private String productNom;
    private Integer note;
    private String commentaire;
    private LocalDateTime dateCreation;
    private boolean approuve;
}
