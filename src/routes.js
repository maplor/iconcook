import Create from '@/pages/create';
import Predict from '@/pages/predict';

const routerConfig = [
  {
    path: '/predict',
    component: Predict,
  },
  {
    path: '/',
    component: Create,
  },
];
export default routerConfig;
