import { staticServer } from './lib/static-server';
const port = Number(process.env.PORT || 4322);
staticServer(process.env.BUILD_OUT_DIR || 'dist').listen(port, '127.0.0.1', () => console.log(`Static build, including deployment headers: http://127.0.0.1:${port}`));
