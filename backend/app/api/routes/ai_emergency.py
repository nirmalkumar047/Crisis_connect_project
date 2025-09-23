# backend/app/api/routes/ai_emergency.py
from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import pandas as pd
from datetime import datetime
import openai
import json

router = APIRouter(prefix="/ai", tags=["AI Emergency Services"])

class EmergencyClassificationRequest(BaseModel):
    description: str
    images: Optional[List[str]] = []
    timestamp: str

class VolunteerMatchRequest(BaseModel):
    request: dict
    volunteers: List[dict]

@router.post("/classify-emergency")
async def classify_emergency(request: EmergencyClassificationRequest):
    """AI-powered emergency classification using NLP and pattern recognition"""
    
    try:
        # Use OpenAI GPT for emergency classification
        prompt = f"""
        Analyze this emergency report and provide structured classification:
        
        Description: "{request.description}"
        Timestamp: {request.timestamp}
        
        Provide a JSON response with:
        1. emergencyType: (food, medical, water, shelter, fire, flood, earthquake)
        2. suggestedPriority: (low, medium, high, critical)  
        3. urgencyScore: (0.0-1.0)
        4. estimatedPeople: (number of people likely affected)
        5. resourceNeeds: (list of required resources)
        6. confidence: (0.0-1.0)
        7. keyInsights: (list of important observations)
        
        Consider: Keywords, severity indicators, time sensitivity, scope of impact.
        """
        
        # In production, use actual OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        ai_result = json.loads(response.choices[0].message.content)
        
        # Add additional AI processing for images if provided
        if request.images:
            image_analysis = await analyze_emergency_images(request.images)
            ai_result.update(image_analysis)
        
        return ai_result
        
    except Exception as e:
        # Fallback rule-based classification
        return fallback_classification(request.description)

def fallback_classification(description: str):
    """Rule-based fallback when AI service is unavailable"""
    description_lower = description.lower()
    
    # Emergency type detection
    emergency_type = "unknown"
    if any(word in description_lower for word in ["food", "hunger", "starving", "eat"]):
        emergency_type = "food"
    elif any(word in description_lower for word in ["medical", "injured", "sick", "hospital", "doctor"]):
        emergency_type = "medical"
    elif any(word in description_lower for word in ["water", "thirsty", "drinking", "clean"]):
        emergency_type = "water"
    elif any(word in description_lower for word in ["shelter", "homeless", "roof", "house"]):
        emergency_type = "shelter"
    
    # Priority detection
    priority = "medium"
    if any(word in description_lower for word in ["urgent", "critical", "emergency", "dying", "life"]):
        priority = "critical"
    elif any(word in description_lower for word in ["serious", "important", "severe"]):
        priority = "high"
    elif any(word in description_lower for word in ["minor", "small", "later"]):
        priority = "low"
    
    # Estimate people affected
    estimated_people = 1
    for word in description.split():
        if word.isdigit():
            estimated_people = max(estimated_people, int(word))
    
    return {
        "emergencyType": emergency_type,
        "suggestedPriority": priority,
        "urgencyScore": 0.7 if priority == "critical" else 0.5 if priority == "high" else 0.3,
        "estimatedPeople": estimated_people,
        "resourceNeeds": [emergency_type] if emergency_type != "unknown" else [],
        "confidence": 0.6,
        "keyInsights": [f"Detected {emergency_type} emergency with {priority} priority"]
    }

@router.post("/match-volunteers")
async def match_volunteers_ai(request: VolunteerMatchRequest):
    """AI-powered volunteer matching using optimization algorithms"""
    
    emergency = request.request
    volunteers = request.volunteers
    
    matches = []
    
    for volunteer in volunteers:
        # Calculate AI matching score
        score_components = {
            "skill_match": calculate_skill_match(emergency["type"], volunteer["skills"]),
            "distance": calculate_distance_score(emergency["location"], volunteer["location"]),
            "availability": 1.0 if volunteer["status"] == "available" else 0.0,
            "experience": min(volunteer["completedMissions"] / 50, 1.0),
            "rating": volunteer["rating"] / 5.0
        }
        
        # Weighted AI score calculation
        ai_score = (
            score_components["skill_match"] * 0.35 +
            score_components["distance"] * 0.25 +
            score_components["availability"] * 0.20 +
            score_components["experience"] * 0.10 +
            score_components["rating"] * 0.10
        )
        
        # Generate AI reasoning
        reasoning = generate_match_reasoning(volunteer, emergency, score_components)
        
        matches.append({
            "volunteer": volunteer,
            "aiScore": ai_score,
            "confidence": calculate_confidence(score_components),
            "skillMatches": get_matching_skills(emergency["type"], volunteer["skills"]),
            "skillMatchPercentage": int(score_components["skill_match"] * 100),
            "distance": calculate_distance(emergency["location"], volunteer["location"]),
            "estimatedArrival": calculate_arrival_time(emergency["location"], volunteer["location"]),
            "aiReasoning": reasoning
        })
    
    # Sort by AI score
    matches.sort(key=lambda x: x["aiScore"], reverse=True)
    
    return {"recommendations": matches[:10]}

