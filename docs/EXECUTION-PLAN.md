O projeto parte de uma dor clara: eliminar o atendimento analógico no room service e substituir isso por uma experiência digital com confirmação e rastreamento em tempo real, algo coerente com o MVP descrito no documento. As funcionalidades mais críticas são: menu digital, criação de pedidos, painel operacional e atualização de status em tempo real. 

---

# 1. Domínio inicial do MVP

## 1.1 Subdomínios

### A. Catálogo

Responsável por:

* hotéis
* quartos/locais de atendimento
* categorias do menu
* itens do menu

### B. Pedido

Responsável por:

* carrinho lógico
* criação do pedido
* itens do pedido
* observações
* histórico de status

### C. Operação

Responsável por:

* fila operacional
* aceite do pedido
* atualização de status
* visibilidade para staff

### D. Identidade e acesso

Responsável por:

* autenticação do staff
* papéis
* vínculo do usuário com hotel

### E. Sessão do hóspede

Responsável por:

* entrada via QR/link
* associação com quarto ou mesa
* contexto temporário de uso

---

# 2. Etapas de implementação

---

## Etapa 1 — Fundar o domínio e o schema do banco [FINALIZADA]

### Objetivo

Criar a base de dados, enums, relações e contratos que suportam o MVP completo.

### Entidades esperadas

#### `Hotel`

Campos:

* `id`
* `name`
* `slug`
* `active`
* `createdAt`
* `updatedAt`

#### `Room`

Campos:

* `id`
* `hotelId`
* `label` (ex.: 305, 1201)
* `floor`
* `qrCodeToken`
* `active`
* `createdAt`

#### `MenuCategory`

Campos:

* `id`
* `hotelId`
* `name`
* `description`
* `sortOrder`
* `active`

#### `MenuItem`

Campos:

* `id`
* `hotelId`
* `categoryId`
* `name`
* `description`
* `price`
* `imageUrl`
* `available`
* `preparationTimeMinutes`
* `createdAt`
* `updatedAt`

#### `GuestSession`

Campos:

* `id`
* `hotelId`
* `roomId`
* `token`
* `expiresAt`
* `createdAt`

#### `Order`

Campos:

* `id`
* `hotelId`
* `roomId`
* `guestSessionId`
* `status`
* `notes`
* `totalAmount`
* `placedAt`
* `acceptedAt`
* `preparingAt`
* `deliveringAt`
* `deliveredAt`
* `cancelledAt`

#### `OrderItem`

Campos:

* `id`
* `orderId`
* `menuItemId`
* `itemNameSnapshot`
* `unitPriceSnapshot`
* `quantity`
* `notes`
* `lineTotal`

#### `OrderStatusHistory`

Campos:

* `id`
* `orderId`
* `fromStatus`
* `toStatus`
* `changedByUserId` nullable
* `changedAt`
* `reason`

#### `StaffUserHotel`

Campos:

* `id`
* `userId`
* `hotelId`
* `role` (`admin`, `manager`, `kitchen`, `frontdesk`)
* `createdAt`

### Enums esperados

#### `OrderStatus`

* `pending`
* `accepted`
* `preparing`
* `out_for_delivery`
* `delivered`
* `cancelled`

### Funções de domínio esperadas

* `generateGuestSessionToken()`
* `calculateOrderTotal(items)`
* `validateOrderCreation(payload)`
* `canTransitionOrderStatus(currentStatus, nextStatus)`
* `transitionOrderStatus(order, nextStatus)`
* `isMenuItemAvailable(item)`
* `belongsToHotel(resourceHotelId, actorHotelId)`

### Testes unitários esperados

#### `calculateOrderTotal`

* soma corretamente itens com quantidades diferentes
* retorna zero com lista vazia
* ignora item inválido? não; deve lançar erro
* usa snapshot de preço, não preço atual do catálogo

#### `validateOrderCreation`

* falha quando não há itens
* falha quando quantidade é zero ou negativa
* falha quando item indisponível
* aceita observação vazia
* aceita múltiplos itens válidos

#### `canTransitionOrderStatus`

* permite `pending -> accepted`
* permite `accepted -> preparing`
* permite `preparing -> out_for_delivery`
* permite `out_for_delivery -> delivered`
* bloqueia pulo inválido como `pending -> delivered`
* bloqueia transição após `cancelled`
* bloqueia alteração após `delivered`

#### `belongsToHotel`

* retorna `true` quando hotel coincide
* retorna `false` quando hotel difere

