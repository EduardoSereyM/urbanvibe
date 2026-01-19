const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Configurar resolver para excluir archivos nativos en web
config.resolver = {
    ...config.resolver,
    resolveRequest: (context, moduleName, platform) => {
        // En web, bloquear imports de archivos .native.tsx
        if (platform === 'web' && moduleName.includes('.native')) {
            return {
                type: 'empty',
            };
        }

        // Usar resolución por defecto para otros casos
        return context.resolveRequest(context, moduleName, platform);
    },
};

module.exports = withNativeWind(config, { input: "./global.css" });
