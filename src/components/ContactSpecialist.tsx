import { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Dumbbell, UtensilsCrossed, ArrowLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ContactSpecialistProps {
  onBack: () => void;
}

type RequestType = 'rutina' | 'dieta' | null;

export function ContactSpecialist({ onBack }: ContactSpecialistProps) {
  const [selectedType, setSelectedType] = useState<RequestType>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    // FA4: Validate empty description
    if (!description.trim()) {
      setError('Por favor, escribe una descripción de lo que necesitas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('No estás autenticado');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            type: selectedType,
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // FA1: Profile incomplete
        if (data.code === 'PROFILE_INCOMPLETE') {
          setError('Debes completar tu perfil antes de contactar a un especialista. Redirigiendo...');
          setTimeout(() => {
            onBack();
          }, 2000);
          return;
        }

        // FA1 (Extension): Forbidden words
        if (data.code === 'FORBIDDEN_WORDS') {
          setError('Tu mensaje contiene palabras no permitidas. Por favor, usa un lenguaje respetuoso.');
          setLoading(false);
          return;
        }

        throw new Error(data.error || 'Error al enviar la solicitud');
      }

      setSuccess(true);
      setDescription('');

      // Redirect to "My Plans" after 2 seconds
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // FA3: Cancel request
  const handleCancel = () => {
    setSelectedType(null);
    setDescription('');
    setError('');
    setSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      {!selectedType ? (
        <>
          <div className="mb-8">
            <h1 className="mb-2">Contactar Especialista</h1>
            <p className="text-muted-foreground">
              Selecciona el tipo de plan que necesitas y un especialista te ayudará
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedType('rutina')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Dumbbell className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Solicitar Rutina</CardTitle>
                    <CardDescription>
                      Plan de ejercicios personalizado
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Un entrenador creará una rutina de ejercicios adaptada a tu nivel, 
                  objetivos y preferencias.
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedType('dieta')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <UtensilsCrossed className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Solicitar Dieta</CardTitle>
                    <CardDescription>
                      Plan nutricional personalizado
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Un nutriólogo diseñará un plan de alimentación basado en tus 
                  metas, alergias y preferencias.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                {selectedType === 'rutina' ? (
                  <Dumbbell className="h-8 w-8 text-primary" />
                ) : (
                  <UtensilsCrossed className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <CardTitle>
                  {selectedType === 'rutina' ? 'Solicitar Rutina de Ejercicio' : 'Solicitar Plan de Dieta'}
                </CardTitle>
                <CardDescription>
                  Describe lo que necesitas y un especialista te ayudará
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ¡Tu solicitud ha sido enviada! Un especialista la responderá dentro de las próximas 24 horas.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Describe tu solicitud
              </label>
              <Textarea
                placeholder={
                  selectedType === 'rutina'
                    ? 'Ejemplo: Quiero una rutina para ganar masa muscular, puedo entrenar 4 días a la semana...'
                    : 'Ejemplo: Quiero una dieta para perder grasa sin dejar los carbohidratos...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                disabled={loading || success}
              />
              <p className="text-xs text-muted-foreground">
                Sé específico sobre tus objetivos, preferencias y limitaciones
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={loading || success || !description.trim()}
                className="flex-1"
              >
                {loading ? (
                  'Enviando...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading || success}
              >
                Cancelar
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Información de tu perfil</h3>
              <p className="text-xs text-muted-foreground">
                El especialista tendrá acceso a tu perfil completo (edad, peso, metas, 
                alergias, preferencias) para crear un plan personalizado.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
