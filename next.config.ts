import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shoppinlocal.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.shoppinlocal.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
};

export default withPayload(nextConfig);
