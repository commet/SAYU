-- Exhibition Pipeline: Add missing columns for automated data collection
-- These columns enable multi-source data collection and tracking

-- Source tracking
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Status management (auto-updated by pipeline)
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'upcoming';

-- Tags for categorization
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Metadata for source-specific extra data (GPS, phone, etc.)
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Indexes for pipeline queries
CREATE INDEX IF NOT EXISTS idx_exhibitions_source ON exhibitions(source);
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_external_id ON exhibitions(external_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_tags ON exhibitions USING gin(tags);

-- Comment
COMMENT ON COLUMN exhibitions.source IS 'Data source: korea_culture, seoul_opendata, aic, artmap, manual';
COMMENT ON COLUMN exhibitions.status IS 'upcoming, ongoing, ended - auto-updated by pipeline';
COMMENT ON COLUMN exhibitions.metadata IS 'Source-specific data: GPS coords, phone, area, etc.';
