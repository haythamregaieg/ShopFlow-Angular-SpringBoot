package com.example.shopflow.controller;

import com.example.shopflow.dto.request.ReviewRequest;
import com.example.shopflow.entity.Review;
import com.example.shopflow.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Review addReview(@AuthenticationPrincipal UserDetails userDetails,
                            @Valid @RequestBody ReviewRequest request) {
        return reviewService.addReview(userDetails.getUsername(), request);
    }

    @GetMapping("/product/{productId}")
    public List<Review> getProductReviews(@PathVariable Long productId) {
        return reviewService.getProductReviews(productId);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public Review approve(@PathVariable Long id) {
        return reviewService.approve(id);
    }
}