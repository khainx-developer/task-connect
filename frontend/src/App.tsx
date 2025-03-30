import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import TaskManager from "./components/TaskManager"; // Placeholder for Task Manager UI

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/tasks" element={<TaskManager />} />
            </Routes>
        </Router>
    );
};

export default App;
