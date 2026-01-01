import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
const schema = a.schema({
  Project: a.model({
    name: a.string(),
    team: a.string(), // e.g., "BAR GEN AI", "IPI"
    status: a.string(), // "In Progress", "Completed", "Not Started"
    costSaving: a.float(), // e.g., 360000.00
    ahtImpact: a.string(), // e.g., "0s"
    qualityImpact: a.string(),
    priority: a.string(), // "High", "Medium"
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
