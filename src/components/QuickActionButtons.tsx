import React, { useState } from 'react';
import { Shuffle, Share2, Download, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface QuickActionButtonsProps {
  onShuffle?: () => void;
  onShare?: () => void;
  recipeText?: string;
  recipeName?: string;
}

export default function QuickActionButtons({
  onShuffle,
  onShare,
  recipeText,
  recipeName,
}: QuickActionButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  const handleCopy = async () => {
    if (!recipeText) return;

    try {
      await navigator.clipboard.writeText(recipeText);
      setCopied(true);
      toast.success('Receta copiada al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  const handleShuffle = async () => {
    if (!onShuffle) return;
    
    setShuffling(true);
    await onShuffle();
    setTimeout(() => setShuffling(false), 1000);
  };

  const handleShare = () => {
    if (navigator.share && recipeName) {
      navigator
        .share({
          title: recipeName,
          text: `Mira esta receta de Dr. Baymax: ${recipeName}`,
        })
        .catch(() => {
          // Fallback to copy
          handleCopy();
        });
    } else if (onShare) {
      onShare();
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {onShuffle && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleShuffle}
          disabled={shuffling}
          className="transition-all hover:scale-105 active:scale-95"
        >
          <Shuffle
            className={`w-4 h-4 mr-2 ${shuffling ? 'animate-spin' : ''}`}
          />
          {shuffling ? 'Variando...' : 'Variante'}
        </Button>
      )}

      {recipeText && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="transition-all hover:scale-105 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-green-600">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </>
          )}
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="transition-all hover:scale-105 active:scale-95"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Compartir
      </Button>
    </div>
  );
}
