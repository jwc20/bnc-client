export default {
  input: 'http://localhost:8000/api/openapi.json',
  output: './src/apis',
  client: '@hey-api/client-axios',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-fetch',
    {
      name: '@tanstack/react-query',
    }
  ]
}