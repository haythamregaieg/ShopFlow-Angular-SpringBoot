package com.example.shopflow.controller;

import com.example.shopflow.entity.Coupon;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponRepository couponRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Coupon create(@RequestBody Coupon coupon) {
        return couponRepository.save(coupon);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Coupon update(@PathVariable Long id, @RequestBody Coupon coupon) {
        coupon.setId(id);
        return couponRepository.save(coupon);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        couponRepository.deleteById(id);
    }

    @GetMapping("/validate/{code}")
    public Coupon validate(@PathVariable String code) {
        return couponRepository.findByCodeAndActifTrue(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon invalide : " + code));
    }
}