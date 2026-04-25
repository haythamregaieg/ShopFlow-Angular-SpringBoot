package com.example.shopflow.controller;

import com.example.shopflow.entity.User;
import com.example.shopflow.entity.enums.Role;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> adminDashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalReviews", reviewRepository.count());
        stats.put("recentOrders", orderRepository.findAll()
                .stream().limit(5).toList());
        return stats;
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public Map<String, Object> sellerDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productRepository.findBySellerId(user.getId(), null).getTotalElements());
        stats.put("email", user.getEmail());
        stats.put("nom", user.getNom());
        stats.put("role", user.getRole());
        return stats;
    }

    @GetMapping("/customer")
    public Map<String, Object> customerDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", orderRepository
                .findByCustomerIdOrderByDateCommandeDesc(user.getId()).size());
        stats.put("email", user.getEmail());
        stats.put("nom", user.getNom());
        stats.put("recentOrders", orderRepository
                .findByCustomerIdOrderByDateCommandeDesc(user.getId())
                .stream().limit(3).toList());
        return stats;
    }
}