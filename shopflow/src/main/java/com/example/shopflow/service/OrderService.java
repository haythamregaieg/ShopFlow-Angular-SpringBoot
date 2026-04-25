package com.example.shopflow.service;

import com.example.shopflow.dto.request.OrderRequest;
import com.example.shopflow.dto.response.OrderItemResponse;
import com.example.shopflow.dto.response.OrderResponse;
import com.example.shopflow.entity.*;
import com.example.shopflow.entity.enums.OrderStatus;
import com.example.shopflow.exception.BadRequestException;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponse createOrder(String email, OrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Cart cart = cartRepository.findByCustomerId(user.getId())
                .orElseThrow(() -> new BadRequestException("Panier vide"));
        if (cart.getLignes().isEmpty()) {
            throw new BadRequestException("Le panier est vide");
        }
        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Adresse introuvable"));

        List<OrderItem> items = cart.getLignes().stream().map(cartItem -> {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantite()) {
                throw new BadRequestException("Stock insuffisant pour : " + product.getNom());
            }
            product.setStock(product.getStock() - cartItem.getQuantite());
            productRepository.save(product);
            return OrderItem.builder()
                    .product(product)
                    .quantite(cartItem.getQuantite())
                    .prixUnitaire(product.getPrix())
                    .build();
        }).collect(Collectors.toList());

        BigDecimal sousTotal = items.stream()
                .map(i -> i.getPrixUnitaire().multiply(BigDecimal.valueOf(i.getQuantite())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal frais = sousTotal.compareTo(BigDecimal.valueOf(100)) >= 0
                ? BigDecimal.ZERO : BigDecimal.valueOf(7.99);

        Order order = Order.builder()
                .customer(user)
                .statut(OrderStatus.PENDING)
                .numeroCommande("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .adresseLivraison(address)
                .sousTotal(sousTotal)
                .fraisLivraison(frais)
                .totalTTC(sousTotal.add(frais))
                .build();

        items.forEach(i -> i.setOrder(order));
        order.setLignes(items);
        Order saved = orderRepository.save(order);

        cart.getLignes().clear();
        cartRepository.save(cart);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return orderRepository.findByCustomerIdOrderByDateCommandeDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        return toResponse(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable")));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        order.setStatut(status);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancel(Long id, String email) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        if (order.getStatut() != OrderStatus.PENDING && order.getStatut() != OrderStatus.PAID) {
            throw new BadRequestException("Impossible d annuler une commande en statut : " + order.getStatut());
        }
        order.setStatut(OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> lignes = o.getLignes() != null
                ? o.getLignes().stream().map(i -> OrderItemResponse.builder()
                        .id(i.getId())
                        .productNom(i.getProduct().getNom())
                        .quantite(i.getQuantite())
                        .prixUnitaire(i.getPrixUnitaire())
                        .sousTotal(i.getPrixUnitaire().multiply(BigDecimal.valueOf(i.getQuantite())))
                        .build()).collect(Collectors.toList())
                : List.of();
        return OrderResponse.builder()
                .id(o.getId())
                .numeroCommande(o.getNumeroCommande())
                .statut(o.getStatut().name())
                .sousTotal(o.getSousTotal())
                .fraisLivraison(o.getFraisLivraison())
                .totalTTC(o.getTotalTTC())
                .dateCommande(o.getDateCommande())
                .lignes(lignes)
                .build();
    }
}