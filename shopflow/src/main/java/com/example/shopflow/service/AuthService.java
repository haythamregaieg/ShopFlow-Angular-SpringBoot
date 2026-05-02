package com.example.shopflow.service;

import com.example.shopflow.dto.request.LoginRequest;
import com.example.shopflow.dto.request.RegisterRequest;
import com.example.shopflow.dto.response.AuthResponse;
import com.example.shopflow.entity.PasswordResetToken;
import com.example.shopflow.entity.SellerProfile;
import com.example.shopflow.entity.User;
import com.example.shopflow.entity.enums.Role;
import com.example.shopflow.exception.BadRequestException;
import com.example.shopflow.repository.PasswordResetTokenRepository;
import com.example.shopflow.repository.SellerProfileRepository;
import com.example.shopflow.repository.UserRepository;
import com.example.shopflow.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._#^()\\-+=]).{8,}$";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SellerProfileRepository sellerProfileRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthResponse register(RegisterRequest request) {
        validatePasswordStrength(request.getMotDePasse());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email deja utilise : " + request.getEmail());
        }
        // Inscription publique → toujours CUSTOMER
        User user = User.builder()
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .role(Role.CUSTOMER)
                .actif(true)
                .build();
        userRepository.save(user);
        return buildResponse(user);
    }

    @Transactional
    public AuthResponse registerSeller(RegisterRequest request) {
        validatePasswordStrength(request.getMotDePasse());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email deja utilise : " + request.getEmail());
        }
        if (request.getNomBoutique() == null || request.getNomBoutique().isBlank()) {
            throw new BadRequestException("Nom de boutique obligatoire pour un vendeur");
        }
        User user = User.builder()
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .role(Role.SELLER)
                .actif(true)
                .build();
        userRepository.save(user);
        SellerProfile profile = SellerProfile.builder()
                .user(user)
                .nomBoutique(request.getNomBoutique())
                .logo(request.getLogoBoutique())
                .description(request.getDescriptionBoutique())
                .note(0.0)
                .build();
        sellerProfileRepository.save(profile);
        return buildResponse(user);
    }

    public AuthResponse registerAdmin(RegisterRequest request) {
        validatePasswordStrength(request.getMotDePasse());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email deja utilise : " + request.getEmail());
        }
        // Réservé aux ADMIN → peut choisir le role
        User user = User.builder()
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .role(request.getRole() != null ? request.getRole() : Role.CUSTOMER)
                .actif(true)
                .build();
        userRepository.save(user);
        return buildResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        // First ensure the user exists so we can return a specific message for missing accounts
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Utilisateur introuvable"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse())
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            // Authentication failed -> wrong password
            throw new BadRequestException("Mot de passe incorrect");
        }

        return buildResponse(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new BadRequestException("Refresh token invalide");
        }
        String email = jwtService.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Utilisateur introuvable"));
        return buildResponse(user);
    }

    @Transactional
    public String requestResetPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Utilisateur introuvable"));
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(2))
                .used(false)
                .build();
        passwordResetTokenRepository.save(resetToken);
        return token;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        validatePasswordStrength(newPassword);
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Token invalide"));
        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token expiré ou déjà utilisé");
        }
        User user = resetToken.getUser();
        user.setMotDePasse(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private void validatePasswordStrength(String password) {
        if (password == null || !password.matches(PASSWORD_REGEX)) {
            throw new BadRequestException("Mot de passe faible : min 8, majuscule, minuscule, chiffre, symbole");
        }
    }

    private AuthResponse buildResponse(User user) {
        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(user.getEmail()))
                .refreshToken(jwtService.generateRefreshToken(user.getEmail()))
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}