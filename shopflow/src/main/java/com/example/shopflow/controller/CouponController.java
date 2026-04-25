package com.example.shopflow.controller;

import com.example.shopflow.entity.Coupon;
import com.example.shopflow.entity.User;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.CouponRepository;
import com.example.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public Coupon create(@RequestBody Coupon coupon,
                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        coupon.setSeller(user);
        return couponRepository.save(coupon);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public Coupon update(@PathVariable Long id,
                         @RequestBody Coupon coupon,
                         @AuthenticationPrincipal UserDetails userDetails) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon introuvable"));
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && (existing.getSeller() == null || !existing.getSeller().getId().equals(user.getId()))) {
            throw new ResourceNotFoundException("Coupon introuvable");
        }
        existing.setCode(coupon.getCode());
        existing.setType(coupon.getType());
        existing.setValeur(coupon.getValeur());
        existing.setDateExpiration(coupon.getDateExpiration());
        existing.setUsagesMax(coupon.getUsagesMax());
        existing.setActif(coupon.isActif());
        return couponRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon introuvable"));
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && (existing.getSeller() == null || !existing.getSeller().getId().equals(user.getId()))) {
            throw new ResourceNotFoundException("Coupon introuvable");
        }
        couponRepository.deleteById(id);
    }

    @GetMapping("/validate/{code}")
    public Coupon validate(@PathVariable String code) {
        return couponRepository.findByCodeAndActifTrue(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon invalide : " + code));
    }
}