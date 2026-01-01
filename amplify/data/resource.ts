
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Project: a.model({
    name: a.string(),
    team: a.string(), // e.g., "Gopi ", "Vineetha", "Sunil", "Arman", "Naveen"
    totalProjects: a.integer(),
    notStarted: a.integer(),
    inProgress: a.integer(),
    completed: a.integer(),
    ahtImpact: a.string(), // e.g., "0%", "5%"
    costSaving: a.float(), // e.g., 0.00, 360000.00
    qualityImpact: a.string(), // e.g., "0.0%", "2.5%"
    progress: a.float(), // Progress percentage (0-100)
    status: a.string(), // "Not Started", "In Progress", "Completed"
    priority: a.string(), // "High", "Medium", "Low"
    description: a.string(),
  })
  .authorization(allow => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

