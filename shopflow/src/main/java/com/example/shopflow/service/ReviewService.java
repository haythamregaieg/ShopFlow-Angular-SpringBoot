package com.example.shopflow.service;

import com.example.shopflow.dto.request.ReviewRequest;
import com.example.shopflow.dto.response.ReviewResponse;
import com.example.shopflow.entity.Product;
import com.example.shopflow.entity.Review;
import com.example.shopflow.entity.User;
import com.example.shopflow.entity.enums.OrderStatus;
import com.example.shopflow.exception.BadRequestException;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.OrderRepository;
import com.example.shopflow.repository.ProductRepository;
import com.example.shopflow.repository.ReviewRepository;
import com.example.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    private static final List<OrderStatus> ELIGIBLE_STATUSES =
            List.of(OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED);

    @Transactional
    public ReviewResponse addReview(String email, ReviewRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));

        boolean purchased = orderRepository.hasPurchasedProduct(
                user.getId(), product.getId(), ELIGIBLE_STATUSES);
        if (!purchased) {
            throw new BadRequestException("Avis autorise uniquement pour un produit achete (commande payee)");
        }
        if (reviewRepository.existsByCustomerIdAndProductId(user.getId(), product.getId())) {
            throw new BadRequestException("Vous avez deja laisse un avis pour ce produit");
        }

        Review review = Review.builder()
                .customer(user)
                .product(product)
                .note(request.getNote())
                .commentaire(request.getCommentaire())
                .approuve(false)
                .build();
        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdAndApprouveTrue(productId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReviewResponse approve(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis introuvable"));
        review.setApprouve(true);
        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .customerId(r.getCustomer() != null ? r.getCustomer().getId() : null)
                .customerNom(r.getCustomer() != null ? r.getCustomer().getNom() : null)
                .customerPrenom(r.getCustomer() != null ? r.getCustomer().getPrenom() : null)
                .customerEmail(r.getCustomer() != null ? r.getCustomer().getEmail() : null)
                .productId(r.getProduct() != null ? r.getProduct().getId() : null)
                .productNom(r.getProduct() != null ? r.getProduct().getNom() : null)
                .note(r.getNote())
                .commentaire(r.getCommentaire())
                .dateCreation(r.getDateCreation())
                .approuve(r.isApprouve())
                .build();
    }
}
