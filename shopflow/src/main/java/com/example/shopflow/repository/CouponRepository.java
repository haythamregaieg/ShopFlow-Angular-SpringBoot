package com.example.shopflow.repository;

import com.example.shopflow.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeAndActifTrue(String code);
    List<Coupon> findBySellerIdOrderByIdDesc(Long sellerId);
    List<Coupon> findAllByOrderByIdDesc();
}
