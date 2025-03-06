export interface ApiKey {
  key: string;
  client: string;
}

const apiKeys: ApiKey[] = [
  { key: process.env.API_KEY_1!, client: 'KamiounApp' },
  { key: process.env.API_KEY_2!, client: 'OmsPlatform' },
];

export default apiKeys;
