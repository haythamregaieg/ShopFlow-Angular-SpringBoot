package com.example.shopflow.service;

import com.example.shopflow.dto.request.OrderRequest;
import com.example.shopflow.dto.response.OrderItemResponse;
import com.example.shopflow.dto.response.OrderResponse;
import com.example.shopflow.dto.response.AddressResponse;
import com.example.shopflow.entity.Address;
import com.example.shopflow.entity.Cart;
import com.example.shopflow.entity.Coupon;
import com.example.shopflow.entity.Order;
import com.example.shopflow.entity.OrderItem;
import com.example.shopflow.entity.Product;
import com.example.shopflow.entity.ProductVariant;
import com.example.shopflow.entity.User;
import com.example.shopflow.entity.enums.CouponType;
import com.example.shopflow.entity.enums.OrderStatus;
import com.example.shopflow.exception.BadRequestException;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.AddressRepository;
import com.example.shopflow.repository.CartRepository;
import com.example.shopflow.repository.CouponRepository;
import com.example.shopflow.repository.OrderRepository;
import com.example.shopflow.repository.ProductRepository;
import com.example.shopflow.repository.ProductVariantRepository;
import com.example.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    // ── Frais de livraison par gouvernorat tunisien ───────────────────────────
    private static final Map<String, BigDecimal> FRAIS_PAR_VILLE;
    static {
        Map<String, BigDecimal> m = new HashMap<>();
        m.put("Tunis",       BigDecimal.valueOf(3.00));
        m.put("Ariana",      BigDecimal.valueOf(3.00));
        m.put("Ben Arous",   BigDecimal.valueOf(3.00));
        m.put("Manouba",     BigDecimal.valueOf(3.00));
        m.put("Nabeul",      BigDecimal.valueOf(5.00));
        m.put("Zaghouan",    BigDecimal.valueOf(5.00));
        m.put("Bizerte",     BigDecimal.valueOf(5.00));
        m.put("Beja",        BigDecimal.valueOf(7.00));
        m.put("Jendouba",    BigDecimal.valueOf(7.00));
        m.put("Le Kef",      BigDecimal.valueOf(7.00));
        m.put("Siliana",     BigDecimal.valueOf(7.00));
        m.put("Sousse",      BigDecimal.valueOf(5.00));
        m.put("Monastir",    BigDecimal.valueOf(5.00));
        m.put("Mahdia",      BigDecimal.valueOf(6.00));
        m.put("Sfax",        BigDecimal.valueOf(6.00));
        m.put("Kairouan",    BigDecimal.valueOf(6.00));
        m.put("Kasserine",   BigDecimal.valueOf(8.00));
        m.put("Sidi Bouzid", BigDecimal.valueOf(8.00));
        m.put("Gabes",       BigDecimal.valueOf(8.00));
        m.put("Medenine",    BigDecimal.valueOf(9.00));
        m.put("Tataouine",   BigDecimal.valueOf(10.00));
        m.put("Gafsa",       BigDecimal.valueOf(8.00));
        m.put("Tozeur",      BigDecimal.valueOf(9.00));
        m.put("Kebili",      BigDecimal.valueOf(9.00));
        FRAIS_PAR_VILLE = java.util.Collections.unmodifiableMap(m);
    }

    public static BigDecimal calculerFrais(String ville, BigDecimal sousApresRemise) {
        if (sousApresRemise != null && sousApresRemise.compareTo(BigDecimal.valueOf(100)) >= 0) {
            return BigDecimal.ZERO;
        }
        if (ville != null && FRAIS_PAR_VILLE.containsKey(ville)) {
            return FRAIS_PAR_VILLE.get(ville);
        }
        return BigDecimal.valueOf(7.99);
    }

    public static Map<String, BigDecimal> getFraisParVille() {
        return FRAIS_PAR_VILLE;
    }

    // ─────────────────────────────────────────────────────────────────────────

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CouponRepository couponRepository;

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
                productRepository.save(product);
            }
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

        // Appliquer le coupon du panier
        BigDecimal remise = BigDecimal.ZERO;
        String couponCode = cart.getCouponCode();
        if (couponCode != null) {
            Coupon coupon = couponRepository.findByCodeAndActifTrue(couponCode).orElse(null);
            if (coupon != null) {
                if (coupon.getType() == CouponType.PERCENT) {
                    remise = sousTotal.multiply(coupon.getValeur()).divide(BigDecimal.valueOf(100));
                } else {
                    remise = coupon.getValeur().min(sousTotal);
                }
                coupon.setUsagesActuels(coupon.getUsagesActuels() + 1);
                if (coupon.getUsagesMax() != null && coupon.getUsagesActuels() >= coupon.getUsagesMax()) {
                    coupon.setActif(false);
                }
                couponRepository.save(coupon);
            } else {
                couponCode = null;
            }
        }

        BigDecimal sousApresRemise = sousTotal.subtract(remise).max(BigDecimal.ZERO);
        BigDecimal frais = calculerFrais(address.getVille(), sousApresRemise);

        long nextOrderNumber = orderRepository.count() + 1;
        String numeroCommande = String.format("ORD-%d-%05d", LocalDate.now().getYear(), nextOrderNumber);

        Order order = Order.builder()
                .customer(user)
                .statut(OrderStatus.PENDING)
                .numeroCommande(numeroCommande)
                .adresseLivraison(address)
                .telephone(request.getTelephone())
                .sousTotal(sousTotal)
                .couponCode(couponCode)
                .remise(remise)
                .fraisLivraison(frais)
                .totalTTC(sousApresRemise.add(frais))
                .montantRembourse(BigDecimal.ZERO)
                .isNewStatus(true)
                .build();

        items.forEach(i -> i.setOrder(order));
        order.setLignes(items);
        Order saved = orderRepository.save(order);

        cart.getLignes().clear();
        cart.setCouponCode(null);
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
    public List<OrderResponse> getSellerOrders(String email, boolean isAdmin) {
        if (isAdmin) {
            return orderRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
        }
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return orderRepository.findBySellerIdOrderByDateCommandeDesc(seller.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long id, String email,
            java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        boolean isAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = order.getCustomer() != null && order.getCustomer().getEmail().equals(email);
        boolean isSeller = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_SELLER"));
        boolean sellerCanView = false;
        if (isSeller && !isAdmin) {
            User seller = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
            sellerCanView = isSellerParticipant(order, seller.getId());
        }
        if (!isAdmin && !isOwner && !sellerCanView) {
            throw new BadRequestException("Vous n'etes pas autorise a consulter cette commande");
        }
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        if (order.getStatut() == status) return toResponse(order);
        if (!isValidStatusTransition(order.getStatut(), status)) {
            throw new BadRequestException("Transition invalide : " + order.getStatut() + " -> " + status);
        }
        if (status == OrderStatus.CANCELLED || status == OrderStatus.REFUNDED) {
            restockOrder(order);
        }
        order.setStatut(status);
        order.setNewStatus(true);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateStatusForUser(Long id, OrderStatus status, String email, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        if (!isAdmin) {
            User seller = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
            if (!isSellerParticipant(order, seller.getId())) {
                throw new AccessDeniedException("Vous ne pouvez pas modifier cette commande");
            }
        }
        return updateStatus(id, status);
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
        restockOrder(order);
        order.setNewStatus(true);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse markAsSeen(Long id, String email) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        boolean isOwner = order.getCustomer() != null && order.getCustomer().getEmail().equals(email);
        if (!isOwner) throw new BadRequestException("Non autorise");
        order.setNewStatus(false);
        return toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> lignes = o.getLignes() != null
            ? o.getLignes().stream().map(i -> {
                Long sellerId = null;
                String sellerNom = null;
                if (i.getProduct() != null && i.getProduct().getSeller() != null) {
                    sellerId = i.getProduct().getSeller().getId();
                    sellerNom = i.getProduct().getSeller().getNom();
                }
                return OrderItemResponse.builder()
                    .id(i.getId())
                    .productNom(i.getProduct().getNom())
                    .quantite(i.getQuantite())
                    .prixUnitaire(i.getPrixUnitaire())
                    .sousTotal(i.getPrixUnitaire().multiply(BigDecimal.valueOf(i.getQuantite())))
                    .sellerId(sellerId)
                    .sellerNom(sellerNom)
                    .build();
            }).collect(Collectors.toList())
            : List.of();

        AddressResponse addr = null;
        if (o.getAdresseLivraison() != null) {
            addr = AddressResponse.builder()
                .rue(o.getAdresseLivraison().getRue())
                .ville(o.getAdresseLivraison().getVille())
                .codePostal(o.getAdresseLivraison().getCodePostal())
                .pays(o.getAdresseLivraison().getPays())
                .build();
        }

        return OrderResponse.builder()
            .id(o.getId())
            .numeroCommande(o.getNumeroCommande())
            .statut(o.getStatut().name())
            .customerNom(o.getCustomer() != null ? o.getCustomer().getNom() : null)
            .customerPrenom(o.getCustomer() != null ? o.getCustomer().getPrenom() : null)
            .customerEmail(o.getCustomer() != null ? o.getCustomer().getEmail() : null)
            .telephone(o.getTelephone())
            .adresseLivraison(addr)
            .sousTotal(o.getSousTotal())
            .couponCode(o.getCouponCode())
            .remise(o.getRemise())
            .fraisLivraison(o.getFraisLivraison())
            .totalTTC(o.getTotalTTC())
            .montantRembourse(o.getMontantRembourse())
            .isNewStatus(o.isNewStatus())
            .dateCommande(o.getDateCommande())
            .lignes(lignes)
            .build();
    }

    private boolean isValidStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == next) return true;
        return switch (current) {
            case PENDING    -> next == OrderStatus.PAID || next == OrderStatus.PROCESSING
                            || next == OrderStatus.SHIPPED || next == OrderStatus.DELIVERED
                            || next == OrderStatus.CANCELLED;
            case PAID       -> next == OrderStatus.PROCESSING || next == OrderStatus.SHIPPED
                            || next == OrderStatus.DELIVERED || next == OrderStatus.REFUNDED
                            || next == OrderStatus.CANCELLED;
            case PROCESSING -> next == OrderStatus.SHIPPED || next == OrderStatus.DELIVERED
                            || next == OrderStatus.CANCELLED || next == OrderStatus.REFUNDED;
            case SHIPPED    -> next == OrderStatus.DELIVERED;
            default         -> false;
        };
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
                .pays("Tunisie")
                .principal(false)
                .build();
        return addressRepository.save(address);
    }

    private boolean isSellerParticipant(Order order, Long sellerId) {
        return order.getLignes() != null && order.getLignes().stream()
                .anyMatch(l -> l.getProduct() != null && l.getProduct().getSeller() != null
                        && l.getProduct().getSeller().getId().equals(sellerId));
    }

    private void restockOrder(Order order) {
        if (order.getLignes() == null) return;
        for (OrderItem item : order.getLignes()) {
            Product product = item.getProduct();
            if (product == null || item.getQuantite() == null) continue;
            ProductVariant variant = item.getVariant();
            if (variant != null) {
                variant.setStock((variant.getStock() != null ? variant.getStock() : 0) + item.getQuantite());
                productVariantRepository.save(variant);
            } else {
                product.setStock((product.getStock() != null ? product.getStock() : 0) + item.getQuantite());
                productRepository.save(product);
            }
        }
    }
}
