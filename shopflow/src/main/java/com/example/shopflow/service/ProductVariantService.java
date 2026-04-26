package com.example.shopflow.service;

import com.example.shopflow.dto.request.VariantRequest;
import com.example.shopflow.dto.response.VariantResponse;
import com.example.shopflow.entity.Product;
import com.example.shopflow.entity.ProductVariant;
import com.example.shopflow.exception.BadRequestException;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.exception.UnauthorizedException;
import com.example.shopflow.repository.UserRepository;
import com.example.shopflow.entity.User;
import com.example.shopflow.repository.ProductRepository;
import com.example.shopflow.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<VariantResponse> listByProduct(Long productId) {
        List<ProductVariant> variants = variantRepository.findByProductId(productId);
        return variants.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public VariantResponse getById(Long id) {
        return variantRepository.findById(id).map(this::toResponse).orElseThrow(() -> new ResourceNotFoundException("Variant introuvable: " + id));
    }

    @Transactional
    public VariantResponse create(Long productId, VariantRequest req) {
        Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Produit introuvable: " + productId));
        validateVariantFields(req);
        validateUniqueVariant(product, req, null);
        String normalizedNom = normalizeVariantName(req);
        ProductVariant v = ProductVariant.builder()
                .product(product)
                .nom(normalizedNom)
                .taille(req.getTaille())
                .couleur(req.getCouleur())
                .stock(req.getStock())
                .prixDelta(req.getPrixDelta())
                .sku(req.getSku())
                .build();
        ProductVariant saved = variantRepository.save(v);
        return toResponse(saved);
    }

    @Transactional
    public VariantResponse createForUser(Long productId, VariantRequest req, String userEmail) {
        Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Produit introuvable: " + productId));
        // allow ADMIN or owner
        User u = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (u.getRole() != com.example.shopflow.entity.enums.Role.ADMIN) {
            if (product.getSeller() == null || !product.getSeller().getId().equals(u.getId())) {
                throw new UnauthorizedException("Non autorisé");
            }
        }
        return create(productId, req);
    }

    @Transactional
    public VariantResponse update(Long id, VariantRequest req) {
        ProductVariant existing = variantRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Variant introuvable: " + id));
        validateVariantFields(req);
        validateUniqueVariant(existing.getProduct(), req, existing.getId());
        existing.setNom(normalizeVariantName(req));
        existing.setTaille(req.getTaille());
        existing.setCouleur(req.getCouleur());
        existing.setStock(req.getStock());
        existing.setPrixDelta(req.getPrixDelta());
        existing.setSku(req.getSku());
        return toResponse(variantRepository.save(existing));
    }

    @Transactional
    public VariantResponse updateForUser(Long id, VariantRequest req, String userEmail) {
        ProductVariant existing = variantRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Variant introuvable: " + id));
        Product product = existing.getProduct();
        User u = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (u.getRole() != com.example.shopflow.entity.enums.Role.ADMIN) {
            if (product.getSeller() == null || !product.getSeller().getId().equals(u.getId())) {
                throw new UnauthorizedException("Non autorisé");
            }
        }
        return update(id, req);
    }

    @Transactional
    public void delete(Long id) {
        ProductVariant existing = variantRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Variant introuvable: " + id));
        variantRepository.delete(existing);
    }

    @Transactional
    public void deleteForUser(Long id, String userEmail) {
        ProductVariant existing = variantRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Variant introuvable: " + id));
        Product product = existing.getProduct();
        User u = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (u.getRole() != com.example.shopflow.entity.enums.Role.ADMIN) {
            if (product.getSeller() == null || !product.getSeller().getId().equals(u.getId())) {
                throw new UnauthorizedException("Non autorisé");
            }
        }
        variantRepository.delete(existing);
    }

    private VariantResponse toResponse(ProductVariant v) {
        return VariantResponse.builder()
                .id(v.getId())
                .productId(v.getProduct() != null ? v.getProduct().getId() : null)
                .nom(v.getNom())
                .taille(v.getTaille())
                .couleur(v.getCouleur())
                .stock(v.getStock())
                .prixDelta(v.getPrixDelta())
                .sku(v.getSku())
                .build();
    }

    private String normalizeVariantName(VariantRequest req) {
        String nom = req.getNom() != null ? req.getNom().trim() : "";
        if (!nom.isBlank()) {
            return nom;
        }
        String taille = req.getTaille() != null ? req.getTaille().trim() : "";
        String couleur = req.getCouleur() != null ? req.getCouleur().trim() : "";
        if (!taille.isBlank() && !couleur.isBlank()) {
            return taille + " / " + couleur;
        }
        if (!taille.isBlank()) {
            return taille;
        }
        if (!couleur.isBlank()) {
            return couleur;
        }
        return "Variante";
    }

    private void validateVariantFields(VariantRequest req) {
        String taille = req.getTaille() != null ? req.getTaille().trim() : "";
        String couleur = req.getCouleur() != null ? req.getCouleur().trim() : "";
        if (taille.isBlank() && couleur.isBlank()) {
            throw new BadRequestException("Une variante doit avoir au moins une taille ou une couleur");
        }
    }

    private void validateUniqueVariant(Product product, VariantRequest req, Long currentVariantId) {
        String taille = normalizeValue(req.getTaille());
        String couleur = normalizeValue(req.getCouleur());
        List<ProductVariant> existing = variantRepository.findByProductId(product.getId());
        boolean duplicated = existing.stream().anyMatch(v -> {
            if (currentVariantId != null && v.getId().equals(currentVariantId)) {
                return false;
            }
            return normalizeValue(v.getTaille()).equals(taille)
                    && normalizeValue(v.getCouleur()).equals(couleur);
        });
        if (duplicated) {
            throw new BadRequestException("Cette combinaison taille/couleur existe deja pour ce produit");
        }
    }

    private String normalizeValue(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}
