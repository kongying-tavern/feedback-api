import app from './index';

import { ENV } from './config/index'

app.listen(ENV.PORT, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${ENV.PORT}`);
  /* eslint-enable no-console */
});
