import { createApp } from './app';
import { connectDB } from './config/database';
import { config } from './config/env';

const startServer = async () => {
  try {
    await connectDB();

    const app = createApp();

    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📝 Docs: http://localhost:${config.port}/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
