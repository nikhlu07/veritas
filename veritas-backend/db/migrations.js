const fs = require('fs');
const path = require('path');
const db = require('./connection');

class DatabaseMigrations {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.schemaPath = path.join(__dirname, 'schema.sql');
  }

  // Run the main schema setup
  async runSchema() {
    try {
      console.log('🔄 Running database schema setup...');
      
      const schemaSQL = fs.readFileSync(this.schemaPath, 'utf8');
      await db.query(schemaSQL);
      
      console.log('✅ Database schema setup completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Schema setup failed:', error.message);
      throw error;
    }
  }

  // Check if tables exist
  async checkTablesExist() {
    try {
      const result = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('products', 'claims')
        ORDER BY table_name;
      `);
      
      const existingTables = result.rows.map(row => row.table_name);
      return {
        products: existingTables.includes('products'),
        claims: existingTables.includes('claims'),
        all: existingTables.length === 2
      };
    } catch (error) {
      console.error('❌ Error checking tables:', error.message);
      return { products: false, claims: false, all: false };
    }
  }

  // Drop all tables (use with caution!)
  async dropTables() {
    try {
      console.log('🗑️  Dropping existing tables...');
      
      await db.query('DROP TABLE IF EXISTS claims CASCADE;');
      await db.query('DROP TABLE IF EXISTS products CASCADE;');
      await db.query('DROP FUNCTION IF EXISTS generate_batch_id();');
      
      console.log('✅ Tables dropped successfully');
      return true;
    } catch (error) {
      console.error('❌ Error dropping tables:', error.message);
      throw error;
    }
  }

  // Create tables only (without sample data)
  async createTables() {
    try {
      console.log('🔄 Creating database tables...');
      
      const createTablesSQL = `
        -- Enable UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
        CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            batch_id VARCHAR(50) UNIQUE NOT NULL,
            product_name VARCHAR(255) NOT NULL,
            supplier_name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create claims table
        CREATE TABLE IF NOT EXISTS claims (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            claim_type VARCHAR(100) NOT NULL,
            claim_description TEXT NOT NULL,
            hcs_transaction_id VARCHAR(200),
            hcs_timestamp TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_products_batch_id ON products(batch_id);
        CREATE INDEX IF NOT EXISTS idx_products_supplier_name ON products(supplier_name);
        CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
        CREATE INDEX IF NOT EXISTS idx_claims_product_id ON claims(product_id);
        CREATE INDEX IF NOT EXISTS idx_claims_claim_type ON claims(claim_type);
        CREATE INDEX IF NOT EXISTS idx_claims_hcs_transaction_id ON claims(hcs_transaction_id);
        CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at);
      `;
      
      await db.query(createTablesSQL);
      console.log('✅ Tables created successfully');
      return true;
    } catch (error) {
      console.error('❌ Error creating tables:', error.message);
      throw error;
    }
  }

  // Insert sample data
  async insertSampleData() {
    try {
      console.log('🔄 Inserting sample data...');
      
      const sampleDataSQL = `
        -- Insert sample products
        INSERT INTO products (product_name, supplier_name, description) VALUES
        ('Organic Honey', 'Nature''s Best Farms', 'Pure organic wildflower honey sourced from sustainable apiaries'),
        ('Premium Olive Oil', 'Mediterranean Gold Co.', 'Extra virgin olive oil from Italian olives, cold-pressed'),
        ('Artisan Chocolate', 'Swiss Craft Chocolates', 'Dark chocolate 70% cocoa, handcrafted in small batches'),
        ('Organic Coffee Beans', 'Mountain View Coffee', 'Single-origin arabica beans from Colombian highlands'),
        ('Natural Maple Syrup', 'Vermont Pure', 'Grade A maple syrup tapped from century-old sugar maples')
        ON CONFLICT (batch_id) DO NOTHING;

        -- Insert sample claims
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
      `;
      
      await db.query(sampleDataSQL);
      console.log('✅ Sample data inserted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error inserting sample data:', error.message);
      throw error;
    }
  }

  // Create the products_with_claims view
  async createViews() {
    try {
      console.log('🔄 Creating database views...');
      
      const viewSQL = `
        CREATE OR REPLACE VIEW products_with_claims AS
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
      `;
      
      await db.query(viewSQL);
      console.log('✅ Views created successfully');
      return true;
    } catch (error) {
      console.error('❌ Error creating views:', error.message);
      throw error;
    }
  }

  // Full setup (drop, create, insert data, create views)
  async setup(options = {}) {
    const { 
      dropFirst = false, 
      includeSampleData = true, 
      includeViews = true 
    } = options;

    try {
      console.log('🚀 Starting database setup...');
      
      if (dropFirst) {
        await this.dropTables();
      }
      
      await this.createTables();
      
      if (includeSampleData) {
        await this.insertSampleData();
      }
      
      if (includeViews) {
        await this.createViews();
      }
      
      console.log('🎉 Database setup completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Database setup failed:', error.message);
      throw error;
    }
  }

  // Get database status
  async getStatus() {
    try {
      const tables = await this.checkTablesExist();
      
      const productCount = tables.products ? 
        (await db.query('SELECT COUNT(*) FROM products')).rows[0].count : 0;
      
      const claimCount = tables.claims ? 
        (await db.query('SELECT COUNT(*) FROM claims')).rows[0].count : 0;
      
      return {
        tables,
        counts: {
          products: parseInt(productCount),
          claims: parseInt(claimCount)
        },
        ready: tables.all
      };
    } catch (error) {
      console.error('❌ Error getting database status:', error.message);
      return {
        tables: { products: false, claims: false, all: false },
        counts: { products: 0, claims: 0 },
        ready: false,
        error: error.message
      };
    }
  }
}

// CLI interface when run directly
if (require.main === module) {
  const migrations = new DatabaseMigrations();
  const command = process.argv[2];
  
  async function runCommand() {
    try {
      switch (command) {
        case 'setup':
          await migrations.setup({ dropFirst: true, includeSampleData: true });
          break;
        case 'create':
          await migrations.createTables();
          break;
        case 'drop':
          await migrations.dropTables();
          break;
        case 'data':
          await migrations.insertSampleData();
          break;
        case 'views':
          await migrations.createViews();
          break;
        case 'status':
          const status = await migrations.getStatus();
          console.log('📊 Database Status:', JSON.stringify(status, null, 2));
          break;
        default:
          console.log(`
Usage: node migrations.js <command>

Commands:
  setup   - Drop tables, create tables, insert sample data, create views
  create  - Create tables and indexes only
  drop    - Drop all tables (WARNING: destroys all data!)
  data    - Insert sample data
  views   - Create database views
  status  - Show database status
          `);
      }
    } catch (error) {
      console.error('Command failed:', error.message);
      process.exit(1);
    } finally {
      await db.closePool();
    }
  }
  
  runCommand();
}

module.exports = DatabaseMigrations;