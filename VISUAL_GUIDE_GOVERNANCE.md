# Guia Visual - Campos de Governança e Contrato

## Visualização das Alterações

### 1. Modal de Cadastro de Empresa - Nova Seção "Governança e Contrato"

O modal de cadastro agora contém uma nova seção logo após "Contatos" com os seguintes campos:

```
┌─────────────────────────────────────────────────────────┐
│  Governança e Contrato                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────┐  ┌──────────────────────┐ │
│  │ Código do Cliente       │  │ Data de Registro     │ │
│  │ (será gerado            │  │ [2026-02-02]         │ │
│  │  automaticamente)       │  └──────────────────────┘ │
│  │ [DESABILITADO]          │                           │
│  └─────────────────────────┘                           │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Término de Contrato                                │  │
│  │ [____-__-__]                                       │  │
│  │ Data prevista para término do contrato            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Anotações/Observações                             │  │
│  │ ┌─────────────────────────────────────────────┐   │  │
│  │ │ Detalhes estratégicos sobre o cliente...    │   │  │
│  │ │                                             │   │  │
│  │ │                                             │   │  │
│  │ └─────────────────────────────────────────────┘   │  │
│  │ Informações estratégicas, observações e notas    │  │
│  │ importantes                                       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2. Listagem de Empresas - Exibição do Código do Cliente

Antes:
```
┌─────────────────────────────────────────┐
│ ✓  AREA FIT LTDA                        │
│    CNPJ: 12.345.678/0001-90             │
└─────────────────────────────────────────┘
```

Depois:
```
┌─────────────────────────────────────────┐
│ ✓  TQ-101 • AREA FIT LTDA               │
│    CNPJ: 12.345.678/0001-90             │
└─────────────────────────────────────────┘
```

O código do cliente (TQ-101) aparece em destaque (cor primária, negrito) antes da Razão Social.

### 3. Fluxo de Uso

```
┌──────────────────┐
│  Clicar em       │
│  "Novo Cliente"  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Modal abre com valores padrão:      │
│  - Código: (será gerado              │
│            automaticamente)          │
│  - Data Registro: 2026-02-02 (hoje)  │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Usuário preenche:                   │
│  - Dados da empresa (CNPJ, etc.)     │
│  - Término de Contrato (opcional)    │
│  - Anotações (opcional)              │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Clica em "Cadastrar Empresa"        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Banco de dados gera código          │
│  automaticamente via trigger:        │
│  - client_code: "TQ-101"             │
│  E salva outros campos:              │
│  - client_since: "2026-02-02"        │
│  - contract_end: "2027-02-02"        │
│  - notes: "Unidade modelo..."        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Lista atualizada mostrando:         │
│  "TQ-101 • AREA FIT LTDA"            │
└──────────────────────────────────────┘
```

## Campos Implementados

### 1. Código do Cliente (client_code)
- **Tipo**: TEXT UNIQUE
- **Formato**: TQ-XXX (ex: TQ-101, TQ-102)
- **Geração**: Automática via trigger do banco de dados
- **Interface**: Campo desabilitado com placeholder "(será gerado automaticamente)"
- **Aparência**: Fundo cinza claro (bg-muted), cursor-not-allowed
- **Importante**: O código é gerado pelo banco de dados no momento da inserção, evitando race conditions

### 2. Data de Registro (client_since)
- **Tipo**: DATE
- **Valor Padrão**: Data atual
- **Interface**: Input tipo data, editável
- **Preenchimento**: Automático ao abrir o modal

### 3. Término de Contrato (contract_end)
- **Tipo**: DATE
- **Valor Padrão**: Nenhum
- **Interface**: Input tipo data, editável
- **Uso**: Define quando o contrato expira

### 4. Anotações/Observações (notes)
- **Tipo**: TEXT
- **Interface**: Textarea com 4 linhas
- **Uso**: Detalhes estratégicos, observações importantes
- **Exemplo**: "Unidade modelo para implementação do SGQ e Inteligência de Margem em Manaus"

## Exemplo de Dados Salvos

```json
{
  "id": "uuid-gerado",
  "user_id": "uuid-usuario",
  "name": "AREA FIT LTDA",
  "cnpj": "12345678000190",
  "razao_social": "AREA FIT LTDA",
  "nome_fantasia": "Area Fit Manaus",
  "client_code": "TQ-101",
  "client_since": "2026-02-02",
  "contract_end": "2027-02-02",
  "notes": "Unidade modelo para implementação do SGQ e Inteligência de Margem em Manaus",
  "created_at": "2026-02-02T00:20:00Z",
  "updated_at": "2026-02-02T00:20:00Z"
}
```

## Estilos e Classes CSS

### Código do Cliente na Lista
```tsx
<span className="text-primary font-semibold">
  {comp.client_code}
</span>
```

### Campo Desabilitado
```tsx
<Input
  disabled
  className="bg-muted cursor-not-allowed"
/>
```

### Textarea de Anotações
```tsx
<Textarea
  rows={4}
  placeholder="Detalhes estratégicos sobre o cliente..."
/>
```

## Validações

1. **CNPJ e Razão Social** continuam sendo obrigatórios
2. **Código do Cliente** é gerado automaticamente (não pode ser editado)
3. **Datas** devem ser no formato válido (YYYY-MM-DD)
4. **Anotações** são opcionais, sem limite de caracteres
5. **Unicidade** do código do cliente garantida pelo banco de dados

## Acessibilidade

- Todos os campos têm `<Label>` associado
- Campo desabilitado tem indicação visual (cor diferente, cursor específico)
- Textos de ajuda abaixo dos campos importantes
- Placeholder descritivo no textarea

## Responsividade

- Em telas pequenas (mobile): Campos empilham verticalmente
- Em telas médias+ (tablet/desktop): Layout em grade 2 colunas
- Textarea sempre ocupa largura total
- Modal tem scroll quando necessário (max-h-[90vh])
