/** @type {import('next').NextConfig} */

import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public'
})

const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'drive.usercontent.google.com'
      },
      {
        hostname: 'ibb.co'
      }
    ]
  }
} 

export default withPWA(nextConfig)
