package com.example.shopflow.controller;

import com.example.shopflow.dto.request.AddressRequest;
import com.example.shopflow.dto.response.AddressResponse;
import com.example.shopflow.entity.Address;
import com.example.shopflow.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {
    private final AddressService addressService;

    @GetMapping("/my")
    public List<AddressResponse> getMyAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        List<Address> addresses = addressService.getMyAddresses(userDetails.getUsername());
        return addresses.stream().map(a -> AddressResponse.builder()
                .id(a.getId())
                .rue(a.getRue())
                .ville(a.getVille())
                .codePostal(a.getCodePostal())
                .pays(a.getPays())
                .principal(a.isPrincipal())
                .build()
        ).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Address create(@AuthenticationPrincipal UserDetails userDetails,
                          @Valid @RequestBody AddressRequest request) {
        return addressService.create(userDetails.getUsername(), request);
    }

    @PutMapping("/{id}")
    public Address update(@PathVariable Long id,
                          @AuthenticationPrincipal UserDetails userDetails,
                          @Valid @RequestBody AddressRequest request) {
        return addressService.update(id, userDetails.getUsername(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        addressService.delete(id, userDetails.getUsername());
    }
}
