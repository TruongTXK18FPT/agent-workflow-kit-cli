# Async Database Rules (FastAPI & SQLAlchemy)

Guidelines for database access, connection pooling, and async operations:

## Async Sessions and Depends
- **Async Database Connection:** Always use `AsyncSession` from `sqlalchemy.ext.asyncio`.
- **Session Lifecycle:** Inject the database session using `Depends(get_db)`. Ensure the dependency closes the session cleanly using a context manager or yield:
  ```python
  async def get_db() -> AsyncIterator[AsyncSession]:
      async with AsyncSessionLocal() as session:
          yield session
  ```

## Querying and Transactions
- **Async Queries:** Never use synchronous execution APIs. Always execute queries asynchronously using `session.execute(select(...))` or similar.
- **Explicit Transactions:** Use `async with session.begin():` blocks for operations modifying multiple entities to ensure atomic commits and rollbacks.
- **Relationship Loading:** Avoid implicit lazy loading since it raises errors in async contexts. Explicitly specify loading strategies like `selectinload` or `joinedload`:
  ```python
  stmt = select(User).options(selectinload(User.items))
  ```

## Migrations (Alembic)
- Every schema change must have a corresponding Alembic migration.
- Auto-generate migrations using:
  `alembic revision --autogenerate -m "description"`
- Always inspect the generated migration script for accuracy before applying.
