const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ibb.co', 'i.ibb.co'],
  },
  // 這裡可以添加其他 Next.js 配置
};

module.exports = withPWA(nextConfig);