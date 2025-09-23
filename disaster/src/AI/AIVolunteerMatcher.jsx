// frontend/src/components/AI/AIVolunteerMatcher.jsx
import React, { useState, useEffect } from 'react';
import { Users, Brain, Zap, Star, MapPin, Clock } from 'lucide-react';

const AIVolunteerMatcher = ({ request, volunteers, onAssignment }) => {
  const [aiMatches, setAiMatches] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const calculateAIMatch = async () => {
    if (!request || !volunteers.length) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai/match-volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: {
            id: request.id,
            type: request.type,
            priority: request.priority,
            location: { lat: request.lat, lng: request.lng },
            victims: request.victims,
            description: request.description
          },
          volunteers: volunteers.filter(v => v.status === 'available').map(v => ({
            id: v.id,
            name: v.name,
            skills: v.skills,
            location: { lat: v.lat, lng: v.lng },
            rating: v.rating,
            completedMissions: v.completedMissions,
            status: v.status
          }))
        })
      });
      
      const matches = await response.json();
      
      setAiMatches(matches.recommendations);
      
      // Auto-select best match if confidence > 90%
      if (matches.recommendations.length > 0 && matches.recommendations[0].aiScore > 0.9) {
        setSelectedMatch(matches.recommendations[0]);
      }
      
    } catch (error) {
      console.error('AI Matching Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (request && volunteers.length > 0) {
      calculateAIMatch();
    }
  }, [request, volunteers]);

  const handleAssignment = (volunteer, aiScore) => {
    onAssignment({
      volunteerId: volunteer.id,
      requestId: request.id,
      aiScore: aiScore,
      aiReasoning: volunteer.aiReasoning,
      confidence: volunteer.confidence
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
      <div className="flex items-center gap-2 mb-4">
        <Brain className={`text-purple-600 ${isAnalyzing ? 'animate-pulse' : ''}`} size={20} />
        <h3 className="font-bold text-purple-900">AI Volunteer Matching</h3>
        {isAnalyzing && <Zap className="text-yellow-500 animate-bounce" size={16} />}
      </div>
      
      {request && (
        <div className="bg-purple-50 p-3 rounded-lg mb-4">
          <h4 className="font-medium text-purple-800">Emergency Request #{request.id}</h4>
          <p className="text-sm text-purple-700">
            {request.type} emergency • {request.priority} priority • {request.victims} people affected
          </p>
          <p className="text-xs text-purple-600 mt-1">{request.area}</p>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm text-purple-700">AI analyzing optimal volunteer matches...</p>
          </div>
        </div>
      )}
      
      {!isAnalyzing && aiMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">AI Recommendations</h4>
            <span className="text-xs text-gray-500">{aiMatches.length} matches found</span>
          </div>
          
          {aiMatches.slice(0, 5).map((match, index) => (
            <div
              key={match.volunteer.id}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                selectedMatch?.volunteer.id === match.volunteer.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setSelectedMatch(match)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="text-purple-600" size={16} />
                    <h5 className="font-bold text-gray-900">{match.volunteer.name}</h5>
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-current" size={12} />
                      <span className="text-xs text-gray-600">{match.volunteer.rating}</span>
                    </div>
                    {index === 0 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Best Match
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} />
                      <span>{match.distance}km away</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>ETA: {match.estimatedArrival}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {match.volunteer.skills.map(skill => (
                      <span
                        key={skill}
                        className={`text-xs px-2 py-1 rounded ${
                          match.skillMatches.includes(skill)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {match.aiReasoning && (
                    <p className="text-xs text-gray-600 italic">
                      💡 AI: {match.aiReasoning}
                    </p>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-purple-600">
                    {Math.round(match.aiScore * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">AI Match</div>
                  
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${match.aiScore * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {selectedMatch?.volunteer.id === match.volunteer.id && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-purple-700">
                      <p><strong>Confidence:</strong> {Math.round(match.confidence * 100)}%</p>
                      <p><strong>Skills Match:</strong> {match.skillMatchPercentage}%</p>
                    </div>
                    <button
                      onClick={() => handleAssignment(match.volunteer, match.aiScore)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                    >
                      Assign Volunteer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {selectedMatch && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-green-600" size={16} />
                <h5 className="font-bold text-green-800">AI Assignment Preview</h5>
              </div>
              <p className="text-sm text-green-700">
                <strong>{selectedMatch.volunteer.name}</strong> will be assigned to handle the{' '}
                <strong>{request.type}</strong> emergency in <strong>{request.area}</strong>.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Expected arrival: {selectedMatch.estimatedArrival} • 
                AI confidence: {Math.round(selectedMatch.confidence * 100)}%
              </p>
            </div>
          )}
        </div>
      )}
      
      {!isAnalyzing && aiMatches.length === 0 && volunteers.length > 0 && (
        <div className="text-center py-8">
          <Users className="text-gray-400 mx-auto mb-2" size={32} />
          <p className="text-gray-600">No suitable volunteers available</p>
          <p className="text-xs text-gray-500">All volunteers are currently deployed or lack required skills</p>
        </div>
      )}
    </div>
  );
};

export default AIVolunteerMatcher;