---

## Etapa 2 — Implementar o módulo de catálogo [FINALIZADA]

### Objetivo

Permitir que o hóspede visualize o menu do hotel com categorias e itens disponíveis.

### Routers tRPC esperados

### `menuRouter`

Procedures:

* `listCategoriesByHotel`
* `listAvailableItems`
* `getMenuForGuestSession`

### Regras

* somente itens `available = true` aparecem para hóspedes
* o menu deve ser filtrado pelo hotel da sessão
* ordenar categorias e itens por `sortOrder` e nome

### Componentes Next.js esperados

* `GuestMenuPage`
* `CategorySection`
* `MenuItemCard`
* `GuestSessionGuard`

### Testes unitários esperados

#### `getMenuForGuestSession`

* retorna apenas categorias do hotel da sessão
* retorna apenas itens disponíveis
* não retorna itens de outro hotel
* falha quando sessão expirada
* falha quando token é inválido

#### `listAvailableItems`

* ordena corretamente
* não inclui itens sem categoria válida se a regra exigir integridade
* respeita hotelId informado

---

## Etapa 3 — Implementar criação de pedido pelo hóspede [FINALIZADA]

### Objetivo

Transformar navegação do menu em pedido persistido com valor total e rastreabilidade.

### Router tRPC esperado

### `orderRouter`

Procedures:

* `createOrderFromGuestSession`
* `getOrderByGuestSession`
* `listGuestOrders`

### Payload esperado para criação

* `guestSessionToken`
* `items[]`

  * `menuItemId`
  * `quantity`
  * `notes`
* `orderNotes`

### Regras

* o hóspede não precisa autenticar por login tradicional
* o pedido precisa gerar snapshot dos dados do item
* o total é calculado no backend
* ao criar pedido, status inicial = `pending`
* histórico inicial deve ser salvo

### Funções de domínio esperadas

* `buildOrderItemSnapshots(menuItems, requestedItems)`
* `createInitialStatusHistory(orderId)`
* `assertGuestSessionCanOrder(session)`
* `assertMenuItemsBelongToHotel(hotelId, items)`

### Testes unitários esperados

#### `buildOrderItemSnapshots`

* copia nome e preço do item no momento da compra
* calcula line total corretamente
* preserva observações do item
* falha se algum item não existir

#### `assertGuestSessionCanOrder`

* aceita sessão válida
* falha se sessão expirada
* falha se quarto inativo
* falha se hotel inativo

#### `createOrderFromGuestSession`

* cria pedido com status `pending`
* persiste `OrderItem`
* calcula total corretamente
* cria histórico inicial
* rejeita item de outro hotel
* rejeita item indisponível

---

## Etapa 4 — Implementar consulta e rastreamento do pedido [FINALIZADA]

### Objetivo

Dar ao hóspede a confirmação de que o pedido foi recebido e em que etapa ele está.

### Router tRPC esperado

No `orderRouter`:

* `getOrderTracking`
* `listOrderStatusHistory`

### Modelo de resposta esperado

* dados do pedido
* status atual
* timestamps principais
* linha do tempo de alterações
* tempo estimado opcional

### Componentes esperados

* `OrderTrackingPage`
* `OrderStatusBadge`
* `OrderTimeline`
* `OrderSummaryCard`

### Testes unitários esperados

#### `getOrderTracking`

* retorna apenas pedido vinculado à guest session
* falha ao consultar pedido de outra sessão
* inclui histórico completo ordenado por data
* inclui itens e total

#### `listOrderStatusHistory`

* retorna eventos em ordem cronológica
* não mistura histórico de pedidos diferentes

---

## Etapa 5 — Implementar painel operacional do hotel [FINALIZADA]

### Objetivo

Dar ao staff um painel para receber, aceitar e atualizar pedidos.

### Auth e autorização

Usar better-auth para staff.
Papéis iniciais:

* `admin`
* `manager`
* `kitchen`
* `frontdesk`

### Router tRPC esperado

### `staffOrderRouter`

Procedures:

* `listActiveOrders`
* `getOrderDetails`
* `acceptOrder`
* `markOrderPreparing`
* `markOrderOutForDelivery`
* `markOrderDelivered`
* `cancelOrder`

### Regras

* procedures protegidas com `protectedProcedure`
* cada usuário só acessa pedidos do hotel ao qual pertence
* transições devem respeitar máquina de estados
* toda transição gera histórico

### Componentes esperados

