# Memora - Database Setup Guide

## 🎯 Purpose
This guide will help you install PostgreSQL and set up the Memora database on your local machine.

---

## 📋 Prerequisites
- You have cloned the Memora repository
- You have Node.js installed (check with `node --version`)

---

## 🔧 Step 1: Install PostgreSQL

### **Windows Users:**

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the latest version (18 or higher)

2. **Run the Installer:**
   - Double-click the downloaded `.exe` file
   - Click "Next" through the setup wizard
   - **IMPORTANT:** When asked to set a password for the 'postgres' user, choose a password and **WRITE IT DOWN**
   - Keep the default port: `5432`
   - Install all components (PostgreSQL Server, pgAdmin, Command Line Tools)

3. **Verify Installation:**
   Open Command Prompt and run:
   ```bash
   psql --version
   ```
   You should see: `psql (PostgreSQL) 14.x` or higher

   **If you get "command not found":**
   - Add PostgreSQL to your PATH:
     - Search for "Environment Variables" in Windows
     - Edit "Path" under System Variables
     - Add: `C:\Program Files\PostgreSQL\14\bin` (adjust version number if needed)
     - Restart your terminal

---

### **Mac Users:**

**Option A - Postgres.app (Recommended for beginners):**

1. **Download:**
   - Go to: https://postgresapp.com/
   - Download the latest version

2. **Install:**
   - Drag Postgres.app to your Applications folder
   - Open Postgres.app
   - Click "Initialize" to create a PostgreSQL server
   - Done! PostgreSQL is now running

3. **Add to PATH:**
   ```bash
   # Add this line to your ~/.zshrc or ~/.bash_profile
   export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
   
   # Then reload your shell
   source ~/.zshrc
   ```

4. **Verify:**
   ```bash
   psql --version
   ```

**Option B - Homebrew:**

```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
psql --version
```

---

### **Linux Users (Ubuntu/Debian):**

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Enable it to start on boot
sudo systemctl enable postgresql

