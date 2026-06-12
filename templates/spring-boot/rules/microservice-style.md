# Spring Boot Microservice Design Rules

- Service Name: `{{springApplicationName}}`
- Local Port: `{{serverPort}}`

## 1. Naming & Ports
- `spring.application.name` must match the module directory name in kebab-case.
- Local server ports must be allocated in advance to prevent clashes.

## 2. Inter-service Communication (Feign Client)
- Do not use hardcoded URLs/IPs. Use Service Discovery (Eureka/Consul).
- Place `@FeignClient` interfaces in `{{basePackage}}.client` or `{{basePackage}}.feign`.
- Implement a custom `ErrorDecoder` to propagate downstream HTTP status codes instead of throwing generic 500 FeignExceptions.

## 3. Resilience
- Wrap outgoing Feign calls in Resilience4j `@CircuitBreaker` or `@TimeLimiter`.
- Implement a `fallbackMethod` for graceful fallback handling when services fail.

## 4. Distributed Tracing
- Log actions with `X-Correlation-Id` or `TraceId` (Micrometer Tracing).
- Configure a Feign `RequestInterceptor` to forward the `X-Correlation-Id` header to downstream calls.

