"""
Cooling Hub - Database Viewer Utility
Run this script to inspect all tables and records in the SQLite database:
    python backend/view_db.py
"""
import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cooling_hub.db")

def view_database():
    if not os.path.exists(DB_PATH):
        print(f"Database file not found at: {DB_PATH}")
        return

    print("=" * 70)
    print(f"   COOLING HUB - LOCAL DATABASE VIEWER")
    print(f"   Location: {DB_PATH}")
    print("=" * 70)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Get all tables
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = [t[0] for t in cur.fetchall()]

    print(f"\nTotal Tables Found: {len(tables)}\n")

    for table in tables:
        cur.execute(f"PRAGMA table_info({table});")
        columns = [col[1] for col in cur.fetchall()]
        
        cur.execute(f"SELECT COUNT(*) FROM {table};")
        row_count = cur.fetchone()[0]

        print("-" * 70)
        print(f" Table: {table.upper()} ({row_count} rows)")
        print(f" Columns: {', '.join(columns)}")
        print("-" * 70)

        # Show first 5 rows
        cur.execute(f"SELECT * FROM {table} LIMIT 5;")
        rows = cur.fetchall()
        if rows:
            for row in rows:
                print("  ", row)
            if row_count > 5:
                print(f"   ... and {row_count - 5} more rows.")
        else:
            print("   (table is currently empty)")
        print()

    conn.close()
    print("=" * 70)
    print(" Database inspection complete!")
    print("=" * 70)

if __name__ == "__main__":
    view_database()
