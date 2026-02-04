# SplitH — Sistema de controle financeiro compartilhado

Projeto de TCC: SplitH (nome provisório). Aplicação para controle financeiro compartilhado entre usuários/grupos, com frontend em Angular e backend em Java (Spring).

## Visão geral

SplitH permite que usuários registrem despesas, dividam valores entre participantes e acompanhem saldos de forma colaborativa. Este repositório contém a aplicação frontend (pasta `Front`) e o backend (pasta `Back/splith`).

## Status
Em desenvolvimento — protótipo inicial com telas de login e estrutura básica do backend.

## Tecnologias
- Frontend: Angular (CLI)
- Backend: Java + Spring Boot
- Tipos de arquivos e libs observadas: Tailwind, PrimeNG, Lombok (no backend)
- Ferramentas: Node.js, npm/yarn, Maven/Gradle (backend)

## Estrutura do repositório
- Front/ — código do frontend Angular
- Back/splith/ — código do backend Java (pacote `com.tcc.splith`)
- README.md — (este arquivo proposto)

## Requisitos (exemplos)
- Node.js >= 16
- npm ou yarn
- Java JDK 17+ (verificar versão requerida no projeto)
- Maven (ou Gradle), se o projeto backend usar Maven/Gradle
- (Opcional) Docker/Docker Compose

## Executando em desenvolvimento

### Frontend
1. Abrir terminal:
   cd Front
2. Instalar dependências:
   npm install
   (ou `yarn` / `pnpm install` conforme preferência)
3. Executar servidor de desenvolvimento:
   npx ng serve
   Ou, se estiver configurado:
   npm run start
4. Acessar:
   http://localhost:4200

### Backend
1. Abrir terminal:
   cd Back/splith
2. Se o projeto usa Maven:
   ./mvnw spring-boot:run
   ou
   mvn spring-boot:run
3. Se usar Gradle:
   ./gradlew bootRun
4. O backend normalmente sobe em:
   http://localhost:8080
   (verifique `application.properties` / `application.yml` para a porta)

## Variáveis de ambiente / Configurações comuns
No backend normalmente são necessárias variáveis de configuração (exemplos):
- SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/splith
- SPRING_DATASOURCE_USERNAME=usuario
- SPRING_DATASOURCE_PASSWORD=senha
- JWT_SECRET=uma_chave_secreta_para_tokens
- SERVER_PORT=8080

Adapte conforme seu arquivo de configuração do Spring (application.properties/yml). Para desenvolvimento, você pode usar um banco embarcado ou configurar um container Postgres.

## Endpoints (exemplo)
Observando o DTO `LoginRequest` (campos `email` e `password`), um exemplo de chamada de login pode ser:

curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@exemplo.com","password":"minhasenha"}'

(Substitua a rota `/api/auth/login` pela rota real definida nos controllers do backend.)

## Build / Produção

### Frontend
- Gerar build de produção:
  cd Front
  npx ng build --configuration production
  Os artefatos ficarão em `Front/dist/` (ou conforme configuração).

### Backend
- Gerar jar com Maven:
  mvn clean package
  java -jar target/seu-app.jar

## Testes
- Frontend:
  cd Front
  npx ng test
- Backend:
  mvn test (ou ./mvnw test)

## Desenvolvimento colaborativo
- Siga o padrão de commits do time (ex.: Conventional Commits)
- Abra pull requests com descrição clara do que foi alterado
- Para features maiores, crie uma branch feature/nome-da-feature

## Contribuindo
1. Fork do repositório
2. Crie uma branch: `feature/minha-feature`
3. Adicione testes e documentação
4. Abra um Pull Request descrevendo as mudanças

## Onde procurar código relevante
- Front: componentes de login e dashboard em `Front/src/app/components/`
- Back: pacotes em `Back/splith/src/main/java/com/tcc/splith/`

## Sugestões futuras
- Adicionar um docker-compose para facilitar o ambiente (frontend, backend, banco)
- Documentar endpoints com Swagger/OpenAPI
- Implementar autenticação completa e controle de permissões para grupos

## Contato
Criadores / mantenedores: LuisRuediger e CrisHeinzen

## Licença
Adicionar a licença do projeto (ex.: MIT) — caso ainda não exista, escolha e adicione um arquivo `LICENSE`.

