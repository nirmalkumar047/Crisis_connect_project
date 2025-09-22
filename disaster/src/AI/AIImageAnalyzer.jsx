// frontend/src/components/AI/AIImageAnalyzer.jsx
import React, { useState, useCallback } from 'react';
import { Camera, Upload, Eye, AlertTriangle, Users, Zap } from 'lucide-react';

const AIImageAnalyzer = ({ onAnalysisComplete }) => {
  const [images, setImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = useCallback(async (files) => {
    const fileArray = Array.from(files);
    setImages(prev => [...prev, ...fileArray]);
    
    await analyzeImages(fileArray);
  }, []);

  const analyzeImages = async (imageFiles) => {
    setIsAnalyzing(true);
    
    try {
      const analyses = await Promise.all(
        imageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('analysisType', 'emergency_assessment');
          
          const response = await fetch('/api/ai/analyze-image', {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();
          
          return {
            file: file,
            fileName: file.name,
            ...result
          };
        })
      );
      
      setAnalysisResults(prev => [...prev, ...analyses]);
      
      // Aggregate analysis for form auto-fill
      const aggregatedAnalysis = aggregateAnalyses(analyses);
      onAnalysisComplete(aggregatedAnalysis);
      
    } catch (error) {
      console.error('Image Analysis Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const aggregateAnalyses = (analyses) => {
    const emergencyTypes = analyses.map(a => a.detectedType).filter(Boolean);
    const damages = analyses.map(a => a.damageLevel).filter(Boolean);
    const peopleCount = analyses.reduce((sum, a) => sum + (a.peopleDetected || 0), 0);
    const hazards = analyses.flatMap(a => a.hazards || []);
    
    return {
      emergencyType: mostFrequent(emergencyTypes) || 'unknown',
      averageDamageLevel: damages.length ? damages.reduce((a, b) => a + b, 0) / damages.length : 0,
      totalPeopleDetected: peopleCount,
      identifiedHazards: [...new Set(hazards)],
      suggestedPriority: calculatePriority(damages, hazards, peopleCount),
      aiConfidence: analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length
    };
  };

  const mostFrequent = (array) => {
    return array.sort((a,b) =>
      array.filter(v => v === a).length - array.filter(v => v === b).length
    ).pop();
  };

  const calculatePriority = (damages, hazards, people) => {
    const avgDamage = damages.length ? damages.reduce((a, b) => a + b, 0) / damages.length : 0;
    const hasHighRiskHazards = hazards.some(h => ['fire', 'flood', 'collapse', 'gas_leak'].includes(h));
    
    if (avgDamage > 8 || hasHighRiskHazards || people > 10) return 'critical';
    if (avgDamage > 6 || people > 5) return 'high';
    if (avgDamage > 4 || people > 0) return 'medium';
    return 'low';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center gap-2 mb-4">
        <Eye className={`text-green-600 ${isAnalyzing ? 'animate-pulse' : ''}`} size={20} />
        <h3 className="font-bold text-green-900">AI Image Analysis</h3>
        {isAnalyzing && <Zap className="text-yellow-500 animate-bounce" size={16} />}
      </div>

      {/* Image Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
        }`}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Camera className="text-green-600" size={24} />
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Upload Emergency Photos</h4>
            <p className="text-sm text-gray-600 mt-1">
              AI will analyze damage, identify hazards, and count people
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
              <Upload size={16} className="inline mr-2" />
              Choose Files
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
            <button
              onClick={() => {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                  // Implement camera capture
                  console.log('Camera capture functionality');
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Camera size={16} className="inline mr-2" />
              Take Photo
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
            <div>
              <h4 className="font-medium text-yellow-800">AI Processing Images...</h4>
              <p className="text-sm text-yellow-700">
                Detecting damage levels, identifying people, analyzing hazards
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="font-bold text-gray-800">AI Analysis Results</h4>
          
          {analysisResults.map((result, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <img
                  src={URL.createObjectURL(result.file)}
                  alt={result.fileName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800 mb-2">{result.fileName}</h5>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p><strong>Emergency Type:</strong> {result.detectedType || 'Unknown'}</p>
                      <p><strong>Damage Level:</strong> {result.damageLevel || 0}/10</p>
                      <p><strong>People Detected:</strong> {result.peopleDetected || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p><strong>AI Confidence:</strong> {Math.round((result.confidence || 0) * 100)}%</p>
                      <p><strong>Hazards:</strong> {result.hazards?.join(', ') || 'None detected'}</p>
                      <p><strong>Urgency:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          result.urgencyScore > 0.8 ? 'bg-red-100 text-red-800' :
                          result.urgencyScore > 0.6 ? 'bg-orange-100 text-orange-800' :
                          result.urgencyScore > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {result.urgencyScore > 0.8 ? 'Critical' :
                           result.urgencyScore > 0.6 ? 'High' :
                           result.urgencyScore > 0.4 ? 'Medium' : 'Low'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {result.keyFindings && result.keyFindings.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <h6 className="font-medium text-blue-800 mb-1">AI Findings:</h6>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {result.keyFindings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-blue-600">•</span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Aggregated Analysis Summary */}
          {analysisResults.length > 1 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <h5 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="text-green-600" size={16} />
                Combined AI Assessment
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Emergency Type</p>
                  <p className="text-green-800 capitalize">
                    {aggregateAnalyses(analysisResults).emergencyType}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Total People</p>
                  <p className="text-green-800">
                    {aggregateAnalyses(analysisResults).totalPeopleDetected}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Suggested Priority</p>
                  <p className="text-green-800 capitalize">
                    {aggregateAnalyses(analysisResults).suggestedPriority}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">AI Confidence</p>
                  <p className="text-green-800">
                    {Math.round(aggregateAnalyses(analysisResults).aiConfidence * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIImageAnalyzer;
