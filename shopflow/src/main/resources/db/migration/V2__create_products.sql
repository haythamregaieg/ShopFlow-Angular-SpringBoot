-- Create products, product_variant and product_category tables
CREATE TABLE IF NOT EXISTS products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  seller_id BIGINT,
  nom VARCHAR(255),
  description VARCHAR(2000),
  prix DECIMAL(19,2),
  prix_promo DECIMAL(19,2),
  stock INT,
  frais_livraison_local DECIMAL(19,2),
  frais_livraison_international DECIMAL(19,2),
  actif BOOLEAN DEFAULT TRUE,
  images VARCHAR(2000),
  date_creation TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variant (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT,
  nom VARCHAR(255),
  stock INT,
  prix DECIMAL(19,2)
);

CREATE TABLE IF NOT EXISTS product_category (
  product_id BIGINT,
  category_id BIGINT
);
