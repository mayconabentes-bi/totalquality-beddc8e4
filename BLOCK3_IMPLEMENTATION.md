# Block 3 Implementation - Specialized Modules

## Overview
This document describes the implementation of Block 3 (Specialization & Axiom) which adds three specialized quality management modules to the TotalQuality system:
1. **Risk Management** (Gestão de Riscos)
2. **Asset Maintenance** (Manutenção de Ativos)
3. **Voice of Student / NPS** (Voz do Aluno)

## Database Infrastructure

### Migration File
**Location:** `supabase/migrations/20260201193200_bloco3_specialized_modules.sql`

### Tables Created

#### 1. `risks` Table
Stores risk management data for ISO 9001 compliance.

**Fields:**
- `id` (UUID): Primary key
- `company_id` (UUID): Foreign key to companies table
- `description` (TEXT): Risk description
- `category` (TEXT): One of: 'Operacional', 'Financeiro', 'Mercado'
- `probability` (INTEGER): Scale 1-5
- `impact` (INTEGER): Scale 1-5
- `mitigation_plan` (TEXT): Mitigation strategy
- `created_at`, `updated_at` (TIMESTAMPTZ): Audit timestamps

**RLS Policies:**
- `master` role: Full access (SELECT, INSERT, UPDATE, DELETE)
- `proprietario` role: Full access to their company's data only

#### 2. `maintenance_assets` Table
Tracks equipment and asset maintenance schedules.

**Fields:**
- `id` (UUID): Primary key
- `company_id` (UUID): Foreign key to companies table
- `name` (TEXT): Asset name (e.g., "Esteira 01")
- `category` (TEXT): Asset category
- `last_maintenance` (DATE): Last maintenance date
- `next_maintenance` (DATE): Next scheduled maintenance
- `status` (TEXT): One of: 'Ok', 'Alerta', 'Crítico'
- `created_at`, `updated_at` (TIMESTAMPTZ): Audit timestamps

**RLS Policies:**
- `master` role: Full access
- `proprietario` role: Full access to their company's data
- `manutencao` role: SELECT, INSERT, UPDATE for their company's data

#### 3. `nps_feedback` Table
Stores Net Promoter Score feedback from students.

**Fields:**
- `id` (UUID): Primary key
- `company_id` (UUID): Foreign key to companies table
- `score` (INTEGER): NPS score (0-10)
- `comment` (TEXT): Optional feedback text
- `student_name` (TEXT): Optional student name
- `created_at`, `updated_at` (TIMESTAMPTZ): Audit timestamps

**RLS Policies:**
- `master` role: Full access
- `proprietario` role: Full access to their company's data
- `recepcionista` role: SELECT, INSERT for their company's data

## TypeScript Types

**Location:** `src/integrations/supabase/types.ts`

Added complete TypeScript definitions for all three tables including:
- Row types (read operations)
- Insert types (create operations)
- Update types (update operations)
- Relationship definitions

## Frontend Pages

### 1. Risk Management Page (`/riscos`)
**File:** `src/pages/Risks.tsx`

**Features:**
- **5x5 Risk Matrix**: Visual matrix showing risks plotted by Probability (1-5) x Impact (1-5)
- **Automatic Risk Classification**:
  - Low (Baixo): Score 1-5 (green)
  - Medium (Médio): Score 6-12 (yellow)
  - High (Alto): Score 13-20 (orange)
  - Critical (Crítico): Score 21-25 (red)
- **Risk List**: Detailed view of all risks with full information
- **CRUD Operations**: Create, edit, and delete risks
- **Form Fields**:
  - Risk description
  - Category (Operational/Financial/Market)
  - Probability slider (1-5)
  - Impact slider (1-5)
  - Mitigation plan

**Access:** `master`, `proprietario`

### 2. Asset Maintenance Page (`/manutencao`)
**File:** `src/pages/Maintenance.tsx`

**Features:**
- **Status Dashboard**: Quick view of assets by status (Ok/Alerta/Crítico)
- **Asset Cards**: Color-coded cards showing:
  - Asset name and category
  - Last maintenance date
  - Next maintenance date
  - Days until/overdue for maintenance
- **Register Maintenance Button**: Quick action to log maintenance completion
- **CRUD Operations**: Create, edit, and delete assets
- **Form Fields**:
  - Asset name
  - Category
  - Last maintenance date
  - Next maintenance date
  - Status (Ok/Alerta/Crítico)

