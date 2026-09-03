#!/bin/sh
# Diagnostic wrapper for Fly release_command (prisma migrate deploy).
set -u

# #region agent log
who=$(id -u -n 2>/dev/null || echo unknown)
prisma_bin=MISSING
if [ -x node_modules/.bin/prisma ]; then prisma_bin=present; fi
prisma_pkg=MISSING
if [ -d node_modules/prisma ]; then prisma_pkg=present; fi
db_url_set=no
if [ -n "${DATABASE_URL:-}" ]; then db_url_set=yes; fi
migrations=$(ls -1 prisma/migrations 2>/dev/null | tr '\n' ',' )
npx_path=$(command -v npx 2>/dev/null || echo MISSING)
echo "[debug-a52a33] hypA/C whoami=$who prisma_bin=$prisma_bin prisma_pkg=$prisma_pkg npx=$npx_path db_url_set=$db_url_set pwd=$(pwd)"
echo "[debug-a52a33] hypB migrations=$migrations"
# #endregion

echo "[debug-a52a33] running npx prisma migrate deploy"
npx prisma migrate deploy
status=$?

# #region agent log
echo "[debug-a52a33] hypA/B/C migrate_exit=$status"
# #endregion

exit $status
