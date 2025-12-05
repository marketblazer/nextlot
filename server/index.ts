import { createApp } from './app.ts';
import { PollerService } from './services/poller.service.ts';

const port = parseInt(process.env.PORT || '3000', 10);
const app = createApp();

app.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}`);
  PollerService.start();
});