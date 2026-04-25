package com.example.shopflow.service;

import com.example.shopflow.dto.request.SellerProfileRequest;
import com.example.shopflow.dto.response.SellerProfileResponse;
import com.example.shopflow.entity.SellerProfile;
import com.example.shopflow.entity.User;
import com.example.shopflow.exception.BadRequestException;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.SellerProfileRepository;
import com.example.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public SellerProfileResponse createProfile(String email, SellerProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (sellerProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new BadRequestException("Profil vendeur deja existant pour cet utilisateur");
        }

        SellerProfile profile = SellerProfile.builder()
                .user(user)
                .nomBoutique(request.getNomBoutique())
                .description(request.getDescription())
                .logo(request.getLogo())
                .note(0.0)
                .build();

        return toResponse(sellerProfileRepository.save(profile));
    }

    @Transactional
    public SellerProfileResponse updateProfile(String email, SellerProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        SellerProfile profile = sellerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profil vendeur introuvable"));

        profile.setNomBoutique(request.getNomBoutique());
        profile.setDescription(request.getDescription());
        profile.setLogo(request.getLogo());

        return toResponse(sellerProfileRepository.save(profile));
    }

    public SellerProfileResponse getMyProfile(String email) {
        SellerProfile profile = sellerProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Profil vendeur introuvable"));
        return toResponse(profile);
    }

    public SellerProfileResponse getById(Long id) {
        SellerProfile profile = sellerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profil vendeur introuvable : " + id));
        return toResponse(profile);
    }

    public List<SellerProfileResponse> getAll() {
        return sellerProfileRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private SellerProfileResponse toResponse(SellerProfile p) {
        return SellerProfileResponse.builder()
                .id(p.getId())
                .nomBoutique(p.getNomBoutique())
                .description(p.getDescription())
                .logo(p.getLogo())
                .note(p.getNote())
                .sellerEmail(p.getUser().getEmail())
                .sellerNom(p.getUser().getNom())
                .sellerPrenom(p.getUser().getPrenom())
                .build();
    }
}