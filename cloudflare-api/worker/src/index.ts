import { Container, getRandom } from "@cloudflare/containers";

const INSTANCE_COUNT = 3;

export class ApiContainer extends Container {
  defaultPort = 8080;
  sleepAfter = "10m";
}

export interface Env {
  API_CONTAINER: DurableObjectNamespace<ApiContainer>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = await getRandom(env.API_CONTAINER, INSTANCE_COUNT);
    return container.fetch(request);
  },
};
