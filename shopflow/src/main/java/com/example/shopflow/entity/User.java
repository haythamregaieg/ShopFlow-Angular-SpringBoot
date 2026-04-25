package com.example.shopflow.entity;

import com.example.shopflow.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String motDePasse;

    private String prenom;
    private String nom;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean actif = true;

    private LocalDateTime dateCreation;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses;

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
    }
}