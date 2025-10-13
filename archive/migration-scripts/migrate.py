#!/usr/bin/env python3
"""
Simple migration script from Supabase to PostgreSQL
"""
import json
import psycopg2

# PostgreSQL connection
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="jl_project_tracker",
    user="jl_user",
    password="jl_password_2025"
)
cur = conn.cursor()

print("✓ Connected to PostgreSQL")

# Read exported data
with open('supabase_data.json', 'r') as f:
    data = json.load(f)

print(f"\nData loaded:")
print(f"  - Team Members: {len(data['teamMembers'])}")
print(f"  - Projects: {len(data['projects'])}")
print(f"  - Roles: {len(data['roles'])}")
print(f"  - Allocations: {len(data['allocations'])}")
print(f"  - Admin Users: {len(data['adminUsers'])}")

# Clear existing data
print("\nClearing existing data...")
cur.execute("DELETE FROM allocations")
cur.execute("DELETE FROM team_members")
cur.execute("DELETE FROM projects")
cur.execute("DELETE FROM roles")
cur.execute("DELETE FROM admin_users")
conn.commit()
print("✓ Data cleared")

# Insert team members
print("\nInserting team members...")
for member in data['teamMembers']:
    cur.execute("""
        INSERT INTO team_members (id, name, email, role, department, status, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        member['id'],
        member['name'],
        member['email'],
        member['role'],
        member['department'],
        member.get('status', 'active'),
        member['created_at']
    ))
print(f"✓ Inserted {len(data['teamMembers'])} team members")

# Insert projects
print("Inserting projects...")
for project in data['projects']:
    cur.execute("""
        INSERT INTO projects (id, name, client, start_date, end_date, status, priority, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        project['id'],
        project['name'],
        project['client'],
        project['start_date'],
        project['end_date'],
        project['status'],
        project.get('priority', 'medium'),
        project['created_at']
    ))
print(f"✓ Inserted {len(data['projects'])} projects")

# Insert roles
print("Inserting roles...")
for role in data['roles']:
    cur.execute("""
        INSERT INTO roles (id, name, department, created_at)
        VALUES (%s, %s, %s, %s)
    """, (
        role['id'],
        role['name'],
        role['department'],
        role['created_at']
    ))
print(f"✓ Inserted {len(data['roles'])} roles")

# Insert allocations
print("Inserting allocations...")
for allocation in data['allocations']:
    cur.execute("""
        INSERT INTO allocations (id, team_member_id, project_id, month, year, percentage, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        allocation['id'],
        allocation['user_id'],  # Supabase uses 'user_id' instead of 'team_member_id'
        allocation['project_id'],
        allocation['month'],
        allocation['year'],
        allocation['percentage'],
        allocation['created_at']
    ))
print(f"✓ Inserted {len(data['allocations'])} allocations")

# Insert admin users
print("Inserting admin users...")
for user in data['adminUsers']:
    cur.execute("""
        INSERT INTO admin_users (id, username, password_hash, role, created_at)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        user['id'],
        user['username'],
        user['password_hash'],
        user['role'],
        user['created_at']
    ))
print(f"✓ Inserted {len(data['adminUsers'])} admin users")

# Commit all changes
conn.commit()
print("\n✓ All data migrated successfully!")

# Verify counts
print("\nVerifying data:")
cur.execute("SELECT COUNT(*) FROM team_members")
print(f"  - Team Members: {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM projects")
print(f"  - Projects: {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM roles")
print(f"  - Roles: {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM allocations")
print(f"  - Allocations: {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM admin_users")
print(f"  - Admin Users: {cur.fetchone()[0]}")

cur.close()
conn.close()
print("\n✓ Migration complete!")
