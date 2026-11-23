#!/usr/bin/env bash
# Installs or updates ring-recorder + the Cam web app on Ubuntu (24.04) with nginx.
# Safe to run again: keeps .env, the Ring login and recordings.
#
#   curl -fsSL https://raw.githubusercontent.com/savankong/savankong.com/claude/trusting-cerf-mkkb87/ring-recorder/deploy/install.sh \
#     | CAM_PASSWORD='your password' bash        (as root, e.g. in the DigitalOcean Droplet Console)
#
# Then sign in to Ring once:   cam-login
set -euo pipefail

REPO="${REPO:-https://github.com/savankong/savankong.com.git}"
BRANCH="${BRANCH:-claude/trusting-cerf-mkkb87}"
DOMAIN="${DOMAIN:-cam.savankong.com}"
APP=/opt/ring-recorder
SRC=/opt/ring-recorder-src
SVC_USER=ringrec

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Run as root (or with sudo)."; exit 1; }

say "Installing packages (ffmpeg, git, rsync, certbot)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ffmpeg git rsync curl ca-certificates certbot python3-certbot-nginx >/dev/null

if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  say "Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
echo "node $(node -v), $(ffmpeg -version | head -1 | cut -d' ' -f1-3)"

say "Fetching code ($BRANCH)"
if [ -d "$SRC/.git" ]; then
  git -C "$SRC" fetch -q --depth 1 origin "$BRANCH"
  git -C "$SRC" reset -q --hard FETCH_HEAD
else
  git clone -q --depth 1 --branch "$BRANCH" "$REPO" "$SRC"
fi

id "$SVC_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin "$SVC_USER"
mkdir -p "$APP"
rsync -a --delete \
  --exclude .env --exclude data/ --exclude recordings/ --exclude node_modules/ \
  "$SRC/ring-recorder/" "$APP/"

say "Installing dependencies"
chown -R "$SVC_USER:" "$APP"
sudo -u "$SVC_USER" -H bash -c "cd $APP && npm ci --omit=dev --no-audit --no-fund --loglevel=error"

say "Configuring"
ENV="$APP/.env"
if [ ! -f "$ENV" ]; then
  cp "$APP/.env.example" "$ENV"
  # Folder/file names use this timezone; change TIMEZONE in .env if you're elsewhere.
  sed -i "s|^TIMEZONE=.*|TIMEZONE=${TIMEZONE:-America/New_York}|" "$ENV"
fi
if [ -n "${CAM_PASSWORD:-}" ]; then
  # Escape for sed; the password stays only in .env on this server.
  esc=$(printf '%s' "$CAM_PASSWORD" | sed 's/[&|\\]/\\&/g')
  sed -i "s|^CAM_PASSWORD=.*|CAM_PASSWORD=$esc|" "$ENV"
fi
grep -q '^CAM_PASSWORD=.\+' "$ENV" || echo "!! CAM_PASSWORD is empty in $ENV, so the web app is off."
chown "$SVC_USER:" "$ENV"
chmod 600 "$ENV"

say "Installing service"
cat >/etc/systemd/system/ring-recorder.service <<EOF
[Unit]
Description=Ring doorbell recorder + Cam web app
After=network-online.target
Wants=network-online.target
ConditionPathExists=$APP/data/token.json

[Service]
Type=simple
User=$SVC_USER
WorkingDirectory=$APP
ExecStart=/usr/bin/node --env-file=$APP/.env src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

cat >/usr/local/bin/cam-login <<EOF
#!/usr/bin/env bash
# Sign in to Ring (email, password, 2FA code) and start the recorder.
set -e
cd $APP
sudo -u $SVC_USER -H env DATA_DIR=$APP/data node src/auth.js
systemctl restart ring-recorder
sleep 3
systemctl --no-pager --lines=15 status ring-recorder || true
EOF
chmod 755 /usr/local/bin/cam-login

systemctl daemon-reload
systemctl enable ring-recorder >/dev/null 2>&1
if [ -f "$APP/data/token.json" ]; then systemctl restart ring-recorder; fi

say "Configuring nginx for $DOMAIN"
cp "$APP/nginx-cam.savankong.com.conf" "/etc/nginx/sites-available/$DOMAIN"
sed -i "s/server_name .*/server_name $DOMAIN;/" "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
nginx -t -q && systemctl reload nginx

MY_IP=$(curl -fsS -4 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
DNS_IP=$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}' || true)
if [ "$DNS_IP" = "$MY_IP" ]; then
  if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    say "Getting HTTPS certificate"
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect
  else
    certbot install --nginx --cert-name "$DOMAIN" --non-interactive --redirect >/dev/null 2>&1 || true
    systemctl reload nginx
  fi
  HTTPS=yes
else
  HTTPS=no
fi

say "Done"
if [ ! -f "$APP/data/token.json" ]; then
  echo "Next: sign in to Ring (needs your 2FA code):   cam-login"
fi
if [ "$HTTPS" = no ]; then
  echo "DNS: $DOMAIN does not point here yet (it resolves to '${DNS_IP:-nothing}', this server is $MY_IP)."
  echo "     Add an A record 'cam' -> $MY_IP, wait a few minutes, then run this installer again for HTTPS."
else
  echo "Open https://$DOMAIN"
fi
echo "Logs: journalctl -u ring-recorder -f"
