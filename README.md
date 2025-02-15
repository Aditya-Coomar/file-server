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
