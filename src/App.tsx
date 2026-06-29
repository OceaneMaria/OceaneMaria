import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ShoppingListPage from './pages/ShoppingListPage';
import RecipesPage from './pages/RecipesPage';
import PreferencesPage from './pages/PreferencesPage';
import AddRecipePage from './pages/AddRecipePage';
import ImportPage from './pages/ImportPage';
import OnboardingPage from './pages/OnboardingPage';

function AppContent() {
  const { onboardingDone } = useApp();

  if (!onboardingDone) {
    return <OnboardingPage />;
  }

  return (
    <HashRouter>
      <div className="max-w-lg mx-auto min-h-screen relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/courses" element={<ShoppingListPage />} />
          <Route path="/recettes" element={<RecipesPage />} />
          <Route path="/recettes/ajouter" element={<AddRecipePage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
