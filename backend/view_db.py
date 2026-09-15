"""
Cooling Hub - SQLite Database Inspector
Run this script from CMD to quickly view tables and rows in backend/cooling_hub.db
Usage:
    python view_db.py              # Shows summary of all tables & row counts
    python view_db.py users        # Shows data inside 'users' table
    python view_db.py complaints   # Shows data inside 'complaints' table
    python view_db.py products     # Shows data inside 'products' table
"""

import os
import sys
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cooling_hub.db")

def print_table(headers, rows):
    if not rows:
        print("  (Empty table / 0 rows)")
        return
    col_widths = [len(str(h)) for h in headers]
    for row in rows:
        for i, val in enumerate(row):
            col_widths[i] = max(col_widths[i], min(len(str(val)), 35))
    
    header_line = " | ".join(str(h).ljust(col_widths[i]) for i, h in enumerate(headers))
    separator = "-+-".join("-" * col_widths[i] for i in range(len(headers)))
    print(header_line)
    print(separator)
    for row in rows:
        print(" | ".join(str(val if val is not None else "NULL")[:35].ljust(col_widths[i]) for i, val in enumerate(row)))

def main():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    args = sys.argv[1:]
    if not args:
        print("=" * 60)
        print("         COOLING HUB DATABASE OVERVIEW")
        print(f" Database File: {DB_PATH}")
        print("=" * 60)
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';")
        tables = [t[0] for t in cursor.fetchall()]
        
        print(f"{'Table Name':<25} | {'Row Count':<10}")
        print("-" * 38)
        for t in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {t};")
            count = cursor.fetchone()[0]
            print(f"{t:<25} | {count:<10}")
        
        print("\nTip: To view table contents, run:")
        print("  python view_db.py <table_name>")
        print("Example: python view_db.py users")
        print("Example: python view_db.py complaints")
    else:
        table = args[0].strip()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?;", (table,))
        if not cursor.fetchone():
            print(f"Table '{table}' not found.")
            return
        
        cursor.execute(f"PRAGMA table_info({table});")
        columns = [c[1] for c in cursor.fetchall()]
        
        cursor.execute(f"SELECT * FROM {table} LIMIT 25;")
        rows = cursor.fetchall()
        
        cursor.execute(f"SELECT COUNT(*) FROM {table};")
        total = cursor.fetchone()[0]
        
        print("=" * 70)
        print(f" Table: {table} (Showing {len(rows)} of {total} total rows)")
        print("=" * 70)
        print_table(columns, rows)

    conn.close()

if __name__ == "__main__":
    main()
