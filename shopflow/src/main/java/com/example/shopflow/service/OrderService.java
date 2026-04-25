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
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional
    public OrderResponse createOrder(String email, OrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Cart cart = cartRepository.findByCustomerId(user.getId())
                .orElseThrow(() -> new BadRequestException("Panier vide"));
        if (cart.getLignes().isEmpty()) {
            throw new BadRequestException("Le panier est vide");
        }
        Address address = resolveDeliveryAddress(user, request);

        List<OrderItem> items = cart.getLignes().stream().map(cartItem -> {
            Product product = cartItem.getProduct();
            ProductVariant variant = cartItem.getVariant();
            if (variant != null) {
                if (variant.getStock() < cartItem.getQuantite()) {
                    throw new BadRequestException("Stock insuffisant pour la variante : " + product.getNom());
                }
                variant.setStock(variant.getStock() - cartItem.getQuantite());
                productVariantRepository.save(variant);
            } else {
                if (product.getStock() < cartItem.getQuantite()) {
                    throw new BadRequestException("Stock insuffisant pour : " + product.getNom());
                }
                product.setStock(product.getStock() - cartItem.getQuantite());
            }
            productRepository.save(product);
            BigDecimal prixBase = product.getPrixPromo() != null ? product.getPrixPromo() : product.getPrix();
            BigDecimal prixUnitaire = variant != null && variant.getPrixDelta() != null
                    ? prixBase.add(variant.getPrixDelta())
                    : prixBase;
            return OrderItem.builder()
                    .product(product)
                    .variant(variant)
                    .quantite(cartItem.getQuantite())
                    .prixUnitaire(prixUnitaire)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal sousTotal = items.stream()
                .map(i -> i.getPrixUnitaire().multiply(BigDecimal.valueOf(i.getQuantite())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal frais = items.stream()
                .map(i -> resolveShippingFee(i.getProduct(), address))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long nextOrderNumber = orderRepository.count() + 1;
        String numeroCommande = String.format("ORD-%d-%05d", LocalDate.now().getYear(), nextOrderNumber);

        Order order = Order.builder()
                .customer(user)
                .statut(OrderStatus.PENDING)
                .numeroCommande(numeroCommande)
                .adresseLivraison(address)
                .sousTotal(sousTotal)
                .fraisLivraison(frais)
                .totalTTC(sousTotal.add(frais))
                .montantRembourse(BigDecimal.ZERO)
                .isNewStatus(true)
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
    public OrderResponse getById(Long id, String email, java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        
        boolean isAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = order.getCustomer() != null && order.getCustomer().getEmail().equals(email);
        
        if (!isAdmin && !isOwner) {
            throw new BadRequestException("Vous n'êtes pas autorisé à consulter cette commande");
        }
        
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        if (!isValidStatusTransition(order.getStatut(), status)) {
            throw new BadRequestException("Transition invalide : " + order.getStatut() + " -> " + status);
        }
        order.setStatut(status);
        order.setNewStatus(true);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancel(Long id, String email) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        if (email != null && order.getCustomer() != null && !order.getCustomer().getEmail().equals(email)) {
            throw new BadRequestException("Commande non autorisee");
        }
        if (order.getStatut() != OrderStatus.PENDING && order.getStatut() != OrderStatus.PAID) {
            throw new BadRequestException("Impossible d annuler une commande en statut : " + order.getStatut());
        }
        if (order.getStatut() == OrderStatus.PAID) {
            order.setStatut(OrderStatus.REFUNDED);
            order.setMontantRembourse(order.getTotalTTC());
        } else {
            order.setStatut(OrderStatus.CANCELLED);
        }
        order.setNewStatus(true);
        return toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
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
                .montantRembourse(o.getMontantRembourse())
                .isNewStatus(o.isNewStatus())
                .dateCommande(o.getDateCommande())
                .lignes(lignes)
                .build();
    }

    private boolean isValidStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return true;
        }
        return switch (current) {
            case PENDING -> next == OrderStatus.PAID || next == OrderStatus.CANCELLED;
            case PAID -> next == OrderStatus.PROCESSING || next == OrderStatus.REFUNDED;
            case PROCESSING -> next == OrderStatus.SHIPPED;
            case SHIPPED -> next == OrderStatus.DELIVERED;
            default -> false;
        };
    }

    private BigDecimal resolveShippingFee(Product product, Address address) {
        String pays = address.getPays() != null ? address.getPays().trim().toLowerCase() : "";
        boolean local = pays.equals("tunisie") || pays.equals("tn");
        if (local) {
            return product.getFraisLivraisonLocal() != null ? product.getFraisLivraisonLocal() : BigDecimal.ZERO;
        }
        return product.getFraisLivraisonInternational() != null ? product.getFraisLivraisonInternational() : BigDecimal.ZERO;
    }

    private Address resolveDeliveryAddress(User user, OrderRequest request) {
        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Adresse introuvable"));
            if (!address.getUser().getId().equals(user.getId())) {
                throw new BadRequestException("Adresse non autorisee");
            }
            return address;
        }
        if (request.getAdresseTexte() == null || request.getAdresseTexte().isBlank()) {
            throw new BadRequestException("Adresse de livraison obligatoire");
        }
        Address address = Address.builder()
                .user(user)
                .rue(request.getAdresseTexte())
                .ville(request.getVille() != null ? request.getVille() : "")
                .codePostal(request.getCodePostal() != null ? request.getCodePostal() : "")
                .pays(request.getPays() != null ? request.getPays() : "Tunisie")
                .principal(false)
                .build();
        return addressRepository.save(address);
    }
}