def calculate_skill_match(emergency_type: str, volunteer_skills: List[str]) -> float:
    """Calculate skill matching score"""
    skill_mapping = {
        "medical": ["medical", "rescue", "first_aid"],
        "food": ["food", "logistics", "distribution"],
        "water": ["water", "sanitation", "logistics"],
        "shelter": ["shelter", "construction", "logistics"]
    }
    
    required_skills = skill_mapping.get(emergency_type, [])
    if not required_skills:
        return 0.5
    
    matches = len(set(required_skills) & set(volunteer_skills))
    return min(matches / len(required_skills), 1.0)

@router.post("/disaster-predictions")
async def predict_disasters(data: dict):
    """AI disaster prediction using weather data and historical patterns"""
    
    weather_data = data.get("weatherData", {})
    historical_data = data.get("historicalIncidents", [])
    current_requests = data.get("currentEmergencies", [])
    timeframe = data.get("timeframe", "24h")
    
    # Mock AI prediction model
    predictions = {
        "predictedIncidents": [
            {"type": "medical", "predicted": 3, "confidence": 0.75},
            {"type": "flood", "predicted": 1, "confidence": 0.85},
            {"type": "food", "predicted": 2, "confidence": 0.65}
        ],
        "riskAreas": [
            {
                "location": "Central Delhi",
                "riskScore": 0.8,
                "primaryThreat": "Flash flooding due to heavy rainfall",
                "peakTime": "Next 6-12 hours",
                "riskFactors": ["Heavy rainfall", "Poor drainage", "High population density"]
            },
            {
                "location": "Gurgaon",
                "riskScore": 0.6,
                "primaryThreat": "Medical emergency surge",
                "peakTime": "Next 24 hours",
                "riskFactors": ["Extreme heat", "Air quality", "Vulnerable population"]
            }
        ],
        "resourceForeccast": {
            "medical_kits": {"predicted": 25, "current": 18, "trend": "up", "change": "+40%"},
            "food_packets": {"predicted": 150, "current": 120, "trend": "up", "change": "+25%"},
            "water_bottles": {"predicted": 300, "current": 280, "trend": "stable", "change": "+7%"}
        },
        "actionableInsights": [
            {
                "title": "Pre-position Medical Teams",
                "description": "Deploy additional medical teams to high-risk areas before peak demand",
                "priority": "high",
                "confidence": 0.87,
                "impact": "Reduce response time by 40%",
                "timeframe": "Next 6 hours"
            },
            {
                "title": "Flood Preparation",
                "description": "Activate flood response protocols in Central Delhi area",
                "priority": "high",
                "confidence": 0.82,
                "impact": "Prevent 200+ evacuations",
                "timeframe": "Immediate"
            }
        ],
        "modelConfidence": 0.78
    }
    
    return predictions

@router.post("/analyze-image")
async def analyze_emergency_image(file: UploadFile = File(...)):
    """AI image analysis for damage assessment and people counting"""
    
    try:
        # Read image file
        image_data = await file.read()
        
        # In production, use computer vision models like:
        # - YOLO for object detection (people, vehicles, damage)
        # - CNN for damage assessment
        # - OCR for reading signs/text
        
        # Mock analysis results
        analysis = {
            "detectedType": "flood",
            "damageLevel": 7.5,  # 0-10 scale
            "peopleDetected": 3,
            "vehiclesDetected": 1,
            "hazards": ["standing_water", "debris", "electrical_hazard"],
            "confidence": 0.89,
            "urgencyScore": 0.85,
            "keyFindings": [
                "Significant water damage visible",
                "3 people appear to need assistance", 
                "Electrical hazards present",
                "Road access partially blocked"
            ],
            "recommendedActions": [
                "Immediate evacuation recommended",
                "Turn off electricity in area",
                "Deploy water rescue team"
            ]
        }
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

@router.post("/emergency-chat")  
async def emergency_chat_ai(data: dict):
    """AI chatbot for emergency assistance"""
    
    user_message = data.get("message", "")
    context = data.get("context", {})
    
    # Detect urgency level
    urgency_level = detect_urgency(user_message)
    
    # Generate AI response using NLP
    if urgency_level > 0.8:
        response = {
            "message": "This sounds like a serious emergency! I'm going to help you report this immediately. Please provide your location and I'll connect you with emergency services.",
            "urgencyLevel": urgency_level,
            "actions": [
                {"type": "call_emergency", "text": "📞 Call Emergency Services Now"},
                {"type": "open_form", "text": "📋 Fill Emergency Form"}
            ],
            "emergencyData": extract_emergency_info(user_message)
        }
    else:
        response = {
            "message": generate_helpful_response(user_message, context),
            "urgencyLevel": urgency_level,
            "actions": get_suggested_actions(user_message)
        }
    
    return response

def detect_urgency(message: str) -> float:
    """Detect urgency level in user message"""
    urgent_keywords = ["emergency", "urgent", "help", "dying", "critical", "fire", "flood", "accident"]
    message_lower = message.lower()
    
    urgency_score = 0.0
    for keyword in urgent_keywords:
        if keyword in message_lower:
            urgency_score += 0.2
    
    return min(urgency_score, 1.0)

# Additional utility functions...
