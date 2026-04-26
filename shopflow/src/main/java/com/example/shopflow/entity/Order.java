package com.example.shopflow.entity;

import com.example.shopflow.entity.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @Enumerated(EnumType.STRING)
    private OrderStatus statut;

    private String numeroCommande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address adresseLivraison;

    private BigDecimal sousTotal;
    private BigDecimal fraisLivraison;
    private BigDecimal totalTTC;
    private BigDecimal montantRembourse;
    private boolean isNewStatus;
    private LocalDateTime dateCommande;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> lignes;

    @PrePersist
    public void prePersist() {
        this.dateCommande = LocalDateTime.now();
    }
}