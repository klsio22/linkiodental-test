import { createApp } from './app';
import { connectDB } from './config/database';
import { config } from './config/env';

const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();

    // Criar aplicação Express
    const app = createApp();

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`🚀 Servidor rodando na porta ${config.port}`);
      console.log(`🌍 Ambiente: ${config.nodeEnv}`);
      console.log(`📝 Documentação: http://localhost:${config.port}/`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();
