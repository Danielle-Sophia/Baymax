import React, { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, Clock, ChefHat, Trash2, Search, Filter, X } from 'lucide-react';
import { Input } from './ui/input';

interface RecipeFavoritesProps {
  accessToken: string;
}

interface Recipe {
  id: string;
  nombre: string;
  descripcion: string;
  tiempoPreparacion: string;
  dificultad: string;
  porciones: number;
  ingredientes: { nombre: string; cantidad: string }[];
  pasos: string[];
  informacionNutricional: {
    calorias: number;
    proteinas: string;
    carbohidratos: string;
    grasas: string;
    fibra: string;
  };
  tags: string[];
  consejos: string;
  savedAt: string;
}

export default function RecipeFavorites({ accessToken }: RecipeFavoritesProps) {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/favorites`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/favorite/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setFavorites(favorites.filter(f => f.id !== id));
        toast.success('Receta eliminada de favoritos');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Error al eliminar favorito');
    }
  };

  // Get all unique tags from favorites
  const allTags = Array.from(new Set(favorites.flatMap(f => f.tags)));

  // Filter favorites based on search and tag
  const filteredFavorites = favorites.filter(recipe => {
    const matchesSearch = recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || recipe.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-emerald-600 flex items-center gap-2">
            <Heart className="h-8 w-8 fill-current" />
            Recetas Favoritas
          </h1>
          <p className="text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'receta guardada' : 'recetas guardadas'}
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-gray-500 mb-2">No tienes recetas favoritas aún</h3>
            <p className="text-sm text-gray-400">
              Cuando generes recetas, puedes guardarlas como favoritas para acceso rápido
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar recetas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Filtrar por etiqueta:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={selectedTag === null ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedTag(null)}
                      >
                        Todas
                      </Badge>
                      {allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTag === tag ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results count */}
          {filteredFavorites.length !== favorites.length && (
            <div className="text-sm text-gray-600">
              Mostrando {filteredFavorites.length} de {favorites.length} recetas
            </div>
          )}

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{recipe.nombre}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {recipe.descripcion}
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => removeFavorite(recipe.id)}
                      className="flex-shrink-0 ml-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {recipe.tiempoPreparacion}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {recipe.dificultad}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Calorías:</span>
                      <span className="font-medium">{recipe.informacionNutricional.calorias} kcal</span>
                    </div>
                  </div>

                  {recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{recipe.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => setSelectedRecipe(recipe)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Ver Receta Completa
                  </Button>

                  <div className="text-xs text-gray-400 text-center">
                    Guardada el {new Date(recipe.savedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFavorites.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-gray-500 mb-2">No se encontraron recetas</h3>
                <p className="text-sm text-gray-400">
                  Intenta con otros términos de búsqueda o filtros
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onRemove={() => {
            removeFavorite(selectedRecipe.id);
            setSelectedRecipe(null);
          }}
        />
      )}
    </div>
  );
}

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  onRemove: () => void;
}

function RecipeDetailModal({ recipe, onClose, onRemove }: RecipeDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-emerald-600">{recipe.nombre}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Heart className="h-4 w-4 fill-current text-red-500" />
                <span className="text-sm text-gray-500">
                  Guardada el {new Date(recipe.savedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onRemove} variant="outline" size="sm" className="text-red-600">
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                ✕
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-gray-600">{recipe.descripcion}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm">{recipe.tiempoPreparacion}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <ChefHat className="h-5 w-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm capitalize">{recipe.dificultad}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl mb-1">👥</div>
              <div className="text-sm">{recipe.porciones} porciones</div>
            </div>
          </div>

          <div>
            <h3 className="mb-3">Información Nutricional</h3>
            <div className="grid grid-cols-5 gap-2">
              <div className="text-center p-2 bg-emerald-50 rounded">
                <div className="text-lg">{recipe.informacionNutricional.calorias}</div>
                <div className="text-xs text-gray-600">kcal</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg">{recipe.informacionNutricional.proteinas}</div>
                <div className="text-xs text-gray-600">Proteínas</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="text-lg">{recipe.informacionNutricional.carbohidratos}</div>
                <div className="text-xs text-gray-600">Carbos</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <div className="text-lg">{recipe.informacionNutricional.grasas}</div>
                <div className="text-xs text-gray-600">Grasas</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg">{recipe.informacionNutricional.fibra}</div>
                <div className="text-xs text-gray-600">Fibra</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3">Ingredientes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipe.ingredientes.map((ing, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-emerald-600">•</span>
                  <div>
                    <span className="capitalize">{ing.nombre}</span>
                    <span className="text-gray-500 text-sm"> - {ing.cantidad}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3">Preparación</h3>
            <ol className="space-y-3">
              {recipe.pasos.map((paso, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">
                    {idx + 1}
                  </span>
                  <span className="flex-1 pt-0.5">{paso}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.consejos && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-blue-900 mb-2">💡 Consejo del Chef</h4>
              <p className="text-blue-800 text-sm">{recipe.consejos}</p>
            </div>
          )}

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
