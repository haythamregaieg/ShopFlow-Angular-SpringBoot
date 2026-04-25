package com.example.shopflow.service;

import com.example.shopflow.dto.request.CartItemRequest;
import com.example.shopflow.dto.response.CartItemResponse;
import com.example.shopflow.dto.response.CartResponse;
import com.example.shopflow.entity.*;
import com.example.shopflow.entity.enums.CouponType;
import com.example.shopflow.exception.BadRequestException;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    @Transactional
    public CartResponse getCart(String email) {
        User user = getUser(email);
        Cart cart = cartRepository.findByCustomerId(user.getId())
                .orElseGet(() -> createCart(user));
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String email, CartItemRequest request) {
        User user = getUser(email);
        Cart cart = cartRepository.findByCustomerId(user.getId())
                .orElseGet(() -> createCart(user));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        if (!product.isActif()) {
            throw new BadRequestException("Produit non disponible");
        }
        if (product.getStock() < request.getQuantite()) {
            throw new BadRequestException("Stock insuffisant : " + product.getStock());
        }
        CartItem existingItem = cart.getLignes().stream()
                .filter(i -> i.getProduct().getId().equals(request.getProductId()))
                .findFirst().orElse(null);
        if (existingItem != null) {
            int newQty = existingItem.getQuantite() + request.getQuantite();
            if (product.getStock() < newQty) {
                throw new BadRequestException("Stock insuffisant pour cette quantite");
            }
            existingItem.setQuantite(newQty);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantite(request.getQuantite())
                    .build();
            cart.getLignes().add(item);
        }
        cart.setDateModification(LocalDateTime.now());
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItem(String email, Long itemId, Integer quantite) {
        User user = getUser(email);
        Cart cart = cartRepository.findByCustomerId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Panier introuvable"));
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Article introuvable"));
        if (quantite <= 0) {
            cart.getLignes().removeIf(i -> i.getId().equals(itemId));
        } else {
            if (item.getProduct().getStock() < quantite) {
                throw new BadRequestException("Stock insuffisant");
            }
            item.setQuantite(quantite);
            cartItemRepository.save(item);
        }
        cart.setDateModification(LocalDateTime.now());
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeItem(String email, Long itemId) {
        User user = getUser(email);
        Cart cart = cartRepository.findByCustomerId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Panier introuvable"));
        cart.getLignes().removeIf(i -> i.getId().equals(itemId));
        cart.setDateModification(LocalDateTime.now());
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse applyCoupon(String email, String code) {
        User user = getUser(email);
        Cart cart = cartRepository.findByCustomerId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Panier introuvable"));
        Coupon coupon = couponRepository.findByCodeAndActifTrue(code)
                .orElseThrow(() -> new BadRequestException("Coupon invalide : " + code));
        if (coupon.getDateExpiration() != null &&
            coupon.getDateExpiration().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon expire");
        }
        cart.setCouponCode(code);
        cart.setDateModification(LocalDateTime.now());
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeCoupon(String email) {
        User user = getUser(email);
        Cart cart = cartRepository.findByCustomerId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Panier introuvable"));
        cart.setCouponCode(null);
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(Cart cart) {
        cart.getLignes().clear();
        cart.setCouponCode(null);
        cart.setDateModification(LocalDateTime.now());
        cartRepository.save(cart);
    }

    private Cart createCart(User user) {
        Cart cart = Cart.builder()
                .customer(user)
                .lignes(new ArrayList<>())
                .dateModification(LocalDateTime.now())
                .build();
        return cartRepository.save(cart);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    @Transactional
    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> lignes = cart.getLignes().stream().map(item -> {
            BigDecimal prix = item.getProduct().getPrixPromo() != null
                    ? item.getProduct().getPrixPromo()
                    : item.getProduct().getPrix();
            BigDecimal sous = prix.multiply(BigDecimal.valueOf(item.getQuantite()));
            return CartItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productNom(item.getProduct().getNom())
                    .productImage(item.getProduct().getImages())
                    .prixUnitaire(prix)
                    .quantite(item.getQuantite())
                    .sousTotal(sous)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal sousTotal = lignes.stream()
                .map(CartItemResponse::getSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remise = BigDecimal.ZERO;
        if (cart.getCouponCode() != null) {
            Coupon coupon = couponRepository.findByCodeAndActifTrue(cart.getCouponCode()).orElse(null);
            if (coupon != null) {
                if (coupon.getType() == CouponType.PERCENT) {
                    remise = sousTotal.multiply(coupon.getValeur()).divide(BigDecimal.valueOf(100));
                } else {
                    remise = coupon.getValeur();
                }
            }
        }

        BigDecimal sousApresRemise = sousTotal.subtract(remise).max(BigDecimal.ZERO);
        BigDecimal frais = sousApresRemise.compareTo(BigDecimal.valueOf(100)) >= 0
                ? BigDecimal.ZERO : BigDecimal.valueOf(7.99);
        BigDecimal total = sousApresRemise.add(frais);

        return CartResponse.builder()
                .id(cart.getId())
                .lignes(lignes)
                .couponCode(cart.getCouponCode())
                .remise(remise)
                .sousTotal(sousTotal)
                .fraisLivraison(frais)
                .totalTTC(total)
                .build();
    }
}