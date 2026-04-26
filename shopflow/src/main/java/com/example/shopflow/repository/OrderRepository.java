package com.example.shopflow.repository;

import com.example.shopflow.entity.Order;
import com.example.shopflow.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByDateCommandeDesc(Long customerId);
    Optional<Order> findByNumeroCommande(String numeroCommande);

    @Query("""
            SELECT COUNT(o) > 0
            FROM Order o JOIN o.lignes l
            WHERE o.customer.id = :customerId
              AND l.product.id = :productId
              AND o.statut IN :eligibleStatuses
            """)
    boolean hasPurchasedProduct(@Param("customerId") Long customerId,
                                @Param("productId") Long productId,
                                @Param("eligibleStatuses") List<OrderStatus> eligibleStatuses);

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            JOIN o.lignes l
            JOIN l.product p
            WHERE p.seller.id = :sellerId
            ORDER BY o.dateCommande DESC
            """)
    List<Order> findBySellerIdOrderByDateCommandeDesc(@Param("sellerId") Long sellerId);
}
