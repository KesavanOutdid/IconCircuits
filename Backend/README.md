# IconCircuits Backend API

[![Backend CI/CD](https://github.com/your-username/IconCircuits/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/your-username/IconCircuits/actions/workflows/backend-ci.yml)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests for CI (with coverage)
npm run test:ci
```

## API Documentation

Swagger UI: `http://localhost:9000/api-docs`

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ci` - Run tests for CI/CD

## Environment Variables

See `.env.example` for required environment variables.

## Default Admin User

- Email: `admin@gmail.com`
- Password: `1234`
- Role: Superadmin

**Change the password after first login!**
