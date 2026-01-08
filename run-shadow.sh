#!/bin/bash

# Hunter's SHADOW Launcher

# 1. Check for .env
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create one with GOOGLE_API_KEY=..."
    exit 1
fi

# 2. Build Image
echo "🔨 Building Hunter's SHADOW Docker Image..."
sudo docker build -t hunter-shadow .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# 3. Create local reports dir if missing
mkdir -p reports

# 4. Run Container
# -v maps the local 'reports' folder to '/app/reports' in the container
echo "🚀 Launching Mission..."
sudo docker run -it \
    --env-file .env \
    -v "$(pwd)/reports:/app/reports" \
    hunter-shadow shadow "$@"
