import { Layout } from './components/Layout';
import { AppProvider } from './context/AppContext';
import { HomePage } from './pages/HomePage';

const App = () => (
  <AppProvider>
    <Layout>
      <HomePage />
    </Layout>
  </AppProvider>
);

export default App;

