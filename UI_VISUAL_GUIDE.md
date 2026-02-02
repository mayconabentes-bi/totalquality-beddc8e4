# UI Visual Guide - Company Registration Feature

## Access
- **URL:** `/configuracoes` (Settings page)
- **Permission:** Only visible to users with `role='master'`

## New UI Components

### 1. Settings Page - Companies Section (NEW)

```
┌─────────────────────────────────────────────────────────────────┐
│  Empresas Cadastradas                          [Novo Cliente]   │
├─────────────────────────────────────────────────────────────────┤
│  Gerencie as empresas clientes do sistema                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ [✓] Area Fit Ltda                           ID: 12ab34... │ │
│  │     CNPJ: 17.755.148/0001-39 • Area Fit                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ [✓] Empresa XYZ Ltda                        ID: 56cd78... │ │
│  │     CNPJ: 12.345.678/0001-90 • XYZ Fitness                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  (Empty state message if no companies:)                        │
│  Nenhuma empresa cadastrada ainda                             │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Prominent "Novo Cliente" button with gradient background
- List of all registered companies
- Shows: Razão Social, CNPJ (formatted), Nome Fantasia
- Only visible to master users

### 2. Company Registration Modal

When clicking "Novo Cliente", a modal opens with the following structure:

```
┌─────────────────────────────────────────────────────────────────┐
│  Cadastrar Nova Empresa                                    [X]  │
│  Preencha os dados oficiais da Receita Federal do Brasil       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ═══ Identificação ════════════════════════════════════════    │
│                                                                 │
│  CNPJ *                           Data de Abertura            │
│  [00.000.000/0000-00_______]     [____/__/____]               │
│  ⚠️ CNPJ deve ter 14 dígitos (shows if invalid)               │
│                                                                 │
│  Razão Social *                                               │
│  [_________________________________]                          │
│                                                                 │
│  Nome Fantasia                                                │
│  [_________________________________]                          │
│                                                                 │
│  ═══ Localização ══════════════════════════════════════════    │
│                                                                 │
│  CEP              Logradouro                                  │
│  [00000-000__]    [_________________________________]         │
│                                                                 │
│  Número           Complemento            Bairro               │
│  [_______]        [______________]       [______________]     │
│                                                                 │
│  ═══ Estatísticas ═════════════════════════════════════════    │
│                                                                 │
│  Capital Social (R$)                                          │
│  [1000000.00 ou 1.000.000,00________________]                 │
│  Aceita formato brasileiro (1.000.000,00) ou                 │
│  internacional (1000000.00)                                   │
│                                                                 │
│  ═══ Contatos ═════════════════════════════════════════════    │
│                                                                 │
│  Telefone                      E-mail                         │
│  [(00) 00000-0000______]      [___________________]           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                    [Cancelar] [Cadastrar Empresa]│
└─────────────────────────────────────────────────────────────────┘
```

**Form Sections:**

1. **Identificação (Identification)**
   - CNPJ* (with automatic mask: XX.XXX.XXX/XXXX-XX)
   - Razão Social* (required)
   - Nome Fantasia
   - Data de Abertura (date picker)

2. **Localização (Location)**
   - CEP
   - Logradouro (street address)
   - Número (number)
   - Complemento (complement)
   - Bairro (neighborhood)

3. **Estatísticas (Statistics)**
   - Capital Social (currency field)
   - Supports both Brazilian (1.000.000,00) and international (1000000.00) formats
   - Real-time validation (only numbers, dots, commas)

4. **Contatos (Contacts)**
   - Telefone (phone)
   - E-mail

### 3. Validation Visual Feedback

**CNPJ Validation:**
```
CNPJ *
[17.755.148/0001-3_______]
⚠️ CNPJ deve ter 14 dígitos
```
- Red error message appears below field when CNPJ is incomplete
- Prevents form submission until valid

**Required Fields:**
- Fields marked with asterisk (*) are required
- Toast notification appears if trying to submit without required fields:
  "CNPJ e Razão Social são obrigatórios"

### 4. Success Flow

After clicking "Cadastrar Empresa":

1. **Validation checks:**
   - CNPJ and Razão Social are present
   - CNPJ has exactly 14 digits
   - Capital Social is valid (if provided)

2. **On Success:**
   - ✅ Toast: "Empresa criada com sucesso!"
   - Modal closes automatically
   - New company appears in the companies list
   - Form is reset

3. **On Error:**
   - ❌ Toast: "Erro ao criar empresa: [error message]"
   - Modal remains open
   - User can correct and retry

## Example Test Data (Area Fit)

```
CNPJ:           17.755.148/0001-39
Razão Social:   AREA FIT ACADEMIA LTDA
Nome Fantasia:  Area Fit
Data Abertura:  01/01/2010
CEP:            12345-678
Logradouro:     Rua Example
Número:         123
Complemento:    Sala 1
Bairro:         Centro
Capital Social: 1.000.000,00
Telefone:       (11) 99999-9999
E-mail:         contato@areafit.com.br
```

## Data Storage Format

### Database Fields:
```sql
cnpj: '17755148000139'              -- digits only, no formatting
razao_social: 'AREA FIT ACADEMIA LTDA'
nome_fantasia: 'Area Fit'
data_abertura: '2010-01-01'         -- DATE format
email: 'contato@areafit.com.br'
phone: '(11) 99999-9999'
full_address: {                      -- JSONB
  "cep": "12345-678",
  "logradouro": "Rua Example",
  "numero": "123",
  "complemento": "Sala 1",
  "bairro": "Centro"
}
statistical_studies: {               -- JSONB
  "capital_social": 1000000.00
}
```

## Color Scheme
- "Novo Cliente" button: Gradient from primary to accent color
- Success indicators: Green check icon
- Error messages: Red text
- Section headers: Bold with bottom border

## Responsive Design
- Modal: Max width 768px (3xl), max height 90vh with scroll
- Forms: Stack vertically on mobile, 2-column grid on desktop
- Button: Full width on mobile, auto on desktop
