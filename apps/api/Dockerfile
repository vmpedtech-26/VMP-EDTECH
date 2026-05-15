FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage cache
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install prisma
RUN pip install prisma

# Copy the rest of the application
COPY . .

# Generate prisma client
RUN python -m prisma generate

# Expose port
EXPOSE 8000

# Run the application
CMD ["sh", "start.sh"]
