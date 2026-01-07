import React, { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { User, Target, AlertCircle, Save, X } from 'lucide-react';

interface ProfileProps {
  accessToken: string;
  onProfileSaved: () => void;
}

export default function Profile({ accessToken, onProfileSaved }: ProfileProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Personal data
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState('moderate');

  // Goals
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [goalTarget, setGoalTarget] = useState('');

  // Preferences
  const [allergiesInput, setAllergiesInput] = useState('');
  const [unwantedFoodsInput, setUnwantedFoodsInput] = useState('');

  // Calculated values
  const [tmb, setTmb] = useState<number | null>(null);
  const [dailyCalories, setDailyCalories] = useState<number | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Loading profile with accessToken:', accessToken.substring(0, 20) + '...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('Profile response status:', response.status);
      const data = await response.json();
      console.log('Profile data received:', data);

      if (!response.ok) {
        console.error('Profile load error:', data);
        toast.error(data.error || 'Error al cargar el perfil');
        setLoading(false);
        return;
      }

      if (data.profile) {
        const profile = data.profile;
        console.log('Setting profile data:', profile);
        setWeight(profile.weight || '');
        setHeight(profile.height || '');
        setAge(profile.age || '');
        setSex(profile.sex || 'male');
        setActivityLevel(profile.activityLevel || 'moderate');
        setGoal(profile.goal || 'maintain');
        setGoalTarget(profile.goalTarget || '');
        setAllergiesInput(profile.allergies?.join(', ') || '');
        setUnwantedFoodsInput(profile.unwantedFoods?.join(', ') || '');
        setTmb(profile.tmb || null);
        setDailyCalories(profile.dailyCalories || null);
      } else {
        console.log('No profile data found in response');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      toast.error('Error al cargar el perfil');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validar campos obligatorios
    if (!weight || !height || !age || !goalTarget) {
      toast.error('Por favor, completa todos los campos obligatorios marcados con *');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);
    const goalTargetNum = parseFloat(goalTarget);

    // Validar peso
    if (isNaN(weightNum)) {
      toast.error('Por favor, ingresa un peso válido');
      return;
    }

    if (weightNum < 20 || weightNum > 300) {
      toast.error('El peso debe estar entre 20 kg y 300 kg', {
        description: 'Por favor, verifica que el valor ingresado sea correcto'
      });
      return;
    }

    // Validar altura
    if (isNaN(heightNum)) {
      toast.error('Por favor, ingresa una altura válida');
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      toast.error('La altura debe estar entre 100 cm y 250 cm', {
        description: 'Por favor, verifica que el valor ingresado sea correcto'
      });
      return;
    }

    // Validar edad
    if (isNaN(ageNum)) {
      toast.error('Por favor, ingresa una edad válida');
      return;
    }

    if (ageNum < 15 || ageNum > 100) {
      toast.error('La edad debe estar entre 15 y 100 años', {
        description: 'Por favor, verifica que el valor ingresado sea correcto'
      });
      return;
    }

    // Validar meta de peso
    if (isNaN(goalTargetNum)) {
      toast.error('Por favor, ingresa una meta de peso válida');
      return;
    }

    if (goalTargetNum < 20 || goalTargetNum > 300) {
      toast.error('La meta de peso debe estar entre 20 kg y 300 kg', {
        description: 'Por favor, verifica que el valor ingresado sea correcto'
      });
      return;
    }

    // Validar que la meta sea realista según el objetivo
    const weightDifference = Math.abs(weightNum - goalTargetNum);
    
    if (goal === 'lose' && goalTargetNum >= weightNum) {
      toast.error('La meta de peso debe ser menor a tu peso actual si quieres perder peso', {
        description: 'Revisa tu objetivo o ajusta tu meta'
      });
      return;
    }

    if (goal === 'gain' && goalTargetNum <= weightNum) {
      toast.error('La meta de peso debe ser mayor a tu peso actual si quieres ganar peso', {
        description: 'Revisa tu objetivo o ajusta tu meta'
      });
      return;
    }

    if (goal === 'maintain' && weightDifference > 3) {
      toast.error('Para mantener peso, la meta debe estar cerca de tu peso actual (±3 kg)', {
        description: 'Si quieres cambiar significativamente de peso, selecciona "Perder peso" o "Ganar peso"'
      });
      return;
    }

    // Validar cambio de peso extremo (más de 30 kg)
    if (weightDifference > 30) {
      toast.warning('El cambio de peso que planeas es considerable', {
        description: 'Te recomendamos dividir tu meta en objetivos más pequeños y consultar con un especialista'
      });
    }

    // Calcular IMC y validar
    const heightInMeters = heightNum / 100;
    const bmi = weightNum / (heightInMeters * heightInMeters);
    const targetBmi = goalTargetNum / (heightInMeters * heightInMeters);

    if (bmi < 14) {
      toast.error('Tu peso actual parece estar significativamente por debajo del rango saludable', {
        description: 'Por favor, consulta con un profesional de la salud'
      });
      return;
    }

    if (bmi > 50) {
      toast.error('Tu peso actual parece estar significativamente por encima del rango saludable', {
        description: 'Por favor, consulta con un profesional de la salud antes de comenzar cualquier plan'
      });
      return;
    }

    if (targetBmi < 16 && goal === 'lose') {
      toast.error('La meta de peso que estableciste podría no ser saludable', {
        description: 'El IMC objetivo está por debajo del rango saludable. Consulta con un especialista'
      });
      return;
    }

    if (targetBmi > 40 && goal === 'gain') {
      toast.error('La meta de peso que estableciste podría no ser saludable', {
        description: 'El IMC objetivo está muy por encima del rango saludable. Consulta con un especialista'
      });
      return;
    }

    // Validar alergias y alimentos no deseados
    const allergies = allergiesInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const unwantedFoods = unwantedFoodsInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    // Validar que no haya demasiadas restricciones
    const totalRestrictions = allergies.length + unwantedFoods.length;
    
    if (totalRestrictions > 20) {
      toast.error('Tienes demasiadas restricciones alimentarias (más de 20)', {
        description: 'Esto podría limitar mucho tus opciones de menú. Considera reducir la lista.'
      });
      return;
    }

    if (totalRestrictions > 10) {
      toast.warning('Tienes muchas restricciones alimentarias', {
        description: 'Esto podría limitar tus opciones de menú. Asegúrate de que todas sean necesarias.'
      });
    }

    // Validar que las restricciones no sean muy largas
    const tooLongItems = [...allergies, ...unwantedFoods].filter(item => item.length > 30);
    if (tooLongItems.length > 0) {
      toast.warning('Algunos items son muy largos', {
        description: 'Intenta ser más conciso: "Frutos secos" en lugar de descripciones largas'
      });
    }

    setSaving(true);

    try {
      const profilePayload = {
        weight: weightNum,
        height: heightNum,
        age: ageNum,
        sex,
        activityLevel,
        goal,
        goalTarget: goalTargetNum,
        allergies,
        unwantedFoods,
      };

      console.log('Saving profile with payload:', profilePayload);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(profilePayload),
        }
      );

      console.log('Save profile response status:', response.status);
      const data = await response.json();
      console.log('Save profile response data:', data);

      if (!response.ok) {
        console.error(`Error saving profile - Status: ${response.status}, Data:`, data);
        if (data.code === 'UNREALISTIC_GOAL') {
          toast.error(data.error, {
            duration: 6000,
            description: 'Considera establecer metas más pequeñas y alcanzables'
          });
        } else if (data.code === 'GOAL_MISMATCH') {
          toast.error(data.error, {
            duration: 5000,
            description: 'Verifica que tu objetivo y tu meta de peso sean coherentes'
          });
        } else {
          toast.error(data.error || 'Error al guardar el perfil');
        }
        setSaving(false);
        return;
      }

      setTmb(data.profile.tmb);
      setDailyCalories(data.profile.dailyCalories);
      setHasChanges(false);
      toast.success('Perfil guardado exitosamente');
      onProfileSaved();
      setSaving(false);
    } catch (error) {
      console.error('Unexpected error while saving profile:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      toast.error(`Error al guardar el perfil. Por favor, revisa la consola para más detalles.`);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfile();
    setHasChanges(false);
    toast.info('Cambios descartados');
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Mi Perfil</h1>
        <p className="text-gray-600">
          Completa tu información para recibir recomendaciones personalizadas
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Data Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2>Datos Personales</h2>
              <p className="text-gray-600">Información necesaria para calcular tu TMB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700">
                Peso (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => { setWeight(e.target.value); handleChange(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="70"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Altura (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => { setHeight(e.target.value); handleChange(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="170"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Edad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => { setAge(e.target.value); handleChange(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Sexo <span className="text-red-500">*</span>
              </label>
              <select
                value={sex}
                onChange={(e) => { setSex(e.target.value as 'male' | 'female'); handleChange(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 text-gray-700">
                Nivel de Actividad Física <span className="text-red-500">*</span>
              </label>
              <select
                value={activityLevel}
                onChange={(e) => { setActivityLevel(e.target.value); handleChange(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="sedentary">Sedentario (poco o ningún ejercicio)</option>
                <option value="light">Ligero (ejercicio 1-3 días/semana)</option>
                <option value="moderate">Moderado (ejercicio 3-5 días/semana)</option>
                <option value="active">Activo (ejercicio 6-7 días/semana)</option>
                <option value="veryActive">Muy Activo (ejercicio intenso diario)</option>
              </select>
            </div>
          </div>

          {tmb && dailyCalories && (
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-emerald-700">TMB (Tasa Metabólica Basal)</p>
                  <p className="text-emerald-900">{tmb} kcal/día</p>
                </div>
                <div>
                  <p className="text-sm text-emerald-700">Gasto Calórico Diario</p>
                  <p className="text-emerald-900">{dailyCalories} kcal/día</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Goals Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2>Metas</h2>
              <p className="text-gray-600">Define tus objetivos de salud</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700">
                Objetivo <span className="text-red-500">*</span>
              </label>
              <select
                value={goal}
                onChange={(e) => { setGoal(e.target.value as 'lose' | 'maintain' | 'gain'); handleChange(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="lose">Perder peso</option>
                <option value="maintain">Mantener peso</option>
                <option value="gain">Ganar peso</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Meta (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={goalTarget}
                onChange={(e) => { setGoalTarget(e.target.value); handleChange(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="65"
              />
              <p className="mt-1 text-sm text-gray-500">
                Tu peso objetivo final
              </p>
              {weight && goalTarget && (
                <div className="mt-2">
                  {Math.abs(parseFloat(weight) - parseFloat(goalTarget)) > 4 && (
                    <p className="text-sm text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Cambio mayor a 4 kg (1 kg/semana por 4 semanas). Considera dividir tu meta.
                    </p>
                  )}
                  {Math.abs(parseFloat(weight) - parseFloat(goalTarget)) <= 4 && Math.abs(parseFloat(weight) - parseFloat(goalTarget)) > 0 && (
                    <p className="text-sm text-emerald-600">
                      ✓ Meta realista: {Math.abs(parseFloat(weight) - parseFloat(goalTarget)).toFixed(1)} kg de cambio
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2>Preferencias Alimenticias</h2>
              <p className="text-gray-600">Personaliza tus recomendaciones</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-gray-700">
                Alergias
              </label>
              <input
                type="text"
                value={allergiesInput}
                onChange={(e) => { setAllergiesInput(e.target.value); handleChange(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="Ej: Nueces, Mariscos, Lactosa (separados por coma)"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Alimentos no deseados
              </label>
              <input
                type="text"
                value={unwantedFoodsInput}
                onChange={(e) => { setUnwantedFoodsInput(e.target.value); handleChange(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="Ej: Hígado, Brócoli (separados por coma)"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          {hasChanges && (
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Perfil'}
          </button>
        </div>
      </div>
    </div>
  );
}