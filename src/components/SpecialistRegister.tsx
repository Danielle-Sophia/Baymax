import { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, UserPlus, Stethoscope } from 'lucide-react';

interface SpecialistRegisterProps {
  onSuccess: (token: string, user: any) => void;
  onSwitchToLogin: () => void;
}

export default function SpecialistRegister({ onSuccess, onSwitchToLogin }: SpecialistRegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [specialty, setSpecialty] = useState<'nutrición' | 'entrenamiento' | ''>('');
  const [professionalLicense, setProfessionalLicense] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword || !specialty || !professionalLicense) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (professionalLicense.length < 6) {
      setError('La cédula profesional debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Register specialist through backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist-signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name,
            email,
            password,
            specialty,
            professionalLicense,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Error al registrar especialista';
        console.error('Backend error:', data);
        throw new Error(errorMsg);
      }

      console.log('Specialist registered successfully, now logging in...');

      // Now login with the credentials
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        console.error('Login error after registration:', loginError);
        throw new Error(`Registro exitoso pero error al iniciar sesión: ${loginError.message}`);
      }

      if (loginData.session && loginData.user) {
        onSuccess(loginData.session.access_token, loginData.user);
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar especialista';
      console.error('Error details:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-8 w-8 text-emerald-600" />
            <CardTitle className="text-2xl">Registro de Especialista</CardTitle>
          </div>
          <CardDescription>
            Regístrate como nutriólogo o entrenador profesional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="especialista@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Select
                value={specialty}
                onValueChange={(value: 'nutrición' | 'entrenamiento') => setSpecialty(value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nutrición">Nutrición</SelectItem>
                  <SelectItem value="entrenamiento">Entrenamiento Físico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">Cédula Profesional</Label>
              <Input
                id="license"
                type="text"
                placeholder="Ej: 12345678"
                value={professionalLicense}
                onChange={(e) => setProfessionalLicense(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Ingresa tu cédula profesional. Será verificada posteriormente.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                'Registrando...'
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Registrarse como Especialista
                </>
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-emerald-600 hover:underline"
                disabled={loading}
              >
                Iniciar sesión
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