* `OperationalDashboardPage`
* `OrderQueueBoard`
* `OrderDetailsDrawer`
* `OrderActionButtons`
* `StaffHotelGuard`

### Funções de domínio esperadas

* `assertUserCanManageHotel(user, hotelId)`
* `transitionOrderStatusWithAudit(order, nextStatus, actorId)`
* `listOperationalOrders(filters)`

### Testes unitários esperados

#### `assertUserCanManageHotel`

* aceita usuário vinculado ao hotel
* rejeita usuário sem vínculo
* rejeita usuário do hotel errado

#### `transitionOrderStatusWithAudit`

* atualiza status do pedido
* grava evento no histórico
* registra `changedByUserId`
* atualiza timestamp correspondente
* falha em transição inválida

#### `listActiveOrders`

* retorna apenas pedidos ativos
* exclui `delivered` e `cancelled` se assim definido
* filtra por hotel
* ordena por prioridade/horário

---

## Etapa 6 — Sessão do hóspede via QR code/link [FINALIZADA]

### Objetivo

Representar o fluxo “escaneou o QR do quarto e entrou no contexto correto”.

### Estratégia de MVP

No MVP, o QR pode apontar para uma rota como:

`/g/[token]`

Esse token representa:

* hotel
* quarto
* sessão temporária

### Router esperado

### `guestSessionRouter`

Procedures:

* `resolveGuestSession`
* `createGuestSessionFromRoomToken`
* `refreshGuestSession`

### Regras

* token precisa ser opaco, não sequencial
* sessão deve expirar
* sessão deve ser vinculada ao quarto e hotel
* no MVP, uma sessão ativa por dispositivo já resolve

### Testes unitários esperados

#### `createGuestSessionFromRoomToken`

* cria sessão válida para quarto ativo
* falha para quarto inexistente
* falha para quarto inativo
* gera token único
* associa hotel e room corretamente

#### `resolveGuestSession`

* retorna dados do contexto
* falha quando sessão expirada
* falha quando token inválido

---

## Etapa 7 — Admin de catálogo para o hotel [FINALIZADA]

### Objetivo

Permitir ao hotel gerenciar categorias e itens.

### Routers esperados

### `catalogAdminRouter`

Procedures:

* `createCategory`
* `updateCategory`
* `reorderCategories`
* `createMenuItem`
* `updateMenuItem`
* `toggleMenuItemAvailability`

### Regras

* apenas `admin` e `manager`
* item sempre vinculado ao hotel correto
* mudanças não afetam snapshot de pedidos antigos

### Testes unitários esperados

#### `createMenuItem`

* cria item com categoria válida
* falha sem categoria do mesmo hotel
* salva preço válido
* falha em preço negativo

#### `toggleMenuItemAvailability`

* alterna disponibilidade
* não altera pedidos antigos
* impede acesso entre hotéis

---

## Etapa 8 — Tempo real e notificações [FINALIZADA]

### Objetivo

Entregar o principal valor percebido: transparência do status do pedido.

### Estratégia por etapas

#### MVP técnico inicial

* polling via tRPC/React Query a cada poucos segundos

#### Evolução

* canal em tempo real por WebSocket/SSE
* eventos de domínio publicados a cada transição de status

### Eventos esperados

* `order.created`
* `order.accepted`
* `order.preparing`
* `order.out_for_delivery`
* `order.delivered`
* `order.cancelled`

### Funções esperadas

* `publishOrderStatusChanged(event)`
* `buildOrderStatusEvent(order, actor)`
* `shouldNotifyGuest(status)`

### Testes unitários esperados

#### `buildOrderStatusEvent`

* monta payload mínimo correto
* inclui orderId, hotelId, roomId, status, timestamp

#### `shouldNotifyGuest`

* retorna `true` para mudanças operacionais relevantes
* retorna `false` para eventos internos irrelevantes

---

## Etapa 9 — Multi-tenant desde a base [FINALIZADA]

### Objetivo

Garantir que um único deployment suporte múltiplos hotéis com isolamento lógico.

### Regra principal

Toda entidade de negócio relevante deve carregar `hotelId` direta ou indiretamente.

### Estratégias

* filtro por `hotelId` em todas as queries protegidas
* validação de pertencimento entre recurso e ator
* índices por hotel para performance
* futuramente, subdomínio ou slug do hotel

### Testes unitários esperados

#### isolamento de tenant

* usuário do hotel A não consulta pedidos do hotel B
* guest session do hotel A não consulta menu do hotel B
* item do hotel B não pode ser incluído em pedido do hotel A

