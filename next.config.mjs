/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // The @stellar/stellar-sdk is only used in server-side API routes.
      // If webpack somehow still tries to bundle it on the client, we alias
      // the native addon to false so it doesn't crash the browser bundle.
      config.resolve.alias = {
        ...config.resolve.alias,
        "sodium-native": false,
        "require-addon": false,
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        buffer: false,
      };
    }

    return config;
  },
};

export default nextConfig;
