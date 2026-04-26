package com.example.shopflow.dto.request;

import com.example.shopflow.entity.enums.CouponType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CouponRequest {

    @NotBlank(message = "Le code du coupon est obligatoire")
    private String code;

    @NotNull(message = "Le type du coupon est obligatoire")
    private CouponType type;

    @NotNull(message = "La valeur de remise est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "La valeur de remise doit etre superieure a 0")
    private BigDecimal valeur;

    private LocalDateTime dateExpiration;

    @PositiveOrZero(message = "Le nombre d'usages max doit etre positif")
    private Integer usagesMax;

    private boolean actif = true;
}
