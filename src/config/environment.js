export const environment = {
    production: false,
    module_id: 1265,
    authStrategy: {
        name: 'oauth2',
        clientId: 'vMyiiX3tcAH6Hu7nbBhdeU7Cl0rXrveNbbYH3NMS',
        baseEndpoint: 'https://oauth-dev.upeu.edu.pe', 
        redirectUri: `${window.location.origin}/auth/callback`,
        success: '/',
        responseType: 'token', 
        scope: 'read introspection', 
    }
};


