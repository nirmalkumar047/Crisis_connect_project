// frontend/src/components/AI/PredictiveAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Brain, MapPin, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PredictiveAnalytics = ({ weatherData, historicalData, currentRequests }) => {
  const [predictions, setPredictions] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('24h');

  const fetchAIPredictions = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/disaster-predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weatherData: weatherData,
          historicalIncidents: historicalData,
          currentEmergencies: currentRequests,
          timeframe: selectedTimeFrame,
          analysisDepth: 'comprehensive'
        })
      });
      
      const predictionData = await response.json();
      
      setPredictions({
        nextIncidents: predictionData.predictedIncidents,
        riskHotspots: predictionData.riskAreas,
        resourceDemand: predictionData.resourceForeccast,
        weatherImpact: predictionData.weatherCorrelations,
        confidence: predictionData.modelConfidence,
        recommendations: predictionData.actionableInsights
      });
      
      setRiskAnalysis(predictionData.riskAnalysis);
      
    } catch (error) {
      console.error('Prediction Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (weatherData && Object.keys(weatherData).length > 0) {
      fetchAIPredictions();
    }
  }, [weatherData, selectedTimeFrame]);

  const getRiskColor = (risk) => {
    if (risk >= 0.8) return 'text-red-600 bg-red-100';
    if (risk >= 0.6) return 'text-orange-600 bg-orange-100';
    if (risk >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className={`text-indigo-600 ${isLoading ? 'animate-pulse' : ''}`} size={20} />
          <h3 className="font-bold text-indigo-900">AI Predictive Analytics</h3>
        </div>
        <select
          value={selectedTimeFrame}
          onChange={(e) => setSelectedTimeFrame(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="24h">Next 24 Hours</option>
          <option value="7d">Next 7 Days</option>
          <option value="30d">Next 30 Days</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-indigo-700 font-medium">AI analyzing patterns and predicting future incidents...</p>
            <p className="text-xs text-gray-500 mt-1">Processing weather data, historical trends, and risk factors</p>
          </div>
        </div>
      )}

      {!isLoading && predictions && (
        <div className="space-y-6">
          {/* Risk Hotspots */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="text-red-500" size={16} />
              High-Risk Areas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.riskHotspots.slice(0, 4).map((hotspot, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getRiskColor(hotspot.riskScore)} transition-all hover:shadow-md`}>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-bold">{hotspot.location}</h5>
                    <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50 font-bold">
                      {Math.round(hotspot.riskScore * 100)}% Risk
                    </span>
                  </div>
                  <p className="text-sm mb-2">{hotspot.primaryThreat}</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Peak Risk:</strong> {hotspot.peakTime}</p>
                    <p><strong>Factors:</strong> {hotspot.riskFactors.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Predictions */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={16} />
              Predicted Incidents ({selectedTimeFrame})
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={predictions.nextIncidents}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'predicted' ? 'Predicted Count' : name]}
                    labelFormatter={(label) => `Emergency Type: ${label}`}
                  />
                  <Bar dataKey="predicted" fill="#6366f1" />
                  <Bar dataKey="confidence" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Demand Forecast */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3">AI Resource Demand Forecast</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(predictions.resourceDemand).map(([resource, demand]) => (
                <div key={resource} className="bg-gray-50 p-3 rounded-lg border">
                  <h5 className="font-bold text-sm text-gray-700 capitalize">{resource}</h5>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-indigo-600">{demand.predicted}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      demand.trend === 'up' ? 'bg-red-100 text-red-600' :
                      demand.trend === 'down' ? 'bg-green-100 text-green-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {demand.trend === 'up' ? '↗️' : demand.trend === 'down' ? '↘️' : '→'} {demand.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Current: {demand.current}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={16} />
              AI Recommendations
            </h4>
            <div className="space-y-3">
              {predictions.recommendations.map((rec, index) => (
                <div key={index} className={`border-l-4 p-4 rounded-r-lg ${
                  rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                  rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-800">{rec.title}</h5>
                      <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span><strong>Impact:</strong> {rec.impact}</span>
                        <span><strong>Confidence:</strong> {Math.round(rec.confidence * 100)}%</span>
                        <span><strong>Timeline:</strong> {rec.timeframe}</span>
                      </div>
                    </div>
                    <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      rec.priority === 'high' ? 'bg-red-600 hover:bg-red-700 text-white' :
                      rec.priority === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                      'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                      Implement
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Confidence */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-indigo-800">AI Model Confidence</h5>
                <p className="text-sm text-indigo-700">Overall prediction reliability</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">
                  {Math.round(predictions.confidence * 100)}%
                </div>
                <div className="w-20 bg-indigo-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${predictions.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;
