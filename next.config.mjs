/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera una versión mínima del servidor en .next/standalone,
  // así la imagen de Docker queda liviana (sin todos los node_modules)
  output: "standalone",
};

export default nextConfig;
