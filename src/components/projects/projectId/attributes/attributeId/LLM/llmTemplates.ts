import { capitalizeFirst } from "@/submodules/javascript-functions/case-types-parser";

export const TEMPLATE_EXAMPLES = {
  REASONED_CLICKBAIT: {
    templatePrompt: "You are running your own information network and need to ensure no clickbait news articles are published. To ensure your answer can be validated always provide a reason and your final result being either 'yes' or 'no' to the question is this clickbait. JSON Schema {\"reason\": <reasoning>, \"result\":<result>}",
    questionPrompt: "News article: '{{headline}}'"
  },
  SHORT_SUMMARY_REFERENCE: {
    templatePrompt: "Summarize the given text into two short sentences. Don't add any new keys only provide {\"result\":\"<summar>\"}",
    questionPrompt: "{{reference}}"
  },
  META_DATA_EXTRACTION_REFERENCE: {
    templatePrompt: `Your task is to extract meta data from the given text following this structure: 
{
  "linguistic_metadata": {
    "language": "",  // ISO 639-1 language code
    "reading_complexity": {
      "vocabulary_level": "",  // Possible values: "basic", "moderate", "advanced"
      "sentence_structure": "",  // Possible values: "simple", "moderate", "complex"
      "readability_level": "" //reading level "pre school", "high school", "college"
    },
    "grammar_and_style": ""  // Possible values: "formal", "informal", "technical", "creative"
  },
  "structural_metadata": {
    "document_structure": {
      "contains_headings": , // true or false
      "contains_subcategories": ,  // true or false
      "format": ""  // Possible values: "paragraph", "list", "table"
    }
  },
  "semantic_metadata": {
    "key_themes": [], //list all key themes - max 10
    "keywords": [] //list all keywords - max 10
  },
  "sentiment_metadata": {
    "overall_sentiment": "",  // Possible values: "positive", "neutral", "negative"
    "emotional_tone": [] //list all emotional tones - Possible values: "detachment", "caution", "optimism", "warning", "encouragement"
  },
  "repeated_phrases": [] //list repeated phrases if any,
  "contextual_metadata": {
    "target_audience": [], //make an educated guess on who would be the target audience - max 3
    "purpose": "" //make an educated guess on what the purpose of the text is - max 2 sentences
  },
  "sentence_types": [] // list all sentence types Possible values: "explanatory", "descriptive", "narrative", "directive"
}

Don't remove any keys from the structure even if they are empty.`,
    questionPrompt: "{{reference}}"
    // removed since llms cant count words,
    // "word_count": ,  // Integer word count
    // "paragraph_count":   // Integer paragraph count

  },
  ENTITY_EXTRACTION_REFERENCE: {
    templatePrompt: `Your task is to extract entities from the given text. To help with the task here is a list of entities with some examples: 
{
  "entities": {
    "person": {
      "description": "Names of individuals or their roles/titles",
      "examples": ["John Smith", "Marie Curie", "CEO", "Doctor"]
    },
    "organization": {
      "description": "Names of businesses, companies, or institutions",
      "examples": ["Google", "United Nations", "Harvard University", "NASA"]
    },
    "geopolitical_entity": {
      "description": "Names of countries, cities, or regions",
      "examples": ["Canada", "New York City", "Southeast Asia"]
    },
    "location": {
      "description": "Names of natural locations or specific addresses",
      "examples": ["Mount Everest", "Amazon Rainforest", "1600 Pennsylvania Avenue"]
    },
    "date_time": {
      "description": "Dates, times, or ranges of time",
      "examples": ["January 1, 2023", "10:00 AM", "next week", "between 2020 and 2022"]
    },
    "numerical": {
      "description": "Quantities, prices, percentages, or numerical data",
      "examples": ["3 miles", "$100", "25%", "50 kilograms"]
    },
    "event": {
      "description": "Historical, recurring, or planned events",
      "examples": ["World War II", "The Olympics", "Black Friday", "Eclipse"]
    },
    "product": {
      "description": "Consumer goods, services, or software",
      "examples": ["iPhone 15", "Toyota Corolla", "Amazon Prime", "Spotify Premium"]
    },
    "law_and_regulation": {
      "description": "Laws, treaties, or legal terms",
      "examples": ["GDPR", "Constitution of the United States"]
    },
    "health": {
      "description": "Medical terms or healthcare providers",
      "examples": ["Diabetes", "Ibuprofen", "Mayo Clinic"]
    },
    "technology": {
      "description": "Names of software, hardware, or platforms",
      "examples": ["Microsoft Word", "ChatGPT", "Intel i7 Processor", "Tesla Model S"]
    },
    "creative_work": {
      "description": "Titles of books, movies, TV shows, songs, or albums",
      "examples": ["To Kill a Mockingbird", "Inception", "Thriller", "Breaking Bad"]
    },
    "financial": {
      "description": "Stock symbols, indexes, or financial institutions",
      "examples": ["AAPL", "NASDAQ", "Goldman Sachs", "Bank of America"]
    },
    "animal": {
      "description": "Names of animals or species",
      "examples": ["Golden Retriever", "Bald Eagle"]
    },
    "facility": {
      "description": "Buildings, landmarks, or public structures",
      "examples": ["The Eiffel Tower", "The Pentagon"]
    },
    "sports_team": {
      "description": "Names of professional or amateur sports teams",
      "examples": ["Los Angeles Lakers", "Manchester United"]
    },
    "food_drink": {
      "description": "Names of dishes, beverages, or food brands",
      "examples": ["Pizza Margherita", "Coca-Cola"]
    }
  }
}


Provide all extracted entities as a list. Don't add a description or examples to the list. Only provide the entity names under the corresponding sections. If no entities are found, return an empty list for the section.`,
    questionPrompt: "{{reference}}"
  },
  TRANSLATION_REFERENCE: {
    templatePrompt: "Translate the given text to iso 639-1 de.",
    questionPrompt: "{{reference}}"
  },
  CLEANSE_REFERENCE: {
    templatePrompt: `Your task is to clean the given text. For this ensure:
- All html tags are removed
- unnecessary characters are removed (e.g. emojis, special characters unrelated to the sentence)
- keep list intact, ensure the lists use '-' as enumeration 
- keep line breaks between list points
- Don't change the text only return the final cleaned up result
- Keep markdown intact`,
    questionPrompt: "{{reference}}"
  }
}

export const LLM_CODE_TEMPLATE_EXAMPLES = {
  DEFAULT: `
async def ac(record):
    # no post processing of answer

    llm_response = await get_llm_response()
    return llm_response.get("result") or "no result provided"
`,
  JSON_DUMPS_ALL_RESULTS: `import json
async def ac(record):
    llm_response = await get_llm_response()
    return json.dumps(llm_response, indent=2)
`,
  TRY_RESULTS: `
async def ac(record):
    try:
        llm_response = await get_llm_response()
        return llm_response.get("result","no result provided")
    except Exception as e:
        print(f"Error at {record['running_id']}: " + str(e))
        return "Error: " + str(e)
`

}


export const LLM_CODE_TEMPLATE_OPTIONS = Object.keys(LLM_CODE_TEMPLATE_EXAMPLES).map((key) => ({ name: capitalizeFirst(key), value: key }));
export const TEMPLATE_OPTIONS = Object.keys(TEMPLATE_EXAMPLES).map((key) => ({ name: capitalizeFirst(key), value: key }));