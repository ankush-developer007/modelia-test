| Feature/Test | Implemented | File/Path |
|---------------|--------------|-----------|
| JWT Auth (signup/login) | ✅ | /backend/src/routes/auth.ts, /backend/src/controllers/auth.controller.ts |
| Image upload preview | ✅ | /frontend/src/components/studio/ImageUpload.tsx |
| Abort in-flight request | ✅ | /frontend/src/hooks/useGenerate.ts |
| Exponential retry logic | ✅ | /frontend/src/hooks/useGenerate.ts |
| 20% simulated overload | ✅ | /backend/src/services/generation.service.ts |
| GET last 5 generations | ✅ | /backend/src/controllers/generations.controller.ts |
| Unit tests backend | ✅ | /backend/tests/auth.test.ts, /backend/tests/generations.test.ts |
| Unit tests frontend | ✅ | /frontend/tests/ImageUpload.test.tsx, /frontend/tests/Generate.test.tsx, /frontend/tests/Auth.test.tsx |
| E2E flow | ✅ | /tests/e2e/studio.spec.ts, /tests/e2e/auth.spec.ts |
| ESLint + Prettier configured | ✅ | .eslintrc.js, .prettierrc (both backend and frontend) |
| CI + Coverage report | ✅ | .github/workflows/ci.yml |

