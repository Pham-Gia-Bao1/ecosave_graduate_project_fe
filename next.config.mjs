/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
  trailingSlash: true, // Có thể giúp tránh lỗi khi export
  webpack(config) {
    // Thêm rule để xử lý file .mp3
    config.module.rules.push({
      test: /\.(mp3)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });
    return config; // Trả về config đã được chỉnh sửa
  },
};

export default nextConfig;