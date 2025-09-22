import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  where,
} from "firebase/firestore";

// ---------------- Firebase Config ----------------
const firebaseConfig = {
  apiKey: "AIzaSyC9x3Eq9lmBMfO4gvR1j3Vk57Eb6U8KIyw",
  authDomain: "crisisconnect-3dca9.firebaseapp.com",
  projectId: "crisisconnect-3dca9",
  storageBucket: "crisisconnect-3dca9.firebasestorage.app",
  messagingSenderId: "273163117411",
  appId: "1:273163117411:web:6b94bcda7144f897e56956",
  measurementId: "G-8VFBNKC9T5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Track processed assignments outside component to prevent duplicates
const processedRequests = new Set();
const processedAlerts = new Set();

// ---------------- Custom Map Icons with Priority Colors ----------------
const createCustomIcon = (type, priority, status) => {
  let backgroundColor, textColor, icon, size;

  // Determine colors based on type, priority, and status
  if (type === "sos") {
    // SOS Alerts - Always high priority with red variations
    backgroundColor = status === "completed" ? "#6B7280" : 
                     status === "assigned" ? "#DC2626" : "#B91C1C"; // Red variations
    icon = "🚨";
    size = [40, 40];
  } else if (type === "emergency") {
    // Emergency Requests - Color based on priority
    switch(priority) {
      case "critical":
        backgroundColor = status === "completed" ? "#6B7280" : 
                         status === "assigned" ? "#DC2626" : "#7F1D1D"; // Dark red
        icon = "🆘";
        size = [45, 45]; // Larger for critical
        break;
      case "high":
        backgroundColor = status === "completed" ? "#6B7280" : 
                         status === "assigned" ? "#EA580C" : "#C2410C"; // Orange-red
        icon = "⚠️";
        size = [40, 40];
        break;
      case "medium":
        backgroundColor = status === "completed" ? "#6B7280" : 
                         status === "assigned" ? "#D97706" : "#B45309"; // Orange
        icon = "🔶";
        size = [35, 35];
        break;
      case "low":
        backgroundColor = status === "completed" ? "#6B7280" : 
                         status === "assigned" ? "#EAB308" : "#CA8A04"; // Yellow
        icon = "🔸";
        size = [30, 30];
        break;
      default:
        backgroundColor = status === "completed" ? "#6B7280" : 
                         status === "assigned" ? "#3B82F6" : "#1E40AF"; // Blue
        icon = "ℹ️";
        size = [35, 35];
    }
  } else if (type === "volunteer") {
    // Volunteer markers
    backgroundColor = status === "available" ? "#059669" : "#DC2626"; // Green/Red
    icon = status === "available" ? "👷" : "🔴";
    size = [35, 35];
  }

  textColor = "#FFFFFF";

  return divIcon({
    html: `
      <div style="
        background-color: ${backgroundColor};
        width: ${size[0]}px;
        height: ${size[1]}px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size[0] * 0.4}px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        animation: ${priority === "critical" || type === "sos" ? "pulse 2s infinite" : "none"};
      ">
        ${icon}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: "custom-map-icon",
    iconSize: size,
    iconAnchor: [size[0]/2, size[1]/2],
  });
};

// ---------------- Helper Functions ----------------
const isOlderThan24Hours = (timestamp) => {
  if (!timestamp) return false;
  const now = new Date();
  const itemDate = new Date(timestamp);
  const diffHours = (now - itemDate) / (1000 * 60 * 60);
  return diffHours > 24;
};

const markAsCompleted = async (type, id, volunteerId) => {
  try {
    const collectionName = type === "sos" ? "sosAlerts" : "emergencyRequests";
    
    // Update the alert/request as completed
    const itemRef = doc(db, collectionName, id);
    await updateDoc(itemRef, {
      status: "completed",
      completedAt: new Date().toISOString(),
      resolved: true
    });

    // Free up the volunteer
    if (volunteerId) {
      const volunteerRef = doc(db, "volunteers", volunteerId);
      await updateDoc(volunteerRef, {
        status: "available",
        currentAssignment: null,
        completedTasks: 1 // Will be incremented in real implementation
      });
    }

    console.log(`✅ Marked ${type} ${id} as completed`);
  } catch (error) {
    console.error("Error marking as completed:", error);
  }
};

// ---------------- Create Sample Volunteers ----------------
const createSampleVolunteers = async () => {
  const sampleVolunteers = [
    {
      name: "Dr. Sarah Ahmed",
      skills: ["medical", "first-aid", "sos", "emergency"],
      status: "available",
      location: { lat: 12.8234, lng: 80.0424 },
      phone: "+91-9876543210",
      experience: "10 years",
      specialty: "Emergency Medicine"
    },
    {
      name: "Fire Chief Kumar",
      skills: ["fire-safety", "rescue", "fire", "sos", "emergency"],
      status: "available",
      location: { lat: 12.8150, lng: 80.0500 },
      phone: "+91-9876543211",
      experience: "15 years",
      specialty: "Fire & Rescue"
    },
    {
      name: "Police Officer Raj",
      skills: ["security", "traffic", "crowd-control", "police", "sos", "emergency"],
      status: "available",
      location: { lat: 12.8300, lng: 80.0350 },
      phone: "+91-9876543212",
      experience: "8 years",
      specialty: "Emergency Response"
    },
    {
      name: "Paramedic Lisa",
      skills: ["medical", "ambulance", "first-aid", "sos", "emergency"],
      status: "available",
      location: { lat: 12.8180, lng: 80.0380 },
      phone: "+91-9876543213",
      experience: "12 years",
      specialty: "Emergency Care"
    },
    {
      name: "Engineer Patel",
      skills: ["technical", "rescue", "structural", "emergency"],
      status: "available",
      location: { lat: 12.8280, lng: 80.0450 },
      phone: "+91-9876543214",
      experience: "7 years",
      specialty: "Structural Safety"
    },
    {
      name: "Volunteer Priya",
      skills: ["general", "logistics", "coordination", "sos", "emergency"],
      status: "available",
      location: { lat: 12.8200, lng: 80.0400 },
      phone: "+91-9876543215",
      experience: "3 years",
      specialty: "Community Support"
    }
  ];

  try {
    const volunteerSnap = await getDocs(collection(db, "volunteers"));
    if (!volunteerSnap.empty) {
      console.log("✅ Volunteers already exist:", volunteerSnap.size, "volunteers");
      return;
    }

    for (const volunteer of sampleVolunteers) {
      await addDoc(collection(db, "volunteers"), {
        ...volunteer,
        createdAt: new Date().toISOString(),
        rating: Math.floor(Math.random() * 2) + 4,
        completedTasks: Math.floor(Math.random() * 50) + 10
      });
    }
    console.log("✅ Sample volunteers created successfully!");
  } catch (error) {
    console.error("Error creating volunteers:", error);
  }
};

// ---------------- AI Assignment Functions ----------------
async function assignVolunteerToSOS(alert, db) {
  try {
    console.log(`🚨 AI assigning volunteer for SOS: ${alert.id}`);
    
    const volunteerSnap = await getDocs(collection(db, "volunteers"));
    if (volunteerSnap.empty) return null;

    const volunteers = volunteerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const available = volunteers.filter(v => v.status === "available");
    
    if (available.length === 0) {
      const alertRef = doc(db, "sosAlerts", alert.id);
      await updateDoc(alertRef, { status: "waiting_volunteers" });
      return null;
    }

    const alertLat = alert.location.lat || 12.8234;
    const alertLng = alert.location.lng || 80.0424;

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      if (!lat1 || !lon1 || !lat2 || !lon2 || lat1 === 0 || lon1 === 0 || lat2 === 0 || lon2 === 0) {
        return 1;
      }
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI/180;
      const dLon = (lon2 - lon1) * Math.PI/180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    let bestVolunteer = available[0];
    let bestDistance = calculateDistance(alertLat, alertLng, bestVolunteer.location.lat, bestVolunteer.location.lng);

    for (let volunteer of available) {
      const distance = calculateDistance(alertLat, alertLng, volunteer.location.lat, volunteer.location.lng);
      const hasEmergencySkills = volunteer.skills?.some(skill => 
        ["sos", "emergency", "medical", "police"].includes(skill.toLowerCase())
      );

      if (hasEmergencySkills && distance < bestDistance + 1) {
        bestVolunteer = volunteer;
        bestDistance = distance;
      } else if (distance < bestDistance) {
        bestVolunteer = volunteer;
        bestDistance = distance;
      }
    }

    // Update volunteer FIRST
    const volunteerRef = doc(db, "volunteers", bestVolunteer.id);
    await updateDoc(volunteerRef, {
      status: "busy",
      currentAssignment: alert.id,
      assignedAt: new Date().toISOString(),
      taskType: "SOS Alert"
    });

    // Then update SOS alert
    const alertRef = doc(db, "sosAlerts", alert.id);
    await updateDoc(alertRef, {
      status: "assigned",
      assignedVolunteer: bestVolunteer.name,
      volunteerId: bestVolunteer.id,
      assignedAt: new Date().toISOString(),
      estimatedDistance: Math.round(bestDistance * 100) / 100,
      volunteerPhone: bestVolunteer.phone,
      volunteerSkills: bestVolunteer.skills || [],
      estimatedArrival: Math.round(bestDistance * 3)
    });

    console.log(`✅ Assigned ${bestVolunteer.name} to SOS ${alert.id}`);
    return bestVolunteer;

  } catch (error) {
    console.error("❌ Error assigning volunteer to SOS:", error);
    return null;
  }
}

async function assignVolunteerToRequest(request, db) {
  try {
    console.log(`🤖 AI assigning volunteer for REQUEST: ${request.id} (${request.type})`);
    
    const volunteerSnap = await getDocs(collection(db, "volunteers"));
    if (volunteerSnap.empty) return null;

    const volunteers = volunteerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const available = volunteers.filter(v => v.status === "available");
    
    if (available.length === 0) {
      const requestRef = doc(db, "emergencyRequests", request.id);
      await updateDoc(requestRef, { status: "waiting_volunteers" });
      return null;
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      if (!lat1 || !lon1 || !lat2 || !lon2 || lat1 === 0 || lon1 === 0 || lat2 === 0 || lon2 === 0) {
        return 1;
      }
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI/180;
      const dLon = (lon2 - lon1) * Math.PI/180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    let bestVolunteer = available[0];
    let bestDistance = calculateDistance(
      request.location.lat || 12.8234, 
      request.location.lng || 80.0424,
      bestVolunteer.location.lat, 
      bestVolunteer.location.lng
    );

    for (let volunteer of available) {
      const distance = calculateDistance(
        request.location.lat || 12.8234, 
        request.location.lng || 80.0424,
        volunteer.location.lat, 
        volunteer.location.lng
      );

      const hasSkillMatch = volunteer.skills?.some(skill => 
        skill.toLowerCase().includes(request.type.toLowerCase()) ||
        request.type.toLowerCase().includes(skill.toLowerCase())
      );

      if (hasSkillMatch && distance < bestDistance + 2) {
        bestVolunteer = volunteer;
        bestDistance = distance;
      } else if (!hasSkillMatch && distance < bestDistance) {
        bestVolunteer = volunteer;
        bestDistance = distance;
      }
    }

    // Update volunteer FIRST
    const volunteerRef = doc(db, "volunteers", bestVolunteer.id);
    await updateDoc(volunteerRef, {
      status: "busy",
      currentAssignment: request.id,
      assignedAt: new Date().toISOString(),
      taskType: request.type
    });

    // Then update request
    const requestRef = doc(db, "emergencyRequests", request.id);
    await updateDoc(requestRef, {
      status: "assigned",
      assignedVolunteer: bestVolunteer.name,
      volunteerId: bestVolunteer.id,
      assignedAt: new Date().toISOString(),
      estimatedDistance: Math.round(bestDistance * 100) / 100,
      volunteerPhone: bestVolunteer.phone,
      volunteerSkills: bestVolunteer.skills || [],
      estimatedArrival: Math.round(bestDistance * 3)
    });

    console.log(`✅ Assigned ${bestVolunteer.name} to request ${request.id}`);
    return bestVolunteer;

  } catch (error) {
    console.error("❌ Error assigning volunteer to request:", error);
    return null;
  }
}

// ---------------- Dashboard Component ----------------
const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use refs to track current state for callbacks
  const volunteersRef = useRef([]);
  const isInitializedRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    volunteersRef.current = volunteers;
  }, [volunteers]);

  useEffect(() => {
    isInitializedRef.current = isInitialized;
  }, [isInitialized]);

  // Stable callback functions
  const handleRequestAssignment = useCallback((request) => {
    if ((request.status === "pending" || request.status === "waiting_volunteers") && 
        !request.assignedVolunteer && 
        !processedRequests.has(request.id) && 
        isInitializedRef.current) {
      
      processedRequests.add(request.id);
      console.log(`🚀 Triggering request assignment for ${request.id}`);
      
      setTimeout(() => {
        assignVolunteerToRequest(request, db);
      }, Math.random() * 1000 + 500);
    }
  }, []);

  const handleSOSAssignment = useCallback((alert) => {
    const needsAssignment = (
      (!alert.status || alert.status === "pending" || alert.status === "waiting_volunteers") && 
      !alert.resolved && 
      !alert.assignedVolunteer && 
      !processedAlerts.has(alert.id) && 
      isInitializedRef.current && 
      volunteersRef.current.length > 0
    );

    if (needsAssignment) {
      processedAlerts.add(alert.id);
      console.log(`🚀 Triggering SOS assignment for ${alert.id}`);
      
      setTimeout(() => {
        assignVolunteerToSOS(alert, db);
      }, Math.random() * 1000 + 1000);
    }
  }, []);

  // Reset volunteers function
  const resetAllVolunteers = useCallback(async () => {
    try {
      const volunteerSnap = await getDocs(collection(db, "volunteers"));
      for (const docSnap of volunteerSnap.docs) {
        await updateDoc(doc(db, "volunteers", docSnap.id), {
          status: "available",
          currentAssignment: null
        });
      }
      // Clear processed sets
      processedRequests.clear();
      processedAlerts.clear();
      console.log("✅ All volunteers reset to available + processed sets cleared");
    } catch (error) {
      console.error("Error resetting volunteers:", error);
    }
  }, []);

  // Initialize volunteers
  useEffect(() => {
    const initializeVolunteers = async () => {
      if (!isInitialized) {
        await createSampleVolunteers();
        setIsInitialized(true);
      }
    };
    
    initializeVolunteers();
  }, [isInitialized]);

  // Fetch Volunteers
  useEffect(() => {
    const volunteersQuery = query(
      collection(db, "volunteers"),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(volunteersQuery, (snapshot) => {
      const fetchedVolunteers = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unknown",
          skills: data.skills || [],
          status: data.status || "available",
          location: {
            lat: data.location?.lat || 0,
            lng: data.location?.lng || 0,
          },
          phone: data.phone || "N/A",
          experience: data.experience || "N/A",
          specialty: data.specialty || "General",
          rating: data.rating || 4,
          completedTasks: data.completedTasks || 0,
          currentAssignment: data.currentAssignment || null,
        };
      });

      setVolunteers(fetchedVolunteers);
    });

    return () => unsubscribe();
  }, []);

  // Fetch SOS Alerts - FILTER OUT OLD COMPLETED ONES
  useEffect(() => {
    const sosQuery = query(
      collection(db, "sosAlerts"),
      orderBy("firebaseTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(sosQuery, (snapshot) => {
      const fetchedAlerts = snapshot.docs.map((doc) => {
        const data = doc.data();
        const alert = {
          id: doc.id,
          reporter: data.reporterName || "Anonymous",
          contact: data.contactNumber || "N/A",
          resolved: data.resolved || false,
          status: data.status || null,
          priority: "critical", // SOS is always critical priority
          assignedVolunteer: data.assignedVolunteer || null,
          volunteerId: data.volunteerId || null,
          assignedAt: data.assignedAt || null,
          completedAt: data.completedAt || null,
          estimatedDistance: data.estimatedDistance || null,
          volunteerPhone: data.volunteerPhone || null,
          volunteerSkills: data.volunteerSkills || [],
          estimatedArrival: data.estimatedArrival || null,
          sessionId: data.sessionId || "",
          createdAt: data.createdAt || "",
          timestamp: data.timestamp || "",
          firebaseTimestamp: data.firebaseTimestamp
            ? data.firebaseTimestamp.toDate().toLocaleString()
            : "Now",
          location: {
            address: data.location?.address || "Unknown",
            lat: data.location?.latitude || 0,
            lng: data.location?.longitude || 0,
          },
        };

        // Handle assignment using callback
        handleSOSAssignment(alert);
        return alert;
      }).filter(alert => {
        // HIDE COMPLETED ALERTS OLDER THAN 24 HOURS
        if (alert.status === "completed" && alert.completedAt) {
          return !isOlderThan24Hours(alert.completedAt);
        }
        return true; // Show all non-completed alerts
      });

      setAlerts(fetchedAlerts);
    });

    return () => unsubscribe();
  }, [handleSOSAssignment]);

  // Fetch Emergency Requests - FILTER OUT OLD COMPLETED ONES
  useEffect(() => {
    const requestsQuery = query(
      collection(db, "emergencyRequests"),
      orderBy("firebaseTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const fetchedRequests = snapshot.docs.map((doc) => {
        const data = doc.data();
        const request = {
          id: doc.id,
          type: data.type || "unknown",
          priority: data.priority || "low",
          description: data.description || "",
          victims: data.victimsCount || 0,
          reporter: data.reporterName || "Anonymous",
          contact: data.contactNumber || "N/A",
          status: data.status || "pending",
          assignedVolunteer: data.assignedVolunteer || null,
          volunteerId: data.volunteerId || null,
          assignedAt: data.assignedAt || null,
          completedAt: data.completedAt || null,
          estimatedDistance: data.estimatedDistance || null,
          volunteerPhone: data.volunteerPhone || null,
          volunteerSkills: data.volunteerSkills || [],
          estimatedArrival: data.estimatedArrival || null,
          sessionId: data.sessionId || "",
          createdAt: data.createdAt || "",
          timestamp: data.timestamp || "",
          firebaseTimestamp: data.firebaseTimestamp
            ? data.firebaseTimestamp.toDate().toLocaleString()
            : "Now",
          location: {
            address: data.location?.address || "Unknown",
            lat: data.location?.latitude || 0,
            lng: data.location?.longitude || 0,
          },
          images: data.images || [],
        };

        // Handle assignment using callback
        handleRequestAssignment(request);
        return request;
      }).filter(request => {
        // HIDE COMPLETED REQUESTS OLDER THAN 24 HOURS
        if (request.status === "completed" && request.completedAt) {
          return !isOlderThan24Hours(request.completedAt);
        }
        return true; // Show all non-completed requests
      });

      setRequests(fetchedRequests);
    });

    return () => unsubscribe();
  }, [handleRequestAssignment]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🤖 CrisisConnect AI Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm bg-green-100 px-3 py-1 rounded-full">
            <span className="text-green-800">
              {volunteers.filter(v => v.status === "available").length} Available
            </span>
          </div>
          <div className="text-sm bg-red-100 px-3 py-1 rounded-full">
            <span className="text-red-800">
              {volunteers.filter(v => v.status === "busy").length} Busy
            </span>
          </div>
          <button
            onClick={resetAllVolunteers}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      {/* Priority Legend */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-3">🎨 Map Legend - Priority Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center text-white">🚨</div>
            <span>SOS Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center text-white">🆘</div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white">⚠️</div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">🔶</div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white">🔸</div>
            <span>Low</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">👷</div>
            <span>Available Volunteer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white">✅</div>
            <span>Completed Task</span>
          </div>
        </div>
      </div>

      {/* Map with Color-Coded Priority Markers */}
      <div className="h-96 rounded-lg overflow-hidden shadow border mb-8">
        <MapContainer
          center={[12.8234, 80.0424]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* SOS Alerts Markers - Red with Pulse Animation */}
          {alerts.map((alert) => (
            <Marker
              key={`sos-${alert.id}`}
              position={[alert.location.lat || 12.8234, alert.location.lng || 80.0424]}
              icon={createCustomIcon("sos", alert.priority, alert.status)}
            >
              <Popup>
                <b>🚨 SOS Alert - CRITICAL</b> <br />
                Reporter: {alert.reporter} <br />
                Contact: {alert.contact} <br />
                Status: {alert.status || "pending"} <br />
                {alert.status === "completed" && <><strong>✅ COMPLETED</strong><br /></>}
                {alert.assignedVolunteer && (
                  <>
                    🤖 Assigned: {alert.assignedVolunteer} <br />
                    Distance: {alert.estimatedDistance}km <br />
                    ETA: {alert.estimatedArrival} min <br />
                  </>
                )}
                Location: {alert.location.address} <br />
                <em>{alert.firebaseTimestamp}</em>
              </Popup>
            </Marker>
          ))}

          {/* Emergency Requests Markers - Color by Priority */}
          {requests.map((req) => (
            <Marker
              key={`req-${req.id}`}
              position={[req.location.lat || 12.8234, req.location.lng || 80.0424]}
              icon={createCustomIcon("emergency", req.priority, req.status)}
            >
              <Popup>
                <b>🆘 Emergency Request - {req.priority.toUpperCase()}</b> <br />
                Type: {req.type} ({req.priority}) <br />
                Status: {req.status} <br />
                Priority: <strong style={{color: 
                  req.priority === "critical" ? "#DC2626" :
                  req.priority === "high" ? "#EA580C" :
                  req.priority === "medium" ? "#D97706" : "#EAB308"
                }}>{req.priority.toUpperCase()}</strong> <br />
                {req.status === "completed" && <><strong>✅ COMPLETED</strong><br /></>}
                {req.assignedVolunteer && (
                  <>
                    🤖 Assigned: {req.assignedVolunteer} <br />
                    Distance: {req.estimatedDistance}km <br />
                    ETA: {req.estimatedArrival} min <br />
                  </>
                )}
                Location: {req.location.address} <br />
              </Popup>
            </Marker>
          ))}

          {/* Volunteer Markers - Green/Red Status */}
          {volunteers.map((volunteer) => (
            <Marker
              key={`vol-${volunteer.id}`}
              position={[volunteer.location.lat, volunteer.location.lng]}
              icon={createCustomIcon("volunteer", null, volunteer.status)}
            >
              <Popup>
                <b>👷 {volunteer.name}</b> <br />
                Status: {volunteer.status === "available" ? "🟢 Available" : "🔴 Busy"} <br />
                Skills: {volunteer.skills.join(", ")} <br />
                Phone: {volunteer.phone} <br />
                {volunteer.currentAssignment && (
                  <>Current Task: {volunteer.currentAssignment}</>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Volunteers Grid */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">👷 AI Volunteer Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volunteers.map((volunteer) => (
            <div
              key={volunteer.id}
              className={`p-4 border rounded-lg transition-all ${
                volunteer.status === "available"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p className="font-bold">
                {volunteer.status === "available" ? "🟢" : "🔴"} {volunteer.name}
              </p>
              <p className="text-sm text-gray-600">
                Skills: {volunteer.skills.join(", ")}
              </p>
              <p className="text-sm text-gray-600">📞 {volunteer.phone}</p>
              <p className="text-xs text-gray-500">
                Status: {volunteer.status}
              </p>
              {volunteer.currentAssignment && (
                <p className="text-xs text-red-600">
                  Working on: {volunteer.currentAssignment}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SOS Alerts */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">🚨 SOS Alerts (AI Assigned)</h2>
        {alerts.length === 0 ? (
          <p className="text-gray-500">No active SOS alerts right now.</p>
        ) : (
          <ul className="space-y-4">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className={`p-4 border rounded-lg ${
                  alert.status === "completed"
                    ? "bg-gray-50 border-gray-300"
                    : alert.status === "assigned"
                    ? "bg-green-50 border-green-200"
                    : alert.status === "waiting_volunteers"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-red-700">
                      🚨 SOS CRITICAL from {alert.reporter}
                      {alert.status === "completed" && " ✅ COMPLETED"}
                      {alert.status === "assigned" && " 🔄 IN PROGRESS"}
                      {(!alert.status || alert.status === "pending") && " ⏳ PENDING"}
                      {alert.status === "waiting_volunteers" && " ⏰ WAITING"}
                    </p>
                    <p className="text-sm text-gray-700">📍 {alert.location.address}</p>
                    <p className="text-sm text-gray-700">📞 {alert.contact}</p>
                    <p className="text-xs text-gray-500">{alert.firebaseTimestamp}</p>
                    {alert.completedAt && (
                      <p className="text-xs text-green-600">Completed: {new Date(alert.completedAt).toLocaleString()}</p>
                    )}
                  </div>
                  
                  {/* Mark as Completed Button */}
                  {alert.status === "assigned" && (
                    <button
                      onClick={() => markAsCompleted("sos", alert.id, alert.volunteerId)}
                      className="ml-4 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      ✅ Mark Completed
                    </button>
                  )}
                </div>

                {alert.status === "completed" ? (
                  <div className="bg-gray-100 p-3 rounded border border-gray-300">
                    <p className="font-semibold text-gray-700">
                      ✅ Task Completed by {alert.assignedVolunteer}
                    </p>
                    <p className="text-sm text-gray-600">
                      This alert will be hidden from dashboard after 24 hours
                    </p>
                  </div>
                ) : alert.assignedVolunteer ? (
                  <div className="bg-green-100 p-3 rounded border border-green-200">
                    <p className="font-semibold text-green-800">
                      🤖 SOS Assigned: {alert.assignedVolunteer}
                    </p>
                    <p className="text-sm text-green-700">
                      📞 {alert.volunteerPhone} | 📍 {alert.estimatedDistance}km | ⏱️ ~{alert.estimatedArrival} min
                    </p>
                    <p className="text-xs text-green-600">
                      Skills: {alert.volunteerSkills?.join(", ")}
                    </p>
                  </div>
                ) : alert.status === "waiting_volunteers" ? (
                  <div className="bg-orange-100 p-3 rounded border border-orange-200">
                    <p className="text-orange-800">⏰ All volunteers busy - will auto-assign when available</p>
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-3 rounded border border-yellow-200">
                    <p className="text-yellow-800">🤖 AI finding nearest volunteer for SOS...</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Emergency Requests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">🆘 Emergency Requests (AI Assigned)</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500">No active emergency requests right now.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li
                key={req.id}
                className={`p-4 border rounded-lg ${
                  req.status === "completed"
                    ? "bg-gray-50 border-gray-300"
                    : req.status === "assigned"
                    ? "bg-green-50 border-green-200"
                    : req.status === "waiting_volunteers"
                    ? "bg-orange-50 border-orange-200"
                    : req.priority === "critical"
                    ? "bg-red-50 border-red-200"
                    : req.priority === "high"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-bold">
                      <span className={`${
                        req.priority === "critical" ? "text-red-700" :
                        req.priority === "high" ? "text-orange-600" :
                        req.priority === "medium" ? "text-orange-500" : "text-yellow-600"
                      }`}>
                        {req.type.toUpperCase()} ({req.priority.toUpperCase()})
                      </span>
                      {req.status === "completed" && " ✅ COMPLETED"}
                      {req.status === "assigned" && " 🔄 IN PROGRESS"}
                      {req.status === "pending" && " ⏳ PENDING"}
                      {req.status === "waiting_volunteers" && " ⏰ WAITING"}
                    </p>
                    <p className="text-gray-700">{req.description}</p>
                    <p className="text-sm text-gray-600">
                      Reporter: {req.reporter} | 📞 {req.contact} | Victims: {req.victims}
                    </p>
                    <p className="text-sm text-gray-600">📍 {req.location.address}</p>
                    {req.completedAt && (
                      <p className="text-xs text-green-600">Completed: {new Date(req.completedAt).toLocaleString()}</p>
                    )}
                  </div>
                  
                  {/* Mark as Completed Button */}
                  {req.status === "assigned" && (
                    <button
                      onClick={() => markAsCompleted("request", req.id, req.volunteerId)}
                      className="ml-4 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      ✅ Mark Completed
                    </button>
                  )}
                </div>

                {req.status === "completed" ? (
                  <div className="bg-gray-100 p-3 rounded border border-gray-300">
                    <p className="font-semibold text-gray-700">
                      ✅ Task Completed by {req.assignedVolunteer}
                    </p>
                    <p className="text-sm text-gray-600">
                      This request will be hidden from dashboard after 24 hours
                    </p>
                  </div>
                ) : req.assignedVolunteer ? (
                  <div className="bg-green-100 p-3 rounded border border-green-200">
                    <p className="font-semibold text-green-800">
                      🤖 Request Assigned: {req.assignedVolunteer}
                    </p>
                    <p className="text-sm text-green-700">
                      📞 {req.volunteerPhone} | 📍 {req.estimatedDistance}km | ⏱️ ~{req.estimatedArrival} min
                    </p>
                    <p className="text-xs text-green-600">
                      Skills: {req.volunteerSkills?.join(", ")}
                    </p>
                  </div>
                ) : req.status === "waiting_volunteers" ? (
                  <div className="bg-orange-100 p-3 rounded border border-orange-200">
                    <p className="text-orange-800">⏰ All volunteers busy - will auto-assign when available</p>
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-3 rounded border border-yellow-200">
                    <p className="text-yellow-800">🤖 AI analyzing best volunteer match...</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
