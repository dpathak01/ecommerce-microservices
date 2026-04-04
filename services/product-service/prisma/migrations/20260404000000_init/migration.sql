CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Product" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "inventoryCount" INTEGER NOT NULL,
  "category" TEXT NOT NULL,
  "imageUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Product" ("name", "description", "price", "inventoryCount", "category", "imageUrl")
VALUES
('Noise Cancelling Headphones', 'Premium wireless headphones with ANC', 199.99, 120, 'electronics', 'https://example.com/headphones.jpg'),
('Running Shoes', 'Lightweight running shoes for daily training', 89.99, 250, 'fashion', 'https://example.com/shoes.jpg'),
('Coffee Maker', 'Smart coffee maker with app scheduling', 129.50, 75, 'home', 'https://example.com/coffee-maker.jpg');

