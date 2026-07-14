import { initGame } from './core/init';
import './styles/main.css';

initGame().catch((error) => {
  console.error('[Game] Fatal init error', error);
});
