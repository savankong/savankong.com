import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError, normalizeServer, signIn } from "../api";
import { useAuth } from "../app";
import { Icon } from "../ui";

const LAST_SERVER = "stream.lastServer";

function lastServer(): string {
  let remembered = "";
  try {
    remembered = localStorage.getItem(LAST_SERVER) ?? "";
  } catch {
    /* nothing remembered in private mode */
  }
  if (remembered) return remembered;
  // Served over https from the same address as the Jellyfin server (see
  // deploy/Caddyfile), so that address is the right first guess.
  const local = ["localhost", "127.0.0.1"].includes(location.hostname);
  return location.protocol === "https:" && !local ? location.origin : "";
}

/** A centred card with one heading, the way streaming sign-in pages are laid
 *  out, plus a show-password toggle. The server address is remembered. */
export function SignIn() {
  const { setSession } = useAuth();
  const [server, setServer] = useState(lastServer);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await signIn(server, name, password);
      try {
        localStorage.setItem(LAST_SERVER, session.server);
      } catch {
        /* not remembered in private mode */
      }
      setSession(session);
    } catch (err) {
      const status = err instanceof ApiError ? err.status : -1;
      if (status === 401) setError("That name or password is not right.");
      else if (status === 0) {
        const target = normalizeServer(server);
        const blocked = location.protocol === "https:" && target.startsWith("http://");
        setError(
          blocked
            ? "This page is secure (https) and your server address is not, so the browser blocks the connection. Use an https address for the server, or open Stream from an http address on your home network."
            : `Could not reach ${target}. Check the address, that Jellyfin is running, and that this device is on the same network.`,
        );
      } else setError("The server could not sign you in. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="signin">
      <div className="wordmark wordmark-lg">
        <span className="dot" aria-hidden="true" />
        Stream
      </div>
      <form className="signin-card" onSubmit={submit}>
        <div>
          <h1>Sign In</h1>
          <p className="lede">Use your Jellyfin server and account.</p>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <label className="field">
          <span>Server Address</span>
          <input
            value={server}
            onChange={(e) => setServer(e.target.value)}
            placeholder="192.168.1.20:8096"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </label>
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoCapitalize="none" autoComplete="username" required />
        </label>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <div className="field-with-button">
            <input
              id="pw"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" className="icon-btn" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} onClick={() => setShow((v) => !v)}>
              <Icon name={show ? "eyeOff" : "eye"} size={20} />
            </button>
          </div>
        </div>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Signing In" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
