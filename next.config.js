/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['shopping-phinf.pstatic.net', 'res.cloudinary.com'],
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
};

module.exports = nextConfig;
