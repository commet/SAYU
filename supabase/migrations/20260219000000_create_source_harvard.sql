-- Harvard Art Museums source table for raw exhibition data
CREATE TABLE IF NOT EXISTS source_harvard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  harvard_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  begin_date TEXT,
  end_date TEXT,
  start_date DATE,
  end_date_parsed DATE,
  primary_image_url TEXT,
  exhibition_url TEXT,
  venues JSONB DEFAULT '[]',
  people JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  raw_data JSONB,
  collected_at TIMESTAMPTZ DEFAULT now()
);
