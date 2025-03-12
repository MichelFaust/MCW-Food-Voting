import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default App;
