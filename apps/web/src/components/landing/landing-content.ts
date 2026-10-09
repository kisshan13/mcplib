export interface LandingLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Capability {
  title: string;
  description: string;
}

export interface FooterGroup {
  title: string;
  links: LandingLink[];
}

export const projectLinks = {
  github: "https://github.com/kisshan13/mcplib",
  documentation: "https://github.com/kisshan13/mcplib#readme",
  issues: "https://github.com/kisshan13/mcplib/issues"
} as const;

export const navigationLinks: LandingLink[] = [
  { label: "Registry", href: "#discover" },
  { label: "SDKs", href: "#developers" },
  { label: "Documentation", href: projectLinks.documentation, external: true },
  { label: "GitHub", href: projectLinks.github, external: true }
];

export const userCapabilities = [
  "Discover MCP servers from a central registry.",
  "Authenticate with supported services through OAuth.",
  "Use organization-configured authentication when available.",
  "Connect existing service credentials where supported."
] as const;

export const developerCapabilities: Capability[] = [
  {
    title: "MCP Registry",
    description: "Discover registered MCP implementations and their metadata."
  },
  {
    title: "Authentication Layer",
    description: "Support platform OAuth, organization OAuth, and existing service credentials."
  },
  {
    title: "Controlled Secret Access",
    description:
      "Let MCP implementations request authorized credentials through a shared provider instead of accessing secret storage directly."
  },
  {
    title: "JavaScript and Python SDKs",
    description: "Bring MCP discovery and access into your own applications."
  },
  {
    title: "Composable Architecture",
    description: "Build MCP implementations without coupling them to a credential backend."
  }
];

export const authenticationMethods: Capability[] = [
  {
    title: "Platform-managed OAuth",
    description:
      "Authorize supported services through the platform's configured OAuth integrations."
  },
  {
    title: "Bring your own OAuth",
    description: "Use your organization's own OAuth application credentials."
  },
  {
    title: "Existing service credentials",
    description:
      "Reuse supported API keys or tokens with access controlled by configured permissions."
  }
];

export const processSteps: Capability[] = [
  {
    title: "Discover",
    description: "Find the MCP integration you need through the registry."
  },
  {
    title: "Connect",
    description: "Authorize the service or configure an available credential method."
  },
  {
    title: "Use",
    description: "Use the connected MCP or integrate it into your own agentic application."
  },
  {
    title: "Build",
    description: "Extend the infrastructure with SDKs and shared abstractions."
  }
];

export const footerGroups: FooterGroup[] = [
  {
    title: "Explore",
    links: [
      { label: "MCP Registry", href: "#discover" },
      { label: "Integrations", href: "#discover" },
      { label: "Documentation", href: projectLinks.documentation, external: true }
    ]
  },
  {
    title: "Develop",
    links: [
      { label: "JavaScript SDK", href: "#developers" },
      { label: "Python SDK", href: "#developers" },
      { label: "API Reference", href: projectLinks.documentation, external: true },
      { label: "Architecture", href: projectLinks.documentation, external: true }
    ]
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: projectLinks.github, external: true },
      { label: "Issues", href: projectLinks.issues, external: true },
      { label: "Contributions", href: projectLinks.github, external: true }
    ]
  }
];
