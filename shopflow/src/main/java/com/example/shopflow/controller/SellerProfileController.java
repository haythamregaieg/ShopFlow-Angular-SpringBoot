package com.example.shopflow.controller;

import com.example.shopflow.dto.request.SellerProfileRequest;
import com.example.shopflow.dto.response.SellerProfileResponse;
import com.example.shopflow.service.SellerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/seller-profiles")
@RequiredArgsConstructor
public class SellerProfileController {

    private final SellerProfileService sellerProfileService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public SellerProfileResponse create(@AuthenticationPrincipal UserDetails userDetails,
                                        @Valid @RequestBody SellerProfileRequest request) {
        return sellerProfileService.createProfile(userDetails.getUsername(), request);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public SellerProfileResponse update(@AuthenticationPrincipal UserDetails userDetails,
                                        @Valid @RequestBody SellerProfileRequest request) {
        return sellerProfileService.updateProfile(userDetails.getUsername(), request);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public SellerProfileResponse getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return sellerProfileService.getMyProfile(userDetails.getUsername());
    }

    @GetMapping("/{id}")
    public SellerProfileResponse getById(@PathVariable Long id) {
        return sellerProfileService.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<SellerProfileResponse> getAll() {
        return sellerProfileService.getAll();
    }
}