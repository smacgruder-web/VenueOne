type PageRoute = {
  href: string;
  label: string;
};

type Service = {
  name: string;
  description: string;
  url: string;
};

type Tool = {
  name: string;
  description: string;
};

type Permission = {
  name: string;
  description: string;
};

type Profile = {
  name: string;
  description: string;
  prompts?: string[];
};

type Model = {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  temperature: number;
  costPerInputToken: number;
  costPerOutputToken: number;
};

type DatabaseConnection = {
  id: string;
  name: string;
  type: "sqlite" | "mysql" | "postgres" | "mongodb";
  url: string;
};

type CacheConfig = {
  enabled: boolean;
 ttl: number;
};