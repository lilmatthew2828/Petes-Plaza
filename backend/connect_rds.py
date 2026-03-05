import psycopg2

# Our RDS connection details (Will be obscured in production)
host = "petes-plaza-db.c2lca2oiye1q.us-east-1.rds.amazonaws.com"
port = "5432"
dbname = "petes_plaza_db"
user = "postgres"
password = "HamptonSeniors2026!"
sslmode = 'verify-full'
sslrootcert = '~/certs/us-east1-bundle.pem'

try:
    conn = psycopg2.connect(
        host=host,
        port=port,
        dbname=dbname,
        user=user,
        password=password,
        sslmode='require'
    )
    print("Connected to PostgreSQL RDS successfully!")
    
    # Create a cursor to execute queries
    cursor = conn.cursor()
    
    # Example query
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print("PostgreSQL version:", version)
    
    cursor.close()
    conn.close()

except Exception as e:
    print("Error connecting to PostgreSQL RDS:", e)
