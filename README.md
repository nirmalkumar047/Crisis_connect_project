# Crisis-Connect: Disaster Relief Coordination Platform 🚨

*Connecting victims, volunteers, and coordinators in real-time during natural disasters*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![React Leaflet](https://img.shields.io/badge/React%20Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://react-leaflet.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

## 🎯 Problem Statement

During natural disasters such as floods, earthquakes, or cyclones, thousands of people are left stranded without timely access to food, clean water, or medical support. Relief efforts often face major challenges due to the lack of real-time visibility of where victims are located and what resources they need most urgently. This results in chaotic distribution, where some areas receive excess aid while others are neglected.

## 💡 Solution

Crisis-Connect is an intelligent disaster coordination system that ensures help reaches the right people at the right time through:

- **Real-time request tracking** with GPS-tagged distress calls
- **AI-powered volunteer assignment** for optimal response
- **Live coordination dashboard** for relief coordinators
- **Mobile apps** for both victims and volunteers
- **Resource mapping** and optimized distribution routes



## 🚀 Features

### 📱 Victim Mobile App
- One-tap emergency SOS with GPS location
- Request specific aid (food, water, medical, shelter)
- Photo documentation of situation
- Real-time status updates on help arrival
- Offline functionality for areas with poor connectivity

### 🚑 Volunteer Mobile App
- Receive AI-assigned rescue missions
- GPS navigation to victim locations
- Real-time communication with coordinators
- Mission status updates and completion tracking
- Resource inventory management

### 🗺️ Admin Dashboard
- Live map with clustered requests and hotspots
- Volunteer tracking and assignment management
- Resource depot visualization
- AI-powered prioritization system
- Analytics and reporting tools
- Route optimization for efficient distribution

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface framework
- **React Leaflet** - Interactive maps and clustering
- **Vite** - Build tool and development server
- **CSS3** - Styling and responsive design

### Backend & Database
- **Firebase Firestore** - Real-time database
- **Firebase Authentication** - User management
- **Firebase Cloud Messaging** - Push notifications
- **Firebase Hosting** - Web app deployment

### Mobile Development
- **React Native** / **PWA** - Cross-platform mobile apps

### AI & Optimization
- **Machine Learning** algorithms for request prioritization
- **Geospatial analysis** for optimal volunteer assignment
- **Route optimization** for efficient resource distribution

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase project setup
- Git

### Clone Repository
git clone https://github.com/yourusername/Crisis-connect_project.git
cd disaster


Access the dashboard at `http://localhost:5173`


## 🔐 Security Rules

Firebase security rules implement role-based access:
- Coordinators: Full read/write access
- Volunteers: Can update own location and assigned requests
- Victims: Can create requests and view own data

## 🤖 AI Features

- **Smart Prioritization**: Multi-criteria decision making based on severity, location, and resource availability
- **Optimal Assignment**: Machine learning algorithms match volunteers to requests
- **Predictive Analytics**: Forecast resource needs and deployment strategies
- **Route Optimization**: Dynamic routing considering traffic and road conditions

## 📊 Key Metrics

- **Response Time**: Average time from request to volunteer assignment
- **Coverage Area**: Geographic spread of active volunteers
- **Success Rate**: Percentage of successfully completed rescue missions
- **Resource Utilization**: Efficiency of aid distribution

## 🚀 Deployment

### Web Dashboard


### Mobile Apps
- Build APK for Android using React Native
- Deploy PWA for cross-platform compatibility

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 🔮 Future Enhancements

- [ ] Mesh networking for offline connectivity
- [ ] Drone integration for aerial reconnaissance
- [ ] Blockchain-based aid verification
- [ ] Multi-language support
- [ ] Integration with government disaster management systems
- [ ] Predictive disaster modeling

## 📱 Screenshots

### Admin Dashboard
![Dashboard](screenshots/dashboard.png)

### Mobile Apps
<div align="center">
  <img src="screenshots/victim-app.png" width="300" alt="Victim App"/>
  <img src="screenshots/volunteer-app.png" width="300" alt="Volunteer App"/>
</div>

## 🙏 Acknowledgments

- **Team Members**: [Jeevan , Akshat]
- **Hackathon Organizers**: [Hackathon name and organizers]
- **Open Source Libraries**: React Leaflet, Firebase, and all other dependencies
- **Inspiration**: Real disaster relief challenges faced by communities worldwide

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**Team: Ctrl + Alt + Defeat**

- Project Link: [https://github.com/nirmalkumar047/Crisis_connect_project](https://github.com/nirmalkumar047/Crisis_connect_project)
- Email: [nk4015@srmist.edu.in]
- LinkedIn: [https://www.linkedin.com/in/nirmalkumara02/]

---

*Built with ❤️ to help communities in times of crisis*


