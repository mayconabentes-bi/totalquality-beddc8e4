# Database Migrations

This directory contains SQL migration files for the Supabase database schema and Row Level Security (RLS) policies.

## Migration Order

Migrations are applied in chronological order based on their timestamp prefix (format: `YYYYMMDDHHMMSS`).

## Recent Important Migrations

### 20260201190240_bloco1_totalquality_master.sql
**Purpose**: Implements Bloco 1 (Block 1) migration for Total Quality Master system - Area Fit Infrastructure

**Key Changes**:

1. **Companies Table Migration**:
   - Added `logo_url` (TEXT, nullable): Stores company logo URL
   - Added `market_intelligence` (JSONB, default: {}): Market intelligence data structure with expected fields:
     - `cnae_principal`: Primary CNAE (economic activity classification)
     - `setor_atuacao`: Sector of operation
     - `geolocalizacao`: Geolocation data (latitude/longitude)
     - `densidade_demografica_local`: Local demographic density
     - `indice_concorrencia`: Competition index
   - Added `statistical_studies` (JSONB, default: {}): Statistical profitability metrics:
     - `churn_rate`: Customer cancellation rate
     - `margin_per_student`: Profit margin per student/customer
     - `clv`: Customer Lifetime Value
     - `cac`: Customer Acquisition Cost
     - `ebitda_projetado`: Projected EBITDA

2. **Profiles Table Evolution**:
   - Extended role constraint to include Area Fit operational profiles:
     - `master`: System master with full access
     - `proprietario`: Owner with full access to their own company
     - `recepcionista`: Receptionist
     - `professor`: Teacher/Instructor
     - `manutencao`: Maintenance staff
     - `estacionamento`: Parking staff
   - Added `status_homologacao` (BOOLEAN, default: false): Controls initial access after training completion

3. **Governance and RLS Policies**:
   - **Master Role**: Full access (ALL operations) to all companies in the system
   - **Proprietario Role**: Full access (SELECT, UPDATE, DELETE, INSERT) only to their own `company_id`

**Implementation Notes**:
- All ALTER TABLE commands use `IF NOT EXISTS` to ensure idempotent migrations
- Existing roles (`auditor`, `empresa`, `total_quality_iso`) are maintained in the constraint
- RLS policies are dropped and recreated to avoid conflicts
- TypeScript types in `src/integrations/supabase/types.ts` have been synchronized

### 20260201162524_fix_rls_policies_for_cadastro.sql
**Purpose**: Fixes 401/RLS errors during user signup process

**Problem Solved**: 
- During signup, users were experiencing 401 errors when trying to insert records into `companies` and `profiles` tables
- The existing role-based RLS policies required a profile to exist before accessing company data, creating a chicken-and-egg problem

**Solution**:
- Drops old INSERT policies that were causing conflicts
- Creates `cadastro_inicial_empresas` policy: Allows authenticated users to insert their own company records using `auth.uid() = user_id`
- Creates `visualizacao_propria_empresa` policy: Allows users to view their own company records without requiring a profile to exist first, using `auth.uid() = user_id`
- Creates `cadastro_inicial_perfis` policy: Allows authenticated users to insert their own profile records using `auth.uid() = user_id`

**Key Implementation Details**:
- All initial registration policies for `companies` and `profiles` tables have been migrated to use the `auth.uid() = user_id` model
- This ensures that users can only create and view records associated with their own authenticated user ID
- The CNPJ column structure has been confirmed in the `companies` table to store 14-digit numeric values

**Notes**:
- These policies work alongside the role-based policies created in migration `20260201085414`
- PostgreSQL RLS uses OR logic for multiple policies, so both the simple signup policies and complex role-based policies coexist correctly
- The simple policies handle the initial signup flow, while role-based policies provide fine-grained access control after signup is complete

## Applying Migrations

To apply these migrations to your Supabase project:

1. Open the Supabase SQL Editor for your project
2. Copy the contents of the migration file
3. Execute the SQL script
4. Verify that the policies were created successfully

Alternatively, if using Supabase CLI:
```bash
supabase db push
```

## Testing RLS Policies

After applying migrations, test the signup flow:
1. Navigate to the signup page
2. Complete the registration form
3. Verify that the user can successfully create an account, company record, and profile
4. Confirm no 401/RLS errors occur during the process
