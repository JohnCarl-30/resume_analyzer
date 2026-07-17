import {
  Container,
  getRandom,
  type ContainerStartConfigOptions,
} from "@cloudflare/containers";

const INSTANCE_COUNT = 3;

const DEFAULT_APP_ORIGIN =
  "https://resumae.tech,https://www.resumae.tech,https://resume-analyzer-chi-gray.vercel.app";

function optionalEnv(
  workerEnv: Env,
  key: keyof Omit<Env, "API_CONTAINER">,
): string | undefined {
  const value = workerEnv[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function buildContainerEnvVars(workerEnv: Env): Record<string, string> {
  const vars: Record<string, string> = {
    PORT: optionalEnv(workerEnv, "PORT") ?? "8080",
    APP_ORIGIN: optionalEnv(workerEnv, "APP_ORIGIN") ?? DEFAULT_APP_ORIGIN,
    AI_EXTRACTION_MODEL: optionalEnv(workerEnv, "AI_EXTRACTION_MODEL") ?? "gpt-4o-mini",
  };

  for (const key of [
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "CLERK_SECRET_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_BASE_URL",
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ] as const) {
    const value = optionalEnv(workerEnv, key);
    if (value) {
      vars[key] = value;
    }
  }

  return vars;
}

function withContainerEnvVars(
  workerEnv: Env,
  options?: ContainerStartConfigOptions,
): ContainerStartConfigOptions {
  return {
    ...options,
    envVars: {
      ...buildContainerEnvVars(workerEnv),
      ...options?.envVars,
    },
  };
}

export class ApiContainer extends Container<Env> {
  defaultPort = 8080;
  sleepAfter = "10m";

  async start(
    options?: ContainerStartConfigOptions,
    waitOptions?: { signal?: AbortSignal },
  ): Promise<void> {
    return super.start(withContainerEnvVars(this.env, options), waitOptions);
  }

  async startAndWaitForPorts(
    ...args: Parameters<Container<Env>["startAndWaitForPorts"]>
  ): Promise<void> {
    const [portsOrArgs, cancellationOptions, startOptions] = args;

    if (
      typeof portsOrArgs === "object" &&
      portsOrArgs !== null &&
      !Array.isArray(portsOrArgs)
    ) {
      return super.startAndWaitForPorts({
        ...portsOrArgs,
        startOptions: withContainerEnvVars(this.env, portsOrArgs.startOptions),
      });
    }

    return super.startAndWaitForPorts(
      portsOrArgs,
      cancellationOptions,
      withContainerEnvVars(this.env, startOptions),
    );
  }
}

export interface Env {
  API_CONTAINER: DurableObjectNamespace<ApiContainer>;
  PORT?: string;
  APP_ORIGIN?: string;
  DATABASE_URL?: string;
  AI_EXTRACTION_MODEL?: string;
  OPENAI_API_KEY?: string;
  CLERK_SECRET_KEY?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_BASE_URL?: string;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = await getRandom(env.API_CONTAINER, INSTANCE_COUNT);
    return container.fetch(request);
  },
};
