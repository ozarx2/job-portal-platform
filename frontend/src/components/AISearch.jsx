import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  MapPin, 
  Building2, 
  DollarSign,
  Clock,
  Filter,
  X,
  Loader,
  MessageSquare,
  ArrowRight,
  Star,
  Target
} from 'lucide-react';
import axios from 'axios';
import aiService from '../services/aiService';

const AISearch = ({ onSearchResults, onSearchChange }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [conversationMode, setConversationMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Popular AI prompts for job search
  const popularPrompts = [
    "Find remote software engineering jobs with good work-life balance",
    "Show me entry-level marketing positions in tech companies",
    "I want to work in data science, what opportunities are available?",
    "Find jobs that match my skills: React, Node.js, and MongoDB",
    "Show me high-paying jobs in finance or consulting",
    "I'm looking for startup opportunities in the healthcare sector",
    "Find jobs that offer learning and development opportunities",
    "Show me jobs in companies with strong diversity and inclusion policies"
  ];

  // AI-powered job insights
  const generateAIInsights = async (searchResults) => {
    if (!searchResults || searchResults.length === 0) return;

    try {
      // Mock AI insights - replace with actual ChatGPT API call
      const insights = {
        marketTrends: "The job market shows strong demand for remote work opportunities, with 65% of listings offering flexible arrangements.",
        skillDemand: "Most in-demand skills: React (45%), Python (38%), AWS (32%), Machine Learning (28%)",
        salaryInsights: "Average salary range for your search: $75,000 - $120,000",
        recommendations: [
          "Consider upskilling in cloud technologies (AWS, Azure)",
          "Remote-first companies are growing 40% faster",
          "Focus on companies with strong learning cultures"
        ],
        companyInsights: "Top companies in your search: Google, Microsoft, Amazon, and emerging startups"
      };
      
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  };

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    
    try {
      // Use AI service for search
      const response = await aiService.searchJobs(prompt);
      
      if (response.success) {
        onSearchResults(response.data.jobs, response.data.insights);
        onSearchChange({ 
          prompt, 
          processedQuery: response.data.processedQuery,
          filters: response.data.processedQuery || {}
        });
        
        // Set AI insights
        setAiInsights(response.data.insights);
        
        // Add to search history
        const searchEntry = { 
          prompt, 
          processedQuery: response.data.processedQuery, 
          timestamp: new Date(),
          resultCount: response.data.jobs.length
        };
        setSearchHistory(prev => [searchEntry, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('AI Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process natural language prompt using AI
  const processNaturalLanguagePrompt = async (userPrompt) => {
    // Mock AI processing - replace with actual ChatGPT API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple keyword extraction and processing
    const prompt = userPrompt.toLowerCase();
    
    let searchTerm = '';
    let location = '';
    let jobType = '';
    let company = '';
    
    // Extract job titles and skills
    const jobKeywords = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'marketing', 'sales', 'data', 'software', 'frontend', 'backend', 'full stack'];
    const foundKeywords = jobKeywords.filter(keyword => prompt.includes(keyword));
    if (foundKeywords.length > 0) {
      searchTerm = foundKeywords.join(' ');
    }
    
    // Extract location
    const locationKeywords = ['remote', 'hybrid', 'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune'];
    const foundLocations = locationKeywords.filter(keyword => prompt.includes(keyword));
    if (foundLocations.length > 0) {
      location = foundLocations[0];
    }
    
    // Extract job type
    if (prompt.includes('remote')) jobType = 'Remote';
    if (prompt.includes('full time') || prompt.includes('full-time')) jobType = 'Full-time';
    if (prompt.includes('part time') || prompt.includes('part-time')) jobType = 'Part-time';
    if (prompt.includes('contract')) jobType = 'Contract';
    if (prompt.includes('internship')) jobType = 'Internship';
    
    // Extract company preferences
    if (prompt.includes('startup')) company = 'startup';
    if (prompt.includes('tech') || prompt.includes('technology')) company = 'tech';
    if (prompt.includes('finance') || prompt.includes('banking')) company = 'finance';
    
    return {
      searchTerm: searchTerm || userPrompt,
      location,
      jobType,
      company
    };
  };

  const handlePromptSuggestion = (suggestion) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  const startConversation = () => {
    setConversationMode(true);
    setConversationHistory([{
      type: 'ai',
      message: "Hi! I'm your AI job search assistant. Tell me what kind of job you're looking for, and I'll help you find the perfect opportunities!",
      timestamp: new Date()
    }]);
  };

  const handleConversation = async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      message,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, userMessage]);

    // Process with AI
    setLoading(true);
    try {
      const response = await aiService.searchJobs(message);
      
      if (response.success) {
        onSearchResults(response.data.jobs, response.data.insights);
        onSearchChange({ 
          prompt: message, 
          processedQuery: response.data.processedQuery,
          filters: response.data.processedQuery || {}
        });
        
        // AI response
        const aiResponse = {
          type: 'ai',
          message: `I found ${response.data.jobs.length} jobs that match your criteria! Here are some highlights:`,
          jobs: response.data.jobs.slice(0, 3),
          timestamp: new Date()
        };
        setConversationHistory(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      const errorResponse = {
        type: 'ai',
        message: "I'm sorry, I encountered an error while searching. Please try again with a different prompt.",
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {!conversationMode ? (
        <div className="space-y-6">
          {/* AI Search Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mr-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI-Powered Job Search
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Describe your dream job in natural language and let AI find the perfect opportunities for you
            </p>
          </div>

          {/* AI Search Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <form onSubmit={handleAISearch} className="space-y-6">
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-6 h-6" />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Describe your ideal job... e.g., 'I want a remote software engineering position at a tech startup with good work-life balance'"
                  className="w-full pl-14 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg resize-none"
                  rows={3}
                />
                
                {/* AI Suggestions */}
                {showSuggestions && popularPrompts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                        Popular AI Prompts
                      </h4>
                    </div>
                    {popularPrompts.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePromptSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-start"
                      >
                        <Sparkles className="w-4 h-4 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <Loader className="w-6 h-6 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-6 h-6 mr-2" />
                  )}
                  {loading ? 'AI is thinking...' : 'Search with AI'}
                </button>
                
                <button
                  type="button"
                  onClick={startConversation}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-semibold text-lg flex items-center justify-center"
                >
                  <MessageSquare className="w-6 h-6 mr-2" />
                  Chat with AI
                </button>
              </div>
            </form>
          </div>

          {/* AI Insights */}
          {aiInsights && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">AI Market Insights</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-purple-100">
                    <h4 className="font-medium text-gray-900 mb-2">Market Trends</h4>
                    <p className="text-sm text-gray-600">{aiInsights.marketTrends}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-purple-100">
                    <h4 className="font-medium text-gray-900 mb-2">Skill Demand</h4>
                    <p className="text-sm text-gray-600">{aiInsights.skillDemand}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-purple-100">
                    <h4 className="font-medium text-gray-900 mb-2">Salary Insights</h4>
                    <p className="text-sm text-gray-600">{aiInsights.salaryInsights}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-purple-100">
                    <h4 className="font-medium text-gray-900 mb-2">AI Recommendations</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {aiInsights.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <Target className="w-3 h-3 text-purple-500 mr-2 mt-1 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Recent AI Searches
              </h3>
              <div className="space-y-3">
                {searchHistory.map((search, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{search.prompt}</p>
                      <p className="text-xs text-gray-500">{search.resultCount} results found</p>
                    </div>
                    <button
                      onClick={() => handlePromptSuggestion(search.prompt)}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                    >
                      Use Again
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Conversation Mode */
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 h-96 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-3">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Job Assistant</h3>
                <p className="text-xs text-gray-500">Ask me anything about jobs!</p>
              </div>
            </div>
            <button
              onClick={() => setConversationMode(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversationHistory.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.message}</p>
                  {message.jobs && (
                    <div className="mt-2 space-y-2">
                      {message.jobs.map((job, jobIndex) => (
                        <div key={jobIndex} className="bg-white/20 p-2 rounded-lg">
                          <p className="text-xs font-medium">{job.title}</p>
                          <p className="text-xs opacity-80">{job.company}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs px-4 py-2 rounded-2xl">
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={(e) => { e.preventDefault(); handleConversation(e.target.message.value); e.target.message.value = ''; }} className="flex gap-2">
              <input
                name="message"
                type="text"
                placeholder="Ask me about jobs..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISearch;
