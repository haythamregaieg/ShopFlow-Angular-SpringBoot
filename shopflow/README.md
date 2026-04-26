# ShopFlow - Backend Spring Boot

## Lancement
```
mvnw.cmd spring-boot:run
```

## Acces
- API : http://localhost:8081
- Swagger : http://localhost:8081/swagger-ui/index.html
- H2 Console : http://localhost:8081/h2-console

## Authentification
1. POST /api/auth/register
2. POST /api/auth/login -> copier le accessToken
3. Swagger -> Authorize -> Bearer TOKEN

## Technologies
- Java 21, Spring Boot 3.5
- Spring Security + JWT
- Spring Data JPA + H2
- Lombok, Swagger/OpenAPI

## Tests

Run unit and slice tests locally with:

```
mvnw.cmd test -DskipITs
```

The new controller MockMvc test is located at
`src/test/java/com/example/shopflow/controller/ProductVariantControllerTest.java`.