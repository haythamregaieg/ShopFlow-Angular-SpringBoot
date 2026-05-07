# 🛍️ ShopFlow — Plateforme E-Commerce

> Projet académique — Spring Boot 3.x + Angular 16 + PostgreSQL 16  
> Enseignante : Dr. Ing. Ghada Feki — 2025/2026

---

## 🏗️ Architecture

```
shopflow/
├── backend/          # Spring Boot 3.x (Java 21)
│   ├── src/main/java/com/example/shopflow/
│   │   ├── config/        # SecurityConfig, SwaggerConfig
│   │   ├── controller/    # REST Controllers
│   │   ├── dto/           # Request/Response DTOs
│   │   ├── entity/        # JPA Entities
│   │   ├── repository/    # Spring Data Repositories
│   │   ├── security/      # JWT Filter, JwtService
│   │   └── service/       # Business Logic
│   └── src/main/resources/
│       └── application.properties
└── frontend/         # Angular 16
    └── src/app/
        ├── core/          # Services, Models, Guards, Interceptors
        ├── modules/       # Auth, Products, Cart, Orders, Dashboard
        └── shared/        # Navbar, Footer
```

---

## ⚙️ Prérequis

| Outil | Version |
|-------|---------|
| Java JDK | 21+ |
| Maven | 3.9+ |
| Node.js | 18+ |
| Angular CLI | 16+ |
| PostgreSQL | 16 |

---

## 🚀 Installation & Lancement

### Étape 1 — Démarrer PostgreSQL

```powershell
# Windows (PowerShell en administrateur)
net start postgresql-x64-16
```

### Étape 2 — Créer la base de données

```powershell
cd "C:\Program Files\PostgreSQL\16\bin"
.\psql.exe -U postgres -h localhost -p 5433
```

```sql
CREATE DATABASE shopflow_db;
\q
```

### Étape 3 — Configurer le Backend

Fichier : `backend/src/main/resources/application.properties`

```properties
spring.application.name=shopflow
server.port=8081

spring.datasource.url=jdbc:postgresql://localhost:5433/shopflow_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

spring.devtools.restart.enabled=false

jwt.secret=shopflow2025SecretKeyForJWTTokenGenerationMustBe256BitsLong
jwt.expiration=86400000
jwt.refresh-expiration=604800000
```

### Étape 4 — Lancer le Backend

```powershell
cd backend
.\mvnw.cmd clean package -DskipTests -q
# Puis Run dans IntelliJ IDEA
```

Le backend démarre sur : `http://localhost:8081`  
Swagger UI : `http://localhost:8081/swagger-ui.html`

### Étape 5 — Lancer le Frontend

```powershell
cd frontend
npm install
ng serve --open
```

Le frontend démarre sur : `http://localhost:4200`

---

## 👥 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| ADMIN | admin@gmail.com | Admin.123 |


---

## 📋 Endpoints API Principaux

### Authentification
```
POST /api/auth/register          — Inscription
POST /api/auth/login             — Connexion
```

### Produits
```
GET    /api/products             — Liste avec pagination
GET    /api/products/{id}        — Détail produit
POST   /api/products             — Créer (SELLER/ADMIN)
PUT    /api/products/{id}        — Modifier (SELLER/ADMIN)
DELETE /api/products/{id}        — Désactiver (SELLER/ADMIN)
```

### Panier
```
GET    /api/cart                 — Voir mon panier
POST   /api/cart/items           — Ajouter au panier
PUT    /api/cart/items/{id}      — Modifier quantité
DELETE /api/cart/items/{id}      — Supprimer article
POST   /api/cart/coupon          — Appliquer coupon
```

### Commandes
```
POST /api/orders                 — Créer commande
GET  /api/orders/my              — Mes commandes
GET  /api/orders/{id}            — Détail commande
PUT  /api/orders/{id}/cancel     — Annuler
```

### Dashboard
```
GET /api/dashboard/admin         — Stats ADMIN
GET /api/dashboard/customer      — Stats CUSTOMER
```

---

## 🔐 Sécurité

- **JWT Access Token** : 24h d'expiration
- **JWT Refresh Token** : 7 jours d'expiration
- **BCrypt** : Hashage des mots de passe
- **Rôles** : ADMIN, SELLER, CUSTOMER
- **@PreAuthorize** : Protection des endpoints par rôle

---

## 📊 Modèle de données

Entités principales :
- `User` — Utilisateurs avec rôles
- `Product` — Produits avec catégories
- `Category` — Catégories de produits
- `Cart` / `CartItem` — Panier d'achat
- `Order` / `OrderItem` — Commandes
- `Coupon` — Codes de réduction
- `Review` — Avis produits
- `Address` — Adresses de livraison
- `SellerProfile` — Profil vendeur

---

## 🛠️ Technologies

**Backend :**
- Spring Boot 3.5.12
- Spring Security 6 + JWT (jjwt 0.11.5)
- Spring Data JPA + Hibernate 6
- PostgreSQL 16
- Lombok
- SpringDoc OpenAPI (Swagger)

**Frontend :**
- Angular 16
- TypeScript
- Angular Router + Guards
- HttpClient + Interceptors
- CSS3 + Google Fonts (Syne, DM Sans)

---

## 📁 Structure des livrables

```
archive.zip
├── backend/                    # Code source Spring Boot
├── frontend/                   # Code source Angular
├── rapport.pdf                 # Rapport technique
├── README.md                   # Ce fichier

```