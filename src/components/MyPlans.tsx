import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { 
  ArrowLeft, 
  Dumbbell, 
  UtensilsCrossed, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  MessageCircle
} from 'lucide-react';

interface Request {
  id: string;
  type: 'rutina' | 'dieta';
  description: string;
  status: 'pendiente' | 'asignado' | 'en_progreso' | 'completado';
  assignedTo?: string | null;
  specialistName?: string;
  specialistSpecialty?: string;
  createdAt: string;
  updatedAt: string;
}

interface Plan {
  id: string;
  requestId: string;
  content: string;
  recommendations: string;
  createdAt: string;
}

interface Message {
  id: string;
  requestId: string;
  senderId: string;
  senderType: 'user' | 'specialist';
  message: string;
  timestamp: string;
}

interface MyPlansProps {
  onBack: () => void;
}

export function MyPlans({ onBack }: MyPlansProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      loadPlanAndMessages(selectedRequest.id);
    }
  }, [selectedRequest]);

  const loadRequests = async () => {
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
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRequests(data.requests || []);
      } else {
        throw new Error(data.error || 'Error al cargar solicitudes');
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const loadPlanAndMessages = async (requestId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      // Load plan
      const planResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist-requests/${requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const planData = await planResponse.json();
      if (planResponse.ok) {
        setPlan(planData.plan);
      }

      // Load messages
      const messagesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/messages/${requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const messagesData = await messagesResponse.json();
      if (messagesResponse.ok) {
        setMessages(messagesData.messages || []);
      }
    } catch (err) {
      console.error('Error loading plan and messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;

    setSendingMessage(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('No estás autenticado');
        setSendingMessage(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            requestId: selectedRequest.id,
            message: newMessage.trim(),
            senderType: 'user',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // FA1 (Extension): Forbidden words
        if (data.code === 'FORBIDDEN_WORDS') {
          setError('Tu mensaje contiene palabras no permitidas. Por favor, usa un lenguaje respetuoso.');
          setSendingMessage(false);
          return;
        }

        throw new Error(data.error || 'Error al enviar mensaje');
      }

      // Add message to list
      setMessages([...messages, data.message]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'asignado':
        return <Badge variant="default" className="bg-blue-600"><CheckCircle2 className="h-3 w-3 mr-1" />Asignado</Badge>;
      case 'en_progreso':
        return <Badge variant="default"><MessageCircle className="h-3 w-3 mr-1" />En Progreso</Badge>;
      case 'completado':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Completado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando tus planes...</p>
        </div>
      </div>
    );
  }

  if (selectedRequest) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedRequest(null);
            setPlan(null);
            setMessages([]);
            setNewMessage('');
            setError('');
          }}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Mis Planes
        </Button>

        <div className="space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {selectedRequest.type === 'rutina' ? (
                      <Dumbbell className="h-6 w-6 text-primary" />
                    ) : (
                      <UtensilsCrossed className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle>
                      {selectedRequest.type === 'rutina' ? 'Rutina de Ejercicio' : 'Plan de Dieta'}
                    </CardTitle>
                    <CardDescription>
                      Solicitado el {formatDate(selectedRequest.createdAt)}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(selectedRequest.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">Tu solicitud:</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                </div>
                
                {selectedRequest.assignedTo && selectedRequest.specialistName && (
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-medium mb-1">Especialista Asignado:</h4>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {selectedRequest.specialistSpecialty === 'entrenamiento' ? (
                          <Dumbbell className="h-4 w-4 text-primary" />
                        ) : (
                          <UtensilsCrossed className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{selectedRequest.specialistName}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {selectedRequest.specialistSpecialty}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!selectedRequest.assignedTo && selectedRequest.status === 'pendiente' && (
                  <div className="pt-3 border-t">
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Estamos buscando un especialista disponible para tu solicitud. 
                        Te notificaremos cuando sea asignada.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plan (if available) */}
          {plan && (
            <Card>
              <CardHeader>
                <CardTitle>Plan Personalizado</CardTitle>
                <CardDescription>
                  Creado el {formatDate(plan.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Contenido del Plan:</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{plan.content}</p>
                  </div>
                </div>

                {plan.recommendations && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recomendaciones Adicionales:</h4>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900 whitespace-pre-wrap">{plan.recommendations}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Chat */}
          <Card>
            <CardHeader>
              <CardTitle>Conversación con el Especialista</CardTitle>
              <CardDescription>
                Pregunta cualquier duda sobre tu plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <ScrollArea className="h-64 border rounded-lg p-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay mensajes aún. ¡Envía el primero!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.senderType === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe tu mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={2}
                  disabled={sendingMessage}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Presiona Enter para enviar, Shift+Enter para nueva línea
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

      <div className="mb-8">
        <h1 className="mb-2">Mis Planes</h1>
        <p className="text-muted-foreground">
          Tus solicitudes y planes personalizados
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No tienes solicitudes aún
            </p>
            <Button onClick={onBack}>
              Contactar Especialista
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedRequest(request)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {request.type === 'rutina' ? (
                        <Dumbbell className="h-6 w-6 text-primary" />
                      ) : (
                        <UtensilsCrossed className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {request.type === 'rutina' ? 'Rutina de Ejercicio' : 'Plan de Dieta'}
                      </CardTitle>
                      <CardDescription>
                        Solicitado el {formatDate(request.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {request.description}
                </p>
                
                {request.assignedTo && request.specialistName && (
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <div className="p-1.5 bg-primary/10 rounded-full">
                      {request.specialistSpecialty === 'entrenamiento' ? (
                        <Dumbbell className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{request.specialistName}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {request.specialistSpecialty}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
