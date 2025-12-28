# Documentação Finchat 1.0.0

## 0. Diagrama

``` mermaid
    erDiagram
    USUARIO {
        long usuario_id PK
        string nome
        string email
        string password_hash
        datetime data_criacao
    }

    CONTA_BANCARIA {
        long conta_id PK
        long fk_usuario_id FK
        string nome_instituicao
        string apelido_conta
        decimal saldo_inicial "Importante para bater o saldo"
    }

    CARTAO_CREDITO {
        long cartao_id PK
        long fk_conta_bancaria_id FK "Corrigido nome para match com tabela"
        string apelido
        int dia_fechamento
        int dia_vencimento
    }

    FATURA {
        long fatura_id PK
        long fk_cartao_id FK
        int mes_ref
        int ano_ref
        enum status "ABERTA, FECHADA, PAGA"
        decimal valor_total
        date data_vencimento_real "Caso caia fds"
    }

    CATEGORIA {
        long categoria_id PK
        string nome
        string tipo "DESPESA, RECEITA"
    }

    PARAMETRO_USUARIO {
        long parametro_usuario_id PK
        long fk_usuario_id FK
        string nome_parametro
        string valor
        boolean visivel_pelo_usuario
    }

    CONFIG_RECORRENCIA {
        long recorrencia_id PK
        long fk_usuario_id FK
        string descricao_padrao
        decimal valor_padrao
        enum tipo_operacao
        long fk_categoria_padrao_id FK
        long fk_conta_padrao_id FK "nullable"
        long fk_cartao_padrao_id FK "nullable"
        enum frequencia
        int dia_execucao
        date data_inicio
        date data_fim "nullable"
        boolean ativo
    }

    OPERACAO {
        long operacao_id PK
        long fk_usuario_id FK
        string descricao
        string entidade_envolvida
        datetime data_evento
        decimal valor_total
        int qtde_parcelas
        enum tipo_operacao "DESPESA, RECEITA, TRANSFERENCIA"
        long fk_recorrencia_id FK "nullable"
    }

    TRANSACAO {
        long transacao_id PK
        long fk_operacao_id FK
        long fk_categoria_id FK
        long fk_fatura_id FK "nullable - Agora aponta para PK simples"
        long fk_conta_debitada_id FK "nullable"
        int numero_parcela "nullable"
        date data_vencimento "nullable"
        date data_efetivacao "nullable"
        decimal valor
        boolean isEfetivada
        boolean isPagamentoFatura
    }

    %% Relacionamentos
    USUARIO ||--o{ CONTA_BANCARIA : possui
    USUARIO ||--o{ PARAMETRO_USUARIO : define
    USUARIO ||--o{ CONFIG_RECORRENCIA : configura
    USUARIO ||--o{ OPERACAO : realiza

    CONTA_BANCARIA ||--o{ CARTAO_CREDITO : "paga fatura de"
    CONTA_BANCARIA ||--o{ CONFIG_RECORRENCIA : "padrao debito"
    CONTA_BANCARIA ||--o{ TRANSACAO : movimenta

    CARTAO_CREDITO ||--o{ FATURA : gera
    CARTAO_CREDITO ||--o{ CONFIG_RECORRENCIA : "padrao credito"

    FATURA ||--o{ TRANSACAO : agrupa

    CATEGORIA ||--o{ CONFIG_RECORRENCIA : "padrao"
    CATEGORIA ||--o{ TRANSACAO : classifica

    CONFIG_RECORRENCIA |o--o{ OPERACAO : gera

    OPERACAO ||--|{ TRANSACAO : subdivide_em                                                                     
```
---

# Documentação Finchat 1.0.0

## 1. Dicionário de Dados

### 1.1. Núcleo de Identificação e Configuração

#### `USUARIO`

Representa o cliente do sistema.

* **usuario_id:** Identificador único (PK).
* **password_hash:** Senha criptografada.
* **data_criacao:** Data de cadastro para auditoria.
// TODO -  CRIAR MAIS CAMPOS NECESSARIOS PELO FRAMEWORK DE AUTH

#### `PARAMETRO_USUARIO`

Armazena configurações chave-valor para personalização.

* **nome_parametro:** Chave da configuração (ex: `TEMA`, `OBSCURECER_VALORES`).
* **valor:** O valor da configuração.
* **visivel_pelo_usuario:** Define se é editável na interface ou uma *flag* interna (ex: `PLANO_PREMIUM`).

#### `CATEGORIA`

Classificação **global** das transações para relatórios.

* **nome:** Rótulo único no sistema (ex: "Alimentação", "Transporte").
* *Nota:* Como não possui vínculo com usuário, estas categorias são padronizadas pelo administrador do sistema e compartilhadas por todos, pelo menos por enquanto.

---

### 1.2. Contas e Meios de Pagamento

#### `CONTA_BANCARIA`

Onde o dinheiro reside (Conta Corrente, Carteira Física, Investimentos).

* **nome_instituicao:** Banco ou Fintech.
* **apelido_conta:** Nome amigável.
* **saldo_inicial:** Valor de partida da conta no momento do cadastro (essencial para que o saldo calculado bata com o saldo real do banco).

#### `CARTAO_CREDITO`

Meio de pagamento com ciclo de faturamento.

* **fk_conta_pagamento_id:** Conta bancária padrão para débito automático da fatura.
* **dia_fechamento:** Dia da virada da fatura.
* **dia_vencimento:** Dia limite para pagamento.

#### `FATURA`

Agrupa transações de crédito.

