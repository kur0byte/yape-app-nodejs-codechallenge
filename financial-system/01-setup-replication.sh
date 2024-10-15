#!/bin/bash
set -e

# Wait for the primary to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres-primary -U $POSTGRES_USER -d $POSTGRES_DB -c '\q'; do
  >&2 echo "Primary is unavailable - sleeping"
  sleep 1
done

>&2 echo "Primary is up - setting up replication"

# Stop PostgreSQL service
pg_ctl -D "$PGDATA" -m fast -w stop

# Clear the data directory
rm -rf "$PGDATA"/*

# Create base backup
PGPASSWORD=$POSTGRES_PASSWORD pg_basebackup -h postgres-primary -D "$PGDATA" -U replicator -P -v -X stream

# Create postgresql.auto.conf for PostgreSQL 12+
cat >> "$PGDATA/postgresql.auto.conf" <<EOL
primary_conninfo = 'host=postgres-primary port=5432 user=replicator password=replicatorpass application_name=pg_replica'
EOL

# Create standby.signal file
touch "$PGDATA/standby.signal"

# Start PostgreSQL service
pg_ctl -D "$PGDATA" -w start