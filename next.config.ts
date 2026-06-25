import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  /* Bloqueia iframe embedding — previne Clickjacking */
  { key: "X-Frame-Options",        value: "DENY" },
  /* Impede MIME-type sniffing — previne XSS via arquivos com tipo errado */
  { key: "X-Content-Type-Options", value: "nosniff" },
  /* Controla referrer enviado em navegações cross-origin */
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  /* Desativa APIs de hardware que não são utilizadas */
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        /* Aplica em todas as rotas da aplicação */
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:  "firebasestorage.googleapis.com",
        pathname:  "/v0/b/**",
      },
      {
        protocol: "https",
        hostname:  "*.supabase.co",
        pathname:  "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