**Access:** `master`, `proprietario`, `manutencao`

### 3. NPS / Voice of Student Page (`/nps`)
**File:** `src/pages/NPS.tsx`

**Features:**
- **NPS Gauge**: Large visual gauge showing current NPS score (-100 to +100)
- **NPS Status Classification**:
  - Excellent: 75-100 (green)
  - Very Good: 50-74 (lime)
  - Fair: 0-49 (yellow)
  - Poor: Below 0 (red)
- **Category Breakdown**:
  - Promoters (score 9-10): Green
  - Neutrals (score 7-8): Yellow
  - Detractors (score 0-6): Red
- **Feedback List**: All feedback with scores, comments, and timestamps
- **CRUD Operations**: Create and delete feedback
- **Form Fields**:
  - Student name (optional)
  - Score slider (0-10)
  - Comment (optional)

**Access:** `master`, `proprietario`, `recepcionista`

## Routing

**File:** `src/App.tsx`

Added three new protected routes:
- `/riscos` → Risk Management page
- `/manutencao` → Asset Maintenance page
- `/nps` → NPS/Voice of Student page

Each route includes appropriate role-based access control using `ProtectedRoute` component.

## Dashboard Integration

**File:** `src/pages/Dashboard.tsx`

### New Module Cards Added

1. **Risk Management Card**
   - Icon: ShieldAlert
   - Title: "Gestão de Riscos"
   - Description: "Matriz de riscos e planos de mitigação"
   - Visible to: `master`, `proprietario`
   - Links to: `/riscos`

2. **Maintenance Card**
   - Icon: Wrench
   - Title: "Manutenção"
   - Description: "Gestão de ativos e manutenções"
   - Visible to: `master`, `proprietario`, `manutencao`
   - Links to: `/manutencao`

3. **Voice of Student Card**
   - Icon: MessageSquare
   - Title: "Voz do Aluno"
   - Description: "Net Promoter Score e feedbacks"
   - Visible to: `master`, `proprietario`, `recepcionista`
   - Links to: `/nps`

## Role-Based Access Control

### Role Permissions Summary

| Feature | master | proprietario | manutencao | recepcionista |
|---------|--------|--------------|------------|---------------|
| Risk Management | Full Access | Own Company | - | - |
| Asset Maintenance | Full Access | Own Company | Own Company (View/Edit) | - |
| NPS Feedback | Full Access | Own Company | - | Own Company (View/Add) |

### RLS Policy Details

All tables implement Row Level Security (RLS) to ensure:
- `master` role can access ALL data across all companies
- Other roles can only access data for their assigned `company_id`
- Specific role permissions (e.g., `manutencao` can edit assets, `recepcionista` can view/add NPS)

## ISO 9001 Compliance

The implementation supports ISO 9001 requirements for:

1. **Risk Management** (Clause 6.1): 
   - Systematic identification of risks
   - Risk assessment (probability x impact)
   - Documented mitigation plans

2. **Asset Maintenance** (Clause 7.1.3):
   - Infrastructure monitoring
   - Preventive maintenance scheduling
   - Status tracking

3. **Customer Satisfaction** (Clause 9.1.2):
   - NPS measurement
   - Customer feedback collection
   - Satisfaction trend monitoring

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React hooks
- **Icons**: Lucide React

## Build Status

✅ Build: Successful
✅ TypeScript: No errors
✅ Linting: Only minor warnings (consistent with existing code)
✅ Dev Server: Running successfully

## Next Steps

To complete the implementation:

1. **Apply Migration**: Run the migration file in Supabase to create the tables
2. **Test Pages**: Manually test each page with different user roles
3. **Data Validation**: Test RLS policies work correctly
4. **User Acceptance**: Verify with stakeholders that features meet requirements
5. **Documentation**: Update user guide with new features

## Files Modified/Created

### Created:
- `supabase/migrations/20260201193200_bloco3_specialized_modules.sql`
- `src/pages/Risks.tsx`
- `src/pages/Maintenance.tsx`
- `src/pages/NPS.tsx`

### Modified:
- `src/integrations/supabase/types.ts` - Added table types
- `src/App.tsx` - Added routes and imports
- `src/pages/Dashboard.tsx` - Added module cards and icons
