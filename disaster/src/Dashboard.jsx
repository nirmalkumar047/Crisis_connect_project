// Dashboard.jsx (updated with AI features)
// Replace your existing Dashboard component file with this code.
// Note: This keeps all existing functions and UI, and adds AI-style functions.
// Dependencies: react, react-leaflet, recharts, lucide-react, leaflet css (same as before)

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
  Edit3
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import Firebasedash from './Firebasedash';

// -----------------------------
// initial data (kept from your file)
// -----------------------------
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
    createdAt: new Date().toISOString(),
    riskScore: null
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
    createdAt: new Date().toISOString(),
    riskScore: null
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
    createdAt: new Date().toISOString(),
    riskScore: null
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
    currentAssignment: 2,
    fatigueScore: 0.2 // 0 (fresh) - 1 (exhausted)
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
    currentAssignment: null,
    fatigueScore: 0.35
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
    currentAssignment: null,
    fatigueScore: 0.15
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

// -----------------------------
// Helper: distance (km) between lat/lng pairs
// -----------------------------
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// -----------------------------
// Dashboard component (main)
// -----------------------------
const Dashboard = () => {
  // core states (kept from your file)
  const [requests, setRequests] = useState(initialRequests.map(r => ({...r, riskScore: null})));
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
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

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

  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageResponseTime: '12 mins',
    completionRate: '87%',
    activeVolunteers: initialVolunteers.filter(v => v.status === 'available').length,
    totalResourcesDeployed: resources.reduce((sum, r) => sum + r.deployed, 0)
  });

  // Forecasts & AI analytics UI data
  const [resourceForecast, setResourceForecast] = useState([]);
  const [incomingRequestForecast, setIncomingRequestForecast] = useState([]);

  // -----------------------------
  // Weather fetch (kept as-is; safe fallback)
  // -----------------------------
  const fetchWeatherData = async (location) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata&alerts=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          location: location.name,
          temperature: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m || 0),
          precipitation: Math.round(data.current.precipitation || 0),
          weatherCode: data.current.weather_code,
          forecast: data.daily
        };
      }
    } catch (error) {
      console.error('Weather API error:', error);
      // synthetic safe fallback
      return {
        location: location.name,
        temperature: Math.round(20 + Math.random() * 15),
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 20),
        precipitation: Math.round(Math.random() * 5),
        weatherCode: Math.floor(Math.random() * 4),
        forecast: null
      };
    }
  };

  const getWeatherIcon = (code) => {
    if (code <= 1) return <Sun className="text-yellow-500" size={16} />;
    if (code <= 3) return <Cloud className="text-gray-500" size={16} />;
    if (code <= 67) return <CloudRain className="text-blue-500" size={16} />;
    if (code <= 77) return <CloudSnow className="text-blue-300" size={16} />;
    return <Cloud className="text-gray-500" size={16} />;
  };

  const checkWeatherAlerts = (weatherData) => {
    const alerts = [];
    
    Object.values(weatherData).forEach(data => {
      if (!data) return;
      if (data.precipitation > 10) {
        alerts.push({
          id: Date.now() + Math.random(),
          type: 'severe-weather',
          severity: 'high',
          location: data.location,
          message: `Heavy rainfall alert: ${data.precipitation}mm precipitation detected in ${data.location}`,
          timestamp: new Date().toLocaleTimeString(),
          weatherType: 'rain'
        });
      }
      
      if (data.windSpeed > 40) {
        alerts.push({
          id: Date.now() + Math.random(),
          type: 'severe-weather',
          severity: 'critical',
          location: data.location,
          message: `High wind speed alert: ${data.windSpeed} km/h winds in ${data.location}`,
          timestamp: new Date().toLocaleTimeString(),
          weatherType: 'wind'
        });
      }
      
      if (data.temperature > 40 || data.temperature < 5) {
        alerts.push({
          id: Date.now() + Math.random(),
          type: 'severe-weather',
          severity: data.temperature > 40 ? 'high' : 'medium',
          location: data.location,
          message: `Extreme temperature alert: ${data.temperature}°C in ${data.location}`,
          timestamp: new Date().toLocaleTimeString(),
          weatherType: 'temperature'
        });
      }
    });
    
    return alerts;
  };

  const sendWeatherAlert = (alert) => {
    const affectedRequests = requests.filter(req => req.area.includes(alert.location));
    
    const alertNotification = {
      id: Date.now(),
      type: 'weather-alert',
      message: `⚠️ WEATHER ALERT: ${alert.message}. Residents and relief teams in the area have been notified.`,
      timestamp: new Date().toLocaleTimeString(),
      read: false,
      severity: alert.severity,
      location: alert.location,
      affectedPeople: affectedRequests.reduce((sum, req) => sum + req.victims, 0)
    };

    setNotifications(prev => [alertNotification, ...prev.slice(0, 9)]);
  };

  // -----------------------------
  // AI Utilities (NEW) - deterministic heuristics
  // -----------------------------

  // priorityWeight: map priority -> numeric multiplier
  const priorityWeight = (priority) => {
    switch (priority) {
      case 'critical': return 3.0;
      case 'high': return 2.0;
      case 'medium': return 1.2;
      case 'low': return 0.8;
      default: return 1.0;
    }
  };

  // weatherSeverityFactor: map weather conditions at location -> factor
  // input: weather object (or null)
  const weatherSeverityFactor = (weatherObj) => {
    if (!weatherObj) return 1.0;
    let factor = 1.0;
    if (weatherObj.precipitation > 20) factor += 1.0;
    else if (weatherObj.precipitation > 5) factor += 0.5;
    if (weatherObj.windSpeed > 40) factor += 0.8;
    if (weatherObj.temperature > 40 || weatherObj.temperature < 5) factor += 0.4;
    return factor;
  };

  // resourcesFactor: if resources of that type are low, increase risk
  const resourcesFactor = (requestType) => {
    // simple mapping: food->Food Packets, water->Water Bottles, medical->Medical Kits, shelter->Emergency Shelters
    const map = {
      'food': 'Food Packets',
      'water': 'Water Bottles',
      'medical': 'Medical Kits',
      'shelter': 'Emergency Shelters'
    };
    const entry = resources.find(r => r.type === map[requestType]);
    if (!entry) return 1.0;
    const total = entry.available + entry.deployed;
    if (total === 0) return 3.0;
    const pctAvailable = entry.available / total;
    if (pctAvailable < 0.1) return 2.0;
    if (pctAvailable < 0.3) return 1.5;
    return 1.0;
  };

  // calculateRiskScore: victims * priority weight * weather severity * resource factor -> normalized 0-100
  const calculateRiskScore = (request) => {
    const victims = Math.max(1, request.victims || 1);
    const pWeight = priorityWeight(request.priority);
    // find weather data for area by simple name match
    const weather = Object.values(weatherData).find(w => request.area && w && request.area.includes(w.location));
    const wFactor = weatherSeverityFactor(weather);
    const rFactor = resourcesFactor(request.type);
    // base: victims * pWeight * wFactor * rFactor
    let raw = victims * pWeight * wFactor * rFactor;
    // scale raw to 0..100: use logarithm scaling for diminishing returns
    const score = Math.min(100, Math.round((Math.log10(raw + 1) / Math.log10(1000)) * 100 * 1.6 + (raw > 50 ? 20 : 0)));
    // fallback: simple clamp
    return Math.max(0, Math.min(100, isNaN(score) ? Math.min(100, victims * pWeight) : score));
  };

  // analyzeTextPriority: rudimentary NLP to check description for keywords and bump priority
  const analyzeTextPriority = (text) => {
    if (!text || typeof text !== 'string') return null;
    const t = text.toLowerCase();
    const criticalKeywords = ['trapped', 'unconscious', 'severe bleeding', 'heart attack', 'collapse', 'drowning', 'fire', 'electrocute', 'crushed'];
    const highKeywords = ['injured', 'many people', 'multiple', 'urgent', 'no water', 'no food', 'no shelter', 'broken', 'fracture'];
    for (const kw of criticalKeywords) {
      if (t.includes(kw)) return 'critical';
    }
    for (const kw of highKeywords) {
      if (t.includes(kw)) return 'high';
    }
    return null; // no change
  };

  // simulateImageAnalysis: placeholder CV that inspects filenames for severity hints
  const simulateImageAnalysis = (images = []) => {
    // In production this would call a CV model — here we heuristic-check filenames
    const results = [];
    for (const img of images) {
      const name = ('' + img).toLowerCase();
      if (name.includes('flood') || name.includes('water') || name.includes('submerged')) results.push('flood');
      if (name.includes('fire') || name.includes('smoke') || name.includes('burn')) results.push('fire');
      if (name.includes('blood') || name.includes('injury') || name.includes('wound')) results.push('medical');
      if (name.includes('collapsed') || name.includes('debris') || name.includes('building')) results.push('structural');
    }
    // return the most frequent label or empty
    const freq = results.reduce((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc; }, {});
    const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]);
    return sorted.length ? sorted[0][0] : null;
  };

  // getOptimalVolunteer: rank volunteers based on distance, skill match, rating, fatigue
  const getOptimalVolunteer = (request) => {
    // prepare candidates: only available volunteers
    const candidates = volunteersState.filter(v => v.status === 'available');
    if (!candidates.length) return null;

    const scores = candidates.map(v => {
      // distance in km
      const dist = haversineKm(v.lat, v.lng, request.lat || request.lat, request.lng || request.lng) || 1;
      const distScore = Math.max(0.1, 1 / (dist + 0.1)); // closer -> bigger
      // skill match
      const skillMatch = v.skills.includes(request.type) ? 1.2 : 1.0;
      // rating normalization (0-5)
      const ratingScore = (v.rating || 3) / 5;
      // fatigue penalty (0..1): lower fatigue better
      const fatiguePenalty = 1 - (v.fatigueScore || 0); // 1 when fresh, 0 when exhausted
      // overall: weighted product
      const rawScore = distScore * skillMatch * ratingScore * fatiguePenalty * (1 + (v.completedMissions / 100));
      return { volunteer: v, rawScore, dist };
    });

    // pick max
    scores.sort((a,b) => b.rawScore - a.rawScore);
    return scores[0] ? scores[0].volunteer : null;
  };

  // forecastResources: simple deterministic forecast to estimate days to depletion given current deployed rate
  const forecastResources = () => {
    // idea: assume deployed increases at a rate proportional to requests/day observed in realTimeData
    const lastN = realTimeData.slice(-10);
    // average new requests per tick (tick ~20s in your loop)
    let avgRequestsPerTick = lastN.length ? (lastN.reduce((s, d) => s + d.requests, 0) / lastN.length) : 1;
    // convert tick to per-day estimate (20s tick -> 4320 ticks/day)
    const ticksPerDay = 24 * 60 * 60 / 20;
    const estRequestsPerDay = Math.max(1, avgRequestsPerTick * ticksPerDay);

    const forecast = resources.map(r => {
      // assume each request of that type consumes 1 unit on average (over-simplified)
      const dailyConsumption = Math.max(1, Math.round(estRequestsPerDay * 0.2)); // 20% of requests lead to resource consumption
      const total = r.available + r.deployed;
      const daysToDepletion = dailyConsumption === 0 ? Infinity : Math.round(r.available / dailyConsumption);
      return {
        type: r.type,
        available: r.available,
        deployed: r.deployed,
        dailyConsumption,
        daysToDepletion: isFinite(daysToDepletion) ? daysToDepletion : 'N/A'
      };
    });

    setResourceForecast(forecast);
    return forecast;
  };

  // forecastIncomingRequests: very simple projection using moving average
  const forecastIncomingRequests = () => {
    const last = realTimeData.slice(-20);
    if (!last.length) {
      const synthetic = Array.from({ length: 7 }, (_, i) => ({ day: `Day ${i+1}`, value: Math.floor(3 + Math.random() * 5) }));
      setIncomingRequestForecast(synthetic);
      return synthetic;
    }
    const avg = last.reduce((s, d) => s + d.requests, 0) / last.length;
    const next7 = Array.from({ length: 7 }, (_, i) => ({ day: `+${i+1}`, value: Math.round(avg * (1 + (i * 0.02))) }));
    setIncomingRequestForecast(next7);
    return next7;
  };

  // aiAutoAssign: main function exposed to UI to let AI pick a volunteer (if available)
  const aiAutoAssign = (requestId) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) {
      setNotifications(prev => [{ id: Date.now(), type: 'error', message: `Request ${requestId} not found`, timestamp: new Date().toLocaleTimeString(), read: false }, ...prev.slice(0,9)]);
      return;
    }
    const best = getOptimalVolunteer(req);
    if (!best) {
      setNotifications(prev => [{ id: Date.now(), type: 'info', message: `No available volunteers to assign for request ${requestId}`, timestamp: new Date().toLocaleTimeString(), read: false }, ...prev.slice(0,9)]);
      return;
    }
    assignVolunteer(requestId, best.id);
    setNotifications(prev => [{ id: Date.now(), type: 'success', message: `AI assigned ${best.name} to request ${requestId}`, timestamp: new Date().toLocaleTimeString(), read: false }, ...prev.slice(0,9)]);
  };

  // -----------------------------
  // Keep existing functions but integrate AI features where suitable
  // -----------------------------

  // handleSubmitRequest: updated to run NLP + image analysis + risk scoring before push
  const handleSubmitRequest = (e) => {
    e.preventDefault();
    
    // NLP priority check
    const nlpPriority = analyzeTextPriority(newRequest.description);
    const imageSeverity = simulateImageAnalysis(newRequest.images);
    const finalPriority = nlpPriority || (imageSeverity === 'medical' || imageSeverity === 'fire' ? 'critical' : newRequest.priority);

    const submittedRequest = {
      ...newRequest,
      id: Date.now(),
      timestamp: 'Just now',
      status: 'pending',
      priority: finalPriority,
      estimatedResponse: calculateEstimatedResponse(finalPriority),
      assignedVolunteer: null,
      assignedVolunteerId: null,
      createdAt: new Date().toISOString(),
      riskScore: null
    };

    // compute risk score using current weatherData & resources
    const risk = calculateRiskScore(submittedRequest);
    submittedRequest.riskScore = risk;

    // Add to requests
    setRequests(prev => [submittedRequest, ...prev]);

    // Success notification
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `✅ Emergency request #${submittedRequest.id} submitted successfully! Help is being dispatched.`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }, ...prev.slice(0, 4)]);

    // Auto-assign if critical priority (improved: ask AI to pick best)
    if (finalPriority === 'critical') {
      const availableVolunteer = getOptimalVolunteer(submittedRequest);
      if (availableVolunteer) {
        setTimeout(() => {
          assignVolunteer(submittedRequest.id, availableVolunteer.id);
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

  const assignVolunteer = (requestId, volunteerId) => {
    const volunteer = volunteersState.find(v => v.id === volunteerId);
    const request = requests.find(r => r.id === requestId);
    
    if (!volunteer || !request) return;

    // Update request
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

    // Update volunteer
    setVolunteersState(prev => prev.map(vol => 
      vol.id === volunteerId 
        ? { 
            ...vol, 
            status: 'deployed', 
            currentAssignment: requestId 
          }
        : vol
    ));
    
    // Notification
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `🚀 ${volunteer.name} assigned to ${request.type} emergency in ${request.area}`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }, ...prev.slice(0, 4)]);
  };

  const unassignVolunteer = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request || !request.assignedVolunteerId) return;

    // Update request
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            assignedVolunteer: null, 
            assignedVolunteerId: null,
            status: 'pending' 
          }
        : req
    ));

    // Update volunteer
    setVolunteersState(prev => prev.map(vol => 
      vol.currentAssignment === requestId 
        ? { 
            ...vol, 
            status: 'available', 
            currentAssignment: null 
          }
        : vol
    ));
    
    setNotifications(prev => [{
      id: Date.now(),
      type: 'info',
      message: `📍 Volunteer unassigned from request #${requestId}`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }, ...prev.slice(0, 4)]);
  };

  const markRequestComplete = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Update request
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'completed' } : req
    ));

    // Free up volunteer if assigned
    if (request.assignedVolunteerId) {
      setVolunteersState(prev => prev.map(vol => 
        vol.id === request.assignedVolunteerId
          ? { 
              ...vol, 
              status: 'available', 
              currentAssignment: null,
              completedMissions: vol.completedMissions + 1,
              fatigueScore: Math.min(1, (vol.fatigueScore || 0) + 0.05) // small fatigue increase
            }
          : vol
      ));
    }

    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `✅ Emergency #${requestId} completed successfully! ${request.victims} people helped.`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }, ...prev.slice(0, 4)]);
  };

  const handlePhoneCall = (contactNumber) => {
    if (contactNumber && contactNumber.startsWith('+91')) {
      window.open(`tel:${contactNumber}`, '_blank');
      
      setNotifications(prev => [{
        id: Date.now(),
        type: 'info',
        message: `📞 Calling ${contactNumber}...`,
        timestamp: new Date().toLocaleTimeString(),
        read: false
      }, ...prev.slice(0, 4)]);
    }
  };

  const handleMessage = (requestId, contactNumber) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const message = `CrisisConnect Alert: Help is on the way for your ${request.type} emergency. ETA: ${request.estimatedResponse}. Stay safe!`;
    
    console.log(`SMS to ${contactNumber}: ${message}`);
    
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `💬 SMS sent to ${contactNumber} for request #${requestId}`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }, ...prev.slice(0, 4)]);
  };

  const handleNavigation = (lat, lng, area) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const googleMapsUrl = `https://www.google.com/maps/dir/${position.coords.latitude},${position.coords.longitude}/${lat},${lng}`;
          window.open(googleMapsUrl, '_blank');
        },
        () => {
          const googleMapsUrl = `https://www.google.com/maps/search/${lat},${lng}`;
          window.open(googleMapsUrl, '_blank');
        }
      );
    } else {
      const googleMapsUrl = `https://www.google.com/maps/search/${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    }
    
    setNotifications(prev => [{
      id: Date.now(),
      type: 'info',
      message: `🗺️ Navigation started to ${area}`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }, ...prev.slice(0, 4)]);
  };

  const exportData = () => {
    const dataToExport = {
      requests: requests,
      volunteers: volunteersState,
      resources: resources,
      weatherData: weatherData,
      performanceMetrics: performanceMetrics,
      notifications: notifications,
      exportedAt: new Date().toISOString(),
      totalPeopleHelped: requests.reduce((sum, r) => sum + r.victims, 0),
      completedRequests: requests.filter(r => r.status === 'completed').length
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `crisisconnect-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: '💾 CrisisConnect data exported successfully!',
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }, ...prev.slice(0, 4)]);
  };

  const generateReport = () => {
    const report = {
      reportTitle: "CrisisConnect Emergency Response Report",
      generatedAt: new Date().toISOString(),
      summary: {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        inProgressRequests: requests.filter(r => r.status === 'in-progress').length,
        completedRequests: requests.filter(r => r.status === 'completed').length,
        totalVictimsAffected: requests.reduce((sum, r) => sum + r.victims, 0),
        averageResponseTime: performanceMetrics.averageResponseTime,
        completionRate: performanceMetrics.completionRate,
        activeVolunteers: volunteersState.filter(v => v.status === 'available').length,
        deployedVolunteers: volunteersState.filter(v => v.status === 'deployed').length
      },
      weatherStatus: Object.keys(weatherData).map(location => ({
        location,
        temperature: weatherData[location]?.temperature,
        conditions: weatherData[location]?.weatherCode,
        alerts: weatherAlerts.filter(alert => alert.location === location).length
      })),
      resourceStatus: resources.map(r => ({
        type: r.type,
        availabilityPercentage: Math.round((r.available / (r.available + r.deployed)) * 100),
        totalUnits: r.available + r.deployed
      })),
      topPerformers: volunteersState
        .slice()
        .sort((a, b) => b.completedMissions - a.completedMissions)
        .slice(0, 3)
        .map(v => ({
          name: v.name,
          missions: v.completedMissions,
          rating: v.rating
        }))
    };
    
    const reportStr = JSON.stringify(report, null, 2);
    const reportUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(reportStr);
    
    const reportFileDefaultName = `crisisconnect-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', reportUri);
    linkElement.setAttribute('download', reportFileDefaultName);
    linkElement.click();
    
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: '📊 Emergency response report generated and downloaded!',
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }, ...prev.slice(0, 4)]);
  };

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

  const chartData = [
    { name: 'Food', value: requests.filter(r => r.type === 'food').length, color: '#3b82f6' },
    { name: 'Medical', value: requests.filter(r => r.type === 'medical').length, color: '#ef4444' },
    { name: 'Water', value: requests.filter(r => r.type === 'water').length, color: '#06b6d4' },
    { name: 'Shelter', value: requests.filter(r => r.type === 'shelter').length, color: '#8b5cf6' },
  ];

  const priorityData = [
    { name: 'Critical', value: requests.filter(r => r.priority === 'critical').length, color: '#dc2626' },
    { name: 'High', value: requests.filter(r => r.priority === 'high').length, color: '#ea580c' },
    { name: 'Medium', value: requests.filter(r => r.priority === 'medium').length, color: '#ca8a04' },
    { name: 'Low', value: requests.filter(r => r.priority === 'low').length, color: '#16a34a' },
  ];

  // -----------------------------
  // Real-time updates (kept but updated to include AI forecasts)
  // -----------------------------
  useEffect(() => {
    const interval = setInterval(async () => {
      setRefreshTime(new Date());
      
      // Update weather data
      const newWeatherData = {};
      for (const location of weatherLocations) {
        newWeatherData[location.name] = await fetchWeatherData(location);
      }
      setWeatherData(newWeatherData);
      
      // Check for weather alerts
      const alerts = checkWeatherAlerts(newWeatherData);
      if (alerts.length > 0) {
        setWeatherAlerts(prev => [...alerts, ...prev.slice(0, 10)]);
        alerts.forEach(alert => sendWeatherAlert(alert));
      }
      
      // Update metrics
      setPerformanceMetrics(prev => ({
        ...prev,
        activeVolunteers: volunteersState.filter(v => v.status === 'available').length
      }));
      
      // Add real-time data point (requests/resolved)
      setRealTimeData(prev => [...prev.slice(-9), {
        time: new Date().toLocaleTimeString(),
        requests: requests.length,
        resolved: requests.filter(r => r.status === 'completed').length
      }]);

      // update forecasts occasionally
      if (Math.random() < 0.35) {
        forecastResources();
        forecastIncomingRequests();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [requests.length, volunteersState, weatherData]);

  // Initialize weather data and compute initial risk scores
  useEffect(() => {
    const init = async () => {
      const initialWeatherData = {};
      for (const location of weatherLocations) {
        initialWeatherData[location.name] = await fetchWeatherData(location);
      }
      setWeatherData(initialWeatherData);

      // compute risk score for existing requests
      setRequests(prev => prev.map(r => {
        return { ...r, riskScore: calculateRiskScore(r) };
      }));

      forecastResources();
      forecastIncomingRequests();
    };
    init();
  }, []);

  // -----------------------------
  // UI Render (keeps your original structure; added AI buttons & risk displays)
  // -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
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
                  CrisisConnect
                </h1>
                <p className="text-gray-600 mt-1">Smart Relief Coordination with Real-time Weather Monitoring & AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm">
                  <Cloud className="text-blue-600" size={16} />
                  <span className="font-medium">Weather Monitor Active</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

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
                            notification.type === 'weather-alert' ? 'bg-orange-500' :
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'urgent' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500">{notification.timestamp}</p>
                              {notification.type === 'weather-alert' && notification.affectedPeople && (
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                                  {notification.affectedPeople} people affected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowRequestForm(true)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <Plus size={16} />
                Report Emergency
              </button>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  System Online
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={16} />
                  {refreshTime.toLocaleTimeString()}
                </div>
                <button 
                  onClick={() => setRefreshTime(new Date())}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {weatherAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2">
            <div className="flex items-center gap-2 animate-pulse">
              <AlertTriangle size={20} />
              <span className="font-bold">ACTIVE WEATHER ALERTS:</span>
              <span>{weatherAlerts[0].message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Weather strip */}
      {Object.keys(weatherData).length > 0 && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Cloud className="text-blue-500" size={20} />
              Live Weather Monitoring
            </h3>
            <div className="flex gap-6 overflow-x-auto">
              {Object.entries(weatherData).map(([location, data]) => (
                <div key={location} className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg min-w-0 whitespace-nowrap hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(data.weatherCode)}
                    <span className="font-medium text-gray-900">{location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Thermometer size={14} />
                      {data.temperature}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets size={14} />
                      {data.humidity}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind size={14} />
                      {data.windSpeed} km/h
                    </span>
                    {data.precipitation > 0 && (
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <CloudRain size={14} />
                        {data.precipitation}mm
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="text-red-500" />
                  Report Emergency - CrisisConnect
                </h2>
                <button 
                  onClick={() => setShowRequestForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <p className="text-gray-600 mt-2">Fill out this form to request emergency assistance. Our AI will analyze the report and assist with triage.</p>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Type *</label>
                  <select 
                    value={newRequest.type} 
                    onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    required
                  >
                    <option value="low">🟢 Low - Can wait</option>
                    <option value="medium">🟡 Medium - Important</option>
                    <option value="high">🟠 High - Urgent</option>
                    <option value="critical">🔴 Critical - Life threatening</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of People Affected *</label>
                  <input 
                    type="number" 
                    min="1"
                    max="1000"
                    value={newRequest.victims} 
                    onChange={(e) => setNewRequest({...newRequest, victims: parseInt(e.target.value) || 1})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location/Area *</label>
                  <input 
                    type="text" 
                    value={newRequest.area} 
                    onChange={(e) => setNewRequest({...newRequest, area: e.target.value})}
                    placeholder="e.g., Sector 15, Noida"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description *</label>
                <textarea 
                  value={newRequest.description} 
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  placeholder="Describe the situation, specific needs, and any relevant details..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                  <input 
                    type="tel" 
                    value={newRequest.contact} 
                    onChange={(e) => setNewRequest({...newRequest, contact: e.target.value})}
                    placeholder="+91-XXXXXXXXXX"
                    pattern="^\+91-[0-9]{10}$"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input 
                    type="text" 
                    value={newRequest.reportedBy} 
                    onChange={(e) => setNewRequest({...newRequest, reportedBy: e.target.value})}
                    placeholder="Full name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-blue-900">Response Information</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Estimated Response Time:</strong> {calculateEstimatedResponse(newRequest.priority)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      *Response times may vary based on weather conditions and volunteer availability
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <p>🔒 Your information is secure and will only be used for emergency response</p>
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
                    className="bg-red-600 text-white px-8 py-2 rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
                  >
                    <Send size={16} />
                    Submit Emergency Request
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <Firebasedash/>

      {/* Stats & Tabs */}
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
                <p className="text-sm font-medium text-purple-600">Resources Ready</p>
                <p className="text-3xl font-bold text-gray-900">{resources.reduce((sum, r) => sum + r.available, 0)}</p>
              </div>
              <Package className="h-12 w-12 text-purple-500" />
            </div>
            <p className="text-xs text-purple-500 mt-2">{resources.reduce((sum, r) => sum + r.deployed, 0)} deployed</p>
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
            <p className="text-xs text-orange-500 mt-2">Last 24 hours</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'overview' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'analytics' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('volunteers')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'volunteers' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Volunteers
            </button>
            <button 
              onClick={() => setActiveTab('weather')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'weather' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weather Monitor
            </button>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Navigation className="text-blue-500" />
                    Live Relief Map
                  </h2>
                  <div className="flex gap-2">
                    <select 
                      value={selectedFilter} 
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Requests</option>
                      <option value="food">Food</option>
                      <option value="medical">Medical</option>
                      <option value="water">Water</option>
                      <option value="shelter">Shelter</option>
                    </select>
                    <button 
                      onClick={() => {
                        setNotifications(prev => [{
                          id: Date.now(),
                          type: 'success',
                          message: 'Auto-routing optimization activated for all available volunteers',
                          timestamp: new Date().toLocaleTimeString(),
                          read: false
                        }, ...prev.slice(0, 4)]);
                        // Simulate re-routing: sort volunteers by rating/time etc (toy example)
                        setVolunteersState(prev => [...prev].sort((a,b) => b.rating - a.rating));
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center gap-2 transition-colors"
                    >
                      <Zap size={14} />
                      Auto-Route
                    </button>
                  </div>
                </div>
                
                <div className="h-96 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                  <MapContainer 
                    center={[28.6139, 77.2090]} 
                    zoom={11} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {filteredRequests.map(request => (
                      <Marker key={request.id} position={[request.lat, request.lng]}>
                        <Popup maxWidth={300}>
                          <div className="p-3">
                            <h3 className="font-bold capitalize text-lg flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getPriorityColor(request.priority) }}
                              ></div>
                              {request.type} Request
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{request.area}</p>
                            <p className="text-sm mb-2">{request.description}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                              <p><strong>Victims:</strong> {request.victims}</p>
                              <p><strong>Reporter:</strong> {request.reportedBy}</p>
                              <p><strong>Contact:</strong> {request.contact}</p>
                              <p><strong>ETA:</strong> {request.estimatedResponse}</p>
                            </div>

                            {/* Risk score */}
                            <div className="mb-2 text-sm">
                              <strong>Risk Score:</strong>
                              <span className="ml-2 px-2 py-1 rounded text-white text-xs font-medium" style={{
                                backgroundColor: request.riskScore >= 75 ? '#dc2626' : request.riskScore >= 50 ? '#ea580c' : '#16a34a'
                              }}>
                                {request.riskScore ?? calculateRiskScore(request)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center mt-3">
                              <span 
                                className="px-2 py-1 rounded text-white text-xs font-medium"
                                style={{ backgroundColor: getStatusColor(request.status) }}
                              >
                                {request.status}
                              </span>
                              <div className="flex gap-1">
                                {request.assignedVolunteer ? (
                                  <button
                                    onClick={() => markRequestComplete(request.id)}
                                    className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                  >
                                    <CheckCircle size={12} />
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <select
                                      onChange={(e) => {
                                        const id = parseInt(e.target.value);
                                        if (id) assignVolunteer(request.id, id);
                                      }}
                                      className="text-xs border rounded px-1 py-1"
                                      defaultValue=""
                                    >
                                      <option value="">Assign</option>
                                      {volunteersState.filter(v => v.status === 'available').map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                      ))}
                                    </select>

                                    {/* AI assign button */}
                                    <button
                                      onClick={() => aiAutoAssign(request.id)}
                                      title="Let AI pick best volunteer"
                                      className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700 transition-colors"
                                    >
                                      AI Assign
                                    </button>
                                  </div>
                                )}
                                <button 
                                  onClick={() => handlePhoneCall(request.contact)}
                                  className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                                >
                                  <Phone size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    
                    {volunteersState.map(volunteer => (
                      <Marker key={volunteer.id} position={[volunteer.lat, volunteer.lng]}>
                        <Popup>
                          <div className="p-3">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                              <User className="text-blue-500" size={16} />
                              {volunteer.name}
                            </h3>
                            <p className="text-sm mb-1"><strong>Skills:</strong> {volunteer.skills.join(', ')}</p>
                            <p className="text-sm mb-1"><strong>Contact:</strong> {volunteer.contact}</p>
                            <p className="text-sm mb-1"><strong>Rating:</strong> 
                              <span className="flex items-center gap-1 ml-1">
                                <Star className="text-yellow-500 fill-current" size={12} />
                                {volunteer.rating}
                              </span>
                            </p>
                            <p className="text-sm mb-2"><strong>Missions:</strong> {volunteer.completedMissions}</p>
                            <div className="flex justify-between items-center">
                              <span className={`px-2 py-1 rounded text-white text-xs ${volunteer.status === 'available' ? 'bg-green-500' : 'bg-orange-500'}`}>
                                {volunteer.status}
                              </span>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handlePhoneCall(volunteer.contact)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                  <Phone size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    // Quick manual assign to selected volunteer (test)
                                    if (selectedRequest) assignVolunteer(selectedRequest.id, volunteer.id);
                                    setNotifications(prev => [{ id: Date.now(), type: 'info', message: `Checked ${volunteer.name}`, timestamp: new Date().toLocaleTimeString(), read: false }, ...prev.slice(0,4)]);
                                  }}
                                  className="text-sm px-2 py-1 border rounded"
                                >
                                  Quick Check
                                </button>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
                
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Map Legend</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Critical Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>High Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Low Priority / Volunteers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={20} />
                  Priority Requests
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {requests
                    .slice()
                    .filter(r => r.priority === 'critical' || r.priority === 'high')
                    .slice(0, 5)
                    .map(request => (
                      <div key={request.id} className="border border-red-100 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full animate-pulse"
                              style={{ backgroundColor: getPriorityColor(request.priority) }}
                            ></div>
                            <span className="font-medium capitalize">{request.type}</span>
                            <span className="text-xs bg-white px-2 py-1 rounded">{request.priority}</span>
                          </div>
                          <span className="text-xs text-gray-500">{request.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{request.area}</p>
                        <p className="text-xs text-gray-600 mb-2">{request.description}</p>
                        <p className="text-sm font-medium text-red-700">{request.victims} people affected</p>
                        <div className="flex justify-between items-center mt-3">
                          <span 
                            className="text-xs px-2 py-1 rounded text-white"
                            style={{ backgroundColor: getStatusColor(request.status) }}
                          >
                            {request.status}
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handlePhoneCall(request.contact)}
                              className="text-blue-600 hover:text-blue-800 bg-white p-1 rounded shadow transition-colors"
                            >
                              <Phone size={14} />
                            </button>
                            <button 
                              onClick={() => handleMessage(request.id, request.contact)}
                              className="text-green-600 hover:text-green-800 bg-white p-1 rounded shadow transition-colors"
                            >
                              <MessageCircle size={14} />
                            </button>
                            <button 
                              onClick={() => handleNavigation(request.lat, request.lng, request.area)}
                              className="text-purple-600 hover:text-purple-800 bg-white p-1 rounded shadow transition-colors"
                            >
                              <Navigation size={14} />
                            </button>

                            <button
                              onClick={() => aiAutoAssign(request.id)}
                              className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700 transition-colors"
                            >
                              AI Assign
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Real-time Activity</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="requests" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="text-purple-500" size={20} />
                  Resource Status
                </h3>
                <div className="space-y-4">
                  {resources.map((resource, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{resource.type}</span>
                        <span className="text-xs text-gray-500">{resource.lastUpdated}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-green-600">Available: {resource.available}</span>
                        <span className="text-orange-600">Deployed: {resource.deployed}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${(resource.available / (resource.available + resource.deployed)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">{resource.location}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      const f = forecastResources();
                      setNotifications(prev => [{ id: Date.now(), type: 'info', message: `Resource forecast updated`, timestamp: new Date().toLocaleTimeString(), read: false }, ...prev.slice(0,4)]);
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded"
                  >
                    Run Resource Forecast
                  </button>

                  <button
                    onClick={() => {
                      const f = forecastIncomingRequests();
                      setNotifications(prev => [{ id: Date.now(), type: 'info', message: `Incoming request forecast updated`, timestamp: new Date().toLocaleTimeString(), read: false }, ...prev.slice(0,4)]);
                    }}
                    className="px-3 py-2 bg-indigo-600 text-white rounded"
                  >
                    Forecast Requests
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Request Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Forecast charts (simple) */}
            <div className="bg-white rounded-xl shadow-lg p-6 col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Forecasts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Incoming Requests (next 7 ticks)</h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={incomingRequestForecast}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#60a5fa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Resource Depletion Forecast</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {resourceForecast.length === 0 ? (
                      <p className="text-sm text-gray-500">No forecast available — run the forecast.</p>
                    ) : resourceForecast.map((f, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{f.type}</div>
                          <div className="text-xs text-gray-500">Daily use ~ {f.dailyConsumption}</div>
                        </div>
                        <div className="text-sm">
                          {f.daysToDepletion === 'N/A' ? 'N/A' : `${f.daysToDepletion} days`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VOLUNTEERS TAB */}
        {activeTab === 'volunteers' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Volunteer Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteersState.map(volunteer => (
                <div key={volunteer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold">{volunteer.name}</h4>
                      <p className="text-sm text-gray-600">{volunteer.contact}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><strong>Skills:</strong> {volunteer.skills.join(', ')}</p>
                    <p className="text-sm flex items-center gap-1">
                      <strong>Rating:</strong> 
                      <Star className="text-yellow-500 fill-current" size={14} />
                      {volunteer.rating}
                    </p>
                    <p className="text-sm"><strong>Missions:</strong> {volunteer.completedMissions}</p>
                    <p className="text-xs text-gray-500">Fatigue: {(volunteer.fatigueScore*100).toFixed(0)}%</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      volunteer.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {volunteer.status}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePhoneCall(volunteer.contact)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Phone size={16} />
                      </button>
                      <button 
                        onClick={() => handleMessage(`volunteer-${volunteer.id}`, volunteer.contact)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => {
                          // quick simulate reducing fatigue
                          setVolunteersState(prev => prev.map(v => v.id === volunteer.id ? { ...v, fatigueScore: Math.max(0, (v.fatigueScore || 0) - 0.05) } : v));
                          setNotifications(prev => [{ id: Date.now(), type: 'info', message: `Scheduled rest for ${volunteer.name}`, timestamp: new Date().toLocaleTimeString(), read: false }, ...prev.slice(0,4)]);
                        }}
                        className="px-2 py-1 border rounded text-xs"
                      >
                        Rest
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WEATHER TAB */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Cloud className="text-blue-500" size={20} />
                Real-time Weather Monitoring
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(weatherData).map(([location, data]) => (
                  <div key={location} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900">{location}</h4>
                      {getWeatherIcon(data.weatherCode)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Thermometer className="text-red-500" size={16} />
                        <div>
                          <p className="font-medium">{data.temperature}°C</p>
                          <p className="text-gray-600 text-xs">Temperature</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Droplets className="text-blue-500" size={16} />
                        <div>
                          <p className="font-medium">{data.humidity}%</p>
                          <p className="text-gray-600 text-xs">Humidity</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Wind className="text-gray-500" size={16} />
                        <div>
                          <p className="font-medium">{data.windSpeed} km/h</p>
                          <p className="text-gray-600 text-xs">Wind Speed</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CloudRain className="text-blue-600" size={16} />
                        <div>
                          <p className="font-medium">{data.precipitation}mm</p>
                          <p className="text-gray-600 text-xs">Precipitation</p>
                        </div>
                      </div>
                    </div>
                    
                    {(data.precipitation > 5 || data.windSpeed > 30 || data.temperature > 35) && (
                      <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-800">
                          <AlertTriangle size={14} />
                          <span className="text-xs font-medium">Weather Alert Conditions</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {weatherAlerts.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" size={20} />
                  Recent Weather Alerts
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {weatherAlerts.slice(0, 10).map(alert => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                      alert.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                      'bg-yellow-50 border-yellow-500'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{alert.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-800">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="text-gray-500" size={12} />
                        <span className="text-xs text-gray-600">{alert.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main requests table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Emergency Requests Management
              </h2>
              <div className="flex gap-2">
                <select 
                  value={selectedFilter} 
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="food">🍞 Food</option>
                  <option value="medical">🏥 Medical</option>
                  <option value="water">💧 Water</option>
                  <option value="shelter">🏠 Shelter</option>
                </select>
                <button 
                  onClick={exportData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 transition-colors"
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Emergency</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Priority</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">People</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Risk</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Assigned To</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium capitalize">{request.type}</div>
                        <div className="text-xs text-gray-500">{request.description.slice(0, 60)}{request.description.length > 60 ? '...' : ''}</div>
                      </td>
                      <td className="px-4 py-3">{request.area}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: getPriorityColor(request.priority) }}>{request.priority}</span>
                      </td>
                      <td className="px-4 py-3">{request.victims}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{request.riskScore ?? calculateRiskScore(request)}</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div style={{ width: `${Math.min(100, request.riskScore ?? calculateRiskScore(request))}%` }} className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-red-500" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: getStatusColor(request.status), color: '#fff' }}>{request.status}</span>
                      </td>
                      <td className="px-4 py-3">{request.assignedVolunteer ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handlePhoneCall(request.contact)} className="text-blue-600 hover:text-blue-800">
                            <Phone size={14} />
                          </button>
                          <button onClick={() => handleMessage(request.id, request.contact)} className="text-green-600 hover:text-green-800">
                            <MessageCircle size={14} />
                          </button>
                          <button onClick={() => aiAutoAssign(request.id)} className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700">
                            AI Assign
                          </button>
                          {request.assignedVolunteer && (
                            <button onClick={() => markRequestComplete(request.id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column: quick actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => { generateReport(); }} className="w-full px-4 py-2 bg-blue-600 text-white rounded">Download Report</button>
              <button onClick={() => exportData()} className="w-full px-4 py-2 bg-gray-600 text-white rounded">Export Data</button>
              <button onClick={() => { forecastResources(); setNotifications(prev => [{ id: Date.now(), type: 'info', message: 'Forecast complete', timestamp: new Date().toLocaleTimeString(), read: false }, ...prev.slice(0,4)]); }} className="w-full px-4 py-2 bg-indigo-600 text-white rounded">Run Forecast</button>
              <button onClick={() => {
                // Demo: mark oldest pending as completed
                const oldest = requests.find(r => r.status === 'pending');
                if (oldest) markRequestComplete(oldest.id);
              }} className="w-full px-4 py-2 bg-green-600 text-white rounded">Resolve Oldest Pending</button>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Resource Forecast Summary</h4>
                {resourceForecast.length ? resourceForecast.map((f, i) => (
                  <div key={i} className="text-sm flex justify-between">
                    <div>{f.type}</div>
                    <div>{f.daysToDepletion === 'N/A' ? 'N/A' : `${f.daysToDepletion}d`}</div>
                  </div>
                )) : <div className="text-xs text-gray-500">Run forecast to see results</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
