FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgthread-2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

RUN echo "📁 Files in container:" && ls -lah && \
    echo "📂 Models:" && ls -lah models/ || echo "❌ models/ not found!"

EXPOSE 10000

# ✅ Fixed for Render - uses shell form to expand $PORT
CMD sh -c "gunicorn app:app --bind 0.0.0.0:${PORT} --workers 1 --timeout 120 --log-level info"
