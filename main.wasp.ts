import { app } from "@wasp.sh/spec";

import { App } from "./src/App" with { type: "ref" };
import { authConfig, authSpec } from "./src/auth/auth.wasp";
import { tagsSpec } from "./src/tags/tags.wasp";
import { tasksSpec } from "./src/tasks/tasks.wasp";

export default app({
  name: "shipYourFirstAppStarter",
  title: "ship-your-first-app-starter",
  wasp: { version: "^0.24.0" },
  head: ["<link rel='icon' href='/favicon.ico' />"],
  auth: authConfig,
  emailSender: {
    provider: "Dummy",
  },
  client: {
    rootComponent: App,
  },
  spec: [authSpec, tasksSpec, tagsSpec],
});
