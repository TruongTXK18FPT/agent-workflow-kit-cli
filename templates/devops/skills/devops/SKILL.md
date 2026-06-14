---
name: devops
description: Generate optimized production Dockerfiles and GitHub Actions CI/CD workflows tailored to the project stack
---

Follow this process to generate production-ready Dockerfile configurations and GitHub Actions workflows (.github/workflows/ci-cd.yml) for the codebase.

Inputs:
- targetStack: One of `node`, `python`, `go`, `rust`, `java`, `dotnet`
- containerRegistry: Where to push the image (`ghcr.io` or `docker.io`)
- imageRepository: Repository/image name path (e.g. `username/repo-name`)

Steps:
1. **Detect Framework Details:**
   - Scan root files to identify dependency management tools (e.g., `package.json`, `requirements.txt`/`pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`/`build.gradle`, `.csproj`).
   - Match the target stack configuration rules below.

2. **Generate Multi-Stage Dockerfile:**
   - Construct a `Dockerfile` at the root of the project using multi-stage builds.
   - Enforce:
     - **Layer caching:** Copy lockfiles/manifests first and install dependencies before copying source files.
     - **Non-root execution:** Setup a dedicated non-root user and assign permissions.
     - **Security:** Do not use full development/SDK base images for final running stages. Use slim, minimal alpine or distroless images.

3. **Generate GitHub Actions CI/CD Pipeline:**
   - Create a workflow file at `.github/workflows/ci-cd.yml`.
   - Setup:
     - Triggers: Push to main/master, Pull Request to main/master.
     - Pipeline Steps: checkout -> setup toolchain -> cache packages -> lint -> test -> setup Docker buildx -> login to registry -> build and push.

4. **Verify Files:**
   - Print output file paths and summarize configuration details for the user.

---

## 🏛️ DevOps Templates by Stack

### 1. Node.js Ecosystem (Express, NestJS, Next.js, React-TS)

#### Dockerfile
```dockerfile
# Stage 1: Build dependencies and compile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

# Stage 2: Minimal runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# If Next.js, copy public/next files as appropriate
USER nextjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### GitHub Actions
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install Dependencies
        run: npm ci
      - name: Run Lint
        run: npm run lint --if-present
      - name: Run Tests
        run: npm run test --if-present

  build-and-push:
    needs: validate
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: $\{{ github.actor }}
          password: $\{{ secrets.GITHUB_TOKEN }}
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/$\{{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

### 2. Python Ecosystem (FastAPI, Flask, AI/Data Science)

#### Dockerfile
```dockerfile
# Stage 1: Install packages
FROM python:3.11-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir poetry
COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false && poetry install --no-dev --no-interaction --no-ansi

# Stage 2: Minimal runtime
FROM python:3.11-slim AS runner
WORKDIR /app
RUN useradd -u 1001 appuser && chown -R appuser /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .
USER appuser
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### GitHub Actions
```yaml
name: Python CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install ruff pytest
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
      - name: Lint
        run: ruff check .
      - name: Test
        run: pytest

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: $\{{ github.actor }}
          password: $\{{ secrets.GITHUB_TOKEN }}
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/$\{{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

### 3. Go Ecosystem

#### Dockerfile
```dockerfile
# Stage 1: Build the binary
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main .

# Stage 2: Distroless secure runner
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=builder /app/main /main
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/main"]
```

#### GitHub Actions
```yaml
name: Go Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - name: Get dependencies
        run: go mod download
      - name: Lint & Test
        run: |
          go vet ./...
          go test -v ./...

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: $\{{ github.actor }}
          password: $\{{ secrets.GITHUB_TOKEN }}
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/$\{{ github.repository }}:latest
```

---

### 4. Rust Ecosystem

#### Dockerfile
```dockerfile
# Stage 1: Build dependencies and source
FROM rust:1.76-alpine AS builder
RUN apk add --no-cache musl-dev
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
# Create dummy main to compile dependencies first for layer caching
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release
COPY . .
RUN touch src/main.rs && cargo build --release

# Stage 2: Final runtime
FROM alpine:3.19
WORKDIR /app
RUN adduser -D -u 1001 appuser
COPY --from=builder /app/target/release/app-name /app/app-binary
USER appuser
EXPOSE 8080
ENTRYPOINT ["/app/app-binary"]
```

#### GitHub Actions
```yaml
name: Rust CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Rust toolchain
        uses: dtolnay/rust-toolchain@stable
      - name: Cache dependencies
        uses: swatinem/rust-cache@v2
      - name: Lint and Test
        run: |
          cargo check
          cargo test

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: $\{{ github.actor }}
          password: $\{{ secrets.GITHUB_TOKEN }}
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/$\{{ github.repository }}:latest
```

---

### 5. Java Spring Boot Ecosystem

#### Dockerfile
```dockerfile
# Stage 1: Compile application
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN ./mvnw dependency:go-offline
COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Running environment
FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=builder /app/target/*.jar app.jar
USER spring:spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### GitHub Actions
```yaml
name: Java Spring Boot Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup JDK
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'maven'
      - name: Compile and Test
        run: ./mvnw clean test

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: $\{{ github.actor }}
          password: $\{{ secrets.GITHUB_TOKEN }}
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/$\{{ github.repository }}:latest
```

---

### 6. .NET Ecosystem (C#)

#### Dockerfile
```dockerfile
# Stage 1: Compile app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
WORKDIR /app
COPY *.sln ./
COPY *.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o out

# Stage 2: ASP.NET Core Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/out .
USER appuser
EXPOSE 8080
ENTRYPOINT ["dotnet", "App.dll"]
```

#### GitHub Actions
```yaml
name: .NET CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET SDK
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0'
      - name: Restore and Test
        run: |
          dotnet restore
          dotnet test --no-restore

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: $\{{ github.actor }}
          password: $\{{ secrets.GITHUB_TOKEN }}
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/$\{{ github.repository }}:latest
```
