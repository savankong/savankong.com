import { createRoot } from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AmbientLayer, AmbientProvider, AuthProvider, MusicProvider, useAuth } from "./app";
import { Library } from "./pages/library";
import { Detail, Home } from "./pages/pages";
import { Downloads } from "./pages/playlist";
import { Search } from "./pages/search";
import { SignIn } from "./pages/signin";
import { Watch } from "./pages/watch";
import { Shell } from "./ui";
import "./styles.css";

function Pages() {
  const { jf } = useAuth();
  if (!jf) return <SignIn />;
  return (
    <Routes>
      <Route path="/watch/:id" element={<Watch />} />
      <Route
        path="*"
        element={
          <Shell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library/:kind" element={<Library />} />
              <Route path="/item/:id" element={<Detail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Shell>
        }
      />
    </Routes>
  );
}

// The service worker keeps the app itself available with no connection, so
// downloaded albums can be played. It only exists on secure pages.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => undefined);
  });
}

// Hash routing keeps every page working from any static host or folder.
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <MusicProvider>
      <AmbientProvider>
        <AmbientLayer />
        <HashRouter>
          <Pages />
        </HashRouter>
      </AmbientProvider>
    </MusicProvider>
  </AuthProvider>,
);
