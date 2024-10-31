const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['drive.usercontent.google.com', 'ibb.co'], // 添加 ibb.co
  },
  // 这里可以添加其他 Next.js 配置
};

module.exports = withPWA(nextConfig);
