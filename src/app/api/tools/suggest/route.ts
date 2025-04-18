import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

interface SuggestionResponse {
  tools: {
    id: string;
    name: string;
    description: string;
    icon_name: string;
    categories: string[];
  }[];
  message?: string;
}

// GET: Suggest tools based on a description of a problem
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query || query.trim().length < 3) {
      return NextResponse.json(
        { tools: [], message: 'Please provide a longer query to get meaningful suggestions' },
        { status: 200 }
      );
    }
    
    // Extract potential keywords from the query
    // This is a simple keyword extraction - in a real app, you might use NLP or AI
    const keywords = extractKeywords(query);
    
    // Find tools that match the keywords in their name, description, or categories
    const { data: matchingTools, error } = await supabase
      .from('tools')
      .select(`
        id, 
        name, 
        description, 
        icon_name
      `)
      .or(`name.ilike.%${keywords[0]}%,description.ilike.%${keywords[0]}%`)
      .limit(3);
    
    if (error) {
      throw error;
    }
    
    // For each matching tool, get its categories
    const toolsWithCategories = await Promise.all(matchingTools.map(async (tool) => {
      const { data: categories, error: categoriesError } = await supabase
        .from('tool_categories')
        .select('category_name')
        .eq('tool_id', tool.id);
      
      if (categoriesError) {
        console.error(`Error fetching categories for tool ${tool.id}:`, categoriesError);
        return {
          ...tool,
          categories: []
        };
      }
      
      return {
        ...tool,
        categories: categories ? categories.map(c => c.category_name) : []
      };
    }));
    
    // If no tools match directly, try to find tools by category
    if (toolsWithCategories.length === 0) {
      // Find tools in categories that might match the query
      const { data: categoryMatches, error: catError } = await supabase
        .from('tool_categories')
        .select(`
          tool_id,
          category_name
        `)
        .or(`category_name.ilike.%${keywords[0]}%`);
      
      if (catError) {
        console.error('Error finding category matches:', catError);
      }
      
      if (categoryMatches && categoryMatches.length > 0) {
        const toolIds = [...new Set(categoryMatches.map(match => match.tool_id))];
        
        const { data: toolsByCategory, error: toolsError } = await supabase
          .from('tools')
          .select(`
            id, 
            name, 
            description, 
            icon_name
          `)
          .in('id', toolIds)
          .limit(3);
        
        if (toolsError) {
          console.error('Error finding tools by category:', toolsError);
        } else if (toolsByCategory) {
          // For each category-matched tool, get its categories
          const categoryCatTools = await Promise.all(toolsByCategory.map(async (tool) => {
            const { data: toolCats, error: catsError } = await supabase
              .from('tool_categories')
              .select('category_name')
              .eq('tool_id', tool.id);
            
            if (catsError) {
              console.error(`Error fetching categories for tool ${tool.id}:`, catsError);
              return {
                ...tool,
                categories: []
              };
            }
            
            return {
              ...tool,
              categories: toolCats ? toolCats.map(c => c.category_name) : []
            };
          }));
          
          // Add a message explaining why these tools were suggested
          return NextResponse.json({
            tools: categoryCatTools,
            message: `Based on your needs, these tools from the ${categoryMatches[0].category_name} category might help.`
          });
        }
      }
      
      // If still no matches, return most popular tools
      const { data: popularTools, error: popError } = await supabase
        .from('tools')
        .select(`
          id, 
          name, 
          description, 
          icon_name
        `)
        .order('usage_count', { ascending: false })
        .limit(3);
      
      if (popError) {
        throw popError;
      }
      
      // For each popular tool, get its categories
      const popularWithCats = await Promise.all(popularTools.map(async (tool) => {
        const { data: toolCats, error: catsError } = await supabase
          .from('tool_categories')
          .select('category_name')
          .eq('tool_id', tool.id);
        
        if (catsError) {
          console.error(`Error fetching categories for tool ${tool.id}:`, catsError);
          return {
            ...tool,
            categories: []
          };
        }
        
        return {
          ...tool,
          categories: toolCats ? toolCats.map(c => c.category_name) : []
        };
      }));
      
      return NextResponse.json({
        tools: popularWithCats,
        message: "We couldn't find exact matches, but these popular tools might be helpful."
      });
    }
    
    // Return the matching tools with a message
    const response: SuggestionResponse = {
      tools: toolsWithCategories,
      message: `Here are some tools that might help with "${query}"`
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error suggesting tools:', error);
    return NextResponse.json(
      { error: 'Failed to suggest tools' },
      { status: 500 }
    );
  }
}

// Simple keyword extraction function
function extractKeywords(query: string): string[] {
  // Remove common words and split into keywords
  const commonWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'on', 'at', 'to', 'from', 
    'by', 'with', 'in', 'out', 'about', 'need', 'help', 'want', 'looking', 'tool',
    'how', 'what', 'when', 'where', 'why', 'who', 'which', 'would', 'could', 'should',
    'do', 'does', 'did', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'can', 'will', 'i', 'my', 'me', 'mine', 'we', 'our', 'us'
  ];
  
  // Convert to lowercase, remove special characters, split by spaces
  const words = query.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => !commonWords.includes(word) && word.length > 2);
  
  // Return unique keywords, or fallback to first 3 words if no keywords found
  return words.length > 0 
    ? [...new Set(words)] 
    : query.toLowerCase().split(/\s+/).slice(0, 3);
}
