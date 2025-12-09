/**
 * Configuration Cognito
 * Les valeurs sont chargées depuis les variables d'environnement
 */

const config = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'eu-west-3',
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  apiUrl2: process.env.NEXT_PUBLIC_API_URL_2,
};

// Validation de la configuration
const validateConfig = () => {
  const required = ['userPoolId', 'clientId', 'domain', 'apiUrl'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Configuration Cognito incomplète. Variables manquantes: ${missing.join(', ')}`);
  }
  
  return missing.length === 0;
};

// URLs Cognito
const getCognitoUrls = () => {
  if (!config.domain || !config.region) return null;
  
  const baseUrl = `https://${config.domain}.auth.${config.region}.amazoncognito.com`;
  
  return {
    authorization: `${baseUrl}/oauth2/authorize`,
    token: `${baseUrl}/oauth2/token`,
    userInfo: `${baseUrl}/oauth2/userInfo`,
    logout: `${baseUrl}/logout`,
  };
};

export { config, validateConfig, getCognitoUrls };
export default config;


