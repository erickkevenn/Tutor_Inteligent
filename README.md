# Tutor Inteligente para Equações Quadráticas

Este projeto foi desenvolvido como um **sistema tutor inteligente (STI)** moderno para o ensino de equações do 2º grau.  
Ele representa uma aplicação web interativa capaz de:
- Resolver equações quadráticas passo a passo
- Avaliar respostas do usuário com feedback inteligente
- Acompanhar o progresso e adaptar o ensino
- Fornecer dicas e explicações baseadas em modelos pedagógicos

## 🧠 Componentes do Sistema STI

- **Modelo Especialista** (`ExpertModel`): contém conhecimento sobre resolução de equações quadráticas e validação de respostas
- **Modelo do Estudante** (`StudentModel`): acompanha perfil, histórico de tentativas e progresso individual
- **Modelo Pedagógico** (`PedagogicalModel`): decide estratégias de ensino e intervenções baseadas no desempenho
- **Controlador do Tutor** (`TutorController`): orquestra os estados e ações do sistema
- **Regras Curriculares** (`CurriculumRules`): gerencia dificuldade e geração de exercícios
- **Interface Interativa**: construída com React e componentes modernos

---

## 🚀 Como executar localmente

### 1. Clone este repositório

```bash
git clone 
cd quadratic-tutor
```

### 2. Instale as dependências

```bash
npm install
# ou
bun install
```

### 3. Execute o servidor de desenvolvimento

```bash
npm run dev
# ou
bun dev
```

### 4. Acesse a aplicação

Abra [http://localhost:8080](http://localhost:8080) no seu navegador.

---

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca para construção da interface
- **TypeScript** - Linguagem tipada para desenvolvimento
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Framework de CSS utilitário
- **Shadcn/ui** - Componentes de interface modernos
- **Radix UI** - Primitivos de interface acessíveis
- **Lucide React** - Ícones modernos
- **React Router DOM** - Roteamento da aplicação
- **React Hook Form** - Gerenciamento de formulários
- **Sonner** - Notificações toast elegantes

---

## 📂 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── QuadraticTutor.tsx   # Componente principal do tutor
│   └── ui/              # Componentes de interface (Shadcn)
├── lib/                 # Lógica de negócio
│   ├── expertModel.ts   # Modelo especialista
│   ├── studentModel.ts  # Modelo do estudante
│   ├── pedagogicalModel.ts # Modelo pedagógico
│   ├── tutorController.ts # Controlador principal
│   └── curriculum.ts    # Regras curriculares
├── types/               # Definições de tipos TypeScript
├── hooks/               # Hooks customizados
└── pages/               # Páginas da aplicação
```

---

## 🎓 Funcionalidades Principais

- **Geração Inteligente de Exercícios**: Adapta dificuldade baseada no desempenho
- **Resolução Passo a Passo**: Mostra processo completo de resolução
- **Feedback Personalizado**: Mensagens adaptadas ao perfil do estudante
- **Sistema de Dicas**: Orientações progressivas baseadas em tentativas
- **Acompanhamento de Progresso**: Métricas de desempenho e tempo
- **Estratégias Pedagógicas**: Scaffolding, aprendizagem por descoberta e feedback adaptativo
- **Persistência Local**: Dados do estudante salvos no navegador

---

## 📊 Sistema de Avaliação

O sistema utiliza múltiplos critérios para avaliar e adaptar o ensino:
- Taxa de sucesso por dificuldade
- Tempo médio de resolução
- Padrões de erros comuns
- Progressão do nível de conhecimento
- Estratégias de aprendizagem preferidas

---

## 🚀 Deploy

Para fazer deploy da aplicação, você pode usar qualquer plataforma que suporte aplicações React/Vite, como Vercel, Netlify ou GitHub Pages.
