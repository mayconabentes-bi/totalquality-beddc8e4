# Implementação de Campos de Governança e Contrato

## Resumo das Alterações

Este documento descreve as alterações implementadas para adicionar campos de governança e contrato ao sistema de cadastro de empresas.

## Alterações Realizadas

### 1. Migração de Banco de Dados

**Arquivo:** `supabase/migrations/20260202001300_add_governance_fields.sql`

Adicionadas as seguintes colunas à tabela `companies`:
- `client_code` (TEXT UNIQUE) - Código único do cliente no formato TQ-XXX
- `client_since` (DATE) - Data de registro do cliente
- `contract_end` (DATE) - Data de término do contrato
- `notes` (TEXT) - Anotações e observações estratégicas

**Funcionalidades Automáticas:**
- Função `generate_client_code()` para gerar códigos sequenciais (TQ-101, TQ-102, etc.)
- Trigger `set_client_code()` que auto-popula o código ao inserir uma nova empresa

**⚠️ IMPORTANTE:** Você precisa executar esta migração no Supabase antes de testar a aplicação.

#### Como Aplicar a Migração:

**Opção 1 - Via Dashboard do Supabase:**
1. Acesse o Dashboard do Supabase: https://app.supabase.com
2. Selecione seu projeto: `oporfnvpcxcblyosrluj`
3. Vá em "SQL Editor"
4. Copie e cole o conteúdo do arquivo `supabase/migrations/20260202001300_add_governance_fields.sql`
5. Execute a query

**Opção 2 - Via Supabase CLI:**
```bash
cd /home/runner/work/totalquality-beddc8e4/totalquality-beddc8e4
supabase db push
```

### 2. Atualização de Tipos TypeScript

**Arquivo:** `src/integrations/supabase/types.ts`

Atualizadas as interfaces da tabela `companies` para incluir os novos campos:
- `Row` - Dados retornados do banco
- `Insert` - Dados para inserção
- `Update` - Dados para atualização

### 3. Atualização da Interface Frontend

**Arquivo:** `src/pages/Settings.tsx`

#### Mudanças na Interface `Company`:
- Adicionados campos: `client_code`, `client_since`, `contract_end`, `notes`

#### Mudanças no Estado do Formulário:
- Expandido `newCompanyForm` com os novos campos

#### Nova Função `generateNextClientCode()`:
- Busca o último código de cliente no banco
- Gera o próximo código na sequência (ex: TQ-101 → TQ-102)
- Retorna TQ-101 como código inicial se não houver empresas

#### Nova Função `handleOpenCompanyDialog()`:
- Gera automaticamente o próximo código do cliente
- Define a data de hoje como padrão para `client_since`
- Abre o modal com os campos pré-preenchidos

#### Modal Atualizado:
Nova seção "Governança e Contrato" com:
1. **Código do Cliente** - Campo desabilitado, auto-gerado (TQ-XXX)
2. **Data de Registro** - Campo de data com padrão hoje
3. **Término de Contrato** - Campo de data
4. **Anotações/Observações** - Textarea para detalhes estratégicos

#### Listagem Atualizada:
- Exibe o código do cliente (TQ-XXX) em destaque ao lado da Razão Social
- Formato: `TQ-101 • NOME DA EMPRESA`

## Validação da Implementação

Use este checklist para validar se tudo está funcionando:

### ✅ Checklist de Validação

- [ ] **Migração Aplicada**: A migração SQL foi executada com sucesso no Supabase
- [ ] **Código Automático**: Ao abrir o modal, o sistema gera automaticamente o código (ex: TQ-101)
- [ ] **Data de Registro**: O campo "Data de Registro" vem pré-preenchido com a data de hoje
- [ ] **Campos Editáveis**: Os campos "Término de Contrato" e "Anotações" são editáveis
- [ ] **Código Desabilitado**: O campo "Código do Cliente" está desabilitado e não pode ser editado
- [ ] **Persistência**: Após salvar, os dados são salvos no banco corretamente
- [ ] **Exibição na Lista**: O código (ex: TQ-101) aparece na lista principal ao lado da Razão Social
- [ ] **Sequência Automática**: Ao criar múltiplas empresas, os códigos são sequenciais (TQ-101, TQ-102, TQ-103...)

### 📋 Teste Real (Exemplo com Area Fit)

1. **Abra o Modal de Cadastro**
   - Clique em "Novo Cliente"
   - Verifique se o código TQ-101 (ou próximo disponível) aparece automaticamente

2. **Preencha os Dados**
   - CNPJ: 12.345.678/0001-90
   - Razão Social: Area Fit Ltda
   - Nome Fantasia: Area Fit Manaus
   - Data de Registro: (já preenchida com hoje)
   - Término de Contrato: (defina para daqui a 12 meses)
   - Anotações: "Unidade modelo para implementação do SGQ e Inteligência de Margem em Manaus"

3. **Salve e Verifique**
   - Clique em "Cadastrar Empresa"
   - Verifique se o código TQ-101 aparece na lista principal
   - O formato deve ser: **TQ-101 • Area Fit Ltda**

4. **Teste Sequencial**
   - Crie uma segunda empresa
   - Verifique se o próximo código é TQ-102

## Estrutura de Dados

### Tabela `companies` (novos campos)

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| client_code | TEXT | Código único (TQ-XXX), auto-gerado | Não |
| client_since | DATE | Data de registro | Não |
| contract_end | DATE | Data de término do contrato | Não |
| notes | TEXT | Anotações estratégicas | Não |

### Formato do Código do Cliente

- **Padrão**: `TQ-XXX` onde XXX é um número sequencial
- **Exemplos**: TQ-101, TQ-102, TQ-103, ..., TQ-999, TQ-1000
- **Geração**: Automática via trigger no banco de dados
- **Unicidade**: Campo UNIQUE garante que não haverá códigos duplicados

## Tecnologias Utilizadas

- **React** - Interface do usuário
- **TypeScript** - Tipagem estática
- **Supabase** - Banco de dados PostgreSQL
- **Shadcn/ui** - Componentes de UI (Input, Textarea, Label, Dialog)
- **Tailwind CSS** - Estilização

## Próximos Passos (Opcional)

Se desejar expandir esta funcionalidade:

1. **Dashboard de Contratos**
   - Criar uma página para visualizar contratos próximos do vencimento
   - Alertas automáticos para contratos expirando

2. **Histórico de Anotações**
   - Implementar versionamento das notas
   - Registrar quem fez cada alteração e quando

3. **Relatórios**
   - Exportar lista de empresas com códigos
   - Relatório de contratos por período

4. **Busca por Código**
   - Adicionar campo de busca rápida por código do cliente
   - Filtros na listagem

## Suporte

Em caso de dúvidas ou problemas:
1. Verifique se a migração foi aplicada corretamente
2. Confirme que as variáveis de ambiente do Supabase estão configuradas
3. Abra o console do navegador para verificar erros JavaScript
4. Verifique os logs do Supabase para erros de banco de dados
