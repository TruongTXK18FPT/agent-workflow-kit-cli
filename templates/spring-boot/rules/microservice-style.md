# Java Spring Boot Microservice Design Rules

Enforce strict coding standards and architecture conventions for microservices in this repository.

## 1. Naming & Port Allocations
- Current Service Name: `{{springApplicationName}}`.
- Current Local Port: `{{serverPort}}`.
- The service name configured in `spring.application.name` must exactly match the module directory name in kebab-case.
- Local server ports must be allocated and registered in advance to prevent port clashes.

## 2. Inter-service Communication (Feign Client)
- Do not use hardcoded IPs or URLs. Communication must go through Service Discovery (Eureka/Consul).
- `@FeignClient` interfaces must be placed inside the `{{basePackage}}.client` or `{{basePackage}}.feign` packages.
- Implement a custom `ErrorDecoder` to extract and propagate downstream HTTP status codes (400, 401, 403, 404) instead of throwing generic 500 FeignExceptions.

## 3. Fault Tolerance & Resilience
- All outgoing API calls or calls to other microservices via Feign Client must be wrapped in Resilience4j `@CircuitBreaker` or `@TimeLimiter` annotations.
- Provide a concrete `fallbackMethod` for graceful fallback handling when downstream services fail.

## 4. Distributed Tracing & Logging
- All logged actions relating to user requests must include `X-Correlation-Id` or `TraceId` (e.g. using Spring Cloud Sleuth / Micrometer Tracing).
- Configure a Feign `RequestInterceptor` to forward the `X-Correlation-Id` header to downstream calls.
