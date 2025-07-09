/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['shopping-phinf.pstatic.net'],
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
};

module.exports = nextConfig;