---

## Etapa 10 — Observabilidade, erros e auditoria [FINALIZADA]

### Objetivo

Evitar o principal medo do usuário: “o pedido foi enviado ou se perdeu?”

### Recursos conceituais

* logs estruturados por pedido
* IDs correlacionáveis
* status history obrigatório
* mensagens claras de erro para staff e hóspede

### Funções esperadas

* `mapDomainErrorToUserMessage(error)`
* `createOrderAuditContext(order)`
* `assertOrderExists(orderId)`

### Testes unitários esperados

#### `mapDomainErrorToUserMessage`

* converte erro de sessão expirada em mensagem amigável
* converte erro de item indisponível em mensagem específica
* converte erro genérico em fallback seguro

---

# 5. Estrutura sugerida por package

## `packages/db`

Responsável por:

* schema Drizzle
* enums
* relações
* migrations
* seeds de desenvolvimento

Arquivos sugeridos:

* `schema/hotel.ts`
* `schema/menu.ts`
* `schema/order.ts`
* `schema/auth.ts`
* `schema/guest-session.ts`

## `packages/api`

Responsável por:

* routers
* services de aplicação
* validações
* regras de autorização

Estrutura sugerida:

* `router/menu.ts`
* `router/order.ts`
* `router/staff-order.ts`
* `router/catalog-admin.ts`
* `router/guest-session.ts`
* `services/order-service.ts`
* `services/menu-service.ts`
* `domain/order.ts`
* `domain/guest-session.ts`

## `apps/nextjs`

Responsável por:

* páginas App Router
* server components
* client components
* dashboard e experiência do hóspede

Rotas sugeridas:

* `/g/[token]`
* `/g/[token]/menu`
* `/g/[token]/orders/[orderId]`
* `/staff/orders`
* `/staff/menu`
* `/staff/menu/items`
* `/staff/settings/rooms`

---

# 6. Ordem ideal de implementação para a IA

## Sprint 1 — Base técnica

1. schema Drizzle
2. seeds com hotel, quartos, categorias e itens
3. enums e funções de domínio
4. testes unitários do domínio

## Sprint 2 — Fluxo do hóspede

1. sessão por token
2. listagem do menu
3. criação de pedido
4. tela de confirmação

## Sprint 3 — Rastreamento

1. consulta do pedido
2. timeline de status
3. polling para atualização

## Sprint 4 — Painel operacional

1. auth staff
2. lista de pedidos
3. ações de transição
4. auditoria de status

## Sprint 5 — Administração e robustez

1. CRUD de catálogo
2. controle de papéis
3. observabilidade
4. hardening multi-tenant

---

# 7. Critérios de aceite do MVP

O MVP estará conceitualmente pronto quando:

* um hóspede acessar um link/QR do quarto
* visualizar o cardápio do hotel correto
* criar um pedido com itens e observações
* receber confirmação imediata
* acompanhar o status do pedido
* o staff visualizar o pedido no dashboard
* o staff atualizar o status
* o hóspede enxergar essas mudanças
* nenhum ator acessar dados de outro hotel

---

# 8. Matriz resumida de entidades e responsabilidades

## Catálogo

* `Hotel`
* `Room`
* `MenuCategory`
* `MenuItem`

## Sessão do hóspede

* `GuestSession`

## Pedido

* `Order`
* `OrderItem`
* `OrderStatusHistory`

## Staff

* `User` da auth
* `StaffUserHotel`

---

# 9. Matriz resumida de testes por módulo

## Domínio do pedido

* cálculo de total
* snapshot de item
* máquina de estados
* auditoria de transição

## Sessão do hóspede

* criação por token
* expiração
* resolução de contexto

## Catálogo

* visibilidade por hotel
* disponibilidade
* ordenação

## Operação

* autorização por papel
* fila ativa
* atualização de status
* isolamento multi-tenant

---

# 10. Observações importantes para a IA que vai implementar

## Sobre tRPC

* routers finos
* regra de negócio em funções reutilizáveis
* validação de entrada com schemas explícitos

## Sobre banco

* snapshots no pedido são obrigatórios
* não depender do preço atual do menu para histórico
* índices importantes: `hotelId`, `status`, `roomId`, `placedAt`

## Sobre auth

* staff autenticado
* hóspede com sessão temporária
* não misturar os dois fluxos

## Sobre UX

* status visível e legível
* confirmação instantânea
* mensagens de erro humanas
* menu simples e rápido no mobile
