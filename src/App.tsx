import React, { useState, useEffect } from 'react';
import { projectId } from './utils/supabase/info';
import { supabase } from './utils/supabase/client';
import { Toaster, toast } from 'sonner@2.0.3';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

// User components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import MealPlanner from './components/MealPlanner';
import { ContactSpecialist } from './components/ContactSpecialist';
import { MyPlans } from './components/MyPlans';
import ChatBot from './components/ChatBot';
import ChatWidget from './components/ChatWidget';
import RecipeGenerator from './components/RecipeGenerator';
import RecipeEngineInfo from './components/RecipeEngineInfo';
import WeeklyRecipePlan from './components/WeeklyRecipePlan';

// Specialist components
import SpecialistLogin from './components/SpecialistLogin';
import SpecialistRegister from './components/SpecialistRegister';
import SpecialistDashboard from './components/SpecialistDashboard';

import { User, Stethoscope } from 'lucide-react';

type UserType = 'user' | 'specialist' | null;

export default function App() {
  // App mode selection
  const [appMode, setAppMode] = useState<UserType>(null);
  
  // User state
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard' | 'profile' | 'meals' | 'contact' | 'plans' | 'chat' | 'recipes' | 'recipe-info' | 'weekly-plan'>('login');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.access_token && session?.user) {
        setAccessToken(session.access_token);
        setUser(session.user);
        
        // Determine user type
        const userType = session.user.user_metadata?.userType;
        
        if (userType === 'specialist') {
          setAppMode('specialist');
          setCurrentView('dashboard');
        } else {
          setAppMode('user');
          
          // Check if user has profile
          const profileExists = await checkProfile(session.access_token);
          
          if (profileExists) {
            setCurrentView('dashboard');
            setHasProfile(true);
          } else {
            setCurrentView('profile');
            setHasProfile(false);
            toast.info('Por favor, completa tu perfil para continuar');
          }
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const checkProfile = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      return data.profile !== null && data.profile !== undefined;
    } catch (error) {
      console.error('Error checking profile:', error);
      return false;
    }
  };

  const handleLoginSuccess = async (token: string, userData: any) => {
    setAccessToken(token);
    setUser(userData);
    
    const userType = userData.user_metadata?.userType;
    
    if (userType === 'specialist') {
      setAppMode('specialist');
      setCurrentView('dashboard');
      toast.success('Bienvenido, especialista');
    } else {
      setAppMode('user');
      
      // Check if user has profile
      const profileExists = await checkProfile(token);
      
      if (profileExists) {
        setCurrentView('dashboard');
        setHasProfile(true);
        toast.success('Bienvenido de nuevo');
      } else {
        setCurrentView('profile');
        setHasProfile(false);
        toast.info('Por favor, completa tu perfil para continuar');
      }
    }
  };

  const handleRegisterSuccess = async (token: string, userData: any) => {
    setAccessToken(token);
    setUser(userData);
    
    const userType = userData.user_metadata?.userType;
    
    if (userType === 'specialist') {
      setAppMode('specialist');
      setCurrentView('dashboard');
      toast.success('Cuenta de especialista creada exitosamente');
    } else {
      setAppMode('user');
      setCurrentView('profile');
      setHasProfile(false);
      toast.success('Cuenta creada exitosamente. Ahora configura tu perfil');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setUser(null);
    setCurrentView('login');
    setHasProfile(false);
    setAppMode(null);
    toast.success('Sesión cerrada');
  };

  const handleProfileSaved = () => {
    setHasProfile(true);
    setCurrentView('dashboard');
    toast.success('Perfil guardado exitosamente');
  };

  // Mode selection screen
  if (!accessToken && !appMode) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-emerald-600 mb-2">Dr. Baymax</h1>
              <p className="text-gray-600">Gestión Nutricional Personalizada</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer hover:border-rose-300 transition-all hover:shadow-lg"
                onClick={() => setAppMode('user')}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-rose-400" />
                  </div>
                  <CardTitle className="text-2xl">Soy Usuario</CardTitle>
                  <CardDescription>
                    Busco mejorar mi salud y nutrición
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✓ Planes de alimentación personalizados</li>
                    <li>✓ Seguimiento de metas</li>
                    <li>✓ Contacto con especialistas</li>
                    <li>✓ Consejos nutricionales</li>
                  </ul>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-sky-300 transition-all hover:shadow-lg"
                onClick={() => setAppMode('specialist')}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-10 w-10 text-sky-400" />
                  </div>
                  <CardTitle className="text-2xl">Soy Especialista</CardTitle>
                  <CardDescription>
                    Nutriólogo o entrenador profesional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✓ Gestionar solicitudes de usuarios</li>
                    <li>✓ Crear planes personalizados</li>
                    <li>✓ Chat directo con pacientes</li>
                    <li>✓ Sistema de asignación inteligente</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Selecciona tu tipo de cuenta para continuar
              </p>
            </div>
          </div>
        </div>
        <Toaster position="top-center" />
      </>
    );
  }

  // SPECIALIST APP
  if (appMode === 'specialist') {
    if (!accessToken) {
      if (currentView === 'register') {
        return (
          <>
            <SpecialistRegister 
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setCurrentView('login')}
            />
            <Toaster position="top-center" />
          </>
        );
      }
      
      return (
        <>
          <SpecialistLogin 
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView('register')}
          />
          <div className="fixed top-4 left-4">
            <Button
              variant="ghost"
              onClick={() => setAppMode(null)}
              className="text-sm"
            >
              ← Cambiar tipo de cuenta
            </Button>
          </div>
          <Toaster position="top-center" />
        </>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-emerald-600" />
                <h1 className="text-emerald-600">Dr. Baymax - Especialistas</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user?.user_metadata?.name || user?.email}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content with top padding to account for fixed nav */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <SpecialistDashboard accessToken={accessToken} />
        </main>

        <Toaster position="top-center" />
      </div>
    );
  }

  // USER APP
  if (!accessToken) {
    if (currentView === 'register') {
      return (
        <>
          <Register 
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentView('login')}
          />
          <div className="fixed top-4 left-4">
            <Button
              variant="ghost"
              onClick={() => setAppMode(null)}
              className="text-sm"
            >
              ← Cambiar tipo de cuenta
            </Button>
          </div>
          <Toaster position="top-center" />
        </>
      );
    }
    
    return (
      <>
        <Login 
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setCurrentView('register')}
        />
        <div className="fixed top-4 left-4">
          <Button
            variant="ghost"
            onClick={() => setAppMode(null)}
            className="text-sm"
          >
            ← Cambiar tipo de cuenta
          </Button>
        </div>
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-emerald-600">Dr. Baymax</h1>
            </div>
            <div className="flex items-center gap-4">
              {hasProfile && (
                <>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentView === 'dashboard' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Inicio
                  </button>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentView === 'profile' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Mi Perfil
                  </button>
                  <button
                    onClick={() => setCurrentView('meals')}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentView === 'meals' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Generar Menú
                  </button>
                  <button
                    onClick={() => setCurrentView('contact')}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentView === 'contact' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Especialista
                  </button>
                  <button
                    onClick={() => setCurrentView('plans')}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentView === 'plans' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Mis Planes
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with top padding to account for fixed nav */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {currentView === 'dashboard' && (
          <Dashboard 
            accessToken={accessToken} 
            onNavigateToMeals={() => setCurrentView('meals')}
            onNavigateToContact={() => setCurrentView('contact')}
            onNavigateToPlans={() => setCurrentView('plans')}
            onNavigateToRecipes={() => setCurrentView('recipes')}
            onNavigateToWeeklyPlan={() => setCurrentView('weekly-plan')}
          />
        )}
        {currentView === 'profile' && (
          <Profile 
            accessToken={accessToken} 
            onProfileSaved={handleProfileSaved}
          />
        )}
        {currentView === 'meals' && <MealPlanner accessToken={accessToken} />}
        {currentView === 'contact' && (
          <ContactSpecialist onBack={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'plans' && (
          <MyPlans onBack={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'recipes' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition"
              >
                ← Volver al Dashboard
              </button>
              <button
                onClick={() => setCurrentView('recipe-info')}
                className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
              >
                ℹ️ Cómo funciona el motor IA
              </button>
            </div>
            <RecipeGenerator accessToken={accessToken} />
          </div>
        )}
        {currentView === 'recipe-info' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setCurrentView('recipes')}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition"
              >
                ← Volver al Generador
              </button>
            </div>
            <RecipeEngineInfo />
          </div>
        )}
        {currentView === 'weekly-plan' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition"
              >
                ← Volver al Dashboard
              </button>
            </div>
            <WeeklyRecipePlan accessToken={accessToken} />
          </div>
        )}
      </main>

      {/* Floating Chat Widget */}
      {hasProfile && <ChatWidget accessToken={accessToken} />}

      <Toaster position="top-center" />
    </div>
  );
}