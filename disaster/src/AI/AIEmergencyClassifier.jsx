// frontend/src/components/AI/AIEmergencyClassifier.jsx
import React, { useState, useEffect } from 'react';
import { Brain, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const AIEmergencyClassifier = ({ description, images, onClassification }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [confidence, setConfidence] = useState(0);

  const classifyEmergency = async () => {
    if (!description || description.length < 10) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai/classify-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description,
          images: images,
          timestamp: new Date().toISOString()
        })
      });
      
      const result = await response.json();
      
      setAiResult(result);
      setConfidence(result.confidence);
      
      // Auto-fill form with AI suggestions
      onClassification({
        priority: result.suggestedPriority,
        type: result.emergencyType,
        estimatedVictims: result.estimatedPeople,
        urgencyScore: result.urgencyScore,
        recommendedResources: result.resourceNeeds,
        aiConfidence: result.confidence
      });
      
    } catch (error) {
      console.error('AI Classification Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (description && description.length > 10) {
        classifyEmergency();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [description]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className={`text-blue-600 ${isAnalyzing ? 'animate-pulse' : ''}`} size={20} />
        <h4 className="font-bold text-blue-900">AI Emergency Analysis</h4>
        {isAnalyzing && <Zap className="text-yellow-500 animate-bounce" size={16} />}
      </div>
      
      {isAnalyzing && (
        <div className="flex items-center gap-2 text-blue-700">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">AI analyzing emergency details...</span>
        </div>
      )}
      
      {aiResult && !isAnalyzing && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={16} />
            <span className="text-sm font-medium text-green-800">AI Analysis Complete</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded border">
              <p className="text-xs text-gray-600">Emergency Type</p>
              <p className="font-bold text-gray-900 capitalize">{aiResult.emergencyType}</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-xs text-gray-600">AI Suggested Priority</p>
              <span className={`px-2 py-1 rounded text-white text-xs font-bold ${
                aiResult.suggestedPriority === 'critical' ? 'bg-red-600' :
                aiResult.suggestedPriority === 'high' ? 'bg-orange-500' :
                aiResult.suggestedPriority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                {aiResult.suggestedPriority}
              </span>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-xs text-gray-600">Estimated People</p>
              <p className="font-bold text-gray-900">{aiResult.estimatedPeople}</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-xs text-gray-600">AI Confidence</p>
              <div className="flex items-center gap-2">
                <div className="bg-gray-200 rounded-full h-2 flex-1">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold">{Math.round(confidence * 100)}%</span>
              </div>
            </div>
          </div>
          
          {aiResult.keyInsights && aiResult.keyInsights.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <h5 className="font-bold text-yellow-800 mb-2">🧠 AI Insights:</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                {aiResult.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIEmergencyClassifier;
