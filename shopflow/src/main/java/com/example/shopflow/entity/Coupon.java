package com.example.shopflow.entity;

import com.example.shopflow.entity.enums.CouponType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private User seller;

    @Column(unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    private CouponType type;

    private BigDecimal valeur;
    private LocalDateTime dateExpiration;
    private Integer usagesMax;
    @Builder.Default
    private Integer usagesActuels = 0;
    @Builder.Default
    private boolean actif = true;
}