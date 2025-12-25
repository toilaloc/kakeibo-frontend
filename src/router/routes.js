import { Login, Unauthorized } from '../pages/auth';
import { Home } from '../pages/dashboard';
import { Categories, Transactions } from '../pages/finance';
import { NotFound, Forbidden, BadRequest, ServerError, UnprocessableEntity } from '../pages/errors';

export const routes = [
  {
    path: '/',
    element: <Home />,
    protected: true,
  },
  {
    path: '/login',
    element: <Login />,
    protected: false,
  },
  {
    path: '/categories',
    element: <Categories />,
    protected: true,
  },
  {
    path: '/transactions',
    element: <Transactions />,
    protected: true,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
    protected: false,
  },
  {
    path: '/forbidden',
    element: <Forbidden />,
    protected: false,
  },
  {
    path: '/bad-request',
    element: <BadRequest />,
    protected: false,
  },
  {
    path: '/server-error',
    element: <ServerError />,
    protected: false,
  },
  {
    path: '/unprocessable-entity',
    element: <UnprocessableEntity />,
    protected: false,
  },
  {
    path: '/not-found',
    element: <NotFound />,
    protected: false,
  },
  {
    path: '/verify',
    element: <div className="App"><header className="App-header"><p>Verifying your magic link...</p></header></div>,
    protected: false,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];