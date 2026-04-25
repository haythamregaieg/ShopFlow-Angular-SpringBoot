package com.example.shopflow.controller;

import com.example.shopflow.dto.request.LoginRequest;
import com.example.shopflow.dto.request.RegisterRequest;
import com.example.shopflow.dto.response.AuthResponse;
import com.example.shopflow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Public → inscription CUSTOMER uniquement
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // Réservé ADMIN → peut créer ADMIN ou SELLER
    @PostMapping("/admin/create-user")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public AuthResponse createUser(@Valid @RequestBody RegisterRequest request) {
        return authService.registerAdmin(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestParam String token) {
        return authService.refresh(token);
    }
}