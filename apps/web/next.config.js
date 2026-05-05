/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@life-os/shared'],
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  // Улучшенная конфигурация для стабильности HMR
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Отключаем кеширование в dev режиме для предотвращения проблем с устаревшими модулями
      config.cache = false;
    }
    return config;
  },
  // Увеличиваем таймаут для предотвращения преждевременного обрыва соединений
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig
