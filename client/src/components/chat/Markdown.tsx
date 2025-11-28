// src/components/Markdown.tsx
interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  const formatContent = (text: string) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-itin-sand-100 px-1 rounded">$1</code>');
    
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );
}
