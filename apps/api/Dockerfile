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
RUN prisma generate

# Expose port
EXPOSE 8000

# Run the application
<<<<<<< HEAD
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
=======
CMD ["sh", "-c", "prisma generate && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
>>>>>>> a54e506c7ce1c364cc1ebbc34f34a8e997dfeb6b
