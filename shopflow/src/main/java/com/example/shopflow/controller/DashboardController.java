package com.example.shopflow.controller;

import com.example.shopflow.entity.User;
import com.example.shopflow.dto.response.DashboardResponse;
import com.example.shopflow.dto.response.RecentOrderDto;
import com.example.shopflow.entity.enums.OrderStatus;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardResponse adminDashboard() {
        List<com.example.shopflow.entity.Order> orders = orderRepository.findAll();

        BigDecimal chiffreAffaires = orders.stream()
                .filter(o -> o.getStatut() != null && (o.getStatut() == OrderStatus.PAID || o.getStatut() == OrderStatus.PROCESSING
                        || o.getStatut() == OrderStatus.SHIPPED || o.getStatut() == OrderStatus.DELIVERED))
                .map(o -> o.getTotalTTC() != null ? o.getTotalTTC() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Integer> topProductsMap = new HashMap<>();
        Map<String, BigDecimal> topVendeursMap = new HashMap<>();

        orders.forEach(order -> {
            if (order.getLignes() != null) {
                order.getLignes().forEach(line -> {
                    if (line.getProduct() != null) {
                        String productName = line.getProduct().getNom() != null ? line.getProduct().getNom() : "Produit sans nom";
                        topProductsMap.put(productName, topProductsMap.getOrDefault(productName, 0) + (line.getQuantite() != null ? line.getQuantite() : 0));

                        if (line.getProduct().getSeller() != null) {
                            String seller = line.getProduct().getSeller().getNom() != null ? line.getProduct().getSeller().getNom() : line.getProduct().getSeller().getEmail();
                            BigDecimal lineTotal = (line.getPrixUnitaire() != null ? line.getPrixUnitaire() : BigDecimal.ZERO)
                                    .multiply(BigDecimal.valueOf(line.getQuantite() != null ? line.getQuantite() : 0));
                            topVendeursMap.put(seller, topVendeursMap.getOrDefault(seller, BigDecimal.ZERO).add(lineTotal));
                        }
                    }
                });
            }
        });

        List<RecentOrderDto> recent = orders.stream()
                .sorted(Comparator.comparing(com.example.shopflow.entity.Order::getDateCommande,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(o -> RecentOrderDto.builder()
                        .id(o.getId())
                        .numeroCommande(o.getNumeroCommande())
                        .totalTTC(o.getTotalTTC())
                        .statut(o.getStatut() != null ? o.getStatut().name() : null)
                        .dateCommande(o.getDateCommande())
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalProducts(productRepository.count())
                .totalOrders((long) orders.size())
                .totalReviews(reviewRepository.count())
                .chiffreAffaires(chiffreAffaires)
                .topProducts(topProductsMap.entrySet().stream()
                        .sorted(Map.Entry.<String, Integer>comparingByValue(Comparator.reverseOrder()))
                        .limit(5)
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)))
                .topSellers(topVendeursMap.entrySet().stream()
                        .sorted(Map.Entry.<String, BigDecimal>comparingByValue(Comparator.reverseOrder()))
                        .limit(5)
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)))
                .recentOrders(recent)
                .build();
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public Map<String, Object> sellerDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        List<com.example.shopflow.entity.Order> sellerOrders = orderRepository.findBySellerIdOrderByDateCommandeDesc(user.getId());

        BigDecimal revenue = sellerOrders.stream()
                .filter(o -> o.getStatut() != null && (o.getStatut() == OrderStatus.PAID
                        || o.getStatut() == OrderStatus.PROCESSING
                        || o.getStatut() == OrderStatus.SHIPPED
                        || o.getStatut() == OrderStatus.DELIVERED))
                .flatMap(o -> o.getLignes().stream())
                .filter(l -> l.getProduct() != null && l.getProduct().getSeller() != null
                        && l.getProduct().getSeller().getId().equals(user.getId()))
                .map(l -> {
                    BigDecimal prix = l.getPrixUnitaire() != null ? l.getPrixUnitaire() : BigDecimal.ZERO;
                    return prix.multiply(BigDecimal.valueOf(l.getQuantite() != null ? l.getQuantite() : 0));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrders = sellerOrders.stream()
                .filter(o -> o.getStatut() != null && (o.getStatut() == OrderStatus.PAID || o.getStatut() == OrderStatus.PENDING || o.getStatut() == OrderStatus.PROCESSING))
                .count();

        long lowStockAlerts = productRepository.findBySellerId(user.getId(), org.springframework.data.domain.PageRequest.of(0, 1000))
                .getContent().stream()
                .filter(p -> p.getStock() != null && p.getStock() <= 5)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", sellerOrders.size());
        stats.put("totalProducts", productRepository.findBySellerId(user.getId(), org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements());
        stats.put("revenus", revenue);
        stats.put("commandesEnAttente", pendingOrders);
        stats.put("alertesStockFaible", lowStockAlerts);
        stats.put("email", user.getEmail());
        stats.put("nom", user.getNom());
        stats.put("role", user.getRole());
        stats.put("recentOrders", sellerOrders.stream()
                .sorted(Comparator.comparing(com.example.shopflow.entity.Order::getDateCommande,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(o -> RecentOrderDto.builder()
                        .id(o.getId())
                        .numeroCommande(o.getNumeroCommande())
                        .totalTTC(o.getTotalTTC())
                        .statut(o.getStatut() != null ? o.getStatut().name() : null)
                        .dateCommande(o.getDateCommande())
                        .build())
                .toList());
        
        return stats;
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public Map<String, Object> customerDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        Map<String, Object> stats = new HashMap<>();
        List<com.example.shopflow.entity.Order> orders = orderRepository.findByCustomerIdOrderByDateCommandeDesc(user.getId());
        
        long commandesEnCours = orders.stream()
                .filter(o -> o.getStatut() != null && (o.getStatut() == OrderStatus.PAID || o.getStatut() == OrderStatus.PROCESSING || o.getStatut() == OrderStatus.SHIPPED))
                .count();
        BigDecimal totalDepense = orders.stream()
                .filter(o -> o.getStatut() != null && o.getStatut() != OrderStatus.CANCELLED && o.getStatut() != OrderStatus.REFUNDED)
                .map(o -> o.getTotalTTC() != null ? o.getTotalTTC() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal panierMoyen = orders.isEmpty()
                ? BigDecimal.ZERO
                : totalDepense.divide(BigDecimal.valueOf(orders.size()), 2, java.math.RoundingMode.HALF_UP);
        Map<String, Long> commandesParStatut = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getStatut() != null ? o.getStatut().name() : "UNKNOWN",
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        Map<YearMonth, BigDecimal> depensesBrutes = orders.stream()
                .filter(o -> o.getDateCommande() != null)
                .collect(Collectors.groupingBy(
                        o -> YearMonth.from(o.getDateCommande()),
                        Collectors.mapping(
                                o -> o.getTotalTTC() != null ? o.getTotalTTC() : BigDecimal.ZERO,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));
        Map<String, BigDecimal> depensesParMois = depensesBrutes.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        e -> e.getKey().toString(),
                        Map.Entry::getValue,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        List<Map<String, Object>> derniersAvis = reviewRepository.findAll().stream()
                .filter(r -> r.getCustomer() != null && r.getCustomer().getId().equals(user.getId()))
                .sorted((r1, r2) -> r2.getId().compareTo(r1.getId())) // assuming higher ID is more recent
                .limit(3)
                .map(r -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", r.getId());
                    item.put("note", r.getNote());
                    item.put("commentaire", r.getCommentaire());
                    item.put("dateCreation", r.getDateCreation());
                    item.put("productNom", r.getProduct() != null ? r.getProduct().getNom() : null);
                    return item;
                })
                .toList();

        stats.put("totalOrders", orders.size());
        stats.put("commandesEnCours", commandesEnCours);
        stats.put("totalDepense", totalDepense);
        stats.put("panierMoyen", panierMoyen);
        stats.put("commandesParStatut", commandesParStatut);
        stats.put("depensesParMois", depensesParMois);
        stats.put("derniersAvis", derniersAvis);
        stats.put("email", user.getEmail());
        stats.put("nom", user.getNom());
        stats.put("recentOrders", orders.stream()
                .limit(5)
                .map(o -> RecentOrderDto.builder()
                        .id(o.getId())
                        .numeroCommande(o.getNumeroCommande())
                        .totalTTC(o.getTotalTTC())
                        .statut(o.getStatut() != null ? o.getStatut().name() : null)
                        .dateCommande(o.getDateCommande())
                        .build())
                .toList());
        
        return stats;
    }
}
