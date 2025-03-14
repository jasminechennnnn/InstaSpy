# 🕵️‍♀️ InstaSpy 
A tool for analyzing Instagram users' followees using LLM technology.  
(Currently only supporting Gemini-1.5-Flash model integration.)

## ✨ Features
- 🔐 Website login/logout
- 📸 **IG Service**
  - 🔑 Instagram login/logout
  - 🔍 Fetch target user's followee
- 🧠 **LLM Service**
  - 📊 Analyze target user's followee, give you interesting insights
- 📜 **History**
  - 📚 View all search history
  - 📋 View a detailed search result
  - 🗑️ Delete a specific search

## 🖼️ Demo

<div align="center">
  <img src="./demo/login.png" alt="Login Screen" width="600"/>
  <p><em>Login interface</em></p>
  <img src="./demo/dashboard.png" alt="Dashboard" width="600"/>
  <p><em>Dashboard</em></p>
  <img src="./demo/analyzer1.png" alt="Analysis Screen 1" width="600"/>
  <p><em>1. Instagram login with authentication code <br> 2. Target user's followee data retrieval</em></p>
  <img src="./demo/analyzer2.png" alt="Analysis Screen 2" width="600"/>
  <p><em>Recent search display</em></p>
  <img src="./demo/history.png" alt="History Screen" width="600"/>
  <p><em>Detailed Search history and analysis report</em></p>
</div>

## 📁 Project Structure
```
/
├── backend/            # Node.js backend
├── frontend/           # React frontend
├── demo/               # Demo screenshots and images
├── .gitignore
└── README.md
```

## 🛠️ Environment Requirements
- Node.js: v22.14.0 or higher
- npm: 10.9.2 or higher
- React: v9.0.0 (frontend)
- Express.js: v4.21.2 (backend)
- Python: 3.11 or higher
  - dependencies: instagrapi, pillow
- MongoDB: v4.4

## 👩‍💻 Contributors
- [@jasminechennnnn](https://github.com/jasminechennnnn)
