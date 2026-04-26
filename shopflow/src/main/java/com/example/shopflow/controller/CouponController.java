package com.example.shopflow.controller;

import com.example.shopflow.dto.request.CouponRequest;
import com.example.shopflow.dto.response.CouponResponse;
import com.example.shopflow.entity.Coupon;
import com.example.shopflow.entity.User;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.CouponRepository;
import com.example.shopflow.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public List<CouponResponse> list(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails.getUsername());
        boolean isAdmin = isAdmin(userDetails);
        List<Coupon> coupons = isAdmin
                ? couponRepository.findAllByOrderByIdDesc()
                : couponRepository.findBySellerIdOrderByIdDesc(user.getId());
        return coupons.stream().map(this::toResponse).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public CouponResponse create(@Valid @RequestBody CouponRequest request,
                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails.getUsername());
        Coupon coupon = Coupon.builder()
                .seller(user)
                .code(request.getCode())
                .type(request.getType())
                .valeur(request.getValeur())
                .dateExpiration(request.getDateExpiration())
                .usagesMax(request.getUsagesMax())
                .usagesActuels(0)
                .actif(request.isActif())
                .build();
        return toResponse(couponRepository.save(coupon));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public CouponResponse update(@PathVariable Long id,
                                 @Valid @RequestBody CouponRequest request,
                                 @AuthenticationPrincipal UserDetails userDetails) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon introuvable"));
        User user = getUser(userDetails.getUsername());
        boolean isAdmin = isAdmin(userDetails);
        if (!isAdmin && (existing.getSeller() == null || !existing.getSeller().getId().equals(user.getId()))) {
            throw new ResourceNotFoundException("Coupon introuvable");
        }
        existing.setCode(request.getCode());
        existing.setType(request.getType());
        existing.setValeur(request.getValeur());
        existing.setDateExpiration(request.getDateExpiration());
        existing.setUsagesMax(request.getUsagesMax());
        existing.setActif(request.isActif());
        return toResponse(couponRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon introuvable"));
        User user = getUser(userDetails.getUsername());
        boolean isAdmin = isAdmin(userDetails);
        if (!isAdmin && (existing.getSeller() == null || !existing.getSeller().getId().equals(user.getId()))) {
            throw new ResourceNotFoundException("Coupon introuvable");
        }
        couponRepository.deleteById(id);
    }

    @GetMapping("/validate/{code}")
    public CouponResponse validate(@PathVariable String code) {
        Coupon coupon = couponRepository.findByCodeAndActifTrue(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon invalide : " + code));
        return toResponse(coupon);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    private boolean isAdmin(UserDetails userDetails) {
        return userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .type(coupon.getType())
                .valeur(coupon.getValeur())
                .dateExpiration(coupon.getDateExpiration())
                .usagesMax(coupon.getUsagesMax())
                .usagesActuels(coupon.getUsagesActuels())
                .actif(coupon.isActif())
                .build();
    }
}
