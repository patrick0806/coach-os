# PRD --- Plataforma SaaS para Personal Trainers

## 1. Visão do Produto

Criar uma plataforma SaaS que permita que **personal trainers gerenciem
seus alunos, treinos e progresso**, oferecendo também um **portal de
acesso para os alunos** com identidade visual do personal (white‑label
básico).

A plataforma deve funcionar tanto para: - personal presencial
(academia) - personal online (consultoria)

Cada personal terá um workspace isolado (**multi‑tenant**).

------------------------------------------------------------------------

# 2. Objetivos do Produto

Objetivos principais:

1.  Centralizar gestão de alunos
2.  Facilitar criação de treinos
3.  Melhorar retenção de alunos
4.  Aumentar profissionalismo do personal
5.  Permitir branding básico
6.  Criar histórico estruturado de evolução do aluno

------------------------------------------------------------------------

# 3. Usuários

## Personal Trainer

Usuário principal.

Necessidades:

-   gerenciar alunos
-   montar treinos rapidamente
-   acompanhar evolução
-   organizar agenda
-   registrar observações
-   parecer profissional

## Aluno

Usuário secundário.

Necessidades:

-   acessar treino
-   registrar execução
-   acompanhar evolução
-   visualizar agenda
-   registrar cargas usadas

------------------------------------------------------------------------

# 4. Planos SaaS

## Plano Básico

Preço: R\$ 29,90 / mês

Limite: - até 10 alunos

Recursos: - gestão de alunos - criação de treinos - biblioteca de
exercícios - portal do aluno

## Plano Pro

Preço: R\$ 49,90 / mês

Limite: - até 30 alunos

Recursos: - todos do plano básico - exercícios personalizados - página
pública - personalização de marca

## Plano Elite

Preço: R\$ 99,90 / mês

Limite: - até 100 alunos

Recursos: - todos os recursos anteriores - métricas avançadas -
histórico completo - maior armazenamento de mídia

------------------------------------------------------------------------

# 5. Painel do Personal

## Autenticação

-   login
-   cadastro
-   recuperação de senha

## Onboarding

Fluxo inicial:

1.  completar perfil
2.  criar primeiro aluno
3.  criar primeiro treino
4.  convidar aluno

------------------------------------------------------------------------

# 6. Gestão de Alunos

## Criar aluno

Personal pode:

-   criar aluno manualmente
-   enviar convite por email
-   gerar link de convite

Convite pode ser compartilhado por:

-   email
-   WhatsApp

## Campos do aluno

-   nome
-   email
-   telefone
-   objetivo
-   observações
-   restrições físicas

## Status do aluno

-   active
-   paused
-   archived

------------------------------------------------------------------------

# 7. Notas do Aluno

Personal pode registrar notas internas.

Exemplos:

-   histórico de lesões
-   observações de atendimento
-   estratégias de treino

Notas são ordenadas por data.

------------------------------------------------------------------------

# 8. Biblioteca de Exercícios

Cada exercício possui:

-   nome
-   grupo muscular
-   descrição
-   instruções
-   mídia (imagem ou vídeo)

Tipos:

### Exercícios globais

Criados pela plataforma.

### Exercícios personalizados

Criados pelo personal e visíveis apenas para ele.

------------------------------------------------------------------------

# 9. Templates de Treino

Personal pode criar **templates reutilizáveis**.

Funções:

-   criar template
-   duplicar template
-   editar template
-   aplicar template para alunos

------------------------------------------------------------------------

# 10. Programas de Treino para Alunos

Quando um template é aplicado a um aluno, cria-se um **programa
independente**.

Personal pode customizar:

-   exercícios
-   carga sugerida
-   repetições

Estados do programa:

-   active
-   finished
-   cancelled

------------------------------------------------------------------------

# 11. Execução de Treino

Fluxo do aluno:

1 iniciar treino\
2 registrar sets\
3 registrar carga usada\
4 marcar exercício concluído\
5 finalizar treino

Sistema registra:

-   tempo total
-   sets executados
-   carga utilizada

------------------------------------------------------------------------

# 12. Registro de Progresso

Personal pode registrar:

-   peso
-   medidas
-   percentual de gordura
-   fotos

Sistema exibe:

-   gráficos
-   histórico

------------------------------------------------------------------------

# 13. Agenda

Personal pode:

-   criar sessão
-   reagendar
-   cancelar

Campos:

-   aluno
-   data
-   duração
-   tipo (online ou presencial)
-   observações

Regra:

-   personal não pode ter sessões sobrepostas

------------------------------------------------------------------------

# 14. Portal do Aluno

Aluno terá login próprio.

Funções:

## Visualizar Treino

-   treino atual
-   exercícios
-   séries
-   repetições

## Executar Treino

-   iniciar treino
-   registrar carga
-   finalizar treino

## Evolução

-   gráficos
-   histórico

## Agenda

-   visualizar sessões

------------------------------------------------------------------------

# 15. Notificações

Sistema envia:

-   lembrete de treino
-   lembrete de sessão
-   treino não realizado

Inicialmente via email.

------------------------------------------------------------------------

# 16. White‑Label Básico

Personal pode configurar:

-   logo
-   cor principal

Afeta:

-   portal do aluno
-   páginas públicas

------------------------------------------------------------------------

# 17. Página Pública do Personal

Exemplo:

app.com/personal/joao-silva

Contém:

-   foto
-   bio
-   especialidades
-   botão WhatsApp

------------------------------------------------------------------------

# 18. Arquitetura Técnica

## Backend

NestJS

Responsável por:

-   API REST
-   regras de negócio
-   autenticação
-   uploads

## Frontend

Next.js

## Banco

PostgreSQL

## Armazenamento

AWS S3

## Monitoramento

Better Stack

------------------------------------------------------------------------

# 19. Roadmap

Fase 1 --- Fundação - autenticação - multi tenant - estrutura inicial

Fase 2 --- Alunos - CRUD alunos - notas - convite

Fase 3 --- Treinos - biblioteca exercícios - templates

Fase 4 --- Execução - registrar sets - histórico

Fase 5 --- Evolução - progresso - gráficos

Fase 6 --- Branding - página pública

Fase 7 --- Ajustes - testes - melhorias

------------------------------------------------------------------------

# 20. Métricas de Sucesso

-   personais cadastrados
-   alunos ativos
-   treinos executados
-   taxa de conclusão de treino
-   retenção semanal

------------------------------------------------------------------------

# 21. Riscos

1 escopo crescer demais\
2 baixa adoção\
3 UX ruim na criação de treinos

Mitigação:

-   validar com personais reais
