# API Testing Rules (FastAPI & Pytest)

Testing guidelines for endpoints, services, and mocks:

## Test Setup and Client
- Use `pytest` for running test suites.
- Use `httpx.AsyncClient` or `FastAPI.testclient.TestClient` for HTTP testing. If endpoints are asynchronous (`async def`), prefer `httpx.AsyncClient` with `pytest-asyncio` markers:
  ```python
  @pytest.mark.asyncio
  async def test_read_items(client: AsyncClient):
      response = await client.get("/items/")
      assert response.status_code == 200
  ```

## Fixtures and DB Mocking
- **Database isolation:** Create a clean database session for each test run. Do not use the production database; use an in-memory SQLite (`sqlite+aiosqlite:///:memory:`) or a dedicated PostgreSQL test container/database.
- **Fixture overrides:** Override the `get_db` dependency in the app:
  ```python
  app.dependency_overrides[get_db] = override_get_db
  ```

## Mocking External Dependencies
- Use `pytest-mock` (via the `mocker` fixture) to intercept external HTTP calls (such as third-party APIs or email dispatch services).
- Never make actual outbound network calls during tests.
