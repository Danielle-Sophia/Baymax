import React, { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { User, Target, Activity, TrendingDown, TrendingUp, Minus, MessageCircle, FileText, ChefHat, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardProps {
  accessToken: string;
  onNavigateToMeals?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToPlans?: () => void;
  onNavigateToRecipes?: () => void;
  onNavigateToWeeklyPlan?: () => void;
}

export default function Dashboard({ accessToken, onNavigateToMeals, onNavigateToContact, onNavigateToPlans, onNavigateToRecipes, onNavigateToWeeklyPlan }: DashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const actions = [
    {
      title: 'Generar Menú',
      description: 'Crea tu plan de alimentación personalizado basado en tu perfil y objetivos',
      icon: Activity,
      gradient: 'from-rose-200 to-rose-300',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-500',
      buttonColor: 'bg-rose-400 hover:bg-rose-500 text-white',
      onClick: onNavigateToMeals
    },
    {
      title: 'Contactar Especialista',
      description: 'Solicita rutinas de ejercicio o dietas completamente personalizadas',
      icon: MessageCircle,
      gradient: 'from-sky-200 to-sky-300',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-500',
      buttonColor: 'bg-sky-400 hover:bg-sky-500 text-white',
      onClick: onNavigateToContact
    },
    {
      title: 'Mis Planes',
      description: 'Consulta todas tus solicitudes, planes personalizados y mensajes',
      icon: FileText,
      gradient: 'from-purple-200 to-purple-300',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500',
      buttonColor: 'bg-purple-400 hover:bg-purple-500 text-white',
      onClick: onNavigateToPlans
    },
    {
      title: 'Recetas con IA',
      description: 'Genera recetas personalizadas con inteligencia artificial',
      icon: ChefHat,
      gradient: 'from-amber-200 to-amber-300',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
      buttonColor: 'bg-amber-400 hover:bg-amber-500 text-white',
      onClick: onNavigateToRecipes
    },
    {
      title: 'Plan Semanal',
      description: 'Genera 21 recetas para toda la semana con lista de compras',
      icon: Calendar,
      gradient: 'from-emerald-200 to-emerald-300',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      buttonColor: 'bg-emerald-400 hover:bg-emerald-500 text-white',
      onClick: onNavigateToWeeklyPlan
    }
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  // Handle infinite loop effect
  useEffect(() => {
    if (currentSlide === actions.length) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 500);
    } else if (currentSlide === -1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(actions.length - 1);
      }, 500);
    }
  }, [currentSlide, actions.length]);

  useEffect(() => {
    if (!isTransitioning) {
      setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
    }
  }, [isTransitioning]);

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      setProfile(data.profile);
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const getGoalIcon = () => {
    switch (profile?.goal) {
      case 'lose':
        return <TrendingDown className="w-6 h-6 text-blue-600" />;
      case 'gain':
        return <TrendingUp className="w-6 h-6 text-purple-600" />;
      default:
        return <Minus className="w-6 h-6 text-emerald-600" />;
    }
  };

  const getGoalText = () => {
    switch (profile?.goal) {
      case 'lose':
        return 'Perder peso';
      case 'gain':
        return 'Ganar peso';
      default:
        return 'Mantener peso';
    }
  };

  const getActivityLevelText = () => {
    const levels: Record<string, string> = {
      sedentary: 'Sedentario',
      light: 'Ligero',
      moderate: 'Moderado',
      active: 'Activo',
      veryActive: 'Muy Activo'
    };
    return levels[profile?.activityLevel] || profile?.activityLevel;
  };

  const nextSlide = () => {
    if (isTransitioning) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (isTransitioning) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const getButtonText = (title: string) => {
    if (title.includes('Generar Menú')) return 'Comenzar';
    if (title.includes('Contactar')) return 'Solicitar Plan';
    if (title.includes('Mis Planes')) return 'Ver Planes';
    if (title.includes('Recetas')) return 'Generar Receta';
    if (title.includes('Plan Semanal')) return 'Crear Plan';
    return 'Ver';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se encontró información del perfil</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Panel de Control</h1>
        <p className="text-gray-600">Resumen de tu perfil y progreso</p>
      </div>

      {/* Quick Actions Carousel - MOVED TO TOP */}
      <div className="mb-8">
        <h2 className="mb-6">Acciones Rápidas</h2>
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
              style={{ transform: `translateX(-${(currentSlide + 1) * (100 / 2)}%)` }}
            >
              {/* Clone last item at the beginning */}
              <div className="min-w-[50%] px-3">
                <div className={`bg-gradient-to-br ${actions[actions.length - 1].gradient} rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300`}>
                  <div className="flex flex-col items-center text-center h-full justify-between min-h-[400px]">
                    <div className={`w-20 h-20 ${actions[actions.length - 1].iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                      {React.createElement(actions[actions.length - 1].icon, { className: `w-10 h-10 ${actions[actions.length - 1].iconColor}` })}
                    </div>
                    <div className="mb-6">
                      <h3 className="mb-3 text-gray-800 text-2xl">{actions[actions.length - 1].title}</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {actions[actions.length - 1].description}
                      </p>
                    </div>
                    <button
                      onClick={() => actions[actions.length - 1].onClick?.()}
                      className={`w-full px-6 py-3 ${actions[actions.length - 1].buttonColor} rounded-lg transition`}
                    >
                      {getButtonText(actions[actions.length - 1].title)}
                    </button>
                  </div>
                </div>
              </div>

              {/* Original items */}
              {actions.map((action, index) => (
                <div key={`original-${index}`} className="min-w-[50%] px-3">
                  <div className={`bg-gradient-to-br ${action.gradient} rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300`}>
                    <div className="flex flex-col items-center text-center h-full justify-between min-h-[400px]">
                      <div className={`w-20 h-20 ${action.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                        {React.createElement(action.icon, { className: `w-10 h-10 ${action.iconColor}` })}
                      </div>
                      <div className="mb-6">
                        <h3 className="mb-3 text-gray-800 text-2xl">{action.title}</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                      <button
                        onClick={() => action.onClick?.()}
                        className={`w-full px-6 py-3 ${action.buttonColor} rounded-lg transition`}
                      >
                        {getButtonText(action.title)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clone first item at the end */}
              <div className="min-w-[50%] px-3">
                <div className={`bg-gradient-to-br ${actions[0].gradient} rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300`}>
                  <div className="flex flex-col items-center text-center h-full justify-between min-h-[400px]">
                    <div className={`w-20 h-20 ${actions[0].iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                      {React.createElement(actions[0].icon, { className: `w-10 h-10 ${actions[0].iconColor}` })}
                    </div>
                    <div className="mb-6">
                      <h3 className="mb-3 text-gray-800 text-2xl">{actions[0].title}</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {actions[0].description}
                      </p>
                    </div>
                    <button
                      onClick={() => actions[0].onClick?.()}
                      className={`w-full px-6 py-3 ${actions[0].buttonColor} rounded-lg transition`}
                    >
                      {getButtonText(actions[0].title)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition z-10"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {actions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true);
                  setCurrentSlide(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  (currentSlide === index || 
                   (currentSlide === -1 && index === actions.length - 1) ||
                   (currentSlide === actions.length && index === 0))
                    ? 'bg-gray-600 w-8' 
                    : 'bg-gray-300 w-2'
                }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Peso Actual</p>
            <p className="text-2xl">{profile.weight} kg</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Objetivo</p>
            <p className="text-2xl">{getGoalText()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">TMB</p>
            <p className="text-2xl">{profile.tmb} kcal</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              {getGoalIcon()}
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Calorías Diarias</p>
            <p className="text-2xl">{profile.dailyCalories} kcal</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="mb-6">Información Personal</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Edad</span>
              <span>{profile.age} años</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Sexo</span>
              <span>{profile.sex === 'male' ? 'Masculino' : 'Femenino'}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Altura</span>
              <span>{profile.height} cm</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Nivel de Actividad</span>
              <span>{getActivityLevelText()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="mb-6">Metas y Preferencias</h2>
          <div className="space-y-4">
            <div className="py-3 border-b">
              <span className="text-gray-600 block mb-2">Meta de Peso</span>
              <span className="flex items-center gap-2">
                {getGoalIcon()}
                {profile.goalTarget} kg
              </span>
            </div>
            
            {profile.allergies && profile.allergies.length > 0 && (
              <div className="py-3 border-b">
                <span className="text-gray-600 block mb-2">Alergias</span>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.unwantedFoods && profile.unwantedFoods.length > 0 && (
              <div className="py-3">
                <span className="text-gray-600 block mb-2">Alimentos no deseados</span>
                <div className="flex flex-wrap gap-2">
                  {profile.unwantedFoods.map((food: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}