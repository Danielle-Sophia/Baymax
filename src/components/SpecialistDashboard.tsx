import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Dumbbell, 
  UtensilsCrossed, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  User,
  Activity,
  TrendingUp,
  Target
} from 'lucide-react';

interface SpecialistProfile {
  userId: string;
  name: string;
  email: string;
  specialty: string;
  professionalLicense: string;
  isVerified: boolean;
  activeRequests: number;
  maxRequests: number;
  totalCompleted: number;
  rating: number;
  availability: string;
}

interface Request {
  id: string;
  userId: string;
  type: 'rutina' | 'dieta';
  description: string;
  status: string;
  createdAt: string;
  userProfile?: any;
}

interface Message {
  id: string;
  requestId: string;
  senderId: string;
  senderType: 'user' | 'specialist';
  message: string;
  timestamp: string;
}

interface SpecialistDashboardProps {
  accessToken: string;
}

export default function SpecialistDashboard({ accessToken }: SpecialistDashboardProps) {
  const [profile, setProfile] = useState<SpecialistProfile | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [planContent, setPlanContent] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
    loadRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      loadMessages(selectedRequest.id);
    }
  }, [selectedRequest]);

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist-profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist/my-requests`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading requests:', err);
      setLoading(false);
    }
  };

  const loadMessages = async (requestId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/messages/${requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            requestId: selectedRequest.id,
            message: newMessage.trim(),
            senderType: 'specialist',
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessages([...messages, data.message]);
        setNewMessage('');
      } else {
        setError(data.error || 'Error al enviar mensaje');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const submitPlan = async () => {
    if (!selectedRequest || !planContent.trim()) {
      setError('Debes completar el contenido del plan');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist-plans`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            requestId: selectedRequest.id,
            content: planContent,
            recommendations: recommendations,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess('Plan creado y enviado exitosamente');
        setPlanContent('');
        setRecommendations('');
        setSelectedRequest(null);
        loadProfile(); // Refresh stats
        loadRequests(); // Refresh requests
      } else {
        throw new Error(data.error || 'Error al crear el plan');
      }
    } catch (err) {
      console.error('Error creating plan:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el plan');
    } finally {
      setSubmitting(false);
    }
  };

  const getTemplate = (type: string) => {
    if (type === 'rutina') {
      return `RUTINA DE EJERCICIO PERSONALIZADA

LUNES - Pecho y Tríceps:
- Press de banca: 4 series x 8-12 reps
- Press inclinado con mancuernas: 3 series x 10-12 reps
- Aperturas con mancuernas: 3 series x 12 reps
- Fondos en paralelas: 3 series x 10-12 reps
- Extensiones de tríceps: 3 series x 12 reps

MIÉRCOLES - Espalda y Bíceps:
- Dominadas: 4 series x máximo reps
- Remo con barra: 4 series x 8-10 reps
- Peso muerto: 3 series x 6-8 reps
- Curl con barra: 3 series x 10-12 reps
- Curl martillo: 3 series x 12 reps

VIERNES - Piernas y Hombros:
- Sentadillas: 4 series x 8-10 reps
- Prensa: 3 series x 10-12 reps
- Zancadas: 3 series x 12 reps por pierna
- Press militar: 4 series x 8-10 reps
- Elevaciones laterales: 3 series x 12 reps

Notas: Descanso de 60-90 segundos entre series.`;
    } else {
      return `PLAN DE DIETA PERSONALIZADO

DESAYUNO (7:00 AM):
- 3 huevos revueltos
- 2 rebanadas de pan integral
- 1 aguacate pequeño
- 1 vaso de jugo de naranja natural

SNACK MATUTINO (10:00 AM):
- 1 manzana
- 30g de almendras
- Té verde

ALMUERZO (1:00 PM):
- 150g de pechuga de pollo a la plancha
- 1 taza de arroz integral
- Ensalada mixta con aceite de oliva
- 1 pieza de fruta

SNACK VESPERTINO (4:00 PM):
- Yogur griego natural
- 1 banana
- 1 cucharada de miel

CENA (7:00 PM):
- 150g de pescado al horno
- Vegetales salteados
- 1 papa dulce mediana
- Infusión sin azúcar

ANTES DE DORMIR (opcional):
- 1 vaso de leche descremada o proteína`;
    }
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
        <p className="text-gray-600">No se encontró perfil de especialista</p>
      </div>
    );
  }

  if (selectedRequest) {
    const userProfile = selectedRequest.userProfile;

    return (
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedRequest(null);
            setPlanContent('');
            setRecommendations('');
            setError('');
            setSuccess('');
          }}
          className="mb-6"
        >
          ← Volver a Solicitudes
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Request Details and User Profile */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {selectedRequest.type === 'rutina' ? (
                      <Dumbbell className="h-6 w-6 text-primary" />
                    ) : (
                      <UtensilsCrossed className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedRequest.type === 'rutina' ? 'Rutina' : 'Dieta'}
                    </CardTitle>
                    <CardDescription>
                      {new Date(selectedRequest.createdAt).toLocaleDateString('es-ES')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Solicitud:</h4>
                    <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {userProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Perfil del Usuario</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Edad</p>
                      <p className="font-medium">{userProfile.age} años</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sexo</p>
                      <p className="font-medium">{userProfile.sex === 'male' ? 'M' : 'F'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Peso</p>
                      <p className="font-medium">{userProfile.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Altura</p>
                      <p className="font-medium">{userProfile.height} cm</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">TMB</p>
                      <p className="font-medium">{userProfile.tmb} kcal</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cal/día</p>
                      <p className="font-medium">{userProfile.dailyCalories}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Objetivo</p>
                    <p className="text-sm font-medium">
                      {userProfile.goal === 'lose' ? '↓ Perder peso' : 
                       userProfile.goal === 'gain' ? '↑ Ganar peso' : 
                       '= Mantener peso'}
                    </p>
                  </div>

                  {userProfile.allergies && userProfile.allergies.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Alergias</p>
                      <div className="flex flex-wrap gap-1">
                        {userProfile.allergies.map((allergy: string, i: number) => (
                          <Badge key={i} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.unwantedFoods && userProfile.unwantedFoods.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">No deseados</p>
                      <div className="flex flex-wrap gap-1">
                        {userProfile.unwantedFoods.map((food: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {food}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chat con Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScrollArea className="h-48 border rounded-lg p-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No hay mensajes
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderType === 'specialist' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-2 rounded-lg text-sm ${
                              msg.senderType === 'specialist'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plan Creation */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Crear Plan Personalizado</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPlanContent(getTemplate(selectedRequest.type))}
                  >
                    Usar Plantilla
                  </Button>
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
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contenido del Plan</label>
                  <Textarea
                    placeholder="Describe el plan completo..."
                    value={planContent}
                    onChange={(e) => setPlanContent(e.target.value)}
                    rows={20}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Recomendaciones</label>
                  <Textarea
                    placeholder="Recomendaciones adicionales..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={submitPlan}
                  disabled={submitting || !planContent.trim()}
                  className="w-full"
                >
                  {submitting ? (
                    'Enviando Plan...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Plan al Usuario
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Panel de Especialista</h1>
        <p className="text-gray-600">Gestiona tus solicitudes asignadas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activas</p>
                <p className="text-2xl font-bold">{profile.activeRequests}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">{profile.totalCompleted}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Capacidad</p>
                <p className="text-2xl font-bold">{profile.maxRequests}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={profile.availability === 'available' ? 'default' : 'secondary'}>
                  {profile.availability === 'available' ? 'Disponible' : 'Ocupado'}
                </Badge>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Asignadas ({requests.length})</CardTitle>
          <CardDescription>
            Especialidad: {profile.specialty === 'nutrición' ? 'Nutrición' : 'Entrenamiento Físico'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tienes solicitudes asignadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <Card
                  key={request.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedRequest(request)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {request.type === 'rutina' ? (
                            <Dumbbell className="h-5 w-5 text-primary" />
                          ) : (
                            <UtensilsCrossed className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {request.type === 'rutina' ? 'Rutina de Ejercicio' : 'Plan de Dieta'}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {request.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={request.status === 'completado' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
