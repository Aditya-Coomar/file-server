# File Server - Developer Documentation

## Project Structure

- **backend/**: FastAPI application, runs using Uvicorn.
- **frontend/**: Next.js application, runs using npm.

## Prerequisites

### Install Python

#### Windows

1. Download the latest Python installer from the [official website](https://www.python.org/downloads/).
2. Run the installer and **check the box** for _"Add Python to PATH"_.
3. Click **Install Now** and follow the setup instructions.

Verify installation:

```sh
python --version
```

#### Linux (Debian/Ubuntu)

```sh
sudo apt update && sudo apt install -y python3
```

Verify installation:

```sh
python3 --version
```

#### macOS

Using Homebrew:

```sh
brew install python
```

Verify installation:

```sh
python3 --version
```

### Install Node.js & npm

Install Node.js and npm from the [official website](https://nodejs.org/), or use:

```sh
# macOS/Linux
brew install node
# Windows (via Chocolatey)
choco install nodejs
```

Verify installation:

```sh
node -v
npm -v
```

### Install MongoDB & MongoDB Compass

#### MongoDB Installation

##### Windows
1. Download MongoDB Community Server from [MongoDB Official Website](https://www.mongodb.com/try/download/community).
2. Run the installer (`.msi` file) and follow the setup instructions.
3. Choose **Complete** setup.
4. Ensure the option **'Install MongoDB as a service'** is checked.
5. Complete the installation and verify using:
   
   ```sh
   mongod --version
   ```

##### macOS (Using Homebrew)
1. Open Terminal and run:
   
   ```sh
   brew tap mongodb/brew
   brew install mongodb-community@6.0
   ```
3. Start MongoDB service:

   ```sh
   brew services start mongodb-community@6.0
   ```
5. Verify installation:

   ```sh
   mongod --version
   ```

##### Linux (Ubuntu/Debian)
1. Import the MongoDB public key:

   ```sh
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   ```
3. Add the MongoDB repository:

   ```sh
   echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   ```
5. Update the package database:

   ```sh
   sudo apt update
   ```
7. Install MongoDB:

   ```sh
   sudo apt install -y mongodb-org
   ```
9. Start MongoDB:

   ```sh
   sudo systemctl start mongod
   ```
11. Enable MongoDB to start on boot:
   
   ```sh
   sudo systemctl enable mongod
   ```
11. Verify installation:
   
   ```sh
   mongod --version
   ```

#### MongoDB Compass Installation
1. Download MongoDB Compass from [MongoDB Compass Official Website](https://www.mongodb.com/try/download/compass).
2. Run the installer and follow the setup process.
3. Open MongoDB Compass and connect using:

   ```
   mongodb://localhost:27017
   ```

## Installation

Clone the repository:

```sh
git clone https://github.com/Aditya-Coomar/file-server.git
cd your-repo
```

### Backend Setup (FastAPI)

Navigate to the backend folder:

```sh
cd backend
```

Create and configure a `.env` file:

```sh
FILE_SERVER_ROOT_STORE='Local_Folder_Path'
JWT_SECRET='your_jwt_secret'
MAIL_USER='your_email@example.com'
MAIL_SECRET='your_mail_secret'
MAIL_PORT=your_mail_port
MAIL_HOST='your_mail_host'
```

Configure the Database Connection accordingly in `main.py` file:

```sh
100  class DatabaseConnection:
101     def __init__(self):
102         self.client = MongoClient("mongodb://localhost:27017/")
103         self.db = self.client["file_server"]
104         self.users_collection = self.db["users"]
105         
106         self.users_collection.create_index("email", unique=True)
107         self.users_collection.create_index("username", unique=True)
```




Install dependencies and start the backend:

```sh
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup (Next.js)

Navigate to the frontend folder:

```sh
cd ../frontend
```

Create and configure a `.env.local` file:

```sh
SERVER_URL="http://localhost:8000"
```

Install dependencies and start the frontend:

```sh
npm install
npm run dev
```

## Usage

Run the backend and frontend, then open the frontend in a browser:

```sh
http://localhost:3000
```

## License

This project is licensed under the [MIT License](LICENSE).
