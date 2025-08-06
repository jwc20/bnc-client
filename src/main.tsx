import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { client } from './apis/client.gen';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60000,
        },
    },
});

client.setConfig({
    baseUrl: 'http://127.0.0.1:8000/',
    // headers: {
    //     Authorization: 'Bearer <token_from_service_client>',
    // },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);
