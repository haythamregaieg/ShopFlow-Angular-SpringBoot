package com.example.shopflow.dto.response;

import com.example.shopflow.entity.enums.CouponType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class CouponResponse {
    private Long id;
    private String code;
    private CouponType type;
    private BigDecimal valeur;
    private LocalDateTime dateExpiration;
    private Integer usagesMax;
    private Integer usagesActuels;
    private boolean actif;
}