# Verify
psql --version
```

---

## 🗄️ Step 2: Create the Memora Database

### **Windows:**

1. **Open Command Prompt**

2. **Connect to PostgreSQL:**
   ```bash
   psql -U postgres
   ```
   Enter the password you set during installation.

3. **Create the database:**
   ```sql
   CREATE DATABASE memora_dev;
   ```

4. **Verify it was created:**
   ```sql
   \l
   ```
   You should see `memora_dev` in the list.

5. **Connect to the new database:**
   ```sql
   \c memora_dev
   ```

6. **Exit psql:**
   ```sql
   \q
   ```

---

### **Mac (Postgres.app):**

1. **Open Postgres.app**

2. **Double-click on "postgres" database**
   This opens a terminal connected to PostgreSQL.

3. **Create the database:**
   ```sql
   CREATE DATABASE memora_dev;
   ```

4. **Verify:**
   ```sql
   \l
   ```

5. **Connect to it:**
   ```sql
   \c memora_dev
   ```

6. **Exit:**
   ```sql
   \q
   ```

---

### **Mac (Homebrew) / Linux:**

1. **Connect to PostgreSQL:**
   ```bash
   # Mac (Homebrew)
   psql postgres
   
   # Linux
   sudo -u postgres psql
   ```

2. **Create the database:**
   ```sql
   CREATE DATABASE memora_dev;
   ```

3. **Verify:**
   ```sql
   \l
   ```

4. **Connect to it:**
   ```sql
   \c memora_dev
   ```

5. **Exit:**
   ```sql
   \q
   ```

---

## 📊 Step 3: Create Database Tables

### **Option A - Using psql command line:**

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Connect to the database:**
   ```bash
   # Windows
   psql -U postgres -d memora_dev
   
   # Mac (Postgres.app or Homebrew)
   psql -d memora_dev
   
   # Linux
   sudo -u postgres psql -d memora_dev
   ```

3. **Copy and paste this entire schema:**
   ```sql
   -- Create users table
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     name VARCHAR(255),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     last_login TIMESTAMP
   );

   -- Create flashcard_sets table
   CREATE TABLE flashcard_sets (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Create flashcards table
   CREATE TABLE flashcards (
     id SERIAL PRIMARY KEY,
     set_id INTEGER REFERENCES flashcard_sets(id) ON DELETE CASCADE,
     front_text TEXT NOT NULL,
     back_text TEXT NOT NULL,
     front_image BYTEA,
     back_image BYTEA,
     category VARCHAR(100),
     order_number INTEGER DEFAULT 0,
     position_x INTEGER DEFAULT 0,
     position_y INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Create indexes for better performance
   CREATE INDEX idx_flashcard_sets_user_id ON flashcard_sets(user_id);
   CREATE INDEX idx_flashcards_set_id ON flashcards(set_id);
   ```

4. **Verify tables were created:**
   ```sql
   \dt
   ```
   You should see: `users`, `flashcard_sets`, `flashcards`

5. **Exit:**
   ```sql
   \q
   ```

---

### **Option B - Using a SQL file (if we create one later):**

If there's a `schema.sql` file in the backend folder:

```bash
# Windows
psql -U postgres -d memora_dev -f schema.sql

# Mac
psql -d memora_dev -f schema.sql

# Linux
sudo -u postgres psql -d memora_dev -f schema.sql
```

---

## ⚙️ Step 4: Configure Your Environment

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Create a `.env` file:**
   ```bash
   # On Mac/Linux
   touch .env
   
   # On Windows
   type nul > .env
   ```

3. **Open `.env` in your code editor and add:**

   **For Windows (default PostgreSQL installation):**
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/memora_dev
   JWT_SECRET=memora-super-secret-key-change-in-production
   ```

   **For Mac (Postgres.app - no password needed):**
   ```env
   PORT=5000
   DATABASE_URL=postgresql://localhost:5432/memora_dev
   JWT_SECRET=memora-super-secret-key-change-in-production
   ```

   **For Mac (Homebrew - usually no password):**
   ```env
   PORT=5000
   DATABASE_URL=postgresql://YOUR_MAC_USERNAME@localhost:5432/memora_dev
   JWT_SECRET=memora-super-secret-key-change-in-production
   ```

   **For Linux:**
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/memora_dev
   JWT_SECRET=memora-super-secret-key-change-in-production
   ```

4. **Replace:**
   - `YOUR_PASSWORD` with your actual PostgreSQL password
   - `YOUR_MAC_USERNAME` with your Mac username (run `whoami` in terminal to find it)

---

## 📦 Step 5: Install Backend Dependencies

```bash
# Make sure you're in the backend folder
cd backend

# Install all required packages
npm install
```

---

## 🚀 Step 6: Test Your Setup

1. **Start the backend server:**
   ```bash
   node server.js
   ```

2. **You should see:**
   ```
   Server running on port 5000
   ```

3. **Test the API:**
   Open your browser and go to:
   ```
   http://localhost:5000/api/test
   ```
   
   You should see:
   ```json
   {"message":"Backend is running!"}
   ```

4. **If everything works - SUCCESS! 🎉**

---

## 🐛 Troubleshooting

### **Error: "psql: command not found"**
- PostgreSQL isn't installed or not in PATH
- See Step 1 installation instructions
- Make sure to restart your terminal after adding to PATH

### **Error: "password authentication failed"**
- Wrong password in `.env` file
- Update `DATABASE_URL` with correct password

### **Error: "database 'memora_dev' does not exist"**
- You skipped Step 2
- Go back and create the database

### **Error: "could not connect to server"**
- PostgreSQL service isn't running
- Windows: Check Services app, start "PostgreSQL" service
- Mac (Homebrew): `brew services start postgresql@14`
- Mac (Postgres.app): Open the app
- Linux: `sudo systemctl start postgresql`

### **Error: "relation 'users' does not exist"**
- You skipped Step 3
- Go back and create the tables

### **Error: "Cannot find module 'pg'"**
- You didn't install dependencies
- Run `npm install` in the backend folder

---

## 📝 Quick Reference

### **Useful PostgreSQL Commands:**

```sql
-- List all databases
\l

-- Connect to a database
\c database_name

-- List all tables in current database
\dt

-- Describe a table structure
\d table_name

-- Show all users/roles
\du

-- Exit psql
\q
```

### **Useful Terminal Commands:**

```bash
# Check PostgreSQL version
psql --version

# Connect to PostgreSQL (Windows)
psql -U postgres

# Connect to PostgreSQL (Mac/Linux)
psql postgres

# Connect to specific database
psql -d memora_dev

# Run SQL file
psql -d memora_dev -f schema.sql
```

---

## ✅ Checklist

Before you start coding, make sure:

- [ ] PostgreSQL is installed (`psql --version` works)
- [ ] `memora_dev` database exists (ran `CREATE DATABASE memora_dev;`)
- [ ] Tables are created (ran the schema, `\dt` shows 3 tables)
- [ ] `.env` file is configured with your DATABASE_URL
- [ ] `npm install` ran successfully in backend folder
- [ ] `node server.js` starts without errors
- [ ] http://localhost:5000/api/test shows the test message


---

## 🔐 IMPORTANT: Security Notes

**NEVER commit your `.env` file to Git!**
- It contains your database password
- The `.gitignore` file is set up to prevent this
- Each team member has their own `.env` with their own password

**The `.env` file should stay on your local machine only.**

---

## 🎉 You're All Set!

Once you complete all steps, you're ready to start developing!

Next steps:
1. Start the backend: `cd backend && node server.js`
2. Start the frontend: `cd .. && npm start`
3. Open http://localhost:3000 and start building!

Happy coding! 🚀