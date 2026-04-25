package com.example.shopflow.service;

import com.example.shopflow.dto.request.AddressRequest;
import com.example.shopflow.entity.Address;
import com.example.shopflow.entity.User;
import com.example.shopflow.exception.ResourceNotFoundException;
import com.example.shopflow.repository.AddressRepository;
import com.example.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Address> getMyAddresses(String email) {
        User user = findUserByEmail(email);
        return addressRepository.findByUserId(user.getId());
    }

    @Transactional
    public Address create(String email, AddressRequest request) {
        User user = findUserByEmail(email);
        if (request.isPrincipal()) {
            resetPrincipal(user.getId());
        }
        Address address = Address.builder()
                .user(user)
                .rue(request.getRue())
                .ville(request.getVille())
                .codePostal(request.getCodePostal())
                .pays(request.getPays())
                .principal(request.isPrincipal())
                .build();
        return addressRepository.save(address);
    }

    @Transactional
    public Address update(Long id, String email, AddressRequest request) {
        User user = findUserByEmail(email);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adresse introuvable"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Adresse introuvable");
        }
        if (request.isPrincipal()) {
            resetPrincipal(user.getId());
        }
        address.setRue(request.getRue());
        address.setVille(request.getVille());
        address.setCodePostal(request.getCodePostal());
        address.setPays(request.getPays());
        address.setPrincipal(request.isPrincipal());
        return addressRepository.save(address);
    }

    @Transactional
    public void delete(Long id, String email) {
        User user = findUserByEmail(email);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adresse introuvable"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Adresse introuvable");
        }
        addressRepository.delete(address);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    private void resetPrincipal(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        addresses.forEach(a -> a.setPrincipal(false));
        addressRepository.saveAll(addresses);
    }
}
