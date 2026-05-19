import { Outlet } from "react-router-dom";

function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Outlet />
    </div>
  );
}

export default App;