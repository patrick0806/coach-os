# PRD --- Plataforma SaaS para Personal Trainers

## 1. Visão do Produto

Criar uma plataforma SaaS que permita que **personal trainers gerenciem
seus alunos, treinos e progresso**, oferecendo também um **portal de
acesso para os alunos** com identidade visual do personal (white‑label
básico).

A plataforma deve funcionar tanto para:

-   personal **presencial (academia)**
-   personal **online (consultoria)**

O sistema também ajudará o personal a **parecer mais profissional e
melhorar retenção de alunos**.

------------------------------------------------------------------------

# 2. Objetivos do Produto

## Objetivos principais

1.  Centralizar a gestão de alunos
2.  Facilitar criação e acompanhamento de treinos
3.  Melhorar retenção de alunos
4.  Oferecer uma experiência profissional para o aluno
5.  Permitir personalização básica de marca

------------------------------------------------------------------------

# 3. Usuários

## Personal Trainer

Usuário principal da plataforma.

Necessidades:

-   gerenciar alunos
-   montar treinos
-   acompanhar evolução
-   organizar agenda
-   parecer profissional

## Aluno

Usuário secundário.

Necessidades:

-   ver treino
-   registrar progresso
-   acompanhar evolução
-   visualizar agenda

------------------------------------------------------------------------

# 4. Escopo do MVP

## Painel do Personal

### Autenticação

-   login
-   cadastro
-   recuperação de senha

### Perfil do Personal

Campos:

-   nome
-   foto
-   bio
-   especialidade
-   redes sociais
-   cor da marca
-   logo

### Gestão de Alunos

Funções:

-   criar aluno
-   editar aluno
-   arquivar aluno

Campos:

-   nome
-   email
-   telefone
-   objetivo
-   observações
-   restrições físicas

### Perfil do Aluno

Contém:

-   informações básicas
-   histórico de progresso
-   treinos atribuídos
-   fotos de evolução

### Criador de Treinos

Treino composto por:

-   nome
-   exercícios
-   séries
-   repetições
-   descanso
-   observações

Funcionalidades:

-   adicionar exercícios
-   ordenar exercícios
-   duplicar treino
-   aplicar treino para aluno

### Biblioteca de Exercícios

Cada exercício possui:

-   nome
-   grupo muscular
-   descrição
-   imagem ou vídeo

Inicialmente:

-   biblioteca padrão do sistema

### Registro de Progresso

Personal pode registrar:

-   peso
-   medidas
-   percentual de gordura
-   fotos

Exibir:

-   gráfico de evolução
-   histórico

### Agenda

Personal pode:

-   marcar sessão
-   reagendar
-   cancelar

Campos:

-   aluno
-   data
-   tipo (presencial / online)
-   observações

------------------------------------------------------------------------

# 5. Portal do Aluno

Aluno terá login próprio.

Funções disponíveis:

### Visualizar Treino

Mostrar:

-   treino atual
-   exercícios
-   séries
-   repetições

### Registrar Treino

Aluno pode registrar:

-   carga usada
-   observações

### Ver Evolução

Mostrar:

-   gráfico de peso
-   progresso

### Agenda

Aluno pode ver:

-   próximas sessões

------------------------------------------------------------------------

# 6. White‑Label Básico

Personal pode configurar:

-   logo
-   cor principal

Essas configurações alteram:

-   portal do aluno
-   painel visual

------------------------------------------------------------------------

# 7. Marketing Básico

Página pública simples para cada personal:

    app.com/personal/joao-silva

Contém:

-   bio
-   especialidades
-   botão de contato

------------------------------------------------------------------------

# 8. Pagamentos (fase final)

Não será implementado no MVP inicial.

Planejado para fase final:

-   assinatura mensal
-   limites de alunos por plano

Gateway provável:

-   Stripe

------------------------------------------------------------------------

# 9. Arquitetura Técnica

## Backend

Framework:

-   NestJS

Responsável por:

-   API REST
-   autenticação
-   regras de negócio
-   upload de arquivos

## Frontend

Framework:

-   Next.js

Responsável por:

-   painel do personal
-   portal do aluno
-   páginas públicas

## Banco de Dados

PostgreSQL

Principais entidades:

-   users
-   trainers
-   students
-   workouts
-   exercises
-   workout_logs
-   progress_logs
-   sessions

## Armazenamento de arquivos

AWS S3

Usado para:

-   fotos de evolução
-   imagens de exercícios
-   logos

## Monitoramento

Better Stack

Monitorar:

-   uptime
-   logs de erro
-   performance básica

------------------------------------------------------------------------

# 10. Custos (estratégia)

Manter infraestrutura mínima.

Estratégia:

-   1 servidor backend
-   1 banco de dados pequeno
-   S3 somente para mídia

Evitar inicialmente:

-   microserviços
-   filas complexas
-   infra distribuída

------------------------------------------------------------------------

# 11. Roadmap de Desenvolvimento

## Fase 1 --- Fundação (semanas 1--2)

Implementar:

-   autenticação
-   estrutura base do projeto
-   banco de dados
-   CRUD de usuários

## Fase 2 --- Gestão de alunos (semanas 3--4)

Implementar:

-   CRUD alunos
-   perfil do aluno
-   upload de foto

## Fase 3 --- Treinos (semanas 5--6)

Implementar:

-   biblioteca de exercícios
-   criação de treino
-   associação treino ↔ aluno

## Fase 4 --- Portal do aluno (semana 7)

Implementar:

-   login aluno
-   visualização de treino
-   registro de carga

## Fase 5 --- Evolução + agenda (semana 8)

Implementar:

-   registro de progresso
-   gráficos
-   agenda

## Fase 6 --- Branding (semana 9)

Implementar:

-   logo
-   cores
-   página pública

## Fase 7 --- Ajustes e testes (semana 10--12)

-   otimizações
-   correções
-   monitoramento
-   preparação para lançamento

------------------------------------------------------------------------

# 12. Métricas de Sucesso

Após lançamento:

-   número de personais cadastrados
-   alunos ativos
-   retenção semanal
-   treinos registrados

------------------------------------------------------------------------

# 13. Riscos

Principais riscos:

1.  escopo crescer demais
2.  baixa adoção por personal trainers
3.  UX ruim para criação de treinos

Mitigação:

-   lançar MVP rápido
-   validar com personais reais

------------------------------------------------------------------------

# 14. Futuras Funcionalidades

Após MVP:

-   pagamentos
-   app mobile
-   notificações
-   templates de treino
-   gamificação
-   sistema de indicação
