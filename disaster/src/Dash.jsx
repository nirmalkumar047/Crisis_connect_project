// frontend/src/components/Dashboard/Dash.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  AlertTriangle, 
  Users, 
  Package, 
  Truck, 
  Heart, 
  MapPin, 
  Clock, 
  TrendingUp,
  Filter,
  RefreshCw,
  Phone,
  MessageSquare,
  Plus,
  Camera,
  Mic,
  Send,
  Bell,
  Shield,
  Activity,
  Navigation,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  User,
  MessageCircle,
  Download,
  FileText,
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  UserCheck,
  UserX,
  Settings,
  Edit3,
  Brain
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Import AI Components
import AIEmergencyClassifier from './AI/AIEmergencyClassifier';
import AIChatbot from './AI/AIChatbot';
import AIVolunteerMatcher from './AI/AIVolunteerMatcher';
import PredictiveAnalytics from './AI/PredictiveAnalytics';
import AIImageAnalyzer from './AI/AIImageAnalyzer';

// Enhanced initial data
const initialRequests = [
  { 
    id: 1, 
    lat: 28.6139, 
    lng: 77.2090, 
    type: 'food', 
    priority: 'high', 
    victims: 45, 
    timestamp: '2 mins ago', 
    status: 'pending', 
    area: 'Central Delhi',
    description: 'Urgent need for food supplies for flood-affected families',
    contact: '+91-9876543210',
    reportedBy: 'Local Volunteer',
    images: ['flood_damage.jpg'],
    estimatedResponse: '15 mins',
    assignedVolunteer: null,
    assignedVolunteerId: null,
    createdAt: new Date().toISOString()
  },
  { 
    id: 2, 
    lat: 28.5355, 
    lng: 77.3910, 
    type: 'medical', 
    priority: 'critical', 
    victims: 12, 
    timestamp: '5 mins ago', 
    status: 'in-progress', 
    area: 'Noida',
    description: 'Medical emergency - injured people need immediate attention',
    contact: '+91-9876543211',
    reportedBy: 'Emergency Responder',
    images: ['medical_emergency.jpg'],
    estimatedResponse: '5 mins',
    assignedVolunteer: 'Team Alpha',
    assignedVolunteerId: 1,
    createdAt: new Date().toISOString()
  },
  { 
    id: 3, 
    lat: 28.4595, 
    lng: 77.0266, 
    type: 'water', 
    priority: 'medium', 
    victims: 30, 
    timestamp: '8 mins ago', 
    status: 'pending', 
    area: 'Gurgaon',
    description: 'Clean drinking water shortage in residential area',
    contact: '+91-9876543212',
    reportedBy: 'Resident',
    images: [],
    estimatedResponse: '30 mins',
    assignedVolunteer: null,
    assignedVolunteerId: null,
    createdAt: new Date().toISOString()
  },
];

const initialVolunteers = [
  { 
    id: 1, 
    lat: 28.6129, 
    lng: 77.2295, 
    name: 'Team Alpha', 
    skills: ['medical', 'rescue'], 
    status: 'deployed',
    contact: '+91-9000000001',
    rating: 4.8,
    completedMissions: 23,
    currentAssignment: 2
  },
  { 
    id: 2, 
    lat: 28.5505, 
    lng: 77.2679, 
    name: 'Team Beta', 
    skills: ['food', 'water'], 
    status: 'available',
    contact: '+91-9000000002',
    rating: 4.6,
    completedMissions: 18,
    currentAssignment: null
  },
  { 
    id: 3, 
    lat: 28.4817, 
    lng: 77.0818, 
    name: 'Team Gamma', 
    skills: ['shelter', 'transport'], 
    status: 'available',
    contact: '+91-9000000003',
    rating: 4.9,
    completedMissions: 31,
    currentAssignment: null
  },
];

const resources = [
  { type: 'Food Packets', available: 2450, deployed: 1200, location: 'Warehouse A', lastUpdated: '5 mins ago' },
  { type: 'Water Bottles', available: 5000, deployed: 2800, location: 'Warehouse B', lastUpdated: '3 mins ago' },
  { type: 'Medical Kits', available: 180, deployed: 120, location: 'Medical Center', lastUpdated: '1 min ago' },
  { type: 'Blankets', available: 800, deployed: 450, location: 'Relief Center', lastUpdated: '7 mins ago' },
  { type: 'Emergency Shelters', available: 25, deployed: 12, location: 'Command Center', lastUpdated: '10 mins ago' },
];

