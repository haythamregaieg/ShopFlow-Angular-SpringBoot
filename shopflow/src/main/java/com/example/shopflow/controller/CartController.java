package com.example.shopflow.controller;

import com.example.shopflow.dto.request.CartItemRequest;
import com.example.shopflow.dto.response.CartResponse;
import com.example.shopflow.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return cartService.getCart(userDetails.getUsername());
    }

    @PostMapping("/items")
    public CartResponse addItem(@AuthenticationPrincipal UserDetails userDetails,
                                @Valid @RequestBody CartItemRequest request) {
        return cartService.addItem(userDetails.getUsername(), request);
    }

    @PutMapping("/items/{itemId}")
    public CartResponse updateItem(@AuthenticationPrincipal UserDetails userDetails,
                                   @PathVariable Long itemId,
                                   @RequestParam Integer quantite) {
        return cartService.updateItem(userDetails.getUsername(), itemId, quantite);
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(@AuthenticationPrincipal UserDetails userDetails,
                                   @PathVariable Long itemId) {
        return cartService.removeItem(userDetails.getUsername(), itemId);
    }

    @PostMapping("/coupon")
    public CartResponse applyCoupon(@AuthenticationPrincipal UserDetails userDetails,
                                    @RequestParam String code) {
        return cartService.applyCoupon(userDetails.getUsername(), code);
    }

    @DeleteMapping("/coupon")
    public CartResponse removeCoupon(@AuthenticationPrincipal UserDetails userDetails) {
        return cartService.removeCoupon(userDetails.getUsername());
    }
}