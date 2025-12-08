import { cn } from '@/lib/utils';

interface FormattedEssenceProps {
  text: string;
  className?: string;
  preview?: boolean; // For card previews with simpler formatting
}

/**
 * Component for rendering personality essence descriptions with improved typography
 * - Maintains narrative flow while improving readability
 * - Adds visual breathing points without breaking the story
 * - Uses typography techniques for better reading experience
 */
export function FormattedEssence({ text, className, preview = false }: FormattedEssenceProps) {
  // For preview mode, just return simple formatting
  if (preview) {
    return (
      <p className={cn("leading-relaxed", className)}>
        {text}
      </p>
    );
  }

  // Split text on double line breaks (paragraph breaks we added)
  const paragraphs = text.split('\n\n');
  
  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.map((paragraph, index) => {
        // Add subtle visual emphasis to dialog and key moments
        const formattedParagraph = paragraph
          // Highlight direct quotes with subtle styling
          .replace(/"([^"]+)"/g, '<span class="font-medium italic">"$1"</span>')
          // Emphasize specific time references and concrete details
          .replace(/(\d+(?:\.\d+)?\s*(?:minutes?|hours?|millimeters?|entries?))/g, '<span class="font-medium">$1</span>')
          // Highlight emotional moments and key insights
          .replace(/(twenty-three minutes|forty minutes|two hours|three hours)/g, '<span class="font-medium">$1</span>')
          // Emphasize art-specific terms
          .replace(/(cerulean blue|vermillion|Monet|Kandinsky|Jackson Pollock|Rothko|Caravaggio|Vermeer|da Vinci)/g, '<span class="font-medium">$1</span>');

        return (
          <p
            key={index}
            className={cn(
              "leading-relaxed text-black"
            )}
            dangerouslySetInnerHTML={{
              __html: formattedParagraph
            }}
          />
        );
      })}
    </div>
  );
}