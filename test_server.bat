@echo off
setlocal

REM ---------- ACTIVATE VENV ----------
echo Activating virtual environment
call .venv\Scripts\activate

REM ---------- RESET DB ----------
echo.
echo *** RESETTING DATABASE ***
if exist db.sqlite3 (
    del db.sqlite3
    echo Deleted old db.sqlite3
)

REM ---------- MIGRATIONS ----------
echo.
echo *** RUNNING MIGRATIONS ***
python manage.py migrate

REM ---------- REGISTER TEST DATA ----------
echo.
echo *** REGISTERING TEST OBJECTS ***
python manage.py register_test_objects

REM ---------- START PLC SIMULATOR ----------
echo.
echo *** STARTING PLC SIMULATOR ***
start cmd /k "call .venv\Scripts\activate && python sim/start_plc.py"

REM ---------- START PLC POLLING ----------
echo.
echo *** STARTING PLC POLLING ***
start cmd /k "call .venv\Scripts\activate && python manage.py poll_plcs"

REM ---------- START DJANGO SERVER ----------
echo.
echo *** STARTING DJANGO SERVER ***
python manage.py runserver 0.0.0.0:8000

pause