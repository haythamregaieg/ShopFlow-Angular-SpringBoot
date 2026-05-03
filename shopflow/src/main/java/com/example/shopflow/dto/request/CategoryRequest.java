package com.example.shopflow.dto.request;

import lombok.Data;

@Data
public class CategoryRequest {
    private String nom;
    private String description;
    private Long parentId;
}
