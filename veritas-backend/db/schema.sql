-- Veritas Database Schema
-- PostgreSQL database setup for products and claims verification system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Function to generate batch_id with custom prefix
CREATE OR REPLACE FUNCTION generate_batch_id(prefix TEXT DEFAULT 'PRODUCT')
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    random_digits TEXT;
    generated_id TEXT;
    max_attempts INT := 100;
    attempt_count INT := 0;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Loop to ensure uniqueness
    LOOP
        random_digits := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        generated_id := UPPER(prefix) || '-' || current_year || '-' || random_digits;
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM products WHERE batch_id = generated_id) THEN
            RETURN generated_id;
        END IF;
        
        attempt_count := attempt_count + 1;
        IF attempt_count >= max_attempts THEN
            -- If we can't find a unique ID after many attempts, use timestamp
            generated_id := UPPER(prefix) || '-' || current_year || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 4, '0');
            RETURN generated_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create claims table
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    claim_type VARCHAR(100) NOT NULL,
    claim_description TEXT NOT NULL,
    hcs_transaction_id VARCHAR(200), -- Hedera Consensus Service transaction ID
    hcs_timestamp TIMESTAMP WITH TIME ZONE, -- HCS timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_batch_id ON products(batch_id);
CREATE INDEX idx_products_supplier_name ON products(supplier_name);
CREATE INDEX idx_products_created_at ON products(created_at);

CREATE INDEX idx_claims_product_id ON claims(product_id);
CREATE INDEX idx_claims_claim_type ON claims(claim_type);
CREATE INDEX idx_claims_hcs_transaction_id ON claims(hcs_transaction_id);
CREATE INDEX idx_claims_created_at ON claims(created_at);

-- Insert sample data for testing
INSERT INTO products (product_name, supplier_name, description) VALUES
('Organic Honey', 'Nature''s Best Farms', 'Pure organic wildflower honey sourced from sustainable apiaries'),
('Premium Olive Oil', 'Mediterranean Gold Co.', 'Extra virgin olive oil from Italian olives, cold-pressed'),
('Artisan Chocolate', 'Swiss Craft Chocolates', 'Dark chocolate 70% cocoa, handcrafted in small batches'),
('Organic Coffee Beans', 'Mountain View Coffee', 'Single-origin arabica beans from Colombian highlands'),
('Natural Maple Syrup', 'Vermont Pure', 'Grade A maple syrup tapped from century-old sugar maples');

-- Insert sample claims (using subqueries to get product IDs)
INSERT INTO claims (product_id, claim_type, claim_description, hcs_transaction_id, hcs_timestamp) VALUES
((SELECT id FROM products WHERE product_name = 'Organic Honey' LIMIT 1), 
 'quality', 
 'Honey crystallized earlier than expected, customer reporting unusual texture',
 '0.0.12345@1640995200.123456789',
 '2024-01-15 10:30:00+00'),

((SELECT id FROM products WHERE product_name = 'Premium Olive Oil' LIMIT 1), 
 'authenticity', 
 'Customer requesting verification of Italian origin claim on product label',
 '0.0.12346@1641081600.987654321',
 '2024-01-20 14:45:00+00'),

((SELECT id FROM products WHERE product_name = 'Artisan Chocolate' LIMIT 1), 
 'defect', 
 'Chocolate bar arrived melted despite temperature-controlled shipping',
 '0.0.12347@1641168000.456789123',
 '2024-01-25 09:15:00+00'),

((SELECT id FROM products WHERE product_name = 'Organic Coffee Beans' LIMIT 1), 
 'packaging', 
 'Bag seal was damaged during transport, potential freshness compromise',
 '0.0.12348@1641254400.789123456',
 '2024-01-28 16:20:00+00');

-- Create view for products with claim counts
CREATE VIEW products_with_claims AS
SELECT 
    p.id,
    p.batch_id,
    p.product_name,
    p.supplier_name,
    p.description,
    p.created_at,
    COUNT(c.id) as total_claims,
    COUNT(CASE WHEN c.claim_type = 'quality' THEN 1 END) as quality_claims,
    COUNT(CASE WHEN c.claim_type = 'authenticity' THEN 1 END) as authenticity_claims,
    COUNT(CASE WHEN c.claim_type = 'defect' THEN 1 END) as defect_claims,
    COUNT(CASE WHEN c.claim_type = 'packaging' THEN 1 END) as packaging_claims
FROM products p
LEFT JOIN claims c ON p.id = c.product_id
GROUP BY p.id, p.batch_id, p.product_name, p.supplier_name, p.description, p.created_at;

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO veritas_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO veritas_user;