const weatherLocations = [
  { name: 'Central Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Noida', lat: 28.5355, lng: 77.3910 },
  { name: 'Gurgaon', lat: 28.4595, lng: 77.0266 },
  { name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
  { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 }
];

// AI API Service Functions
const classifyEmergency = async (data) => {
  try {
    const response = await fetch('http://localhost:8000/api/classify-emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('AI Classification Error:', error);
    // Fallback mock response
    return {
      emergencyType: data.type || 'unknown',
      suggestedPriority: data.priority || 'medium',
      confidence: 0.75,
      keyInsights: ['AI service temporarily unavailable - using fallback analysis']
    };
  }
};

// Main Dashboard Component
const Dash = () => {
  // Core States
  const [requests, setRequests] = useState(initialRequests);
  const [volunteersState, setVolunteersState] = useState(initialVolunteers);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshTime, setRefreshTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [realTimeData, setRealTimeData] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // AI-Enhanced States
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [aiInsights, setAiInsights] = useState([]);

  // Form State
  const [newRequest, setNewRequest] = useState({
    type: 'food',
    priority: 'medium',
    victims: 1,
    area: '',
    description: '',
    contact: '',
    reportedBy: '',
    lat: 28.6139,
    lng: 77.2090,
    images: []
  });

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageResponseTime: '12 mins',
    completionRate: '87%',
    activeVolunteers: initialVolunteers.filter(v => v.status === 'available').length,
    totalResourcesDeployed: resources.reduce((sum, r) => sum + r.deployed, 0)
  });

  // Weather system functions
  const fetchWeatherData = async (location) => {
    try {
      // Mock weather data for demo
      return {
        location: location.name,
        temperature: Math.round(20 + Math.random() * 15),
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 20),
        precipitation: Math.random() * 5,
        weatherCode: Math.floor(Math.random() * 4),
        forecast: null
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return null;
    }
  };

  const getWeatherIcon = (code) => {
    if (code <= 1) return <Sun className="text-yellow-500" size={16} />;
    if (code <= 3) return <Cloud className="text-gray-500" size={16} />;
    if (code <= 67) return <CloudRain className="text-blue-500" size={16} />;
    if (code <= 77) return <CloudSnow className="text-blue-300" size={16} />;
    return <Cloud className="text-gray-500" size={16} />;
  };

  // Initialize weather data
  useEffect(() => {
    const initWeatherData = async () => {
      const initialWeatherData = {};
      for (const location of weatherLocations) {
        initialWeatherData[location.name] = await fetchWeatherData(location);
      }
      setWeatherData(initialWeatherData);
    };
    
    initWeatherData();
  }, []);

  // AI-Enhanced Emergency Request Submission
  const handleAIEnhancedSubmission = async (e) => {
    e.preventDefault();
    
    try {
      // Get AI classification
      const aiResult = await classifyEmergency(newRequest);
      
      // Merge AI suggestions with form data
      const enhancedRequest = {
        ...newRequest,
        ...aiResult,
        id: Date.now(),
        timestamp: 'Just now',
        status: 'pending',
        estimatedResponse: calculateEstimatedResponse(aiResult.suggestedPriority || newRequest.priority),
        assignedVolunteer: null,
        assignedVolunteerId: null,
        createdAt: new Date().toISOString()
      };
      
      setRequests(prev => [enhancedRequest, ...prev]);
      
      // Show AI analysis to user
      setNotifications(prev => [{
        id: Date.now(),
        type: 'ai-success',
        message: `🤖 AI analyzed your request with ${Math.round((aiResult.confidence || 0.75) * 100)}% confidence. Priority: ${aiResult.suggestedPriority || newRequest.priority}`,
        timestamp: new Date().toLocaleTimeString(),
        read: false
      }, ...prev.slice(0, 4)]);

      // Auto-assign if critical priority
      if ((aiResult.suggestedPriority || newRequest.priority) === 'critical') {
        const availableVolunteer = volunteersState.find(v => v.status === 'available');
        if (availableVolunteer) {
          setTimeout(() => {
            assignVolunteer(enhancedRequest.id, availableVolunteer.id);
          }, 2000);
        }
      }

      // Reset form
      setNewRequest({
        type: 'food',
        priority: 'medium',
        victims: 1,
        area: '',
        description: '',
        contact: '',
        reportedBy: '',
        lat: 28.6139,
        lng: 77.2090,
        images: []
      });
      
      setShowRequestForm(false);
      
    } catch (error) {
      console.error('AI Enhanced Submission Error:', error);
      // Fallback to regular submission
      handleRegularSubmission(e);
    }
  };

  // Regular submission fallback
  const handleRegularSubmission = (e) => {
    e.preventDefault();
    
    const regularRequest = {
      ...newRequest,
      id: Date.now(),
      timestamp: 'Just now',
      status: 'pending',
      estimatedResponse: calculateEstimatedResponse(newRequest.priority),
      assignedVolunteer: null,
      assignedVolunteerId: null,
      createdAt: new Date().toISOString()
    };
    
    setRequests(prev => [regularRequest, ...prev]);
    setShowRequestForm(false);
  };

  const calculateEstimatedResponse = (priority) => {
    switch (priority) {
      case 'critical': return '5-10 mins';
      case 'high': return '10-20 mins';
      case 'medium': return '20-45 mins';
      case 'low': return '45-90 mins';
      default: return '30 mins';
    }
  };

  // Enhanced volunteer assignment with AI
  const assignVolunteer = (requestId, volunteerId) => {
    const volunteer = volunteersState.find(v => v.id === volunteerId);
    const request = requests.find(r => r.id === requestId);
    
    if (!volunteer || !request) return;

    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            assignedVolunteer: volunteer.name, 
            assignedVolunteerId: volunteerId,
            status: 'in-progress' 
          }
        : req
    ));

    setVolunteersState(prev => prev.map(vol => 
      vol.id === volunteerId 
        ? { 
            ...vol, 
            status: 'deployed', 
            currentAssignment: requestId 
          }
        : vol
    ));
    
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `🚀 ${volunteer.name} assigned to ${request.type} emergency in ${request.area}`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }, ...prev.slice(0, 4)]);
  };

  // Utility functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#16a34a';
      case 'in-progress': return '#ca8a04';
      case 'pending': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const filteredRequests = requests.filter(req => 
    selectedFilter === 'all' || req.type === selectedFilter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="relative">
                    <AlertTriangle className="text-red-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  CrisisConnect AI
                </h1>
                <p className="text-gray-600 mt-1">AI-Powered Smart Relief Coordination Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* AI Status Indicator */}
              <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="text-purple-600" size={16} />
                  <span className="font-medium">AI Assistant Active</span>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Live Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 relative transition-all duration-200"
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {showNotificationPanel && notifications.length > 0 && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border max-h-80 overflow-y-auto z-50">
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-bold text-gray-900">Live Notifications</h3>
                    </div>
                    {notifications.slice(0, 10).map(notification => (
                      <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'ai-success' ? 'bg-purple-500' :
                            notification.type === 'weather-alert' ? 'bg-orange-500' :
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'urgent' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Emergency Button */}
              <button 
                onClick={() => setShowRequestForm(true)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <Plus size={16} />
                Report Emergency
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Enhanced Emergency Request Form */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-purple-50">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="text-purple-500" />
                  AI-Enhanced Emergency Report
                </h2>
                <button 
                  onClick={() => setShowRequestForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <p className="text-gray-600 mt-2">AI will analyze your emergency details and optimize the response</p>
            </div>
            
            <form onSubmit={handleAIEnhancedSubmission} className="p-6 space-y-6">
              {/* Basic Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Type *</label>
                  <select 
                    value={newRequest.type} 
                    onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  >
                    <option value="food">🍞 Food & Supplies</option>
                    <option value="medical">🏥 Medical Emergency</option>
                    <option value="water">💧 Water & Sanitation</option>
                    <option value="shelter">🏠 Shelter & Housing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level *</label>
                  <select 
                    value={newRequest.priority} 
                    onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  >
                    <option value="low">🟢 Low - Can wait</option>
                    <option value="medium">🟡 Medium - Important</option>
                    <option value="high">🟠 High - Urgent</option>
                    <option value="critical">🔴 Critical - Life threatening</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Description *</label>
                <textarea 
                  value={newRequest.description} 
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  placeholder="Describe the emergency situation in detail. AI will analyze this to optimize response..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {/* AI Emergency Classifier */}
              <AIEmergencyClassifier
                description={newRequest.description}
                images={newRequest.images}
                onClassification={(aiData) => {
                  setNewRequest(prev => ({ ...prev, ...aiData }));
                  setAiAnalysis(aiData);
                }}
              />
              
              {/* AI Image Analyzer */}
              <AIImageAnalyzer
                onAnalysisComplete={(analysis) => {
                  setNewRequest(prev => ({
                    ...prev,
                    type: analysis.emergencyType || prev.type,
                    priority: analysis.suggestedPriority || prev.priority,
                    victims: analysis.totalPeopleDetected || prev.victims
                  }));
                }}
              />

              {/* Additional Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">People Affected *</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newRequest.victims} 
                    onChange={(e) => setNewRequest({...newRequest, victims: parseInt(e.target.value) || 1})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input 
                    type="text" 
                    value={newRequest.area} 
                    onChange={(e) => setNewRequest({...newRequest, area: e.target.value})}
                    placeholder="Emergency location"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <p>🤖 AI will analyze and optimize your emergency request</p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-red-600 text-white px-8 py-2 rounded-lg hover:from-purple-700 hover:to-red-700 font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
                  >
                    <Brain size={16} />
                    Submit with AI Analysis
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-red-600">Active Emergencies</p>
                <p className="text-3xl font-bold text-gray-900">{requests.filter(r => r.status === 'pending').length}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <TrendingUp size={12} />
              Avg response: {performanceMetrics.averageResponseTime}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-blue-600">People Helped</p>
                <p className="text-3xl font-bold text-gray-900">{requests.reduce((sum, r) => sum + r.victims, 0)}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
            <p className="text-xs text-blue-500 mt-2">Across {requests.length} locations</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-green-600">Active Volunteers</p>
                <p className="text-3xl font-bold text-gray-900">{volunteersState.filter(v => v.status === 'available').length}</p>
              </div>
              <Heart className="h-12 w-12 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-2">{volunteersState.filter(v => v.status === 'deployed').length} deployed</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-purple-600">AI Insights</p>
                <p className="text-3xl font-bold text-gray-900">{aiInsights.length}</p>
              </div>
              <Brain className="h-12 w-12 text-purple-500" />
            </div>
            <p className="text-xs text-purple-500 mt-2">Active predictions</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100 relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-orange-600">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">{performanceMetrics.completionRate}</p>
              </div>
              <Activity className="h-12 w-12 text-orange-500" />
            </div>
            <p className="text-xs text-orange-500 mt-2">AI-optimized</p>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {['overview', 'analytics', 'volunteers', 'weather', 'ai-insights'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'ai-insights' ? (
                  <span className="flex items-center gap-2">
                    <Brain size={16} />
                    AI Insights
                  </span>
                ) : (
                  tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-500" />
                Emergency Requests Overview
              </h2>
              <div className="space-y-4">
                {filteredRequests.slice(0, 5).map(request => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold capitalize">{request.type}</span>
                          <span 
                            className="px-2 py-1 rounded-full text-white text-xs font-medium"
                            style={{ backgroundColor: getPriorityColor(request.priority) }}
                          >
                            {request.priority}
                          </span>
                          <span 
                            className="px-2 py-1 rounded-full text-white text-xs font-medium"
                            style={{ backgroundColor: getStatusColor(request.status) }}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-1">{request.area} • {request.victims} people affected</p>
                        <p className="text-sm text-gray-600">{request.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500">{request.timestamp}</p>
                        {request.assignedVolunteer && (
                          <p className="text-xs text-green-600 font-medium">Assigned: {request.assignedVolunteer}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowRequestForm(true)}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Brain size={16} />
                    AI Emergency Report
                  </button>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
                    <FileText size={16} />
                    Generate AI Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <div className="space-y-6">
            <PredictiveAnalytics
              weatherData={weatherData}
              historicalData={[]}
              currentRequests={requests}
            />
            
            <AIVolunteerMatcher
              request={selectedRequest}
              volunteers={volunteersState}
              onAssignment={(data) => assignVolunteer(data.volunteerId, data.requestId)}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Analytics Dashboard</h3>
            <p className="text-gray-600">Analytics charts and data visualization would go here</p>
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Volunteer Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteersState.map(volunteer => (
                <div key={volunteer.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold">{volunteer.name}</h4>
                  <p className="text-sm text-gray-600">Skills: {volunteer.skills.join(', ')}</p>
                  <p className="text-sm">Status: {volunteer.status}</p>
                  <p className="text-sm">Rating: {volunteer.rating}/5</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Weather Monitoring</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(weatherData).map(([location, data]) => (
                <div key={location} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold">{location}</h4>
                  {data && (
                    <>
                      <p>Temperature: {data.temperature}°C</p>
                      <p>Humidity: {data.humidity}%</p>
                      <p>Wind: {data.windSpeed} km/h</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Chatbot - Always Available */}
      {showAIAssistant && (
        <AIChatbot
          onEmergencyDetected={(data) => {
            if (data.openForm) {
              setShowRequestForm(true);
            }
            if (data.extractedData) {
              setNewRequest(prev => ({ ...prev, ...data.extractedData }));
            }
          }}
        />
      )}
    </div>
  );
};

export default Dash;
