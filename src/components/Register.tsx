import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Lock, Mail, User } from 'lucide-react';

interface RegisterProps {
  onSuccess: (token: string, user: any) => void;
  onSwitchToLogin: () => void;
}

export default function Register({ onSuccess, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos vacíos
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    // Validar nombre
    if (name.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (name.trim().length > 50) {
      toast.error('El nombre no puede tener más de 50 caracteres');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, ingresa un correo electrónico válido');
      return;
    }

    // Validar dominio común de email
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com', 'msn.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain || (!commonDomains.includes(emailDomain) && !emailDomain.includes('.'))) {
      toast.warning('Verifica que tu correo electrónico sea correcto', {
        description: 'El dominio parece inusual. Asegúrate de que sea válido.'
      });
    }

    // Validar contraseñas coincidan
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password.length > 72) {
      toast.error('La contraseña no puede tener más de 72 caracteres');
      return;
    }

    // Validar complejidad de contraseña
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      toast.error('La contraseña debe contener al menos una letra mayúscula', {
        description: 'Una contraseña segura incluye mayúsculas, minúsculas, números y símbolos'
      });
      return;
    }

    if (!hasLowerCase) {
      toast.error('La contraseña debe contener al menos una letra minúscula', {
        description: 'Una contraseña segura incluye mayúsculas, minúsculas, números y símbolos'
      });
      return;
    }

    if (!hasNumber) {
      toast.error('La contraseña debe contener al menos un número', {
        description: 'Una contraseña segura incluye mayúsculas, minúsculas, números y símbolos'
      });
      return;
    }

    if (!hasSpecialChar) {
      toast.warning('Se recomienda incluir al menos un carácter especial (!@#$%^&*)', {
        description: 'Esto hace tu contraseña más segura'
      });
    }

    // Validar contraseñas comunes
    const commonPasswords = ['12345678', 'password', 'Password1', 'qwerty123', 'abc123456'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
      toast.error('Esta contraseña es demasiado común y no es segura', {
        description: 'Por favor, elige una contraseña más única'
      });
      return;
    }

    setLoading(true);

    try {
      // Call backend signup endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: name.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'EMAIL_EXISTS') {
          toast.error(data.error, {
            action: {
              label: 'Iniciar Sesión',
              onClick: () => onSwitchToLogin(),
            },
          });
        } else {
          toast.error(data.error || 'Error al registrar usuario');
        }
        setLoading(false);
        return;
      }

      // Auto login after successful registration
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) {
        console.error('Auto-login error:', loginError);
        toast.success('Usuario registrado. Por favor, inicia sesión');
        onSwitchToLogin();
        setLoading(false);
        return;
      }

      if (loginData.session?.access_token) {
        onSuccess(loginData.session.access_token, loginData.user);
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
      toast.error('Error al registrar usuario');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
            <span className="text-white text-2xl">🥗</span>
          </div>
          <h1 className="text-emerald-600 mb-2">Dr. Baymax</h1>
          <p className="text-gray-600">Crea tu cuenta y comienza tu viaje saludable</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="mb-6">Crear Cuenta</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-2 text-gray-700">
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Tu nombre"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 text-gray-700">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Mínimo 8 caracteres"
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Debe tener al menos 8 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Repite tu contraseña"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-center flex items-center justify-center"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-emerald-600 hover:text-emerald-700 transition"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}