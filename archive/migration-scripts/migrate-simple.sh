#!/bin/bash

# Simple migration script - exports from Supabase and imports to PostgreSQL

echo "Starting migration..."

# Export data using psql from Supabase
SUPABASE_URL="db.hfwqjwrsapadvufhgffu.supabase.co"
SUPABASE_PASSWORD="your_supabase_password"  # You'll need to get this from Supabase dashboard

# For now, let's use a Node.js script to export
node tools/simple-export.js

# Import to PostgreSQL
if [ -f "data_export.sql" ]; then
    echo "Importing data to PostgreSQL..."
    PGPASSWORD=jl_password_2025 psql -h localhost -U jl_user -d jl_project_tracker -f data_export.sql
    echo "Migration complete!"
else
    echo "Export file not found. Please check the export step."
fi
