Flood Alert Backend for SafeNet-9Ja 3MTT Hackathon Project
The Flood Alert Backend is a Node.js application designed to provide critical flood notifications to users. 
It leverages geolocation to identify users within the flood-prone area and alerts them via email and SMS using SendGrid and Twilio APIs. 
This backend forms the core of a larger flood alert system for real-time disaster management.

Features
User Management:

Create, retrieve, update, and delete user profiles.
Update user locations dynamically.
Geospatial Querying:

Identify users within a defined radius of a flood-affected area using MongoDB's geospatial queries.
Flood Alerts:

Notify users in affected areas via:
Email: Using SendGrid.
SMS: Using Twilio.
RESTful API:

Exposes endpoints for user management and flood alert functionalities.
Technologies Used
Node.js: Backend runtime environment.
Express.js: Framework for building RESTful APIs.
MongoDB Atlas: Cloud-based NoSQL database for geospatial queries and data storage.
SendGrid API: For sending email notifications.
Twilio API: For sending SMS notifications.
Dotenv: For environment variable management.
Setup and Installation
Prerequisites
Install Node.js (v20.17.0 or higher).
Install MongoDB (Atlas or local instance).


Clone the repository:

git clone https://github.com/MassterJoe/safeNet-9ja-3mtt-hackathon/tree/Tomola-floodalert/flood-alert-backend.git
cd flood-alert-backend
Environment Variables
Create a .env file in the project root with the following keys:

env
MONGO_URI=<Your MongoDB Connection String>
SENDGRID_API_KEY=<Your SendGrid API Key>
TWILIO_ACCOUNT_SID=<Your Twilio Account SID>
TWILIO_AUTH_TOKEN=<Your Twilio Auth Token>
TWILIO_PHONE_NUMBER=<Your Twilio Phone Number>
PORT=5000
Installation
Install dependencies:


npm install
Start the development server:


npm run dev
The server will run on http://localhost:5000.

API Endpoints
Base URL: http://localhost:5000
User Management
Method	Endpoint	Description
POST	/api/users	Create a new user.
GET	/api/users	Get all users.
GET	/api/users/:id	Get a specific user by ID.
PUT	/api/users/:id	Update user details.
DELETE	/api/users/:id	Delete a user.
Location Updates
Method	Endpoint	Description
PUT	/api/users/:id/location	Update user location (latitude, longitude).
Flood Alerts
Method	Endpoint	Description
POST	/api/alerts	Trigger flood alerts for users in proximity.


Project Structure

flood-alert-backend/
├── controllers/          # Handles business logic for routes
│   ├── userController.js
│   ├── alertController.js
├── models/               # MongoDB schemas
│   ├── User.js
├── routes/               # Defines API routes
│   ├── api.js
├── config/               # Configuration files
│   ├── db.js
├── .env                  # Environment variables (not included in repo)
├── app.js                # Main application file
├── package.json          # Node.js dependencies


How It Works
User Registration:

Users register with their email, phone number, and initial location.
Location Updates:

The user’s location is updated periodically (e.g., via a mobile app or frontend).
Flood Alerts:

Admins trigger flood alerts with the location of the flood.
Backend identifies users within a radius of the flood location using MongoDB geospatial queries.
Sends email and SMS notifications to affected users.
Sample Requests
Create a User
Request:

http
POST /api/users
Content-Type: application/json
{
    "email": "test@example.com",
    "phoneNumber": "+1234567890",
    "location": "City Center",
    "latitude": 40.7128,
    "longitude": -74.0060
}
Response:

json
{
    "message": "User created successfully",
    "user": {
        "_id": "64ab0c2fe634ef0012345678",
        "email": "test@example.com",
        "phoneNumber": "+1234567890",
        "location": "City Center",
        "latitude": 40.7128,
        "longitude": -74.0060"
    }
}
Contributing
Fork the repository.
Create a feature branch:

git checkout -b feature-name
Commit your changes:

git commit -m "Add a new feature"
Push to your branch:


git push origin feature-name
Open a pull request.
License
This project is licensed under the MIT License. See the LICENSE file for details.

Contact
For any questions or support, please contact:

Name: Your Name
Email: tommola.oke@gmail.com
GitHub: https://github.com/tomolaoke
