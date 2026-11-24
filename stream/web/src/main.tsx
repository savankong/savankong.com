import { createRoot } from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, MusicProvider, useAuth } from "./app";
import { Detail, Home, Library, Search, SignIn } from "./pages/pages";
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Shell>
        }
      />
    </Routes>
  );
}

// Hash routing keeps every page working from any static host or folder.
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <MusicProvider>
      <HashRouter>
        <Pages />
      </HashRouter>
    </MusicProvider>
  </AuthProvider>,
);
