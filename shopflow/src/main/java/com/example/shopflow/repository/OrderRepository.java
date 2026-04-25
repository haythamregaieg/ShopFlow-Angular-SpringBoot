package com.example.shopflow.repository;

import com.example.shopflow.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByDateCommandeDesc(Long customerId);
    Optional<Order> findByNumeroCommande(String numeroCommande);
}