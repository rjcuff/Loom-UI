import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The docs pages read component sources off disk at build time, so those
  // directories must be traced into the serverless output.
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*", "./content/**/*"],
  },
  experimental: {
    inlineCss: true,
  },
  async redirects() {
    return [
      // There is no docs landing page — /docs and /components both go
      // straight to the component reference.
      {
        source: "/docs",
        destination: "/docs/components/weave-text",
        permanent: false,
      },
      {
        source: "/components",
        destination: "/docs/components/weave-text",
        permanent: false,
      },
      // Allow `shadcn add @loomui/weave-text` to resolve /r/weave-text
      // without the .json extension.
      {
        source: "/r/:path([^.]*)",
        destination: "/r/:path.json",
        permanent: true,
      },
    ]
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
