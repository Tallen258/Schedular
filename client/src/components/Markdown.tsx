// src/components/Markdown.tsx
interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  // Basic markdown rendering - you can enhance this with a library like react-markdown
  const formatContent = (text: string) => {
    // Convert **bold** to <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert `code` to <code>
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
    
    // Convert line breaks
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
