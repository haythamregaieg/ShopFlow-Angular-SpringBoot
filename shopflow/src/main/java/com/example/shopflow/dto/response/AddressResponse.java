package com.example.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private String rue;
    private String ville;
    private String codePostal;
    private String pays;
}
