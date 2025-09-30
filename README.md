This is a web application for students and admins to take and manage MCQ exams. Follow the steps below to set up and run the project locally.

Step 1: Clone the Repository
------------------------------

Open your terminal and run: git clone <your-repo-url>

Navigate into the project folder: cd mcq_portal

Step 2: Install Dependencies
-----------------------------

Install all the required Node.js packages:npm install

Step 3: Create Environment File
--------------------------------

Create a .env.local file in the root of the project and add your database credentials 

DB_HOST=localhost
DB_USER=root
DB_PASS=YourDatabasePassword
DB_NAME=mcq_portal

Step 4: Run the Application
---------------------------
npm run dev

The app should now be running at http://localhost:3000

Step 5: Initialize the Database
--------------------------------

Make sure your MySQL server is running. Execute the SQL scripts (login.sql and exam.sql) in your MySQL client to create the required tables.

Optional: Add an admin user manually:

 this file "hashPassword.js" you give your password and run the below command in terminal ,you will get the hashpassword.

Command to run terminal : node hashPassword.js

after that you can insert new admin user in user table in db.

command to run in db: INSERT INTO users (username, email, password_hash, role, first_name, last_name)
VALUES ('adminuser', 'adminuser@gmail.com', '<hashed_password>', 'admin', 'Admin', 'User');





Notes
======

1. Ensure MySQL is running locally before starting the app.

2. JWT tokens are valid for 1 hour; after that, users will need to log in again.



