import sqlite3
from pathlib import Path

from sqlalchemy import text
from app import create_app
from app.extensions import db


SOURCE_DB = Path("backups/eventhub_sqlite_prima_di_aiven.db")

TABLES_IN_ORDER = [
    "user",
    "artist",
    "event",
    "event_artists",
    "booking",
    "review",
]


def sqlite_table_exists(connection, table_name):
    row = connection.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,)
    ).fetchone()

    return row is not None


def read_rows(connection, table_name):
    if not sqlite_table_exists(connection, table_name):
        print(f"- Tabella `{table_name}` non presente nel backup: ignorata.")
        return []

    return connection.execute(f'SELECT * FROM "{table_name}"').fetchall()


def destination_count(connection, table_name):
    return connection.execute(
        text(f"SELECT COUNT(*) FROM `{table_name}`")
    ).scalar()


def insert_rows(connection, table_name, rows):
    if not rows:
        print(f"- `{table_name}`: 0 righe da importare")
        return

    columns = rows[0].keys()
    quoted_columns = ", ".join(f"`{column}`" for column in columns)
    placeholders = ", ".join(f":{column}" for column in columns)

    statement = text(
        f"INSERT INTO `{table_name}` ({quoted_columns}) "
        f"VALUES ({placeholders})"
    )

    values = [
        {column: row[column] for column in columns}
        for row in rows
    ]

    connection.execute(statement, values)
    print(f"- `{table_name}`: {len(values)} righe importate")


def main():
    if not SOURCE_DB.exists():
        raise SystemExit(
            f"Backup SQLite non trovato: {SOURCE_DB.resolve()}"
        )

    source_connection = sqlite3.connect(SOURCE_DB)
    source_connection.row_factory = sqlite3.Row

    app = create_app()

    with app.app_context():
        if db.engine.dialect.name != "mysql":
            raise SystemExit(
                "Il database di destinazione non è MySQL Aiven. Importazione annullata."
            )

        with db.engine.begin() as destination_connection:
            non_empty_tables = []

            for table_name in TABLES_IN_ORDER:
                count = destination_count(destination_connection, table_name)

                if count > 0:
                    non_empty_tables.append(f"{table_name} ({count})")

            if non_empty_tables:
                raise SystemExit(
                    "Aiven contiene già dati nelle tabelle: "
                    + ", ".join(non_empty_tables)
                    + ". Importazione annullata per evitare duplicati."
                )

            print("\nIMPORTAZIONE SQLITE → AIVEN MYSQL")
            print("---------------------------------")

            for table_name in TABLES_IN_ORDER:
                rows = read_rows(source_connection, table_name)
                insert_rows(destination_connection, table_name, rows)

    source_connection.close()

    print("\nIMPORTAZIONE COMPLETATA CORRETTAMENTE.")


if __name__ == "__main__":
    main()
