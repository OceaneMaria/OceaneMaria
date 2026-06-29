import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ShoppingListPage from './pages/ShoppingListPage';
import RecipesPage from './pages/RecipesPage';
import PreferencesPage from './pages/PreferencesPage';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="max-w-lg mx-auto min-h-screen relative">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/courses" element={<ShoppingListPage />} />
            <Route path="/recettes" element={<RecipesPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
          </Routes>
          <BottomNav />
        </div>
      </HashRouter>
    </AppProvider>
  );
}