* **fatura_id (PK):** Identificador único da fatura (substitui a chave composta anterior para permitir FKs diretas).
* **fk_cartao_id:** O cartão dono da fatura.
* **mes_ref / ano_ref:** Mês e ano de competência.
* **data_vencimento_real:** A data exata que o boleto vence (pode diferir do dia padrão caso caia em feriado/fim de semana).
* **status:** `ABERTA`, `FECHADA`, `PAGA`.

---

### 1.3. Transacional

#### `CONFIG_RECORRENCIA`

Motor de automação financeira.

* **descricao_padrao / valor_padrao:** Dados base.
* **fk_conta_padrao / fk_cartao_padrao:** Destino do lançamento.
* **frequencia:** Mensal, Semanal.
* **dia_execucao:** Gatilho para o *Job* (se for semana 1 a 7, mês 1 a 31).
* **ativo:** Liga/Desliga a automação.

#### `OPERACAO` (O Evento Macro)

O fato gerador da movimentação.

* **entidade_envolvida:** Loja ou Beneficiário.
* **data_evento:** Data da compra/ocorrência.
* **valor_total:** Valor cheio.
* **qtde_parcelas:** Divisão do valor.
* **tipo_operacao:**
* `DESPESA`: Sai dinheiro.
* `RECEITA`: Entra dinheiro.
* `TRANSFERENCIA`: Movimentação neutra entre contas do mesmo usuário (evita inflar relatórios de gastos/ganhos).



#### `TRANSACAO` (A Movimentação Financeira)

O registro contábil granular.

* **fk_operacao_id:** Vínculo pai.
* **fk_categoria_id:** Classificação global.
* **fk_fatura_id:** Preenchido SE Crédito. Aponta para o ID único da Fatura.
* **fk_conta_debitada_id:** Preenchido SE Débito/PIX/Transferência.
* **data_vencimento:** (Novo) Data limite para pagamento (essencial para boletos que não são cartão de crédito, ex: conta de luz).
* **data_efetivacao:** Data real da liquidação.
* **isEfetivada:**
* `FALSE`: Agendado/Previsão.
* `TRUE`: Consolidado (afeta saldo).



---

## 2. Regras de Negócio e Lógica de Consultas

### RN01 - Inserção de Despesa Parcelada (Crédito)

Ao inserir compra parcelada (ex: R$ 1000 em 10x no dia 05/01):

1. Criar `OPERACAO` (Valor: 1000).
2. Calcular os meses de referência baseando-se no `dia_fechamento`.
3. Buscar ou Criar as respectivas `FATURAS` (se ainda não existirem no banco para aquele mês/ano).
4. Criar 10 `TRANSACOES` vinculando o `fk_fatura_id` correto a cada parcela.
* `fk_conta_debitada_id` = NULO.
* `isEfetivada` = FALSE.



### RN02 - Pagamento de Fatura

Ocorre quando o dinheiro sai da conta para liquidar o cartão.

1. Gerar uma nova `OPERACAO` (Tipo: Despesa ou Transferência Interna, dependendo da modelagem contábil preferida).
2. Gerar `TRANSACAO` de saída na `CONTA_BANCARIA` (`isPagamentoFatura = TRUE`).
3. Atualizar status da `FATURA` para "PAGA".
4. **Conciliação:** Atualizar todas as `TRANSACOES` itens daquela fatura para `isEfetivada = TRUE` e `data_efetivacao` = Data do Pagamento.

### RN03 - Cálculo de Saldo Bancário

O saldo não pode somar transações de cartão de crédito pendentes, apenas o que impacta a conta bancária direta.

* **Fórmula:**


* **Filtro da Soma:**
Somar `valor` ONDE:
1. `fk_conta_debitada_id` == ID da Conta Consultada.
2. `isEfetivada` == TRUE.
*(Transações de crédito possuem conta NULL, logo são ignoradas corretamente nesta soma).*



### RN04 - Fluxo de Caixa Projetado

Previsão de saldo futuro.

* **Lógica:** Saldo Atual (RN03) + Soma de Transações (`fk_conta_debitada_id` != NULL) onde `isEfetivada` = FALSE e `data_vencimento` <= Data Limite.

### RN05 - Rotina de Recorrência

Script diário (Worker):

1. Busca `CONFIG_RECORRENCIA` ativas com `dia_execucao` == Hoje.
2. Gera `OPERACAO` e `TRANSACAO`.
3. Se for Despesa Fixa (ex: Aluguel), insere com `data_vencimento` definida e `isEfetivada = FALSE`.
4. Se for Assinatura em Cartão, insere já vinculada à Fatura aberta atual.

### RN06 - Restrição de Origem

Uma `TRANSACAO` deve ter origem exclusiva de fundos:

* OU `fk_fatura_id` é preenchido (Origem: Limite de Crédito).
* OU `fk_conta_debitada_id` é preenchido (Origem: Saldo em Conta).
* Ambos não podem ser preenchidos simultaneamente (exceto em casos raros de estorno, mas recomenda-se evitar).

### RN07 - Lógica de Transferência

Para transferências entre contas (ex: Conta Corrente -> Poupança):

1. Criar `OPERACAO` com tipo `TRANSFERENCIA`.
2. Criar `TRANSACAO A` (Saída): Valor negativo, `fk_conta_debitada_id` = Origem.
3. Criar `TRANSACAO B` (Entrada): Valor positivo, `fk_conta_debitada_id` = Destino.

* *Obs:* Estas transações devem ser filtradas fora dos gráficos de "Gastos por Categoria" para não duplicar volume financeiro.

---

### Próximo Passo

Gostaria que eu gerasse as **queries SQL (DDL)** para criar essas tabelas no seu banco de dados (PostgreSQL/MySQL), já com as constraints e chaves estrangeiras configuradas?